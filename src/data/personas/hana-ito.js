/* Invented person. Not a real individual. */
//
// src/data/personas/hana-ito.js — Hana Ito.
//
// Classic script, DOM-free. Loads after src/data/shapes.js.
// Shapes and derivation rules: src/data/shapes.js.
// 4 cards: HOOK, PROOF, TRUST, CLOSE. depth: [] fixes every record in this
// folder at four (SPEC § 4 D4, F-12).
// All dates are authored against LENZLI.BUILD_DATE = "2026-08-12": the Animate
// certification expires 27 days after it (19 days left in August + 8 in
// September), which is inside the 90-day expiring window.
// No video key — the video slot is Maya's only (A3-5).

LENZLI.registerPersona({
  id: "hana-ito",

  identity: {
    name: "Hana Ito",
    niche: "Motion designer · broadcast graphics",
    availability: "One project slot in September",
    monogram: "HI"
  },

  // Credentials-led: two holdings at tier A and tier B, no requiredForRole
  // licence. See rule 1 in shapes.js.
  trustBeat: "credentials",

  outcome: {
    headline: "340 shots delivered, one revision pass",
    context: "Streaming series title package, 2025-2026 — approved on the first review",
    artifact: {
      label: "Shot log — 340 shots by sequence",
      kind: "document",
      caption: "One row per shot, mapped to the sequence that owns it. Production closed most of their notes without asking me a question."
    }
  },

  credentials: [
    {
      id: "urn:lenzli:cred:hana-acp-after-effects",
      // OpenBadgeCredential is what makes this tier A: the badge carries a
      // signed OB 3.0 proof, so the label composes as "signed by {issuer}".
      type: ["VerifiableCredential", "OpenBadgeCredential", "AchievementCredential"],
      tier: "A",
      status: "active",
      selfAsserted: false,
      requiredForRole: false,
      issuer: {
        name: "Adobe Inc. (Certiport)",
        type: "Certification body",
        mark: "Adobe"
      },
      credentialSubject: { holderName: "Hana Ito" },
      achievement: {
        name: "Adobe Certified Professional — After Effects",
        shortName: "After Effects (ACP)",
        criteria: "Proctored examination on compositing, expressions and render workflow",
        skills: ["Motion graphics", "Compositing"]
      },
      validFrom: "2024-03-14",
      validUntil: "2027-03-14",
      credentialId: "ACP-7•••••",
      verification: {
        verifier: "Adobe credential registry (Certiport)",
        checkedDaysAgo: 2,
        destination: "certiport.com",
        mockResult: {
          status:"Active",
          credential:"Adobe Certified Professional — After Effects",
          holder:"Hana Ito",
          activeSince:"2024-03-14",
          expiresOn:"2027-03-14"
        }
      },
      scope: null,
      renewal: "Recertify on each 3-year version track",
      discipline: null,
      evidenceUrl: null
    },
    {
      id: "urn:lenzli:cred:hana-acp-animate",
      type: ["VerifiableCredential", "AchievementCredential"],
      tier: "B",
      // Expiring, not Active: validUntil is 27 days after BUILD_DATE, inside
      // the 90-day window. The registry still answers "Active".
      status: "expiring",
      selfAsserted: false,
      requiredForRole: false,
      issuer: {
        name: "Adobe Inc. (Certiport)",
        type: "Certification body",
        mark: "Adobe"
      },
      credentialSubject: { holderName: "Hana Ito" },
      achievement: {
        name: "Adobe Certified Professional — Animate",
        shortName: "Animate (ACP)",
        criteria: "Proctored examination on rig setup, timeline animation and export",
        skills: []
      },
      validFrom: "2023-09-08",
      validUntil: "2026-09-08",
      credentialId: "ACP-3•••••",
      verification: {
        verifier: "Adobe credential registry (Certiport)",
        checkedDaysAgo: 2,
        destination: "certiport.com",
        mockResult: {
          status:"Active",
          credential:"Adobe Certified Professional — Animate",
          holder:"Hana Ito",
          activeSince:"2023-09-08",
          expiresOn:"2026-09-08"
        }
      },
      scope: null,
      renewal: "Recertify on each 3-year version track",
      discipline: null,
      evidenceUrl: null
    }
  ],

  testimonials: [
    {
      quote: "She rewrote her notes as shot-level tickets our editors could close, which is the part every other vendor skipped.",
      author: "Devon Marsh",
      role: "Post supervisor",
      org: "Cassell Streaming Group",
      date: "2026-06"
    }
  ],

  close: {
    scope: ["Title packages", "Broadcast graphics", "Product explainers", "Template handoff to the in-house team"],
    rateBand: "$130/hr, or $9,500 per package",
    responseTime: "Replies within a day",
    timezone: "JST",
    cta: { label: "Ask about a project slot", action: "mock" }
  },

  depth: []
});
