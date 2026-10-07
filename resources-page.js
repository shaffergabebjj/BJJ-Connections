(function() {
  var entries = BJJResources.build(TECHNIQUES, GLOSSARY, TECHNIQUE_VIDEOS, GLOSSARY_VIDEOS);
  var search = document.getElementById("glossarySearch");
  var noResults = document.getElementById("noGlossaryResults");
  var categorySelect = document.getElementById("glossaryCategory");
  var pickButton = document.getElementById("pickLesson");
  var clearButton = document.getElementById("clearGlossaryFilters");
  var lessonPool = [];
  var lastLesson = "";
  var batchSize = 24;
  var visible = batchSize;
  var cards = new Map(entries.map(function(g) { return [g.term, BJJResources.card(g)]; }));
  var searchIndex = new Map(entries.map(function(g) { return [g.term, [g.term, g.def].concat(g.aliases || []).map(BJJResources.normalize)]; }));

  var CATEGORY_ORDER = [
    "Fundamentals & General Terms",
    "Guard Positions",
    "Guard Passing",
    "Sweeps",
    "Transitions",
    "Leg Locks & Leg Entanglements",
    "Submissions",
    "Escapes & Defense",
    "Back & Dominant Positions",
    "Takedowns & Wrestling",
    "Gi & Grip Terminology",
    "Movement & Drills",
    "Portuguese & BJJ Slang",
    "Judo & Grappling Terminology"
  ];

  var CATEGORY_RULES = [
    ["Portuguese & BJJ Slang", ["Raspagem","Passagem de Guarda","Queda","Pegada","Montada","Guarda Fechada","Meia Guarda","Mata-Leão","Creonte","OSS"]],
    ["Judo & Grappling Terminology", ["Kesa Gatame","Kosoto Gake","Kosoto Gari","Ouchi Gari","Osoto Gari","Sumi Gaeshi","Tai Otoshi","Uchi Mata","Uchi Mata Gaeshi","Sankaku-Jime","Ude Garami","Ude Hishigi Juji Gatame","Ura Nage","Vale Tudo"]],
    ["Gi & Grip Terminology", ["Gi","Lapel","Lapel Guard","Collar-Sleeve Guard","Cross Collar Choke","Canto Choke","Loop Choke","Pistol Grip","Pocket Grip","Gable Grip","Marcelotine","Bow-and-Arrow Grip","Bow-and-Arrow Choke","Spider Guard"]],
    ["Leg Locks & Leg Entanglements", ["50/50 Guard","Ashi Garami","False Reap","Heel Hook","K-Guard","Kani Basami","Leg Entanglement","Single-Leg X (SLX)","Shin-to-Shin","Kneebar","Calf Slicer","Biceps Slicer","Hip Clamp"]],
    ["Guard Passing", ["Backstep","Body Lock","Combat Base","Guard Pass","Headquarters","Knee Cut","Leg Drag","Long Step","Over-under Pass","Pass","Smash Pass","Stack Pass","Standing Guard Pass","Toreando Pass","X-Pass"]],
    ["Back & Dominant Positions", ["Back Control","Body Triangle","Chest-to-Back","Crucifix","Kesa Gatame","Knee-on-Belly","Mount","Mounted Triangle","North-South","S-Mount","Seatbelt","Side Control","Turtle","Gift Wrap","Head-and-Arm Control"]],
    ["Takedowns & Wrestling", ["Ankle Pick","Deliberate Guard Pull","Double Underhooks","Front Headlock","Hip Heist","Russian Tie","Sit-Up Guard","Takedown","Underhook","Underhook Half Guard","Wrestle-Up","Wrestling-Up","Technical Stand-Up","Two-on-One","Stance"]],
    ["Submissions", ["Americana","Anaconda Choke","Arm-In Guillotine","Arm Triangle","Armbar","Baratoplata","Bow-and-Arrow Choke","Clock Choke","D'Arce Choke","Darce","Ezekiel Choke","Guillotine","Kimura","Kata Gatame","Loop Choke","Omoplata","Rear Naked Choke (RNC)","Reverse Triangle","Triangle Choke","Wristlock","Mounted Triangle"]],
    ["Escapes & Defense", ["Bridge","Frames","Granby Roll","Hip Escape","Re-Guard","Upa"]],
    ["Movement & Drills", ["Cat-Cow","Drilling","Ebi","Frog Jump Armbar","Hip Switch","Inversion","Leg Pummel","Pummel","V-Ups","Leg Pummel"]],
    ["Guard Positions", ["Berimbolo","Butterfly Guard","Butterfly Half Guard","Closed Guard","De La Riva (DLR)","Deep De La Riva","Deep Half Guard","Half Butterfly","Half Guard","Helicopter Guard","K-Guard","Lasso Guard","Lockdown","Octopus Guard","Reverse De La Riva","Reverse Half Guard","Sit-Up Guard","Spider Guard","Upside-Down Guard","X-Guard","Z-Guard","Collar-Sleeve Guard","Shin-to-Shin","Single-Leg X (SLX)","50/50 Guard","Lasso Guard"]],
    ["Fundamentals & General Terms", ["Base","Guard","Inside Position","Outside Position","Hooks","Overhook","Posture","Sweep","Wrestle-Up"]]
  ];

  function getCategory(g) {
    if (g.category) return g.category;
    for (var i = 0; i < CATEGORY_RULES.length; i++) {
      if (CATEGORY_RULES[i][1].indexOf(g.term) > -1) return CATEGORY_RULES[i][0];
    }
    return "Fundamentals & General Terms";
  }

  entries.forEach(function(g) { g.category = getCategory(g); });
  entries.sort(function(a,b) { return CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category) || a.term.localeCompare(b.term); });

  CATEGORY_ORDER.forEach(function(category) {
    var count = entries.filter(function(g) { return getCategory(g) === category; }).length;
    if (!count) return;
    var option = document.createElement("option");
    option.value = category;
    option.textContent = category + " (" + count + ")";
    categorySelect.appendChild(option);
  });

  function render(term) {
    var query = BJJResources.normalize(term || "");
    var filtered = entries.filter(function(g) {
      return (!query || searchIndex.get(g.term).some(function(text) { return text.includes(query); })) &&
        (categorySelect.value === "all" || getCategory(g) === categorySelect.value);
    });
    lessonPool = filtered.filter(function(g) { return g.video; });
    pickButton.disabled = !lessonPool.length;
    clearButton.hidden = !search.value.trim() && categorySelect.value === "all";
    var videos = filtered.filter(function(g) { return g.video; }).length;
    document.getElementById("glossaryCount").textContent = filtered.length + (filtered.length === 1 ? " entry · " : " entries · ") + videos + (videos === 1 ? " video" : " videos");

    var shown = filtered.slice(0, visible);
    document.getElementById("glossaryPagination").hidden = !filtered.length;
    document.getElementById("glossaryVisible").textContent = "Showing " + shown.length + " of " + filtered.length + " entries";
    document.getElementById("moreGlossary").hidden = shown.length >= filtered.length;
    document.getElementById("moreGlossary").textContent = "Show " + Math.min(batchSize, filtered.length - shown.length) + " more entries";

    if (filtered.length === 0) {
      document.getElementById("glossarySections").innerHTML = "";
      noResults.classList.remove("hidden");
      return;
    }
    noResults.classList.add("hidden");

    var grouped = {};
    shown.forEach(function(g) {
      var category = getCategory(g);
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push(g);
    });

    document.getElementById("glossarySections").innerHTML = CATEGORY_ORDER.map(function(category) {
      if (!grouped[category] || grouped[category].length === 0) return "";
      return '<section class="glossary-section">' +
        '<h2 class="section-title glossary-category-title">' + category + '</h2>' +
        '<dl class="glossary">' +
        grouped[category].map(function(g) {
          return cards.get(g.term);
        }).join("") +
        '</dl></section>';
    }).join("");
  }

  function writeURL() {
    var params = new URLSearchParams(location.search);
    search.value.trim() ? params.set("q", search.value.trim()) : params.delete("q");
    categorySelect.value !== "all" ? params.set("category", categorySelect.value) : params.delete("category");
    var query = params.toString();
    history.replaceState(null, "", location.pathname + (query ? "?" + query : "") + location.hash);
  }
  function refresh() { visible = batchSize; render(search.value); writeURL(); }
  search.addEventListener("input", refresh);
  categorySelect.addEventListener("change", refresh);
  clearButton.addEventListener("click", function() {
    search.value = ""; categorySelect.value = "all";
    refresh(); search.focus();
  });
  document.getElementById("moreGlossary").addEventListener("click", function() {
    var previous = visible; visible += batchSize; render(search.value);
    var next = document.getElementById("glossarySections").querySelectorAll(".glossary-item")[previous];
    if (next) next.focus({preventScroll:true});
  });
  pickButton.addEventListener("click", function() {
    var pool = lessonPool.filter(function(g) { return lessonPool.length === 1 || g.term !== lastLesson; });
    if (!pool.length) return;
    var lesson = pool[Math.floor(Math.random() * pool.length)];
    lastLesson = lesson.term;
    window.open(lesson.video.url, "_blank", "noopener,noreferrer");
  });
  function readURL() {
    var params = new URLSearchParams(location.search);
    search.value = params.get("q") || "";
    categorySelect.value = CATEGORY_ORDER.includes(params.get("category")) ? params.get("category") : "all";
    visible = batchSize; render(search.value);
  }
  window.addEventListener("popstate", readURL);
  readURL();
})();
