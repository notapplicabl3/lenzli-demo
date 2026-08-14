/* Invented person. Not a real individual. */
//
// src/data/personas/grace-whitfield.js — Grace Whitfield.
//
// Classic script, DOM-free. Loads after src/data/shapes.js.
// Shapes and derivation rules: src/data/shapes.js.
// 4 cards: HOOK, PROOF, TRUST, CLOSE. depth: [] fixes every record in this
// folder at four (SPEC § 4 D4, F-12).
// All dates are authored against LENZLI.BUILD_DATE = "2026-08-12": the mold
// consultant licence was withdrawn on 2026-04-30, 104 days before it, while its
// stated term still ran to 2027-02-28. Revoked is what the registry answers;
// the term end is what the paper says.
// This record carries the corpus's only "revoked" credential. The create flow
// cannot author that state (A1-21), so the directory's facets see it only here.
// No availability line: this is one of four records the directory's
// "availability not stated" facet reads (SPEC § 4 D5, Facets).
// No video key — the video slot is Maya's only (A3-5).

LENZLI.registerPersona({
  id: "grace-whitfield",

  identity: {
    name: "Grace Whitfield",
    niche: "Home inspector · 1920-1975 housing stock",
    monogram: "GW"
  },

  // Credentials-led: the TREC inspector licence is requiredForRole, and there
  // are two tier-B holdings besides. Either clause of rule 1 fires.
  trustBeat: "credentials",

  outcome: {
    headline: "Found $2.1M in deferred repairs",
    context: "1,900 inspections across two Texas counties, 2016-2026",
    artifact: {
      label: "Sample report — 1948 pier-and-beam",
      kind: "document",
      caption: "Photos, then the cost band, then what I would fix first. Buyers read the last part."
    }
  },

  credentials: [
    {
      id: "urn:lenzli:cred:grace-trec-inspector",
      type: ["VerifiableCredential", "AchievementCredential"],
      tier: "B",
      status: "active",
      selfAsserted: false,
      requiredForRole: true,
      issuer: {
        name: "Texas Real Estate Commission",
        type: "Government registry",
        mark: "TREC"
      },
      credentialSubject: { holderName: "Grace E. Whitfield" },
      achievement: {
        name: "Professional Real Estate Inspector",
        shortName: "TREC Inspector",
        criteria: "194 classroom hours + the national and state inspector examinations",
        skills: []
      },
      validFrom: "2016-07-11",
      validUntil: "2028-07-31",
      credentialId: "TREC-9•••••",
      verification: {
        verifier: "Texas Real Estate Commission licence lookup",
        checkedDaysAgo: 7,
        destination: "trec.texas.gov",
        mockResult: {
          status:"Active",
          credential:"Professional Real Estate Inspector",
          holder:"Grace E. Whitfield",
          activeSince:"2016-07-11",
          expiresOn:"2028-07-31"
        }
      },
      scope: "Single state — TX",
      renewal: "32 CE hours / 2 years",
      discipline: "No public disciplinary actions",
      evidenceUrl: null
    },
    {
      id: "urn:lenzli:cred:grace-mold-assessment",
      type: ["VerifiableCredential", "AchievementCredential"],
      tier: "B",
      // Revoked, not expired: the department withdrew it 104 days before
      // BUILD_DATE while the stated term still had months to run. It stays on
      // the record on purpose — a revoked licence is precisely the state no
      // holder would self-report (A1-21), and hiding it is the trust leak the
      // ladder exists to close.
      status: "revoked",
      selfAsserted: false,
      requiredForRole: false,
      issuer: {
        name: "Texas Department of Licensing and Regulation",
        type: "Government registry",
        mark: "TDLR"
      },
      credentialSubject: { holderName: "Grace E. Whitfield" },
      achievement: {
        name: "Mold Assessment Consultant",
        shortName: "Mold Assessment",
        criteria: "Approved training course + the state licensing examination",
        skills: []
      },
      validFrom: "2021-03-01",
      validUntil: "2027-02-28",
      credentialId: "MAC-1•••••",
      verification: {
        verifier: "Texas Dept. of Licensing and Regulation licence search",
        checkedDaysAgo: 7,
        destination: "tdlr.texas.gov",
        mockResult: {
          status:"Revoked",
          credential:"Mold Assessment Consultant",
          holder:"Grace E. Whitfield",
          activeSince:"2021-03-01",
          expiresOn:"2027-02-28"
        }
      },
      scope: "Single state — TX",
      renewal: "Not renewable while revoked",
      discipline: "Revoked 2026-04-30 — continuing-education hours filed through a provider the department later decertified",
      evidenceUrl: null
    },
    {
      id: "urn:lenzli:cred:grace-internachi-cpi",
      type: ["VerifiableCredential", "AchievementCredential"],
      tier: "C",
      // Unverifiable, not Active. The membership page exists and nobody read
      // it, so we cannot say the certification is live. See rule 2 in shapes.js.
      status: "unverifiable",
      selfAsserted: false,
      requiredForRole: false,
      issuer: {
        name: "International Association of Certified Home Inspectors",
        type: "Certification body",
        mark: "InterNACHI"
      },
      credentialSubject: { holderName: "Grace Whitfield" },
      achievement: {
        name: "Certified Professional Inspector (CPI)",
        shortName: "InterNACHI CPI",
        criteria: "Membership examination + annual continuing education",
        skills: []
      },
      validFrom: "2016-09-02",
      validUntil: null,
      credentialId: "NACHI-6•••••",
      verification: null,
      scope: null,
      renewal: "Annual membership",
      discipline: null,
      evidenceUrl: "nachi.org/verify"
    }
  ],

  testimonials: [
    {
      quote: "She told my buyers to walk on a house I had listed, and she was right, and I still send her every inspection I have.",
      author: "Curtis Delaney",
      role: "Broker",
      org: "Delaney Property Group",
      date: "2026-01"
    }
  ],

  close: {
    scope: ["Pre-listing inspection", "Buyer inspection", "Pier-and-beam foundations", "Re-inspection after repairs"],
    rateBand: "$475-750 by square footage",
    responseTime: "Replies within a day",
    timezone: "CT",
    cta: { label: "Check an inspection date", action: "mock" }
  },

  depth: []
});
