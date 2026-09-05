import { Router } from 'express';
import {
  getSessionsController,
  loginController,
  currentController,
  logoutController,
  registerController,
  getUsersController,
} from '../controllers/sessions.controller.js';
import passport from '../config/passport.config.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/authorize.middleware.js';

const router = Router();

const authenticate = (strategy) => (req, res, next) => {
  passport.authenticate(strategy, { session: false }, (error, user) => {
    if (error) return next(error);
    if (!user) {
      return res.status(401).json({ status: 'error', message: 'Credenciales inválidas' });
    }
    req.user = user;
    return next();
  })(req, res, next);
};

router.get('/sessions', getSessionsController);
router.get('/users', authMiddleware, authorize('admin'), getUsersController);
router.post('/sessions/register', authenticate('register'), registerController);
router.post('/sessions/login', authenticate('login'), loginController);
router.get('/sessions/current', authMiddleware, currentController);
router.post('/sessions/logout', logoutController);

export default router;

