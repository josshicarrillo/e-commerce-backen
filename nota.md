Entrega final: API Backend plataforma de eventos
Objetivo
Presentar la versión completa e integrada de la API construida durante el curso, incorporando todas las funcionalidades de las entregas anteriores en una arquitectura profesional por capas.

Qué entregar
Repositorio público de GitHub con la API funcional. No es un proyecto nuevo: es la evolución del proyecto de las pre-entregas anteriores.

* Criterios de aceptación

 Autenticación y usuarios

- Modelo User con first_name, last_name, email, password (hasheada con bcrypt), role

- POST /api/sessions/register, POST /api/sessions/login, GET /api/sessions/current, POST /api/sessions/logout

- Login genera JWT guardado en cookie httpOnly; ninguna respuesta devuelve password

- Passport con estrategias register, login y current

* Roles y autorización

- Roles: user, organizer, admin; user por defecto en registro público

- Middleware de autenticación (401) y middleware de autorización por rol (403) aplicados en rutas concretas

- Registro público no acepta role desde el body


* Eventos

1. Modelo Event con: title, description, category, date, location, capacity, price, status (draft/published/cancelled/finished), organizer (referencia a User)

2. CRUD: POST, GET, GET /:id, PUT /:id, PATCH /:id/status

3. Solo organizer/admin crean eventos; solo dueño o admin modifican/cancelan

4. Validaciones: no fecha pasada, capacity > 0, price ≥ 0, no modificar eventos cancelados

5. Listado con filtros por status, category, location, rango de fechas; paginación y ordenamiento

6. Respuesta de listado incluye data, page, limit, total, totalPages


* Tickets / Inscripciones

1. Modelo con referencias (no objetos embebidos) a user y event; campos: status, quantity, reservationCode, createdAt, cancelledAt

2. POST /api/events/:eid/tickets — valida: evento publicado, cupo suficiente, sin duplicado activo

3. Tickets cancelled no cuentan como cupo ocupado

4. GET /api/tickets/my-tickets — propios, con populate de datos básicos del evento

5. GET /api/events/:eid/tickets — solo organizer dueño o admin

6. PATCH /api/tickets/:tid/cancel — cambia estado, no elimina; solo dueño o admin

* - Notificaciones

Nodemailer envía email al confirmar inscripción; credenciales solo en variables de entorno

* Arquitectura

1. Capas presentes: routes, controllers, services, repositories, dao, dto, models, middlewares, utils, config

2. Modelos de Mongoose solo importados en DAOs

3. Services consumen repositories; controllers solo coordinan request/response

4. DTOs aplicados en respuestas de usuario, evento y ticket

5. Middleware centralizado de errores; respuestas usan 400/401/403/404/409/500 según corresponda

* Variables de entorno

.env.example incluye: PORT, MONGO_URL, JWT_SECRET, JWT_EXPIRES_IN, NODE_ENV, MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASS, MAIL_FROM

* README

- Incluye: temática, tecnologías, instalación, variables de entorno, comandos, roles, usuarios de prueba o cómo crearlos, listado de endpoints, ejemplos de uso, flujo de autenticación e inscripción

* Así se ve el entregable (para que sepas a qué apuntar)
Es la evolución del proyecto, con arquitectura completa por capas.

1. Estructura esperada:

src/
├── routes/  controllers/  services/  repositories/  dao/  dto/  models/  middlewares/  utils/  config/

- Regla de oro: los modelos de Mongoose solo se importan en los DAO; los services usan repositories; los controllers solo coordinan request/response; las respuestas de usuario, evento y ticket pasan por DTO (nunca exponen password).

2. Request/response de los endpoints clave:

GET /api/events?status=published&page=2&limit=5 → 200 (listado paginado):

json

{ "status": "success", "data": [ { "id": "...", "title": "Congreso Tech 2026", "status": "published" } ], "page": 2, "limit": 5, "total": 27, "totalPages": 6 }
POST /api/events/:eid/tickets (evento publicado, con cupo) → 201:


json

{ "status": "success", "payload": { "id": "...", "event": "6690...", "user": "665f...", "quantity": 1, "status": "active", "reservationCode": "EVT-7QK2" } }
Inscripción duplicada o sin cupo → 409:


json

{ "status": "error", "message": "Ya tenés una inscripción activa a este evento" }

3. Qué evidencia adjuntar:

- README completo: temática, tecnologías, instalación, variables de entorno, comandos, roles, cómo crear usuarios de prueba, listado de endpoints, ejemplos de uso y el flujo de autenticación + inscripción.

- Recomendado: colección de Postman con el flujo completo, y/o capturas de los 10 casos del "Flujo completo a verificar" (registro→login→inscripción→email→cupo, 401/403, paginación).

* Flujo completo a verificar antes de entregar

1. Registro → login → /current → logout → /current devuelve 401

2. user intenta crear evento → 403

3. organizer crea evento → user se inscribe → email recibido → cupo descontado

4. user intenta inscribirse nuevamente al mismo evento → error de duplicado

5. user intenta inscribirse a evento sin cupo → error claro

6. user cancela su ticket → cupo liberado → nueva inscripción funciona

7. organizer intenta modificar evento ajeno → 403

8. admin modifica evento de otro organizador → éxito

9. Respuestas de usuario, evento y ticket no contienen password

10. Listado de eventos con ?status=published&page=2&limit=5 devuelve estructura paginada

* Cómo entregar

Link a repositorio público de GitHub. Opcionalmente: colección de Postman o deploy (consultar si es obligatorio en tu cursada).

* Qué evitar

1. Controllers que importan modelos de Mongoose directamente

2. Lógica de negocio en rutas o controllers

2. password en cualquier respuesta o payload de JWT

3. Credenciales de email o JWT hardcodeadas

4. console.log innecesarios

5. Subir .env, node_modules o credenciales

NOTA: Repositorio de GitHub con el código completo de la API, incluyendo archivo README.md detallado, configuración de entorno y scripts de inicio.

Entregable


* Resumen de la Entrega Final
La entrega final consiste en presentar una API backend completa para una plataforma de eventos. El proyecto debe integrar autenticación con JWT y cookies, Passport.js, roles, autorización, gestión de eventos, tickets o inscripciones, control de cupos, envío de emails con Nodemailer y arquitectura profesional con capas, DAO, Repository, Services y DTO.
La entrega debe ser una evolución de las pre entregas anteriores. No se debe iniciar un proyecto desde cero. El repositorio debe estar limpio, documentado y listo para que otra persona pueda instalarlo, configurarlo y probarlo.