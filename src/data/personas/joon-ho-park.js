/* Invented person. Not a real individual. */
//
// src/data/personas/joon-ho-park.js — Joon-ho Park.
//
// Classic script, DOM-free. Loads after src/data/shapes.js.
// Shapes and derivation rules: src/data/shapes.js.
// 4 cards: HOOK, PROOF, TRUST, CLOSE. depth: [] fixes every record in this
// folder at four (SPEC § 4 D4, F-12).
// All dates are authored against LENZLI.BUILD_DATE = "2026-08-12": the bench
// certification lapsed on 2026-05-31, 73 days before it (30 days to Jun 30, 31
// more to Jul 31, 12 more to Aug 12).
// No availability line: this is one of four records the directory's
// "availability not stated" facet reads (SPEC § 4 D5, Facets).
// No video key — the video slot is Maya's only (A3-5).

LENZLI.registerPersona({
  id: "joon-ho-park",

  identity: {
    name: "Joon-ho Park",
    niche: "Metalsmith · heirloom gold commissions",
    monogram: "JP"
  },

  // Credentials-led: the dealer licence is requiredForRole — nobody may take a
  // client's gold across the bench without it. Rule 1, shapes.js.
  trustBeat: "credentials",

  outcome: {
    headline: "Reset 148 heirloom stones, zero losses",
    context: "Bench work for three galleries, 2023-2026 — no stone lost at setting",
    artifact: {
      label: "Bench sheet — the ring, cast to finish",
      kind: "document",
      caption: "Every stone weighed in and weighed out, every gram of scrap logged back to the client. The sheet is what the client keeps."
    }
  },

  credentials: [
    {
      id: "urn:lenzli:cred:joonho-precious-metal",
      type: ["VerifiableCredential", "AchievementCredential"],
      tier: "B",
      status: "active",
      selfAsserted: false,
      requiredForRole: true,
      issuer: {
        name: "Texas Department of Public Safety",
        type: "Government registry",
        mark: "TX DPS"
      },
      credentialSubject: { holderName: "Joon-ho Park" },
      achievement: {
        name: "Crafted Precious Metal Dealer Licence",
        shortName: "Precious metal dealer",
        criteria: "Bonded application + background check + transaction record-keeping under Occupations Code ch. 1956",
        skills: []
      },
      validFrom: "2023-11-14",
      validUntil: "2029-11-14",
      credentialId: "CPM-4•••••",
      verification: {
        verifier: "Texas DPS regulatory licence search",
        checkedDaysAgo: 11,
        destination: "dps.texas.gov",
        mockResult: {
          status:"Active",
          credential:"Crafted Precious Metal Dealer Licence",
          holder:"Joon-ho Park",
          activeSince:"2023-11-14",
          expiresOn:"2029-11-14"
        }
      },
      scope: null,
      renewal: "Renew at 3 years, full renewal at 6",
      discipline: null,
      evidenceUrl: null
    },
    {
      id: "urn:lenzli:cred:joonho-bench-jeweler",
      type: ["VerifiableCredential", "AchievementCredential"],
      tier: "B",
      // Lapsed 73 days before BUILD_DATE and kept on the record. An expired
      // credential is never auto-hidden — lapse-then-renew is the normal cycle
      // around a busy commission season, and dropping it silently is the trust
      // leak.
      status: "expired",
      selfAsserted: false,
      requiredForRole: false,
      issuer: {
        name: "Jewelers of America",
        type: "Certification body",
        mark: "JA"
      },
      credentialSubject: { holderName: "Joon-ho Park" },
      achievement: {
        name: "Certified Bench Jeweler Technician (CBJT)",
        shortName: "CBJT",
        criteria: "Written examination + a supervised bench test on sizing, setting and repair",
        skills: []
      },
      validFrom: "2021-05-31",
      validUntil: "2026-05-31",
      credentialId: "JA-8•••••",
      verification: {
        verifier: "Jewelers of America certification registry",
        checkedDaysAgo: 11,
        destination: "jewelers.org",
        mockResult: {
          status:"Expired",
          credential:"Certified Bench Jeweler Technician (CBJT)",
          holder:"Joon-ho Park",
          activeSince:"2021-05-31",
          expiresOn:"2026-05-31"
        }
      },
      scope: null,
      renewal: "Recertify every 5 years",
      discipline: null,
      evidenceUrl: null
    }
  ],

  testimonials: [
    {
      quote: "He red-flagged fourteen stones on a deadline nobody wanted to move, and every one of them set clean.",
      author: "Bill Traeger",
      role: "Gallery director",
      org: "Sabine Point Fine Craft",
      date: "2026-05"
    }
  ],

  close: {
    scope: ["Commission design", "Stone setting", "Heirloom remodels", "Repair and restoration"],
    rateBand: "$780/day plus metal at cost",
    responseTime: "Replies within two days",
    timezone: "CT",
    cta: { label: "Ask about a commission slot", action: "mock" }
  },

  depth: []
});
