/* storage.js — the namespaced browser-storage adapter.
 *
 * Classic script (SPEC A3-9). Overwrites the namespace's store stubs on load.
 * This is the ONLY file in the build that names localStorage (SPEC § 3.3,
 * AM-11): everything else goes through LENZLI.store, so there is exactly one
 * place where persistence can fail and exactly one place that knows the key
 * namespace.
 *
 * WHY THE PREFIX IS CORRECTNESS AND NOT HYGIENE (SPEC F-5, measured).
 * Every file:// document on this machine shares ONE origin — location.origin
 * is the bare string "file://" with no path — so a differently named local HTML
 * page opened tomorrow reads and writes the same storage area. An unprefixed
 * key would collide with every other local page the user ever opens. The one
 * prefix constant lives below; every key is composed from it, and callers pass
 * the short name ("records", "draft", "me", "meta") and never see the prefix.
 *
 * The same shared origin is why nothing here may hold real personal data
 * (SPEC F-6): anything written is readable by any other local page.
 *
 * FAILURE (SPEC § 3.3). Every read and write is try/caught. On a failure the
 * value stays in an in-memory map so the session continues, store.available
 * goes false, and LENZLI.app.notice tells the viewer in one line. Nothing is
 * swallowed silently and nothing is thrown into a surface.
 *
 * Not here: no indexedDB, no service worker, no FileReader, no data URI, no
 * URL.createObjectURL. Quota is designed out rather than handled — no upload
 * and no data URI ever enters a record (SPEC A1-16), so a record is a few
 * kilobytes.
 */
(function (root) {
  "use strict";

  var LENZLI = root.LENZLI;

  if (!LENZLI) {
    throw new Error(
      "src/store/storage.js: window.LENZLI is missing. src/brand/namespace.js must load first."
    );
  }

  /* The one prefix literal in the file. Every key below is PREFIX + short name,
     and PREFIX.length is how a stored key is read back as a short name. */
  var PREFIX = "lenzli.pivot.v1.";

  var NOTICE = "Storage is unavailable — changes last until this tab closes.";

  /* short name -> the raw JSON string that could not be persisted. Holding the
     serialised form rather than the object makes the fallback behave exactly
     like the real thing: a caller mutating its own object afterwards cannot
     reach back into what was stored. */
  var memory = {};

  /* namespace.js created this container with every method stubbed and
     available already false (SPEC § 3.1); overwrite the methods in place so
     anything that captured the object at load keeps the same object. */
  var store = LENZLI.store = LENZLI.store || {};

  /* True until an access proves otherwise. src/store/records.js reads the
     schema stamp at load, immediately after this file, so the value is answered
     by a real access within the same load sequence rather than by a probe
     invented here. */
  store.available = true;

  function keyFor(name) {
    return PREFIX + String(name);
  }

  function own(obj, name) {
    return Object.prototype.hasOwnProperty.call(obj, name);
  }

  function backend() {
    /* Reading the property can itself throw where storage is blocked, which is
       why every caller wraps this in its own try. */
    return root.localStorage;
  }

  /* The one failure path. § 3.3 lists three obligations and this does all
     three, in that order: keep the session alive, record the degraded state,
     tell the viewer. The notice is called on every failure, as § 3.3 words it —
     app.notice writes one line in the app chrome, so repeating it is idempotent
     on screen. The cause goes to the console beside it: a failure that only
     showed as a one-line notice would be a swallowed error. */
  function fail(what, err) {
    store.available = false;
    LENZLI.app.notice(NOTICE);
    console.warn("LENZLI.store: could not " + what + " — this session keeps its changes in memory only.", err);
  }

  store.get = function (name) {
    var key = keyFor(name);
    var raw;

    if (own(memory, name)) {
      raw = memory[name];
    } else {
      try {
        raw = backend().getItem(key);
      } catch (err) {
        fail("read " + key, err);
        return null;
      }
    }

    if (raw === null || raw === undefined) {
      return null;
    }

    try {
      return JSON.parse(raw);
    } catch (err) {
      /* Unreadable stored bytes reach the caller the same way an unreadable
         storage layer does: as an absent value, on the memory fallback, with
         the reason surfaced. The schema stamp (§ 3.3) is the designed defence
         against stale data; this is the undesigned one. */
      fail("parse " + key, err);
      return null;
    }
  };

  store.set = function (name, value) {
    var key = keyFor(name);
    var raw = null;

    try {
      raw = JSON.stringify(value);
      backend().setItem(key, raw);
    } catch (err) {
      fail("write " + key, err);
      if (raw !== null) {
        memory[name] = raw;
      }
      return;
    }

    /* Persisted, so the memory copy is no longer the newest one. */
    delete memory[name];
  };

  store.remove = function (name) {
    var key = keyFor(name);

    delete memory[name];

    try {
      backend().removeItem(key);
    } catch (err) {
      fail("remove " + key, err);
    }
  };

  /* Every short name this build currently holds, persisted or in memory. It is
     what makes records.reset() "remove every prefixed key" rather than "remove
     the four keys I remembered to list". */
  store.keys = function () {
    var names = [];
    var ls;
    var key;
    var i;

    try {
      ls = backend();
      for (i = 0; i < ls.length; i++) {
        key = ls.key(i);
        if (key && key.indexOf(PREFIX) === 0) {
          names.push(key.slice(PREFIX.length));
        }
      }
    } catch (err) {
      fail("list keys", err);
    }

    Object.keys(memory).forEach(function (name) {
      if (names.indexOf(name) === -1) {
        names.push(name);
      }
    });

    return names;
  };
})(window);
