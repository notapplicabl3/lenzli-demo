/* Invented person. Not a real individual. */
//
// src/data/personas/lucia-ferrante.js — Lucia Ferrante.
//
// Classic script, DOM-free. Loads after src/data/shapes.js.
// Shapes and derivation rules: src/data/shapes.js.
// 4 cards: HOOK, PROOF, TRUST, CLOSE. depth: [] fixes every record in this
// folder at four (SPEC § 4 D4, F-12).
// All dates are authored against LENZLI.BUILD_DATE = "2026-08-12": the ServSafe
// certificate runs to 2029-02-06, so the dates look current — which is exactly
// why tier C still reads "unverifiable" (rule 2 in shapes.js).
// A thin record — one credential, no depth. Thin is a real record (F-12).
// No video key — the video slot is Maya's only (A3-5).

LENZLI.registerPersona({
  id: "lucia-ferrante",

  identity: {
    name: "Lucia Ferrante",
    niche: "Pastry lead · viennoiserie · wholesale",
    availability: "Consulting one day a week",
    monogram: "LF"
  },

  // Testimonial-led: no tier-A or tier-B holding at all and nothing
  // requiredForRole, so neither clause of rule 1 in shapes.js fires.
  trustBeat: "testimonial",

  outcome: {
    headline: "Took croissants from 90 to 340 a day",
    context: "Wholesale bakery, 2024-2026 — same oven, one extra baker",
    artifact: {
      label: "Lamination schedule — 3-day cycle",
      kind: "document",
      caption: "The gain was in the retard, not the oven. This is the schedule the night crew runs."
    }
  },

  credentials: [
    {
      id: "urn:lenzli:cred:lucia-servsafe",
      type: ["VerifiableCredential", "AchievementCredential"],
      tier: "C",
      // Unverifiable, not Active. The certificate lookup page exists and nobody
      // read it, so we cannot say the certification is live even though the
      // dates look current. See rule 2 in shapes.js.
      status: "unverifiable",
      selfAsserted: false,
      requiredForRole: false,
      issuer: {
        name: "National Restaurant Association",
        type: "Training provider",
        mark: "ServSafe"
      },
      credentialSubject: { holderName: "Lucia Ferrante" },
      achievement: {
        name: "ServSafe Food Protection Manager Certification",
        shortName: "ServSafe Manager",
        criteria: "Proctored 90-question food safety examination",
        skills: []
      },
      validFrom: "2024-02-06",
      validUntil: "2029-02-06",
      credentialId: "SS-7•••••",
      verification: null,
      scope: null,
      renewal: "Recertify every 5 years",
      discipline: null,
      evidenceUrl: "servsafe.com/verify"
    }
  ],

  testimonials: [
    {
      quote: "She fixed our croissant before she fixed our schedule, and then she fixed our schedule.",
      author: "Aidan Brophy",
      role: "Owner",
      org: "Marrow Street Bakery",
      date: "2026-06"
    }
  ],

  close: {
    scope: ["Viennoiserie production", "Lamination troubleshooting", "Wholesale scale-up", "Night crew training"],
    rateBand: "$600/day, consulting",
    responseTime: "Replies within two days",
    timezone: "ET",
    cta: { label: "Ask about a production audit", action: "mock" }
  },

  depth: []
});
