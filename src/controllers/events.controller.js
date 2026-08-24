import { getEventsService } from '../services/events.service.js';

export const getEventsController = (req, res) => {
  const events = getEventsService();

  return res.status(200).json({
    status: 'success',
    payload: events,
  });
};
