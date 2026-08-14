/*
 * src/data/shapes.js — the data model.
 *
 * Classic script (SPEC A3-9). DOM-free: loadable under node with
 * global.window = global (SPEC § 3.1, headless loadability). Loads after
 * src/brand/namespace.js and before the three persona files, which call
 * LENZLI.registerPersona at load time.
 *
 * The comment blocks below ARE the schema. There is no JSON read at runtime,
 * no generated validator, and no test suite (A3-7) — the SPEC's machine DoD
 * rows are the oracle.
 */

if (!window.LENZLI) {
  throw new Error(
    "src/data/shapes.js: window.LENZLI is missing. src/brand/namespace.js must load first."
  );
}

/*
 * The persona container is created HERE, idempotently, and not in
 * namespace.js (SPEC § 11, V7-2) — so the brand and data folders can land in
 * either order without one clobbering the other's work.
 */
window.LENZLI.personas = window.LENZLI.personas || {};

/* ------------------------------------------------------------------------
 * PERSONA RECORD
 *
 * {
 *   id: "dana-okafor",              // exactly "maya-chen" | "dana-okafor" | "alex-reyes"
 *   identity: {
 *     name: "Dana Okafor, RN",
 *     niche: "ICU nurse · Level-1 trauma · Chicago",  // overlay line, <= 40 chars
 *     availability: "Open to per-diem shifts",
 *     monogram: "DO"                // CSS stand-in; no image files (D7)
 *   },
 *   trustBeat: "credentials",       // "credentials" | "testimonial" — declarative (A3-2)
 *   outcome: {                      // PROOF beat
 *     headline: "Precepted 11 new-grad ICU nurses",    // the result, set large
 *     context: "Level-1 trauma unit, 2023-2026",       // small, beneath
 *     artifact: { label, kind, caption, image }        // caption names THIS person's part;
 *                                                      // image is OPTIONAL — see MEDIA PLATES
 *   },
 *   credentials: [ ... ],           // credential records — see the block below
 *   testimonials: [ { quote, author, role, org, date: "2026-03" } ],
 *   close: {
 *     scope: [ ... ],               // 3-5 items, in the client's vocabulary
 *     rateBand: "$68-78/hr, per-diem",
 *     responseTime: "Replies within a day",
 *     timezone: "CT",
 *     cta: { label: "Book a 15-min call", action: "mock" }   // ONE action, never a menu
 *   },
 *   depth: [ ... ],                 // 0-3 typed blocks — see the four shapes below
 *   video: { ... }                  // Maya only. Absent, never null-stated, on the
 * }                                 // other two (A3-5, ORDERS W2 step 3).
 *
 * Card total = 4 core beats (HOOK, PROOF, TRUST, CLOSE) + depth.length.
 * On this data: Maya 6, Dana 5, Alex 6.
 *
 * depth[] block shapes (SPEC § 3.1 — these four and no others):
 *   { kind: "artifact", label, caption, plate, image }
 *                                                 // plate = short text on the CSS stand-in;
 *                                                 // its own object, NOT outcome.artifact;
 *                                                 // image is OPTIONAL — see MEDIA PLATES
 *   { kind: "video", ref: "video" }               // renders the persona's top-level video
 *   { kind: "testimonial", index: 0 }             // renders testimonials[index]; carries no quote
 *   { kind: "wallet" }                            // teaser; its count is DERIVED from
 *                                                 // credentials.length, never authored here
 *
 * video object shape (Maya only):
 *   { durationLabel: "12s",
 *     poster: { plate: "Reel poster — brand film",
 *               src: "src/brand/img/maya-poster.jpg" },   // OPTIONAL — see MEDIA PLATES
 *     captions: [ { at: "0:00", text: "..." } ] }  // at is "M:SS"; cues are 1-2 lines
 *
 * MEDIA PLATES — the optional image fields (SPEC § 11, BEN-1).
 *
 *   outcome.artifact.image   — optional local path, e.g. "src/brand/img/dana-proof.jpg"
 *   depth[n].image           — optional local path, on artifact blocks only
 *   video.poster.src         — optional local path
 *
 * All three are RELATIVE paths to a file inside this repository, and nothing
 * else: never a URL, never a scheme, never a data URI. The artifact makes no
 * network call of any kind at runtime (SPEC § 10), and BEN-1 amends the older
 * "no real media files" line to "no REMOTE media; local placeholder images
 * allowed in media plates". The files under src/brand/img/ were downloaded once
 * at build time and are placeholder stock photos, not anyone's real work.
 *
 * Every one of the three is OPTIONAL and every one is absent-by-default: when
 * the key is missing, the plate renders the CSS stand-in it always rendered, and
 * the text field beside it (artifact.label, depth[n].plate, poster.plate) stays
 * the plate's caption either way — the photo never replaces it. Renderers branch
 * on the field's presence, so no persona is ever obliged to carry an image and
 * an imageless record is never an incomplete one.
 * ------------------------------------------------------------------------ */

/* ------------------------------------------------------------------------
 * CREDENTIAL RECORD — simplified W3C VC 2.0 / Open Badges 3.0 shape.
 * The field set is kept whole because it is the expensive thing to change
 * later (docs/research-credentials.md § G).
 *
 * {
 *   id: "urn:lenzli:cred:dana-rn-il",
 *   type: ["VerifiableCredential", "AchievementCredential"],
 *        // tier A adds "OpenBadgeCredential" — the signed OB 3.0 badge is what
 *        // MAKES it tier A. Tier D is ["SelfAssertedClaim"]: nobody issued it,
 *        // so calling it a VerifiableCredential would be a false claim.
 *   tier: "B",              // "A" cryptographic | "B" registry | "C" link | "D" self-reported
 *   status: "active",       // active | expiring | expired | suspended | revoked | unverifiable
 *   selfAsserted: false,    // LER-RS1-style flag
 *   requiredForRole: false, // true only where the job cannot be done without it
 *   issuer: { name: "Illinois Dept. of Financial & Professional Regulation",
 *             type: "Government registry",   // | "Certification body" | "Training provider"
 *             mark: "IDFPR" },               // short text mark; never an image file
 *   credentialSubject: { holderName: "Dana A. Okafor" },  // name AS ISSUED — a mismatch
 *                                                          // with the profile name is
 *                                                          // information, not a bug
 *   achievement: { name: "Registered Nurse — Illinois",    // the issuer's exact string,
 *                  shortName: "RN — Illinois",             // optional; chip-length display
 *                                                          // name; the renderer prefers it
 *                                                          // over its own derivation
 *                  criteria: "NCLEX-RN pass + IDFPR licensure",   // never prettified
 *                  skills: [] },                           // issuer-asserted only, <= 3
 *   validFrom: "2019-05-14", validUntil: "2027-05-31",     // ISO; either may be null
 *   credentialId: "041-3•••••",   // monospace, display only — what a human types into
 *                                 // the registry's box
 *   verification: { verifier: "Nursys", checkedDaysAgo: 3, destination: "nursys.com",
 *                   mockResult: { status, credential, holder, activeSince, expiresOn } },
 *   scope: "Single state — IL",                    // optional; "Multistate (compact)" too
 *   renewal: "24 CE hours / 2 years",              // the issuer's own terms
 *   discipline: "No public disciplinary actions",  // optional; a clean record is displayable
 *   evidenceUrl: null              // host string, never a scheme — nothing here is clickable
 * }
 *
 * ABSENT DATA IS null, NEVER A PLACEHOLDER OBJECT. Renderers branch on `tier`
 * before reading `issuer` or `verification`:
 *   - tier A / B — a check ran, so `verification` is a full object.
 *   - tier C     — nothing was checked, so `verification` is null; `evidenceUrl`
 *                  carries the issuer page that exists but was never read. This
 *                  is the whole tier-C condition (SPEC § 4 D4: "credential URL
 *                  exists, nothing checked").
 *   - tier D     — `issuer` is null AND `verification` is null. Nobody issued it
 *                  and nothing was checked. `criteria` is null for the same reason.
 *
 * `verification.destination` is a bare host ("nursys.com"), never a URL with a
 * scheme: the verify action opens an in-app mock sheet and makes no network call
 * of any kind (A3-15). The destination is a label, not a link.
 *
 * `verification.mockResult` is the ISSUER'S OWN answer, in the issuer's own
 * vocabulary — the five facts a real registry page returns (status, credential,
 * holder, activeSince, expiresOn; docs/research-credentials.md § 2.3). It can
 * legitimately disagree with our `status` word: Dana's BLS reads "Active" at the
 * AHA registry and "expiring" here, because "expiring" is OUR derived state, not
 * a state any registry reports.
 *
 * Tier A's chip and card label — "Verified — signed by {issuer}" — is composed by
 * the renderer from `tier` + `issuer.mark`. No label string is authored here.
 * ------------------------------------------------------------------------ */

/* ------------------------------------------------------------------------
 * DERIVATION RULES — documented, never executed.
 *
 * These three rules are recorded beside the fields they govern and are NOT
 * enforced at runtime: no assertion, no console warning (the disagreement
 * warning was cut by the spec audit, SPEC § 4 D2). A real product would run
 * rule 1; this prototype declares its result and states the rule so the
 * declaration can be checked by eye.
 *
 * 1. trustBeat — declared per persona, one of "credentials" | "testimonial".
 *    RULE: credentials-led when the persona holds >= 1 credential with
 *    requiredForRole: true, OR >= 2 credentials of tier A/B. Testimonial-led
 *    otherwise.
 *    On this data: Dana fires credentials-led (RN, requiredForRole), Alex fires
 *    credentials-led (AWS tier A + PMP tier B), Maya fires testimonial-led
 *    (neither clause) — matching all three declared values.
 *
 * 2. status — what a CHECK returned, never what the holder claims (A3-14).
 *    RULE: tier A/B may carry any of the six states. Tier C is ALWAYS
 *    "unverifiable" — no check ran, so we cannot say the credential is active
 *    even when its dates look current. Tier D carries status: null and renders
 *    no status word at all.
 *
 * 3. expiring — RULE: validUntil falls within 90 days of LENZLI.BUILD_DATE
 *    ("2026-08-12"). Renewal urgency renders only inside 6 months of BUILD_DATE
 *    and only when validUntil is still in the future — a negative countdown is
 *    never rendered, because the Expired status word already carries that fact.
 *    Every date in these records is authored against BUILD_DATE, so the artifact
 *    is a frozen specimen: nothing here or downstream reads the wall clock, and
 *    it renders identically forever (SPEC § 3.1).
 * ------------------------------------------------------------------------ */

/*
 * Register one persona. Validates the structural contract, then stores the
 * record in LENZLI.personas keyed by record.id (SPEC § 3.1).
 *
 * The validation below is structural only — it checks that the fields the deck
 * compiles from are present and well-shaped. It never checks the derivation
 * rules above. It throws rather than warning: a misconfigured persona fails
 * loudly at load, the same discipline buildDeck applies to a missing core beat
 * (SPEC § 4 D3), and errors surface rather than being swallowed (SPEC § 10).
 */
window.LENZLI.registerPersona = function (record) {
  if (!record || typeof record !== "object") {
    throw new Error("registerPersona: expected a record object");
  }
  if (!record.id) {
    throw new Error("registerPersona: record.id is required");
  }
  if (!record.identity || !record.identity.name || !record.identity.niche) {
    throw new Error("registerPersona: " + record.id + " needs identity.name and identity.niche");
  }
  if (record.trustBeat !== "credentials" && record.trustBeat !== "testimonial") {
    throw new Error(
      "registerPersona: " + record.id + " has trustBeat " + JSON.stringify(record.trustBeat) +
      '; expected "credentials" or "testimonial"'
    );
  }
  if (!record.outcome || !record.outcome.headline) {
    throw new Error("registerPersona: " + record.id + " needs outcome.headline");
  }
  if (!record.close || !record.close.cta) {
    throw new Error("registerPersona: " + record.id + " needs close.cta");
  }
  if (!Array.isArray(record.credentials)) {
    throw new Error("registerPersona: " + record.id + " needs a credentials array");
  }
  if (!Array.isArray(record.testimonials)) {
    throw new Error("registerPersona: " + record.id + " needs a testimonials array");
  }
  if (!Array.isArray(record.depth)) {
    throw new Error("registerPersona: " + record.id + " needs a depth array");
  }
  if (record.depth.length > 3) {
    throw new Error(
      "registerPersona: " + record.id + " declares " + record.depth.length +
      " depth blocks; the cap is 3"
    );
  }

  window.LENZLI.personas[record.id] = record;
  return record;
};

/*
 * LENZLI.validatePersona(record) -> { ok, problems: [ { field, message } ] }
 *
 * The same contract as registerPersona, returned as DATA (SPEC § 3.1, E-3). It
 * NEVER throws and NEVER logs, whatever it is handed — null, a number, an array,
 * a half-typed draft. That is the whole point: the create form validates on every
 * keystroke, and a record that is merely unfinished is not a defect to fail on.
 *
 * It mirrors registerPersona's ten structural guards AND src/deck/build.js's four
 * core-beat guards, because a draft that satisfies the first set can still fail to
 * compile — trustBeat "testimonial" with an empty testimonials array is the case.
 * The two lists are kept in the same order as the guards they mirror so a change
 * to either file is easy to reflect here.
 *
 * registerPersona itself is untouched and still throws: reel.html depends on loud
 * failure at boot, and a seeded record that trips a guard is a real defect.
 *
 * `field` is the record path the problem sits at, so a form can attach the message
 * to the input that owns it. `message` is written to be shown to the author, not
 * to a developer.
 */
window.LENZLI.validatePersona = function (record) {
  var problems = [];

  function problem(field, message) {
    problems.push({ field: field, message: message });
  }

  function done() {
    return { ok: problems.length === 0, problems: problems };
  }

  /* Guard 1 — the record itself. Nothing else can be read until this holds, so
     this is the one early return. Arrays are objects, hence the explicit test. */
  if (!record || typeof record !== "object" || Array.isArray(record)) {
    problem("record", "A record must be an object.");
    return done();
  }

  /* Guards 2-10, in registerPersona's order. */
  if (!record.id) {
    problem("id", "Every record needs an id.");
  }

  if (!record.identity || !record.identity.name) {
    problem("identity.name", "Add the name this reel is for.");
  }
  if (!record.identity || !record.identity.niche) {
    problem("identity.niche", "Add the niche line — the positioning claim under the name.");
  }

  if (record.trustBeat !== "credentials" && record.trustBeat !== "testimonial") {
    problem("trustBeat", 'The trust beat must be either "credentials" or "testimonial".');
  }

  if (!record.outcome || !record.outcome.headline) {
    problem("outcome.headline", "Add the result headline — the outcome this reel proves.");
  }

  if (!record.close || !record.close.cta) {
    problem("close.cta", "Add the one call to action the reel closes on.");
  }

  if (!Array.isArray(record.credentials)) {
    problem("credentials", "Credentials must be a list, even an empty one.");
  }
  if (!Array.isArray(record.testimonials)) {
    problem("testimonials", "Testimonials must be a list, even an empty one.");
  }
  if (!Array.isArray(record.depth)) {
    problem("depth", "Depth blocks must be a list, even an empty one.");
  } else if (record.depth.length > 3) {
    problem("depth", "A reel carries at most 3 depth blocks; this one declares " +
      record.depth.length + ".");
  }

  /* buildDeck's core-beat guards that registerPersona does not cover. The two
     above it — identity.name/niche for HOOK and outcome.headline for PROOF and
     close.cta for CLOSE — are the same guards, already reported once; repeating
     them here would show the author two messages for one empty field. */
  if (record.trustBeat === "testimonial") {
    if (!Array.isArray(record.testimonials) || !record.testimonials[0]) {
      problem("testimonials",
        "The trust beat is set to a testimonial, so the first testimonial is required.");
    }
  } else if (record.trustBeat === "credentials") {
    if (!Array.isArray(record.credentials) || !record.credentials.length) {
      problem("credentials",
        "The trust beat is set to credentials, so at least one credential is required.");
    }
  }

  return done();
};
