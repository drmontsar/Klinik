import type { TransactionSql } from 'postgres';
import { db } from '../index';
import { createNotification } from './notifications';
import type { User } from './users';

export type ChatMessage = {
  id: string;
  patient_id: string;
  author_id: string;
  author_name: string;
  body: string;
  revision: number;
  created_at: Date;
  edited_at: Date | null;
  mentions: { id: string; name: string }[];
  attachments: Omit<Attachment, 'storage_key'>[];
};

export type Attachment = {
  id: string;
  message_id: string;
  storage_key: string;
  filename: string;
  content_type: string;
  byte_size: number;
  created_at: Date;
};

type BaseMessage = Omit<ChatMessage, 'mentions' | 'attachments'>;

async function enrich(rows: BaseMessage[]): Promise<ChatMessage[]> {
  if (!rows.length) return [];
  const ids = rows.map((row) => row.id);
  const [mentions, attachments] = await Promise.all([
    db<{ message_id: string; id: string; name: string }[]>`
      SELECT m.message_id, u.id, u.name FROM clinical.patient_chat_mentions m
      JOIN staff.users u ON u.id = m.user_id WHERE m.message_id = ANY(${ids}::uuid[])
    `,
    db<Attachment[]>`
      SELECT * FROM clinical.patient_chat_attachments WHERE message_id = ANY(${ids}::uuid[])
      ORDER BY created_at, id
    `,
  ]);
  return rows.map((row) => ({
    ...row,
    mentions: mentions.filter((m) => m.message_id === row.id).map(({ id, name }) => ({ id, name })),
    attachments: attachments.filter((a) => a.message_id === row.id).map(({ storage_key: _key, ...publicFields }) => publicFields),
  }));
}

export function searchMentionCandidates(query: string, after?: string): Promise<User[]> {
  const search = query.replace(/[\\%_]/g, '\\$&');
  return db<User[]>`
    SELECT u.* FROM staff.users u WHERE u.disabled_at IS NULL
      AND u.name ILIKE ${`%${search}%`}
      AND (${after ?? null}::uuid IS NULL OR (u.name, u.id) > (
        SELECT name, id FROM staff.users WHERE id = ${after ?? null}
      ))
    ORDER BY u.name, u.id LIMIT 50
  `;
}

export async function listChat(patientId: string, before: string | undefined, limit: number): Promise<ChatMessage[]> {
  const rows = await db<BaseMessage[]>`
    SELECT m.*, u.name AS author_name FROM clinical.patient_chat_messages m
    JOIN staff.users u ON u.id = m.author_id
    WHERE m.patient_id = ${patientId}
      AND (${before ?? null}::uuid IS NULL OR (m.created_at, m.id) < (
        SELECT created_at, id FROM clinical.patient_chat_messages WHERE id = ${before ?? null} AND patient_id = ${patientId}
      ))
    ORDER BY m.created_at DESC, m.id DESC LIMIT ${limit}
  `;
  return enrich(rows);
}

export async function getChatMessage(patientId: string, id: string): Promise<ChatMessage | null> {
  const rows = await db<BaseMessage[]>`
    SELECT m.*, u.name AS author_name FROM clinical.patient_chat_messages m
    JOIN staff.users u ON u.id = m.author_id
    WHERE m.patient_id = ${patientId} AND m.id = ${id}
  `;
  return (await enrich(rows))[0] ?? null;
}

async function notifyMentions(
  tx: TransactionSql,
  mentionIds: string[], messageId: string, patientId: string, authorId: string,
) {
  for (const userId of mentionIds) {
    if (userId === authorId) continue;
    await createNotification({
      user_id: userId,
      type: 'patient_chat_mention',
      // Never place clinical text, patient identity, or file names in notification payloads.
      payload: { patient_id: patientId, message_id: messageId, author_id: authorId },
    }, tx);
  }
}

export async function createChatMessage(patientId: string, authorId: string, body: string, mentionIds: string[]) {
  const id = await db.begin(async (tx) => {
    const [row] = await tx<{ id: string }[]>`
      INSERT INTO clinical.patient_chat_messages (patient_id, author_id, body)
      VALUES (${patientId}, ${authorId}, ${body}) RETURNING id
    `;
    for (const userId of mentionIds) await tx`
      INSERT INTO clinical.patient_chat_mentions (message_id, user_id) VALUES (${row.id}, ${userId})
    `;
    await notifyMentions(tx, mentionIds, row.id, patientId, authorId);
    return row.id;
  });
  return getChatMessage(patientId, id);
}

export async function editChatMessage(
  patientId: string, id: string, authorId: string, body: string, mentionIds: string[], expectedRevision: number,
): Promise<'missing' | 'forbidden' | 'expired' | 'conflict' | ChatMessage | null> {
  const result = await db.begin(async (tx) => {
    const [row] = await tx<{
      author_id: string; body: string; revision: number; created_at: Date;
    }[]>`
      SELECT author_id, body, revision, created_at FROM clinical.patient_chat_messages
      WHERE id = ${id} AND patient_id = ${patientId} FOR UPDATE
    `;
    if (!row) return 'missing' as const;
    if (row.author_id !== authorId) return 'forbidden' as const;
    if (Date.now() - new Date(row.created_at).getTime() > 15 * 60_000) return 'expired' as const;
    if (row.revision !== expectedRevision) return 'conflict' as const;
    const previous = await tx<{ user_id: string }[]>`
      SELECT user_id FROM clinical.patient_chat_mentions WHERE message_id = ${id}
    `;
    const previousIds = previous.map((m) => m.user_id);
    await tx`
      INSERT INTO clinical.patient_chat_revisions (message_id, revision, body, mention_ids)
      VALUES (${id}, ${row.revision}, ${row.body}, ${previousIds}::uuid[])
    `;
    await tx`
      UPDATE clinical.patient_chat_messages
      SET body = ${body}, revision = revision + 1, edited_at = now() WHERE id = ${id}
    `;
    await tx`DELETE FROM clinical.patient_chat_mentions WHERE message_id = ${id}`;
    for (const userId of mentionIds) await tx`
      INSERT INTO clinical.patient_chat_mentions (message_id, user_id) VALUES (${id}, ${userId})
    `;
    await notifyMentions(tx, mentionIds.filter((m) => !previousIds.includes(m)), id, patientId, authorId);
    return 'updated' as const;
  });
  return result === 'updated' ? getChatMessage(patientId, id) : result;
}

export function listChatRevisions(patientId: string, id: string) {
  return db`
    SELECT r.revision, r.body, r.mention_ids, r.superseded_at
    FROM clinical.patient_chat_revisions r
    JOIN clinical.patient_chat_messages m ON m.id = r.message_id
    WHERE m.patient_id = ${patientId} AND m.id = ${id}
    ORDER BY r.revision
  `;
}

export async function canAttach(patientId: string, id: string, authorId: string) {
  const [row] = await db`
    SELECT 1 FROM clinical.patient_chat_messages
    WHERE patient_id = ${patientId} AND id = ${id} AND author_id = ${authorId}
      AND created_at > now() - interval '15 minutes'
  `;
  return Boolean(row);
}

export async function addChatAttachment(patientId: string, messageId: string, authorId: string,
  data: { storage_key: string; filename: string; content_type: string; byte_size: number },
): Promise<Attachment | null> {
  const [row] = await db<Attachment[]>`
    INSERT INTO clinical.patient_chat_attachments (message_id, storage_key, filename, content_type, byte_size)
    SELECT id, ${data.storage_key}, ${data.filename}, ${data.content_type}, ${data.byte_size}
    FROM clinical.patient_chat_messages
    WHERE patient_id = ${patientId} AND id = ${messageId} AND author_id = ${authorId}
      AND created_at > now() - interval '15 minutes'
    RETURNING *
  `;
  return row ?? null;
}

export async function getChatAttachment(patientId: string, id: string): Promise<Attachment | null> {
  const [row] = await db<Attachment[]>`
    SELECT a.* FROM clinical.patient_chat_attachments a
    JOIN clinical.patient_chat_messages m ON m.id = a.message_id
    WHERE m.patient_id = ${patientId} AND a.id = ${id}
  `;
  return row ?? null;
}
