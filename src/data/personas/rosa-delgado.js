/* Invented person. Not a real individual. */
//
// src/data/personas/rosa-delgado.js — Rosa Delgado.
//
// Classic script, DOM-free. Loads after src/data/shapes.js.
// Shapes and derivation rules: src/data/shapes.js.
// 4 cards: HOOK, PROOF, TRUST, CLOSE. depth: [] fixes every record in this
// folder at four (SPEC § 4 D4, F-12).
// All dates are authored against LENZLI.BUILD_DATE = "2026-08-12": the colour
// qualification expires 73 days after it (19 days left in August + 30 in
// September + 24 in October), inside the 90-day expiring window.
// The shop runs digital proofs alongside the presses, which is why a letterpress
// record carries two colour-management holdings from the same issuer.
// The proof plate names one of the six existing local images (A1-16). The
// photo is a placeholder and the alt text says so; the plate's own caption
// carries the meaning either way.
// No video key — the video slot is Maya's only (A3-5).

LENZLI.registerPersona({
  id: "rosa-delgado",

  identity: {
    name: "Rosa Delgado",
    niche: "Letterpress printer · short-run type",
    availability: "Available for short-run press work",
    monogram: "RD"
  },

  // Credentials-led: two tier-B holdings, nothing requiredForRole. The second
  // clause of rule 1 in shapes.js fires.
  trustBeat: "credentials",

  outcome: {
    headline: "Revived 61 fonts a shop had scrapped",
    context: "Civic print collection, 2025-2026 — one font past saving",
    artifact: {
      label: "Specimen — 61 fonts, ranked by condition",
      kind: "document",
      caption: "Each font got a proof, a condition grade and a use. Nine needed conservation that year.",
      image: "src/brand/img/dana-proof.jpg"
    }
  },

  credentials: [
    {
      id: "urn:lenzli:cred:rosa-g7-expert",
      type: ["VerifiableCredential", "AchievementCredential"],
      tier: "B",
      status: "active",
      selfAsserted: false,
      requiredForRole: false,
      issuer: {
        name: "Idealliance",
        type: "Certification body",
        mark: "Idealliance"
      },
      credentialSubject: { holderName: "Rosa M. Delgado" },
      achievement: {
        name: "G7 Expert",
        shortName: "G7 Expert",
        criteria: "Training plus a passed press-calibration submission reviewed by the certification panel",
        skills: []
      },
      validFrom: "2025-02-15",
      validUntil: "2027-02-15",
      credentialId: "IDA-4•••••",
      verification: {
        verifier: "Idealliance certification registry",
        checkedDaysAgo: 7,
        destination: "idealliance.org",
        mockResult: {
          status:"Active",
          credential:"G7 Expert",
          holder:"Rosa M. Delgado",
          activeSince:"2025-02-15",
          expiresOn:"2027-02-15"
        }
      },
      scope: null,
      renewal: "Recertify every 2 years",
      discipline: null,
      evidenceUrl: null
    },
    {
      id: "urn:lenzli:cred:rosa-colour-management",
      type: ["VerifiableCredential", "AchievementCredential"],
      tier: "B",
      // Expiring, not Active: validUntil is 73 days after BUILD_DATE, inside
      // the 90-day window. The registry still answers "Active".
      status: "expiring",
      selfAsserted: false,
      requiredForRole: false,
      issuer: {
        name: "Idealliance",
        type: "Certification body",
        mark: "Idealliance"
      },
      credentialSubject: { holderName: "Rosa M. Delgado" },
      achievement: {
        name: "Color Management Professional — Master",
        shortName: "CMP Master",
        criteria: "Two-day course plus the written and practical colour assessments",
        skills: []
      },
      validFrom: "2021-10-24",
      validUntil: "2026-10-24",
      credentialId: "CMP-8•••••",
      verification: {
        verifier: "Idealliance certification registry",
        checkedDaysAgo: 7,
        destination: "idealliance.org",
        mockResult: {
          status:"Active",
          credential:"Color Management Professional — Master",
          holder:"Rosa M. Delgado",
          activeSince:"2021-10-24",
          expiresOn:"2026-10-24"
        }
      },
      scope: null,
      renewal: "Requalify every 5 years",
      discipline: null,
      evidenceUrl: null
    }
  ],

  testimonials: [
    {
      quote: "The shop wanted sixty-one fonts in the skip. She gave the library a ranked list instead, and the library could act on it.",
      author: "Marguerite Feeley",
      role: "Special collections librarian",
      org: "Ashcombe Public Library",
      date: "2026-02"
    }
  ],

  close: {
    scope: ["Short-run letterpress", "Wood and metal type restoration", "Custom typography", "Press setup and training"],
    rateBand: "$140/hr, $1,100 per short run",
    responseTime: "Replies within a day",
    timezone: "ET",
    cta: { label: "Request a press date", action: "mock" }
  },

  depth: []
});
