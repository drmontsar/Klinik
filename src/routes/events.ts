import { Hono } from 'hono';
import { streamSSE } from 'hono/streaming';
import { config } from '../config';
import { isWorker } from '../runtime';
import { getUserById, type User } from '../db/queries/users';
import { subscribeNotifications } from '../services/notifications';

type Variables = { user: User };
export const eventsRouter = new Hono<{ Variables: Variables }>();

eventsRouter.get('/', (c) => {
  // SSE owns its heartbeat; keep Bun's normal idle limit for other requests.
  if (!isWorker) {
    const env = (c.env ?? {}) as Record<string, unknown>;
    const server = ('server' in env ? env.server : env) as { timeout?: (request: Request, seconds: number) => void };
    server?.timeout?.(c.req.raw, 0);
  }
  return streamSSE(c, async (stream) => {
    let aborted = false;
    const done = new Promise<void>((resolve) =>
      stream.onAbort(() => {
        aborted = true;
        resolve();
      }),
    );
    const userId = c.get('user').id;
    const unsubscribe = await subscribeNotifications(userId, async (notification) => {
      const user = await getUserById(userId);
      if (!user || user.disabled_at || (config.accessControlEnabled && !user.app_access_enabled)) {
        stream.abort();
        return;
      }
      await stream.writeSSE({ data: JSON.stringify(notification) });
    });
    let heartbeat: ReturnType<typeof setInterval> | undefined;
    let expiry: ReturnType<typeof setTimeout> | undefined;
    try {
      if (aborted) return;
      if (isWorker) {
        await stream.writeSSE({ event: 'ping', data: String(Date.now()) });
        // Reconnect periodically rather than holding pooled DB sockets indefinitely.
        expiry = setTimeout(() => stream.abort(), 20_000);
      }
      heartbeat = setInterval(() => {
        void stream
          .writeSSE({ event: 'ping', data: String(Date.now()) })
          .catch(() => stream.abort());
      }, 25_000);
      await done;
    } finally {
      clearInterval(heartbeat);
      clearTimeout(expiry);
      await unsubscribe();
    }
  });
});
