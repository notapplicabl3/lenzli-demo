/* search.js — the directory's matching, faceting and ordering.
 *
 * Classic script (SPEC A3-9). Overwrites the two directory stubs namespace.js
 * declared (namespace.js:90). PURE AND DOM-FREE by contract (SPEC § 4 D5): this
 * file loads under node with `global.window = global` and no `document` at all,
 * which is what makes AM-12 and AM-13 machine rows instead of eyeballing. It
 * reads records and returns plain data; every element on the screen is
 * src/directory/directory.js's.
 *
 * VIDEO-BLIND, AS A LEGAL CONSTRAINT AND NOT A PREFERENCE (SPEC § 4 D5, AM-12).
 * The seven fields listed under MATCHED FIELDS below are the whole of what this
 * file reads for matching, and the ordering rule under ORDER is the whole of
 * what it ranks on. Nothing derived from video, audio, poster, caption or
 * imagery ever enters either one. Automated-employment-decision law attaches to
 * the ANALYSIS of a person, not to the display of what they published: a
 * directory that scored a face, a voice or a production budget would be running
 * exactly that analysis, and a profile with no footage would pay for it. So the
 * surface may show a media plate where a record names one — that is display, and
 * it happens in directory.js — while this file, which is the only thing that
 * decides who appears and in what order, never sees one. AM-12's grep is scoped
 * to property access precisely so this paragraph can say so out loud.
 *
 * Two consequences the SPEC states separately and this file implements as one
 * fact: profiles without video are never ranked lower, and none is ever marked
 * incomplete. Nothing here reads how complete a record is (F-8, F-14), and
 * nothing reads when it was authored — the schema carries no authoring date and
 * this build has no clock to compare one against (F-7).
 *
 * MATCHED FIELDS, EXHAUSTIVELY (SPEC § 4 D5). Seven, and nothing else:
 *   identity.name · identity.niche · close.scope[] · outcome.headline ·
 *   credentials[].achievement.name · credentials[].issuer.name ·
 *   credentials[].verification.verifier
 * identity.availability is a FACET and not a matched field — a viewer filters on
 * "has said something about availability", and typing the sentence itself is not
 * how anyone searches.
 *
 * FACETS (SPEC § 4 D5, F-9). Three groups: niche, availability, and
 * verification-with-the-verifier-named. NO FACET MAY READ A BARE "Verified" —
 * every one of them names who did the verifying, or says plainly that the
 * credential is the kind a registry could check. An unqualified verified toggle
 * is precisely the minted trust mark the four-tier ladder exists to refuse.
 *
 * ORDER (SPEC § 4 D5, F-13). Algorithmic, deterministic, total, and stated here
 * in the source rather than left to a comment on a sort call:
 *   1. matched-facet count, descending;
 *   2. matched-field count, descending;
 *   3. identity.name ascending, accent-folded so "Vásquez" sorts where a reader
 *      expects it;
 *   4. id ascending, so two identically-named records still have one order.
 * There is no drag-to-reorder anywhere and there is no promoted slot, no paid
 * placement and no ranking badge: left to choose, people sort by prettiest, and
 * that is the mechanism that produces badge inflation.
 *
 * HOW A SELECTION NARROWS. Facets are OR within a group and AND across groups —
 * two verifiers means either, a niche AND a verifier means both. That is the
 * reading the SPEC's own two clauses force together: "matched-facet count desc"
 * is only a live ordering key if a record inside the filtered set can match more
 * than one selected facet, and the empty state's "which single facet, if dropped,
 * would yield results" is only a real question if a facet constrains. Query
 * terms are AND: every word must land somewhere, so typing more narrows.
 */
(function (root) {
  "use strict";

  var LENZLI = root.LENZLI;

  if (!LENZLI || !LENZLI.directory) {
    throw new Error(
      "src/directory/search.js: window.LENZLI.directory is missing. src/brand/namespace.js must load first."
    );
  }

  /* namespace.js created this container with both methods stubbed; overwrite
     them in place so anything that captured the object keeps the same object
     (the idiom src/store/storage.js uses for LENZLI.store). */
  var directory = LENZLI.directory = LENZLI.directory || {};

  /* The niche line's own separator. src/data/shapes.js:34 documents
     identity.niche as a "·"-separated overlay line and every record in the
     corpus that carries more than one term is written that way, so the niche
     vocabulary is READ off the corpus here and never invented. */
  var NICHE_SEP = "·";

  var VERIFIED_WITH = "Verified with ";
  var REGISTRY_LABEL = "Registry-verifiable (tier A or B)";

  /* The reserved facet value for the one non-verifier option in the
     verification group. It is not a verifier name, so no corpus value can ever
     collide with it. */
  var REGISTRY_VALUE = "tier-a-or-b";

  /* --- small helpers -------------------------------------------------------- */

  /* The Unicode combining-mark block, written as escapes so the source stays
     legible in a plain editor: NFD splits "á" into "a" plus one of these, and
     stripping them is the whole of the accent fold below. */
  var COMBINING = /[\u0300-\u036f]/g;

  function text(value) {
    return value === null || value === undefined ? "" : String(value);
  }

  /* Accent-folded and lowercased, so a viewer who types "vasquez" finds
     "Vásquez" and one who types "tuv" finds "TÜV". Nothing else is normalised:
     stemming would make the explanation on the card a guess. */
  function fold(value) {
    return text(value).normalize("NFD").replace(COMBINING, "").toLowerCase();
  }

  function words(query) {
    return fold(query).split(/\s+/).filter(function (word) {
      return word.length > 0;
    });
  }

  /* A record set, taken as either shape. records.all() hands back a list; an
     id-keyed object is accepted too, the way src/credentials/chip.js's scan
     accepts both. */
  function asList(records) {
    if (!records) {
      return [];
    }
    if (Object.prototype.toString.call(records) === "[object Array]") {
      return records;
    }
    return Object.keys(records).map(function (id) {
      return records[id];
    });
  }

  function trimmed(value) {
    return text(value).trim();
  }

  /* --- the corpus's own niche vocabulary ------------------------------------ */

  function nicheTerms(line) {
    return text(line).split(NICHE_SEP).map(trimmed).filter(function (term) {
      return term.length > 0;
    });
  }

  /* The head term is the family — "ICU nurse", "Home inspector" — and the terms
     after it qualify it. A line with no separator is a family on its own. */
  function nicheOf(record) {
    var terms = nicheTerms((record.identity || {}).niche);
    return terms.length ? terms[0] : "";
  }

  function availabilityOf(record) {
    return trimmed((record.identity || {}).availability) ? "stated" : "not-stated";
  }

  function verifiersOf(record) {
    var out = [];

    (record.credentials || []).forEach(function (c) {
      var name = trimmed(c && c.verification && c.verification.verifier);
      if (name && out.indexOf(name) === -1) {
        out.push(name);
      }
    });

    return out;
  }

  /* Tier A and B are the two rungs an outsider can re-check: a signature or a
     registry lookup. Tier C is an issuer link nobody checked and tier D is a
     self-reported claim, so neither qualifies. */
  function registryVerifiable(record) {
    return (record.credentials || []).some(function (c) {
      return c && (c.tier === "A" || c.tier === "B");
    });
  }

  /* --- the seven matched fields --------------------------------------------- */

  /* One entry per searchable string. credId rides along on the three credential
     fields so the surface can name the credential that matched without
     re-deriving which one it was. */
  function entry(out, field, value, credId) {
    var str = trimmed(value);

    if (!str) {
      return;
    }
    out.push({
      kind: "field",
      field: field,
      value: str,
      credId: credId || null
    });
  }

  function fieldsOf(record) {
    var identity = record.identity || {};
    var outcome = record.outcome || {};
    var close = record.close || {};
    var out = [];

    entry(out, "identity.name", identity.name);

    /* Term by term, not as one line: the corpus writes three claims into a
       niche and the card's explanation should name the one that matched, not
       the whole overlay line. */
    nicheTerms(identity.niche).forEach(function (term) {
      entry(out, "identity.niche", term);
    });

    entry(out, "outcome.headline", outcome.headline);

    (close.scope || []).forEach(function (item) {
      entry(out, "close.scope", item);
    });

    (record.credentials || []).forEach(function (c) {
      var achievement = (c && c.achievement) || {};
      var issuer = (c && c.issuer) || {};
      var verification = (c && c.verification) || {};
      var credId = c && c.id;

      entry(out, "credential.name", achievement.name, credId);
      entry(out, "credential.issuer", issuer.name, credId);
      entry(out, "credential.verifier", verification.verifier, credId);
    });

    return out;
  }

  /* --- facets --------------------------------------------------------------- */

  function facetLabel(group, value) {
    if (group === "availability") {
      return value === "stated" ? "Availability stated" : "Availability not stated";
    }
    if (group === "verification") {
      return value === REGISTRY_VALUE ? REGISTRY_LABEL : VERIFIED_WITH + value;
    }
    return value;
  }

  function tally(counts, order, value) {
    if (!Object.prototype.hasOwnProperty.call(counts, value)) {
      counts[value] = 0;
      order.push(value);
    }
    counts[value] += 1;
  }

  /* Facet order inside a group is itself algorithmic: commonest first, then by
     label, so the list is stable across reloads and identical for every viewer.
     Group order is the SPEC's own — niche, availability, verification. */
  function grouped(group, counts, order) {
    return order.map(function (value) {
      return {
        group: group,
        value: value,
        label: facetLabel(group, value),
        count: counts[value]
      };
    }).sort(function (a, b) {
      if (a.count !== b.count) {
        return b.count - a.count;
      }
      return fold(a.label) < fold(b.label) ? -1 : 1;
    });
  }

  directory.facets = function (records) {
    var list = asList(records);
    var nicheCounts = {};
    var nicheOrder = [];
    var availCounts = {};
    var availOrder = [];
    var verifierCounts = {};
    var verifierOrder = [];
    var registry = 0;
    var out;

    list.forEach(function (record) {
      var niche;

      if (!record || typeof record !== "object") {
        return;
      }

      niche = nicheOf(record);
      if (niche) {
        tally(nicheCounts, nicheOrder, niche);
      }

      tally(availCounts, availOrder, availabilityOf(record));

      verifiersOf(record).forEach(function (name) {
        tally(verifierCounts, verifierOrder, name);
      });

      if (registryVerifiable(record)) {
        registry += 1;
      }
    });

    /* A facet that matches nobody in this set is left out rather than rendered
       as a dead control — including the registry option, which is built last so
       it sits with the verifiers it generalises. */
    if (registry > 0) {
      verifierCounts[REGISTRY_VALUE] = registry;
      verifierOrder.push(REGISTRY_VALUE);
    }

    out = grouped("niche", nicheCounts, nicheOrder);
    out = out.concat(grouped("availability", availCounts, availOrder));
    return out.concat(grouped("verification", verifierCounts, verifierOrder));
  };

  function matchesFacet(record, facet) {
    if (facet.group === "niche") {
      return nicheOf(record) === facet.value;
    }
    if (facet.group === "availability") {
      return availabilityOf(record) === facet.value;
    }
    if (facet.group === "verification") {
      if (facet.value === REGISTRY_VALUE) {
        return registryVerifiable(record);
      }
      return verifiersOf(record).indexOf(facet.value) !== -1;
    }
    return false;
  }

  /* The selection, normalised to {group -> [facet]}. A caller may hand back the
     objects facets() returned or bare {group, value} pairs; both are taken, and
     a facet with no group is dropped rather than silently matching nothing. */
  function selection(facets) {
    var groups = {};

    asList(facets).forEach(function (facet) {
      var group = facet && trimmed(facet.group);

      if (!group) {
        return;
      }
      if (!Object.prototype.hasOwnProperty.call(groups, group)) {
        groups[group] = [];
      }
      groups[group].push({
        group: group,
        value: text(facet.value),
        label: text(facet.label) || facetLabel(group, text(facet.value))
      });
    });

    return groups;
  }

  /* --- search --------------------------------------------------------------- */

  /* Returns the matched list for a record that passes both gates, or null for
     one that does not. The two gates:
       - facets: within each selected group at least one facet matches (OR), and
         every selected group has one (AND);
       - query: every term lands on at least one of the seven fields (AND).
     Everything that matched is collected on the way through, because the card's
     explanation is the same evidence the ordering rule counts. */
  function matchRecord(record, terms, groups) {
    var matched = [];
    var fields = null;
    var names = Object.keys(groups);
    var i;
    var hits;

    for (i = 0; i < names.length; i++) {
      hits = groups[names[i]].filter(function (facet) {
        return matchesFacet(record, facet);
      });

      if (!hits.length) {
        return null;
      }
      hits.forEach(function (facet) {
        matched.push({
          kind: "facet",
          group: facet.group,
          value: facet.value,
          label: facet.label
        });
      });
    }

    for (i = 0; i < terms.length; i++) {
      fields = fields || fieldsOf(record);
      hits = fields.filter(function (item) {
        return fold(item.value).indexOf(terms[i]) !== -1;
      });

      if (!hits.length) {
        return null;
      }
      hits.forEach(function (item) {
        var already = matched.some(function (seen) {
          return seen.kind === "field" && seen.field === item.field && seen.value === item.value;
        });
        if (!already) {
          matched.push(item);
        }
      });
    }

    return matched;
  }

  function count(matched, kind) {
    return matched.filter(function (item) {
      return item.kind === kind;
    }).length;
  }

  directory.search = function (query, facets, records) {
    var terms = words(query);
    var groups = selection(facets);
    var ranked = [];

    asList(records).forEach(function (record) {
      var matched;

      if (!record || typeof record !== "object") {
        return;
      }

      matched = matchRecord(record, terms, groups);
      if (!matched) {
        return;
      }

      ranked.push({
        result: { record: record, matched: matched },
        facetHits: count(matched, "facet"),
        fieldHits: count(matched, "field"),
        name: fold((record.identity || {}).name),
        id: text(record.id)
      });
    });

    ranked.sort(function (a, b) {
      if (a.facetHits !== b.facetHits) {
        return b.facetHits - a.facetHits;
      }
      if (a.fieldHits !== b.fieldHits) {
        return b.fieldHits - a.fieldHits;
      }
      if (a.name !== b.name) {
        return a.name < b.name ? -1 : 1;
      }
      if (a.id === b.id) {
        return 0;
      }
      return a.id < b.id ? -1 : 1;
    });

    return ranked.map(function (item) {
      return item.result;
    });
  };
})(window);
