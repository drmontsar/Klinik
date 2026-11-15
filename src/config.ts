// Bun loads .env locally. Workers populate process.env from dashboard bindings
// with nodejs_compat_populate_process_env; never read deployment secrets from files.

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL is not set');

const accessControl = process.env.ACCESS_CONTROL ?? 'false';
if (accessControl !== 'true' && accessControl !== 'false') {
  throw new Error('ACCESS_CONTROL must be true or false');
}

const logLevel = process.env.LOG_LEVEL ?? 'info';
if (logLevel !== 'info' && logLevel !== 'debug') {
  throw new Error('LOG_LEVEL must be info or debug');
}

const nodeEnv = process.env.NODE_ENV ?? 'development';
const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean)
  : nodeEnv === 'production'
    ? []
    : ['http://localhost:3000', 'http://localhost:5173'];

export const config = {
  databaseUrl,
  port: Number(process.env.PORT) || 3001,
  nodeEnv,
  logLevel,
  corsOrigins,
  accessControlEnabled: accessControl === 'true',
};
