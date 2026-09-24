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
function readStoredState() {
  try {
    return JSON.parse(localStorage.getItem("bjjConnectionsState") || "{}");
  } catch (e) {
    console.warn("BJJ Connections: localStorage unavailable, stats will not persist this session.", e);
    return {};
  }
}
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
function dayNumberForDate(d) {
  return Math.floor(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) / 86400000);
}
function dateKeyForDate(d) { return d.toISOString().slice(0, 10); }
function dateKey() { return dateKeyForDate(new Date()); }
function dayNumber() { return dayNumberForDate(new Date()); }
function dailyIndexForDate(d) { return Math.abs(dayNumberForDate(d)) % PUZZLES.length; }
function dailyIndex() { return dailyIndexForDate(new Date()); }
function seeded(n) { let x = Math.sin(n) * 10000; return x - Math.floor(x); }

function pickTraining() {
  const pool = difficulty === "all" ? PUZZLES : PUZZLES.filter(p => p.difficulty === difficulty);
  return pool[Math.floor(Math.random() * pool.length)];
}
function queryPuzzle() {
  const p = new URLSearchParams(location.search).get("p");
  const id = Number(p);
  return PUZZLES.find(x => x.id === id);
}

// ---- Game state --------------------------------------------------------
const RESULT_COLORS = ["🟩", "🟨", "🟦", "🟪"]; // fixed per puzzle group, order = data order
let mode = "daily", difficulty = "all", puzzle = null;
let words = [], selected = [], solved = [];
let mistakes = 4, startedAt = 0, finished = false, won = false;
let guessLog = []; // rows of 4 colored squares, one per guess attempt — used for sharing

// ---- Loading a puzzle ---------------------------------------------------
// `override` (optional) = { puzzle, metaLabel } — used by the Archive view
// to force a specific past puzzle instead of the normal daily/training pick.
function loadPuzzle(override) {
  finished = false; won = false; selected = []; solved = []; mistakes = 4; guessLog = [];
  $("learnPanel").classList.add("hidden");
  share.classList.add("hidden");
  next.classList.add("hidden");

  if (override) {
    puzzle = override.puzzle;
  } else {
    puzzle = queryPuzzle() || (mode === "daily" ? PUZZLES[dailyIndex()] : pickTraining());
  }

  // Assign each group a fixed share-color for this play-through, by the
  // order it's defined in data.js (not by the order it's solved in).
  puzzle.groups.forEach((g, i) => { g.color = RESULT_COLORS[i]; });

  words = puzzle.groups.flatMap(g => g.items);
  // Deterministic shuffle for the daily puzzle (everyone sees the same
  // layout); random shuffle otherwise.
  const seed = mode === "daily" && !override ? dayNumber() + puzzle.id : Date.now();
  for (let i = words.length - 1; i > 0; i--) {
    const j = Math.floor(seeded(seed + i) * (i + 1));
    [words[i], words[j]] = [words[j], words[i]];
  }

  startedAt = Date.now();
  if (override && override.metaLabel) {
    meta.textContent = override.metaLabel;
  } else if (mode === "daily") {
    meta.textContent = `BJJ Connections #${dayNumber()} • ${dateKey()}`;
  } else {
    meta.textContent = `Training • ${puzzle.difficulty.toUpperCase()} BELT • Puzzle ${puzzle.id}`;
  }
  msg.textContent = (mode === "daily" && !override && state.dailyHistory[dateKey()])
    ? "Already completed today — replaying for practice."
    : "";

  render();
  renderSolved();
  update();
}

// ---- Rendering -----------------------------------------------------------
function render() {
  grid.innerHTML = "";
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
      render(); update();
    };
    grid.appendChild(b);
  });
}
function renderSolved() {
  solvedBox.innerHTML = "";
  solved.forEach(g => {
    const box = document.createElement("div");
    box.className = "solved";
    box.innerHTML = `<b>${g.category}</b>${g.items.join(" · ")}`;
    solvedBox.appendChild(box);
  });
}
function update() {
  mistakesEl.textContent = mistakes;
  dots.textContent = "● ".repeat(mistakes).trim();
  dots.setAttribute("aria-label", `${mistakes} mistake${mistakes === 1 ? "" : "s"} remaining`);
  submit.disabled = selected.length !== 4 || finished;
}

// ---- Gameplay --------------------------------------------------------
function finish(win) {
  finished = true; won = win;
  const seconds = Math.round((Date.now() - startedAt) / 1000);
  state.gamesPlayed++;
  if (win) {
    state.gamesWon++;
    if (mode === "daily" && !state.dailyHistory[dateKey()]) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      state.currentStreak = state.lastDaily === yesterday ? state.currentStreak + 1 : 1;
      state.longestStreak = Math.max(state.longestStreak, state.currentStreak);
      state.lastDaily = dateKey();
      state.dailyHistory[dateKey()] = { win: true, mistakes, seconds, puzzle: puzzle.id };
    }
    if (state.bestTime === null || seconds < state.bestTime) state.bestTime = seconds;
  }
  save();
  msg.textContent = win
    ? `Connected. ${seconds}s • ${mistakes} mistakes left.`
    : "Puzzle complete. Review the answers below.";
  puzzle.groups.filter(g => !solved.includes(g)).forEach(g => solved.push(g));
  renderSolved();
  grid.innerHTML = "";
  $("learn").innerHTML = puzzle.groups.map(g => `<p><b>${g.category}</b><br>${g.explanation}</p>`).join("");
  $("learnPanel").classList.remove("hidden");
  share.classList.remove("hidden");
  next.classList.remove("hidden");
  update();
}

function submitGuess() {
  if (selected.length !== 4 || finished) return;
  const attempted = selected.slice(); // capture before we clear it below
  const found = puzzle.groups.find(g => g.items.every(w => attempted.includes(w)));

  // Log this attempt's colors for the share grid: each square is the
  // TRUE color of that word's category, whether or not it was correct —
  // this is what makes the shared pattern meaningfully show "how close".
  guessLog.push(attempted.map(w => puzzle.groups.find(g => g.items.includes(w)).color).join(""));

  if (found) {
    solved.push(found);
    words = words.filter(w => !found.items.includes(w));
    selected = [];
    msg.textContent = "Correct.";
    renderSolved(); render();
    if (words.length === 0) finish(true);
  } else {
    const near = puzzle.groups.some(g => g.items.filter(w => attempted.includes(w)).length === 3);
    mistakes--;
    selected = [];
    if (mistakes <= 0) finish(false);
    else msg.textContent = near ? "One away." : "Not a group.";
    render();
  }
  update();
}

function shuffle() {
  for (let i = words.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [words[i], words[j]] = [words[j], words[i]];
  }
  render();
}

// ---- Sharing -----------------------------------------------------------
function shareResult() {
  const label = mode === "daily" ? `#${dayNumber()}` : mode === "archive" ? "Archive" : "Training";
  const grid4 = guessLog.join("\n");
  const text = `BJJ Connections ${label}\n\n${grid4}\n\n${won ? "Solved" : "Played"} • ${mistakes} mistakes left\nbjjconnectionsbygabe.com`;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(
      () => { msg.textContent = "Results copied to clipboard."; },
      () => { msg.textContent = "Couldn't copy automatically — you can select and copy the result manually."; }
    );
  } else {
    msg.textContent = "Clipboard isn't available in this browser.";
  }
}

// ---- Stats ---------------------------------------------------------------
function showStats() {
  const winPct = state.gamesPlayed ? Math.round(state.gamesWon / state.gamesPlayed * 100) : 0;
  $("stats").innerHTML = [
    ["Played", state.gamesPlayed], ["Won", state.gamesWon], ["Win %", winPct + "%"],
    ["Current streak", state.currentStreak], ["Best streak", state.longestStreak],
    ["Best time", state.bestTime ? state.bestTime + "s" : "—"]
  ].map(([a, b]) => `<div class="stat"><b>${b}</b>${a}</div>`).join("");
}

// ---- Archive (browse & replay past daily puzzles) ------------------------
const ARCHIVE_DAYS = 30;
function renderArchiveList() {
  archiveList.innerHTML = "";
  for (let i = 1; i <= ARCHIVE_DAYS; i++) {
    const d = new Date(Date.now() - i * 86400000);
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
function setMode(m) {
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

  if (m === "stats") showStats();
  else if (m === "archive") renderArchiveList();
  else loadPuzzle();
}
document.querySelectorAll(".tab").forEach(b => b.onclick = () => setMode(b.dataset.mode));

// Difficulty filter buttons (Training mode only)
["all", "white", "blue", "purple", "black"].forEach(d => {
  const b = document.createElement("button");
  b.textContent = d === "all" ? "All" : d[0].toUpperCase() + d.slice(1);
  b.onclick = () => {
    difficulty = d;
    [...difficultyWrap.children].forEach(x => x.classList.remove("active"));
    b.classList.add("active");
    loadPuzzle();
  };
  if (d === "all") b.classList.add("active");
  difficultyWrap.appendChild(b);
});

// ---- Controls -------------------------------------------------------------
submit.onclick = submitGuess;
$("shuffle").onclick = shuffle;
next.onclick = () => {
  if (mode === "daily") { mode = "training"; setMode("training"); }
  else if (mode === "archive") { setMode("archive"); }
  else { loadPuzzle(); }
};
share.onclick = shareResult;
$("resetStats").onclick = () => {
  if (confirm("Reset all BJJ Connections stats?")) {
    try { localStorage.removeItem("bjjConnectionsState"); } catch (e) { /* ignore */ }
    location.reload();
  }
};

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
loadPuzzle();
