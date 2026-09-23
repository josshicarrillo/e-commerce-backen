import { Router } from 'express';
import {
	cancelEventController,
	createEventController,
	getEventController,
	getEventsController,
	updateEventController,
	changeEventStatusController,
} from '../controllers/events.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { authorize, authorizeEventOwner } from '../middlewares/authorize.middleware.js';
import { getEventService } from '../services/events.service.js';

const router = Router();

router.get('/events', getEventsController);
router.get('/events/:id', getEventController);
router.post('/events', authMiddleware, authorize('organizer', 'admin'), createEventController);
router.put('/events/:id', authMiddleware, authorize('organizer', 'admin'), authorizeEventOwner((id) => getEventService(id, { activeOnly: false })), updateEventController);
router.patch('/events/:id/status', authMiddleware, authorize('organizer', 'admin'), authorizeEventOwner((id) => getEventService(id, { activeOnly: false })), changeEventStatusController);
router.delete('/events/:id', authMiddleware, authorize('organizer', 'admin'), authorizeEventOwner((id) => getEventService(id, { activeOnly: false })), cancelEventController);

export default router;
