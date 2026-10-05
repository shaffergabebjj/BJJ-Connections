// =====================================================================
// BJJ Connections — game logic
// Sections: DOM refs & guards / storage / dates & seeding / game state
// render / gameplay / sharing / stats / archive / mode switching / init
// =====================================================================

const $ = id => document.getElementById(id);

// ---- DOM refs --------------------------------------------------------
const grid = $("grid"), solvedBox = $("solved"), msg = $("msg");
const mistakesEl = $("mistakes"), dots = $("dots");
const submit = $("submit"), next = $("next"), share = $("share");
const meta = $("puzzleMeta"), difficultyWrap = $("difficultyWrap");
const archiveList = $("archiveList");

// ---- Fail loudly (but gracefully) if data.js didn't load -------------
if (typeof PUZZLES === "undefined" || !Array.isArray(PUZZLES) || PUZZLES.length === 0) {
  const errBox = document.createElement("div");
  errBox.className = "panel";
  errBox.textContent = "Something went wrong loading the puzzle data. Please refresh the page, or try again in a bit.";
  grid.parentNode.insertBefore(errBox, grid);
  throw new Error("BJJ Connections: PUZZLES not found — data.js may have failed to load.");
}

// ---- Storage (resilient to private-browsing / disabled storage) ------
function readStoredState() { return BJJDaily.readState(); }
function writeStoredState(stateObj) {
  try {
    localStorage.setItem("bjjConnectionsState", JSON.stringify(stateObj));
  } catch (e) {
    console.warn("BJJ Connections: couldn't save stats (storage unavailable or full).", e);
  }
}

const state = readStoredState();
state.gamesPlayed ??= 0; state.gamesWon ??= 0; state.currentStreak ??= 0; state.longestStreak ??= 0;
state.bestTime ??= null; state.dailyHistory ??= {}; state.lastDaily ??= null;
const save = () => writeStoredState(state);

// ---- Dates & deterministic seeding ------------------------------------
function dayNumberForDate(d) { return BJJDaily.dayNumber(d); }
function dateKeyForDate(d) { return BJJDaily.dateKey(d); }
function dateKey() { return BJJDaily.dateKey(); }
function dayNumber() { return BJJDaily.dayNumber(); }
function dailyIndexForDate(d) { return Math.abs(dayNumberForDate(d)) % PUZZLES.length; }
function dailyIndex() { return dailyIndexForDate(new Date()); }

let trainingHistory = BJJTraining.read(PUZZLES);
const practiceSettings = BJJTraining.settings();
let trainingQueue = practiceSettings.queue;
function pickTraining() {
  const candidates = BJJTraining.pool(PUZZLES, trainingHistory, difficulty, trainingQueue);
  return BJJTraining.pick(candidates, trainingHistory, puzzle);
}
function updateTrainingSummary() {
  const candidates = PUZZLES.filter(p => difficulty === "all" || p.difficulty === difficulty);
  const remaining = candidates.filter(p => !trainingHistory[p.id]?.completed).length;
  $("trainingSummary").textContent = `${remaining}/${candidates.length} unplayed · Progress saved on this browser`;
}
function queryPuzzle() {
  const p = new URLSearchParams(location.search).get("p");
  if (!p || !/^\d+$/.test(p)) return null;
  const id = Number(p);
  return PUZZLES.find(x => x.id === id);
}

// ---- Game state --------------------------------------------------------
const RESULT_COLORS = ["🟩", "🟨", "🟦", "🟪"]; // fixed per puzzle group, order = data order
let mode = "daily", difficulty = practiceSettings.difficulty, puzzle = null, isDailyGame = false, isDailyReplay = false;
let words = [], selected = [], solved = [];
let mistakes = 4, startedAt = 0, finished = false, won = false;
let attemptedGuesses = [];
let guessLog = []; // rows of 4 colored squares, one per guess attempt — used for sharing
let loadedDateKey = dateKey();
let trackedProgress = BJJDaily.progressSnapshot();

function persistDaily() {
  if (!puzzle) return;
  const progress = {
    words, selected, solved: solved.map(g => puzzle.groups.indexOf(g)),
    mistakes, startedAt, guessLog, attemptedGuesses, finished, won, replay: isDailyReplay
  };
  if (isDailyGame) {
    BJJDaily.save(puzzle, progress);
    trackedProgress = BJJDaily.progressSnapshot();
  } else if (mode === "training") {
    BJJTraining.saveProgress(puzzle, progress, difficulty, trainingQueue);
  }
}

// ---- Loading a puzzle ---------------------------------------------------
// `override` (optional) = { puzzle, metaLabel } — used by the Archive view
// to force a specific past puzzle instead of the normal daily/training pick.
function loadPuzzle(override) {
  finished = false; won = false; selected = []; solved = []; mistakes = 4; guessLog = []; attemptedGuesses = [];
  loadedDateKey = dateKey();
  $("learnPanel").classList.add("hidden");
  $("resultSummary").classList.add("hidden");
  share.classList.add("hidden");
  next.classList.add("hidden");

  if (override) {
    puzzle = override.puzzle;
  } else {
    puzzle = mode === "daily" ? PUZZLES[dailyIndex()] : pickTraining();
  }
  isDailyGame = mode === "daily" && !override;
  if (!puzzle) {
    grid.innerHTML = ""; solvedBox.innerHTML = "";
    finished = true;
    meta.textContent = "Training";
    msg.textContent = trainingQueue === "mistakes" ? "No mistakes to practice at this difficulty. Try another queue or play a new round." : "You completed every puzzle at this difficulty. Choose Smart rotation to revisit them.";
    update(); updateTrainingSummary(); return;
  }
  if (mode === "training") {
    trainingHistory = {...trainingHistory, ...BJJTraining.read(PUZZLES)};
    trainingHistory[puzzle.id] = {...trainingHistory[puzzle.id], seen: Date.now()};
    BJJTraining.save(trainingHistory);
    updateTrainingSummary();
  }

  // Assign each group a fixed share-color for this play-through, by the
  // order it's defined in data.js (not by the order it's solved in).
  puzzle.groups.forEach((g, i) => { g.color = RESULT_COLORS[i]; });

  words = puzzle.groups.flatMap(g => g.items);
  // Deterministic shuffle for the daily puzzle (everyone sees the same
  // layout); random shuffle otherwise.
  const seed = mode === "daily" && !override ? dayNumber() + puzzle.id : Date.now();
  words = BJJGame.shuffled(words, seed);

  const saved = isDailyGame ? BJJDaily.read(puzzle) : override?.progress || null;
  isDailyReplay = isDailyGame && (!!saved?.replay || (!saved && !!state.dailyHistory[dateKey()]));
  if (saved) {
    words = saved.words;
    selected = saved.selected;
    solved = saved.solved.map(i => puzzle.groups[i]);
    mistakes = saved.mistakes;
    guessLog = saved.guessLog;
    attemptedGuesses = saved.attemptedGuesses || [];
    finished = !!saved.finished;
    won = !!saved.won;
  }

  startedAt = saved && Number.isFinite(saved.startedAt) ? saved.startedAt : Date.now();
  if (override && override.metaLabel) {
    meta.textContent = override.metaLabel;
  } else if (mode === "daily") {
    meta.textContent = `BJJ Connections #${dayNumber()} • ${dateKey()}`;
  } else {
    meta.textContent = `Training • ${puzzle.difficulty.toUpperCase()} BELT • Puzzle ${puzzle.id}`;
  }
  msg.textContent = (isDailyGame && !saved && state.dailyHistory[dateKey()])
    ? "Already completed today — replaying for practice."
    : override?.progress ? "Your unfinished practice puzzle is restored." : "";

  render();
  renderSolved();
  update();
  if (finished) showCompletion(!isDailyReplay ? state.dailyHistory[dateKey()]?.seconds ?? Math.round((Date.now() - startedAt) / 1000) : Math.round((Date.now() - startedAt) / 1000));
  else persistDaily();
  trackedProgress = BJJDaily.progressSnapshot();
}

// ---- Rendering -----------------------------------------------------------
function render() {
  const focusedWord = document.activeElement?.classList.contains("word")
    ? document.activeElement.textContent : null;
  grid.innerHTML = "";
  if (finished) return;
  words.forEach(word => {
    const b = document.createElement("button");
    const isSelected = selected.includes(word);
    b.className = "word" + (isSelected ? " sel" : "");
    b.textContent = word;
    b.disabled = finished;
    b.setAttribute("aria-pressed", isSelected ? "true" : "false");
    b.onclick = () => {
      selected.includes(word) ? selected = selected.filter(x => x !== word)
        : selected.length < 4 && selected.push(word);
      syncSelection(); update(); persistDaily();
    };
    grid.appendChild(b);
  });
  [...grid.children].forEach(BJJGame.fitLabel);
  if (focusedWord) [...grid.children].find(b => b.textContent === focusedWord)?.focus();
}
function syncSelection() {
  [...grid.children].forEach(button => {
    const active = selected.includes(button.textContent);
    button.classList.toggle("sel", active);
    button.setAttribute("aria-pressed", String(active));
  });
}
function renderSolved(animateGroup) {
  solvedBox.innerHTML = "";
  solved.forEach(g => {
    const box = document.createElement("div");
    box.className = `solved solved-${puzzle.groups.indexOf(g)}` + (g === animateGroup ? " group-enter" : "");
    box.innerHTML = `<b>${g.category}</b>${g.items.join(" · ")}<details class="connection-explanation"><summary>Why these connect</summary><p>${g.explanation}</p></details>`;
    solvedBox.appendChild(box);
  });
}
function update() {
  mistakesEl.textContent = mistakes;
  dots.textContent = "● ".repeat(mistakes).trim();
  dots.setAttribute("aria-label", `${mistakes} mistake${mistakes === 1 ? "" : "s"} remaining`);
  submit.disabled = selected.length !== 4 || finished;
  submit.textContent = finished ? "Complete" : `Submit (${selected.length}/4)`;
  $("deselect").disabled = !selected.length || finished;
  $("shuffle").disabled = finished;
  [$("shuffle"), $("deselect"), submit].forEach(button => button.classList.toggle("hidden", finished));
}

// ---- Gameplay --------------------------------------------------------
function showCompletion(seconds, animateGroup) {
  msg.textContent = won
    ? `Connected. ${seconds}s • ${mistakes} mistakes left.`
    : "Puzzle complete. Review the answers below.";
  puzzle.groups.filter(g => !solved.includes(g)).forEach(g => solved.push(g));
  renderSolved(animateGroup);
  grid.innerHTML = "";
  $("learn").innerHTML = puzzle.groups.map(g => `<p><b>${g.category}</b><br>${g.explanation}</p>`).join("");
  $("learnPanel").classList.remove("hidden");
  const history = isDailyGame && state.dailyHistory[dateKey()];
  const summary = $("resultSummary");
  const replay = isDailyReplay;
  const resultLabel = replay ? "Practice replay" : isDailyGame ? "Daily puzzle" : mode === "archive" ? "Archive puzzle" : "Training puzzle";
  const resultSeconds = history && !replay ? history.seconds : seconds;
  const resultMistakes = history && !replay ? history.mistakes : mistakes;
  summary.innerHTML = `<strong>${resultLabel} ${won ? "solved" : "complete"}</strong>` +
    `<span>${won ? `${resultSeconds}s · ${resultMistakes} mistake${resultMistakes === 1 ? "" : "s"} left` : "Answers revealed"}</span>` +
    (isDailyGame ? `<span>${BJJDaily.displayStreak(state)} day streak</span>` : "");
  summary.classList.remove("hidden");
  share.classList.remove("hidden");
  next.classList.remove("hidden");
  next.textContent = isDailyGame ? "Play Training" : mode === "archive" ? "Open Archive" : "New Training Puzzle";
  update();
}

function finish(win, animateGroup) {
  finished = true; won = win;
  try {
    if (localStorage.getItem("bjjConnectionsState") != null) Object.assign(state, readStoredState());
  } catch (_) { /* Keep session stats when storage is disabled. */ }
  const seconds = Math.round((Date.now() - startedAt) / 1000);
  if (isDailyGame) {
    BJJDaily.recordResult(state, puzzle, win, mistakes, seconds);
  } else {
    state.gamesPlayed++;
    if (win) {
      state.gamesWon++;
      if (state.bestTime === null || seconds < state.bestTime) state.bestTime = seconds;
    }
  }
  if (mode === "training") {
    trainingHistory = {...trainingHistory, ...BJJTraining.read(PUZZLES)};
    trainingHistory[puzzle.id] = {seen:Date.now(), completedAt:Date.now(), completed:true, win, mistakes};
    BJJTraining.save(trainingHistory); updateTrainingSummary();
  }
  save();
  showCompletion(seconds, animateGroup);
  persistDaily();
}

function submitGuess() {
  if (selected.length !== 4 || finished) return;
  const result = BJJGame.attempt(puzzle, selected, attemptedGuesses);
  if (result.type === "duplicate") {
    msg.textContent = "Already tried that group. Change a word and try again.";
    return;
  }
  if (result.type === "invalid") return;
  attemptedGuesses.push(result.key);
  guessLog.push(result.row);
  const found = result.group;

  if (found) {
    solved.push(found);
    words = words.filter(w => !found.items.includes(w));
    selected = [];
    msg.textContent = "Correct.";
    renderSolved(found); render();
    if (words.length === 0) finish(true, found);
  } else {
    const near = result.near;
    mistakes--;
    // Match the real NYT Connections behavior: a wrong guess does NOT
    // clear the selection. The words stay selected so the player can
    // just tap off the wrong one(s) and tap in a replacement, instead
    // of re-selecting all 4 from scratch every time.
    if (mistakes <= 0) finish(false);
    else msg.textContent = near ? `One away. ${4 - solved.length} groups remain.` : "Not a group.";
    render();
  }
  update();
  persistDaily();
}

function shuffle() {
  for (let i = words.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [words[i], words[j]] = [words[j], words[i]];
  }
  render();
  persistDaily();
}

// ---- Sharing -----------------------------------------------------------
async function shareResult() {
  const label = isDailyReplay ? "Practice replay" : mode === "daily" ? `#${dayNumber()} • ${dateKey()}` : meta.textContent;
  const grid4 = guessLog.join("\n");
  const text = `BJJ Connections ${label}\n\n${grid4}\n\n${won ? "Solved" : "Played"} • ${mistakes} mistakes left\nhttps://bjjconnectionsbygabe.com/puzzles.html?p=${puzzle.id}`;
  if (navigator.share) {
    try {
      await navigator.share({text});
      msg.textContent = "Results shared.";
      return;
    } catch (e) {
      if (e.name === "AbortError") return;
      // A failed share sheet should still offer clipboard/manual copy.
    }
  }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(
      () => { msg.textContent = "Results copied to clipboard."; },
      () => copyWithSelection(text)
    );
  } else {
    copyWithSelection(text);
  }
}
function copyWithSelection(text) {
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.className = "share-copy-fallback";
  document.body.appendChild(area);
  area.select();
  let copied = false;
  try { copied = document.execCommand("copy"); } catch (e) { /* selection remains available */ }
  if (copied) {
    area.remove();
    msg.textContent = "Results copied to clipboard.";
  } else {
    const close = document.createElement("button");
    close.type = "button";
    close.className = "share-copy-close ctrl";
    close.textContent = "Close copy box";
    close.onclick = () => { area.remove(); close.remove(); share.focus(); };
    document.body.appendChild(close);
    msg.textContent = "Your result is selected. Choose Copy, then close the copy box.";
  }
}

// ---- Stats ---------------------------------------------------------------
function showStats() {
  const winPct = state.gamesPlayed ? Math.round(state.gamesWon / state.gamesPlayed * 100) : 0;
  $("stats").innerHTML = [
    ["Played", state.gamesPlayed], ["Won", state.gamesWon], ["Win %", winPct + "%"],
    ["Current streak", BJJDaily.displayStreak(state)], ["Best streak", state.longestStreak],
    ["Best time", state.bestTime != null ? state.bestTime + "s" : "—"]
  ].map(([a, b]) => `<div class="stat"><b>${b}</b>${a}</div>`).join("");
  trainingHistory = {...trainingHistory, ...BJJTraining.read(PUZZLES)};
  const progress = $("beltProgress");
  progress.innerHTML = ["white","blue","purple","black"].map(level => {
    const pool = PUZZLES.filter(p => p.difficulty === level);
    const done = pool.filter(p => trainingHistory[p.id]?.completed).length;
    return `<div class="practice-progress-row"><span>${level[0].toUpperCase() + level.slice(1)}</span><progress max="${pool.length}" value="${done}" aria-label="${level} belt completion"></progress><span>${done}/${pool.length}</span></div>`;
  }).join("");
  const recent = $("recentPractice"); recent.replaceChildren();
  const completed = PUZZLES.filter(p => trainingHistory[p.id]?.completed)
    .sort((a,b) => trainingHistory[b.id].completedAt - trainingHistory[a.id].completedAt).slice(0,8);
  $("practiceEmpty").hidden = completed.length > 0;
  for (const p of completed) {
    const result = trainingHistory[p.id];
    const button = document.createElement("button");
    button.className = "practice-history-item";
    button.textContent = `Puzzle ${p.id} · ${p.difficulty.toUpperCase()} · ${result.win ? "Solved" : "Reviewed"} · ${4-result.mistakes} mistakes — Replay`;
    button.onclick = () => setMode("training", {puzzle:p});
    recent.appendChild(button);
  }
}

// ---- Archive (browse & replay past daily puzzles) ------------------------
const ARCHIVE_DAYS = 30;
function renderArchiveList() {
  archiveList.innerHTML = "";
  for (let i = 1; i <= ARCHIVE_DAYS; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const p = PUZZLES[dailyIndexForDate(d)];
    const dn = dayNumberForDate(d);
    const dateStr = dateKeyForDate(d);
    const btn = document.createElement("button");
    btn.className = "archiveItem";
    btn.innerHTML = `<span class="archiveDate">${dateStr}</span><span class="archiveTag">#${dn} · ${p.difficulty.toUpperCase()} BELT</span>`;
    btn.onclick = () => openArchivedPuzzle(p, dateStr, dn);
    archiveList.appendChild(btn);
  }
}
function openArchivedPuzzle(p, dateStr, dayNum) {
  mode = "archive";
  document.querySelectorAll(".tab").forEach(b => {
    const active = b.dataset.mode === "archive";
    b.classList.toggle("active", active);
    b.setAttribute("aria-selected", active ? "true" : "false");
  });
  $("archiveView").classList.add("hidden");
  $("gameView").classList.remove("hidden");
  difficultyWrap.classList.add("hidden");
  loadPuzzle({ puzzle: p, metaLabel: `Archive • ${dateStr} • BJJ Connections #${dayNum}` });
}

// ---- Mode switching ------------------------------------------------------
function setMode(m, override) {
  mode = m;
  document.querySelectorAll(".tab").forEach(b => {
    const active = b.dataset.mode === m;
    b.classList.toggle("active", active);
    b.setAttribute("aria-selected", active ? "true" : "false");
  });
  $("gameView").classList.toggle("hidden", m === "stats" || m === "archive");
  $("statsView").classList.toggle("hidden", m !== "stats");
  $("archiveView").classList.toggle("hidden", m !== "archive");
  difficultyWrap.classList.toggle("hidden", m !== "training");
  $("trainingTools").classList.toggle("hidden", m !== "training");

  if (m === "stats") showStats();
  else if (m === "archive") renderArchiveList();
  else {
    const resume = m === "training" && !override ? BJJTraining.readProgress(PUZZLES, difficulty, trainingQueue) : null;
    loadPuzzle(override || resume);
  }
}
document.querySelectorAll(".tab").forEach(b => b.onclick = () => setMode(b.dataset.mode));
document.querySelector(".puzzle-tabs").addEventListener("keydown", event => {
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
  const tabs = [...document.querySelectorAll(".tab")];
  const current = tabs.indexOf(document.activeElement);
  const nextIndex = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1
    : (current + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
  event.preventDefault();
  tabs[nextIndex].focus();
  setMode(tabs[nextIndex].dataset.mode);
});

// Difficulty filter buttons (Training mode only)
["all", "white", "blue", "purple", "black"].forEach(d => {
  const b = document.createElement("button");
  b.textContent = d === "all" ? "All" : d[0].toUpperCase() + d.slice(1);
  b.onclick = () => {
    difficulty = d;
    BJJTraining.saveSettings(difficulty, trainingQueue);
    [...difficultyWrap.children].forEach(x => x.classList.remove("active"));
    b.classList.add("active");
    loadPuzzle();
  };
  if (d === difficulty) b.classList.add("active");
  difficultyWrap.appendChild(b);
});

$("trainingQueue").value = trainingQueue;
$("newTraining").onclick = () => loadPuzzle();
$("trainingQueue").onchange = () => {
  trainingQueue = $("trainingQueue").value;
  BJJTraining.saveSettings(difficulty, trainingQueue);
  loadPuzzle();
};

// ---- Controls -------------------------------------------------------------
$("deselect").onclick = () => {
  selected = []; msg.textContent = "Select 4 words.";
  syncSelection(); update(); persistDaily();
};
grid.addEventListener("keydown", event => {
  if (event.key === "Enter" && selected.length === 4) {
    event.preventDefault(); submitGuess();
  }
});
submit.onclick = submitGuess;
$("shuffle").onclick = shuffle;
next.onclick = () => {
  if (mode === "daily") { setMode("training"); }
  else if (mode === "archive") { setMode("archive"); }
  else { loadPuzzle(); }
};
share.onclick = shareResult;
$("resetStats").onclick = () => {
  if (confirm("Reset all BJJ Connections stats?")) {
    try {
      localStorage.removeItem("bjjConnectionsState");
      localStorage.removeItem("bjjDailyProgress");
      localStorage.removeItem("bjjTrainingHistory");
      localStorage.removeItem("bjjPracticeProgress");
      localStorage.removeItem("bjjPracticeSettings");
    } catch (e) { /* ignore */ }
    location.reload();
  }
};

// ---- How to play -----------------------------------------------------------
// Reuses the same resilient storage pattern as game state: never throws,
// just falls back to "show it" if storage is unavailable.
const howToBtn = $("howToBtn"), howToPanel = $("howToPanel"), howToCloseBtn = $("howToCloseBtn");
function setHowToOpen(open) {
  howToPanel.classList.toggle("hidden", !open);
  howToBtn.setAttribute("aria-expanded", open ? "true" : "false");
}
howToBtn.onclick = () => setHowToOpen(howToPanel.classList.contains("hidden"));
howToCloseBtn.onclick = () => {
  setHowToOpen(false);
  try { localStorage.setItem("bjjConnectionsSeenHowTo", "1"); } catch (e) { /* ignore */ }
};
(function maybeAutoShowHowTo() {
  let seen = false;
  try { seen = localStorage.getItem("bjjConnectionsSeenHowTo") === "1"; } catch (e) { /* leave false */ }
  if (!seen) setHowToOpen(true);
})();

// ---- Boot -------------------------------------------------------------------
if (typeof validateAllPuzzles === "function") {
  const errors = validateAllPuzzles(PUZZLES);
  if (errors.length) console.warn("BJJ Connections puzzle bank issues:", errors);
} else {
  PUZZLES.forEach(p => {
    const errors = validatePuzzle(p);
    if (errors.length) console.warn("Puzzle", p.id, errors);
  });
}
const initialMode = new URLSearchParams(location.search).get("mode");
const linkedPuzzle = queryPuzzle();
if (linkedPuzzle && !initialMode) {
  setMode("training", {puzzle: linkedPuzzle, metaLabel: `Shared puzzle • ${linkedPuzzle.difficulty.toUpperCase()} BELT • Puzzle ${linkedPuzzle.id}`});
} else {
  setMode(["training", "archive", "stats"].includes(initialMode) ? initialMode : "daily");
}

// A long-open tab should roll over at the player's local midnight without
// requiring a hard refresh. Checking on focus/visibility avoids a busy timer.
function refreshForLocalDate() {
  const latestState = readStoredState();
  for (const field of Object.keys(state)) delete state[field];
  Object.assign(state, latestState);
  if (mode === "daily" && (loadedDateKey !== dateKey() ||
      (isDailyGame && trackedProgress !== BJJDaily.progressSnapshot()))) loadPuzzle();
  if (mode === "stats") showStats();
}
window.addEventListener("focus", refreshForLocalDate);
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") refreshForLocalDate();
});

window.addEventListener("resize", () => [...grid.children].forEach(BJJGame.fitLabel));
