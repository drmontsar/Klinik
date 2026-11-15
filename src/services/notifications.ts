import { getNotificationForUser, listNotifications, listenNotifications } from '../db/queries/notifications';
import { isWorker } from '../runtime';
import { errorDiagnostics, logger } from '../logger';

export async function subscribeNotifications(
  userId: string,
  deliver: (notification: unknown) => Promise<void>,
) {
  // Neon transaction pooling cannot hold LISTEN sessions. Workers poll inside
  // a short-lived SSE request; the Bun server keeps its existing LISTEN path.
  if (isWorker) {
    const seen = new Set((await listNotifications({ user_id: userId, limit: 100 })).map(row => row.id));
    let stopped = false;
    let pending = Promise.resolve();
    const timer = setInterval(() => {
      pending = pending.then(async () => {
        if (stopped) return;
        for (const row of (await listNotifications({ user_id: userId, limit: 100 })).reverse()) {
          if (stopped) return;
          if (!seen.has(row.id)) {
            await deliver(row);
            seen.add(row.id);
          }
        }
      }).catch((error: Error) => logger.warn(errorDiagnostics(error), 'notification delivery failed'));
    }, 5_000);
    return async () => { stopped = true; clearInterval(timer); await pending; };
  }
  const subscription = await listenNotifications(userId, (payload) => {
    const send = async () => {
      const { id } = JSON.parse(payload) as { id: string };
      const notification = await getNotificationForUser(id, userId);
      if (notification) await deliver(notification);
    };
    void send().catch((error: Error) =>
      logger.warn(errorDiagnostics(error), 'notification delivery failed'),
    );
  });
  return () => subscription.unlisten();
}
