/* Invented person. Not a real individual. */
//
// src/data/personas/lucia-ferrante.js — Lucia Ferrante.
//
// Classic script, DOM-free. Loads after src/data/shapes.js.
// Shapes and derivation rules: src/data/shapes.js.
// 4 cards: HOOK, PROOF, TRUST, CLOSE. depth: [] fixes every record in this
// folder at four (SPEC § 4 D4, F-12).
// All dates are authored against LENZLI.BUILD_DATE = "2026-08-12": the glaze
// certificate runs to 2029-02-06, so the dates look current — which is exactly
// why tier C still reads "unverifiable" (rule 2 in shapes.js).
// A thin record — one credential, no depth. Thin is a real record (F-12).
// No video key — the video slot is Maya's only (A3-5).

LENZLI.registerPersona({
  id: "lucia-ferrante",

  identity: {
    name: "Lucia Ferrante",
    niche: "Ceramicist · wood-fired tableware",
    availability: "Taking two commissions this season",
    monogram: "LF"
  },

  // Testimonial-led: no tier-A or tier-B holding at all and nothing
  // requiredForRole, so neither clause of rule 1 in shapes.js fires.
  trustBeat: "testimonial",

  outcome: {
    headline: "Took a firing from 90 to 340 pieces",
    context: "Wood kiln co-op, 2024-2026 — same kiln, one extra stacking day",
    artifact: {
      label: "Firing log — 3-day wood cycle",
      kind: "document",
      caption: "The gain was in the stacking, not the heat. This is the log the night crew runs."
    }
  },

  credentials: [
    {
      id: "urn:lenzli:cred:lucia-glaze-chemistry",
      type: ["VerifiableCredential", "AchievementCredential"],
      tier: "C",
      // Unverifiable, not Active. The completion lookup exists and nobody read
      // it, so we cannot say the certificate is live even though the dates look
      // current. See rule 2 in shapes.js.
      status: "unverifiable",
      selfAsserted: false,
      requiredForRole: false,
      issuer: {
        name: "American Ceramic Society (Ceramic Arts Network)",
        type: "Training provider",
        mark: "ACerS"
      },
      credentialSubject: { holderName: "Lucia Ferrante" },
      achievement: {
        name: "Certificate — Glaze Chemistry and Food-Safe Surfaces",
        shortName: "Glaze chemistry",
        criteria: "Ten-module course plus the end-of-course assessment at the required score",
        skills: []
      },
      validFrom: "2024-02-06",
      validUntil: "2029-02-06",
      credentialId: "ACS-7•••••",
      verification: null,
      scope: null,
      renewal: "Refresher every 5 years",
      discipline: null,
      evidenceUrl: "ceramicartsnetwork.org/verify"
    }
  ],

  testimonials: [
    {
      quote: "She fixed our glaze before she fixed our firing schedule, and then she fixed our firing schedule.",
      author: "Aidan Brophy",
      role: "Owner",
      org: "Marrow Street Clay",
      date: "2026-06"
    }
  ],

  close: {
    scope: ["Tableware commissions", "Glaze development", "Wood-firing schedules", "Studio crew training"],
    rateBand: "$600/day, studio consulting",
    responseTime: "Replies within two days",
    timezone: "ET",
    cta: { label: "Ask about a studio visit", action: "mock" }
  },

  depth: []
});
