import { usersRepository } from '../repositories/users.repository.js';
import { hashPassword } from '../utils/hash.js';

export const registerUserService = async (userData) => {
  const { first_name, last_name, email, password } = userData;

  // normalize email
  const normalizedEmail = String(email).trim().toLowerCase();

  // check existing
  const existing = await usersRepository.findByEmail(normalizedEmail);
  if (existing) {
    const err = new Error('Email already registered');
    err.code = 'EMAIL_EXISTS';
    throw err;
  }

  const hashed = await hashPassword(password);

  const toSave = {
    first_name,
    last_name,
    email: normalizedEmail,
    password: hashed,
    role: 'user',
  };

  const created = await usersRepository.create(toSave);
  // remove password before returning
  delete created.password;
  return created;
};
