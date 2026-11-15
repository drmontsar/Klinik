import { calculateNews2, NEWS2_RULE_VERSION } from '../src/clinical/news2';
import { config } from '../src/config';
import { db } from '../src/db';

const url = new URL(config.databaseUrl);
if (config.nodeEnv === 'production' || !['localhost', '127.0.0.1', '[::1]', '::1'].includes(url.hostname) || url.port !== '5434' || url.pathname !== '/klinik') {
  throw new Error('QA vitals may only be seeded into the local QA database on port 5434');
}

try {
  const count = await db.begin(async (tx) => {
    const admissions = await tx<{ id: string; recorded_by: string; admitted_at: Date }[]>`
      SELECT a.id, COALESCE(a.assigned_to, '11000000-0000-4000-8000-000000000003'::uuid) AS recorded_by, a.admitted_at
      FROM clinical.admissions a
      WHERE a.status = 'active' AND a.admitted_at <= now()
        AND NOT EXISTS (SELECT 1 FROM clinical.vitals v WHERE v.admission_id = a.id)
      ORDER BY a.id
    `;
    for (const [index, admission] of admissions.entries()) {
      for (let reading = 0; reading < 3; reading++) {
        const input = {
          resp_rate: 14 + ((index + reading) % 7),
          spo2: 95 + ((index + reading) % 5),
          on_supplemental_oxygen: false,
          temperature: 36.5 + ((index + reading) % 8) / 10,
          bp_systolic: 110 + ((index * 7 + reading * 3) % 35),
          heart_rate: 70 + ((index * 3 + reading * 2) % 27),
          consciousness: 'alert' as const,
        };
        const score = calculateNews2(input);
        const recordedAt = new Date(Math.max(admission.admitted_at.getTime(), Date.now() - (3 - reading) * 60 * 60 * 1000));
        await tx`INSERT INTO clinical.vitals
          (admission_id, recorded_by, recorded_at, bp_systolic, bp_diastolic, heart_rate, spo2, resp_rate, temperature, glucose,
           on_supplemental_oxygen, consciousness, news2_score, news2_escalation, news2_component_scores, news2_rule_version)
          VALUES (${admission.id}, ${admission.recorded_by}, ${recordedAt}, ${input.bp_systolic}, ${70 + (index % 15)},
            ${input.heart_rate}, ${input.spo2}, ${input.resp_rate}, ${input.temperature}, ${85 + (index % 35)},
            ${input.on_supplemental_oxygen}, ${input.consciousness}, ${score.score}, ${score.escalation},
            ${tx.json(score.component_scores)}, ${NEWS2_RULE_VERSION})`;
      }
    }
    return admissions.length;
  });
  console.log(`Added fictional vital histories to ${count} admissions.`);
} finally {
  await db.end();
}
