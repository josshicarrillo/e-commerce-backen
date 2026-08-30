import { Router } from 'express';
import { getSessionsController, registerController } from '../controllers/sessions.controller.js';

const router = Router();

router.get('/sessions', getSessionsController);
router.post('/sessions/register', registerController);

export default router;

