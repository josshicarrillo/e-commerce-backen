import express from 'express';
import cookieParser from 'cookie-parser';
import passport from './config/passport.config.js';
import eventsRouter from './routes/events.router.js';
import sessionsRouter from './routes/sessions.router.js';
import ticketsRouter from './routes/tickets.router.js';
import { notFoundHandler } from './middlewares/notFound.middleware.js';
import { errorHandler } from './middlewares/errorHandler.middleware.js';

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Servidor activo',
  });
});

app.use('/api', eventsRouter);
app.use('/api', sessionsRouter);
app.use('/api', ticketsRouter);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
