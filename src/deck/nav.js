/*
 * src/deck/nav.js — the whole input mechanic.
 *
 * Classic script (SPEC A3-9). One model behind both views (ruling A3-3): the
 * progress bar, the overview grid, the tap zones, the swipe and the keyboard all
 * end in one instance's goTo(i). Nothing else moves a deck.
 *
 * NO TIMER ADVANCES ANYTHING, ANYWHERE (ruling D2). There is no timed advance in
 * this build and no scheduled callback of any kind in src/deck/. That single fact
 * is what keeps WCAG 2.2.1 / 2.2.2 out of scope, and it is the mechanism the
 * retention evidence credits for viewers reaching frame 7. Sequencing, where it
 * is ever needed, is CSS animation or transitionend — never a scheduler.
 *
 * ------------------------------------------------------------------------
 * The nav <-> render seam, after E-1.
 *
 * Before wave 0 this file seeded LENZLI.deck at module-evaluation time and owned
 * goTo/next/prev on that one global object. Two decks could not coexist, and any
 * page that merely LOADED this file got a half-initialised LENZLI.deck whether or
 * not it ever showed a reel. Both facts are gone: cards.js's LENZLI.createDeck
 * builds a self-contained instance and this file seeds nothing.
 *
 * What crosses the seam now, in both directions:
 *
 *   LENZLI.focusDeck(instance)               § 3.1. Sets which instance the ONE
 *                                            document keydown listener drives.
 *                                            createDeck calls it on mount;
 *                                            destroy() calls it with the previous
 *                                            instance, or null when none is left.
 *   LENZLI.bindDeckInput(instance, mount)    the deck folder's own seam, not a
 *                                            § 3.1 method — same standing as
 *                                            LENZLI.mark in src/brand/mark.js.
 *                                            Binds swipe and tap to ONE instance's
 *                                            mount and returns the teardown that
 *                                            destroy() calls.
 *
 * The keydown listener stays bound ONCE at document, exactly as before, so
 * reel.html's keyboard path is the same path it always was.
 * ------------------------------------------------------------------------
 */
(function (root) {
  "use strict";

  var LENZLI = root.LENZLI;

  if (!LENZLI || !LENZLI.deck) {
    throw new Error(
      "src/deck/nav.js: window.LENZLI.deck is missing. src/brand/namespace.js must load first."
    );
  }

  /* Swipe threshold, and the page gutter that keeps both tap zones off the screen
     edge (SPEC § 4 D3). The back zone is the left 30% of the deck, the forward
     zone the right 70%; neither reaches within GUTTER px of an edge, so an edge
     drag stays the browser's. */
  var SWIPE_MIN = 40;
  var GUTTER = 16;
  var BACK_ZONE = 0.3;

  /* The active instance — the one the keyboard drives. Null until a deck mounts,
     and null again once the last one is destroyed. */
  var active = null;

  LENZLI.focusDeck = function (instance) {
    active = instance || null;
  };

  /* --- Pointer: swipe, then tap ------------------------------------------
     One pointer gesture is either a swipe or a tap. The tap zones are read off
     the deck's own box rather than drawn as elements, so a real control inside a
     card always wins the tap and nothing invisible sits over the card. The
     accessible route to the same model is the progress bar, the overview grid and
     the keyboard, all real buttons.

     Bound to the instance's own mount, never to the document: two decks on one
     page must not steal each other's taps, and a torn-down surface must leave no
     listener behind. The returned function removes every listener added here. */
  LENZLI.bindDeckInput = function (instance, mount) {
    var startX = 0;
    var startY = 0;
    var tracking = false;
    var swiped = false;

    if (!instance || !mount || typeof mount.addEventListener !== "function") {
      return function () {};
    }

    function onDown(event) {
      startX = event.clientX;
      startY = event.clientY;
      tracking = true;
      swiped = false;
    }

    function onCancel() {
      tracking = false;
    }

    function onUp(event) {
      var dx;
      var dy;

      if (!tracking) {
        return;
      }
      tracking = false;

      dx = event.clientX - startX;
      dy = event.clientY - startY;

      if (Math.abs(dx) < SWIPE_MIN || Math.abs(dx) <= Math.abs(dy)) {
        return;
      }

      swiped = true;

      if (dx < 0) {
        instance.next();
      } else {
        instance.prev();
      }
    }

    function onClick(event) {
      var box;
      var x;

      if (swiped) {
        swiped = false;
        return;
      }
      if (event.target && event.target.closest && event.target.closest("button")) {
        return;
      }

      box = mount.getBoundingClientRect();
      x = event.clientX - box.left;

      if (x < GUTTER || x > box.width - GUTTER) {
        return;
      }

      if (x < box.width * BACK_ZONE) {
        instance.prev();
      } else {
        instance.next();
      }
    }

    mount.addEventListener("pointerdown", onDown);
    mount.addEventListener("pointercancel", onCancel);
    mount.addEventListener("pointerup", onUp);
    mount.addEventListener("click", onClick);

    return function () {
      mount.removeEventListener("pointerdown", onDown);
      mount.removeEventListener("pointercancel", onCancel);
      mount.removeEventListener("pointerup", onUp);
      mount.removeEventListener("click", onClick);
    };
  };

  /* --- Keyboard ----------------------------------------------------------
     Right/Left step, Home/End jump to the ends, Esc closes an open overlay.
     While an overlay is open it owns the arrows — the deck underneath does not
     move behind it.

     THE TARGET GUARD (E-2) is the reason this listener can live at document on a
     page that also carries a form. Without it, an arrow key pressed in a text
     input moves the deck instead of the caret and Home/End jump the reel instead
     of the line. It still preventDefault()s only on the four keys it actually
     handles, so every other key reaches the page untouched. */
  function inTextEntry(target) {
    if (!target) {
      return false;
    }
    if (target.isContentEditable) {
      return true;
    }
    return typeof target.matches === "function" &&
      target.matches("input, textarea, select");
  }

  function onKeyDown(event) {
    if (event.metaKey || event.ctrlKey || event.altKey) {
      return;
    }

    if (inTextEntry(event.target)) {
      return;
    }

    if (!active) {
      return;
    }

    if (event.key === "Escape") {
      if (typeof active.overlay === "function") {
        active.overlay();
        event.preventDefault();
      }
      return;
    }

    if (typeof active.overlay === "function") {
      return;
    }

    if (event.key === "ArrowRight") {
      active.next();
    } else if (event.key === "ArrowLeft") {
      active.prev();
    } else if (event.key === "Home") {
      active.goTo(0);
    } else if (event.key === "End") {
      active.goTo(active.cards.length - 1);
    } else {
      return;
    }

    event.preventDefault();
  }

  /* Skipped when this file is loaded without a document (the same guard
     src/brand/mark.js uses). Both functions above are published first, so a
     headless load still gets the seam. */
  if (typeof document === "undefined") {
    return;
  }

  document.addEventListener("keydown", onKeyDown);
})(window);
