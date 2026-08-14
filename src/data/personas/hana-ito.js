/* Invented person. Not a real individual. */
//
// src/data/personas/hana-ito.js — Hana Ito.
//
// Classic script, DOM-free. Loads after src/data/shapes.js.
// Shapes and derivation rules: src/data/shapes.js.
// 4 cards: HOOK, PROOF, TRUST, CLOSE. depth: [] fixes every record in this
// folder at four (SPEC § 4 D4, F-12).
// All dates are authored against LENZLI.BUILD_DATE = "2026-08-12": the WAS
// certification expires 27 days after it (19 days left in August + 8 in
// September), which is inside the 90-day expiring window.
// No video key — the video slot is Maya's only (A3-5).

LENZLI.registerPersona({
  id: "hana-ito",

  identity: {
    name: "Hana Ito",
    niche: "WCAG 2.2 accessibility audits and fixes",
    availability: "One audit slot in September",
    monogram: "HI"
  },

  // Credentials-led: two holdings at tier A and tier B, no requiredForRole
  // licence. See rule 1 in shapes.js.
  trustBeat: "credentials",

  outcome: {
    headline: "Cleared 340 WCAG failures before launch",
    context: "Retail checkout rebuild, 2025-2026 — passed the external audit first pass",
    artifact: {
      label: "Audit log — 340 findings by component",
      kind: "document",
      caption: "One row per finding, mapped to the component that owns it. Engineers closed most of them without asking me a question."
    }
  },

  credentials: [
    {
      id: "urn:lenzli:cred:hana-cpacc",
      // OpenBadgeCredential is what makes this tier A: the badge carries a
      // signed OB 3.0 proof, so the label composes as "signed by {issuer}".
      type: ["VerifiableCredential", "OpenBadgeCredential", "AchievementCredential"],
      tier: "A",
      status: "active",
      selfAsserted: false,
      requiredForRole: false,
      issuer: {
        name: "International Association of Accessibility Professionals",
        type: "Certification body",
        mark: "IAAP"
      },
      credentialSubject: { holderName: "Hana Ito" },
      achievement: {
        name: "Certified Professional in Accessibility Core Competencies (CPACC)",
        shortName: "CPACC",
        criteria: "Proctored examination on disability, accessibility standards and organisational management",
        skills: ["Accessibility standards", "Inclusive design"]
      },
      validFrom: "2024-03-14",
      validUntil: "2027-03-14",
      credentialId: "IAAP-7•••••",
      verification: {
        verifier: "IAAP credential registry",
        checkedDaysAgo: 2,
        destination: "accessibilityassociation.org",
        mockResult: {
          status:"Active",
          credential:"Certified Professional in Accessibility Core Competencies (CPACC)",
          holder:"Hana Ito",
          activeSince:"2024-03-14",
          expiresOn:"2027-03-14"
        }
      },
      scope: null,
      renewal: "45 continuing education credits / 3 years",
      discipline: null,
      evidenceUrl: null
    },
    {
      id: "urn:lenzli:cred:hana-was",
      type: ["VerifiableCredential", "AchievementCredential"],
      tier: "B",
      // Expiring, not Active: validUntil is 27 days after BUILD_DATE, inside
      // the 90-day window. The registry still answers "Active".
      status: "expiring",
      selfAsserted: false,
      requiredForRole: false,
      issuer: {
        name: "International Association of Accessibility Professionals",
        type: "Certification body",
        mark: "IAAP"
      },
      credentialSubject: { holderName: "Hana Ito" },
      achievement: {
        name: "Web Accessibility Specialist (WAS)",
        shortName: "WAS",
        criteria: "Proctored technical examination on accessible web implementation and testing",
        skills: []
      },
      validFrom: "2023-09-08",
      validUntil: "2026-09-08",
      credentialId: "IAAP-3•••••",
      verification: {
        verifier: "IAAP credential registry",
        checkedDaysAgo: 2,
        destination: "accessibilityassociation.org",
        mockResult: {
          status:"Active",
          credential:"Web Accessibility Specialist (WAS)",
          holder:"Hana Ito",
          activeSince:"2023-09-08",
          expiresOn:"2026-09-08"
        }
      },
      scope: null,
      renewal: "45 continuing education credits / 3 years",
      discipline: null,
      evidenceUrl: null
    }
  ],

  testimonials: [
    {
      quote: "She rewrote her findings as tickets our engineers could close, which is the part every other audit skipped.",
      author: "Devon Marsh",
      role: "Engineering manager, web platform",
      org: "Cassell Retail Group",
      date: "2026-06"
    }
  ],

  close: {
    scope: ["WCAG 2.2 AA audit", "Screen-reader testing", "Component remediation", "VPAT drafting"],
    rateBand: "$130/hr, or $9,500 per audit",
    responseTime: "Replies within a day",
    timezone: "JST",
    cta: { label: "Ask about an audit slot", action: "mock" }
  },

  depth: []
});
