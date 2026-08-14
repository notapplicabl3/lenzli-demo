/*
 * src/app/app.js — appBoot, the chrome's wiring, and the one notice line.
 *
 * Classic script (SPEC A3-9). Overwrites the appBoot stub and the app.notice stub
 * namespace.js declared.
 *
 * appBoot() is the app's SINGLE entry call, and app.html's only inline script
 * (SPEC A1-3, A1-7). It never calls LENZLI.boot(): boot() is the reel shell's
 * entry point and the only thing that creates instance zero, and the app must not
 * have one — every deck in the app is a named createDeck instance.
 *
 * It does only what no other file can do for itself:
 *   - paints the chrome's brand marks;
 *   - binds the four nav buttons — Search, Create, My profile, and About;
 *   - keeps aria-current="page" on the nav button whose surface is showing;
 *   - hides the whole nav on #/r/<id>, where demo chrome is stripped;
 *   - starts the router.
 * It holds no list of surfaces: each surface file registers itself at load
 * (SPEC § 3.4, ledger V2-14), so no later order edits src/app/.
 *
 * ABOUT (SPEC A1-24). The About control calls LENZLI.openAbout() and about.js is
 * loaded UNCHANGED — it mounts to document.body, so it needs no #stage, and with
 * no [data-persona] button on this page its selectedId() falls back to the first
 * registered persona, which § 3.2's script order pins to maya-chen. About is
 * offered on #/, #/create and #/me and is absent on #/r/<id>, where § 3.4.1 M6
 * makes D6 govern: that surface carries the Lenzli lockup and no app chrome,
 * because stripped chrome is the whole point of an arrival page.
 *
 * THE F-6 DISCLOSURE IS PERMANENT and is not part of what M6 strips. It is
 * markup in app.html, on every route and at every width, so the prototype states
 * that its people are invented without anyone opening About.
 *
 * NOTICE (SPEC § 3.1). LENZLI.app.notice(text) is the only way a surface reports
 * a degraded condition to the viewer — one non-blocking line, never a dialog. It
 * is installed here at LOAD, not inside appBoot, because the stub rule (A1-6) is
 * "each owning file overwrites its own on load" and because src/store/storage.js
 * calls it from its failure path, which any surface can reach before or after
 * boot. Nothing here throws: a notice is a report, and a report that broke the
 * page would be worse than the condition it describes.
 */
(function (root) {
  "use strict";

  var LENZLI = root.LENZLI;

  if (!LENZLI || !LENZLI.app) {
    throw new Error(
      "src/app/app.js: window.LENZLI.app is missing. src/brand/namespace.js must load first."
    );
  }

  /* namespace.js created this container with notice stubbed; overwrite in place,
     the idiom src/store/storage.js uses for LENZLI.store. */
  var app = LENZLI.app = LENZLI.app || {};

  var booted = false;

  /* --- the notice line ---------------------------------------------------- */

  app.notice = function (text) {
    var line = document.querySelector("[data-app-notice]");
    var live = document.querySelector("[data-app-live]");
    var message = text === null || text === undefined ? "" : String(text);

    if (!line) {
      console.warn("LENZLI.app.notice: the page carries no [data-app-notice] line — " + message);
      return;
    }

    line.textContent = message;
    line.hidden = message === "";

    /* Announced through the app's ONE aria-live region (SPEC § 4 D2 allows
       exactly one), so a degraded state is not sighted-only. */
    if (live && message) {
      live.textContent = message;
    }
  };

  /* --- the chrome --------------------------------------------------------- */

  /* Each nav button carries the route it navigates to and the surface name that
     route resolves to, so aria-current is a data comparison and never a list of
     hashes kept in step by hand. */
  function tabs() {
    return document.querySelectorAll("[data-app-surface]");
  }

  function syncChrome() {
    var here = LENZLI.router.parse(root.location.hash);
    var nav = document.querySelector("[data-app-nav]");
    var buttons = tabs();
    var i;

    /* § 3.4.1 M6: #/r/<id> carries the lockup and nothing else. The nav holds
       all four controls, About included, so hiding it is the whole strip. */
    if (nav) {
      nav.hidden = here.surface === "landing";
    }

    for (i = 0; i < buttons.length; i++) {
      if (buttons[i].getAttribute("data-app-surface") === here.surface) {
        buttons[i].setAttribute("aria-current", "page");
      } else {
        buttons[i].removeAttribute("aria-current");
      }
    }
  }

  function bindChrome() {
    var buttons = tabs();
    var about = document.querySelector("[data-app-about]");
    var i;

    function bind(node) {
      node.addEventListener("click", function () {
        LENZLI.router.go(node.getAttribute("data-app-route"));
      });
    }

    for (i = 0; i < buttons.length; i++) {
      bind(buttons[i]);
    }

    if (about) {
      about.addEventListener("click", function () {
        LENZLI.openAbout();
      });
    }

    /* The chrome is permanent — it is never mounted or torn down — so its one
       listener lives for the life of the page. Surfaces are the things with a
       lifetime, and the router owns theirs. */
    root.addEventListener("hashchange", syncChrome);
  }

  /* --- boot --------------------------------------------------------------- */

  LENZLI.appBoot = function () {
    if (booted) {
      console.info("LENZLI.appBoot — already booted; ignoring the second call.");
      return;
    }
    booted = true;

    /* The lockup's [data-mark]/[data-wordmark] slots. mark.js paints the
       document at load and this repeats it for the chrome explicitly; the
       router paints each surface as it mounts (E-5). */
    LENZLI.paintMarks();

    bindChrome();
    syncChrome();
    LENZLI.router.start();
  };
})(window);
