// Return to validated puzzle progress and turn saved techniques into a practice rotation.
(function () {
  const $ = id => document.getElementById(id);
  const read = key => { try { const data = JSON.parse(localStorage.getItem(key) || '[]'); return Array.isArray(data) ? data : []; } catch (_) { return []; } };
  const canonical = name => name === 'Baseball Choke' ? 'Baseball Bat Choke' : name;
  const normalize = name => canonical(name.trim()).toLowerCase();
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function update() {
    if ($('resumePuzzle') && window.BJJDaily && window.BJJTraining) {
      const daily = DAILY_PUZZLES[Math.abs(BJJDaily.dayNumber()) % DAILY_PUZZLES.length];
      const progress = BJJDaily.read(daily);
      const settings = BJJTraining.settings();
      const practice = BJJTraining.readProgress(PUZZLES, settings.difficulty, settings.queue);
      const started = progress && !progress.finished && (progress.solved.length || progress.selected.length || progress.guessLog.length);
      const resume = started ? progress : practice?.progress;
      $('resumePuzzle').hidden = !resume;
      if (resume) {
        $('resumePuzzle').href = started ? 'puzzles.html?mode=daily' : 'puzzles.html?mode=training';
        $('resumeTitle').textContent = started ? 'Today’s puzzle is waiting' : 'Your practice puzzle is waiting';
        $('resumeDetail').textContent = resume.solved.length + ' of 4 groups found · ' + resume.mistakes + ' mistakes left';
      }
    }
    if (!$('techniqueRotation')) return;
    const favorites = [...new Set(read('bjjFavoriteTechniques').filter(n => typeof n === 'string' && n.trim()).map(canonical))];
    const today = new Date(); today.setHours(23,59,59,999);
    const cutoff = new Date(today); cutoff.setDate(cutoff.getDate()-30);
    const recent = new Map();
    read('bjjTrainingLog').forEach(session => {
      if (!session || typeof session.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(session.date) || typeof session.techniques !== 'string') return;
      const date = new Date(session.date+'T12:00:00');
      if (!Number.isFinite(date.getTime()) || date > today || date.getFullYear() !== +session.date.slice(0,4) || date.getMonth()+1 !== +session.date.slice(5,7) || date.getDate() !== +session.date.slice(8)) return;
      session.techniques.split(',').forEach(name => { const key = normalize(name); if (!recent.has(key) || date > recent.get(key)) recent.set(key,date); });
    });
    const practiced = favorites.filter(name => recent.get(normalize(name)) >= cutoff).length;
    $('rotationSummary').textContent = favorites.length ? practiced + ' of ' + favorites.length + ' saved techniques practiced in the last 30 days. Least recently practiced comes first.' : 'Save a few techniques in the library to build your practice rotation.';
    $('rotationProgress').max = favorites.length || 1; $('rotationProgress').value = practiced; $('rotationProgress').hidden = !favorites.length;
    const sorted = favorites.slice().sort((a,b) => (recent.get(normalize(a))?.getTime() || 0) - (recent.get(normalize(b))?.getTime() || 0));
    $('techniqueRotation').innerHTML = sorted.slice(0,6).map(name => {
      const last = recent.get(normalize(name));
      const label = last ? 'Last logged ' + last.toLocaleDateString(undefined,{month:'short',day:'numeric'}) : 'Not logged yet';
      return '<article class="rotation-card"><span class="rotation-state">'+escape(label)+'</span><h3>'+escape(name)+'</h3><div><a class="btn btn-primary btn-sm" href="training.html?technique='+encodeURIComponent(name)+'#training-log">Practice next ↗</a><a class="text-button" href="resources.html?q='+encodeURIComponent(name)+'#glossary">Review video →</a></div></article>';
    }).join('');
  }
  update();
  window.addEventListener('storage',update); window.addEventListener('focus',update);
  window.addEventListener('bjjlogchange',update);
})();
