import { pool } from '../../config/database.js';
import { recordActivity } from '../activity/index.js';
import { formatActivityMessage } from '../../utils/helpers.js';

const fetchTeamMembers = async (client, ownerId) => {
  const { rows } = await client.query(
    `SELECT t.id AS team_id, tm.id AS member_id, tm.name, tm.capacity,
            COALESCE(loads.task_total, 0) AS current_tasks
     FROM teams t
     JOIN team_members tm ON tm.team_id = t.id
     LEFT JOIN (
        SELECT member_id, COUNT(*) AS task_total
        FROM tasks
        WHERE member_id IS NOT NULL
        GROUP BY member_id
     ) loads ON loads.member_id = tm.id
     WHERE t.owner_id = $1
     ORDER BY t.created_at ASC`,
    [ownerId],
  );
  return rows.reduce((acc, row) => {
    acc[row.team_id] = acc[row.team_id] || [];
    acc[row.team_id].push({
      id: row.member_id,
      name: row.name,
      capacity: Number(row.capacity),
      current: Number(row.current_tasks),
    });
    return acc;
  }, {});
};

const fetchMovableTasks = async (client, memberId) => {
  const { rows } = await client.query(
    `SELECT id, title, priority
     FROM tasks
     WHERE member_id = $1
       AND priority IN ('Low', 'Medium')
     ORDER BY priority DESC, updated_at DESC`,
    [memberId],
  );
  return rows;
};

export const reassignTasksService = async ({ ownerId }) => {
  const client = await pool.connect();
  const reassignments = [];
  let hadOverload = false;
  let hadCapacity = false;

  try {
    await client.query('BEGIN');

    const teamMembersMap = await fetchTeamMembers(client, ownerId);

    for (const [teamId, members] of Object.entries(teamMembersMap)) {
      const overloadedMembers = members.filter((m) => m.current > m.capacity);
      if (!overloadedMembers.length) continue;
      hadOverload = true;

      const availableMembers = members
        .filter((m) => m.current < m.capacity)
        .map((member) => ({
          ...member,
          slots: member.capacity - member.current,
        }))
        .filter((m) => m.slots > 0)
        .sort((a, b) => a.slots - b.slots);

      if (!availableMembers.length) continue;
      hadCapacity = true;

      for (const overload of overloadedMembers) {
        let excess = overload.current - overload.capacity;
        if (excess <= 0) continue;

        const candidateTasks = await fetchMovableTasks(client, overload.id);
        for (const task of candidateTasks) {
          if (excess <= 0) break;

          const target = availableMembers.find((member) => member.slots > 0);
          if (!target) break;

          await client.query(
            `UPDATE tasks
             SET member_id = $1, updated_at = NOW()
             WHERE id = $2`,
            [target.id, task.id],
          );

          target.slots -= 1;
          target.current += 1;
          overload.current -= 1;
          excess -= 1;

          reassignments.push({
            teamId,
            taskId: task.id,
            taskTitle: task.title,
            fromMember: overload.name,
            toMember: target.name,
            priority: task.priority,
          });

          if (!availableMembers.some((member) => member.slots > 0)) break;
        }
      }
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }

  await Promise.all(
    reassignments.map((item) =>
      recordActivity({
        ownerId,
        message: formatActivityMessage({
          taskTitle: item.taskTitle,
          fromMember: item.fromMember,
          toMember: item.toMember,
        }),
        metadata: item,
      }),
    ),
  );

  return {
    movedTasks: reassignments.length,
    reassignments,
    hadOverload,
    hadCapacity,
  };
};

