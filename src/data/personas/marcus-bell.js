/* Invented person. Not a real individual. */
//
// src/data/personas/marcus-bell.js — Marcus Bell.
//
// Classic script, DOM-free. Loads after src/data/shapes.js.
// Shapes and derivation rules: src/data/shapes.js.
// 4 cards: HOOK, PROOF, TRUST, CLOSE. depth: [] fixes every record in this
// folder at four (SPEC § 4 D4, F-12).
// All dates are authored against LENZLI.BUILD_DATE = "2026-08-12": the EPA 608
// card has no expiry at all, and the NATE specialty runs to 2028 — neither is
// anywhere near the 90-day expiring window.
// No video key — the video slot is Maya's only (A3-5).

LENZLI.registerPersona({
  id: "marcus-bell",

  identity: {
    name: "Marcus Bell",
    niche: "Commercial refrigeration · grocery racks",
    availability: "Taking service contracts for Q4",
    monogram: "MB"
  },

  // Credentials-led: EPA Section 608 is requiredForRole — handling refrigerant
  // without it is not legal work. See rule 1 in shapes.js.
  trustBeat: "credentials",

  outcome: {
    headline: "Cut callbacks 61% across 42 stores",
    context: "Regional grocery chain, 2024-2026 — same tech headcount",
    artifact: {
      label: "Rack log — 42 stores, 18 months",
      kind: "document",
      caption: "Every callback tagged to a cause. Four causes covered most of them."
    }
  },

  credentials: [
    {
      id: "urn:lenzli:cred:marcus-epa608",
      type: ["VerifiableCredential", "AchievementCredential"],
      tier: "B",
      status: "active",
      selfAsserted: false,
      requiredForRole: true,
      issuer: {
        name: "ESCO Institute",
        type: "Certification body",
        mark: "ESCO"
      },
      credentialSubject: { holderName: "Marcus T. Bell" },
      achievement: {
        name: "EPA Section 608 Technician Certification — Universal",
        shortName: "EPA 608 Universal",
        criteria: "Core plus Type I, II and III examinations under 40 CFR Part 82",
        skills: []
      },
      validFrom: "2014-08-19",
      validUntil: null,
      credentialId: "ESCO-1•••••",
      verification: {
        verifier: "ESCO Institute certification lookup",
        checkedDaysAgo: 6,
        destination: "escogroup.org",
        mockResult: {
          status:"Active",
          credential:"EPA Section 608 Technician Certification — Universal",
          holder:"Marcus T. Bell",
          activeSince:"2014-08-19",
          expiresOn:"No stated expiry"
        }
      },
      scope: null,
      renewal: "No stated expiry",
      discipline: null,
      evidenceUrl: null
    },
    {
      id: "urn:lenzli:cred:marcus-nate-refrigeration",
      type: ["VerifiableCredential", "AchievementCredential"],
      tier: "C",
      // Unverifiable, not Active. The dates look current, but nothing was
      // checked, so we cannot say the certification is live. Rule 2, shapes.js.
      status: "unverifiable",
      selfAsserted: false,
      requiredForRole: false,
      issuer: {
        name: "North American Technician Excellence",
        type: "Certification body",
        mark: "NATE"
      },
      credentialSubject: { holderName: "Marcus Bell" },
      achievement: {
        name: "NATE Certified — Commercial Refrigeration Service",
        shortName: "NATE Commercial Refrigeration",
        criteria: "Core examination plus the commercial refrigeration service specialty",
        skills: []
      },
      validFrom: "2023-03-27",
      validUntil: "2028-03-27",
      credentialId: "NATE-5•••••",
      verification: null,
      scope: null,
      renewal: "Recertify every 5 years",
      discipline: null,
      evidenceUrl: "natex.org/verify"
    }
  ],

  testimonials: [
    {
      quote: "He found the four things causing our callbacks and wrote them down so the other techs could find them too.",
      author: "Sylvia Deng",
      role: "Facilities director",
      org: "Harvest Row Markets",
      date: "2026-04"
    }
  ],

  close: {
    scope: ["Rack service", "Callback root-cause review", "Refrigerant compliance", "Tech training"],
    rateBand: "$118/hr, contract rate",
    responseTime: "Replies same day",
    timezone: "CT",
    cta: { label: "Ask about a service contract", action: "mock" }
  },

  depth: []
});
