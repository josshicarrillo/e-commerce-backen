# Helen Collection Backend

Backend para la plataforma de eventos y colecciones de Helen Collection, con API REST para gestionar usuarios, sesiones y contenido de eventos.

## Tecnologías

- Node.js
- Express
- MongoDB + Mongoose
- JWT
- bcryptjs
- dotenv

## Instalación

```bash
npm install
```

## Variables de entorno

Copia el ejemplo localmente:

```bash
cp .env.example .env
```

Archivo de ejemplo:

```env
PORT=8080
NODE_ENV=development
MONGO_URL=mongodb+srv://<username>:<password>@cluster0.klgnwxc.mongodb.net/db-helen-collection
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=1h
```

## Ejecución

```bash
npm run dev
```

## Estructura del proyecto

```text
src/
├── app.js
├── server.js
├── config/
│   └── env.js
├── controllers/
│   ├── events.controller.js
│   └── sessions.controller.js
├── middlewares/
│   ├── auth.middleware.js
│   ├── errorHandler.middleware.js
│   └── notFound.middleware.js
├── models/
│   ├── Event.js
│   └── User.js
├── repositories/
│   ├── events.repository.js
│   └── users.repository.js
├── routes/
│   ├── events.router.js
│   └── sessions.router.js
├── services/
│   ├── events.service.js
│   └── sessions.service.js
├── utils/
│   ├── hash.js
│   └── jwt.js
└── dao/
    ├── events.dao.js
    └── users.dao.js
```

## Rutas principales

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | /api/health | Verifica que el servidor esté activo |
| GET | /api/events | Obtiene eventos |
| GET | /api/sessions | Endpoint base de sesiones |
| POST | /api/sessions/register | Registro de usuario |
| POST | /api/sessions/login | Inicio de sesión con JWT en cookie |
| GET | /api/sessions/current | Devuelve el usuario autenticado |
| POST | /api/sessions/logout | Cierra la sesión |

## Registro

### POST /api/sessions/register

#### Request

```json
{
  "first_name": "Ana",
  "last_name": "Pérez",
  "email": "Ana@Mail.com",
  "password": "Secreta123"
}
```

#### Response 201

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

## Login con JWT + cookie

### POST /api/sessions/login

#### Request

```json
{
  "email": "ana@mail.com",
  "password": "Secreta123"
}
```

#### Response 200

```json
{
  "status": "success",
  "message": "Login correcto"
}
```

La respuesta también incluye la cookie `currentUser` con `httpOnly`, `sameSite: 'lax'`, `maxAge: 3600000` y `secure` sólo en producción.

#### Response 401

```json
{
  "status": "error",
  "message": "Credenciales inválidas"
}
```

## Usuario autenticado

### GET /api/sessions/current

#### Response 200

```json
{
  "status": "success",
  "payload": {
    "id": "665f2a...",
    "email": "ana@mail.com",
    "role": "user"
  }
}
```

#### Response 401

```json
{
  "status": "error",
  "message": "No autenticado"
}
```

## Logout

### POST /api/sessions/logout

#### Response 200

```json
{
  "status": "success",
  "message": "Sesión cerrada"
}
```

## Notas de implementación

- La lógica de hashing vive en `src/utils/hash.js`
- La lógica de JWT vive en `src/utils/jwt.js`
- El middleware de autenticación vive en `src/middlewares/auth.middleware.js`
- Las rutas quedan separadas de la lógica de seguridad y se mantienen limpias
- La contraseña nunca se devuelve en la respuesta del backend

## Verificación recomendada antes de subir a GitHub

1. Registrar un usuario nuevo
2. Hacer login y revisar la cookie `currentUser`
3. Consultar `/api/sessions/current` con la cookie
4. Confirmar que `/api/sessions/current` responde 401 sin la cookie
5. Ejecutar logout y confirmar que la cookie se elimina

## Prueba rápida con curl

```bash
curl -sS -X POST http://localhost:8080/api/sessions/register \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Ana",
    "last_name": "Pérez",
    "email": "ana@mail.com",
    "password": "Secreta123"
  }'

curl -sS -X POST http://localhost:8080/api/sessions/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ana@mail.com",
    "password": "Secreta123"
  }'

curl -sS http://localhost:8080/api/sessions/current \
  -H "Cookie: currentUser=<token>"
```

## Respuesta esperada del servidor

### GET /api/health

```json
{
  "status": "ok",
  "message": "Servidor activo"
}
```
{
  "status": "success",
  "payload": []
}
```
