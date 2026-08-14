/* Invented person. Not a real individual. */
//
// src/data/personas/dominic-achebe.js — Dominic Achebe.
//
// Classic script, DOM-free. Loads after src/data/shapes.js.
// Shapes and derivation rules: src/data/shapes.js.
// 4 cards: HOOK, PROOF, TRUST, CLOSE. depth: [] fixes every record in this
// folder at four (SPEC § 4 D4, F-12).
// All dates are authored against LENZLI.BUILD_DATE = "2026-08-12": the CSCS
// runs to the end of 2027, well clear of the 90-day expiring window.
// A thin record — one credential, no depth. Thin is a real record, not a
// special case (F-12).
// No video key — the video slot is Maya's only (A3-5).

LENZLI.registerPersona({
  id: "dominic-achebe",

  identity: {
    name: "Dominic Achebe",
    niche: "S&C coach · post-op return to sport",
    availability: "Two athlete slots open",
    monogram: "DA"
  },

  // Testimonial-led: one tier-B holding and nothing requiredForRole, so neither
  // clause of rule 1 in shapes.js fires.
  trustBeat: "testimonial",

  outcome: {
    headline: "31 ACL returns, median 9.4 months",
    context: "Two D-I programs and a private gym, 2021-2026 — 2 re-tears",
    artifact: {
      label: "Return-to-sport criteria sheet",
      kind: "document",
      caption: "Nobody clears on a calendar in my gym. They clear on the numbers on this sheet."
    }
  },

  credentials: [
    {
      id: "urn:lenzli:cred:dominic-cscs",
      type: ["VerifiableCredential", "AchievementCredential"],
      tier: "B",
      status: "active",
      selfAsserted: false,
      requiredForRole: false,
      issuer: {
        name: "National Strength and Conditioning Association",
        type: "Certification body",
        mark: "NSCA"
      },
      credentialSubject: { holderName: "Dominic O. Achebe" },
      achievement: {
        name: "Certified Strength and Conditioning Specialist (CSCS)",
        shortName: "CSCS",
        criteria: "Accredited bachelor's degree + the scientific-foundations and practical/applied examinations",
        skills: []
      },
      validFrom: "2021-01-22",
      validUntil: "2027-12-31",
      credentialId: "NSCA-3•••••",
      verification: {
        verifier: "NSCA certification registry",
        checkedDaysAgo: 9,
        destination: "nsca.com",
        mockResult: {
          status:"Active",
          credential:"Certified Strength and Conditioning Specialist (CSCS)",
          holder:"Dominic O. Achebe",
          activeSince:"2021-01-22",
          expiresOn:"2027-12-31"
        }
      },
      scope: null,
      renewal: "6.0 CEUs / 3 years",
      discipline: null,
      evidenceUrl: null
    }
  ],

  testimonials: [
    {
      quote: "He would not clear my winger until the hop test matched limb to limb, and I stopped arguing with him after the second season.",
      author: "Marta Kowalczyk",
      role: "Head athletic trainer",
      org: "Bellhaven University",
      date: "2026-03"
    }
  ],

  close: {
    scope: ["Post-op strength phases", "Return-to-sport testing", "In-season maintenance"],
    rateBand: "$95/session, $680 per 8-week block",
    responseTime: "Replies within two days",
    timezone: "ET",
    cta: { label: "Ask about a return-to-sport block", action: "mock" }
  },

  depth: []
});
