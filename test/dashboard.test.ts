import { expect, test } from 'bun:test';
import { dashboardRouter } from '../src/routes/dashboard';

const id = '11000000-0000-4000-8000-000000000001';

test.each([
  ['missing ids', {}],
  ['empty ids', { ids: [] }],
  ['invalid UUID', { ids: ['not-a-uuid'] }],
  ['non-array ids', { ids: id }],
  ['non-string UUID', { ids: [42] }],
  ['more than 100 ids', { ids: Array(101).fill(id) }],
])('POST census rejects %s', async (_label, body) => {
  const response = await dashboardRouter.request('/census-cards', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  expect(response.status).toBe(400);
});

test('POST census rejects query-only requests and malformed JSON', async () => {
  for (const body of ['', '{']) {
    const response = await dashboardRouter.request(`/census-cards?ids=${id}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body,
    });
    expect(response.status).toBe(400);
  }
});
