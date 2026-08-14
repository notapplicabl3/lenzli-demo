/* mark.js — the Lenzli mark, drawn inline.
 *
 * Inline SVG only: no image files, no icon font, no network calls at runtime.
 * The page holds exactly one copy of the geometry — this one.
 *
 * Neither function is named in SPEC § 3.1, because § 3.1 lists the cross-order
 * methods and the mark is the brand layer's own. Both attach to the namespace
 * anyway, since the namespace is the only global this build has.
 */
(function (root) {
  "use strict";

  var LENZLI = root.LENZLI;

  /* Geometry verbatim from SPEC § 4 D1: viewBox 0 0 48 48, a rounded square
     rx=13 stroked #1B1B18 at 2.5, and the two concentric circles that make the
     lens aperture. fill="none" is carried on the two stroked shapes — the SVG
     default fill would otherwise paint them solid, which is not the drawn mark. */
  LENZLI.mark = function (size) {
    var px = size || 28;
    return '<svg viewBox="0 0 48 48" width="' + px + '" height="' + px + '" ' +
      'aria-hidden="true" focusable="false" class="mark">' +
      '<rect x="3" y="3" width="42" height="42" rx="13" fill="none" ' +
      'stroke="#1B1B18" stroke-width="2.5"/>' +
      '<circle cx="24" cy="24" r="8.5" fill="none" ' +
      'stroke="#1B1B18" stroke-width="2.5"/>' +
      '<circle cx="24" cy="24" r="2.5" fill="#1B1B18"/>' +
      '</svg>';
  };

  /* Wordmark: "Lenzli", sentence case, display font, 600. Styling is base.css's. */
  LENZLI.wordmark = function () {
    return '<span class="wordmark">Lenzli</span>';
  };

  /* Fill the shell's slots. reel.html carries the chrome as markup and marks the
     drawing points with data-mark (its value is the pixel size) and
     data-wordmark; scripts load at the end of <body>, so the slots exist by now.

     E-5 gives paint a root. The load-time call below still paints the whole
     document, which is the entire reel path; the parameter exists because a
     surface mounted after load — a router swapping panels into a host — carries
     slots this file has already run past, and they would otherwise stay empty
     forever. Root defaults to document, so LENZLI.paintMarks() is today's call. */
  function paint(root) {
    var scope = root || (typeof document !== "undefined" ? document : null);
    var marks;
    var words;
    var i;

    if (!scope || typeof scope.querySelectorAll !== "function") {
      return;
    }

    marks = scope.querySelectorAll("[data-mark]");
    words = scope.querySelectorAll("[data-wordmark]");

    for (i = 0; i < marks.length; i++) {
      marks[i].innerHTML = LENZLI.mark(Number(marks[i].getAttribute("data-mark")));
    }
    for (i = 0; i < words.length; i++) {
      words[i].innerHTML = LENZLI.wordmark();
    }
  }

  LENZLI.paintMarks = paint;

  if (typeof document !== "undefined") {
    paint();
  }
})(window);
