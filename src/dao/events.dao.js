import EventModel from '../models/Event.js';

export const eventsDAO = {
  findAll: async ({ filter, sort, skip, limit }) => {
    const [events, total] = await Promise.all([
      EventModel.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      EventModel.countDocuments(filter),
    ]);

    return { events, total };
  },
  findById: (id) => EventModel.findOne({ _id: id, status: 'active' }).lean(),
  create: async (eventData) => {
    const event = await EventModel.create(eventData);
    return event.toObject();
  },
  update: (id, eventData) => EventModel.findOneAndUpdate(
    { _id: id, status: 'active' },
    eventData,
    { new: true, runValidators: true },
  ).lean(),
  cancel: (id) => eventsDAO.update(id, { status: 'cancelled' }),
};
