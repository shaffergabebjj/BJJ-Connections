const $ = id => document.getElementById(id);
const grid=$("grid"), solvedBox=$("solved"), msg=$("msg"), mistakesEl=$("mistakes"), dots=$("dots");
const submit=$("submit"), next=$("next"), share=$("share"), meta=$("puzzleMeta"), difficultyWrap=$("difficultyWrap");
let mode="daily", difficulty="all", puzzle=null, words=[], selected=[], solved=[], mistakes=4, startedAt=0, finished=false;

const state=JSON.parse(localStorage.getItem("bjjConnectionsState")||"{}");
state.gamesPlayed ??=0; state.gamesWon ??=0; state.currentStreak ??=0; state.longestStreak ??=0;
state.bestTime ??=null; state.dailyHistory ??={}; state.lastDaily ??=null;
const save=()=>localStorage.setItem("bjjConnectionsState",JSON.stringify(state));

function dateKey(){return new Date().toISOString().slice(0,10)}
function dayNumber(){return Math.floor(Date.UTC(...dateKey().split("-").map((v,i)=>i===1?+v-1:+v))/86400000)}
function dailyIndex(){return Math.abs(dayNumber())%PUZZLES.length}
function seeded(n){let x=Math.sin(n)*10000; return x-Math.floor(x)}
function pickTraining(){
 const pool=difficulty==="all"?PUZZLES:PUZZLES.filter(p=>p.difficulty===difficulty);
 return pool[Math.floor(Math.random()*pool.length)];
}
function queryPuzzle(){const p=new URLSearchParams(location.search).get("p"); const id=Number(p); return PUZZLES.find(x=>x.id===id)}
function loadPuzzle(){
 finished=false; selected=[]; solved=[]; mistakes=4; $("learnPanel").classList.add("hidden"); share.classList.add("hidden"); next.classList.add("hidden");
 puzzle=queryPuzzle() || (mode==="daily"?PUZZLES[dailyIndex()]:pickTraining());
 words=puzzle.groups.flatMap(g=>g.items);
 // deterministic daily shuffle; random training shuffle
 const seed=mode==="daily"?dayNumber()+puzzle.id:Date.now();
 for(let i=words.length-1;i>0;i--){const j=Math.floor(seeded(seed+i)* (i+1));[words[i],words[j]]=[words[j],words[i]]}
 startedAt=Date.now();
 meta.textContent=mode==="daily"?`BJJ Connections #${dayNumber()} • ${dateKey()}`:`Training • ${puzzle.difficulty.toUpperCase()} BELT • Puzzle ${puzzle.id}`;
 msg.textContent=mode==="daily" && state.dailyHistory[dateKey()]?"Already completed today — replaying for practice.":"";
 render(); renderSolved(); update();
}
function render(){
 grid.innerHTML="";
 words.forEach(word=>{const b=document.createElement("button");b.className="word"+(selected.includes(word)?" sel":"");b.textContent=word;b.disabled=finished;
 b.onclick=()=>{selected.includes(word)?selected=selected.filter(x=>x!==word):selected.length<4&&selected.push(word);render();update()};grid.appendChild(b)});
}
function renderSolved(){
 solvedBox.innerHTML="";
 solved.forEach(g=>{const box=document.createElement("div");box.className="solved";box.innerHTML=`<b>${g.category}</b>${g.items.join(" · ")}`;solvedBox.appendChild(box)});
}
function update(){mistakesEl.textContent=mistakes;dots.textContent="● ".repeat(mistakes).trim();submit.disabled=selected.length!==4||finished}
function finish(win){
 finished=true; const seconds=Math.round((Date.now()-startedAt)/1000); state.gamesPlayed++;
 if(win){state.gamesWon++; if(mode==="daily"&&!state.dailyHistory[dateKey()]){
   const yesterday=new Date(Date.now()-86400000).toISOString().slice(0,10);
   state.currentStreak=state.lastDaily===yesterday?state.currentStreak+1:1;state.longestStreak=Math.max(state.longestStreak,state.currentStreak);state.lastDaily=dateKey();state.dailyHistory[dateKey()]={win:true,mistakes,seconds,puzzle:puzzle.id};
 }}
 if(win&&(state.bestTime===null||seconds<state.bestTime))state.bestTime=seconds;save();
 msg.textContent=win?`Connected. ${seconds}s • ${mistakes} mistakes left.`:"Puzzle complete. Review the answers below.";
 puzzle.groups.filter(g=>!solved.includes(g)).forEach(g=>solved.push(g));renderSolved();grid.innerHTML="";
 $("learn").innerHTML=puzzle.groups.map(g=>`<p><b>${g.category}</b><br>${g.explanation}</p>`).join("");
 $("learnPanel").classList.remove("hidden");share.classList.remove("hidden");next.classList.remove("hidden");update();
}
function submitGuess(){
 if(selected.length!==4||finished)return;
 const found=puzzle.groups.find(g=>g.items.every(w=>selected.includes(w)));
 if(found){solved.push(found);words=words.filter(w=>!found.items.includes(w));selected=[];msg.textContent="Correct.";renderSolved();render();
   if(words.length===0)finish(true);
 }else{let near=puzzle.groups.some(g=>g.items.filter(w=>selected.includes(w)).length===3);mistakes--;selected=[];
   if(mistakes<=0)finish(false);else msg.textContent=near?"One away.":"Not a group.";render();
 }update();
}
function shuffle(){for(let i=words.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[words[i],words[j]]=[words[j],words[i]]}render()}
function shareResult(){
 const rows=solved.map((g,i)=>"🟩".repeat(4)).join("\n");
 const text=`BJJ Connections ${mode==="daily"?"#"+dayNumber():"Training"}\n\n${rows}\n\n${finished?"Solved":"Played"} • ${mistakes} mistakes left\nbjjconnectionsbygabe.com`;
 navigator.clipboard?.writeText(text);msg.textContent="Results copied to clipboard.";
}
function showStats(){const winPct=state.gamesPlayed?Math.round(state.gamesWon/state.gamesPlayed*100):0;
 $("stats").innerHTML=[["Played",state.gamesPlayed],["Won",state.gamesWon],["Win %",winPct+"%"],["Current streak",state.currentStreak],["Best streak",state.longestStreak],["Best time",state.bestTime?state.bestTime+"s":"—"]].map(([a,b])=>`<div class="stat"><b>${b}</b>${a}</div>`).join("");
}
function setMode(m){mode=m;document.querySelectorAll(".tab").forEach(b=>b.classList.toggle("active",b.dataset.mode===m));$("gameView").classList.toggle("hidden",m==="stats");$("statsView").classList.toggle("hidden",m!=="stats");difficultyWrap.classList.toggle("hidden",m!=="training");if(m==="stats")showStats();else loadPuzzle()}
document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>setMode(b.dataset.mode));
["all","white","blue","purple","black"].forEach(d=>{const b=document.createElement("button");b.textContent=d==="all"?"All":d[0].toUpperCase()+d.slice(1);b.onclick=()=>{difficulty=d;[...difficultyWrap.children].forEach(x=>x.classList.remove("active"));b.classList.add("active");loadPuzzle()};if(d==="all")b.classList.add("active");difficultyWrap.appendChild(b)});
submit.onclick=submitGuess;$("shuffle").onclick=shuffle;next.onclick=()=>{if(mode==="daily"){mode="training";setMode("training")}else loadPuzzle()};share.onclick=shareResult;
$("resetStats").onclick=()=>{if(confirm("Reset all BJJ Connections stats?")){localStorage.removeItem("bjjConnectionsState");location.reload()}};
PUZZLES.forEach(p=>{const errors=validatePuzzle(p);if(errors.length)console.warn("Puzzle",p.id,errors)});
loadPuzzle();
