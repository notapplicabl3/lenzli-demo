/* Invented person. Not a real individual. */
//
// src/data/personas/oskar-nowak.js — Oskar Nowak.
//
// Classic script, DOM-free. Loads after src/data/shapes.js.
// Shapes and derivation rules: src/data/shapes.js.
// 4 cards: HOOK, PROOF, TRUST, CLOSE. depth: [] fixes every record in this
// folder at four (SPEC § 4 D4, F-12).
// All dates are authored against LENZLI.BUILD_DATE = "2026-08-12": the trainer
// certificate expires 85 days after it (19 days left in August + 30 in
// September + 31 in October + 5 in November), inside the 90-day window.
// No video key — the video slot is Maya's only (A3-5).

LENZLI.registerPersona({
  id: "oskar-nowak",

  identity: {
    name: "Oskar Nowak",
    niche: "Composer · documentary and series",
    availability: "Booking scoring dates from October",
    monogram: "ON"
  },

  // Credentials-led: two holdings at tier A and tier B, no requiredForRole
  // licence. See rule 1 in shapes.js.
  trustBeat: "credentials",

  outcome: {
    headline: "47 minutes of score in 18 days",
    context: "Three-part documentary series, 2025 — one live session, no pickups",
    artifact: {
      label: "Cue sheet — before and after picture lock",
      kind: "document",
      caption: "Twelve temp cues became four themes. The editors chose which theme carried the ending."
    }
  },

  credentials: [
    {
      id: "urn:lenzli:cred:oskar-pro-tools",
      // OpenBadgeCredential is what makes this tier A: the badge carries a
      // signed OB 3.0 proof, so the label composes as "signed by {issuer}".
      type: ["VerifiableCredential", "OpenBadgeCredential", "AchievementCredential"],
      tier: "A",
      status: "active",
      selfAsserted: false,
      requiredForRole: false,
      issuer: {
        name: "Avid Technology",
        type: "Certification body",
        mark: "Avid"
      },
      credentialSubject: { holderName: "Oskar J. Nowak" },
      achievement: {
        name: "Avid Certified Professional — Pro Tools | Music Production",
        shortName: "Pro Tools (Certified Pro)",
        criteria: "Instructor-led coursework plus the closed-book examination on session, mix and delivery workflow",
        skills: ["Session mixing", "Score delivery"]
      },
      validFrom: "2024-06-11",
      validUntil: "2029-06-11",
      credentialId: "AVID-6•••••",
      verification: {
        verifier: "Avid certification registry",
        checkedDaysAgo: 3,
        destination: "avid.com",
        mockResult: {
          status:"Active",
          credential:"Avid Certified Professional — Pro Tools | Music Production",
          holder:"Oskar J. Nowak",
          activeSince:"2024-06-11",
          expiresOn:"2029-06-11"
        }
      },
      scope: null,
      renewal: "Recertify every 5 years",
      discipline: null,
      evidenceUrl: null
    },
    {
      id: "urn:lenzli:cred:oskar-cubase-trainer",
      type: ["VerifiableCredential", "AchievementCredential"],
      tier: "B",
      // Expiring, not Active: validUntil is 85 days after BUILD_DATE, inside
      // the 90-day window. The registry still answers "Active".
      status: "expiring",
      selfAsserted: false,
      requiredForRole: false,
      issuer: {
        name: "Steinberg Media Technologies",
        type: "Certification body",
        mark: "Steinberg"
      },
      credentialSubject: { holderName: "Oskar J. Nowak" },
      achievement: {
        name: "Steinberg Certified Trainer — Cubase Pro",
        shortName: "Cubase Certified Trainer",
        criteria: "Practical assessment on Cubase Pro plus a reviewed taught session",
        skills: []
      },
      validFrom: "2023-11-05",
      validUntil: "2026-11-05",
      credentialId: "SMT-9•••••",
      verification: {
        verifier: "Steinberg trainer registry",
        checkedDaysAgo: 3,
        destination: "steinberg.net",
        mockResult: {
          status:"Active",
          credential:"Steinberg Certified Trainer — Cubase Pro",
          holder:"Oskar J. Nowak",
          activeSince:"2023-11-05",
          expiresOn:"2026-11-05"
        }
      },
      scope: null,
      renewal: "Recertify every 3 years",
      discipline: null,
      evidenceUrl: null
    },
    {
      id: "urn:lenzli:cred:oskar-atmos",
      type: ["SelfAssertedClaim"],
      tier: "D",
      status: null,
      selfAsserted: true,
      requiredForRole: false,
      issuer: null,
      credentialSubject: { holderName: "Oskar Nowak" },
      achievement: {
        name: "Scoring to picture — Atmos delivery",
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
      quote: "He sat through the assembly twice before he wrote a bar, and that is why the themes still work after the recut.",
      author: "Ilona Brekke",
      role: "Series producer",
      org: "Nordvik Documentary",
      date: "2026-01"
    }
  ],

  close: {
    scope: ["Original score", "Theme and cue development", "Live session contracting", "Atmos and stereo delivery"],
    rateBand: "€980/day plus session costs",
    responseTime: "Replies within a day",
    timezone: "CET",
    cta: { label: "Ask about a scoring window", action: "mock" }
  },

  depth: []
});
