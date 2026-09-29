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
  var isIOS = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
  if (isIOS) install.hidden = false;

  function showIOSInstructions() {
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
    dialog.addEventListener("close", function () { dialog.remove(); install.focus(); });
    dialog.showModal();
  }

  window.addEventListener("beforeinstallprompt", function (event) {
    event.preventDefault();
    deferredPrompt = event;
    install.hidden = false;
  });

  install.addEventListener("click", async function () {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
      install.hidden = true;
      return;
    }

    if (isIOS) {
      showIOSInstructions();
    } else {
      alert("Use your browser's Install App or Add to Home Screen option to install BJJ Connections.");
    }
  });
})();
