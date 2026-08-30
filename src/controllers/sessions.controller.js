import { registerUserService } from '../services/sessions.service.js';

export const getSessionsController = (req, res) => {
  return res.status(200).json({
    status: 'success',
    payload: [],
  });
};

export const registerController = async (req, res) => {
  try {
    const { first_name, last_name, email, password } = req.body;

    // validations
    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({ status: 'error', message: 'Missing required fields' });
    }

    // email format basic check
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
    if (err.code === 'EMAIL_EXISTS') {
      return res.status(409).json({ status: 'error', message: 'Email already registered' });
    }
    console.error(err);
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};
