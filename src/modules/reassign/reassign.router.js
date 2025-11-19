import { Router } from 'express';
import { reassignTasksHandler } from './reassign.controller.js';

const router = Router();

router.post('/', reassignTasksHandler);

export default router;

