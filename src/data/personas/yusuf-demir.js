/* Invented person. Not a real individual. */
//
// src/data/personas/yusuf-demir.js — Yusuf Demir.
//
// Classic script, DOM-free. Loads after src/data/shapes.js.
// Shapes and derivation rules: src/data/shapes.js.
// 4 cards: HOOK, PROOF, TRUST, CLOSE. depth: [] fixes every record in this
// folder at four (SPEC § 4 D4, F-12).
// All dates are authored against LENZLI.BUILD_DATE = "2026-08-12": the remote
// pilot certificate does not expire, so nothing here sits near the 90-day
// expiring window.
// The proof plate names one of the six existing local images (A1-16). The
// photo is a placeholder and the alt text says so; the plate's own caption
// carries the meaning either way.
// No video key — the video slot is Maya's only (A3-5).

LENZLI.registerPersona({
  id: "yusuf-demir",

  identity: {
    name: "Yusuf Demir",
    niche: "Drone survey · earthwork volumes",
    availability: "Booking flights through October",
    monogram: "YD"
  },

  // Credentials-led: the remote pilot certificate is requiredForRole — flying
  // this commercially without it is not legal. See rule 1 in shapes.js.
  trustBeat: "credentials",

  outcome: {
    headline: "Dropped a 12-day survey to 3 days",
    context: "Quarry stockpiles and haul road, 2025-2026 — volumes within 1.8% of ground truth",
    artifact: {
      label: "Cut-and-fill map — 3 flight days",
      kind: "document",
      caption: "Ground control every 400 metres, then the volumes. The client checked two stockpiles by truck count.",
      image: "src/brand/img/alex-depth.jpg"
    }
  },

  credentials: [
    {
      id: "urn:lenzli:cred:yusuf-part107",
      type: ["VerifiableCredential", "AchievementCredential"],
      tier: "B",
      status: "active",
      selfAsserted: false,
      requiredForRole: true,
      issuer: {
        name: "Federal Aviation Administration",
        type: "Government registry",
        mark: "FAA"
      },
      credentialSubject: { holderName: "Yusuf K. Demir" },
      achievement: {
        name: "Remote Pilot Certificate — Small Unmanned Aircraft Systems",
        shortName: "Remote Pilot (Part 107)",
        criteria: "Aeronautical knowledge examination under 14 CFR Part 107",
        skills: []
      },
      validFrom: "2022-04-21",
      validUntil: null,
      credentialId: "FAA-7•••••",
      verification: {
        verifier: "FAA Airman registry",
        checkedDaysAgo: 10,
        destination: "faa.gov",
        mockResult: {
          status:"Active",
          credential:"Remote Pilot Certificate — Small Unmanned Aircraft Systems",
          holder:"Yusuf K. Demir",
          activeSince:"2022-04-21",
          expiresOn:"No stated expiry"
        }
      },
      scope: "United States",
      renewal: "Recurrent training every 24 calendar months",
      discipline: null,
      evidenceUrl: null
    },
    {
      id: "urn:lenzli:cred:yusuf-photogrammetry",
      type: ["SelfAssertedClaim"],
      tier: "D",
      status: null,
      selfAsserted: true,
      requiredForRole: false,
      issuer: null,
      credentialSubject: { holderName: "Yusuf Demir" },
      achievement: {
        name: "Photogrammetry — RTK ground control",
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
      quote: "He flew it on a Tuesday and the volumes were on my desk Thursday, and the truck counts backed them up.",
      author: "Halil Arslan",
      role: "Quarry operations manager",
      org: "Bergama Aggregates",
      date: "2026-06"
    }
  ],

  close: {
    scope: ["Stockpile volumes", "Earthwork progress", "Ground control setup", "Orthomosaic delivery"],
    rateBand: "$1,900 per site day",
    responseTime: "Replies same day",
    timezone: "TRT",
    cta: { label: "Ask about a flight day", action: "mock" }
  },

  depth: []
});
