import {
  registerUserService,
  loginUserService,
} from '../services/sessions.service.js';

export const getSessionsController = (req, res) => {
  return res.status(200).json({
    status: 'success',
    payload: [],
  });
};

export const registerController = async (req, res, next) => {
  try {
    const { first_name, last_name, email, password } = req.body;

    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({ status: 'error', message: 'Missing required fields' });
    }

    const emailNormalized = String(email).trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailNormalized)) {
      return res.status(400).json({ status: 'error', message: 'Invalid email format' });
    }

    if (String(password).length < 6) {
      return res.status(400).json({ status: 'error', message: 'Password too short' });
    }

    const created = await registerUserService({ first_name, last_name, email: emailNormalized, password });

    return res.status(201).json({ status: 'success', payload: created });
  } catch (err) {
    return next(err);
  }
};

export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ status: 'error', message: 'Credenciales inválidas' });
    }

    const user = await loginUserService({ email, password });
    if (!user) {
      return res.status(401).json({ status: 'error', message: 'Credenciales inválidas' });
    }

    const token = user.token;
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
  } catch (err) {
    console.error(err);
    return res.status(401).json({ status: 'error', message: 'Credenciales inválidas' });
  }
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
