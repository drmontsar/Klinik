// Generate a field-level inventory; never output credentials or personal values.
import { readdir, readFile, mkdir, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import ts from 'typescript';
import { config } from '../src/config';
import { db } from '../src/db';

const url=new URL(config.databaseUrl);
if (!['development','test'].includes(config.nodeEnv) || !['localhost','127.0.0.1','[::1]','::1'].includes(url.hostname) || url.port!=='5434' || url.pathname!=='/klinik') throw new Error('Coverage is restricted to local QA on port 5434');
const root='../../kortex/apps/web/src';
async function files(path:string):Promise<string[]> {
  return (await Promise.all((await readdir(path,{withFileTypes:true})).map(entry=>entry.isDirectory()?files(join(path,entry.name)):/\.tsx?$/.test(entry.name)?[join(path,entry.name)]:[]))).flat();
}
const domains:Record<string,string>={
  admissions:'clinical.admissions, initial_assessments, admission_checklist_items; organization beds/units',
  patients:'clinical.patients, admissions, diagnoses, notes, patient_identifiers, patient_contacts, next_of_kin, patient_coverage',
  observations:'clinical.vitals, alerts, observation_schedules (NEWS2 computed by app rules)',
  notes:'clinical.notes, note_versions, diagnoses (author_stamp and clinical_context JSON)',
  orders:'clinical.orders, tasks, medication_catalog, medication_schedules, medication_doses, medication_allergy_reviews',
  'patient-workflows':'clinical nursing_assessments, nursing_care_plan_items, nursing_recurring_tasks, nursing_task_completions, patient_weights, fluid_entries, nursing_sbar_calls, cross_referrals, consultant_rounds, patient_movements, discharge_plans, discharge_tasks; finance claims/queries/events/deposits',
  handover:'clinical.handover_sessions/items/acknowledgments, ipass_sessions/items/questions, nurse_handover_sessions/items/questions, contingencies, shift_events',
  opd:'opd.visits (triage JSON: systolic, diastolic, pulse, spo2, temperature, weight_kg), visit_diagnoses, visit_investigations, prescriptions, visit_charges, dispatches',
  forms:'forms.templates, template_versions, instances, instance_versions, signatures',
  chat:'clinical.patient_chat_messages, patient_chat_revisions/mentions/attachments; attachment bytes require object storage',
  investigations:'clinical.orders supplies ordered tests. Report/status updates are a frontend adapter input, NOT currently persisted in PostgreSQL. Seeding payload.report does not render a report.',
  wards:'organization facilities/departments/units/wards/rooms/beds; clinical.admissions; staff memberships/shifts',
  worklist:'Derived from clinical observations/tasks/orders/alerts/nursing tasks/doses/assessments and active staff shifts',
  home:'Derived from clinical.patients/admissions/vitals/diagnoses/alerts',
  auth:'staff.users, user_credentials, sessions (tokens are created by real login only)',
  layout:'Browser preferences; no database seed required',
  documents:'Derived printable documents; no independent database table',
  tasks:'clinical.tasks joined to clinical.orders',
};
try {
  const sourceFiles=(await files(root)).filter(p=>!p.includes('/test/') && (/\/features\//.test(p)||/\/lib\/api\//.test(p))).sort();
  const sections:string[]=[];
  for(const path of sourceFiles) {
    const source=ts.createSourceFile(path,await readFile(path,'utf8'),ts.ScriptTarget.Latest,true,path.endsWith('.tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS);
    const fields=new Set<string>();
    const labels=new Set<string>();
    function visit(node:ts.Node) {
      if(ts.isPropertySignature(node) && node.name) fields.add(node.name.getText(source));
      if(ts.isJsxAttribute(node) && ['name','placeholder','aria-label'].includes(node.name.getText(source)) && node.initializer && ts.isStringLiteral(node.initializer)) labels.add(`${node.name.getText(source)}=${node.initializer.text}`);
      if(ts.isPropertyAssignment(node) && ['label','key','name'].includes(node.name.getText(source)) && ts.isStringLiteral(node.initializer)) labels.add(`${node.name.getText(source)}=${node.initializer.text}`);
      // Property accesses include displayed values plus local state: an intentionally broad audit index.
      if(ts.isPropertyAccessExpression(node)) fields.add(node.getText(source));
      ts.forEachChild(node,visit);
    }
    visit(source);
    sections.push(`### ${relative(root,path)}\n\nField references (includes local state): ${[...fields].sort().map(v=>'`'+v.replaceAll('`','')+'`').join(', ')||'None'}\n\nInput/label metadata: ${[...labels].sort().join('; ')||'None'}\n`);
  }
  const columns=await db<{table_schema:string;table_name:string;column_name:string;data_type:string;is_nullable:string;column_default:string|null}[]>`
    SELECT c.table_schema,c.table_name,c.column_name,c.data_type,c.is_nullable,c.column_default
    FROM information_schema.columns c JOIN information_schema.tables t USING (table_schema,table_name)
    WHERE t.table_type='BASE TABLE' AND c.table_schema NOT IN ('pg_catalog','information_schema')
    ORDER BY c.table_schema,c.table_name,c.ordinal_position`;
  const lines=['# Local QA database field coverage','','Generated by `bun run qa:coverage`. Counts only; no secret or patient values.','',
    'NULL is intentional for states not reached (e.g. active admission discharge time, pending task completion, unsigned forms). Empty arrays can mean no allergy/device. This inventory does not claim every lifecycle state is populated.','',
    '## UI → database domain map','',...Object.entries(domains).map(([domain,tables])=>`- **${domain}**: ${tables}`),'',
    '## Known non-seedable or deliberate exclusions','',
    '- Investigation result bodies/stages have no database/API adapter yet; frontend takes an optional `updates` input. Orders alone cannot populate report panels.',
    '- No forged signatures, fake live session tokens, emergency break-glass grants, or made-up object-storage keys. Exercise those via the app.',
    '- No synthetic metadata is removed from catalogues or internal tracking; names and visible clinical values have no test-name prefixes.',
    '- All values are fictional. This is UI/workflow QA data, not clinically validated reference cases or production patient records.','',
    '## Every database column','',
    '| Table.column | Type | Nullable | Rows | Non-null | Non-empty* |','|---|---|---|---:|---:|---:|'];
  const grouped=Map.groupBy(columns,c=>`${c.table_schema}.${c.table_name}`);
  let populated=0;
  for(const [table,fields] of grouped) {
    const expressions=fields.map(c=>db`count(${db(c.column_name)})::int AS ${db(c.column_name)}`);
    // Query once per table; JSONB keys remain in the frontend index/contracts rather than hidden as DB columns.
    const [counts]=await db`SELECT count(*)::int AS "__rows", ${expressions.reduce((a,b)=>db`${a},${b}`)} FROM ${db(table)}`;
    const emptyCounts=fields.map(c=>db`count(*) FILTER (WHERE ${db(c.column_name)} IS NOT NULL AND ${db(c.column_name)}::text NOT IN ('','[]','{}','null'))::int AS ${db(c.column_name)}`);
    const [nonempty]=await db`SELECT ${emptyCounts.reduce((a,b)=>db`${a},${b}`)} FROM ${db(table)}`;
    if(counts.__rows>0) populated++;
    for(const c of fields) lines.push(`| ${table}.${c.column_name} | ${c.data_type} | ${c.is_nullable} | ${counts.__rows} | ${counts[c.column_name]} | ${nonempty[c.column_name]} |`);
  }
  lines.push('','*Non-empty excludes SQL NULL, empty text, empty JSON arrays/objects, and JSON null. Zero and false are legitimate populated values.','',`Tables with records: ${populated}/${grouped.size}. Total columns: ${columns.length}. Frontend source files indexed: ${sourceFiles.length}.`,'');
  await mkdir('docs',{recursive:true});
  await writeFile('docs/qa-field-coverage.md',lines.join('\n'));
  await writeFile('docs/qa-ui-field-index.md',['# QA frontend field reference index','','Generated from the actual frontend AST by `bun run qa:coverage`. This is a broad index of field/property references and input metadata, not a claim that every reference is a database field. Read the domain map and limitations in `qa-field-coverage.md`.','',...sections].join('\n'));
  console.log(`Inventoried ${columns.length} database columns across ${grouped.size} tables and ${sourceFiles.length} frontend source files; ${populated} tables contain records.`);
} finally {await db.end();}
