import TicketModel from '../models/Ticket.js';

const activeStatuses = ['confirmed', 'pending'];

export const ticketsDAO = {
  findActiveByUserAndEvent: (userId, eventId) => TicketModel.findOne({
    user: userId,
    event: eventId,
    status: { $in: activeStatuses },
  }).lean(),
  countReservedByEvent: async (eventId) => {
    const [result] = await TicketModel.aggregate([
      { $match: { event: eventId, status: { $in: activeStatuses } } },
      { $group: { _id: null, quantity: { $sum: '$quantity' } } },
    ]);
    return result?.quantity || 0;
  },
  create: async (ticketData) => {
    const ticket = await TicketModel.create(ticketData);
    return ticket.toObject();
  },
  findByUser: (userId) => TicketModel.find({ user: userId })
    .sort({ createdAt: -1 })
    .populate('event', 'title date location')
    .lean(),
  findByEvent: (eventId) => TicketModel.find({ event: eventId })
    .select('user event status quantity reservationCode createdAt cancelledAt')
    .populate('user', 'first_name last_name email')
    .lean(),
  findById: (id) => TicketModel.findById(id).populate('event', 'title date location organizer').lean(),
  cancel: (id) => TicketModel.findOneAndUpdate(
    { _id: id, status: { $in: activeStatuses } },
    { status: 'cancelled', cancelledAt: new Date() },
    { new: true, runValidators: true },
  ).populate('event', 'title date location organizer').lean(),
};
