/*
 * src/landing/landing.js — the link-landing surface at #/r/<personaId>.
 *
 * Classic script (SPEC A3-9). Overwrites the LENZLI.landing.share stub
 * namespace.js declared, and registers itself with the router as "landing" at
 * load (SPEC § 3.4, ledger V2-14) — this file holds no manifest and no later
 * order edits src/app/.
 *
 * THIS IS THE ARRIVAL SURFACE. Someone opened a link cold and landed on one
 * person's reel. Everything below follows from that one fact.
 *
 * NO GATE (SPEC A1-18, § 4 D6). Card 1 renders on arrival and the commitment
 * price sits in the chrome band beside it. A pre-roll — "6 cards, ~45s, tap to
 * start" — would mean the viewer who leaves has seen NOTHING, which throws away
 * the primacy card 1 exists to spend. This was adjudicated against; it is not an
 * open design question.
 *
 * THE SECONDS ARE DERIVED, NEVER AUTHORED (SPEC § 4 D6). The rule, stated here
 * so no record can ever carry a duration claim that drifts from its own reel:
 *
 *     seconds = round( cards * 7.5 / 5 ) * 5        cards from buildDeck(record).length
 *
 * i.e. seven and a half seconds a card, rounded to the nearest five. 4 cards ->
 * 30s, 6 cards -> 45s, 7 cards -> 55s. No persona record holds a duration field
 * and none may be given one: the number is a fact about the compiled deck.
 *
 * DEMO CHROME IS STRIPPED (SPEC § 3.4.1 M6 — D6 governs). This surface renders
 * no persona switcher, no About control and no nav; app.js hides [data-app-nav]
 * whole on this route, so the app head keeps the Lenzli lockup and nothing else,
 * and this file does NOT draw a second lockup of its own.
 *
 * NO PER-VIEWER RECEIPTS OF ANY KIND (SPEC F-14, AM-16). No view counter, no
 * seen-state, no "opened at", no tally. Nothing here counts anybody.
 *
 * THE ENGINE IS CALLED, NEVER REIMPLEMENTED (SPEC § 10). The reel is one named
 * LENZLI.createDeck instance — never LENZLI.boot(), which is reel.html's entry
 * point and the only thing that creates instance zero (A1-7). The "All N cards"
 * escape is that instance's own openGrid(). The share exhibit opens through
 * cred.sheet(heading, contents, host), inheriting its focus trap, its Esc and
 * its focus restoration. The record is read through LENZLI.records.get(id) and
 * never through LENZLI.personas (E-7's binding line).
 *
 * THE MOUNT CONTRACT this surface satisfies for createDeck (SPEC § 3.1, M5, M12):
 *   [data-deck-mount]          .land-deck, the box compiled cards mount into
 *   [data-deck-progress]       .land-progress, the segmented index
 *   [data-deck-overlay-host]   .land-stage, where the grid overlay mounts (M5)
 *   [data-slot=name|niche|availability]
 *                              the persistent identity band (M12) — without
 *                              these three this surface ships an empty band,
 *                              because no app surface calls showPersona
 * The container handed to createDeck is the <section>, so all four resolve
 * scoped to it and nothing is looked up by document id.
 *
 * AN UNKNOWN id IS A REAL TREATMENT, NEVER A BLANK DECK (SPEC § 3.4, A1-9). A
 * link to a person this prototype does not have says so and quotes the address
 * back. Hiding that would hide exactly the failure an arrival surface exists to
 * demonstrate — and § 5.1 B assertion 9 requires zero .card elements on it.
 *
 * ERRORS SURFACE (SPEC § 10). buildDeck is NOT wrapped in a try/catch here: a
 * record that does not compile is an authoring defect, assertion 36 exists to
 * catch it at publish, and a swallowed compile error would render a shorter reel
 * that looks like a design choice.
 */
(function (root) {
  "use strict";

  var LENZLI = root.LENZLI;

  if (!LENZLI || !LENZLI.landing) {
    throw new Error(
      "src/landing/landing.js: window.LENZLI.landing is missing. src/brand/namespace.js must load first."
    );
  }

  /* namespace.js created this container with share stubbed; overwrite the method
     in place so anything that captured the object at load keeps the same object
     (the idiom src/store/storage.js uses for LENZLI.store). */
  var landing = LENZLI.landing = LENZLI.landing || {};

  /* The two constants of the derived-seconds rule stated in the header. They are
     named rather than inlined so the arithmetic reads as the rule it is. */
  var SECONDS_PER_CARD = 7.5;
  var ROUND_TO = 5;

  /* Mounted state. One surface is mounted at a time — the router guarantees it —
     so three module-level handles are the whole lifetime, and unmount() clears
     every one of them. */
  var mounted = null;   /* the node this surface put in the host */
  var stage = null;     /* the positioned canvas: overlay host AND sheet host */
  var deck = null;      /* the ONE createDeck instance this surface owns */

  /* --- small helpers ------------------------------------------------------ */

  function make(tag, className, text) {
    var node = document.createElement(tag);
    if (className) {
      node.className = className;
    }
    if (text !== undefined && text !== null) {
      node.textContent = text;
    }
    return node;
  }

  function button(className, text) {
    var node = make("button", className, text);
    node.type = "button";
    return node;
  }

  function slot(node, name) {
    node.setAttribute("data-slot", name);
    return node;
  }

  /* "1 card" and "6 cards" — the escape control and the price line both read as
     copy, and "All 1 cards" would be the tell that a number was pasted in. */
  function plural(count, word) {
    return count + " " + word + (count === 1 ? "" : "s");
  }

  /* The derived-seconds rule, and the only place it is computed. */
  function seconds(count) {
    return Math.round((count * SECONDS_PER_CARD) / ROUND_TO) * ROUND_TO;
  }

  /* The commitment price: "6 cards · ~45s". The count is the compiled deck's own
     length and the seconds fall out of it, so the two can never disagree. */
  function priceLine(count) {
    return plural(count, "card") + " · ~" + seconds(count) + "s";
  }

  /* --- the not-found treatment -------------------------------------------- */

  /* SPEC § 3.4: a known route with an unknown personaId renders the not-found
     treatment with "no reel exists at this link", never a blank deck and never a
     silent redirect. The panel vocabulary is the router's own (app.css's
     .app-panel block, which router.js:176-207 builds the same way) — restyling
     it under a land- prefix would give one treatment two appearances, and § 10
     forbids reimplementing what exists. No class is DECLARED here, so
     landing.css stays wholly land-prefixed (AM-20). */
  function mountNotFound(host, personaId) {
    var section = make("section", "app-panel");
    var h1 = make("h1", "app-panel-title display", "No reel exists at this link");
    var back = button("ctl app-panel-back", "Back to search");

    h1.setAttribute("tabindex", "-1");
    section.appendChild(h1);
    section.appendChild(make("p", "app-panel-note",
      "This address names a person this prototype does not have. Nothing is " +
        "loading and nothing was redirected away — the link itself is the thing " +
        "that is wrong."));
    section.appendChild(make("p", "app-panel-route mono", "#/r/" + (personaId || "")));

    back.addEventListener("click", function () {
      LENZLI.router.go("/");
    });
    section.appendChild(back);

    host.appendChild(section);
    return section;
  }

  /* --- the reel ----------------------------------------------------------- */

  /* The persistent identity band (sibling ruling D3, SPEC § 3.4.1 M12).
     createDeck fills these three [data-slot] nodes from the record it renders,
     scoped to its own container. The name is this surface's <h1 tabindex="-1">:
     the router moves focus to it and announces the surface title (§ 3.4 step 5),
     and an arrival page's heading IS the person. */
  function identityBand() {
    var band = make("div", "land-identity");
    var mark = make("span", "land-identity-mark");
    var text = make("div", "land-identity-text");
    var name = make("h1", "land-name");
    var niche = make("span", "land-niche");
    var avail = make("span", "land-avail");
    var dot = make("span", "land-avail-dot");
    var availText = make("span", "land-avail-text");

    mark.setAttribute("data-mark", "18");
    name.setAttribute("tabindex", "-1");
    dot.setAttribute("aria-hidden", "true");

    text.appendChild(slot(name, "name"));
    text.appendChild(slot(niche, "niche"));
    avail.appendChild(dot);
    avail.appendChild(slot(availText, "availability"));

    band.appendChild(mark);
    band.appendChild(text);
    band.appendChild(avail);
    return band;
  }

  function mountReel(host, record) {
    var section = make("section", "land-surface");
    var box = make("div", "land-stage");
    var progress = make("div", "land-progress");
    var deckMount = make("div", "land-deck");
    var chrome = make("div", "land-chrome");
    var price = make("p", "land-price");
    var controls = make("div", "land-controls");
    var all = button("ctl land-ctl");
    var share = button("ctl land-ctl", "Share");
    var cards;

    box.setAttribute("data-deck-overlay-host", "");
    progress.setAttribute("data-deck-progress", "");
    progress.setAttribute("aria-label", "Cards");
    deckMount.setAttribute("data-deck-mount", "");

    /* Stable hooks for the app oracle (W12, § 5.1 B assertions 18-20), the same
       way app.html marks its chrome with data-app-* rather than leaving a
       harness to guess at class names. */
    price.setAttribute("data-land-price", "");
    all.setAttribute("data-land-all", "");
    share.setAttribute("data-land-share", "");

    box.appendChild(progress);
    box.appendChild(identityBand());
    box.appendChild(deckMount);

    /* The commitment price and the direct-access escape share one band at the
       foot of the same frame card 1 fills. .land-stage sets --chrome-bottom to
       this band's height, which is the seam deck.css already reads: .card-body
       and .endcap both pad past it, so no card content ever lands underneath. */
    chrome.appendChild(price);
    controls.appendChild(all);
    controls.appendChild(share);
    chrome.appendChild(controls);
    box.appendChild(chrome);

    section.appendChild(box);
    host.appendChild(section);
    mounted = section;
    stage = box;

    /* One compile, two consumers: the deck gets these cards and the price line
       counts this same array, so assertion 18's "equals the deck's length" is
       true by construction rather than by agreement. */
    cards = LENZLI.buildDeck(record);
    price.textContent = priceLine(cards.length);
    all.textContent = "All " + plural(cards.length, "card");

    deck = LENZLI.createDeck(section);
    deck.setCards(cards);

    /* Card 1, immediately, with no gate to press. focus:false on THIS render
       only — the instance keeps its default focus behaviour for every later card
       change; the router is about to move focus to the <h1> (§ 3.4 step 5) and
       two focus moves in one mount is one too many. */
    deck.render(0, { focus: false });

    all.addEventListener("click", function () {
      deck.openGrid();
    });
    share.addEventListener("click", function () {
      landing.share(record.id);
    });

    return section;
  }

  /* --- the share exhibit -------------------------------------------------- */

  /* SPEC § 4 D6. The unfurl is the real first impression of a shared link and
     there is no way to demonstrate it without a network — so it is shown as a
     labelled design mock and says so, in its own words, above the card it is
     mocking. Every part of it is a text node: no link element, no second window,
     no address that resolves anywhere. It is inert by construction, not by
     policy — the tokens AM-1 greps for are absent from this file entirely, in
     its comments as well as in its code, because that row's check is a literal
     fixed-string scan over src/ and does not exempt prose.
     The thumbnail is the monogram. Of the two options D6 allows, a cover plate
     would be one of the six work stills under src/brand/img/ (A1-16), and a work
     still is not a face — an unfurl thumbnail that is not the person would
     misrepresent the very thing the exhibit exists to show. */
  function shareExhibit(record) {
    var identity = record.identity || {};
    var count = LENZLI.buildDeck(record).length;
    var wrap = make("div", "land-share");
    var card = make("div", "land-unfurl");
    var plate = make("div", "land-unfurl-plate");
    var text = make("div", "land-unfurl-text");

    wrap.appendChild(make("p", "land-share-note",
      "a mock of the link preview — this prototype makes no network calls"));

    plate.setAttribute("aria-hidden", "true");
    plate.appendChild(make("span", "land-unfurl-monogram", identity.monogram || ""));

    text.appendChild(make("span", "land-unfurl-name", identity.name || ""));
    text.appendChild(make("span", "land-unfurl-line", identity.niche || ""));
    text.appendChild(make("span", "land-unfurl-meta", priceLine(count)));

    card.appendChild(plate);
    card.appendChild(text);
    wrap.appendChild(card);

    wrap.appendChild(make("p", "land-share-addr",
      "The address this would carry, inert here: #/r/" + record.id));

    return wrap;
  }

  /* SPEC § 3.1 lists landing.share(personaId) as this file's one published
     method. It takes an id rather than closing over the mounted record so it is
     callable on its own terms, and it reads that id through records.get like
     every other surface (E-7). The host is this surface's stage: .cred-sheet is
     position:absolute/inset:0 (credentials.css:100-109) and needs a positioned
     box, and mounting inside the surface is what lets the router's teardown
     reach it (E-6, assertion 11). With nothing mounted the third argument is
     null and E-6's default chain applies, unchanged. */
  landing.share = function (personaId) {
    var record = LENZLI.records.get(personaId);
    var body;

    if (!record) {
      console.warn(
        "LENZLI.landing.share: no record with id " + personaId + " — there is nothing to preview."
      );
      return null;
    }

    /* Guarded exactly as router.js:276 guards closeSheet: on a tree where
       src/credentials/ has not landed the kit is absent, and saying so is better
       than throwing out of a click handler. */
    if (!LENZLI.cred || typeof LENZLI.cred.sheet !== "function") {
      console.warn(
        "LENZLI.landing.share: LENZLI.cred.sheet is absent, so the link-preview exhibit cannot open."
      );
      return null;
    }

    body = shareExhibit(record);
    return LENZLI.cred.sheet("Link preview — exhibit", body, stage);
  };

  /* --- the surface -------------------------------------------------------- */

  /* SPEC § 3.4's five-step teardown, this surface's half of it. It destroys the
     one deck instance it created, closes any sheet it opened, and takes its own
     node out of the host. It adds NO listener to document or window — every
     listener it binds sits on a node inside its own section, or is the deck
     instance's, and destroy() owns those — so there is nothing else to release.
     destroy() and closeSheet() are both idempotent, so a router teardown racing
     a second call cannot throw. */
  function unmount() {
    if (deck) {
      deck.destroy();
      deck = null;
    }

    if (LENZLI.cred && typeof LENZLI.cred.closeSheet === "function") {
      LENZLI.cred.closeSheet();
    }

    if (mounted && mounted.parentNode) {
      mounted.parentNode.removeChild(mounted);
    }
    mounted = null;
    stage = null;
  }

  var surface = {
    /* Read by the router AFTER mount(), to announce the surface in the app's one
       aria-live region (§ 3.4 step 5) — so it names the person who was actually
       resolved rather than the route that asked for them. */
    title: "Reel",

    mount: function (host, params) {
      var personaId = params && params.personaId;
      var record = LENZLI.records.get(personaId);
      var identity;

      if (!record) {
        surface.title = "No reel exists at this link";
        mounted = mountNotFound(host, personaId);
        return;
      }

      identity = record.identity || {};
      surface.title = (identity.name || personaId) + " — reel";
      mountReel(host, record);
    },

    unmount: unmount
  };

  LENZLI.router.register("landing", surface);
})(window);
