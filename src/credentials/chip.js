/* chip.js — level 1 of the trust ladder: the in-reel credential chip.
 *
 * Classic script (SPEC A3-9). Overwrites the namespace's renderChip stub on
 * load. The deck's TRUST beat renders every chip through this function and
 * never with markup of its own (SPEC § 3.1).
 *
 * Three facts and nothing else, Apple's header-field discipline (SPEC § 4 D4):
 * status glyph + short name · attributed verifier · status word. A fourth fact
 * belongs on the wallet card, which is one tap away.
 *
 * This file loads first in src/credentials/, so it also creates LENZLI.cred —
 * the small shared kit the other three files in this folder read: the status
 * vocabulary, the two name budgets, the record lookup, and the BUILD_DATE date
 * math. It sits on the namespace for the same reason LENZLI.mark does
 * (src/brand/mark.js): the namespace is the only global this build has, and
 * § 4 D4's file list is five files, so there is no sixth file to hold it. It is
 * created idempotently, the way src/data/shapes.js creates LENZLI.personas.
 */
(function (root) {
  "use strict";

  var LENZLI = root.LENZLI;
  var cred = LENZLI.cred = LENZLI.cred || {};

  /* --- Status vocabulary ----------------------------------------------------
     Six states, monochrome (SPEC A3-16). Three channels carry the meaning: the
     word, which always leads and is never replaced by the glyph; the glyph,
     whose FORM differs per state rather than its colour; and ink density, set
     in credentials.css off the is-<state> class. No chromatic accent enters
     this build, so colour is never the only encoding. */

  var WORDS = {
    active: "Active",
    expiring: "Expiring",
    expired: "Expired",
    suspended: "Suspended",
    revoked: "Revoked",
    unverifiable: "Unverifiable"
  };

  cred.statusWord = function (state) {
    return WORDS[state] || "";
  };

  /* Glyph geometry, drawn at a 20-unit viewBox and rendered at 10px. Fills and
     strokes are currentColor, so ink density is inherited rather than declared
     twice. The one exception is the cut across the filled disc, which is
     stroked in paper by credentials.css so the disc reads as struck through. */
  var RING = '<circle cx="10" cy="10" r="6" fill="none" stroke="currentColor" stroke-width="2"/>';
  var DISC = '<circle cx="10" cy="10" r="6" fill="currentColor"/>';

  var FORMS = {
    active: DISC,
    expiring: RING + '<path d="M10 10 L10 4 A6 6 0 0 1 16 10 Z" fill="currentColor"/>',
    expired: RING + '<line x1="5.4" y1="14.6" x2="14.6" y2="5.4" stroke="currentColor" stroke-width="2"/>',
    suspended: RING + '<line x1="6.6" y1="10" x2="13.4" y2="10" stroke="currentColor" stroke-width="2"/>',
    revoked: DISC + '<line class="cut" x1="5.4" y1="14.6" x2="14.6" y2="5.4" stroke-width="2.2"/>',
    unverifiable: '<circle cx="10" cy="10" r="6" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="1.6 2.4" stroke-linecap="round"/>'
  };

  cred.glyph = function (state) {
    var form = FORMS[state];
    if (!form) {
      return "";
    }
    return '<svg class="cred-glyph" viewBox="0 0 20 20" width="10" height="10" ' +
      'aria-hidden="true" focusable="false">' + form + "</svg>";
  };

  /* A span carrying one glyph. Every surface in this folder draws its glyph
     through here, so the markup exists in exactly one place. */
  cred.glyphSlot = function (state) {
    var slot = document.createElement("span");
    slot.className = "cred-glyph-slot";
    slot.innerHTML = cred.glyph(state);
    return slot;
  };

  /* --- The attributed verifier ----------------------------------------------
     What each tier may honestly say about itself (SPEC § 4 D4 tier table).
     Tier D never reaches either function: it has no verifier, no status word
     and no chip. There is no separate checkmark anywhere in this build — the
     status glyph is the check, which is exactly why tier C's dotted ring is
     the "no checkmark" the ladder asks for. */

  /* What a tier A or B credential may say when it cannot name who did the
     checking. The name is the WHOLE of the claim: "Verified" with nothing after
     it is the unqualified minted trust mark F-9 and the sibling SPEC's D1 exist
     to refuse, and both branches below compose their line by concatenation, so
     an empty name would print one. create.js's publish gate stops this build
     producing such a record at all; this is the backstop for everything else
     that reaches here — hand-edited storage, a later caller — and it degrades to
     the fact that IS known, that the credential is of a kind an outsider could
     re-check, rather than minting one that is not. */
  var UNNAMED = "Verifiable — no verifier named";

  function verifierOf(c) {
    if (c.tier === "A") {
      /* The signature is the proof. The issuer's short text mark, not its full
         legal name, because the chip has one line to say this in and the card
         carries the legal name in its own field. */
      return c.issuer && c.issuer.mark
        ? "Verified — signed by " + c.issuer.mark
        : UNNAMED;
    }
    if (c.tier === "B") {
      return c.verification && c.verification.verifier
        ? "Verified with " + c.verification.verifier
        : UNNAMED;
    }
    return "Issuer link";
  }

  /* How old the check is, in words. ZERO IS TODAY, not "0 days ago" — a figure
     that reads as a stale measurement of a check that has only just been made,
     and the shape every credential the create flow publishes arrives in. Dates
     compute against BUILD_DATE and never against the clock (SPEC § 3.1), so
     "today" is that date and means it.

     Published on the kit rather than kept private here because the verify
     sheet renders the same claim on its own (walletCard.js), and one statement
     with two spellings is the divergence class this build was already bitten
     by. § 10 forbids a second implementation of anything in this kit. */
  cred.freshness = function (days) {
    var n = Number(days);

    if (!isFinite(n) || n < 0) {
      return "freshness not stated";
    }
    return n === 0 ? "checked today" : "checked " + n + " days ago";
  };

  /* The same statement with its freshness, for the wallet card and the wallet
     screen. Tier C says plainly that no check ran. */
  cred.verificationLine = function (c) {
    if (c.tier === "C") {
      return "Issuer link · not checked";
    }
    return verifierOf(c) + " · " + cred.freshness(c.verification.checkedDaysAgo);
  };

  /* --- Name budgets ---------------------------------------------------------
     SPEC § 4 D4 gives the credential name a ~30-character budget on the front,
     with the full string always kept in the DOM. Overflow that truncates
     silently deletes information, so a cut is always marked and the untouched
     string always rides along on the title attribute. */

  var NAME_BUDGET = 30;

  cred.fitName = function (full) {
    var name = full || "";
    var cut;
    if (name.length <= NAME_BUDGET) {
      return name;
    }
    cut = name.lastIndexOf(" ", NAME_BUDGET);
    if (cut < 1) {
      cut = NAME_BUDGET;
    }
    return name.slice(0, cut).replace(/[\s—–-]+$/, "") + "…";
  };

  /* The chip's short name. A record may carry an optional
     achievement.shortName, which is preferred whole; where it is absent the
     name is derived here instead:
       1. a parenthesised acronym stands in for the words that expand it
          ("Basic Life Support (BLS) Provider" becomes "BLS Provider");
       2. otherwise the name is used whole if it fits the budget;
       3. otherwise it is cut at a word boundary and marked, as above.
     The full string stays on the chip's title attribute in every case. */
  cred.shortName = function (c) {
    var full = (c.achievement && c.achievement.name) || "";
    var authored = (c.achievement && c.achievement.shortName) || "";
    var acronym;
    var tail;
    if (authored) {
      return authored;
    }
    acronym = full.match(/\(([A-Z0-9]{2,6})\)/);
    if (acronym) {
      tail = full.slice(acronym.index + acronym[0].length).trim();
      return tail ? acronym[1] + " " + tail : acronym[1];
    }
    return cred.fitName(full);
  };

  /* --- Record lookup and date math ------------------------------------------
     Dates compute against LENZLI.BUILD_DATE and never against the clock
     (SPEC § 3.1): the artifact is a frozen specimen and renders identically
     forever. */

  /* The set the two lookups below scan. Nothing is installed by default, so the
     whole ladder resolves through LENZLI.personas exactly as it did before —
     which is what leaves reel.html untouched (SPEC § 3.1 E-7).

     The store installs a resolver at load. It has to: SPEC § 3.3 keeps
     user-created and user-edited records OUT of LENZLI.personas on purpose, so
     without one every credential control on every record the create flow
     produces misses here, and an edited seed resolves to the un-edited original
     instead — a wrong answer with no error at all. */

  var lookup = null;

  cred.setLookup = function (fn) {
    lookup = typeof fn === "function" ? fn : null;
  };

  /* The installed set, normalised to a list. A resolver may hand back either a
     list of records or an id-keyed object: § 3.3 specifies records.all() as the
     seeded records "overlaid by the stored map, keyed by id", which reads both
     ways, so both are taken rather than one guessed at. With nothing installed
     the set is LENZLI.personas in its own key order, so the scan below is the
     scan that was here before. */
  function scanned() {
    var set = (lookup && lookup()) || LENZLI.personas || {};
    if (Object.prototype.toString.call(set) === "[object Array]") {
      return set;
    }
    return Object.keys(set).map(function (id) {
      return set[id];
    });
  }

  cred.find = function (credId) {
    var all = scanned();
    var list;
    var i;
    var j;
    for (i = 0; i < all.length; i++) {
      list = (all[i] && all[i].credentials) || [];
      for (j = 0; j < list.length; j++) {
        if (list[j].id === credId) {
          return { persona: all[i], cred: list[j] };
        }
      }
    }
    return null;
  };

  /* A persona by id, for the wallet screen's id path. The installed set first,
     so an edited seed resolves to the edit; LENZLI.personas second, so an id the
     store does not carry still resolves the way it does today. */
  cred.findPersona = function (personaId) {
    var all = scanned();
    var i;
    for (i = 0; i < all.length; i++) {
      if (all[i] && all[i].id === personaId) {
        return all[i];
      }
    }
    return (LENZLI.personas || {})[personaId] || null;
  };

  cred.utcDay = function (iso) {
    var parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || "");
    if (!parts) {
      return null;
    }
    return Date.UTC(Number(parts[1]), Number(parts[2]) - 1, Number(parts[3]));
  };

  /* Whole days from BUILD_DATE to the given date. Negative in the past — the
     surfaces test the sign rather than rendering it. */
  cred.daysFromBuild = function (iso) {
    var from = cred.utcDay(LENZLI.BUILD_DATE);
    var to = cred.utcDay(iso);
    if (from === null || to === null) {
      return null;
    }
    return Math.round((to - from) / 86400000);
  };

  /* --- The chip -------------------------------------------------------------
     Tier D returns null rather than an empty element: the deck appends only a
     truthy return (src/brand/namespace.js), so "no chip at all" is expressed by
     returning nothing at all. */

  LENZLI.renderChip = function (c) {
    if (!c || c.tier === "D") {
      return null;
    }

    var chip = document.createElement("button");
    var fact = document.createElement("span");

    chip.type = "button";
    chip.className = "cred-chip cred--" + c.tier.toLowerCase() + " is-" + c.status;
    chip.setAttribute("title", c.achievement.name);
    chip.setAttribute(
      "aria-label",
      c.achievement.name + ". " + verifierOf(c) + ". " + cred.statusWord(c.status) + "."
    );
    chip.addEventListener("click", function () {
      LENZLI.openWalletCard(c.id);
    });

    /* Fact 1 — the glyph and the short name. */
    fact.className = "cred-fact";
    fact.appendChild(cred.glyphSlot(c.status));
    fact.appendChild(part("cred-name", cred.shortName(c)));
    chip.appendChild(fact);

    /* Fact 2 — who says so. Fact 3 — the state, as a word. */
    chip.appendChild(part("cred-fact cred-verifier", verifierOf(c)));
    chip.appendChild(part("cred-fact cred-word", cred.statusWord(c.status)));

    return chip;
  };

  /* --- One credential at its earned chrome -----------------------------------
     The deck path renders tier D as nothing at all — buildDeck strips it,
     renderChip returns null above, pinOrder filters it out — so a surface with a
     single credential to show and no list to rank had no primitive to call, and
     SPEC § 10 forbids restating one. This is that primitive (SPEC § 3.1 E-8).

     It adds no class. .cred--a/.cred--b/.cred--c carry the tier chrome,
     .cred-entry carries the row's layout and radius, and .cred--d takes border,
     shadow, background and radius all away — that withholding is the whole of
     tier D's treatment (credentials.css). It is an exhibit and not a control:
     a draft credential belongs to no record yet, so the tap the wallet screen's
     own entry() carries would miss in openWalletCard and throw.

     Tier D carries the name and nothing else. Nobody issued it, so it has no
     verifier, no state and no check to report — the same three facts the wallet
     screen withholds from its self-reported list. */

  cred.renderTierRow = function (c) {
    var full;
    var word;
    var row;
    var head;

    if (!c || !c.tier) {
      return null;
    }

    full = (c.achievement && c.achievement.name) || "";
    row = document.createElement("div");
    row.className = "cred-entry cred--" + c.tier.toLowerCase();
    if (full) {
      row.setAttribute("title", full);
    }

    if (c.tier === "D") {
      row.appendChild(part("cred-plain", cred.fitName(full)));
      return row;
    }

    /* The word always leads and the glyph never stands in for it, so a
       credential whose status is not derived yet gets no head rather than a
       lone glyph. */
    word = cred.statusWord(c.status);
    if (word) {
      head = document.createElement("span");
      head.className = "cred-entry-head is-" + c.status;
      head.appendChild(cred.glyphSlot(c.status));
      head.appendChild(part("cred-entry-word", word));
      row.appendChild(head);
    }

    row.appendChild(part("cred-entry-name", cred.fitName(full)));

    /* The check line is composed from the fields its tier's sentence names, and
       tier C's sentence names none. A draft that has not reached them gets the
       row without the line, the way the wallet card omits an absent field —
       this row recompiles on every keystroke and must never throw mid-word. */
    if (c.tier === "C" || (c.verification && c.issuer)) {
      row.appendChild(part("cred-entry-check", cred.verificationLine(c)));
    }

    return row;
  };

  function part(cls, str) {
    var el = document.createElement("span");
    el.className = cls;
    el.textContent = str;
    return el;
  }
})(window);
