(function () {
  function read(key) {
    try { var value = JSON.parse(localStorage.getItem(key) || "[]"); return Array.isArray(value) ? value : []; }
    catch (_) { return []; }
  }
  function update() {
    var favorites = [...new Set(read("bjjFavoriteTechniques").filter(function(name) { return typeof name === "string" && name.trim(); }).map(function(name) { return name === "Baseball Choke" ? "Baseball Bat Choke" : name; }))];
    var goals = read("bjjTrainingGoals").filter(function (goal) { return goal && typeof goal.text === "string" && goal.text.trim() && goal.done !== true; });
    var sessions = read("bjjTrainingLog").filter(function(s) {
      if (!s || typeof s.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(s.date)) return false;
      var d = new Date(s.date + "T12:00:00");
      return Number.isFinite(d.getTime()) && d.getFullYear() === +s.date.slice(0,4) && d.getMonth()+1 === +s.date.slice(5,7) && d.getDate() === +s.date.slice(8);
    });
    var saved = document.getElementById("homeSavedCount");
    var open = document.getElementById("homeGoalCount");
    var session = document.getElementById("homeSessionCount");
    var detail = document.getElementById("homeSessionDetail");
    var message = document.getElementById("homeDeskMessage");
    if (!saved || !open || !session || !detail) return;
    saved.textContent = favorites.length + " saved";
    open.textContent = goals.length + " open goal" + (goals.length === 1 ? "" : "s");
    if (sessions.length) {
      var latest = sessions.slice().sort(function (a, b) { return String(b.date || "").localeCompare(String(a.date || "")); })[0];
      session.textContent = "" + sessions.length + " session" + (sessions.length === 1 ? "" : "s") + " logged";
      detail.textContent = latest.date ? "Last logged " + new Date(latest.date + "T12:00:00").toLocaleDateString(undefined, {month:"short", day:"numeric"}) : "Open your training log";
      message.textContent = "Pick up your saved work, goals, or training log whenever you return.";
    } else {
      message.textContent = "Your saved work stays on this device and updates as you train.";
      session.textContent = "Log your next session";
      detail.textContent = "Keep a record of your mat time";
    }
  }
  update();
  window.addEventListener("focus", update);
  window.addEventListener("storage", update);
})();
