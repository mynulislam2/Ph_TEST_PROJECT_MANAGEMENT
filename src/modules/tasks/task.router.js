import { Router } from 'express';
import {
  autoAssignHandler,
  createTaskHandler,
  deleteTaskHandler,
  listTasksHandler,
  updateTaskHandler,
} from './task.controller.js';
import { validateRequest } from '../../middleware/validation.middleware.js';
import {
  autoAssignSchema,
  createTaskSchema,
  listTaskSchema,
  updateTaskSchema,
} from './task.schema.js';

const router = Router();

router.get('/', validateRequest(listTaskSchema), listTasksHandler);
router.post('/', validateRequest(createTaskSchema), createTaskHandler);
router.post('/auto-assign', validateRequest(autoAssignSchema), autoAssignHandler);
router.patch('/:taskId', validateRequest(updateTaskSchema), updateTaskHandler);
router.delete('/:taskId', deleteTaskHandler);

export default router;

