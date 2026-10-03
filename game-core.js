// Pure game rules shared by the homepage and Puzzle Room; UI stays in each view.
window.BJJGame = (() => {
  const colors = ['🟩', '🟨', '🟦', '🟪'];
  function shuffled(words, seed) {
    const result = words.slice();
    for (let i = result.length - 1; i > 0; i--) {
      const n = Math.sin(seed + i) * 10000;
      const j = Math.floor((n - Math.floor(n)) * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
  function attempt(puzzle, selected, attempted) {
    if (selected.length !== 4 || new Set(selected).size !== 4) return {type: 'invalid'};
    const key = window.BJJDaily.guessKey(selected);
    if (attempted.includes(key)) return {type: 'duplicate'};
    const group = puzzle.groups.find(g => g.items.every(w => selected.includes(w)));
    const near = !group && puzzle.groups.some(g => g.items.filter(w => selected.includes(w)).length === 3);
    const row = selected.map(w => colors[puzzle.groups.findIndex(g => g.items.includes(w))]).join('');
    return {type: group ? 'correct' : 'wrong', key, group, near, row};
  }
  return {shuffled, attempt};
})();

window.BJJTraining = (() => {
  const key = 'bjjTrainingHistory';
  function read(puzzles) {
    try {
      const data = JSON.parse(localStorage.getItem(key) || '{}');
      if (!data || typeof data !== 'object' || Array.isArray(data)) return {};
      const valid = {};
      for (const p of puzzles) {
        const r = data[p.id];
        if (!r || typeof r !== 'object') continue;
        if (!Number.isFinite(r.seen) || r.seen < 0) continue;
        valid[p.id] = {seen:r.seen, completed:r.completed === true, win:r.win === true,
          mistakes:Number.isInteger(r.mistakes) && r.mistakes >= 0 && r.mistakes <= 4 ? r.mistakes : 0};
      }
      return valid;
    } catch (_) { return {}; }
  }
  function save(history) { try { localStorage.setItem(key, JSON.stringify(history)); } catch (_) {} }
  function pool(puzzles, history, difficulty, queue) {
    const candidates = puzzles.filter(p => difficulty === 'all' || p.difficulty === difficulty);
    if (queue === 'unplayed') return candidates.filter(p => !history[p.id]?.completed);
    if (queue === 'mistakes') return candidates.filter(p => history[p.id]?.completed &&
      (!history[p.id].win || history[p.id].mistakes < 4));
    return candidates;
  }
  function pick(candidates, history, current) {
    const choices = candidates.filter(p => p.id !== current?.id);
    const available = choices.length ? choices : candidates;
    return available.slice().sort((a,b) =>
      Number(!!history[a.id]?.completed) - Number(!!history[b.id]?.completed) ||
      (history[a.id]?.seen || 0) - (history[b.id]?.seen || 0) || a.id - b.id)[0] || null;
  }
  return {read, save, pool, pick};
})();
