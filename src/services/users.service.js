import { usersRepository } from '../repositories/users.repository.js';
import { createHttpError } from '../utils/errors.js';

const userRoles = new Set(['user', 'organizer', 'admin']);

export const findUserByEmail = (email) => usersRepository.findByEmail(email);
export const getAllUsers = () => usersRepository.findAll();
export const createUser = (userData) => usersRepository.create(userData);

export const changeUserRoleService = async ({ userId, role, requesterId }) => {
  if (!userRoles.has(role)) throw createHttpError('Rol inválido. Valores permitidos: user, organizer, admin');
  // Evita que un admin se quite sus propios permisos por error.
  if (userId === requesterId?.toString()) throw createHttpError('No podés cambiar tu propio rol', 409);

  const user = await usersRepository.updateRole(userId, role);
  if (!user) throw createHttpError('Usuario no encontrado', 404);
  return user;
};
