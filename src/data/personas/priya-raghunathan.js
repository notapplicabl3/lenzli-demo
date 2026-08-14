/* Invented person. Not a real individual. */
//
// src/data/personas/priya-raghunathan.js — Priya Raghunathan.
//
// Classic script, DOM-free. Loads after src/data/shapes.js.
// Shapes and derivation rules: src/data/shapes.js.
// 4 cards: HOOK, PROOF, TRUST, CLOSE. depth: [] fixes every record in this
// folder at four (SPEC § 4 D4, F-12).
// All dates are authored against LENZLI.BUILD_DATE = "2026-08-12": the peer
// review runs to 2027-08-20, a year and eight days out, clear of the 90-day
// window.
// No availability line: this is one of four records the directory's
// "availability not stated" facet reads (SPEC § 4 D5, Facets).
// No video key — the video slot is Maya's only (A3-5).

LENZLI.registerPersona({
  id: "priya-raghunathan",

  identity: {
    name: "Priya Raghunathan",
    niche: "Objects conservator · ceramics, metals",
    monogram: "PR"
  },

  // Testimonial-led: one tier-B holding, one tier-C, and nothing
  // requiredForRole — neither clause of rule 1 in shapes.js fires.
  trustBeat: "testimonial",

  outcome: {
    headline: "84 objects treated, all reversible",
    context: "Six regional collections, 2021-2026 — no condition losses on record",
    artifact: {
      label: "Treatment report — 31 days to exhibition",
      kind: "document",
      caption: "Condition, then the proposal, then what I actually did and what can be undone. Registrars read the last part."
    }
  },

  credentials: [
    {
      id: "urn:lenzli:cred:priya-aic-pa",
      type: ["VerifiableCredential", "AchievementCredential"],
      tier: "B",
      status: "active",
      selfAsserted: false,
      requiredForRole: false,
      issuer: {
        name: "American Institute for Conservation",
        type: "Certification body",
        mark: "AIC"
      },
      credentialSubject: { holderName: "Priya L. Raghunathan" },
      achievement: {
        name: "Professional Associate — Objects Conservation",
        shortName: "AIC Professional Associate",
        criteria: "Documented treatment experience plus peer review against the AIC Code of Ethics",
        skills: []
      },
      validFrom: "2022-08-20",
      validUntil: "2027-08-20",
      credentialId: "AIC-3•••••",
      verification: {
        verifier: "AIC membership registry",
        checkedDaysAgo: 4,
        destination: "culturalheritage.org",
        mockResult: {
          status:"Active",
          credential:"Professional Associate — Objects Conservation",
          holder:"Priya L. Raghunathan",
          activeSince:"2022-08-20",
          expiresOn:"2027-08-20"
        }
      },
      scope: null,
      renewal: "24 contact hours / 2 years",
      discipline: null,
      evidenceUrl: null
    },
    {
      id: "urn:lenzli:cred:priya-salvage-training",
      type: ["VerifiableCredential", "AchievementCredential"],
      tier: "C",
      // Unverifiable, not Active. The completion record exists behind a lookup
      // nobody read. See rule 2 in shapes.js.
      status: "unverifiable",
      selfAsserted: false,
      requiredForRole: false,
      issuer: {
        name: "Northeast Document Conservation Center",
        type: "Training provider",
        mark: "NEDCC"
      },
      credentialSubject: { holderName: "Priya Raghunathan" },
      achievement: {
        name: "Emergency Response and Salvage — Collections",
        shortName: "Salvage training",
        criteria: "Module series plus the practical salvage exercise",
        skills: []
      },
      validFrom: "2025-01-30",
      validUntil: "2028-01-30",
      credentialId: "NEDCC-2•••••",
      verification: null,
      scope: null,
      renewal: "Refresher every 3 years",
      discipline: null,
      evidenceUrl: "nedcc.org/verify"
    }
  ],

  testimonials: [
    {
      quote: "She surveyed our storeroom in thirty-one days, and then told the board exactly which two objects we were losing.",
      author: "Anneliese Fuchs",
      role: "Chief curator",
      org: "Rothwell Museum of Art",
      date: "2026-05"
    }
  ],

  close: {
    scope: ["Condition surveys", "Objects treatment", "Exhibition preparation", "Storage and mount review"],
    rateBand: "$78/hr, contract",
    responseTime: "Replies within a day",
    timezone: "ET",
    cta: { label: "Ask about a condition survey", action: "mock" }
  },

  depth: []
});
