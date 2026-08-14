/*
 * src/owner/owner.js — the owner's workbench at #/me.
 *
 * Classic script (SPEC A3-9). Registers itself with the router as "owner" at
 * load (SPEC § 3.4, ledger V2-14); this file holds no manifest, and no later
 * order edits src/app/.
 *
 * THE OWNER'S WORKBENCH, NOT A VIEWER SURFACE (SPEC § 4 D8). The evidence is
 * unusually direct here: employers uniformly report they will not open somebody
 * else's credential wallet, even when access is shared. So everything a viewer
 * needs has already been pushed into the reel and the credential card, and this
 * screen is left to do the one job nobody else can do — let the person who owns
 * the record look at what is published, change it, leave with it, or clear it.
 * Nothing on it is addressed to an audience.
 *
 * NEVER A SILENTLY INVENTED "YOU" (SPEC A1-19, § 5.1 B assertion 27). On a first
 * open the store is empty and there is no owner, so this renders an empty
 * workbench that names nobody: one primary action to make a reel, and one
 * clearly labelled secondary that adopts a sample record only when it is
 * pressed. F-6 obliges this prototype to say its people are invented, and
 * adopting one by itself would make the screen lie about whose profile is on it.
 * The empty state therefore carries no person's name at all — the sample is
 * named the moment it is adopted, and not one moment earlier.
 *
 * THE FALLBACK HAS NO CLOCK (SPEC § 3.4.1 M3). LENZLI.records.me() is the whole
 * rule and this file calls it rather than restating it: the stored id, else the
 * single user record if there is exactly one, else null. Never insertion order,
 * which is an implementation detail masquerading as a rule, and never a clock,
 * which F-7 forbids and the schema could not support anyway. null is the empty
 * workbench, not an error.
 *
 * ORDERING IS ALGORITHMIC AND THERE IS NO HANDLE TO DRAG (SPEC F-13). The
 * credential list is LENZLI.pinOrder(credentials) — called, never restated:
 * required for the role first, then anything expiring within 90 days of
 * BUILD_DATE, then tier A/B by recency, then tier C. Left to sort by hand people
 * pin the prettiest, which is the mechanism that produces badge inflation.
 * Expiring is surfaced BECAUSE it is expiring and the row says so in those
 * words; expired stays in the list and is marked, because quietly dropping a
 * lapsed credential is a trust leak the moment anybody notices.
 *
 * NOTHING HERE COUNTS ANYBODY (SPEC F-14, AM-16). No meter, no score, no tally,
 * no per-viewer record of any kind, no "seen" state. These are the first three
 * things a product manager adds and they are separately forbidden by the
 * evidence. The only numbers on this surface are a card count, a credential
 * count and a day count, and not one of them grades the person.
 *
 * EXPORT IS STRUCTURAL, NOT A SETTINGS-PAGE ITEM (SPEC F-15, A1-17). This
 * audience is measurably allergic to renting an identity, so leaving with the
 * record is a first-class block on the surface. The <pre> IS the export: it
 * holds the whole record and can be selected by hand at any origin. Copy is an
 * ATTEMPT — the clipboard at a file:// origin is unmeasured, and running this
 * build is what measures it — and the download is a second attempt. Both fail
 * into the <pre>, and both say what happened. There is exactly ONE export
 * implementation, LENZLI.records.export(id) (SPEC § 3.4.1 M10); src/owner/
 * export.js was cut and is authored by no order, which is why app.html carries
 * no tag for it.
 *
 * ONE EDITING ROUTE, AND IT NAMES NO STEP (SPEC § 3.4.1 M8). Every control that
 * changes anything goes to #/create/<id> through LENZLI.router.go. The route
 * table allows no step segment and no query string, and the create surface opens
 * on the beat the draft last touched. The credential sub-flow belongs to D7b and
 * is never duplicated here.
 *
 * THE MOUNT CONTRACT this surface satisfies for createDeck (SPEC § 3.1, M5, M12):
 *   [data-deck-mount]          .own-deck, the box compiled cards mount into
 *   [data-deck-progress]       .own-progress, the segmented index
 *   [data-deck-overlay-host]   .own-stage, where the grid overlay mounts (M5)
 *   [data-slot=name|niche|availability]
 *                              the persistent identity band (M12) — without
 *                              these three the reel ships an empty identity
 *                              band, because no app surface calls showPersona
 * The container handed to createDeck is the reel block, so all four resolve
 * scoped to it and nothing is looked up by document id.
 *
 * THE CREDENTIAL CONTROLS ARE LIVE HERE, AND THAT IS THE POINT. The create
 * surface has to make its preview's chips inert, because a draft belongs to no
 * record and openWalletCard throws on a credential it cannot find. This surface
 * only ever shows a record read back out of the store, so every chip resolves
 * through the E-7 lookup, and "See all N" is handed the RECORD itself rather
 * than its id — which is what makes an edited seed show its edit instead of the
 * untouched original underneath it.
 *
 * NO CLOCK, NO SCHEDULER, NO NETWORK (SPEC § 10, A1-22, F-7). Day counts come
 * from LENZLI.cred.daysFromBuild, which measures against LENZLI.BUILD_DATE.
 * Reset goes through LENZLI.router.go("/") and never reloads the document.
 */
(function (root) {
  "use strict";

  var LENZLI = root.LENZLI;

  if (!LENZLI || !LENZLI.router || !LENZLI.records) {
    throw new Error(
      "src/owner/owner.js: window.LENZLI.router or .records is missing. src/brand/namespace.js must load first."
    );
  }

  var records = LENZLI.records;

  /* pinOrder's second ranking step uses a 90-day window (walletScreen.js). The
     row's own note has to name the same number, so it is named once here rather
     than written twice in prose. */
  var EXPIRING_DAYS = 90;

  /* Mounted state. One surface is mounted at a time — the router guarantees it —
     so these handles are the whole lifetime, and teardown() clears every one. */
  var host = null;
  var mounted = null;
  var deck = null;
  var exportPre = null;
  var saidLine = null;
  var resetControls = null;
  var confirmBtn = null;
  var blobUrl = null;

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

  /* "1 card" and "6 cards" — every count on this surface reads as copy, and
     "All 1 cards" would be the tell that a number was pasted into a sentence. */
  function plural(count, word) {
    return count + " " + word + (count === 1 ? "" : "s");
  }

  /* The result line beside the export controls. § 3.1 gives LENZLI.app.notice
     the app chrome for degraded conditions; this line is a different thing — the
     immediate result of the control the reader just pressed, including the
     verbatim "press ⌘C" instruction § 4 D8 requires, which would be useless in a
     band at the top of the window away from the block it is talking about. */
  function say(text) {
    if (saidLine) {
      saidLine.textContent = text || "";
    }
  }

  function blockHead(title, note) {
    var head = make("div", "own-block-head");
    head.appendChild(make("h2", "own-block-title", title));
    if (note) {
      head.appendChild(make("p", "own-block-note", note));
    }
    return head;
  }

  /* The one editing route (SPEC § 3.4.1 M8). No step segment and no query
     string: the route table allows neither, so #/me hands the whole record to
     the create surface and that surface opens on the beat the draft last
     touched. Adding, editing and removing a credential all land here. */
  function goEdit(id) {
    LENZLI.router.go("/create/" + id);
  }

  /* --- the empty workbench (A1-19) ---------------------------------------- */

  /* WHICH sample record the secondary adopts. § 4 D8 says "a seeded record" and
     names none, and the choice is not cosmetic: the centre of this workbench is
     the ranked credential list, and a sample carrying one credential
     demonstrates no ranking at all. So the sample is the seeded person with the
     most credentials to rank — a rule rather than a name, so no persona id is
     pinned into this surface and a corpus change cannot leave it pointing at a
     record that is gone. Ties fall to the corpus's declared order, which
     records.all() is stable on. Read through records.*, never through
     LENZLI.personas (E-7's binding line). */
  function sampleSeed() {
    var best = null;
    var bestCount = -1;

    records.all().forEach(function (record) {
      var count;

      if (!record || !records.isSeed(record.id)) {
        return;
      }
      count = (record.credentials || []).length;
      if (count > bestCount) {
        best = record;
        bestCount = count;
      }
    });

    return best;
  }

  function adoptSample() {
    var seed = sampleSeed();

    if (!seed) {
      LENZLI.app.notice(
        "No sample profile is available — the invented people this prototype ships with did not load."
      );
      return;
    }

    /* setMe refuses an id that does not resolve and says so on the console, so a
       failed adoption never leaves the screen claiming an owner it does not
       have. */
    if (records.setMe(seed.id)) {
      render(true);
    }
  }

  /* EXACTLY TWO CONTROLS, and neither of them names anybody (assertion 27). A
     third control here would be the drift A1-19 exists to prevent: the empty
     workbench is a statement that nothing has been made yet, not a lobby. */
  function mountEmpty(hostNode) {
    var section = make("section", "own-surface own-empty");
    var head = make("div", "own-head");
    var h1 = make("h1", "own-title display", "Your workbench");
    var actions = make("div", "own-actions");
    var create = button("ctl own-ctl own-ctl--primary", "Create your reel");
    var sample = button("ctl own-ctl", "Preview with a sample profile");

    section.setAttribute("data-own-empty", "");

    h1.setAttribute("tabindex", "-1");
    head.appendChild(h1);
    head.appendChild(make("p", "own-lede",
      "Nothing has been published from this machine, so there is no profile to " +
        "manage here yet. This screen does not guess at an owner."));
    section.appendChild(head);

    create.setAttribute("data-own-create", "");
    create.addEventListener("click", function () {
      LENZLI.router.go("/create");
    });
    actions.appendChild(create);

    sample.setAttribute("data-own-sample", "");
    sample.addEventListener("click", adoptSample);
    actions.appendChild(sample);

    section.appendChild(actions);
    section.appendChild(make("p", "own-note",
      "The sample is one of the invented people this prototype ships with, " +
        "borrowed so the workbench has something to show. Adopting one is a " +
        "press and never a default, and the reset control on the adopted " +
        "workbench puts this screen back to empty."));

    hostNode.appendChild(section);
    return section;
  }

  /* --- the owner's reel --------------------------------------------------- */

  /* The persistent identity band (sibling ruling D3, SPEC § 3.4.1 M12).
     createDeck fills these three [data-slot] nodes from the record it renders,
     scoped to its own container. The surface's <h1> is NOT one of them: this
     screen's heading is the workbench, not the person, and the empty state has
     to carry a real focusable heading with no name in it. */
  function identityBand() {
    var band = make("div", "own-identity");
    var text = make("div", "own-identity-text");
    var name = make("span", "own-name");
    var niche = make("span", "own-niche");
    var avail = make("span", "own-avail");
    var dot = make("span", "own-avail-dot");
    var availText = make("span", "own-avail-text");

    dot.setAttribute("aria-hidden", "true");

    text.appendChild(slot(name, "name"));
    text.appendChild(slot(niche, "niche"));
    avail.appendChild(dot);
    avail.appendChild(slot(availText, "availability"));

    band.appendChild(text);
    band.appendChild(avail);
    return band;
  }

  function reelBlock(record) {
    var block = make("section", "own-block own-reel");
    var box = make("div", "own-stage");
    var progress = make("div", "own-progress");
    var deckMount = make("div", "own-deck");
    var controls = make("div", "own-controls");
    var edit = button("ctl own-ctl own-ctl--primary", "Edit this reel");
    var all = button("ctl own-ctl");
    var cards;

    block.setAttribute("data-own-reel", "");
    box.setAttribute("data-deck-overlay-host", "");
    progress.setAttribute("data-deck-progress", "");
    progress.setAttribute("aria-label", "Cards");
    deckMount.setAttribute("data-deck-mount", "");

    block.appendChild(blockHead("Your reel",
      "What anybody who opens your link sees, drawn by the same code they will " +
        "run. Nothing about this screen changes it."));

    box.appendChild(progress);
    box.appendChild(identityBand());
    box.appendChild(deckMount);
    block.appendChild(box);

    /* One compile, two consumers: the deck is given these cards and the escape
       control counts the same array, so the two can never disagree. buildDeck is
       deliberately NOT wrapped in a try/catch — a record that does not compile
       is an authoring defect, and a swallowed compile error would render a
       shorter reel that looks like a design choice (§ 10). */
    cards = LENZLI.buildDeck(record);
    all.textContent = "All " + plural(cards.length, "card");

    edit.setAttribute("data-own-edit", "");
    edit.addEventListener("click", function () {
      goEdit(record.id);
    });
    controls.appendChild(edit);

    all.setAttribute("data-own-all", "");
    all.addEventListener("click", function () {
      deck.openGrid();
    });
    controls.appendChild(all);
    block.appendChild(controls);

    return { block: block, cards: cards };
  }

  /* --- the credential list (F-13) ----------------------------------------- */

  /* Why a credential sits where it sits, in the row's own words. This is the
     honest half of an algorithmic order: a list nobody can drag has to say what
     put each line where, or it reads as arbitrary. Every day count comes from
     cred.daysFromBuild, which measures against BUILD_DATE and never a clock. */
  function rankNote(c) {
    var parts = [];
    var days = LENZLI.cred.daysFromBuild(c.validUntil);

    if (c.requiredForRole) {
      parts.push("Required for the role, which is what ranks it first.");
    }

    if (days !== null) {
      if (days > 0 && days <= EXPIRING_DAYS) {
        parts.push(
          "Expires in " + plural(days, "day") + " — surfaced here because it is " +
            "expiring, not because it is the strongest one you hold."
        );
      } else if (days === 0) {
        parts.push(
          "Expires today — surfaced here because it is expiring, not because it " +
            "is the strongest one you hold."
        );
      } else if (days < 0) {
        parts.push(
          "Expired " + plural(-days, "day") + " ago. Still listed and still " +
            "marked: a lapsed credential is never quietly dropped."
        );
      }
    }

    return parts.length ? parts.join(" ") : null;
  }

  /* One row: the engine's own tier chrome, plus the ranking note under it. The
     row itself is LENZLI.cred.renderTierRow — the primitive wave 0 added for
     exactly this, which renders one credential at its earned chrome across all
     four tiers. § 10 forbids restating it. */
  function credRow(c) {
    var row = make("div", "own-cred");
    var body = LENZLI.cred.renderTierRow(c);
    var note = rankNote(c);

    if (!body) {
      return null;
    }
    row.appendChild(body);
    if (note) {
      row.appendChild(make("p", "own-cred-note", note));
    }
    return row;
  }

  function credBlock(record) {
    var block = make("section", "own-block own-creds");
    var all = record.credentials || [];
    var list = make("div", "own-cred-list");
    var controls = make("div", "own-controls");
    var manage = button("ctl own-ctl", "Add or edit credentials");
    var ranked;
    var selfReported;
    var selfBox;
    var seeAll;

    block.setAttribute("data-own-creds", "");
    block.appendChild(blockHead("Credentials",
      "Ordered by the pin algorithm, not by preference: required for the role " +
        "first, then anything expiring inside " + EXPIRING_DAYS + " days, then " +
        "registry-verifiable by recency, then issuer-linked. There is no handle " +
        "to drag, on purpose — sorting these by hand means sorting by prettiest."));

    /* pinOrder is the algorithm, called and never restated. It filters tier D
       out and copies before sorting, so the record's own array is untouched. The
       || [] is for a tree where src/credentials/ has not landed and the
       namespace stub answers instead. */
    ranked = LENZLI.pinOrder(all) || [];
    selfReported = all.filter(function (c) {
      return c && c.tier === "D";
    });

    if (!all.length) {
      list.appendChild(make("p", "own-note",
        "No credentials on this record yet. They are added in the same editor " +
          "the reel uses."));
    }

    ranked.forEach(function (c) {
      var row = credRow(c);
      if (row) {
        list.appendChild(row);
      }
    });

    /* The wallet screen's own split (walletScreen.js): nobody issued a tier-D
       entry, so it leaves the ranking altogether rather than being scored
       against credentials that were checked. It is still listed — it is still
       the owner's — and it still says what it is. */
    if (selfReported.length) {
      selfBox = make("div", "own-self");
      selfBox.appendChild(make("h3", "own-self-title", "Self-reported"));
      selfReported.forEach(function (c) {
        var row = LENZLI.cred.renderTierRow(c);
        if (row) {
          selfBox.appendChild(row);
        }
      });
      selfBox.appendChild(make("p", "own-cred-note",
        "Nobody issued these, so the ranking leaves them out and they carry no " +
          "state to report. They are still yours and still shown."));
      list.appendChild(selfBox);
    }

    block.appendChild(list);

    /* Handed the RECORD and not its id (E-7). Both work — the kit's lookup
       consults the store before LENZLI.personas — but the record is the reading
       that cannot go stale: an edited seed shows the edit, where resolving the
       id a second time is the silent-wrong case the audit found. */
    if (all.length) {
      seeAll = button("ctl own-ctl", "See all " + all.length);
      seeAll.setAttribute("data-own-seeall", "");
      seeAll.addEventListener("click", function () {
        LENZLI.openWalletScreen(record);
      });
      controls.appendChild(seeAll);
    }

    manage.setAttribute("data-own-manage", "");
    manage.addEventListener("click", function () {
      goEdit(record.id);
    });
    controls.appendChild(manage);
    block.appendChild(controls);

    block.appendChild(make("p", "own-note",
      "Adding, changing and removing a credential all happen in the editor — " +
        "there is no second credential screen, and the ladder is taught in one " +
        "place only."));

    return block;
  }

  /* --- export (F-15, A1-17) ------------------------------------------------ */

  /* The fallback the whole block rests on, and the reason the clipboard is never
     load-bearing: selecting text is something every browser can do at every
     origin, measured or not. */
  function selectExport() {
    var selection = root.getSelection ? root.getSelection() : null;
    var range;

    if (!selection || !exportPre) {
      say("Select the record above and copy it.");
      return;
    }

    range = document.createRange();
    range.selectNodeContents(exportPre);
    selection.removeAllRanges();
    selection.addRange(range);
    say("select-all done — press ⌘C");
  }

  /* A1-17, and the measurement itself. navigator.clipboard at a file:// origin
     is unmeasured, so nothing here may depend on it. There are three ways the
     attempt can fail and all three land in the same place: absent, throwing
     where it stands, and rejecting later. The <pre> above is the export in every
     one of them. */
  function copyExport() {
    var clip = root.navigator && root.navigator.clipboard;
    var text = exportPre ? exportPre.textContent : "";
    var attempt;

    if (!clip || typeof clip.writeText !== "function") {
      selectExport();
      return;
    }

    try {
      attempt = clip.writeText(text);
    } catch (err) {
      console.warn(
        "LENZLI.owner: the clipboard refused the copy, so the record was selected instead.",
        err
      );
      selectExport();
      return;
    }

    if (!attempt || typeof attempt.then !== "function") {
      say("Copied — the whole record is on the clipboard.");
      return;
    }

    attempt.then(function () {
      say("Copied — the whole record is on the clipboard.");
    }, function (err) {
      console.warn(
        "LENZLI.owner: the clipboard refused the copy, so the record was selected instead.",
        err
      );
      selectExport();
    });
  }

  /* The object URL is released on the next download and again at teardown,
     rather than after a delay: there is no scheduler in this build (A1-22), and
     releasing it inside the same task as the click can cancel the download it
     was made for. */
  function releaseUrl() {
    if (!blobUrl) {
      return;
    }
    try {
      root.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.warn("LENZLI.owner: the download URL could not be released.", err);
    }
    blobUrl = null;
  }

  /* A Blob URL and a synthetic <a download>. URL.createObjectURL is measured
     available at file:// (§ 10); the download itself is not, and a browser may
     refuse it. If either step fails the surface says so and the block above is
     still the export — which is the whole of A1-17's shape. No upload, no data
     URI, no second window (A1-16). */
  function downloadExport(record) {
    var text = exportPre ? exportPre.textContent : "";
    var link;

    releaseUrl();

    try {
      blobUrl = root.URL.createObjectURL(
        new root.Blob([text], { type: "application/json" })
      );
    } catch (err) {
      console.warn("LENZLI.owner: this browser would not build a download for the record.", err);
      say("This browser would not build a download. The record above is still " +
        "the export — select it and copy it.");
      return;
    }

    link = make("a", "own-download");
    link.href = blobUrl;
    link.download = record.id + ".json";
    link.setAttribute("aria-hidden", "true");
    link.setAttribute("tabindex", "-1");

    try {
      if (mounted) {
        mounted.appendChild(link);
      }
      link.click();
      say("Download sent to the browser as " + record.id + ".json. If it was " +
        "blocked, the record above is still the export.");
    } catch (err) {
      console.warn("LENZLI.owner: this browser refused the download.", err);
      say("This browser refused the download. The record above is still the " +
        "export — select it and copy it.");
    }

    if (link.parentNode) {
      link.parentNode.removeChild(link);
    }
  }

  /* The id the export region borrows its accessible name from. A literal rather
     than a generated one: this block mounts at most once per render, and a
     stable id is what makes the aria-labelledby edge readable in the markup. */
  var EXPORT_HEAD_ID = "own-export-head";

  function exportBlock(record) {
    var block = make("section", "own-block own-export");
    var head = blockHead("Export",
      "The whole record, exactly as it is stored. Leaving with it is meant to " +
        "be as easy as making it, so the record is printed here rather than " +
        "hidden behind a settings page — this block is the export, and the two " +
        "controls under it are conveniences on top of it.");
    var controls = make("div", "own-controls");
    var copy = button("ctl own-ctl own-ctl--primary", "Copy");
    var down = button("ctl own-ctl", "Download .json");
    var text = records.export(record.id);

    block.setAttribute("data-own-export-block", "");
    head.querySelector(".own-block-title").id = EXPORT_HEAD_ID;
    block.appendChild(head);

    /* The landed idiom for a selectable pretty-printed record (about.js:297).
       tabindex makes the scroller reachable from the keyboard; it is a region to
       read, not a control, and it carries no handler.

       LABELLED, because a tab stop with no role and no accessible name is a
       place the keyboard stops and the screen reader says nothing about — the
       reader is dropped into several hundred characters of JSON with no idea
       what they have arrived at. role="region" is what a named scrollable area
       is, and aria-labelledby points at this block's own heading so there is one
       string on the screen and not a second one only some readers hear. */
    exportPre = make("pre", "own-record mono", text === null ? "" : text);
    exportPre.setAttribute("data-own-export", "");
    exportPre.setAttribute("tabindex", "0");
    exportPre.setAttribute("role", "region");
    exportPre.setAttribute("aria-labelledby", EXPORT_HEAD_ID);
    block.appendChild(exportPre);

    copy.setAttribute("data-own-copy", "");
    copy.addEventListener("click", copyExport);
    controls.appendChild(copy);

    down.setAttribute("data-own-download", "");
    down.addEventListener("click", function () {
      downloadExport(record);
    });
    controls.appendChild(down);
    block.appendChild(controls);

    /* The same shape create.js gives its own result line (create.js:1937-1953):
       role="status" so the answer reaches a screen reader without stealing
       focus. It is emptied rather than hidden by attribute, so its visibility is
       a fact about layout and never an attribute a later display rule can beat. */
    saidLine = make("p", "own-said");
    saidLine.setAttribute("data-own-said", "");
    saidLine.setAttribute("role", "status");
    block.appendChild(saidLine);

    block.appendChild(make("p", "own-note",
      "Nothing is uploaded and nothing is sent anywhere. The file is built out " +
        "of the text above, in this tab."));

    return block;
  }

  /* --- reset --------------------------------------------------------------- */

  /* Two presses, and the two labels § 4 D8 names. The first press adds the
     confirm control beside the arming one rather than relabelling it, so
     pressing "Reset demo data" a second time takes the confirm away again — an
     armed destructive control the reader cannot stand down is worse than the
     press it saved. */
  function armReset() {
    confirmBtn = button("ctl own-ctl own-ctl--primary", "Confirm reset");
    confirmBtn.setAttribute("data-own-confirm", "");
    confirmBtn.addEventListener("click", doReset);
    resetControls.appendChild(confirmBtn);
    confirmBtn.focus({ preventScroll: true });
  }

  function disarmReset() {
    if (confirmBtn && confirmBtn.parentNode) {
      confirmBtn.parentNode.removeChild(confirmBtn);
    }
    confirmBtn = null;
  }

  /* § 4 D8's sequence, in its order: reset the store, go to #/, re-render. The
     route change is a hash change and lands in a later task, so the re-render is
     what the reader sees first — the empty workbench, immediately, on the screen
     that was just cleared. The router then tears this surface down and mounts
     browse. No document reload and no direct address assignment: neither is
     measured at file:// and both are forbidden here. */
  function doReset() {
    records.reset();
    LENZLI.router.go("/");
    render(false);
  }

  function resetBlock() {
    var block = make("section", "own-block own-reset");
    var controls = make("div", "own-controls");
    var arm = button("ctl own-ctl", "Reset demo data");

    block.appendChild(blockHead("Reset demo data",
      "Removes every key this prototype wrote on this machine: the records you " +
        "made or edited, the draft in progress, and the profile this screen is " +
        "showing. The invented sample people come back untouched, because they " +
        "were never stored in the first place."));

    arm.setAttribute("data-own-reset", "");
    arm.addEventListener("click", function () {
      if (confirmBtn) {
        disarmReset();
        return;
      }
      armReset();
    });

    controls.appendChild(arm);
    resetControls = controls;
    block.appendChild(controls);
    block.appendChild(make("p", "own-note",
      "Two presses, on purpose. Pressing the first control again stands the " +
        "second one down."));

    return block;
  }

  /* --- the workbench ------------------------------------------------------- */

  function mountWorkbench(hostNode, record) {
    var section = make("section", "own-surface");
    var head = make("div", "own-head");
    var h1 = make("h1", "own-title display", "Your workbench");
    var layout = make("div", "own-layout");
    var left = make("div", "own-column");
    var right = make("div", "own-column");
    var identity = record.identity || {};
    var reel;

    section.setAttribute("data-own-workbench", "");

    h1.setAttribute("tabindex", "-1");
    head.appendChild(h1);
    head.appendChild(make("p", "own-lede",
      "Managing " + (identity.name || record.id) + ". Everything a viewer needs " +
        "is already in the reel and the credential card, so this screen is only " +
        "for the person the record belongs to."));

    /* F-6: an adopted sample is a borrowed identity and the screen says so
       plainly, which is the whole reason A1-19 refuses to adopt one by itself. */
    if (records.isSeed(record.id)) {
      head.appendChild(make("p", "own-note",
        "A sample profile. " + (identity.name || record.id) + " is an invented " +
          "person this prototype ships with, adopted here so the workbench has " +
          "something to manage. Reset puts this screen back to empty."));
    }

    section.appendChild(head);

    reel = reelBlock(record);
    left.appendChild(reel.block);
    right.appendChild(credBlock(record));
    right.appendChild(exportBlock(record));
    right.appendChild(resetBlock());

    layout.appendChild(left);
    layout.appendChild(right);
    section.appendChild(layout);
    hostNode.appendChild(section);

    /* A NAMED instance, created after the block is in the document so its four
       mount nodes resolve scoped to it. LENZLI.deck stays the inert namespace
       stub in the app — nothing here assigns to it (A1-7). focus:false on this
       first render only: the router is about to move focus to the <h1> (§ 3.4
       step 5) and two focus moves in one mount is one too many. */
    deck = LENZLI.createDeck(reel.block);
    deck.setCards(reel.cards);
    deck.render(0, { focus: false });

    return section;
  }

  /* --- the surface --------------------------------------------------------- */

  /* Teardown, this surface's half of § 3.4's five steps. It destroys the one
     deck instance it created, closes any credential sheet it opened, releases
     any download URL it built, and takes its own node out of the host. It adds
     NO listener to document or window — every listener it binds sits on a node
     inside its own section, or belongs to the deck instance, and destroy() owns
     those — so there is nothing else to release. destroy() and closeSheet() are
     both idempotent, so a router teardown racing a re-render cannot throw. */
  function teardown() {
    if (deck) {
      deck.destroy();
      deck = null;
    }

    if (LENZLI.cred && typeof LENZLI.cred.closeSheet === "function") {
      LENZLI.cred.closeSheet();
    }

    releaseUrl();

    if (mounted && mounted.parentNode) {
      mounted.parentNode.removeChild(mounted);
    }

    mounted = null;
    exportPre = null;
    saidLine = null;
    resetControls = null;
    confirmBtn = null;
  }

  /* The one place that asks who the owner is, so the empty state and the
     workbench can never disagree about it. moveFocus is true only when this
     surface re-renders itself under the reader's hand — on a route change the
     router moves focus itself (§ 3.4 step 5) and doing it twice would announce
     the heading twice. */
  function render(moveFocus) {
    var id = records.me();
    var record = id ? records.get(id) : null;
    var title;

    teardown();

    mounted = record ? mountWorkbench(host, record) : mountEmpty(host);

    if (moveFocus) {
      title = mounted.querySelector("h1");
      if (title) {
        title.focus({ preventScroll: true });
      }
    }
  }

  var surface = {
    /* Read by the router after mount() and announced in the app's single
       aria-live region (§ 3.4 step 5). It names the surface and not the person:
       the empty state has no person, and the workbench is the same screen either
       way. */
    title: "Your workbench",

    mount: function (mountHost) {
      host = mountHost;
      render(false);
    },

    unmount: function () {
      teardown();
      host = null;
    }
  };

  LENZLI.router.register("owner", surface);
})(window);
