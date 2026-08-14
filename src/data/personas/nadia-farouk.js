/* Invented person. Not a real individual. */
//
// src/data/personas/nadia-farouk.js — Nadia Farouk.
//
// Classic script, DOM-free. Loads after src/data/shapes.js.
// Shapes and derivation rules: src/data/shapes.js.
// 4 cards: HOOK, PROOF, TRUST, CLOSE. depth: [] fixes every record in this
// folder at four (SPEC § 4 D4, F-12).
// All dates are authored against LENZLI.BUILD_DATE = "2026-08-12": the
// contractor registration renews 2027-09-30, more than a year out and well
// clear of the 90-day expiring window.
// No video key — the video slot is Maya's only (A3-5).

LENZLI.registerPersona({
  id: "nadia-farouk",

  identity: {
    name: "Nadia Farouk",
    niche: "Muralist · civic walls and transit",
    availability: "Open to a 2026 commission",
    monogram: "NF"
  },

  // Credentials-led: the registration is requiredForRole — an unregistered
  // artist cannot hold the city's installation contract. See rule 1 in
  // shapes.js.
  trustBeat: "credentials",

  outcome: {
    headline: "14 civic murals, zero repaint claims",
    context: "City percent-for-art programme, 2022-2026 — all 14 on budget",
    artifact: {
      label: "Wall report — 1961 transit underpass",
      kind: "document",
      caption: "Surveyed the wall, then found the coating system that let the mural stay on it. The second part is the job."
    }
  },

  credentials: [
    {
      id: "urn:lenzli:cred:nadia-contractor-wa",
      type: ["VerifiableCredential", "AchievementCredential"],
      tier: "B",
      status: "active",
      selfAsserted: false,
      requiredForRole: true,
      issuer: {
        name: "Washington State Department of Labor & Industries",
        type: "Government registry",
        mark: "WA L&I"
      },
      credentialSubject: { holderName: "Nadia S. Farouk" },
      achievement: {
        name: "Registered Specialty Contractor — Public Artwork Installation",
        shortName: "Registered contractor",
        criteria: "Surety bond + liability insurance + registration under RCW 18.27",
        skills: []
      },
      validFrom: "2017-09-30",
      validUntil: "2027-09-30",
      credentialId: "CC-5•••••",
      verification: {
        verifier: "L&I contractor registration lookup",
        checkedDaysAgo: 5,
        destination: "lni.wa.gov",
        mockResult: {
          status:"Active",
          credential:"Registered Specialty Contractor — Public Artwork Installation",
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
      id: "urn:lenzli:cred:nadia-mural-coatings",
      type: ["SelfAssertedClaim"],
      tier: "D",
      status: null,
      selfAsserted: true,
      requiredForRole: false,
      issuer: null,
      credentialSubject: { holderName: "Nadia Farouk" },
      achievement: {
        name: "Mural coatings — anti-graffiti systems",
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
      quote: "She turned down our first wall, and the one she brought back cost less and has not been tagged since.",
      author: "Ray Okamoto",
      role: "Public art programme manager",
      org: "Cascade Regional Transit",
      date: "2026-03"
    }
  ],

  close: {
    scope: ["Civic murals", "Surface and site assessment", "Community design sessions", "Maintenance and re-coating"],
    rateBand: "$165/hr, or fixed fee per wall",
    responseTime: "Replies within a day",
    timezone: "PT",
    cta: { label: "Send a wall to review", action: "mock" }
  },

  depth: []
});
