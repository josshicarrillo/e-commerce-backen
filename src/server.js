import app from './app.js';
import { connectDB } from './config/db.js';
import { config } from './config/env.js';

const PORT = config.port;

const start = async () => {
  const connected = await connectDB();

  app.listen(PORT, () => {
    if (connected) {
      console.log(`Servidor activo en http://localhost:${PORT}`);
      return;
    }

    console.log(`Servidor activo en http://localhost:${PORT} sin conexión a MongoDB.`);
  });
};

start();
