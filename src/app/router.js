/*
 * src/app/router.js — the hash router, the surface lifecycle, and the two panels
 * every unknown thing lands on.
 *
 * Classic script (SPEC A3-9). Overwrites the router stubs namespace.js declared.
 *
 * HASH ONLY, NEVER pushState (SPEC F-1, § 3.4). Hash routing is MEASURED to work
 * at file://; a real-path pushState is not, and this artifact opens from a
 * double-click with no server behind it. LENZLI.router.go(route) sets
 * location.hash and does nothing else. No query strings anywhere.
 *
 * PARSE (SPEC § 3.4). Take location.hash, strip a leading "#" then a leading "/",
 * split on "/", drop a trailing empty segment. The route table:
 *
 *   #  ·  #/  ·  empty        browse    —
 *   #/r/<personaId>           landing   {personaId}
 *   #/create                  create    {}
 *   #/create/<personaId>      create    {personaId} — edit mode
 *   #/me                      owner     —
 *   anything else             notfound  {route}
 *
 * UNKNOWN THINGS ARE SURFACED, NEVER REDIRECTED (SPEC A1-9). Two panels, both
 * built here as real surfaces:
 *   - not-found, for a route the table does not recognise. It prints the route it
 *     did not recognise and offers one control back to #/.
 *   - not-landed, for a route whose surface file has not landed yet. The stub
 *     rule, extended from methods to surfaces: no registration exists, so the
 *     panel says so by name instead of the page going blank.
 * A silent redirect would hide exactly the failure these exist to show.
 *
 * REGISTRATION IS PER-FILE, NOT A MANIFEST (SPEC § 3.4, ledger V2-14). Each
 * surface file calls LENZLI.router.register(name, surface) at load, using § 3.4's
 * own route names — browse, landing, create, owner. This file holds no list of
 * surfaces and no later order edits it. § 3.2 puts every surface file above the
 * inline LENZLI.appBoot() call, so every registration has run by the time
 * router.start() reads the first hash.
 *
 * A SURFACE is {title, mount(host, params), unmount()} (SPEC § 3.1), optionally
 * carrying keepOnParamChange:true and onParams(params).
 *
 * TEARDOWN, IN THIS ORDER, ON EVERY ROUTE CHANGE (SPEC § 3.4):
 *   1. the outgoing surface's unmount() — which must destroy() every deck
 *      instance it created, call LENZLI.cred.closeSheet(), remove every listener
 *      it added to document or window, and leave its host empty;
 *   2. the router empties the host as a backstop;
 *   3. the host's scroll resets to top (app.css makes #surface the scroller, so
 *      this is a real reset and not a no-op);
 *   4. the incoming surface's mount(host, params);
 *   5. focus moves to the new surface's <h1 tabindex="-1"> and its title is
 *      announced in the app's single aria-live="polite" region.
 * LENZLI.paintMarks(host) runs between 4 and 5, because a surface mounted after
 * load carries [data-mark]/[data-wordmark] slots that mark.js's load-time paint
 * has already run past (SPEC § 3.1 E-5).
 *
 * THE SAME-ROUTE GUARD (SPEC § 3.4, audit H6). A surface may declare
 * keepOnParamChange:true; for such a surface a hash change resolving to the SAME
 * surface does not remount, whatever the params did — the router re-reads them
 * and calls onParams(params). Every other surface takes the narrow rule: same
 * surface AND same params. The create surface declares the flag, because
 * publishing writes #/create/<id> over #/create and a remount there would destroy
 * the form mid-flow. No surface is ever special-cased by name here.
 */
(function (root) {
  "use strict";

  var LENZLI = root.LENZLI;

  if (!LENZLI || !LENZLI.router) {
    throw new Error(
      "src/app/router.js: window.LENZLI.router is missing. src/brand/namespace.js must load first."
    );
  }

  /* namespace.js created this container with every method stubbed; overwrite the
     methods in place so anything that captured the object at load keeps the same
     object (the idiom src/store/storage.js uses for LENZLI.store). */
  var router = LENZLI.router = LENZLI.router || {};

  var surfaces = {};       /* name -> surface, filled by register() at load */
  var panels = {};         /* name -> its not-landed panel, made once and reused */
  var current = null;      /* {name, params, route, surface} or null */
  var host = null;
  var live = null;
  var started = false;

  /* --- small helpers ------------------------------------------------------ */

  function make(tag, className, text) {
    var node = document.createElement(tag);
    if (className) {
      node.className = className;
    }
    if (text !== undefined && text !== null) {
      node.textContent = text;
    }
    return node;
  }

  function button(className, text) {
    var node = make("button", className, text);
    node.type = "button";
    return node;
  }

  /* --- parse -------------------------------------------------------------- */

  function segments(hash) {
    var raw = String(hash === null || hash === undefined ? "" : hash);
    var parts;

    if (raw.charAt(0) === "#") {
      raw = raw.slice(1);
    }
    if (raw.charAt(0) === "/") {
      raw = raw.slice(1);
    }

    parts = raw.split("/");

    /* One trailing empty segment, which is what "#/" and "#/create/" produce.
       A second one is a route nobody typed by accident, and it falls through to
       not-found rather than being quietly cleaned up. */
    if (parts.length && parts[parts.length - 1] === "") {
      parts.pop();
    }

    return parts;
  }

  function parse(hash) {
    var parts = segments(hash);
    var route = "/" + parts.join("/");

    if (!parts.length) {
      return { surface: "browse", params: {}, route: "/" };
    }
    if (parts[0] === "r" && parts.length === 2 && parts[1]) {
      return { surface: "landing", params: { personaId: parts[1] }, route: route };
    }
    if (parts[0] === "create" && parts.length === 1) {
      return { surface: "create", params: {}, route: route };
    }
    if (parts[0] === "create" && parts.length === 2 && parts[1]) {
      return { surface: "create", params: { personaId: parts[1] }, route: route };
    }
    if (parts[0] === "me" && parts.length === 1) {
      return { surface: "owner", params: {}, route: route };
    }

    return { surface: "notfound", params: { route: route }, route: route };
  }

  function sameParams(a, b) {
    var left = a || {};
    var right = b || {};
    var keys = Object.keys(left);
    var i;

    if (keys.length !== Object.keys(right).length) {
      return false;
    }
    for (i = 0; i < keys.length; i++) {
      if (left[keys[i]] !== right[keys[i]]) {
        return false;
      }
    }
    return true;
  }

  /* --- the two panels ----------------------------------------------------- */

  /* Both are ordinary surfaces: {title, mount, unmount}. Neither binds anything
     to document or window, and every listener they add sits on a node inside the
     host, so it leaves with the node the router's backstop removes. */

  function panel(headingText, noteText) {
    var section = make("section", "app-panel");
    var h1 = make("h1", "app-panel-title display", headingText);

    h1.setAttribute("tabindex", "-1");
    section.appendChild(h1);
    section.appendChild(make("p", "app-panel-note", noteText));
    return section;
  }

  var notFound = {
    title: "Nothing is routed here",
    mount: function (mountHost, params) {
      var section = panel(
        "Nothing is routed here",
        "This app knows four routes: search, a person's reel, create, and your own profile. " +
          "The address below is not one of them."
      );
      var back = button("ctl app-panel-back", "Back to search");

      section.appendChild(make("p", "app-panel-route mono", "#" + (params.route || "/")));
      back.addEventListener("click", function () {
        router.go("/");
      });
      section.appendChild(back);
      mountHost.appendChild(section);
    },
    unmount: function () {
      /* Nothing to undo: no deck instance, no sheet, no document or window
         listener. The router's backstop empties the host. */
    }
  };

  function notLanded(name) {
    if (!panels[name]) {
      panels[name] = {
        title: "This surface has not landed",
        mount: function (mountHost, params) {
          var section = panel(
            "This surface has not landed",
            "The " + name + " surface is part of this build and its file is not on disk yet. " +
              "The route is real, the panel is a placeholder, and nothing here is broken."
          );

          section.appendChild(make("p", "app-panel-route mono", "#" + (params.route || "/")));
          mountHost.appendChild(section);
        },
        unmount: function () {}
      };
    }
    return panels[name];
  }

  function resolve(name) {
    return surfaces[name] || notLanded(name);
  }

  /* --- mount and teardown ------------------------------------------------- */

  function announce(text) {
    if (live) {
      live.textContent = text;
    }
  }

  function focusHeading() {
    var h1 = host.querySelector("h1");

    if (!h1) {
      return;
    }
    /* § 3.4 step 5 names an <h1 tabindex="-1">. focus() on an h1 without one is
       a silent no-op, so a surface that forgot it would lose the focus move and
       say nothing about it — the guard makes the omission audible instead. */
    if (!h1.hasAttribute("tabindex")) {
      h1.setAttribute("tabindex", "-1");
      console.warn(
        "LENZLI.router: the " + (current ? current.name : "mounted") +
          " surface's <h1> carries no tabindex=\"-1\" (SPEC § 3.4 step 5)."
      );
    }
    h1.focus({ preventScroll: true });
  }

  function teardown() {
    if (!current) {
      return;
    }

    if (typeof current.surface.unmount === "function") {
      current.surface.unmount();
    }

    /* A credential sheet mounts into the host its opener named, but E-6's
       default chain ends at document.body — outside the host — so emptying the
       host cannot reach one. Closing it here is the same class of backstop as
       step 2, and closeSheet is idempotent (walletCard.js:141-149). The
       obligation still belongs to the surface's unmount(); this only stops a
       missed one from leaving a focus-trapping overlay across a route change.
       Guarded exactly as cards.js:872 guards it. */
    if (LENZLI.cred && typeof LENZLI.cred.closeSheet === "function") {
      LENZLI.cred.closeSheet();
    }

    /* The About panel is the second overlay outside the host, and the worse one:
       it carries aria-modal="true", and both its Escape handler and its Tab trap
       are bound to the overlay element, so one that survives this teardown gets
       focus moved to the incoming surface's <h1> UNDERNEATH it with no key able
       to reach either guard. Same backstop class as closeSheet above, idempotent
       for the same reason, and guarded the same way (about.js). */
    if (typeof LENZLI.closeAbout === "function") {
      LENZLI.closeAbout();
    }

    host.textContent = "";
    current = null;
  }

  function apply() {
    var target = parse(root.location.hash);
    var surface = resolve(target.surface);

    if (current && current.name === target.surface) {
      /* The wide rule: this surface survives a param change and re-reads them
         itself. Focus is deliberately not moved — the whole point is that the
         viewer's caret stays where it was (audit H6). */
      if (surface.keepOnParamChange === true) {
        current.params = target.params;
        current.route = target.route;
        if (typeof surface.onParams === "function") {
          surface.onParams(target.params);
        }
        return;
      }

      /* The narrow rule: same surface AND same params is not a navigation. */
      if (sameParams(current.params, target.params)) {
        return;
      }
    }

    teardown();
    host.scrollTop = 0;

    current = {
      name: target.surface,
      params: target.params,
      route: target.route,
      surface: surface
    };

    surface.mount(host, target.params);
    LENZLI.paintMarks(host);
    focusHeading();
    announce(surface.title || target.surface);
  }

  /* --- the published surface ---------------------------------------------- */

  router.parse = parse;

  router.register = function (name, surface) {
    if (!name || !surface || typeof surface.mount !== "function") {
      throw new Error(
        "LENZLI.router.register: expected a name and a surface with a mount(host, params)"
      );
    }
    surfaces[name] = surface;
  };

  /* The ONLY navigation primitive. It writes the hash and stops; the hashchange
     listener does the rest, so a pasted address and a tapped control take exactly
     the same path (SPEC F-1). */
  router.go = function (route) {
    var next = String(route === null || route === undefined ? "" : route);

    if (next.charAt(0) === "#") {
      next = next.slice(1);
    }
    if (next.charAt(0) !== "/") {
      next = "/" + next;
    }
    root.location.hash = "#" + next;
  };

  router.current = function () {
    if (!current) {
      return null;
    }
    return { surface: current.name, params: current.params, route: current.route };
  };

  router.start = function () {
    host = document.getElementById("surface");

    if (!host) {
      throw new Error(
        "LENZLI.router.start: the page carries no <main id=\"surface\"> for surfaces to mount into"
      );
    }

    live = document.querySelector("[data-app-live]");
    if (!live) {
      console.warn(
        "LENZLI.router: the page carries no [data-app-live] region, so surface titles are not announced."
      );
    }

    if (!started) {
      started = true;
      root.addEventListener("hashchange", apply);
    }

    apply();
  };

  /* not-found is registered like any other surface, so resolve() needs no branch
     for it and a route that names it can never fall through to a blank host. */
  router.register("notfound", notFound);
})(window);
