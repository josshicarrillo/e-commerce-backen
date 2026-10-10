# Helen Collection — API de eventos

API REST (un "backend" sin pantallas) para una plataforma de eventos. Permite registrar usuarios, iniciar sesión, crear eventos, inscribirse con cupos limitados y recibir la confirmación por email.

> **¿Primera vez con un proyecto así?** Seguí la sección [Guía paso a paso](#guía-paso-a-paso) de arriba hacia abajo. No necesitás entender todo el código para levantarlo y probarlo.

## Índice

1. [¿De qué se trata?](#de-qué-se-trata)
2. [Conceptos básicos](#conceptos-básicos)
3. [Tecnologías](#tecnologías)
4. [Guía paso a paso](#guía-paso-a-paso)
5. [Roles y usuarios de prueba](#roles-y-usuarios-de-prueba)
6. [Endpoints](#endpoints)
7. [Cómo está organizado el código](#cómo-está-organizado-el-código)
8. [Errores y códigos HTTP](#errores-y-códigos-http)
9. [Tests](#tests)
10. [Comandos](#comandos)
11. [Problemas frecuentes](#problemas-frecuentes)

---

## ¿De qué se trata?

Imaginá una página como las de venta de entradas, pero solo la parte "de atrás":

- Un **organizador** publica un evento (por ejemplo, *Congreso Tech 2026*), con fecha, lugar, precio y **cupo** (cuántas personas pueden ir).
- Un **usuario** ve los eventos y se **inscribe**. Recibe un **ticket** con un código de reserva y un **email** de confirmación.
- Si el usuario cancela su ticket, ese lugar queda **libre** para otra persona.
- Un **admin** puede administrar todo.

La API se encarga de las reglas: que nadie se inscriba dos veces al mismo evento, que no se supere el cupo y que cada persona solo pueda hacer lo que su rol le permite.

## Conceptos básicos

Algunos términos que vas a ver en este documento:

| Término | Qué significa, en simple |
| --- | --- |
| **API** | Un programa que recibe pedidos y responde con datos (en formato JSON), en vez de mostrar pantallas. |
| **Endpoint** | Una "dirección" de la API para hacer algo puntual. Por ejemplo, `POST /api/events` crea un evento. |
| **Método HTTP** | El tipo de acción: `GET` (consultar), `POST` (crear), `PUT`/`PATCH` (modificar), `DELETE` (borrar o cancelar). |
| **JSON** | El formato de texto con el que se mandan y reciben datos: `{ "title": "Mi evento" }`. |
| **Código de estado** | Un número que indica cómo salió el pedido: `200`/`201` bien, `4xx` error del pedido, `500` error del servidor. |
| **JWT** | Un "pase" firmado que demuestra quién sos. Se genera cuando iniciás sesión. |
| **Cookie** | Un lugar donde el navegador o Postman guarda ese pase y lo envía solo en cada pedido. |
| **Rol** | El tipo de usuario (`user`, `organizer` o `admin`). Define qué puede hacer cada uno. |
| **MongoDB** | La base de datos donde se guardan usuarios, eventos y tickets. |
| **`.env`** | Un archivo con la configuración privada (contraseñas, claves). **Nunca se sube a GitHub.** |

## Tecnologías

- **Node.js 18+** y **Express 5**: el servidor web.
- **MongoDB** con **Mongoose**: la base de datos.
- **Passport.js** + **JWT** en cookie `httpOnly`: el inicio de sesión.
- **bcryptjs**: guarda las contraseñas cifradas (nunca en texto plano).
- **Nodemailer**: envía los emails.
- **Node Test Runner**: los tests automáticos.

---

## Guía paso a paso

### Paso 1 — Instalar lo necesario

Necesitás tener instalado:

- **Node.js 18 o superior**. Para comprobarlo, ejecutá `node -v` en la terminal; tiene que mostrar `v18` o un número mayor.
- **Una base MongoDB**. Tenés dos opciones:
  - **MongoDB Atlas** (recomendado para empezar): es gratis y está en la nube, así que no instalás nada. Creá un cluster en [mongodb.com/atlas](https://www.mongodb.com/atlas) y copiá la *connection string*.
  - **MongoDB local**: instalado en tu computadora. La URL suele ser `mongodb://localhost:27017/helen-collection`.
- **Postman** (opcional, pero muy recomendado) para probar la API sin escribir comandos.

### Paso 2 — Descargar el proyecto e instalar dependencias

```bash
git clone <url-del-repositorio>
cd <carpeta-del-proyecto>
npm install
```

`npm install` descarga las librerías que usa el proyecto (se guardan en `node_modules/`).

### Paso 3 — Configurar el archivo `.env`

Copiá el archivo de ejemplo:

```bash
cp .env.example .env
```

Abrí `.env` y completá los valores:

```env
PORT=8080
NODE_ENV=development
MONGO_URL=mongodb://localhost:27017/helen-collection
JWT_SECRET=una_frase_larga_y_secreta_que_nadie_adivine
JWT_EXPIRES_IN=1h
MAIL_HOST=sandbox.smtp.mailtrap.io
MAIL_PORT=587
MAIL_USER=tu_usuario_de_mailtrap
MAIL_PASS=tu_password_de_mailtrap
MAIL_FROM=no-reply@helen-collection.test
```

| Variable | Para qué sirve | ¿Obligatoria? |
| --- | --- | --- |
| `PORT` | Puerto donde escucha el servidor. | No (por defecto `8080`) |
| `NODE_ENV` | `development` en tu computadora, `production` en un servidor real. | No |
| `MONGO_URL` | Dirección de la base de datos. Con Atlas, agregá el nombre de la base antes del `?`: `...mongodb.net/helen-collection?...`. | **Sí** |
| `JWT_SECRET` | Clave con la que se firman los pases de sesión. Cualquier texto largo y difícil de adivinar. | **Sí** |
| `JWT_EXPIRES_IN` | Cuánto dura la sesión (`1h` = una hora). | No |
| `MAIL_*` | Datos del servidor de correo. | No (sin estos datos, la app funciona pero no envía emails) |

> **¿De dónde saco los datos de email?** Para desarrollo usá **Mailtrap** ([mailtrap.io](https://mailtrap.io), gratis). En *Email Testing → Inboxes → SMTP Settings* están el host, el usuario y la contraseña. Los emails no llegan a nadie real: los ves en la bandeja de Mailtrap. Otra opción sin registro es [ethereal.email](https://ethereal.email).

### Paso 4 — Levantar el servidor

```bash
npm run dev
```

Si todo está bien, vas a ver:

```text
Conectado a MongoDB
Servidor activo en http://localhost:8080
```

Para comprobar que responde, abrí en el navegador [http://localhost:8080/api/health](http://localhost:8080/api/health). Tiene que mostrar `{"status":"ok", ...}`.

> Si ves `MongoDB no está disponible`, revisá `MONGO_URL` (ver [Problemas frecuentes](#problemas-frecuentes)).

### Paso 5 — Crear usuarios

Abrí **otra terminal** (el servidor tiene que seguir corriendo en la primera) y registrá dos usuarios:

```bash
curl -X POST http://localhost:8080/api/sessions/register \
  -H 'Content-Type: application/json' \
  -d '{"first_name":"Adri","last_name":"Admin","email":"admin@mail.com","password":"Secreta123"}'

curl -X POST http://localhost:8080/api/sessions/register \
  -H 'Content-Type: application/json' \
  -d '{"first_name":"Olga","last_name":"Organiza","email":"organizer@mail.com","password":"Secreta123"}'

curl -X POST http://localhost:8080/api/sessions/register \
  -H 'Content-Type: application/json' \
  -d '{"first_name":"Ana","last_name":"Perez","email":"ana@mail.com","password":"Secreta123"}'
```

Todos se crean con el rol `user`. Es a propósito: nadie puede registrarse directamente como admin.

> 💡 **¿Qué es `curl`?** Es un programa de la terminal que hace pedidos HTTP. Si preferís algo visual, en el paso 9 está la colección de Postman, que hace todo esto con clics.

### Paso 6 — Crear el primer admin (una sola vez)

Como el registro no permite elegir el rol, **el primer admin se crea a mano en la base de datos**:

- **En Atlas o MongoDB Compass:** abrí la colección `users`, buscá `admin@mail.com` y cambiá el campo `role` a `admin`.
- **Con mongosh:**
  ```javascript
  db.users.updateOne({ email: 'admin@mail.com' }, { $set: { role: 'admin' } })
  ```

A partir de acá, el admin puede asignar roles desde la API, sin volver a tocar la base.

### Paso 7 — El admin convierte a Olga en organizadora

```bash
# 1. El admin inicia sesión. La cookie (el "pase") se guarda en admin.txt
curl -c admin.txt -X POST http://localhost:8080/api/sessions/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@mail.com","password":"Secreta123"}'

# 2. Lista los usuarios para obtener el id de Olga (campo "_id")
curl -b admin.txt http://localhost:8080/api/users

# 3. Le asigna el rol organizer (reemplazá OLGA_ID por el id del paso anterior)
curl -b admin.txt -X PATCH http://localhost:8080/api/users/OLGA_ID/role \
  -H 'Content-Type: application/json' -d '{"role":"organizer"}'
```

> `-c archivo` **guarda** la cookie y `-b archivo` la **envía**. Así curl "recuerda" que iniciaste sesión.

### Paso 8 — Usar la aplicación: evento, inscripción y cancelación

```bash
# 1. Olga (organizer) inicia sesión y crea un evento con 2 lugares
curl -c org.txt -X POST http://localhost:8080/api/sessions/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"organizer@mail.com","password":"Secreta123"}'

curl -b org.txt -X POST http://localhost:8080/api/events \
  -H 'Content-Type: application/json' \
  -d '{"title":"Congreso Tech 2026","description":"Charlas de tecnologia y networking","category":"tech","date":"2027-03-15T18:00:00.000Z","location":"Buenos Aires","capacity":2,"price":0}'
# Respuesta 201. Copiá el "id" del evento: es EVENT_ID

# 2. Cualquiera puede ver los eventos publicados (sin iniciar sesión)
curl "http://localhost:8080/api/events?page=1&limit=5"

# 3. Ana (user) inicia sesión y se inscribe
curl -c ana.txt -X POST http://localhost:8080/api/sessions/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"ana@mail.com","password":"Secreta123"}'

curl -b ana.txt -X POST http://localhost:8080/api/events/EVENT_ID/tickets \
  -H 'Content-Type: application/json' -d '{"quantity":1}'
# Respuesta 201 con un reservationCode. Copiá el "id" del ticket: es TICKET_ID
# Si configuraste Mailtrap, el email de confirmación aparece en tu bandeja.

# 4. Si Ana intenta inscribirse otra vez → 409 "Ya tienes una inscripción activa"
curl -b ana.txt -X POST http://localhost:8080/api/events/EVENT_ID/tickets \
  -H 'Content-Type: application/json' -d '{"quantity":1}'

# 5. Ana ve sus tickets
curl -b ana.txt http://localhost:8080/api/tickets/my-tickets

# 6. Olga ve quiénes se inscribieron a su evento
curl -b org.txt http://localhost:8080/api/events/EVENT_ID/tickets

# 7. Ana cancela su ticket. El lugar se libera y puede volver a inscribirse
curl -b ana.txt -X PATCH http://localhost:8080/api/tickets/TICKET_ID/cancel

# 8. Ana intenta crear un evento → 403 (su rol no lo permite)
curl -b ana.txt -X POST http://localhost:8080/api/events \
  -H 'Content-Type: application/json' -d '{}'

# 9. Cerrar sesión
curl -b ana.txt -c ana.txt -X POST http://localhost:8080/api/sessions/logout
```

### Paso 9 — Probar todo con Postman (recomendado)

En [postman/](postman/) hay una colección que prueba **todos los endpoints** en orden, con verificaciones automáticas. Importala en Postman y seguí [postman/GUIA_POSTMAN.md](postman/GUIA_POSTMAN.md).

---

## Roles y usuarios de prueba

| Rol | Qué puede hacer |
| --- | --- |
| `user` | Ver eventos, inscribirse, ver y cancelar **sus** tickets. |
| `organizer` | Lo mismo que `user`, más crear eventos y administrar **sus propios** eventos (editar, cambiar estado, ver inscriptos). |
| `admin` | Todo: modificar cualquier evento o ticket, listar usuarios y asignar roles. |

Reglas importantes:

- El registro público **siempre** crea usuarios con rol `user`. Si alguien envía `"role": "admin"` en el registro, ese dato se ignora.
- El primer admin se crea a mano en la base ([Paso 6](#paso-6--crear-el-primer-admin-una-sola-vez)). Después, el admin asigna roles con `PATCH /api/users/:uid/role`.
- Cuando cambia el rol de alguien, esa persona tiene que **volver a iniciar sesión**, porque el rol viaja dentro del pase (JWT).

Usuarios de prueba sugeridos (todos con contraseña `Secreta123`): `admin@mail.com` (admin), `organizer@mail.com` y `organizer2@mail.com` (organizer), `ana@mail.com` y `beto@mail.com` (user). La colección de Postman los crea automáticamente.

## Endpoints

Todas las rutas empiezan con `http://localhost:8080`. "Dueño" significa el organizador que creó el evento, o el usuario dueño del ticket.

### Sesiones y usuarios

| Método | Ruta | Quién puede | Qué hace |
| --- | --- | --- | --- |
| POST | `/api/sessions/register` | Cualquiera | Registra un usuario (rol `user`). |
| POST | `/api/sessions/login` | Cualquiera | Inicia sesión y guarda el JWT en la cookie `currentUser`. |
| GET | `/api/sessions/current` | Con sesión | Muestra quién sos (id, email y rol). |
| POST | `/api/sessions/logout` | Cualquiera | Cierra sesión (borra la cookie). |
| GET | `/api/users` | Admin | Lista los usuarios (sin contraseñas). |
| PATCH | `/api/users/:uid/role` | Admin | Cambia el rol de un usuario. Body: `{ "role": "organizer" }`. No permite cambiar el propio. |

### Eventos

| Método | Ruta | Quién puede | Qué hace |
| --- | --- | --- | --- |
| GET | `/api/events` | Cualquiera | Lista eventos, con filtros y paginación. |
| GET | `/api/events/:id` | Cualquiera | Muestra un evento publicado. |
| POST | `/api/events` | Organizer / Admin | Crea un evento. |
| PUT | `/api/events/:id` | Dueño / Admin | Modifica un evento (si no está cancelado). |
| PATCH | `/api/events/:id/status` | Dueño / Admin | Cambia el estado: `draft`, `published`, `cancelled` o `finished`. |
| DELETE | `/api/events/:id` | Dueño / Admin | Cancela el evento (no lo borra de la base). |

**Datos de un evento:** `title`, `description`, `category`, `date`, `location`, `capacity` y `price`. Reglas:

- la fecha tiene que ser futura;
- `capacity` tiene que ser mayor que 0;
- `price` tiene que ser 0 o más;
- un evento cancelado no se puede modificar.

**Estados de un evento:** `draft` (borrador), `published` (publicado, se puede inscribir), `cancelled` (cancelado) y `finished` (terminado).

**Filtros del listado** (se agregan a la URL después de `?`):

| Parámetro | Ejemplo | Qué hace |
| --- | --- | --- |
| `status` | `status=published` | Filtra por estado. Sin este parámetro, muestra solo los publicados. |
| `category`, `location`, `title` | `category=tech` | Busca por texto. |
| `dateFrom`, `dateTo` | `dateFrom=2027-01-01` | Rango de fechas. |
| `minPrice`, `maxPrice` | `maxPrice=5000` | Rango de precios. |
| `page`, `limit` | `page=2&limit=5` | Paginación: qué página y cuántos eventos por página. |
| `sortBy`, `order` | `sortBy=price&order=desc` | Ordenar por `title`, `date`, `price`, `location` o `createdAt`. |

Los eventos que no están publicados solo los puede ver su organizador (los propios) o un admin. Sin sesión, la respuesta es `401`; con rol `user`, es `403`.

Ejemplo: `GET /api/events?status=published&page=2&limit=5`

```json
{
  "status": "success",
  "data": [{ "id": "...", "title": "Congreso Tech 2026", "status": "published" }],
  "page": 2,
  "limit": 5,
  "total": 27,
  "totalPages": 6
}
```

### Inscripciones (tickets)

| Método | Ruta | Quién puede | Qué hace |
| --- | --- | --- | --- |
| POST | `/api/events/:eid/tickets` | Con sesión | Se inscribe al evento. Body: `{ "quantity": 1 }`. |
| GET | `/api/tickets/my-tickets` | Con sesión | Lista tus tickets, con los datos básicos del evento. |
| GET | `/api/events/:eid/tickets` | Dueño del evento / Admin | Lista los inscriptos de un evento. |
| PATCH | `/api/tickets/:tid/cancel` | Dueño del ticket / Admin | Cancela el ticket (no lo borra) y libera el lugar. |

Reglas de inscripción:

- Solo en eventos **publicados** y **futuros**.
- Tiene que haber **cupo suficiente**. Los tickets cancelados no ocupan lugar.
- Cada usuario puede tener **una sola inscripción activa** por evento.
- Al inscribirte se envía un **email de confirmación**. Si el envío falla, la inscripción igual queda hecha y el error aparece en la consola del servidor.

Respuesta exitosa (`201`):

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

Inscripción duplicada o sin cupo (`409`):

```json
{ "status": "error", "message": "Ya tienes una inscripción activa para este evento" }
```

### Cómo funciona el inicio de sesión

1. Te registrás con `POST /api/sessions/register`. La contraseña se guarda **cifrada** con bcrypt.
2. Iniciás sesión con `POST /api/sessions/login`. El servidor crea un **JWT** (con tu id, email y rol, nunca la contraseña) y lo guarda en una **cookie `httpOnly`**. Este tipo de cookie no se puede leer desde JavaScript del navegador, lo que la hace más segura.
3. En cada pedido siguiente, la cookie viaja sola. **Passport** la verifica y sabe quién sos.
4. `GET /api/sessions/current` te muestra quién sos.
5. `POST /api/sessions/logout` borra la cookie. Desde ahí, `/current` responde `401`.

---

## Cómo está organizado el código

Cada pedido pasa por varias "capas". Cada capa tiene **una sola responsabilidad**, como en una cadena de montaje:

```text
Pedido HTTP
   │
   ▼
routes ──────► middlewares ──────► controllers ──────► services ──────► repositories ──────► dao ──────► models ──► MongoDB
(¿qué URL?)    (¿tiene sesión?     (recibe el pedido   (reglas del      (intermediario)      (habla con   (forma de
               ¿tiene permiso?)    y arma respuesta)   negocio)                              Mongoose)    los datos)
                                         │
                                         ▼
                                       dto ──► Respuesta JSON (sin password)
```

| Carpeta | Qué contiene | Ejemplo |
| --- | --- | --- |
| `src/routes/` | Las URLs y qué se ejecuta en cada una. | `POST /api/events` → crear evento |
| `src/middlewares/` | Controles que se ejecutan antes: autenticación (`401`), permisos por rol (`403`) y el manejo central de errores. | "¿Es organizer o admin?" |
| `src/controllers/` | Reciben el pedido, llaman al service y devuelven la respuesta. **No contienen reglas de negocio.** | `createEventController` |
| `src/services/` | **Las reglas del negocio.** | "No hay cupo", "fecha pasada" |
| `src/repositories/` | Intermediario entre services y DAO. | `ticketsRepository.create()` |
| `src/dao/` | El **único** lugar que habla con la base de datos a través de los modelos. | `EventModel.find()` |
| `src/models/` | La forma de los datos (User, Event, Ticket). | `capacity: Number` |
| `src/dto/` | Arman la respuesta pública y quitan datos sensibles como `password`. | `toUserDTO()` |
| `src/config/` | Configuración: variables de entorno, base de datos y Passport. | `env.js` |
| `src/utils/` | Herramientas chicas: cifrado de contraseñas, JWT, errores. | `hashPassword()` |

**¿Por qué tantas capas?** Para que cada cambio toque un solo lugar. Por ejemplo, si mañana se cambia MongoDB por otra base, solo hay que tocar `dao/`; las reglas de negocio en `services/` siguen igual.

## Errores y códigos HTTP

Todas las respuestas de error tienen esta forma: `{ "status": "error", "message": "..." }`.

| Código | Significado | Ejemplo |
| --- | --- | --- |
| `200` / `201` | Todo bien / se creó algo. | Login correcto, evento creado. |
| `400` | Los datos enviados están mal. | Fecha pasada, cupo 0, id con formato inválido. |
| `401` | No iniciaste sesión. | Pedir `/current` sin cookie. |
| `403` | Tenés sesión, pero no permiso. | Un `user` intenta crear un evento. |
| `404` | No existe. | Evento o ruta inexistente. |
| `409` | Conflicto con lo que ya existe. | Email ya registrado, inscripción duplicada, sin cupo. |
| `500` | Error inesperado del servidor. | Se cayó la base de datos. |

## Tests

```bash
npm test                 # tests automáticos (no necesitan base de datos)
npm run test:integration # prueba el registro contra una base real
```

`npm test` comprueba autenticación, roles, permisos sobre eventos, cupos, duplicados, cancelaciones y errores.

Para `test:integration`, definí la variable `MONGO_TEST_URL` apuntando a una base **solo para pruebas**. El test crea un usuario y lo borra al terminar. **No uses la base de producción.**

## Comandos

| Comando | Qué hace |
| --- | --- |
| `npm install` | Instala las dependencias. |
| `npm run dev` | Levanta el servidor y lo reinicia solo cuando guardás cambios. |
| `npm start` | Levanta el servidor (modo normal). |
| `npm test` | Ejecuta los tests. |

## Problemas frecuentes

| Problema | Solución |
| --- | --- |
| `MONGO_URL no está definido` | No existe el archivo `.env`, o le falta `MONGO_URL` (Paso 3). |
| `MongoDB no está disponible` | La URL está mal, Mongo no está corriendo o, en Atlas, tu IP no está permitida (*Network Access → Add IP Address*). |
| `401 No autenticado` | No iniciaste sesión, o curl no está enviando la cookie (te faltó `-b archivo.txt`). |
| `403 No tenés permisos` | Tu rol no alcanza. Si te cambiaron el rol, volvé a iniciar sesión. |
| `400 La fecha del evento debe ser válida y futura` | Usá una fecha futura en formato `2027-03-15T18:00:00.000Z`. |
| No llega el email | Revisá las variables `MAIL_*` y la consola del servidor: si falla, aparece `No se pudo enviar el email de confirmación`. |
| `EADDRINUSE` al levantar | El puerto 8080 está ocupado: cerrá el otro proceso o cambiá `PORT` en `.env`. |

## Antes de subir a GitHub

- **Nunca** subas `.env`, credenciales ni `node_modules/` (ya están en `.gitignore`).
- Sí subí `.env.example` (con valores de ejemplo), el código, los tests, la colección de Postman y esta documentación.
- Revisá [CHECKLIST_ENTREGA.md](CHECKLIST_ENTREGA.md) antes de publicar.
