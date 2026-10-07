// Event data is optional; damaged or unavailable storage must never break the checklists.
(function () {
  const $ = id => document.getElementById(id);
  const name = $('eventName'), date = $('eventDate'), status = $('eventStatus');
  function validDate(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const parsed = new Date(value + 'T12:00:00');
    return Number.isFinite(parsed.getTime()) && parsed.getFullYear() === +value.slice(0,4) && parsed.getMonth()+1 === +value.slice(5,7) && parsed.getDate() === +value.slice(8);
  }
  let stored;
  try { stored = JSON.parse(localStorage.getItem('bjjCompetitionEvent') || '{}'); } catch (_) {}
  if (!stored || typeof stored !== 'object' || Array.isArray(stored)) stored = {};
  name.value = typeof stored.name === 'string' ? stored.name.slice(0,80) : '';
  date.value = validDate(stored.date) ? stored.date : '';
  function render() {
    $('clearEvent').hidden = !name.value && !date.value;
    if (!validDate(date.value)) { $('eventCountdown').textContent = 'Save your tournament name and date on this device.'; return; }
    const eventDay = new Date(date.value + 'T12:00:00'), today = new Date();
    // Compare calendar dates in UTC so daylight-saving changes do not change the day count.
    const days = Math.round((Date.UTC(eventDay.getFullYear(),eventDay.getMonth(),eventDay.getDate()) - Date.UTC(today.getFullYear(),today.getMonth(),today.getDate()))/86400000);
    const label = name.value.trim() || 'Your event';
    $('eventCountdown').textContent = label + (days > 0 ? ' · ' + days + ' day' + (days === 1 ? '' : 's') + ' to go.' : days === 0 ? ' · Today. Check your packing list before you leave.' : ' · This date has passed. Set your next event.');
  }
  function edited() { render(); status.textContent = 'Unsaved changes — save your event when ready.'; }
  $('saveEvent').addEventListener('click', () => {
    if (!validDate(date.value)) { status.textContent = 'Choose a valid event date before saving.'; date.focus(); return; }
    try {
      localStorage.setItem('bjjCompetitionEvent', JSON.stringify({name:name.value.trim().slice(0,80),date:date.value}));
      status.textContent = 'Event saved on this device.';
    } catch (_) { status.textContent = 'Kept for this visit only. Browser storage is unavailable.'; }
    render();
  });
  $('clearEvent').addEventListener('click', () => {
    name.value = date.value = '';
    try { localStorage.removeItem('bjjCompetitionEvent'); status.textContent = 'Event cleared. Your checklist is unchanged.'; }
    catch (_) { status.textContent = 'Cleared for this visit only. The saved event could not be removed.'; }
    render(); name.focus();
  });
  name.addEventListener('input', edited); date.addEventListener('change', edited);
  if (date.value) status.textContent = 'Saved on this device.';
  render();
})();
