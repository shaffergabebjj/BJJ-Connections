// Shared daily puzzle state for the homepage and full game.
window.BJJDaily = (function () {
  const key = "bjjDailyProgress";
  function dateKey(d = new Date()) {
    return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, "0"), String(d.getDate()).padStart(2, "0")].join("-");
  }
  function dayNumber(d = new Date()) {
    return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000);
  }
  function read(puzzle) {
    try {
      const saved = JSON.parse(localStorage.getItem(key) || "null");
      const all = puzzle.groups.flatMap(g => g.items);
      if (!saved || saved.date !== dateKey() || saved.puzzle !== puzzle.id ||
          !Array.isArray(saved.words) || !Array.isArray(saved.selected) ||
          !Array.isArray(saved.solved) || !Array.isArray(saved.guessLog) ||
          new Set(saved.words).size !== saved.words.length ||
          !saved.words.every(w => all.includes(w)) ||
          !saved.selected.every(w => saved.words.includes(w)) ||
          !saved.solved.every(i => Number.isInteger(i) && i >= 0 && i < 4) ||
          saved.selected.length > 4 || saved.solved.length > 4 ||
          !Number.isInteger(saved.mistakes) || saved.mistakes < 0 || saved.mistakes > 4) return null;
      return saved;
    } catch (e) { return null; }
  }
  function save(puzzle, progress) {
    try { localStorage.setItem(key, JSON.stringify({date: dateKey(), puzzle: puzzle.id, ...progress})); }
    catch (e) { /* Storage can be disabled; the game still works for this session. */ }
  }
  function recordResult(state, puzzle, win, mistakes, seconds) {
    state.dailyHistory ??= {};
    if (state.dailyHistory[dateKey()]) return false;
    state.gamesPlayed = (state.gamesPlayed || 0) + 1;
    if (win) {
      state.gamesWon = (state.gamesWon || 0) + 1;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      state.currentStreak = state.lastDaily === dateKey(yesterday) ? (state.currentStreak || 0) + 1 : 1;
      state.longestStreak = Math.max(state.longestStreak || 0, state.currentStreak);
      state.lastDaily = dateKey();
      if (state.bestTime == null || seconds < state.bestTime) state.bestTime = seconds;
    } else {
      state.currentStreak = 0;
    }
    state.dailyHistory[dateKey()] = {win, mistakes, seconds, puzzle: puzzle.id};
    return true;
  }
  return {dateKey, dayNumber, read, save, recordResult};
})();
