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
