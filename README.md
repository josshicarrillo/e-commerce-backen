# Helen Collection Backend

Backend para una plataforma de eventos y colecciones de moda/estilo, pensado como una API REST para gestionar información de eventos, sesiones y usuarios.

## Temática

Helen Collection es un proyecto orientado a la gestión de eventos y experiencias relacionadas con moda, estilo y comunidad. La API sirve como base para futuras operaciones de autenticación, catálogo de eventos, usuarios y sesiones.

## Tecnologías

- Node.js
- Express
- dotenv
- ESM Modules

## Instalación

1. Clona el repositorio.
2. Entra en la carpeta del proyecto.
3. Instala las dependencias:

```bash
npm install
```

## Configuración de variables de entorno

Copia el archivo de ejemplo y configura tus valores reales:

```bash
cp .env.example .env
```

Variables disponibles:

- PORT: puerto del servidor
- NODE_ENV: entorno de ejecución
- MONGO_URL: cadena de conexión a MongoDB
- JWT_SECRET: clave secreta para JWT

## Cómo ejecutar

Modo producción:

```bash
npm start
```

Modo desarrollo:

```bash
npm run dev
```

## Estructura de carpetas

```text
src/
├── app.js
├── server.js
├── config/
├── controllers/
├── services/
├── repositories/
├── dao/
├── models/
├── middlewares/
├── routes/
│   ├── events.router.js
│   └── sessions.router.js
├── utils/
└── ...
```

## Rutas disponibles

- GET /api/health
- GET /api/events
- GET /api/sessions

## Respuestas esperadas

### GET /api/health

```json
{
  "status": "ok",
  "message": "Servidor activo"
}
```

### GET /api/events

```json
{
  "status": "success",
  "payload": []
}
```
