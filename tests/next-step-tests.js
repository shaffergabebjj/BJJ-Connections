const assert = require('node:assert/strict'), fs = require('node:fs'), vm = require('node:vm');
const data = new Map(), nodes = new Map();
for (const id of ['resumePuzzle','resumeTitle','resumeDetail','techniqueRotation','rotationSummary','rotationProgress']) nodes.set(id,{});
let daily = null, practice = null, update;
const context = {Date, document:{getElementById:id=>nodes.get(id)}, localStorage:{getItem:key=>data.get(key)},
  DAILY_PUZZLES:[{id:1}],PUZZLES:[{id:1}],
  BJJDaily:{dayNumber:()=>0,read:()=>daily}, BJJTraining:{settings:()=>({difficulty:'all',queue:'all'}),readProgress:()=>practice},
  window:{addEventListener:(_,fn)=>update=fn}};
context.window.BJJDaily=context.BJJDaily; context.window.BJJTraining=context.BJJTraining;
vm.createContext(context); vm.runInContext(fs.readFileSync('next-step.js','utf8'),context);
assert.equal(nodes.get('resumePuzzle').hidden,true);
daily={finished:false,solved:[0],selected:[],guessLog:[],mistakes:3};update();
assert.equal(nodes.get('resumePuzzle').href,'puzzles.html?mode=daily');
assert.match(nodes.get('resumeDetail').textContent,/1 of 4/);
daily.finished=true; practice={progress:{solved:[],mistakes:4}};update();
assert.equal(nodes.get('resumePuzzle').href,'puzzles.html?mode=training');
practice=null;update();assert.equal(nodes.get('resumePuzzle').hidden,true);
const now=new Date(), date=[now.getFullYear(),String(now.getMonth()+1).padStart(2,'0'),String(now.getDate()).padStart(2,'0')].join('-');
data.set('bjjFavoriteTechniques',JSON.stringify(['Kimura','Baseball Choke','Baseball Bat Choke','<img>']));
data.set('bjjTrainingLog',JSON.stringify([{date,techniques:'kimura, Baseball Bat Choke'},{date:'2099-01-01',techniques:'<img>'}]));update();
assert.match(nodes.get('rotationSummary').textContent,/2 of 3/);
assert.equal(nodes.get('rotationProgress').value,2);
assert(!nodes.get('techniqueRotation').innerHTML.includes('<img>'));
assert(nodes.get('techniqueRotation').innerHTML.indexOf('&lt;img&gt;') < nodes.get('techniqueRotation').innerHTML.indexOf('Kimura'));
assert.match(nodes.get('techniqueRotation').innerHTML,/technique=%3Cimg%3E/);
for(const bad of ['null','{}','{broken','[null,7]']){data.set('bjjTrainingLog',bad);data.set('bjjFavoriteTechniques',bad);update();assert.equal(nodes.get('rotationProgress').hidden,true);}
console.log('Resume priority, completed puzzle handling, practice rotation, future dates, aliases, safe rendering and malformed storage passed.');
