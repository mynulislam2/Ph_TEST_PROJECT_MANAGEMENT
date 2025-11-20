import pino from 'pino';
import { env } from './env.js';

export const logger = pino({
  transport: env.nodeEnv === 'development'
    ? {
        target: 'pino-pretty',
        options: { colorize: true, translateTime: 'SYS:standard' },
      }
    : undefined,
  level: env.nodeEnv === 'test' ? 'warn' : 'info',
});



