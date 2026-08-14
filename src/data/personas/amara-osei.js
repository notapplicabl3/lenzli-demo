/* Invented person. Not a real individual. */
//
// src/data/personas/amara-osei.js — Amara Osei, CNM.
//
// Classic script, DOM-free. Loads after src/data/shapes.js.
// Shapes and derivation rules: src/data/shapes.js.
// 4 cards: HOOK, PROOF, TRUST, CLOSE. depth: [] fixes every record in this
// folder at four (SPEC § 4 D4, F-12).
// All dates are authored against LENZLI.BUILD_DATE = "2026-08-12":
// the NRP card expires 58 days after it (19 days left in August + 30 in
// September + 9 in October), which is inside the 90-day expiring window.
// No video key — the video slot is Maya's only (A3-5).

LENZLI.registerPersona({
  id: "amara-osei",

  identity: {
    name: "Amara Osei, CNM",
    niche: "Nurse-midwife · low-intervention birth",
    availability: "Taking call for two more clients",
    monogram: "AO"
  },

  // Credentials-led: the CNM certification is requiredForRole. See rule 1 in
  // shapes.js.
  trustBeat: "credentials",

  outcome: {
    headline: "412 births, 9% primary cesarean rate",
    context: "Freestanding birth center with hospital transfer, 2019-2026",
    artifact: {
      label: "Transfer criteria — one page",
      kind: "document",
      caption: "I wrote the transfer criteria the center runs. It names the call, not the feeling."
    }
  },

  credentials: [
    {
      id: "urn:lenzli:cred:amara-cnm",
      type: ["VerifiableCredential", "AchievementCredential"],
      tier: "B",
      status: "active",
      selfAsserted: false,
      requiredForRole: true,
      issuer: {
        name: "American Midwifery Certification Board",
        type: "Certification body",
        mark: "AMCB"
      },
      credentialSubject: { holderName: "Amara N. Osei" },
      achievement: {
        name: "Certified Nurse-Midwife (CNM)",
        shortName: "CNM",
        criteria: "Graduate midwifery degree + the AMCB national certification examination",
        skills: []
      },
      validFrom: "2019-06-18",
      validUntil: "2029-06-18",
      credentialId: "AMCB-4•••••",
      verification: {
        verifier: "AMCB certification registry",
        checkedDaysAgo: 4,
        destination: "amcbmidwife.org",
        mockResult: {
          status:"Active",
          credential:"Certified Nurse-Midwife (CNM)",
          holder:"Amara N. Osei",
          activeSince:"2019-06-18",
          expiresOn:"2029-06-18"
        }
      },
      scope: "National certification — licensed to practise in OR",
      renewal: "Certificate Maintenance Program, 5-year cycle",
      discipline: "No public disciplinary actions",
      evidenceUrl: null
    },
    {
      id: "urn:lenzli:cred:amara-nrp",
      type: ["VerifiableCredential", "AchievementCredential"],
      tier: "B",
      // Expiring, not Active: validUntil is 58 days after BUILD_DATE, inside the
      // 90-day window. The AAP registry still answers "Active" — see mockResult.
      status: "expiring",
      selfAsserted: false,
      requiredForRole: false,
      issuer: {
        name: "American Academy of Pediatrics",
        type: "Certification body",
        mark: "AAP"
      },
      credentialSubject: { holderName: "Amara N. Osei" },
      achievement: {
        name: "Neonatal Resuscitation Program (NRP) Provider",
        shortName: "NRP Provider",
        criteria: "Online examination + instructor-led skills evaluation",
        skills: []
      },
      validFrom: "2024-10-09",
      validUntil: "2026-10-09",
      credentialId: "NRP-8•••••",
      verification: {
        verifier: "AAP NRP registry",
        checkedDaysAgo: 4,
        destination: "aap.org",
        mockResult: {
          status:"Active",
          credential:"Neonatal Resuscitation Program (NRP) Provider",
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
      quote: "She transfers early and she transfers calm, and in four years I have never once received a patient from her without the chart already making sense.",
      author: "Wendell Sarraf",
      role: "Attending obstetrician",
      org: "Prairie Vale Regional",
      date: "2026-04"
    }
  ],

  close: {
    scope: ["Prenatal care", "Birth center delivery", "Hospital transfer", "Postpartum to 12 weeks"],
    rateBand: "$4,200 global fee, insurance billed",
    responseTime: "Replies within a day",
    timezone: "PT",
    cta: { label: "Ask about a due date", action: "mock" }
  },

  depth: []
});
