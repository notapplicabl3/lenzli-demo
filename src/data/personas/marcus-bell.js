/* Invented person. Not a real individual. */
//
// src/data/personas/marcus-bell.js — Marcus Bell.
//
// Classic script, DOM-free. Loads after src/data/shapes.js.
// Shapes and derivation rules: src/data/shapes.js.
// 4 cards: HOOK, PROOF, TRUST, CLOSE. depth: [] fixes every record in this
// folder at four (SPEC § 4 D4, F-12).
// All dates are authored against LENZLI.BUILD_DATE = "2026-08-12": the guild
// membership has no expiry at all, and the studio certificate states none
// either — neither is anywhere near the 90-day expiring window.
// No video key — the video slot is Maya's only (A3-5).

LENZLI.registerPersona({
  id: "marcus-bell",

  identity: {
    name: "Marcus Bell",
    niche: "Scenic painter · drops and faux finish",
    availability: "Taking scenic contracts for Q4",
    monogram: "MB"
  },

  // Credentials-led: the guild card is requiredForRole — a signatory shop
  // cannot put an unaffiliated painter on the call. See rule 1 in shapes.js.
  trustBeat: "credentials",

  outcome: {
    headline: "42 productions, zero repaint calls",
    context: "Regional houses and one touring package, 2024-2026 — same crew size",
    artifact: {
      label: "Paint elevation — the ballroom drop",
      kind: "document",
      caption: "Colour, cartoon and the mix ratios on one sheet. Any painter in the shop can pick it up and match me."
    }
  },

  credentials: [
    {
      id: "urn:lenzli:cred:marcus-usa829",
      type: ["VerifiableCredential", "AchievementCredential"],
      tier: "B",
      status: "active",
      selfAsserted: false,
      requiredForRole: true,
      issuer: {
        name: "United Scenic Artists, Local USA 829 (IATSE)",
        type: "Certification body",
        mark: "USA 829"
      },
      credentialSubject: { holderName: "Marcus T. Bell" },
      achievement: {
        name: "Member in good standing — Scenic Artist classification",
        shortName: "USA 829 — Scenic Artist",
        criteria: "Practical journeyman examination in scenic art plus documented shop hours",
        skills: []
      },
      validFrom: "2014-08-19",
      validUntil: null,
      credentialId: "USA-1•••••",
      verification: {
        verifier: "United Scenic Artists membership registry",
        checkedDaysAgo: 6,
        destination: "usa829.org",
        mockResult: {
          status:"Active",
          credential:"Member in good standing — Scenic Artist classification",
          holder:"Marcus T. Bell",
          activeSince:"2014-08-19",
          expiresOn:"No stated expiry"
        }
      },
      scope: null,
      renewal: "Dues in good standing; no stated expiry",
      discipline: null,
      evidenceUrl: null
    },
    {
      id: "urn:lenzli:cred:marcus-scenic-program",
      type: ["VerifiableCredential", "AchievementCredential"],
      tier: "C",
      // Unverifiable, not Active. The school's completion page exists and
      // nobody read it, so we cannot say the certificate stands. Rule 2,
      // shapes.js.
      status: "unverifiable",
      selfAsserted: false,
      requiredForRole: false,
      issuer: {
        name: "Cobalt Studios School of Scenic Art",
        type: "Training provider",
        mark: "Cobalt"
      },
      credentialSubject: { holderName: "Marcus Bell" },
      achievement: {
        name: "Certificate — Scenic Art Program, second year",
        shortName: "Scenic art certificate",
        criteria: "Two-year studio programme plus a juried portfolio review",
        skills: []
      },
      validFrom: "2013-03-27",
      validUntil: null,
      credentialId: "COB-5•••••",
      verification: null,
      scope: null,
      renewal: "No stated expiry",
      discipline: null,
      evidenceUrl: "cobaltstudios.net/verify"
    }
  ],

  testimonials: [
    {
      quote: "He found the four things the shop kept repainting and wrote the mixes down so the other painters could match them.",
      author: "Sylvia Deng",
      role: "Production manager",
      org: "Harvest Row Theatre",
      date: "2026-04"
    }
  ],

  close: {
    scope: ["Drops and backdrops", "Faux finishes and texture", "Paint elevations for the shop", "Crew training"],
    rateBand: "$62/hr at scale, day rate on tour",
    responseTime: "Replies same day",
    timezone: "CT",
    cta: { label: "Ask about a scenic contract", action: "mock" }
  },

  depth: []
});
