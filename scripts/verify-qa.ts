import assert from 'node:assert/strict';
import { config } from '../src/config';
import { db } from '../src/db';
import { calculateNews2, NEWS2_RULE_VERSION, type News2Input } from '../src/clinical/news2';
import { AssessmentBody } from '../src/contracts/nursing';
import { buildNursingCarePlan } from '../src/clinical/nursing';

const url=new URL(config.databaseUrl);
assert(['development','test'].includes(config.nodeEnv) && ['localhost','127.0.0.1','[::1]','::1'].includes(url.hostname) && url.port==='5434' && url.pathname==='/klinik','Only local QA may be verified');
const output:string[]=[];
let server:ReturnType<typeof Bun.serve>|undefined;
let token:string|undefined;
try {
  const [counts]=await db`SELECT (SELECT count(*)::int FROM clinical.patients) AS patients,(SELECT count(*)::int FROM clinical.admissions WHERE status='active') AS admissions,(SELECT count(*)::int FROM clinical.vitals) AS vitals,(SELECT count(*)::int FROM clinical.notes) AS notes,(SELECT count(*)::int FROM clinical.orders) AS orders,(SELECT count(*)::int FROM opd.visits) AS outpatient_visits`;
  assert.equal(counts.patients,54);
  assert.equal(counts.admissions,40);
  assert.equal(counts.vitals,240);
  for(const table of ['vitals','initial_assessments','diagnoses','notes','nursing_assessments','nursing_care_plan_items','nursing_recurring_tasks','patient_weights','fluid_entries','medication_schedules','observation_schedules','admission_checklist_items','consultant_rounds','contingencies','shift_events']) {
    const [missing]=await db`SELECT count(*)::int AS count FROM clinical.admissions a WHERE a.status='active' AND NOT EXISTS (SELECT 1 FROM ${db(`clinical.${table}`)} t WHERE t.admission_id=a.id)`;
    assert.equal(missing.count,0,`${table}: admissions missing data`);
  }
  const [names]=await db`SELECT count(*)::int AS count FROM clinical.patients WHERE name ~* '^(patient|test|demo)[ _-]*[0-9]+'`;
  assert.equal(names.count,0,'Placeholder patient names');
  const [dates]=await db`SELECT count(*)::int AS count FROM clinical.vitals v JOIN clinical.admissions a ON a.id=v.admission_id WHERE v.recorded_at>now() OR v.recorded_at<a.admitted_at`;
  assert.equal(dates.count,0,'Observations outside admission timeline');
  const vitals=await db<(News2Input & {news2_score:number;news2_escalation:string;news2_rule_version:string;news2_component_scores:Record<string,number>})[]>`SELECT * FROM clinical.vitals`;
  for(const v of vitals) {
    const result=calculateNews2({...v,temperature:Number(v.temperature)});
    assert.equal(v.news2_score,result.score,'NEWS2 score');
    assert.equal(v.news2_escalation,result.escalation,'NEWS2 escalation');
    assert.deepEqual(v.news2_component_scores,result.component_scores);
    assert.equal(v.news2_rule_version,NEWS2_RULE_VERSION);
  }
  const assessments=await db`SELECT * FROM clinical.nursing_assessments`;
  for(const a of assessments) {
    const result=buildNursingCarePlan(AssessmentBody.parse(a));
    assert.equal(a.morse_score,result.morse);
    assert.equal(a.braden_score,result.braden);
    assert.equal(a.must_score,result.must);
  }
  const [identity]=await db`SELECT count(*)::int AS count FROM clinical.patient_identifiers i JOIN clinical.patients p ON p.id=i.patient_id WHERE i.type='uhid' AND i.value<>p.uhid`;
  assert.equal(identity.count,0,'UHID ownership mismatch');
  for(const table of ['patient_contacts','next_of_kin','patient_coverage']) {
    const [missing]=await db`SELECT count(*)::int AS count FROM clinical.patients p WHERE NOT EXISTS (SELECT 1 FROM ${db(`clinical.${table}`)} t WHERE t.patient_id=p.id)`;
    assert.equal(missing.count,0,`${table}: missing patient data`);
  }
  output.push(`Database checks passed: ${JSON.stringify(counts)}`,`NEWS2 recalculation passed for all ${vitals.length} observations; nursing scores and admission timelines verified.`);
  const {makeApp}=await import('../src/app');
  server=Bun.serve({port:0,hostname:'127.0.0.1',fetch:makeApp().fetch});
  const base=`http://127.0.0.1:${server.port}`;
  const login=await fetch(`${base}/auth/login`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email:'arjun+mehta@klinik.com',password:'password'})});
  assert.equal(login.status,200,'Doctor login');
  const session=await login.json() as {token:string};
  assert(session.token);
  token=session.token;
  const paths=['/ready','/patients','/admissions','/worklists/me','/opd/queue','/handover-sessions','/claims'];
  const [a]=await db`SELECT id,patient_id,unit_id FROM clinical.admissions WHERE assigned_doctor_id='11000000-0000-4000-8000-000000000001' ORDER BY id LIMIT 1`;
  assert(a,'Assigned admission available');
  paths.push(`/patients/${a.patient_id}/identity`, `/dashboard/census-cards?ids=${a.id}`, `/dashboard/ward-summary?unit_id=${a.unit_id}`, `/admissions/${a.id}/header-summary`);
  for(const suffix of ['','/vitals','/initial-assessment','/nursing-assessments','/nursing-tasks',`/fluid-entries?from=${encodeURIComponent(new Date(Date.now()-86400000).toISOString())}&to=${encodeURIComponent(new Date().toISOString())}`,'/notes','/orders','/tasks','/medication-schedules','/mar','/care-plan','/admission-checklist']) paths.push(`/admissions/${a.id}${suffix}`);
  for(const path of paths) {
    const response=await fetch(`${base}${path}`,{headers:{authorization:`Bearer ${session.token}`}});
    const body=await response.text();
    assert.equal(response.status,200,`GET ${path}: ${body.slice(0,200)}`);
    const data=JSON.parse(body);
    if(path===`/admissions/${a.id}/vitals`) {
      assert.equal(data.length,6);
      for(const v of data) for(const field of ['bp_systolic','bp_diastolic','heart_rate','spo2','resp_rate','temperature','glucose','news2_score','news2_component_scores']) assert.notEqual(v[field],null,`${field} returned null`);
    }
    if(path===`/admissions/${a.id}/initial-assessment`) for(const field of ['chief_complaint','history','examination','clinical_impression','plan']) assert(data[field],`${field} missing in assessment API`);
    if(path.startsWith(`/admissions/${a.id}/fluid-entries?`)) {assert(data.entries.length>=6);assert(data.intake_ml>0);assert(data.output_ml>0);}
    output.push(`GET ${path}: 200`);
  }
  console.log(output.join('\n'));
} finally {
  server?.stop(true);
  // QA verification must not leave a reusable session behind, even on assertion failure.
  if(token) await db`DELETE FROM staff.sessions WHERE token=${token}`;
  await db.end();
}
