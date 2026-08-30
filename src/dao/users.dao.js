import UserModel from '../models/User.js';

export const usersDAO = {
  findByEmail: async (email) => UserModel.findOne({ email }).lean(),
  create: async (userData) => {
    const u = await UserModel.create(userData);
    return u.toObject();
  },
};
