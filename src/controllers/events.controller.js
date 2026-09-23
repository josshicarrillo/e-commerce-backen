import {
  cancelEventService,
  createEventService,
  getEventsService,
  getEventService,
  changeEventStatusService,
  updateEventService,
} from '../services/events.service.js';
import { toEventDTO, toEventListDTO } from '../dtos/event.dto.js';

export const getEventsController = async (req, res, next) => {
  try {
    const events = await getEventsService(req.query);
    return res.status(200).json({
      status: 'success',
      data: toEventListDTO(events.docs),
      page: events.page,
      limit: events.limit,
      total: events.total,
      totalPages: events.totalPages,
    });
  } catch (error) {
    return next(error);
  }
};

export const getEventController = async (req, res, next) => {
  try {
    const event = await getEventService(req.params.id);
    if (!event) return res.status(404).json({ status: 'error', message: 'Evento no encontrado' });
    return res.status(200).json({ status: 'success', payload: toEventDTO(event) });
  } catch (error) {
    return next(error);
  }
};

export const createEventController = async (req, res, next) => {
  try {
    const event = await createEventService({ ...req.body, organizer: req.user.id });
    return res.status(201).json({ status: 'success', payload: toEventDTO(event) });
  } catch (error) {
    return next(error);
  }
};

export const updateEventController = async (req, res, next) => {
  try {
    const event = await updateEventService(req.params.id, req.body);
    if (!event) return res.status(404).json({ status: 'error', message: 'Evento no encontrado' });
    return res.status(200).json({ status: 'success', payload: toEventDTO(event) });
  } catch (error) {
    return next(error);
  }
};

export const cancelEventController = async (req, res, next) => {
  try {
    const event = await cancelEventService(req.params.id);
    if (!event) return res.status(404).json({ status: 'error', message: 'Evento no encontrado' });
    return res.status(200).json({ status: 'success', payload: toEventDTO(event) });
  } catch (error) {
    return next(error);
  }
};

export const changeEventStatusController = async (req, res, next) => {
  try {
    const event = await changeEventStatusService(req.params.id, req.body.status);
    if (!event) return res.status(404).json({ status: 'error', message: 'Evento no encontrado' });
    return res.status(200).json({ status: 'success', payload: toEventDTO(event) });
  } catch (error) {
    return next(error);
  }
};
