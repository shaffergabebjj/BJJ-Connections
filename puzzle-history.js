// Show only words already guessed, without revealing untried answers.
window.BJJGuessHistory = (() => {
  const escape = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function rows(puzzle, guesses) {
    return guesses.flatMap(key => {
      try {
        const words = JSON.parse(key);
        if (!Array.isArray(words) || words.length !== 4 || new Set(words).size !== 4 || !words.every(w=>puzzle.groups.some(g=>g.items.includes(w)))) return [];
        const overlap = Math.max(...puzzle.groups.map(g=>words.filter(w=>g.items.includes(w)).length));
        return [{words, verdict:overlap === 4 ? 'Group found' : overlap === 3 ? 'One away' : 'Not a group', correct:overlap === 4}];
      } catch (_) { return []; }
    });
  }
  function render(panel,puzzle,guesses) {
    if (!panel || !puzzle) return;
    const attempts = rows(puzzle,guesses);
    panel.hidden = !attempts.length;
    panel.querySelector('summary span').textContent = attempts.length ? '('+attempts.length+')' : '';
    panel.querySelector('.guess-history-list').innerHTML = attempts.map((attempt,i)=>'<div class="guess-history-row"><div><b>'+ (i+1) +'. '+attempt.verdict+'</b><span>'+attempt.words.map(escape).join(' · ')+'</span></div><span class="guess-verdict '+(attempt.correct?'is-correct':'')+'">'+(attempt.correct?'✓':'×')+'</span></div>').join('');
  }
  for (const id of ['grid','homePuzzleGrid']) {
    const grid = document.getElementById(id);
    if (!grid) continue;
    grid.addEventListener('keydown',event=>{
      const keys = {ArrowLeft:-1,ArrowRight:1,ArrowUp:-4,ArrowDown:4};
      if (!(event.key in keys)) return;
      const buttons = [...grid.querySelectorAll('button')], index = buttons.indexOf(event.target);
      if (index < 0) return;
      event.preventDefault();
      const next = Math.max(0,Math.min(buttons.length-1,index+keys[event.key]));
      buttons[next]?.focus();
    });
  }
  return {render,rows};
})();
