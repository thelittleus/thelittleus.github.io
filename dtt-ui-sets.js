/* Little Us · DTT · stimulus sets: the library (My Sets and Little Us sets), one set as a grid with an editor beside it,
   and Add Stimulus (typed text, uploaded photos; illustrations are coming soon). */
(function () {
  'use strict';
  var D = window.LUDtt, X = LUTools.api, P = D.programs, T = D.i18n.T, esc = X.esc, ui = D.ui, U = ui.U, ACT = ui.ACT, INP = ui.INP, LIB = D.library;
  function L() { return D.i18n.lang() === 'id' ? 1 : 0; }
  function x(label) { return '<button type="button" class="dtt-x" data-x aria-label="' + esc(T('Close', 'Tutup')) + '">✕</button>'; }
  function kindOf(items) {
    var ph = 0, tx = 0, sw = 0;
    (items || []).forEach(function (i) { var m = i.images[0]; if (!m) return; if (m.path) ph++; else if (m.lib && LIB.isText(m.lib)) tx++; else sw++; });
    var k = [];
    if (ph) k.push(T('Photos', 'Foto')); if (tx) k.push(T('Text', 'Teks')); if (sw) k.push(T('Pictures', 'Gambar'));
    return k.join(' + ') || T('Empty', 'Kosong');
  }
  function preview(items) {
    var its = (items || []).slice(0, 4);
    return '<span class="dtt-setprev' + (its.length === 1 ? ' one' : '') + '" aria-hidden="true">' + (its.length ? its.map(function (i) { return '<span>' + (i.images[0] ? ui.img(i.images[0], '') : '') + '</span>'; }).join('') : '<span class="dtt-noimg"></span>') + '</span>';
  }
  function libItemsAsSet(l) { return l.items.map(function (it) { return { images: it.images.map(function (r) { return { lib: r }; }) }; }); }
  function photoMeter() { return '<p class="dtt-hint">' + esc(T('Photos uploaded: ' + D.store.photoCount() + ' of ' + D.store.photoLimit(), 'Foto terunggah: ' + D.store.photoCount() + ' dari ' + D.store.photoLimit())) + '</p>'; }

  /* ---------- the library ---------- */
  function viewSets() {
    var q = (U.setQ || '').toLowerCase(), tab = U.setTab || 'mine';
    var head = '<div class="dtt-pagehead"><h1 class="dtt-h1">' + esc(T('Stimulus Sets', 'Stimulus Set')) + '</h1><div class="dtt-headr"><button type="button" class="dtt-btn primary" data-a="newSet">' + esc(T('+ New Set', '+ Set Baru')) + '</button></div></div>' +
      '<div class="dtt-libbar"><label class="dtt-search"><span aria-hidden="true">⌕</span><input type="search" placeholder="' + esc(T('Search sets', 'Cari set')) + '" value="' + esc(U.setQ || '') + '" data-in="setQ" aria-label="' + esc(T('Search sets', 'Cari set')) + '"></label>' +
      '<div class="dtt-tabs" role="tablist"><button type="button" role="tab" aria-selected="' + (tab === 'mine') + '" class="' + (tab === 'mine' ? 'on' : '') + '" data-a="setTab" data-v="mine">' + esc(T('My Sets', 'Set Saya')) + '</button><button type="button" role="tab" aria-selected="' + (tab === 'lu') + '" class="' + (tab === 'lu' ? 'on' : '') + '" data-a="setTab" data-v="lu">' + esc(T('Little Us Library', 'Pustaka Little Us')) + '</button></div></div>';
    if (tab === 'lu') {
      var f = U.libF || 'all';
      var libs = LIB.sets.filter(function (l) { return (f === 'all' || l.kind === f) && (!q || l.name[L()].toLowerCase().indexOf(q) >= 0); });
      return head + '<div class="tl-seg dtt-seg sm" role="group">' + [['all', T('All', 'Semua')], ['text', T('Text', 'Teks')], ['swatch', T('Swatches', 'Warna')]].map(function (o) { return '<button type="button" class="' + (f === o[0] ? 'on' : '') + '" aria-pressed="' + (f === o[0]) + '" data-a="libF" data-v="' + o[0] + '">' + esc(o[1]) + '</button>'; }).join('') + '</div>' +
        '<div class="dtt-setgrid">' + libs.map(function (l) {
          return '<button type="button" class="dtt-setcard" data-a="libPreview" data-v="' + l.id + '">' + preview(libItemsAsSet(l)) + '<b>' + esc(l.name[L()]) + '</b><small>' + esc(l.items.length + ' · ' + (l.kind === 'text' ? T('Text', 'Teks') : T('Swatches', 'Warna'))) + '</small></button>';
        }).join('') + '</div>' + '<p class="dtt-hint">' + esc(T('More ready-made sets are on the way.', 'Set siap pakai lainnya segera hadir.')) + '</p>';
    }
    var sets = D.store.sets().filter(function (s) { return !q || (s.name || '').toLowerCase().indexOf(q) >= 0; });
    return head + '<div class="dtt-setgrid">' + sets.map(function (s) {
      var used = D.store.programsUsingSet(s.id).length;
      return '<div class="dtt-setcard"><button type="button" class="dtt-setopen" data-a="openSet" data-id="' + s.id + '" aria-label="' + esc(T('Open ', 'Buka ') + (s.name || '')) + '"></button>' + preview(s.items) + '<b>' + esc(s.name || T('Untitled Set', 'Set Tanpa Nama')) + '</b><small>' + esc(s.items.length + ' · ' + kindOf(s.items) + ' · ' + (used ? T(used + (used === 1 ? ' program' : ' programs'), used + ' program') : T('Not used', 'Belum dipakai'))) + '</small>' +
        '<button type="button" class="dtt-more" data-a="setMenu" data-id="' + s.id + '" aria-label="' + esc(T('More', 'Lainnya')) + '">•••</button></div>';
    }).join('') + '<button type="button" class="dtt-setcard add" data-a="newSet"><span aria-hidden="true">+</span><b>' + esc(T('New Set', 'Set Baru')) + '</b></button></div>' +
      '<div class="dtt-libpromo"><div><b>' + esc(T('Ready-made sets from Little Us', 'Set siap pakai dari Little Us')) + '</b><small>' + esc(T('Colours, numbers 1–10 and letters A–Z.', 'Warna, angka 1–10, dan huruf A–Z.')) + '</small></div><button type="button" class="dtt-btn sm" data-a="setTab" data-v="lu">' + esc(T('Browse Library', 'Lihat Pustaka')) + '</button></div>' + photoMeter();
  }
  INP.setQ = function (el) { U.setQ = el.value; var pos = el.selectionStart; ui.render(); var n = document.querySelector('[data-in="setQ"]'); if (n) { n.focus(); try { n.setSelectionRange(pos, pos); } catch (e) { } } };
  ACT.setTab = function (b) { U.setTab = b.dataset.v; U.view = 'sets'; ui.render(); };
  ACT.libF = function (b) { U.libF = b.dataset.v; ui.render(); };
  ACT.newSet = function () {
    ui.newSetFlow('', function (s) { U.setId = s.id; U.view = 'set'; U.item = null; ui.render(); window.scrollTo(0, 0); });
  };
  ACT.openSet = function (b) { U.setId = b.dataset.id; U.view = 'set'; U.item = null; ui.render(); window.scrollTo(0, 0); };

  // the ••• menu on a set card
  ACT.setMenu = function (b) {
    var s = D.store.set(b.dataset.id), used = D.store.programsUsingSet(s.id).length;
    var sh = X.sheet('<div class="dtt-dlg"><div class="dtt-dlghead"><h2>' + esc(s.name || T('Untitled Set', 'Set Tanpa Nama')) + '</h2>' + x() + '</div><div class="dtt-menu">' +
      '<button type="button" data-do="rename">✎ ' + esc(T('Rename', 'Ganti Nama')) + '</button><button type="button" data-do="dup">⧉ ' + esc(T('Duplicate', 'Duplikat')) + '</button><button type="button" data-do="use">▶ ' + esc(T('Use in a Program', 'Pakai di Program')) + '</button>' +
      '<button type="button" class="danger" data-do="del"' + (used ? ' disabled' : '') + '>🗑 ' + esc(T('Delete…', 'Hapus…')) + '</button>' + (used ? '<p class="dtt-hint">' + esc(T('Used by ' + used + (used === 1 ? ' program' : ' programs') + '. Delete those first.', 'Dipakai ' + used + ' program. Hapus programnya dulu.')) + '</p>' : '') + '</div></div>');
    sh.el.addEventListener('click', function (e) {
      var t = e.target.closest('button'); if (!t || t.disabled) return;
      if (t.hasAttribute('data-x')) return sh.close();
      var d = t.dataset.do; if (!d) return; sh.close();
      if (d === 'rename') { U.setId = s.id; U.view = 'set'; U.item = null; U.focusName = true; ui.render(); }
      if (d === 'dup') D.store.addSet(s.name + ' ' + T('(copy)', '(salinan)')).then(function (c) { c.items = JSON.parse(JSON.stringify(s.items)).map(function (i) { i.id = P.uuid(); i.images = i.images.filter(function (m) { return m.lib; }); return i; }).filter(function (i) { return i.images.length; }); return D.store.saveSet(c); }).then(function () { ui.render(); X.toast(T('Duplicated. Uploaded photos stay with the original.', 'Diduplikat. Foto unggahan tetap di set asli.')); }, function () { X.toast(T('It was not duplicated. Check your connection.', 'Belum terduplikat. Periksa koneksi.')); });
      if (d === 'use') useInProgram(s);
      if (d === 'del') confirmDelete(s);
    });
  };
  function confirmDelete(s) {
    var sh = X.sheet('<div class="dtt-dlg"><div class="dtt-dlghead"><h2>' + esc(T('Delete "' + (s.name || T('Untitled Set', 'Set Tanpa Nama')) + '"?', 'Hapus "' + (s.name || 'set') + '"?')) + '</h2>' + x() + '</div><p class="dtt-dlgp">' + esc(T('Its ' + s.items.length + ' stimuli and uploaded photos are deleted. This cannot be undone.', s.items.length + ' stimulus dan foto unggahannya ikut terhapus. Ini tidak bisa dibatalkan.')) + '</p>' +
      '<div class="dtt-dlgbtns"><button type="button" class="dtt-btn" data-x>' + esc(T('Cancel', 'Batal')) + '</button><button type="button" class="dtt-btn danger" data-go>' + esc(T('Delete Set', 'Hapus Set')) + '</button></div></div>');
    sh.el.addEventListener('click', function (e) {
      var t = e.target.closest('button'); if (!t) return;
      if (t.hasAttribute('data-x')) return sh.close();
      if (t.hasAttribute('data-go')) D.store.deleteSet(s).then(function () { sh.close(); U.view = 'sets'; ui.render(); }, function () { X.toast(T('The set was not deleted. Check your connection.', 'Set belum dihapus. Periksa koneksi.')); });
    });
  }
  function useInProgram(s) {
    ACT.newProgram();
    if (U.wizard) { var p = U.wizard.p; p.setId = s.id; P.syncQueue(p, s); if (!p.name) p.name = s.name || ''; if (ui.wizardRedraw) ui.wizardRedraw(); }
  }
  // a Little Us set becomes the teacher's own copy, so it can be edited
  function copyLib(l) {
    return D.store.addSet(l.name[L()]).then(function (s) { P.importFromLibrary(s, l, l.items.map(function (i) { return i.id; }), D.i18n.lang()); return D.store.saveSet(s).then(function () { return s; }); });
  }
  ACT.libPreview = function (b) {
    var l = LIB.sets.filter(function (z) { return z.id === b.dataset.v; })[0];
    var sh = X.sheet('<div class="dtt-dlg wide"><div class="dtt-dlghead"><div><h2>' + esc(l.name[L()]) + '</h2><p class="dtt-hint">Little Us · ' + l.items.length + '</p></div>' + x() + '</div>' +
      '<div class="dtt-stimgrid sm">' + l.items.map(function (it) { return '<span class="dtt-stim"><span class="dtt-stimimg"><img alt="" src="' + esc(LIB.src(it.images[0])) + '"></span><span>' + esc(it.labels[L()]) + '</span></span>'; }).join('') + '</div>' +
      '<div class="dtt-dlgbtns"><button type="button" class="dtt-btn" data-copy>' + esc(T('Copy to My Sets', 'Salin ke Set Saya')) + '</button><button type="button" class="dtt-btn primary" data-use>' + esc(T('Use in a Program', 'Pakai di Program')) + '</button></div></div>', { wide: true });
    sh.el.addEventListener('click', function (e) {
      var t = e.target.closest('button'); if (!t) return;
      if (t.hasAttribute('data-x')) return sh.close();
      if (t.hasAttribute('data-copy') || t.hasAttribute('data-use')) {
        var use = t.hasAttribute('data-use'); t.disabled = true;
        copyLib(l).then(function (s) { sh.close(); if (use) useInProgram(s); else { U.setTab = 'mine'; ui.render(); X.toast(T('Added to My Sets.', 'Ditambahkan ke Set Saya.')); } }, function () { t.disabled = false; X.toast(T('It was not copied. Check your connection.', 'Belum tersalin. Periksa koneksi.')); });
      }
    });
  };

  /* ---------- choosing a set for a new program ---------- */
  ui.chooseSet = function (done) {
    var st = { q: '', f: 'all', pick: null }, sh = X.sheet('', { wide: true });
    function draw() {
      var q = st.q.toLowerCase(), mine = D.store.sets().filter(function (s) { return !q || (s.name || '').toLowerCase().indexOf(q) >= 0; }), libs = LIB.sets.filter(function (l) { return !q || l.name[L()].toLowerCase().indexOf(q) >= 0; });
      function card(key, name, meta, items) { var on = st.pick === key; return '<button type="button" class="dtt-setcard pick' + (on ? ' on' : '') + '" aria-pressed="' + on + '" data-pick="' + esc(key) + '">' + preview(items) + '<b>' + esc(name) + '</b><small>' + esc(meta) + '</small>' + (on ? '<i class="dtt-tick" aria-hidden="true">✓</i>' : '') + '</button>'; }
      var list = (st.f !== 'lu' && mine.length ? '<h3 class="dtt-sub">' + esc(T('My Sets', 'Set Saya')) + '</h3><div class="dtt-setgrid sm">' + mine.map(function (s) { return card('s:' + s.id, s.name || T('Untitled Set', 'Set Tanpa Nama'), s.items.length + ' · ' + kindOf(s.items), s.items); }).join('') + '</div>' : '') +
        (st.f !== 'mine' && libs.length ? '<h3 class="dtt-sub">' + esc(T('From Little Us', 'Dari Little Us')) + '</h3><div class="dtt-setgrid sm">' + libs.map(function (l) { return card('l:' + l.id, l.name[L()], l.items.length + ' · ' + (l.kind === 'text' ? T('Text', 'Teks') : T('Swatches', 'Warna')), libItemsAsSet(l)); }).join('') + '</div>' : '');
      var has = sh.el.querySelector('input'), pos = has ? has.selectionStart : null;
      sh.set('<div class="dtt-dlg wide"><div class="dtt-dlghead"><h2>' + esc(T('Choose a Set', 'Pilih Set')) + '</h2>' + x() + '</div>' +
        '<div class="dtt-libbar"><label class="dtt-search"><span aria-hidden="true">⌕</span><input type="search" value="' + esc(st.q) + '" placeholder="' + esc(T('Search sets', 'Cari set')) + '"></label><div class="tl-seg dtt-seg sm" role="group">' +
        [['all', T('All', 'Semua')], ['mine', T('My Sets', 'Set Saya')], ['lu', 'Little Us']].map(function (o) { return '<button type="button" class="' + (st.f === o[0] ? 'on' : '') + '" aria-pressed="' + (st.f === o[0]) + '" data-f="' + o[0] + '">' + esc(o[1]) + '</button>'; }).join('') + '</div></div>' +
        '<div class="dtt-dlgscroll">' + (list || '<p class="dtt-hint">' + esc(T('No sets match.', 'Tidak ada set yang cocok.')) + '</p>') + '</div>' +
        '<div class="dtt-dlgbtns"><button type="button" class="dtt-btn" data-x>' + esc(T('Cancel', 'Batal')) + '</button><button type="button" class="dtt-btn primary" data-go' + (st.pick ? '' : ' disabled') + '>' + esc(T('Use This Set', 'Pakai Set Ini')) + '</button></div></div>');
      ui.hydrate(sh.el);
      if (pos != null) { var n = sh.el.querySelector('input'); n.focus(); try { n.setSelectionRange(pos, pos); } catch (e) { } }
    }
    sh.el.addEventListener('input', function (e) { if (e.target.type === 'search') { st.q = e.target.value; draw(); } });
    sh.el.addEventListener('click', function (e) {
      var t = e.target.closest('button'); if (!t) return;
      if (t.hasAttribute('data-x')) return sh.close();
      if (t.dataset.f) { st.f = t.dataset.f; return draw(); }
      if (t.dataset.pick) { st.pick = t.dataset.pick; return draw(); }
      if (t.hasAttribute('data-go')) {
        var k = st.pick;
        if (k.indexOf('s:') === 0) { sh.close(); return done(D.store.set(k.slice(2))); }
        t.disabled = true;
        copyLib(LIB.sets.filter(function (l) { return 'l:' + l.id === k; })[0]).then(function (s) { sh.close(); done(s); }, function () { t.disabled = false; X.toast(T('It was not copied. Check your connection.', 'Belum tersalin. Periksa koneksi.')); });
      }
    });
    draw();
  };

  // a new set: its name, then straight into Add Stimulus. done(set) once something is in it.
  ui.newSetFlow = function (name, done) {
    var sh = X.sheet('<div class="dtt-dlg"><div class="dtt-dlghead"><h2>' + esc(T('New Set', 'Set Baru')) + '</h2>' + x() + '</div>' +
      '<label class="dtt-field"><span>' + esc(T('Set Name', 'Nama Set')) + '</span><input type="text" maxlength="60" value="' + esc(name || '') + '" placeholder="' + esc(T('Animals', 'Hewan')) + '" autofocus></label>' +
      '<div class="dtt-field"><span>' + esc(T('Add Stimulus', 'Tambah Stimulus')) + '</span>' + addOptions() + '</div></div>');
    sh.el.addEventListener('click', function (e) {
      var t = e.target.closest('button'); if (!t) return;
      if (t.hasAttribute('data-x')) return sh.close();
      if (t.dataset.how) {
        var how = t.dataset.how, nm = sh.el.querySelector('input').value.trim();
        t.disabled = true;
        D.store.addSet(nm).then(function (s) { sh.close(); ui.addStimulus(s, how, function () { done(s); }); }, function () { t.disabled = false; X.toast(T('The set was not created. Check your connection.', 'Set belum dibuat. Periksa koneksi.')); });
      }
    });
  };
  function addOptions() {
    return '<div class="dtt-addopts"><button type="button" class="dtt-addopt" data-how="text"><span class="dtt-addico" aria-hidden="true">Aa</span><b>' + esc(T('Type Text', 'Ketik Teks')) + '</b><small>' + esc(T('Words, numbers, letters', 'Kata, angka, huruf')) + '</small></button>' +
      '<button type="button" class="dtt-addopt" data-how="photos"><span class="dtt-addico" aria-hidden="true">▣</span><b>' + esc(T('Upload Photos', 'Unggah Foto')) + '</b><small>' + esc(T('From your device', 'Dari perangkatmu')) + '</small></button>' +
      '<button type="button" class="dtt-addopt soon" data-how="illus"><span class="dtt-addico" aria-hidden="true">★</span><b>' + esc(T('Illustrations', 'Ilustrasi')) + '</b><small>' + esc(T('Coming soon', 'Segera hadir')) + '</small></button></div>';
  }

  /* ---------- one set: a grid, and the chosen stimulus beside it ---------- */
  function viewSet() {
    var s = D.store.set(U.setId), used = D.store.programsUsingSet(s.id).length, it = U.item ? P.itemById(s, U.item) : null;
    var head = '<button type="button" class="dtt-back" data-a="setTab" data-v="mine">‹ ' + esc(T('Stimulus Sets', 'Stimulus Set')) + '</button>' +
      '<div class="dtt-pagehead"><div class="dtt-titlewrap"><input class="dtt-titleinput" type="text" maxlength="60" value="' + esc(s.name) + '" placeholder="' + esc(T('Untitled Set', 'Set Tanpa Nama')) + '" data-in="setName" data-id="' + s.id + '" aria-label="' + esc(T('Set name', 'Nama set')) + '"><span class="dtt-hint">' + esc(used ? T('Used by ' + used + (used === 1 ? ' program' : ' programs'), 'Dipakai ' + used + ' program') : T('Not used yet', 'Belum dipakai')) + '</span></div>' +
      '<div class="dtt-headr"><button type="button" class="dtt-btn primary" data-a="addStim" data-id="' + s.id + '">' + esc(T('+ Add Stimulus', '+ Tambah Stimulus')) + '</button></div></div>';
    if (!s.items.length) return head + '<div class="dtt-empty dtt-setempty"><h2 class="dtt-h2">' + esc(T('Add your first stimulus', 'Tambahkan stimulus pertama')) + '</h2>' + addOptions().replace(/data-how=/g, 'data-a="addStimHow" data-id="' + s.id + '" data-v=') + '<p class="dtt-hint">' + esc(T('You can mix types in one set.', 'Satu set bisa berisi beberapa jenis.')) + ' <button type="button" class="tl-link" data-a="setTab" data-v="lu">' + esc(T('Or use a ready-made set', 'Atau pakai set siap pakai')) + '</button></p></div>' + deleteRow(s, used);
    return head + '<div class="dtt-setwrap' + (it ? ' open' : '') + '"><div class="dtt-stimgrid">' + s.items.map(function (i) {
      var on = it && it.id === i.id;
      return '<button type="button" class="dtt-stim' + (on ? ' on' : '') + '" data-a="pickItem" data-v="' + i.id + '" aria-pressed="' + !!on + '"><span class="dtt-stimimg">' + (i.images[0] ? ui.img(i.images[0], '') : '<span class="dtt-noimg"></span>') + '</span><span>' + esc(i.labels.primary || T('No label', 'Tanpa label')) + '</span></button>';
    }).join('') + '</div>' + (it ? itemPanel(s, it) : '') + '</div>' + photoMeter() + deleteRow(s, used);
  }
  function deleteRow(s, used) {
    return used ? '' : '<div class="dtt-progfoot"><button type="button" class="dtt-btn quiet sm danger" data-a="delSet" data-id="' + s.id + '">🗑 ' + esc(T('Delete Set', 'Hapus Set')) + '</button></div>';
  }
  ACT.delSet = function (b) { confirmDelete(D.store.set(b.dataset.id)); };
  ACT.pickItem = function (b) { U.item = U.item === b.dataset.v ? null : b.dataset.v; ui.render(); if (U.item && window.innerWidth < 760) { var pn = document.querySelector('.dtt-itempanel'); if (pn) pn.scrollIntoView({ block: 'start', behavior: 'smooth' }); } };
  ACT.addStim = function (b) { ui.addStimulus(D.store.set(b.dataset.id), 'text'); };
  ACT.addStimHow = function (b) { ui.addStimulus(D.store.set(b.dataset.id), b.dataset.v); };
  ui.afterRender.push(function (root) { if (U.focusName) { U.focusName = false; var n = root.querySelector('.dtt-titleinput'); if (n) { n.focus(); n.select(); } } });

  function itemPanel(s, i) {
    var a = 'data-set="' + s.id + '" data-item="' + i.id + '"', m = i.images[0], isText = m && m.lib && LIB.isText(m.lib), others = s.items.filter(function (o) { return o.id !== i.id; });
    var never = (i.doNotPairWith || []).map(function (id) { var o = P.itemById(s, id); return o ? '<button type="button" class="dtt-chip on" data-a="pairTog" data-v="' + id + '" ' + a + '>' + esc(o.labels.primary || '?') + ' ✕</button>' : ''; }).join('');
    return '<aside class="dtt-itempanel"><div class="dtt-itemimg">' + (m ? ui.img(m, i.labels.primary) : '<span class="dtt-noimg"></span>') + '</div>' +
      (isText ? '<div class="tl-seg dtt-seg sm" role="group">' + [['plain', T('Plain', 'Biasa')], ['large', T('Large', 'Besar')], ['coloured', T('Coloured', 'Berwarna')]].map(function (o) { var on = LIB.styleOf(m.lib) === o[0]; return '<button type="button" class="' + (on ? 'on' : '') + '" aria-pressed="' + on + '" data-a="textStyle" data-v="' + o[0] + '" ' + a + '>' + esc(o[1]) + '</button>'; }).join('') + '</div>'
        : '<label class="dtt-btn sm block dtt-file">' + esc(T('Change Image', 'Ganti Gambar')) + '<input type="file" accept="image/*,.heic,.heif" data-in="itemImg" data-on="change" ' + a + '></label>') +
      '<label class="dtt-field"><span>' + esc(T('Label', 'Label')) + '</span><input type="text" value="' + esc(i.labels.primary) + '" data-in="itemLabel" data-k="primary" ' + a + '></label>' +
      '<p class="dtt-hint">' + esc(T('What you say. It never shows on the card.', 'Yang kamu ucapkan. Tidak tampil di kartu.')) + '</p>' +
      (others.length ? '<div class="dtt-field"><span>' + esc(T('Never Show With', 'Jangan Tampil Bersama')) + '</span><div class="dtt-chips">' + never + '<button type="button" class="dtt-chip add" data-a="pairAdd" ' + a + '>+ ' + esc(T('Add', 'Tambah')) + '</button></div></div>' : '') +
      '<label class="dtt-field"><span>' + esc(T('Categories', 'Kategori')) + '</span><input type="text" value="' + esc((i.tags || []).join(', ')) + '" data-in="itemTags" ' + a + ' placeholder="' + esc(T('animal, pet', 'hewan, peliharaan')) + '"></label>' +
      (m && m.path ? ui.sw('people', !!m.people, T('This picture shows a person', 'Gambar ini menampilkan orang'), '', 'peopleTog').replace('data-k="people"', 'data-k="people" data-v="' + m.id + '" ' + a) +
        (m.people ? '<div class="tl-seg dtt-seg sm" role="group">' + [['one', T('One student', 'Satu anak')], ['all', T('All my students', 'Semua anakku')]].map(function (c) { return '<button type="button" class="' + (m.consent === c[0] ? 'on' : '') + '" aria-pressed="' + (m.consent === c[0]) + '" data-a="consent" data-k="' + c[0] + '" data-v="' + m.id + '" ' + a + '>' + esc(c[1]) + '</button>'; }).join('') + '</div>' : '') : '') +
      '<button type="button" class="dtt-btn quiet sm danger" data-a="delItem" ' + a + ' data-confirm="' + esc(T('Tap again to delete', 'Ketuk lagi untuk menghapus')) + '">🗑 ' + esc(T('Delete Stimulus', 'Hapus Stimulus')) + '</button></aside>';
  }
  function locate(el) { var s = D.store.set(el.dataset.set || el.dataset.id); return { s: s, i: s && P.itemById(s, el.dataset.item) }; }
  function syncDraft(s) { var p = U.wizard && U.wizard.p; if (p && p.setId === s.id) P.syncQueue(p, s); D.store.programsUsingSet(s.id).forEach(function (q) { P.syncQueue(q, s); }); }
  ui.syncDraft = syncDraft;

  INP.setName = function (el) { var s = D.store.set(el.dataset.id); s.name = el.value; ui.touchSet(s); };
  INP.itemLabel = function (el) {
    var f = locate(el), m = f.i.images[0]; f.i.labels[el.dataset.k] = el.value;
    if (m && m.lib && LIB.isText(m.lib)) m.lib = LIB.textRef(LIB.styleOf(m.lib), el.value || ' ');
    ui.touchSet(f.s);
    var tile = document.querySelector('.dtt-stim.on span:last-child'); if (tile) tile.textContent = el.value;
  };
  INP.itemTags = function (el) { var f = locate(el); f.i.tags = el.value.split(',').map(function (t) { return t.trim(); }).filter(Boolean); ui.touchSet(f.s); };
  ACT.textStyle = function (b) { var f = locate(b), m = f.i.images[0]; m.lib = LIB.textRef(b.dataset.v, LIB.textOf(m.lib)); ui.touchSet(f.s); ui.render(); };
  ACT.delItem = function (b) {
    var f = locate(b); D.store.dropImages(f.i.images.filter(function (m) { return m.path; }));
    f.s.items = f.s.items.filter(function (z) { return z !== f.i; });
    f.s.items.forEach(function (z) { z.doNotPairWith = (z.doNotPairWith || []).filter(function (id) { return id !== f.i.id; }); });
    U.item = null; syncDraft(f.s); ui.touchSet(f.s); ui.render();
  };
  function flip(a1, b1) { a1.doNotPairWith = a1.doNotPairWith || []; var n = a1.doNotPairWith.indexOf(b1); if (n >= 0) a1.doNotPairWith.splice(n, 1); else a1.doNotPairWith.push(b1); }
  ACT.pairTog = function (b) { var f = locate(b), id = b.dataset.v, o = P.itemById(f.s, id); flip(f.i, id); if (o) flip(o, f.i.id); ui.touchSet(f.s); ui.render(); };
  ACT.pairAdd = function (b) {
    var f = locate(b), opts = f.s.items.filter(function (o) { return o.id !== f.i.id && (f.i.doNotPairWith || []).indexOf(o.id) < 0; });
    var sh = X.sheet('<div class="dtt-dlg"><div class="dtt-dlghead"><h2>' + esc(T('Never show "' + f.i.labels.primary + '" with', 'Jangan tampilkan "' + f.i.labels.primary + '" bersama')) + '</h2>' + x() + '</div><div class="dtt-chips">' +
      opts.map(function (o) { return '<button type="button" class="dtt-chip" data-o="' + o.id + '">' + esc(o.labels.primary || '?') + '</button>'; }).join('') + '</div></div>');
    sh.el.addEventListener('click', function (e) { var t = e.target.closest('button'); if (!t) return; if (t.hasAttribute('data-x')) return sh.close(); if (t.dataset.o) { var o = P.itemById(f.s, t.dataset.o); flip(f.i, o.id); flip(o, f.i.id); ui.touchSet(f.s); sh.close(); ui.render(); } });
  };
  ACT.peopleTog = function (b) { var f = locate(b), m = f.i.images.filter(function (z) { return z.id === b.dataset.v; })[0]; m.people = !m.people; if (m.people && !m.consent) m.consent = 'one'; if (!m.people) delete m.consent; ui.touchSet(f.s); ui.render(); };
  ACT.consent = function (b) { var f = locate(b), m = f.i.images.filter(function (z) { return z.id === b.dataset.v; })[0]; m.consent = b.dataset.k; ui.touchSet(f.s); ui.render(); };
  INP.itemImg = function (el) {
    var f = locate(el), file = el.files && el.files[0]; el.value = '';
    if (!file || !ui.photoRoom(1)) return;
    ui.cropper(file, function (blob) {
      D.store.uploadImage(f.s.id, blob).then(function (m) { D.store.dropImages(f.i.images.filter(function (z) { return z.path; }).slice(0, 1)); f.i.images[0] = m; ui.touchSet(f.s); ui.render(); }, ui.photoError);
    });
  };

  /* ---------- Add Stimulus ---------- */
  function labelFromFile(name) {
    var base = String(name || '').replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim();
    return /^(img|dsc|pxl|photo|image|screenshot|whatsapp)\b/i.test(base) || /^\d[\d ]*$/.test(base) ? '' : base;
  }
  // how: 'text' | 'photos' | 'illus'. Nothing joins the set until "Add N to Set"; photos already uploaded are removed if the dialog closes first.
  ui.addStimulus = function (s, how, done) {
    var st = { how: how || 'text', texts: [''], style: 'plain', photos: [], busy: 0, added: false };
    var sh = X.sheet('', { wide: true, onClose: function () { if (!st.added) D.store.dropImages(st.photos.map(function (p) { return p.m; })); if (st.added && done) done(); } });
    function count() { return st.how === 'text' ? st.texts.filter(function (t) { return t.trim(); }).length : st.how === 'photos' ? st.photos.length : 0; }
    function draw(focusLast) {
      var n = count(), body;
      if (st.how === 'text') body = '<div class="dtt-textrows">' + st.texts.map(function (t, i) {
        return '<div class="dtt-textrow"><span class="dtt-stimimg sm">' + (t.trim() ? '<img alt="" src="' + esc(LIB.src(LIB.textRef(st.style, t))) + '">' : '') + '</span><input type="text" maxlength="40" value="' + esc(t) + '" data-i="' + i + '" placeholder="' + esc(i ? '' : T('Mum', 'Ibu')) + '" aria-label="' + esc(T('Stimulus ' + (i + 1), 'Stimulus ' + (i + 1))) + '">' + (st.texts.length > 1 ? '<button type="button" class="dtt-x sm" data-rm="' + i + '" aria-label="' + esc(T('Remove', 'Hapus')) + '">✕</button>' : '') + '</div>';
      }).join('') + '</div><p class="dtt-hint">' + esc(T('Press Enter for the next one, or paste a list.', 'Tekan Enter untuk yang berikutnya, atau tempel daftar.')) + '</p>' +
        '<div class="dtt-field"><span>' + esc(T('Card Style', 'Gaya Kartu')) + '</span><div class="tl-seg dtt-seg sm" role="group">' + [['plain', T('Plain', 'Biasa')], ['large', T('Large', 'Besar')], ['coloured', T('Coloured', 'Berwarna')]].map(function (o) { return '<button type="button" class="' + (st.style === o[0] ? 'on' : '') + '" aria-pressed="' + (st.style === o[0]) + '" data-style="' + o[0] + '">' + esc(o[1]) + '</button>'; }).join('') + '</div></div>';
      else if (st.how === 'photos') {
        var used = D.store.photoCount(), lim = D.store.photoLimit(), full = used + st.photos.length >= lim;
        body = (full ? '<div class="dtt-tip warn"><b>' + esc(T(used + st.photos.length + ' of ' + lim + ' photos used', used + st.photos.length + ' dari ' + lim + ' foto terpakai')) + '</b><br>' + esc(lim < D.defaults.PHOTO.maxLimit ? T('Little Us Plus holds up to 500, or use typed text instead.', 'Little Us Plus menyimpan hingga 500, atau pakai teks.') : T('Delete unused photos, or use typed text instead.', 'Hapus foto yang tidak dipakai, atau pakai teks.')) + '</div>' : '') +
          '<label class="dtt-drop' + (full ? ' off' : '') + '"><input type="file" accept="image/*,.heic,.heif" multiple data-files' + (full ? ' disabled' : '') + '><b>' + esc(T('Drop photos here or', 'Taruh foto di sini atau')) + '</b><span class="dtt-btn sm">' + esc(T('Choose Files', 'Pilih File')) + '</span></label>' +
          '<div class="dtt-textrows">' + st.photos.map(function (p, i) { return '<div class="dtt-textrow"><span class="dtt-stimimg sm"><img alt="" src="' + p.url + '"></span><input type="text" maxlength="40" value="' + esc(p.label) + '" data-p="' + i + '" placeholder="' + esc(T('Label', 'Label')) + '"><button type="button" class="dtt-x sm" data-prm="' + i + '" aria-label="' + esc(T('Remove', 'Hapus')) + '">✕</button></div>'; }).join('') +
          (st.busy ? '<div class="dtt-textrow busy"><span class="dtt-stimimg sm"></span><span>' + esc(T(st.busy + ' uploading…', st.busy + ' sedang diunggah…')) + '</span></div>' : '') + '</div>' +
          '<p class="dtt-hint">' + esc(T('Photos are made small before upload. Only add photos you have permission to use.', 'Foto diperkecil sebelum diunggah. Hanya tambahkan foto yang boleh kamu pakai.')) + '</p>';
      } else body = '<div class="dtt-empty sm"><span class="dtt-addico big" aria-hidden="true">★</span><h3 class="dtt-h2">' + esc(T('Illustrations are coming soon', 'Ilustrasi segera hadir')) + '</h3><p class="dtt-p">' + esc(T('A bank of Little Us pictures to pick from. For now, type text or upload photos.', 'Kumpulan gambar Little Us untuk dipilih. Untuk sekarang, ketik teks atau unggah foto.')) + '</p></div>';
      sh.set('<div class="dtt-dlg wide"><div class="dtt-dlghead"><div><h2>' + esc(T('Add Stimulus', 'Tambah Stimulus')) + '</h2><p class="dtt-hint">' + esc(s.name || T('Untitled Set', 'Set Tanpa Nama')) + '</p></div>' + x() + '</div>' +
        '<div class="dtt-tabs" role="tablist">' + [['text', T('Type Text', 'Ketik Teks')], ['photos', T('Upload Photos', 'Unggah Foto')], ['illus', T('Illustrations', 'Ilustrasi')]].map(function (o) { var on = st.how === o[0]; return '<button type="button" role="tab" aria-selected="' + on + '" class="' + (on ? 'on' : '') + '" data-how="' + o[0] + '">' + esc(o[1]) + (o[0] === 'illus' ? ' <span class="dtt-soon">' + esc(T('Soon', 'Segera')) + '</span>' : '') + '</button>'; }).join('') + '</div>' +
        '<div class="dtt-dlgscroll">' + body + '</div>' +
        '<div class="dtt-dlgbtns"><span class="dtt-hint">' + esc(T(n + (n === 1 ? ' stimulus' : ' stimuli'), n + ' stimulus')) + '</span><button type="button" class="dtt-btn primary" data-add' + (n && !st.busy ? '' : ' disabled') + '>' + esc(T('Add ' + n + ' to Set', 'Tambah ' + n + ' ke Set')) + '</button></div></div>');
      if (focusLast) { var ins = sh.el.querySelectorAll('[data-i]'); var li = ins[typeof focusLast === 'number' ? focusLast : ins.length - 1]; if (li) { li.focus(); var v = li.value.length; try { li.setSelectionRange(v, v); } catch (e) { } } }
    }
    function addFiles(files) {
      files = Array.prototype.slice.call(files || []).filter(function (f) { return /^image\//.test(f.type) || /\.(heic|heif)$/i.test(f.name); });
      if (!files.length) return;
      var room = D.store.photoLimit() - D.store.photoCount() - st.photos.length;
      if (room <= 0) { ui.photoRoom(files.length + st.photos.length); return; }
      if (files.length > room) { files = files.slice(0, room); ui.photoRoom(D.store.photoLimit()); }
      st.busy += files.length; draw();
      // one at a time, so a big batch does not use up a tablet's memory
      files.reduce(function (chain, f) {
        return chain.then(function () { return D.photo.open(f); }).then(function (img) { return D.photo.compress(img, {}); }).then(function (blob) {
          return D.store.uploadImage(s.id, blob).then(function (m) { st.photos.push({ m: m, url: URL.createObjectURL(blob), label: labelFromFile(f.name) }); });
        }).catch(ui.photoError).then(function () { st.busy--; if (sh.wrap.isConnected) draw(); });
      }, Promise.resolve());
    }
    sh.el.addEventListener('click', function (e) {
      var t = e.target.closest('button'); if (!t || t.disabled) return;
      if (t.hasAttribute('data-x')) return sh.close();
      if (t.dataset.how) { st.how = t.dataset.how; return draw(); }
      if (t.dataset.style) { st.style = t.dataset.style; return draw(); }
      if (t.dataset.rm) { st.texts.splice(Number(t.dataset.rm), 1); return draw(); }
      if (t.dataset.prm) { var gone = st.photos.splice(Number(t.dataset.prm), 1)[0]; D.store.dropImages([gone.m]); return draw(); }
      if (t.hasAttribute('data-add')) {
        if (st.how === 'text') st.texts.filter(function (z) { return z.trim(); }).forEach(function (z) { var it = P.newItem(z.trim()); it.images = [{ id: P.uuid(), lib: LIB.textRef(st.style, z.trim()) }]; s.items.push(it); });
        else st.photos.forEach(function (p) { var it = P.newItem(p.label.trim()); it.images = [p.m]; s.items.push(it); });
        st.added = true; syncDraft(s); ui.touchSet(s); sh.close(); U.item = null; ui.render();
        X.toast(T('Added to ' + (s.name || 'the set') + '.', 'Ditambahkan ke ' + (s.name || 'set') + '.'));
      }
    });
    sh.el.addEventListener('input', function (e) {
      var t = e.target;
      if (t.dataset.i != null) {
        var i = Number(t.dataset.i), parts = t.value.split(/\r?\n|\t/);
        if (parts.length > 1) { st.texts.splice.apply(st.texts, [i, 1].concat(parts.map(function (z) { return z.trim(); }).filter(Boolean))); return draw(true); }
        st.texts[i] = t.value;
        var img = t.parentNode.querySelector('.dtt-stimimg'); img.innerHTML = t.value.trim() ? '<img alt="" src="' + esc(LIB.src(LIB.textRef(st.style, t.value))) + '">' : '';
        var n = count(), btn = sh.el.querySelector('[data-add]'); btn.disabled = !n; btn.textContent = T('Add ' + n + ' to Set', 'Tambah ' + n + ' ke Set');
        sh.el.querySelector('.dtt-dlgbtns .dtt-hint').textContent = T(n + (n === 1 ? ' stimulus' : ' stimuli'), n + ' stimulus');
      }
      if (t.dataset.p != null) st.photos[Number(t.dataset.p)].label = t.value;
    });
    sh.el.addEventListener('paste', function (e) {
      var t = e.target; if (t.dataset.i == null) return;
      var txt = (e.clipboardData || window.clipboardData).getData('text');
      if (!/[\n,;\t]/.test(txt)) return;
      e.preventDefault();
      var i = Number(t.dataset.i), parts = txt.split(/[\n,;\t]+/).map(function (z) { return z.trim(); }).filter(Boolean);
      st.texts.splice.apply(st.texts, [i, 1].concat(parts)); st.texts.push(''); draw(true);
    });
    sh.el.addEventListener('keydown', function (e) {
      var t = e.target; if (e.key !== 'Enter' || t.dataset.i == null) return;
      e.preventDefault(); var i = Number(t.dataset.i);
      if (i === st.texts.length - 1) { if (!t.value.trim()) return; st.texts.push(''); draw(true); } else draw(i + 1);
    });
    sh.el.addEventListener('change', function (e) { if (e.target.hasAttribute('data-files')) { addFiles(e.target.files); e.target.value = ''; } });
    sh.el.addEventListener('dragover', function (e) { if (st.how === 'photos') { e.preventDefault(); var d = sh.el.querySelector('.dtt-drop'); if (d) d.classList.add('over'); } });
    sh.el.addEventListener('dragleave', function () { var d = sh.el.querySelector('.dtt-drop'); if (d) d.classList.remove('over'); });
    sh.el.addEventListener('drop', function (e) { if (st.how !== 'photos') return; e.preventDefault(); addFiles(e.dataTransfer.files); });
    draw(st.how === 'text');
  };

  ui.VIEWS.sets = viewSets;
  ui.VIEWS.set = viewSet;
})();
