/* Little Us · DTT · shared interface pieces: state, rendering, event handling, form controls, photo picking. */
(function () {
  'use strict';
  var D = window.LUDtt, X = LUTools.api, P = D.programs, T = D.i18n.T, esc = X.esc;

  var U = { view: 'programs', sec: 'targets', ptab: 'overview', programId: null, setId: null, stuSec: 'themes', menuOpen: false, wizard: null, error: false, loading: false, loadedOnce: false };
  var ACT = {}, INP = {}, VIEWS = {};
  var ui = D.ui = { U: U, ACT: ACT, INP: INP, VIEWS: VIEWS, afterRender: [] };

  function app() { return document.getElementById('dttApp'); }
  function student() { return X.prof(); }
  ui.student = student;

  /* ---------- the program or draft a form is editing ---------- */
  // a draft stays in memory while the teacher looks elsewhere (away); wiz() is the draft only while it is on screen
  function wiz() { return U.wizard && !U.wizard.away ? U.wizard : null; }
  ui.wiz = wiz;
  function ctx() { return wiz() ? U.wizard.p : D.store.program(U.programId); }
  ui.ctx = ctx;
  ui.ctxSet = function () { var p = ctx(); return p ? D.store.set(p.setId) : null; };

  /* ---------- saving: every change saves itself ---------- */
  var timers = {};
  function flash(ok) {
    var el = document.getElementById('dttSaved'); if (!el) return;
    el.textContent = ok ? T('Saved', 'Tersimpan') : T('Not saved. Check your connection.', 'Belum tersimpan. Periksa koneksi.');
    el.className = 'dtt-saved show' + (ok ? '' : ' bad');
    clearTimeout(timers.flash);
    if (ok) timers.flash = setTimeout(function () { var e = document.getElementById('dttSaved'); if (e) e.className = 'dtt-saved'; }, 1600);
  }
  function later(key, fn, ms) {
    clearTimeout(timers[key]);
    timers[key] = setTimeout(function () { fn().then(function () { flash(true); }, function () { flash(false); }); }, ms == null ? 500 : ms);
  }
  ui.touchProgram = function () {
    var p = ctx(); if (!p || wiz()) return;
    later('p' + p.id, function () { return D.store.saveProgram(p); });
  };
  ui.touchSet = function (s) { later('s' + s.id, function () { return D.store.saveSet(s); }); };
  ui.touchStudent = function (sid) { later('st' + sid, function () { return D.store.saveStudent(sid); }); };
  ui.savedSlot = function () { return '<span class="dtt-saved" id="dttSaved" role="status" aria-live="polite"></span>'; };

  /* ---------- rendering ---------- */
  function focusKey(el) {
    if (!el || !el.dataset || !app() || !app().contains(el)) return null;
    var d = el.dataset, names = ['a', 'in', 'k', 'v', 'id'], sel = '';
    names.forEach(function (n) { if (d[n] != null) sel += '[data-' + n + '="' + String(d[n]).replace(/["\\]/g, '\\$&') + '"]'; });
    return sel || null;
  }
  function hydrate(root) {
    root.querySelectorAll('img[data-img]').forEach(function (img) {
      var raw = img.getAttribute('data-img'), m = raw.indexOf('lib:') === 0 ? { lib: raw.slice(4) } : { path: raw.slice(5) };
      D.store.imageUrl(m).then(function (u) { if (u) img.src = u; }, function () { img.classList.add('dtt-imgfail'); });
    });
  }
  ui.hydrate = hydrate;
  function render() {
    var el = app(); if (!el) return;
    if (U.wizard && student() && U.wizard.p.studentId !== student().id) U.wizard = null;
    if (U.view === 'program') { var cur = D.store.program(U.programId); if (!cur || !student() || cur.studentId !== student().id) U.view = 'programs'; }
    if (U.view === 'set' && !D.store.set(U.setId)) U.view = 'sets';
    var fk = focusKey(document.activeElement), y = window.scrollY;
    el.innerHTML = page();
    hydrate(el);
    ui.afterRender.forEach(function (f) { f(el); });
    if (fk) { var again = el.querySelector(fk); if (again && again.focus) again.focus({ preventScroll: true }); }
    window.scrollTo(0, y);
  }
  ui.render = render;
  function page() {
    if (!D.store.userId()) return gate(T('Sign in to use Discrete Trial Teaching', 'Masuk untuk memakai Discrete Trial Teaching'),
      T('Programs, photos and session data are saved privately in your account, so they stay with you on every device. A free account is enough to start.', 'Program, foto, dan data session disimpan secara privat di akunmu, sehingga bisa dibuka di semua perangkatmu. Akun gratis sudah cukup untuk memulai.'),
      '<a class="tl-btn primary" href="#/login">' + esc(T('Log in', 'Masuk')) + '</a><a class="tl-btn outline" href="#/signup">' + esc(T('Create a free account', 'Buat akun gratis')) + '</a>');
    if (!student()) return gate(T('Add a child first', 'Tambahkan anak dulu'),
      T('Each program belongs to a child in your Little Us profiles. Add one, then come back here.', 'Setiap program terhubung dengan profil anak di Little Us. Tambahkan dulu, lalu kembali ke sini.'),
      '<a class="tl-btn primary" href="#/tools/setup?new=1">' + esc(T('Add a child', 'Tambah anak')) + '</a>');
    if (U.resume) return resumeCard(U.resume);
    if (U.error) return gate(T('We could not open your programs', 'Program belum bisa dibuka'),
      T('Check your connection and try again. Creating and editing programs needs internet.', 'Periksa koneksi lalu coba lagi. Membuat dan mengubah program perlu internet.'),
      '<button type="button" class="tl-btn primary" data-a="retry">' + esc(T('Try again', 'Coba lagi')) + '</button>');
    if (!D.store.isLoaded()) { start(); return '<div class="dtt-loading" role="status">' + esc(T('Opening your programs...', 'Membuka program...')) + '</div>'; }
    return X.topbar(T('Discrete Trial Teaching', 'Discrete Trial Teaching'), T('For ' + student().name, 'Untuk ' + student().name)) + ui.menuButton() +
      '<div class="dtt-shell"><div class="dtt-sidewrap' + (U.menuOpen ? ' open' : '') + '">' + ui.sidebar() + '</div><div class="dtt-mainc">' + ui.savedSlot() + (VIEWS[wiz() ? 'wizard' : U.view] || VIEWS.programs)() + '</div></div>';
  }
  function gate(h, p, btns) {
    return X.topbar(T('Discrete Trial Teaching', 'Discrete Trial Teaching'), '', { noProf: true }) +
      '<div class="dtt-gate tl-panel pad"><h2 class="tl-h2">' + esc(h) + '</h2><p class="tl-p">' + esc(p) + '</p><div class="dtt-rowbtns">' + btns + '</div></div>';
  }
  // works offline too: everything it needs is in the saved session
  function resumeCard(snap) {
    var n = snap.st.trials.filter(function (t) { return D.errorCorrection.counted(t.kind); }).length;
    return gate(T('A session was interrupted', 'Ada %session% yang terhenti'),
      T(snap.program.name + ': ' + n + ' of ' + snap.st.total + ' trials done. You can pick up where it stopped, or discard it.', snap.program.name + ': ' + n + ' dari ' + snap.st.total + ' trial selesai. Kamu bisa melanjutkan dari titik terakhir, atau membuangnya.'),
      '<button type="button" class="tl-btn primary" data-a="resumeGo">' + esc(T('Resume', 'Lanjutkan')) + '</button><button type="button" class="tl-link dtt-danger" data-a="resumeDrop" data-confirm="' + esc(T('Tap again to discard it', 'Ketuk lagi untuk membuang')) + '">' + esc(T('Discard', 'Buang')) + '</button>');
  }
  ACT.resumeGo = function () { D.session.resumeFrom(U.resume); };
  ACT.resumeDrop = function () { D.session.discard(); };
  ui.syncBadge = function () {
    var n = D.store.waiting();
    return n ? '<p class="dtt-syncbadge" role="status">' + esc(T(n + (n === 1 ? ' session' : ' sessions') + ' will sync when online.', n + ' %session% akan disinkronkan saat online.')) + '</p>' : '';
  };
  function start() {
    if (U.loading) return;
    U.loading = true; U.error = false;
    D.store.load().then(function () { U.loading = false; render(); }, function () { U.loading = false; U.error = true; render(); });
  }
  ACT.retry = function () { U.error = false; render(); };

  /* ---------- events ---------- */
  function onClick(e) {
    var b = e.target.closest('[data-a]'); if (!b || !app().contains(b) || b.disabled) return;
    if (b.hasAttribute('data-confirm') && !confirmed(b)) return;
    // a sidebar choice sets the draft aside, unless it is one of the wizard's own steps
    if (b.hasAttribute('data-nav')) { U.menuOpen = false; if (U.wizard && !b.hasAttribute('data-keepwiz')) U.wizard.away = true; }
    var fn = ACT[b.dataset.a]; if (fn) { e.preventDefault(); fn(b, e); }
  }
  // destructive buttons ask once on the button itself (design guidelines, section 5)
  function confirmed(b) {
    if (b.dataset.sure) return true;
    var old = b.innerHTML;
    b.dataset.sure = '1'; b.textContent = b.getAttribute('data-confirm');
    setTimeout(function () { if (b.isConnected) { delete b.dataset.sure; b.innerHTML = old; } }, 4000);
    return false;
  }
  function onInput(e) { var el = e.target, fn = el.dataset && INP[el.dataset.in]; if (fn && e.type === (el.dataset.on || 'input')) fn(el, e); }
  ui.bind = function (el) { el.addEventListener('click', onClick); el.addEventListener('input', onInput); el.addEventListener('change', onInput); };

  /* ---------- controls: the reference app's control types, in Little Us classes ---------- */
  ui.opt = function (title, desc, html) {
    return '<div class="dtt-opt">' + (title ? '<h3 class="dtt-optt">' + esc(title) + '</h3>' : '') + (desc ? '<p class="dtt-optd">' + esc(desc) + '</p>' : '') + html + '</div>';
  };
  // opts: [value, label] or [value, label, description]; cards turns them into option cards
  ui.seg = function (key, cur, opts, cards) {
    if (cards) return '<div class="dtt-cards" role="group">' + opts.map(function (o) {
      var on = String(cur) === String(o[0]);
      return '<button type="button" class="dtt-card' + (on ? ' on' : '') + '" aria-pressed="' + on + '" data-a="set" data-k="' + key + '" data-v="' + esc(o[0]) + '"><b>' + esc(o[1]) + '</b>' + (o[2] ? '<small>' + esc(o[2]) + '</small>' : '') + '</button>';
    }).join('') + '</div>';
    return '<div class="tl-seg dtt-seg" role="group">' + opts.map(function (o) {
      var on = String(cur) === String(o[0]);
      return '<button type="button" class="' + (on ? 'on' : '') + '" aria-pressed="' + on + '" data-a="set" data-k="' + key + '" data-v="' + esc(o[0]) + '">' + esc(o[1]) + '</button>';
    }).join('') + '</div>';
  };
  ui.sw = function (key, on, title, desc, action) {
    return '<button type="button" class="dtt-switch" role="switch" aria-checked="' + !!on + '" data-a="' + (action || 'tog') + '" data-k="' + esc(key) + '"><span class="tl-tog" aria-hidden="true"></span><span class="dtt-swtx"><b>' + esc(title) + '</b>' + (desc ? '<small>' + esc(desc) + '</small>' : '') + '</span></button>';
  };
  ui.stepper = function (key, val, unit, max) {
    var r = D.defaults.RANGES[key], top = max == null ? r[1] : Math.min(max, r[1]);
    return '<div class="dtt-stepper"><button type="button" class="tl-iconbtn" data-a="step" data-k="' + key + '" data-v="-1" aria-label="' + esc(T('Less', 'Kurangi')) + '"' + (val <= r[0] ? ' disabled' : '') + '>−</button>' +
      '<output aria-live="polite"><b>' + val + '</b>' + (unit ? ' <span>' + esc(unit) + '</span>' : '') + '</output>' +
      '<button type="button" class="tl-iconbtn" data-a="step" data-k="' + key + '" data-v="1" aria-label="' + esc(T('More', 'Tambah')) + '"' + (val >= top ? ' disabled' : '') + '>+</button></div>';
  };
  ui.field = function (label, value, attrs, placeholder) {
    return '<label class="tl-field"><span>' + esc(label) + '</span><input type="text" value="' + esc(value == null ? '' : value) + '" ' + attrs + (placeholder ? ' placeholder="' + esc(placeholder) + '"' : '') + '></label>';
  };
  ui.area = function (label, value, attrs, rows) {
    return '<label class="tl-field dtt-area"><span>' + esc(label) + '</span><textarea rows="' + (rows || 4) + '" ' + attrs + '>' + esc(value == null ? '' : value) + '</textarea></label>';
  };
  ui.tip = function (txt) { return '<p class="tl-tip dtt-tip">' + esc(txt) + '</p>'; };
  ui.img = function (m, label) {
    var ref = m && m.lib ? 'lib:' + m.lib : m && m.path ? 'path:' + m.path : '';
    if (!ref) return '<span class="dtt-noimg" aria-hidden="true"></span>';
    return '<img alt="' + esc(label || '') + '" data-img="' + esc(ref) + '">';
  };

  /* ---------- changing a setting ---------- */
  ACT.set = function (b) {
    var p = ctx(), k = b.dataset.k, v = b.dataset.v; if (!p) return;
    if (k === 'type') { p.type = v; ui.touchProgram(); render(); return; }
    if (P.setValue(p.settings, k, v)) { ui.touchProgram(); render(); }
  };
  ACT.tog = function (b) { var p = ctx(), k = b.dataset.k; if (!p) return; p.settings[k] = !p.settings[k]; ui.touchProgram(); render(); };
  ACT.step = function (b) {
    var p = ctx(), k = b.dataset.k, d = Number(b.dataset.v); if (!p) return;
    if (k === 'activeCount') { var r = D.defaults.RANGES.activeCount; p.activeCount = Math.max(r[0], Math.min(r[1], p.activeCount + d)); }
    else P.setValue(p.settings, k, p.settings[k] + d);
    ui.touchProgram(); render();
  };
  INP.txt = function (el) { var p = ctx(); if (!p) return; p.settings[el.dataset.k] = el.value; ui.touchProgram(); };

  /* ---------- photos ---------- */
  function photoError(e) {
    var c = e && e.message;
    X.toast(c === 'too_big' ? T('That file is over 50 MB. Try a smaller one.', 'File itu lebih dari 50 MB. Coba file yang lebih kecil.') :
      c === 'unreadable' ? T('We could not open that photo. Try a JPEG or PNG.', 'Foto itu tidak bisa dibuka. Coba JPEG atau PNG.') :
      c === 'heic' ? T('We could not open that iPhone photo. Check your connection and try again, or try a JPEG or PNG.', 'Foto iPhone itu tidak bisa dibuka. Periksa koneksi lalu coba lagi, atau coba JPEG atau PNG.') :
      c === 'still_big' ? T('We could not make that photo small enough. Try another one.', 'Foto itu tidak bisa diperkecil lagi. Coba foto lain.') :
      T('The photo did not upload. Check your connection and try again.', 'Foto belum terunggah. Periksa koneksi lalu coba lagi.'));
  }
  ui.photoRoom = function (n) {
    var used = D.store.photoCount(), lim = D.store.photoLimit();
    if (used + (n || 1) <= lim) return true;
    if (lim < D.defaults.PHOTO.maxLimit && window.LUAcc) LUAcc.lockSheet('dtt.photos');
    else X.toast(T('You have reached the limit of 500 photos. Remove some to add more.', 'Batas 500 foto sudah tercapai. Hapus beberapa untuk menambah.'));
    return false;
  };
  ui.photoError = photoError;
  // one file: lets the teacher choose the square. Calls done(blob).
  ui.cropper = function (file, done) {
    D.photo.open(file).then(function (img) {
      var st = { x: 0.5, y: 0.5, zoom: 1 }, sh = X.sheet('<div class="tl-sheethead"><h2>' + esc(T('Choose the square', 'Pilih bagian foto')) + '</h2></div>' +
        '<canvas class="dtt-crop" width="320" height="320" tabindex="0" aria-label="' + esc(T('Photo preview. Use the arrow keys to move it.', 'Pratinjau foto. Gunakan tombol panah untuk menggeser.')) + '"></canvas>' +
        '<label class="tl-field"><span>' + esc(T('Zoom', 'Perbesar')) + '</span><input class="tl-range" type="range" min="1" max="3" step="0.05" value="1" data-zoom></label>' +
        '<div class="tl-sheetfoot"><button type="button" class="tl-btn outline" data-no>' + esc(T('Cancel', 'Batal')) + '</button><button type="button" class="tl-btn primary" data-yes>' + esc(T('Use this photo', 'Pakai foto ini')) + '</button></div>');
      var cv = sh.el.querySelector('canvas'), g = cv.getContext('2d');
      function paint() { g.drawImage(D.photo.draw(img, st, 320), 0, 0); }
      paint();
      function nudge(dx, dy) {
        var r = D.compress.cropRect(img.naturalWidth, img.naturalHeight, st), roomX = img.naturalWidth - r.side, roomY = img.naturalHeight - r.side;
        if (roomX > 0) st.x = Math.max(0, Math.min(1, st.x - dx * (r.side / 320) / roomX));
        if (roomY > 0) st.y = Math.max(0, Math.min(1, st.y - dy * (r.side / 320) / roomY));
        paint();
      }
      var last = null;
      cv.addEventListener('pointerdown', function (e) { last = [e.clientX, e.clientY]; cv.setPointerCapture(e.pointerId); });
      cv.addEventListener('pointermove', function (e) { if (!last) return; var k = 320 / cv.getBoundingClientRect().width; nudge((e.clientX - last[0]) * k, (e.clientY - last[1]) * k); last = [e.clientX, e.clientY]; });
      cv.addEventListener('pointerup', function () { last = null; });
      cv.addEventListener('keydown', function (e) { var m = { ArrowLeft: [16, 0], ArrowRight: [-16, 0], ArrowUp: [0, 16], ArrowDown: [0, -16] }[e.key]; if (m) { e.preventDefault(); nudge(m[0], m[1]); } });
      sh.el.querySelector('[data-zoom]').oninput = function () { st.zoom = Number(this.value); paint(); };
      sh.el.querySelector('[data-no]').onclick = sh.close;
      sh.el.querySelector('[data-yes]').onclick = function () {
        this.disabled = true;
        D.photo.compress(img, st).then(function (blob) { sh.close(); done(blob); }, function (e) { sh.close(); photoError(e); });
      };
    }, photoError);
  };
})();
