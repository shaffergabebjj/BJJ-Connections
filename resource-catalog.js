// Resources derives technique entries from the same database as Techniques.
(function(root) {
  const categories = {position:'Back & Dominant Positions', submission:'Submissions',
    escape:'Escapes & Defense', sweep:'Sweeps', takedown:'Takedowns & Wrestling',
    guard:'Guard Positions', pass:'Guard Passing', leg:'Leg Locks & Leg Entanglements', transition:'Transitions'};
  const aliases = {
    'Rear Naked Choke':['Rear Naked Choke (RNC)'],
    'Americana (Keylock)':['Americana'], 'Bow and Arrow Choke':['Bow-and-Arrow Choke'],
    'Bicep Slicer':['Biceps Slicer'], 'Guillotine Choke':['Guillotine'],
    'Deep Half':['Deep Half Guard'], 'De La Riva Guard':['De La Riva (DLR)'],
    'Single Leg X':['Single-Leg X (SLX)'], 'Knee Cut Pass':['Knee Cut'],
    'Long Step Pass':['Long Step'], 'Headquarters Position':['Headquarters'],
    'Crucifix (Top)':['Crucifix'], 'Turtle (Top)':['Turtle'],
    'Scarf Hold (Kesa-Gatame)':['Kesa Gatame']
  };
  function normalize(value) {
    return value.toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/g,'');
  }
  function build(techniques, glossary, videos, glossaryVideos = {}) {
    const consumed = new Set();
    const entries = techniques.map(t => {
      const names = [t.name,...(t.aliases || []),...(aliases[t.name] || [])];
      const keys = new Set(names.map(normalize));
      glossary.forEach((g,i) => { if(keys.has(normalize(g.term))) { consumed.add(i); names.push(g.term); } });
      return {term:t.name, def:t.desc, aliases:[...new Set(names)],
        category:categories[t.cat], belt:t.belt, technique:true, video:videos[t.name]};
    });
    const seen = new Set(entries.map(g=>normalize(g.term)));
    glossary.forEach((g,i) => {
      const key = normalize(g.term);
      if (!consumed.has(i) && !seen.has(key)) { entries.push({...g,aliases:g.aliases || [],technique:false,video:glossaryVideos[g.term]}); seen.add(key); }
    });
    return entries.sort((a,b)=>a.term.localeCompare(b.term));
  }
  function matches(g, query) {
    const q = normalize(query.trim());
    return !q || [g.term,g.def,...(g.aliases || [])].some(value=>normalize(value).includes(q));
  }
  function escape(value) {
    return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
  function card(g) {
    const more = 'https://www.youtube.com/results?search_query=' + encodeURIComponent(g.term + ' BJJ technique');
    const video = g.video;
    return '<div class="glossary-item"><dt><a href="'+escape(video ? video.url : more)+'" target="_blank" rel="noopener noreferrer">'+escape(g.term)+'</a></dt><dd>'+escape(g.def)+
      (video ? '<span class="resource-video-title">Video: '+escape(video.title)+'</span>' : '')+
      '<div class="resource-actions">'+(video ? '<a class="resource-watch" href="'+escape(video.url)+'" target="_blank" rel="noopener noreferrer" aria-label="Watch '+escape(g.term)+' video (opens YouTube)">Watch video ↗</a>' : '')+
      '<a href="'+escape(more)+'" target="_blank" rel="noopener noreferrer">Find more videos ↗</a></div></dd></div>';
  }
  root.BJJResources = {build,matches,card};
})(typeof window === 'undefined' ? globalThis : window);
