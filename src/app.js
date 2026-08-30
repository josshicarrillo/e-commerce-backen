import express from 'express';
import eventsRouter from './routes/events.router.js';
import sessionsRouter from './routes/sessions.router.js';
import { notFoundHandler } from './middlewares/notFound.middleware.js';
import { errorHandler } from './middlewares/errorHandler.middleware.js';

const app = express();

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Servidor activo',
  });
});

app.use('/api', eventsRouter);
app.use('/api', sessionsRouter);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
