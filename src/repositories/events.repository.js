import { eventsDAO } from '../dao/events.dao.js';

export const getAllEvents = (options) => eventsDAO.findAll(options);
export const createEvent = (eventData) => eventsDAO.create(eventData);
export const getEventById = (id) => eventsDAO.findById(id);
export const updateEvent = (id, eventData) => eventsDAO.update(id, eventData);
export const cancelEvent = (id) => eventsDAO.cancel(id);
