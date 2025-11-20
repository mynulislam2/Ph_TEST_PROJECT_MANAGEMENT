import { verifyToken } from '../utils/jwt.js';
import { logger } from '../config/logger.js';

export const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    req.user = verifyToken(token);
    return next();
  } catch (error) {
    logger.warn({ error }, 'Invalid token');
    return res.status(401).json({ message: 'Invalid token' });
  }
};



