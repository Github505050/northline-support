import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../server/worker.js';
const ORIGIN='https://github505050.github.io';
const env={ALLOWED_ORIGIN:ORIGIN,GEMINI_API_KEY:'test-key',AI_RATE_LIMITER:{limit:async()=>({success:true})}};
const req=(path,body,origin=ORIGIN,method='POST')=>new Request('https://example.workers.dev'+path,{method,headers:{Origin:origin,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});
test('restricts origin',async()=>{assert.equal((await worker.fetch(req('/chat',{message:'hi'},'https://elsewhere.example'),env)).status,403)});
test('accepts legitimate preflight',async()=>{const r=await worker.fetch(req('/chat',null,ORIGIN,'OPTIONS'),env);assert.equal(r.status,204);assert.equal(r.headers.get('access-control-allow-origin'),ORIGIN)});
test('validates payload and requires rate-limiter binding',async()=>{
  assert.equal((await worker.fetch(req('/chat',{message:'x'.repeat(401)}),env)).status,400);
  assert.equal((await worker.fetch(req('/chat',{message:'hello',history:[{role:'admin',text:'x'}]}),env)).status,400);
  assert.equal((await worker.fetch(req('/chat',{message:'hi'}),{...env,AI_RATE_LIMITER:null})).status,503);
});
test('rejects excessive use',async()=>{
  const r=await worker.fetch(req('/chat',{message:'hi'}),{...env,AI_RATE_LIMITER:{limit:async()=>({success:false})}});
  assert.equal(r.status,429);
});
test('fictional order lookup is deterministic even when AI configured',async()=>{
  const r=await worker.fetch(req('/chat',{message:'Track NS-1042'}),env);
  assert.equal(r.status,200);const data=await r.json();assert.equal(data.mode,'demo-order');assert.match(data.reply,/fictional sample data/);
});
test('missing API key reports demo status',async()=>{
  const r=await worker.fetch(req('/health',null,ORIGIN,'GET'),{...env,GEMINI_API_KEY:undefined});
  assert.equal((await r.json()).mode,'demo');
});
