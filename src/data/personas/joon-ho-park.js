/* Invented person. Not a real individual. */
//
// src/data/personas/joon-ho-park.js — Joon-ho Park.
//
// Classic script, DOM-free. Loads after src/data/shapes.js.
// Shapes and derivation rules: src/data/shapes.js.
// 4 cards: HOOK, PROOF, TRUST, CLOSE. depth: [] fixes every record in this
// folder at four (SPEC § 4 D4, F-12).
// All dates are authored against LENZLI.BUILD_DATE = "2026-08-12": the ASNT
// Level II lapsed on 2026-05-31, 73 days before it (30 days to Jun 30, 31 more
// to Jul 31, 12 more to Aug 12).
// No availability line: this is one of four records the directory's
// "availability not stated" facet reads (SPEC § 4 D5, Facets).
// No video key — the video slot is Maya's only (A3-5).

LENZLI.registerPersona({
  id: "joon-ho-park",

  identity: {
    name: "Joon-ho Park",
    niche: "Piping inspector · refinery turnarounds",
    monogram: "JP"
  },

  // Credentials-led: the API 570 certification is requiredForRole — no operator
  // lets an uncertified inspector sign off in-service piping. Rule 1, shapes.js.
  trustBeat: "credentials",

  outcome: {
    headline: "Caught 14 rejectable welds before hydro",
    context: "Gulf Coast crude unit turnaround, 2026 — no post-startup leaks",
    artifact: {
      label: "Weld map — unit 42 revamp",
      kind: "document",
      caption: "Every joint numbered, every radiograph filed against it. The map is what the client keeps."
    }
  },

  credentials: [
    {
      id: "urn:lenzli:cred:joonho-api570",
      type: ["VerifiableCredential", "AchievementCredential"],
      tier: "B",
      status: "active",
      selfAsserted: false,
      requiredForRole: true,
      issuer: {
        name: "American Petroleum Institute",
        type: "Certification body",
        mark: "API"
      },
      credentialSubject: { holderName: "Joon-ho Park" },
      achievement: {
        name: "API 570 Piping Inspector",
        shortName: "API 570",
        criteria: "Closed- and open-book examinations on in-service piping inspection plus documented experience",
        skills: []
      },
      validFrom: "2023-11-14",
      validUntil: "2029-11-14",
      credentialId: "API-4•••••",
      verification: {
        verifier: "API Individual Certification Programs",
        checkedDaysAgo: 11,
        destination: "api.org",
        mockResult: {
          status:"Active",
          credential:"API 570 Piping Inspector",
          holder:"Joon-ho Park",
          activeSince:"2023-11-14",
          expiresOn:"2029-11-14"
        }
      },
      scope: null,
      renewal: "Recertify at 3 years, full renewal at 6",
      discipline: null,
      evidenceUrl: null
    },
    {
      id: "urn:lenzli:cred:joonho-ndt-ut",
      type: ["VerifiableCredential", "AchievementCredential"],
      tier: "B",
      // Lapsed 73 days before BUILD_DATE and kept on the record. An expired
      // credential is never auto-hidden — lapse-then-renew is the normal cycle
      // between turnarounds, and dropping it silently is the trust leak.
      status: "expired",
      selfAsserted: false,
      requiredForRole: false,
      issuer: {
        name: "American Society for Nondestructive Testing",
        type: "Certification body",
        mark: "ASNT"
      },
      credentialSubject: { holderName: "Joon-ho Park" },
      achievement: {
        name: "NDT Level II — Ultrasonic Testing",
        shortName: "NDT II — UT",
        criteria: "General, specific and practical examinations under an approved written practice",
        skills: []
      },
      validFrom: "2021-05-31",
      validUntil: "2026-05-31",
      credentialId: "ASNT-8•••••",
      verification: {
        verifier: "ASNT central certification registry",
        checkedDaysAgo: 11,
        destination: "asnt.org",
        mockResult: {
          status:"Expired",
          credential:"NDT Level II — Ultrasonic Testing",
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
      quote: "He red-lined fourteen joints on a schedule nobody wanted to slip, and the unit started clean.",
      author: "Bill Traeger",
      role: "Turnaround manager",
      org: "Sabine Point Refining",
      date: "2026-05"
    }
  ],

  close: {
    scope: ["Turnaround inspection", "In-service piping", "Weld map and RT review", "Repair procedure sign-off"],
    rateBand: "$780/day plus per diem",
    responseTime: "Replies within two days",
    timezone: "CT",
    cta: { label: "Ask about turnaround dates", action: "mock" }
  },

  depth: []
});
