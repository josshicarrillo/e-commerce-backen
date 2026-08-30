import { usersDAO } from '../dao/users.dao.js';

export const usersRepository = {
  findByEmail: (email) => usersDAO.findByEmail(email),
  create: (userData) => usersDAO.create(userData),
};
