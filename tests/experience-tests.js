const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const nodes=new Map([...fs.readFileSync('index.html','utf8').matchAll(/id="([^"]+)"/g)].map(m=>[m[1],{textContent:''}]));
const data=new Map();let refresh;
const c={Date,document:{getElementById:id=>nodes.get(id)},localStorage:{getItem:key=>data.get(key)},window:{addEventListener:(_key,fn)=>refresh=fn}};
vm.createContext(c);vm.runInContext(fs.readFileSync('home-desk.js','utf8'),c);
for(const bad of ['null','{}','[null,7,{}, {"date":"2026-02-30"}]','{broken']){
  for(const key of ['bjjTrainingLog','bjjTrainingGoals','bjjFavoriteTechniques'])data.set(key,bad);
  refresh();assert.equal(nodes.get('homeSessionCount').textContent,'Log your next session');
  assert.equal(nodes.get('homeGoalCount').textContent,'0 open goals');
  assert.equal(nodes.get('homeSavedCount').textContent,'0 saved');
}
data.set('bjjTrainingLog',JSON.stringify([{date:'2026-10-06'}]));
data.set('bjjFavoriteTechniques',JSON.stringify(['Baseball Choke','Baseball Bat Choke']));
refresh();assert.equal(nodes.get('homeSavedCount').textContent,'1 saved');assert.match(nodes.get('homeSessionDetail').textContent,/Oct 6/);
data.set('bjjTrainingLog','[]');refresh();assert.match(nodes.get('homeDeskMessage').textContent,/stays on this device/);
// The split page controllers must be shipped and cached with their pages.
const sw=fs.readFileSync('sw.js','utf8');
for(const file of fs.readdirSync('.').filter(f=>f.endsWith('.html'))){
  const html=fs.readFileSync(file,'utf8');
  const ids=[...html.matchAll(/id="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(new Set(ids).size,ids.length,file+' contains duplicate IDs');
  for(const [,src] of html.matchAll(/<script src="([^"]+)"/g)){
    if(/^https?:/.test(src))continue;
    assert(fs.existsSync(path.join('.',src)),file+' references missing '+src);
    if(/-page\.js$|home-desk\.js$|competition-event\.js$|questions\.js$/.test(src))assert(sw.includes('"/'+src+'"'),src+' needs offline coverage');
  }
}
console.log('Homepage saved-data recovery, script references, unique IDs, and new offline assets passed.');
