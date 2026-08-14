/* Invented person. Not a real individual. */
//
// src/data/personas/nadia-farouk.js — Nadia Farouk, PE.
//
// Classic script, DOM-free. Loads after src/data/shapes.js.
// Shapes and derivation rules: src/data/shapes.js.
// 4 cards: HOOK, PROOF, TRUST, CLOSE. depth: [] fixes every record in this
// folder at four (SPEC § 4 D4, F-12).
// All dates are authored against LENZLI.BUILD_DATE = "2026-08-12": the PE
// licence renews 2027-09-30, more than a year out and well clear of the 90-day
// expiring window.
// No video key — the video slot is Maya's only (A3-5).

LENZLI.registerPersona({
  id: "nadia-farouk",

  identity: {
    name: "Nadia Farouk, PE",
    niche: "Structural engineer · bridge retrofit",
    availability: "Open to a review-engineer role",
    monogram: "NF"
  },

  // Credentials-led: the PE licence is requiredForRole — nobody else may seal
  // the drawings. See rule 1 in shapes.js.
  trustBeat: "credentials",

  outcome: {
    headline: "Retrofit 14 spans, zero lane closures",
    context: "State DOT seismic program, 2022-2026 — all 14 under budget",
    artifact: {
      label: "Load rating — 1961 through-truss",
      kind: "document",
      caption: "Rated it, then found the retrofit that kept traffic on it. The second part is the job."
    }
  },

  credentials: [
    {
      id: "urn:lenzli:cred:nadia-pe-wa",
      type: ["VerifiableCredential", "AchievementCredential"],
      tier: "B",
      status: "active",
      selfAsserted: false,
      requiredForRole: true,
      issuer: {
        name: "Washington State Board of Registration for Professional Engineers",
        type: "Government registry",
        mark: "WA BRPELS"
      },
      credentialSubject: { holderName: "Nadia S. Farouk" },
      achievement: {
        name: "Professional Engineer — Civil/Structural",
        shortName: "PE — Civil",
        criteria: "ABET degree + 4 years of qualifying experience + the FE and PE examinations",
        skills: []
      },
      validFrom: "2017-09-30",
      validUntil: "2027-09-30",
      credentialId: "PE-5•••••",
      verification: {
        verifier: "NCEES Records",
        checkedDaysAgo: 5,
        destination: "ncees.org",
        mockResult: {
          status:"Active",
          credential:"Professional Engineer — Civil/Structural",
          holder:"Nadia S. Farouk",
          activeSince:"2017-09-30",
          expiresOn:"2027-09-30"
        }
      },
      scope: "Single state — WA",
      renewal: "Renew every 2 years",
      discipline: "No public disciplinary actions",
      evidenceUrl: null
    },
    {
      id: "urn:lenzli:cred:nadia-load-rating",
      type: ["SelfAssertedClaim"],
      tier: "D",
      status: null,
      selfAsserted: true,
      requiredForRole: false,
      issuer: null,
      credentialSubject: { holderName: "Nadia Farouk" },
      achievement: {
        name: "Bridge load rating — AASHTO MBE",
        criteria: null,
        skills: []
      },
      validFrom: null,
      validUntil: null,
      credentialId: null,
      verification: null,
      scope: null,
      renewal: null,
      discipline: null,
      evidenceUrl: null
    }
  ],

  testimonials: [
    {
      quote: "She turned down our first retrofit scheme, and the one she brought back cost less and kept the bridge open.",
      author: "Ray Okamoto",
      role: "Bridge program manager",
      org: "Cascade Region DOT",
      date: "2026-03"
    }
  ],

  close: {
    scope: ["Seismic retrofit", "Load rating", "Independent design review", "Construction support"],
    rateBand: "$165/hr, or fixed fee per span",
    responseTime: "Replies within a day",
    timezone: "PT",
    cta: { label: "Send a span to review", action: "mock" }
  },

  depth: []
});
