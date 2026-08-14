/* walletScreen.js — level 3 of the trust ladder: the wallet screen, and the
 * pin algorithm that decides what it shows first.
 *
 * Classic script (SPEC A3-9). Overwrites the openWalletScreen and pinOrder
 * stubs on load. The deck's "See all N" opens this surface; the legend at the
 * bottom of it is rendered through LENZLI.renderLegend and never restated here
 * (SPEC § 3.1).
 *
 * Three pinned, then "See all N" (SPEC § 4 D4). Three reads as curated
 * judgment; eight reads as a badge wall, which is the fatigue this design is
 * trying to escape (docs/research-credentials.md § F).
 */
(function (root) {
  "use strict";

  var LENZLI = root.LENZLI;
  var cred = LENZLI.cred;
  var PINNED = 3;

  /* --- The pin algorithm ----------------------------------------------------
     Ordering is an algorithm and not a preference: left to choose, people pin
     the prettiest. The five steps, literally (SPEC § 4 D4):

       1. requiredForRole — the job cannot legally be done without it;
       2. expiring within 90 days of BUILD_DATE — surfaced BECAUSE it expires,
          never hidden for it;
       3. tier A/B by validFrom, most recent first;
       4. tier C last;
       5. tier D never pinned — a self-reported entry leaves the ranking
          altogether and renders in the "Self-reported" list instead, which is
          where the wallet screen puts it.

     Step 3's recency rule doubles as the tiebreak inside every step, so the
     order is total and stable on any input. An expired credential keeps its
     place in the ranking: lapse-then-renew is a normal professional cycle, and
     dropping it silently is the trust leak. */

  LENZLI.pinOrder = function (credentials) {
    var ranked = (credentials || []).filter(function (c) {
      return c.tier !== "D";
    });
    return ranked.sort(function (a, b) {
      var step = rank(a) - rank(b);
      if (step !== 0) {
        return step;
      }
      return started(b) - started(a);
    });
  };

  function rank(c) {
    var daysLeft;
    if (c.requiredForRole) {
      return 0;
    }
    daysLeft = cred.daysFromBuild(c.validUntil);
    if (daysLeft !== null && daysLeft > 0 && daysLeft <= 90) {
      return 1;
    }
    if (c.tier === "A" || c.tier === "B") {
      return 2;
    }
    return 3;
  }

  function started(c) {
    var day = cred.utcDay(c.validFrom);
    return day === null ? 0 : day;
  }

  /* --- The screen -----------------------------------------------------------

     Opens on a record or on an id (SPEC § 3.1 E-7). A record is used as it
     stands, which is what lets a surface show the record it is already holding
     — an edited seed shows the edit, where resolving its id would have found
     the un-edited original and shown a stale credential list with no error.
     An id goes through the kit's lookup, which consults the store's set before
     LENZLI.personas; with no store installed that is today's lookup exactly,
     which is why the deck's "See all N" call site needs no change. */

  LENZLI.openWalletScreen = function (personaOrId) {
    var persona = resolve(personaOrId);
    var all;
    var pinned;
    var selfReported;
    var body;
    var rest;
    var legend;
    var expand;
    var i;

    if (!persona) {
      throw new Error("openWalletScreen: no persona with id " + personaOrId);
    }

    all = persona.credentials || [];
    pinned = LENZLI.pinOrder(all);
    selfReported = all.filter(function (c) {
      return c.tier === "D";
    });

    body = document.createElement("div");
    body.className = "wscreen";

    for (i = 0; i < pinned.length && i < PINNED; i++) {
      body.appendChild(entry(pinned[i]));
    }

    /* Everything past the pinned three, plus the self-reported list, sits
       behind one control. N counts the whole holding, the same count the
       deck's wallet teaser derives from credentials.length. */
    rest = document.createElement("div");
    rest.className = "wscreen-rest";
    rest.hidden = true;

    for (i = PINNED; i < pinned.length; i++) {
      rest.appendChild(entry(pinned[i]));
    }

    if (selfReported.length) {
      rest.appendChild(selfList(selfReported));
    }

    if (rest.childNodes.length) {
      expand = document.createElement("button");
      expand.type = "button";
      expand.className = "wscreen-more";
      expand.textContent = "See all " + all.length;
      expand.setAttribute("aria-expanded", "false");
      expand.addEventListener("click", function () {
        rest.hidden = !rest.hidden;
        expand.setAttribute("aria-expanded", rest.hidden ? "false" : "true");
        expand.textContent = rest.hidden
          ? "See all " + all.length
          : "Show the pinned " + Math.min(pinned.length, PINNED);
      });
      body.appendChild(expand);
    }

    body.appendChild(rest);

    /* Below the list: the legend. It is rendered through the legend file, never
       restated here. Appended only when it returns something, so a tree without
       legend.js shows the list rather than throwing. */
    legend = LENZLI.renderLegend();
    if (legend) {
      body.appendChild(legend);
    }

    return cred.sheet("Credentials", body);
  };

  function resolve(personaOrId) {
    if (personaOrId && typeof personaOrId === "object") {
      return personaOrId;
    }
    return cred.findPersona(personaOrId);
  }

  /* One ranked entry: a card at tier A/B, a muted card at tier C, and a tap
     into the wallet card in both cases. Expired and suspended entries stay in
     the list and say so — the status word is the marking. */
  function entry(c) {
    var button = document.createElement("button");
    var head = document.createElement("span");

    button.type = "button";
    button.className = "cred-entry cred--" + c.tier.toLowerCase();
    button.setAttribute("title", c.achievement.name);
    button.setAttribute(
      "aria-label",
      c.achievement.name + ". " + cred.verificationLine(c) + ". " +
      cred.statusWord(c.status) + "."
    );
    button.addEventListener("click", function () {
      LENZLI.openWalletCard(c.id);
    });

    head.className = "cred-entry-head is-" + c.status;
    head.appendChild(cred.glyphSlot(c.status));
    head.appendChild(part("cred-entry-word", cred.statusWord(c.status)));

    button.appendChild(head);
    button.appendChild(part("cred-entry-name", cred.fitName(c.achievement.name)));
    button.appendChild(part("cred-entry-check", cred.verificationLine(c)));
    return button;
  }

  /* Tier D: a plain text list under the ladder's own label for it. No card, no
     border, no shadow, no radius, no glyph and no status word — nobody issued
     these, so there is no state to report. The chrome is withheld in
     credentials.css; this list only supplies the words. */
  function selfList(entries) {
    var block = document.createElement("div");
    var heading = document.createElement("h3");
    var list = document.createElement("ul");

    block.className = "wscreen-self";
    heading.className = "wscreen-self-title";
    heading.textContent = "Self-reported";
    block.appendChild(heading);

    list.className = "wscreen-self-list";
    entries.forEach(function (c) {
      var item = document.createElement("li");
      item.className = "cred-plain cred--d";
      item.textContent = c.achievement.name;
      list.appendChild(item);
    });

    block.appendChild(list);
    return block;
  }

  function part(cls, str) {
    var el = document.createElement("span");
    el.className = cls;
    el.textContent = str;
    return el;
  }
})(window);
