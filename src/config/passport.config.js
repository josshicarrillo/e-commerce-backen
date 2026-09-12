import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';
import {
  authenticateUser,
  registerUser,
  toPublicUser,
} from '../services/sessions.service.js';
import { config } from './env.js';

passport.use('register', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true,
}, async (req, email, password, done) => {
  try {
    return done(null, await registerUser({ ...req.body, email, password }));
  } catch (error) {
    return done(error);
  }
}));

passport.use('login', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
}, async (email, password, done) => {
  try {
    return done(null, await authenticateUser(email, password));
  } catch (error) {
    return done(error);
  }
}));

const cookieExtractor = (req) => req?.cookies?.currentUser || null;

passport.use('current', new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
  secretOrKey: config.jwtSecret,
}, (payload, done) => done(null, toPublicUser(payload))));

export default passport;