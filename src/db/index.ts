import { AsyncLocalStorage } from 'node:async_hooks';
import postgres from 'postgres';
import { config } from '../config';
import { isWorker } from '../runtime';

export type Database = ReturnType<typeof postgres>;
const requestDatabase = new AsyncLocalStorage<Database>();
const localDatabase = isWorker ? undefined : postgres(config.databaseUrl);

export function withDatabase<T>(connection: Database, callback: () => T): T {
  return requestDatabase.run(connection, callback);
}

export function createWorkerDatabase(): Database {
  return postgres(config.databaseUrl, {
    max: 1,
    prepare: false,
    fetch_types: false,
    connect_timeout: 10,
  });
}

function currentDatabase(): Database {
  const connection = requestDatabase.getStore() ?? localDatabase;
  if (!connection) throw new Error('Database access requires a Worker request context');
  return connection;
}

// Preserve the existing query/transaction API while isolating Worker sockets per request.
export const db = new Proxy((() => {}) as unknown as Database, {
  apply(_target, thisArg, args) {
    return Reflect.apply(currentDatabase(), thisArg, args);
  },
  get(_target, property) {
    const connection = currentDatabase();
    const value = Reflect.get(connection, property);
    return typeof value === 'function' ? value.bind(connection) : value;
  },
});
