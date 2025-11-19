import { query } from '../../config/database.js';
import { createHttpError } from '../../utils/helpers.js';

const projectContextQuery = `
  SELECT p.id, p.team_id, t.owner_id
  FROM projects p
  JOIN teams t ON t.id = p.team_id
  WHERE p.id = $1 AND t.owner_id = $2
`;

const memberLoadQuery = `
  SELECT tm.id, tm.team_id, tm.name, tm.capacity,
         COALESCE(task_counts.task_total, 0) AS current_tasks
  FROM team_members tm
  LEFT JOIN (
    SELECT member_id, COUNT(*) AS task_total
    FROM tasks
    WHERE member_id IS NOT NULL
    GROUP BY member_id
  ) task_counts ON task_counts.member_id = tm.id
  WHERE tm.id = $1
`;

const ensureProjectOwnership = async ({ projectId, ownerId }) => {
  const result = await query(projectContextQuery, [projectId, ownerId]);
  if (!result.rowCount) {
    throw createHttpError(404, 'Project not found');
  }
  return result.rows[0];
};

const ensureMemberInTeam = async ({ memberId, teamId }) => {
  if (!memberId) return null;
  const result = await query(
    `${memberLoadQuery.replace('WHERE tm.id = $1', 'WHERE tm.id = $1 AND tm.team_id = $2')}`,
    [memberId, teamId],
  );
  if (!result.rowCount) {
    throw createHttpError(404, 'Member not found in team');
  }
  return result.rows[0];
};

const calculateAssignmentWarning = (member) => {
  if (!member) return null;
  const isOver = Number(member.current_tasks) >= Number(member.capacity);
  return isOver
    ? {
        memberId: member.id,
        current: Number(member.current_tasks),
        capacity: Number(member.capacity),
        message: `${member.name} has ${member.current_tasks} tasks but capacity is ${member.capacity}.`,
      }
    : null;
};

export const listTasks = async ({ ownerId, filters }) => {
  const conditions = ['t.owner_id = $1'];
  const params = [ownerId];
  if (filters.projectId) {
    params.push(filters.projectId);
    conditions.push(`task.project_id = $${params.length}`);
  }
  if (filters.memberId) {
    params.push(filters.memberId);
    conditions.push(`task.member_id = $${params.length}`);
  }
  if (filters.status) {
    params.push(filters.status);
    conditions.push(`task.status = $${params.length}`);
  }

  const result = await query(
    `SELECT task.*, tm.name AS member_name, tm.capacity, tm.role,
            COALESCE(loads.task_total, 0) AS member_tasks
     FROM tasks task
     JOIN projects p ON p.id = task.project_id
     JOIN teams t ON t.id = p.team_id
     LEFT JOIN team_members tm ON tm.id = task.member_id
     LEFT JOIN (
        SELECT member_id, COUNT(*) AS task_total
        FROM tasks
        WHERE member_id IS NOT NULL
        GROUP BY member_id
     ) loads ON loads.member_id = task.member_id
     WHERE ${conditions.join(' AND ')}
     ORDER BY task.created_at DESC`,
    params,
  );
  return result.rows;
};

export const createTask = async ({ ownerId, data }) => {
  const project = await ensureProjectOwnership({
    projectId: data.projectId,
    ownerId,
  });

  const member = data.memberId
    ? await ensureMemberInTeam({ memberId: data.memberId, teamId: project.team_id })
    : null;
  const warning = calculateAssignmentWarning(member);

  const result = await query(
    `INSERT INTO tasks (project_id, title, description, member_id, priority, status)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      data.projectId,
      data.title,
      data.description ?? null,
      data.memberId ?? null,
      data.priority,
      data.status,
    ],
  );

  return { task: result.rows[0], warning };
};

export const updateTask = async ({ ownerId, taskId, updates }) => {
  const taskResult = await query(
    `SELECT task.*, p.team_id
     FROM tasks task
     JOIN projects p ON p.id = task.project_id
     JOIN teams t ON t.id = p.team_id
     WHERE task.id = $1 AND t.owner_id = $2`,
    [taskId, ownerId],
  );
  if (!taskResult.rowCount) {
    throw createHttpError(404, 'Task not found');
  }

  const existingTask = taskResult.rows[0];
  let targetProjectId = existingTask.project_id;
  let targetTeamId = existingTask.team_id;

  if (updates.projectId && updates.projectId !== existingTask.project_id) {
    const newProject = await ensureProjectOwnership({
      projectId: updates.projectId,
      ownerId,
    });
    targetProjectId = updates.projectId;
    targetTeamId = newProject.team_id;
  }

  let warning = null;
  let memberId = updates.memberId ?? existingTask.member_id;

  if (Object.prototype.hasOwnProperty.call(updates, 'memberId')) {
    if (updates.memberId) {
      const member = await ensureMemberInTeam({
        memberId: updates.memberId,
        teamId: targetTeamId,
      });
      warning = calculateAssignmentWarning(member);
    } else {
      memberId = null;
    }
  } else if (updates.projectId && memberId) {
    try {
      await ensureMemberInTeam({ memberId, teamId: targetTeamId });
    } catch {
      memberId = null;
    }
  }

  const result = await query(
    `UPDATE tasks
     SET title = COALESCE($2, title),
         description = COALESCE($3, description),
         member_id = $4,
         priority = COALESCE($5, priority),
         status = COALESCE($6, status),
         project_id = $7,
         updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [
      taskId,
      updates.title ?? null,
      updates.description ?? null,
      memberId,
      updates.priority ?? null,
      updates.status ?? null,
      targetProjectId,
    ],
  );

  return { task: result.rows[0], warning };
};

export const deleteTask = async ({ ownerId, taskId }) => {
  const result = await query(
    `DELETE FROM tasks
     WHERE id IN (
        SELECT task.id
        FROM tasks task
        JOIN projects p ON p.id = task.project_id
        JOIN teams t ON t.id = p.team_id
        WHERE task.id = $1 AND t.owner_id = $2
     )
     RETURNING *`,
    [taskId, ownerId],
  );
  if (!result.rowCount) {
    throw createHttpError(404, 'Task not found');
  }
  return result.rows[0];
};

export const autoAssignTask = async ({ ownerId, projectId }) => {
  const project = await ensureProjectOwnership({ projectId, ownerId });
  const result = await query(
    `SELECT tm.id, tm.name, tm.capacity,
            COALESCE(loads.task_total, 0) AS current_tasks
     FROM team_members tm
     LEFT JOIN (
        SELECT member_id, COUNT(*) AS task_total
        FROM tasks
        WHERE member_id IS NOT NULL
        GROUP BY member_id
     ) loads ON loads.member_id = tm.id
     WHERE tm.team_id = $1
     ORDER BY
        CASE WHEN tm.capacity = 0 THEN 999 ELSE (COALESCE(loads.task_total, 0)::float / tm.capacity) END ASC,
        tm.name ASC
     LIMIT 1`,
    [project.team_id],
  );

  if (!result.rowCount) {
    throw createHttpError(400, 'No members available for auto assignment');
  }

  const member = result.rows[0];
  return {
    memberId: member.id,
    name: member.name,
    current: Number(member.current_tasks),
    capacity: Number(member.capacity),
  };
};

