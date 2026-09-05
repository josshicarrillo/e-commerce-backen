import {
	cancelEvent,
	createEvent,
	getAllEvents,
	getEventById,
	updateEvent,
} from '../repositories/events.repository.js';

export const getEventsService = () => getAllEvents();
export const createEventService = (eventData) => createEvent(eventData);
export const getEventService = (id) => getEventById(id);
export const updateEventService = (id, eventData) => updateEvent(id, eventData);
export const cancelEventService = (id) => cancelEvent(id);
