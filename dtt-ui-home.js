/* Little Us · DTT · the main views: the program list, one program (Setup and Data), and Settings (the student and this device). */
(function () {
  'use strict';
  var D = window.LUDtt, X = LUTools.api, P = D.programs, DEF = D.defaults, T = D.i18n.T, esc = X.esc, ui = D.ui, U = ui.U, ACT = ui.ACT, INP = ui.INP;
  var TYPE_TINT = { listener: '#DCEBFA', tact: '#E9E1F7', mixed: '#FFE9DA', matching: '#DDF2E4', sorting: '#FFF1C7', pattern: '#FBE0E6' };
  ui.typeShort = function (t) { return { listener: 'Listener', tact: 'Tact', mixed: T('Mixed', 'Mixed'), matching: 'Matching', sorting: T('Sorting', 'Mengelompokkan'), pattern: T('Pattern', 'Pola') }[t] || t; };
  function pill(t) { return '<span class="dtt-pill" style="background:' + (TYPE_TINT[t] || '#F3EEE6') + '">' + esc(ui.typeShort(t)) + '</span>'; }

  // how far each target is: mastered, learning now, waiting
  function counts(p) {
    var c = { mastered: 0, learning: 0, waiting: 0 }, op = DEF.OPS[p.type][0];
    p.queue.forEach(function (id) { var st = ui.targetStatus(p, id, op); c[st === 'mastered' || st === 'maintenance' ? 'mastered' : st === 'waiting' ? 'waiting' : 'learning']++; });
    return c;
  }
  function bar(c) {
    var n = c.mastered + c.learning + c.waiting; if (!n) return '<span class="dtt-bar" aria-hidden="true"><i class="w" style="flex:1"></i></span>';
    return '<span class="dtt-bar" aria-hidden="true">' + (c.mastered ? '<i class="m" style="flex:' + c.mastered + '"></i>' : '') + (c.learning ? '<i class="l" style="flex:' + c.learning + '"></i>' : '') + (c.waiting ? '<i class="w" style="flex:' + c.waiting + '"></i>' : '') + '</span>';
  }
  function tile(p, set) {
    var its = ((set && set.items) || []).slice(0, 4);
    return '<span class="dtt-ptile" style="background:' + (TYPE_TINT[p.type] || '#F3EEE6') + '" aria-hidden="true">' + its.map(function (i) { return '<span>' + ui.img(i.images[0], '') + '</span>'; }).join('') + '</span>';
  }
  function freeNote() {
    if (D.store.allowed('dtt.programs')) return '';
    var n = D.store.programs().length;
    return '<p class="dtt-hint">' + esc(T(n + ' of ' + DEF.FREE_PROGRAMS + ' free programs', n + ' dari ' + DEF.FREE_PROGRAMS + ' program gratis')) + '</p>';
  }

  /* ---------- Programs ---------- */
  function viewPrograms() {
    var kid = ui.student(), list = D.store.programs(kid.id);
    if (!list.length) return ui.syncBadge() + '<div class="dtt-empty dtt-first"><div class="dtt-firstart" aria-hidden="true">' + D.themes.chosen(['space'])[0].characters.slice(0, 3).map(function (c) { return D.themes.svg(c, 'dtt-char'); }).join('') + '</div>' +
      '<h1 class="dtt-h1">' + esc(T('Make ' + kid.name + '\'s First Program', 'Buat Program Pertama ' + kid.name)) + '</h1><p class="dtt-p">' + esc(T('Takes about a minute.', 'Hanya sekitar satu menit.')) + '</p>' +
      '<button type="button" class="dtt-btn primary" data-a="newProgram">' + esc(T('+ New Program', '+ Program Baru')) + '</button>' + freeNote() + '</div>';
    return ui.syncBadge() + '<div class="dtt-pagehead"><h1 class="dtt-h1">' + esc(T('Programs', 'Program')) + '</h1><div class="dtt-headr">' + freeNote() + '<button type="button" class="dtt-btn primary" data-a="newProgram">' + esc(T('+ New Program', '+ Program Baru')) + '</button></div></div>' +
      '<div class="dtt-plist">' + list.map(function (p) {
        var set = D.store.set(p.setId), c = counts(p), ready = !P.issues(p, set).length;
        return '<div class="dtt-prow"><button type="button" class="dtt-prowopen" data-a="openProgram" data-id="' + p.id + '" aria-label="' + esc(T('Open ', 'Buka ') + (p.name || '')) + '"></button>' + tile(p, set) +
          '<div class="dtt-pinfo"><b class="dtt-pname">' + esc(p.name || T('Unnamed program', 'Program tanpa nama')) + '</b><span class="dtt-pmeta">' + pill(p.type) + '<span>' + esc((set ? (set.name || T('Unnamed set', 'Set tanpa nama')) + ' · ' : '') + T(c.learning + ' learning · ' + c.mastered + ' mastered', c.learning + ' dipelajari · ' + c.mastered + ' %mastered%')) + '</span></span></div>' +
          bar(c) +
          (ready ? '<button type="button" class="dtt-btn sm" data-a="practice" data-id="' + p.id + '">' + esc(T('Practice', 'Latihan')) + '</button><button type="button" class="dtt-btn primary sm" data-a="startSession" data-id="' + p.id + '">▶ ' + esc(T('Start Session', 'Mulai Session')) + '</button>'
            : '<span class="dtt-chip warn">' + esc(T('Needs setup', 'Perlu dilengkapi')) + '</span>') +
          '<span class="dtt-chev" aria-hidden="true">›</span></div>';
      }).join('') + '</div>' +
      '<div class="dtt-legend"><span><i class="m"></i>' + esc(T('Mastered', '%mastered%')) + '</span><span><i class="l"></i>' + esc(T('Learning', 'Dipelajari')) + '</span><span><i class="w"></i>' + esc(T('Waiting', 'Menunggu')) + '</span></div>';
  }
  ACT.openProgram = function (b) { U.programId = b.dataset.id; U.view = 'program'; U.ptab = 'setup'; ui.render(); window.scrollTo(0, 0); };
  ACT.startSession = function (b) { D.session.start(D.store.program(b.dataset.id)); };
  ACT.practice = function (b) { D.session.start(D.store.program(b.dataset.id), { practice: true }); };

  /* ---------- one program ---------- */
  ui.targetStatus = function (p, id, op) {
    var pr = D.store.progressOf(p.id), ps = pr[D.targets.key(id, op)];
    if (ps && ps.masteredAt) return ps.retentionDue ? 'mastered' : 'maintenance';
    if (D.mastery.needsAttention(ps)) return 'attention';
    return D.targets.active(p, pr, op).indexOf(id) >= 0 ? 'learning' : 'waiting';
  };
  ui.statusName = function (st) { return { mastered: T('Mastered', '%mastered%'), maintenance: T('Maintenance', '%maintenance%'), attention: T('Needs attention', 'Perlu perhatian'), learning: T('Learning', 'Dipelajari'), waiting: T('Waiting', 'Menunggu') }[st]; };
  ui.statusChips = function (p, id) {
    var ops = DEF.OPS[p.type];
    return ops.map(function (op) {
      var st = ui.targetStatus(p, id, op), pre = ops.length > 1 ? (op === 'listener' ? 'Listener: ' : 'Tact: ') : '';
      return '<span class="dtt-chip ' + st + '">' + esc(pre + ui.statusName(st)) + '</span>';
    }).join(' ');
  };
  function viewProgram() {
    var p = D.store.program(U.programId), set = D.store.set(p.setId), probs = P.issues(p, set), ready = !probs.length;
    P.syncQueue(p, set);
    if (U.ptab !== 'data') U.ptab = 'setup';
    return '<button type="button" class="dtt-back" data-a="tab" data-v="programs">‹ ' + esc(T('Programs', 'Program')) + '</button>' +
      '<div class="dtt-pagehead"><div class="dtt-titlewrap"><h1 class="dtt-h1">' + esc(p.name || T('Unnamed program', 'Program tanpa nama')) + '</h1><span class="dtt-pmeta">' + pill(p.type) + (set ? '<span>' + esc(set.name || T('Unnamed set', 'Set tanpa nama')) + '</span>' : '') + '</span></div>' +
      '<div class="dtt-headr"><button type="button" class="dtt-btn" data-a="practice" data-id="' + p.id + '"' + (ready ? '' : ' disabled') + '>' + esc(T('Practice', 'Latihan')) + '<small>' + esc(T('Not recorded', 'Tidak dicatat')) + '</small></button>' +
      '<button type="button" class="dtt-btn primary" data-a="startSession" data-id="' + p.id + '"' + (ready ? '' : ' disabled') + '>▶ ' + esc(T('Start Real Session', 'Mulai Session')) + '</button></div></div>' +
      '<div class="dtt-tabs" role="tablist"><button type="button" role="tab" aria-selected="' + (U.ptab === 'setup') + '" class="' + (U.ptab === 'setup' ? 'on' : '') + '" data-a="ptab" data-v="setup">' + esc(T('Setup', 'Atur')) + '</button><button type="button" role="tab" aria-selected="' + (U.ptab === 'data') + '" class="' + (U.ptab === 'data' ? 'on' : '') + '" data-a="ptab" data-v="data">Data</button></div>' +
      (U.ptab === 'data' ? ui.dataTab(p, set) : setup(p, set, probs));
  }
  ACT.ptab = function (b) { U.ptab = b.dataset.v; ui.render(); };
  function setup(p, set, probs) {
    return ui.syncBadge() +
      (probs.length ? '<div class="dtt-tip warn"><b>' + esc(T('To finish before the first session', 'Lengkapi sebelum %session% pertama')) + '</b><ul>' + probs.map(function (x) { return '<li>' + esc(ui.issueText(x)) + (x.code === 'set' ? '' : ' <button type="button" class="tl-link" data-a="editSet" data-id="' + (set ? set.id : '') + '">' + esc(T('Open the set', 'Buka set')) + '</button>') + '</li>'; }).join('') + '</ul></div>' : '') +
      attention(p, set) +
      '<section class="dtt-panel"><div class="dtt-panelhead"><h2 class="dtt-h2">' + esc(T('Targets', '%targets%')) + '</h2><div class="dtt-inline"><span class="dtt-lab">' + esc(T('Active at Once', 'Aktif Sekaligus')) + '</span>' + ui.stepper('activeCount', p.activeCount) + '</div></div>' +
      (p.queue.length ? '<div class="dtt-tchips">' + p.queue.map(function (id) {
        var st = ui.targetStatus(p, id, DEF.OPS[p.type][0]), it = p.type === 'pattern' ? null : P.itemById(set, id);
        return '<span class="dtt-tchip ' + st + '" title="' + esc(ui.statusName(st)) + '">' + (it ? '<span class="dtt-tthumb">' + ui.img(it.images[0], '') + '</span>' : '') + esc(ui.targetName(p, set, id) || '?') + (p.pinned.indexOf(id) >= 0 ? ' ★' : '') + '</span>';
      }).join('') + '</div>' : '<p class="dtt-hint">' + esc(T('No targets yet. Add stimuli to the set.', 'Belum ada %targets%. Tambahkan stimulus ke set.')) + '</p>') +
      '<div class="dtt-panelfoot"><button type="button" class="dtt-btn sm" data-a="editOrder">' + esc(T('Edit Order', 'Ubah Urutan')) + '</button>' + (set ? '<button type="button" class="dtt-btn sm quiet" data-a="editSet" data-id="' + set.id + '">' + esc(T('Edit Set', 'Ubah Set')) + '</button>' : '') +
      '<span class="dtt-hint"><i class="dtt-key l"></i>' + esc(T('Learning now', 'Sedang dipelajari')) + ' <i class="dtt-key w"></i>' + esc(T('Waiting, enters in order', 'Menunggu, masuk berurutan')) + ' <i class="dtt-key m"></i>' + esc(T('Mastered', '%mastered%')) + '</span></div></section>' +
      '<div class="dtt-cardsgrid">' + ui.TAB_ORDER.map(function (k) {
        return '<button type="button" class="dtt-scard" data-a="openTab" data-v="' + k + '"><span class="dtt-scardh"><b>' + esc(D.i18n.fill(ui.TABS[k].name())) + '</b><span class="dtt-edit">✎ ' + esc(T('Edit', 'Ubah')) + '</span></span>' +
          ui.summary(k, p).filter(Boolean).map(function (l) { return '<span class="dtt-sline">' + esc(D.i18n.fill(l)) + '</span>'; }).join('') + '</button>';
      }).join('') + '</div>' +
      '<div class="dtt-progfoot"><button type="button" class="dtt-btn quiet sm" data-a="renameProgram">✎ ' + esc(T('Rename', 'Ganti Nama')) + '</button><button type="button" class="dtt-btn quiet sm" data-a="transfer" data-id="' + p.id + '">⧉ ' + esc(T('Copy as Another Type', 'Salin sebagai Jenis Lain')) + '</button>' +
      '<button type="button" class="dtt-btn quiet sm danger" data-a="delProgram" data-id="' + p.id + '" data-confirm="' + esc(T('Tap again to delete it and its data', 'Ketuk lagi untuk menghapus beserta datanya')) + '">🗑 ' + esc(T('Delete Program', 'Hapus Program')) + '</button></div>';
  }
  ACT.openTab = function (b) { ui.openDrawer('settings', b.dataset.v); };
  ACT.editOrder = function () { ui.openDrawer('order'); };
  // flagged: an active target still not mastered after 10 sessions
  function attention(p, set) {
    var pr = D.store.progressOf(p.id), names = [];
    DEF.OPS[p.type].forEach(function (op) { p.queue.forEach(function (id) { if (D.mastery.needsAttention(pr[D.targets.key(id, op)]) && names.indexOf(ui.targetName(p, set, id)) < 0) names.push(ui.targetName(p, set, id)); }); });
    return names.length ? '<div class="dtt-tip"><b>' + esc(T('Needs attention: ', 'Perlu perhatian: ')) + esc(names.join(', ')) + '</b><br>' + esc(T('Not yet mastered after 10 sessions. You could try a different prompt, fewer cards, or new pictures.', 'Belum %mastered% setelah 10 %sessions%. Kamu bisa mencoba Prompt lain, kartu lebih sedikit, atau gambar baru.')) + '</div>' : '';
  }
  ACT.renameProgram = function () {
    var p = D.store.program(U.programId), sh = X.sheet('<div class="dtt-dlg"><div class="dtt-dlghead"><h2>' + esc(T('Rename Program', 'Ganti Nama Program')) + '</h2><button type="button" class="dtt-x" data-x aria-label="' + esc(T('Close', 'Tutup')) + '">✕</button></div>' +
      '<label class="dtt-field"><span>' + esc(T('Name', 'Nama')) + '</span><input type="text" maxlength="60" value="' + esc(p.name) + '" autofocus></label>' +
      '<div class="dtt-dlgbtns"><button type="button" class="dtt-btn" data-x>' + esc(T('Cancel', 'Batal')) + '</button><button type="button" class="dtt-btn primary" data-go>' + esc(T('Save', 'Simpan')) + '</button></div></div>');
    function go() { var v = sh.el.querySelector('input').value.trim(); if (!v) return; p.name = v; ui.touchProgram(); sh.close(); ui.render(); }
    sh.el.addEventListener('click', function (e) { var t = e.target.closest('button'); if (!t) return; if (t.hasAttribute('data-x')) sh.close(); if (t.hasAttribute('data-go')) go(); });
    sh.el.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); go(); } });
  };
  ACT.transfer = function (b) {
    var src = D.store.program(b.dataset.id), set = D.store.set(src.setId);
    if (!D.store.canAddProgram()) return ui.plusSheet('programs');
    var st = { type: DEF.TYPES.filter(function (t) { return t !== src.type; })[0], first: false }, sh = X.sheet('');
    function draw() {
      sh.set('<div class="dtt-dlg"><div class="dtt-dlghead"><h2>' + esc(T('Copy as "' + src.name + '" for…', 'Salin "' + src.name + '" sebagai…')) + '</h2><button type="button" class="dtt-x" data-x aria-label="' + esc(T('Close', 'Tutup')) + '">✕</button></div>' +
        '<p class="dtt-dlgp">' + esc(T('A new program on the same set. Pictures stay shared; settings start as copies.', 'Program baru dengan set yang sama. Gambar tetap dipakai bersama; pengaturan disalin.')) + '</p>' +
        '<div class="dtt-typegrid">' + DEF.TYPES.filter(function (t) { return t !== src.type; }).map(function (t) {
          var on = st.type === t; return '<button type="button" class="dtt-typecard' + (on ? ' on' : '') + '" aria-pressed="' + on + '" data-t="' + t + '"><b>' + esc(ui.typeShort(t)) + '</b></button>';
        }).join('') + '</div>' +
        '<button type="button" class="dtt-switch" role="switch" aria-checked="' + st.first + '" data-first><span class="tl-tog" aria-hidden="true"></span><span class="dtt-swtx"><b>' + esc(T('Start with targets already mastered here', 'Mulai dengan %targets% yang sudah %mastered% di sini')) + '</b><small>' + esc(T('Only puts them first in the queue.', 'Hanya menaruhnya di awal antrean.')) + '</small></span></button>' +
        '<div class="dtt-dlgbtns"><button type="button" class="dtt-btn" data-x>' + esc(T('Cancel', 'Batal')) + '</button><button type="button" class="dtt-btn primary" data-go>' + esc(T('Create Program', 'Buat Program')) + '</button></div></div>');
    }
    sh.el.addEventListener('click', function (e) {
      var t = e.target.closest('button'); if (!t) return;
      if (t.hasAttribute('data-x')) return sh.close();
      if (t.dataset.t) { st.type = t.dataset.t; return draw(); }
      if (t.hasAttribute('data-first')) { st.first = !st.first; return draw(); }
      if (t.hasAttribute('data-go')) {
        t.disabled = true;
        var p = D.transfer.create(src, { type: st.type, set: set, lang: D.i18n.lang(), name: src.name + ' (' + ui.typeShort(st.type) + ')', startMastered: st.first, progress: D.store.progressOf(src.id) });
        D.store.addProgram(p).then(function () { sh.close(); U.programId = p.id; U.view = 'program'; U.ptab = 'setup'; ui.render(); window.scrollTo(0, 0); },
          function (err) { t.disabled = false; if (err && /dtt_program_limit/.test((err.data && err.data.message) || err.message || '')) { sh.close(); return ui.plusSheet('programs'); } X.toast(T('The program was not saved. Check your connection and try again.', 'Program belum tersimpan. Periksa koneksi lalu coba lagi.')); });
      }
    });
    draw();
  };
  INP.progText = function (el) { var p = ui.ctx(); p[el.dataset.k] = el.value; ui.touchProgram(); };
  ACT.delProgram = function (b) {
    D.store.deleteProgram(D.store.program(b.dataset.id)).then(function () { U.view = 'programs'; ui.render(); }, function () { X.toast(T('The program was not deleted. Check your connection.', 'Program belum dihapus. Periksa koneksi.')); });
  };

  /* ---------- Settings: the student's celebrations, and this device ---------- */
  var THEME_NAMES = { space: ['Space', 'Luar angkasa'], sea: ['Under the sea', 'Bawah laut'], garden: ['Garden', 'Kebun'], fantasy: ['Fantasy', 'Dunia dongeng'], vehicles: ['Vehicles', 'Kendaraan'], weather: ['Weather', 'Cuaca'] };
  var PKEY = 'lu_dtt_prefs';
  ui.prefs = function () { var v = null; try { v = JSON.parse(localStorage.getItem(PKEY)); } catch (e) { } return Object.assign({}, DEF.DEF_PREFS, v || {}); };
  function savePrefs(p) { try { localStorage.setItem(PKEY, JSON.stringify(p)); } catch (e) { } }
  function viewSettings() {
    var kid = ui.student(), st = D.store.student(kid.id), n = D.store.programs(kid.id).length, pf = ui.prefs();
    var ids = X.S().profiles.map(function (x) { return x.id; }), orphans = D.store.orphanIds(ids);
    function psw(k, title, desc) { return ui.sw(k, pf[k], title, desc, 'prefTog'); }
    function pseg(k, opts) { return ui.seg(k, pf[k], opts).replace(/data-a="set"/g, 'data-a="prefSet"'); }
    return '<div class="dtt-pagehead"><h1 class="dtt-h1">' + esc(T('Settings', 'Pengaturan')) + '</h1></div><div class="dtt-setcols">' +
      '<section class="dtt-panel"><h2 class="dtt-h2">' + esc(T(kid.name + '\'s Celebrations', 'Perayaan ' + kid.name)) + '</h2>' +
      ui.opt(T('Themes', 'Tema'), T('None chosen = all six.', 'Tidak ada yang dipilih = keenamnya.'), '<div class="dtt-themes">' + DEF.THEMES.map(function (k) {
        var on = st.themes.indexOf(k) >= 0, chars = D.themes.chosen([k])[0].characters.slice(0, 3).map(function (c) { return D.themes.svg(c, 'dtt-char tiny'); }).join('');
        return '<button type="button" class="dtt-theme' + (on ? ' on' : '') + '" aria-pressed="' + on + '" data-a="themeTog" data-v="' + k + '"><span class="dtt-themechars" aria-hidden="true">' + chars + '</span><b>' + esc(T(THEME_NAMES[k][0], THEME_NAMES[k][1])) + '</b></button>';
      }).join('') + '</div>') +
      ui.opt(T('Reward Photos', 'Foto Reward'), T('Shown in celebrations and as the token board reward.', 'Tampil di perayaan dan sebagai hadiah Token board.'), '<div class="dtt-imgs">' + st.photos.map(function (m) {
        return '<span class="dtt-imgwrap">' + ui.img(m, '') + '<button type="button" class="dtt-imgx" data-a="delReinf" data-v="' + m.id + '" data-confirm="?" aria-label="' + esc(T('Remove this photo', 'Hapus foto ini')) + '">✕</button></span>';
      }).join('') + '<label class="dtt-addimg" aria-label="' + esc(T('Add a photo', 'Tambah foto')) + '">+<input type="file" accept="image/*,.heic,.heif" data-in="reinfPhoto" data-on="change"></label></div>') +
      '<div class="dtt-dangerrow"><span><b>' + esc(T('Delete ' + kid.name + '\'s DTT Data', 'Hapus Data DTT ' + kid.name)) + '</b><small>' + esc(T(n + ' programs, progress, sessions and reward photos. Sets stay.', n + ' program, kemajuan, %sessions%, dan foto reward. Set tetap ada.')) + '</small></span>' +
      '<button type="button" class="dtt-btn sm danger" data-a="wipe" data-v="' + esc(kid.id) + '" data-confirm="' + esc(T('Tap again to delete all of it', 'Ketuk lagi untuk menghapus semuanya')) + '">' + esc(T('Delete…', 'Hapus…')) + '</button></div>' +
      (orphans.length ? '<div class="dtt-dangerrow"><span><b>' + esc(T('Data from removed profiles', 'Data dari profil yang dihapus')) + '</b><small>' + esc(T(orphans.length + ' child profile(s) no longer exist.', orphans.length + ' profil anak sudah tidak ada.')) + '</small></span>' +
        orphans.map(function (id) { return '<button type="button" class="dtt-btn sm danger" data-a="wipe" data-v="' + esc(id) + '" data-confirm="' + esc(T('Tap again', 'Ketuk lagi')) + '">' + esc(T('Delete', 'Hapus')) + '</button>'; }).join(' ') + '</div>' : '') + '</section>' +
      '<section class="dtt-panel"><h2 class="dtt-h2">' + esc(T('This Device', 'Perangkat Ini')) + '</h2><p class="dtt-hint">' + esc(T('Applies to all students', 'Berlaku untuk semua anak')) + '</p>' +
      ui.opt(T('Sounds', 'Suara'), '', psw('sfx', T('Celebration sounds', 'Suara perayaan'), '') + (pf.sfx ? pseg('vol', [['soft', T('Soft', 'Pelan')], ['medium', T('Medium', 'Sedang')], ['loud', T('Loud', 'Keras')]]) : '')) +
      ui.opt(T('Target Word on My Panel', 'Kata Target di Panelku'), T('On a laptop, hold W to see it.', 'Di laptop, tahan W untuk melihatnya.'), pseg('labelView', [['hold', T('Hold to See', 'Tahan untuk Lihat')], ['flash', T('2 s', '2 dtk')], ['small', T('Faded', 'Pudar')], ['always', T('Always', 'Selalu')]])) +
      ui.opt('', '', psw('hold', T('Hold to Press Teacher Buttons', 'Tahan untuk Menekan Tombol Guru'), T('So the student can\'t tap them by accident.', 'Agar anak tidak sengaja mengetuknya.')) + psw('reduce', T('Reduce Motion', 'Kurangi Gerakan'), '')) + '</section></div>';
  }
  ACT.themeTog = function (b) { var sid = ui.student().id, st = D.store.student(sid), i = st.themes.indexOf(b.dataset.v); if (i >= 0) st.themes.splice(i, 1); else st.themes.push(b.dataset.v); ui.touchStudent(sid); ui.render(); };
  INP.reinfPhoto = function (el) {
    var f = el.files && el.files[0], sid = ui.student().id; el.value = '';
    if (!f || !ui.photoRoom(1)) return;
    ui.cropper(f, function (blob) { D.store.uploadImage('reinforcers', blob).then(function (m) { D.store.student(sid).photos.push(m); ui.touchStudent(sid); ui.render(); }, ui.photoError); });
  };
  ACT.delReinf = function (b) {
    var sid = ui.student().id, st = D.store.student(sid), m = st.photos.filter(function (x) { return x.id === b.dataset.v; })[0];
    D.store.dropImages([m]); st.photos = st.photos.filter(function (x) { return x !== m; }); ui.touchStudent(sid); ui.render();
  };
  ACT.wipe = function (b) {
    D.store.deleteStudentData(b.dataset.v).then(function () { X.toast(T('The DTT data was deleted.', 'Data DTT sudah dihapus.')); ui.render(); }, function () { X.toast(T('It was not deleted. Check your connection.', 'Belum terhapus. Periksa koneksi.')); });
  };
  ACT.prefTog = function (b) { var p = ui.prefs(); p[b.dataset.k] = !p[b.dataset.k]; savePrefs(p); ui.render(); };
  ACT.prefSet = function (b) { var p = ui.prefs(); p[b.dataset.k] = b.dataset.v; savePrefs(p); ui.render(); };

  ui.VIEWS.programs = viewPrograms;
  ui.VIEWS.program = viewProgram;
  ui.VIEWS.settings = viewSettings;
})();
