import app from './app.js';
import { connectDB } from './config/db.js';
import { config } from './config/env.js';

const PORT = config.port;

const start = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Servidor activo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(`No se pudo iniciar el servidor: ${error.message}`);
    if (error.cause?.message) {
      console.error(`Detalle de conexión: ${error.cause.message}`);
    }
    process.exitCode = 1;
  }
};

start();
