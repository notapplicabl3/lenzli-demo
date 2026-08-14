/*
 * src/create/tier.js — the create surface's three derivations.
 *
 * Classic script (SPEC A3-9). DOM-FREE by contract (SPEC § 3.1, headless rule):
 * this file loads under node with `global.window = global`, which is what AM-10's
 * smoke command does. Every element the author sees is built in
 * src/create/create.js; nothing here touches a document.
 *
 * It owns all three of § 3.1's create derivations:
 *   LENZLI.create.deriveTier(answers)             -> "A" | "B" | "C" | "D"
 *   LENZLI.create.deriveStatus(tier, validUntil)  -> a status word, or null
 *   LENZLI.create.deriveTrustBeat(draft)          -> "credentials" | "testimonial"
 *
 * § 3.1 was instructed by § 4 D7's audit bullet to carry deriveTrustBeat's
 * signature and the fix batch never added it; the slice fold-back put it back
 * (SPEC § 3.1, ledger V2-11). It lands here beside the other two because it is
 * the same kind of thing — a rule about a record, computed in one place and
 * applied in another — and because there is no fourth file to hold it: § 3.2's
 * tag list admits exactly tier.js, draft.js and create.js under src/create/.
 * The next reader looking for it in § 3.1 finds it here.
 *
 * ------------------------------------------------------------------------
 * WHY ALL THREE ARE DERIVED AND NONE IS ASKED.
 *
 * TIER IS SYSTEM-ASSIGNED, NEVER USER-CHOSEN (F-11). The flow asks who issued it
 * and whether anyone can check it; the answers assign the tier. A user who could
 * pick their own tier would pick A, and the whole ladder would be decorative —
 * which is the one thing the four tiers exist not to be.
 *
 * STATUS IS WHAT A CHECK RETURNED, NEVER WHAT THE HOLDER CLAIMS (A1-21, A3-14).
 * Two of the six status words are UNREACHABLE from here and that is the point:
 * "suspended" and "revoked" are sanctions an ISSUER applies, and asking a holder
 * to self-report one would put a state in the data that no check produced. They
 * exist in the seeded corpus and in the legend, and they are not offered, not
 * derivable and not returnable by anything in this file. AM-14 asserts it over
 * the whole input space rather than by sample.
 *
 * THE TRUST BEAT IS DERIVED because nothing published here compiles without it:
 * registerPersona throws when trustBeat is neither word (shapes.js) and trustCard
 * throws on the same (build.js). D7 specified every other field and never this
 * one (audit H9).
 *
 * DIVISION OF LABOUR (AM-14, and § 3.1's seam sentence). This file COMPUTES.
 * It never assigns: src/create/draft.js's draftToRecord (W10) is the one place a
 * record's `tier`, `status` and `trustBeat` are written, and AM-14's source-order
 * grep is scoped to that file for exactly that reason. The create surface holds
 * record-shaped credentials in its draft and keeps their derived fields current
 * as the author answers, so the live preview renders the chrome each answer
 * earned; publish re-derives through these same three functions.
 * ------------------------------------------------------------------------
 *
 * Dates: never the wall clock. LENZLI.BUILD_DATE is the only "today" this build
 * has (F-7), and the day arithmetic is cred.daysFromBuild's — called, never
 * restated (§ 3.1 unchanged-and-depended-upon, § 10 call-the-engine).
 */
(function (root) {
  "use strict";

  var LENZLI = root.LENZLI;

  if (!LENZLI || !LENZLI.create) {
    throw new Error(
      "src/create/tier.js: window.LENZLI.create is missing. src/brand/namespace.js must load first."
    );
  }

  /* namespace.js created this container with every method stubbed; overwrite the
     methods in place so anything that captured the object at load keeps the same
     object (the idiom src/create/draft.js and src/app/router.js both use). */
  var create = LENZLI.create;

  /* --- Question 2: who issued it? ------------------------------------------
     Three issuer types, plus the fourth answer that is not a type at all. A
     credential nobody issued has no issuer to record, so the record carries
     `issuer: null` and this answer forces tier D regardless of what question 3
     says (SPEC § 4 D7 step 3, last sentence). */

  var NO_ISSUER = "nobody";

  /* --- Question 3: can anyone check it? ------------------------------------
     The four answers and the tier each one earns. This object IS F-11's mapping:
     a tier is read out of it and is never written by anything the author touches
     (SPEC § 4 D7 step 3).

       badge     a signed digital badge                              -> A
       registry  a public registry anyone can look me up in          -> B
       page      an issuer page, nothing that verifies me            -> C
       nothing   nothing — this is my own claim                      -> D */

  var TIER_BY_CHECK = {
    badge: "A",
    registry: "B",
    page: "C",
    nothing: "D"
  };

  /* The two record fields that encode question 3's answer once the answers
     themselves are gone (src/data/shapes.js's credential shape): tier A ADDS the
     Open Badges type — the signed proof is what makes it tier A — and tier D is
     the self-asserted type, because calling something nobody issued a verifiable
     credential would be a false claim. */
  var BADGE_TYPE = "OpenBadgeCredential";
  var SELF_TYPE = "SelfAssertedClaim";
  var VC_TYPE = "VerifiableCredential";

  /* SPEC § 4 D4 and shapes.js rule 3: inside this many days of BUILD_DATE and
     still to come, a credential is expiring. It is surfaced BECAUSE it expires,
     never hidden for it. */
  var EXPIRING_DAYS = 90;

  /* Credentials-led when the draft holds at least this many role-critical
     credentials, OR this many registry-backed ones (A3-2 as widened by AUD-2,
     SPEC § 4 D7's audit bullet). */
  var REQUIRED_FOR_BEAT = 1;
  var REGISTRY_BACKED_FOR_BEAT = 2;

  /* ------------------------------------------------------------------------
   * deriveTier(answers) -> "A" | "B" | "C" | "D"
   *
   * `answers` is read two ways on purpose, and they are the same two questions
   * either way:
   *
   *   1. AS ASKED — { issuerType, check }, which is what the sub-flow hands over
   *      while the author is answering.
   *   2. AS RECORDED — a record-shaped credential, which is what draftToRecord
   *      (W10) has at publish. By then the answers are gone: the sub-flow writes
   *      credentials in the shape renderChip, renderTierRow and buildDeck already
   *      consume and keeps no parallel answer structure alive beside them. The
   *      two questions survive in the record itself — `issuer` is null exactly
   *      when nobody issued it, and shapes.js's `type` array plus `verification`
   *      carry question 3's answer — so the tier re-derives from the record with
   *      nothing lost. AM-14 requires that re-derivation to read this function.
   *
   * Anything else is tier D. An unanswered credential claims nothing, and
   * nothing is what tier D means — the default is the floor of the ladder, never
   * the benefit of the doubt.
   * ------------------------------------------------------------------------ */
  create.deriveTier = function (answers) {
    var given = answers || {};

    if (issuerAnswer(given) === NO_ISSUER) {
      return "D";
    }
    return TIER_BY_CHECK[checkAnswer(given)] || "D";
  };

  /* Question 2's answer. An issuer type the author has not chosen yet is not the
     "nobody" answer — silence is not a claim either way — so it falls through to
     question 3. */
  function issuerAnswer(given) {
    if (typeof given.issuerType === "string") {
      return given.issuerType;
    }
    if (Object.prototype.hasOwnProperty.call(given, "issuer")) {
      return given.issuer ? given.issuer.type || "" : NO_ISSUER;
    }
    return "";
  }

  /* Question 3's answer, read from the record when it was not passed directly.
     The order of the tests is the ladder's own order, so a record that somehow
     carries two encodings resolves to the higher bar it actually meets. */
  function checkAnswer(given) {
    var type;

    if (typeof given.check === "string") {
      return given.check;
    }

    type = Array.isArray(given.type) ? given.type : [];

    if (type.indexOf(BADGE_TYPE) !== -1) {
      return "badge";
    }
    if (type.indexOf(SELF_TYPE) !== -1) {
      return "nothing";
    }
    if (given.verification) {
      return "registry";
    }
    if (type.indexOf(VC_TYPE) !== -1) {
      return "page";
    }
    return "nothing";
  }

  /* ------------------------------------------------------------------------
   * deriveStatus(tier, validUntil) -> "active" | "expiring" | "expired" |
   *                                   "unverifiable" | null
   *
   * Tier C is ALWAYS unverifiable — nothing was checked, so nothing can be said
   * either way, however current the dates look. Tier D carries no status word at
   * all, which is null and not a word meaning "none". Tier A and B are the only
   * tiers a date can speak for, because they are the only tiers where a check
   * ran (shapes.js rule 2).
   *
   * "SUSPENDED" AND "REVOKED" ARE NOT REACHABLE HERE (A1-21). Read the returns:
   * every one of them is a literal on the five lines below, and neither word is
   * among them. Nobody self-reports a sanction — an issuer applies one, and this
   * file only ever sees what the holder answered.
   * ------------------------------------------------------------------------ */
  create.deriveStatus = function (tier, validUntil) {
    var daysLeft;

    if (tier === "C") {
      return "unverifiable";
    }
    if (tier !== "A" && tier !== "B") {
      /* Tier D, and any tier this build does not have. No check ran and none
         could have, so there is no state to report. */
      return null;
    }

    daysLeft = daysLeftOf(validUntil);

    if (daysLeft === null) {
      /* No end date, or one this build cannot read as a date. A credential that
         does not expire has nothing for a date to say about it, and the check
         that put it at tier A or B is the thing that came back current
         (legend.js: Active — a check ran, and it came back current). */
      return "active";
    }
    if (daysLeft < 0) {
      return "expired";
    }
    if (daysLeft <= EXPIRING_DAYS) {
      return "expiring";
    }
    return "active";
  };

  /* Whole days from BUILD_DATE, cred.daysFromBuild's arithmetic and not a second
     copy of it (§ 3.1, § 10: date math goes through LENZLI.cred). The clock is
     never read — BUILD_DATE is the only today this artifact has (F-7).

     The kit is checked rather than assumed because this file is headless-loadable
     and its owner, src/credentials/chip.js, is a separate script: a status
     derived with no date math would be a guess, so this is loud instead. */
  function daysLeftOf(validUntil) {
    if (!LENZLI.cred || typeof LENZLI.cred.daysFromBuild !== "function") {
      throw new Error(
        "src/create/tier.js: deriveStatus needs LENZLI.cred.daysFromBuild — " +
          "src/credentials/chip.js must be loaded."
      );
    }
    return LENZLI.cred.daysFromBuild(validUntil);
  }

  /* ------------------------------------------------------------------------
   * deriveTrustBeat(draft) -> "credentials" | "testimonial"
   *
   * The predicate, verbatim (SPEC § 4 D7's audit bullet, A3-2 as widened by
   * AUD-2): credentials-led when the draft holds at least one credential with
   * requiredForRole true, OR at least two of tier A or B; testimonial-led
   * otherwise.
   *
   * Both clauses are about credentials a READER can check, which is why the
   * fallback is the testimonial rather than the other way round: a named person
   * saying what you did is what carries the beat when nothing was verified.
   *
   * It always returns one of the two words, for every input including no draft
   * at all — an unfilled draft is testimonial-led, and its TRUST card is the
   * unfinished card that says so rather than a card that threw.
   * ------------------------------------------------------------------------ */
  create.deriveTrustBeat = function (draft) {
    var credentials = draft && Array.isArray(draft.credentials) ? draft.credentials : [];
    var required = 0;
    var registryBacked = 0;

    credentials.forEach(function (c) {
      if (!c) {
        return;
      }
      if (c.requiredForRole) {
        required += 1;
      }
      if (c.tier === "A" || c.tier === "B") {
        registryBacked += 1;
      }
    });

    if (required >= REQUIRED_FOR_BEAT || registryBacked >= REGISTRY_BACKED_FOR_BEAT) {
      return "credentials";
    }
    return "testimonial";
  };
})(window);
