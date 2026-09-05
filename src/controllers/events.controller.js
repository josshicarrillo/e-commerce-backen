import {
  cancelEventService,
  createEventService,
  getEventsService,
  updateEventService,
} from '../services/events.service.js';

export const getEventsController = (req, res) => {
  const events = getEventsService();

  return res.status(200).json({
    status: 'success',
    payload: events,
  });
};

export const createEventController = (req, res) => {
  const event = createEventService({ ...req.body, organizer: req.user.id });
  return res.status(201).json({ status: 'success', payload: event });
};

export const updateEventController = (req, res) => {
  const event = updateEventService(req.params.id, req.body);
  if (!event) {
    return res.status(404).json({ status: 'error', message: 'Evento no encontrado' });
  }
  return res.status(200).json({ status: 'success', payload: event });
};

export const cancelEventController = (req, res) => {
  const event = cancelEventService(req.params.id);
  if (!event) {
    return res.status(404).json({ status: 'error', message: 'Evento no encontrado' });
  }
  return res.status(200).json({ status: 'success', payload: event });
};
