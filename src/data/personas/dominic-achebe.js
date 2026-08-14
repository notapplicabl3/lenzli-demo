/* Invented person. Not a real individual. */
//
// src/data/personas/dominic-achebe.js — Dominic Achebe.
//
// Classic script, DOM-free. Loads after src/data/shapes.js.
// Shapes and derivation rules: src/data/shapes.js.
// 4 cards: HOOK, PROOF, TRUST, CLOSE. depth: [] fixes every record in this
// folder at four (SPEC § 4 D4, F-12).
// All dates are authored against LENZLI.BUILD_DATE = "2026-08-12": the CPP
// runs to the end of 2027, well clear of the 90-day expiring window.
// A thin record — one credential, no depth. Thin is a real record, not a
// special case (F-12).
// No video key — the video slot is Maya's only (A3-5).

LENZLI.registerPersona({
  id: "dominic-achebe",

  identity: {
    name: "Dominic Achebe",
    niche: "Documentary photographer · long-form",
    availability: "Two documentary slots open",
    monogram: "DA"
  },

  // Testimonial-led: one tier-B holding and nothing requiredForRole, so neither
  // clause of rule 1 in shapes.js fires.
  trustBeat: "testimonial",

  outcome: {
    headline: "3 essays published, 1 book edit",
    context: "Delta fishing towns, 2021-2026 — one travelling exhibition",
    artifact: {
      label: "Contact sheet — the levee, night two",
      kind: "document",
      caption: "I edit off the sheet, not off the back of the camera. The frames that failed stay next to the one that worked."
    }
  },

  credentials: [
    {
      id: "urn:lenzli:cred:dominic-cpp",
      type: ["VerifiableCredential", "AchievementCredential"],
      tier: "B",
      status: "active",
      selfAsserted: false,
      requiredForRole: false,
      issuer: {
        name: "Professional Photographers of America",
        type: "Certification body",
        mark: "PPA"
      },
      credentialSubject: { holderName: "Dominic O. Achebe" },
      achievement: {
        name: "Certified Professional Photographer (CPP)",
        shortName: "CPP",
        criteria: "Written examination + a juried image submission reviewed by the certification commission",
        skills: []
      },
      validFrom: "2024-12-31",
      validUntil: "2027-12-31",
      credentialId: "PPA-3•••••",
      verification: {
        verifier: "PPA certification registry",
        checkedDaysAgo: 9,
        destination: "ppa.com",
        mockResult: {
          status:"Active",
          credential:"Certified Professional Photographer (CPP)",
          holder:"Dominic O. Achebe",
          activeSince:"2024-12-31",
          expiresOn:"2027-12-31"
        }
      },
      scope: null,
      renewal: "Recertify every 3 years with continuing-education credits",
      discipline: null,
      evidenceUrl: null
    }
  ],

  testimonials: [
    {
      quote: "He would not file the essay until the family had seen the frames, and I stopped arguing with him after the second story.",
      author: "Marta Kowalczyk",
      role: "Photo editor",
      org: "Bellhaven Review",
      date: "2026-03"
    }
  ],

  close: {
    scope: ["Long-form photo essays", "Editorial assignment", "Archive edit and sequencing", "Exhibition prints"],
    rateBand: "$850/day, $4,200 per essay",
    responseTime: "Replies within two days",
    timezone: "ET",
    cta: { label: "Ask about an assignment", action: "mock" }
  },

  depth: []
});
