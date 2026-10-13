import test from 'node:test';
import assert from 'node:assert/strict';
import {Runner,STEP,FLOOR,difficulty,TYPES} from '../../game/engine.js';
import {athleteName,SaveStore,SAVE_KEY,normalize,fresh} from '../../game/save.js';
import {rank,RANK_XP,CHAPTERS,COSMETICS,VERSION} from '../../game/data.js';
const blank=(time=0,jump=0)=>{const g=new Runner({seed:13,jump});g.objects=[];g.terrain=[];g.next=1e12;g.time=time;return g};
const advance=(g,s)=>{for(let i=0;i<Math.ceil(s/STEP);i++)g.step(STEP)};
const storage=()=>{const m=new Map();return{getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,v),m}};
test('adult belt sequence has four stripes before each promotion and ends at black',()=>{assert.equal(rank(0).stripes,0);for(let i=0;i<21;i++){const r=rank(RANK_XP[i]);assert.equal(r.level,i);assert.equal(r.stripes,i===20?0:i%5);}assert.equal(rank(1e9).name,'Black');});
test('save round trip preserves every permanent system and original high score',()=>{const mem=storage();mem.setItem('gabe-medal-best','814');const s=new SaveStore(mem);assert.equal(s.data.stats.legacyBest,814);Object.assign(s.data,{xp:2800,coins:240,upgrades:{jump:2,luck:3},achievements:['first','blue']});s.data.unlocks.push('gi-blue');s.data.equipped.gi='gi-blue';s.data.story.completed=['first-open-mat'];s.data.settings.music=true;assert(s.save());const t=new SaveStore(mem);assert.deepEqual(t.data,s.data);assert.equal(t.data.belt,'Blue');assert.equal(t.data.stripes,2);});
test('damaged primary recovers from last valid backup',()=>{const mem=storage(),s=new SaveStore(mem);s.data.xp=420;s.save();s.data.xp=530;s.save();mem.setItem(SAVE_KEY,'broken');assert.equal(new SaveStore(mem).data.xp,420);});
test('failed writes report failure without erasing in-memory progress',()=>{const s=new SaveStore({getItem:()=>null,setItem(){throw Error('full')}});s.data.xp=900;assert.equal(s.save(),false);assert.equal(s.data.xp,900);assert.equal(s.error,true);});
test('migration adds absent fields and clamps invalid data',()=>{const s=normalize({xp:700,coins:-3,upgrades:{jump:99,luck:NaN},settings:{music:true},equipped:{gi:'injected'},unlocks:[]});assert.equal(s.upgrades.jump,4);assert.equal(s.upgrades.luck,0);assert.equal(s.coins,0);assert.equal(s.equipped.gi,'gi-white');assert.equal(s.stats.runs,0);assert.equal(s.settings.music,true);});
test('export/import is validated and rejects incompatible files before changing progress',()=>{const a=new SaveStore(storage()),b=new SaveStore(storage());a.data.xp=1020;a.save();assert(b.import(a.export()));assert.equal(b.data.xp,1020);assert.throws(()=>b.import('{"bad":1}'));assert.equal(b.data.xp,1020);});
test('jump responds in one simulation step, lands, and permits exactly two airborne jumps',()=>{const g=blank();g.action('jump');g.step(STEP);assert(g.p.vy<0);assert.equal(g.p.jumps,1);advance(g,.15);g.action('jump');g.step(STEP);assert.equal(g.p.jumps,2);assert.equal(g.doubleJumps,1);advance(g,.1);g.action('jump');g.step(STEP);assert.equal(g.p.jumps,2);advance(g,1.2);assert(g.p.grounded);assert.equal(g.p.y,FLOOR);});
test('ground obstacles kill instantly; the same obstacle can be jumped',()=>{const g=blank();g.add('bag',90);g.step(STEP);assert(g.dead);const h=blank();h.p.y=FLOOR-40;h.p.grounded=false;h.p.vy=0;h.add('bag',90);h.step(STEP);assert(!h.dead);});
test('holding roll clears overhead equipment, standing does not',()=>{const g=blank();g.add('table',90);g.step(STEP);assert(g.dead);const h=blank();h.add('table',100);h.action('roll');advance(h,1);assert(!h.dead);assert.equal(h.rollClears,1);});
test('a missed gap kills; coyote time allows a late edge jump',()=>{const g=blank();g.terrain=[{type:'gap',x:88,w:160}];advance(g,.5);assert(g.dead);const h=blank();h.terrain=[{type:'gap',x:88,w:40}];advance(h,.025);h.action('jump');advance(h,.5);assert(!h.dead);assert(h.p.y<FLOOR);});
test('buffered input before landing starts the next jump',()=>{const g=blank();g.p.y=FLOOR-8;g.p.vy=180;g.p.grounded=false;g.p.coyote=0;g.p.jumps=2;g.action('jump');advance(g,.09);assert.equal(g.p.jumps,1);assert(g.p.vy<0);});
test('collectibles award once and effects expire',()=>{const g=blank();g.collect('medal',90,FLOOR-20);g.step(STEP);assert.equal(g.medals,1);assert.equal(g.coins,5);advance(g,.1);assert.equal(g.medals,1);g.effects.magnet=.05;advance(g,.1);assert.equal(g.effects.magnet,0);});
test('difficulty evolves and caps speed without making early starts hard',()=>{assert.equal(difficulty(0).tier,0);assert(difficulty(300).rest<difficulty(0).rest);assert(difficulty(600).tier>difficulty(65).tier);assert.equal(difficulty(600).speed,difficulty(1200).speed);});
test('course generation is deterministic and gives isolated terrain and recovery intervals',()=>{for(const t of [0,60,130,210,360,600,900]){const a=new Runner({seed:42}),b=new Runner({seed:42});assert.deepEqual(a.objects,b.objects);const g=blank(t);g.next=200;g.generate();for(const terrain of g.terrain){assert(!g.objects.some(o=>o.kind==='obstacle'&&o.x<terrain.x+terrain.w&&o.x+o.w>terrain.x));if(terrain.type==='gap')assert(terrain.w<=95);}}});
function solveObstacle(type,time,level){for(let lead=.09;lead<=.32;lead+=.025){for(const doubleAt of [null,.12,.2,.28,.35]){const g=blank(time,level),speed=difficulty(time).speed;g.add(type,200);let jumped=false,doubled=false,jumpTime=0;for(let tick=0;tick<500&&!g.dead;tick++){const gap=200-(g.world+g.p.x+8);if(TYPES[type].overhead){if(gap<70)g.action('roll');}else{if(!jumped&&gap<speed*lead){g.action('jump');jumped=true;jumpTime=g.time;}if(jumped&&!doubled&&doubleAt!==null&&g.time-jumpTime>=doubleAt){g.action('jump');doubled=true;}}g.step(STEP);if(g.world+g.p.x>200+TYPES[type].w+15)return true;}}}return false;}
test('every hazard has a valid movement solution at early, middle and maximum pace, with and without upgrades',()=>{for(const time of [0,150,360,600])for(const level of [0,4])for(const type of Object.keys(TYPES))assert(solveObstacle(type,time,level),`${type}, time=${time}, jump=${level}`);});
test('chapter completions trigger once at their target duration',()=>{const g=blank();g.chapter=CHAPTERS[0];advance(g,46);assert(g.complete);assert.equal(g.drain().filter(e=>e.type==='complete').length,1);const time=g.time;advance(g,10);assert.equal(g.time,time);});
// A deterministic ideal-input player checks complete generated courses, not just isolated hazards.
function playCourse(g,until=630){let target=null,jumped=false,double=false,jumpTime=0;while(!g.dead&&!g.complete&&g.time<until){const px=g.world+g.p.x;const obs=g.objects.filter(o=>o.kind==='obstacle'&&o.x+o.w>px-8);const gaps=g.terrain.filter(o=>o.type==='gap'&&o.x+o.w>px-8).map(o=>({...o,type:'gap'}));const next=[...obs,...gaps].sort((a,b)=>a.x-b.x)[0];if(next&&target!==next.x){target=next.x;jumped=false;double=false;}if(next){const gap=next.x-px-8;if(next.overhead)g.action('roll',gap<60);else{g.action('roll',false);if(!jumped&&gap<g.speed*(next.type==='podium'?.30:.16)){g.action('jump');jumped=true;jumpTime=g.time;}if(['podium','bench','mats'].includes(next.type)&&jumped&&!double&&g.time-jumpTime>(next.type==='podium'?.20:.18)){g.action('jump');double=true;}}}g.step(STEP);g.drain();}return g;}
test('30 seeded courses remain traversable beyond ten minutes with baseline movement',()=>{for(let seed=1;seed<=30;seed++){const g=playCourse(new Runner({seed}));assert(!g.dead,`seed ${seed} at ${g.time}: ${g.reason}`);assert(g.time>=630);assert.equal(g.environment,5);}});
test('upgraded movement still works through generated terrain and every story chapter',()=>{for(let seed=1;seed<=5;seed++)assert(!playCourse(new Runner({seed,jump:4,luck:4})).dead);for(const chapter of CHAPTERS){const g=playCourse(new Runner({seed:11,chapter}));assert(g.complete,chapter.name+': '+g.reason);}});
test('focus doubles medal XP as well as survival XP',()=>{const a=blank(),b=blank();b.effects.focus=8;a.collect('medal',90,FLOOR-20);b.collect('medal',90,FLOOR-20);a.step(STEP);b.step(STEP);assert(Math.abs(b.xp-a.xp*2)<.00001);assert.equal(a.coins,b.coins);});
test('tight clearances pay once and never protect against a collision',()=>{const g=blank();g.add('bag',70);g.p.y=203;g.p.vy=-100;g.p.grounded=false;g.p.jumps=1;advance(g,.25);assert(!g.dead);assert.equal(g.precision,1);assert.equal(g.coins,2);advance(g,.1);assert.equal(g.coins,2);const h=blank();h.add('bag',90);h.step(STEP);assert(h.dead);assert.equal(h.precision,0);});
test('version-two progress migrates without losing purchases or earned rank',()=>{const raw=fresh();raw.version=2;raw.xp=5200;raw.coins=90;raw.upgrades.jump=3;raw.unlocks.push('gi-black');raw.equipped.gi='gi-black';delete raw.seenHints;delete raw.stats.precision;delete raw.settings.hints;const updated=normalize(raw);assert.equal(updated.version,VERSION);assert.equal(updated.xp,5200);assert.equal(updated.equipped.gi,'gi-black');assert.equal(updated.upgrades.jump,3);assert.equal(updated.stats.precision,0);assert.equal(updated.settings.hints,true);});
test('late-generation includes linked roll/jump groups with a safe recovery interval',()=>{let linked=0;for(let seed=1;seed<80;seed++){const g=new Runner({seed});g.time=600;g.objects=[];g.terrain=[];g.next=200;g.generate();const hazards=g.objects.filter(o=>o.kind==='obstacle');for(let i=0;i<hazards.length-1;i++){const a=hazards[i],b=hazards[i+1];if(a.type==='barrier'&&b.type==='mats'&&Math.abs((b.x-a.x-a.w)/233-1.05)<.01)linked++;}}assert(linked>0);});

test('checkpoints bank near each minute and resume once with a clear runway and preserved rewards',()=>{
  const g=playCourse(new Runner({seed:7}),80);assert.equal(g.checkpoints,1);assert(g.checkpoint.time>=60&&g.checkpoint.time<68);
  const earned={xp:g.xp,coins:g.coins,medals:g.medals},frontier=g.world+g.p.x;g.die('test collision');assert(g.continueCheckpoint());
  assert(!g.dead);assert.equal(g.checkpointUsed,true);assert.equal(g.coins,earned.coins);assert.equal(g.xp,earned.xp);assert.equal(g.medals,earned.medals);
  assert(g.objects.every(o=>o.x>g.world+88+g.speed*2));assert(g.objects.filter(o=>o.kind==='pickup').every(o=>o.x>=frontier));
  advance(g,1);assert.equal(g.xp,earned.xp);assert(!g.continueCheckpoint());
  playCourse(g,140);assert(!g.dead,g.reason);assert.equal(g.checkpoints,2);assert(!g.checkpointUsed);assert(g.continueCheckpoint());
});
test('no retry before a checkpoint or inside a story chapter',()=>{
  assert(!new Runner({seed:1}).continueCheckpoint());const g=playCourse(new Runner({seed:11,chapter:CHAPTERS[3]}));assert(g.complete);assert.equal(g.checkpoints,0);assert(!g.continueCheckpoint());
});
test('checkpoint snapshots stay bounded on long runs and save migration preserves settings',()=>{
  const g=playCourse(new Runner({seed:19}),650);assert.equal(g.checkpoints,10);assert(JSON.stringify(g.checkpoint).length<30000);assert(!('checkpoint' in g.checkpoint));assert(g.objects.length<80);assert(g.terrain.length<12);
  const old=fresh();old.version=3;old.xp=20000;old.settings.reducedMotion=true;old.upgrades.luck=4;const migrated=normalize(old);assert.equal(migrated.version,VERSION);assert.equal(migrated.xp,20000);assert.equal(migrated.settings.reducedMotion,true);assert.equal(migrated.upgrades.luck,4);assert.equal(migrated.stats.checkpoints,0);
});


test('athlete names migrate old saves and round-trip without losing progression or purchases',()=>{
  const mem=storage(),a=new SaveStore(mem);a.data.xp=5700;a.data.coins=200;a.data.unlocks.push('gi-blue');a.data.equipped.gi='gi-blue';a.data.profile.name='Gabe Shaffer';assert(a.save());
  const b=new SaveStore(mem);assert.equal(b.data.profile.name,'Gabe Shaffer');assert.equal(b.data.xp,5700);assert.equal(b.data.equipped.gi,'gi-blue');
  const c=new SaveStore(storage());assert(c.import(b.export()));assert.equal(c.data.profile.name,'Gabe Shaffer');assert.equal(c.data.coins,200);
  const old=b.data;delete old.profile;old.version=4;const migrated=normalize(old);assert.equal(migrated.profile.name,'Athlete');assert.equal(migrated.xp,5700);assert.equal(migrated.equipped.gi,'gi-blue');
});

test('athlete names support Unicode, bound length, and handle empty or malformed imports',()=>{
  assert.equal(athleteName('  Gabe   Shaffer  '),'Gabe Shaffer');assert.equal(athleteName('José 🥋'),'José 🥋');assert.equal(athleteName('ＡＢＣ'),'ABC');
  assert.equal(Array.from(athleteName('🥋'.repeat(25))).length,20);assert.equal(athleteName('\u202eGabe\u0000'),'Gabe');
  for(const value of ['',null,{},123,'   '])assert.equal(normalize({profile:{name:value}}).profile.name,'Athlete');
});


test('appearance and control preferences survive saves, imports and version-five migration',()=>{
  const a=new SaveStore(storage());a.data.profile={name:'Gabe',skin:'deep',hairStyle:'bun'};a.data.settings.cues=false;a.data.settings.jumpLeft=true;a.data.xp=5800;a.data.unlocks.push('gi-black');a.data.equipped.gi='gi-black';assert(a.save());
  const b=new SaveStore(storage());assert(b.import(a.export()));assert.deepEqual(b.data.profile,{name:'Gabe',skin:'deep',hairStyle:'bun'});assert(!b.data.settings.cues);assert(b.data.settings.jumpLeft);assert.equal(b.data.xp,5800);assert.equal(b.data.equipped.gi,'gi-black');
  const old={version:5,profile:{name:'Gabe'},xp:5800};const migrated=normalize(old);assert.equal(migrated.profile.skin,'medium');assert.equal(migrated.profile.hairStyle,'tousled');assert(migrated.settings.cues);assert(!migrated.settings.jumpLeft);
  const malformed=normalize({profile:{skin:'unknown',hairStyle:42}});assert.equal(malformed.profile.skin,'medium');assert.equal(malformed.profile.hairStyle,'tousled');
});
