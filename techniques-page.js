// The explorer renders small batches; search and random picks always use the full library.
(function () {
  const $ = id => document.getElementById(id);
  const batchSize = 24;
  const belts = ['white', 'blue', 'purple', 'brown', 'black'];
  const categories = new Map(TECHNIQUE_CATEGORIES.map(c => [c.id, c.label]));
  const normalize = value => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
  const searchIndex = new Map(TECHNIQUES.map(t => [t.name, [t.name, t.desc, ...(t.aliases || [])].map(normalize)]));
  let activeCat = 'all', activeBelt = 'all', savedOnly = false, visible = batchSize, lastRandom = '';
  let favorites = readFavorites();

  function readFavorites() {
    try {
      const data = JSON.parse(localStorage.getItem('bjjFavoriteTechniques') || '[]');
      return Array.isArray(data) ? [...new Set(data.map(name => name === 'Baseball Choke' ? 'Baseball Bat Choke' : name)
        .filter(name => TECHNIQUES.some(t => t.name === name)))] : [];
    } catch (_) { return []; }
  }
  function readURL() {
    const params = new URLSearchParams(location.search);
    $('techSearch').value = params.get('q') || '';
    activeCat = categories.has(params.get('category')) ? params.get('category') : 'all';
    activeBelt = belts.includes(params.get('belt')) ? params.get('belt') : 'all';
    savedOnly = params.get('saved') === '1';
    $('techSort').value = params.get('sort') === 'az' ? 'az' : 'category';
    visible = batchSize;
  }
  function writeURL() {
    const params = new URLSearchParams(location.search);
    const values = {q:$('techSearch').value.trim(), category:activeCat === 'all' ? '' : activeCat,
      belt:activeBelt === 'all' ? '' : activeBelt, saved:savedOnly ? '1' : '', sort:$('techSort').value === 'az' ? 'az' : ''};
    Object.entries(values).forEach(([key,value]) => value ? params.set(key,value) : params.delete(key));
    const query = params.toString();
    history.replaceState(null, '', location.pathname + (query ? '?' + query : '') + location.hash);
  }
  function filtered() {
    const query = normalize($('techSearch').value.trim());
    const list = TECHNIQUES.filter(t => (activeCat === 'all' || t.cat === activeCat) &&
      (activeBelt === 'all' || t.belt === activeBelt) && (!savedOnly || favorites.includes(t.name)) &&
      (!query || searchIndex.get(t.name).some(text => text.includes(query))));
    if ($('techSort').value === 'az') list.sort((a,b) => a.name.localeCompare(b.name));
    return list;
  }
  function chip(container, label, value, kind) {
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'chip'; button.textContent = label;
    button.setAttribute('data-value', value);
    button.addEventListener('click', () => {
      if (kind === 'category') activeCat = value; else activeBelt = value;
      refresh();
    });
    container.appendChild(button);
  }
  chip($('techFilters'), 'All categories', 'all', 'category');
  TECHNIQUE_CATEGORIES.forEach(c => chip($('techFilters'), c.label, c.id, 'category'));
  chip($('beltFilters'), 'All belts', 'all', 'belt');
  belts.forEach(b => chip($('beltFilters'), b[0].toUpperCase() + b.slice(1), b, 'belt'));

  function syncControls() {
    [['techFilters',activeCat], ['beltFilters',activeBelt]].forEach(([id,active]) => {
      $(id).querySelectorAll('button').forEach(button => {
        const selected = button.getAttribute('data-value') === active;
        button.classList.toggle('active', selected); button.setAttribute('aria-pressed', String(selected));
      });
    });
    $('savedTechniques').textContent = '★ Saved (' + favorites.length + ')';
    $('savedTechniques').classList.toggle('active', savedOnly);
    $('savedTechniques').setAttribute('aria-pressed', String(savedOnly));
    $('techFilterSummary').textContent = [activeCat !== 'all' ? categories.get(activeCat) : '',
      activeBelt !== 'all' ? activeBelt + ' belt' : ''].filter(Boolean).join(' · ') || 'All techniques';
    $('clearTechFilters').hidden = !($('techSearch').value || activeCat !== 'all' || activeBelt !== 'all' || savedOnly);
  }
  function render() {
    syncControls();
    const list = filtered(), shown = list.slice(0,visible);
    $('techCount').textContent = list.length + ' technique' + (list.length === 1 ? '' : 's');
    $('randomTechnique').disabled = !list.length;
    $('noResults').classList.toggle('hidden', list.length > 0);
    $('noResults').textContent = savedOnly ? 'Your saved collection is empty for these filters. Save a technique with ☆ Save, or clear your filters.' : 'No techniques found. Try a shorter search or clear your filters.';
    $('techPagination').hidden = !list.length;
    $('techVisible').textContent = 'Showing ' + shown.length + ' of ' + list.length + ' techniques';
    $('moreTechniques').hidden = visible >= list.length;
    $('moreTechniques').textContent = 'Show ' + Math.min(batchSize, list.length - shown.length) + ' more techniques';
    $('techResults').innerHTML = shown.map(t => {
      const saved = favorites.includes(t.name);
      return '<article class="tech-card" tabindex="-1"><h3>' + escape(t.name) + '</h3>' +
        '<div class="tech-category">' + escape(categories.get(t.cat) || t.cat) + '</div><p class="tech-desc">' + escape(t.desc) + '</p>' +
        '<span class="belt-badge belt-' + t.belt + '">' + t.belt + ' belt</span>' +
        '<div class="tech-card-actions"><a class="tech-resource-link" href="resources.html?q=' + encodeURIComponent(t.name) + '#glossary">Watch &amp; learn →</a>' +
        '<a class="tech-practice-link" href="training.html?technique=' + encodeURIComponent(t.name) + '#training-log">Practice this ↗</a>' +
        '<button class="tech-favorite ' + (saved ? 'is-favorite' : '') + '" data-favorite="' + escape(t.name) + '" type="button" aria-pressed="' + saved + '" aria-label="' + (saved ? 'Remove ' : 'Save ') + escape(t.name) + (saved ? ' from favorites' : ' to favorites') + '">' + (saved ? '★ Saved' : '☆ Save') + '</button></div></article>';
    }).join('');
  }
  function refresh() { visible = batchSize; render(); writeURL(); }
  $('techResults').addEventListener('click', event => {
    const button = event.target.closest('[data-favorite]');
    if (!button) return;
    const name = button.getAttribute('data-favorite');
    const saved = !favorites.includes(name);
    favorites = saved ? [...favorites, name] : favorites.filter(item => item !== name);
    let persisted = true;
    try { localStorage.setItem('bjjFavoriteTechniques', JSON.stringify(favorites)); } catch (_) { persisted = false; }
    $('favoriteStatus').textContent = persisted ? name + (saved ? ' saved for later.' : ' removed from saved techniques.') : 'Updated for this visit only. Browser storage is unavailable.';
    if (savedOnly) {
      render();
      $('savedTechniques').focus();
    } else {
      button.classList.toggle('is-favorite', saved); button.setAttribute('aria-pressed', String(saved));
      button.setAttribute('aria-label', (saved ? 'Remove ' : 'Save ') + name + (saved ? ' from favorites' : ' to favorites'));
      button.textContent = saved ? '★ Saved' : '☆ Save'; syncControls();
    }
  });
  $('savedTechniques').addEventListener('click', () => { savedOnly = !savedOnly; refresh(); });
  $('techSearch').addEventListener('input', refresh);
  $('techSort').addEventListener('change', refresh);
  $('clearTechFilters').addEventListener('click', () => {
    $('techSearch').value = ''; activeCat = activeBelt = 'all'; savedOnly = false;
    refresh(); $('techSearch').focus();
  });
  $('moreTechniques').addEventListener('click', () => {
    const previous = visible; visible += batchSize; render();
    $('techResults').querySelectorAll('.tech-card')[previous]?.focus({preventScroll:true});
  });
  $('randomTechnique').addEventListener('click', () => {
    const list = filtered(), pool = list.filter(t => list.length === 1 || t.name !== lastRandom);
    if (!pool.length) return;
    const chosen = pool[Math.floor(Math.random() * pool.length)]; lastRandom = chosen.name;
    const index = list.indexOf(chosen); visible = Math.max(visible, Math.ceil((index+1)/batchSize)*batchSize); render();
    const card = $('techResults').querySelectorAll('.tech-card')[index];
    card.classList.add('random-highlight'); card.focus({preventScroll:true});
    card.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block:'center'});
  });
  window.addEventListener('storage', event => {
    if (event.key === 'bjjFavoriteTechniques' || event.key === null) { favorites = readFavorites(); render(); }
  });
  window.addEventListener('popstate', () => { readURL(); render(); });
  readURL(); render();
})();
