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
    niche: "Stained glass · historic restoration",
    availability: "Booking survey visits through November",
    monogram: "EV"
  },

  // Credentials-led: the lead certification is requiredForRole — disturbing
  // paint and lead came in a pre-1978 building without it is not legal work.
  // See rule 1 in shapes.js.
  trustBeat: "credentials",

  outcome: {
    headline: "62 windows releaded, 6 sanctuaries",
    context: "Historic churches and civic halls, 2018-2026 — no glass loss",
    artifact: {
      label: "Cutline — nave window 4, full size",
      kind: "document",
      caption: "Every panel gets a full-size cutline before a single piece is cut. The building keeps the drawing when I leave."
    }
  },

  credentials: [
    {
      id: "urn:lenzli:cred:elena-lead-supervisor",
      type: ["VerifiableCredential", "AchievementCredential"],
      tier: "B",
      status: "active",
      selfAsserted: false,
      requiredForRole: true,
      issuer: {
        name: "California Department of Public Health — Lead-Related Construction",
        type: "Government registry",
        mark: "CDPH"
      },
      credentialSubject: { holderName: "Elena M. Vásquez" },
      achievement: {
        name: "Certified Lead Supervisor — Lead-Related Construction",
        shortName: "Lead Supervisor — CA",
        criteria: "Accredited training course + the state certification examination under 17 CCR § 35000",
        skills: []
      },
      validFrom: "2018-04-05",
      validUntil: "2027-04-05",
      credentialId: "LRC-2•••••",
      verification: {
        verifier: "CDPH lead certification lookup",
        checkedDaysAgo: 5,
        destination: "cdph.ca.gov",
        mockResult: {
          status:"Active",
          credential:"Certified Lead Supervisor — Lead-Related Construction",
          holder:"Elena M. Vásquez",
          activeSince:"2018-04-05",
          expiresOn:"2027-04-05"
        }
      },
      scope: "Statewide — CA",
      renewal: "8-hour refresher course / 2 years",
      discipline: "No public disciplinary actions",
      evidenceUrl: null
    }
  ],

  testimonials: [
    {
      quote: "She stopped the removal to test the paint before anyone touched the sash, and the insurer signed the job off because of it.",
      author: "Howard Beaumont",
      role: "Director of properties",
      org: "Beaumont & Iyer Property Trust",
      date: "2026-04"
    }
  ],

  close: {
    scope: ["Releading and restoration", "New commissions", "Protective glazing", "Condition surveys"],
    rateBand: "$95/hr, or by the panel",
    responseTime: "Replies same day",
    timezone: "PT",
    cta: { label: "Check a survey date", action: "mock" }
  },

  depth: []
});
