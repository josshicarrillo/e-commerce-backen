import { randomUUID } from 'node:crypto';

const events = [];

export const eventsDAO = {
  findAll: () => events.filter(({ status }) => status === 'active'),
  create: (eventData) => {
    const event = { id: randomUUID(), status: 'active', ...eventData };
    events.push(event);
    return event;
  },
  findById: (id) => events.find((event) => event.id === id),
  update: (id, eventData) => {
    const event = eventsDAO.findById(id);
    if (!event) return null;
    Object.assign(event, eventData);
    return event;
  },
  cancel: (id) => eventsDAO.update(id, { status: 'cancelled' }),
};
