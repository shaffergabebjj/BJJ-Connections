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
    if (selected.length !== 4 || new Set(selected).size !== 4 ||
        !selected.every(word => puzzle.groups.some(g => g.items.includes(word)))) return {type: 'invalid'};
    const key = window.BJJDaily.guessKey(selected);
    if (attempted.includes(key)) return {type: 'duplicate'};
    const group = puzzle.groups.find(g => g.items.every(w => selected.includes(w)));
    const near = !group && puzzle.groups.some(g => g.items.filter(w => selected.includes(w)).length === 3);
    const row = selected.map(w => colors[puzzle.groups.findIndex(g => g.items.includes(w))]).join('');
    return {type: group ? 'correct' : 'wrong', key, group, near, row};
  }
  let labelContext;
  function fitLabel(button) {
    if (!button.clientWidth || !button.style) return;
    button.style.fontSize = '';
    button.style.overflowWrap = '';
    const style = getComputedStyle(button);
    const available = button.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    labelContext ||= document.createElement('canvas').getContext('2d');
    if (!labelContext || available <= 0) return;
    const tokens = button.textContent.split(/[\s-]+/);
    let size = parseFloat(style.fontSize);
    function widest() {
      labelContext.font = `${style.fontWeight} ${size}px ${style.fontFamily}`;
      return Math.max(...tokens.map(token => labelContext.measureText(token).width));
    }
    while (size > 10 && widest() > available) size = Math.max(10, size - .25);
    button.style.fontSize = `${size}px`;
    if (widest() > available) button.style.overflowWrap = 'anywhere';
  }
  return {shuffled, attempt, fitLabel};
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
        valid[p.id] = {seen:r.seen, completedAt:Number.isFinite(r.completedAt) && r.completedAt >= 0 ? r.completedAt : r.seen, completed:r.completed === true, win:r.win === true,
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
  function settings() {
    let value;
    try { value = JSON.parse(localStorage.getItem('bjjPracticeSettings') || '{}'); } catch (_) {}
    return {
      difficulty: ['all','white','blue','purple','brown','black'].includes(value?.difficulty) ? value.difficulty : 'all',
      queue: ['all','unplayed','mistakes'].includes(value?.queue) ? value.queue : 'all'
    };
  }
  function saveSettings(difficulty, queue) {
    try { localStorage.setItem('bjjPracticeSettings', JSON.stringify({difficulty,queue})); } catch (_) {}
  }
  function signature(puzzle) { return JSON.stringify(puzzle.groups.map(g => g.items.slice().sort())); }
  function saveProgress(puzzle, progress, difficulty, queue) {
    try { localStorage.setItem('bjjPracticeProgress', JSON.stringify({
      ...progress, puzzle:puzzle.id, signature:signature(puzzle), difficulty, queue
    })); } catch (_) {}
  }
  function readProgress(puzzles, difficulty, queue) {
    try {
      const saved = JSON.parse(localStorage.getItem('bjjPracticeProgress') || 'null');
      const puzzle = puzzles.find(p => p.id === saved?.puzzle);
      if (!puzzle || saved.signature !== signature(puzzle) || saved.finished !== false ||
          saved.difficulty !== difficulty || saved.queue !== queue ||
          !Array.isArray(saved.words) || !Array.isArray(saved.selected) || !Array.isArray(saved.solved) ||
          !Array.isArray(saved.guessLog) || !Array.isArray(saved.attemptedGuesses) ||
          !Number.isFinite(saved.startedAt) || saved.startedAt < 0 || saved.startedAt > Date.now() ||
          !Number.isInteger(saved.mistakes) || saved.mistakes < 1 || saved.mistakes > 4 ||
          saved.solved.length >= 4 || new Set(saved.solved).size !== saved.solved.length ||
          !saved.solved.every(i => Number.isInteger(i) && i >= 0 && i < 4)) return null;
      const remaining = puzzle.groups.filter((_,i) => !saved.solved.includes(i)).flatMap(g => g.items);
      if (saved.words.length !== remaining.length || new Set(saved.words).size !== remaining.length ||
          !saved.words.every(w => remaining.includes(w)) || saved.selected.length > 4 ||
          new Set(saved.selected).size !== saved.selected.length || !saved.selected.every(w => remaining.includes(w)) ||
          saved.guessLog.length > 7 || !saved.guessLog.every(row => typeof row === 'string' && /^(?:🟩|🟨|🟦|🟪){4}$/u.test(row))) return null;
      const all = puzzle.groups.flatMap(g => g.items);
      saved.attemptedGuesses = saved.attemptedGuesses.filter(key => {
        try { const words = JSON.parse(key); return Array.isArray(words) && words.length === 4 &&
          new Set(words).size === 4 && words.every(w => all.includes(w)); } catch (_) { return false; }
      });
      return {puzzle, progress:saved};
    } catch (_) { return null; }
  }
  return {read, save, pool, pick, settings, saveSettings, saveProgress, readProgress};
})();
