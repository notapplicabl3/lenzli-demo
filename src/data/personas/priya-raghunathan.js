/* Invented person. Not a real individual. */
//
// src/data/personas/priya-raghunathan.js — Priya Raghunathan.
//
// Classic script, DOM-free. Loads after src/data/shapes.js.
// Shapes and derivation rules: src/data/shapes.js.
// 4 cards: HOOK, PROOF, TRUST, CLOSE. depth: [] fixes every record in this
// folder at four (SPEC § 4 D4, F-12).
// All dates are authored against LENZLI.BUILD_DATE = "2026-08-12": the CCRC
// runs to 2027-08-20, a year and eight days out, clear of the 90-day window.
// No availability line: this is one of four records the directory's
// "availability not stated" facet reads (SPEC § 4 D5, Facets).
// No video key — the video slot is Maya's only (A3-5).

LENZLI.registerPersona({
  id: "priya-raghunathan",

  identity: {
    name: "Priya Raghunathan",
    niche: "Phase I oncology · site startup to close",
    monogram: "PR"
  },

  // Testimonial-led: one tier-B holding, one tier-C, and nothing
  // requiredForRole — neither clause of rule 1 in shapes.js fires.
  trustBeat: "testimonial",

  outcome: {
    headline: "84 enrolled, 2 protocol deviations",
    context: "Six phase I oncology trials, 2021-2026 — no monitoring findings",
    artifact: {
      label: "Startup checklist — 31 days to first patient",
      kind: "document",
      caption: "Regulatory, pharmacy, lab and contracts run down this sheet in parallel, not in sequence."
    }
  },

  credentials: [
    {
      id: "urn:lenzli:cred:priya-ccrc",
      type: ["VerifiableCredential", "AchievementCredential"],
      tier: "B",
      status: "active",
      selfAsserted: false,
      requiredForRole: false,
      issuer: {
        name: "Association of Clinical Research Professionals",
        type: "Certification body",
        mark: "ACRP"
      },
      credentialSubject: { holderName: "Priya L. Raghunathan" },
      achievement: {
        name: "Certified Clinical Research Coordinator (CCRC)",
        shortName: "CCRC",
        criteria: "Documented coordinator experience plus the ACRP certification examination",
        skills: []
      },
      validFrom: "2022-08-20",
      validUntil: "2027-08-20",
      credentialId: "ACRP-3•••••",
      verification: {
        verifier: "ACRP certification registry",
        checkedDaysAgo: 4,
        destination: "acrpnet.org",
        mockResult: {
          status:"Active",
          credential:"Certified Clinical Research Coordinator (CCRC)",
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
      id: "urn:lenzli:cred:priya-citi-gcp",
      type: ["VerifiableCredential", "AchievementCredential"],
      tier: "C",
      // Unverifiable, not Active. The completion record exists behind a lookup
      // nobody read. See rule 2 in shapes.js.
      status: "unverifiable",
      selfAsserted: false,
      requiredForRole: false,
      issuer: {
        name: "CITI Program",
        type: "Training provider",
        mark: "CITI"
      },
      credentialSubject: { holderName: "Priya Raghunathan" },
      achievement: {
        name: "Good Clinical Practice (GCP) — Clinical Trials with Investigational Drugs",
        shortName: "GCP — drug trials",
        criteria: "Module series plus end-of-module quizzes at the required score",
        skills: []
      },
      validFrom: "2025-01-30",
      validUntil: "2028-01-30",
      credentialId: "CITI-2•••••",
      verification: null,
      scope: null,
      renewal: "Refresher every 3 years",
      discipline: null,
      evidenceUrl: "citiprogram.org/verify"
    }
  ],

  testimonials: [
    {
      quote: "She opened our site in thirty-one days, and then told the sponsor exactly which two deviations were ours.",
      author: "Anneliese Fuchs",
      role: "Principal investigator",
      org: "Rothwell Cancer Institute",
      date: "2026-05"
    }
  ],

  close: {
    scope: ["Site startup", "Phase I coordination", "Regulatory binders", "Monitoring visits"],
    rateBand: "$52/hr, contract",
    responseTime: "Replies within a day",
    timezone: "ET",
    cta: { label: "Ask about site startup", action: "mock" }
  },

  depth: []
});
