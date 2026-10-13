import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const els=new Map(),listeners={},tools=[];let raf;
const context=new Proxy({},{get:(t,k)=>t[k]??(()=>{}),set:(t,k,v)=>(t[k]=v,true)});
class Element{
constructor(id='',tag='DIV'){this.id=id;this.tagName=tag.toUpperCase();this.children=[];this.dataset={};this.hidden=false;this.style={};this.listeners={};this.classList={add(){},remove(){},toggle(){}};this.open=false;this.textContent='';this.value='';this.type='';if(id)els.set(id,this);}
set innerHTML(html){for(const child of this.children)if(child.id&&els.get(child.id)===child)els.delete(child.id);this.html=html;this.children=[];const re=/<([a-z][a-z0-9-]*)\b([^>]*)>/gi;for(const [,tag,attrs]of html.matchAll(re)){const el=new Element('',tag);for(const [,name,value]of attrs.matchAll(/([\w-]+)="([^"]*)"/g)){if(name==='id'){el.id=value;els.set(value,el);}else if(name.startsWith('data-'))el.dataset[name.slice(5).replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]=value;else el[name]=value;}if(/class=/.test(attrs))el.className=el.class;if(/\bchecked\b/.test(attrs))el.checked=true;if(/\bdisabled\b/.test(attrs))el.disabled=true;this.children.push(el);}}
get innerHTML(){return this.html||''}append(c){this.children.push(c)}addEventListener(k,fn){this.listeners[k]=fn}setAttribute(k,v){this[k]=v}focus(){globalThis.document.activeElement=this;}getBoundingClientRect(){return{width:960,height:540,left:0,right:960,top:0,bottom:540}}getContext(){return context}showModal(){this.open=true}close(){this.open=false}setPointerCapture(){}click(){this.onclick?.({target:this})}querySelectorAll(selector){if(selector==='button,a[href]')return this.children.filter(e=>e.tagName==='BUTTON'||e.tagName==='A');const key=selector.match(/\[data-([^\]]+)\]/)?.[1]?.replace(/-([a-z])/g,(_,c)=>c.toUpperCase());return [...this.children,...(this.id==='panel'?els.get('panel-body').children:[])].filter(e=>key in e.dataset);}}
const root=new Element('root');root.innerHTML=fs.readFileSync(new URL('../../game/index.html',import.meta.url),'utf8');
const mem=new Map();globalThis.window={localStorage:{getItem:k=>mem.get(k)||null,setItem:(k,v)=>mem.set(k,v)},addEventListener:(k,fn)=>{listeners[k]=fn},confirm:()=>true};globalThis.document={getElementById:id=>els.get(id),querySelectorAll:s=>root.querySelectorAll(s),querySelector:s=>root.children.find(e=>(e.className||'').split(' ').includes(s.slice(1))),documentElement:{classList:{add(){},remove(){},toggle(){}}},addEventListener:(k,fn)=>{listeners[k]=fn},createElement:t=>new Element('',t),modelContext:{registerTool:t=>tools.push(t)}};globalThis.requestAnimationFrame=f=>raf=f;
await import('../../game/app.js');const status=()=>tools.find(t=>t.name==='get_game_status').execute({});let now=0;const frames=n=>{for(let i=0;i<n;i++){now+=1000/60;raf(now)}};
test('all menus open and expose working content',()=>{for(const button of root.querySelectorAll('[data-page]')){button.click();assert(els.get('panel').open);assert(els.get('panel-body').innerHTML.length>200);els.get('close-panel').click();assert(!els.get('panel').open);}});
test('athlete can be named from home, stored, reopened and shown in the run HUD',()=>{
  els.get('home-athlete').click();assert(els.get('panel').open);assert(els.get('athlete-preview'));assert.equal(els.get('athlete-name').value,'Athlete');
  els.get('athlete-name').value='  Gabe   Shaffer  ';els.get('athlete-form').onsubmit({preventDefault(){}});
  assert.equal(status().athleteName,'Gabe Shaffer');assert.equal(els.get('athlete-name').value,'Gabe Shaffer');assert.match(els.get('name-status').textContent,/Name saved/);
  assert.equal(JSON.parse(JSON.parse(mem.get('medal-run-save')).payload).profile.name,'Gabe Shaffer');
  els.get('close-panel').click();els.get('home-athlete').click();assert.equal(els.get('athlete-name').value,'Gabe Shaffer');
  // Names are assigned as values or text, never interpolated as HTML.
  els.get('athlete-name').value='<b>Gabe</b>';els.get('athlete-form').onsubmit({preventDefault(){}});assert(!els.get('panel-body').innerHTML.includes('<b>Gabe</b>'));
  assert.equal(els.get('home-athlete').textContent,'<b>Gabe</b> · EDIT ATHLETE ↗');
  els.get('athlete-name').value='Gabe';els.get('athlete-form').onsubmit({preventDefault(){}});els.get('close-panel').click();
  els.get('play').click();assert.equal(els.get('run-athlete').textContent,'Gabe');els.get('pause').click();els.get('quit').click();assert.equal(els.get('result-athlete').textContent,'Gabe · White belt');els.get('return-home').click();
});
test('full run, pause/resume, death, restart, menu return and persisted XP',()=>{els.get('play').click();assert.equal(status().mode,'run');frames(90);els.get('pause').click();assert.equal(status().paused,true);const d=status().distance;frames(60);assert.equal(status().distance,d);els.get('resume').click();frames(500);assert.equal(status().mode,'results');const earned=status().xp;assert(earned>0);assert(!els.get('results').hidden);els.get('again').click();assert.equal(status().mode,'run');assert.equal(status().distance,0);assert.equal(status().xp,earned);frames(400);assert.equal(status().mode,'results');els.get('return-home').click();assert.equal(status().mode,'home');assert(mem.has('medal-run-save'));});
test('WebMCP validates arguments and refuses to replace an active run',()=>{const t=tools.find(t=>t.name==='start_endless_run');assert.throws(()=>t.execute({bad:true}));t.execute({});assert.throws(()=>t.execute({}));els.get('pause').click();els.get('quit').click();});
test('R retries even with the results button focused, and resume gives reaction time',()=>{listeners.keydown({code:'KeyR',repeat:false,target:els.get('again'),preventDefault(){}});assert.equal(status().mode,'run');frames(60);els.get('pause').click();const distance=status().distance;els.get('resume').click();frames(30);assert.equal(status().distance,distance);frames(35);assert(status().distance>distance);els.get('pause').click();els.get('quit').click();});

const pointer=(id,type,props={})=>els.get(id).listeners[type]?.({pointerId:1,button:0,clientX:200,clientY:300,timeStamp:now,detail:1,preventDefault(){},...props});
test('actual UI swipe path handles jump, double jump, shrimp, cancel, and pause reset',()=>{
  els.get('again').click();pointer('game','pointerdown');pointer('game','pointermove',{clientY:260});pointer('game','pointerup',{clientY:260});frames(3);assert.equal(status().marker.jumps,1);assert.equal(els.get('jump-state').textContent,'1 JUMP LEFT');
  frames(10);pointer('game','pointerdown');pointer('game','pointermove',{clientY:250});pointer('game','pointerup',{clientY:250});frames(2);assert.equal(status().marker.jumps,2);assert.equal(els.get('jump-state').textContent,'LAND TO RESET');
  pointer('shrimp','pointerdown',{pointerId:3});assert(status().marker.shrimp);pointer('shrimp','pointercancel',{pointerId:3});assert(!status().marker.shrimp);
  pointer('roll','pointerdown');els.get('pause').click();assert(status().paused);els.get('resume').click();frames(70);assert(!status().marker.low);
  els.get('pause').click();els.get('quit').click();
});
test('prominent connection routes are absolute and back link exists in results',()=>{
  assert.equal(els.get('back-connections').href,'https://bjjconnectionsbygabe.com/');assert.match(els.get('results').innerHTML,/href="https:\/\/bjjconnectionsbygabe\.com\/"/);
});

test('results locker edits free appearance, preserves a name draft and saves control preferences',()=>{
  assert.equal(status().mode,'results');els.get('result-locker').click();assert(els.get('panel').open);const coins=JSON.parse(JSON.parse(mem.get('medal-run-save')).payload).coins;
  els.get('athlete-name').value='Pending name';els.get('panel').querySelectorAll('[data-skin]').find(b=>b.dataset.skin==='deep').click();
  assert.equal(els.get('athlete-name').value,'Pending name');els.get('panel').querySelectorAll('[data-hair-style]').find(b=>b.dataset.hairStyle==='bun').click();assert.equal(els.get('athlete-name').value,'Pending name');
  els.get('panel').querySelectorAll('[data-cosmetic]').find(b=>b.dataset.cosmetic==='gi-white').click();assert.equal(els.get('athlete-name').value,'Pending name');
  const data=JSON.parse(JSON.parse(mem.get('medal-run-save')).payload);assert.equal(data.profile.skin,'deep');assert.equal(data.profile.hairStyle,'bun');assert.equal(data.profile.name,'Gabe');assert.equal(data.coins,coins);
  els.get('close-panel').click();els.get('return-home').click();root.querySelectorAll('[data-page]').find(b=>b.dataset.page==='settings').click();
  const settings=els.get('panel').querySelectorAll('[data-setting]');const left=settings.find(e=>e.dataset.setting==='jumpLeft');left.checked=true;left.oninput();const cues=settings.find(e=>e.dataset.setting==='cues');cues.checked=false;cues.oninput();
  const prefs=JSON.parse(JSON.parse(mem.get('medal-run-save')).payload).settings;assert(prefs.jumpLeft);assert(!prefs.cues);
  cues.checked=true;cues.oninput();left.checked=false;left.oninput();els.get('close-panel').click();els.get('play').click();frames(400);assert.equal(status().mode,'results');
});

test('urgent movement cues take priority over the intro and disappear on pause',()=>{
  els.get('again').click();let waited=0;while(els.get('move-cue').hidden&&status().mode==='run'&&waited++<600)frames(1);assert.equal(status().mode,'run');assert(!els.get('move-cue').hidden,JSON.stringify(status()));assert.equal(els.get('cue-action').textContent,'JUMP');assert(els.get('banner').hidden);
  els.get('pause').click();assert(els.get('move-cue').hidden);els.get('quit').click();assert.equal(status().mode,'results');
});

// The ideal player uses the same DOM keyboard events as a real desktop player.
// Capture the simulation only to read the approaching terrain, never to bypass
// collision, progression, fixed steps, save banking, or the UI transitions.
const {Runner}=await import('../../game/engine.js');const originalStep=Runner.prototype.step;let autoplay=false,currentRunner,target=null,jumped=false,doubled=false,jumpTime=0;
const key=(code,type='keydown')=>listeners[type]({code,repeat:false,target:els.get('game'),preventDefault(){}});
const hit=code=>{key(code);key(code,'keyup');};
Runner.prototype.step=function(dt){
  if(autoplay){const g=this,px=g.world+g.p.x;const obstacles=g.objects.filter(o=>o.kind==='obstacle'&&o.x+o.w>px-8);const gaps=g.terrain.filter(o=>o.type==='gap'&&o.x+o.w>px-8);const next=[...obstacles,...gaps].sort((a,b)=>a.x-b.x)[0];
    if(currentRunner!==g||target!==next?.x){currentRunner=g;target=next?.x;jumped=false;doubled=false;}
    if(next){const gap=next.x-px-8;if(next.overhead){if(gap<60)key('ArrowDown');else key('ArrowDown','keyup');}
      else{key('ArrowDown','keyup');if(!jumped&&gap<g.speed*(next.type==='podium'?.30:.16)){hit('ArrowUp');jumped=true;jumpTime=g.time;}
        if(['podium','bench','mats'].includes(next.type)&&jumped&&!doubled&&g.time-jumpTime>(next.type==='podium'?.20:.18)){hit('ArrowUp');doubled=true;}}
    }else key('ArrowDown','keyup');
  }return originalStep.call(this,dt);
};
const saved=()=>JSON.parse(JSON.parse(mem.get('medal-run-save')).payload);
function playUntil(check,maxFrames=48000){let n=0;while(!check()&&n++<maxFrames){if(status().paused)els.get('resume').click();frames(1);}assert(n<maxFrames,'timed out at '+JSON.stringify(status()));}
test('UI checkpoint death and continuation preserve XP, coins and distance stats',()=>{
  autoplay=true;els.get('again').click();playUntil(()=>status().checkpoints>=1);autoplay=false;
  frames(700);assert.equal(status().mode,'results');assert(status().canContinue);const before=saved(),xp=status().xp,coins=status().coins;
  els.get('continue-checkpoint').click();assert.equal(status().mode,'run');assert.equal(status().xp,xp);assert.equal(status().coins,coins);frames(90);
  const after=saved();assert(after.stats.totalDistance>=before.stats.totalDistance);assert(after.stats.playtime>=before.stats.playtime);assert.equal(after.stats.coins,before.stats.coins);
  assert(!status().canContinue);els.get('pause').click();els.get('quit').click();
});
test('full ten-minute UI session reaches all six venues, banks checkpoints and offers a break',()=>{
  autoplay=true;els.get('again').click();playUntil(()=>status().time>=600&&status().paused);assert.equal(status().mode,'run');assert.equal(status().checkpoints,10);assert.match(els.get('pause-title').textContent,/TEN-MINUTE/);
  assert.equal(saved().stats.environments.length,6);assert(status().xp>=420);assert.equal(els.get('story-badge').textContent,'OPEN');assert.equal(els.get('session-fill').style.width,'100%');
  els.get('quit').click();assert.equal(status().mode,'results');els.get('return-home').click();autoplay=false;
});
test('all story chapters unlock sequentially, complete through the UI, and replay without repeat bonuses',()=>{
  autoplay=true;
  for(let i=0;i<4;i++){
    root.querySelectorAll('[data-page]').find(b=>b.dataset.page==='story').click();
    const buttons=els.get('panel').querySelectorAll('[data-chapter]');assert(!buttons[i].disabled);if(i<3)assert(buttons[i+1].disabled);
    buttons[i].click();playUntil(()=>status().mode==='results',12000);assert.match(els.get('results').innerHTML,/CHAPTER COMPLETE/);assert(saved().story.completed.includes(['first-open-mat','early-arrival','camp','main-stage'][i]));assert.match(els.get('results').innerHTML,/Chapter reward:/);els.get('return-home').click();
  }
  root.querySelectorAll('[data-page]').find(b=>b.dataset.page==='story').click();els.get('panel').querySelectorAll('[data-chapter]')[0].click();playUntil(()=>status().mode==='results',12000);assert(!els.get('results').innerHTML.includes('Chapter reward:'));els.get('return-home').click();autoplay=false;
});
test('tab suspend pauses and saves, and new-tab reload can recover the exact rank',async()=>{
  els.get('play').click();frames(60);listeners.blur();assert(status().paused);const distance=status().distance;frames(60);assert.equal(status().distance,distance);
  const {SaveStore}=await import('../../game/save.js');const reloaded=new SaveStore(window.localStorage);assert.equal(reloaded.data.xp,status().xp);assert.equal(reloaded.data.coins,status().coins);assert.equal(reloaded.data.stats.attempts,saved().stats.attempts);els.get('quit').click();
});
