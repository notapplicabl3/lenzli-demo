/* Invented person. Not a real individual. */
//
// src/data/personas/idris-bello.js — Idris Bello.
//
// Classic script, DOM-free. Loads after src/data/shapes.js.
// Shapes and derivation rules: src/data/shapes.js.
// 4 cards: HOOK, PROOF, TRUST, CLOSE. depth: [] fixes every record in this
// folder at four (SPEC § 4 D4, F-12).
// All dates are authored against LENZLI.BUILD_DATE = "2026-08-12": the CISSP
// three-year cycle closed on 2026-06-30, 43 days before it, with the CPE audit
// still open — so the registry pauses it rather than lapsing it.
// This record carries the corpus's only "suspended" credential besides Alex's
// PMP. The create flow cannot author that state (A1-21).
// No video key — the video slot is Maya's only (A3-5).

LENZLI.registerPersona({
  id: "idris-bello",

  identity: {
    name: "Idris Bello",
    niche: "Appsec · payment flows · threat modeling",
    availability: "Open to a 6-week engagement",
    monogram: "IB"
  },

  // Credentials-led: two holdings at tier A and tier B, no requiredForRole
  // licence. See rule 1 in shapes.js.
  trustBeat: "credentials",

  outcome: {
    headline: "Found the auth bypass 4 audits missed",
    context: "Card-present payments platform, 2025 — fixed inside the disclosure window",
    artifact: {
      label: "Write-up — token replay in the refund path",
      kind: "document",
      caption: "Nine pages, one diagram, and the exact request that did it."
    }
  },

  credentials: [
    {
      id: "urn:lenzli:cred:idris-gwapt",
      // OpenBadgeCredential is what makes this tier A: the badge carries a
      // signed OB 3.0 proof, so the label composes as "signed by {issuer}".
      type: ["VerifiableCredential", "OpenBadgeCredential", "AchievementCredential"],
      tier: "A",
      status: "active",
      selfAsserted: false,
      requiredForRole: false,
      issuer: {
        name: "Global Information Assurance Certification",
        type: "Certification body",
        mark: "GIAC"
      },
      credentialSubject: { holderName: "Idris A. Bello" },
      achievement: {
        name: "GIAC Web Application Penetration Tester (GWAPT)",
        shortName: "GWAPT",
        criteria: "Proctored 75-question examination on web application testing and exploitation",
        skills: ["Web application testing", "Exploit development"]
      },
      validFrom: "2025-01-16",
      validUntil: "2029-01-16",
      credentialId: "GIAC-2•••••",
      verification: {
        verifier: "GIAC certification registry",
        checkedDaysAgo: 8,
        destination: "giac.org",
        mockResult: {
          status:"Active",
          credential:"GIAC Web Application Penetration Tester (GWAPT)",
          holder:"Idris A. Bello",
          activeSince:"2025-01-16",
          expiresOn:"2029-01-16"
        }
      },
      scope: null,
      renewal: "36 CPEs / 4 years",
      discipline: null,
      evidenceUrl: null
    },
    {
      id: "urn:lenzli:cred:idris-cissp",
      type: ["VerifiableCredential", "AchievementCredential"],
      tier: "B",
      // Suspended, not expired: the three-year cycle closed 43 days before
      // BUILD_DATE with a CPE audit still open, so the registry pauses the
      // certification instead of lapsing it. A two-state UI has to lie about
      // this one.
      status: "suspended",
      selfAsserted: false,
      requiredForRole: false,
      issuer: {
        name: "ISC2",
        type: "Certification body",
        mark: "ISC2"
      },
      credentialSubject: { holderName: "Idris A. Bello" },
      achievement: {
        name: "Certified Information Systems Security Professional (CISSP)",
        shortName: "CISSP",
        criteria: "5 years of domain experience + the CISSP examination + member endorsement",
        skills: []
      },
      validFrom: "2020-06-30",
      validUntil: "2026-06-30",
      credentialId: "ISC2-5•••••",
      verification: {
        verifier: "ISC2 member registry",
        checkedDaysAgo: 8,
        destination: "isc2.org",
        mockResult: {
          status:"Suspended",
          credential:"Certified Information Systems Security Professional (CISSP)",
          holder:"Idris A. Bello",
          activeSince:"2020-06-30",
          expiresOn:"2026-06-30"
        }
      },
      scope: null,
      renewal: "120 CPEs / 3 years — cycle closed with the CPE audit open",
      discipline: null,
      evidenceUrl: null
    },
    {
      id: "urn:lenzli:cred:idris-threat-modeling",
      type: ["SelfAssertedClaim"],
      tier: "D",
      status: null,
      selfAsserted: true,
      requiredForRole: false,
      issuer: null,
      credentialSubject: { holderName: "Idris Bello" },
      achievement: {
        name: "Threat modeling — STRIDE",
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
      quote: "He handed us the request that broke it before he handed us the invoice.",
      author: "Naomi Feldt",
      role: "VP Engineering",
      org: "Cardinal Rail Payments",
      date: "2026-02"
    }
  ],

  close: {
    scope: ["Payment flow review", "Threat modeling workshops", "Web app pentest", "Fix verification"],
    rateBand: "$1,450/day, contract",
    responseTime: "Replies within two days",
    timezone: "WAT",
    cta: { label: "Book a scoping call", action: "mock" }
  },

  depth: []
});
