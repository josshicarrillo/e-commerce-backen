# Checklist de entrega final

## Requisitos implementados

- [x] Usuario con nombre, apellido, email, contraseña hasheada con bcrypt y rol.
- [x] Registro, login, current y logout; JWT en cookie `httpOnly` y respuestas públicas sin contraseña.
- [x] Passport con estrategias `register`, `login` y `current`.
- [x] Roles `user`, `organizer` y `admin`; el registro público siempre crea `user`.
- [x] Middleware de autenticación (401), autorización (403) y control de propietario/admin.
- [x] Eventos con estados, referencia al organizador, CRUD y validación de fecha, cupo y precio.
- [x] Filtros, paginación, ordenamiento y formato paginado; el listado público no revela eventos no publicados.
- [x] Tickets referenciados a usuario/evento, con cantidad, estado, código de reserva y fechas.
- [x] Inscripciones para eventos publicados, control de duplicados y cupos; los tickets cancelados dejan de ocupar cupo.
- [x] Consulta de inscripciones propias y del evento con autorización; cancelación sin borrar el registro.
- [x] Envío de confirmación con Nodemailer configurado mediante variables de entorno.
- [x] Capas routes, controllers, services, repositories, dao, dtos, models, middlewares, utils y config.
- [x] Modelos Mongoose accedidos desde los DAO; errores centralizados y DTOs en respuestas.
- [x] `.env.example`, README y pruebas automatizadas incluidos.

## Antes de publicar en GitHub

- [ ] Ejecutar `npm ci` y luego `npm test`; confirmar que todas las pruebas pasen.
- [ ] Configurar una base MongoDB de prueba y credenciales SMTP válidas en `.env` (no subir este archivo).
- [ ] Verificar el flujo registro → login → current → logout → current (401).
- [ ] Comprobar que `user` no pueda crear eventos y que `organizer` sí pueda.
- [ ] Comprobar inscripción, recepción del email y descuento de cupos con MongoDB real.
- [ ] Probar inscripción duplicada, evento sin cupos, cancelación y nueva inscripción.
- [ ] Comprobar que organizer no modifique eventos ajenos y admin sí pueda.
- [ ] Revisar respuestas de usuarios, eventos y tickets para confirmar que no contienen `password`.
- [ ] Verificar `GET /api/events?status=published&page=2&limit=5` y su paginación.
- [ ] Revisar `git status` y `git diff --check`; confirmar que `.env`, `node_modules` y credenciales no estén versionados.
- [ ] Revisar si `nota.md` debe permanecer en el repositorio público o excluirse como instrucción académica.
- [ ] Publicar los cambios en el repositorio público y adjuntar el enlace de entrega.

## Evidencia recomendada

- [ ] Colección de Postman/Insomnia con los flujos autenticados y los casos 401/403.
- [ ] Capturas o registro de ejecución que demuestren correo, cupos, cancelación y paginación.