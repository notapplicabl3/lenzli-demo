/* Invented person. Not a real individual. */
//
// src/data/personas/samuel-okonkwo.js — Samuel Okonkwo.
//
// Classic script, DOM-free. Loads after src/data/shapes.js.
// Shapes and derivation rules: src/data/shapes.js.
// 4 cards: HOOK, PROOF, TRUST, CLOSE. depth: [] fixes every record in this
// folder at four (SPEC § 4 D4, F-12).
// All dates are authored against LENZLI.BUILD_DATE = "2026-08-12": the GPC runs
// to 2028-05-19, so the dates look current — which is exactly why tier C still
// reads "unverifiable" (rule 2 in shapes.js).
// A thin record — one credential, no depth. Thin is a real record (F-12).
// No availability line: this is one of four records the directory's
// "availability not stated" facet reads (SPEC § 4 D5, Facets).
// No video key — the video slot is Maya's only (A3-5).

LENZLI.registerPersona({
  id: "samuel-okonkwo",

  identity: {
    name: "Samuel Okonkwo",
    niche: "Grant writer · federal health awards",
    monogram: "SO"
  },

  // Testimonial-led: no tier-A or tier-B holding at all and nothing
  // requiredForRole, so neither clause of rule 1 in shapes.js fires.
  trustBeat: "testimonial",

  outcome: {
    headline: "$4.2M awarded on 11 submissions",
    context: "Community health centers, 2020-2026 — 7 of 11 funded",
    artifact: {
      label: "Narrative section — HRSA renewal",
      kind: "document",
      caption: "The needs section is where these are won or lost. This one cites the clinic's own intake numbers, not county averages."
    }
  },

  credentials: [
    {
      id: "urn:lenzli:cred:samuel-gpc",
      type: ["VerifiableCredential", "AchievementCredential"],
      tier: "C",
      // Unverifiable, not Active. The certificant lookup exists and nobody read
      // it, so we cannot say the certification is live. Rule 2, shapes.js.
      status: "unverifiable",
      selfAsserted: false,
      requiredForRole: false,
      issuer: {
        name: "Grant Professionals Certification Institute",
        type: "Certification body",
        mark: "GPCI"
      },
      credentialSubject: { holderName: "Samuel A. Okonkwo" },
      achievement: {
        name: "Grant Professional Certified (GPC)",
        shortName: "GPC",
        criteria: "Documented grant experience plus the multiple-choice and written examinations",
        skills: []
      },
      validFrom: "2023-05-19",
      validUntil: "2028-05-19",
      credentialId: "GPC-1•••••",
      verification: null,
      scope: null,
      renewal: "Recertify every 3 years",
      discipline: null,
      evidenceUrl: "grantprofessionals.org/verify"
    }
  ],

  testimonials: [
    {
      quote: "He rewrote our needs section using our own intake numbers, and we were funded on the resubmission.",
      author: "Delphine Carr",
      role: "Executive director",
      org: "Eastbank Community Health",
      date: "2026-04"
    }
  ],

  close: {
    scope: ["Federal health awards", "Needs assessment narrative", "Budget justification", "Resubmission after review"],
    rateBand: "$85/hr, or $6,500 per full application",
    responseTime: "Replies within two days",
    timezone: "CT",
    cta: { label: "Ask about a submission deadline", action: "mock" }
  },

  depth: []
});
