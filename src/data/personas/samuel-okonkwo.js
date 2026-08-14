/* Invented person. Not a real individual. */
//
// src/data/personas/samuel-okonkwo.js — Samuel Okonkwo.
//
// Classic script, DOM-free. Loads after src/data/shapes.js.
// Shapes and derivation rules: src/data/shapes.js.
// 4 cards: HOOK, PROOF, TRUST, CLOSE. depth: [] fixes every record in this
// folder at four (SPEC § 4 D4, F-12).
// All dates are authored against LENZLI.BUILD_DATE = "2026-08-12": the listing
// runs to 2028-05-19, so the dates look current — which is exactly why tier C
// still reads "unverifiable" (rule 2 in shapes.js).
// A thin record — one credential, no depth. Thin is a real record (F-12).
// No availability line: this is one of four records the directory's
// "availability not stated" facet reads (SPEC § 4 D5, Facets).
// No video key — the video slot is Maya's only (A3-5).

LENZLI.registerPersona({
  id: "samuel-okonkwo",

  identity: {
    name: "Samuel Okonkwo",
    niche: "Children's book illustrator · ages 4-8",
    monogram: "SO"
  },

  // Testimonial-led: no tier-A or tier-B holding at all and nothing
  // requiredForRole, so neither clause of rule 1 in shapes.js fires.
  trustBeat: "testimonial",

  outcome: {
    headline: "11 dummies out, 7 acquired",
    context: "Trade picture books, 2020-2026 — four now in print",
    artifact: {
      label: "Dummy spread — the bridge scene",
      kind: "document",
      caption: "The page turn is where these are won or lost. This spread hides the bridge until you turn it, which is the whole joke."
    }
  },

  credentials: [
    {
      id: "urn:lenzli:cred:samuel-scbwi",
      type: ["VerifiableCredential", "AchievementCredential"],
      tier: "C",
      // Unverifiable, not Active. The member listing exists and nobody read
      // it, so we cannot say the standing is current. Rule 2, shapes.js.
      status: "unverifiable",
      selfAsserted: false,
      requiredForRole: false,
      issuer: {
        name: "Society of Children's Book Writers and Illustrators",
        type: "Certification body",
        mark: "SCBWI"
      },
      credentialSubject: { holderName: "Samuel A. Okonkwo" },
      achievement: {
        name: "Published and Listed (PAL) Member",
        shortName: "SCBWI PAL",
        criteria: "Trade publication with a recognised house plus current membership",
        skills: []
      },
      validFrom: "2023-05-19",
      validUntil: "2028-05-19",
      credentialId: "SCB-1•••••",
      verification: null,
      scope: null,
      renewal: "Listing reviewed every 5 years",
      discipline: null,
      evidenceUrl: "scbwi.org/verify"
    }
  ],

  testimonials: [
    {
      quote: "He rebuilt our page turns around the question a four-year-old actually asks, and the book sold on the resubmission.",
      author: "Delphine Carr",
      role: "Editorial director",
      org: "Eastbank Children's Books",
      date: "2026-04"
    }
  ],

  close: {
    scope: ["Picture-book illustration", "Character design and dummies", "Cover art", "Revisions after acquisitions"],
    rateBand: "$6,500 per book, or $850 per spread",
    responseTime: "Replies within two days",
    timezone: "CT",
    cta: { label: "Ask about a book schedule", action: "mock" }
  },

  depth: []
});
