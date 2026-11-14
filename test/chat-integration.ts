// Run against seeded local data + SeaweedFS: bun test/chat-integration.ts
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { app } from '../src/app';
import { db } from '../src/db';
import { deleteAttachment } from '../src/services/chat_storage';

const root = '/patients';
let messageId: string | undefined;
let attachmentKey: string | undefined;
const tokens: string[] = [];
const unassignedStaff = Array.from({ length: 55 }, () => randomUUID());

async function login(email: string) {
  const response = await app.request('/auth/login', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password: 'password' }),
  });
  assert.equal(response.status, 200, `${email}: ${await response.clone().text()}`);
  const { token, user } = await response.json() as { token: string; user: { id: string } };
  tokens.push(token);
  return { token, user };
}

async function request(path: string, token: string, method = 'GET', body?: unknown) {
  return app.request(path, {
    method,
    headers: { authorization: `Bearer ${token}`, ...(body ? { 'content-type': 'application/json' } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
}

try {
  const [author, recipient] = await Promise.all([
    login('bruce+wayne@klinik.com'), login('priya+shah@klinik.com'),
  ]);
  const [patient] = await db<{ patient_id: string }[]>`
    SELECT a.patient_id FROM clinical.staff_assignments s
    JOIN clinical.admissions a ON a.id = s.admission_id
    WHERE s.user_id = ${recipient.user.id} AND s.ends_at IS NULL LIMIT 1
  `;
  assert.ok(patient, 'Seed local admissions with a Priya Shah assignment first');
  const path = `${root}/${patient.patient_id}/chat`;
  assert.equal((await app.request(path)).status, 401);

  const candidates = await request(`${path}/mention-candidates?q=Priya`, author.token);
  assert.equal(candidates.status, 200);
  assert.ok((await candidates.json() as { id: string }[]).some((c) => c.id === recipient.user.id));

  // A bare @ must find eligible staff even beyond a whole batch of inaccessible users.
  for (const id of unassignedStaff) {
    await db`INSERT INTO staff.users (id, name, role, job_role)
      VALUES (${id}, 'A Chat Unassigned', 'nurse', 'staff_nurse')`;
  }
  const allPeople = await (await request(`${path}/mention-candidates?q=&limit=50`, author.token)).json() as { id: string }[];
  assert.ok(allPeople.some((person) => person.id === recipient.user.id));
  assert.ok(!allPeople.some((person) => unassignedStaff.includes(person.id)));
  const first = await (await request(`${path}/mention-candidates?limit=1`, author.token)).json() as { id: string }[];
  assert.equal(first.length, 1);
  const next = await (await request(`${path}/mention-candidates?limit=1&after=${first[0].id}`, author.token)).json() as { id: string }[];
  assert.equal(next.length, 1);
  assert.notEqual(next[0].id, first[0].id);
  assert.equal((await request(`${path}/mention-candidates?after=invalid`, author.token)).status, 400);
  assert.equal((await request(`${path}/mention-candidates?limit=51`, author.token)).status, 400);

  const created = await request(path, author.token, 'POST', {
    text: '@Priya please review this report', mention_ids: [recipient.user.id],
  });
  assert.equal(created.status, 201, await created.clone().text());
  const message = await created.json() as { id: string; revision: number; mentions: { id: string }[] };
  messageId = message.id;
  assert.equal(message.revision, 1);
  assert.equal(message.mentions[0]?.id, recipient.user.id);
  assert.equal((await request(path, recipient.token)).status, 200);
  assert.equal((await request(path, author.token, 'POST', { text: 'Invalid tag', mention_ids: [randomUUID()] })).status, 422);
  const [unassigned] = await db<{ patient_id: string }[]>`
    SELECT patient_id FROM clinical.admissions WHERE patient_id <> ${patient.patient_id}
      AND patient_id NOT IN (
        SELECT a.patient_id FROM clinical.admissions a JOIN clinical.staff_assignments s ON s.admission_id = a.id
        WHERE s.user_id = ${recipient.user.id}
      ) LIMIT 1
  `;
  if (unassigned) assert.equal((await request(`${root}/${unassigned.patient_id}/chat`, recipient.token)).status, 404);
  assert.equal((await request(`${path}/${messageId}`, recipient.token, 'PATCH', {
    text: 'Changed', mention_ids: [], expected_revision: 1,
  })).status, 403);
  const [notification] = await db<{ count: number }[]>`
    SELECT count(*)::integer AS count FROM clinical.notifications
    WHERE type = 'patient_chat_mention' AND user_id = ${recipient.user.id}
      AND payload->>'message_id' = ${messageId}
  `;
  assert.equal(notification.count, 1);

  const boundary = 'klinik-chat-fixture';
  const file = new Uint8Array(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="report.pdf"\r\nContent-Type: application/pdf\r\n\r\n%PDF-1.4\nfixture\r\n--${boundary}--\r\n`));
  const uploaded = await app.request(`${path}/${messageId}/attachments`, {
    method: 'POST', headers: { authorization: `Bearer ${author.token}`,
      'content-type': `multipart/form-data; boundary=${boundary}`, 'content-length': String(file.byteLength) },
    body: new Blob([file]),
  });
  assert.equal(uploaded.status, 201, await uploaded.clone().text());
  const attachment = await uploaded.json() as { id: string };
  const [metadata] = await db<{ storage_key: string }[]>`
    SELECT storage_key FROM clinical.patient_chat_attachments WHERE id = ${attachment.id}
  `;
  attachmentKey = metadata.storage_key;
  const listed = await request(path, author.token);
  assert.ok(!(JSON.stringify(await listed.json()).includes(metadata.storage_key)), 'Never expose object-storage keys');
  const download = await request(`${path}/attachments/${attachment.id}`, recipient.token);
  assert.equal(download.status, 200);
  assert.match(download.headers.get('content-disposition') ?? '', /attachment/);
  assert.match(await download.text(), /%PDF-1.4/);

  const edited = await request(`${path}/${messageId}`, author.token, 'PATCH', {
    text: '@Priya updated report attached', mention_ids: [recipient.user.id], expected_revision: 1,
  });
  assert.equal(edited.status, 200, await edited.clone().text());
  assert.equal((await edited.json() as { revision: number; edited_at: string }).revision, 2);
  const revisions = await request(`${path}/${messageId}/revisions`, recipient.token);
  assert.equal(revisions.status, 200);
  assert.equal((await revisions.json() as { body: string }[])[0]?.body, '@Priya please review this report');
  const [arjun] = await db<{ id: string }[]>`SELECT id FROM staff.users WHERE name = ${'Dr. Arjun Mehta'}`;
  const newMention = await request(`${path}/${messageId}`, author.token, 'PATCH', {
    text: '@Priya @Arjun please review', mention_ids: [recipient.user.id, arjun.id], expected_revision: 2,
  });
  assert.equal(newMention.status, 200, await newMention.clone().text());
  const [newNotification] = await db<{ count: number }[]>`
    SELECT count(*)::integer AS count FROM clinical.notifications
    WHERE type = 'patient_chat_mention' AND user_id = ${arjun.id}
      AND payload->>'message_id' = ${messageId}
  `;
  assert.equal(newNotification.count, 1, 'adding a mention on edit notifies only the new recipient');
  assert.equal((await request(`${path}/${messageId}`, author.token, 'PATCH', {
    text: 'stale update', mention_ids: [], expected_revision: 1,
  })).status, 409);
  const [notificationsAfter] = await db<{ count: number }[]>`
    SELECT count(*)::integer AS count FROM clinical.notifications
    WHERE type = 'patient_chat_mention' AND user_id = ${recipient.user.id}
      AND payload->>'message_id' = ${messageId}
  `;
  assert.equal(notificationsAfter.count, 1, 'editing does not re-notify existing mentions');
  console.log('Patient chat: bare @, paginated eligible staff, mentions, access, audited edits, PDF upload/download passed');
} finally {
  if (messageId) {
    await db`DELETE FROM clinical.notifications WHERE type = 'patient_chat_mention' AND payload->>'message_id' = ${messageId}`;
    await db`DELETE FROM clinical.patient_chat_attachments WHERE message_id = ${messageId}`;
    await db`DELETE FROM clinical.patient_chat_revisions WHERE message_id = ${messageId}`;
    await db`DELETE FROM clinical.patient_chat_mentions WHERE message_id = ${messageId}`;
    await db`DELETE FROM clinical.patient_chat_messages WHERE id = ${messageId}`;
  }
  if (attachmentKey) await deleteAttachment(attachmentKey);
  for (const token of tokens) await app.request('/auth/session', { method: 'DELETE', headers: { authorization: `Bearer ${token}` } });
  await db`DELETE FROM staff.users WHERE id IN ${db(unassignedStaff)}`;
  await db.end();
}
