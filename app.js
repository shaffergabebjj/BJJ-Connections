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
  return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000);
}
function dateKeyForDate(d) {
  return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, "0"), String(d.getDate()).padStart(2, "0")].join("-");
}
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
let mode = "daily", difficulty = "all", puzzle = null, isDailyGame = false, isDailyReplay = false;
let words = [], selected = [], solved = [];
let mistakes = 4, startedAt = 0, finished = false, won = false;
let guessLog = []; // rows of 4 colored squares, one per guess attempt — used for sharing
let loadedDateKey = dateKey();

function persistDaily() {
  if (!isDailyGame) return;
  BJJDaily.save(puzzle, {
    words, selected, solved: solved.map(g => puzzle.groups.indexOf(g)),
    mistakes, startedAt, guessLog, finished, won, replay: isDailyReplay
  });
}

// ---- Loading a puzzle ---------------------------------------------------
// `override` (optional) = { puzzle, metaLabel } — used by the Archive view
// to force a specific past puzzle instead of the normal daily/training pick.
function loadPuzzle(override) {
  finished = false; won = false; selected = []; solved = []; mistakes = 4; guessLog = [];
  loadedDateKey = dateKey();
  $("learnPanel").classList.add("hidden");
  $("resultSummary").classList.add("hidden");
  share.classList.add("hidden");
  next.classList.add("hidden");

  if (override) {
    puzzle = override.puzzle;
  } else {
    puzzle = queryPuzzle() || (mode === "daily" ? PUZZLES[dailyIndex()] : pickTraining());
  }
  isDailyGame = mode === "daily" && !override && !queryPuzzle();

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

  const saved = isDailyGame ? BJJDaily.read(puzzle) : null;
  isDailyReplay = isDailyGame && (!!saved?.replay || (!saved && !!state.dailyHistory[dateKey()]));
  if (saved) {
    words = saved.words;
    selected = saved.selected;
    solved = saved.solved.map(i => puzzle.groups[i]);
    mistakes = saved.mistakes;
    guessLog = saved.guessLog;
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
    : "";

  render();
  renderSolved();
  update();
  if (finished) showCompletion(!isDailyReplay ? state.dailyHistory[dateKey()]?.seconds ?? Math.round((Date.now() - startedAt) / 1000) : Math.round((Date.now() - startedAt) / 1000));
  else persistDaily();
}

// ---- Rendering -----------------------------------------------------------
function render() {
  const focusedWord = document.activeElement?.classList.contains("word")
    ? document.activeElement.textContent : null;
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
      render(); update(); persistDaily();
    };
    grid.appendChild(b);
  });
  if (focusedWord) [...grid.children].find(b => b.textContent === focusedWord)?.focus();
}
function renderSolved() {
  solvedBox.innerHTML = "";
  solved.forEach(g => {
    const box = document.createElement("div");
    box.className = `solved solved-${puzzle.groups.indexOf(g)}`;
    box.innerHTML = `<b>${g.category}</b>${g.items.join(" · ")}`;
    solvedBox.appendChild(box);
  });
}
function update() {
  mistakesEl.textContent = mistakes;
  dots.textContent = "● ".repeat(mistakes).trim();
  dots.setAttribute("aria-label", `${mistakes} mistake${mistakes === 1 ? "" : "s"} remaining`);
  submit.disabled = selected.length !== 4 || finished;
  $("shuffle").disabled = finished;
}

// ---- Gameplay --------------------------------------------------------
function showCompletion(seconds) {
  msg.textContent = won
    ? `Connected. ${seconds}s • ${mistakes} mistakes left.`
    : "Puzzle complete. Review the answers below.";
  puzzle.groups.filter(g => !solved.includes(g)).forEach(g => solved.push(g));
  renderSolved();
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
  next.textContent = isDailyGame ? "Practice another" : "Next Puzzle";
  update();
}

function finish(win) {
  finished = true; won = win;
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
  save();
  showCompletion(seconds);
  persistDaily();
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
    // Match the real NYT Connections behavior: a wrong guess does NOT
    // clear the selection. The words stay selected so the player can
    // just tap off the wrong one(s) and tap in a replacement, instead
    // of re-selecting all 4 from scratch every time.
    if (mistakes <= 0) finish(false);
    else msg.textContent = near ? "One away." : "Not a group.";
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
  const label = isDailyReplay ? "Practice replay" : mode === "daily" ? `#${dayNumber()}` : mode === "archive" ? "Archive" : "Training";
  const grid4 = guessLog.join("\n");
  const text = `BJJ Connections ${label}\n\n${grid4}\n\n${won ? "Solved" : "Played"} • ${mistakes} mistakes left\nbjjconnectionsbygabe.com`;
  if (navigator.share) {
    try {
      await navigator.share({text});
      msg.textContent = "Results shared.";
    } catch (e) {
      if (e.name !== "AbortError") msg.textContent = "Couldn't open the share sheet. Try again or copy the result.";
    }
    return;
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
    ["Best time", state.bestTime ? state.bestTime + "s" : "—"]
  ].map(([a, b]) => `<div class="stat"><b>${b}</b>${a}</div>`).join("");
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
    try {
      localStorage.removeItem("bjjConnectionsState");
      localStorage.removeItem("bjjDailyProgress");
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
loadPuzzle();

// A long-open tab should roll over at the player's local midnight without
// requiring a hard refresh. Checking on focus/visibility avoids a busy timer.
function refreshForLocalDate() {
  if (loadedDateKey !== dateKey() && mode === "daily") loadPuzzle();
}
window.addEventListener("focus", refreshForLocalDate);
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") refreshForLocalDate();
});
