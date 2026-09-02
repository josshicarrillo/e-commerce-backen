import { usersRepository } from '../repositories/users.repository.js';
import { hashPassword, comparePassword } from '../utils/hash.js';
import { signToken } from '../utils/jwt.js';

export const registerUserService = async (userData) => {
  const { first_name, last_name, email, password } = userData;
  const normalizedEmail = String(email).trim().toLowerCase();

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
  delete created.password;
  return created;
};

export const loginUserService = async ({ email, password }) => {
  const normalizedEmail = String(email).trim().toLowerCase();
  const user = await usersRepository.findByEmail(normalizedEmail);

  if (!user) {
    return null;
  }

  const passwordMatches = await comparePassword(password, user.password);
  if (!passwordMatches) {
    return null;
  }

  const payload = {
    id: user._id?.toString?.() || user.id,
    email: user.email,
    role: user.role || 'user',
  };

  return {
    ...payload,
    token: signToken(payload),
  };
};
