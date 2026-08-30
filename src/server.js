import app from './app.js';
import { config } from './config/env.js';
import mongoose from 'mongoose';

const PORT = config.port;

const start = async () => {
  try {
    if (!config.mongoUrl) {
      console.warn('MONGO_URL no está definido. La app arrancará sin conexión a MongoDB.');
    } else {
      await mongoose.connect(config.mongoUrl, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log('Conectado a MongoDB');
    }

    app.listen(PORT, () => {
      console.log(`Servidor activo en http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('MongoDB no está disponible. Inicia MongoDB y revisa tu MONGO_URL.', err.message);
    app.listen(PORT, () => {
      console.log(`Servidor activo en http://localhost:${PORT} sin conexión a MongoDB.`);
    });
  }
};

start();
