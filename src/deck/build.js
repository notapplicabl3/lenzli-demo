/*
 * src/deck/build.js — the compile step of the reel deck.
 *
 * Classic script (SPEC A3-9). DOM-FREE by contract (SPEC § 3.1, headless rule):
 * this file loads under node with `global.window = global`, which is exactly what
 * the M-16 smoke command does. No document access here, ever — every element the
 * viewer sees is built in src/deck/cards.js.
 *
 * LENZLI.buildDeck(record, opts) -> Card[] is a pure compile. It reads one persona
 * record (shape: src/data/shapes.js) and returns 4-7 card descriptors: the four
 * core beats HOOK, PROOF, TRUST, CLOSE, then 0-3 depth cards in the order the
 * record declares them. Depth sits AFTER close because SPEC § 4 D3's compile
 * table numbers it 5-7.
 *
 * opts.partial === true compiles an UNFINISHED record: a beat whose required
 * fields are absent becomes a placeholder card instead of throwing (SPEC § 3.1,
 * E-4 and E-9). Default behaviour is unchanged in every respect.
 *
 * A reel COMPILES from structured data — that is the claim the artifact makes
 * (ruling D7), and this file is where it is true.
 *
 * ------------------------------------------------------------------------
 * CARD DESCRIPTOR — the shape cards.js renders and the About surface (D5)
 * annotates with field-to-element connector labels:
 *
 *   {
 *     beat: "HOOK",           // "HOOK" | "PROOF" | "TRUST" | "CLOSE" | "DEPTH"
 *     label: "Hook",          // the indexed + announced name. Both the progress
 *                             // bar's aria-label and the live-region line read
 *                             // "Card N of M — <label>". Depth cards carry the
 *                             // beat plus their kind: "Depth · artifact".
 *     kind: "hook",           // which renderer: hook | proof | trust | close |
 *                             // artifact | video | testimonial | wallet |
 *                             // placeholder (partial mode only)
 *     personaId: "maya-chen", // every card knows its persona; the wallet
 *                             // surfaces (D4) key on this id
 *     data: { ... }           // the beat's own fields, per kind:
 *   }
 *
 *   hook        { name, niche, availability, monogram }
 *   proof       { headline, context, artifact }        // artifact may be null
 *   trust       { branch, testimonial, chips, chipLimit, seeAllCount }
 *                 // branch: "credentials" | "testimonial"
 *                 // chips: credential records, tier D already removed
 *                 // chipLimit: 3 credentials-led, 2 testimonial-led
 *                 // seeAllCount: credentials.length — the N in "See all N"
 *   close       { scope, rateBand, responseTime, timezone, cta }
 *   artifact    { label, caption, plate }
 *   video       { durationLabel, poster, captions }
 *   testimonial { quote, author, role, org, date }
 *   wallet      { count }                              // derived, never authored
 *   placeholder { beat, prompt }                       // partial mode only
 * ------------------------------------------------------------------------
 */
(function (root) {
  "use strict";

  var LENZLI = root.LENZLI;

  if (!LENZLI) {
    throw new Error(
      "src/deck/build.js: window.LENZLI is missing. src/brand/namespace.js must load first."
    );
  }

  /* Single reel cap (ruling D2). Four core beats plus three depth blocks is the
     arithmetic ceiling; the guard at the end of buildDeck is what makes 7 a rule
     rather than an accident of the data. */
  var MAX_CARDS = 7;
  var MAX_DEPTH = 3;

  /* Errors surface (SPEC § 10). A misconfigured persona fails loudly at boot —
     it never silently renders a shorter reel, which would look like a design
     choice instead of a defect. */
  function fail(id, message) {
    throw new Error("buildDeck: " + id + " — " + message);
  }

  function card(beat, label, kind, personaId, data) {
    return { beat: beat, label: label, kind: kind, personaId: personaId, data: data };
  }

  /* Partial mode (SPEC § 3.1, E-4 and E-9). The create form recompiles the whole
     draft synchronously on every keystroke, so every guard below is reachable
     mid-word: an empty form trips the first one, and opening a depth block trips
     depthCard's. Throwing there is not loud failure, it is a broken preview.
     Under { partial: true } each of those guards emits this descriptor instead —
     the beat still occupies its slot in the reel, drawn as an unfinished card
     (cards.js's placeholder renderer, .card--placeholder in deck.css).

     What partial mode does NOT relax: MAX_DEPTH and MAX_CARDS. A draft with four
     depth blocks is not incomplete, it is over the cap — an authoring error the
     create form cannot produce, so it still throws in both modes. */
  function placeholder(beat, label, personaId, prompt) {
    return card(beat, label, "placeholder", personaId, { beat: beat, prompt: prompt });
  }

  /* Tier D never appears as a chip (SPEC § 4 D3): self-reported entries belong in
     the wallet screen's own "Self-reported" list. This is data selection, so it
     is compile work. The pinned ORDER is D4's LENZLI.pinOrder and is applied at
     render time — no pin logic is inlined in the deck layer. */
  function chipCandidates(credentials) {
    return credentials.filter(function (cred) {
      return cred && cred.tier !== "D";
    });
  }

  function hookCard(persona, id, partial) {
    var identity = persona.identity;
    if (!identity || !identity.name || !identity.niche) {
      if (partial) {
        return placeholder("HOOK", "Hook", id, "Add the name and the niche line beneath it.");
      }
      fail(id, "core beat HOOK is missing: identity.name and identity.niche are both required");
    }
    return card("HOOK", "Hook", "hook", id, {
      name: identity.name,
      niche: identity.niche,
      availability: identity.availability || null,
      monogram: identity.monogram || null
    });
  }

  function proofCard(persona, id, partial) {
    var outcome = persona.outcome;
    if (!outcome || !outcome.headline) {
      if (partial) {
        return placeholder("PROOF", "Proof", id, "Add the result headline — the outcome this reel proves.");
      }
      fail(id, "core beat PROOF is missing: outcome.headline is required");
    }
    return card("PROOF", "Proof", "proof", id, {
      headline: outcome.headline,
      context: outcome.context || null,
      artifact: outcome.artifact || null
    });
  }

  function trustCard(persona, id, partial) {
    var credentials = Array.isArray(persona.credentials) ? persona.credentials : [];
    var chips = chipCandidates(credentials);

    if (persona.trustBeat === "testimonial") {
      var quote = Array.isArray(persona.testimonials) ? persona.testimonials[0] : null;
      if (!quote) {
        if (partial) {
          return placeholder("TRUST", "Trust", id,
            "This beat is set to a testimonial. Add the quote it reads.");
        }
        fail(id, 'core beat TRUST is missing: trustBeat is "testimonial" but testimonials[0] is absent');
      }
      /* The testimonial branch is Maya's only chip path (SPEC § 4 D3, audit F5):
         the named quote, then up to two remaining tier A/B/C chips beneath it. */
      return card("TRUST", "Trust", "trust", id, {
        branch: "testimonial",
        testimonial: quote,
        chips: chips,
        chipLimit: 2,
        seeAllCount: credentials.length
      });
    }

    if (persona.trustBeat === "credentials") {
      if (!credentials.length) {
        if (partial) {
          return placeholder("TRUST", "Trust", id,
            "This beat is set to credentials. Add at least one.");
        }
        fail(id, 'core beat TRUST is missing: trustBeat is "credentials" but the credentials array is empty');
      }
      return card("TRUST", "Trust", "trust", id, {
        branch: "credentials",
        testimonial: null,
        chips: chips,
        chipLimit: 3,
        seeAllCount: credentials.length
      });
    }

    if (partial) {
      return placeholder("TRUST", "Trust", id,
        "Choose what carries this beat: credentials, or a testimonial.");
    }

    fail(id, 'core beat TRUST is missing: trustBeat must be "credentials" or "testimonial", got ' +
      JSON.stringify(persona.trustBeat));
  }

  function closeCard(persona, id, partial) {
    var close = persona.close;
    if (!close || !close.cta) {
      if (partial) {
        return placeholder("CLOSE", "Close", id, "Add the one action this reel closes on.");
      }
      fail(id, "core beat CLOSE is missing: close.cta is required");
    }
    return card("CLOSE", "Close", "close", id, {
      scope: Array.isArray(close.scope) ? close.scope : [],
      rateBand: close.rateBand || null,
      responseTime: close.responseTime || null,
      timezone: close.timezone || null,
      cta: close.cta
    });
  }

  /* The four depth block shapes are § 3.1's, and there are no others. An unknown
     kind throws for the same reason a missing core beat does.

     Every guard in here is reachable the instant an author opens a depth block
     and has not yet typed, which is why partial mode extends this far (E-9): the
     block becomes an unfinished card and the preview keeps rendering. */
  function depthCard(persona, id, block, position, partial) {
    var where = "depth[" + position + "]";

    if (!block || !block.kind) {
      if (partial) {
        return placeholder("DEPTH", "Depth", id,
          "Pick what this block shows: an artifact, a video, a testimonial or the wallet.");
      }
      fail(id, where + " has no kind; the four shapes are artifact, video, testimonial, wallet");
    }

    if (block.kind === "artifact") {
      if (!block.label) {
        if (partial) {
          return placeholder("DEPTH", "Depth · artifact", id, "Name the piece of work this block shows.");
        }
        fail(id, where + ' is an artifact block with no label');
      }
      return card("DEPTH", "Depth · artifact", "artifact", id, {
        label: block.label,
        caption: block.caption || null,
        plate: block.plate || block.label,
        image: block.image || null
      });
    }

    if (block.kind === "video") {
      var video = persona[block.ref || "video"];
      if (!video || !Array.isArray(video.captions)) {
        if (partial) {
          return placeholder("DEPTH", "Depth · video", id,
            "Add the caption track this block reads out.");
        }
        fail(id, where + " is a video block, but the persona carries no video object with captions");
      }
      return card("DEPTH", "Depth · video", "video", id, {
        durationLabel: video.durationLabel || null,
        poster: video.poster || null,
        captions: video.captions
      });
    }

    if (block.kind === "testimonial") {
      var index = block.index || 0;
      var quote = Array.isArray(persona.testimonials) ? persona.testimonials[index] : null;
      if (!quote) {
        if (partial) {
          return placeholder("DEPTH", "Depth · testimonial", id,
            "Add the testimonial this block quotes.");
        }
        fail(id, where + " points at testimonials[" + index + "], which is absent");
      }
      /* The block never carries its own quote (§ 3.1) — it renders the record's. */
      return card("DEPTH", "Depth · testimonial", "testimonial", id, {
        quote: quote.quote,
        author: quote.author,
        role: quote.role || null,
        org: quote.org || null,
        date: quote.date || null
      });
    }

    if (block.kind === "wallet") {
      var credentials = Array.isArray(persona.credentials) ? persona.credentials : [];
      /* The teaser's count is DERIVED, never authored (§ 3.1). */
      return card("DEPTH", "Depth · wallet", "wallet", id, { count: credentials.length });
    }

    if (partial) {
      return placeholder("DEPTH", "Depth", id,
        "Pick what this block shows: an artifact, a video, a testimonial or the wallet.");
    }

    fail(id, where + " has unknown kind " + JSON.stringify(block.kind) +
      "; the four shapes are artifact, video, testimonial, wallet");
  }

  /* buildDeck(record, opts). opts.partial === true is the create form's live
     preview; anything else — no second argument at all, which is every call site
     that existed before this build — compiles exactly as it always did and throws
     on a missing beat. */
  LENZLI.buildDeck = function (record, opts) {
    var persona = record;

    if (!persona || typeof persona !== "object") {
      throw new Error("buildDeck: expected a persona record object");
    }

    var partial = !!(opts && opts.partial === true);
    var id = persona.id || "(unnamed persona)";
    var depth = Array.isArray(persona.depth) ? persona.depth : [];

    if (depth.length > MAX_DEPTH) {
      fail(id, "declares " + depth.length + " depth blocks; the cap is " + MAX_DEPTH);
    }

    var cards = [
      hookCard(persona, id, partial),
      proofCard(persona, id, partial),
      trustCard(persona, id, partial),
      closeCard(persona, id, partial)
    ];

    depth.forEach(function (block, position) {
      cards.push(depthCard(persona, id, block, position, partial));
    });

    if (cards.length > MAX_CARDS) {
      fail(id, "compiles to " + cards.length + " cards; the single-reel cap is " + MAX_CARDS);
    }

    return cards;
  };
})(window);
