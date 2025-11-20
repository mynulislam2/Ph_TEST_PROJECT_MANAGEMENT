import { query } from '../../config/database.js';
import { createHttpError } from '../../utils/helpers.js';

export const createTeam = async ({ ownerId, name, description }) => {
  const result = await query(
    `INSERT INTO teams (owner_id, name, description)
     VALUES ($1, $2, $3) RETURNING *`,
    [ownerId, name, description ?? null],
  );
  return result.rows[0];
};

export const listTeams = async ({ ownerId }) => {
  const result = await query(
    `SELECT t.*, COUNT(tm.id) AS member_count
     FROM teams t
     LEFT JOIN team_members tm ON tm.team_id = t.id
     WHERE t.owner_id = $1
     GROUP BY t.id
     ORDER BY t.created_at DESC`,
    [ownerId],
  );
  return result.rows;
};

export const addMember = async ({ teamId, ownerId, member }) => {
  const team = await query('SELECT id FROM teams WHERE id = $1 AND owner_id = $2', [
    teamId,
    ownerId,
  ]);
  if (!team.rowCount) {
    throw createHttpError(404, 'Team not found');
  }

  const result = await query(
    `INSERT INTO team_members (team_id, name, role, capacity)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [teamId, member.name, member.role, member.capacity],
  );
  return result.rows[0];
};

export const listMembers = async ({ teamId, ownerId }) => {
  const team = await query('SELECT id FROM teams WHERE id = $1 AND owner_id = $2', [
    teamId,
    ownerId,
  ]);

  if (!team.rowCount) {
    throw createHttpError(404, 'Team not found');
  }

  const members = await query(
    `SELECT tm.*, COALESCE(task_counts.task_total, 0) AS current_tasks
     FROM team_members tm
     LEFT JOIN (
        SELECT member_id, COUNT(*) AS task_total
        FROM tasks
        WHERE member_id IS NOT NULL
        GROUP BY member_id
     ) AS task_counts ON task_counts.member_id = tm.id
     WHERE tm.team_id = $1
     ORDER BY tm.name ASC`,
    [teamId],
  );
  return members.rows;
};



