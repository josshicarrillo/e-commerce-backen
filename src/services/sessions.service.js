import { createUser, findUserByEmail } from './users.service.js';
import { comparePassword, hashPassword } from '../utils/hash.js';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const toPublicUser = (user) => ({
  id: user._id?.toString?.() || user.id,
  email: user.email,
  role: user.role || 'user',
});

export const registerUser = async ({ first_name, last_name, email, password }) => {
  if (!first_name || !last_name || !email || !password) {
    const error = new Error('Missing required fields');
    error.statusCode = 400;
    throw error;
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  if (!emailRegex.test(normalizedEmail)) {
    const error = new Error('Invalid email format');
    error.statusCode = 400;
    throw error;
  }

  if (String(password).length < 6) {
    const error = new Error('Password too short');
    error.statusCode = 400;
    throw error;
  }

  const existing = await findUserByEmail(normalizedEmail);
  if (existing) {
    const error = new Error('Email already registered');
    error.code = 'EMAIL_EXISTS';
    throw error;
  }

  const created = await createUser({
    first_name,
    last_name,
    email: normalizedEmail,
    password: await hashPassword(password),
    role: 'user',
  });

  delete created.password;
  return created;
};

export const authenticateUser = async (email, password) => {
  if (!email || !password) return null;

  const user = await findUserByEmail(String(email).trim().toLowerCase());
  if (!user || !(await comparePassword(password, user.password))) return null;

  return toPublicUser(user);
};
