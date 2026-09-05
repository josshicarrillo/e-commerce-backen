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