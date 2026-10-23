const test=require('node:test'), assert=require('node:assert/strict'), vm=require('node:vm'), fs=require('node:fs');
function setup({endpoint='https://example.workers.dev/chat',online=true,fetcher=async()=>({ok:true,json:async()=>({reply:'A guard is a position.'})})}={}) {
  const nodes=[];
  class Element {
    constructor(tag){this.tag=tag;this.children=[];this.listeners={};this.attrs={};this.value='';nodes.push(this);}
    setAttribute(k,v){this.attrs[k]=v;}
    append(...children){this.children.push(...children);}
    addEventListener(k,fn){this.listeners[k]=fn;}
    focus(){this.focused=true;}
    showModal(){this.open=true;}
    close(){this.open=false;this.listeners.close?.();}
    setCustomValidity(v){this.validation=v;}
    reportValidity(){}
  }
  const body=new Element('body'); const window={BJJ_AI_CONFIG:{endpoint},addEventListener(){}};
  const navigator={onLine:online}; let timer, timerId=0; const timers=new Map();
  const context={window,navigator,document:{body,createElement:t=>new Element(t),getElementById:id=>nodes.find(n=>n.id===id)},URL,AbortController,TextDecoder,TypeError,Date,fetch:fetcher,setTimeout:(fn,ms)=>{timer=fn;timers.set(++timerId,{fn,ms});return timerId;},clearTimeout:id=>timers.delete(id),setInterval:()=>1,clearInterval(){}};
  vm.runInNewContext(fs.readFileSync('bjj-ai.js','utf8'),context);
  const get=cls=>nodes.find(n=>n.className===cls);
  return {nodes,body,get,navigator,timers,timer:()=>timer,submit:()=>get('bjj-ai-form').listeners.submit({preventDefault(){}})};
}
test('unconfigured and invalid endpoints hide the UI without network calls',()=>{
  for(const endpoint of ['', 'http://example.test', 'javascript:alert(1)', 'https://user:pass@example.test', 'https://example.test?token=x']) assert.equal(setup({endpoint}).body.children.length,0);
});
test('dialog supports close and focus return',()=>{
  const s=setup();s.get('bjj-ai-launch').listeners.click();assert.equal(s.get('bjj-ai-dialog').open,true);
  assert(s.nodes.find(n=>n.tag==='textarea').focused);
  s.get('bjj-ai-close').listeners.click();assert.equal(s.get('bjj-ai-dialog').open,false);assert(s.get('bjj-ai-launch').focused);
});
test('HTML-looking model replies remain text and requests omit credentials',async()=>{
  let request; const s=setup({fetcher:async(url,options)=>{request=options;return {ok:true,json:async()=>({reply:'<img src=x onerror=alert(1)>'})};}});
  s.nodes.find(n=>n.tag==='textarea').value='What is guard?';await s.submit();
  assert.equal(s.get('bjj-ai-output').textContent,'<img src=x onerror=alert(1)>');
  assert.equal(s.get('bjj-ai-output').innerHTML,undefined);assert.equal(request.credentials,'omit');assert.equal(request.cache,'no-store');
  assert.equal(s.get('bjj-ai-send').disabled,false);
});
test('offline and blank requests never fetch',async()=>{
  let calls=0;const s=setup({online:false,fetcher:async()=>calls++});s.nodes.find(n=>n.tag==='textarea').value='guard';await s.submit();assert.equal(calls,0);
  s.navigator.onLine=true;s.nodes.find(n=>n.tag==='textarea').value='   ';await s.submit();assert.equal(calls,0);
});
test('duplicate submits are ignored and timeout recovers controls',async()=>{
  let calls=0;const s=setup({fetcher:(_url,{signal})=>{calls++;return new Promise((resolve,reject)=>signal.addEventListener('abort',()=>reject(Object.assign(new Error(),{name:'AbortError'}))));}});
  s.nodes.find(n=>n.tag==='textarea').value='guard';const pending=s.submit();await s.submit();assert.equal(calls,1);s.timer()();await pending;
  assert.match(s.get('bjj-ai-output').textContent,/too long/);assert.equal(s.get('bjj-ai-send').disabled,false);
});
test('429 prevents immediate retry',async()=>{
  let calls=0;const s=setup({fetcher:async()=>{calls++;return {status:429,headers:{get:()=>60}};}});
  s.nodes.find(n=>n.tag==='textarea').value='guard';await s.submit();await s.submit();assert.equal(calls,1);assert(s.get('bjj-ai-send').disabled);assert.match(s.get('bjj-ai-connection').textContent,/wait/);
});
test('service failure and invalid responses recover controls',async()=>{
  for(const response of [{ok:false,status:503},{ok:true,json:async()=>({})}]){
    const s=setup({fetcher:async()=>response});s.nodes.find(n=>n.tag==='textarea').value='guard';await s.submit();assert.equal(s.get('bjj-ai-send').disabled,false);assert.notEqual(s.get('bjj-ai-output').textContent,'Thinking…');
  }
});
test('all main pages load configuration before chat and assets are cached',()=>{
  for(const name of ['index','puzzles','techniques','resources','training','competition','about']){
    const html=fs.readFileSync(name+'.html','utf8');assert(html.includes('href="bjj-ai.css"'));assert(html.indexOf('src="bjj-ai-config.js"')<html.indexOf('src="bjj-ai.js"'));
  }
  const sw=fs.readFileSync('sw.js','utf8');for(const file of ['bjj-ai.css','bjj-ai-config.js','bjj-ai.js'])assert(sw.includes('"/'+file+'"'));
});

const tick=()=>new Promise(resolve=>setImmediate(resolve));
function streamingSetup() {
  let controller, options, cancelled=false;
  const body=new ReadableStream({start(c){controller=c;},cancel(){cancelled=true;}});
  const s=setup({fetcher:async(_url,opts)=>{
    options=opts;
    opts.signal.addEventListener('abort',()=>controller.error(Object.assign(new Error(),{name:'AbortError'})));
    return new Response(body,{headers:{'Content-Type':'text/event-stream'}});
  }});
  s.nodes.find(n=>n.tag==='textarea').value='What is guard?';
  return {...s,write:bytes=>controller.enqueue(typeof bytes==='string'?new TextEncoder().encode(bytes):bytes),end:()=>controller.close(),options:()=>options,cancelled:()=>cancelled};
}
test('text appears before completion, UTF-8 and SSE boundaries can split anywhere',async()=>{
  const s=streamingSetup();const pending=s.submit();await tick();
  assert.equal(JSON.parse(s.options().body).stream,true);
  assert.equal([...s.timers.values()][0].ms,60000);
  assert.equal(s.get('bjj-ai-stop').hidden,false);
  const encoded=new TextEncoder().encode(': heartbeat\r\n\r\ndata: {"response":"🥋 Guard"}\r\n\r\n');
  for(const byte of encoded)s.write(Uint8Array.of(byte));
  await tick();assert.equal(s.get('bjj-ai-output').textContent,'🥋 Guard');
  assert.equal(s.get('bjj-ai-send').textContent,'Generating…');
  assert.equal(s.get('bjj-ai-output').attrs['aria-busy'],'true');
  s.write('data: {"response":" <script>text only</script>"}\n\ndata: [DONE]\n\n');
  await pending;
  assert.equal(s.get('bjj-ai-output').textContent,'🥋 Guard <script>text only</script>');
  assert.equal(s.get('bjj-ai-output').innerHTML,undefined);
  assert.equal(s.get('bjj-ai-output').attrs['aria-busy'],'false');
  assert(s.cancelled());assert.equal(s.timers.size,0);assert.equal(s.get('bjj-ai-stop').hidden,true);
});
test('progress resets the 60-second inactivity deadline; a stall keeps the partial answer',async()=>{
  const s=streamingSetup();const pending=s.submit();await tick();const first=s.timer();
  s.write('data: {"response":"Keep your frames."}\n\n');await tick();
  assert.notEqual(s.timer(),first);assert.equal(s.timers.size,1);
  s.timer()();await pending;
  assert.match(s.get('bjj-ai-output').textContent,/Keep your frames\.[\s\S]*too long[\s\S]*incomplete/);
  assert.equal(s.get('bjj-ai-send').disabled,false);assert.equal(s.timers.size,0);
});
test('closing and stopping cancel the request without timeout errors',async()=>{
  for(const action of ['close','stop']){
    const s=streamingSetup();const pending=s.submit();await tick();
    s.write('data: {"response":"Partial answer"}\n\n');await tick();
    s.get('bjj-ai-'+action).listeners.click();await pending;
    assert(s.options().signal.aborted);
    assert.match(s.get('bjj-ai-output').textContent,/Partial answer[\s\S]*Response stopped/);
    assert.doesNotMatch(s.get('bjj-ai-output').textContent,/too long/);
    assert.equal(s.get('bjj-ai-send').disabled,false);
  }
});
test('EOF, malformed events and provider errors preserve partial text without exposing diagnostics',async()=>{
  for(const ending of [null,'data: not-json\n\n','data: {"error":"SECRET PROVIDER DETAILS"}\n\n']){
    const s=streamingSetup();const pending=s.submit();await tick();
    s.write('data: {"response":"A guard"}\n\n');await tick();
    if(ending)s.write(ending);else s.end();await pending;
    assert.match(s.get('bjj-ai-output').textContent,/A guard[\s\S]*interrupted[\s\S]*incomplete/);
    assert.doesNotMatch(s.get('bjj-ai-output').textContent,/SECRET/);
    assert.equal(s.timers.size,0);
  }
});
test('empty completed stream reports no answer, and oversized frames are bounded',async()=>{
  for(const payload of ['data: [DONE]\n\n', 'data: '+ 'x'.repeat(65537)]){
    const s=streamingSetup();const pending=s.submit();await tick();s.write(payload);await pending;
    assert.match(s.get('bjj-ai-output').textContent,/No answer|interrupted/);assert(s.cancelled());
  }
});
