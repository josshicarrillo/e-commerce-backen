import { signToken } from '../utils/jwt.js';
import { getAllUsers } from '../services/users.service.js';

export const getSessionsController = (req, res) => {
  return res.status(200).json({
    status: 'success',
    payload: [],
  });
};

export const getUsersController = async (req, res, next) => {
  try {
    const users = await getAllUsers();
    return res.status(200).json({ status: 'success', payload: users });
  } catch (error) {
    return next(error);
  }
};

export const registerController = (req, res) => {
  return res.status(201).json({ status: 'success', payload: req.user });
};

export const loginController = (req, res) => {
  const token = signToken(req.user);
  const isProduction = process.env.NODE_ENV === 'production';

  res.cookie('currentUser', token, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 1000,
    secure: isProduction,
  });

  return res.status(200).json({
    status: 'success',
    message: 'Login correcto',
  });
};

export const currentController = (req, res) => {
  return res.status(200).json({
    status: 'success',
    payload: req.user,
  });
};

export const logoutController = (req, res) => {
  res.clearCookie('currentUser');

  return res.status(200).json({
    status: 'success',
    message: 'Sesión cerrada',
  });
};
