/*
 * src/create/create.js — the create surface: the four-beat form and the live
 * preview beside it.
 *
 * Classic script (SPEC A3-9). Registers itself as the `create` surface at load
 * (SPEC § 3.4, per-file registration) and declares keepOnParamChange:true, which
 * is what stops publishing #/create/<id> over #/create from tearing the form down
 * mid-flow (audit H6).
 *
 * ------------------------------------------------------------------------
 * THE CLAIM THIS SURFACE MAKES TRUE.
 *
 * A reel COMPILES from structured data; nobody faces a blank recording screen.
 * The About panel says it in words. Here it is the thing you feel — which is why
 * the preview calls LENZLI.buildDeck, the same compiler the reel runs, and never
 * a lookalike. A mimic would make the product's central claim theatre.
 *
 * THE PREVIEW (SPEC § 4 D7, § 3.1, A1-22):
 *
 *   LENZLI.createDeck(previewHost, { focus: false })   a NAMED instance, never
 *                                                      LENZLI.deck. opts.chrome
 *                                                      was cut (§ 3.4.1 M4) and
 *                                                      is not passed.
 *   on every `input`, SYNCHRONOUSLY and with NO SCHEDULER:
 *     validatePersona(draft) -> buildDeck(draft,{partial:true}) -> setCards ->
 *     render(index,{focus:false}) with the index clamped to the new length.
 *
 * focus:false is the whole caret contract: without it every keystroke would move
 * focus to the repainted card's <h2> and pull the author out of the input they
 * are typing in. There is no debounce and no coalescing anywhere in this file —
 * buildDeck is pure and DOM-free and a draft is a few kilobytes, so a scheduler
 * would buy nothing and cost the no-timer invariant (A1-22, AM-4).
 *
 * Arrow keys inside a field move the caret and NOT the preview: wave 0's E-2
 * target guard (src/deck/nav.js) is what makes a form and a deck able to share
 * one page, and this surface is the reason it exists.
 * ------------------------------------------------------------------------
 *
 * Contracts held here:
 *   - THE DRAFT IS A PERSONA RECORD IN PROGRESS — the same object
 *     src/data/shapes.js documents, with any field ABSENT rather than empty. The
 *     preview passes it straight into validatePersona and buildDeck, both of
 *     which take a record. There is no parallel authoring structure.
 *   - NEVER A BLANK BOX. Every field carries a label, a worked example in its
 *     placeholder, and a help line that says what a good answer looks like. The
 *     four beats appear in the spine's order and the optional depth section is
 *     visibly separated from them.
 *   - NO AI DRAFTING OF ANY KIND (F-10). Nothing here generates, suggests or
 *     redrafts a word of anyone's copy. The whole positioning rests on a reader
 *     being unable to tell a person from a generator; a button that writes the
 *     reel attacks the only differentiator the product has.
 *   - NO METER, NO SCORE, NO TALLY (F-14). The word budget warns and never
 *     blocks, and nothing on this surface grades the person.
 *   - THE KILL LIST IS ENFORCED AS ABSENT FIELDS — SPEC § 4 D7 kill list. It is
 *     referenced, never quoted: AM-15 greps the string literals in this folder,
 *     so writing the list out would fail the row that exists to prove the fields
 *     are gone. Exactly one call-to-action field exists ([data-mk-cta]).
 *   - NO UPLOAD, NO INLINE-ENCODED IMAGE, NO FILE READER (A1-16). A media plate
 *     may name one of the six placeholder photos already in this repository,
 *     offered as a fixed list, and monogram is the default. There is no control
 *     that reads a file and no nag to add a photo.
 *   - Depth offers exactly two kinds, artifact and testimonial (§ 4 D7). video is
 *     not offered — the camera stays out of the authoring path — and wallet is
 *     not, because it is derived from credentials.length. Depth is hard-capped at
 *     3 so this form cannot produce a record that trips buildDeck's MAX_DEPTH.
 *   - Every control is a real <input>, <textarea>, <select> or <button>, at least
 *     44px in its smallest dimension. There is no <form> element: at file:// an
 *     accidental submit is a navigation, and nothing here needs one.
 *   - This surface adds NO listener to document or window. Every listener sits on
 *     a node inside the host and leaves with it (§ 3.4 teardown).
 *
 * Seams the later orders attached to, each marked in the markup below:
 *   [data-mk-credentials]  W9 — the six-question credential sub-flow, the derived
 *                          tier line, and the LENZLI.cred.renderTierRow exhibit.
 *   [data-mk-actions]      W10 — publish, the autosave line and the refusal list.
 * Neither tier, status nor trustBeat is asked here: all three are derived
 * (F-11, A1-21), and the fields that derive them are W9's.
 *
 * ------------------------------------------------------------------------
 * PERSISTENCE, PUBLISH AND EDIT MODE (W10 — SPEC § 3.3, § 3.4, § 4 D7).
 *
 * The draft AUTOSAVES on every change, never on a timer (A1-22, AM-4): every
 * path in this file that mutates the draft ends in compile(), so the write sits
 * at the foot of compile() and there is exactly one call site. It goes through
 * LENZLI.store under the short name "draft"; the lenzli.pivot.v1. prefix is
 * src/store/storage.js's business and no key literal appears here (AM-11).
 *
 * PUBLISH REFUSES IN WORDS AND NEVER GOES DEAD. The word budget warns and never
 * blocks (A1-20) and nothing else disables the control either: publish builds
 * the record through LENZLI.create.draftToRecord, and when validatePersona or an
 * unfinished depth block says it would not compile, it saves nothing and says
 * what is missing. A record that cannot compile must not reach the directory —
 * #/r/<id> would throw on it — and E-3 exists to report exactly that as data.
 *
 * EDIT MODE is #/create/<personaId>, and the route names no step (§ 3.4.1 M8):
 * the form opens on the draft as it stands. Only an id that RESOLVES rebuilds
 * anything; the draft's own id does nothing at all, which is what makes the
 * publish transition survive (§ 3.4's corrected same-route guard, audit H6),
 * and an id that resolves to nothing is surfaced in a line rather than
 * redirected or rebuilt (§ 3.4, assertion 12).
 *
 * THE PREVIEW'S CREDENTIAL CONTROLS ARE INERT, and that is a W10 fix to a defect
 * dispatch 14 measured: the preview renders the REAL deck, so it renders real
 * chips and a real "See all N", both of which resolve through the record store —
 * and a draft is in no store, so both threw on tap. They are disabled inside the
 * preview container rather than removed, because the preview's whole claim is
 * that it is the renderer and not a picture of it.
 * ------------------------------------------------------------------------
 */
(function (root) {
  "use strict";

  var LENZLI = root.LENZLI;

  if (!LENZLI || !LENZLI.router || !LENZLI.create) {
    throw new Error(
      "src/create/create.js: window.LENZLI.router is missing. src/brand/namespace.js must load first."
    );
  }

  /* buildDeck's own cap, restated as the form's cap so the two can never
     disagree: the add control switches off at three (SPEC § 3.1). */
  var MAX_DEPTH = 3;

  /* The whole media-plate offer (A1-16): the six files already in this
     repository. No upload, no data URI, no new image file, and no nag to add a
     photo — the monogram plate is the default and needs nothing. */
  var PLATES = [
    "src/brand/img/alex-depth.jpg",
    "src/brand/img/alex-proof.jpg",
    "src/brand/img/dana-proof.jpg",
    "src/brand/img/maya-depth.jpg",
    "src/brand/img/maya-poster.jpg",
    "src/brand/img/maya-proof.jpg"
  ];

  var host = null;
  var preview = null;          /* the named deck instance — never LENZLI.deck */
  var fields = [];             /* field blocks a validatePersona problem can land on */
  var depthHost = null;
  var depthAdd = null;
  var depthCap = null;
  var credList = null;
  var credEmpty = null;
  var credAdd = null;
  var credPanels = [];         /* one {cred, paint} per credential block on screen */
  var routeParams = {};
  var seq = 0;
  var publishBtn = null;
  var saidLine = null;         /* what publish just answered, or nothing */
  var problemList = null;      /* what a refused publish is waiting for */
  var previewWatch = null;     /* keeps the preview's credential controls inert */
  var restored = false;        /* the stored draft is read once per page load */
  var unknownId = "";          /* a route id that resolved to no record */

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

  function uid() {
    seq += 1;
    return "mk-f" + seq;
  }

  function str(value) {
    return String(value === undefined || value === null ? "" : value);
  }

  /* --- the draft ---------------------------------------------------------- */

  /* An empty draft compiles to exactly four placeholder cards and throws
     nothing: identity and outcome are empty objects, close carries no cta, the
     three arrays are empty, and trustBeat is not set. Every guard buildDeck
     tests is therefore missing rather than half-filled (§ 5.1 B assertion 22). */
  function emptyDraft() {
    return {
      identity: {},
      outcome: {},
      credentials: [],
      testimonials: [],
      close: { scope: [] },
      depth: []
    };
  }

  /* The draft outlives a mount on purpose: routing away to search and back must
     not silently throw away what the author typed. W10 replaces this object from
     storage in edit mode; nothing else ever reassigns it, and every field reads
     it through a getter so a replacement reaches all of them. */
  var draft = emptyDraft();

  /* ABSENT, NEVER EMPTY. A field the author clears is deleted from the record,
     because buildDeck branches on presence: an empty string would compile to a
     card drawn around nothing instead of the placeholder that says what is
     missing. */
  function setLeaf(object, key, value) {
    var trimmed = str(value).trim();

    if (trimmed) {
      object[key] = trimmed;
    } else {
      delete object[key];
    }
  }

  function copy(object) {
    var out = {};

    Object.keys(object).forEach(function (key) {
      out[key] = object[key];
    });
    return out;
  }

  function identityOf() {
    return draft.identity;
  }

  function outcomeOf() {
    return draft.outcome;
  }

  function closeOf() {
    return draft.close;
  }

  /* --- the record the preview compiles ------------------------------------ */

  /* The draft with trustBeat resolved, and nothing else changed.
     trustBeat is DERIVED, never asked (F-11): LENZLI.create.deriveTrustBeat is
     src/create/tier.js's (W9), and until that file lands the namespace stub
     returns undefined, which leaves the TRUST beat an unfinished card — the
     honest state, not an error.
     It is resolved onto a COPY rather than written into the draft because the
     record-level assignment site is W10's draftToRecord (§ 3.1: computed in
     tier.js, applied by draftToRecord). One assignment site, not two.
     outcome.artifact is dropped when it has no name for the same reason a
     cleared box is deleted: the proof card would otherwise draw an empty plate.
     Its other boxes wait in the form until the artifact has a name. */
  function previewRecord() {
    var beat = LENZLI.create.deriveTrustBeat(draft);
    var record = copy(draft);

    if (beat === "credentials" || beat === "testimonial") {
      record.trustBeat = beat;
    }
    if (draft.outcome.artifact && !draft.outcome.artifact.label) {
      record.outcome = copy(draft.outcome);
      delete record.outcome.artifact;
    }
    return record;
  }

  /* --- the preview -------------------------------------------------------- */

  /* SYNCHRONOUS, on every input event, in this exact order (§ 4 D7). No
     scheduler of any kind — no timer, no frame callback, no coalescing:
     buildDeck is a pure DOM-free transform over a few kilobytes and the repaint
     is one card. AM-4 greps this folder for the timer names, so they are not
     written here either.
     Nothing here is wrapped in a try/catch. validatePersona never throws by
     contract and partial mode covers every core-beat and depth guard, so an
     exception reaching here is a real defect and must surface (§ 10). */
  function compile() {
    var record;
    var report;
    var cards;

    /* AUTOSAVE (SPEC § 3.3, § 4 D7). Every path that mutates the draft ends
       here, so this is the one write site — synchronous, on the change event
       that led here, and never on a timer (A1-22, AM-4). It runs BEFORE the
       early return below: a paint can be declined because the surface is going
       away, but a change the author already made is never dropped. The outcome
       line and the refusal list are cleared with it, because both are statements
       about the text as it stood when publish was last pressed. */
    saveDraft();
    clearOutcome();

    /* A control can blur — and a <select> can commit its value — while the
       router is emptying the host, which is after this surface's instance has
       been destroyed. There is nothing to paint into then, and it is not an
       error: the surface is gone, not broken. */
    if (!preview) {
      return;
    }

    record = previewRecord();
    report = LENZLI.validatePersona(record);
    cards = LENZLI.buildDeck(record, { partial: true });

    showProblems(report.problems);

    /* The credential panels are derived from the record too — the tier line, the
       status, the mismatch against the profile name, and the chrome exhibit —
       so they repaint on the same pass and from the same source of truth. */
    paintCredentialPanels();

    preview.setCards(cards);          /* clamps the index to the new length */
    preview.render(preview.index, { focus: false });
  }

  /* Touching a box changes what should be SHOWN without changing the record, so
     this refreshes the problem lines and leaves the deck exactly where it is. */
  function refreshProblems() {
    showProblems(LENZLI.validatePersona(previewRecord()).problems);
  }

  /* The invalid state has no colour available (§ 3.5, § 10): the problem line
     beneath the field in --ink, aria-invalid on the control, and a border in
     --ink. Three channels, none of them colour.

     A problem shows only once its own field has been touched. An untouched empty
     form is unfinished, not wrong, and flagging every box before the author has
     typed a character would be the form shouting at them on arrival. The beats
     that are not yet fillable say so in the preview, as unfinished cards.

     validatePersona also reports on fields this surface does not own — `id` and
     `trustBeat` are assigned at publish (W10) and `credentials` is W9's. They
     carry no control here, so they land on no field block; the preview's
     unfinished cards are where the author sees them. */
  function showProblems(problems) {
    var byField = {};

    problems.forEach(function (problem) {
      if (!byField[problem.field]) {
        byField[problem.field] = problem.message;
      }
    });

    fields.forEach(function (entry) {
      var message = entry.path ? byField[entry.path] : null;
      var show = !!(message && entry.touched);

      entry.problem.textContent = show ? message : "";
      entry.problem.hidden = !show;

      if (show) {
        entry.control.setAttribute("aria-invalid", "true");
      } else {
        entry.control.removeAttribute("aria-invalid");
      }
    });
  }

  /* --- the field block ---------------------------------------------------- */

  /* § 3.5's field block, and the only one in this build: label above, control
     below, help beneath in --muted-soft, then the two lines that can appear under
     it — the word budget and the problem. The label is sentence case in the UI
     face and is deliberately NOT the uppercase eyebrow, which is the deck's role
     and would make the form read as a card.

     spec: { label, help, placeholder, kind, rows, options, budget, path, get, set }
       kind     "input" (default) | "textarea" | "select"
       options  [{ value, label }] for a select
       budget   a field name in src/create/draft.js's table, or absent
       path     the validatePersona field path this control owns, or absent
       get/set  the draft leaf this control reads and writes

     W9 and W10 build their fields through this function rather than adding a
     second field shape. */
  function field(spec) {
    var block = make("div", "mk-field");
    var id = uid();
    var control;
    var label;
    var help;
    var budget = null;
    var problem = make("p", "mk-problem");
    var described = [];
    var entry;

    if (spec.kind === "textarea") {
      control = make("textarea", "mk-textarea");
      control.rows = spec.rows || 3;
    } else if (spec.kind === "select") {
      control = make("select", "mk-select");
      (spec.options || []).forEach(function (option) {
        var node = make("option", null, option.label);
        node.value = option.value;
        control.appendChild(node);
      });
    } else {
      control = make("input", "mk-input");
      control.type = "text";
    }

    control.id = id;
    control.value = str(spec.get ? spec.get() : "");

    if (spec.placeholder) {
      control.setAttribute("placeholder", spec.placeholder);
    }

    label = make("label", "mk-label", spec.label);
    label.setAttribute("for", id);

    block.appendChild(label);
    block.appendChild(control);

    if (spec.help) {
      help = make("p", "mk-help", spec.help);
      help.id = id + "-help";
      described.push(help.id);
      block.appendChild(help);
    }

    if (spec.budget) {
      budget = make("p", "mk-budget");
      budget.id = id + "-budget";
      described.push(budget.id);
      block.appendChild(budget);
    }

    problem.id = id + "-problem";
    problem.hidden = true;
    described.push(problem.id);
    block.appendChild(problem);

    control.setAttribute("aria-describedby", described.join(" "));

    entry = {
      block: block,
      control: control,
      problem: problem,
      path: spec.path || null,
      touched: false
    };

    function paintBudget() {
      var report;

      if (!budget) {
        return;
      }
      if (!control.value.trim()) {
        budget.textContent = "";
        budget.hidden = true;
        return;
      }
      report = LENZLI.create.wordBudget(spec.budget, control.value);
      budget.className = report.over > 0 ? "mk-budget mk-budget--over" : "mk-budget";
      budget.textContent = budgetLine(report);
      budget.hidden = false;
    }

    function edit() {
      entry.touched = true;
      if (spec.set) {
        spec.set(control.value);
      }
      paintBudget();
      compile();
    }

    control.addEventListener("input", edit);

    /* A <select> reports its change as `change`, not `input`, in some engines.
       Both are bound and the handler is idempotent. */
    control.addEventListener("change", edit);

    /* Leaving a box the author opened and did not fill is the other way a
       problem becomes worth showing. Nothing was typed, so the deck does not
       recompile. */
    control.addEventListener("blur", function () {
      entry.touched = true;
      refreshProblems();
    });

    paintBudget();

    if (spec.path) {
      fields.push(entry);
    }

    return entry;
  }

  /* "62 / 65–75 words" within budget; "over budget — trim 8 words" over it
     (§ 3.5), the second set in --ink by .mk-budget--over. Under the minimum
     renders as the count and nothing else: short is unfinished, not wrong.
     Nothing reads this to disable a control — the budget warns and never blocks
     (A1-20). */
  function budgetLine(report) {
    if (report.over > 0) {
      return "over budget — trim " + report.over + (report.over === 1 ? " word" : " words");
    }
    return report.words + " / " + report.min + "–" + report.max + " words";
  }

  function plateOptions() {
    var options = [{ value: "", label: "No image — the paper plate" }];

    PLATES.forEach(function (path) {
      options.push({ value: path, label: path.split("/").pop() });
    });
    return options;
  }

  /* --- sections ----------------------------------------------------------- */

  function section(title, note) {
    var el = make("section", "mk-section");

    el.appendChild(make("h2", "mk-section-title display", title));
    if (note) {
      el.appendChild(make("p", "mk-section-note", note));
    }
    return el;
  }

  function group(parent, title, note) {
    var el = make("div", "mk-group");

    el.appendChild(make("h3", "mk-group-title", title));
    if (note) {
      el.appendChild(make("p", "mk-section-note", note));
    }
    parent.appendChild(el);
    return el;
  }

  function add(parent, entry) {
    parent.appendChild(entry.block);
    return entry;
  }

  /* --- HOOK --------------------------------------------------------------- */

  /* Initials for the monogram plate: the first letter of the first two words
     that start with one, so "Dana Okafor, RN" gives DO. */
  function initials(value) {
    var out = "";

    str(value).trim().split(/\s+/).forEach(function (word) {
      var letter = word.charAt(0);

      if (out.length < 2 && letter && letter.toUpperCase() !== letter.toLowerCase()) {
        out += letter.toUpperCase();
      }
    });
    return out;
  }

  function hookSection() {
    var el = section("1 · The hook",
      "Card 1 is the whole pitch: a name, and the claim underneath it.");
    var monogram;

    add(el, field({
      label: "Your name",
      placeholder: "Dana Okafor, RN",
      help: "As you want it read on card 1, letters after it included.",
      path: "identity.name",
      get: function () { return identityOf().name; },
      set: function (value) {
        setLeaf(identityOf(), "name", value);

        /* Monogram is the DEFAULT, not a chore (§ 4 D7): the initials follow the
           name until the author edits that box themselves, after which it is
           theirs. Setting .value in code fires no input event, so this can never
           mark the monogram box touched. */
        if (monogram && !monogram.touched) {
          monogram.control.value = initials(value);
          setLeaf(identityOf(), "monogram", monogram.control.value);
        }
      }
    }));

    add(el, field({
      label: "The niche line",
      placeholder: "ICU nurse · Level-1 trauma · Chicago",
      help: "Who you are for, and where. Not a job title.",
      budget: "niche",
      path: "identity.niche",
      get: function () { return identityOf().niche; },
      set: function (value) { setLeaf(identityOf(), "niche", value); }
    }));

    add(el, field({
      label: "Availability",
      placeholder: "Open to per-diem shifts",
      help: "Optional, and only if it is true today.",
      get: function () { return identityOf().availability; },
      set: function (value) { setLeaf(identityOf(), "availability", value); }
    }));

    monogram = add(el, field({
      label: "Monogram",
      placeholder: "DO",
      help: "Two or three letters for the plate on card 1. Faceless is first-class " +
        "here: this prototype holds no photo of you and never asks for one.",
      get: function () { return identityOf().monogram; },
      set: function (value) { setLeaf(identityOf(), "monogram", value); }
    }));

    return el;
  }

  /* --- PROOF -------------------------------------------------------------- */

  function proofSection() {
    var el = section("2 · The proof", "One result, with a number in it.");
    var box;
    var artifact = {};

    add(el, field({
      label: "The result",
      placeholder: "Precepted 11 new-grad ICU nurses",
      help: "A number and what it was in. A list of what you were responsible for " +
        "is the instant reject here — it is not a result.",
      budget: "headline",
      path: "outcome.headline",
      get: function () { return outcomeOf().headline; },
      set: function (value) { setLeaf(outcomeOf(), "headline", value); }
    }));

    add(el, field({
      label: "Where it happened",
      placeholder: "Level-1 trauma unit, 2023-2026 — 10 still on the unit",
      help: "The setting and the span, small under the headline.",
      budget: "context",
      get: function () { return outcomeOf().context; },
      set: function (value) { setLeaf(outcomeOf(), "context", value); }
    }));

    box = group(el, "The artifact",
      "Optional. The thing itself, named. It joins the proof card once it has a name.");

    /* The four artifact boxes are one record field between them, so they are
       written as a group: the object exists on the record only once it has a
       name, and the other three wait in the form until then rather than being
       dropped on the floor. */
    function sync() {
      var next = {};

      setLeaf(next, "label", artifact.label.control.value);
      setLeaf(next, "kind", artifact.kind.control.value);
      setLeaf(next, "caption", artifact.caption.control.value);
      setLeaf(next, "image", artifact.image.control.value);

      if (next.label) {
        outcomeOf().artifact = next;
      } else {
        delete outcomeOf().artifact;
      }
    }

    function current(key) {
      return function () {
        return outcomeOf().artifact ? outcomeOf().artifact[key] : "";
      };
    }

    artifact.label = add(box, field({
      label: "What it is called",
      placeholder: "Unit onboarding pathway",
      get: current("label"),
      set: sync
    }));

    artifact.kind = add(box, field({
      label: "What kind of thing it is",
      placeholder: "document",
      help: "One word: document, dashboard, deck, build.",
      get: current("kind"),
      set: sync
    }));

    artifact.caption = add(box, field({
      label: "Your part in it",
      placeholder: "I wrote the 6-week pathway; the unit still runs it.",
      help: "Name what you did. A caption that could belong to anyone on the team " +
        "is the one a reader discounts.",
      budget: "caption",
      get: current("caption"),
      set: sync
    }));

    artifact.image = add(box, field({
      label: "Plate image",
      kind: "select",
      options: plateOptions(),
      help: "The six placeholder photos that ship with this prototype, and nothing " +
        "else. There is no upload and no camera anywhere in this flow.",
      get: current("image"),
      set: sync
    }));

    return el;
  }

  /* --- TRUST -------------------------------------------------------------- */

  function trustSection() {
    var el = section("3 · The trust beat",
      "A named person saying what you did, or credentials that were checked. The " +
        "reference is the highest-leverage thing in this form — it is what removes " +
        "the argument for making anxious people record themselves.");
    var quote = {};
    var slot;

    function sync() {
      var next = {};

      setLeaf(next, "quote", quote.quote.control.value);
      setLeaf(next, "author", quote.author.control.value);
      setLeaf(next, "role", quote.role.control.value);
      setLeaf(next, "org", quote.org.control.value);
      setLeaf(next, "date", quote.date.control.value);

      /* The quote is what makes the reference exist; a credit with nothing above
         it is not a reference. testimonials[0] is the one the TRUST beat reads
         and a depth block quotes (shapes.js). */
      if (next.quote) {
        draft.testimonials[0] = next;
      } else {
        draft.testimonials.length = 0;
      }
    }

    function current(key) {
      return function () {
        return draft.testimonials[0] ? draft.testimonials[0][key] : "";
      };
    }

    quote.quote = add(el, field({
      label: "What they said",
      kind: "textarea",
      rows: 4,
      placeholder: "She is the one I put with the new grads, because she tells them " +
        "what went wrong on her own shifts.",
      help: "In their words, not yours.",
      budget: "quote",
      path: "testimonials",
      get: current("quote"),
      set: sync
    }));

    quote.author = add(el, field({
      label: "Who said it",
      placeholder: "Ruth Vandermeer",
      get: current("author"),
      set: sync
    }));

    quote.role = add(el, field({
      label: "Their role",
      placeholder: "Nurse manager, medical ICU",
      get: current("role"),
      set: sync
    }));

    quote.org = add(el, field({
      label: "Where",
      placeholder: "Lakeshore General Hospital",
      get: current("org"),
      set: sync
    }));

    quote.date = add(el, field({
      label: "When",
      placeholder: "2026-02",
      help: "Year and month.",
      get: current("date"),
      set: sync
    }));

    /* ------------------------------------------------------------------
       W9 MOUNTED HERE — and only W9.
       The six-question credential sub-flow, the derived tier line with its one
       sentence of why, and the LENZLI.cred.renderTierRow exhibit that shows the
       chrome each answer earned. No credential question anywhere in this form
       asks for a tier, a status or a trust beat: all three are derived and
       never chosen (F-11, A1-21).
       ------------------------------------------------------------------ */
    slot = make("div", "mk-credentials");
    slot.setAttribute("data-mk-credentials", "");
    mountCredentials(slot);
    el.appendChild(slot);

    return el;
  }

  /* --- TRUST: the credential sub-flow ------------------------------------- */

  /* ------------------------------------------------------------------------
   * WHERE THE PRODUCT TEACHES ITS OWN THESIS (SPEC § 4 D7).
   *
   * Six questions, and not one of them asks for a tier, a status or a trust
   * beat. The author says who issued it and whether anyone can check it, and the
   * ladder answers back: the derived tier line names what those answers earned,
   * one sentence says why, and beside them the exhibit redraws the credential at
   * exactly that chrome. A registry-backed licence gets a full card. A
   * credential nobody issued gets a bare text row with no chrome at all — no
   * border, no shadow, no background, no radius — and that withholding is the
   * argument the four-tier ladder exists to make.
   *
   * TIER IS SYSTEM-ASSIGNED, NEVER USER-CHOSEN (F-11). A user who could pick
   * their own tier would pick A, and the ladder would be decorative.
   * STATUS IS DERIVED AND NEVER OFFERED (A1-21): the two sanction words are
   * unreachable from here, because an issuer applies a sanction and nobody
   * self-reports one. Both facts are said out loud, once, beneath the tier:
   * this is what a check would say — you don't choose it.
   *
   * THE EXHIBIT IS LENZLI.cred.renderTierRow AND IS NEVER REIMPLEMENTED (E-8,
   * § 10). Tier D produces nothing at all in the deck path — buildDeck strips
   * it, renderChip returns null, pinOrder filters it out — so wave 0 added the
   * one primitive that renders a single credential at its earned chrome across
   * all four tiers. It returns a non-interactive <div> by design: a draft
   * credential belongs to no record yet, so a tap would resolve nowhere.
   *
   * THE CREDENTIALS ARE RECORD-SHAPED, WRITTEN STRAIGHT INTO draft.credentials[]
   * — the shape renderChip, renderTierRow and buildDeck already consume — so
   * W10's draftToRecord only has to serialize and re-derive. No parallel answer
   * structure outlives the question it answered: the object handed to deriveTier
   * is read off the boxes at sync time and dropped, and both questions survive
   * in the record itself (src/create/tier.js documents how, and re-derives).
   *
   * Two content rules that are not stylistic:
   *   - THE NAME IS THE ISSUER'S EXACT STRING, NEVER PRETTIFIED. A tidied-up
   *     name is a different credential from the one they issued.
   *   - A HOLDER-NAME MISMATCH IS DISPLAYED, NOT HIDDEN. A mismatch is
   *     information: it is the fact a reader needs for the check to land.
   * ------------------------------------------------------------------------ */

  /* Question 2's fourth answer. It is not an issuer type, which is why the
     record carries issuer:null under it — and it forces tier D whatever
     question 3 says (SPEC § 4 D7 step 3). */
  var NO_ISSUER = "nobody";

  var ISSUER_TYPES = [
    { value: "", label: "Not answered yet" },
    { value: "Government registry", label: "Government registry" },
    { value: "Certification body", label: "Certification body" },
    { value: "Training provider", label: "Training provider" },
    { value: NO_ISSUER, label: "nobody — this is my own claim" }
  ];

  /* Question 3, whose answer IS the tier (F-11). The values are the vocabulary
     src/create/tier.js maps; the labels are the question in the author's own
     terms. No label mentions a tier: the author answers about the world, and
     the ladder does the grading. */
  var CHECK_ANSWERS = [
    { value: "badge", label: "A signed digital badge" },
    { value: "registry", label: "A public registry anyone can look me up in" },
    { value: "page", label: "An issuer page, but nothing that verifies me specifically" },
    { value: "nothing", label: "nothing — this is my own claim" }
  ];

  /* The same four answers, read back from a credential that already carries a
     tier — which is how an edited record (W10) shows the author what it says
     rather than an unanswered group that would re-derive on the first keystroke.
     Tier D is deliberately absent: it is also the tier of a credential nobody
     has answered for yet, and preselecting an answer nobody gave would be the
     form putting words in the author's mouth. D is the floor either way. */
  var CHECK_BY_TIER = { A: "badge", B: "registry", C: "page" };

  /* Question 6. It reads as the negative because that is how the fact is
     actually known — you find out a credential is required when you cannot work
     without it. It is what pinOrder ranks first (SPEC § 4 D4) and one of the two
     clauses deriveTrustBeat tests. */
  var ROLE_ANSWERS = [
    { value: "no", label: "No — the job cannot be done without it" },
    { value: "yes", label: "Yes — it helps, but it is not required" }
  ];

  /* The ladder in its own words (src/credentials/legend.js's tier table). The
     tier line is TYPE, not a control: it reports a derivation, and there is
     nothing on it to press. */
  var TIER_LINE = {
    A: "Tier A — signed badge",
    B: "Tier B — registry check",
    C: "Tier C — issuer link",
    D: "Tier D — self-reported"
  };

  var TIER_WHY = {
    A: "The badge carries the issuer's own signature, so a reader checks the signature itself and never has to take your word for it.",
    B: "Anyone can look you up in the registry you named, so the check does not have to run through you.",
    C: "The issuer's page exists, and nothing on it verifies you specifically — so nothing was checked.",
    D: "Nobody issued this, so there is nothing for a reader to check. It stays on the record as your own claim, and it renders as one."
  };

  var DERIVED_NOTE = "this is what a check would say — you don't choose it.";

  /* The record's `type` array, which is where question 3's answer survives once
     the answers are gone (src/data/shapes.js): tier A ADDS the Open Badges type,
     because the signed proof is what makes it tier A, and tier D is the
     self-asserted type, because calling something nobody issued a verifiable
     credential would be a false claim. */
  function typeFor(tier) {
    if (tier === "D") {
      return ["SelfAssertedClaim"];
    }
    if (tier === "A") {
      return ["VerifiableCredential", "OpenBadgeCredential", "AchievementCredential"];
    }
    return ["VerifiableCredential", "AchievementCredential"];
  }

  /* A fresh credential answers nothing, so it is tier D and carries no status —
     the floor of the ladder, never the benefit of the doubt. The whole field set
     exists from the start, in the shape src/data/shapes.js documents, so no
     renderer ever meets a half-built credential.

     achievement.name is "" and not null on purpose: renderChip puts it straight
     into a title attribute, and setAttribute would stringify a null into the
     word for it. */
  function emptyCredential() {
    return {
      id: "urn:lenzli:cred:u-" + crypto.randomUUID(),
      type: typeFor("D"),
      tier: "D",
      status: null,
      selfAsserted: true,
      requiredForRole: false,
      issuer: null,
      credentialSubject: { holderName: null },
      achievement: { name: "", shortName: null, criteria: null, skills: [] },
      validFrom: null,
      validUntil: null,
      credentialId: null,
      verification: null,
      scope: null,
      renewal: null,
      discipline: null,
      evidenceUrl: null
    };
  }

  /* issuer.mark is the issuer's SHORT TEXT MARK and never an image file
     (shapes.js). The sub-flow asks the issuer's name, not its mark, so the mark
     is the initials of a multi-word name — "Amazon Web Services" gives AWS,
     "Illinois Dept. of Financial & Professional Regulation" gives IDFPR — and a
     one-word name stands as itself. Nothing is invented from nothing: an
     unanswered issuer has an empty mark, which reads as unfinished.

     This is not identity's initials() above. That one builds a two-letter
     monogram for a plate; these two do different jobs on different strings. */
  function markFor(name) {
    var words = str(name).trim().split(/\s+/).filter(Boolean);
    var out = "";

    if (!words.length) {
      return "";
    }
    if (words.length === 1) {
      return words[0];
    }
    words.forEach(function (word) {
      var letter = word.charAt(0);

      if (out.length < 5 && letter === letter.toUpperCase() &&
          letter.toUpperCase() !== letter.toLowerCase()) {
        out += letter;
      }
    });
    return out || words[0];
  }

  /* What the destination would answer, in the destination's own vocabulary —
     the five facts a registry page returns (shapes.js; walletCard.js's verify
     sheet reads exactly these). Every one is composed from an answer the author
     already gave, so nothing is invented; a real product reads them off the
     registry instead. Without it, the verify action on a published credential
     would open a sheet with nothing in it. */
  function mockResultFor(c) {
    return {
      status: LENZLI.cred && typeof LENZLI.cred.statusWord === "function"
        ? LENZLI.cred.statusWord(c.status)
        : "",
      credential: c.achievement.name,
      holder: c.credentialSubject.holderName || "",
      activeSince: c.validFrom || "",
      expiresOn: c.validUntil || ""
    };
  }

  /* THE DERIVATION, and the only place a credential's tier and status change.
     `answers` is transient: read off the boxes, handed to deriveTier, dropped.
     Everything durable lands on the record in the shape the renderers consume.

     FOUR strings are set to "" rather than null when they are unanswered —
     issuer.mark, verification.verifier, verification.destination and
     credentialSubject.holderName. Those four are the ones chip.js and
     walletCard.js CONCATENATE ("Verified — signed by " + mark, "Verify at " +
     destination, "Issued to " + holderName), where a null renders as the word
     for it. holderName was the one the original list missed, and it printed
     "Issued to null" on the wallet card of every credential whose author left
     the optional name box empty; walletCard.js now also composes that line from
     present fields only, so the two halves hold independently. Every other
     absent leaf is null, as shapes.js requires. */
  function applyAnswers(c, answers) {
    var tier = LENZLI.create.deriveTier({
      issuerType: answers.issuerType,
      check: answers.check
    });
    var dated = tier === "A" || tier === "B";
    var checked;

    c.tier = tier;
    c.type = typeFor(tier);
    c.selfAsserted = tier === "D";
    c.achievement.name = answers.name;
    c.credentialSubject.holderName = answers.holderName || "";
    c.requiredForRole = answers.requiredForRole;

    /* Nobody issued it, so there is no issuer, no check, no page and no dates —
       not empty ones, none at all (shapes.js: tier D is issuer:null AND
       verification:null). */
    if (tier === "D") {
      c.issuer = null;
      c.verification = null;
      c.evidenceUrl = null;
      c.validFrom = null;
      c.validUntil = null;
      c.status = LENZLI.create.deriveStatus(tier, null);
      return;
    }

    c.issuer = {
      name: answers.issuerName || null,
      type: answers.issuerType || null,
      mark: markFor(answers.issuerName)
    };
    c.evidenceUrl = tier === "C" ? answers.evidenceHost || null : null;
    c.validFrom = dated ? answers.validFrom || null : null;
    c.validUntil = dated ? answers.validUntil || null : null;
    /* A sanction is what an ISSUER did to a holder, and no derivation can
       return one (A1-21) — so carry it through instead of re-deriving it
       away. Without this, editing a seeded person's revoked credential in
       the sub-flow quietly reports it active: the create flow announcing a
       check that never ran, which is the one thing the ladder exists to
       prevent. Mirrors draft.js's guard on the publish path (W10 ledger
       D15-3, which reported this residual and could not reach this line). */
    c.status = (c.status === "suspended" || c.status === "revoked")
      ? c.status
      : LENZLI.create.deriveStatus(tier, c.validUntil);

    /* Tier C is the tier where nothing was checked, so it carries no
       verification object at all — that absence IS the tier-C condition
       (shapes.js). At tier A the signature is the proof, so the verifier is the
       issuer itself; at tier B it is the registry the author named. */
    if (tier === "C") {
      c.verification = null;
      return;
    }
    /* A FRESHNESS FIGURE IS THE RESULT OF A CHECK, and no derivation can return
       one — the same reason a sanction is carried through above (A1-21), and the
       same class of error the sanction fix removed: the ladder reporting what no
       check returned. This object is rebuilt whole on every keystroke, so
       without carrying the figure across, editing any box of a SEEDED credential
       silently reset its authored "checked 3 days ago" to zero.

       A credential this form creates has no prior figure and stands at 0, which
       chip.js renders as "checked today" rather than "checked 0 days ago" — F-7
       freezes the clock at BUILD_DATE and the create UI says today and means it.
       Switching a credential down to tier C or D and back does lose the figure,
       because those two tiers carry no verification object at all by
       construction (shapes.js) and there is nowhere on the record to park it. */
    checked = c.verification && typeof c.verification.checkedDaysAgo === "number"
      ? c.verification.checkedDaysAgo
      : 0;

    c.verification = {
      verifier: (tier === "A" ? answers.issuerName : answers.verifier) || "",
      checkedDaysAgo: checked,
      destination: answers.destination || "",
      mockResult: null
    };
    c.verification.mockResult = mockResultFor(c);
  }

  /* § 3.5's choice group: a real <fieldset> of visually hidden NATIVE radios,
     each paired with a .mk-choice-label pill on .switch's ink-pill idiom. Native
     semantics are kept so the arrow keys select within the group — safe
     precisely because wave 0's E-2 guard stops the deck eating them (A1-27).
     The checked radio is the single source of truth for the answer; no variable
     shadows it.

     depthSection's kindChoice above is not reused: that one repaints a block
     body and deletes the old kind's keys, and neither happens here. */
  function choice(legendText, options, picked, onPick) {
    var set = make("fieldset", "mk-choice");
    var list = make("div", "mk-choice-list");
    var name = uid();

    set.appendChild(make("legend", "mk-choice-legend", legendText));

    options.forEach(function (option) {
      var id = uid();
      var radio = make("input");
      var label = make("label", "mk-choice-label", option.label);

      radio.type = "radio";
      radio.name = name;
      radio.value = option.value;
      radio.id = id;
      radio.checked = option.value === picked;
      label.setAttribute("for", id);

      radio.addEventListener("change", function () {
        if (radio.checked) {
          onPick();
        }
      });

      list.appendChild(radio);
      list.appendChild(label);
    });

    set.appendChild(list);
    return set;
  }

  function pickedIn(set) {
    var picked = set.querySelector("input:checked");

    return picked ? picked.value : "";
  }

  /* A mismatch between the name as issued and the name on the reel is
     DISPLAYED, NOT HIDDEN (SPEC § 4 D7 step 4). It is not an error and it is not
     corrected: a licence issued under a former name is an ordinary case, and
     hiding it removes the one fact a reader needs for the check to land. The
     comparison is literal, because "Dana Okafor" and "Dana Okafor, RN" really
     are two different strings at the registry's box. */
  function mismatchLine(c) {
    var issued = str(c.credentialSubject.holderName).trim();
    var profile = str(identityOf().name).trim();

    if (!issued || !profile || issued === profile) {
      return "";
    }
    return "Issued to " + issued + " · your reel says " + profile +
      ". Both are shown — a mismatch is information, not a mistake.";
  }

  function statusLine(c) {
    var word = LENZLI.cred && typeof LENZLI.cred.statusWord === "function"
      ? LENZLI.cred.statusWord(c.status)
      : "";

    if (c.tier === "D") {
      return "No status word: nothing was checked, so there is nothing to report either way.";
    }
    return word ? "Status: " + word : "";
  }

  /* One credential: six questions, the derived panel, and the exhibit. The block
     registers a paint() that redraws everything derived from the record, and
     compile() calls it — so the mismatch line tracks the profile name in the
     hook section as it is typed, and not only this block's own boxes. */
  function credentialBlock(c) {
    var box = make("section", "mk-block");
    var head = make("div", "mk-block-head");
    var title = make("h4", "mk-block-title", "Credential");
    var remove = button("ctl mk-remove", "Remove");
    var body = make("div", "mk-block-body");
    var derived = make("div", "mk-derived");
    var tierLine = make("p", "mk-tier");
    var whyLine = make("p", "mk-tier-why");
    var statusText = make("p", "mk-tier-status");
    var mismatch = make("p", "mk-mismatch");
    var exhibit = make("div", "mk-exhibit");
    var exhibitRow = make("div", "mk-exhibit-row");
    var boxes = {};
    var checkSet;
    var roleSet;

    head.appendChild(title);
    head.appendChild(remove);
    box.appendChild(head);
    box.appendChild(body);

    /* The credential is found by identity at click time, not by a captured
       position: the list above it can change while this block is on screen. */
    remove.addEventListener("click", function () {
      var at = draft.credentials.indexOf(c);

      if (at === -1) {
        return;
      }
      draft.credentials.splice(at, 1);
      credPanels = credPanels.filter(function (panel) {
        return panel.cred !== c;
      });
      credList.removeChild(box);
      renumberCredentials();
      compile();
      credAdd.focus();
    });

    /* The only thing that ever produces an answers object, and it does not
       survive this call. A box the current tier hides is not read: its text
       stays in the form, so switching back brings it with you, while the record
       carries only the answers that belong to the tier actually earned. */
    function read() {
      return {
        name: boxes.name.control.value.trim(),
        issuerName: boxes.issuerName.control.value.trim(),
        issuerType: boxes.issuerType.control.value,
        check: pickedIn(checkSet),
        verifier: boxes.verifier.block.hidden ? "" : boxes.verifier.control.value.trim(),
        destination: boxes.destination.block.hidden ? "" : boxes.destination.control.value.trim(),
        evidenceHost: boxes.evidenceHost.block.hidden ? "" : boxes.evidenceHost.control.value.trim(),
        holderName: boxes.holderName.control.value.trim(),
        validFrom: boxes.validFrom.block.hidden ? "" : boxes.validFrom.control.value.trim(),
        validUntil: boxes.validUntil.block.hidden ? "" : boxes.validUntil.control.value.trim(),
        requiredForRole: pickedIn(roleSet) === "no"
      };
    }

    function sync() {
      applyAnswers(c, read());
    }

    /* Boxes that belong to a tier the answers did not earn are hidden rather
       than removed, so the radio the author is standing on keeps its focus and
       the arrow keys keep moving through the group. */
    function paint() {
      var tier = c.tier;
      var dated = tier === "A" || tier === "B";

      boxes.verifier.block.hidden = tier !== "B";
      boxes.destination.block.hidden = !dated;
      boxes.evidenceHost.block.hidden = tier !== "C";
      boxes.validFrom.block.hidden = !dated;
      boxes.validUntil.block.hidden = !dated;

      tierLine.textContent = TIER_LINE[tier];
      whyLine.textContent = TIER_WHY[tier];
      statusText.textContent = statusLine(c);

      mismatch.textContent = mismatchLine(c);
      mismatch.hidden = !mismatch.textContent;

      /* THE EXHIBIT. The engine primitive draws it and this surface draws
         nothing: E-8 exists precisely so § 10's no-reimplementation rule is
         satisfied rather than excepted. Only a truthy return is appended, the
         way cards.js appends a chip. */
      exhibitRow.textContent = "";
      if (LENZLI.cred && typeof LENZLI.cred.renderTierRow === "function") {
        appendIf(exhibitRow, LENZLI.cred.renderTierRow(c));
      }
    }

    /* 1 — what is it called */
    boxes.name = add(body, field({
      label: "What is it called?",
      placeholder: "Registered Nurse — Illinois",
      help: "The issuer's exact string, letter for letter. A tidied-up version is a " +
        "different credential from the one they issued, and it is the version a check " +
        "would fail to find.",
      get: function () { return c.achievement.name; },
      set: sync
    }));

    /* 2 — who issued it */
    boxes.issuerName = add(body, field({
      label: "Who issued it?",
      placeholder: "Illinois Dept. of Financial & Professional Regulation",
      help: "Their full name, as they write it themselves.",
      get: function () { return c.issuer ? c.issuer.name : ""; },
      set: sync
    }));

    boxes.issuerType = add(body, field({
      label: "What kind of issuer are they?",
      kind: "select",
      options: ISSUER_TYPES,
      help: "The last answer is not an issuer at all, and it settles the tier on its own.",
      get: function () { return c.issuer ? c.issuer.type : ""; },
      set: sync
    }));

    /* 3 — can anyone check it. THE ANSWER ASSIGNS THE TIER (F-11). */
    checkSet = choice("Can anyone check it?", CHECK_ANSWERS, CHECK_BY_TIER[c.tier] || "",
      function () {
        sync();
        paintCredentialPanels();
        compile();
      });
    body.appendChild(checkSet);

    boxes.verifier = add(body, field({
      label: "Which registry?",
      placeholder: "Nursys",
      help: "The name a reader sees when the lookup comes back.",
      get: function () { return c.verification ? c.verification.verifier : ""; },
      set: sync
    }));

    boxes.destination = add(body, field({
      label: "Where would someone check it?",
      placeholder: "nursys.com",
      help: "A host, written plainly. Nothing in this prototype opens it — the verify " +
        "action shows a labelled mock and makes no network call of any kind.",
      get: function () { return c.verification ? c.verification.destination : ""; },
      set: sync
    }));

    boxes.evidenceHost = add(body, field({
      label: "Which page carries it?",
      placeholder: "blackmagicdesign.com",
      help: "The issuer's page. It exists, and it says nothing about you specifically — " +
        "which is the whole of what this tier claims.",
      get: function () { return c.evidenceUrl; },
      set: sync
    }));

    /* 4 — the name as issued, and the mismatch that is shown rather than hidden */
    boxes.holderName = add(body, field({
      label: "What name was it issued to?",
      placeholder: "Dana A. Okafor",
      help: "As it is printed on the credential, even where that is not the name on " +
        "your reel.",
      get: function () { return c.credentialSubject.holderName; },
      set: sync
    }));

    mismatch.hidden = true;
    body.appendChild(mismatch);

    /* 5 — the dates, for the two tiers where a check ran */
    boxes.validFrom = add(body, field({
      label: "Issued on",
      placeholder: "2019-05-14",
      help: "Year-month-day.",
      get: function () { return c.validFrom; },
      set: sync
    }));

    boxes.validUntil = add(body, field({
      label: "Good until",
      placeholder: "2027-05-31",
      help: "Year-month-day. Leave it empty if it does not expire. Today is " +
        LENZLI.BUILD_DATE + " in this prototype, and every date here is read against it.",
      get: function () { return c.validUntil; },
      set: sync
    }));

    /* 6 — could you do this job without it */
    roleSet = choice("Could you do this job without it?", ROLE_ANSWERS,
      c.requiredForRole ? "no" : "",
      function () {
        sync();
        paintCredentialPanels();
        compile();
      });
    body.appendChild(roleSet);
    body.appendChild(make("p", "mk-help",
      "This is the first thing the wallet ranks on, and one of the two things that " +
        "decide whether this reel leads with credentials or with the reference."));

    /* The derived panel: what the answers earned, why, and the chrome itself. */
    derived.appendChild(tierLine);
    derived.appendChild(whyLine);
    derived.appendChild(statusText);
    derived.appendChild(make("p", "mk-tier-note", DERIVED_NOTE));

    exhibit.appendChild(make("p", "mk-exhibit-label", "How it renders"));
    exhibit.appendChild(exhibitRow);
    derived.appendChild(exhibit);
    box.appendChild(derived);

    credPanels.push({ cred: c, paint: paint });
    paint();

    return box;
  }

  function appendIf(parent, node) {
    if (node) {
      parent.appendChild(node);
    }
  }

  /* Blocks are appended and removed one at a time rather than rebuilt as a list,
     which is where this differs from renderDepth above: a credential's boxes
     hold answers the tier it currently sits at does not carry on the record, and
     a rebuild would read them back off that record and lose them. Only the
     numbering is positional, so only the numbering is repainted. */
  function renumberCredentials() {
    var titles = credList.querySelectorAll(".mk-block-title");
    var i;

    for (i = 0; i < titles.length; i += 1) {
      titles[i].textContent = "Credential " + (i + 1);
    }
    credEmpty.hidden = draft.credentials.length > 0;
  }

  /* Called from compile(), so every derived line stays current whichever box was
     typed in — including the mismatch, which reads the name out of the hook
     section three sections above it. */
  function paintCredentialPanels() {
    credPanels.forEach(function (panel) {
      panel.paint();
    });
  }

  function mountCredentials(slot) {
    var wrap = group(slot, "Credentials",
      "Each one is asked about in the same six steps, and those answers decide how it " +
        "renders. You never pick the tier.");

    credPanels = [];
    credList = make("div", "mk-blocks");
    credEmpty = make("p", "mk-section-note",
      "No credentials yet. A reel works without any — the reference above carries the " +
        "trust beat instead.");
    credAdd = button("ctl mk-add", "Add a credential");

    credAdd.addEventListener("click", function () {
      var c = emptyCredential();
      var block = credentialBlock(c);
      var first;

      draft.credentials.push(c);
      credList.appendChild(block);
      renumberCredentials();
      compile();

      first = block.querySelector("input, textarea, select");
      if (first) {
        first.focus();
      }
    });

    wrap.appendChild(credList);
    wrap.appendChild(credEmpty);
    wrap.appendChild(credAdd);

    /* Non-empty on arrival only in edit mode, which is W10's: the blocks are
       built from whatever the draft already carries. */
    draft.credentials.forEach(function (c) {
      credList.appendChild(credentialBlock(c));
    });
    renumberCredentials();
  }

  /* --- CLOSE -------------------------------------------------------------- */

  function closeSection() {
    var el = section("4 · The close",
      "What you take on, what it costs, and one way to start.");

    add(el, field({
      label: "What you take on",
      kind: "textarea",
      rows: 3,
      placeholder: "ICU float\nRapid response\nNew-grad precepting",
      help: "One per line, three to five, in the words a client would use.",
      get: function () { return (closeOf().scope || []).join("\n"); },
      set: function (value) {
        closeOf().scope = str(value).split("\n").map(function (line) {
          return line.trim();
        }).filter(Boolean);
      }
    }));

    add(el, field({
      label: "Rate band",
      placeholder: "$68-78/hr, per-diem",
      get: function () { return closeOf().rateBand; },
      set: function (value) { setLeaf(closeOf(), "rateBand", value); }
    }));

    add(el, field({
      label: "Response time",
      placeholder: "Replies within a day",
      get: function () { return closeOf().responseTime; },
      set: function (value) { setLeaf(closeOf(), "responseTime", value); }
    }));

    add(el, field({
      label: "Timezone",
      placeholder: "CT",
      get: function () { return closeOf().timezone; },
      set: function (value) { setLeaf(closeOf(), "timezone", value); }
    }));

    /* THE ONE CALL TO ACTION — exactly one field, never a menu (SPEC § 4 D7 kill
       list, assertion 26). [data-mk-cta] marks it, and it is the only node on
       this surface that carries the attribute. `action` is fixed to the mock the
       deck already renders; nothing is ever sent. */
    add(el, field({
      label: "The call to action",
      placeholder: "Ask about a per-diem shift",
      help: "Exactly one, and this is it. A menu of ways to reach you is how a reel " +
        "loses its ending.",
      path: "close.cta",
      get: function () { return closeOf().cta ? closeOf().cta.label : ""; },
      set: function (value) {
        var label = str(value).trim();

        if (label) {
          closeOf().cta = { label: label, action: "mock" };
        } else {
          delete closeOf().cta;
        }
      }
    })).control.setAttribute("data-mk-cta", "");

    return el;
  }

  /* --- depth -------------------------------------------------------------- */

  /* Visibly separated from the spine above, because the evidence says these
     cards are largely unseen and effort spent here is effort not spent on the
     four that are not. Exactly two kinds are offered (§ 4 D7): video is not,
     because upload is forbidden and the camera stays out of the authoring path,
     and wallet is not, because it is derived from credentials.length. */
  function depthSection() {
    var el = section("Optional depth",
      "The four cards above are the reel. These are extra, and most viewers never " +
        "reach them — add one only if it earns its place. Three at most.");

    depthHost = make("div", "mk-blocks");
    depthAdd = button("ctl mk-add", "Add a depth card");
    depthCap = make("p", "mk-section-note", "Three is the cap. Remove one to add another.");

    depthAdd.addEventListener("click", function () {
      var first;
      var added;

      if (draft.depth.length >= MAX_DEPTH) {
        return;
      }
      /* Artifact is the opening kind because the generic no-kind prompt names
         four shapes, two of which this form does not offer. An artifact block
         with no name compiles to a labelled unfinished card and throws nothing
         (E-9, assertion 37). */
      draft.depth.push({ kind: "artifact" });
      renderDepth();
      compile();

      /* SCOPED TO THE BLOCK JUST APPENDED, not to the host. depthHost holds
         every block, so a host-wide query returns card 1's first control and
         adding card 2 or 3 sent the author back to the top of the list they were
         extending. The credential add above scopes to its own new block; this is
         the same query, resolved by position because renderDepth() rebuilds the
         whole list and no node survives the call to be held across it. */
      added = depthHost.children[draft.depth.length - 1];
      first = added && added.querySelector("input, textarea, select");
      if (first) {
        first.focus();
      }
    });

    el.appendChild(depthHost);
    el.appendChild(depthAdd);
    el.appendChild(depthCap);

    renderDepth();
    return el;
  }

  function renderDepth() {
    depthHost.textContent = "";
    draft.depth.forEach(function (block, position) {
      depthHost.appendChild(depthBlock(block, position));
    });
    depthAdd.disabled = draft.depth.length >= MAX_DEPTH;
    depthCap.hidden = draft.depth.length < MAX_DEPTH;
  }

  function depthBlock(block, position) {
    var box = make("section", "mk-block");
    var head = make("div", "mk-block-head");
    var remove = button("ctl mk-remove", "Remove");
    var body = make("div", "mk-block-body");

    head.appendChild(make("h3", "mk-block-title", "Depth card " + (position + 1)));
    head.appendChild(remove);
    box.appendChild(head);

    /* The block's index is looked up at click time, not captured at build time:
       removing one rebuilds this whole list, and a captured position would then
       point at whatever slid into its place. */
    remove.addEventListener("click", function () {
      var at = draft.depth.indexOf(block);

      if (at === -1) {
        return;
      }
      draft.depth.splice(at, 1);
      renderDepth();
      compile();
      depthAdd.focus();
    });

    box.appendChild(kindChoice(block, body));
    box.appendChild(body);
    fillBlock(block, body);

    return box;
  }

  /* § 3.5's choice group: a real <fieldset> of visually hidden native radios,
     each paired with a .mk-choice-label pill on .switch's ink-pill idiom. Native
     semantics are kept so arrow keys select within the group — which is safe
     precisely because wave 0's E-2 guard stops the deck eating them (A1-27).
     Only the block's BODY is repainted on a change, so the radio the author is
     standing on keeps focus and the arrow keys keep working. */
  function kindChoice(block, body) {
    var set = make("fieldset", "mk-choice");
    var list = make("div", "mk-choice-list");
    var name = uid();
    var kinds = [
      { value: "artifact", label: "An artifact" },
      { value: "testimonial", label: "A reference" }
    ];

    set.appendChild(make("legend", "mk-choice-legend", "What this card shows"));

    kinds.forEach(function (kind) {
      var id = uid();
      var radio = make("input");
      var label = make("label", "mk-choice-label", kind.label);

      radio.type = "radio";
      radio.name = name;
      radio.value = kind.value;
      radio.id = id;
      radio.checked = block.kind === kind.value;
      label.setAttribute("for", id);

      radio.addEventListener("change", function () {
        if (!radio.checked || block.kind === kind.value) {
          return;
        }
        /* Fields belong to the kind that declared them. Switching drops the old
           kind's keys rather than leaving them on a record no compiler will ever
           read them from (shapes.js's block shapes). */
        Object.keys(block).forEach(function (key) {
          delete block[key];
        });
        block.kind = kind.value;
        fillBlock(block, body);
        compile();
      });

      list.appendChild(radio);
      list.appendChild(label);
    });

    set.appendChild(list);
    return set;
  }

  function fillBlock(block, body) {
    body.textContent = "";

    if (block.kind === "testimonial") {
      /* The block renders the RECORD's testimonial and never carries its own
         (shapes.js), so there is nothing to type here: it puts the reference
         written in beat 3 on a card of its own. */
      block.index = 0;
      body.appendChild(make("p", "mk-help",
        "This card shows the reference from beat 3. Write it there and it appears " +
          "here."));
      return;
    }

    add(body, field({
      label: "What it is called",
      placeholder: "Q3 onboarding pathway",
      help: "The card stays unfinished until this has a name.",
      get: function () { return block.label; },
      set: function (value) { setLeaf(block, "label", value); }
    }));

    add(body, field({
      label: "Plate text",
      placeholder: "6-week pathway",
      help: "Short text drawn on the plate. Defaults to the name above.",
      get: function () { return block.plate; },
      set: function (value) { setLeaf(block, "plate", value); }
    }));

    add(body, field({
      label: "Your part in it",
      placeholder: "I wrote it; the unit still runs it.",
      budget: "caption",
      get: function () { return block.caption; },
      set: function (value) { setLeaf(block, "caption", value); }
    }));

    add(body, field({
      label: "Plate image",
      kind: "select",
      options: plateOptions(),
      get: function () { return block.image; },
      set: function (value) { setLeaf(block, "image", value); }
    }));
  }

  /* --- the draft on this machine ------------------------------------------ */

  /* The short name only (AM-11): LENZLI.store prefixes it to
     lenzli.pivot.v1.draft internally, and no key literal is written here.
     A storage failure never reaches this surface — store.set try/catches, keeps
     the value in an in-memory map so the session continues, sets
     available = false and has already told the viewer through LENZLI.app.notice
     (§ 3.3). A second notice here would say the same thing twice, and a throw
     would take the form down over a saved copy nobody asked for. */
  function saveDraft() {
    LENZLI.store.set("draft", draft);
  }

  /* The six containers every accessor in this file assumes it can read. A record
     out of the store carries all six; bytes parsed back out of storage might
     not, and an absent array would surface as a TypeError three sections into
     the form instead of here. */
  function normalised(value) {
    var out = value && typeof value === "object" && !Array.isArray(value) ? value : {};

    if (!out.identity || typeof out.identity !== "object") {
      out.identity = {};
    }
    if (!out.outcome || typeof out.outcome !== "object") {
      out.outcome = {};
    }
    if (!out.close || typeof out.close !== "object") {
      out.close = {};
    }
    if (!Array.isArray(out.close.scope)) {
      out.close.scope = [];
    }
    if (!Array.isArray(out.credentials)) {
      out.credentials = [];
    }
    if (!Array.isArray(out.testimonials)) {
      out.testimonials = [];
    }
    if (!Array.isArray(out.depth)) {
      out.depth = [];
    }
    return out;
  }

  /* The draft survives a reload (§ 3.3). It is read once per page load and at
     the first mount rather than at load, so a session that never opens this
     surface never touches storage; after that the in-memory draft is always the
     newer copy, because every change writes it. */
  function restoreDraft() {
    var saved;

    if (restored) {
      return;
    }
    restored = true;

    saved = LENZLI.store.get("draft");
    if (saved && typeof saved === "object" && !Array.isArray(saved)) {
      draft = normalised(saved);
    }
  }

  /* § 4 D8's reset block promises in its own copy that it clears "the draft in
     progress", and records.reset() could not reach this: the draft is a
     module-level object that outlives a mount on purpose, so removing the stored
     key left the in-memory copy standing, the next compile() wrote it straight
     back, and — because it still carried the id of the record reset had just
     deleted — a second Publish re-created that record at its old address.

     `restored` GOES WITH IT, and clearing that flag alone would be worse than
     doing nothing: restoreDraft only REPLACES the draft when storage holds one,
     so on the empty store reset just left behind it would fall straight through
     and the stale draft would survive anyway. Both, or neither.

     Published rather than reached across: src/store/records.js owns the reset
     sequence and this file owns the draft, and § 3.1's stub rule is what lets
     the store call it in a tree where src/create/ has not landed. */
  LENZLI.create.clearDraft = function () {
    draft = emptyDraft();
    restored = false;
  };

  /* --- edit mode ----------------------------------------------------------- */

  /* #/create/<personaId> loads that record into the draft (§ 4 D7). The route
     names no step (§ 3.4.1 M8), so the form simply opens on the draft as it is.

     Three cases, and only the third rebuilds anything:
       no id            — #/create: the draft in hand is the draft.
       the draft's own  — the publish transition, which MUST not remount: that is
                          the case § 3.4's corrected guard exists for (audit H6).
       another record   — a real edit-mode load.
     An id that resolves to nothing is SURFACED, never redirected (§ 3.4): the
     draft stays and the line under publish says so. Rebuilding on a miss would
     also destroy the mounted form, which is what assertion 12 tests by
     navigating to #/create/u-test.

     The record is COPIED before it becomes the draft. records.get hands back the
     live seed object for a seeded id, and § 3.3 keeps seeds unmutated: editing a
     seeded person writes an overlay that shadows the seed, and the seed itself is
     never touched. */
  function loadRoute() {
    var id = routeParams.personaId;
    var record;

    unknownId = "";

    if (!id || id === draft.id) {
      return false;
    }

    record = LENZLI.records.get(id);
    if (!record) {
      unknownId = id;
      return false;
    }

    draft = normalised(JSON.parse(JSON.stringify(record)));
    return true;
  }

  /* --- publish ------------------------------------------------------------- */

  /* buildDeck's depth guards, mirrored as data. validatePersona covers
     registerPersona's ten structural guards and buildDeck's four core beats and
     stops there (src/data/shapes.js), so an unfinished DEPTH block is the one
     way this form can produce a record that compiles in the preview — partial
     mode draws it as an unfinished card, which assertion 37 requires — and
     throws the moment anything compiles it for real. Publish is where that
     difference has to be said out loud, in the author's terms.

     The video case is unreachable from this form, which offers artifact and
     testimonial only; it is here because edit mode can load a seeded record that
     carries a video block, and the guard it mirrors (build.js) is real. */
  /* buildDeck's four shapes (build.js), restated here because this mirror has to
     know them to refuse a fifth. The form offers two of them; the other two
     reach a draft only through edit mode on a seeded record. */
  var DEPTH_KINDS = ["artifact", "video", "testimonial", "wallet"];

  function depthProblems(record) {
    var blocks = Array.isArray(record.depth) ? record.depth : [];
    var problems = [];

    function flag(position, message) {
      problems.push({ field: "depth", message: "Depth card " + (position + 1) + " " + message });
    }

    blocks.forEach(function (block, position) {
      var quotes = Array.isArray(record.testimonials) ? record.testimonials : [];
      var video;

      if (!block || !block.kind) {
        flag(position, "has not been told what it shows. Pick one, or remove the card.");
        return;
      }
      if (block.kind === "artifact" && !block.label) {
        flag(position, "has no name yet. Name the work, or remove the card.");
        return;
      }
      if (block.kind === "testimonial" && !quotes[block.index || 0]) {
        flag(position, "shows the reference from beat 3, and there is no reference yet.");
        return;
      }
      if (block.kind === "video") {
        video = record[block.ref || "video"];
        if (!video || !Array.isArray(video.captions)) {
          flag(position, "is a video card, and this record carries no caption track.");
        }
        return;
      }

      /* THE FIFTH GUARD, which this mirror was missing. build.js:285-286 throws
         on any kind outside the four shapes, and without this branch a block
         like {kind:"typo"} passed validatePersona AND passed here, published,
         and then threw uncaught on #/r/<id>. Unreachable from this form, which
         offers two kinds — but so is the video case above it, and a mirror that
         covers four of five guards is the divergence this build was already
         bitten by once. Same list of shapes, in the same order as the guard. */
      if (DEPTH_KINDS.indexOf(block.kind) === -1) {
        flag(position, "is set to something this reel cannot show. The four shapes are " +
          "artifact, video, testimonial and wallet.");
      }
    });

    return problems;
  }

  /* chip.js composes the attributed verifier by CONCATENATION — "Verified —
     signed by " + issuer.mark at tier A, "Verified with " + verification.verifier
     at tier B — so a tier A credential with no issuer name, and a tier B one with
     no registry name, each render a dangling `"Verified — signed by "` and
     `"Verified with "`. That is the unqualified minted trust mark F-9 and the
     sibling SPEC's D1 exist to refuse, and it is the one thing a four-tier ladder
     must never say. validatePersona cannot carry it: it mirrors registerPersona's
     structural guards and buildDeck's core-beat guards, and neither looks inside
     a credential — so this rides beside depthProblems, which is here for exactly
     the same reason.

     It is a DATA problem in the same refusal list as everything else, and NOT a
     disabled control. A1-20's "warns, never blocks" scopes to the word budget;
     publish still always answers, and the answer is the list beneath it. The
     author is offered the other way out in the message itself, because changing
     the check answer is a legitimate fix and not a defeat: a credential whose
     registry nobody can name is a tier the ladder already has a rung for. */
  function credentialProblems(record) {
    var list = Array.isArray(record.credentials) ? record.credentials : [];
    var problems = [];

    function flag(position, message) {
      problems.push({
        field: "credentials",
        message: "Credential " + (position + 1) + " " + message
      });
    }

    list.forEach(function (c, position) {
      if (!c) {
        return;
      }
      /* Tier A's chip says who SIGNED it, and the mark it prints is derived from
         the issuer's name (markFor above returns "" for an unanswered one and a
         non-empty string for every answered one), so the name is the guard. */
      if (c.tier === "A" && !(c.issuer && c.issuer.name)) {
        flag(position, "says a signature proves it, and the chip has to name who signed. " +
          "Add the issuer, or answer the check question differently.");
        return;
      }
      if (c.tier === "B" && !(c.verification && c.verification.verifier)) {
        flag(position, "says a registry can check it, and the chip has to name that registry. " +
          "Add it, or answer the check question differently.");
      }
    });

    return problems;
  }

  /* The line is unhidden BEFORE the words land in it: it carries role="status",
     and a live region that is still hidden when its text changes is a region a
     screen reader has no reason to read out. */
  function say(text) {
    var words = str(text);

    if (!saidLine) {
      return;
    }
    saidLine.hidden = !words;
    saidLine.textContent = words;
  }

  function clearOutcome() {
    say("");
    if (problemList) {
      problemList.textContent = "";
      problemList.hidden = true;
    }
  }

  function listProblems(problems) {
    var seen = [];

    if (!problemList) {
      return;
    }
    problemList.textContent = "";
    problems.forEach(function (problem) {
      if (seen.indexOf(problem.message) !== -1) {
        return;
      }
      seen.push(problem.message);
      problemList.appendChild(make("li", "mk-problem-item", problem.message));
    });
    problemList.hidden = !seen.length;
  }

  /* Refusing is not blocking: nothing was ever switched off, and the author
     finds out what is missing at the boxes that are missing it. Every field is
     marked touched first, because until publish is pressed a blank form is
     unfinished rather than wrong (showProblems above) — and pressing publish is
     the moment that stops being true. */
  function refuse(problems) {
    fields.forEach(function (entry) {
      entry.touched = true;
    });
    refreshProblems();
    say("Nothing was published: this reel is not finished yet.");
    listProblems(problems);
  }

  /* The record appears in the directory the moment it is saved (§ 4 D7), and
     then the hash names it. router.go writes the hash and nothing else, so the
     same-route guard takes it from there: the surface is not remounted, the form
     keeps every box the author is standing in, and onParams re-reads the id
     (§ 3.4, audit H6). */
  function publish() {
    var record = LENZLI.create.draftToRecord(draft);
    var problems = LENZLI.validatePersona(record).problems
      .concat(credentialProblems(record))
      .concat(depthProblems(record));
    var saved;

    if (problems.length) {
      refuse(problems);
      return;
    }

    saved = LENZLI.records.save(record);

    if (!saved) {
      /* records.save answers null only when it refused the write, and it has
         already said why — through app.notice for stored bytes from another
         version it will not overwrite, or through console.warn for a record that
         does not survive a JSON round-trip. Repeating it here adds no fact. */
      say("Nothing was published. The notice line at the top of the app says why.");
      return;
    }

    /* The id goes back into the DRAFT and not only into the record: the hash
       change below then names the draft's own id, which is the one case
       loadRoute does nothing for, and a second press updates this record instead
       of minting another one beside it. */
    draft.id = saved.id;
    saveDraft();
    say("Published. It is in search now, and this address is its own.");
    LENZLI.router.go("/create/" + saved.id);
  }

  function sayUnknownId() {
    if (unknownId) {
      say("No reel is saved at this address, so this one is new. Publishing gives it an " +
        "address of its own.");
    }
  }

  /* ONE control, and it is never disabled — not by the word budget (A1-20) and
     not by anything else. A form whose single action goes dead under the
     author's hand cannot say why it did; this one always answers, and when the
     record would not compile the answer is the list beneath it. */
  function mountActions(slot) {
    publishBtn = button("cta mk-publish", "Publish this reel");
    saidLine = make("p", "mk-said");
    problemList = make("ul", "mk-problems");

    publishBtn.setAttribute("data-mk-publish", "");
    publishBtn.addEventListener("click", publish);

    /* The outcome is announced where it is read: pressing publish moves no
       focus, so a viewer who cannot see the line would otherwise get silence. */
    saidLine.setAttribute("role", "status");
    saidLine.hidden = true;
    problemList.hidden = true;

    slot.appendChild(publishBtn);
    slot.appendChild(make("p", "mk-standing",
      "The draft is kept on this machine as you type. Publishing puts the reel in " +
        "search and gives it an address you can open."));
    slot.appendChild(saidLine);
    slot.appendChild(problemList);
  }

  /* --- the preview's credential controls ----------------------------------- */

  /* MEASURED DEFECT, FIXED HERE (dispatch 14's finding D14-7). The preview is
     the REAL renderer — that is the claim this surface exists to make — so it
     renders real credential chips and a real "See all N", and both resolve
     through the record store: openWalletCard throws on a credential it cannot
     find and openWalletScreen throws on a persona id it cannot resolve. A draft
     is in no store, so both threw on tap on every unpublished draft.

     They are made INERT rather than removed or replaced. A disabled <button> is
     unclickable, unfocusable and cannot run the listener the engine attached to
     it — all three at once, with no new mechanism — and the chip keeps its tier
     chrome, its verifier and its status word, so the preview still shows exactly
     what the published reel will show. Removing them would make the preview lie
     about the reel; a lookalike renderer would make the product's central claim
     theatre. The deck already does this for its own mock control (cards.js's
     video card sets play.disabled).

     WHY AN OBSERVER AND NOT THE FOOT OF compile(). compile() is not the only
     thing that paints a card: goTo/next/prev and the end-cap call the instance's
     internal render directly, so a swipe to the TRUST card repaints live
     controls with no compile() in between — which is exactly how the finding
     probe reached them. The observer sees every mutation inside the preview
     container, including the grid overlay. It is not a scheduler (A1-22, AM-4):
     a MutationObserver callback is a microtask on the same task that mutated the
     DOM, so it has always run before any later user event can be dispatched. */
  var PREVIEW_CONTROLS = ".cred-chip, .seeall, .card--wallet .cta";

  function neutralise(box) {
    var controls = box.querySelectorAll(PREVIEW_CONTROLS);
    var i;

    for (i = 0; i < controls.length; i += 1) {
      if (!controls[i].disabled) {
        controls[i].disabled = true;
        controls[i].className += " mk-inert";
      }
    }
  }

  function watchPreview(box) {
    neutralise(box);
    previewWatch = new MutationObserver(function () {
      neutralise(box);
    });
    previewWatch.observe(box, { childList: true, subtree: true });
  }

  /* --- the preview column ------------------------------------------------- */

  /* createDeck resolves its mounts scoped to the container it is given (§ 3.1),
     so the preview needs no global id and cannot collide with another deck on
     the page. Both nodes are DESCENDANTS of that container, because the
     resolution is a querySelector and never matches the container itself.
     The preview carries no progress bar and no grid control beside it: a preview
     deck differs from a full one only in what the SURFACE renders around it
     (§ 3.4.1 M4). The overlay host is named so the end-cap's overview control
     opens inside the preview instead of silently doing nothing. */
  function previewColumn() {
    var side = make("div", "mk-side");
    var box = make("div", "mk-preview");
    var screen = make("div", "mk-screen");
    var overlayHost = make("div", "mk-overlay-host");

    side.appendChild(make("h2", "mk-side-title display", "Live preview"));
    side.appendChild(make("p", "mk-section-note",
      "Compiled from the boxes beside this by the same code the published reel " +
        "runs. Unfinished beats are drawn as unfinished cards."));

    screen.setAttribute("data-deck-mount", "");
    overlayHost.setAttribute("data-deck-overlay-host", "");
    box.appendChild(screen);
    box.appendChild(overlayHost);
    side.appendChild(box);

    return { side: side, box: box };
  }

  /* --- the surface -------------------------------------------------------- */

  function buildForm(mountHost) {
    var page = make("div", "mk-surface");
    var head = make("div", "mk-head");
    var title = make("h1", "mk-title display", "Create your reel");
    var layout = make("div", "mk-layout");
    var form = make("div", "mk-form");
    var actions = make("div", "mk-actions");
    var side = previewColumn();

    title.setAttribute("tabindex", "-1");
    head.appendChild(title);
    head.appendChild(make("p", "mk-lede",
      "Four beats, in the order they are read. Nothing is recorded, and nothing is " +
        "written for you."));
    /* The standing shared-origin line (F-5/F-6, § 3.3). Every file:// document
       shares one origin, so this is a fact about the machine, not a policy. */
    head.appendChild(make("p", "mk-origin",
      "Invented people only. Anything typed here is readable by any other local " +
        "page on this machine."));
    page.appendChild(head);

    form.appendChild(hookSection());
    form.appendChild(proofSection());
    form.appendChild(trustSection());
    form.appendChild(closeSection());
    form.appendChild(depthSection());

    /* ------------------------------------------------------------------
       W10 MOUNTED HERE — and only W10.
       Publish, the line that says the draft is kept on this machine, and the
       list a refused publish is waiting for. Autosave fires on the change event
       and never on a timer (A1-22), and nothing in this row is disabled by the
       word budget or by anything else (A1-20).
       ------------------------------------------------------------------ */
    actions.setAttribute("data-mk-actions", "");
    mountActions(actions);
    form.appendChild(actions);

    layout.appendChild(form);
    layout.appendChild(side.side);
    page.appendChild(layout);
    mountHost.appendChild(page);

    return side.box;
  }

  var surface = {
    title: "Create your reel",

    /* The create surface survives a param change: publishing writes
       #/create/<id> over #/create and a remount there would destroy the form
       mid-flow (§ 3.4, audit H6). */
    keepOnParamChange: true,

    mount: function (mountHost, params) {
      var previewBox;

      host = mountHost;
      routeParams = params || {};
      fields = [];

      /* Both before the form is built, because every field reads the draft as it
         is built (W8's get()/set() pairs): the stored draft on a first mount,
         and the record itself when the route names one. */
      restoreDraft();
      loadRoute();

      previewBox = buildForm(mountHost);

      /* A NAMED instance (§ 5.1 B assertion 21). LENZLI.deck stays the inert
         namespace stub in the app — nothing here assigns to it — and chrome is
         not passed, because § 3.4.1 M4 cut it. */
      preview = LENZLI.createDeck(previewBox, { focus: false });

      /* Before the first compile, so no card is ever painted with a live
         credential control in it. */
      watchPreview(previewBox);

      compile();
      sayUnknownId();
    },

    onParams: function (params) {
      /* The router calls this INSTEAD of remounting (§ 3.4's corrected guard,
         audit H6): publishing writes #/create/<id> over #/create, and a remount
         there would take the form down mid-flow. So nothing here rebuilds
         anything unless the route names a different record that actually
         resolves — the publish transition names the draft's own id and does
         nothing at all, and an unknown id is answered in a line. */
      var mountHost = host;
      var title;

      routeParams = params || {};

      if (!loadRoute()) {
        sayUnknownId();
        return;
      }

      surface.unmount();
      surface.mount(mountHost, routeParams);

      /* The router moves focus on a mount and deliberately does not on a param
         change (audit H6), so a real edit-mode load — #/me → #/create/<id>, and
         one edited record to another — moves it here instead. The publish
         transition never reaches this line. */
      title = host.querySelector("h1");
      if (title) {
        title.focus({ preventScroll: true });
      }
    },

    unmount: function () {
      if (previewWatch) {
        previewWatch.disconnect();
        previewWatch = null;
      }
      if (preview) {
        preview.destroy();
        preview = null;
      }
      /* Guarded exactly as src/deck/cards.js guards it, so a tree without
         src/credentials/ still tears down. */
      if (LENZLI.cred && typeof LENZLI.cred.closeSheet === "function") {
        LENZLI.cred.closeSheet();
      }
      if (host) {
        host.textContent = "";
        host = null;
      }
      /* No listener was ever added to document or window, so there is none to
         remove: every one sits on a node inside the host and leaves with it. */
      fields = [];
      depthHost = null;
      depthAdd = null;
      depthCap = null;
      credList = null;
      credEmpty = null;
      credAdd = null;
      credPanels = [];
      publishBtn = null;
      saidLine = null;
      problemList = null;
    }
  };

  LENZLI.router.register("create", surface);
})(window);
