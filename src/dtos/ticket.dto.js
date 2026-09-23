import { toUserDTO } from './user.dto.js';
import { toEventDTO } from './event.dto.js';

export const toTicketDTO = (ticket) => {
  if (!ticket) return ticket;

  return {
    id: ticket._id?.toString?.() || ticket.id,
    event: ticket.event?._id?.toString?.() || ticket.event?.id || ticket.event,
    user: ticket.user?._id?.toString?.() || ticket.user?.id || ticket.user,
    status: ticket.status,
    quantity: ticket.quantity,
    reservationCode: ticket.reservationCode,
    createdAt: ticket.createdAt,
    cancelledAt: ticket.cancelledAt,
    ...(ticket.user && typeof ticket.user === 'object'
      ? { user: toUserDTO(ticket.user) }
      : {}),
    ...(ticket.event && typeof ticket.event === 'object'
      ? { event: toEventDTO(ticket.event) }
      : {}),
  };
};

export const toTicketListDTO = (tickets = []) => tickets.map(toTicketDTO);