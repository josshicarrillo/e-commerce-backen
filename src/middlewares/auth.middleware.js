import { verifyToken } from '../utils/jwt.js';

const parseCookies = (cookieHeader = '') => {
  return cookieHeader.split(';').reduce((acc, chunk) => {
    const [key, ...valueParts] = chunk.trim().split('=');
    if (!key) return acc;
    acc[key] = valueParts.join('=');
    return acc;
  }, {});
};

export const authMiddleware = (req, res, next) => {
  try {
    const cookies = parseCookies(req.headers.cookie || '');
    const token = cookies.currentUser;

    if (!token) {
      return res.status(401).json({ status: 'error', message: 'No autenticado' });
    }

    const payload = verifyToken(token);
    req.user = {
      id: payload.id,
      email: payload.email,
      role: payload.role,
    };

    return next();
  } catch (err) {
    return res.status(401).json({ status: 'error', message: 'No autenticado' });
  }
};
