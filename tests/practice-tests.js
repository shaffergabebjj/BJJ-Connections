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
training.save(history);assert.equal(Object.keys(training.read(puzzles)).length,100);
for(const bad of ['null','[]','7','{bad','{"1":{"seen":"yesterday"}}']){
 values.set('bjjTrainingHistory',bad);assert.equal(Object.keys(training.read(puzzles)).length,0);
}
const clone=JSON.parse(JSON.stringify(p));clone.id=999;
vm.runInContext('globalThis.validate=validateAllPuzzles',c);
assert(c.validate([p,clone,{...clone,id:998},{...clone,id:997}]).some(e=>e.includes('maximum 3')));
console.log('Shared rules, seeded order, 100-round unseen rotation, practice queues, storage recovery, and repetition limits passed.');
