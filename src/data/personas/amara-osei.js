/* Invented person. Not a real individual. */
//
// src/data/personas/amara-osei.js — Amara Osei.
//
// Classic script, DOM-free. Loads after src/data/shapes.js.
// Shapes and derivation rules: src/data/shapes.js.
// 4 cards: HOOK, PROOF, TRUST, CLOSE. depth: [] fixes every record in this
// folder at four (SPEC § 4 D4, F-12).
// All dates are authored against LENZLI.BUILD_DATE = "2026-08-12":
// the Storyboard Pro certificate expires 58 days after it (19 days left in
// August + 30 in September + 9 in October), which is inside the 90-day
// expiring window.
// No video key — the video slot is Maya's only (A3-5).

LENZLI.registerPersona({
  id: "amara-osei",

  identity: {
    name: "Amara Osei",
    niche: "Storyboard artist · animation series",
    availability: "Boarding one more show this year",
    monogram: "AO"
  },

  // Credentials-led: the guild membership is requiredForRole. See rule 1 in
  // shapes.js.
  trustBeat: "credentials",

  outcome: {
    headline: "9 episodes boarded, 2 retake notes",
    context: "Half-hour animated series, 2019-2026 — three seasons, same crew",
    artifact: {
      label: "Sequence board — the chase, 84 panels",
      kind: "document",
      caption: "I board the beat before I board the pose. The panel count is the argument, not the drawing."
    }
  },

  credentials: [
    {
      id: "urn:lenzli:cred:amara-tag839",
      type: ["VerifiableCredential", "AchievementCredential"],
      tier: "B",
      status: "active",
      selfAsserted: false,
      requiredForRole: true,
      issuer: {
        name: "The Animation Guild, IATSE Local 839",
        type: "Certification body",
        mark: "TAG 839"
      },
      credentialSubject: { holderName: "Amara N. Osei" },
      achievement: {
        name: "Member in good standing — Story Artist classification",
        shortName: "TAG 839 — Story",
        criteria: "Documented hours in the story classification on a signatory production + admission by the membership committee",
        skills: []
      },
      validFrom: "2019-06-18",
      validUntil: "2029-06-18",
      credentialId: "TAG-4•••••",
      verification: {
        verifier: "Animation Guild membership registry",
        checkedDaysAgo: 4,
        destination: "animationguild.org",
        mockResult: {
          status:"Active",
          credential:"Member in good standing — Story Artist classification",
          holder:"Amara N. Osei",
          activeSince:"2019-06-18",
          expiresOn:"2029-06-18"
        }
      },
      scope: "Signatory productions — United States",
      renewal: "Quarterly dues + 30 worked days / 3 years",
      discipline: "No membership discipline on file",
      evidenceUrl: null
    },
    {
      id: "urn:lenzli:cred:amara-storyboard-pro",
      type: ["VerifiableCredential", "AchievementCredential"],
      tier: "B",
      // Expiring, not Active: validUntil is 58 days after BUILD_DATE, inside the
      // 90-day window. The vendor registry still answers "Active" — see
      // mockResult.
      status: "expiring",
      selfAsserted: false,
      requiredForRole: false,
      issuer: {
        name: "Toon Boom Animation",
        type: "Certification body",
        mark: "Toon Boom"
      },
      credentialSubject: { holderName: "Amara N. Osei" },
      achievement: {
        name: "Toon Boom Certified Professional — Storyboard Pro",
        shortName: "Storyboard Pro (Certified)",
        criteria: "Practical assessment on camera moves, timing and animatic export",
        skills: []
      },
      validFrom: "2024-10-09",
      validUntil: "2026-10-09",
      credentialId: "TBC-8•••••",
      verification: {
        verifier: "Toon Boom certification registry",
        checkedDaysAgo: 4,
        destination: "toonboom.com",
        mockResult: {
          status:"Active",
          credential:"Toon Boom Certified Professional — Storyboard Pro",
          holder:"Amara N. Osei",
          activeSince:"2024-10-09",
          expiresOn:"2026-10-09"
        }
      },
      scope: null,
      renewal: "Recertify every 2 years",
      discipline: null,
      evidenceUrl: null
    }
  ],

  testimonials: [
    {
      quote: "She boards the version we can afford before she boards the version we want, and in four years the second one has always been the one we shot.",
      author: "Wendell Sarraf",
      role: "Supervising director",
      org: "Prairie Vale Animation",
      date: "2026-04"
    }
  ],

  close: {
    scope: ["Beat boards", "Sequence boards", "Animatic timing", "Revisions after the table read"],
    rateBand: "$2,400/week on a show contract",
    responseTime: "Replies within a day",
    timezone: "PT",
    cta: { label: "Ask about a board slot", action: "mock" }
  },

  depth: []
});
