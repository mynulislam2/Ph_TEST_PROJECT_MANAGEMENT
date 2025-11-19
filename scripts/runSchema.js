import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../src/config/database.js';
import { logger } from '../src/config/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const schemaPath = path.resolve(__dirname, '../schema.sql');

const run = async () => {
  if (!fs.existsSync(schemaPath)) {
    logger.error(`Schema file not found at ${schemaPath}`);
    process.exit(1);
  }

  try {
    const sql = fs.readFileSync(schemaPath, 'utf8');
    logger.info('Running schema.sql against the configured database...');
    await pool.query(sql);
    logger.info('Database schema applied successfully.');
  } catch (error) {
    logger.error({ error }, 'Failed to apply schema');
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
};

run();

