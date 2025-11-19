import { Router } from 'express';
import { register, login, me } from './auth.controller.js';
import { validateRequest } from '../../middleware/validation.middleware.js';
import { registerSchema, loginSchema } from './auth.schema.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';

const router = Router();

router.post('/register', validateRequest(registerSchema), register);
router.post('/login', validateRequest(loginSchema), login);
router.get('/me', authMiddleware, me);

export default router;

