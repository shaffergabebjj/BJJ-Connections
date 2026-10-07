// Use elapsed time rather than interval counts, including after a background tab resumes.
window.BJJRoundClock = function (config, now = () => Date.now()) {
  const phases = [];
  for (let round = 1; round <= config.rounds; round++) {
    phases.push({label:'Work', round, seconds:config.workSeconds});
    if (round < config.rounds && config.restSeconds) phases.push({label:'Rest', round, seconds:config.restSeconds});
  }
  let index = 0, remaining = phases[0].seconds * 1000, deadline = 0, running = false;
  function snapshot() {
    if (running) {
      let elapsed = now();
      while (index < phases.length && elapsed >= deadline) {
        index++;
        if (index < phases.length) deadline += phases[index].seconds * 1000;
      }
      if (index === phases.length) { running = false; remaining = 0; }
      else remaining = Math.max(0, deadline - elapsed);
    }
    const phase = phases[index];
    return {running, finished:!phase, label:phase?.label || 'Complete', round:phase?.round || config.rounds,
      rounds:config.rounds, seconds:Math.ceil(remaining/1000), progress:phase ? 1-remaining/(phase.seconds*1000) : 1};
  }
  return {
    snapshot,
    start() { if (index < phases.length && !running) { deadline = now() + remaining; running = true; } return snapshot(); },
    pause() { snapshot(); running = false; return snapshot(); }
  };
};

(function () {
  const $ = id => document.getElementById(id);
  if (!$('roundTimer')) return;
  const settings = ['timerWork','timerRest','timerRounds'].map($);
  const presets = [...document.querySelectorAll('[data-timer-preset]')];
  let clock, interval, started = false;
  try {
    const stored = JSON.parse(localStorage.getItem('bjjTimerSettings') || 'null');
    if (Array.isArray(stored) && stored.length === settings.length && stored.every((v,i) => [...settings[i].options].some(option => option.value === v))) {
      settings.forEach((el,i) => el.value = stored[i]);
    }
  } catch (_) {}
  function saveSettings() {
    try { localStorage.setItem('bjjTimerSettings', JSON.stringify(settings.map(el => el.value))); } catch (_) {}
  }
  presets.forEach(button => {
    button.addEventListener('click', () => {
      if (started && !clock.snapshot().finished) return;
      const values = button.getAttribute('data-timer-preset').split(',');
      settings.forEach((el, index) => { if (values[index] && [...el.options].some(option => option.value === values[index])) el.value = values[index]; });
      saveSettings(); reset();
    });
  });
  function reset() {
    clearInterval(interval);
    started = false;
    clock = window.BJJRoundClock({workSeconds:Number(settings[0].value)*60, restSeconds:Number(settings[1].value), rounds:Number(settings[2].value)});
    const rounds = Number(settings[2].value);
    const total = Number(settings[0].value)*60*rounds + Number(settings[1].value)*(rounds-1);
    $('timerTotal').textContent = Math.floor(total/60) + ' min' + (total%60 ? ' ' + total%60 + ' sec' : '') + ' total · ' + rounds + ' work round' + (rounds === 1 ? '' : 's') + (rounds > 1 && Number(settings[1].value) ? ' + breaks' : '');
    render();
  }
  function render() {
    const state = clock.snapshot();
    $('timerDisplay').textContent = String(Math.floor(state.seconds/60)).padStart(2,'0') + ':' + String(state.seconds%60).padStart(2,'0');
    const status = state.finished ? 'Session complete' : (started && !state.running ? 'Paused · ' : '') + state.label + ' · Round ' + state.round + ' of ' + state.rounds;
    if ($('timerPhase').textContent !== status) $('timerPhase').textContent = status;
    $('roundTimer').dataset.phase = state.label.toLowerCase();
    $('timerProgress').value = state.progress;
    $('timerStart').textContent = state.finished ? 'Start again' : state.running ? 'Pause' : started ? 'Resume' : 'Start timer';
    settings.forEach(el => el.disabled = started && !state.finished);
    presets.forEach(button => {
      button.disabled = started && !state.finished;
      const selected = button.getAttribute('data-timer-preset') === settings.map(el => el.value).join(',');
      button.setAttribute('aria-pressed', String(selected)); button.classList.toggle('active', selected);
    });
    if (!state.running) clearInterval(interval);
  }
  $('timerStart').addEventListener('click', () => {
    const state = clock.snapshot();
    if (state.running) clock.pause();
    else { if (state.finished) reset(); started = true; clock.start(); interval = setInterval(render,250); }
    render();
  });
  $('timerReset').addEventListener('click', reset);
  settings.forEach(el => el.addEventListener('change', () => { saveSettings(); reset(); }));
  document.addEventListener('visibilitychange', render);
  reset();
})();
