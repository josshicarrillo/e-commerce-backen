# Helen Collection Backend

API REST para una plataforma de eventos: usuarios, autenticacion, roles, eventos, inscripciones, control de cupos y notificaciones por email.

## Tecnologias

- Node.js 18+ y Express
- MongoDB con Mongoose
- Passport.js, JWT en cookie `httpOnly` y bcryptjs
- Nodemailer
- Node Test Runner

## Instalacion y configuracion

```bash
npm install
cp .env.example .env
npm run dev
```

Variables requeridas en `.env`:

```env
PORT=8080
MONGO_URL=mongodb://localhost:27017/helen-collection
JWT_SECRET=change-this-secret
JWT_EXPIRES_IN=1h
NODE_ENV=development
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USER=your_mail_user
MAIL_PASS=your_mail_password
MAIL_FROM=no-reply@example.com
```

`MAIL_*` permite enviar la confirmacion de inscripcion. Si no se configura SMTP, la inscripcion se guarda y el envio se omite.

## Comandos

```bash
npm start       # inicia el servidor
npm run dev     # inicia con watch
npm test        # ejecuta las pruebas
```

## Arquitectura

El flujo es `routes -> middlewares -> controllers -> services -> repositories -> dao -> models`.

Los modelos de Mongoose solo se importan en los DAO. Los services contienen las reglas de negocio y los controllers coordinan request/response. Los DTO filtran las respuestas publicas; ninguna respuesta incluye `password`.

```text
src/
├── config/       # entorno, base de datos y Passport
├── controllers/  # coordinacion HTTP
├── dao/          # unico acceso a modelos Mongoose
├── dtos/         # respuestas publicas
├── middlewares/  # autenticacion, roles y errores
├── models/       # User, Event y Ticket
├── repositories/ # acceso abstracto a DAO
├── routes/       # endpoints
├── services/     # reglas de negocio
└── utils/        # bcrypt y JWT
```

## Roles

- `user`: consulta eventos y administra sus propias inscripciones.
- `organizer`: crea eventos y administra los eventos propios.
- `admin`: puede crear, modificar y administrar cualquier evento o ticket.

El registro publico siempre crea usuarios con rol `user`; el campo `role` enviado en el body se ignora.

### Usuarios de prueba

Registra primero un usuario mediante `POST /api/sessions/register`. Para probar permisos de organizer o admin, promueve ese usuario directamente en MongoDB desde una consola autorizada:

```javascript
use helen-collection
db.users.updateOne({ email: 'organizer@mail.com' }, { $set: { role: 'organizer' } })
db.users.updateOne({ email: 'admin@mail.com' }, { $set: { role: 'admin' } })
```

Luego inicia sesión nuevamente para obtener una cookie JWT con el rol actualizado. No se debe enviar `role` en el registro público para intentar elevar permisos.

## Endpoints

### Sesiones y usuarios

| Metodo | Ruta | Acceso | Descripcion |
| --- | --- | --- | --- |
| POST | `/api/sessions/register` | Publico | Registra un usuario |
| POST | `/api/sessions/login` | Publico | Devuelve JWT en cookie `currentUser` |
| GET | `/api/sessions/current` | Autenticado | Devuelve id, email y rol |
| POST | `/api/sessions/logout` | Publico | Elimina la cookie |
| GET | `/api/users` | Admin | Lista usuarios sin password |

### Eventos

| Metodo | Ruta | Acceso | Descripcion |
| --- | --- | --- | --- |
| GET | `/api/events` | Publico | Lista eventos publicados con filtros y paginacion |
| GET | `/api/events/:id` | Publico | Consulta un evento publicado |
| POST | `/api/events` | Organizer/Admin | Crea un evento |
| PUT | `/api/events/:id` | Duenio/Admin | Modifica un evento no cancelado |
| PATCH | `/api/events/:id/status` | Duenio/Admin | Cambia a `draft`, `published`, `cancelled` o `finished` |
| DELETE | `/api/events/:id` | Duenio/Admin | Cancela un evento, conservandolo |

Los eventos requieren `title`, `description`, `category`, `date`, `location`, `capacity` y `price`. La fecha debe ser futura, `capacity` mayor que cero y `price` mayor o igual a cero.

Filtros disponibles: `status`, `category`, `location`, `dateFrom`, `dateTo`, `title`, `minPrice`, `maxPrice`, `page`, `limit`, `sortBy` y `order`.

Ejemplo:

```http
GET /api/events?status=published&page=2&limit=5&category=tech&order=asc
```

Respuesta:

```json
{
  "status": "success",
  "data": [{ "id": "...", "title": "Congreso Tech", "status": "published" }],
  "page": 2,
  "limit": 5,
  "total": 27,
  "totalPages": 6
}
```

### Inscripciones

| Metodo | Ruta | Acceso | Descripcion |
| --- | --- | --- | --- |
| POST | `/api/events/:eid/tickets` | Autenticado | Inscribe al usuario si hay cupo |
| GET | `/api/tickets/my-tickets` | Autenticado | Lista sus tickets con datos basicos del evento |
| GET | `/api/events/:eid/tickets` | Duenio/Admin | Lista tickets de un evento |
| PATCH | `/api/tickets/:tid/cancel` | Duenio/Admin | Cancela sin eliminar y libera cupo |

Solicitud de inscripcion:

```json
{ "quantity": 1 }
```

Solo se puede inscribir en eventos publicados, futuros y con cupos. No se permite otra inscripcion activa del mismo usuario al mismo evento. Los tickets cancelados no ocupan cupo.

Respuesta `201`:

```json
{
  "status": "success",
  "payload": {
    "id": "...",
    "event": "...",
    "user": "...",
    "quantity": 1,
    "status": "active",
    "reservationCode": "..."
  }
}
```

Luego de crear el ticket, Nodemailer envia un email de confirmacion si SMTP esta configurado.

## Flujo de autenticacion

1. Registrar usuario con `POST /api/sessions/register`.
2. Iniciar sesion con `POST /api/sessions/login`.
3. Conservar y enviar la cookie `currentUser` en las rutas privadas.
4. Consultar `GET /api/sessions/current`.
5. Cerrar sesion con `POST /api/sessions/logout`.

Passport define las estrategias `register`, `login` y `current`. Las rutas privadas responden `401` sin JWT valido y `403` cuando el rol no tiene permisos.

## Errores HTTP

La API centraliza errores y utiliza `400` para datos invalidos, `401` para falta de autenticacion, `403` para falta de permisos, `404` para recursos inexistentes, `409` para duplicados o conflictos y `500` para errores inesperados.

## Verificacion de la entrega

Desde la raiz del repositorio:

```bash
npm install
npm test
```

La suite comprueba autenticacion, roles, propiedad de eventos, cupos, duplicados, cancelacion y respuestas de error. Para validar el flujo completo con MongoDB y SMTP, seguir los pasos de autenticacion e inscripcion descritos arriba.

## Prueba rapida

```bash
curl -i -X POST http://localhost:8080/api/sessions/register \
  -H 'Content-Type: application/json' \
  -d '{"first_name":"Ana","last_name":"Perez","email":"ana@mail.com","password":"Secreta123"}'

curl -i -c cookies.txt -X POST http://localhost:8080/api/sessions/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"ana@mail.com","password":"Secreta123"}'

curl -i -b cookies.txt http://localhost:8080/api/sessions/current
```

## Entrega

No subir `.env`, credenciales ni `node_modules`. El repositorio debe incluir `.env.example`, el codigo fuente, las pruebas y esta documentacion.
