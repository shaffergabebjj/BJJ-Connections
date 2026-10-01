const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname,'..');
function harness(page, initial = {}) {
  const nodes = new Map(), created = [], storage = new Map(Object.entries(initial));
  function element() {
    const classes = new Set();
    const node = {value:'',textContent:'',children:[],events:{},attrs:{},style:{},hidden:false,disabled:false,
      classList:{add:c=>classes.add(c),remove:c=>classes.delete(c),contains:c=>classes.has(c),toggle(c,on){on ??= !classes.has(c); on?classes.add(c):classes.delete(c);}},
      append(...children){this.children.push(...children);},appendChild(child){this.children.push(child);},
      addEventListener(type,fn){this.events[type]=fn;},setAttribute(k,v){this.attrs[k]=v;},getAttribute(k){return this.attrs[k];},
      focus(){},remove(){},click(){this.events.click?.call(this);},querySelectorAll(){return []}
    };
    let html='';Object.defineProperty(node,'innerHTML',{get:()=>html,set(v){html=v;node.children=[];}});
    Object.defineProperty(node,'className',{get:()=>[...classes].join(' '),set(v){classes.clear();v.split(/\s+/).forEach(c=>classes.add(c));}});
    created.push(node); return node;
  }
  const html=fs.readFileSync(path.join(root,page),'utf8');
  for(const [,id] of html.matchAll(/id="([^"]+)"/g))nodes.set(id,element());
  for(const [,id,contents] of html.matchAll(/<select[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/select>/g)) {
    const select=nodes.get(id);select.options=[...contents.matchAll(/<option(?: value="([^"]*)")?>([^<]+)<\/option>/g)].map(m=>({value:m[1]??m[2]}));select.value=select.options[0].value;
  }
  const downloads=[];
  const context={console,Date,URLSearchParams,Blob,setTimeout:fn=>fn(),URL:{createObjectURL:blob=>{downloads.push(blob);return 'blob:test';},revokeObjectURL(){}},
    localStorage:{getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value),removeItem:key=>storage.delete(key)},
    window:{print(){}},location:{reload(){}},confirm:()=>false,
    document:{getElementById:id=>nodes.get(id),createElement:element,body:element(),querySelectorAll:selector=>selector==='.checklist-item'?created.filter(n=>n.classList.contains('checklist-item')):[]}};
  vm.createContext(context);
  const source=page==='training.html'?fs.readFileSync(path.join(root,'training.js'),'utf8'):html.match(/<script>\s*\/\/ Checklist data([\s\S]*?)<\/script>/)[0].replace(/<\/?script>/g,'');
  vm.runInContext(source,context);
  return {nodes,storage,downloads};
}
async function run() {
  const saved=['Double Leg','Half Guard','Back Take','Leg Drag','Kimura'];
  const game=harness('training.html', {bjjGamePlan:JSON.stringify(saved)}), n=game.nodes;
  assert.equal(n.get('gpTakedown').value,'Double Leg','saved choices restore on load');
  n.get('gpTakedown').value='Ankle Pick';n.get('gpTakedown').events.change();
  assert.match(n.get('planStatus').textContent,/Unsaved/);
  n.get('saveGamePlan').click();assert.equal(JSON.parse(game.storage.get('bjjGamePlan'))[0],'Ankle Pick');
  assert.match(n.get('gamePlanPreview').innerHTML,/techniques.html\?q=Ankle%20Pick/);
  n.get('clearGamePlan').click();assert.equal(n.get('gpTakedown').value,'Single Leg');
  assert.deepEqual(JSON.parse(game.storage.get('bjjGamePlan')),[]);
  n.get('goalInput').value='Practice guard retention';n.get('addGoal').click();
  const [check,label]=n.get('goalsList').children[0].children;
  assert.equal(label.htmlFor,check.id);check.checked=true;check.events.change();assert.match(n.get('goalCount').textContent,/1 of 1/);
  n.get('logDuration').value='-5';n.get('addSession').click();assert.match(n.get('logStatus').textContent,/whole minutes/);
  assert.equal(game.storage.has('bjjTrainingLog'),false);
  n.get('logDuration').value='60';n.get('logTechniques').value='<img src=x onerror=alert(1)>';n.get('logNotes').value='=SUM(A1:A2)';n.get('addSession').click();
  assert.match(n.get('logList').innerHTML,/&lt;img/);assert.ok(!n.get('logList').innerHTML.includes('<img'));
  assert.match(n.get('logSummary').textContent,/1 session · 1h 0m/);
  n.get('exportSessions').click();const csv=await game.downloads[0].text();assert.match(csv,/Date.*Minutes/);assert.ok(csv.includes('"\'=SUM(A1:A2)"'),'CSV cells cannot become formulas');
  for(const bad of ['null','{}','7','{broken','[null,7,{}]']) {
    const test=harness('training.html',{bjjGamePlan:bad,bjjTrainingGoals:bad,bjjTrainingLog:bad});
    assert.match(test.nodes.get('logSummary').textContent,/0 sessions/);assert.equal(test.nodes.get('gpTakedown').value,'Single Leg');
    const prep=harness('competition.html',{'bjjChecklist_weekBefore':bad});assert.match(prep.nodes.get('prepSummary').textContent,/0 of \d+ tasks/);
  }
  const prep=harness('competition.html');const row=prep.nodes.get('weekBefore').children[0];const checkbox=row.children[0];checkbox.checked=true;checkbox.events.change();
  assert.match(prep.nodes.get('prepSummary').textContent,/1 of/);prep.nodes.get('remainingOnly').click();assert.equal(row.hidden,true);prep.nodes.get('remainingOnly').click();assert.equal(row.hidden,false);
  console.log('Training restoration, goals, validation, safe notes/CSV, malformed storage, and checklist filtering passed.');
}
run().catch(error=>{console.error(error);process.exitCode=1;});
