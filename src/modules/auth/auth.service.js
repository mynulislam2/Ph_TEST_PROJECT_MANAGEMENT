import { query } from '../../config/database.js';
import { hashPassword, comparePassword } from '../../utils/password.js';
import { signToken } from '../../utils/jwt.js';
import { createHttpError } from '../../utils/helpers.js';

const baseUserFields = 'id, name, email, created_at';

export const registerUser = async ({ name, email, password }) => {
  const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rowCount) {
    throw createHttpError(409, 'Email already registered');
  }

  const passwordHash = await hashPassword(password);
  const result = await query(
    `INSERT INTO users (name, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING ${baseUserFields}`,
    [name, email, passwordHash],
  );

  const user = result.rows[0];
  const token = signToken({ userId: user.id, email: user.email });
  return { user, token };
};

export const loginUser = async ({ email, password }) => {
  const result = await query(
    `SELECT ${baseUserFields}, password_hash FROM users WHERE email = $1`,
    [email],
  );

  if (!result.rowCount) {
    throw createHttpError(401, 'Invalid credentials');
  }

  const user = result.rows[0];
  const isValid = await comparePassword(password, user.password_hash);
  if (!isValid) {
    throw createHttpError(401, 'Invalid credentials');
  }

  const token = signToken({ userId: user.id, email: user.email });
  delete user.password_hash;
  return { user, token };
};

export const getUserProfile = async ({ userId }) => {
  const result = await query(`SELECT ${baseUserFields} FROM users WHERE id = $1`, [userId]);
  if (!result.rowCount) {
    throw createHttpError(404, 'User not found');
  }
  return result.rows[0];
};

