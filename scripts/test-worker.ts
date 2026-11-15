// Runs workerd locally against the configured QA database. Never deploys anything.
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { createServer } from 'node:net';
import postgres from 'postgres';

const databaseUrl=process.env.DATABASE_URL;
assert(databaseUrl,'DATABASE_URL is required');
const temp=await mkdtemp(join(tmpdir(),'klinik-worker-test-'));
const config=JSON.parse(await readFile('wrangler.jsonc','utf8'));
const listener=createServer();
await new Promise<void>(resolve=>listener.listen(0,'127.0.0.1',resolve));
const address=listener.address();
assert(address && typeof address!=='string');
const port=address.port;
await new Promise<void>(resolve=>listener.close(()=>resolve()));
const configFile=join(temp,'wrangler.json');
await writeFile(configFile,JSON.stringify({...config,main:resolve(config.main),vars:{DATABASE_URL:databaseUrl,NODE_ENV:'production',LOG_LEVEL:'info',ACCESS_CONTROL:'true'}}),{mode:0o600});
const logFile=join(temp,'workerd.log');
await writeFile(logFile,'',{mode:0o600});
const child=Bun.spawn(['bunx','wrangler','dev','--local','--config',configFile,'--port',String(port),'--ip','127.0.0.1'],{
  env:{...process.env,CLOUDFLARE_SEND_METRICS:'false'},stdout:Bun.file(logFile),stderr:Bun.file(logFile),
});
const base=`http://127.0.0.1:${port}`;
let token:string|undefined;
const sql=postgres(databaseUrl,{max:1});
let passed=false;
try {
  let started=false;
  for(let attempt=0;attempt<120;attempt++) {
    if(child.exitCode!==null) throw new Error('Local Worker exited before becoming ready');
    try {const r=await fetch(`${base}/health`);if(r.status===200){started=true;break;}}catch{}
    await Bun.sleep(250);
  }
  assert(started,'Local Worker failed to start');
  console.log('workerd GET /health: 200');
  for(let request=0;request<2;request++) {
    const ready=await fetch(`${base}/ready`);
    assert.equal(ready.status,200,'Readiness/database connection');
    console.log(`workerd GET /ready (separate request ${request+1}): 200`);
  }
  const unauthenticated=await fetch(`${base}/admissions`);
  assert.equal(unauthenticated.status,401);
  const login=await fetch(`${base}/auth/login`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email:'arjun+mehta@klinik.com',password:'password'})});
  assert.equal(login.status,200,'QA login under workerd');
  const session=await login.json() as {token:string};
  token=session.token;
  assert(token);
  console.log('workerd POST /auth/login: 200');
  const [admission]=await sql`SELECT id FROM clinical.admissions WHERE assigned_doctor_id='11000000-0000-4000-8000-000000000001' ORDER BY id LIMIT 1`;
  assert(admission,'QA admission exists');
  const paths=['/patients','/admissions',`/admissions/${admission.id}/vitals`,`/admissions/${admission.id}/notes`];
  for(const path of paths) {
    const response=await fetch(`${base}${path}`,{headers:{authorization:`Bearer ${token}`}});
    assert.equal(response.status,200,`GET ${path}`);
    const data=await response.json();
    assert(data);
    console.log(`workerd GET ${path}: 200`);
  }
  const headers={authorization:`Bearer ${token}`,'content-type':'application/json'};
  const ownAdmissions=await sql`SELECT id FROM clinical.admissions WHERE assigned_doctor_id='11000000-0000-4000-8000-000000000001' ORDER BY id`;
  const ids=ownAdmissions.map(row=>row.id as string);
  assert(ids.length>0 && ids.length<=100);
  for(const batch of [[admission.id],ids,Array(100).fill(admission.id)]) {
    const response=await fetch(`${base}/dashboard/census-cards`,{method:'POST',headers,body:JSON.stringify({ids:batch})});
    assert.equal(response.status,200,'POST census cards under workerd');
    const cards=await response.json() as {admission_id:string;scores:number[]}[];
    assert(cards.length>0,'Authorized census cards returned');
    for(const card of cards) {
      assert(batch.includes(card.admission_id),'Census result must be requested');
      assert(Array.isArray(card.scores),'PostgreSQL scores must parse as an array');
      assert(card.scores.every(Number.isInteger),'Census scores must be numeric');
    }
  }
  const legacy=await fetch(`${base}/dashboard/census-cards?ids=${admission.id}`,{headers});
  assert.equal(legacy.status,200,'Legacy GET remains compatible during rollout');
  for(const ids of [[],['not-a-uuid'],Array(101).fill(admission.id)]) {
    const invalid=await fetch(`${base}/dashboard/census-cards`,{method:'POST',headers,body:JSON.stringify({ids})});
    assert.equal(invalid.status,400,'Invalid census batches rejected');
  }
  const withoutAuth=await fetch(`${base}/dashboard/census-cards`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({ids:[admission.id]})});
  assert.equal(withoutAuth.status,401,'POST census requires authentication');
  console.log('workerd census: POST batches through 100 IDs, numeric arrays, legacy GET, validation and authentication passed');
  passed=true;
  console.log('Local Workers runtime smoke test passed. No deployment performed.');
} catch(error) {
  console.error(`Private workerd diagnostics retained at ${logFile}`);
  throw error;
} finally {
  child.kill();await child.exited;
  if(token) await sql`DELETE FROM staff.sessions WHERE token=${token}`;
  await sql.end();
  if(passed) await rm(temp,{recursive:true,force:true});
}
