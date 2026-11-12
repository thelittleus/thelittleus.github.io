/* Little Us · DTT · trying the tool without an account.
   Signed out, everything is kept in this browser only (IndexedDB lu-dtt-guest): sets, programs, progress, sessions and photos.
   On signing in, that work moves to the account and is removed from the browser. Free accounts hold 2 programs, so any
   program over the limit stays in the browser and moves later, after Plus. */
(function () {
  'use strict';
  var D = window.LUDtt, X = LUTools.api, T = D.i18n.T, esc = X.esc;
  var TABLES = ['dtt_sets', 'dtt_programs', 'dtt_students', 'dtt_progress', 'dtt_sessions'];
  var dbp = null;
  function db() {
    if (!dbp) dbp = new Promise(function (res, rej) {
      var r = indexedDB.open('lu-dtt-guest', 1);
      r.onupgradeneeded = function () { r.result.createObjectStore('rows'); r.result.createObjectStore('files'); };
      r.onsuccess = function () { res(r.result); };
      r.onerror = function () { dbp = null; rej(r.error); };
    });
    return dbp;
  }
  function run(store, mode, fn) {
    return db().then(function (d) {
      return new Promise(function (res, rej) {
        var tx = d.transaction(store, mode), req = fn(tx.objectStore(store)), out;
        if (req) req.onsuccess = function () { out = req.result; };
        tx.oncomplete = function () { res(out); };
        tx.onerror = tx.onabort = function () { rej(tx.error); };
      });
    });
  }
  var rows = null;
  function all() {
    if (rows) return Promise.resolve(rows);
    return Promise.all(TABLES.map(function (t) { return run('rows', 'readonly', function (s) { return s.get(t); }); })).then(function (r) {
      rows = {}; TABLES.forEach(function (t, i) { rows[t] = r[i] || []; }); return rows;
    });
  }
  function put(t) { return run('rows', 'readwrite', function (s) { return s.put(rows[t], t); }); }
  function copy(x) { return JSON.parse(JSON.stringify(x)); }
  function keysFor(t, conflict) { return conflict === 'user_id,student_id' ? ['student_id'] : conflict === 'program_id,target_id,operation' ? ['program_id', 'target_id', 'operation'] : ['id']; }

  var guest = {
    guest: true,
    userId: function () { return 'guest'; },
    allowed: function () { return false; },
    list: function (t) { return all().then(function (r) { return copy(r[t] || []); }); },
    upsert: function (t, row, conflict) {
      return all().then(function (r) {
        var k = keysFor(t, conflict);
        r[t] = r[t].filter(function (x) { return !k.every(function (n) { return x[n] === row[n]; }); }).concat([copy(row)]);
        return put(t);
      });
    },
    remove: function (t, filter) {
      return all().then(function (r) {
        var m = /(?:^|&)(id|student_id)=eq\.([^&]+)/.exec(filter);
        if (m) r[t] = r[t].filter(function (x) { return String(x[m[1]]) !== decodeURIComponent(m[2]); });
        // programs take their progress and sessions with them, as on the server
        if (t === 'dtt_programs') {
          var ids = r.dtt_programs.map(function (p) { return p.id; });
          ['dtt_progress', 'dtt_sessions'].forEach(function (u) { r[u] = r[u].filter(function (x) { return ids.indexOf(x.program_id) >= 0; }); });
          return Promise.all([put('dtt_programs'), put('dtt_progress'), put('dtt_sessions')]);
        }
        return put(t);
      });
    },
    patch: function (t, filter, fields) {
      return all().then(function (r) {
        var m = /id=eq\.([^&]+)/.exec(filter); if (!m) return;
        r[t].forEach(function (x) { if (String(x.id) === decodeURIComponent(m[1])) Object.assign(x, copy(fields)); });
        return put(t);
      });
    },
    upload: function (path, blob) { return run('files', 'readwrite', function (s) { return s.put(blob, path); }); },
    download: function (path) { return run('files', 'readonly', function (s) { return s.get(path); }).then(function (b) { if (!b) throw new Error('missing'); return b; }); },
    removeFile: function (path) { return run('files', 'readwrite', function (s) { return s.delete(path); }).catch(function () { }); },
    listSessions: function (id) { return all().then(function (r) { return copy(r.dtt_sessions.filter(function (s) { return s.program_id === id; })); }); },
    commit: function (session, progress) {
      return all().then(function (r) {
        if (r.dtt_sessions.some(function (x) { return x.id === session.id; })) return false;
        r.dtt_sessions.push(copy(session));
        progress.forEach(function (p) {
          r.dtt_progress = r.dtt_progress.filter(function (x) { return !(x.program_id === session.program_id && x.target_id === p.target_id && x.operation === p.operation); });
          r.dtt_progress.push({ user_id: 'guest', program_id: session.program_id, target_id: p.target_id, operation: p.operation, data: copy(p.data) });
        });
        return Promise.all([put('dtt_sessions'), put('dtt_progress')]).then(function () { return true; });
      });
    }
  };
  D.guestBackend = guest;
  function hasWork(r) { return !!(r.dtt_programs.length || r.dtt_sets.length || r.dtt_students.some(function (s) { return s.data && ((s.data.photos || []).length || (s.data.themes || []).length); })); }

  /* ---------- moving the browser's work into the account ---------- */
  function moveToAccount() {
    var rest = D.restBackend, uid = rest.userId(), r;
    return all().then(function (x) {
      r = x; if (!hasWork(r)) return null;
      var kids = X.S().profiles.map(function (p) { return p.id; }), cur = X.prof();
      function kidId(id) { return kids.indexOf(id) >= 0 || !cur ? id : cur.id; }
      var paths = {}, lostPhotos = 0;
      // a photo gets a new home under the account's folder
      function movePhoto(m) {
        if (!m || !m.path || paths[m.path]) { if (m && paths[m.path]) m.path = paths[m.path]; return Promise.resolve(); }
        var old = m.path, to = uid + '/' + old.split('/').slice(1).join('/');
        return guest.download(old).then(function (b) { return rest.upload(to, b); }).then(function () { paths[old] = to; m.path = to; }, function () { lostPhotos++; delete m.path; });
      }
      function seq(list, fn) { return list.reduce(function (c, x) { return c.then(function () { return fn(x); }); }, Promise.resolve()); }
      var keptPrograms = [], movedPrograms = [];
      return seq(r.dtt_sets, function (row) {
        var items = (row.data && row.data.items) || [];
        return seq(items, function (it) { return seq(it.images || [], movePhoto); }).then(function () {
          items.forEach(function (it) { it.images = (it.images || []).filter(function (m) { return m.path || m.lib; }); });
          return rest.upsert('dtt_sets', Object.assign({}, row, { user_id: uid, updated_at: new Date().toISOString() }));
        });
      }).then(function () {
        return seq(r.dtt_students, function (row) {
          var d = row.data || {};
          return seq(d.photos || [], movePhoto).then(function () {
            d.photos = (d.photos || []).filter(function (m) { return m.path; });
            return rest.upsert('dtt_students', { user_id: uid, student_id: kidId(row.student_id), data: d, updated_at: new Date().toISOString() }, 'user_id,student_id');
          });
        });
      }).then(function () {
        return seq(r.dtt_programs, function (row) {
          return rest.upsert('dtt_programs', Object.assign({}, row, { user_id: uid, student_id: kidId(row.student_id), updated_at: new Date().toISOString() })).then(function () {
            movedPrograms.push(row.id);
            var sess = r.dtt_sessions.filter(function (s) { return s.program_id === row.id; }).sort(function (a, b) { return String(a.started_at).localeCompare(String(b.started_at)); });
            return seq(sess, function (s) { return rest.commit(Object.assign({}, s, { student_id: kidId(s.student_id) }), []); }).then(function () {
              return seq(r.dtt_progress.filter(function (p) { return p.program_id === row.id; }), function (p) {
                return rest.upsert('dtt_progress', { user_id: uid, program_id: p.program_id, target_id: p.target_id, operation: p.operation, data: p.data, updated_at: new Date().toISOString() }, 'program_id,target_id,operation');
              });
            });
          }, function (e) {
            if (e && /dtt_program_limit/.test((e.data && e.data.message) || e.message || '')) { keptPrograms.push(row.id); return; }
            throw e;
          });
        });
      }).then(function () {
        // what moved leaves the browser; programs over the free limit stay (with their sets) for later
        var keepSets = r.dtt_programs.filter(function (p) { return keptPrograms.indexOf(p.id) >= 0; }).map(function (p) { return p.set_id; });
        r.dtt_programs = r.dtt_programs.filter(function (p) { return keptPrograms.indexOf(p.id) >= 0; });
        r.dtt_sessions = r.dtt_sessions.filter(function (s) { return keptPrograms.indexOf(s.program_id) >= 0; });
        r.dtt_progress = r.dtt_progress.filter(function (s) { return keptPrograms.indexOf(s.program_id) >= 0; });
        r.dtt_sets = r.dtt_sets.filter(function (s) { return keepSets.indexOf(s.id) >= 0; });
        r.dtt_students = [];
        return Promise.all(TABLES.map(put)).then(function () {
          if (!keptPrograms.length) return run('files', 'readwrite', function (s) { return s.clear(); });
        }).then(function () { return { moved: movedPrograms.length, kept: keptPrograms.length, lostPhotos: lostPhotos }; });
      });
    });
  }

  /* ---------- which backend: the account when signed in, otherwise this browser ---------- */
  var mode = null, moving = false;
  function signedIn() { return !!(window.LUAcc && LUAcc.signedIn && LUAcc.signedIn()); }
  function pick() {
    var want = signedIn() ? 'account' : 'guest';
    if (want === mode || moving) return;
    mode = want;
    if (want === 'guest') { D.store.setBackend(guest); D.ui.render(); return; }
    D.store.setBackend(D.restBackend);
    moving = true;
    moveToAccount().then(function (res) {
      moving = false; D.store.setBackend(D.restBackend); D.ui.render();
      if (!res) return;
      if (res.kept) X.toast(T(res.kept + (res.kept === 1 ? ' program stays' : ' programs stay') + ' on this device: free accounts hold ' + D.defaults.FREE_PROGRAMS + '. With Little Us Plus they move to your account.', res.kept + ' program tetap di perangkat ini: akun gratis menyimpan ' + D.defaults.FREE_PROGRAMS + '. Dengan Little Us Plus, program itu pindah ke akunmu.'));
      else X.toast(T('Your work from this device is now saved in your account.', 'Pekerjaanmu dari perangkat ini sekarang tersimpan di akunmu.'));
      if (res.lostPhotos) X.toast(T(res.lostPhotos + ' photos could not be moved. Add them again where a picture is missing.', res.lostPhotos + ' foto tidak bisa dipindahkan. Tambahkan lagi di tempat gambarnya kosong.'));
    }, function () {
      moving = false; D.store.setBackend(D.restBackend); D.ui.render();
      X.toast(T('Your work on this device could not move to your account yet. It will try again next time.', 'Pekerjaanmu di perangkat ini belum bisa dipindah ke akun. Akan dicoba lagi lain kali.'));
    });
  }
  D.guest = { pick: pick, moving: function () { return moving; } };

  /* ---------- the sign-in popup and the line shown while signed out ---------- */
  function loginUrl(page) { try { sessionStorage.setItem('lu_after_login', JSON.stringify('#/dtt')); } catch (e) { } return '/#/' + page; }
  D.ui.signIn = function () {
    var sh = X.sheet(D.ui.dlg({ title: T('Sign in to save your work', 'Masuk agar pekerjaanmu tersimpan'), cls: 'dtt-login',
      body: '<p class="dtt-dlgp">' + esc(T('Programs, pictures and session results are saved to your account, so nothing is lost and you can open them on any device. A free account is enough.', 'Program, gambar, dan hasil sesi disimpan di akunmu, jadi tidak ada yang hilang dan bisa dibuka di perangkat mana saja. Akun gratis sudah cukup.')) + '</p>' +
        '<div class="dtt-stack"><a class="dtt-btn primary block" href="' + loginUrl('login') + '">' + esc(T('Log In', 'Masuk')) + '</a><a class="dtt-btn sec block" href="' + loginUrl('signup') + '">' + esc(T('Create a Free Account', 'Buat Akun Gratis')) + '</a>' +
        '<button type="button" class="dtt-linkbtn center" data-x>' + esc(T('Not now, keep it on this device', 'Nanti saja, simpan di perangkat ini')) + '</button></div>' }));
    sh.el.addEventListener('click', function (e) { if (e.target.closest('[data-x]')) sh.close(); });
  };
  D.ui.guestLine = function () {
    if (!D.store.guest()) return '';
    return '<div class="dtt-guestline" role="note"><span>' + esc(T('Not signed in. Your work is saved on this device only.', 'Belum masuk. Pekerjaanmu hanya tersimpan di perangkat ini.')) + '</span><button type="button" class="dtt-btn sm" data-a="signIn">' + esc(T('Sign in', 'Masuk')) + '</button></div>';
  };
  D.ui.ACT.signIn = function () { D.ui.signIn(); };
  // offered once each visit, when the page opens signed out
  D.guest.offer = function () {
    if (signedIn()) return;
    try { if (sessionStorage.getItem('lu_dtt_asked')) return; sessionStorage.setItem('lu_dtt_asked', '1'); } catch (e) { }
    D.ui.signIn();
  };
})();
