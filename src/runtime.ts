// Replaced by the Worker bundler; remains false in Bun and database scripts.
declare const __WORKERS__: boolean;
export const isWorker = typeof __WORKERS__ !== 'undefined' && __WORKERS__;
