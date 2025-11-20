import { Router } from 'express';
import {
  addMemberHandler,
  createTeamHandler,
  listMembersHandler,
  listTeamsHandler,
} from './team.controller.js';
import { validateRequest } from '../../middleware/validation.middleware.js';
import { addMemberSchema, createTeamSchema } from './team.schema.js';

const router = Router();

router.get('/', listTeamsHandler);
router.post('/', validateRequest(createTeamSchema), createTeamHandler);
router.get('/:teamId/members', listMembersHandler);
router.post('/:teamId/members', validateRequest(addMemberSchema), addMemberHandler);

export default router;



