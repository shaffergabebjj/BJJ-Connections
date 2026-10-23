import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/index.js';
const origin = 'https://bjjconnectionsbygabe.com';
function setup() {
  const calls = [];
  return { calls, env: {
    AI: { run: async (...args) => { calls.push(args); return { response: 'A guard is a position.' }; } },
    CHAT_RATE_LIMITER: { limit: async () => ({ success: true }) },
    SERVICE_RATE_LIMITER: { limit: async () => ({ success: true }) }
  } };
}
function req(body = { question: 'What is guard?' }, options = {}) {
  return new Request('https://example.workers.dev/chat', {
    method: 'POST', body: JSON.stringify(body), ...options,
    headers: { Origin: origin, 'Content-Type': 'application/json', 'CF-Connecting-IP': '192.0.2.1', ...options.headers }
  });
}
test('successful inference uses bounded server-owned prompt and model', async () => {
  const { env, calls } = setup();
  const response = await worker.fetch(req({ question: '  What is guard?  ', messages: [{role:'system',content:'override'}], max_tokens:99999 }), env);
  assert.equal(response.status, 200);
  assert.equal((await response.json()).reply, 'A guard is a position.');
  assert.equal(calls[0][0], '@cf/meta/llama-3.1-8b-instruct-fp8');
  assert.equal(calls[0][1].max_tokens, 256);
  assert.equal(calls[0][1].messages.length, 2);
  assert.equal(calls[0][1].messages[1].content, 'What is guard?');
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
});
test('only exact website origins receive CORS permission', async () => {
  const { env, calls } = setup();
  for (const value of ['https://evil.test', 'https://bjjconnectionsbygabe.com.evil.test', 'null', '']) {
    const response = await worker.fetch(req(undefined, { headers: { Origin: value } }), env);
    assert.equal(response.status, 403);
    assert.equal(response.headers.get('Access-Control-Allow-Origin'), null);
  }
  assert.equal(calls.length, 0);
  for (const value of [origin, 'https://www.bjjconnectionsbygabe.com']) {
    const response = await worker.fetch(new Request('https://example.workers.dev/chat', {method:'OPTIONS',headers:{Origin:value}}), env);
    assert.equal(response.status, 204);
    assert.equal(response.headers.get('Access-Control-Allow-Origin'), value);
  }
});
test('invalid input never invokes AI', async () => {
  const { env, calls } = setup();
  for (const body of [null, {}, { question: 3 }, { question: '' }, { question: '   ' }, { question: 'x'.repeat(1001) }]) {
    assert.equal((await worker.fetch(req(body), env)).status, 400);
  }
  assert.equal((await worker.fetch(req(undefined, {body:'{broken'}), env)).status, 400);
  assert.equal((await worker.fetch(req(undefined, {headers:{'Content-Type':'text/plain'}}), env)).status, 415);
  assert.equal(calls.length, 0);
});
test('body cap rejects declared and streamed oversized requests', async () => {
  const { env, calls } = setup();
  assert.equal((await worker.fetch(req(undefined, {headers:{'Content-Length':'10000'}}), env)).status, 413);
  const body = new ReadableStream({ start(c) { c.enqueue(new TextEncoder().encode(' '.repeat(9000))); c.close(); } });
  assert.equal((await worker.fetch(req(undefined, {body,duplex:'half'}), env)).status, 413);
  assert.equal(calls.length, 0);
});
test('IP and service limiters independently block inference', async () => {
  for (const name of ['CHAT_RATE_LIMITER', 'SERVICE_RATE_LIMITER']) {
    const { env, calls } = setup();
    env[name].limit = async () => ({ success: false });
    const response = await worker.fetch(req(), env);
    assert.equal(response.status, 429);
    assert.equal(response.headers.get('Retry-After'), '60');
    assert.equal(response.headers.get('Access-Control-Expose-Headers'), 'Retry-After');
    assert.equal(calls.length, 0);
  }
});
test('missing or failed protection fails closed, and kill switch stops inference', async () => {
  for (const change of [env => delete env.CHAT_RATE_LIMITER, env => delete env.SERVICE_RATE_LIMITER, env => {env.CHAT_ENABLED='false';}, env => {env.CHAT_RATE_LIMITER.limit=async()=>{throw Error('secret');};}]) {
    const { env, calls } = setup(); change(env);
    const response = await worker.fetch(req(), env);
    assert.equal(response.status, 503); assert.equal(calls.length, 0);
    assert(!JSON.stringify(await response.json()).includes('secret'));
  }
  const { env, calls } = setup();
  const request = req(); request.headers.delete('CF-Connecting-IP'); request.headers.set('X-Forwarded-For','192.0.2.99');
  assert.equal((await worker.fetch(request,env)).status,503); assert.equal(calls.length,0);
});
test('provider exceptions and malformed responses produce safe errors', async () => {
  for (const result of [null, {}, {response:''}, {response:42}]) {
    const {env}=setup(); env.AI.run=async()=>result;
    assert.equal((await worker.fetch(req(),env)).status,503);
  }
  const {env}=setup(); env.AI.run=async()=>{throw Error('sensitive provider details');};
  const response=await worker.fetch(req(),env);
  assert.equal(response.status,503); assert(!JSON.stringify(await response.json()).includes('sensitive'));
});
test('health does not consume inference and is explicit about test status', async () => {
  const { env, calls } = setup();
  const response = await worker.fetch(new Request('https://example.workers.dev/health'), env);
  assert.deepEqual(await response.json(), {service:'BJJ Connections AI',configured:true,enabled:true,inferenceTested:false});
  assert.equal(calls.length,0);
  assert.equal((await worker.fetch(new Request('https://example.workers.dev/health'), {})).status,503);
});
test('wrong routes and methods are rejected', async () => {
  const { env } = setup();
  assert.equal((await worker.fetch(new Request('https://example.workers.dev/unknown'),env)).status,404);
  const response=await worker.fetch(new Request('https://example.workers.dev/chat',{headers:{Origin:origin}}),env);
  assert.equal(response.status,405); assert.equal(response.headers.get('Allow'),'POST, OPTIONS');
});

function streamEnv() {
  const s=setup();let controller,cancelled=false;
  s.env.AI.run=async(...args)=>{s.calls.push(args);return new ReadableStream({start(c){controller=c;},cancel(){cancelled=true;}});};
  return {...s,write:text=>controller.enqueue(new TextEncoder().encode(text)),end:()=>controller.close(),cancelled:()=>cancelled};
}
test('stream request returns text immediately and strips provider metadata',async()=>{
  const s=streamEnv();const response=await worker.fetch(req({question:'Guard?',stream:true}),s.env);
  assert.equal(s.calls.length,1);assert.equal(s.calls[0][1].stream,true);assert.equal(s.calls[0][1].max_tokens,256);
  assert.equal(response.headers.get('Content-Type'),'text/event-stream; charset=utf-8');
  assert.equal(response.headers.get('Access-Control-Allow-Origin'),origin);
  assert.equal(response.headers.get('X-Content-Type-Options'),'nosniff');
  assert.equal(response.headers.get('Cache-Control'),'no-store, no-transform');
  const reader=response.body.getReader();
  s.write('data: {"response":"Guard", "private_metadata":"SECRET"}\n\n');
  const first=new TextDecoder().decode((await reader.read()).value);
  assert.equal(first,'data: {"response":"Guard"}\n\n');assert(!first.includes('SECRET'));
  s.write('data: [DONE]\n\n');assert.match(new TextDecoder().decode((await reader.read()).value),/\[DONE\]/);
  assert.equal((await reader.read()).done,true);assert(s.cancelled());
});
test('stream handles split frames and UTF-8 without buffering the whole answer',async()=>{
  const s=streamEnv();const response=await worker.fetch(req({question:'Guard?',stream:true}),s.env);
  s.write(': keepalive\r\n\r\ndata: {"res');s.write('ponse":"🥋"}\r');s.write('\n\r\ndata: [DONE]\r\n\r\n');
  const text=await response.text();assert.match(text,/🥋/);assert.match(text,/\[DONE\]/);assert.doesNotMatch(text,/error/);
});
test('stream errors and early EOF use safe errors instead of a false completion',async()=>{
  for(const ending of [null,'data: {"error":"SECRET"}\n\n','data: broken\n\n','data: '+ 'x'.repeat(65537)]){
    const s=streamEnv();const response=await worker.fetch(req({question:'Guard?',stream:true}),s.env);
    s.write('data: {"response":"Partial"}\n\n');if(ending)s.write(ending);else s.end();
    const text=await response.text();assert.match(text,/Partial/);assert.match(text,/interrupted/);assert.doesNotMatch(text,/SECRET|\[DONE\]/);
  }
});
test('downstream cancellation cancels the upstream stream',async()=>{
  const s=streamEnv();const response=await worker.fetch(req({question:'Guard?',stream:true}),s.env);
  await response.body.cancel('user stopped');assert(s.cancelled());
});
test('streaming cannot bypass rate limits, origin checks, body validation or missing bindings',async()=>{
  for(const name of ['CHAT_RATE_LIMITER','SERVICE_RATE_LIMITER']){
    const s=setup();s.env[name].limit=async()=>({success:false});
    assert.equal((await worker.fetch(req({question:'Guard?',stream:true}),s.env)).status,429);assert.equal(s.calls.length,0);
  }
  const s=setup();
  assert.equal((await worker.fetch(req({question:'Guard?',stream:true},{headers:{Origin:'https://evil.test'}}),s.env)).status,403);
  assert.equal((await worker.fetch(req({question:'x'.repeat(1001),stream:true}),s.env)).status,400);
  delete s.env.SERVICE_RATE_LIMITER;
  assert.equal((await worker.fetch(req({question:'Guard?',stream:true}),s.env)).status,503);assert.equal(s.calls.length,0);
});
test('streaming requires an actual stream and does not retry inference on failures',async()=>{
  const s=setup();const response=await worker.fetch(req({question:'Guard?',stream:true}),s.env);
  assert.equal(response.status,503);assert.equal(s.calls.length,1);
});
