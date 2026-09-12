import { usersRepository } from '../repositories/users.repository.js';

export const findUserByEmail = (email) => usersRepository.findByEmail(email);
export const getAllUsers = () => usersRepository.findAll();
export const createUser = (userData) => usersRepository.create(userData);
