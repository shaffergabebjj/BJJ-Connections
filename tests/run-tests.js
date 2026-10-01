const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");

function loadData() {
  const context = {};
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(root, "data.js"), "utf8") +
    ";globalThis.result={PUZZLES,validateAllPuzzles};", context);
  return context.result;
}

function loadDaily(now) {
  const values = new Map();
  const RealDate = Date;
  class FakeDate extends RealDate {
    constructor(...args) { super(...(args.length ? args : [now])); }
    static now() { return new RealDate(now).getTime(); }
  }
  const context = {
    window: {}, Date: FakeDate,
    localStorage: {
      getItem: key => values.get(key) || null,
      setItem: (key, value) => values.set(key, value)
    }
  };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(root, "daily-progress.js"), "utf8"), context);
  return {daily: context.window.BJJDaily, values};
}

const {PUZZLES, validateAllPuzzles} = loadData();
assert.equal(PUZZLES.length, 100, "daily index history depends on the 100-puzzle bank");
assert.deepEqual([...validateAllPuzzles(PUZZLES)], []);
for (let i = 0; i < PUZZLES.length; i++) {
  const words = new Set(PUZZLES[i].groups.flatMap(group => group.items));
  for (let j = i + 1; j < PUZZLES.length; j++) {
    const overlap = PUZZLES[j].groups.flatMap(group => group.items)
      .filter(word => words.has(word)).length;
    assert(overlap < 15, `puzzles ${i + 1} and ${j + 1} share ${overlap} of 16 answers`);
  }
}

const repeatedWords = JSON.parse(JSON.stringify(PUZZLES[0]));
repeatedWords.id = 101;
repeatedWords.groups[0].category = "A DIFFERENT LABEL";
assert(validateAllPuzzles([...PUZZLES, repeatedWords]).some(error =>
  error.includes("repeats all 16 words from puzzle 1")));
assert(PUZZLES.some(p => p.groups.some(g => g.items.includes("ANDREW WILTSE"))));
assert(PUZZLES.some(p => p.groups.some(g => g.items.includes("NICHOLAS MEREGALI"))));

const {daily} = loadDaily("2026-09-29T23:30:00");
assert.equal(daily.dateKey(), "2026-09-29");
assert.equal(daily.dayNumber(), 20725);
const puzzle = PUZZLES[25];
const savedProgress = {
  date: daily.dateKey(), puzzle: puzzle.id,
  words: puzzle.groups.flatMap(group => group.items), selected: [], solved: [],
  guessLog: [], mistakes: 4, finished: false, won: false
};
const storage = loadDaily("2026-09-29T23:30:00");
storage.values.set("bjjDailyProgress", JSON.stringify(savedProgress));
assert(storage.daily.read(puzzle), "valid progress should restore");
storage.values.set("bjjDailyProgress", JSON.stringify({...savedProgress, words: savedProgress.words.slice(1)}));
assert.equal(storage.daily.read(puzzle), null, "an incomplete grid should be rejected");
storage.values.set("bjjDailyProgress", JSON.stringify({...savedProgress, selected: [savedProgress.words[0], savedProgress.words[0]]}));
assert.equal(storage.daily.read(puzzle), null, "duplicate selections should be rejected");
const state = {};
assert.equal(daily.recordResult(state, puzzle, true, 3, 45), true);
assert.equal(daily.recordResult(state, puzzle, true, 4, 1), false, "a daily result is immutable");
assert.equal(state.gamesPlayed, 1);
assert.equal(state.gamesWon, 1);
assert.equal(state.currentStreak, 1);
assert.equal(daily.displayStreak(state), 1);
assert.equal(daily.displayStreak(state, new Date("2026-10-02T12:00:00")), 0, "missed days end displayed streaks");

for (const file of fs.readdirSync(root).filter(file => file.endsWith(".html"))) {
  const html = fs.readFileSync(path.join(root, file), "utf8");
  for (const [, target] of html.matchAll(/href="([^"#]+\.html)(?:#[^"]*)?"/g)) {
    if (/^https?:\/\//.test(target)) continue;
    assert(fs.existsSync(path.join(root, target)), `${file} links to missing ${target}`);
  }
}

console.log("All game-state, puzzle-bank, and internal-link checks passed.");

// Exercise real click handlers in both entry points with shared browser storage.
function gameHarness(page, values = new Map(), search = "") {
  const elements = new Map();
  const events = new Map();
  let reloads = 0;
  function element() {
    const classes = new Set();
    const node = {
      children: [], dataset: {}, hidden: false, disabled: false, textContent: "",
      classList: {add: x => classes.add(x), remove: x => classes.delete(x),
        contains: x => classes.has(x), toggle(x, force) {
          const on = force ?? !classes.has(x); on ? classes.add(x) : classes.delete(x);
        }},
      setAttribute() {}, addEventListener() {}, focus() {},
      appendChild(child) { this.children.push(child); return child; },
      append(...children) { this.children.push(...children); },
      replaceChildren(...children) { this.children = children; }
    };
    Object.defineProperty(node, "innerHTML", {set() { this.children = []; }});
    return node;
  }
  const html = fs.readFileSync(path.join(root, page), "utf8");
  for (const [, id] of html.matchAll(/id="([^"]+)"/g)) elements.set(id, element());
  const context = {
    console, Date, Intl, URLSearchParams, location: {search, reload() { reloads++; }},
    navigator: {}, addEventListener(type, handler) { events.set(type, handler); },
    localStorage: {getItem: key => values.get(key) || null,
      setItem: (key, value) => values.set(key, value)},
    document: {getElementById: id => elements.get(id), createElement: element,
      createTextNode: text => ({textContent: text}), addEventListener() {},
      querySelectorAll: () => [], querySelector: () => element()}
  };
  context.window = context;
  vm.createContext(context);
  for (const file of ["data.js", "daily-progress.js"]) {
    vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), context);
  }
  const script = page === "index.html"
    ? html.match(/<script>\s*\(function \(\) \{([\s\S]*?)<\/script>/)[0].replace(/<\/?script>/g, "")
    : fs.readFileSync(path.join(root, "app.js"), "utf8");
  vm.runInContext(script, context);
  const prefix = page === "index.html" ? "home" : "";
  return {elements, values, focus: () => events.get("focus")?.(),
    reloadCount: () => reloads, grid: elements.get(prefix ? "homePuzzleGrid" : "grid"),
    submit: elements.get(prefix ? "homeSubmit" : "submit"),
    deselect: elements.get(prefix ? "homeDeselect" : "deselect"),
    message: elements.get(prefix ? "homeMessage" : "msg"),
    progress: () => JSON.parse(values.get("bjjDailyProgress"))};
}
const homeGame = gameHarness("index.html");
const today = PUZZLES[Math.abs(daily.dayNumber(new Date())) % PUZZLES.length];
const wrongGuess = [today.groups[0].items[0], today.groups[1].items[0],
  today.groups[2].items[0], today.groups[3].items[0]];
for (const word of wrongGuess) homeGame.grid.children.find(b => b.textContent === word).onclick();
assert.equal(homeGame.submit.textContent, "Submit (4/4)");
homeGame.submit.onclick();
assert.equal(homeGame.progress().mistakes, 3);
homeGame.submit.onclick();
assert.equal(homeGame.progress().mistakes, 3, "duplicate guesses cannot cost another mistake");
assert.match(homeGame.message.textContent, /Already tried/);
const fullGame = gameHarness("puzzles.html", homeGame.values);
fullGame.submit.onclick();
assert.equal(fullGame.progress().mistakes, 3, "duplicate guard survives switching game views");
fullGame.deselect.onclick();
assert.equal(fullGame.progress().selected.length, 0);
for (const group of today.groups) {
  for (const word of group.items) fullGame.grid.children.find(b => b.textContent === word).onclick();
  fullGame.submit.onclick();
}
assert.equal(fullGame.progress().won, true);
const completedHome = gameHarness("index.html", fullGame.values);
assert.equal(completedHome.elements.get("homeLearn").hidden, false);
assert.equal(completedHome.elements.get("homeExplanations").children.length, 4);
assert.equal(completedHome.grid.children.length, 0);
assert.equal(completedHome.submit.disabled, true);
assert.equal(completedHome.elements.get("homeResult").hidden, false);
assert.equal(completedHome.elements.get("homeResultTitle").textContent, "Every connection found.");
const practice = gameHarness("puzzles.html", new Map(), "?mode=training");
assert.match(practice.elements.get("puzzleMeta").textContent, /^Training/);
assert.equal(practice.values.has("bjjDailyProgress"), false, "practice entry must not overwrite the daily game");
console.log("Homepage/full-game duplicate guesses, progress transfer, deselect, and explanations passed.");

// A lost game must reveal answers without repopulating the playable grid.
for (const page of ["index.html", "puzzles.html"]) {
  const game = gameHarness(page);
  for (let i = 0; i < 4; i++) {
    game.deselect.onclick();
    const guess = [today.groups[0].items[i], today.groups[1].items[0],
      today.groups[2].items[0], today.groups[3].items[0]];
    for (const word of guess) game.grid.children.find(b => b.textContent === word).onclick();
    game.submit.onclick();
  }
  assert.equal(game.progress().won, false);
  assert.equal(game.progress().finished, true);
  assert.equal(game.grid.children.length, 0, "loss should not restore disabled word tiles");
  assert.equal(game.submit.disabled, true);
}
// Return to an older tab after another view has advanced the game.
const sharedValues = new Map();
const oldHome = gameHarness("index.html", sharedValues);
const olderFullGame = gameHarness("puzzles.html", sharedValues);
oldHome.focus();
assert.equal(oldHome.reloadCount(), 0, "own unchanged progress must not reload");
for (const word of today.groups[0].items) olderFullGame.grid.children.find(b => b.textContent === word).onclick();
olderFullGame.submit.onclick();
oldHome.focus();
assert.equal(oldHome.reloadCount(), 1, "homepage must refresh stale progress on focus");
const newHome = gameHarness("index.html", sharedValues);
for (const word of today.groups[1].items) newHome.grid.children.find(b => b.textContent === word).onclick();
newHome.submit.onclick();
olderFullGame.focus();
assert.equal(olderFullGame.grid.children.length, 8, "full game must restore latest groups on focus");
assert.equal(olderFullGame.progress().solved.length, 2);

for (const badState of ["null", "[]", "7", '"text"', '{broken',
  '{"dailyHistory":7,"gamesPlayed":"bad","bestTime":"bad"}',
  '{"dailyHistory":{"2026-10-01":null},"gamesWon":-2}']) {
  for (const page of ["index.html", "puzzles.html"]) {
    const values = new Map([["bjjConnectionsState", badState]]);
    const game = gameHarness(page, values);
    for (const group of today.groups) {
      for (const word of group.items) game.grid.children.find(b => b.textContent === word).onclick();
      game.submit.onclick();
    }
    assert.equal(game.progress().won, true, "malformed stats cannot block play or completion");
    assert.equal(JSON.parse(values.get("bjjConnectionsState")).gamesWon, 1);
  }
}
console.log("Loss rendering, stale-tab recovery, and malformed saved-stats checks passed.");

async function testOfflineLinks() {
  const handlers = {};
  let response;
  const cachedPage = {page: "puzzles"};
  const context = {
    self: {location: {origin: "https://bjjconnectionsbygabe.com"},
      addEventListener: (name, handler) => { handlers[name] = handler; }},
    URL, Response, fetch: async () => { throw new Error("offline"); },
    caches: {match: async target => target === "/puzzles.html" ? cachedPage : undefined}
  };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(root, "sw.js"), "utf8"), context);
  handlers.fetch({request: {method: "GET", mode: "navigate",
    url: "https://bjjconnectionsbygabe.com/puzzles.html?p=27"},
    respondWith: promise => { response = promise; }});
  assert.equal(await response, cachedPage, "offline puzzle links must open the cached puzzle page");
  console.log("Offline puzzle-link navigation passed.");
}
testOfflineLinks().catch(error => { console.error(error); process.exitCode = 1; });
