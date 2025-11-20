import { query } from '../../config/database.js';

export const recordActivity = async ({ ownerId, message, metadata = {} }) => {
  const result = await query(
    `INSERT INTO activity_logs (owner_id, message, metadata)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [ownerId, message, metadata],
  );
  return result.rows[0];
};

export const listActivity = async ({ ownerId, limit = 10 }) => {
  const result = await query(
    `SELECT * FROM activity_logs
     WHERE owner_id = $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [ownerId, limit],
  );
  return result.rows;
};



