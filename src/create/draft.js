/*
 * src/create/draft.js — the create surface's pure half.
 *
 * Classic script (SPEC A3-9). DOM-FREE by contract (SPEC § 3.1, headless rule):
 * this file loads under node with `global.window = global`, which is what AM-10's
 * smoke command does. No document access here, ever — every element the author
 * sees is built in src/create/create.js.
 *
 * It owns LENZLI.create.wordBudget(field, text) and the budget table beside it,
 * and LENZLI.create.draftToRecord(draft), the pure transform publish runs.
 *
 * ------------------------------------------------------------------------
 * THE WORD BUDGET (SPEC § 3.4.1 M9, A1-20).
 *
 * The signature takes a FIELD as well as the text, because one set of bounds
 * cannot serve a niche line and a testimonial: § 3.4.1 M9 corrected § 3.1's
 * one-argument form for exactly that reason. The five rows below are M9's, and
 * they are the whole table — a field this function has never heard of gets a word
 * count and no bounds rather than someone else's.
 *
 * D7's "~65-75 words per 30s" is the REEL-level rate the table was derived from
 * and is not a field budget; it is not implemented here and nothing reads it.
 *
 * IT WARNS AND NEVER BLOCKS (A1-20). This function returns data and holds no
 * opinion about what the surface should do with it; nothing in src/create/ reads
 * `over` to disable a control, and F-14 forbids turning the count into a score of
 * the person. `over` is a COUNT OF WORDS TO CUT, so the line the surface renders
 * over budget ("trim 8 words") is a subtraction, not a grade.
 * ------------------------------------------------------------------------
 *
 * Not here, on purpose:
 *   deriveTier / deriveStatus / deriveTrustBeat — src/create/tier.js owns all
 *                    three (SPEC § 3.1). This file APPLIES them and computes
 *                    none of them: AM-14 scopes the assignment of tier and status
 *                    to this file and the computation to that one, so that a
 *                    single grep answers "is the tier derived or chosen?".
 */
(function (root) {
  "use strict";

  var LENZLI = root.LENZLI;

  if (!LENZLI || !LENZLI.create) {
    throw new Error(
      "src/create/draft.js: window.LENZLI.create is missing. src/brand/namespace.js must load first."
    );
  }

  /* namespace.js created this container with every method stubbed; overwrite the
     method in place so anything that captured the object at load keeps the same
     object (the idiom src/app/router.js and src/store/storage.js both use). */
  var create = LENZLI.create;

  /* SPEC § 3.4.1 M9, verbatim and complete. Data, not code: a sixth field is a
     row here and nothing else. */
  var BUDGETS = {
    niche: { min: 6, max: 12 },
    headline: { min: 8, max: 18 },
    context: { min: 10, max: 30 },
    caption: { min: 8, max: 25 },
    quote: { min: 15, max: 45 }
  };

  /* Whitespace-separated runs that carry at least one letter or digit. A
     half-typed word counts as a word — the author is mid-sentence, and a count
     that flickered back to the previous number would read as a bug. A lone
     separator does NOT: the house niche line is "ICU nurse · Level-1 trauma ·
     Chicago", and counting its two middots as words would put every niche line
     two over its true length against a 6-12 budget. */
  function countWords(text) {
    var trimmed = String(text === undefined || text === null ? "" : text).trim();

    if (!trimmed) {
      return 0;
    }
    return trimmed.split(/\s+/).filter(function (run) {
      return /[\p{L}\p{N}]/u.test(run);
    }).length;
  }

  /* -> { words, min, max, over }
     min/max are null for a field with no row in the table, and `over` is then 0:
     no bounds, nothing to be over. Under the minimum is NOT a state this reports
     beyond the count itself — a short line is unfinished, not wrong, and F-14
     forbids scoring it. */
  create.wordBudget = function (field, text) {
    var budget = BUDGETS[field] || null;
    var words = countWords(text);
    var min = budget ? budget.min : null;
    var max = budget ? budget.max : null;

    return {
      words: words,
      min: min,
      max: max,
      over: max === null ? 0 : Math.max(0, words - max)
    };
  };

  /* ------------------------------------------------------------------------
   * draftToRecord(draft) -> record   (SPEC § 3.1, § 4 D7's publish bullet)
   *
   * THE DRAFT IS ALREADY A PERSONA RECORD IN PROGRESS — src/create/create.js
   * writes the shape src/data/shapes.js documents and keeps no parallel
   * authoring structure beside it — so this COMPLETES a record rather than
   * translating one. Exactly four fields are missing from a draft, and all four
   * are derived, never asked:
   *
   *   id         "u-" + crypto.randomUUID() for a new record (SPEC § 3.3,
   *              measured available at file://), and the record's own id in edit
   *              mode — so publishing an edit shadows the record it edited
   *              instead of minting a second one beside it.
   *   tier       one per credential, from LENZLI.create.deriveTier. TIER IS
   *              SYSTEM-ASSIGNED, NEVER USER-CHOSEN (F-11): a user who could pick
   *              their own tier would pick A and the ladder would be decorative.
   *   status     one per credential, from LENZLI.create.deriveStatus, which
   *              re-reads the tier this pass just derived.
   *   trustBeat  from LENZLI.create.deriveTrustBeat, AFTER the tiers are current,
   *              because the predicate counts tier A/B credentials. Without it
   *              registerPersona throws and trustCard throws, and nothing
   *              published here would ever compile (audit H9, assertion 36).
   *
   * AM-14 IS A SOURCE-ORDER GREP OVER THIS FILE: tier and status are each
   * assigned exactly once below, and each assignment reads its named derivation.
   * That is also why both calls are written LENZLI.create.* in full rather than
   * through this file's `create` alias — the grep is literal.
   *
   * A SANCTION IS NOT RE-DERIVED. "suspended" and "revoked" are what an ISSUER
   * did, and deriveStatus cannot return either by design (A1-21, src/create/
   * tier.js). Re-deriving them would turn an edited seed's revoked credential
   * into "active" at publish — the create flow reporting a check it never ran.
   *
   * PURE, AND IT COPIES. The form on screen keeps editing the object it was
   * built against; a published record is a snapshot of it. The copy is a JSON
   * round-trip, the same one src/store/records.js makes of what it is handed: a
   * record is plain JSON by contract, and a value that cannot survive the trip
   * is not one.
   *
   * NO WALL CLOCK AND NO createdAt (F-7, AM-17, § 3.4.1 M3). Dates in this build
   * are read against LENZLI.BUILD_DATE, and the schema carries no creation stamp
   * because "most recently created" is a rule nothing here can implement.
   * ------------------------------------------------------------------------ */

  function copy(value) {
    return JSON.parse(JSON.stringify(value));
  }

  /* An issuer applies a sanction and a holder never self-reports one (A1-21), so
     neither word is derivable — and neither may be derived away. */
  function sanctioned(word) {
    return word === "suspended" || word === "revoked";
  }

  function complete(c) {
    if (!c || typeof c !== "object") {
      return;
    }
    c.tier = LENZLI.create.deriveTier(c);
    c.status = sanctioned(c.status) ? c.status : LENZLI.create.deriveStatus(c.tier, c.validUntil);
  }

  create.draftToRecord = function (draft) {
    var record = copy(draft && typeof draft === "object" ? draft : {});

    record.id = record.id || "u-" + root.crypto.randomUUID();

    if (Array.isArray(record.credentials)) {
      record.credentials.forEach(complete);
    }

    record.trustBeat = LENZLI.create.deriveTrustBeat(record);

    return record;
  };
})(window);
