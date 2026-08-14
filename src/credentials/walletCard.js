/* walletCard.js — level 2 of the trust ladder: the wallet card, a sheet over
 * the deck, and the mock result sheet its one action opens.
 *
 * Classic script (SPEC A3-9). Overwrites the openWalletCard and openVerifySheet
 * stubs on load, and adds the sheet machinery the wallet screen reuses.
 *
 * The card emits ten fields in one fixed order. SPEC § 4 D4 states that order
 * and M-10 reads it back out of this file's source, so the ten are written
 * top to bottom in it inside openWalletCard, every helper they call is defined
 * BELOW them, and nothing above the field block names a field.
 *
 * Tier D never opens a card: the ladder gives a self-reported entry a plain
 * text row and nothing else (SPEC § 4 D4 tier table).
 */
(function (root) {
  "use strict";

  var LENZLI = root.LENZLI;
  var cred = LENZLI.cred;

  /* Every sheet currently mounted, innermost last. cred.closeSheet unmounts
     them, so a surface opened over one deck cannot survive a persona switch. */
  var mounted = [];

  /* --- The sheet ------------------------------------------------------------
     One overlay mechanic for every credential surface (SPEC A3-13): it takes
     focus, traps Tab inside itself, closes on Esc or on its own Close button,
     and hands focus back to whatever opened it. Sheets stack — opening a card
     from the wallet screen leaves the screen underneath, and Esc closes only
     the sheet that holds focus.

     It mounts into #stage when the shell is on the page, because reel.html's
     mount contract puts everything inside the stage, and into <body> otherwise
     so a surface still opens when it is exercised outside the shell.

     A caller may name its own host instead (SPEC § 3.1 E-6). app.html has no
     #stage, so without this every sheet the app opens would mount at the
     document root, outside the surface that opened it, and survive that
     surface's teardown. Absent a host the chain is the one above, unchanged,
     which is why reel.html is unaffected. */

  cred.sheet = function (heading, contents, host) {
    var returnTo = document.activeElement;
    var into = host || document.getElementById("stage") || document.body;
    var overlay = document.createElement("div");
    var panel = document.createElement("div");
    var bar = document.createElement("div");
    var title = document.createElement("h2");
    var close = document.createElement("button");

    overlay.className = "cred-sheet";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", heading);

    panel.className = "cred-sheet-panel";
    panel.setAttribute("tabindex", "-1");

    bar.className = "cred-sheet-bar";
    title.className = "cred-sheet-title";
    title.setAttribute("tabindex", "-1");
    title.textContent = heading;
    close.type = "button";
    close.className = "cred-sheet-close";
    close.textContent = "Close";

    bar.appendChild(title);
    bar.appendChild(close);
    panel.appendChild(bar);
    panel.appendChild(contents);
    overlay.appendChild(panel);
    into.appendChild(overlay);
    mounted.push(overlay);

    function shut() {
      var at = mounted.indexOf(overlay);
      if (at !== -1) {
        mounted.splice(at, 1);
      }
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
      if (returnTo && typeof returnTo.focus === "function") {
        returnTo.focus();
      }
    }

    function reachable() {
      var all = panel.querySelectorAll("button, summary, [tabindex]:not([tabindex='-1'])");
      return Array.prototype.filter.call(all, function (el) {
        return !el.hidden && el.offsetParent !== null;
      });
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
      /* src/deck/nav.js listens for these on the document. While this sheet is
         open they belong to it, so the reel behind it does not move. */
      if (["ArrowRight", "ArrowLeft", "Home", "End"].indexOf(ev.key) !== -1) {
        ev.stopPropagation();
        return;
      }
      if (ev.key !== "Tab") {
        return;
      }
      stops = reachable();
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

    close.addEventListener("click", shut);
    title.focus();

    return { element: overlay, close: shut };
  };

  /* Unmount whatever is open and leave focus exactly where it is — the caller
     that swaps decks keeps the focus it already holds, so no sheet hands it
     back. A no-op when nothing is open. */
  cred.closeSheet = function () {
    var overlay;
    while (mounted.length) {
      overlay = mounted.pop();
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
    }
  };

  /* --- Level 2: the wallet card --------------------------------------------- */

  LENZLI.openWalletCard = function (credId) {
    var found = cred.find(credId);
    var c;
    var body;
    var head;
    var named;
    var granted;
    var issuedTo;
    var span;
    var daysLeft;
    var action;

    if (!found) {
      throw new Error("openWalletCard: no credential with id " + credId);
    }
    c = found.cred;
    if (c.tier === "D") {
      console.info(
        "openWalletCard: " + credId + " is tier D. A self-reported entry gets a " +
        "plain text row and no card."
      );
      return null;
    }

    body = document.createElement("div");
    body.className = "wcard cred--" + c.tier.toLowerCase();

    /* 1 — The status word. It leads the card, it is always the word, and the
       glyph sits beside it — never the glyph on its own. */
    head = row("wcard-status is-" + c.status);
    head.appendChild(cred.glyphSlot(c.status));
    head.appendChild(part("wcard-word", cred.statusWord(c.status)));
    body.appendChild(head);

    /* 2 — The line that names who checked it and how fresh the check is. This
       is the honesty field; the kit composes it per tier. */
    body.appendChild(text("wcard-check", cred.verificationLine(c)));

    /* 3 — The name exactly as granted: never paraphrased, never prettified.
       About 30 characters on the front, with the whole string kept on the
       title attribute so nothing is silently truncated away. */
    named = text("wcard-name", cred.fitName(c.achievement.name));
    named.setAttribute("title", c.achievement.name);
    body.appendChild(named);

    /* 4 — The legal body that granted it, with its own short text mark. Never
       our mark: this build mints no verification mark of its own. */
    granted = row("wcard-issuer");
    granted.appendChild(part("wcard-org", c.issuer.name));
    granted.appendChild(part("wcard-mark", c.issuer.mark));
    body.appendChild(granted);

    /* 5 — The issuer-type tag: the field that answers "is this a real thing?".
       A government registry and a training provider must not read as peers. */
    body.appendChild(text("wcard-tag", c.issuer.type));

    /* 6 — The holder name as issued, when there is one, and when it differs from
       the profile name the card says so rather than hiding it: a mismatch is
       information.

       COMPOSED FROM PRESENT FIELDS ONLY, the way recordBlock below is. The name
       is optional on the record and absent on every credential whose author left
       the box empty, and the line was built by concatenation — so it printed the
       literal "Issued to null", and the mismatch note beneath it then compared
       that absence against the profile name and declared a difference. Nothing
       was issued under a name nobody gave; the honest rendering is silence. */
    issuedTo = c.credentialSubject.holderName;
    if (issuedTo) {
      body.appendChild(text("wcard-holder", "Issued to " + issuedTo));
      if (!sameName(issuedTo, found.persona.identity.name)) {
        body.appendChild(text(
          "wcard-note",
          "The profile reads " + found.persona.identity.name +
          ". The record keeps the name it was issued under."
        ));
      }
    }

    /* 7 — Valid from and valid until, in the granting body's own phrasing. Also
       present-fields-only: tier C carries validFrom: null by construction
       (shapes.js), which the old concatenation printed as "Active since null" on
       every tier-C credential in the corpus. "No stated expiry" is a statement
       ABOUT a span, so it rides only where a start date gives it one; a
       credential with neither date renders no date line at all. */
    span = [];
    if (c.validFrom) {
      span.push("Active since " + c.validFrom);
    }
    if (c.validUntil) {
      span.push("Expires on " + c.validUntil);
    } else if (c.validFrom) {
      span.push("No stated expiry");
    }
    if (span.length) {
      body.appendChild(text("wcard-dates", span.join(" / ")));
    }

    /* 8 — Renewal urgency, future-dated only: rendered when the end date is
       after BUILD_DATE and inside six months of it, computed against
       BUILD_DATE and never the clock. Omitted otherwise — the Expired word
       already carries that fact, and a countdown is never rendered negative. */
    daysLeft = cred.daysFromBuild(c.validUntil);
    if (daysLeft !== null && daysLeft > 0 && insideSixMonths(c.validUntil)) {
      body.appendChild(text("wcard-urgency", "Expires in " + daysLeft + " days"));
    }

    /* 9 — The credential ID: small, monospace, display only. It is what a human
       types into the registry's own box. Tap-to-copy was cut, because the
       clipboard is restricted on file:// origins. */
    if (c.credentialId) {
      body.appendChild(text("wcard-id mono", c.credentialId));
    }

    /* 10 — The verify action, labelled with the destination it names. It opens
       an in-app mock result sheet and does nothing else: no link, no second
       window, no network call of any kind (SPEC A3-15). Tier C has no result to
       open, because no check ever ran, so it gets the page host as plain text
       instead of an action that would imply one had. */
    if (c.verification) {
      action = document.createElement("button");
      action.type = "button";
      action.className = "wcard-verify";
      action.textContent = "Verify at " + c.verification.destination;
      action.addEventListener("click", function () {
        LENZLI.openVerifySheet(c.id);
      });
      body.appendChild(action);
    } else if (c.evidenceUrl) {
      body.appendChild(text(
        "wcard-link",
        "Issuer page " + c.evidenceUrl +
        " — this prototype does not open it, and nothing was checked."
      ));
    }

    /* Expanded: the record, not the pitch. */
    body.appendChild(recordBlock(c));

    return cred.sheet("Credential", body);
  };

  /* --- The mock result sheet ------------------------------------------------
     What the destination would answer, in the destination's own vocabulary. It
     can legitimately disagree with our status word — an "expiring" credential
     still reads "Active" at the registry, because "expiring" is our derived
     state and not one any registry reports — so the five facts are rendered
     verbatim and reconciled nowhere. */

  LENZLI.openVerifySheet = function (credId) {
    var found = cred.find(credId);
    var c;
    var check;
    var body;
    var facts;

    if (!found) {
      throw new Error("openVerifySheet: no credential with id " + credId);
    }
    c = found.cred;
    check = c.verification;
    if (!check) {
      console.info(
        "openVerifySheet: " + credId + " was never checked. Tier " + c.tier +
        " has no result to show."
      );
      return null;
    }

    body = document.createElement("div");
    body.className = "vsheet";
    body.appendChild(text("vsheet-dest", "What " + check.destination + " returns"));

    facts = [
      ["Status", check.mockResult.status],
      ["Credential", check.mockResult.credential],
      ["Holder", check.mockResult.holder],
      ["Active since", check.mockResult.activeSince],
      ["Expires on", check.mockResult.expiresOn]
    ];
    facts.forEach(function (pair) {
      var line = row("vsheet-fact");
      line.appendChild(part("vsheet-key", pair[0]));
      line.appendChild(part("vsheet-val", pair[1]));
      body.appendChild(line);
    });

    /* The kit's own spelling of the freshness, not a second one: this sheet and
       the wallet card's check line make the same claim, and "checked 0 days ago"
       here while the card reads "checked today" is the guard-vs-mirror
       divergence in miniature (chip.js owns the wording). */
    body.appendChild(text("vsheet-fresh", cred.freshness(check.checkedDaysAgo)));
    body.appendChild(text("vsheet-mock", "mocked — this prototype makes no network calls"));

    return cred.sheet("Verification result", body);
  };

  /* --- Helpers, below the field block by contract ---------------------------- */

  function row(cls) {
    var el = document.createElement("div");
    el.className = cls;
    return el;
  }

  function part(cls, str) {
    var el = document.createElement("span");
    el.className = cls;
    el.textContent = str;
    return el;
  }

  function text(cls, str) {
    var el = document.createElement("p");
    el.className = cls;
    el.textContent = str;
    return el;
  }

  /* Six calendar months on from BUILD_DATE, computed against BUILD_DATE. */
  function insideSixMonths(iso) {
    var parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(LENZLI.BUILD_DATE);
    var edge = Date.UTC(Number(parts[1]), Number(parts[2]) - 1 + 6, Number(parts[3]));
    var end = cred.utcDay(iso);
    return end !== null && end <= edge;
  }

  /* Two spellings of one person, or two different people. A middle initial, and
     a credential suffix on the profile side, are formatting rather than another
     name — normalizing them away keeps the note for a real difference, which is
     the only case where it carries information. */
  function sameName(issued, profile) {
    var stated = String(profile || "").toLowerCase();
    return plainName(stated.replace(/,\s*(rn|md|np|pa|cpa|pe|esq)\.?$/i, "")) ===
      plainName(String(issued || "").toLowerCase());
  }

  /* Lowercased already: middle initials dropped, whitespace collapsed. */
  function plainName(lowered) {
    return lowered.split(/\s+/).filter(function (word) {
      return word && !/^[a-z]\.?$/.test(word);
    }).join(" ");
  }

  /* The record behind a details affordance: the fields a real checker reads,
     ending in the raw machine record. Issuer-asserted skills only, capped at
     three — self-added tags would turn the card into another self-attestation
     surface. Absent fields are omitted rather than shown empty. */
  function recordBlock(c) {
    var wrap = document.createElement("details");
    var summary = document.createElement("summary");
    var raw = document.createElement("pre");
    var skills = (c.achievement.skills || []).slice(0, 3);

    wrap.className = "wcard-record";
    summary.textContent = "Details — the record, not the pitch";
    wrap.appendChild(summary);

    if (c.achievement.criteria) {
      wrap.appendChild(pair("Criteria", c.achievement.criteria));
    }
    if (c.renewal) {
      wrap.appendChild(pair("Renewal", c.renewal));
    }
    if (skills.length) {
      wrap.appendChild(pair("Skills the issuer asserts", skills.join(" · ")));
    }
    if (c.scope) {
      wrap.appendChild(pair("Scope", c.scope));
    }
    if (c.discipline) {
      wrap.appendChild(pair("Disciplinary status", c.discipline));
    }

    raw.className = "wcard-raw mono";
    raw.textContent = JSON.stringify(c, null, 2);
    wrap.appendChild(pair("Raw record", ""));
    wrap.appendChild(raw);
    return wrap;
  }

  function pair(key, value) {
    var line = row("wcard-pair");
    line.appendChild(part("wcard-key", key));
    if (value) {
      line.appendChild(part("wcard-value", value));
    }
    return line;
  }
})(window);
