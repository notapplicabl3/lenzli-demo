/* Invented person. Not a real individual. */
//
// src/data/personas/idris-bello.js — Idris Bello.
//
// Classic script, DOM-free. Loads after src/data/shapes.js.
// Shapes and derivation rules: src/data/shapes.js.
// 4 cards: HOOK, PROOF, TRUST, CLOSE. depth: [] fixes every record in this
// folder at four (SPEC § 4 D4, F-12).
// All dates are authored against LENZLI.BUILD_DATE = "2026-08-12": the
// instructor authorisation's annual cycle closed on 2026-06-30, 43 days before
// it, with the course audit still open — so the programme pauses it rather than
// lapsing it.
// This record carries the corpus's only "suspended" credential besides Alex's
// PMP. The create flow cannot author that state (A1-21).
// No video key — the video slot is Maya's only (A3-5).

LENZLI.registerPersona({
  id: "idris-bello",

  identity: {
    name: "Idris Bello",
    niche: "Concept artist · creatures, environments",
    availability: "Open to a 6-week engagement",
    monogram: "IB"
  },

  // Credentials-led: two holdings at tier A and tier B, no requiredForRole
  // licence. See rule 1 in shapes.js.
  trustBeat: "credentials",

  outcome: {
    headline: "Locked a creature set in 3 rounds",
    context: "Console action title, 2025 — shipped inside the milestone",
    artifact: {
      label: "Turnaround — the marsh creature, 9 sheets",
      kind: "document",
      caption: "Nine pages, one silhouette sheet, and the exact proportions the modellers built to."
    }
  },

  credentials: [
    {
      id: "urn:lenzli:cred:idris-maya",
      // OpenBadgeCredential is what makes this tier A: the badge carries a
      // signed OB 3.0 proof, so the label composes as "signed by {issuer}".
      type: ["VerifiableCredential", "OpenBadgeCredential", "AchievementCredential"],
      tier: "A",
      status: "active",
      selfAsserted: false,
      requiredForRole: false,
      issuer: {
        name: "Autodesk",
        type: "Certification body",
        mark: "Autodesk"
      },
      credentialSubject: { holderName: "Idris A. Bello" },
      achievement: {
        name: "Autodesk Certified Professional — Maya",
        shortName: "Maya (ACP)",
        criteria: "Proctored 75-question examination on modelling, look development and scene assembly",
        skills: ["3D modelling", "Look development"]
      },
      validFrom: "2025-01-16",
      validUntil: "2029-01-16",
      credentialId: "ADSK-2•••••",
      verification: {
        verifier: "Autodesk certification registry",
        checkedDaysAgo: 8,
        destination: "autodesk.com",
        mockResult: {
          status:"Active",
          credential:"Autodesk Certified Professional — Maya",
          holder:"Idris A. Bello",
          activeSince:"2025-01-16",
          expiresOn:"2029-01-16"
        }
      },
      scope: null,
      renewal: "Recertify every 4 years",
      discipline: null,
      evidenceUrl: null
    },
    {
      id: "urn:lenzli:cred:idris-unreal-instructor",
      type: ["VerifiableCredential", "AchievementCredential"],
      tier: "B",
      // Suspended, not expired: the annual cycle closed 43 days before
      // BUILD_DATE with the course audit still open, so the programme pauses
      // the authorisation instead of lapsing it. A two-state UI has to lie
      // about this one.
      status: "suspended",
      selfAsserted: false,
      requiredForRole: false,
      issuer: {
        name: "Epic Games",
        type: "Certification body",
        mark: "Epic"
      },
      credentialSubject: { holderName: "Idris A. Bello" },
      achievement: {
        name: "Unreal Authorized Instructor — Games",
        shortName: "Unreal Instructor",
        criteria: "Portfolio review + a taught-session assessment + the annual course audit",
        skills: []
      },
      validFrom: "2020-06-30",
      validUntil: "2026-06-30",
      credentialId: "EPIC-5•••••",
      verification: {
        verifier: "Epic Games authorised instructor registry",
        checkedDaysAgo: 8,
        destination: "unrealengine.com",
        mockResult: {
          status:"Suspended",
          credential:"Unreal Authorized Instructor — Games",
          holder:"Idris A. Bello",
          activeSince:"2020-06-30",
          expiresOn:"2026-06-30"
        }
      },
      scope: null,
      renewal: "Annual course audit — the 2026 cycle closed with the audit open",
      discipline: null,
      evidenceUrl: null
    },
    {
      id: "urn:lenzli:cred:idris-visual-development",
      type: ["SelfAssertedClaim"],
      tier: "D",
      status: null,
      selfAsserted: true,
      requiredForRole: false,
      issuer: null,
      credentialSubject: { holderName: "Idris Bello" },
      achievement: {
        name: "Visual development — creature design",
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
      quote: "He handed us the silhouette that solved the fight before he handed us the invoice.",
      author: "Naomi Feldt",
      role: "Art director",
      org: "Cardinal Rail Studios",
      date: "2026-02"
    }
  ],

  close: {
    scope: ["Creature and character design", "Environment keyframes", "Visual development packets", "Model-ready turnarounds"],
    rateBand: "$1,450/day, contract",
    responseTime: "Replies within two days",
    timezone: "WAT",
    cta: { label: "Book a scoping call", action: "mock" }
  },

  depth: []
});
