const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
async function run(){
  const handlers={},items=new Map(),puts=[],deleted=[];
  let network=async()=>{throw new Error('offline');};
  const cache={match:async key=>items.get(key)?.clone(),put:async(key,response)=>{puts.push(key);items.set(key,response);}};
  const c={URL,Response,Request,setTimeout:fn=>{queueMicrotask(fn);return 1;},clearTimeout(){},
    self:{location:{origin:'https://bjjconnectionsbygabe.com'},addEventListener:(key,fn)=>handlers[key]=fn,clients:{claim:async()=>{}},skipWaiting:async()=>{}},
    fetch:(...args)=>network(...args),caches:{open:async()=>cache,keys:async()=>['bjj-connections-v38','bjj-connections-v50','another-app'],delete:async key=>deleted.push(key)}};
  vm.createContext(c);vm.runInContext(fs.readFileSync('sw.js','utf8'),c);
  function request(path,mode='navigate',method='GET'){
    const waits=[];let response;
    handlers.fetch({request:{url:'https://bjjconnectionsbygabe.com'+path,mode,method},waitUntil:p=>waits.push(p),respondWith:p=>response=p});
    return {response,finish:()=>Promise.all(waits)};
  }
  let activated;handlers.activate({waitUntil:p=>activated=p});await activated;
  assert.deepEqual(deleted,['bjj-connections-v38'],'never delete another application’s caches');
  items.set('/puzzles.html',new Response('puzzle'));
  assert.equal(await (await request('/puzzles.html?p=42').response).text(),'puzzle');
  items.set('/404.html',new Response('unavailable'));
  assert.equal((await request('/missing.html').response).status,503,'offline unknown routes cannot pretend to be the homepage');
  assert.equal(request('/tracking.gif','no-cors').response,undefined,'do not cache arbitrary requests');
  assert.equal(request('/resources.html','navigate','POST').response,undefined);
  let resolveNetwork;
  network=()=>new Promise(resolve=>{resolveNetwork=resolve;});
  items.set('/style.css',new Response('cached styles'));
  const asset=request('/style.css','cors');
  assert.equal(await (await asset.response).text(),'cached styles','cached assets return without waiting for the network');
  resolveNetwork(new Response('fresh styles'));await asset.finish();
  assert.equal(await items.get('/style.css').clone().text(),'fresh styles');
  const slow=request('/puzzles.html');
  assert.equal(await (await slow.response).text(),'puzzle','slow navigation falls back after a bounded wait');
  resolveNetwork(new Response('updated puzzle'));await slow.finish();
  network=async()=>new Response('server unavailable',{status:503});
  assert.equal(await (await request('/puzzles.html').response).text(),'updated puzzle','server errors fall back to a saved page');
  network=async()=>new Response('resources');
  for(const query of ['?q=guard','?q=choke','?category=Submissions']){
    const r=request('/resources.html'+query);await r.response;await r.finish();
  }
  assert.equal(puts.filter(key=>key.includes('?')).length,0,'filter queries cannot grow the cache');
  console.log('Offline query links, fast cached assets, bounded navigation, cache isolation, and failed-network recovery passed.');
}
run().catch(error=>{console.error(error);process.exitCode=1;});
