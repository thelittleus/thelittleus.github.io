/* Little Us · DTT · where data lives. Signed in: owner-only tables and the private dtt-images bucket (see supabase/dtt-setup.sql).
   Not signed in: this browser only (dtt-guest.js), moved to the account at sign-in. The backend can be swapped, which is also how the tests run. */
(function () {
  'use strict';
  var D = window.LUDtt, P = D.programs;

  function acc() { return window.LUAcc || null; }
  var restBackend = {
    userId: function () { var a = acc(), s = a && a._session && a._session(); return (s && s.user && s.user.id) || null; },
    allowed: function (id) { var a = acc(); return a ? a.allowed(id) : false; },
    list: function (table) { return acc()._http('/rest/v1/' + table + '?select=*&user_id=eq.' + this.userId()); },
    upsert: function (table, row, conflict) {
      return acc()._http('/rest/v1/' + table + '?on_conflict=' + (conflict || 'id'), { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' }, body: [row] });
    },
    remove: function (table, filter) { return acc()._http('/rest/v1/' + table + '?' + filter, { method: 'DELETE', headers: { Prefer: 'return=minimal' } }); },
    patch: function (table, filter, fields) { return acc()._http('/rest/v1/' + table + '?' + filter, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: fields }); },
    file: function (path, opts) {
      var a = acc();
      return a._token().then(function (tk) {
        var h = { apikey: a._key, Authorization: 'Bearer ' + tk };
        Object.keys((opts && opts.headers) || {}).forEach(function (n) { h[n] = opts.headers[n]; });
        return fetch(a._sb + '/storage/v1/object/dtt-images/' + path, { method: (opts && opts.method) || 'GET', headers: h, body: opts && opts.body });
      });
    },
    upload: function (path, blob) { return this.file(path, { method: 'POST', headers: { 'Content-Type': 'image/jpeg' }, body: blob }).then(function (r) { if (!r.ok) throw new Error('upload'); }); },
    download: function (path) { return this.file(path).then(function (r) { if (!r.ok) throw new Error('download'); return r.blob(); }); },
    removeFile: function (path) { return this.file(path, { method: 'DELETE' }).catch(function () { }); },
    commit: function (session, rows) { return acc()._http('/rest/v1/rpc/dtt_commit_session', { method: 'POST', body: { p_session: session, p_progress: rows } }); },
    listSessions: function (programId) { return acc()._http('/rest/v1/dtt_sessions?select=*&program_id=eq.' + programId + '&order=started_at.asc'); }
  };

  var B = restBackend;
  var DB = { sets: [], programs: [], students: {}, progress: {}, loadedFor: null };
  var waiting = 0, flushing = false, syncListeners = [], retryT = null;
  function offline() { return D.offline; }
  function setWaiting(n) { if (n !== waiting) { waiting = n; syncListeners.forEach(function (f) { f(n); }); } }
  // a session waiting to upload wins over what the server last had, because it is newer
  function overlay(programId, rows) {
    var map = DB.progress[programId] = DB.progress[programId] || {};
    rows.forEach(function (r) { map[r.operation + '|' + r.target_id] = r.data; });
  }
  var urls = {}; // storage path -> object URL for this page view

  function setToRow(s) { return { id: s.id, user_id: B.userId(), name: s.name || '', data: { items: s.items || [] }, updated_at: new Date().toISOString() }; }
  function rowToSet(r) { return { id: r.id, name: r.name, items: (r.data && r.data.items) || [] }; }
  var PROG_DATA = ['goal', 'settings', 'preset', 'activeCount', 'queue', 'pinned', 'excluded', 'patterns', 'categories', 'sourceProgramId'];
  function progToRow(p) {
    var data = {}; PROG_DATA.forEach(function (k) { if (p[k] !== undefined) data[k] = p[k]; });
    return { id: p.id, user_id: B.userId(), student_id: p.studentId, set_id: p.setId, name: p.name || '', type: p.type, data: data, updated_at: new Date().toISOString() };
  }
  function rowToProg(r) {
    var base = P.create({ id: r.id, studentId: r.student_id, setId: r.set_id, name: r.name, type: r.type, lang: D.i18n.lang() }), d = r.data || {};
    PROG_DATA.forEach(function (k) { if (d[k] !== undefined) base[k] = k === 'settings' ? Object.assign(base.settings, d.settings) : d[k]; });
    return base;
  }

  var store = {
    setBackend: function (b) { B = b; DB.loadedFor = null; },
    userId: function () { return B.userId(); },
    allowed: function (id) { return B.allowed(id); },
    // true while someone tries the tool without signing in: everything stays in this browser (dtt-guest.js)
    guest: function () { return !!B.guest; },
    canAddProgram: function () { return B.allowed('dtt.programs') || DB.programs.length < D.defaults.FREE_PROGRAMS; },
    backend: function () { return B; },
    isLoaded: function () { return !!B.userId() && DB.loadedFor === B.userId(); },
    load: function () {
      var uid = B.userId();
      return Promise.all([B.list('dtt_sets'), B.list('dtt_programs'), B.list('dtt_students'), B.list('dtt_progress')]).then(function (res) {
        DB.sets = (res[0] || []).map(rowToSet);
        DB.programs = (res[1] || []).map(rowToProg);
        DB.students = {};
        (res[2] || []).forEach(function (r) { DB.students[r.student_id] = Object.assign({ themes: [], photos: [] }, r.data || {}); });
        DB.progress = {};
        (res[3] || []).forEach(function (r) { overlay(r.program_id, [r]); });
        DB.programs.forEach(function (p) { P.syncQueue(p, store.set(p.setId)); });
        return offline().queued(uid).catch(function () { return []; });
      }).then(function (q) {
        q.forEach(function (e) { overlay(e.session.program_id, e.rows); });
        setWaiting(q.length);
        DB.loadedFor = uid;
        if (q.length) store.flush();
      });
    },
    // the server's sessions plus any still waiting to upload. partial: true when the server could not be reached.
    sessions: function (programId) {
      var uid = B.userId();
      return Promise.all([B.listSessions(programId).then(function (r) { return { rows: r || [] }; }, function (e) { if (e && e.status && e.status < 500) throw e; return { rows: [], partial: true }; }), offline().queued(uid).catch(function () { return []; })]).then(function (res) {
        var have = {}, list = res[0].rows.slice();
        list.forEach(function (s) { have[s.id] = 1; });
        res[1].forEach(function (e) { if (e.session.program_id === programId && !have[e.session.id]) list.push(e.session); });
        return { sessions: list, partial: !!res[0].partial };
      });
    },
    saveProgress: function (programId, rows) {
      return Promise.all(rows.map(function (r) { return B.upsert('dtt_progress', { user_id: B.userId(), program_id: programId, target_id: r.target_id, operation: r.operation, data: r.data, updated_at: new Date().toISOString() }, 'program_id,target_id,operation'); }));
    },
    // remaining: the sessions left. Those trials are what still counts toward mastery.
    deleteSession: function (programId, id, remaining) {
      return offline().unqueue(id).catch(function () { }).then(function () { return B.remove('dtt_sessions', 'id=eq.' + id); }).then(function () {
        var pr = store.progressOf(programId), keys = D.data.rebuild(pr, remaining);
        return offline().queued(B.userId()).catch(function () { return []; }).then(function (q) { setWaiting(q.length); return store.saveProgress(programId, D.data.toRows(pr, keys)); });
      });
    },
    progressOf: function (programId) { DB.progress[programId] = DB.progress[programId] || {}; return DB.progress[programId]; },
    waiting: function () { return waiting; },
    onSync: function (f) { syncListeners.push(f); },

    // a finished session: kept in this browser first, so nothing is lost if the upload fails
    recordSession: function (programId, finished) {
      DB.progress[programId] = finished.progress;
      if (D.ui && D.ui.dataStale) D.ui.dataStale(programId);
      var entry = { id: finished.session.id, userId: B.userId(), at: Date.now(), session: finished.session, rows: finished.rows };
      return offline().enqueue(entry).then(function () { setWaiting(waiting + 1); return store.flush(); });
    },
    // uploads in order. A lost connection stops the run and tries again later. Called again on reconnect.
    flush: function () {
      if (flushing || !B.userId()) return Promise.resolve();
      flushing = true;
      var uid = B.userId();
      return offline().queued(uid).then(function (q) {
        return q.reduce(function (chain, e) {
          return chain.then(function (go) {
            if (!go) return false;
            return B.commit(e.session, e.rows).then(function () { return offline().unqueue(e.id).then(function () { return true; }); }, function (err) {
              // the connection failed: stop. The server refused this one: leave it queued and try the next.
              return !(err && (err.network || !err.status || err.status >= 500));
            });
          });
        }, Promise.resolve(true));
      }).then(function () { return offline().queued(uid); }).then(function (left) {
        flushing = false;
        setWaiting(left.length);
        clearTimeout(retryT);
        if (left.length) retryT = setTimeout(store.flush, 60000);
      }, function () { flushing = false; });
    },
    // everything a session shows, ready before it starts, so it keeps running if the connection drops
    cacheImages: function (set, extra) {
      var jobs = [];
      ((set && set.items) || []).forEach(function (i) { (i.images || []).forEach(function (m) { if (m.path) jobs.push(m.path); }); });
      (extra || []).forEach(function (m) { if (m.path) jobs.push(m.path); });
      var at = 0, failed = 0;
      function worker() {
        if (at >= jobs.length) return Promise.resolve();
        var path = jobs[at++];
        return offline().getImage(path).then(function (hit) {
          return hit || B.download(path).then(function (b) { return offline().putImage(path, b); });
        }).catch(function () { failed++; }).then(worker);
      }
      return Promise.all([worker(), worker(), worker(), worker()]).then(function () { return failed; });
    },
    sets: function () { return DB.sets; },
    set: function (id) { return DB.sets.filter(function (s) { return s.id === id; })[0] || null; },
    programs: function (sid) { return sid === undefined ? DB.programs : DB.programs.filter(function (p) { return p.studentId === sid; }); },
    program: function (id) { return DB.programs.filter(function (p) { return p.id === id; })[0] || null; },
    programsUsingSet: function (setId) { return DB.programs.filter(function (p) { return p.setId === setId; }); },

    addSet: function (name) { var s = { id: P.uuid(), name: name || '', items: [] }; DB.sets.push(s); return B.upsert('dtt_sets', setToRow(s)).then(function () { return s; }, function (e) { DB.sets = DB.sets.filter(function (x) { return x !== s; }); throw e; }); },
    saveSet: function (s) {
      return B.upsert('dtt_sets', setToRow(s)).then(function () { DB.programs.forEach(function (p) { if (p.setId === s.id) P.syncQueue(p, s); }); });
    },
    deleteSet: function (s) {
      if (store.programsUsingSet(s.id).length) return Promise.reject(new Error('in_use'));
      return B.remove('dtt_sets', 'id=eq.' + s.id).then(function () {
        DB.sets = DB.sets.filter(function (x) { return x !== s; });
        (s.items || []).forEach(function (i) { store.dropImages(i.images); });
      });
    },

    addProgram: function (p) { return B.upsert('dtt_programs', progToRow(p)).then(function () { DB.programs.push(p); return p; }); },
    saveProgram: function (p) { return B.upsert('dtt_programs', progToRow(p)); },
    deleteProgram: function (p) { return B.remove('dtt_programs', 'id=eq.' + p.id).then(function () { DB.programs = DB.programs.filter(function (x) { return x !== p; }); delete DB.progress[p.id]; return store.dropQueued([p.id]); }); },
    // sessions waiting to upload for a program that no longer exists can never be saved
    dropQueued: function (programIds) {
      return offline().queued(B.userId()).then(function (q) {
        return Promise.all(q.filter(function (e) { return programIds.indexOf(e.session.program_id) >= 0; }).map(function (e) { return offline().unqueue(e.id); }));
      }).then(function () { return offline().queued(B.userId()); }).then(function (left) { setWaiting(left.length); }).catch(function () { });
    },

    student: function (sid) { if (!DB.students[sid]) DB.students[sid] = { themes: [], photos: [] }; return DB.students[sid]; },
    saveStudent: function (sid) { return B.upsert('dtt_students', { user_id: B.userId(), student_id: sid, data: store.student(sid), updated_at: new Date().toISOString() }, 'user_id,student_id'); },
    // student ids that have DTT data but no matching child profile any more
    orphanIds: function (profileIds) {
      var seen = {}, out = [];
      DB.programs.map(function (p) { return p.studentId; }).concat(Object.keys(DB.students).filter(function (k) { var v = DB.students[k]; return (v.themes || []).length || (v.photos || []).length; })).forEach(function (id) {
        if (!seen[id] && profileIds.indexOf(id) < 0) { seen[id] = 1; out.push(id); }
      });
      return out;
    },
    // removes programs, progress and sessions (they cascade), favorite themes and reinforcer photos for one student
    deleteStudentData: function (sid) {
      var e = encodeURIComponent(sid), gone = DB.programs.filter(function (p) { return p.studentId === sid; }).map(function (p) { return p.id; });
      return B.remove('dtt_programs', 'user_id=eq.' + B.userId() + '&student_id=eq.' + e).then(function () {
        return B.remove('dtt_students', 'user_id=eq.' + B.userId() + '&student_id=eq.' + e);
      }).then(function () {
        store.dropImages((DB.students[sid] && DB.students[sid].photos) || []);
        delete DB.students[sid];
        DB.programs = DB.programs.filter(function (p) { return p.studentId !== sid; });
        gone.forEach(function (id) { delete DB.progress[id]; });
        return store.dropQueued(gone);
      });
    },

    photoCount: function () { return P.countUploaded(DB.sets, Object.keys(DB.students).map(function (k) { return DB.students[k]; })); },
    photoLimit: function () { return P.photoLimit(B.allowed('dtt.photos')); },
    uploadImage: function (folder, blob) {
      var id = P.uuid(), path = B.userId() + '/' + folder + '/' + id + '.jpg';
      return B.upload(path, blob).then(function () { urls[path] = Promise.resolve(URL.createObjectURL(blob)); return { id: id, path: path }; });
    },
    // a photo can be shared (a set made from several sets, a duplicated set), so it is only deleted once nothing uses it
    dropImages: function (images) {
      var used = {};
      DB.sets.forEach(function (s) { (s.items || []).forEach(function (i) { (i.images || []).forEach(function (m) { if (m.path) used[m.path] = 1; }); }); });
      Object.keys(DB.students).forEach(function (k) { (DB.students[k].photos || []).forEach(function (m) { if (m.path) used[m.path] = 1; }); });
      (images || []).forEach(function (m) { if (m && m.path && !used[m.path]) { B.removeFile(m.path); delete urls[m.path]; } });
    },
    // the teacher's note on a finished session: on the waiting copy if it has not uploaded yet, otherwise on the saved session
    saveNote: function (sessionId, note) {
      return offline().queued(B.userId()).catch(function () { return []; }).then(function (q) {
        var e = q.filter(function (x) { return x.id === sessionId; })[0];
        if (e) { e.session.note = note; return offline().enqueue(e); }
        return B.patch('dtt_sessions', 'id=eq.' + sessionId, { note: note });
      });
    },
    imageUrl: function (m) {
      if (m.lib) return Promise.resolve(D.library.src(m.lib));
      if (!m.path) return Promise.resolve('');
      if (!urls[m.path]) urls[m.path] = offline().getImage(m.path).catch(function () { return null; }).then(function (hit) { return hit || B.download(m.path); }).then(function (b) { return URL.createObjectURL(b); }).catch(function (e) { delete urls[m.path]; throw e; });
      return urls[m.path];
    }
  };
  D.store = store;
  D.restBackend = restBackend;
})();
