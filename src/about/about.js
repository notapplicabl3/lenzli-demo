/* about.js — "About this prototype": one surface, three blocks.
 *
 * Classic script (SPEC A3-9). Overwrites the openAbout stub on load. The About
 * button in reel.html's shell controls calls LENZLI.openAbout() directly.
 *
 * ONE surface, three blocks (ruling A3-4):
 *   1. What this is        — a paragraph, then the hard constraints as a list.
 *   2. How a reel is made  — the selected persona's record pretty-printed beside
 *                            the cards it compiles into, with a field-to-element
 *                            connector row per card. It also carries the one
 *                            labelled specimen of the unfilled video slot.
 *   3. Why it looks like this — rulings D1-D9, one line each, each naming its
 *                            research pointer, then the legend.
 *
 * The legend goes THROUGH LENZLI.renderLegend() (SPEC § 3.1). No state word, no
 * tier row and no chrome rule is restated here: the credentials order owns that
 * copy, and two surfaces rendering it from two places is how they drift apart.
 *
 * This surface carries its own Esc, its own Tab trap and its own focus restore
 * (ruling A3-13; ledger D12-2). src/deck/nav.js closes the deck layer's own
 * overlay and nothing else, so nothing here registers with it — and while this
 * surface holds focus it swallows the keys the deck listens for, so the reel
 * behind it does not move under an open panel.
 */
(function (root) {
  "use strict";

  var LENZLI = root.LENZLI;

  if (!LENZLI) {
    throw new Error(
      "src/about/about.js: window.LENZLI is missing. src/brand/namespace.js must load first."
    );
  }

  /* The one open surface, or null. Opening twice focuses the panel instead of
     stacking a second copy of it. */
  var current = null;

  /* Keys src/deck/nav.js acts on. While this panel is open they belong to it. */
  var DECK_KEYS = ["ArrowRight", "ArrowLeft", "Home", "End"];

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

  /* One italic accent word per headline, never two (SPEC § 4 D1). It falls on
     the last word, the same rule the deck's headlines use. */
  function block(title) {
    var section = make("section", "about-block");
    var h3 = make("h3", "about-h display");
    var words = String(title).split(" ");
    var accent = words.pop();

    if (words.length) {
      h3.appendChild(document.createTextNode(words.join(" ") + " "));
    }
    h3.appendChild(make("span", "accent", accent));
    section.appendChild(h3);
    return section;
  }

  function bullets(className, lines) {
    var list = make("ul", className);
    lines.forEach(function (line) {
      list.appendChild(make("li", "about-item", line));
    });
    return list;
  }

  /* The active persona is read off the shell's own contract: reel.html emits the
     three [data-persona] buttons and cards.js moves aria-pressed="true" to the
     one whose deck is showing (reel.html lines 30-33). The deck's own state —
     LENZLI.deck.cards / .index — is documented as private to src/deck/
     (src/deck/nav.js lines 20-26), so this file does not read it. */
  function selectedId() {
    var personas = LENZLI.personas || {};
    var pressed = document.querySelector('[data-persona][aria-pressed="true"]');
    var ids = Object.keys(personas);
    var id;

    if (pressed) {
      id = pressed.getAttribute("data-persona");
      if (personas[id]) {
        return id;
      }
    }

    return ids.length ? ids[0] : null;
  }

  /* --- Block 1: what this is ---------------------------------------------- */

  var LEDE =
    "This is a private prototype of one question: what a professional's experience — " +
    "and especially their certifications — looks like when it is reel length and provably " +
    "real. Three invented people carry it, because one persona cannot exercise a four-tier " +
    "trust ladder. Everything on a card is either attributed to whoever issued it, or " +
    "visibly plain.";

  var CONSTRAINTS = [
    "Private and local. It opens from a double-click on reel.html; there is no server behind it.",
    "Zero dependencies. No package manager, no bundler, no framework, no font or script loaded from anywhere else.",
    "No build step. The files on disk are the artifact, and the browser reads them as they are.",
    "No network at runtime. Nothing on this page calls out; the verify action opens a mock result sheet instead.",
    "Mock data. The three people are invented, and so is every credential, every issuer answer and every verification result.",
    "No remote media. The media plates carry placeholder photos stored in this repository — none of it is anyone's real work, and nothing is loaded from anywhere else.",
    "The brand is copied as values from a read-only reference repository. Nothing is written back to it, and this repository has no git remote."
  ];

  function blockWhat() {
    var section = block("What this is");
    section.appendChild(make("p", "about-lede", LEDE));
    section.appendChild(make("h4", "about-sub", "The hard constraints"));
    section.appendChild(bullets("about-list", CONSTRAINTS));
    return section;
  }

  /* --- Block 2: how a reel is made ---------------------------------------- */
  /* The connector rows read record field -> rendered element. They are written
     against the two files that do the work: src/deck/build.js compiles the
     descriptor, src/deck/cards.js paints it. */

  var CONNECTORS = {
    hook: [
      ["identity.monogram", "the initials plate"],
      ["identity.name", "the card heading"],
      ["identity.niche", "the positioning claim beneath it, and the persistent overlay line"],
      ["identity.availability", "the availability line and its dot"]
    ],
    proof: [
      ["outcome.headline", "the heading, set large"],
      ["outcome.context", "the small line under it"],
      ["outcome.artifact.label", "the artifact plate"],
      ["outcome.artifact.image", "the placeholder photo behind that plate — optional; without it the plate is the CSS stand-in"],
      ["outcome.artifact.caption", "the caption naming what was contributed"]
    ],
    close: [
      ["close.scope[]", "the scope list, in the client's vocabulary"],
      ["close.rateBand", "the rate row"],
      ["close.responseTime", "the response row"],
      ["close.timezone", "the timezone row"],
      ["close.cta.label", "the one action, never a menu"]
    ],
    wallet: [
      ["credentials.length", "the count in the teaser — derived here, never authored in the record"]
    ]
  };

  function trustConnectors(card) {
    var rows = [["trustBeat", "which branch this beat renders"]];

    if (card.data.branch === "testimonial") {
      rows.push(["testimonials[0]", "the quote, its author, role, org and date"]);
      rows.push(["credentials[] without tier D", "up to two chips beneath it, through LENZLI.renderChip in pinned order"]);
    } else {
      rows.push(["credentials[] without tier D", "up to three chips, through LENZLI.renderChip in pinned order"]);
    }

    rows.push(["credentials.length", 'the "See all N" that opens the wallet screen']);
    return rows;
  }

  function depthConnectors(card, record, position) {
    var at = "depth[" + position + "]";
    var blockRecord = (record.depth || [])[position] || {};
    var index;

    if (card.kind === "artifact") {
      return [
        [at + ".label", "the heading"],
        [at + ".plate", "the full-bleed plate"],
        [at + ".image", "the placeholder photo behind that plate — optional; without it the plate is the CSS stand-in"],
        [at + ".caption", "the caption"]
      ];
    }

    if (card.kind === "video") {
      return [
        [at + ".kind", "selects the slot; the fields themselves come from the record's video object"],
        ["video.poster.plate", "the poster"],
        ["video.poster.src", "the placeholder photo behind it — optional, and a local file"],
        ["video.durationLabel", "the duration label"],
        ["video.captions[]", "the caption cues, one row per cue"]
      ];
    }

    if (card.kind === "testimonial") {
      index = blockRecord.index || 0;
      return [
        [at + ".index", "which testimonial — a depth block never carries its own quote"],
        ["testimonials[" + index + "]", "the quote block"]
      ];
    }

    return CONNECTORS.wallet;
  }

  function connectorsFor(card, record, index) {
    if (card.beat === "TRUST") {
      return trustConnectors(card);
    }
    if (card.beat === "DEPTH") {
      return depthConnectors(card, record, index - 4);
    }
    return CONNECTORS[card.kind] || [];
  }

  function connectorRows(pairs) {
    var list = make("dl", "about-conn");

    pairs.forEach(function (pair) {
      var from = make("dt", "about-conn-from mono", pair[0]);
      var to = make("dd", "about-conn-to", pair[1]);
      list.appendChild(from);
      list.appendChild(to);
    });

    return list;
  }

  function cardEntry(card, record, index, total) {
    var entry = make("article", "about-card");
    var head = make("div", "about-card-head");

    head.appendChild(make("span", "about-card-n mono", (index + 1) + " / " + total));
    head.appendChild(make("span", "about-card-label", card.label));
    head.appendChild(make("span", "about-card-kind mono", card.kind));

    entry.appendChild(head);
    entry.appendChild(connectorRows(connectorsFor(card, record, index)));
    return entry;
  }

  /* The one specimen of the unfilled video slot (ruling A3-5). It is shown here
     and nowhere else: a persona without a video omits the key entirely, so no
     card is compiled and no reel is ever marked incomplete. */
  function emptySlot() {
    var slot = make("div", "about-slot");
    var frame = make("div", "about-slot-frame");

    slot.appendChild(make("h4", "about-sub", "What the slot looks like empty"));
    slot.appendChild(make("p", "about-note",
      "Never rendered inside a reel. A persona with no video omits the key, the compile " +
      "produces no video card, and nothing on the reel says a piece is missing. This is the " +
      "only place the unfilled slot appears."));

    frame.setAttribute("aria-hidden", "true");
    frame.appendChild(make("span", "about-slot-plate", ""));
    frame.appendChild(make("span", "about-slot-row mono", "duration —"));
    frame.appendChild(make("span", "about-slot-row mono", "no cues"));
    slot.appendChild(frame);

    slot.appendChild(make("pre", "about-record mono",
      "video: {\n" +
      '  durationLabel: "",\n' +
      '  poster: { plate: "" },\n' +
      "  captions: []\n" +
      "}"));

    return slot;
  }

  function blockHow() {
    var section = block("How a reel is made");
    var id = selectedId();
    var record = id ? (LENZLI.personas || {})[id] : null;
    var pair;
    var cards;
    var column;

    section.appendChild(make("p", "about-lede",
      "A reel compiles. The record is the whole input, and the cards beside it are what " +
      "LENZLI.buildDeck returns from it — nobody faces a blank recording screen."));

    if (!record) {
      section.appendChild(make("p", "about-note",
        "No persona is registered, so there is nothing to compile. The data files have not loaded."));
      section.appendChild(emptySlot());
      return section;
    }

    cards = LENZLI.buildDeck(record);
    pair = make("div", "about-pair");

    column = make("div", "about-column");
    column.appendChild(make("h4", "about-sub", "The record: " + id));
    column.appendChild(make("pre", "about-record mono", JSON.stringify(record, null, 2)));
    pair.appendChild(column);

    column = make("div", "about-column");
    column.appendChild(make("h4", "about-sub", "The " + cards.length + " cards it compiles into"));
    column.appendChild(make("p", "about-note",
      "Every compiled card carries beat, label, kind, personaId and data. The rows under " +
      "each one trace a record field to the element it becomes."));
    cards.forEach(function (card, index) {
      column.appendChild(cardEntry(card, record, index, cards.length));
    });
    pair.appendChild(column);

    section.appendChild(pair);
    section.appendChild(emptySlot());
    return section;
  }

  /* --- Block 3: why it looks like this ------------------------------------ */
  /* Nine rulings, one line each, each naming the research section it rests on. */

  var RULINGS = [
    ["D1", "Positioning",
      "Attributed verification only — “Verified with Nursys”, never a bare “Verified”, and no seal, shield or checkmark of our own.",
      "docs/research-landscape.md § 5"],
    ["D2", "Format",
      "A vertical card deck the viewer paces: tap zones, swipe, keyboard, seven cards at most, and no timer that advances anything.",
      "docs/research-video-retention.md § 5"],
    ["D3", "Spine",
      "Four core beats — hook, proof, trust, close — plus up to three optional depth cards, with the first card carrying the most design.",
      "docs/research-attention.md § 7.1–7.2"],
    ["D4", "Credential display",
      "Three levels — chip, wallet card, wallet screen — over a four-tier ladder and six status states, with tier D given no card chrome at all.",
      "docs/research-credentials.md § C/D"],
    ["D5", "Video",
      "Text carries the evidence. Video is one optional 10–15 second personality slot, sound-off, displayed and never scored.",
      "docs/research-attention.md § 7.1–7.2"],
    ["D6", "Product principles",
      "No per-viewer seen receipts, captions as a real track rather than burned-in text, reduced motion respected, everything load-bearing visible without a tap.",
      "docs/research-landscape.md § 5"],
    ["D7", "Tech",
      "A reel compiles from structured data and the prototype shows the compile: zero dependencies, no build step, no server, no network call.",
      "docs/research-landscape.md § 5"],
    ["D8", "Brand",
      "Warm paper and ink, no chromatic accent, one italic serif word per headline — a light professional reel, deliberately not a dark feed.",
      "docs/research-attention.md § 7.1–7.2"],
    ["D9", "Personas",
      "Three people chosen so that all four tiers and five of the six status states are exercised by real records rather than described.",
      "docs/research-credentials.md § C/D"]
  ];

  function rulingRow(ruling) {
    var row = make("li", "about-ruling");
    var head = make("p", "about-ruling-head");

    head.appendChild(make("span", "about-ruling-id mono", ruling[0]));
    head.appendChild(make("span", "about-ruling-name", ruling[1]));

    row.appendChild(head);
    row.appendChild(make("p", "about-ruling-line", ruling[2]));
    row.appendChild(make("p", "about-pointer mono", ruling[3]));
    return row;
  }

  function blockWhy() {
    var section = block("Why it looks like this");
    var list = make("ol", "about-rulings");
    var legend;

    section.appendChild(make("p", "about-lede",
      "Nine rulings decided the shape of this build. Each one names the research section it rests on."));

    RULINGS.forEach(function (ruling) {
      list.appendChild(rulingRow(ruling));
    });
    section.appendChild(list);

    /* The tier ladder and the six state words are rendered through the legend
       file, never restated here. Appended only when it returns something, so a
       tree without src/credentials/ shows the rulings rather than throwing. */
    legend = LENZLI.renderLegend();
    if (legend) {
      section.appendChild(legend);
    }

    return section;
  }

  /* --- the surface --------------------------------------------------------- */
  /* Its own overlay mechanic (A3-13): it takes focus, traps Tab inside itself,
     closes on Esc or on its own Close button, and hands focus back to whatever
     opened it. It mounts into <body> and covers the viewport, because block 2
     puts a record BESIDE the cards it compiles into and the 9:19.5 stage is too
     narrow to stand them side by side. On a narrow viewport the pair stacks. */

  function reachable(panel) {
    var all = panel.querySelectorAll("button, summary, [tabindex]:not([tabindex='-1'])");
    return Array.prototype.filter.call(all, function (el) {
      return !el.hidden && el.offsetParent !== null;
    });
  }

  function surface(title, contents) {
    var returnTo = document.activeElement;
    var overlay = make("div", "about-sheet");
    var panel = make("div", "about-panel");
    var bar = make("div", "about-bar");
    var label = make("h2", "about-title", title);
    var close = make("button", "about-close", "Close");

    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", title);
    panel.setAttribute("tabindex", "-1");
    label.setAttribute("tabindex", "-1");
    close.type = "button";

    bar.appendChild(label);
    bar.appendChild(close);
    panel.appendChild(bar);
    panel.appendChild(contents);
    overlay.appendChild(panel);
    document.body.appendChild(overlay);

    function shut() {
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
      current = null;
      if (returnTo && typeof returnTo.focus === "function") {
        returnTo.focus();
      }
    }

    overlay.addEventListener("keydown", function (ev) {
      var stops;
      var first;
      var last;
      var here;

      if (ev.key === "Escape") {
        ev.stopPropagation();
        shut();
        return;
      }

      /* The deck listens for these on the document. While this panel holds
         focus they stop here, so the reel behind it does not move. */
      if (DECK_KEYS.indexOf(ev.key) !== -1) {
        ev.stopPropagation();
        return;
      }

      if (ev.key !== "Tab") {
        return;
      }

      stops = reachable(panel);
      if (!stops.length) {
        return;
      }

      first = stops[0];
      last = stops[stops.length - 1];

      /* The heading holds focus on open and is not itself a stop, so anything
         outside the list counts as standing on the boundary. */
      here = stops.indexOf(document.activeElement);

      if (ev.shiftKey && (here === -1 || document.activeElement === first)) {
        ev.preventDefault();
        last.focus();
      } else if (!ev.shiftKey && (here === -1 || document.activeElement === last)) {
        ev.preventDefault();
        first.focus();
      }
    });

    /* A press on the bare backdrop would otherwise drop focus onto <body>,
       outside this overlay, where the key guard above can no longer reach it.
       Focusing the heading is not enough on its own: mousedown's own default
       focus action runs after this handler and moves focus to <body> whatever
       was focused here, so the press is cancelled first. */
    overlay.addEventListener("pointerdown", function (ev) {
      if (ev.target === overlay) {
        ev.preventDefault();
        label.focus();
      }
    });

    close.addEventListener("click", shut);
    label.focus();

    return { element: overlay, panel: panel, close: shut };
  }

  LENZLI.openAbout = function () {
    var body;

    if (current) {
      current.panel.focus();
      return current;
    }

    body = make("div", "about-body");
    body.appendChild(blockWhat());
    body.appendChild(blockHow());
    body.appendChild(blockWhy());

    current = surface("About this prototype", body);
    return current;
  };

  /* The router's teardown calls this on every route change (SPEC § 3.4 step 1),
     the same backstop class as LENZLI.cred.closeSheet().

     WHY IT HAS TO EXIST. This panel mounts at document.body, outside the router's
     host, so emptying the host cannot reach it — and it carries
     aria-modal="true". One that survives a route change leaves the reader behind
     a live dialog: the router moves focus to the incoming surface's <h1>
     UNDERNEATH the overlay, and because both the Escape handler and the Tab trap
     are bound to the overlay element, neither can see a key pressed anywhere
     else. Esc goes dead and Tab walks the surface behind the panel. It also puts
     the demo panel over #/r/<id>, the one route whose whole point is that the
     demo chrome is stripped (A1-24).

     Idempotent, exactly as closeSheet is: nothing open is not an error, and a
     surface's own unmount() calling it before the router does must not throw. */
  LENZLI.closeAbout = function () {
    if (current) {
      current.close();
    }
  };
})(window);
