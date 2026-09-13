import {
  cancelTicketService,
  createTicketService,
  getEventTicketsService,
  getMyTicketsService,
} from '../services/tickets.service.js';
import { toTicketDTO, toTicketListDTO } from '../dtos/ticket.dto.js';

export const createTicketController = async (req, res, next) => {
  try {
    const ticket = await createTicketService({
      userId: req.user.id,
      userEmail: req.user.email,
      eventId: req.params.eid,
      quantity: req.body.quantity,
    });
    return res.status(201).json({ status: 'success', payload: toTicketDTO(ticket) });
  } catch (error) {
    return next(error);
  }
};

export const getMyTicketsController = async (req, res, next) => {
  try {
    const tickets = await getMyTicketsService(req.user.id);
    return res.status(200).json({ status: 'success', payload: toTicketListDTO(tickets) });
  } catch (error) {
    return next(error);
  }
};

export const getEventTicketsController = async (req, res, next) => {
  try {
    const tickets = await getEventTicketsService(req.params.eid);
    return res.status(200).json({ status: 'success', payload: toTicketListDTO(tickets) });
  } catch (error) {
    return next(error);
  }
};

export const cancelTicketController = async (req, res, next) => {
  try {
    const ticket = await cancelTicketService({
      ticketId: req.params.tid,
      userId: req.user.id,
      isAdmin: req.user.role === 'admin',
    });
    return res.status(200).json({ status: 'success', payload: toTicketDTO(ticket) });
  } catch (error) {
    return next(error);
  }
};
