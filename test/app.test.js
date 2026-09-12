import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/app.js';
import { usersRepository } from '../src/repositories/users.repository.js';
import { eventsDAO } from '../src/dao/events.dao.js';
import { ticketsRepository } from '../src/repositories/tickets.repository.js';
import { createTicketService, cancelTicketService } from '../src/services/tickets.service.js';
import { signToken } from '../src/utils/jwt.js';
import { hashPassword } from '../src/utils/hash.js';

const getServer = () => new Promise((resolve) => {
  const server = app.listen(0, () => {
    const { port } = server.address();
    resolve({ server, port });
  });
});

test('GET /api/health responde ok', async () => {
  const { server, port } = await getServer();

  try {
    const response = await fetch(`http://localhost:${port}/api/health`);
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.equal(payload.status, 'ok');
    assert.equal(payload.message, 'Servidor activo');
  } finally {
    server.close();
  }
});

test('GET /api/unknown devuelve 404 JSON', async () => {
  const { server, port } = await getServer();

  try {
    const response = await fetch(`http://localhost:${port}/api/unknown`);
    const payload = await response.json();

    assert.equal(response.status, 404);
    assert.equal(payload.status, 'error');
    assert.equal(payload.message, 'Ruta no encontrada');
  } finally {
    server.close();
  }
});

test('POST /api/sessions/login genera cookie currentUser con JWT', async () => {
  const { server, port } = await getServer();
  const originalFindByEmail = usersRepository.findByEmail;

  try {
    usersRepository.findByEmail = async () => ({
      _id: 'user-123',
      first_name: 'Ana',
      last_name: 'Pérez',
      email: 'ana@mail.com',
      password: await hashPassword('Secreta123'),
      role: 'user',
    });

    const response = await fetch(`http://localhost:${port}/api/sessions/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'ana@mail.com', password: 'Secreta123' }),
    });
    const payload = await response.json();
    const setCookie = response.headers.get('set-cookie') || '';

    assert.equal(response.status, 200);
    assert.equal(payload.status, 'success');
    assert.equal(payload.message, 'Login correcto');
    assert.match(setCookie, /currentUser=/i);
    assert.match(setCookie, /HttpOnly/i);
  } finally {
    usersRepository.findByEmail = originalFindByEmail;
    server.close();
  }
});

test('POST /api/sessions/login rechaza credenciales inválidas', async () => {
  const { server, port } = await getServer();
  const originalFindByEmail = usersRepository.findByEmail;

  try {
    usersRepository.findByEmail = async () => null;

    const response = await fetch(`http://localhost:${port}/api/sessions/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'ana@mail.com', password: 'incorrecta' }),
    });
    const payload = await response.json();

    assert.equal(response.status, 401);
    assert.deepEqual(payload, {
      status: 'error',
      message: 'Credenciales inválidas',
    });
  } finally {
    usersRepository.findByEmail = originalFindByEmail;
    server.close();
  }
});

test('POST /api/sessions/register devuelve 409 ante duplicado detectado por Mongo', async () => {
  const { server, port } = await getServer();
  const originalFindByEmail = usersRepository.findByEmail;
  const originalCreate = usersRepository.create;

  try {
    usersRepository.findByEmail = async () => null;
    usersRepository.create = async () => {
      const error = new Error('E11000 duplicate key error');
      error.code = 11000;
      throw error;
    };

    const response = await fetch(`http://localhost:${port}/api/sessions/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        first_name: 'Ana',
        last_name: 'Pérez',
        email: 'ana@mail.com',
        password: 'Secreta123',
      }),
    });
    const payload = await response.json();

    assert.equal(response.status, 409);
    assert.deepEqual(payload, {
      status: 'error',
      message: 'Email already registered',
    });
  } finally {
    usersRepository.findByEmail = originalFindByEmail;
    usersRepository.create = originalCreate;
    server.close();
  }
});

test('GET /api/sessions/current devuelve datos del usuario autenticado', async () => {
  const { server, port } = await getServer();
  const token = signToken({ id: 'user-123', email: 'ana@mail.com', role: 'user' });

  try {
    const response = await fetch(`http://localhost:${port}/api/sessions/current`, {
      headers: {
        Cookie: `currentUser=${token}`,
      },
    });
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.equal(payload.status, 'success');
    assert.deepEqual(payload.payload, { id: 'user-123', email: 'ana@mail.com', role: 'user' });
  } finally {
    server.close();
  }
});

test('GET /api/sessions/current rechaza una cookie ausente o manipulada', async () => {
  const { server, port } = await getServer();

  try {
    const withoutCookie = await fetch(`http://localhost:${port}/api/sessions/current`);
    const invalidToken = await fetch(`http://localhost:${port}/api/sessions/current`, {
      headers: { Cookie: 'currentUser=token-manipulado' },
    });

    assert.equal(withoutCookie.status, 401);
    assert.equal(invalidToken.status, 401);
    assert.deepEqual(await invalidToken.json(), {
      status: 'error',
      message: 'No autenticado',
    });
  } finally {
    server.close();
  }
});

test('POST /api/sessions/logout elimina la cookie currentUser', async () => {
  const { server, port } = await getServer();

  try {
    const response = await fetch(`http://localhost:${port}/api/sessions/logout`, {
      method: 'POST',
    });
    const payload = await response.json();
    const setCookie = response.headers.get('set-cookie') || '';

    assert.equal(response.status, 200);
    assert.equal(payload.status, 'success');
    assert.equal(payload.message, 'Sesión cerrada');
    assert.match(setCookie, /currentUser=;/i);
  } finally {
    server.close();
  }
});

const authCookie = (user) => `currentUser=${signToken(user)}`;
const organizerId = '507f1f77bcf86cd799439011';
const otherOrganizerId = '507f1f77bcf86cd799439012';
const eventPayload = (title) => ({
  title,
  description: 'Una descripción válida para el evento',
  date: '2026-12-01T20:00:00.000Z',
  location: 'Buenos Aires',
  price: 25,
});

const enrollmentEvent = (overrides = {}) => ({
  _id: '507f1f77bcf86cd799439020',
  status: 'published',
  date: '2099-12-01T20:00:00.000Z',
  capacity: 2,
  title: 'Evento de prueba',
  location: 'Buenos Aires',
  ...overrides,
});

test('crear ticket valida evento, cupos y evita duplicados', async () => {
  const originalFindById = eventsDAO.findById;
  const originalFindActive = ticketsRepository.findActiveByUserAndEvent;
  const originalCount = ticketsRepository.countReservedByEvent;
  const originalCreate = ticketsRepository.create;

  try {
    eventsDAO.findById = async () => enrollmentEvent();
    ticketsRepository.findActiveByUserAndEvent = async () => null;
    ticketsRepository.countReservedByEvent = async () => 1;
    ticketsRepository.create = async (ticket) => ticket;

    const ticket = await createTicketService({
      userId: '507f1f77bcf86cd799439021',
      userEmail: 'ana@mail.com',
      eventId: '507f1f77bcf86cd799439020',
      quantity: 1,
    });

    assert.equal(ticket.status, 'confirmed');
    assert.equal(ticket.quantity, 1);
    assert.ok(ticket.reservationCode);

    ticketsRepository.findActiveByUserAndEvent = async () => ({ id: 'active-ticket' });
    await assert.rejects(
      () => createTicketService({
        userId: '507f1f77bcf86cd799439021',
        userEmail: 'ana@mail.com',
        eventId: '507f1f77bcf86cd799439020',
        quantity: 1,
      }),
      (error) => error.statusCode === 409,
    );
  } finally {
    eventsDAO.findById = originalFindById;
    ticketsRepository.findActiveByUserAndEvent = originalFindActive;
    ticketsRepository.countReservedByEvent = originalCount;
    ticketsRepository.create = originalCreate;
  }
});

test('crear ticket rechaza evento inexistente, no publicado y sin cupos', async () => {
  const originalFindById = eventsDAO.findById;
  const originalFindActive = ticketsRepository.findActiveByUserAndEvent;
  const originalCount = ticketsRepository.countReservedByEvent;

  try {
    eventsDAO.findById = async () => null;
    await assert.rejects(
      () => createTicketService({ userId: 'u', userEmail: 'u@mail.com', eventId: 'e', quantity: 1 }),
      (error) => error.statusCode === 404,
    );

    eventsDAO.findById = async () => enrollmentEvent({ status: 'cancelled' });
    await assert.rejects(
      () => createTicketService({ userId: 'u', userEmail: 'u@mail.com', eventId: 'e', quantity: 1 }),
      /no está disponible/,
    );

    eventsDAO.findById = async () => enrollmentEvent({ capacity: 1 });
    ticketsRepository.findActiveByUserAndEvent = async () => null;
    ticketsRepository.countReservedByEvent = async () => 1;
    await assert.rejects(
      () => createTicketService({ userId: 'u', userEmail: 'u@mail.com', eventId: 'e', quantity: 1 }),
      (error) => error.statusCode === 409 && /No hay cupos/.test(error.message),
    );
  } finally {
    eventsDAO.findById = originalFindById;
    ticketsRepository.findActiveByUserAndEvent = originalFindActive;
    ticketsRepository.countReservedByEvent = originalCount;
  }
});

test('cancelar ticket exige propietario o administrador y conserva el ticket', async () => {
  const originalFindById = ticketsRepository.findById;
  const originalCancel = ticketsRepository.cancel;

  try {
    ticketsRepository.findById = async () => ({
      id: 'ticket-1',
      user: '507f1f77bcf86cd799439021',
      status: 'confirmed',
    });
    ticketsRepository.cancel = async () => ({ id: 'ticket-1', status: 'cancelled' });

    await assert.rejects(
      () => cancelTicketService({ ticketId: 'ticket-1', userId: '507f1f77bcf86cd799439022', isAdmin: false }),
      (error) => error.statusCode === 403,
    );

    const cancelled = await cancelTicketService({
      ticketId: 'ticket-1',
      userId: '507f1f77bcf86cd799439021',
      isAdmin: false,
    });
    assert.equal(cancelled.status, 'cancelled');
  } finally {
    ticketsRepository.findById = originalFindById;
    ticketsRepository.cancel = originalCancel;
  }
});

test('POST /api/events diferencia 401, 403 y creación autorizada', async () => {
  const { server, port } = await getServer();
  const originalCreate = eventsDAO.create;

  try {
    eventsDAO.create = async (data) => ({ id: 'event-123', ...data });
    const withoutSession = await fetch(`http://localhost:${port}/api/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventPayload('Sin sesión')),
    });
    const userResponse = await fetch(`http://localhost:${port}/api/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: authCookie({ id: '507f1f77bcf86cd799439013', email: 'user@mail.com', role: 'user' }),
      },
      body: JSON.stringify(eventPayload('Solo organizer')),
    });
    const organizerResponse = await fetch(`http://localhost:${port}/api/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: authCookie({ id: organizerId, email: 'org@mail.com', role: 'organizer' }),
      },
      body: JSON.stringify(eventPayload('Evento autorizado')),
    });

    assert.equal(withoutSession.status, 401);
    assert.equal(userResponse.status, 403);
    assert.equal(organizerResponse.status, 201);
    assert.equal((await organizerResponse.json()).payload.organizer, organizerId);
  } finally {
    eventsDAO.create = originalCreate;
    server.close();
  }
});

test('GET /api/users solo permite el rol admin', async () => {
  const { server, port } = await getServer();
  const originalFindAll = usersRepository.findAll;

  try {
    usersRepository.findAll = async () => [{ id: 'user-123', email: 'user@mail.com', role: 'user' }];

    const organizerResponse = await fetch(`http://localhost:${port}/api/users`, {
      headers: { Cookie: authCookie({ id: 'organizer-123', email: 'org@mail.com', role: 'organizer' }) },
    });
    const adminResponse = await fetch(`http://localhost:${port}/api/users`, {
      headers: { Cookie: authCookie({ id: 'admin-123', email: 'admin@mail.com', role: 'admin' }) },
    });

    assert.equal(organizerResponse.status, 403);
    assert.equal(adminResponse.status, 200);
    assert.deepEqual((await adminResponse.json()).payload, [
      { id: 'user-123', email: 'user@mail.com', role: 'user' },
    ]);
  } finally {
    usersRepository.findAll = originalFindAll;
    server.close();
  }
});

test('organizer no puede modificar un evento ajeno', async () => {
  const { server, port } = await getServer();
  const originalCreate = eventsDAO.create;
  const originalFindById = eventsDAO.findById;

  try {
    eventsDAO.create = async (data) => ({ id: 'event-456', ...data });
    eventsDAO.findById = async () => ({ ...eventPayload('Evento ajeno'), id: 'event-456', organizer: otherOrganizerId });
    const createResponse = await fetch(`http://localhost:${port}/api/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: authCookie({ id: otherOrganizerId, email: 'other@mail.com', role: 'organizer' }),
      },
      body: JSON.stringify(eventPayload('Evento ajeno')),
    });
    const event = (await createResponse.json()).payload;
    const updateResponse = await fetch(`http://localhost:${port}/api/events/${event.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Cookie: authCookie({ id: organizerId, email: 'org@mail.com', role: 'organizer' }),
      },
      body: JSON.stringify({ title: 'Intento no permitido' }),
    });

    assert.equal(updateResponse.status, 403);
  } finally {
    eventsDAO.create = originalCreate;
    eventsDAO.findById = originalFindById;
    server.close();
  }
});

test('las rutas de tickets diferencian sesión y permisos de propiedad', async () => {
  const { server, port } = await getServer();
  const originalFindById = eventsDAO.findById;

  try {
    const withoutSession = await fetch(`http://localhost:${port}/api/events/event-1/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: 1 }),
    });
    assert.equal(withoutSession.status, 401);

    const commonUser = await fetch(`http://localhost:${port}/api/events/event-1/tickets`, {
      headers: { Cookie: authCookie({ id: organizerId, email: 'org@mail.com', role: 'user' }) },
    });
    assert.equal(commonUser.status, 403);

    eventsDAO.findById = async () => ({ organizer: otherOrganizerId, status: 'published' });
    const otherOrganizer = await fetch(`http://localhost:${port}/api/events/event-1/tickets`, {
      headers: { Cookie: authCookie({ id: organizerId, email: 'org@mail.com', role: 'organizer' }) },
    });
    assert.equal(otherOrganizer.status, 403);
  } finally {
    eventsDAO.findById = originalFindById;
    server.close();
  }
});
