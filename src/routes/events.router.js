import { Router } from 'express';
import {
	cancelEventController,
	createEventController,
	getEventsController,
	updateEventController,
} from '../controllers/events.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { authorize, authorizeEventOwner } from '../middlewares/authorize.middleware.js';
import { getEventService } from '../services/events.service.js';

const router = Router();

router.get('/events', getEventsController);
router.post('/events', authMiddleware, authorize('organizer', 'admin'), createEventController);
router.put('/events/:id', authMiddleware, authorize('organizer', 'admin'), authorizeEventOwner(getEventService), updateEventController);
router.delete('/events/:id', authMiddleware, authorize('organizer', 'admin'), authorizeEventOwner(getEventService), cancelEventController);

export default router;
