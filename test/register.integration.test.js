import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import mongoose from 'mongoose';
import app from '../src/app.js';
import UserModel from '../src/models/User.js';
import { comparePassword } from '../src/utils/hash.js';

const mongoTestUrl = process.env.MONGO_TEST_URL;

test('POST /api/sessions/register persiste el usuario en MongoDB', {
  skip: !mongoTestUrl && 'Define MONGO_TEST_URL para ejecutar la integración contra una base de pruebas.',
}, async () => {
  const email = `register-${randomUUID()}@example.test`;
  await mongoose.connect(mongoTestUrl, { serverSelectionTimeoutMS: 5000 });

  const server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  const { port } = server.address();

  try {
    const response = await fetch(`http://localhost:${port}/api/sessions/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        first_name: 'Test',
        last_name: 'User',
        email,
        password: 'Secreta123',
      }),
    });
    const payload = await response.json();
    const persistedUser = await UserModel.findOne({ email }).lean();

    assert.equal(response.status, 201);
    assert.equal(payload.payload.email, email);
    assert.equal(payload.payload.password, undefined);
    assert.ok(persistedUser);
    assert.equal(persistedUser.role, 'user');
    assert.notEqual(persistedUser.password, 'Secreta123');
    assert.equal(await comparePassword('Secreta123', persistedUser.password), true);
  } finally {
    await UserModel.deleteOne({ email });
    await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
    await mongoose.disconnect();
  }
});
