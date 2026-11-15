import { readdir } from 'node:fs/promises';

const migrations = (await readdir('migrations')).filter(name => name.endsWith('.sql')).sort();
await Bun.write('src/db/migration-names.json', `${JSON.stringify(migrations, null, 2)}\n`);

// A local bundle only: --dry-run never creates, updates or deploys a Cloudflare Worker.
const build = Bun.spawn(['bunx', 'wrangler', 'deploy', '--dry-run', '--outdir', 'dist/worker'], {
  env: { ...process.env, CLOUDFLARE_SEND_METRICS: 'false' },
  stdout: 'inherit',
  stderr: 'inherit',
});
process.exit(await build.exited);
