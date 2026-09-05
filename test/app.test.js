import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/app.js';
import { usersRepository } from '../src/repositories/users.repository.js';
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

test('POST /api/events diferencia 401, 403 y creación autorizada', async () => {
  const { server, port } = await getServer();

  try {
    const withoutSession = await fetch(`http://localhost:${port}/api/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Sin sesión' }),
    });
    const userResponse = await fetch(`http://localhost:${port}/api/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: authCookie({ id: 'user-123', email: 'user@mail.com', role: 'user' }),
      },
      body: JSON.stringify({ title: 'Solo organizer' }),
    });
    const organizerResponse = await fetch(`http://localhost:${port}/api/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: authCookie({ id: 'organizer-123', email: 'org@mail.com', role: 'organizer' }),
      },
      body: JSON.stringify({ title: 'Evento autorizado' }),
    });

    assert.equal(withoutSession.status, 401);
    assert.equal(userResponse.status, 403);
    assert.equal(organizerResponse.status, 201);
    assert.equal((await organizerResponse.json()).payload.organizer, 'organizer-123');
  } finally {
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

  try {
    const createResponse = await fetch(`http://localhost:${port}/api/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: authCookie({ id: 'other-organizer', email: 'other@mail.com', role: 'organizer' }),
      },
      body: JSON.stringify({ title: 'Evento ajeno' }),
    });
    const event = (await createResponse.json()).payload;
    const updateResponse = await fetch(`http://localhost:${port}/api/events/${event.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Cookie: authCookie({ id: 'organizer-123', email: 'org@mail.com', role: 'organizer' }),
      },
      body: JSON.stringify({ title: 'Intento no permitido' }),
    });

    assert.equal(updateResponse.status, 403);
  } finally {
    server.close();
  }
});
