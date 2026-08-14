/*
 * src/deck/cards.js — deck instances, boot, the switcher wiring, and every
 * element the viewer sees.
 *
 * Classic script (SPEC A3-9). This is the only file in src/deck/ that touches the
 * DOM: build.js compiles, nav.js binds input, this file paints (SPEC § 3.1).
 *
 * It owns LENZLI.createDeck(container, opts), LENZLI.boot(), LENZLI.showPersona(id)
 * and LENZLI.openGrid().
 *
 * ------------------------------------------------------------------------
 * THE DECK INSTANCE (SPEC § 3.1, E-1).
 *
 * Before wave 0 there was exactly one deck: one global LENZLI.deck object, one
 * `deck.render`, and three mounts looked up by document id. Two decks could not
 * coexist, which the app needs — the create surface's live preview sits on the
 * same page as the form, and the router mounts a reel into a host that did not
 * exist at load.
 *
 * LENZLI.createDeck(container, opts) -> instance. The instance surface is
 * cards · index · el · goTo(i) · next() · prev() · render(index, options) ·
 * setCards(cards) · openGrid() · overlay · destroy().
 *
 * opts is { focus: boolean } and nothing else. focus:false makes the instance
 * never move focus on render — that is what stops the create preview pulling the
 * caret out of an input on every keystroke. (opts.chrome was cut by § 3.4.1 M4:
 * a preview deck differs from a full one only in that its surface renders no
 * progress or grid controls beside it, which is a fact about the surface.)
 *
 * MOUNT RESOLUTION IS SCOPED TO THE CONTAINER, with the legacy ids as the
 * fallback link:
 *   container.querySelector("[data-deck-mount]")         || "#deck"
 *   container.querySelector("[data-deck-progress]")      || "#progress"
 *   container.querySelector("[data-deck-overlay-host]")  || document #stage (M5)
 *   container.querySelectorAll("[data-slot]")            scoped (M12)
 * The live region is created per instance and appended to the container.
 *
 * Because reel.html's #stage CONTAINS #progress, #deck and the [data-slot] nodes,
 * createDeck(document.getElementById("stage")) resolves every one of them without
 * a single global lookup — which is why reel.html needs no edit. LENZLI.boot()
 * assigns its instance to LENZLI.deck, so post-boot reel state is identical to
 * what it was before this build. Its PRE-boot state changes: nothing seeds
 * LENZLI.deck at module-evaluation time any more, so a page that never creates an
 * instance leaves it exactly as namespace.js declared it.
 * ------------------------------------------------------------------------
 *
 * Contracts held here:
 *   - Focus + announcement (A3-13). On every card change focus moves to that
 *     card's <h2> (tabindex="-1") and an aria-live="polite" region announces
 *     "Card N of M — <beat>". The overview grid takes focus to its own heading,
 *     traps Tab, and restores focus when it closes.
 *   - Every interactive element is a real <button> element. Nothing in this file
 *     is given a button ROLE to imitate one: the tap zones are read off the
 *     deck's box (nav.js) and every control here is created as a <button>.
 *   - Continuity (A3-12). Every card but the last carries the next card's leading
 *     edge as a 10px paper sliver in the right gutter; the last renders the
 *     end-cap instead.
 *   - Credential chips go THROUGH LENZLI.renderChip and LENZLI.pinOrder (§ 3.1).
 *     No chip markup and no pin logic is inlined in this layer.
 *   - Media plates (BEN-1). The proof plate, the depth plate and the video poster
 *     carry a photo when — and only when — the record names one, from a local path
 *     inside this repository. Absent the field, the CSS stand-in renders unchanged;
 *     no empty frame is ever produced. Every <img> gets a non-empty alt.
 *   - One italic Instrument Serif accent word per headline (§ 4 D1), and never
 *     two. Where the headline is a string from the persona record, the accent
 *     falls on its last word — the payoff of the line — so no record is ever
 *     edited to carry markup. The one exception is the HOOK card, whose <h2> is
 *     the person's NAME: a name is not styled copy, so that card's accent word
 *     sits on the positioning claim directly beneath it.
 *   - Mount points are the container's, by the contract above. reel.html's own
 *     names (#stage, #progress, #deck, [data-slot], [data-persona]) still resolve
 *     through it.
 */
(function (root) {
  "use strict";

  var LENZLI = root.LENZLI;

  if (!LENZLI || !LENZLI.deck) {
    throw new Error(
      "src/deck/cards.js: window.LENZLI.deck is missing. src/brand/namespace.js must load first."
    );
  }

  var decks = {};          /* personaId -> compiled Card[], boot's own cache */

  /* Live instances, most recently mounted last. The top is the active one — the
     deck the keyboard drives and the one LENZLI.openGrid()/showPersona() act on.
     destroy() removes its instance and hands the keyboard back to whatever is
     underneath, or to nothing. */
  var stack = [];

  function activeInstance() {
    return stack.length ? stack[stack.length - 1] : null;
  }

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

  /* One accent word per headline: the last word, set in the italic serif. */
  function headline(node, text) {
    var words = String(text).split(" ");
    var accent = words.pop();

    if (words.length) {
      node.appendChild(document.createTextNode(words.join(" ") + " "));
    }
    node.appendChild(make("span", "accent", accent));
    return node;
  }

  function heading(text) {
    var h2 = make("h2", "card-title display reveal");
    h2.setAttribute("tabindex", "-1");
    return headline(h2, text);
  }

  /* The reveal stagger is W1's motion: 0.6s on --ease, 60ms per element via --i. */
  function stagger(scope) {
    var items = scope.querySelectorAll(".reveal");
    var i;
    for (i = 0; i < items.length; i++) {
      items[i].style.setProperty("--i", i);
    }
  }

  function labelFor(index, total, card) {
    return "Card " + (index + 1) + " of " + total + " — " + card.label;
  }

  /* --- shared blocks ------------------------------------------------------ */

  /* Media plates (SPEC § 11, BEN-1). A plate carries a photo only when the record
     names one, and the path is always a local file inside this repository — no
     remote media, no network call. Without the field the CSS stand-in renders
     exactly as it always did: this is data-driven, so a record with no image
     never produces an empty frame. */

  /* Every <img> carries a meaningful alt, and the stand-in is named as one: the
     inert play control and the CTA note do the same thing a line apart. A stock
     photo is not the work it sits behind, and the alt does not claim it is. */
  function photoAlt(text) {
    return (text ? String(text) : "Media plate") + " (placeholder image)";
  }

  function plateImage(src, alt) {
    var img = make("img", "plate-img");
    img.src = src;
    img.alt = alt;
    return img;
  }

  function plate(text, extraClass, image) {
    var box = make("div", "plate reveal" +
      (extraClass ? " " + extraClass : "") +
      (image ? " plate--photo" : ""));

    if (image) {
      box.appendChild(plateImage(image, photoAlt(text)));
    }
    box.appendChild(make("span", "plate-text", text));
    return box;
  }

  function quoteBlock(data) {
    var figure = make("figure", "quotecard reveal");
    var credit = [data.author, data.role, data.org, data.date].filter(Boolean).join(" · ");

    figure.appendChild(make("blockquote", "quote", data.quote));
    figure.appendChild(make("figcaption", "attrib", credit));
    return figure;
  }

  /* The pinned order is D4's (LENZLI.pinOrder) and the chip markup is D4's
     (LENZLI.renderChip); the deck inlines neither. Both are console.info no-ops
     until the credentials order lands, so a non-array from pinOrder falls back to
     source order and ONLY a truthy return from renderChip is appended (§ 11,
     V7-6) — a tree without src/credentials/ renders the TRUST beat with no chips
     rather than throwing. */
  function chipRow(chips, limit) {
    var row = make("div", "chips reveal");
    var ordered = LENZLI.pinOrder(chips);

    if (!Array.isArray(ordered)) {
      ordered = chips;
    }

    ordered.slice(0, limit).forEach(function (cred) {
      var element = LENZLI.renderChip(cred);
      if (element) {
        row.appendChild(element);
      }
    });

    return row;
  }

  /* Unconditional in both TRUST branches: every reel reaches its wallet
     (SPEC § 4 D3). */
  function seeAll(count, personaId) {
    var btn = button("seeall reveal", "See all " + count);
    btn.addEventListener("click", function () {
      LENZLI.openWalletScreen(personaId);
    });
    return btn;
  }

  /* --- the five beats ----------------------------------------------------- */

  function renderHook(body, card) {
    var data = card.data;

    if (data.monogram) {
      var plateEl = make("div", "monoplate reveal");
      /* The mark's own aperture, behind the initials and washed back to the
         plate's hairline weight by deck.css. Drawn at 88 rather than the
         plate's 96 so its rounded square clears the plate's pill radius. */
      var ring = make("span", "monoring");
      ring.setAttribute("aria-hidden", "true");
      ring.innerHTML = LENZLI.mark(88);
      plateEl.setAttribute("aria-hidden", "true");
      plateEl.appendChild(ring);
      plateEl.appendChild(make("span", "monogram", data.monogram));
      body.appendChild(plateEl);
    }

    var title = make("h2", "card-title display hook-name reveal", data.name);
    title.setAttribute("tabindex", "-1");
    body.appendChild(title);

    /* The niche line renders as a positioning claim, not a job title, and it
       carries this card's one accent word. */
    body.appendChild(headline(make("p", "claim reveal"), data.niche));

    if (data.availability) {
      var avail = make("p", "avail reveal");
      var dot = make("span", "avail-dot");
      dot.setAttribute("aria-hidden", "true");
      avail.appendChild(dot);
      avail.appendChild(document.createTextNode(data.availability));
      body.appendChild(avail);
    }
  }

  function renderProof(body, card) {
    var data = card.data;

    body.appendChild(make("p", "eyebrow reveal", "The result"));
    body.appendChild(heading(data.headline));

    if (data.context) {
      body.appendChild(make("p", "context reveal", data.context));
    }

    if (data.artifact) {
      var figure = make("figure", "artifact reveal");
      if (data.artifact.kind) {
        figure.appendChild(make("span", "eyebrow", data.artifact.kind));
      }
      figure.appendChild(plate(data.artifact.label, null, data.artifact.image || null));
      if (data.artifact.caption) {
        figure.appendChild(make("figcaption", "caption", data.artifact.caption));
      }
      body.appendChild(figure);
    }
  }

  function renderTrust(body, card) {
    var data = card.data;

    if (data.branch === "testimonial") {
      body.appendChild(make("p", "eyebrow reveal", "Reference"));
      body.appendChild(heading("In their own words"));
      body.appendChild(quoteBlock(data.testimonial));
    } else {
      body.appendChild(make("p", "eyebrow reveal", "Credentials"));
      body.appendChild(heading("Checked, not claimed"));
    }

    body.appendChild(chipRow(data.chips, data.chipLimit));
    body.appendChild(seeAll(data.seeAllCount, card.personaId));
  }

  function renderClose(body, card) {
    var data = card.data;

    body.appendChild(make("p", "eyebrow reveal", "How to start"));
    body.appendChild(heading("The working details"));

    if (data.scope.length) {
      var list = make("ul", "scope reveal");
      data.scope.forEach(function (item) {
        list.appendChild(make("li", "scope-item", item));
      });
      body.appendChild(list);
    }

    var terms = make("dl", "terms reveal");
    function term(name, value) {
      if (!value) {
        return;
      }
      terms.appendChild(make("dt", "term-name", name));
      terms.appendChild(make("dd", "term-value", value));
    }
    term("Rate", data.rateBand);
    term("Response", data.responseTime);
    term("Timezone", data.timezone);
    body.appendChild(terms);

    /* ONE action, never a menu. The action is mocked: nothing is sent, and the
       note under the button says so before and after the tap. */
    var cta = button("cta reveal", data.cta.label);
    var note = make("p", "cta-note reveal", "mock — this prototype sends nothing");
    cta.addEventListener("click", function () {
      note.textContent = "mock — nothing was sent";
    });
    body.appendChild(cta);
    body.appendChild(note);
  }

  /* --- the depth kinds ---------------------------------------------------- */

  function renderArtifact(body, card) {
    var data = card.data;

    body.appendChild(make("p", "eyebrow reveal", "The work itself"));
    body.appendChild(heading(data.label));
    body.appendChild(plate(data.plate, "plate--full", data.image || null));

    if (data.caption) {
      body.appendChild(make("p", "caption reveal", data.caption));
    }
  }

  /* The video slot (Maya only, A3-5): poster plate, duration, an inert control,
     and the caption track as static pop-on cues. No autoplay, no audio, no
     transcript toggle — the cues ARE the static text. */
  function renderVideo(body, card) {
    var data = card.data;

    body.appendChild(make("p", "eyebrow reveal", "Personality slot"));
    body.appendChild(heading("How I work"));

    var poster = make("div", "poster reveal");

    /* The poster photo, when the record names one. The plate text stays either
       way — it is the poster's caption, not a substitute for a missing file. */
    if (data.poster && data.poster.src) {
      poster.className += " poster--photo";
      poster.appendChild(plateImage(data.poster.src, photoAlt(data.poster.plate)));
    }

    poster.appendChild(make("span", "poster-plate", data.poster ? data.poster.plate : ""));
    if (data.durationLabel) {
      poster.appendChild(make("span", "duration mono", data.durationLabel));
    }
    body.appendChild(poster);

    var play = button("play reveal", "mock — no media in this prototype");
    play.disabled = true;
    body.appendChild(play);

    body.appendChild(make("p", "eyebrow reveal", "Caption track"));

    var cues = make("ol", "cues reveal");
    data.captions.forEach(function (cue) {
      var item = make("li", "cue");
      item.appendChild(make("span", "cue-at mono", cue.at));
      item.appendChild(make("span", "cue-text", cue.text));
      cues.appendChild(item);
    });
    body.appendChild(cues);
  }

  function renderTestimonial(body, card) {
    body.appendChild(make("p", "eyebrow reveal", "Reference"));
    body.appendChild(heading("In their own words"));
    body.appendChild(quoteBlock(card.data));
  }

  function renderWallet(body, card) {
    var count = card.data.count;

    body.appendChild(make("p", "eyebrow reveal", "Credentials"));
    body.appendChild(heading("The whole record"));
    body.appendChild(make("p", "lede reveal",
      "Pinned in the order that matters. Expired ones stay visible, marked."));

    var open = button("cta reveal", count + " credentials — see all");
    open.addEventListener("click", function () {
      LENZLI.openWalletScreen(card.personaId);
    });
    body.appendChild(open);
  }

  /* The unfinished card (E-4, E-9). buildDeck's partial mode emits this for a
     beat the author has not filled in yet, so the create preview shows the beat's
     SLOT rather than throwing mid-keystroke. It says which beat it is and what
     would finish it, and deck.css draws it dashed so it can never be mistaken for
     a design. The prompt is not run through heading(): that helper italicises the
     last word of its string, which on a sentence would accent the full stop. */
  function renderPlaceholder(body, card) {
    var data = card.data;
    var title = make("h2", "card-title display reveal", card.label);

    title.setAttribute("tabindex", "-1");

    body.appendChild(make("p", "eyebrow reveal", "Unfinished"));
    body.appendChild(title);
    body.appendChild(make("p", "context reveal", data.prompt));
  }

  var RENDERERS = {
    hook: renderHook,
    proof: renderProof,
    trust: renderTrust,
    close: renderClose,
    artifact: renderArtifact,
    video: renderVideo,
    testimonial: renderTestimonial,
    wallet: renderWallet,
    placeholder: renderPlaceholder
  };

  /* --- the card frame ----------------------------------------------------- */

  function endCap(instance) {
    var cap = make("div", "endcap");
    var restart = button("endcap-btn", "restart");
    var overview = button("endcap-btn", "overview");

    restart.addEventListener("click", function () {
      instance.goTo(0);
    });
    overview.addEventListener("click", function () {
      instance.openGrid();
    });

    cap.appendChild(make("span", "endcap-text", "End of reel —"));
    cap.appendChild(restart);
    cap.appendChild(make("span", "endcap-sep", "·"));
    cap.appendChild(overview);
    return cap;
  }

  function renderCard(instance, card, index, total) {
    var isLast = index === total - 1;
    var wrap = make("div", "cardwrap");
    var section = make("section", "card card--" + card.kind + (isLast ? " card--last" : ""));
    var body = make("div", "card-body");
    var render = RENDERERS[card.kind];

    /* The placeholder renderer covers a beat that is merely unfinished. A kind
       with no renderer at all is a compile defect and still throws (SPEC § 10). */
    if (!render) {
      throw new Error("cards.js: no renderer for card kind " + JSON.stringify(card.kind));
    }

    render(body, card);
    section.appendChild(body);

    if (isLast) {
      section.appendChild(endCap(instance));
    }

    wrap.appendChild(section);

    if (!isLast) {
      var sliver = make("div", "sliver");
      sliver.setAttribute("aria-hidden", "true");
      wrap.appendChild(sliver);
    }

    return wrap;
  }

  /* --- the instance ------------------------------------------------------- */

  LENZLI.createDeck = function (container, opts) {
    var options = opts || {};
    var moveFocus = options.focus !== false;
    var mount;
    var progress;
    var live;
    var instance;
    var overlayEl = null;
    var overlayOpener = null;
    var releaseInput = null;
    var destroyed = false;
    var lastAnnounced = null;   /* the last string this instance's region carries */

    if (!container || typeof container.querySelector !== "function") {
      throw new Error("createDeck: expected an element to mount into");
    }

    mount = container.querySelector("[data-deck-mount]") ||
      container.querySelector("#deck");
    progress = container.querySelector("[data-deck-progress]") ||
      container.querySelector("#progress");

    /* A surface that forgets its mount node would render nothing and say nothing,
       which is the silent failure § 10 forbids. */
    if (!mount) {
      throw new Error(
        "createDeck: the container carries no [data-deck-mount] and no #deck to mount into"
      );
    }

    /* One live region per instance, inside the instance's own container, so two
       decks on one page never announce over each other and destroy() can take its
       own region with it. */
    live = make("div", "sr-only");
    live.setAttribute("aria-live", "polite");
    live.setAttribute("aria-atomic", "true");
    container.appendChild(live);

    /* ONE WRITE PER DISTINCT STRING. render() announces unconditionally, before
       and independent of the focus check below it, and the create surface
       recompiles synchronously on every `input` with no scheduler to coalesce
       the repaints (A1-22) — so without this a screen reader repeated
       "Card 1 of 4 — Hook" after every character typed on the centerpiece
       surface. focus:false fixed the caret and left the voice alone.

       The reasoning is showPersona's, applied one level down: an announcement
       belongs to a CHANGE, and repainting the card that is already on screen is
       not one. A real card change still announces, because the label carries the
       index and the beat and therefore differs. */
    function announce(text) {
      if (text === lastAnnounced) {
        return;
      }
      lastAnnounced = text;
      live.textContent = text;
    }

    function setSlot(name, text) {
      var nodes = container.querySelectorAll('[data-slot="' + name + '"]');
      var i;
      for (i = 0; i < nodes.length; i++) {
        nodes[i].textContent = text;
      }
    }

    /* The persistent identity line (sibling ruling D3, § 3.4.1 M12), scoped to
       this instance's container so a second deck on the page cannot overwrite the
       first one's band. The three fields come off the HOOK descriptor, which is
       where buildDeck already put them — the instance is given cards, not a
       record (§ 3.1's setCards(cards)). A deck whose first card is not a hook —
       a partial-mode preview, mid-draft — leaves the band as it found it rather
       than blanking it on every keystroke. */
    function fillIdentity(cards) {
      var first = cards && cards[0];

      if (!first || first.kind !== "hook") {
        return;
      }
      setSlot("name", first.data.name);
      setSlot("niche", first.data.niche);
      setSlot("availability", first.data.availability || "");
    }

    function paintProgress(cards, index) {
      if (!progress) {
        return;
      }
      progress.textContent = "";

      cards.forEach(function (card, i) {
        var state = i === index ? " seg--now" : (i < index ? " seg--done" : "");
        var seg = button("seg" + state);

        seg.setAttribute("aria-label", labelFor(i, cards.length, card));
        if (i === index) {
          seg.setAttribute("aria-current", "true");
        }
        seg.addEventListener("click", function () {
          instance.goTo(i);
        });
        progress.appendChild(seg);
      });
    }

    /* --- the overview grid, per instance ---------------------------------- */

    /* Unmount the overlay and leave focus exactly where it is — the teardown path
       (destroy) takes this one, the same split src/credentials/walletCard.js makes
       between its closeSheet and its sheet's own shut(). */
    function dropOverlay() {
      if (overlayEl && overlayEl.parentNode) {
        overlayEl.parentNode.removeChild(overlayEl);
      }
      overlayEl = null;
      instance.overlay = null;
    }

    function closeGrid() {
      var opener = overlayOpener;

      if (!overlayEl) {
        return;
      }
      dropOverlay();
      overlayOpener = null;

      if (opener && typeof opener.focus === "function") {
        opener.focus({ preventScroll: true });
      }
    }

    function trapTab(event) {
      if (event.key !== "Tab" || !overlayEl) {
        return;
      }

      var focusable = overlayEl.querySelectorAll("button, [tabindex]:not([tabindex='-1'])");
      if (!focusable.length) {
        return;
      }

      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      /* The heading holds focus on open and is not itself a stop, so anything
         outside the list counts as standing on the boundary. */
      var here = Array.prototype.indexOf.call(focusable, document.activeElement);

      if (event.shiftKey && (here === -1 || document.activeElement === first)) {
        last.focus();
        event.preventDefault();
      } else if (!event.shiftKey && (here === -1 || document.activeElement === last)) {
        first.focus();
        event.preventDefault();
      }
    }

    /* The labelled full index — the direct-access escape, one tap from any card.
       Same model as the progress bar (A3-3): selecting a tile jumps and closes.
       The host joins the mount contract (§ 3.4.1 M5): a surface names its own with
       [data-deck-overlay-host], and reel.html's #stage is the fallback link. */
    function openGrid() {
      var host = container.querySelector("[data-deck-overlay-host]") ||
        document.getElementById("stage");
      var cards = instance.cards;

      if (overlayEl || !host || !cards || !cards.length) {
        return;
      }

      overlayOpener = document.activeElement;
      overlayEl = make("div", "overlay");

      var head = make("div", "overlay-head");
      var title = make("h2", "overlay-title", "Overview");
      var close = button("overlay-close", "Close");

      title.setAttribute("tabindex", "-1");
      close.addEventListener("click", closeGrid);
      head.appendChild(title);
      head.appendChild(close);

      var tiles = make("div", "tiles");
      cards.forEach(function (card, i) {
        var tile = button("tile");

        tile.setAttribute("aria-label", labelFor(i, cards.length, card));
        if (i === instance.index) {
          tile.setAttribute("aria-current", "true");
        }
        tile.appendChild(make("span", "tile-n mono", (i + 1) + " / " + cards.length));
        tile.appendChild(make("span", "tile-label", card.label));
        tile.addEventListener("click", function () {
          closeGrid();
          instance.goTo(i);
        });
        tiles.appendChild(tile);
      });

      overlayEl.appendChild(head);
      overlayEl.appendChild(tiles);
      overlayEl.addEventListener("keydown", trapTab);
      host.appendChild(overlayEl);

      /* nav.js's Esc closes whatever this handle points at. */
      instance.overlay = closeGrid;
      title.focus({ preventScroll: true });
    }

    /* --- paint ------------------------------------------------------------ */

    function render(index, renderOpts) {
      var cards = instance.cards;
      var card = cards && cards[index];
      var wrap;
      var title;

      if (!card) {
        return;
      }

      mount.textContent = "";
      wrap = renderCard(instance, card, index, cards.length);
      mount.appendChild(wrap);
      stagger(wrap);
      paintProgress(cards, index);
      fillIdentity(cards);
      announce(labelFor(index, cards.length, card));

      /* Two ways to decline focus, and either one is enough: the instance was
         created with focus:false (the create preview, every keystroke), or this
         one render asked not to move it (a deck swap, which is not a card
         change — A3-13). */
      if (moveFocus && (!renderOpts || renderOpts.focus !== false)) {
        title = wrap.querySelector("h2");
        if (title) {
          title.focus({ preventScroll: true });
        }
      }
    }

    /* goTo is the only mover. It clamps rather than wrapping: the last card
       carries an explicit end-cap (A3-12), so running off the end is a dead stop,
       never a silent restart. */
    function goTo(i) {
      var cards = instance.cards;
      var target = Number(i);

      if (!cards || !cards.length || isNaN(target)) {
        return;
      }
      target = Math.max(0, Math.min(cards.length - 1, Math.round(target)));
      instance.index = target;
      render(target, { focus: true });
    }

    function setCards(cards) {
      instance.cards = Array.isArray(cards) ? cards : [];
      /* A shorter deck must not leave the index pointing past its end, or the
         next render would find no card and silently keep the old one on screen. */
      if (instance.index > instance.cards.length - 1) {
        instance.index = Math.max(0, instance.cards.length - 1);
      }
    }

    /* Removes every listener this instance added, unmounts its overlay and its
       live region, empties what it painted, and hands the keyboard back to the
       instance underneath. Idempotent: a surface torn down twice — a router
       teardown racing a manual destroy — must not throw. */
    function destroy() {
      var at;

      if (destroyed) {
        return;
      }
      destroyed = true;

      dropOverlay();
      overlayOpener = null;

      if (releaseInput) {
        releaseInput();
        releaseInput = null;
      }

      if (live.parentNode) {
        live.parentNode.removeChild(live);
      }

      mount.textContent = "";
      if (progress) {
        progress.textContent = "";
      }

      at = stack.indexOf(instance);
      if (at !== -1) {
        stack.splice(at, 1);
      }
      instance.cards = [];
      LENZLI.focusDeck(activeInstance());
    }

    instance = {
      cards: [],
      index: 0,
      el: container,
      overlay: null,
      goTo: goTo,
      next: function () {
        goTo(instance.index + 1);
      },
      prev: function () {
        goTo(instance.index - 1);
      },
      render: render,
      setCards: setCards,
      openGrid: openGrid,
      destroy: destroy
    };

    releaseInput = LENZLI.bindDeckInput(instance, mount);
    stack.push(instance);
    LENZLI.focusDeck(instance);

    return instance;
  };

  /* --- the two global entry points ---------------------------------------- */

  /* Redefined as "open the grid on the active instance", so reel.html's inline
     onclick="LENZLI.openGrid()" keeps working with no edit to that file. */
  LENZLI.openGrid = function () {
    var instance = activeInstance();

    if (instance) {
      instance.openGrid();
    }
  };

  /* --- switcher + boot ---------------------------------------------------- */

  function pressSwitcher(id) {
    var buttons = document.querySelectorAll("[data-persona]");
    var i;
    for (i = 0; i < buttons.length; i++) {
      buttons[i].setAttribute(
        "aria-pressed",
        buttons[i].getAttribute("data-persona") === id ? "true" : "false"
      );
    }
  }

  function bindSwitcher() {
    var buttons = document.querySelectorAll("[data-persona]");
    var i;

    function bind(node) {
      node.addEventListener("click", function () {
        LENZLI.showPersona(node.getAttribute("data-persona"));
      });
    }

    for (i = 0; i < buttons.length; i++) {
      bind(buttons[i]);
    }
  }

  /* The reel's persona switcher, routed through the active instance. The
     switcher and its aria-pressed state are reel.html's own chrome and stay
     document-scoped; only the deck is per-instance. */
  LENZLI.showPersona = function (id) {
    var record = (LENZLI.personas || {})[id];
    var instance = activeInstance();

    if (!record) {
      console.info("LENZLI.showPersona — no persona is registered as " + JSON.stringify(id));
      return;
    }

    if (!instance) {
      console.info("LENZLI.showPersona — no deck instance is mounted; call LENZLI.boot() first.");
      return;
    }

    if (!decks[id]) {
      decks[id] = LENZLI.buildDeck(record);
    }

    if (typeof instance.overlay === "function") {
      instance.overlay();
    }
    /* A credential surface opened over the old deck does not survive the swap.
       Guarded, so a tree without src/credentials/ still switches persona. */
    if (LENZLI.cred && typeof LENZLI.cred.closeSheet === "function") {
      LENZLI.cred.closeSheet();
    }
    pressSwitcher(id);

    instance.setCards(decks[id]);
    instance.index = 0;

    /* Focus stays on the switcher button the viewer just pressed; the live region
       still announces card 1 of the new reel. The focus MOVE belongs to the
       card-change contract (A3-13), and swapping decks is not a card change. */
    instance.render(0, { focus: false });
  };

  /* Instance zero exists exactly when boot() runs. reel.html calls it; the app
     never does, which is what leaves LENZLI.deck an inert namespace stub there. */
  LENZLI.boot = function () {
    var personas = LENZLI.personas || {};
    var ids = Object.keys(personas);

    if (!ids.length) {
      console.info("LENZLI.boot — no personas are registered; src/data/ has not loaded.");
      return;
    }

    /* Compile every deck up front, so a misconfigured persona throws here at boot
       rather than when a viewer taps its switcher button. */
    ids.forEach(function (id) {
      decks[id] = LENZLI.buildDeck(personas[id]);
    });

    /* The reel's whole chrome lives inside #stage, so #stage is the container:
       #progress, #deck and the [data-slot] nodes all resolve inside it. */
    LENZLI.deck = LENZLI.createDeck(document.getElementById("stage"));

    bindSwitcher();

    /* The first registered persona is the one reel.html marks aria-pressed. */
    LENZLI.showPersona(ids[0]);
  };
})(window);
