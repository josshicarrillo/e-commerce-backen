import { usersDAO } from '../dao/users.dao.js';

export const usersRepository = {
  findByEmail: (email) => usersDAO.findByEmail(email),
  findAll: () => usersDAO.findAll(),
  updateRole: (id, role) => usersDAO.updateRole(id, role),
  create: (userData) => usersDAO.create(userData),
};
