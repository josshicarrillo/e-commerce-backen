# Helen Collection API

API REST para la gestión de eventos y reservas. El proyecto permite registrar usuarios, autenticar sesiones, publicar eventos, controlar cupos y gestionar tickets con reglas de negocio claras.

## Resultado final

La aplicación entrega un backend completo para una plataforma de eventos con:

- Registro e inicio de sesión de usuarios con JWT en cookie `httpOnly`.
- Roles distintos: `user`, `organizer` y `admin`.
- CRUD de eventos con estados `draft`, `published`, `cancelled` y `finished`.
- Reservas con validación de cupo, inscripción única por evento y cancelación de ticket.
- Confirmación por email al crear una inscripción activa.
- Arquitectura organizada por capas para mantener la lógica de negocio separada de la persistencia.
- Tests automáticos para validaciones de roles, permisos y flujo de reservas.

## Stack tecnológico

- Node.js 18+
- Express 5
- MongoDB + Mongoose
- Passport.js + JWT
- bcryptjs
- Nodemailer
- Node Test Runner

## Requisitos previos

- Node.js 18 o superior
- MongoDB local o MongoDB Atlas
- Un servicio SMTP para emails, por ejemplo Mailtrap

## Configuración

1. Clonar el proyecto:

```bash
git clone <url-del-repositorio>
cd e-commers-backend
```

2. Instalar dependencias:

```bash
npm install
```

3. Crear el archivo `.env` a partir del ejemplo de configuración:

```bash
cp .env.example .env
```

4. Completar las variables:

```env
PORT=8080
NODE_ENV=development
MONGO_URL=mongodb://localhost:27017/helen-collection
JWT_SECRET=una_frase_larga_y_secreta
JWT_EXPIRES_IN=1h
MAIL_HOST=sandbox.smtp.mailtrap.io
MAIL_PORT=587
MAIL_USER=tu_usuario
MAIL_PASS=tu_password
MAIL_FROM=no-reply@helen-collection.test
```

## Ejecución

Levantar el servidor en modo desarrollo:

```bash
npm run dev
```

Verificar salud del servicio:

```bash
curl http://localhost:8080/api/health
```

Respuesta esperada:

```json
{
  "status": "ok",
  "message": "Servidor activo"
}
```

## Roles y permisos

| Rol | Permisos principales |
| --- | --- |
| `user` | Registrarse, iniciar sesión, ver eventos públicos, reservar tickets y cancelarlos. |
| `organizer` | Crear y administrar sus propios eventos. |
| `admin` | Gestionar usuarios, eventos y reservas en general. |

## Endpoints principales

### Autenticación y usuarios

| Método | Ruta | Descripción |
| --- | --- | --- |
| `POST` | `/api/sessions/register` | Registro de usuario. |
| `POST` | `/api/sessions/login` | Inicio de sesión. |
| `GET` | `/api/sessions/current` | Datos del usuario autenticado. |
| `POST` | `/api/sessions/logout` | Cierre de sesión. |
| `GET` | `/api/users` | Listado de usuarios (solo admin). |
| `PATCH` | `/api/users/:uid/role` | Cambio de rol (solo admin). |

### Eventos

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/api/events` | Listado de eventos con filtros y paginación. |
| `GET` | `/api/events/:id` | Detalle del evento. |
| `POST` | `/api/events` | Crear evento (`organizer`/`admin`). |
| `PUT` | `/api/events/:id` | Editar evento. |
| `PATCH` | `/api/events/:id/status` | Cambiar estado del evento. |
| `DELETE` | `/api/events/:id` | Cancelar evento. |

### Tickets

| Método | Ruta | Descripción |
| --- | --- | --- |
| `POST` | `/api/events/:eid/tickets` | Inscribirse a un evento. |
| `GET` | `/api/tickets/my-tickets` | Ver tus tickets. |
| `GET` | `/api/events/:eid/tickets` | Ver inscriptos de un evento. |
| `PATCH` | `/api/tickets/:tid/cancel` | Cancelar ticket. |

## Reglas de negocio clave

- Los eventos deben tener una fecha futura válida.
- El cupo debe ser mayor a cero.
- Una persona no puede inscribirse dos veces al mismo evento con una reserva activa.
- Las reservas canceladas liberan cupo nuevamente.
- La inscripción solo es válida para eventos publicados y no vencidos.
- Si falla el envío del email, la inscripción se conserva y el error se registra en la consola del servidor.

## Estructura del proyecto

```text
src/
├── config/
├── controllers/
├── dao/
├── dto/
├── middlewares/
├── models/
├── repositories/
├── routes/
├── services/
├── utils/
├── app.js
├── server.js
```

La arquitectura divide responsabilidades: rutas, middlewares, controladores, servicios, repositorios y modelos, manteniendo la lógica de negocio y la persistencia separadas.

## Testing

Ejecutar tests automáticos:

```bash
npm test
```

Prueba de integración con base de datos real:

```bash
npm run test:integration
```

> Para `test:integration`, configurar `MONGO_TEST_URL` apuntando a una base exclusiva para pruebas.

## Conclusión

Este backend está listo para soportar un flujo completo de venta de entradas de eventos, con validaciones de negocio, seguridad por roles y capacidad de extenderse con nuevas funcionalidades. La estructura está pensada para mantener el código limpio, mantenible y escalable.

