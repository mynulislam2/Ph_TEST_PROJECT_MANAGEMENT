import { Router } from 'express';
import { listActivityHandler } from './activity.controller.js';
import { validateRequest } from '../../middleware/validation.middleware.js';
import { listActivitySchema } from './activity.schema.js';

const router = Router();

router.get('/', validateRequest(listActivitySchema), listActivityHandler);

export default router;

