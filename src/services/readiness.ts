import { listAppliedMigrations } from '../db/queries/health';
import migrationNames from '../db/migration-names.json';

export async function isReady() {
  try {
    const applied = await listAppliedMigrations();
    const names = new Set(applied.map((row) => row.name));
    return migrationNames.every((name) => names.has(name));
  } catch {
    return false;
  }
}
