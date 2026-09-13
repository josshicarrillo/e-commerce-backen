Pre-entrega 8: Arquitectura con DAO, Repository y DTO

Objetivo

Refactorizar la API para separar responsabilidades en capas formales (DAO, Repository, DTO) sin cambiar el comportamiento externo de ningún endpoint.

* Criterios de aceptación

DAO (uno por entidad principal)

- UserDAO, EventDAO, TicketDAO (o equivalente).

- Son los únicos archivos que importan modelos de Mongoose
directamente.

- Exponen métodos de acceso a datos: findById, findOne, create, update, count, etc.

* Repository (uno por entidad principal)

- UserRepository, EventRepository, TicketRepository.

- Usan el DAO correspondiente; no importan modelos directamente.

- Exponen métodos orientados al dominio: findByEmail, findPublishedEvents, countActiveTickets, cancelTicket, etc.

* Services

- Consumen repositories, nunca DAOs ni modelos directamente.

- Concentran toda la lógica de negocio: validación de cupos, estados, duplicados, permisos sobre recursos propios, envío de email.

- Los controllers no calculan cupos, no validan estados ni resuelven reglas de negocio

* Controllers

- Solo coordinan request/response: extraen datos del body/params/query, llaman al service, devuelven la respuesta.

- No importan modelos de Mongoose

* DTO

- Existen DTOs para las respuestas de: usuario autenticado, evento y ticket/inscripción.

- Ninguna respuesta expone password, ni siquiera hasheada
Si se usa populate, el DTO también filtra los datos del documento relacionado.

* Manejo de errores

- Las respuestas de error distinguen: 400 (datos inválidos), 401 (no autenticado), 403 (sin permisos), 404 (no encontrado), 409 (conflicto), 500 (error interno).

- Existe al menos un middleware centralizado de errores, o un formato de respuesta de error consistente en toda la API.

* Comportamiento externo

- Todas las rutas existentes (sesiones, eventos, tickets) siguen funcionando igual.

- No se requiere cambiar cómo se consume la API.

* README

- Explica la arquitectura en capas y la responsabilidad de cada una

* Casos a probar antes de entregar

1. Flujo completo: registro → login → crear evento → inscribirse → consultar mis tickets → cancelar.

2. Respuesta de /current no incluye password.

3. Respuesta de ticket con populate no incluye password del usuario.

4. Endpoint con error de negocio devuelve código HTTP correcto (no 500).

5. Endpoint protegido sin sesión → 401; con sesión sin permisos → 403

* Cómo entregar
Link a repositorio público de GitHub con package.json, .gitignore, .env.example y README.

* Qué evitar

- Controllers que importen modelos de Mongoose.

- Services que importen modelos directamente (deben ir por Repository).

- Respuestas sin pasar por DTO en rutas sensibles.

- console.log innecesarios en el código.

- Subir .env, node_modules o credenciales.

Nota: Reestructurar la API de la Plataforma de Eventos e Inscripciones utilizando una arquitectura profesional basada en capas.

* Entregable

- Arquitectura profesional con DAO, Repository y DTO

En esta pre entrega vas a refactorizar la Plataforma de Eventos e Inscripciones para llevarla a una arquitectura más profesional. El objetivo no es sumar muchas funcionalidades nuevas, sino ordenar mejor las que ya existen. Vas a separar el acceso a datos mediante DAO, crear repositories como capa intermedia, concentrar la lógica de negocio en services y usar DTO para controlar las respuestas de la API.

La API debe seguir funcionando igual desde afuera: registro, login, eventos, tickets, inscripciones, cupos, permisos y notificaciones no deberían romperse. Después de esta pre entrega, el proyecto va a quedar mucho más preparado para la entrega final, donde se espera una API completa, segura, desacoplada y organizada en capas profesionales.