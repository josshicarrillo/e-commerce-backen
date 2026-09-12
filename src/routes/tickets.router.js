import { Router } from 'express';
import {
  cancelTicketController,
  createTicketController,
  getEventTicketsController,
  getMyTicketsController,
} from '../controllers/tickets.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { authorize, authorizeEventOwner } from '../middlewares/authorize.middleware.js';
import { getEventService } from '../services/events.service.js';

const router = Router();

router.post('/events/:eid/tickets', authMiddleware, createTicketController);
router.get('/tickets/my-tickets', authMiddleware, getMyTicketsController);
router.get(
  '/events/:eid/tickets',
  authMiddleware,
  authorize('organizer', 'admin'),
  authorizeEventOwner((eventId) => getEventService(eventId), 'eid'),
  getEventTicketsController,
);
router.patch('/tickets/:tid/cancel', authMiddleware, cancelTicketController);

export default router;
