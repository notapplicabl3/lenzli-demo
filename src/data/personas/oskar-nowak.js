/* Invented person. Not a real individual. */
//
// src/data/personas/oskar-nowak.js — Oskar Nowak.
//
// Classic script, DOM-free. Loads after src/data/shapes.js.
// Shapes and derivation rules: src/data/shapes.js.
// 4 cards: HOOK, PROOF, TRUST, CLOSE. depth: [] fixes every record in this
// folder at four (SPEC § 4 D4, F-12).
// All dates are authored against LENZLI.BUILD_DATE = "2026-08-12": the Siemens
// programmer certificate expires 85 days after it (19 days left in August + 30
// in September + 31 in October + 5 in November), inside the 90-day window.
// No video key — the video slot is Maya's only (A3-5).

LENZLI.registerPersona({
  id: "oskar-nowak",

  identity: {
    name: "Oskar Nowak",
    niche: "Controls engineer · packaging lines",
    availability: "Booking commissioning trips from October",
    monogram: "ON"
  },

  // Credentials-led: two holdings at tier A and tier B, no requiredForRole
  // licence. See rule 1 in shapes.js.
  trustBeat: "credentials",

  outcome: {
    headline: "Cut changeover from 47 to 18 minutes",
    context: "Three-line dairy packaging hall, 2025 — no new hardware",
    artifact: {
      label: "Changeover sequence — before and after",
      kind: "document",
      caption: "Twelve manual steps became four prompts on the HMI. The operators wrote the prompts."
    }
  },

  credentials: [
    {
      id: "urn:lenzli:cred:oskar-fs-eng",
      // OpenBadgeCredential is what makes this tier A: the badge carries a
      // signed OB 3.0 proof, so the label composes as "signed by {issuer}".
      type: ["VerifiableCredential", "OpenBadgeCredential", "AchievementCredential"],
      tier: "A",
      status: "active",
      selfAsserted: false,
      requiredForRole: false,
      issuer: {
        name: "TÜV Rheinland",
        type: "Certification body",
        mark: "TÜV Rheinland"
      },
      credentialSubject: { holderName: "Oskar J. Nowak" },
      achievement: {
        name: "Functional Safety Engineer (TÜV Rheinland) — Machinery",
        shortName: "FS Eng — Machinery",
        criteria: "Course attendance plus the closed-book examination on ISO 13849 and IEC 62061",
        skills: ["Functional safety", "Machinery risk assessment"]
      },
      validFrom: "2024-06-11",
      validUntil: "2029-06-11",
      credentialId: "TR-6•••••",
      verification: {
        verifier: "TÜV Rheinland FS registry",
        checkedDaysAgo: 3,
        destination: "tuv.com",
        mockResult: {
          status:"Active",
          credential:"Functional Safety Engineer (TÜV Rheinland) — Machinery",
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
      id: "urn:lenzli:cred:oskar-simatic",
      type: ["VerifiableCredential", "AchievementCredential"],
      tier: "B",
      // Expiring, not Active: validUntil is 85 days after BUILD_DATE, inside
      // the 90-day window. The portal still answers "Active".
      status: "expiring",
      selfAsserted: false,
      requiredForRole: false,
      issuer: {
        name: "Siemens AG",
        type: "Certification body",
        mark: "Siemens"
      },
      credentialSubject: { holderName: "Oskar J. Nowak" },
      achievement: {
        name: "Siemens Certified Programmer — SIMATIC S7 TIA Portal",
        shortName: "SIMATIC S7 Programmer",
        criteria: "Practical programming assessment on TIA Portal plus the written examination",
        skills: []
      },
      validFrom: "2023-11-05",
      validUntil: "2026-11-05",
      credentialId: "SIE-9•••••",
      verification: {
        verifier: "Siemens certification portal",
        checkedDaysAgo: 3,
        destination: "siemens.com",
        mockResult: {
          status:"Active",
          credential:"Siemens Certified Programmer — SIMATIC S7 TIA Portal",
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
      id: "urn:lenzli:cred:oskar-ignition",
      type: ["SelfAssertedClaim"],
      tier: "D",
      status: null,
      selfAsserted: true,
      requiredForRole: false,
      issuer: null,
      credentialSubject: { holderName: "Oskar Nowak" },
      achievement: {
        name: "SCADA migration — Ignition",
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
      quote: "He sat with the night shift for two days before he touched the code, and that is why the changeover stuck.",
      author: "Ilona Brekke",
      role: "Plant manager",
      org: "Nordvik Dairy",
      date: "2026-01"
    }
  ],

  close: {
    scope: ["Line commissioning", "Changeover reduction", "Safety system design", "SCADA migration"],
    rateBand: "€980/day plus travel",
    responseTime: "Replies within a day",
    timezone: "CET",
    cta: { label: "Ask about a commissioning window", action: "mock" }
  },

  depth: []
});
