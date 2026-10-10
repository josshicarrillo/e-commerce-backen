import { getTokenRemainingMs, signToken } from '../utils/jwt.js';
import { changeUserRoleService, getAllUsers } from '../services/users.service.js';
import { toAuthenticatedUserDTO, toUserDTO, toUserListDTO } from '../dto/user.dto.js';

export const getSessionsController = (req, res) => {
  return res.status(200).json({
    status: 'success',
    payload: [],
  });
};

export const getUsersController = async (req, res, next) => {
  try {
    const users = await getAllUsers();
    return res.status(200).json({ status: 'success', payload: toUserListDTO(users) });
  } catch (error) {
    return next(error);
  }
};

export const changeUserRoleController = async (req, res, next) => {
  try {
    const user = await changeUserRoleService({
      userId: req.params.uid,
      role: req.body?.role,
      requesterId: req.user.id,
    });
    return res.status(200).json({ status: 'success', payload: toUserDTO(user) });
  } catch (error) {
    return next(error);
  }
};

export const registerController = (req, res) => {
  return res.status(201).json({ status: 'success', payload: toUserDTO(req.user) });
};

export const loginController = (req, res) => {
  const token = signToken(req.user);
  const isProduction = process.env.NODE_ENV === 'production';

  res.cookie('currentUser', token, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: getTokenRemainingMs(token),
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
    payload: toAuthenticatedUserDTO(req.user),
  });
};

export const logoutController = (req, res) => {
  res.clearCookie('currentUser');

  return res.status(200).json({
    status: 'success',
    message: 'Sesión cerrada',
  });
};
