// Apply before CSS renders to avoid flashing the wrong theme.
(function () {
  var media = window.matchMedia("(prefers-color-scheme: dark)");
  var preference;
  try { preference = localStorage.getItem("bjjTheme"); } catch (error) {}
  if (preference !== "light" && preference !== "dark") preference = null;
  function apply(theme) {
    document.documentElement.dataset.theme = theme;
    window.dispatchEvent(new Event("bjjthemechange"));
  }
  window.BJJTheme = {
    toggle: function () {
      preference = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      try { localStorage.setItem("bjjTheme", preference); } catch (error) {}
      apply(preference);
    }
  };
  apply(preference || (media.matches ? "dark" : "light"));
  function followSystem(event) { if (!preference) apply(event.matches ? "dark" : "light"); }
  if (media.addEventListener) media.addEventListener("change", followSystem);
  else if (media.addListener) media.addListener(followSystem);
})();
