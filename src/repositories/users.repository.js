import { usersDAO } from '../dao/users.dao.js';

export const usersRepository = {
  findByEmail: (email) => usersDAO.findByEmail(email),
  findAll: () => usersDAO.findAll(),
  create: (userData) => usersDAO.create(userData),
};
