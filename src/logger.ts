import pino from 'pino';
import { config } from './config';

const sensitiveKeys = new Set([
  'authorization', 'token', 'otp', 'password', 'password_hash', 'current_password',
  'new_password', 'email', 'phone', 'patient', 'patient_name', 'body', 'payload',
]);

export function redactWorkerLog(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redactWorkerLog);
  if (!value || typeof value !== 'object') return value;
  if (value instanceof Date) return value.toISOString();
  return Object.fromEntries(Object.entries(value).map(([key, entry]) => [
    key, sensitiveKeys.has(key.toLowerCase()) ? '[REDACTED]' : redactWorkerLog(entry),
  ]));
}

export const logger = pino({
  level: config.logLevel,
  // Pino's Workers/browser build does not implement Node's redact option.
  browser: {
    asObject: true,
    write: (entry) => console.log(JSON.stringify(redactWorkerLog(entry))),
  },
  redact: {
    paths: [
      'authorization',
      'req.headers.authorization',
      'token',
      'otp',
      'password',
      'password_hash',
      'current_password',
      'new_password',
      'email',
      'phone',
      'patient',
      'patient_name',
      'body',
      'payload',
    ],
    censor: '[REDACTED]',
  },
});

export function errorDiagnostics(error: Error) {
  const code = (error as Error & { code?: unknown }).code;
  return {
    errorType: error.name,
    errorCode: typeof code === 'string' && /^[A-Z0-9]{5}$/.test(code) ? code : undefined,
    // Error messages and PostgreSQL details can contain patient data; keep only frames.
    stack: error.stack
      ?.split('\n')
      .filter((line) => /^\s+at /.test(line))
      .join('\n'),
  };
}
