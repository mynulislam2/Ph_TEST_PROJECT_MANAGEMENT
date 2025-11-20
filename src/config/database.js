import pkg from 'pg';
import { env } from './env.js';
import { logger } from './logger.js';

const { Pool } = pkg;

export const pool = new Pool({
  host: env.db.host,
  port: env.db.port,
  database: env.db.database,
  user: env.db.user,
  password: env.db.password,
  ssl: env.db.ssl ? { rejectUnauthorized: false } : undefined,
});

pool.on('error', (error) => {
  logger.error({ error }, 'Unexpected database error');
});

export const query = async (text, params) => {
  const start = Date.now();
  const result = await pool.query(text, params);
  const duration = Date.now() - start;
  logger.debug({ text, duration, rows: result.rowCount }, 'DB query executed');
  return result;
};



