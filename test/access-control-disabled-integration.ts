// Run against an isolated, seeded database with ACCESS_CONTROL=false.
import assert from 'node:assert/strict';
import { app } from '../src/app';
import { config } from '../src/config';
import { db } from '../src/db';

assert.equal(process.env.DISPOSABLE_DATABASE, '1');
assert.equal(config.accessControlEnabled, false);
const request = (path: string, method: string, body?: unknown, token?: string) => app.request(path, {
  method,
  headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  ...(body === undefined ? {} : { body: JSON.stringify(body) }),
});
const login = (email: string) => request('/auth/login', 'POST', { email, password: 'password' });

try {
  const admin = await login('kiran+patel@klinik.com');
  assert.equal(admin.status, 200);
  const { token: adminToken } = await admin.json() as { token: string };
  const initial = await login('bruce+wayne@klinik.com');
  assert.equal(initial.status, 200);
  const { token, user } = await initial.json() as { token: string; user: { id: string } };
  const setAccess = (enabled: boolean, actor = adminToken) =>
    request('/users/access', 'PUT', { user_id: user.id, enabled }, actor);
  try {
    assert.equal((await setAccess(false)).status, 200);
    assert.equal((await request('/auth/session', 'GET', undefined, token)).status, 200);
    assert.equal((await request('/users', 'GET', undefined, token)).status, 200);
    assert.equal((await login('bruce+wayne@klinik.com')).status, 200);
    assert.equal((await setAccess(true, token)).status, 403, 'Role permissions must still apply');
    assert.equal((await request('/users', 'GET')).status, 401, 'Authentication must still apply');
  } finally {
    assert.equal((await setAccess(true)).status, 200);
  }
  console.log('Disabled access-control enforcement passed');
} finally {
  await db.end();
}
