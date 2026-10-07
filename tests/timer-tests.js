const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const context = {window:{}, document:{getElementById:()=>null}};
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(__dirname,'../round-timer.js'),'utf8'),context);
let time = 0;
const timer = context.window.BJJRoundClock({workSeconds:120,restSeconds:30,rounds:3},()=>time);
assert.equal(timer.snapshot().seconds,120);
timer.start(); time = 125000;
assert.equal(timer.snapshot().label,'Rest');
assert.equal(timer.snapshot().seconds,25,'a delayed callback enters the rest phase at the correct remaining time');
timer.pause(); time += 900000;
assert.equal(timer.snapshot().seconds,25,'paused time does not elapse');
timer.start(); time += 25000;
assert.equal(timer.snapshot().label,'Work');
assert.equal(timer.snapshot().round,2);
assert.equal(timer.snapshot().seconds,120);
time += 400000;
assert.equal(timer.snapshot().finished,true,'a backgrounded timer can cross multiple phases and finish');
assert.equal(timer.snapshot().seconds,0);
assert.equal(timer.snapshot().running,false);
timer.start(); assert.equal(timer.snapshot().finished,true);
time = 0;
const noRest = context.window.BJJRoundClock({workSeconds:60,restSeconds:0,rounds:2},()=>time);
noRest.start();time=60000;
assert.equal(noRest.snapshot().label,'Work');
assert.equal(noRest.snapshot().round,2);
time=120000;
assert.equal(noRest.snapshot().finished,true,'there is no extra rest after the final round');
console.log('Round timer pause/resume, background elapsed time, phase transitions, and completion passed.');

// Exercise the real controls, including options rather than assuming preset values exist.
function controls(stored) {
  const html=fs.readFileSync(path.join(__dirname,'../training.html'),'utf8');
  const nodes=new Map();let now=0,tick;
  const storage=new Map(stored === undefined ? [] : [['bjjTimerSettings',stored]]);
  function node(){return {value:'',dataset:{},events:{},textContent:'',attrs:{},classList:{toggle(){}},addEventListener(k,fn){this.events[k]=fn;},getAttribute(k){return this.attrs[k];},setAttribute(k,v){this.attrs[k]=v;}};}
  for(const [,id] of html.matchAll(/id="([^"]+)"/g))nodes.set(id,node());
  for(const [,id,body] of html.matchAll(/<select[^>]*id="(timer[^"]+)"[^>]*>([\s\S]*?)<\/select>/g)){
    const options=[...body.matchAll(/<option value="([^"]+)"( selected)?/g)].map(m=>({value:m[1],selected:!!m[2]}));
    nodes.get(id).options=options;nodes.get(id).value=(options.find(o=>o.selected)||options[0]).value;
  }
  const presets=[...html.matchAll(/data-timer-preset="([^"]+)"/g)].map(m=>{const n=node();n.attrs['data-timer-preset']=m[1];return n;});
  const c={window:{},Date:{now:()=>now},document:{getElementById:id=>nodes.get(id),querySelectorAll:()=>presets,addEventListener(){}},localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},setInterval:fn=>{tick=fn;return 1;},clearInterval(){}};
  vm.createContext(c);vm.runInContext(fs.readFileSync(path.join(__dirname,'../round-timer.js'),'utf8'),c);
  return {nodes,presets,storage,advance:ms=>{now+=ms;tick?.();}};
}
const ui=controls(),n=ui.nodes;
ui.presets[1].events.click();
assert.equal(n.get('timerDisplay').textContent,'01:00');
assert.equal(n.get('timerRounds').value,'10');
assert.match(n.get('timerTotal').textContent,/14 min 30 sec/);
n.get('timerStart').events.click();assert(ui.presets.every(p=>p.disabled));
ui.advance(1000);assert.equal(n.get('timerDisplay').textContent,'00:59');
n.get('timerStart').events.click();assert.match(n.get('timerPhase').textContent,/Paused/);
ui.presets[0].events.click();assert.equal(n.get('timerWork').value,'1','presets cannot alter a paused session');
n.get('timerReset').events.click();assert(ui.presets.every(p=>!p.disabled));
ui.presets[0].events.click();assert.equal(n.get('timerWork').value,'3');
const restored=controls(ui.storage.get('bjjTimerSettings'));assert.equal(restored.nodes.get('timerWork').value,'3');
for(const value of ['null','{}','["1","30","999"]','{broken'])assert.equal(controls(value).nodes.get('timerWork').value,'5');
n.get('timerStart').events.click();ui.advance(30*60*1000);
assert.equal(n.get('timerPhase').textContent,'Session complete');assert(ui.presets.every(p=>!p.disabled));
ui.presets[1].events.click();assert.equal(n.get('timerDisplay').textContent,'01:00','completion unlocks presets');
console.log('Real timer presets, total time, paused locks, saved settings, and completion controls passed.');
