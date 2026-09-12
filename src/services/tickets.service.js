import { randomUUID } from 'node:crypto';
import { getEventForEnrollment } from './events.service.js';
import { sendTicketConfirmation } from './mail.service.js';
import { ticketsRepository } from '../repositories/tickets.repository.js';

const createBusinessError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const validateQuantity = (quantity) => {
  const parsedQuantity = Number(quantity);
  if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
    throw createBusinessError('La cantidad debe ser un número entero mayor a cero');
  }
  return parsedQuantity;
};

export const createTicketService = async ({ userId, userEmail, eventId, quantity }) => {
  const event = await getEventForEnrollment(eventId);
  if (!event) throw createBusinessError('Evento no encontrado', 404);
  if (event.status !== 'published') {
    throw createBusinessError('El evento no está disponible para inscripciones');
  }
  if (new Date(event.date) <= new Date()) {
    throw createBusinessError('El evento ya finalizó');
  }

  const parsedQuantity = validateQuantity(quantity);
  const existingTicket = await ticketsRepository.findActiveByUserAndEvent(userId, eventId);
  if (existingTicket) throw createBusinessError('Ya tienes una inscripción activa para este evento', 409);

  const reservedQuantity = await ticketsRepository.countReservedByEvent(eventId);
  if (reservedQuantity + parsedQuantity > event.capacity) {
    throw createBusinessError(`No hay cupos suficientes. Disponibles: ${event.capacity - reservedQuantity}`, 409);
  }

  const ticket = await ticketsRepository.create({
    user: userId,
    event: eventId,
    status: 'confirmed',
    quantity: parsedQuantity,
    reservationCode: randomUUID(),
  });

  await sendTicketConfirmation({ recipient: userEmail, ticket, event });
  return ticket;
};

export const getMyTicketsService = (userId) => ticketsRepository.findByUser(userId);

export const getEventTicketsService = (eventId) => ticketsRepository.findByEvent(eventId);

export const cancelTicketService = async ({ ticketId, userId, isAdmin }) => {
  const ticket = await ticketsRepository.findById(ticketId);
  if (!ticket) throw createBusinessError('Inscripción no encontrada', 404);
  if (!isAdmin && ticket.user?.toString() !== userId.toString()) {
    throw createBusinessError('No tenés permisos para cancelar esta inscripción', 403);
  }
  if (ticket.status === 'cancelled') throw createBusinessError('La inscripción ya está cancelada', 400);

  const cancelledTicket = await ticketsRepository.cancel(ticketId);
  return cancelledTicket;
};
