import {
	cancelEvent,
	createEvent,
	getAllEvents,
	getEventById,
	updateEventStatus,
	updateEvent,
} from '../repositories/events.repository.js';
import { createHttpError } from '../utils/errors.js';

const sortableFields = new Set(['title', 'date', 'price', 'location', 'createdAt']);
const eventStatuses = new Set(['draft', 'published', 'cancelled', 'finished']);

export const getEventsService = async ({ page = 1, limit = 10, ...query } = {}) => {
	const currentPage = Math.max(Number(page) || 1, 1);
	const pageSize = Math.min(Math.max(Number(limit) || 10, 1), 100);
	const filter = {};
	if (query.status) {
		if (!eventStatuses.has(query.status)) throw createHttpError('Invalid event status');
		filter.status = query.status;
	} else {
		filter.status = 'published';
	}

	if (query.title) filter.title = new RegExp(query.title, 'i');
	if (query.category) filter.category = new RegExp(query.category, 'i');
	if (query.location) filter.location = new RegExp(query.location, 'i');
	if (query.dateFrom || query.dateTo) {
		filter.date = {};
		if (query.dateFrom) filter.date.$gte = parseDate(query.dateFrom);
		if (query.dateTo) filter.date.$lte = parseDate(query.dateTo);
	}
	if (query.minPrice !== undefined || query.maxPrice !== undefined) {
		filter.price = {};
		if (query.minPrice !== undefined) filter.price.$gte = parsePrice(query.minPrice);
		if (query.maxPrice !== undefined) filter.price.$lte = parsePrice(query.maxPrice);
	}

	const sortField = sortableFields.has(query.sortBy) ? query.sortBy : 'date';
	const sortDirection = query.order === 'desc' ? -1 : 1;
	const result = await getAllEvents({
		filter,
		sort: { [sortField]: sortDirection },
		skip: (currentPage - 1) * pageSize,
		limit: pageSize,
	});

	return {
		docs: result.events,
		total: result.total,
		page: currentPage,
		limit: pageSize,
		totalPages: Math.ceil(result.total / pageSize),
	};
};

const parseDate = (value) => {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		throw createHttpError('Invalid date filter');
	}
	return date;
};

const parsePrice = (value) => {
	const price = Number(value);
	if (!Number.isFinite(price) || price < 0) {
		throw createHttpError('Invalid price filter');
	}
	return price;
};

const validateEventFields = (eventData) => {
	if (eventData.date !== undefined) {
		const eventDate = new Date(eventData.date);
		if (Number.isNaN(eventDate.getTime()) || eventDate <= new Date()) {
			throw createHttpError('La fecha del evento debe ser válida y futura');
		}
	}
	if (eventData.capacity !== undefined
		&& (!Number.isInteger(Number(eventData.capacity)) || Number(eventData.capacity) <= 0)) {
		throw createHttpError('La capacidad debe ser un entero mayor a cero');
	}
	if (eventData.price !== undefined && (!Number.isFinite(Number(eventData.price)) || Number(eventData.price) < 0)) {
		throw createHttpError('El precio debe ser mayor o igual a cero');
	}
};

export const createEventService = (eventData) => {
	validateEventFields(eventData);
	return createEvent({ ...eventData, status: eventData.status || 'published' });
};
export const getEventService = (id, options) => getEventById(id, options);
export const getEventForEnrollment = (id) => getEventById(id, { activeOnly: false });
export const updateEventService = async (id, eventData) => {
	const current = await getEventById(id, { activeOnly: false });
	if (current?.status === 'cancelled') throw createHttpError('No se puede modificar un evento cancelado', 409);
	validateEventFields(eventData);
	const editableFields = ['title', 'description', 'category', 'date', 'location', 'capacity', 'price'];
	const updates = Object.fromEntries(
		editableFields
			.filter((field) => eventData[field] !== undefined)
			.map((field) => [field, eventData[field]]),
	);
	return updateEvent(id, updates);
};
export const cancelEventService = async (id) => {
	const current = await getEventById(id, { activeOnly: false });
	if (current?.status === 'cancelled') {
		throw createHttpError('El evento ya está cancelado', 409);
	}
	return cancelEvent(id);
};
export const changeEventStatusService = async (id, status) => {
	if (!eventStatuses.has(status)) throw createHttpError('Estado de evento inválido');
	const current = await getEventById(id, { activeOnly: false });
	if (!current) return null;
	if (current.status === 'cancelled' && status !== 'cancelled') {
		throw createHttpError('No se puede modificar un evento cancelado', 409);
	}
	return updateEventStatus(id, status);
};
