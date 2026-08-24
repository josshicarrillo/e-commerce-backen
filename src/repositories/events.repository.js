import { eventsDAO } from '../dao/events.dao.js';

export const getAllEvents = () => eventsDAO.findAll();
