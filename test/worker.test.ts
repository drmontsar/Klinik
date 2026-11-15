import { expect, test } from 'bun:test';
import { readdir } from 'node:fs/promises';
import { app } from '../src/app';
import { db, withDatabase, type Database } from '../src/db';
import { redactWorkerLog } from '../src/logger';
import bunServer from '../src/main';
import migrationNames from '../src/db/migration-names.json';
import worker from '../src/worker';

test('Workers entry has no Bun server options and preserves local startup', () => {
  expect(typeof worker.fetch).toBe('function');
  expect('port' in worker).toBe(false);
  expect(bunServer.fetch).toBe(app.fetch);
  expect(typeof bunServer.port).toBe('number');
});

test('Workers handler serves public routes and retains authentication', async () => {
  const health = await worker.fetch(new Request('https://qa.example.com/health'));
  expect(health.status).toBe(200);
  const protectedResponse = await worker.fetch(new Request('https://qa.example.com/admissions'));
  expect(protectedResponse.status).toBe(401);
  expect(await protectedResponse.json()).toEqual({ error: 'unauthorized' });
});

test('concurrent Worker requests use separate query clients, including methods', async () => {
  const client = (label: string) => Object.assign(() => label, {
    label,
    unsafe(this: { label: string }) { return this.label; },
  }) as unknown as Database;
  const results = await Promise.all(['first', 'second'].map((label, index) =>
    withDatabase(client(label), async () => {
      await Bun.sleep(index ? 1 : 10);
      expect(await db`SELECT 1`).toBe(label);
      expect(db.unsafe('SELECT 1')).toBe(label);
      return label;
    }),
  ));
  expect(results).toEqual(['first', 'second']);
});

test('Worker JSON logging redacts nested sensitive fields', () => {
  expect(redactWorkerLog({
    msg: 'app access changed', actorUserId: 'actor',
    req: { headers: { authorization: 'Bearer secret' } },
    records: [{ password: 'secret', payload: { patient_name: 'private' } }],
  })).toEqual({
    msg: 'app access changed', actorUserId: 'actor',
    req: { headers: { authorization: '[REDACTED]' } },
    records: [{ password: '[REDACTED]', payload: '[REDACTED]' }],
  });
});

test('bundled readiness migration inventory matches the actual migrations', async () => {
  expect(migrationNames).toEqual((await readdir('migrations')).filter(name => name.endsWith('.sql')).sort());
});
