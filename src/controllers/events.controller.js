import {
  cancelEventService,
  createEventService,
  getEventsService,
  getEventService,
  updateEventService,
} from '../services/events.service.js';

export const getEventsController = async (req, res, next) => {
  try {
    const events = await getEventsService(req.query);
    return res.status(200).json({ status: 'success', payload: events });
  } catch (error) {
    return next(error);
  }
};

export const getEventController = async (req, res, next) => {
  try {
    const event = await getEventService(req.params.id);
    if (!event) return res.status(404).json({ status: 'error', message: 'Evento no encontrado' });
    return res.status(200).json({ status: 'success', payload: event });
  } catch (error) {
    return next(error);
  }
};

export const createEventController = async (req, res, next) => {
  try {
    const event = await createEventService({ ...req.body, organizer: req.user.id });
    return res.status(201).json({ status: 'success', payload: event });
  } catch (error) {
    return next(error);
  }
};

export const updateEventController = async (req, res, next) => {
  try {
    const event = await updateEventService(req.params.id, req.body);
    if (!event) return res.status(404).json({ status: 'error', message: 'Evento no encontrado' });
    return res.status(200).json({ status: 'success', payload: event });
  } catch (error) {
    return next(error);
  }
};

export const cancelEventController = async (req, res, next) => {
  try {
    const event = await cancelEventService(req.params.id);
    if (!event) return res.status(404).json({ status: 'error', message: 'Evento no encontrado' });
    return res.status(200).json({ status: 'success', payload: event });
  } catch (error) {
    return next(error);
  }
};
