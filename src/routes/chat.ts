import { randomUUID } from 'node:crypto';
import { OpenAPIHono } from '@hono/zod-openapi';
import { z } from 'zod';
import { canAccessPatient } from '../db/queries/access';
import {
  addChatAttachment, canAttach, createChatMessage, editChatMessage, getChatAttachment,
  getChatMessage, listChat, listChatRevisions, searchMentionCandidates,
} from '../db/queries/chat';
import { getUserById, type User } from '../db/queries/users';
import { deleteAttachment, detectAttachmentType, getAttachment, putAttachment, storageReady } from '../services/chat_storage';

const uuid = z.string().uuid();
const messageInput = z.object({
  text: z.string().trim().min(1).max(4000),
  mention_ids: z.array(uuid).max(10).default([]),
});
const editInput = messageInput.extend({ expected_revision: z.number().int().positive() });
const maxBytes = 10 * 1024 * 1024;

type Variables = { user: User };
export const chatRouter = new OpenAPIHono<{ Variables: Variables }>();

async function authorized(user: User, patientId: string) {
  return canAccessPatient(user, patientId);
}

async function validMentions(patientId: string, mentionIds: string[]) {
  if (new Set(mentionIds).size !== mentionIds.length) return false;
  for (const id of mentionIds) {
    const user = await getUserById(id);
    if (!user || user.disabled_at || !(await canAccessPatient(user, patientId))) return false;
  }
  return true;
}

chatRouter.get('/:patientId/chat', async (c) => {
  const patientId = c.req.param('patientId');
  const query = z.object({ before: uuid.optional(), limit: z.coerce.number().int().min(1).max(100).default(50) })
    .safeParse({ before: c.req.query('before'), limit: c.req.query('limit') ?? 50 });
  if (!uuid.safeParse(patientId).success || !query.success) return c.json({ error: 'invalid request' }, 400);
  if (!(await authorized(c.get('user'), patientId))) return c.json({ error: 'patient not found' }, 404);
  return c.json(await listChat(patientId, query.data.before, query.data.limit));
});

chatRouter.get('/:patientId/chat/mention-candidates', async (c) => {
  const patientId = c.req.param('patientId');
  const query = z.object({
    q: z.string().trim().max(64).default(''),
    after: uuid.optional(),
    limit: z.coerce.number().int().min(1).max(50).default(10),
  }).safeParse({ q: c.req.query('q'), after: c.req.query('after'), limit: c.req.query('limit') });
  if (!uuid.safeParse(patientId).success || !query.success) return c.json({ error: 'invalid request' }, 400);
  if (!(await authorized(c.get('user'), patientId))) return c.json({ error: 'patient not found' }, 404);
  const matches = [];
  let after = query.data.after;
  // Filter before counting the page: inaccessible staff must not hide eligible matches.
  while (matches.length < query.data.limit) {
    const users = await searchMentionCandidates(query.data.q, after);
    for (const user of users) {
      after = user.id;
      if (await canAccessPatient(user, patientId)) {
        matches.push({ id: user.id, name: user.name, job_role: user.job_role });
        if (matches.length === query.data.limit) break;
      }
    }
    if (users.length < 50) break;
  }
  return c.json(matches);
});

chatRouter.post('/:patientId/chat', async (c) => {
  const patientId = c.req.param('patientId');
  if (!uuid.safeParse(patientId).success) return c.json({ error: 'invalid patient id' }, 400);
  if (!(await authorized(c.get('user'), patientId))) return c.json({ error: 'patient not found' }, 404);
  const input = messageInput.safeParse(await c.req.json().catch(() => null));
  if (!input.success) return c.json({ error: 'invalid message' }, 400);
  if (!(await validMentions(patientId, input.data.mention_ids))) return c.json({ error: 'invalid or inaccessible mention' }, 422);
  const message = await createChatMessage(patientId, c.get('user').id, input.data.text, input.data.mention_ids);
  return c.json(message, 201);
});

chatRouter.get('/:patientId/chat/:id/revisions', async (c) => {
  const { patientId, id } = c.req.param();
  if (!uuid.safeParse(patientId).success || !uuid.safeParse(id).success) return c.json({ error: 'invalid id' }, 400);
  if (!(await authorized(c.get('user'), patientId))) return c.json({ error: 'patient not found' }, 404);
  if (!(await getChatMessage(patientId, id))) return c.json({ error: 'message not found' }, 404);
  return c.json(await listChatRevisions(patientId, id));
});

chatRouter.patch('/:patientId/chat/:id', async (c) => {
  const { patientId, id } = c.req.param();
  if (!uuid.safeParse(patientId).success || !uuid.safeParse(id).success) return c.json({ error: 'invalid id' }, 400);
  if (!(await authorized(c.get('user'), patientId))) return c.json({ error: 'patient not found' }, 404);
  const input = editInput.safeParse(await c.req.json().catch(() => null));
  if (!input.success) return c.json({ error: 'invalid edit' }, 400);
  if (!(await validMentions(patientId, input.data.mention_ids))) return c.json({ error: 'invalid or inaccessible mention' }, 422);
  const result = await editChatMessage(patientId, id, c.get('user').id, input.data.text,
    input.data.mention_ids, input.data.expected_revision);
  if (result === 'missing') return c.json({ error: 'message not found' }, 404);
  if (result === 'forbidden') return c.json({ error: 'only the author can edit' }, 403);
  if (result === 'expired' || result === 'conflict') return c.json({ error: result }, 409);
  return c.json(result, 200);
});

chatRouter.post('/:patientId/chat/:id/attachments', async (c) => {
  const { patientId, id } = c.req.param();
  if (!uuid.safeParse(patientId).success || !uuid.safeParse(id).success) return c.json({ error: 'invalid id' }, 400);
  if (!(await authorized(c.get('user'), patientId))) return c.json({ error: 'patient not found' }, 404);
  if (!(await canAttach(patientId, id, c.get('user').id))) return c.json({ error: 'message not editable' }, 403);
  if (!storageReady()) return c.json({ error: 'attachment storage not configured' }, 503);
  const contentLength = Number(c.req.header('content-length'));
  if (!Number.isSafeInteger(contentLength) || contentLength < 1 || contentLength > maxBytes + 256 * 1024) {
    return c.json({ error: 'file too large or content-length missing' }, 413);
  }
  const form = await c.req.formData().catch(() => null);
  const file = form?.get('file');
  if (!(file instanceof File) || file.size < 1 || file.size > maxBytes) return c.json({ error: 'invalid file size' }, 400);
  const bytes = new Uint8Array(await file.arrayBuffer());
  const contentType = detectAttachmentType(bytes);
  if (!contentType) return c.json({ error: 'only JPEG, PNG, WebP and PDF files are allowed' }, 415);
  const key = `chat/${randomUUID()}`;
  const filename = file.name.replace(/[\\/\x00-\x1f\x7f]/g, '_').slice(0, 120) || 'attachment';
  await putAttachment(key, contentType, bytes);
  try {
    const attachment = await addChatAttachment(patientId, id, c.get('user').id, {
      storage_key: key, filename, content_type: contentType, byte_size: bytes.length,
    });
    if (attachment) return c.json({ id: attachment.id, message_id: attachment.message_id,
      filename, content_type: contentType, byte_size: bytes.length, created_at: attachment.created_at }, 201);
    await deleteAttachment(key);
    return c.json({ error: 'message no longer editable' }, 409);
  } catch (error) {
    await deleteAttachment(key).catch(() => {});
    throw error;
  }
});

chatRouter.get('/:patientId/chat/attachments/:id', async (c) => {
  const { patientId, id } = c.req.param();
  if (!uuid.safeParse(patientId).success || !uuid.safeParse(id).success) return c.json({ error: 'invalid id' }, 400);
  if (!(await authorized(c.get('user'), patientId))) return c.json({ error: 'patient not found' }, 404);
  const attachment = await getChatAttachment(patientId, id);
  if (!attachment) return c.json({ error: 'attachment not found' }, 404);
  const bytes = await getAttachment(attachment.storage_key);
  const filename = encodeURIComponent(attachment.filename)
    .replace(/['()*]/g, (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`);
  return new Response(new Blob([Uint8Array.from(bytes)]), { headers: {
    'Content-Type': attachment.content_type,
    'Content-Disposition': `attachment; filename="attachment"; filename*=UTF-8''${filename}`,
    'Content-Length': String(attachment.byte_size),
    'Cache-Control': 'private, no-store',
    'X-Content-Type-Options': 'nosniff',
  } });
});
