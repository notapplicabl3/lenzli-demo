// src/data/persona.alex.js — Alex Reyes.
//
// Classic script, DOM-free. Loads after src/data/shapes.js.
// Shapes and derivation rules: src/data/shapes.js.
// 6 cards: HOOK, PROOF, TRUST, CLOSE + 2 depth blocks.
// All dates are authored against LENZLI.BUILD_DATE = "2026-08-12".
// There is no video key on this record — the slot is Maya's only, and an
// empty slot would mark this reel incomplete (A3-5).

LENZLI.registerPersona({
  id: "alex-reyes",

  identity: {
    name: "Alex Reyes",
    niche: "Cloud/DevOps · cost + reliability",
    availability: "Open to a 3-month engagement",
    monogram: "AR"
  },

  // Credentials-led: two holdings at tier A and tier B, no requiredForRole
  // licence. See rule 1 in shapes.js.
  trustBeat: "credentials",

  outcome: {
    headline: "Cut infra spend 38% — $41k/yr",
    context: "Series-B fintech, 2025 — same error budget, no headcount change",
    artifact: {
      label: "Terraform module — autoscaling groups",
      kind: "code",
      caption: "I wrote the module and the runbook; two other teams picked it up.",
      image: "src/brand/img/alex-proof.jpg"
    }
  },

  credentials: [
    {
      id: "urn:lenzli:cred:alex-aws-sap",
      // OpenBadgeCredential is what makes this tier A: the badge carries a
      // signed OB 3.0 proof, so the label composes as "signed by {issuer}".
      type: ["VerifiableCredential", "OpenBadgeCredential", "AchievementCredential"],
      tier: "A",
      status: "active",
      selfAsserted: false,
      requiredForRole: false,
      issuer: {
        name: "Amazon Web Services",
        type: "Certification body",
        mark: "AWS"
      },
      // Issued name differs from the profile name. The card says so rather
      // than hiding it — a mismatch is information.
      credentialSubject: { holderName: "Alejandro R. Reyes" },
      achievement: {
        name: "AWS Certified Solutions Architect – Professional",
        shortName: "AWS Solutions Architect – Pro",
        criteria: "Pass SAP-C02 — 180 minutes, 75 questions",
        skills: ["Cloud architecture", "Cost optimization", "Migration planning"]
      },
      validFrom: "2025-02-19",
      validUntil: "2028-02-19",
      credentialId: "AWS-5•••••",
      verification: {
        verifier: "Amazon Web Services",
        checkedDaysAgo: 6,
        destination: "cp.certmetrics.com",
        mockResult: {
          status:"Active",
          credential:"AWS Certified Solutions Architect – Professional",
          holder:"Alejandro R. Reyes",
          activeSince:"2025-02-19",
          expiresOn:"2028-02-19"
        }
      },
      scope: null,
      renewal: "Recertify every 3 years",
      discipline: null,
      evidenceUrl: null
    },
    {
      id: "urn:lenzli:cred:alex-pmp",
      type: ["VerifiableCredential", "AchievementCredential"],
      tier: "B",
      // PMI's real middle state: the 3-year cycle closed with PDUs unreported,
      // so the registry reports Suspended rather than Expired. A two-state UI
      // would have to lie about this one.
      status: "suspended",
      selfAsserted: false,
      requiredForRole: false,
      issuer: {
        name: "Project Management Institute",
        type: "Certification body",
        mark: "PMI"
      },
      credentialSubject: { holderName: "Alejandro R. Reyes" },
      achievement: {
        name: "Project Management Professional (PMP)",
        criteria: "35 contact hours + 36 months of project experience + the PMP exam",
        skills: []
      },
      validFrom: "2019-11-08",
      validUntil: "2025-11-08",
      credentialId: "PMI-1•••••",
      verification: {
        verifier: "PMI certification registry",
        checkedDaysAgo: 6,
        destination: "pmi.org",
        mockResult: {
          status:"Suspended",
          credential:"Project Management Professional (PMP)",
          holder:"Alejandro R. Reyes",
          activeSince:"2019-11-08",
          expiresOn:"2025-11-08"
        }
      },
      scope: null,
      renewal: "60 PDUs / 3 years — cycle closed unreported",
      discipline: null,
      evidenceUrl: null
    },
    {
      id: "urn:lenzli:cred:alex-cka",
      type: ["VerifiableCredential", "AchievementCredential"],
      tier: "C",
      // Unverifiable, not Active. The dates look current, but nothing was
      // checked, so we cannot say the credential is live. See rule 2 in shapes.js.
      status: "unverifiable",
      selfAsserted: false,
      requiredForRole: false,
      issuer: {
        name: "The Linux Foundation (CNCF)",
        type: "Certification body",
        mark: "CNCF"
      },
      credentialSubject: { holderName: "Alejandro Reyes" },
      achievement: {
        name: "Certified Kubernetes Administrator (CKA)",
        criteria: "Performance-based exam — 2 hours of live cluster tasks",
        skills: []
      },
      validFrom: "2025-06-03",
      validUntil: "2027-06-03",
      credentialId: "LF-9•••••",
      verification: null,
      scope: null,
      renewal: "Recertify every 2 years",
      discipline: null,
      evidenceUrl: "training.linuxfoundation.org/certification/verify"
    },
    {
      id: "urn:lenzli:cred:alex-terraform",
      type: ["SelfAssertedClaim"],
      tier: "D",
      status: null,
      selfAsserted: true,
      requiredForRole: false,
      issuer: null,
      credentialSubject: { holderName: "Alex Reyes" },
      achievement: {
        name: "Terraform — advanced",
        criteria: null,
        skills: []
      },
      validFrom: null,
      validUntil: null,
      credentialId: null,
      verification: null,
      scope: null,
      renewal: null,
      discipline: null,
      evidenceUrl: null
    }
  ],

  testimonials: [
    {
      quote: "He found the spend in the places nobody wanted to look at, and he wrote down what he changed so we kept the savings after he left.",
      author: "Tomas Lindqvist",
      role: "CTO",
      org: "Halden Pay",
      date: "2026-01"
    }
  ],

  close: {
    scope: ["Cost review", "Terraform and IaC", "Incident review", "On-call setup"],
    rateBand: "$135-160/hr, contract",
    responseTime: "Replies within a day",
    timezone: "ET",
    cta: { label: "Book a 30-min scoping call", action: "mock" }
  },

  depth: [
    {
      kind: "artifact",
      label: "Cost review — the four line items",
      caption: "The whole 38% came from four line items. This is the page I walked the CTO through.",
      plate: "Cost review · 4 line items · $41k/yr",
      image: "src/brand/img/alex-depth.jpg"
    },
    { kind: "testimonial", index: 0 }
  ]
});
