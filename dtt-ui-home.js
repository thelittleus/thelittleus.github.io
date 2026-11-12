/* Little Us · DTT · the main views: the program list (1a), one program with Setup and Data (1b, 3a), and Settings (1g). */
(function () {
  'use strict';
  var D = window.LUDtt, X = LUTools.api, P = D.programs, DEF = D.defaults, T = D.i18n.T, esc = X.esc, ui = D.ui, U = ui.U, ACT = ui.ACT, INP = ui.INP;
  var TYPE_TINT = { listener: '#DCEBFA', tact: '#E9E1F7', mixed: '#FFE9DA', matching: '#DDF2E4', sorting: '#FFF1C7', pattern: '#FBE0E6' };
  ui.TYPE_TINT = TYPE_TINT;
  ui.typeShort = function (t) { return ui.typeName(t); };
  function pill(t) { return '<span class="dtt-pill" style="background:' + (TYPE_TINT[t] || '#F3EEE6') + '">' + esc(ui.typeName(t)) + '</span>'; }

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
    return '<span class="dtt-hint">' + esc(T(D.store.programs().length + ' of ' + DEF.FREE_PROGRAMS + ' free programs', D.store.programs().length + ' dari ' + DEF.FREE_PROGRAMS + ' program gratis')) + '</span>';
  }
  function heroChars(theme) { return '<div class="dtt-firstart" aria-hidden="true">' + D.themes.chosen([theme])[0].characters.slice(0, 3).map(function (c) { return D.themes.svg(c, 'dtt-char'); }).join('') + '</div>'; }

  /* ---------- Programs (1a, 3v) ---------- */
  function viewPrograms() {
    var kid = ui.student(), list = D.store.programs(kid.id);
    var head = '<div class="dtt-pagehead"><h1 class="dtt-h1">' + esc(T('Programs', 'Program')) + '</h1><div class="dtt-headr">' + freeNote() + '<button type="button" class="dtt-btn primary" data-a="newProgram">' + esc(T('+ New Program', '+ Program Baru')) + '</button></div></div>';
    if (!list.length) return ui.syncBadge() + head + '<div class="dtt-empty dtt-first">' + heroChars('space') +
      '<h2 class="dtt-h1 sm">' + esc(T('Make ' + kid.name + '\'s First Program', 'Buat Program Pertama ' + kid.name)) + '</h2><p class="dtt-p">' + esc(T('Takes about a minute.', 'Hanya sekitar satu menit.')) + '</p>' +
      '<button type="button" class="dtt-btn primary" data-a="newProgram">' + esc(T('+ New Program', '+ Program Baru')) + '</button></div>';
    return ui.syncBadge() + head + '<div class="dtt-plist">' + list.map(function (p) {
      var set = D.store.set(p.setId), c = counts(p), ready = !P.issues(p, set).length;
      return '<div class="dtt-prow"><button type="button" class="dtt-prowopen" data-a="openProgram" data-id="' + p.id + '" aria-label="' + esc(T('Open ', 'Buka ') + (p.name || '')) + '"></button>' + tile(p, set) +
        '<div class="dtt-pinfo"><b class="dtt-pname">' + esc(p.name || T('Unnamed program', 'Program tanpa nama')) + '</b><span class="dtt-pmeta">' + pill(p.type) + '<span>' + esc((set ? (set.name || T('Unnamed set', 'Set tanpa nama')) + ' · ' : '') + T(c.learning + ' learning · ' + c.mastered + ' mastered', c.learning + ' dipelajari · ' + c.mastered + ' %mastered%')) + '</span></span></div>' + bar(c) +
        (ready ? '<button type="button" class="dtt-btn sec sm" data-a="practice" data-id="' + p.id + '">' + esc(T('Practice', 'Latihan')) + '</button><button type="button" class="dtt-btn primary sm" data-a="startSession" data-id="' + p.id + '">▶ ' + esc(T('Start Session', 'Mulai Sesi')) + '</button>'
          : '<span class="dtt-chip attention">' + esc(T('Needs setup', 'Perlu dilengkapi')) + '</span>') +
        moreBtn(p) + '</div>';
    }).join('') + '</div>' +
      '<div class="dtt-legend"><span><i class="m"></i>' + esc(T('Mastered', '%mastered%')) + '</span><span><i class="l"></i>' + esc(T('Learning', 'Dipelajari')) + '</span><span><i class="w"></i>' + esc(T('Waiting', 'Menunggu')) + '</span></div>';
  }
  ACT.openProgram = function (b) { U.programId = b.dataset.id; U.view = 'program'; U.ptab = 'setup'; ui.render(); window.scrollTo(0, 0); };
  ACT.startSession = function (b) { beforeStart(b.dataset.id, false); };
  ACT.practice = function (b) { beforeStart(b.dataset.id, true); };
  // a last check before a session: have the settings and the targets been set up? "Check Settings" opens them instead.
  function beforeStart(id, practice) {
    var p = D.store.program(id);
    var sh = X.sheet(ui.dlg({ title: practice ? T('Ready to Practice?', 'Siap Latihan?') : T('Ready to Start?', 'Siap Mulai?'),
      body: '<p class="dtt-dlgp">' + esc(D.i18n.fill(T('Make sure the settings (trials, prompts, error correction, rewards and mastery) and the target order are how you want them for this ' + (practice ? 'practice.' : 'session.'), 'Pastikan pengaturan (trial, prompt, error correction, reward, dan %mastery%) serta urutan %targets% sudah sesuai untuk ' + (practice ? 'latihan ini.' : '%session% ini.')))) + '</p>',
      foot: '<button type="button" class="dtt-btn sec" data-check>' + esc(T('Check Settings', 'Cek Pengaturan')) + '</button><button type="button" class="dtt-btn primary" data-go>▶ ' + esc(practice ? T('Start Practice', 'Mulai Latihan') : T('Start Session', 'Mulai Sesi')) + '</button>' }));
    closeOn(sh);
    sh.el.addEventListener('click', function (e) {
      if (e.target.closest('[data-go]')) { sh.close(); D.session.start(p, practice ? { practice: true } : undefined); }
      else if (e.target.closest('[data-check]')) { sh.close(); U.programId = id; U.view = 'program'; U.ptab = 'setup'; ui.render(); window.scrollTo(0, 0); ui.openDrawer('settings', 'trials'); }
    });
  }

  /* ---------- one program (1b) ---------- */
  ui.targetStatus = function (p, id, op) {
    var pr = D.store.progressOf(p.id), ps = pr[D.targets.key(id, op)];
    if (ps && ps.masteredAt) return ps.retentionDue ? 'mastered' : 'maintenance';
    if (D.mastery.needsAttention(ps)) return 'attention';
    return D.targets.active(p, pr, op).indexOf(id) >= 0 ? 'learning' : 'waiting';
  };
  ui.statusName = function (st) { return { mastered: T('Mastered', '%mastered%'), maintenance: T('Maintenance', '%maintenance%'), attention: T('Needs attention', 'Perlu perhatian'), learning: T('Learning', 'Dipelajari'), waiting: T('Waiting', 'Menunggu') }[st]; };
  ui.statusChips = function (p, id) {
    var ops = DEF.OPS[p.type];
    return ops.map(function (op) { var st = ui.targetStatus(p, id, op), pre = ops.length > 1 ? (op === 'listener' ? T('Identifying: ', 'Mengenali: ') : T('Labeling: ', 'Menamai: ')) : ''; return '<span class="dtt-chip ' + st + '">' + esc(pre + ui.statusName(st)) + '</span>'; }).join(' ');
  };
  // a small round picture of the target; typed words and numbers already say themselves, so they get none
  ui.dot = function (it) { var m = it && it.images[0]; if (m && m.lib && D.library.isText(m.lib)) return ''; return '<span class="dtt-dot16">' + (m ? ui.img(m, '') : '') + '</span>'; };
  function viewProgram() {
    var p = D.store.program(U.programId), set = D.store.set(p.setId), probs = P.issues(p, set), ready = !probs.length;
    P.syncQueue(p, set);
    if (U.ptab !== 'data') U.ptab = 'setup';
    return '<button type="button" class="dtt-back" data-a="tab" data-v="programs">‹ ' + esc(T('Programs', 'Program')) + '</button>' +
      '<div class="dtt-pagehead prog"><div class="dtt-titlewrap"><h1 class="dtt-h1">' + esc(p.name || T('Unnamed program', 'Program tanpa nama')) + '</h1><span class="dtt-pmeta">' + pill(p.type) + (set ? '<span>' + esc(set.name || T('Unnamed set', 'Set tanpa nama')) + '</span>' : '') + '</span></div>' +
      '<div class="tl-seg dtt-seg dtt-ptabs" role="tablist"><button type="button" role="tab" aria-selected="' + (U.ptab === 'setup') + '" class="' + (U.ptab === 'setup' ? 'on' : '') + '" data-a="ptab" data-v="setup">' + esc(T('Setup', 'Atur')) + '</button><button type="button" role="tab" aria-selected="' + (U.ptab === 'data') + '" class="' + (U.ptab === 'data' ? 'on' : '') + '" data-a="ptab" data-v="data">Data</button></div>' +
      '<div class="dtt-headr"><button type="button" class="dtt-btn sec two" data-a="practice" data-id="' + p.id + '"' + (ready ? '' : ' disabled') + '>' + esc(T('Practice', 'Latihan')) + '<small>' + esc(T('Not recorded', 'Tidak dicatat')) + '</small></button>' +
      '<button type="button" class="dtt-btn primary lg" data-a="startSession" data-id="' + p.id + '"' + (ready ? '' : ' disabled') + '>▶ ' + esc(T('Start Real Session', 'Mulai Sesi')) + '</button>' + moreBtn(p, true) + '</div></div>' +
      (U.ptab === 'data' ? ui.dataTab(p, set) : setup(p, set, probs));
  }
  ACT.ptab = function (b) { U.ptab = b.dataset.v; ui.render(); };
  function setup(p, set, probs) {
    var op = DEF.OPS[p.type][0], groups = { learning: [], mastered: [], waiting: [] };
    p.queue.forEach(function (id) { var st = ui.targetStatus(p, id, op); groups[st === 'mastered' || st === 'maintenance' ? 'mastered' : st === 'waiting' ? 'waiting' : 'learning'].push(id); });
    // the Targets card: round pictures of the targets being learned (yellow ring), the next few waiting, then "+N"
    function face(id, cls) {
      var it = p.type === 'pattern' ? null : P.itemById(set, id), m = it && it.images[0], nm = ui.targetName(p, set, id) || '?';
      var pic = m && !(m.lib && D.library.isText(m.lib)) ? ui.img(m, '') : '<b>' + esc(nm.slice(0, 2)) + '</b>';
      return '<span class="dtt-tface ' + cls + '" title="' + esc(nm) + '">' + pic + '</span>';
    }
    var shownWait = groups.waiting.slice(0, 2), more = p.queue.length - groups.learning.length - shownWait.length;
    var names = groups.learning.map(function (id) { return ui.targetName(p, set, id); }).filter(Boolean);
    var faces = groups.learning.map(function (id) { return face(id, 'on'); }).join('') + '<span class="dtt-tgap"></span>' + shownWait.map(function (id) { return face(id, 'wait'); }).join('') +
      (more > 0 ? '<span class="dtt-tmore">+' + more + '</span>' : '');
    var tcard = '<div class="dtt-scard targets"><div class="dtt-scardh"><h3>' + esc(D.i18n.fill(T('Targets', '%targets%'))) + '</h3><button type="button" class="dtt-edit" data-a="editOrder">✎ ' + esc(T('Edit', 'Ubah')) + '</button></div>' +
      (p.queue.length ? '<div class="dtt-tfaces">' + faces + '</div>' : '') +
      '<div class="dtt-slines">' + (names.length ? '<span>' + esc(T('Learning ', 'Mempelajari ')) + esc(names.join(', ')) + '</span>' : '') +
      '<span>' + esc(T(p.activeCount + ' active at once · ' + groups.waiting.length + ' waiting', p.activeCount + ' aktif sekaligus · ' + groups.waiting.length + ' menunggu')) + (groups.mastered.length ? esc(D.i18n.fill(T(' · ' + groups.mastered.length + ' mastered', ' · ' + groups.mastered.length + ' %mastered%'))) : '') + '</span></div></div>';
    return ui.syncBadge() +
      (probs.length ? '<div class="dtt-tip warn"><b>' + esc(T('To finish before the first session', 'Lengkapi sebelum %session% pertama')) + '</b><ul>' + probs.map(function (x) { return '<li>' + esc(ui.issueText(x)) + (set ? ' <button type="button" class="tl-link" data-a="' + (/patterns|patternFill|categories/.test(x.code) ? 'editOrder' : 'editSet') + '" data-id="' + set.id + '">' + esc(T('Fix', 'Perbaiki')) + '</button>' : '') + '</li>'; }).join('') + '</ul></div>' : '') +
      attention(p, set) +
      '<div class="dtt-cardsgrid">' + tcard + ui.TAB_ORDER.map(function (k) {
        return '<div class="dtt-scard"><div class="dtt-scardh"><h3>' + esc(D.i18n.fill(ui.TABS[k].name())) + '</h3><button type="button" class="dtt-edit" data-a="openTab" data-v="' + k + '">✎ ' + esc(T('Edit', 'Ubah')) + '</button></div>' +
          '<div class="dtt-slines">' + ui.summary(k, p).filter(Boolean).map(function (l) { return '<span>' + esc(D.i18n.fill(l)) + '</span>'; }).join('') + '</div></div>';
      }).join('') + '</div>';
  }
  // the ⋯ button on a program (its page and its row in the list): Rename, Copy as Another Type, Delete
  function moreBtn(p, big) { return '<button type="button" class="dtt-pmore' + (big ? ' big' : '') + '" data-a="progMenu" data-id="' + p.id + '" aria-haspopup="menu" aria-label="' + esc(T('More for ', 'Lainnya untuk ') + (p.name || '')) + '">⋯</button>'; }
  ACT.progMenu = function (b) {
    var id = b.dataset.id, old = document.querySelector('.dtt-pop'); if (old) { old.remove(); if (old.dataset.for === id) return; }
    var pop = document.createElement('div'); pop.className = 'dtt-pop'; pop.dataset.for = id; pop.setAttribute('role', 'menu');
    pop.innerHTML = '<button type="button" role="menuitem" data-do="rename">✎ ' + esc(T('Rename', 'Ganti Nama')) + '</button><button type="button" role="menuitem" data-do="copy">⧉ ' + esc(T('Copy as Another Type', 'Salin sebagai Jenis Lain')) + '</button>' +
      '<span class="dtt-popsep" aria-hidden="true"></span><button type="button" role="menuitem" class="danger" data-do="del">🗑 ' + esc(T('Delete Program', 'Hapus Program')) + '</button>';
    document.body.appendChild(pop);
    var r = b.getBoundingClientRect(); pop.style.minWidth = '220px'; pop.style.top = Math.min(window.innerHeight - pop.offsetHeight - 8, r.bottom + 8) + 'px'; pop.style.left = Math.max(8, Math.min(window.innerWidth - pop.offsetWidth - 8, r.right - pop.offsetWidth)) + 'px';
    pop.querySelector('button').focus();
    function close() { pop.remove(); document.removeEventListener('pointerdown', outside, true); document.removeEventListener('keydown', key, true); window.removeEventListener('scroll', close, true); }
    function outside(e) { if (!pop.contains(e.target) && e.target !== b) close(); }
    function key(e) { if (e.key === 'Escape') { e.stopPropagation(); close(); b.focus(); } }
    setTimeout(function () { document.addEventListener('pointerdown', outside, true); document.addEventListener('keydown', key, true); window.addEventListener('scroll', close, true); }, 0);
    pop.addEventListener('click', function (e) {
      var t = e.target.closest('button'); if (!t) return; var d = t.dataset.do; close();
      if (d === 'rename') { U.programId = id; ACT.renameProgram(); }
      if (d === 'copy') ACT.transfer({ dataset: { id: id } });
      if (d === 'del') ACT.askDelProgram({ dataset: { id: id } });
    });
  };
  ACT.openTab = function (b) { ui.openDrawer('settings', b.dataset.v); };
  ACT.editOrder = function () { ui.openDrawer('order'); };
  function attention(p, set) {
    var pr = D.store.progressOf(p.id), names = [];
    DEF.OPS[p.type].forEach(function (op) { p.queue.forEach(function (id) { if (D.mastery.needsAttention(pr[D.targets.key(id, op)]) && names.indexOf(ui.targetName(p, set, id)) < 0) names.push(ui.targetName(p, set, id)); }); });
    return names.length ? '<div class="dtt-tip"><b>' + esc(T('Needs attention: ', 'Perlu perhatian: ')) + esc(names.join(', ')) + '</b><br>' + esc(T('Not yet mastered after 10 sessions. You could try a different prompt, fewer cards, or new pictures.', 'Belum %mastered% setelah 10 %sessions%. Kamu bisa mencoba Prompt lain, kartu lebih sedikit, atau gambar baru.')) + '</div>' : '';
  }
  function closeOn(sh) { sh.el.addEventListener('click', function (e) { if (e.target.closest('[data-x]')) sh.close(); }); }
  ACT.renameProgram = function () {
    var p = D.store.program(U.programId), sh = X.sheet(ui.dlg({ title: T('Rename Program', 'Ganti Nama Program'),
      body: '<label class="dtt-field"><span>' + esc(T('Name', 'Nama')) + '</span><input type="text" maxlength="60" value="' + esc(p.name) + '" autofocus></label>',
      foot: '<button type="button" class="dtt-btn sec" data-x>' + esc(T('Cancel', 'Batal')) + '</button><button type="button" class="dtt-btn primary" data-go>' + esc(T('Save', 'Simpan')) + '</button>' }));
    closeOn(sh);
    function go() { var v = sh.el.querySelector('input').value.trim(); if (!v) return; p.name = v; ui.touchProgram(); sh.close(); ui.render(); }
    sh.el.addEventListener('click', function (e) { if (e.target.closest('[data-go]')) go(); });
    sh.el.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); go(); } });
  };
  // 3o
  ACT.transfer = function (b) {
    var src = D.store.program(b.dataset.id), set = D.store.set(src.setId);
    if (!D.store.canAddProgram()) return ui.plusSheet('programs');
    var types = DEF.TYPES.filter(function (t) { return t !== src.type; }), st = { type: types[0], first: false }, sh = X.sheet('');
    function draw() {
      sh.set(ui.dlg({ title: T('Copy as Another Type', 'Salin sebagai Jenis Lain'), sub: esc(T('"' + src.name + '" with the same set. Settings are copied.', '"' + src.name + '" dengan set yang sama. Pengaturan disalin.')),
        body: '<div class="dtt-typegrid three">' + types.map(function (t) { var on = st.type === t; return '<button type="button" class="dtt-typecard' + (on ? ' on' : '') + '" style="' + (on ? 'background:' + TYPE_TINT[t] : '') + '" aria-pressed="' + on + '" data-t="' + t + '"><b>' + esc(ui.typeName(t)) + '</b></button>'; }).join('') + '</div>' +
          '<button type="button" class="dtt-switch" role="switch" aria-checked="' + st.first + '" data-first><span class="dtt-swtx"><b>' + esc(T('Mastered Targets First', '%targets% %mastered% Lebih Dulu')) + '</b><small>' + esc(T('Only changes the order', 'Hanya mengubah urutan')) + '</small></span><span class="tl-tog" aria-hidden="true"></span></button>',
        foot: '<button type="button" class="dtt-btn sec" data-x>' + esc(T('Cancel', 'Batal')) + '</button><button type="button" class="dtt-btn primary" data-go>' + esc(T('Create Copy', 'Buat Salinan')) + '</button>' }));
    }
    sh.el.addEventListener('click', function (e) {
      var t = e.target.closest('button'); if (!t) return;
      if (t.hasAttribute('data-x')) return sh.close();
      if (t.dataset.t) { st.type = t.dataset.t; return draw(); }
      if (t.hasAttribute('data-first')) { st.first = !st.first; return draw(); }
      if (t.hasAttribute('data-go')) {
        t.disabled = true;
        var p = D.transfer.create(src, { type: st.type, set: set, lang: D.i18n.lang(), name: src.name + ' (' + ui.typeName(st.type) + ')', startMastered: st.first, progress: D.store.progressOf(src.id) });
        D.store.addProgram(p).then(function () { sh.close(); U.programId = p.id; U.view = 'program'; U.ptab = 'setup'; ui.render(); window.scrollTo(0, 0); },
          function (err) { t.disabled = false; if (err && /dtt_program_limit/.test((err.data && err.data.message) || err.message || '')) { sh.close(); return ui.plusSheet('programs'); } X.toast(T('The program was not saved. Check your connection and try again.', 'Program belum tersimpan. Cek koneksi internetmu, lalu coba lagi.')); });
      }
    });
    draw();
  };
  INP.progText = function (el) { var p = ui.ctx(); p[el.dataset.k] = el.value; ui.touchProgram(); };
  ACT.askDelProgram = function (b) {
    var p = D.store.program(b.dataset.id), sh = X.sheet(ui.dlg({ title: T('Delete "' + p.name + '"?', 'Hapus "' + p.name + '"?'),
      body: '<p class="dtt-dlgp">' + esc(T('Its sessions and progress are deleted too. The stimulus set stays. This cannot be undone.', '%sessions% dan kemajuannya ikut terhapus. Stimulus set tetap ada. Ini tidak bisa dibatalkan.')) + '</p>',
      foot: '<button type="button" class="dtt-btn sec" data-x>' + esc(T('Cancel', 'Batal')) + '</button><button type="button" class="dtt-btn danger" data-go>' + esc(T('Delete Program', 'Hapus Program')) + '</button>' }));
    closeOn(sh);
    sh.el.addEventListener('click', function (e) {
      var t = e.target.closest('[data-go]'); if (!t) return; t.disabled = true;
      D.store.deleteProgram(p).then(function () { sh.close(); U.view = 'programs'; ui.render(); }, function () { t.disabled = false; X.toast(T('The program was not deleted. Check your connection.', 'Program belum dihapus. Cek koneksi internetmu.')); });
    });
  };

  /* ---------- Settings (1g) ---------- */
  var THEMES = { space: ['Space', 'Luar Angkasa', '#E9E1F7'], sea: ['Under the Sea', 'Bawah Laut', '#DCEBFA'], garden: ['Garden', 'Kebun', '#DDF2E4'], fantasy: ['Fantasy', 'Dunia Dongeng', '#FBE0E6'], vehicles: ['Vehicles', 'Kendaraan', '#FFE9DA'], weather: ['Weather', 'Cuaca', '#FFF1C7'] };
  // celebration themes belong to the student (all their programs); drawn in the Rewards tab of a program's settings
  ui.themeCards = function () {
    var kid = ui.student(), st = D.store.student(kid.id);
    return '<div class="dtt-blk">' + ui.lab(T('Celebration Themes', 'Tema Perayaan'), st.themes.length ? T('All of ' + kid.name + '\'s programs', 'Semua program ' + kid.name) : T('None chosen = all six', 'Tidak dipilih = keenamnya')) + '<div class="dtt-themecards">' + DEF.THEMES.map(function (k) {
      var on = st.themes.indexOf(k) >= 0, chars = D.themes ? D.themes.chosen([k])[0].characters.slice(0, 3) : [];
      return '<button type="button" class="dtt-themecard' + (on ? ' on' : '') + '" style="--th:' + THEMES[k][2] + '" aria-pressed="' + on + '" data-a="themeTog" data-v="' + k + '">' +
        '<span class="dtt-themeart" aria-hidden="true">' + chars.map(function (c) { return D.themes.svg(c, 'dtt-char'); }).join('') + (on ? '<span class="dtt-themetick">✓</span>' : '') + '</span>' +
        '<span class="dtt-themename">' + esc(T(THEMES[k][0], THEMES[k][1])) + '</span></button>';
    }).join('') + '</div></div>';
  };
  var PKEY = 'lu_dtt_prefs';
  ui.prefs = function () { var v = null; try { v = JSON.parse(localStorage.getItem(PKEY)); } catch (e) { } return Object.assign({}, DEF.DEF_PREFS, v || {}); };
  function savePrefs(p) { try { localStorage.setItem(PKEY, JSON.stringify(p)); } catch (e) { } }
  function viewSettings() {
    var kid = ui.student(), st = D.store.student(kid.id), pf = ui.prefs();
    var ids = X.S().profiles.map(function (x) { return x.id; }), orphans = D.store.orphanIds(ids);
    function psw(k, title, desc) { return ui.sw(k, pf[k], title, desc, 'prefTog'); }
    function pseg(k, opts) { return ui.seg(k, pf[k], opts).replace(/data-a="set"/g, 'data-a="prefSet"'); }
    // one tidy column: this device, then deleting data on its own at the bottom (reward photos are in each program's Rewards settings)
    function grp(icon, tint, title, sub, inner, cls) {
      return '<section class="dtt-sgroup' + (cls ? ' ' + cls : '') + '"><div class="dtt-sghead"><span class="dtt-sgico" style="background:' + tint + '" aria-hidden="true">' + icon + '</span><div><h2 class="dtt-h2">' + esc(title) + '</h2>' + (sub ? '<small>' + esc(D.i18n.fill(sub)) + '</small>' : '') + '</div></div>' + inner + '</section>';
    }
    var device = '<div class="dtt-srows">' +
      '<div class="dtt-srow">' + psw('sfx', T('Sounds', 'Suara'), T('Chimes for correct answers and rewards', 'Bunyi untuk jawaban benar dan reward')) + '</div>' +
      (pf.sfx ? '<div class="dtt-srow split"><span class="dtt-swtx"><b>' + esc(T('Volume', 'Volume')) + '</b></span>' + pseg('vol', [['soft', T('Soft', 'Pelan')], ['medium', T('Medium', 'Sedang')], ['loud', T('Loud', 'Keras')]]) + '</div>' : '') +
      '<div class="dtt-srow">' + psw('hold', T('Hold to Press Teacher Buttons', 'Tahan untuk Menekan Tombol Guru'), T('Stops a student scoring by tapping', 'Mencegah anak menekan tombol nilai')) + '</div>' +
      '<div class="dtt-srow">' + psw('reduce', T('Reduce Motion', 'Kurangi Gerakan'), T('Calmer animations', 'Animasi lebih tenang')) + '</div></div>';
    var del = '<div class="dtt-srows"><div class="dtt-srow split"><span class="dtt-swtx"><b>' + esc(T('Delete ' + kid.name + '\'s DTT Data', 'Hapus Data DTT ' + kid.name)) + '</b><small>' + esc(T('Programs, progress and reward photos', 'Program, kemajuan, dan foto reward')) + '</small></span><button type="button" class="dtt-btn danger sm" data-a="askWipe" data-v="' + esc(kid.id) + '">' + esc(T('Delete…', 'Hapus…')) + '</button></div>' +
      orphans.map(function (id) { return '<div class="dtt-srow split"><span class="dtt-swtx"><b>' + esc(T('Data from a removed profile', 'Data dari profil yang dihapus')) + '</b></span><button type="button" class="dtt-btn danger sm" data-a="askWipe" data-v="' + esc(id) + '">' + esc(T('Delete…', 'Hapus…')) + '</button></div>'; }).join('') + '</div>';
    var ICD = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2B2A35" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="2.5" width="12" height="19" rx="2.5"/><path d="M11 18h2"/></svg>';
    var ICX = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B23A4E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13"/></svg>';
    return '<div class="dtt-pagehead"><h1 class="dtt-h1">' + esc(T('Settings', 'Pengaturan')) + '</h1></div><div class="dtt-settings">' +
      grp(ICD, '#DCEBFA', T('This Device', 'Perangkat Ini'), T('Applies to all students', 'Berlaku untuk semua anak'), device) +
      grp(ICX, '#FBE0E6', T('Delete Data', 'Hapus Data'), '', del, 'danger') + '</div>';
  }
  ACT.themeTog = function (b) { var sid = ui.student().id, st = D.store.student(sid), i = st.themes.indexOf(b.dataset.v); if (i >= 0) st.themes.splice(i, 1); else st.themes.push(b.dataset.v); ui.touchStudent(sid); ui.render(); };
  INP.reinfPhoto = function (el) {
    var files = Array.prototype.slice.call(el.files || []), sid = ui.student().id; el.value = '';
    if (!files.length || !ui.photoRoom(files.length)) return;
    if (files.length === 1) return ui.cropper(files[0], function (blob) { D.store.uploadImage('reinforcers', blob).then(function (m) { m.name = (files[0].name || '').replace(/\.[^.]+$/, '').slice(0, 30); D.store.student(sid).photos.push(m); ui.touchStudent(sid); ui.render(); }, ui.photoError); });
    files.reduce(function (c, f) {
      return c.then(function () { return D.photo.open(f); }).then(function (img) { return D.photo.compress(img, {}); }).then(function (blob) { return D.store.uploadImage('reinforcers', blob); }).then(function (m) { D.store.student(sid).photos.push(m); }).catch(ui.photoError);
    }, Promise.resolve()).then(function () { ui.touchStudent(sid); ui.render(); });
  };
  ACT.delReinf = function (b) {
    var sid = ui.student().id, st = D.store.student(sid), m = st.photos.filter(function (x) { return x.id === b.dataset.v; })[0];
    st.photos = st.photos.filter(function (x) { return x !== m; }); D.store.dropImages([m]); ui.touchStudent(sid); ui.render();
  };
  ACT.askWipe = function (b) {
    var sid = b.dataset.v, kid = X.S().profiles.filter(function (x) { return x.id === sid; })[0], n = D.store.programs(sid).length;
    var sh = X.sheet(ui.dlg({ title: T('Delete ' + (kid ? kid.name + '\'s' : 'this') + ' DTT data?', 'Hapus data DTT ' + (kid ? kid.name : 'ini') + '?'),
      body: '<p class="dtt-dlgp">' + esc(T(n + ' programs, their progress and sessions, themes and reward photos are deleted. Stimulus sets stay. This cannot be undone.', n + ' program, kemajuan dan %sessions%-nya, tema, dan foto reward dihapus. Stimulus set tetap ada. Ini tidak bisa dibatalkan.')) + '</p>',
      foot: '<button type="button" class="dtt-btn sec" data-x>' + esc(T('Cancel', 'Batal')) + '</button><button type="button" class="dtt-btn danger" data-go>' + esc(T('Delete', 'Hapus')) + '</button>' }));
    closeOn(sh);
    sh.el.addEventListener('click', function (e) {
      var t = e.target.closest('[data-go]'); if (!t) return; t.disabled = true;
      D.store.deleteStudentData(sid).then(function () { sh.close(); X.toast(T('The DTT data was deleted.', 'Data DTT sudah dihapus.')); ui.render(); }, function () { t.disabled = false; X.toast(T('It was not deleted. Check your connection.', 'Belum terhapus. Cek koneksi internetmu.')); });
    });
  };
  ACT.prefTog = function (b) { var p = ui.prefs(); p[b.dataset.k] = !p[b.dataset.k]; savePrefs(p); ui.render(); };
  ACT.prefSet = function (b) { var p = ui.prefs(); p[b.dataset.k] = b.dataset.v; savePrefs(p); ui.render(); };

  ui.VIEWS.programs = viewPrograms;
  ui.VIEWS.program = viewProgram;
  ui.VIEWS.settings = viewSettings;
})();
