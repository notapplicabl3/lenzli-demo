/* Invented person. Not a real individual. */
//
// src/data/personas/rosa-delgado.js — Rosa Delgado.
//
// Classic script, DOM-free. Loads after src/data/shapes.js.
// Shapes and derivation rules: src/data/shapes.js.
// 4 cards: HOOK, PROOF, TRUST, CLOSE. depth: [] fixes every record in this
// folder at four (SPEC § 4 D4, F-12).
// All dates are authored against LENZLI.BUILD_DATE = "2026-08-12": the TRAQ
// qualification expires 73 days after it (19 days left in August + 30 in
// September + 24 in October), inside the 90-day expiring window.
// The proof plate names one of the six existing local images (A1-16). The
// photo is a placeholder and the alt text says so; the plate's own caption
// carries the meaning either way.
// No video key — the video slot is Maya's only (A3-5).

LENZLI.registerPersona({
  id: "rosa-delgado",

  identity: {
    name: "Rosa Delgado",
    niche: "Consulting arborist · tree risk · storms",
    availability: "Available for post-storm assessments",
    monogram: "RD"
  },

  // Credentials-led: two tier-B holdings, nothing requiredForRole. The second
  // clause of rule 1 in shapes.js fires.
  trustBeat: "credentials",

  outcome: {
    headline: "Kept 61 trees a contractor condemned",
    context: "Municipal campus, 2025-2026 — one removal after the derecho",
    artifact: {
      label: "Risk assessment — 61 trees, ranked",
      kind: "document",
      caption: "Each tree got a target, a likelihood and a consequence. Nine needed work that year.",
      image: "src/brand/img/dana-proof.jpg"
    }
  },

  credentials: [
    {
      id: "urn:lenzli:cred:rosa-isa-arborist",
      type: ["VerifiableCredential", "AchievementCredential"],
      tier: "B",
      status: "active",
      selfAsserted: false,
      requiredForRole: false,
      issuer: {
        name: "International Society of Arboriculture",
        type: "Certification body",
        mark: "ISA"
      },
      credentialSubject: { holderName: "Rosa M. Delgado" },
      achievement: {
        name: "ISA Certified Arborist",
        shortName: "Certified Arborist",
        criteria: "Three years of arboriculture experience plus the ISA certification examination",
        skills: []
      },
      validFrom: "2019-02-15",
      validUntil: "2028-02-15",
      credentialId: "ISA-4•••••",
      verification: {
        verifier: "International Society of Arboriculture registry",
        checkedDaysAgo: 7,
        destination: "isa-arbor.com",
        mockResult: {
          status:"Active",
          credential:"ISA Certified Arborist",
          holder:"Rosa M. Delgado",
          activeSince:"2019-02-15",
          expiresOn:"2028-02-15"
        }
      },
      scope: null,
      renewal: "30 CEUs / 3 years",
      discipline: null,
      evidenceUrl: null
    },
    {
      id: "urn:lenzli:cred:rosa-traq",
      type: ["VerifiableCredential", "AchievementCredential"],
      tier: "B",
      // Expiring, not Active: validUntil is 73 days after BUILD_DATE, inside
      // the 90-day window. The registry still answers "Active".
      status: "expiring",
      selfAsserted: false,
      requiredForRole: false,
      issuer: {
        name: "International Society of Arboriculture",
        type: "Certification body",
        mark: "ISA"
      },
      credentialSubject: { holderName: "Rosa M. Delgado" },
      achievement: {
        name: "Tree Risk Assessment Qualification (TRAQ)",
        shortName: "TRAQ",
        criteria: "Two-day course plus the written and field assessments",
        skills: []
      },
      validFrom: "2021-10-24",
      validUntil: "2026-10-24",
      credentialId: "TRAQ-8•••••",
      verification: {
        verifier: "International Society of Arboriculture registry",
        checkedDaysAgo: 7,
        destination: "isa-arbor.com",
        mockResult: {
          status:"Active",
          credential:"Tree Risk Assessment Qualification (TRAQ)",
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
      quote: "The contractor wanted sixty-one trees down. She gave the council a ranked list instead, and the council could act on it.",
      author: "Marguerite Feeley",
      role: "Grounds superintendent",
      org: "Ashcombe Municipal Campus",
      date: "2026-02"
    }
  ],

  close: {
    scope: ["Tree risk assessment", "Post-storm triage", "Preservation plans", "Expert testimony"],
    rateBand: "$140/hr, $1,100 per site report",
    responseTime: "Replies within a day",
    timezone: "ET",
    cta: { label: "Request a site walk", action: "mock" }
  },

  depth: []
});
