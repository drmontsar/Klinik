import { expect, test } from 'bun:test';
import { errorDiagnostics } from '../src/logger';

test('LOG_LEVEL controls routine request logs while retaining info and errors', () => {
  const script = `
    import { Hono } from 'hono';
    import { requestLogging } from './src/middleware/request_logging';
    import { logger } from './src/logger';
    const app = new Hono();
    app.use('*', requestLogging);
    app.get('/health', c => c.text('ok'));
    await app.request('/health');
    logger.info('important event');
    logger.error('failure');
  `;
  for (const [level, nodeEnv] of [['info', 'development'], ['debug', 'production']]) {
    const result = Bun.spawnSync(['bun', '-e', script], {
      env: { ...process.env, DATABASE_URL: 'postgres://localhost/test', NODE_ENV: nodeEnv, LOG_LEVEL: level },
      stdout: 'pipe',
      stderr: 'pipe',
    });
    expect(result.exitCode).toBe(0);
    const output = result.stdout.toString();
    for (const line of output.trim().split('\n')) expect(() => JSON.parse(line)).not.toThrow();
    expect(output.includes('request completed')).toBe(level === 'debug');
    expect(output).toContain('important event');
    expect(output).toContain('failure');
  }

  const invalid = Bun.spawnSync(['bun', '-e', "import './src/config'"], {
    env: { ...process.env, DATABASE_URL: 'postgres://localhost/test', LOG_LEVEL: 'debg' },
    stderr: 'pipe',
  });
  expect(invalid.exitCode).not.toBe(0);
  expect(invalid.stderr.toString()).toContain('LOG_LEVEL must be info or debug');
});

test('error diagnostics retain code and frames without leaking messages or database details', () => {
  const error = Object.assign(new Error('Private patient and phone number'), {
    code: '23505',
    detail: 'Private record data',
    query: 'Private SQL values',
  });
  const diagnostic = errorDiagnostics(error);
  expect(diagnostic.errorCode).toBe('23505');
  expect(diagnostic.stack).toContain('at ');
  expect(JSON.stringify(diagnostic)).not.toContain('Private');
  expect(
    errorDiagnostics(Object.assign(new Error('Other failure'), { code: 'Private data' })).errorCode,
  ).toBeUndefined();
});
