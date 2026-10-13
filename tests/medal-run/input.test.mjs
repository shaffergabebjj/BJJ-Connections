import test from 'node:test';
import assert from 'node:assert/strict';
import {RunInput} from '../../game/input.js';
import {Runner,STEP} from '../../game/engine.js';

class Surface{
  constructor(width=390,height=450){this.width=width;this.height=height;this.handlers={};}
  addEventListener(name,fn){this.handlers[name]=fn;}
  setPointerCapture(){}
  getBoundingClientRect(){return{width:this.width,height:this.height};}
  send(name,props={}){this.handlers[name]?.({pointerId:1,clientX:170,clientY:240,timeStamp:0,button:0,preventDefault(){},...props});}
}
function fixture(width=390,height=450){
  const canvas=new Surface(width,height),buttons={jump:new Surface(),roll:new Surface(),shrimp:new Surface()},actions=[],states=[];
  let active=true;
  const input=new RunInput({canvas,buttons,active:()=>active,action:(name,hold)=>actions.push([name,hold]),lowState:(roll,shrimp)=>states.push({roll,shrimp})});
  return{input,canvas,buttons,actions,states,deactivate:()=>active=false};
}
test('swipe up fires during movement, once, with no release jump',()=>{
  const f=fixture();f.canvas.send('pointerdown');f.canvas.send('pointermove',{clientY:212,timeStamp:35});
  assert.deepEqual(f.actions,[['jump',false]]);
  f.canvas.send('pointermove',{clientY:140,timeStamp:75});f.canvas.send('pointerup',{clientY:140,timeStamp:90});
  assert.equal(f.actions.length,1);
});
test('two separate upward swipes map to exactly two jump inputs',()=>{
  const f=fixture();for(let i=0;i<2;i++){f.canvas.send('pointerdown',{timeStamp:i*180});f.canvas.send('pointermove',{clientY:200,timeStamp:i*180+30});f.canvas.send('pointerup',{clientY:200,timeStamp:i*180+50});}
  assert.deepEqual(f.actions,[['jump',false],['jump',false]]);
});
test('down, left and diagonal intent are locked to one move',()=>{
  for(const [x,y,name] of [[170,280,'roll'],[120,240,'shrimp'],[145,200,'jump'],[205,250,'roll']]){
    const f=fixture();f.canvas.send('pointerdown');f.canvas.send('pointermove',{clientX:x,clientY:y,timeStamp:40});f.canvas.send('pointerup',{clientX:x,clientY:y,timeStamp:50});assert.deepEqual(f.actions,[[name,false]]);
  }
});
test('small taps jump, held touches and canceled gestures do not',()=>{
  const f=fixture();f.canvas.send('pointerdown');f.canvas.send('pointerup',{timeStamp:80});assert.equal(f.actions.length,1);
  f.canvas.send('pointerdown');f.canvas.send('pointerup',{timeStamp:800});assert.equal(f.actions.length,1);
  f.canvas.send('pointerdown');f.canvas.send('pointercancel');f.canvas.send('pointerup',{timeStamp:100});assert.equal(f.actions.length,1);
});
test('threshold stays usable at phone, narrow phone and desktop sizes',()=>{
  for(const [w,h,delta] of [[320,290,18],[390,450,22],[1200,560,30]]){const f=fixture(w,h);f.canvas.send('pointerdown');f.canvas.send('pointermove',{clientY:240-delta,timeStamp:20});assert.equal(f.actions.length,1);}
});
test('multiple buttons and keyboard holds release independently',()=>{
  const f=fixture();f.buttons.roll.send('pointerdown',{pointerId:1});f.buttons.shrimp.send('pointerdown',{pointerId:2});f.input.press('key:ArrowDown','roll');
  f.buttons.roll.send('pointerup',{pointerId:1});assert.deepEqual(f.states.at(-1),{roll:true,shrimp:true});
  f.buttons.shrimp.send('pointercancel',{pointerId:2});assert.deepEqual(f.states.at(-1),{roll:true,shrimp:false});
  f.input.release('key:ArrowDown');assert.deepEqual(f.states.at(-1),{roll:false,shrimp:false});
});
test('roll and jump can be pressed together without duplicate native clicks',()=>{
  const f=fixture();f.buttons.roll.send('pointerdown',{pointerId:1});f.buttons.jump.send('pointerdown',{pointerId:2});
  f.buttons.jump.send('click',{detail:1});assert.deepEqual(f.actions,[['roll',true],['jump',true]]);
  f.buttons.jump.send('click',{detail:0});assert.deepEqual(f.actions.at(-1),['jump',false]);
});
test('pause clears capture state and rejects all gameplay inputs',()=>{
  const f=fixture();f.buttons.roll.send('pointerdown');f.canvas.send('pointerdown');f.deactivate();f.input.clear();
  f.buttons.jump.send('pointerdown',{pointerId:2});f.canvas.send('pointermove',{clientY:180});f.canvas.send('pointerup',{timeStamp:80});
  assert.equal(f.actions.length,1);assert.deepEqual(f.states.at(-1),{roll:false,shrimp:false});
});
test('swipe pulses create low posture and shrimp, then expire without stuck holds',()=>{
  const g=new Runner({seed:1});g.objects=[];g.terrain=[];g.next=1e10;g.pulse('shrimp');
  for(let i=0;i<24;i++)g.step(STEP);assert(g.p.roll>0);assert(g.p.x<72);assert.equal(g.p.rollHeld,false);
  for(let i=0;i<144;i++)g.step(STEP);assert.equal(g.p.roll,0);assert.equal(g.p.shrimpTime,0);assert(g.p.x>87);
});

test('release-only swipes still resolve correctly if a device coalesces move events',()=>{const f=fixture();f.canvas.send('pointerdown');f.canvas.send('pointerup',{clientY:185,timeStamp:90});assert.deepEqual(f.actions,[['jump',false]]);});
