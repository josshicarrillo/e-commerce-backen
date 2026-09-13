import { toUserDTO } from './user.dto.js';
import { toEventDTO } from './event.dto.js';

export const toTicketDTO = (ticket) => {
  if (!ticket) return ticket;

  return {
    ...ticket,
    ...(ticket.user && typeof ticket.user === 'object'
      ? { user: toUserDTO(ticket.user) }
      : {}),
    ...(ticket.event && typeof ticket.event === 'object'
      ? { event: toEventDTO(ticket.event) }
      : {}),
  };
};

export const toTicketListDTO = (tickets = []) => tickets.map(toTicketDTO);