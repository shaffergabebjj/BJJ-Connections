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
  var isIOS = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
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
  var nav = document.querySelector(".nav");
  var menu = document.querySelector(".nav-toggle");
  if (!nav || !window.BJJTheme) return;
  var button = document.createElement("button");
  button.type = "button";
  button.className = "theme-toggle";
  nav.insertBefore(button, menu || null);
  function update() {
    var dark = document.documentElement.dataset.theme === "dark";
    button.textContent = dark ? "☀" : "☾";
    button.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
    button.title = button.getAttribute("aria-label");
  }
  button.addEventListener("click", window.BJJTheme.toggle);
  window.addEventListener("bjjthemechange", update);
  update();
})();
