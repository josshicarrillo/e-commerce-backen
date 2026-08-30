import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/app.js';

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
