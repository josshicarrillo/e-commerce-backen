import {
	cancelEvent,
	createEvent,
	getAllEvents,
	getEventById,
	updateEvent,
} from '../repositories/events.repository.js';

const sortableFields = new Set(['title', 'date', 'price', 'location', 'createdAt']);

export const getEventsService = async ({ page = 1, limit = 10, ...query } = {}) => {
	const currentPage = Math.max(Number(page) || 1, 1);
	const pageSize = Math.min(Math.max(Number(limit) || 10, 1), 100);
	const filter = { status: { $in: ['published', 'active'] } };

	if (query.title) filter.title = new RegExp(query.title, 'i');
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
		totalDocs: result.total,
		page: currentPage,
		limit: pageSize,
		totalPages: Math.ceil(result.total / pageSize),
	};
};

const parseDate = (value) => {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		const error = new Error('Invalid date filter');
		error.statusCode = 400;
		throw error;
	}
	return date;
};

const parsePrice = (value) => {
	const price = Number(value);
	if (!Number.isFinite(price) || price < 0) {
		const error = new Error('Invalid price filter');
		error.statusCode = 400;
		throw error;
	}
	return price;
};

export const createEventService = (eventData) => createEvent({ ...eventData, status: 'published' });
export const getEventService = (id) => getEventById(id);
export const getEventForEnrollment = (id) => getEventById(id, { activeOnly: false });
export const updateEventService = (id, eventData) => {
	const editableFields = ['title', 'description', 'date', 'location', 'price'];
	const updates = Object.fromEntries(
		editableFields
			.filter((field) => eventData[field] !== undefined)
			.map((field) => [field, eventData[field]]),
	);
	return updateEvent(id, updates);
};
export const cancelEventService = (id) => cancelEvent(id);
