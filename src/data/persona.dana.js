// src/data/persona.dana.js — Dana Okafor, RN.
//
// Classic script, DOM-free. Loads after src/data/shapes.js.
// Shapes and derivation rules: src/data/shapes.js.
// 5 cards: HOOK, PROOF, TRUST, CLOSE + 1 depth block.
// All dates are authored against LENZLI.BUILD_DATE = "2026-08-12":
// BLS expires in 41 days, ACLS expired 4 months ago.
// There is no video key on this record — the slot is Maya's only, and an
// empty slot would mark this reel incomplete (A3-5).

LENZLI.registerPersona({
  id: "dana-okafor",

  identity: {
    name: "Dana Okafor, RN",
    niche: "ICU nurse · Level-1 trauma · Chicago",
    availability: "Open to per-diem shifts",
    monogram: "DO"
  },

  // Credentials-led: the RN licence is requiredForRole. See rule 1 in shapes.js.
  trustBeat: "credentials",

  outcome: {
    headline: "Precepted 11 new-grad ICU nurses",
    context: "Level-1 trauma unit, 2023-2026 — 10 still on the unit",
    artifact: {
      label: "Unit onboarding pathway",
      kind: "document",
      caption: "I wrote the 6-week pathway; the unit still runs it.",
      image: "src/brand/img/dana-proof.jpg"
    }
  },

  credentials: [
    {
      id: "urn:lenzli:cred:dana-rn-il",
      type: ["VerifiableCredential", "AchievementCredential"],
      tier: "B",
      status: "active",
      selfAsserted: false,
      requiredForRole: true,
      issuer: {
        name: "Illinois Dept. of Financial & Professional Regulation",
        type: "Government registry",
        mark: "IDFPR"
      },
      credentialSubject: { holderName: "Dana A. Okafor" },
      achievement: {
        name: "Registered Nurse — Illinois",
        criteria: "NCLEX-RN pass + IDFPR licensure",
        skills: []
      },
      validFrom: "2019-05-14",
      validUntil: "2027-05-31",
      credentialId: "041-3•••••",
      verification: {
        verifier: "Nursys",
        checkedDaysAgo: 3,
        destination: "nursys.com",
        mockResult: {
          status:"Active",
          credential:"Registered Nurse — Illinois",
          holder:"Dana A. Okafor",
          activeSince:"2019-05-14",
          expiresOn:"2027-05-31"
        }
      },
      scope: "Single state — IL",
      renewal: "24 CE hours / 2 years",
      discipline: "No public disciplinary actions",
      evidenceUrl: null
    },
    {
      id: "urn:lenzli:cred:dana-bls",
      type: ["VerifiableCredential", "AchievementCredential"],
      tier: "B",
      // Expiring, not Active: validUntil is 41 days after BUILD_DATE, inside the
      // 90-day window. The AHA registry still answers "Active" — see mockResult.
      status: "expiring",
      selfAsserted: false,
      requiredForRole: false,
      issuer: {
        name: "American Heart Association",
        type: "Certification body",
        mark: "AHA"
      },
      credentialSubject: { holderName: "Dana A. Okafor" },
      achievement: {
        name: "Basic Life Support (BLS) Provider",
        criteria: "Skills test + written exam, AHA-aligned course",
        skills: []
      },
      validFrom: "2024-09-22",
      validUntil: "2026-09-22",
      credentialId: "AHA-2•••••",
      verification: {
        verifier: "AHA eCard registry",
        checkedDaysAgo: 3,
        destination: "ecards.heart.org",
        mockResult: {
          status:"Active",
          credential:"Basic Life Support (BLS) Provider",
          holder:"Dana A. Okafor",
          activeSince:"2024-09-22",
          expiresOn:"2026-09-22"
        }
      },
      scope: null,
      renewal: "Recertify every 2 years",
      discipline: null,
      evidenceUrl: null
    },
    {
      id: "urn:lenzli:cred:dana-acls",
      type: ["VerifiableCredential", "AchievementCredential"],
      tier: "B",
      // Lapsed 4 months before BUILD_DATE and kept on the record. An expired
      // credential is never auto-hidden — lapse-then-renew is a normal cycle,
      // and dropping it silently is the trust leak (SPEC § 4 D4).
      status: "expired",
      selfAsserted: false,
      requiredForRole: false,
      issuer: {
        name: "American Heart Association",
        type: "Certification body",
        mark: "AHA"
      },
      credentialSubject: { holderName: "Dana A. Okafor" },
      achievement: {
        name: "Advanced Cardiovascular Life Support (ACLS) Provider",
        criteria: "Megacode skills test + written exam, AHA-aligned course",
        skills: []
      },
      validFrom: "2024-04-12",
      validUntil: "2026-04-12",
      credentialId: "AHA-7•••••",
      verification: {
        verifier: "AHA eCard registry",
        checkedDaysAgo: 3,
        destination: "ecards.heart.org",
        mockResult: {
          status:"Expired",
          credential:"Advanced Cardiovascular Life Support (ACLS) Provider",
          holder:"Dana A. Okafor",
          activeSince:"2024-04-12",
          expiresOn:"2026-04-12"
        }
      },
      scope: null,
      renewal: "Recertify every 2 years",
      discipline: null,
      evidenceUrl: null
    },
    {
      id: "urn:lenzli:cred:dana-preceptor",
      type: ["SelfAssertedClaim"],
      tier: "D",
      status: null,
      selfAsserted: true,
      requiredForRole: false,
      issuer: null,
      credentialSubject: { holderName: "Dana Okafor" },
      achievement: {
        name: "Unit preceptor",
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
      quote: "She is the one I put with the new grads, because she tells them what went wrong on her own shifts.",
      author: "Ruth Vandermeer",
      role: "Nurse manager, medical ICU",
      org: "Lakeshore General Hospital",
      date: "2026-02"
    }
  ],

  close: {
    scope: ["ICU float", "Rapid response", "New-grad precepting"],
    rateBand: "$68-78/hr, per-diem",
    responseTime: "Replies within a day",
    timezone: "CT",
    cta: { label: "Ask about a per-diem shift", action: "mock" }
  },

  depth: [
    { kind: "wallet" }
  ]
});
