import { Router } from 'express';
import { getEventsController } from '../controllers/events.controller.js';

const router = Router();

router.get('/events', getEventsController);

export default router;
