import { logger } from '../config/logger.js';

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  logger.error({ err }, 'Unhandled error');
  const status = err.status || 500;
  return res.status(status).json({
    message: err.message || 'Internal server error',
  });
};



