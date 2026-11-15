// Fictional local QA data only. Never run against Neon or production.
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { calculateNews2, NEWS2_RULE_VERSION, observationFrequencyMinutes } from '../src/clinical/news2';
import { buildNursingCarePlan } from '../src/clinical/nursing';
import { AssessmentBody } from '../src/contracts/nursing';
import { getNursingHandoverSnapshot } from '../src/db/queries/nurse_handover';
import { config } from '../src/config';
import { db } from '../src/db';

const url = new URL(config.databaseUrl);
if (!['development', 'test'].includes(config.nodeEnv) || !['localhost', '127.0.0.1', '[::1]', '::1'].includes(url.hostname) || url.port !== '5434' || url.pathname !== '/klinik') {
  throw new Error('Refusing QA seed: only the local klinik database on port 5434 is allowed');
}
const id = (key: string) => {
  const hex = createHash('md5').update(`klinik-local-qa:${key}`).digest('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-8${hex.slice(17, 20)}-${hex.slice(20)}`;
};
const doctor = '11000000-0000-4000-8000-000000000001';
const nurse = '11000000-0000-4000-8000-000000000003';
const consultant = '11000000-0000-4000-8000-000000000002';
const profiles = [
  { diagnosis: 'Community-acquired pneumonia', complaint: 'Fever and productive cough for three days', history: 'Increasing breathlessness with reduced oral intake. No haemoptysis.', exam: 'Right basal crackles; warm peripheries; alert and oriented.', plan: 'Review chest radiograph and blood counts; monitor respiratory status and hydration.', rr: 22, spo2: 94, temp: 38.2, pulse: 100, bp: 110, glucose: 112, pain: 3, site: 'Chest on coughing', problem: 'Impaired respiratory comfort', intervention: 'Nurse upright, monitor oxygen saturation and report increasing breathlessness.' },
  { diagnosis: 'Type 2 diabetes mellitus with hyperglycaemia', complaint: 'Thirst and increased urinary frequency for two days', history: 'Known diabetes with recently missed medication. No vomiting or altered sensorium.', exam: 'Mildly dry mucosa; abdomen soft; no focal neurological deficit.', plan: 'Monitor capillary glucose and oral intake; review renal function and medication reconciliation.', rr: 18, spo2: 98, temp: 36.8, pulse: 88, bp: 132, glucose: 216, pain: 0, site: '', problem: 'Unstable blood glucose', intervention: 'Check glucose before meals and report symptomatic hypo- or hyperglycaemia.' },
  { diagnosis: 'Acute gastroenteritis with dehydration', complaint: 'Loose stools and reduced intake for one day', history: 'Six watery stools since yesterday; no blood in stools. Tolerating small sips of fluid.', exam: 'Dry oral mucosa; mild diffuse abdominal tenderness without guarding.', plan: 'Record fluid balance, review electrolytes and reassess hydration after oral fluids.', rr: 18, spo2: 98, temp: 37.5, pulse: 96, bp: 112, glucose: 101, pain: 2, site: 'Abdomen', problem: 'Deficient fluid volume', intervention: 'Offer prescribed oral fluids and record intake and urine output each shift.' },
  { diagnosis: 'Acute exacerbation of bronchial asthma', complaint: 'Wheeze and chest tightness since last night', history: 'Known asthma with recent upper respiratory symptoms; no smoking history.', exam: 'Bilateral expiratory wheeze; speaking in full sentences; no peripheral oedema.', plan: 'Review response to prescribed inhaled therapy and monitor respiratory observations.', rr: 24, spo2: 93, temp: 37.2, pulse: 108, bp: 124, glucose: 106, pain: 1, site: 'Chest tightness', problem: 'Ineffective breathing pattern', intervention: 'Observe work of breathing and escalate increasing fatigue or falling saturation.' },
  { diagnosis: 'Essential hypertension under evaluation', complaint: 'Headache with elevated home blood pressure readings', history: 'Known hypertension; no chest pain, visual loss or limb weakness.', exam: 'Alert; no focal neurological deficit; heart sounds normal; lungs clear.', plan: 'Repeat blood pressure after rest, review renal profile and reconcile home medication.', rr: 16, spo2: 98, temp: 36.7, pulse: 78, bp: 158, glucose: 104, pain: 2, site: 'Head', problem: 'Headache and elevated blood pressure', intervention: 'Provide a quiet environment and record repeat blood pressure after rest.' },
  { diagnosis: 'Symptomatic iron deficiency anaemia', complaint: 'Fatigue and exertional breathlessness for two weeks', history: 'Gradual fatigue without syncope or overt bleeding. Diet and bleeding history reviewed.', exam: 'Conjunctival pallor; clear lungs; no oedema; haemodynamically stable.', plan: 'Review complete blood count and iron studies; assess cause and monitor exertional symptoms.', rr: 18, spo2: 99, temp: 36.9, pulse: 92, bp: 118, glucose: 98, pain: 0, site: '', problem: 'Reduced activity tolerance', intervention: 'Assist mobilisation and allow rest between activities; report dizziness.' },
];

try {
  await db.begin(async tx => {
    const [target] = await tx`SELECT current_database() AS database, current_user AS username`;
    if (target.database !== 'klinik' || target.username !== 'klinik') throw new Error('Unexpected QA database identity');
    await tx`SELECT pg_advisory_xact_lock(hashtextextended('klinik:local-qa', 0))`;
    await tx.unsafe(await readFile('scripts/qa-patient-names.sql', 'utf8'));
    const admissions = await tx<{ id: string; patient_id: string; assigned_doctor_id: string | null; assigned_to: string | null; name: string; ward: string; bed: string }[]>`
      SELECT a.*, p.name FROM clinical.admissions a JOIN clinical.patients p ON p.id=a.patient_id ORDER BY a.id`;
    if (!admissions.length) throw new Error('Run the base local seed first');
    const now = Date.now();
    const at = (hours: number) => new Date(now + hours * 3600000);
    // Existing fixture events are compressed into a recent, consistent hospital stay.
    // Deadline/planning columns remain future dates; performed events cannot be future.
    const timestamps = await tx<{ table_schema: string; table_name: string; column_name: string }[]>`
      SELECT c.table_schema,c.table_name,c.column_name FROM information_schema.columns c
      JOIN information_schema.tables t USING (table_schema,table_name)
      WHERE t.table_type='BASE TABLE' AND c.table_schema IN ('clinical','finance','opd','forms','staff','organization')
      AND c.data_type LIKE 'timestamp%'`;
    for (const column of timestamps) {
      if (['due_at','next_due_at','reassess_by','planned_at','expires_at','ends_at','valid_until'].includes(column.column_name)) continue;
      await tx`UPDATE ${tx(`${column.table_schema}.${column.table_name}`)} SET ${tx(column.column_name)}=${at(-1)} WHERE ${tx(column.column_name)} > ${at(0)}`;
    }
    // Repair fixture identifiers that disagree with their owning patient's UHID.
    await tx`DELETE FROM clinical.patient_identifiers WHERE type='uhid'`;
    // Every patient has identity/contact/kin/coverage, with no real person's data imported.
    const patients = await tx<{ id: string; name: string; uhid: string; address: string | null }[]>`SELECT * FROM clinical.patients ORDER BY id`;
    for (const [i,p] of patients.entries()) {
      const phone = `+91 90000 ${String(10000+i).padStart(5,'0')}`;
      const address = `${21+i} ${['Lake View Road','Garden Street','Park Avenue','Temple Road'][i%4]}, Bengaluru, Karnataka 5600${String(10+i%60).padStart(2,'0')}`;
      await tx`UPDATE clinical.patients SET phone=${phone},address=${address},blood_group=COALESCE(blood_group,${['O+','A+','B+','AB+','O-'][i%5]}),created_at=${at(-240)} WHERE id=${p.id}`;
      await tx`UPDATE clinical.patient_contacts SET value=${phone} WHERE patient_id=${p.id} AND type='phone'`;
      await tx`INSERT INTO clinical.patient_identifiers (id,patient_id,type,value,issuer,created_at) SELECT ${id(`${p.id}:identifier`)},${p.id},'uhid',${p.uhid},'KliniK',${at(-240)} WHERE NOT EXISTS (SELECT 1 FROM clinical.patient_identifiers WHERE patient_id=${p.id} AND type='uhid')`;
      await tx`INSERT INTO clinical.patient_contacts (id,patient_id,type,label,value,is_primary,created_at) SELECT ${id(`${p.id}:contact`)},${p.id},'phone','Mobile',${phone},true,${at(-240)} WHERE NOT EXISTS (SELECT 1 FROM clinical.patient_contacts WHERE patient_id=${p.id} AND type='phone')`;
      await tx`INSERT INTO clinical.next_of_kin (id,patient_id,name,relationship,phone,address,is_primary,created_at) SELECT ${id(`${p.id}:kin`)},${p.id},${`Kiran ${p.name.split(' ').at(-1)}`},'Sibling',${`+91 90001 ${String(10000+i).padStart(5,'0')}`},${address},true,${at(-240)} WHERE NOT EXISTS (SELECT 1 FROM clinical.next_of_kin WHERE patient_id=${p.id})`;
      await tx`INSERT INTO clinical.patient_coverage (id,patient_id,payer_name,policy_number,member_id,valid_from,valid_until,is_primary,created_at) SELECT ${id(`${p.id}:coverage`)},${p.id},'National Health Assurance',${`NHA-${700000+i}`},${`MEM-${700000+i}`},${new Date(now-365*86400000).toISOString().slice(0,10)},${new Date(now+365*86400000).toISOString().slice(0,10)},true,${at(-240)} WHERE NOT EXISTS (SELECT 1 FROM clinical.patient_coverage WHERE patient_id=${p.id})`;
    }
    // Replace old sparse observations so alert sources, trends and scores agree.
    await tx`DELETE FROM clinical.alerts`;
    await tx`DELETE FROM clinical.vitals`;
    for (const [i,a] of admissions.entries()) {
      const p = profiles[i%profiles.length];
      const author = a.assigned_doctor_id ?? doctor;
      const recorder = a.assigned_to ?? nurse;
      const admitted = at(-72-(i%4)*24);
      await tx`UPDATE clinical.admissions SET admitted_at=${admitted},arrived_at=${admitted},assigned_doctor_id=${author},assigned_to=${recorder},severity=${p.rr>=22?'watcher':'stable'} WHERE id=${a.id}`;
      await tx`UPDATE clinical.bed_assignments SET starts_at=${admitted},ends_at=CASE WHEN ends_at IS NOT NULL THEN ${at(-48)} ELSE NULL END WHERE admission_id=${a.id}`;
      await tx`UPDATE clinical.staff_assignments SET starts_at=${admitted},ends_at=CASE WHEN ends_at IS NOT NULL THEN ${at(-48)} ELSE NULL END WHERE admission_id=${a.id}`;
      for(const [type,user] of [['duty_doctor',author],['primary_nurse',recorder],['treating_consultant',consultant]]) await tx`INSERT INTO clinical.staff_assignments (id,admission_id,user_id,assignment_type,starts_at,assigned_by) SELECT ${id(`${a.id}:assignment:${type}`)},${a.id},${user},${type},${admitted},${doctor} WHERE NOT EXISTS (SELECT 1 FROM clinical.staff_assignments WHERE admission_id=${a.id} AND assignment_type=${type} AND ends_at IS NULL)`;
      await tx`UPDATE clinical.diagnoses SET description=${p.diagnosis},diagnosed_at=${admitted},created_at=${admitted} WHERE admission_id=${a.id}`;
      await tx`INSERT INTO clinical.diagnoses (id,patient_id,admission_id,description,created_by,diagnosed_at,created_at) SELECT ${id(`${a.id}:diagnosis`)},${a.patient_id},${a.id},${p.diagnosis},${author},${admitted},${admitted} WHERE NOT EXISTS (SELECT 1 FROM clinical.diagnoses WHERE admission_id=${a.id})`;
      await tx`INSERT INTO clinical.initial_assessments (admission_id,chief_complaint,history,examination,clinical_impression,plan,assessed_by,signed_at) VALUES (${a.id},${p.complaint},${p.history},${p.exam},${p.diagnosis},${p.plan},${author},${admitted}) ON CONFLICT (admission_id) DO UPDATE SET chief_complaint=EXCLUDED.chief_complaint,history=EXCLUDED.history,examination=EXCLUDED.examination,clinical_impression=EXCLUDED.clinical_impression,plan=EXCLUDED.plan,signed_at=EXCLUDED.signed_at`;
      for (let reading=0;reading<6;reading++) {
        const input = { resp_rate:p.rr+(reading<2?2:0),spo2:p.spo2-(reading<2?1:0),on_supplemental_oxygen:false,temperature:p.temp+(reading<2?0.2:0),bp_systolic:p.bp,heart_rate:p.pulse+(reading<2?4:0),consciousness:'alert' as const };
        const score = calculateNews2(input);
        const recorded = at(-21+reading*4);
        const vitalId = id(`${a.id}:vital:${reading}`);
        await tx`INSERT INTO clinical.vitals (id,admission_id,recorded_by,recorded_at,bp_systolic,bp_diastolic,heart_rate,spo2,resp_rate,temperature,glucose,on_supplemental_oxygen,consciousness,news2_score,news2_escalation,news2_component_scores,news2_rule_version)
          VALUES (${vitalId},${a.id},${recorder},${recorded},${input.bp_systolic},${i%6===4?92:74},${input.heart_rate},${input.spo2},${input.resp_rate},${Number(input.temperature.toFixed(1))},${p.glucose+(5-reading)*3},false,'alert',${score.score},${score.escalation},${tx.json(score.component_scores)},${NEWS2_RULE_VERSION})`;
        if (reading===5) {
          const frequency=observationFrequencyMinutes(score);
          await tx`INSERT INTO clinical.observation_schedules (admission_id,frequency_minutes,next_due_at,source,policy_version,updated_by,updated_at) VALUES (${a.id},${frequency},${new Date(recorded.getTime()+frequency*60000)},'news2_policy',${NEWS2_RULE_VERSION},${recorder},${recorded}) ON CONFLICT (admission_id) DO UPDATE SET frequency_minutes=EXCLUDED.frequency_minutes,next_due_at=EXCLUDED.next_due_at,source=EXCLUDED.source,policy_version=EXCLUDED.policy_version,updated_by=EXCLUDED.updated_by,updated_at=EXCLUDED.updated_at`;
          if(score.escalation!=='low') await tx`INSERT INTO clinical.alerts (id,admission_id,source_vitals_id,type,severity,message,created_at) VALUES (${id(`${a.id}:alert`)},${a.id},${vitalId},'news2',${score.escalation==='high'?'warning':'caution'},${`NEWS2 ${score.score}: clinical review required`},${recorded})`;
        }
      }
      for(const code of ['registration_consent','payer','bed_assignment','unit_arrival','admission_orders','doctor_assessment','nursing_assessment','consultant_review']) await tx`INSERT INTO clinical.admission_checklist_items (id,admission_id,code) VALUES (${id(`${a.id}:checklist:${code}`)},${a.id},${code}) ON CONFLICT (admission_id,code) DO NOTHING`;
      const body = `Review: ${p.diagnosis}.\nSymptoms: ${p.complaint}. ${p.history}\nExamination: ${p.exam}\nPlan: ${p.plan}\nNursing: ${p.intervention}`;
      const noteId=id(`${a.id}:note`);
      const [stamp] = await tx`SELECT id AS user_id,name,COALESCE(specialization,'Duty doctor') AS designation,registration_number FROM staff.users WHERE id=${author}`;
      await tx`INSERT INTO clinical.notes (id,admission_id,kind,draft_body,clinical_context,created_by,created_at,saved_at,updated_at,author_stamp) VALUES (${noteId},${a.id},'progress',${body},${tx.json({provisional_diagnoses:[p.diagnosis],observation_frequency:'NEWS2 policy',observation_reason:'Inpatient clinical monitoring'})},${author},${at(-2)},${at(-2)},${at(-2)},${tx.json(stamp)}) ON CONFLICT (id) DO UPDATE SET draft_body=EXCLUDED.draft_body,clinical_context=EXCLUDED.clinical_context,saved_at=EXCLUDED.saved_at,updated_at=EXCLUDED.updated_at`;
      await tx`INSERT INTO clinical.note_versions (id,note_id,version_no,body,confirmed_by,confirmed_at) VALUES (${id(`${a.id}:note-version`)},${noteId},1,${body},${author},${at(-2)}) ON CONFLICT (id) DO UPDATE SET body=EXCLUDED.body,confirmed_at=EXCLUDED.confirmed_at`;
      const assessment=AssessmentBody.parse({arrival_source:'Emergency department',transport_mode:'Wheelchair',identity_verified:true,allergy_verified:true,language:i%2?'Hindi':'Kannada',belongings:'Clothing, spectacles and mobile phone with family',dependence:'Needs assistance',skin:'Intact',vulnerabilities:[],devices:[],pain_score:p.pain,pain_site:p.site,morse:{history:0,secondary:15,aid:0,iv:0,gait:10,mental:0},braden:{sensory:4,moisture:4,activity:3,mobility:3,nutrition:3,friction:3},must:{bmi:0,weight_loss:0,acute:0}});
      const scores=buildNursingCarePlan(assessment);
      const assessmentId=id(`${a.id}:nursing`);
      await tx`INSERT INTO clinical.nursing_assessments (id,admission_id,assessed_by,assessed_at,arrival_source,transport_mode,identity_verified,allergy_verified,language,belongings,dependence,skin,vulnerabilities,devices,pain_score,pain_site,morse,morse_score,braden,braden_score,must,must_score,care_plan,reassess_by) VALUES (${assessmentId},${a.id},${recorder},${at(-2)},${assessment.arrival_source},${assessment.transport_mode},true,true,${assessment.language},${assessment.belongings},${assessment.dependence},${assessment.skin},'[]','[]',${p.pain},${p.site},${tx.json(assessment.morse)},${scores.morse},${tx.json(assessment.braden)},${scores.braden},${tx.json(assessment.must)},${scores.must},${tx.json(scores.care_plan)},${at(22)}) ON CONFLICT (id) DO UPDATE SET assessed_at=EXCLUDED.assessed_at,reassess_by=EXCLUDED.reassess_by`;
      await tx`INSERT INTO clinical.nursing_care_plan_items (id,admission_id,problem,intervention,created_by,created_at) VALUES (${id(`${a.id}:care-plan`)},${a.id},${p.problem},${p.intervention},${recorder},${at(-3)}) ON CONFLICT (id) DO NOTHING`;
      await tx`INSERT INTO clinical.nursing_recurring_tasks (id,admission_id,source_assessment_id,description,interval_minutes,due_at,created_by,created_at) VALUES (${id(`${a.id}:nursing-task`)},${a.id},${assessmentId},'Review comfort, mobility, skin and fluid balance',240,${at(i%2?1:-1)},${recorder},${at(-3)}) ON CONFLICT (id) DO UPDATE SET due_at=EXCLUDED.due_at`;
      await tx`INSERT INTO clinical.patient_weights (id,admission_id,weight_kg,measured_at,recorded_at,recorded_by) VALUES (${id(`${a.id}:weight`)},${a.id},${58+i%29},${at(-12)},${at(-12)},${recorder}) ON CONFLICT (id) DO UPDATE SET measured_at=EXCLUDED.measured_at,recorded_at=EXCLUDED.recorded_at`;
      for (const [direction,category,volume] of [['intake','Oral fluids',350],['output','Urine',280]] as const) {
        for(let n=0;n<3;n++) await tx`INSERT INTO clinical.fluid_entries (id,admission_id,recorded_by,direction,category,volume_ml,occurred_at,recorded_at) VALUES (${id(`${a.id}:fluid:${direction}:${n}`)},${a.id},${recorder},${direction},${category},${volume+n*20},${at(-10+n*3)},${at(-10+n*3)}) ON CONFLICT (id) DO UPDATE SET occurred_at=EXCLUDED.occurred_at,recorded_at=EXCLUDED.recorded_at`;
      }
      const orderId=id(`${a.id}:investigation`);
      await tx`INSERT INTO clinical.orders (id,admission_id,kind,payload,priority,status,created_by,created_at,confirmed_by,confirmed_at,acknowledged_by,acknowledged_at) VALUES (${orderId},${a.id},'investigation',${tx.json({test:'Complete blood count',instructions:'Collect morning venous sample and review results'})},'routine','confirmed',${author},${at(-4)},${author},${at(-4)},${recorder},${at(-3)}) ON CONFLICT (id) DO NOTHING`;
      await tx`INSERT INTO clinical.tasks (id,order_id,admission_id,due_at,status,completed_by,completed_at,created_at) VALUES (${id(`${a.id}:task`)},${orderId},${a.id},${at(i%2?1:-1)},${i%3===0?'done':'pending'},${i%3===0?recorder:null},${i%3===0?at(-1):null},${at(-4)}) ON CONFLICT (id) DO NOTHING`;
      // PRN chart: a symptom-relief order, not a blanket disease treatment regimen.
      const medOrder=id(`${a.id}:medication-order`), schedule=id(`${a.id}:medication`);
      const medication='12000000-0000-4000-8000-000000000001';
      await tx`INSERT INTO clinical.orders (id,admission_id,kind,payload,status,created_by,created_at,confirmed_by,confirmed_at) VALUES (${medOrder},${a.id},'medication',${tx.json({drug:'Paracetamol 500 mg',dose:'500 mg',route:'oral',catalog_id:medication,prn_indication:'Pain or fever',prn_min_interval_minutes:360,prn_max_doses_24h:4})},'confirmed',${author},${at(-6)},${author},${at(-6)}) ON CONFLICT (id) DO NOTHING`;
      await tx`INSERT INTO clinical.medication_schedules (id,admission_id,order_id,drug,dose,route,prn_indication,prn_min_interval_minutes,prn_max_doses_24h,catalog_id,created_by,created_at) VALUES (${schedule},${a.id},${medOrder},'Paracetamol 500 mg','500 mg','oral','Pain or fever',360,4,${medication},${author},${at(-6)}) ON CONFLICT (id) DO NOTHING`;
      await tx`INSERT INTO clinical.medication_allergy_reviews (id,schedule_id,patient_revision,decision,reason,reviewed_by,reviewed_at) SELECT ${id(`${a.id}:allergy-review`)},${schedule},revision,'safe','Recorded allergies reviewed against paracetamol before prescribing.',${author},${at(-6)} FROM clinical.patients WHERE id=${a.patient_id} ON CONFLICT (id) DO NOTHING`;
      if (p.pain>0 || p.temp>=38) await tx`INSERT INTO clinical.medication_doses (id,schedule_id,due_at,status,acted_by,acted_at,administration_reason) VALUES (${id(`${a.id}:dose`)},${schedule},${at(-5)},'given',${recorder},${at(-5)},${p.temp>=38?'Fever':'Pain'}) ON CONFLICT (id) DO UPDATE SET due_at=EXCLUDED.due_at,acted_at=EXCLUDED.acted_at`;
      await tx`INSERT INTO clinical.patient_chat_messages (id,patient_id,author_id,body,created_at) VALUES (${id(`${a.id}:chat`)},${a.patient_id},${recorder},${`Bedside review: ${p.intervention} Family updated on the current plan.`},${at(-1)}) ON CONFLICT (id) DO UPDATE SET created_at=EXCLUDED.created_at`;
      await tx`INSERT INTO clinical.nursing_task_completions (id,task_id,completed_by,completed_at,previous_due_at) VALUES (${id(`${a.id}:nursing-completion`)},${id(`${a.id}:nursing-task`)},${recorder},${at(-3)},${at(-4)}) ON CONFLICT (id) DO UPDATE SET completed_at=EXCLUDED.completed_at,previous_due_at=EXCLUDED.previous_due_at`;
      if(i%6===0) await tx`INSERT INTO clinical.nursing_sbar_calls (id,admission_id,called_by,doctor_id,situation,background,assessment,request,created_at) VALUES (${id(`${a.id}:sbar`)},${a.id},${recorder},${author},'Persistent increased respiratory rate',${p.diagnosis},'Latest observations require clinical review. Please see the NEWS2 chart.','within_30_minutes',${at(-1)}) ON CONFLICT (id) DO NOTHING`;
      const [coverage]=await tx`SELECT id FROM clinical.patient_coverage WHERE patient_id=${a.patient_id} ORDER BY is_primary DESC,id LIMIT 1`;
      await tx`INSERT INTO finance.claims (id,admission_id,coverage_id,status,currency,approved_limit,current_usage,estimate,created_by,created_at,updated_at) SELECT ${id(`${a.id}:claim`)},${a.id},${coverage.id},${i%3===0?'query_raised':'approved'},'INR',75000,${12000+i*250},32000,${doctor},${at(-24)},${at(-2)} WHERE NOT EXISTS (SELECT 1 FROM finance.claims WHERE admission_id=${a.id})`;
      await tx`INSERT INTO finance.deposits (id,admission_id,amount,currency,reference,recorded_by,created_at) SELECT ${id(`${a.id}:deposit`)},${a.id},5000,'INR',${`DEP-${80000+i}`},${doctor},${at(-24)} WHERE NOT EXISTS (SELECT 1 FROM finance.deposits WHERE admission_id=${a.id})`;
      await tx`INSERT INTO clinical.contingencies (id,admission_id,body,created_by,created_at) VALUES (${id(`${a.id}:contingency`)},${a.id},'Repeat observations and contact the duty doctor for rising NEWS2, new confusion, chest pain or falling urine output.',${author},${at(-2)}) ON CONFLICT (id) DO NOTHING`;
      await tx`INSERT INTO clinical.shift_events (id,admission_id,body,logged_by,logged_at) VALUES (${id(`${a.id}:event`)},${a.id},${`Bedside review completed. ${p.intervention}`},${recorder},${at(-1)}) ON CONFLICT (id) DO UPDATE SET logged_at=EXCLUDED.logged_at`;
      if(i%6===1 || i%6===4) {
        const planId=id(`${a.id}:discharge`);
        await tx`INSERT INTO clinical.discharge_plans (id,admission_id,discharge_type,planned_at,condition,follow_up,summary,final_diagnosis,requested_by,requested_at) SELECT ${planId},${a.id},'home',${at(24)},'Stable; discharge subject to treating team review.','Outpatient review in one week; return earlier for worsening symptoms.',${`${p.diagnosis}. Observations reviewed; medication reconciliation and follow-up advice pending.`},${p.diagnosis},${author},${at(-1)} WHERE NOT EXISTS (SELECT 1 FROM clinical.discharge_plans WHERE admission_id=${a.id} AND status IN ('pending_approval','approved'))`;
        const [plan]=await tx`SELECT id FROM clinical.discharge_plans WHERE admission_id=${a.id} AND status IN ('pending_approval','approved') LIMIT 1`;
        for(const code of ['summary','pending_results','medication_reconciliation','nursing','billing','insurance','payment']) await tx`INSERT INTO clinical.discharge_tasks (id,plan_id,code) SELECT ${id(`${a.id}:discharge-task:${code}`)},${plan.id},${code} WHERE NOT EXISTS (SELECT 1 FROM clinical.discharge_tasks WHERE plan_id=${plan.id} AND code=${code})`;
      }
      if(i%6===0 || i%6===3) await tx`INSERT INTO clinical.cross_referrals (id,admission_id,requested_by,consultant_id,specialty,urgency,question,findings,created_at) SELECT ${id(`${a.id}:referral`)},${a.id},${author},${consultant},'General Medicine','urgent','Please review persistent respiratory symptoms and advise further management.',${p.exam},${at(-1)} WHERE NOT EXISTS (SELECT 1 FROM clinical.cross_referrals WHERE admission_id=${a.id} AND consultant_id=${consultant} AND status IN ('sent','seen','opinion','acknowledged'))`;
      await tx`INSERT INTO clinical.consultant_rounds (id,admission_id,consultant_id,subjective,objective,assessment,plan,note_id,signed_at) VALUES (${id(`${a.id}:round`)},${a.id},${consultant},${p.complaint},${p.exam},${p.diagnosis},${p.plan},${noteId},${at(-2)}) ON CONFLICT (id) DO NOTHING`;
    }
    // Complete outpatient visits for patients who are not occupying an inpatient bed.
    for (const [i,p] of patients.filter(p=>!admissions.some(a=>a.patient_id===p.id)).entries()) {
      const visit=id(`${p.id}:opd`), seen=i%2===0;
      await tx`INSERT INTO opd.visits (id,patient_id,token,status,chief_complaints,patient_notes,reported_medications,chronic_conditions,triage,consultation_note,follow_up,created_by,created_at,signed_by,signed_at) VALUES (${visit},${p.id},${`OPD-${810001+i}`},${seen?'seen':'waiting'},${tx.json(['Fever','Headache'])},'Symptoms for two days; tolerating oral fluids. No rash or neck stiffness.','No regular medication reported.','No known chronic conditions.',${tx.json({systolic:118,diastolic:76,pulse:88,spo2:98,temperature:37.8,weight_kg:64})},${seen?'Alert, hydrated and no focal signs. Symptomatic care discussed; review if fever persists.':''},'3 days',${doctor},${at(-3)},${seen?doctor:null},${seen?at(-2):null}) ON CONFLICT (id) DO UPDATE SET created_at=EXCLUDED.created_at,signed_at=EXCLUDED.signed_at`;
      if(seen) {
        await tx`INSERT INTO opd.visit_diagnoses (id,visit_id,code) VALUES (${id(`${visit}:diagnosis`)},${visit},'R50.9') ON CONFLICT (id) DO NOTHING`;
        await tx`INSERT INTO opd.visit_investigations (id,visit_id,code) VALUES (${id(`${visit}:investigation`)},${visit},'CBC') ON CONFLICT (id) DO NOTHING`;
        await tx`INSERT INTO opd.prescriptions (id,visit_id,medication_id,dose,route,frequency,duration,created_by,created_at) VALUES (${id(`${visit}:prescription`)},${visit},'12000000-0000-4000-8000-000000000001','500 mg','oral','If fever; at least six hours apart, maximum four doses daily','Up to three days',${doctor},${at(-2)}) ON CONFLICT (id) DO NOTHING`;
        await tx`INSERT INTO opd.visit_charges (visit_id,consultation_amount,investigation_amount,total_amount,currency,calculated_at) VALUES (${visit},600,300,900,'INR',${at(-2)}) ON CONFLICT (visit_id) DO NOTHING`;
        for(const kind of ['pharmacy','collection']) await tx`INSERT INTO opd.dispatches (id,visit_id,kind,created_at) VALUES (${id(`${visit}:dispatch:${kind}`)},${visit},${kind},${at(-2)}) ON CONFLICT (id) DO NOTHING`;
      }
    }
    // A handover belongs to the actual assigned doctor/nurse, not a single global author.
    await tx`DELETE FROM clinical.handover_items WHERE session_id=${id('handover-session')}`;
    await tx`DELETE FROM clinical.handover_sessions WHERE id=${id('handover-session')}`;
    for(const [i,a] of admissions.entries()) {
      const p=profiles[i%profiles.length];
      const outgoing=a.assigned_doctor_id??doctor;
      const incoming=outgoing===doctor?'11000000-0000-4000-8000-000000000006':doctor;
      const session=id(`handover-session:${outgoing}`);
      await tx`INSERT INTO clinical.handover_sessions (id,outgoing_doctor_id,incoming_doctor_id,created_at) VALUES (${session},${outgoing},${incoming},${at(-1)}) ON CONFLICT (id) DO NOTHING`;
      const [patient]=await tx`SELECT dob FROM clinical.patients WHERE id=${a.patient_id}`;
      await tx`INSERT INTO clinical.handover_items (id,session_id,admission_id,snapshot,item_version,created_at) VALUES (${id(`${a.id}:handover-item`)},${session},${a.id},${tx.json({patient_name:a.name,patient_dob:patient.dob,ward:a.ward,bed:a.bed,severity:p.rr>=22?'watcher':'stable',diagnoses:[p.diagnosis],contingencies:['Contact the duty doctor for rising NEWS2 or new symptoms.'],shift_events:[{body:p.intervention,logged_at:at(-1).toISOString()}],latest_note:p.plan})},1,${at(-1)}) ON CONFLICT (id) DO UPDATE SET snapshot=EXCLUDED.snapshot`;
    }
    for(const a of admissions) {
      const outgoing=a.assigned_to??nurse;
      const incoming=outgoing===nurse?'11000000-0000-4000-8000-000000000005':nurse;
      const session=id(`nurse-session:${outgoing}`);
      await tx`INSERT INTO clinical.nurse_handover_sessions (id,outgoing_nurse_id,incoming_nurse_id,created_at) VALUES (${session},${outgoing},${incoming},${at(-1)}) ON CONFLICT (id) DO NOTHING`;
      const snapshot=await getNursingHandoverSnapshot(tx,a.id);
      const [existing]=await tx`SELECT id FROM clinical.nurse_handover_items WHERE admission_id=${a.id} AND status='draft'`;
      if(existing) await tx`UPDATE clinical.nurse_handover_items SET snapshot=${tx.json(snapshot)},handover_notes='Review NEWS2 trend, fluid chart, medication chart and pending investigations at bedside.' WHERE id=${existing.id}`;
      else await tx`INSERT INTO clinical.nurse_handover_items (id,session_id,admission_id,patient_name,ward,bed,snapshot,handover_notes) VALUES (${id(`${a.id}:nurse-item`)},${session},${a.id},${a.name},${a.ward},${a.bed},${tx.json(snapshot)},'Review NEWS2 trend, fluid chart, medication chart and pending investigations at bedside.') ON CONFLICT (id) DO UPDATE SET snapshot=EXCLUDED.snapshot`;
    }
    // Reconcile copied patient identities and dates shown in existing handovers/forms.
    await tx`UPDATE clinical.ipass_items i SET patient_name=p.name,patient_summary=d.description,action_list='Review latest observations and outstanding investigations.',contingency='Escalate clinical deterioration to the duty doctor.' FROM clinical.admissions a JOIN clinical.patients p ON p.id=a.patient_id JOIN clinical.diagnoses d ON d.admission_id=a.id WHERE i.admission_id=a.id`;
    await tx`UPDATE clinical.nurse_handover_items i SET patient_name=p.name FROM clinical.admissions a JOIN clinical.patients p ON p.id=a.patient_id WHERE i.admission_id=a.id`;
    await tx`UPDATE clinical.admission_checklist_items SET status='completed',completed_by=${nurse},completed_at=${at(-2)},evidence='Admission assessment, coverage and allocated bed recorded.' WHERE code <> 'registration_consent'`;
    // Bring legacy events into the same admission timeline without moving planned deadlines.
    for(const column of timestamps) {
      if(!['clinical','finance','forms'].includes(column.table_schema) || !['created_at','updated_at','recorded_at','assessed_at','signed_at','confirmed_at','acknowledged_at','completed_at','saved_at','logged_at','requested_at','measured_at','occurred_at','diagnosed_at'].includes(column.column_name)) continue;
      const [hasAdmission]=await tx`SELECT 1 FROM information_schema.columns WHERE table_schema=${column.table_schema} AND table_name=${column.table_name} AND column_name='admission_id'`;
      if(hasAdmission) await tx`UPDATE ${tx(`${column.table_schema}.${column.table_name}`)} AS event SET ${tx(column.column_name)}=a.admitted_at + interval '1 hour' FROM clinical.admissions a WHERE event.admission_id=a.id AND ${tx(`event.${column.column_name}`)} < a.admitted_at`;
    }
    await tx`UPDATE clinical.note_versions v SET confirmed_at=a.admitted_at + interval '2 hours' FROM clinical.notes n JOIN clinical.admissions a ON a.id=n.admission_id WHERE v.note_id=n.id AND v.confirmed_at<a.admitted_at`;
    await tx`UPDATE clinical.handover_items i SET item_version=a.revision FROM clinical.admissions a WHERE i.admission_id=a.id`;
    await tx`UPDATE staff.shifts SET starts_at=${at(-6)},ends_at=${at(6)}`;
    console.log(`QA clinical histories populated for ${admissions.length} admissions and identity details for ${patients.length} patients.`);
  });
} finally { await db.end(); }
