/* directory.js — the browse/search surface at #/.
 *
 * Classic script (SPEC A3-9). Registers itself with the router as "browse" at
 * load, the way every surface file does (SPEC § 3.4, ledger V2-14), so this file
 * is reachable without any later order editing src/app/.
 *
 * IT IS SEARCH, NOT A BROWSE WALL (SPEC F-8). Ben asked for browse and the
 * research is hostile to it: a wall of candidate faces re-introduces the bias
 * and legal exposure that "this is my page, for people who already want to know
 * me" avoids, and a directory that needs liquidity to be useful dies of cold
 * start. So the surface is intent-driven: a query box, facets that name what
 * they filter on, an explicit result count, and every result rendered. There is
 * no pagination, no infinite scroll, no promoted slot, no paid placement and no
 * ranking badge. Ordering is src/directory/search.js's algorithm and is never a
 * viewer preference — there is no drag-to-reorder here or anywhere (F-13).
 *
 * TWO PRESENTATIONS, ONE RESULT SET. A view switcher between the count line and
 * the results offers List (the default) and Cards. It changes how the results
 * are DRAWN and nothing else: the same array search.js returned, in the order it
 * returned it, every element of it, in both views. It is not a sort control, not
 * a density control that hides anything, and not a second query — switching does
 * not re-run the search, it repaints the set already in hand, which is also why
 * it can never quietly change what the count line above it is counting. A card
 * without a media plate is drawn exactly like one with it, minus the photo: no
 * dimming, no "add a photo" prompt, no completion treatment of any kind (F-14).
 *
 * THE VIEW DOES NOT PERSIST. Every mount arrives in List, for the same reason
 * mount resets the query and the selection: #/ is an arrival, and an arrival that
 * silently reapplied a presentation chosen three navigations ago would be
 * answering a question this viewer has not asked yet.
 *
 * ARRIVAL (SPEC § 3.4.1 M7). An empty query lists every record in name order and
 * the count line states how many, counted from the live result set this render
 * produced rather than from any figure written here — the roster is data, and a
 * literal in a comment goes stale the first time a record lands. That is not the
 * wall F-8 forbids — nothing is ranked, nothing scrolls forever, and an empty
 * first screen would read as broken. Mount resets the query and the selection
 * for the same reason: #/ is an arrival, and an arrival that silently reapplied
 * a filter from three navigations ago would be lying about what the count means.
 *
 * WHAT THIS FILE MAY AND MAY NOT READ. All matching and all ordering happen in
 * search.js, which never reads a media field — that is the legal constraint
 * AM-12 pins, not a preference. This file DISPLAYS: a record that names a media
 * plate gets one, a record that does not gets its monogram, and neither fact
 * ever reaches search.js. A profile without video is not ranked lower, is not
 * sorted differently, and carries no "incomplete" treatment of any kind — there
 * is no completion score anywhere in this build (F-14).
 *
 * IT CALLS THE ENGINE AND NEVER RESTATES IT (SPEC § 10). The chip on a result
 * card is LENZLI.renderChip's element, the credential it shows is
 * LENZLI.pinOrder's first, and the short name in the explanation is
 * LENZLI.cred.shortName's. renderChip returns null at tier D, so only a truthy
 * return is appended, exactly as src/deck/cards.js appends one.
 *
 * NO SCHEDULER (SPEC A1-22). The search runs synchronously on every input event.
 * There is no debounce, because this build carries no scheduler of any kind and
 * AM-4 greps this folder for one; the corpus is a dozen-odd records and the
 * whole pass is a few hundred string comparisons.
 *
 * THE ONE LIVE REGION IS THE APP'S. app.html carries a single aria-live region
 * (SPEC § 4 D2) and the router announces surface titles in it. This surface adds
 * no second one — no role="status" on the count line — because two polite
 * regions on one page is how announcements start stepping on each other.
 */
(function (root) {
  "use strict";

  var LENZLI = root.LENZLI;

  if (!LENZLI || !LENZLI.router) {
    throw new Error(
      "src/directory/directory.js: window.LENZLI.router is missing. src/brand/namespace.js must load first."
    );
  }

  /* Mounted state. Everything here is nulled by unmount(), so a torn-down
     surface holds no reference to a node the router has already dropped. */
  var host = null;
  var countLine = null;
  var resultsBox = null;

  /* Two listener buckets. The first is bound once at mount and lives as long as
     the surface; the second belongs to nodes the result list throws away on
     every keystroke, and is emptied with them. Neither is on document or
     window — but a surface that tracks its own listeners cannot leave one
     behind when that stops being true (SPEC § 3.4, teardown obligation 1). */
  var chromeListeners = [];
  var resultListeners = [];

  var facetNodes = [];
  var facetList = [];
  var facetPanelNode = null;
  var facetToggleNode = null;
  var facetsOpen = false;
  var selected = [];
  var query = "";

  /* The presentation, and the set it is a presentation OF. "list" is the default
     at every mount (see the header). lastResults holds what search.js last
     returned, so pressing a view button repaints that array instead of asking
     the same question again — the switcher is a drawing choice, and re-running
     the search to answer it would make the view look like an input to the
     result. */
  var view = "list";
  var lastResults = [];
  var viewNodes = [];

  /* --- small helpers -------------------------------------------------------- */

  /* The element helpers src/app/router.js and src/deck/cards.js both use. */
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

  function button(className, label) {
    var node = make("button", className, label);
    node.type = "button";
    return node;
  }

  function bind(bucket, node, type, handler) {
    node.addEventListener(type, handler);
    bucket.push({ node: node, type: type, handler: handler });
  }

  function release(bucket) {
    bucket.forEach(function (entry) {
      entry.node.removeEventListener(entry.type, entry.handler);
    });
    return [];
  }

  function str(value) {
    return value === null || value === undefined ? "" : String(value);
  }

  /* The result set is records.all() and never LENZLI.personas: § 3.3 keeps
     user-created and user-edited records out of that object on purpose, so
     reading it directly is how a published record goes missing from the
     directory that is supposed to list it (SPEC § 3.1 E-7). */
  function records() {
    var all;

    if (LENZLI.records && typeof LENZLI.records.all === "function") {
      all = LENZLI.records.all();
      if (all && all.length !== undefined) {
        return all;
      }
    }

    /* The namespace stub answers with undefined until src/store/records.js
       lands, and has already said so on the console. An empty set renders the
       honest empty state instead of throwing. */
    return [];
  }

  /* --- the count line ------------------------------------------------------- */

  /* Exactly one numeral per phrasing, so "the count matches the number of
     cards" is a check and not a parse (SPEC § 5.1 B assertion 13). The arrival
     wording counts PEOPLE, because nothing has been asked yet; every other
     wording counts profiles that MATCH, because something has. */
  function countText(n) {
    if (!query && !selected.length) {
      return n === 1 ? "1 person" : n + " people";
    }
    return n === 1 ? "1 profile matches." : n + " profiles match.";
  }

  /* --- the result card ------------------------------------------------------ */

  /* The plate. A record that names a media plate shows it, washed under its own
     monogram; a record that does not shows the monogram alone. The monogram is
     always on top, so two records that happen to name the same placeholder file
     are never told apart by the photo (plans/AUDIT-app-surfaces.md L6 — six
     images shared across the whole roster, a known residual queued to Ben).

     The plate is aria-hidden and its image alt is empty on purpose: the open
     control carries the person's name in its own label, and announcing a
     placeholder photo once per record would bury it. */
  function plate(record) {
    var identity = record.identity || {};
    var artifact = (record.outcome || {}).artifact || {};
    var box = make("span", "dir-plate");
    var img;

    if (artifact.image) {
      box.className = "dir-plate dir-plate--photo";
      img = make("img", "dir-plate-img");
      img.setAttribute("src", artifact.image);
      img.setAttribute("alt", "");
      box.appendChild(img);
    }

    box.appendChild(make("span", "dir-monogram", str(identity.monogram)));
    box.setAttribute("aria-hidden", "true");
    return box;
  }

  function credentialOf(record, credId) {
    var list = record.credentials || [];
    var i;

    for (i = 0; i < list.length; i++) {
      if (list[i] && list[i].id === credId) {
        return list[i];
      }
    }
    return null;
  }

  function credentialPhrase(record, credId) {
    var c = credentialOf(record, credId);
    var name;
    var verifier;

    if (!c) {
      return "";
    }

    name = LENZLI.cred && typeof LENZLI.cred.shortName === "function"
      ? LENZLI.cred.shortName(c)
      : str(c.achievement && c.achievement.name);
    verifier = str(c.verification && c.verification.verifier);

    /* Named, always. A line that says only that something is verified is the
       unqualified trust mark the four-tier ladder exists to refuse (F-9). */
    return verifier ? name + ", verified with " + verifier : name;
  }

  var FIELD_ORDER = [
    "identity.name",
    "identity.niche",
    "outcome.headline",
    "close.scope"
  ];

  /* The explanation answers "why is this person on my screen?", which is a
     different question from "what do they do?" — so it names what matched, in a
     fixed order, and says plainly when nothing has been asked for yet. */
  function explain(result) {
    var record = result.record;
    var matched = result.matched || [];
    var parts = [];
    var seen = [];

    FIELD_ORDER.forEach(function (field) {
      matched.forEach(function (item) {
        if (item.kind === "field" && item.field === field) {
          parts.push(item.value);
        }
      });
    });

    /* One phrase per credential, however many of its three fields matched. */
    matched.forEach(function (item) {
      var phrase;

      if (item.kind !== "field" || !item.credId || seen.indexOf(item.credId) !== -1) {
        return;
      }
      seen.push(item.credId);
      phrase = credentialPhrase(record, item.credId);
      if (phrase) {
        parts.push(phrase);
      }
    });

    matched.forEach(function (item) {
      if (item.kind === "facet") {
        parts.push(item.label);
      }
    });

    if (!parts.length) {
      return "listed: no query yet";
    }
    return "matched: " + parts.join(" · ");
  }

  function card(result) {
    var record = result.record;
    var identity = record.identity || {};
    var item = make("li", "dir-item");
    var open = button("dir-open");
    var lines = make("span", "dir-lines");
    var foot = make("div", "dir-foot");
    var why = make("p", "dir-why", explain(result));
    var chipRow;
    var pinned;
    var chip;

    item.setAttribute("data-dir-card", "");

    open.setAttribute("data-dir-open", str(record.id));
    open.setAttribute("aria-label", "Open " + str(identity.name) + "'s reel");
    open.appendChild(plate(record));

    lines.appendChild(make("span", "dir-name", str(identity.name)));
    /* The positioning line, as the record wrote it — ≤12 words by the corpus's
       own constraint, never a job title this surface derived. */
    lines.appendChild(make("span", "dir-niche", str(identity.niche)));
    open.appendChild(lines);

    bind(resultListeners, open, "click", function () {
      LENZLI.router.go("/r/" + record.id);
    });

    item.appendChild(open);

    /* The top pinned credential, through the existing algorithm and the
       existing element factory. pinOrder filters tier D out and renderChip
       returns null for it, so a record whose only credential is self-reported
       shows no chip rather than an empty one. */
    pinned = typeof LENZLI.pinOrder === "function"
      ? LENZLI.pinOrder(record.credentials || [])[0]
      : null;
    chip = pinned && typeof LENZLI.renderChip === "function"
      ? LENZLI.renderChip(pinned)
      : null;

    if (chip) {
      chipRow = make("div", "dir-chip");
      chipRow.appendChild(chip);
      foot.appendChild(chipRow);
    }

    why.setAttribute("data-dir-why", "");
    foot.appendChild(why);
    item.appendChild(foot);
    return item;
  }

  /* --- the grid card -------------------------------------------------------- */

  /* The SAME record, drawn as a portfolio tile. It reads plate-or-monogram
     through plate() above and not through a second media-reading path, so the
     one place that decides whether a record shows a photograph stays one place
     and search.js still never sees a media field (AM-12).

     The control is a real <button> filling the card body, exactly as .dir-open
     fills a list row, so Enter and Space are the element's own activation and
     nothing here imitates a button with a role. The credential chip sits below
     it, outside the button, because an interactive element inside another one is
     what that split exists to avoid (directory.css:185-187). */
  function gridCard(result) {
    var record = result.record;
    var identity = record.identity || {};
    var availability = str(identity.availability).replace(/^\s+|\s+$/g, "");
    var item = make("li", "dir-gcard");
    var open = button("dir-gcard-open");
    var lines = make("span", "dir-gcard-lines");
    var pinned;
    var chip;
    var foot;

    item.setAttribute("data-dir-grid-card", "");

    open.setAttribute("data-dir-open", str(record.id));
    open.setAttribute("aria-label", "Open " + str(identity.name) + "'s reel");
    open.appendChild(plate(record));

    lines.appendChild(make("span", "dir-name", str(identity.name)));
    /* The positioning line as the record wrote it, same as the list row: never a
       job title this surface derived. */
    lines.appendChild(make("span", "dir-niche", str(identity.niche)));

    /* Only when the record has said something. A record that has not is not
       marked as having failed to — there is no completion score here (F-14),
       and "stated / not stated" is already the availability facet's own test
       (search.js:150-152). */
    if (availability) {
      lines.appendChild(make("span", "dir-gcard-avail", availability));
    }

    open.appendChild(lines);

    /* The identical navigation the list row binds, in the same bucket: these
       nodes are thrown away on the next repaint and their listeners go with
       them. */
    bind(resultListeners, open, "click", function () {
      LENZLI.router.go("/r/" + record.id);
    });

    item.appendChild(open);

    /* The leading credential, through the same two engine calls the list row
       makes. pinOrder filters tier D out and renderChip returns null for it, so
       only a truthy return is appended and a record whose only credential is
       self-reported simply carries no chip. */
    pinned = typeof LENZLI.pinOrder === "function"
      ? LENZLI.pinOrder(record.credentials || [])[0]
      : null;
    chip = pinned && typeof LENZLI.renderChip === "function"
      ? LENZLI.renderChip(pinned)
      : null;

    if (chip) {
      foot = make("div", "dir-gcard-foot");
      foot.appendChild(chip);
      item.appendChild(foot);
    }

    return item;
  }

  /* --- the empty state ------------------------------------------------------ */

  /* It suggests broadening and names the ONE facet whose removal would bring
     results back; it never offers "show everyone", which would teach the viewer
     that the filter was decorative (SPEC § 4 D5). The candidate is found by
     re-running the search without each selected facet in turn — a corpus
     this small, so the honest answer is cheaper than a heuristic.

     Two facets can bring back the same number, and the tiebreak is the LAST one
     selected: an empty screen appears the moment a filter is added, so the one
     the viewer just chose is the one they are asking about. Deterministic
     either way — this is a rule, not a preference. */
  function looser() {
    var best = null;

    selected.forEach(function (facet, index) {
      var rest = selected.filter(function (other, j) {
        return j !== index;
      });
      var n = LENZLI.directory.search(query, rest, records()).length;

      if (n > 0 && (!best || n >= best.count)) {
        best = { facet: facet, count: n };
      }
    });

    return best;
  }

  /* THE CONTROL THAT RAN THIS REMOVED ITSELF. toggleFacet re-renders the result
     list, and the empty state — with the Drop button inside it — goes with the
     re-render, so with nothing else done focus lands on <body> and a reader
     working from the keyboard restarts at the top of the document.

     It goes to that facet's own button in the panel above. The panel persists
     across the re-render, the button is the same fact the press was about
     (dropping a filter IS deselecting it), and it is now unpressed, so the
     reader lands on the control that would put the filter back. The count line
     is the fallback for the case where that button cannot take focus: it is the
     one node on the surface that always states what just changed, and it carries
     tabindex="-1" for exactly this. Liveness is CHECKED rather than assumed — a
     focus() that silently does nothing is how the defect above happened. */
  function focusAfterDrop(facet) {
    var entry = facetNodes.filter(function (other) {
      return other.facet.group === facet.group && other.facet.value === facet.value;
    })[0];

    if (entry && entry.node) {
      entry.node.focus();
      if (document.activeElement === entry.node) {
        return;
      }
    }

    if (countLine) {
      countLine.focus();
    }
  }

  function emptyState() {
    var box = make("div", "dir-empty");
    var drop = looser();
    var control;

    box.setAttribute("data-dir-empty", "");
    box.appendChild(make("p", "dir-empty-lead", "Nothing matches all of that."));

    if (drop) {
      box.appendChild(make(
        "p",
        "dir-empty-note",
        "Drop one filter — " + drop.facet.label + " — and " +
          (drop.count === 1 ? "1 profile comes back." : drop.count + " profiles come back.")
      ));

      control = button("ctl dir-drop", "Drop " + drop.facet.label);
      bind(resultListeners, control, "click", function () {
        toggleFacet(drop.facet);
        focusAfterDrop(drop.facet);
      });
      box.appendChild(control);
      return box;
    }

    box.appendChild(make(
      "p",
      "dir-empty-note",
      "Try fewer words, or plainer ones. The search reads names, niches, what " +
        "someone takes on, their headline result, and their credentials, issuers and verifiers."
    ));
    return box;
  }

  /* --- rendering ------------------------------------------------------------ */

  /* PAINT DRAWS, RENDER ASKS. paint() turns lastResults into nodes and is the
     only thing a view switch runs; render() is the one that puts the question to
     search.js and then paints the answer. Split that way, pressing List or Cards
     cannot change the result set or the count above it — it has no path to
     either (F-8).

     The order is search.js's, forEach'd start to end: every result is drawn, in
     both views, with no slice, no page and no promoted first tile. */
  function paint() {
    var wrap;

    resultListeners = release(resultListeners);
    resultsBox.textContent = "";

    if (!lastResults.length) {
      /* Not a presentation of results but the absence of them, so it is the same
         block in either view. */
      resultsBox.appendChild(emptyState());
      return;
    }

    wrap = view === "cards"
      ? make("ul", "dir-cards")
      : make("ol", "dir-results");

    lastResults.forEach(function (result) {
      wrap.appendChild(view === "cards" ? gridCard(result) : card(result));
    });
    resultsBox.appendChild(wrap);
  }

  /* Only the count line and the result list are rebuilt. The query box, the
     facet controls and the view switcher are built once at mount and mutated in
     place, because replacing the input the viewer is typing into would take the
     caret with it — and there is no scheduler to put it back (A1-22). */
  function render() {
    lastResults = LENZLI.directory.search(query, selected, records());
    countLine.textContent = countText(lastResults.length);
    paint();
  }

  function isSelected(facet) {
    return selected.some(function (other) {
      return other.group === facet.group && other.value === facet.value;
    });
  }

  function toggleFacet(facet) {
    if (isSelected(facet)) {
      selected = selected.filter(function (other) {
        return !(other.group === facet.group && other.value === facet.value);
      });
    } else {
      selected = selected.concat([facet]);
    }

    facetNodes.forEach(function (entry) {
      entry.node.setAttribute("aria-pressed", isSelected(entry.facet) ? "true" : "false");
    });

    syncFacets();
    render();
  }

  /* --- the chrome above the results ----------------------------------------- */

  var GROUP_TITLES = {
    niche: "What they do",
    availability: "Availability",
    verification: "Who checked it"
  };

  /* The panel is COLLAPSED ON ARRIVAL, behind one real button that says how many
     filters are applied. On this corpus the niche, availability and
     verification facets together are several dozen controls, and § 10's 44px
     minimum makes them fill the whole first screen —
     so with the panel open, arriving at #/ shows a wall of filters and not one
     person. § 3.4.1 M7 is explicit that the arrival screen is the full roster
     and the count line, and that a first screen which fails to show them
     "would read as broken". Nothing is removed: every facet is one press away,
     the button carries the applied count so a filtered result can never look
     unexplained, and the panel stays open once it is opened. */
  function facetToggle() {
    var control = button("ctl dir-filters");

    control.setAttribute("data-dir-filters", "");
    control.setAttribute("aria-expanded", "false");
    control.setAttribute("aria-controls", "dir-facets");
    bind(chromeListeners, control, "click", function () {
      facetsOpen = !facetsOpen;
      syncFacets();
    });

    facetToggleNode = control;
    return control;
  }

  function syncFacets() {
    var n = selected.length;

    facetToggleNode.textContent = n === 0
      ? "Filters"
      : (n === 1 ? "Filters — 1 applied" : "Filters — " + n + " applied");
    facetToggleNode.setAttribute("aria-expanded", facetsOpen ? "true" : "false");
    facetPanelNode.hidden = !facetsOpen;
  }

  /* The facet panel is built once, from the whole record set, so its counts are
     "how many people are like this" and not "how many are left" — a count that
     moved on every keystroke would read as a score of the query. */
  function facetPanel() {
    var panel = make("div", "dir-facets");
    var groups = [];

    panel.id = "dir-facets";

    facetList.forEach(function (facet) {
      var group = groups.filter(function (g) {
        return g.name === facet.group;
      })[0];

      if (!group) {
        group = { name: facet.group, facets: [] };
        groups.push(group);
      }
      group.facets.push(facet);
    });

    groups.forEach(function (group) {
      var block = make("div", "dir-group");
      var row = make("div", "dir-group-row");

      block.appendChild(make(
        "h2",
        "dir-group-title eyebrow",
        GROUP_TITLES[group.name] || group.name
      ));

      group.facets.forEach(function (facet) {
        var control = button("dir-facet");

        control.setAttribute("data-dir-facet", facet.group);
        control.setAttribute("aria-pressed", "false");
        control.appendChild(make("span", "dir-facet-label", facet.label));
        control.appendChild(make("span", "dir-facet-count", String(facet.count)));
        bind(chromeListeners, control, "click", function () {
          toggleFacet(facet);
        });

        facetNodes.push({ node: control, facet: facet });
        row.appendChild(control);
      });

      block.appendChild(row);
      panel.appendChild(block);
    });

    facetPanelNode = panel;
    return panel;
  }

  /* --- the view switcher ---------------------------------------------------- */

  /* Two options and no third. A "compact" or "dense" variant would be a third
     thing to explain and the second one is already the whole idea: the same
     people, read as a line or read as a wall of work. */
  var VIEWS = [
    { id: "list", label: "List" },
    { id: "cards", label: "Cards" }
  ];

  /* aria-pressed is the state, on both buttons, always — the facets' own
     encoding (§ 10) and the one directory.css already styles from. Neither
     button is ever disabled: a disabled control is unreachable from the
     keyboard, and "you are already here" is what pressed MEANS. */
  function syncView() {
    viewNodes.forEach(function (entry) {
      entry.node.setAttribute("aria-pressed", entry.id === view ? "true" : "false");
    });
  }

  /* Built once, at mount, and never rebuilt: it is chrome, not a result, so its
     listeners belong to chromeListeners and it survives every repaint. That is
     also what keeps focus honest — the button the viewer just pressed is still
     the same node afterwards, so focus stays on it with nothing here having to
     put it back. */
  function viewSwitcher() {
    var group = make("div", "dir-view");

    group.setAttribute("role", "group");
    group.setAttribute("aria-label", "Result view");
    group.setAttribute("data-dir-view", "");

    VIEWS.forEach(function (option) {
      var control = button("dir-view-btn", option.label);

      control.setAttribute("data-dir-view-option", option.id);
      bind(chromeListeners, control, "click", function () {
        /* Pressing the view already on screen is not a change; repainting for it
           would throw away and rebuild every result node for nothing. */
        if (view === option.id) {
          return;
        }
        view = option.id;
        syncView();
        paint();
      });

      viewNodes.push({ node: control, id: option.id });
      group.appendChild(control);
    });

    return group;
  }

  function queryBlock() {
    var block = make("div", "dir-query-block");
    var label = make("label", "dir-label", "Search");
    var field = make("input", "dir-query");

    field.type = "search";
    field.id = "dir-query";
    field.setAttribute("data-dir-query", "");
    field.setAttribute("autocomplete", "off");
    field.setAttribute("placeholder", "ICU nurse, WCAG, welds, Nursys");
    label.setAttribute("for", "dir-query");

    /* Synchronous on every keystroke (A1-22). The deck's document-level keydown
       listener carries wave 0's E-2 target guard (src/deck/nav.js:173-191), so
       an arrow key pressed in this field moves the caret and never a reel. */
    bind(chromeListeners, field, "input", function () {
      query = field.value;
      render();
    });

    block.appendChild(label);
    block.appendChild(field);
    block.appendChild(make(
      "p",
      "dir-help",
      "Names, niches, what someone takes on, their headline result, and their credentials."
    ));

    return block;
  }

  /* --- the surface ---------------------------------------------------------- */

  var surface = {
    title: "Search",

    mount: function (mountHost) {
      var section = make("section", "dir-surface");
      var heading = make("h1", "dir-title display", "Search");

      host = mountHost;
      query = "";
      selected = [];
      facetNodes = [];
      facetsOpen = false;
      /* List on every arrival, and the cache empty until the first render: the
         view is reset with the query and the selection, for the same reason. */
      view = "list";
      viewNodes = [];
      lastResults = [];
      facetList = LENZLI.directory.facets(records());

      heading.setAttribute("tabindex", "-1");
      section.appendChild(heading);
      section.appendChild(make(
        "p",
        "dir-lede",
        "Say what you need done. Every filter names who did the checking."
      ));

      section.appendChild(queryBlock());
      section.appendChild(facetToggle());
      section.appendChild(facetPanel());
      syncFacets();

      countLine = make("p", "dir-count");
      countLine.setAttribute("data-dir-count", "");
      /* Programmatically focusable, never a tab stop: it is the landing place
         for a control that removes itself (focusAfterDrop above), and -1 is what
         makes focus() land there without adding a stop to the Tab order. */
      countLine.setAttribute("tabindex", "-1");
      section.appendChild(countLine);

      /* Between the count and the results, because it is a statement about the
         results directly below it and about nothing above it. */
      section.appendChild(viewSwitcher());
      syncView();

      resultsBox = make("div", "dir-results-box");
      resultsBox.setAttribute("data-dir-results", "");
      section.appendChild(resultsBox);

      host.appendChild(section);
      render();

      /* Focus is deliberately NOT taken here. The router moves focus to this
         surface's <h1 tabindex="-1"> immediately after mount (SPEC § 3.4 step 5,
         src/app/router.js:317-319) and § 5.1 B assertion 6 grades that, so a
         focus() call on the query box would be overwritten on the same tick and
         would only be a lie in the source. The query box is the first control
         after the heading instead, so it is one Tab away on arrival. */
    },

    unmount: function () {
      chromeListeners = release(chromeListeners);
      resultListeners = release(resultListeners);
      facetNodes = [];
      viewNodes = [];

      /* This surface creates no deck instance — there is no deck at #/ — so
         there is none to destroy(). It does open credential sheets: a chip
         rendered by renderChip wires its own click to openWalletCard, which
         mounts through cred.sheet's default host chain and therefore lands on
         document.body, outside this host. Emptying the host cannot reach one,
         so closing it here is this surface's own § 3.4 obligation and not the
         router's backstop. closeSheet is idempotent. */
      if (LENZLI.cred && typeof LENZLI.cred.closeSheet === "function") {
        LENZLI.cred.closeSheet();
      }

      if (host) {
        host.textContent = "";
      }

      host = null;
      countLine = null;
      resultsBox = null;
      facetPanelNode = null;
      facetToggleNode = null;
      facetsOpen = false;
      facetList = [];
      selected = [];
      query = "";
      view = "list";
      lastResults = [];
    }
  };

  LENZLI.router.register("browse", surface);
})(window);
