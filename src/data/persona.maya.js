// src/data/persona.maya.js — Maya Chen.
//
// Classic script, DOM-free. Loads after src/data/shapes.js.
// Shapes and derivation rules: src/data/shapes.js.
// 6 cards: HOOK, PROOF, TRUST, CLOSE + 2 depth blocks.
// All dates are authored against LENZLI.BUILD_DATE = "2026-08-12".

LENZLI.registerPersona({
  id: "maya-chen",

  identity: {
    name: "Maya Chen",
    niche: "Videographer + colorist · brand films",
    availability: "Booking two projects this quarter",
    monogram: "MC"
  },

  // Testimonial-led: no credential is required to do the work, and she holds
  // no tier-A/B credential. See rule 1 in shapes.js.
  trustBeat: "testimonial",

  outcome: {
    headline: "3 brand films, 1.2M organic views",
    context: "Two DTC brands and one clinic, 2025-2026 — all three rebooked",
    artifact: {
      label: "Graded still — before / after",
      kind: "still",
      caption: "Camera original on the left, my grade on the right. Same frame, no relight.",
      image: "src/brand/img/maya-proof.jpg"
    }
  },

  credentials: [
    {
      id: "urn:lenzli:cred:maya-acp-premiere",
      type: ["VerifiableCredential", "AchievementCredential"],
      tier: "C",
      status: "unverifiable",
      selfAsserted: false,
      requiredForRole: false,
      issuer: {
        name: "Adobe Inc. (Certiport)",
        type: "Certification body",
        mark: "Adobe"
      },
      credentialSubject: { holderName: "Maya J. Chen" },
      achievement: {
        name: "Adobe Certified Professional — Premiere Pro",
        shortName: "Premiere Pro (ACP)",
        criteria: "Proctored 50-minute exam on Premiere Pro editing workflow",
        skills: ["Video editing"]
      },
      validFrom: "2023-08-30",
      validUntil: null,
      credentialId: "ACP-6•••••",
      verification: null,
      scope: null,
      renewal: "No stated expiry",
      discipline: null,
      evidenceUrl: "certiport.com/verify"
    },
    {
      id: "urn:lenzli:cred:maya-davinci",
      type: ["SelfAssertedClaim"],
      tier: "D",
      status: null,
      selfAsserted: true,
      requiredForRole: false,
      issuer: null,
      credentialSubject: { holderName: "Maya Chen" },
      achievement: {
        name: "Color grading — DaVinci Resolve",
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
      quote: "She turned a two-day shoot into three usable films, and matched footage from two different cameras without anyone asking her to.",
      author: "Diane Whitcomb",
      role: "Creative director",
      org: "Northline Creative",
      date: "2026-05"
    }
  ],

  close: {
    scope: ["Brand films", "Colour grading", "Multi-cam edit", "Same-week rough cut"],
    rateBand: "$1,800-2,600 per finished film",
    responseTime: "Replies within a day",
    timezone: "PT",
    cta: { label: "Book a 15-min call", action: "mock" }
  },

  depth: [
    {
      kind: "artifact",
      label: "Shot list — clinic film",
      caption: "One page. I bring it to the pre-production call so nobody guesses on the day.",
      plate: "Shot list · 14 setups · one page",
      image: "src/brand/img/maya-depth.jpg"
    },
    { kind: "video", ref: "video" }
  ],

  video: {
    durationLabel: "12s",
    poster: { plate: "Reel poster — brand film", src: "src/brand/img/maya-poster.jpg" },
    captions: [
      { at: "0:00", text: "Open on the product, not on me." },
      { at: "0:04", text: "Two cameras, one grade. The match is the job." },
      { at: "0:08", text: "I cut it the way the client will actually post it." }
    ]
  }
});
