import { query } from '../../config/database.js';
import { createHttpError } from '../../utils/helpers.js';

const ensureTeamBelongsToUser = async ({ teamId, ownerId }) => {
  const team = await query('SELECT id FROM teams WHERE id = $1 AND owner_id = $2', [
    teamId,
    ownerId,
  ]);
  if (!team.rowCount) {
    throw createHttpError(404, 'Team not found');
  }
  return team.rows[0];
};

export const createProject = async ({ ownerId, teamId, name, description }) => {
  await ensureTeamBelongsToUser({ teamId, ownerId });
  const result = await query(
    `INSERT INTO projects (team_id, name, description)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [teamId, name, description ?? null],
  );
  return result.rows[0];
};

export const listProjects = async ({ ownerId }) => {
  const result = await query(
    `SELECT p.*, t.name AS team_name, COUNT(task.id) AS task_count
     FROM projects p
     JOIN teams t ON t.id = p.team_id
     LEFT JOIN tasks task ON task.project_id = p.id
     WHERE t.owner_id = $1
     GROUP BY p.id, t.name
     ORDER BY p.created_at DESC`,
    [ownerId],
  );
  return result.rows;
};

export const getProject = async ({ projectId, ownerId }) => {
  const result = await query(
    `SELECT p.*, t.name AS team_name
     FROM projects p
     JOIN teams t ON t.id = p.team_id
     WHERE p.id = $1 AND t.owner_id = $2`,
    [projectId, ownerId],
  );
  if (!result.rowCount) {
    throw createHttpError(404, 'Project not found');
  }
  return result.rows[0];
};

export const updateProject = async ({ projectId, ownerId, updates }) => {
  await getProject({ projectId, ownerId });
  const result = await query(
    `UPDATE projects
     SET name = COALESCE($2, name),
         description = COALESCE($3, description)
     WHERE id = $1
     RETURNING *`,
    [projectId, updates.name ?? null, updates.description ?? null],
  );
  return result.rows[0];
};



