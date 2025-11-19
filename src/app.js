import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { authRouter } from './modules/auth/index.js';
import { teamRouter } from './modules/teams/index.js';
import { projectRouter } from './modules/projects/index.js';
import { taskRouter } from './modules/tasks/index.js';
import { activityRouter } from './modules/activity/index.js';
import { reassignRouter } from './modules/reassign/index.js';
import { authMiddleware } from './middleware/auth.middleware.js';
import { errorHandler } from './middleware/error.middleware.js';

export const createApp = () => {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(morgan('dev'));

  app.use('/api/auth', authRouter);

  // Protected routes
  app.use('/api', authMiddleware);
  app.use('/api/teams', teamRouter);
  app.use('/api/projects', projectRouter);
  app.use('/api/tasks', taskRouter);
  app.use('/api/activity', activityRouter);
  app.use('/api/reassign', reassignRouter);

  app.use(errorHandler);

  return app;
};

