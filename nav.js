// BJJ Connections — shared navigation (mobile menu toggle + active link)
(function () {
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', links.classList.contains('open'));
    });
    // Close menu when clicking a link
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
    document.addEventListener('click', function (event) {
      if (!links.contains(event.target) && !toggle.contains(event.target)) {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
    // Close on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && links.classList.contains('open')) {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    });
  }
})();


(function () {
  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", function () {
    navigator.serviceWorker.register("/sw.js").catch(function (error) {
      console.warn("BJJ Connections: service worker registration failed.", error);
    });
  });
})();


(function () {
  var navLinks = document.querySelector(".nav-links");
  if (!navLinks || window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone) return;

  var deferredPrompt = null;
  var install = document.createElement("button");
  install.type = "button";
  install.className = "nav-install-btn";
  install.textContent = "Install App";
  install.hidden = true;
  navLinks.appendChild(install);
  var homeInstall = document.getElementById("homeInstall");
  var buttons = homeInstall ? [install, homeInstall] : [install];
  var isIOS = /iphone|ipad|ipod/i.test(window.navigator.userAgent) ||
    (window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1);
  if (isIOS || /android/i.test(window.navigator.userAgent)) {
    buttons.forEach(function (button) { button.hidden = false; });
  }

  function showIOSInstructions(opener) {
    var dialog = document.createElement("dialog");
    dialog.className = "install-dialog";
    dialog.setAttribute("aria-labelledby", "install-dialog-title");
    dialog.innerHTML = '<h2 id="install-dialog-title">Add BJJ Connections to your iPhone</h2>' +
      '<ol><li>Open this page in <strong>Safari</strong> if you are viewing it inside another app.</li>' +
      '<li>Tap Safari’s <strong>Share</strong> button (the square with an arrow). If you do not see it, open the page menu and choose <strong>Share</strong>.</li>' +
      '<li>Tap <strong>Add to Home Screen</strong>, then <strong>Add</strong>.</li></ol>' +
      '<p>The BJJ Connections icon will appear on your Home Screen.</p>' +
      '<button type="button" class="btn btn-primary install-dialog-close">Got it</button>';
    document.body.appendChild(dialog);
    dialog.querySelector("button").addEventListener("click", function () { dialog.close(); });
    dialog.addEventListener("close", function () { dialog.remove(); opener.focus(); });
    dialog.showModal();
  }

  window.addEventListener("beforeinstallprompt", function (event) {
    event.preventDefault();
    deferredPrompt = event;
    buttons.forEach(function (button) { button.hidden = false; });
  });

  async function handleInstall() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
      buttons.forEach(function (button) { button.hidden = true; });
      return;
    }

    if (isIOS) {
      showIOSInstructions(this);
    } else {
      alert("Use your browser's Install App or Add to Home Screen option to install BJJ Connections.");
    }
  }
  buttons.forEach(function (button) { button.addEventListener("click", handleInstall); });
  window.addEventListener("appinstalled", function () {
    buttons.forEach(function (button) { button.hidden = true; });
  });
})();

(function () {
  if (!window.BJJTheme) return;
  var button = document.createElement("button");
  button.type = "button";
  button.className = "theme-toggle";
  document.body.appendChild(button);
  function update() {
    var dark = document.documentElement.dataset.theme === "dark";
    button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      (dark ? '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/>' : '<path d="M20.9 13.1A9 9 0 0 1 10.9 3.1a9 9 0 1 0 10 10Z"/>') + '</svg>';
    button.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
    button.title = button.getAttribute("aria-label");
  }
  button.addEventListener("click", window.BJJTheme.toggle);
  window.addEventListener("bjjthemechange", update);
  update();
})();

// Long pages keep a quiet return to the header beside the theme control.
(function () {
  var button = document.createElement("button");
  button.type = "button";
  button.className = "back-to-top";
  button.setAttribute("aria-label", "Back to top");
  button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 14 6-6 6 6"/></svg>';
  button.hidden = true;
  document.body.appendChild(button);
  function update() { button.hidden = window.scrollY < 600; }
  window.addEventListener("scroll", update, {passive:true});
  button.addEventListener("click", function () {
    window.scrollTo({top:0, behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"});
    var home = document.querySelector('.site-header a');
    if (home) home.focus({preventScroll:true});
  });
  update();
})();
