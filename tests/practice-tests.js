const assert=require('node:assert/strict'), fs=require('node:fs'), vm=require('node:vm');
const values=new Map();const c={window:{}, localStorage:{getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)}};
vm.createContext(c);
for(const file of ['data.js','daily-progress.js','game-core.js'])vm.runInContext(fs.readFileSync(file,'utf8'),c);
vm.runInContext('globalThis.p=PUZZLES',c);
const {BJJGame:game,BJJTraining:training}=c.window, puzzles=c.p;
const p=puzzles[0], correct=p.groups[0].items;
const first=game.attempt(p,correct,[]);assert.equal(first.type,'correct');
assert.equal(game.attempt(p,correct,[first.key]).type,'duplicate');
assert.equal(game.attempt(p,[...correct.slice(0,3),p.groups[1].items[0]],[]).near,true);
assert.equal(game.attempt(p,[correct[0],correct[0],correct[1],correct[2]],[]).type,'invalid');
assert.deepEqual(game.shuffled(correct,42),game.shuffled(correct,42));
const history={};let current;
for(let i=0;i<puzzles.length;i++){
 const next=training.pick(puzzles,history,current);
 assert(!history[next.id], 'rotation must visit unseen puzzles first');
 history[next.id]={seen:i+1,completed:true,win:true,mistakes:4};current=next;
}
assert.equal(training.pool(puzzles,history,'all','unplayed').length,0);
assert.equal(training.pool(puzzles,history,'all','mistakes').length,0);
history[p.id].mistakes=2;
assert.equal(training.pool(puzzles,history,'all','mistakes')[0].id,p.id);
training.save(history);assert.equal(Object.keys(training.read(puzzles)).length,puzzles.length);
for(const bad of ['null','[]','7','{bad','{"1":{"seen":"yesterday"}}']){
 values.set('bjjTrainingHistory',bad);assert.equal(Object.keys(training.read(puzzles)).length,0);
}
const clone=JSON.parse(JSON.stringify(p));clone.id=999;
vm.runInContext('globalThis.validate=validateAllPuzzles',c);
assert(c.validate([p,clone,{...clone,id:998},{...clone,id:997}]).some(e=>e.includes('maximum 3')));
console.log('Shared rules, seeded order, Full-bank unseen rotation, practice queues, storage recovery, and repetition limits passed.');

const progress={words:p.groups.flatMap(g=>g.items),selected:correct.slice(0,2),solved:[],mistakes:3,
  startedAt:Date.now()-5000,guessLog:[],attemptedGuesses:[],finished:false,won:false};
training.saveProgress(p,progress,'all','all');
assert.equal(training.readProgress(puzzles,'all','all').puzzle.id,p.id);
assert.equal(training.readProgress(puzzles,'white','all'),null,'different filters must not resume a saved round');
training.saveProgress(p,{...progress,finished:true},'all','all');
assert.equal(training.readProgress(puzzles,'all','all'),null,'finished rounds must not auto-resume');
for(const bad of [{words:progress.words.slice(1)},{selected:[correct[0],correct[0]]},{solved:[9]},
  {mistakes:0},{startedAt:'bad'},{guessLog:[{}]}]) {
  training.saveProgress(p,{...progress,...bad},'all','all');
  assert.equal(training.readProgress(puzzles,'all','all'),null,'reject inconsistent saved practice');
}
training.saveProgress(p,progress,'all','all');
const revised=JSON.parse(JSON.stringify(puzzles));revised[0].groups[0].items[0]='CHANGED CONTENT';
assert.equal(training.readProgress(revised,'all','all'),null,'changed puzzle content invalidates saved progress');
for(const bad of ['null','[]','{bad','{"queue":"bogus","difficulty":"bogus"}']) {
 values.set('bjjPracticeSettings',bad);assert.equal(training.settings().queue,'all');
 assert.equal(training.settings().difficulty,'all');
}
training.saveSettings('purple','mistakes');assert.equal(training.settings().queue,'mistakes');
assert.equal(training.settings().difficulty,'purple');
assert.equal(game.attempt(p,['NOT AN ANSWER',...correct.slice(0,3)],[]).type,'invalid');
console.log('Practice restore, changed-content recovery, invalid progress, preferences, and unknown-word rejection passed.');

const brown = training.pool(puzzles, {}, 'brown', 'unplayed');
assert.equal(brown.length, 12);
assert(brown.every(p => p.difficulty === 'brown'));
training.saveSettings('brown','unplayed');
assert.equal(training.settings().difficulty,'brown');
const brownProgress={...progress,words:brown[0].groups.flatMap(g=>g.items),selected:[]};
training.saveProgress(brown[0],brownProgress,'brown','unplayed');
assert.equal(training.readProgress(puzzles,'brown','unplayed').puzzle.id,brown[0].id);
assert.equal(training.readProgress(puzzles,'purple','unplayed'),null);
const brownHistory={}; let previous;
for(let i=0;i<brown.length;i++) {
 const next=training.pick(training.pool(puzzles,brownHistory,'brown','unplayed'),brownHistory,previous);
 assert(!brownHistory[next.id]); brownHistory[next.id]={seen:i+1,completed:true,win:true,mistakes:4}; previous=next;
}
assert.equal(training.pool(puzzles,brownHistory,'brown','unplayed').length,0);
vm.runInContext(fs.readFileSync('techniques.js','utf8')+';globalThis.brownTechniques=TECHNIQUES.filter(t=>t.belt==="brown")',c);
assert.equal(c.brownTechniques.length,17);
assert.equal(new Set(c.brownTechniques.map(t=>t.name)).size,17);
console.log('Brown filter, saved settings, round restore, complete unseen rotation and 17 distinct techniques passed.');
