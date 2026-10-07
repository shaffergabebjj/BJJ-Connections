// Keep answers compact, including search results. Opening one closes the others.
(function () {
  const $ = id => document.getElementById(id);
  const entries = Array.from(document.querySelectorAll('#questionList .faq-item'));
  const groups = Array.from(document.querySelectorAll('#questionList .faq-group'));
  const normalize = text => text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const index = new Map(entries.map(entry => [entry, normalize(entry.textContent)]));
  function filter() {
    const query = normalize($('questionSearch').value.trim());
    const topic = $('questionTopic').value;
    let visible = 0, topics = 0;
    groups.forEach(group => {
      let matches = 0;
      group.querySelectorAll('.faq-item').forEach(entry => {
        const match = (topic === 'all' || group.getAttribute('aria-labelledby') === topic) && index.get(entry).includes(query);
        entry.hidden = !match;
        if (!match) entry.open = false;
        if (match) matches++;
      });
      group.hidden = !matches; visible += matches; if (matches) topics++;
    });
    $('questionCount').textContent = visible + ' answer' + (visible === 1 ? '' : 's') + ' · ' + topics + ' topic' + (topics === 1 ? '' : 's');
    $('noQuestionResults').hidden = visible !== 0;
    $('clearQuestions').hidden = !query && topic === 'all';
  }
  entries.forEach(entry => entry.addEventListener('toggle', () => {
    if (entry.open) entries.forEach(other => { if (other !== entry) other.open = false; });
  }));
  $('questionSearch').addEventListener('input', filter);
  $('questionTopic').addEventListener('change', filter);
  $('clearQuestions').addEventListener('click', () => {
    $('questionSearch').value = ''; $('questionTopic').value = 'all';
    entries.forEach(entry => entry.open = false); filter(); $('questionSearch').focus();
  });
  filter();
})();
