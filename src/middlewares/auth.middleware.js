import passport from '../config/passport.config.js';

export const authMiddleware = (req, res, next) => {
  passport.authenticate('current', { session: false }, (error, user) => {
    if (error || !user) {
      return res.status(401).json({ status: 'error', message: 'No autenticado' });
    }

    req.user = user;
    return next();
  })(req, res, next);
};

// Identifica al usuario si hay un JWT válido, pero no bloquea a los anónimos.
export const optionalAuthMiddleware = (req, res, next) => {
  passport.authenticate('current', { session: false }, (error, user) => {
    if (!error && user) req.user = user;
    return next();
  })(req, res, next);
};