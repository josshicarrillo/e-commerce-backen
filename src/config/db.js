import mongoose from 'mongoose';
import { config } from './env.js';

export const connectDB = async () => {
  if (!config.mongoUrl) {
    throw new Error('MONGO_URL no está definido. No se puede iniciar el servidor sin MongoDB.');
  }

  try {
    await mongoose.connect(config.mongoUrl, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('Conectado a MongoDB');
    return true;
  } catch (err) {
    throw new Error('MongoDB no está disponible. Revisa que esté activo y que MONGO_URL sea correcto.', {
      cause: err,
    });
  }
};
