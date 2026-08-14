/* legend.js — the legend: what each status word means, and what each tier of
 * the ladder is.
 *
 * Classic script (SPEC A3-9). Overwrites the renderLegend stub on load.
 *
 * This is the single legend surface in the build. The wallet screen appends it
 * below its list and the About panel renders it as its own third block; neither
 * one restates the copy (SPEC § 3.1). Each call returns a fresh element, so two
 * surfaces can hold one each.
 *
 * The six words are spelled out in this file rather than read from the status
 * vocabulary in chip.js, because this is the surface that defines them — the
 * meaning beside a word is copy, not data, and M-17 reads the six out of here.
 */
(function (root) {
  "use strict";

  var LENZLI = root.LENZLI;
  var cred = LENZLI.cred;

  /* Status is what a CHECK returned, never what the holder claims (SPEC A3-14).
     Six states and not two: a binary UI has to lie about a suspended licence. */
  var STATES = [
    ["active", "Active", "A check ran, and it came back current."],
    ["expiring", "Expiring", "Still valid, and inside 90 days of its end date."],
    ["expired", "Expired", "The end date has passed. It stays on the record — lapse and renew is a normal cycle."],
    ["suspended", "Suspended", "The issuer has paused it. Not expired, and not revoked."],
    ["revoked", "Revoked", "The issuer withdrew it."],
    ["unverifiable", "Unverifiable", "Nothing was checked, so nothing can be said either way."]
  ];

  /* The four-tier ladder, in the ladder's own terms. The chrome column is the
     whole argument: a tier-D entry has to look poorer, not merely be labelled
     differently (docs/research-credentials.md § C). */
  var TIERS = [
    ["A", "A signed badge or credential proof that checks out, and is not revoked.",
      "Verified — signed by the issuer", "Full card, with the issuer's own text mark."],
    ["B", "A lookup against the issuer's registry passed.",
      "Verified with the registry · checked N days ago", "Full card, with the issuer's own text mark."],
    ["C", "A credential page exists. Nothing was checked against it.",
      "Issuer link", "Muted card, hairline border, no shadow."],
    ["D", "Nothing. The holder typed it in.",
      "Self-reported", "Plain text row. No card, no border, no shadow, no glyph."]
  ];

  LENZLI.renderLegend = function () {
    var legend = document.createElement("section");
    var states = document.createElement("dl");
    var table = document.createElement("table");
    var head = document.createElement("tr");

    legend.className = "cred-legend";
    legend.appendChild(heading("h3", "cred-legend-title", "What the words mean"));
    legend.appendChild(line(
      "cred-legend-lead",
      "A status word is what a check returned, never what the holder claims."
    ));

    states.className = "cred-legend-states";
    STATES.forEach(function (state) {
      var term = document.createElement("dt");
      var meaning = document.createElement("dd");
      term.className = "cred-legend-state is-" + state[0];
      term.appendChild(cred.glyphSlot(state[0]));
      term.appendChild(part("cred-legend-word", state[1]));
      meaning.className = "cred-legend-meaning";
      meaning.textContent = state[2];
      states.appendChild(term);
      states.appendChild(meaning);
    });
    legend.appendChild(states);

    legend.appendChild(heading("h3", "cred-legend-title", "The four tiers"));
    table.className = "cred-legend-tiers";
    ["Tier", "What it rests on", "Label", "Chrome"].forEach(function (label) {
      var th = document.createElement("th");
      th.scope = "col";
      th.textContent = label;
      head.appendChild(th);
    });
    table.appendChild(head);
    TIERS.forEach(function (tier) {
      var tr = document.createElement("tr");
      tier.forEach(function (cell, i) {
        var td = document.createElement(i === 0 ? "th" : "td");
        if (i === 0) {
          td.scope = "row";
        }
        td.textContent = cell;
        tr.appendChild(td);
      });
      table.appendChild(tr);
    });
    legend.appendChild(table);

    /* The two rules the tiers and the states compose under. */
    legend.appendChild(line(
      "cred-legend-rule",
      "Tier C is always Unverifiable. A page that exists is not a check, so the dates can look current and still prove nothing."
    ));
    legend.appendChild(line(
      "cred-legend-rule",
      "Tier D carries no status word at all. Nobody issued it, so there is no state to report."
    ));

    return legend;
  };

  function heading(tag, cls, str) {
    var el = document.createElement(tag);
    el.className = cls;
    el.textContent = str;
    return el;
  }

  function line(cls, str) {
    var el = document.createElement("p");
    el.className = cls;
    el.textContent = str;
    return el;
  }

  function part(cls, str) {
    var el = document.createElement("span");
    el.className = cls;
    el.textContent = str;
    return el;
  }
})(window);
