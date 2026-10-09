// Personal training tools. Keep entries as text and tolerate unavailable storage.
(function () {
  const $ = id => document.getElementById(id);
  function read(key) {
    try { const value = JSON.parse(localStorage.getItem(key) || "[]"); return Array.isArray(value) ? value : []; }
    catch (_) { return []; }
  }
  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch (_) { return false; }
  }
  function escape(value) {
    return String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  }
  const savedMessage = ok => ok ? "Saved in this browser." : "Kept for this visit only. Browser storage is unavailable.";
  const today = new Date();
  const localDate = [today.getFullYear(), String(today.getMonth()+1).padStart(2,"0"), String(today.getDate()).padStart(2,"0")].join("-");
  function validDate(value) {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(value + "T12:00:00");
    return Number.isFinite(date.getTime()) && date.getFullYear() === Number(value.slice(0,4)) && date.getMonth()+1 === Number(value.slice(5,7)) && date.getDate() === Number(value.slice(8));
  }

  // Goals
  let goals = read("bjjTrainingGoals").filter(g => g && typeof g.text === "string" && g.text.trim()).map(g => ({text:g.text, done:g.done === true}));
  let removedGoal = null;
  function goalCount() {
    const done = goals.filter(g => g.done).length;
    $("goalCount").textContent = done + " of " + goals.length + " goals complete";
    $("goalsEmpty").hidden = goals.length > 0;
    $("activeGoals").textContent = goals.length - done;
  }
  function renderGoals() {
    $("goalsList").innerHTML = "";
    goals.forEach((goal,i) => {
      const row = document.createElement("div"); row.className = "checklist-item" + (goal.done ? " checked" : "");
      const cb = document.createElement("input"); cb.type = "checkbox"; cb.id = "training-goal-" + i; cb.checked = goal.done;
      const label = document.createElement("label"); label.htmlFor = cb.id; label.textContent = goal.text;
      const remove = document.createElement("button"); remove.type = "button"; remove.className = "btn btn-ghost btn-sm"; remove.textContent = "×"; remove.setAttribute("aria-label", "Delete goal: " + goal.text);
      cb.addEventListener("change", () => { goal.done = cb.checked; row.classList.toggle("checked", cb.checked); save("bjjTrainingGoals", goals); goalCount(); });
      remove.addEventListener("click", () => {
        removedGoal = {goal:goals.splice(i,1)[0], index:i};
        const ok = save("bjjTrainingGoals", goals); renderGoals();
        $("goalCount").textContent += ok ? " · Goal deleted." : " · Deleted for this visit only.";
        $("undoGoal").hidden = false; $("undoGoal").focus();
      });
      row.append(cb,label,remove); $("goalsList").appendChild(row);
    });
    goalCount();
  }
  function addGoal() {
    const text = $("goalInput").value.trim(); if (!text) { $("goalInput").focus(); return; }
    goals.push({text,done:false}); const ok = save("bjjTrainingGoals",goals); $("goalInput").value = ""; renderGoals();
    if (!ok) $("goalCount").textContent += " · Kept for this visit only.";
  }
  $("addGoal").addEventListener("click",addGoal);
  $("goalInput").addEventListener("keydown",e => { if(e.key === "Enter") addGoal(); });
  $("undoGoal").addEventListener("click", () => {
    if (!removedGoal) return;
    goals.splice(removedGoal.index,0,removedGoal.goal); removedGoal = null;
    const ok = save("bjjTrainingGoals", goals); renderGoals();
    $("goalCount").textContent += ok ? " · Goal restored." : " · Restored for this visit only.";
    $("undoGoal").hidden = true; $("goalInput").focus();
  });
  renderGoals();

  // Session log
  $("logDate").value = localDate;
  // Draft only: following a technique link never creates a session automatically.
  const incomingTechnique = new URLSearchParams(location.search || "").get("technique");
  if (incomingTechnique && incomingTechnique.trim()) {
    $("logTechniques").value = incomingTechnique.trim().slice(0, 200);
    $("logStatus").textContent = "Technique added to your draft. Log it after you practice.";
  }
  const savedTechniques = [...new Set(read("bjjFavoriteTechniques")
    .filter(name => typeof name === "string" && name.trim())
    .map(name => name === "Baseball Choke" ? "Baseball Bat Choke" : name))];
  $("savedPracticeEmpty").hidden = savedTechniques.length > 0;
  savedTechniques.forEach(name => {
    const button = document.createElement("button");
    button.type = "button"; button.className = "chip"; button.textContent = "+ " + name;
    button.addEventListener("click", () => {
      const current = $("logTechniques").value.split(",").map(value => value.trim()).filter(Boolean);
      if (!current.some(value => value.toLowerCase() === name.toLowerCase())) current.push(name);
      $("logTechniques").value = current.join(", ");
      $("practiceStatus").textContent = name + " is in your session draft.";
    });
    $("savedPractice").appendChild(button);
  });
  let sessions = read("bjjTrainingLog").filter(s => s && validDate(s.date)).map(s => ({
    date:s.date, duration:Number.isFinite(Number(s.duration)) && Number(s.duration)>0 ? Math.min(1440,Math.round(Number(s.duration))) : "",
    type:typeof s.type === "string" ? s.type : "", techniques:typeof s.techniques === "string" ? s.techniques : "", notes:typeof s.notes === "string" ? s.notes : "", timestamp:s.timestamp
  }));
  let removedSession = null;
  function renderSessions() {
    if (window.dispatchEvent && typeof Event === "function") window.dispatchEvent(new Event("bjjlogchange"));
    sessions.sort((a,b) => b.date.localeCompare(a.date));
    const minutes = sessions.reduce((sum,s) => sum + Number(s.duration || 0),0);
    $("logSummary").textContent = sessions.length + " session" + (sessions.length === 1 ? "" : "s") + " · " + Math.floor(minutes/60) + "h " + minutes%60 + "m logged";
    const current = new Date();
    const start = new Date(current.getFullYear(),current.getMonth(),current.getDate());
    start.setDate(start.getDate() - (start.getDay()+6)%7);
    const end = new Date(start); end.setDate(end.getDate()+7);
    const week = sessions.filter(s => { const d = new Date(s.date+'T12:00:00'); return d >= start && d < end && s.date <= localDate; });
    const weekMinutes = week.reduce((sum,s)=>sum+Number(s.duration || 0),0);
    $("weekSessions").textContent = week.length;
    $("weekMinutes").textContent = weekMinutes >= 60 ? Math.floor(weekMinutes/60)+'h '+weekMinutes%60+'m' : weekMinutes+'m';
    const format = {month:'short',day:'numeric'};
    const last = new Date(end); last.setDate(last.getDate()-1);
    $("weekRange").textContent = start.toLocaleDateString('en-US',format)+' – '+last.toLocaleDateString('en-US',format)+' · From your session log';
    $("weekActivity").innerHTML = Array.from({length:7}, (_, i) => {
      const day = new Date(start); day.setDate(day.getDate() + i);
      const key = [day.getFullYear(), String(day.getMonth()+1).padStart(2,"0"), String(day.getDate()).padStart(2,"0")].join("-");
      const count = week.filter(s => s.date === key).length;
      return '<div class="activity-day' + (count ? ' has-session' : '') + (key === localDate ? ' is-today' : '') + '"><span>' + day.toLocaleDateString('en-US',{weekday:'short'}) + '</span><strong>' + day.getDate() + '</strong><small>' + (count ? count + (count === 1 ? ' session' : ' sessions') : key > localDate ? 'Later' : 'No log') + '</small></div>';
    }).join("");
    $("noSessions").classList.toggle("hidden",sessions.length > 0);
    $("exportSessions").disabled = sessions.length === 0;
    $("logList").innerHTML = sessions.map((s,i) => {
      const date = new Date(s.date+"T12:00:00").toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric",year:"numeric"});
      return '<article class="session-card"><div><div class="session-meta"><strong>'+escape(date)+'</strong><span>'+escape(s.type)+'</span><span>'+escape(s.duration ? s.duration+" min" : "Duration not recorded")+'</span></div>'+
        (s.techniques ? '<p><b>Techniques:</b> '+escape(s.techniques)+'</p>' : '')+
        (s.notes ? '<p class="session-notes">'+escape(s.notes)+'</p>' : '')+
        '</div><button type="button" class="btn btn-ghost btn-sm" data-del="'+i+'" aria-label="Delete session from '+escape(date)+'">×</button></article>';
    }).join("");
  }
  $("logList").addEventListener("click", event => {
    const button = event.target.closest('[data-del]');
    if (!button) return;
    const index = Number(button.getAttribute('data-del'));
    if (!Number.isInteger(index) || !sessions[index]) return;
    removedSession = sessions.splice(index,1)[0];
    $("logStatus").textContent = 'Session deleted. ' + savedMessage(save("bjjTrainingLog",sessions));
    renderSessions(); $("undoSession").hidden = false; $("undoSession").focus();
  });
  $("undoSession").addEventListener("click", () => {
    if (!removedSession) return;
    sessions.push(removedSession); removedSession = null;
    $("logStatus").textContent = 'Session restored. ' + savedMessage(save("bjjTrainingLog",sessions));
    renderSessions(); $("undoSession").hidden = true; $("logDate").focus();
  });
  function addSession() {
    const date = $("logDate").value || localDate;
    const duration = $("logDuration").value;
    if(!validDate(date)) { $("logStatus").textContent = "Enter a valid session date."; $("logDate").focus(); return; }
    if(duration && (!Number.isInteger(Number(duration)) || Number(duration)<1 || Number(duration)>1440)) { $("logStatus").textContent = "Enter a duration from 1 to 1,440 whole minutes."; $("logDuration").focus(); return; }
    const session = {date,duration:duration ? Number(duration) : "",type:$("logType").value,techniques:$("logTechniques").value.trim(),notes:$("logNotes").value.trim(),timestamp:Date.now()};
    if(!duration && !session.techniques && !session.notes) { $("logStatus").textContent = "Add a duration, technique, or note first."; $("logDuration").focus(); return; }
    sessions.push(session); $("logStatus").textContent = savedMessage(save("bjjTrainingLog",sessions));
    ["logDuration","logTechniques","logNotes"].forEach(id => $(id).value = ""); renderSessions();
  }
  $("addSession").addEventListener("click",addSession);
  $("logNotes").addEventListener("keydown",e => { if(e.key === "Enter" && (e.ctrlKey || e.metaKey)) addSession(); });
  $("exportSessions").addEventListener("click",() => {
    // Quote every cell and neutralize formula prefixes in spreadsheet programs.
    const cell = value => { let text = String(value ?? ""); if (/^[\s]*[=+@-]/.test(text)) text = "'"+text; return '"'+text.replace(/"/g,'""')+'"'; };
    const rows = [["Date","Minutes","Session type","Techniques","Notes"],...sessions.map(s=>[s.date,s.duration,s.type,s.techniques,s.notes])];
    const blob = new Blob(["\uFEFF"+rows.map(row=>row.map(cell).join(",")).join("\r\n")],{type:"text/csv;charset=utf-8"});
    const url = URL.createObjectURL(blob), link = document.createElement("a"); link.href = url; link.download = "bjj-training-log-"+localDate+".csv";
    document.body.appendChild(link); link.click(); link.remove(); setTimeout(()=>URL.revokeObjectURL(url),1000);
    $("logStatus").textContent = "Your log export is ready. Keep a copy as a backup.";
  });
  renderSessions();

  // Restore valid saved choices before rendering; distinguish unsaved edits.
  const ids = ["gpTakedown","gpGuard","gpSweep","gpPass","gpFinish"];
  const labels = ["Entry","Guard","Transition","Top game","Finish"];
  let savedPlan = read("bjjGamePlan");
  if(savedPlan.length !== ids.length || !savedPlan.every((v,i)=>[...$(ids[i]).options].some(option=>option.value === v))) savedPlan = [];
  savedPlan.forEach((value,i)=>$(ids[i]).value = value);
  const values = () => ids.map(id=>$(id).value);
  function renderPlan() {
    const current = values();
    $("gamePlanPreview").innerHTML = current.map((value,i)=>'<div class="gameplan-step"><span class="gameplan-number">'+(i+1)+'</span><div><small>'+labels[i]+'</small><a href="techniques.html?q='+encodeURIComponent(value)+'">'+escape(value)+' <span aria-hidden="true">↗</span></a></div></div>').join("");
    $("planStatus").textContent = savedPlan.length && current.every((v,i)=>v === savedPlan[i]) ? "Saved in this browser." : "Unsaved plan — save when you’re ready.";
  }
  ids.forEach(id=>$(id).addEventListener("change",renderPlan));
  $("saveGamePlan").addEventListener("click",()=> { const current = values(); const ok = save("bjjGamePlan",current); if(ok) savedPlan = current; renderPlan(); $("planStatus").textContent = savedMessage(ok); });
  $("clearGamePlan").textContent = "Reset plan";
  $("clearGamePlan").addEventListener("click",()=> {
    const ok = save("bjjGamePlan",[]); if(ok) savedPlan = [];
    ids.forEach(id=>$(id).value = $(id).options[0].value); renderPlan();
    $("planStatus").textContent = ok ? "Plan reset. Choose your next focus." : "Choices reset for this visit. The saved plan could not be cleared.";
  });
  renderPlan();
})();
