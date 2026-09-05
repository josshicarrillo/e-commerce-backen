import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';
import { usersRepository } from '../repositories/users.repository.js';
import { comparePassword, hashPassword } from '../utils/hash.js';
import { config } from './env.js';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const publicUser = (user) => ({
  id: user._id?.toString?.() || user.id,
  email: user.email,
  role: user.role || 'user',
});

passport.use('register', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true,
}, async (req, email, password, done) => {
  try {
    const { first_name, last_name } = req.body;

    if (!first_name || !last_name || !email || !password) {
      const error = new Error('Missing required fields');
      error.statusCode = 400;
      return done(error);
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    if (!emailRegex.test(normalizedEmail)) {
      const error = new Error('Invalid email format');
      error.statusCode = 400;
      return done(error);
    }

    if (String(password).length < 6) {
      const error = new Error('Password too short');
      error.statusCode = 400;
      return done(error);
    }

    const existing = await usersRepository.findByEmail(normalizedEmail);
    if (existing) {
      const error = new Error('Email already registered');
      error.code = 'EMAIL_EXISTS';
      return done(error);
    }

    const created = await usersRepository.create({
      first_name,
      last_name,
      email: normalizedEmail,
      password: await hashPassword(password),
      role: 'user',
    });

    delete created.password;
    return done(null, created);
  } catch (error) {
    return done(error);
  }
}));

passport.use('login', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
}, async (email, password, done) => {
  try {
    if (!email || !password) {
      return done(null, false);
    }

    const user = await usersRepository.findByEmail(String(email).trim().toLowerCase());
    if (!user || !(await comparePassword(password, user.password))) {
      return done(null, false);
    }

    return done(null, publicUser(user));
  } catch (error) {
    return done(error);
  }
}));

const cookieExtractor = (req) => req?.cookies?.currentUser || null;

passport.use('current', new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
  secretOrKey: config.jwtSecret,
}, (payload, done) => done(null, publicUser(payload))));

export default passport;