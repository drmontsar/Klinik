import { app } from './app';
import { createWorkerDatabase, withDatabase } from './db';

export type { AppType } from './app';
type WorkerContext = NonNullable<Parameters<typeof app.fetch>[2]>;

export default {
  async fetch(request: Request, env?: Record<string, unknown>, context?: WorkerContext) {
    const connection = createWorkerDatabase();
    let closed = false;
    const close = () => {
      if (closed) return;
      closed = true;
      const promise = connection.end({ timeout: 1 });
      if (context) context.waitUntil(promise);
      else void promise.catch(() => {});
    };
    try {
      return await withDatabase(connection, async () => {
        const response = await app.fetch(request, env, context);
        if (!response.body || !response.headers.get('content-type')?.startsWith('text/event-stream')) {
          close();
          return response;
        }
        // Keep streaming queries in this request's scope until disconnect, never across requests.
        const reader = response.body.getReader();
        const body = new ReadableStream<Uint8Array>({
          async pull(controller) {
            try {
              const result = await withDatabase(connection, () => reader.read());
              if (result.done) { close(); controller.close(); }
              else controller.enqueue(result.value);
            } catch (error) { close(); controller.error(error); }
          },
          async cancel(reason) {
            try { await reader.cancel(reason); } finally { close(); }
          },
        });
        return new Response(body, response);
      });
    } catch (error) {
      close();
      throw error;
    }
  },
};
