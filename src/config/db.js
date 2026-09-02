import mongoose from 'mongoose';
import { config } from './env.js';

export const connectDB = async () => {
  if (!config.mongoUrl) {
    console.warn('MONGO_URL no está definido. La app arrancará sin conexión a MongoDB.');
    return false;
  }

  try {
    await mongoose.connect(config.mongoUrl, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('Conectado a MongoDB');
    return true;
  } catch (err) {
    console.error('MongoDB no está disponible. Inicia MongoDB y revisa tu MONGO_URL.', err.message);
    return false;
  }
};
