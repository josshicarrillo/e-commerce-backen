Pre-entrega 3 — Autenticación con JWT y cookies
Objetivo
Agregar login, generación de JWT, cookie de autenticación, ruta protegida /currenty logout sobre la base de las entregas anteriores.

Criterios de aceptación
Registro (ya implementado; verificar que sigue funcionando)

POST /api/sessions/register valida campos, normaliza email, hashea contraseña, rechaza duplicados, no devuelve password
Login — POST /api/sessions/login

Valida presencia de emaily password
Busca usuario por email y compara contraseña con bcrypt
Responde siempre con "Credenciales inválidas"si algo no coincide (no especificar qué falló)
Si las credenciales son correctas, genera un JWT con payload { id, email, role }y expiración configurable
JWT firmado con JWT_SECRETdesde variables de entorno
Guarda el token en una cookie currentUsercon httpOnly: true, sameSite: 'lax', maxAge: 3600000, y secure: truesolo en producción
Ruta protegida — GET /api/sessions/current

Middleware authlee la cookie, verifica el JWT y guarda el payload en req.user
Responde 401 si no hay cookie o el token es inválido/expirado
Devuelve { id, email, role }sin incluir password
Logout — POST /api/sessions/logout

Elimina la cookie currentUser
Responde confirmación
Variables de entorno

.env.example incluye: PORT, MONGO_URL, JWT_SECRET, JWT_EXPIRES_IN, NODE_ENV
Estructura

La lógica de JWT está en utils/jwt.js; la de bcrypt en utils/hash.js; el middleware en middlewares/auth.middleware.js
Nada de esta lógica vive en la ruta o en app.js
README

Lista todas las rutas con método, descripción y ejemplo de request/response
🎯 Así se ve el entregable (para que sepas a qué apuntar)
1. Estructura de carpetas esperada del repo:



proyecto-eventos/
├── src/
│   ├── app.js
│   ├── config/
│   │   └── db.js                 # conexión a MongoDB
│   ├── models/
│   │   └── User.js
│   ├── routes/
│   │   └── sessions.router.js
│   ├── controllers/
│   │   └── sessions.controller.js
│   ├── middlewares/
│   │   └── auth.middleware.js
│   └── utils/
│       ├── jwt.js                # firmar/verificar JWT
│       └── hash.js               # bcrypt
├── .env.example
├── .gitignore
├── package.json
└── README.md
2. Ejemplo de request/response de los endpoints:

POST /api/sessions/login — Request:

json


{ "email": "ana@mail.com", "password": "Secreta123" }
Response 200 (además setea la cookie currentUser HttpOnly):

json


{ "status": "success", "message": "Login correcto" }
Response 401 (credenciales incorrectas — mensaje genérico):

json


{ "status": "error", "message": "Credenciales inválidas" }
GET /api/sessions/current (con la cookie) — Response 200:

json


{ "status": "success", "payload": { "id": "665f2a...", "email": "ana@mail.com", "role": "user" } }
Response 401 (sin cookie o token inválido/expirado):

json


{ "status": "error", "message": "No autenticado" }
POST /api/sessions/logout — Response 200 (borra la cookie):

json


{ "status": "success", "message": "Sesión cerrada" }
3. Qué evidencia adjuntar:

README.md con la tabla de rutas: método, path, descripción y un ejemplo de request/response de cada una (como el de arriba).
Recomendado: capturas de Postman/Thunder Client mostrando (a) el login con la cookie en la respuesta, (b) /current devolviendo 200 con la cookie, y (c) /current devolviendo 401 sin cookie.
El .env.example visible en el repo (con las claves, sin valores reales).