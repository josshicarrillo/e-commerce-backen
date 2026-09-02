import { Router } from 'express';
import {
  getSessionsController,
  loginController,
  currentController,
  logoutController,
  registerController,
} from '../controllers/sessions.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/sessions', getSessionsController);
router.post('/sessions/register', registerController);
router.post('/sessions/login', loginController);
router.get('/sessions/current', authMiddleware, currentController);
router.post('/sessions/logout', logoutController);

export default router;

