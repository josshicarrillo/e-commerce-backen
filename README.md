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

Copia el archivo de ejemplo y configura valores reales locales:

```bash
cp .env.example .env
```

Archivo ejemplo:

```env
PORT=8080
NODE_ENV=development
MONGO_URL=mongodb+srv://<username>:<password>@cluster0.klgnwxc.mongodb.net/db-helen-collection
JWT_SECRET=your_jwt_secret_here
```

Variables disponibles:

- `PORT`: puerto del servidor
- `NODE_ENV`: entorno de ejecución
- `MONGO_URL`: cadena de conexión a MongoDB
- `JWT_SECRET`: clave secreta para JWT

> El archivo `.env` no debe subirse a GitHub. Se mantiene localmente.

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
│   └── env.js
├── controllers/
│   ├── events.controller.js
│   └── sessions.controller.js
├── services/
│   ├── events.service.js
│   └── sessions.service.js
├── repositories/
│   ├── events.repository.js
│   └── users.repository.js
├── dao/
│   ├── events.dao.js
│   └── users.dao.js
├── models/
│   ├── Event.js
│   └── User.js
├── routes/
│   ├── events.router.js
│   └── sessions.router.js
├── utils/
│   └── hash.js
└── ...
```

## Rutas disponibles

- `GET /api/health`
- `GET /api/events`
- `GET /api/sessions`
- `POST /api/sessions/register`

### POST /api/sessions/register

Registra un usuario público con validación y hash de contraseña.

Campos esperados:

- `first_name` (string) — requerido
- `last_name` (string) — requerido
- `email` (string) — requerido; se normaliza con `trim + lowercase`
- `password` (string) — requerido; mínimo 6 caracteres

Reglas:

- Valida presencia de campos obligatorios
- Valida formato básico del email
- Rechaza registros con email duplicado
- Hashea la contraseña utilizando bcrypt
- Asigna `role: 'user'` por defecto
- No permite manipular el rol desde el body
- La respuesta no incluye la contraseña

### Ejemplo de request

```json
{
  "first_name": "Ana",
  "last_name": "Pérez",
  "email": "Ana@Mail.com ",
  "password": "Secreta123"
}
```

### Ejemplo de response exitoso

```json
{
  "status": "success",
  "payload": {
    "_id": "665f2a...",
    "first_name": "Ana",
    "last_name": "Pérez",
    "email": "ana@mail.com",
    "role": "user",
    "createdAt": "2026-08-29T00:00:00.000Z",
    "updatedAt": "2026-08-29T00:00:00.000Z"
  }
}
```

### Ejemplo de error 400

```json
{
  "status": "error",
  "message": "Missing required fields"
}
```

### Ejemplo de error 409

```json
{
  "status": "error",
  "message": "Email already registered"
}
```

## Verificación recomendada antes de subir a GitHub

1. Probar un registro exitoso
2. Probar email inválido
3. Probar email duplicado
4. Confirmar que la contraseña no queda en texto plano en MongoDB
5. Confirmar que la respuesta no devuelve `password`

## Prueba rápida con curl

1. Asegurate de que el servidor esté corriendo en local:

```bash
npm run dev
```

2. Ejecutá esta prueba:

```bash
curl -sS -X POST http://localhost:8080/api/sessions/register \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Ana",
    "last_name": "Pérez",
    "email": "Ana@Mail.com",
    "password": "Secreta123"
  }'
```

También podés usar el script preparado:

```bash
chmod +x scripts/test-register.sh
./scripts/test-register.sh
```

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
