/* namespace.js — the one global.
 *
 * Loads first on the page. Everything in this prototype attaches here; there is
 * no second global and no module system (SPEC A3-9: classic scripts only, so the
 * artifact opens from a double-click with no server and no build step).
 *
 * DOM-free by contract (SPEC § 3.1, headless rule): this file loads under node
 * with `global.window = global`. No document access, no timers, no network calls.
 *
 * Stub rule (SPEC § 3.1): every method named in § 3.1 is pre-declared here as a
 * console.info no-op, and each owning file overwrites its own on load. So no
 * method is ever absent, whatever subset of the build has landed, and a shell
 * control pressed early reports itself instead of throwing.
 *
 * Not created here: LENZLI.personas (src/data/shapes.js owns it) and LENZLI.cred
 * (src/credentials/chip.js owns it). Both are created idempotently by their own
 * file, so a second creator here would clobber whichever landed first.
 */
(function (root) {
  "use strict";

  var LENZLI = root.LENZLI || {};
  root.LENZLI = LENZLI;

  /* The build date is frozen. Every derived date — renewal countdowns, expiring
     math — computes against this value and never against the clock, so the
     artifact is a specimen that renders identically forever. */
  LENZLI.BUILD_DATE = "2026-08-12";

  function stub(name) {
    return function () {
      console.info("LENZLI." + name + " — stub. Its file has not landed yet.");
    };
  }

  /* § 3.1 methods, with the file that overwrites each one. */
  var STUBS = [
    "registerPersona",   // src/data/shapes.js
    "validatePersona",   // src/data/shapes.js
    "buildDeck",         // src/deck/build.js
    "boot",              // src/deck/cards.js
    "createDeck",        // src/deck/cards.js
    "showPersona",       // src/deck/cards.js
    "openGrid",          // src/deck/cards.js
    "focusDeck",         // src/deck/nav.js  (bindDeckInput is stubbed below — it must return)
    "paintMarks",        // src/brand/mark.js
    "appBoot",           // src/app/app.js
    "renderChip",        // src/credentials/chip.js
    "openWalletCard",    // src/credentials/walletCard.js
    "openVerifySheet",   // src/credentials/walletCard.js
    "openWalletScreen",  // src/credentials/walletScreen.js
    "pinOrder",          // src/credentials/walletScreen.js
    "renderLegend",      // src/credentials/legend.js
    "openAbout",         // src/about/about.js
    "closeAbout"         // src/about/about.js
  ];

  STUBS.forEach(function (name) {
    LENZLI[name] = stub(name);
  });

  /* The one stub that may not return undefined. createDeck KEEPS what
     bindDeckInput hands back and calls it at destroy() (src/deck/cards.js), so a
     void stub would make createDeck throw outright in a tree where
     src/deck/nav.js has not landed — which is the exact partial-landing case the
     stub rule exists to make degrade instead of explode. It is declared here
     rather than in the list above because the list is the void kind and one
     silent exception inside it would be worse than one stated beside it. */
  LENZLI.bindDeckInput = function () {
    console.info("LENZLI.bindDeckInput — stub. Its file has not landed yet.");
    return function () {};
  };

  /* Sub-object containers. Each is created here with its § 3.1 methods stubbed,
     so a control on a surface whose folder has not landed reports itself instead
     of throwing on a missing container.

     LENZLI.deck is the one that predates the app build: it holds the three movers
     until LENZLI.boot() replaces the whole object with instance zero (§ 3.1, E-1).
     Nothing seeds cards/index/render/overlay here or anywhere else at module
     scope — a page that never creates a deck instance leaves this object exactly
     as declared, which is what makes LENZLI.deck.render === undefined a true
     statement about the app (§ 5.1 B assertion 3).

     NOT created here: LENZLI.cred (src/credentials/chip.js owns that kit and
     creates it idempotently at its own top) and LENZLI.personas (src/data/
     shapes.js owns it). Two owners for one container is how a container gets
     clobbered. */
  function container(path, methods) {
    var kit = {};
    methods.forEach(function (name) {
      kit[name] = stub(path + "." + name);
    });
    return kit;
  }

  LENZLI.deck = container("deck", ["goTo", "next", "prev"]);          // src/deck/nav.js -> instance
  LENZLI.records = container("records",
    ["all", "get", "save", "remove", "isSeed", "me", "setMe", "reset", "export"]);  // src/store/records.js
  LENZLI.router = container("router",
    ["start", "register", "go", "parse", "current"]);                 // src/app/router.js
  LENZLI.app = container("app", ["notice"]);                          // src/app/app.js
  LENZLI.directory = container("directory", ["search", "facets"]);    // src/directory/search.js
  LENZLI.landing = container("landing", ["share"]);                   // src/landing/landing.js
  LENZLI.create = container("create",
    ["deriveTier", "deriveStatus", "deriveTrustBeat", "draftToRecord", "wordBudget",
      "clearDraft"]);          // src/create/tier.js, draft.js; clearDraft is create.js's
                               // — records.reset() calls it so the draft in progress goes
                               // with every other key (SPEC § 4 D8)
  LENZLI.owner = {};                                                  // src/owner/owner.js — no § 3.1 method

  /* store.available is a PROPERTY, not a method: § 3.1 writes it without
     parentheses where it writes all four siblings with them, and AM-11 requires
     `LENZLI.store.available === false` to be a reachable state — which a stub
     function could never be. False is also the honest reading before
     src/store/storage.js lands: no storage layer is on the page yet. */
  LENZLI.store = container("store", ["get", "set", "remove", "keys"]);
  LENZLI.store.available = false;

  /* Stubs return undefined on purpose. Callers that append a rendered element —
     the TRUST beat appending LENZLI.renderChip(cred) — append only a truthy
     return, so a tree without the credentials files renders without chips
     rather than throwing. */
})(window);
