/* Invented person. Not a real individual. */
//
// src/data/personas/grace-whitfield.js — Grace Whitfield.
//
// Classic script, DOM-free. Loads after src/data/shapes.js.
// Shapes and derivation rules: src/data/shapes.js.
// 4 cards: HOOK, PROOF, TRUST, CLOSE. depth: [] fixes every record in this
// folder at four (SPEC § 4 D4, F-12).
// All dates are authored against LENZLI.BUILD_DATE = "2026-08-12": the studio
// licence was withdrawn on 2026-04-30, 104 days before it, while its stated
// term still ran to 2027-02-28. Revoked is what the registry answers; the term
// end is what the paper says.
// This record carries the corpus's only "revoked" credential. The create flow
// cannot author that state (A1-21), so the directory's facets see it only here.
// No availability line: this is one of four records the directory's
// "availability not stated" facet reads (SPEC § 4 D5, Facets).
// No video key — the video slot is Maya's only (A3-5).

LENZLI.registerPersona({
  id: "grace-whitfield",

  identity: {
    name: "Grace Whitfield",
    niche: "Tattoo artist · fine-line blackwork",
    monogram: "GW"
  },

  // Credentials-led: the practitioner licence is requiredForRole, and there is
  // a second tier-B holding besides. Either clause of rule 1 fires.
  trustBeat: "credentials",

  outcome: {
    headline: "410 cover-ups over scarred skin",
    context: "1,900 sessions across two Texas studios, 2016-2026",
    artifact: {
      label: "Healed set — 12 months on",
      kind: "document",
      caption: "Fresh work photographs itself. These are the same pieces at a year, which is the only set worth judging."
    }
  },

  credentials: [
    {
      id: "urn:lenzli:cred:grace-tattoo-artist",
      type: ["VerifiableCredential", "AchievementCredential"],
      tier: "B",
      status: "active",
      selfAsserted: false,
      requiredForRole: true,
      issuer: {
        name: "Texas Department of State Health Services",
        type: "Government registry",
        mark: "TX DSHS"
      },
      credentialSubject: { holderName: "Grace E. Whitfield" },
      achievement: {
        name: "Licensed Tattoo Artist",
        shortName: "Tattoo artist — TX",
        criteria: "Bloodborne pathogen training + the sterilisation examination under Health & Safety Code ch. 146",
        skills: []
      },
      validFrom: "2016-07-11",
      validUntil: "2028-07-31",
      credentialId: "TAT-9•••••",
      verification: {
        verifier: "Texas DSHS licence lookup",
        checkedDaysAgo: 7,
        destination: "dshs.texas.gov",
        mockResult: {
          status:"Active",
          credential:"Licensed Tattoo Artist",
          holder:"Grace E. Whitfield",
          activeSince:"2016-07-11",
          expiresOn:"2028-07-31"
        }
      },
      scope: "Single state — TX",
      renewal: "Bloodborne pathogen refresher / 2 years",
      discipline: "No public disciplinary actions",
      evidenceUrl: null
    },
    {
      id: "urn:lenzli:cred:grace-studio-licence",
      type: ["VerifiableCredential", "AchievementCredential"],
      tier: "B",
      // Revoked, not expired: the department withdrew it 104 days before
      // BUILD_DATE while the stated term still had months to run. It stays on
      // the record on purpose — a revoked licence is precisely the state no
      // holder would self-report (A1-21), and hiding it is the trust leak the
      // ladder exists to close.
      status: "revoked",
      selfAsserted: false,
      requiredForRole: false,
      issuer: {
        name: "Texas Department of Licensing and Regulation",
        type: "Government registry",
        mark: "TDLR"
      },
      credentialSubject: { holderName: "Grace E. Whitfield" },
      achievement: {
        name: "Body Art Studio Licence — operator of record",
        shortName: "Studio licence",
        criteria: "Studio inspection + the operator examination on sterilisation and record-keeping",
        skills: []
      },
      validFrom: "2021-03-01",
      validUntil: "2027-02-28",
      credentialId: "BAS-1•••••",
      verification: {
        verifier: "Texas Dept. of Licensing and Regulation licence search",
        checkedDaysAgo: 7,
        destination: "tdlr.texas.gov",
        mockResult: {
          status:"Revoked",
          credential:"Body Art Studio Licence — operator of record",
          holder:"Grace E. Whitfield",
          activeSince:"2021-03-01",
          expiresOn:"2027-02-28"
        }
      },
      scope: "Single state — TX",
      renewal: "Not renewable while revoked",
      discipline: "Revoked 2026-04-30 — sterilisation training hours filed through a provider the department later decertified",
      evidenceUrl: null
    },
    {
      id: "urn:lenzli:cred:grace-apt",
      type: ["VerifiableCredential", "AchievementCredential"],
      tier: "C",
      // Unverifiable, not Active. The membership page exists and nobody read
      // it, so we cannot say the certification is live. See rule 2 in shapes.js.
      status: "unverifiable",
      selfAsserted: false,
      requiredForRole: false,
      issuer: {
        name: "Alliance of Professional Tattooists",
        type: "Certification body",
        mark: "APT"
      },
      credentialSubject: { holderName: "Grace Whitfield" },
      achievement: {
        name: "Certified Professional Tattooist Member",
        shortName: "APT Member",
        criteria: "Membership examination + an annual bloodborne pathogen refresher",
        skills: []
      },
      validFrom: "2016-09-02",
      validUntil: null,
      credentialId: "APT-6•••••",
      verification: null,
      scope: null,
      renewal: "Annual membership",
      discipline: null,
      evidenceUrl: "safe-tattoos.com/verify"
    }
  ],

  testimonials: [
    {
      quote: "She turned down a cover-up I brought her and told me exactly why, and the piece she talked me into is the one I show people.",
      author: "Curtis Delaney",
      role: "Studio owner",
      org: "Ironwood Tattoo Co.",
      date: "2026-01"
    }
  ],

  close: {
    scope: ["Cover-ups over scar tissue", "Fine-line blackwork", "Consultation and stencil", "Touch-up at 12 months"],
    rateBand: "$180/hr, $900 day rate",
    responseTime: "Replies within a day",
    timezone: "CT",
    cta: { label: "Check a booking date", action: "mock" }
  },

  depth: []
});
