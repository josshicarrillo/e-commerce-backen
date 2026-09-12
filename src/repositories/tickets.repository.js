import { ticketsDAO } from '../dao/tickets.dao.js';

export const ticketsRepository = {
  findActiveByUserAndEvent: (userId, eventId) => ticketsDAO.findActiveByUserAndEvent(userId, eventId),
  countReservedByEvent: (eventId) => ticketsDAO.countReservedByEvent(eventId),
  create: (ticketData) => ticketsDAO.create(ticketData),
  findByUser: (userId) => ticketsDAO.findByUser(userId),
  findById: (id) => ticketsDAO.findById(id),
  cancel: (id) => ticketsDAO.cancel(id),
};
