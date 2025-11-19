import { Router } from 'express';
import {
  createProjectHandler,
  getProjectHandler,
  listProjectsHandler,
  updateProjectHandler,
} from './project.controller.js';
import { validateRequest } from '../../middleware/validation.middleware.js';
import { createProjectSchema, updateProjectSchema } from './project.schema.js';

const router = Router();

router.get('/', listProjectsHandler);
router.post('/', validateRequest(createProjectSchema), createProjectHandler);
router.get('/:projectId', getProjectHandler);
router.patch('/:projectId', validateRequest(updateProjectSchema), updateProjectHandler);

export default router;

