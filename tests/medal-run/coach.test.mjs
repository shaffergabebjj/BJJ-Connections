import test from 'node:test';
import assert from 'node:assert/strict';
import {Runner,FLOOR} from '../../game/engine.js';
import {movementCue,jumpsAvailable} from '../../game/coach.js';
const blank=()=>{const g=new Runner({seed:12});g.objects=[];g.terrain=[];return g;};

test('movement cues use world position, ignore passed hazards and hide distant obstacles',()=>{
  const g=blank();g.world=1000;g.add('bag',1400);assert.equal(movementCue(g),null);
  g.add('cone',1080-40);g.add('table',1200);assert.equal(movementCue(g).move,'roll');
  g.world=1100;g.p.roll=.3;assert.equal(movementCue(g).label,'STAY LOW');assert(movementCue(g).urgent);
});

test('higher equipment uses the available second jump without requesting a third',()=>{
  const g=blank();g.add('podium',200);assert.equal(movementCue(g).label,'DOUBLE JUMP');
  g.p.grounded=false;g.p.jumps=1;assert.equal(movementCue(g).label,'JUMP AGAIN');
  g.p.jumps=2;assert.equal(movementCue(g).label,'LAND CLEAR');
  g.p.grounded=true;g.dead=true;assert.equal(movementCue(g),null);g.dead=false;g.complete=true;assert.equal(movementCue(g),null);
});

test('gap cues choose the near terrain edge and raised decks do not demand a jump',()=>{
  const g=blank();g.terrain=[{type:'deck',x:110,w:200,h:14}];assert.equal(movementCue(g),null);
  g.terrain.push({type:'gap',x:120,w:50});assert.equal(movementCue(g).detail,'Cross the mat gap');
  g.p.grounded=false;g.p.y=FLOOR-60;g.p.jumps=1;assert.equal(movementCue(g).detail,'Get past the far edge');
});

test('jump availability matches ground, coyote time, airborne jumps and walking off an edge',()=>{
  const g=blank();assert.equal(jumpsAvailable(g.p),2);
  g.p.grounded=false;g.p.coyote=.03;assert.equal(jumpsAvailable(g.p),2);
  g.p.coyote=0;g.p.jumps=0;assert.equal(jumpsAvailable(g.p),1);
  g.p.jumps=1;assert.equal(jumpsAvailable(g.p),1);g.p.jumps=2;assert.equal(jumpsAvailable(g.p),0);
});
