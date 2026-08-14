/* Invented person. Not a real individual. */
//
// src/data/personas/elena-vasquez.js — Elena Vásquez.
//
// Classic script, DOM-free. Loads after src/data/shapes.js.
// Shapes and derivation rules: src/data/shapes.js.
// 4 cards: HOOK, PROOF, TRUST, CLOSE. depth: [] fixes every record in this
// folder at four (SPEC § 4 D4, F-12).
// All dates are authored against LENZLI.BUILD_DATE = "2026-08-12": the
// certification runs to 2027-04-05, well past the 90-day expiring window.
// A thin record — one credential, no depth. Thin is a real record (F-12).
// No video key — the video slot is Maya's only (A3-5).

LENZLI.registerPersona({
  id: "elena-vasquez",

  identity: {
    name: "Elena Vásquez",
    niche: "Spanish court interpreter · civil trials",
    availability: "Booking depositions through November",
    monogram: "EV"
  },

  // Credentials-led: the court certification is requiredForRole — an
  // uncertified interpreter cannot take the assignment. See rule 1 in shapes.js.
  trustBeat: "credentials",

  outcome: {
    headline: "1,180 hearing hours across 6 counties",
    context: "Superior court civil and family calendars, 2018-2026",
    artifact: {
      label: "Glossary — construction defect",
      kind: "document",
      caption: "Every case gets a term list before day one. Counsel gets it too, so we argue about facts instead of words."
    }
  },

  credentials: [
    {
      id: "urn:lenzli:cred:elena-court-interpreter",
      type: ["VerifiableCredential", "AchievementCredential"],
      tier: "B",
      status: "active",
      selfAsserted: false,
      requiredForRole: true,
      issuer: {
        name: "Judicial Council of California",
        type: "Government registry",
        mark: "JCC"
      },
      credentialSubject: { holderName: "Elena M. Vásquez" },
      achievement: {
        name: "Certified Court Interpreter — Spanish",
        shortName: "Court interpreter — Spanish",
        criteria: "Bilingual interpreting examination + oath and registration with the Judicial Council",
        skills: []
      },
      validFrom: "2018-04-05",
      validUntil: "2027-04-05",
      credentialId: "CI-2•••••",
      verification: {
        verifier: "California Judicial Council interpreter registry",
        checkedDaysAgo: 5,
        destination: "courts.ca.gov",
        mockResult: {
          status:"Active",
          credential:"Certified Court Interpreter — Spanish",
          holder:"Elena M. Vásquez",
          activeSince:"2018-04-05",
          expiresOn:"2027-04-05"
        }
      },
      scope: "Statewide — CA",
      renewal: "30 CE hours + 40 assignments / 2 years",
      discipline: "No public disciplinary actions",
      evidenceUrl: null
    }
  ],

  testimonials: [
    {
      quote: "She stopped the deposition to put a term on the record correctly, and the transcript survived a motion because of it.",
      author: "Howard Beaumont",
      role: "Partner, civil litigation",
      org: "Beaumont & Iyer",
      date: "2026-04"
    }
  ],

  close: {
    scope: ["Depositions", "Civil trial", "Family calendar", "Certified transcript review"],
    rateBand: "$95/hr, half-day minimum",
    responseTime: "Replies same day",
    timezone: "PT",
    cta: { label: "Check a deposition date", action: "mock" }
  },

  depth: []
});
