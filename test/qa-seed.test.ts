import { expect, test } from 'bun:test';

test('QA seeding refuses the old DB, remote databases and production mode', () => {
  for (const [databaseUrl, nodeEnv] of [
    ['postgres://klinik:klinik@localhost:5433/klinik', 'development'],
    ['postgres://klinik:klinik@localhost:5434/other', 'development'],
    ['postgres://klinik:klinik@db.example.com:5434/klinik', 'development'],
    ['postgres://klinik:klinik@localhost:5434/klinik', 'production'],
  ]) {
    const result = Bun.spawnSync(['bun', 'run', 'scripts/seed-qa.ts'], {
      env: { ...process.env, DATABASE_URL: databaseUrl, NODE_ENV: nodeEnv },
      stdout: 'pipe',
      stderr: 'pipe',
    });
    expect(result.exitCode).not.toBe(0);
    expect(result.stderr.toString()).toContain('Refusing QA seed');
    expect(result.stdout.toString()).not.toContain('QA clinical histories populated');
  }
});
