/* records.js — the record layer: the seeded corpus overlaid by what the user
 * made.
 *
 * Classic script (SPEC A3-9). Overwrites the namespace's records stubs on load.
 * DOM-free by contract (SPEC § 3.1, headless rule): this file loads under node
 * with `global.window = global`, which is what makes the AM-10 smoke a machine
 * row instead of an eyeball. Persistence is reached only through LENZLI.store
 * (src/store/storage.js), never directly.
 *
 * THE MERGE RULE (SPEC § 3.3). all() is the seeded records from
 * LENZLI.personas OVERLAID by the stored map, keyed by id.
 *
 *   - A stored record carrying a seed's id SHADOWS that seed. That is how
 *     editing a seeded person works, and it is why seeds are never mutated:
 *     nothing here ever writes into LENZLI.personas, and the stored map holds
 *     user-created and user-edited records only.
 *   - remove(id) deletes the OVERLAY, which restores the seed underneath it.
 *     On a user record there is nothing underneath, so it goes.
 *   - isSeed(id) is true whenever LENZLI.personas[id] exists.
 *   - New ids are "u-" + crypto.randomUUID() (measured available at file://,
 *     which Chrome treats as a secure context), so a user record can never
 *     collide with a seed slug.
 *
 * THE CREDENTIAL RESOLVER (SPEC § 3.1 E-7, audit H1) is installed at the
 * bottom of this file and is the most consequential thing in it. The whole
 * credential ladder used to resolve through LENZLI.personas alone, and § 3.3
 * keeps user records OUT of LENZLI.personas on purpose — so without the
 * install, every credential control on every record the create flow produces
 * misses, and an edited seed silently resolves to the un-edited original.
 */
(function (root) {
  "use strict";

  var LENZLI = root.LENZLI;

  if (!LENZLI) {
    throw new Error(
      "src/store/records.js: window.LENZLI is missing. src/brand/namespace.js must load first."
    );
  }

  var store = LENZLI.store;

  /* namespace.js created this container with every method stubbed; overwrite
     the methods in place so anything that captured the object keeps it. */
  var records = LENZLI.records = LENZLI.records || {};

  /* The stored schema version. The stamp under the "meta" key is written on
     first write and checked at load, so a later schema change refuses stale
     data instead of crashing on it (SPEC § 3.3). seededAt is BUILD_DATE and not
     a second date literal — dates in this build compute against BUILD_DATE and
     never against a clock (SPEC F-7). */
  var SCHEMA = 1;

  /* Set at load when storage carries a stamp this build does not understand.
     See the refusal rule at the bottom of the file. */
  var foreign = false;

  function own(obj, name) {
    return Object.prototype.hasOwnProperty.call(obj, name);
  }

  function seeds() {
    return LENZLI.personas || {};
  }

  /* A record round-trips through JSON on the way in, which snapshots it (the
     caller's later edits cannot reach what was stored) and proves it is the
     plain JSON that export() promises to hand back. */
  function clone(value) {
    try {
      return JSON.parse(JSON.stringify(value));
    } catch (err) {
      console.warn("LENZLI.records: this record does not survive a JSON round-trip and was not stored.", err);
      return null;
    }
  }

  function read(name) {
    return foreign ? null : store.get(name);
  }

  /* The stored overlay: id -> record. Always a fresh object, because store.get
     parses it out of storage on every call, so callers may edit the returned
     map before handing it back to write(). */
  function stored() {
    var map = read("records");
    return map && typeof map === "object" ? map : {};
  }

  function stamp() {
    if (!store.get("meta")) {
      store.set("meta", { schema: SCHEMA, seededAt: LENZLI.BUILD_DATE });
    }
  }

  function write(name, value) {
    if (foreign) {
      /* Refused, not overwritten: the bytes belong to a version this build
         cannot read, and destroying them to make room would be the one
         unrecoverable move. reset() is the way out and still works. */
      LENZLI.app.notice("Stored data was written by a different version of this prototype — it is being left untouched, and this session starts from the sample profiles.");
      return false;
    }
    stamp();
    store.set(name, value);
    return true;
  }

  /* --- Reading -------------------------------------------------------------- */

  /* Seeds first, in LENZLI.personas' own key order, each replaced in place by
     its overlay where one exists; then the user-created records the stored map
     adds. A list, not a map — every consumer of this call is a list consumer
     (the directory searches and counts it, the credential resolver scans it),
     and cred.setLookup normalises both shapes anyway (src/credentials/chip.js).
     Ordering beyond "seeds keep their declared order" is not a promise: the
     directory sorts by name itself (SPEC § 3.4.1 M7). */
  records.all = function () {
    var overlay = stored();
    var seeded = seeds();
    var out = [];

    Object.keys(seeded).forEach(function (id) {
      out.push(own(overlay, id) ? overlay[id] : seeded[id]);
    });

    Object.keys(overlay).forEach(function (id) {
      if (!own(seeded, id)) {
        out.push(overlay[id]);
      }
    });

    return out;
  };

  records.get = function (id) {
    var overlay = stored();

    if (own(overlay, id)) {
      return overlay[id];
    }
    return own(seeds(), id) ? seeds()[id] : null;
  };

  records.isSeed = function (id) {
    return own(seeds(), id);
  };

  /* --- Writing -------------------------------------------------------------- */

  /* Saves a copy and returns it, id and all, so the caller that just published
     knows the id to route to. A record with no id gets a new one; a record
     carrying a seed's id is stored as that seed's overlay, which is the whole
     of what "editing a seeded person" means. */
  records.save = function (record) {
    var copy;
    var map;

    if (!record || typeof record !== "object") {
      return null;
    }

    copy = clone(record);
    if (!copy) {
      return null;
    }
    if (!copy.id) {
      copy.id = "u-" + root.crypto.randomUUID();
    }

    map = stored();
    map[copy.id] = copy;

    return write("records", map) ? copy : null;
  };

  records.remove = function (id) {
    var map = stored();

    if (!own(map, id)) {
      return false;
    }
    delete map[id];

    /* The seed underneath, if there is one, is now the answer again — nothing
       has to restore it, because nothing ever overwrote it. */
    return write("records", map);
  };

  /* Every prefixed key goes, and the app is pure seeds again. The stamp goes
     with them and the next write re-stamps. */
  records.reset = function () {
    store.keys().forEach(function (name) {
      store.remove(name);
    });
    foreign = false;

    /* Removing the draft KEY is only half of clearing the draft. The create
       surface holds it in a module-level object that outlives a mount on purpose
       (src/create/create.js), so the in-memory copy survives this, the next
       compile() writes it back, and because it still carries the id of a record
       this reset just deleted, a second Publish re-creates that record at its
       old address. § 4 D8's reset copy promises the draft in progress goes with
       everything else, so it does.

       Guarded and stubbed (SPEC § 3.1, A1-6): a tree without src/create/ still
       resets, and reports the stub instead of throwing out of the one control
       whose whole job is to leave nothing behind. */
    if (LENZLI.create && typeof LENZLI.create.clearDraft === "function") {
      LENZLI.create.clearDraft();
    }

    return true;
  };

  /* --- Who the owner is ----------------------------------------------------- */

  /* SPEC § 3.4.1 M3, verbatim in its consequences: the stored me id, else the
     single user record if there is exactly one, else null.

     NEVER insertion order — that is an implementation detail masquerading as a
     rule — and never a clock, which F-7/AM-17 forbid and the schema could not
     support anyway (there is no createdAt field and there will not be one).

     "User record" means a stored record that is not a seed's overlay. Editing
     Maya's reel does not make the viewer Maya; A1-19 wants an honest empty
     workbench in that case, not a silently adopted identity. A stored id that
     no longer resolves falls through to the same test rather than being handed
     back, so deleting the record you were pointing at leaves an empty
     workbench and not a broken one. */
  records.me = function () {
    var saved = read("me");
    var id = saved && saved.personaId;
    var users;

    if (id && records.get(id)) {
      return id;
    }

    users = Object.keys(stored()).filter(function (rid) {
      return !records.isSeed(rid);
    });

    return users.length === 1 ? users[0] : null;
  };

  records.setMe = function (id) {
    if (!id || !records.get(id)) {
      console.warn("LENZLI.records.setMe: no record with id " + id + " — the owner is unchanged.");
      return false;
    }
    return write("me", { personaId: id });
  };

  /* --- Export ---------------------------------------------------------------

     The build's ONE export implementation (SPEC § 3.4.1 M10): src/owner/
     export.js is cut and is authored by no order. Three mechanisms for one
     string was surface area, not resilience. */

  records.export = function (id) {
    var record = records.get(id);
    return record ? JSON.stringify(record, null, 2) : null;
  };

  /* --- Load-time work -------------------------------------------------------

     1. Check the stamp. A stamp from another schema means the stored bytes are
        not this build's; read() and stored() then answer as if storage were
        empty, write() refuses, and reset() is the escape hatch. An absent stamp
        is the normal first run and is written by the first write.
     2. Install the credential resolver (E-7). Load order puts chip.js well
        before this file (SPEC § 3.2), so the kit is there in the app; under a
        headless load it is not, and saying so out loud is the point — a silent
        no-op here is exactly how audit H1 shipped green the first time. */

  (function checkStamp() {
    var meta = store.get("meta");
    if (meta && meta.schema !== SCHEMA) {
      foreign = true;
    }
  })();

  if (LENZLI.cred && typeof LENZLI.cred.setLookup === "function") {
    LENZLI.cred.setLookup(function () {
      return records.all();
    });
  } else {
    console.info(
      "LENZLI.records: LENZLI.cred.setLookup is absent, so credential lookup still resolves through LENZLI.personas alone — every credential control on a user-created record will miss (SPEC § 3.1 E-7)."
    );
  }
})(window);
