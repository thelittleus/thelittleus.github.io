/* Little Us · DTT · New Program (1d): one screen. Name, type, one or more stimulus sets and how to start.
   Several sets become one combined set for the program, so the program still has one queue. */
(function () {
  'use strict';
  var D = window.LUDtt, X = LUTools.api, P = D.programs, T = D.i18n.T, esc = X.esc, ui = D.ui, U = ui.U, ACT = ui.ACT;

  function issueText(x) {
    return {
      name: T('Give the program a name.', 'Beri nama program.'), set: T('Choose a stimulus set.', 'Pilih stimulus set.'), items: T('Add at least one stimulus to the set.', 'Tambahkan setidaknya satu stimulus ke set.'),
      noImage: T('Some stimuli have no picture yet.', 'Beberapa stimulus belum punya gambar.'), queue: T('The target list is empty.', 'Daftar %targets% masih kosong.'),
      patterns: T('Add a pattern in Edit Order.', 'Tambahkan pola di Ubah Urutan.'), patternFill: T('Fill in every part of each pattern.', 'Lengkapi setiap bagian pola.'),
      twoImages: T(x.n + ' targets need a second picture for matching another picture.', x.n + ' %targets% perlu gambar kedua untuk mencocokkan gambar lain.'),
      categories: T('Choose at least ' + x.n + ' bins in Edit Order.', 'Pilih setidaknya ' + x.n + ' wadah di Ubah Urutan.'),
      oneCategory: T(x.n + ' targets need to belong to exactly one chosen bin.', x.n + ' %targets% harus masuk ke tepat satu wadah yang dipilih.')
    }[x.code] || x.code;
  }
  ui.issueText = function (x) { return D.i18n.fill(issueText(x)); };

  var SH = null;
  ACT.newProgram = function (b, e, preset) {
    if (!D.store.canAddProgram()) return ui.plusSheet('programs');
    var p = P.create({ studentId: ui.student().id, lang: D.i18n.lang() });
    P.applyPreset(p, 'acquisition');
    U.wizard = { p: p, sets: (preset && preset.sets) || [] };
    if (!p.name && U.wizard.sets[0]) p.name = D.store.set(U.wizard.sets[0]).name || '';
    SH = X.sheet('', { wide: true, onClose: function () { U.wizard = null; SH = null; } });
    SH.el.addEventListener('click', onClick);
    SH.el.addEventListener('input', function (e) { if (e.target.dataset.k === 'name') { U.wizard.p.name = e.target.value; e.target.classList.remove('bad'); } });
    draw();
  };
  ui.newProgramWith = function (sets) { ACT.newProgram(null, null, { sets: sets.map(function (s) { return s.id; }) }); };
  function draw() {
    if (!SH || !U.wizard) return;
    var w = U.wizard, p = w.p, fam = D.defaults.FAMILY[p.type], sets = w.sets.map(D.store.set).filter(Boolean), n = sets.reduce(function (a, s) { return a + s.items.length; }, 0);
    var TYPES = [['listener', 'Listener', T('Touches what you say', 'Menyentuh yang kamu sebut')], ['tact', 'Tact', T('Names the picture', 'Menyebut nama gambar')], ['mixed', T('Mixed', 'Mixed'), T('Both, random', 'Keduanya, acak')], ['visual', 'Matching', T('Match, sort, pattern', 'Cocokkan, kelompokkan, pola')]];
    var tint = function (t) { return ui.TYPE_TINT[t === 'visual' ? 'matching' : t]; };
    var name = SH.el.querySelector('[data-k="name"]'), first = !name;
    SH.set(ui.dlg({ title: T('New Program', 'Program Baru'), cls: 'dtt-newprog',
      body: '<label class="dtt-field"><span>' + esc(T('Name', 'Nama')) + '</span><input type="text" maxlength="60" data-k="name" value="' + esc(p.name) + '" placeholder="' + esc(T('e.g. Receptive animals', 'mis. Mengenal hewan')) + '"' + (first ? ' autofocus' : '') + '></label>' +
        '<div class="dtt-field"><span>' + esc(T('Type', 'Jenis')) + '</span><div class="dtt-typegrid">' + TYPES.map(function (t) {
          var on = t[0] === 'visual' ? fam === 'visual' : p.type === t[0];
          return '<button type="button" class="dtt-typecard' + (on ? ' on' : '') + '" style="' + (on ? 'background:' + tint(t[0]) : '') + '" aria-pressed="' + on + '" data-type="' + t[0] + '"><b>' + esc(t[1]) + '</b><small>' + esc(t[2]) + '</small></button>';
        }).join('') + '</div>' +
        (fam === 'visual' ? ui.seg('vtype', p.type, [['matching', 'Matching'], ['sorting', T('Sorting', 'Mengelompokkan')], ['pattern', T('Pattern', 'Pola')]]).replace(/data-a="set" data-k="vtype"/g, 'data-sub="1"') : '') + '</div>' +
        '<div class="dtt-field"><span>' + esc(T('Stimulus Sets', 'Stimulus Set')) + '</span><div class="dtt-setbtns"><button type="button" class="dtt-pickbtn" data-newset><i style="background:#FFF1C7">+</i>' + esc(T('Create New Set', 'Buat Set Baru')) + '</button><button type="button" class="dtt-pickbtn" data-choose><i style="background:#DCEBFA">▦</i>' + esc(T('Choose Existing Sets', 'Pilih Set yang Ada')) + '</button></div>' +
        (sets.length ? '<div class="dtt-chips">' + sets.map(function (s) { return '<span class="dtt-setchip">' + esc((s.name || T('Untitled Set', 'Set Tanpa Nama')) + ' · ' + s.items.length) + '<button type="button" data-unset="' + s.id + '" aria-label="' + esc(T('Remove ', 'Hapus ') + (s.name || '')) + '">✕</button></span>'; }).join('') + '</div>' : '') + '</div>' +
        '<div class="dtt-field"><span>' + esc(T('Start With', 'Mulai Dengan')) + '</span><div class="tl-seg dtt-seg two-line" role="group">' + [['errorless', T('Errorless', 'Tanpa Salah'), T('1 card', '1 kartu')], ['acquisition', T('Acquisition', 'Akuisisi'), T('3 cards', '3 kartu')], ['maintenance', T('Maintenance', '%maintenance%'), T('4 cards', '4 kartu')]].map(function (s) {
          var on = p.preset === s[0]; return '<button type="button" class="' + (on ? 'on' : '') + '" aria-pressed="' + on + '" data-preset="' + s[0] + '">' + esc(D.i18n.fill(s[1])) + '<small>' + esc(s[2]) + '</small></button>';
        }).join('') + '</div></div>',
      note: esc(sets.length > 1 ? T(sets.length + ' sets · ' + n + ' stimuli, joined into one set', sets.length + ' set · ' + n + ' stimulus, digabung jadi satu set') : T('Fine-tune anything later.', 'Bisa diatur lagi nanti.')),
      foot: '<button type="button" class="dtt-btn primary" data-create' + (sets.length ? '' : ' disabled') + '>' + esc(T('Create Program', 'Buat Program')) + '</button>' }));
    ui.hydrate(SH.el);
  }
  ui.wizardRedraw = draw;
  function addSets(list) { var w = U.wizard; if (!w) return; list.forEach(function (s) { if (w.sets.indexOf(s.id) < 0) w.sets.push(s.id); }); if (!w.p.name.trim() && list[0]) w.p.name = list[0].name || ''; draw(); }
  // several sets: one new set holding copies of every stimulus (uploaded photos are shared, not copied)
  function combined(sets) {
    if (sets.length === 1) return Promise.resolve(sets[0]);
    return D.store.addSet(sets.map(function (s) { return s.name || T('Set', 'Set'); }).join(' + ')).then(function (c) {
      sets.forEach(function (s) { s.items.forEach(function (i) { var it = JSON.parse(JSON.stringify(i)); it.id = P.uuid(); it.doNotPairWith = []; it.images.forEach(function (m) { m.id = P.uuid(); }); c.items.push(it); }); });
      return D.store.saveSet(c).then(function () { return c; });
    });
  }
  function onClick(e) {
    var t = e.target.closest('button'); if (!t || !U.wizard) return;
    var w = U.wizard, p = w.p;
    if (t.hasAttribute('data-x')) return SH.close();
    if (t.dataset.type) { var v = t.dataset.type; p.type = v === 'visual' ? (D.defaults.FAMILY[p.type] === 'visual' ? p.type : 'matching') : v; return draw(); }
    if (t.dataset.sub) { p.type = t.dataset.v; return draw(); }
    if (t.dataset.preset) { P.applyPreset(p, t.dataset.preset); return draw(); }
    if (t.dataset.unset) { w.sets = w.sets.filter(function (id) { return id !== t.dataset.unset; }); return draw(); }
    if (t.hasAttribute('data-choose')) return ui.chooseSet(addSets, w.sets);
    if (t.hasAttribute('data-newset')) return ui.newSetFlow(p.name, function (s) { addSets([s]); });
    if (t.hasAttribute('data-create')) {
      if (!p.name.trim()) { var f = SH.el.querySelector('[data-k="name"]'); f.classList.add('bad'); f.focus(); return; }
      t.disabled = true;
      combined(w.sets.map(D.store.set).filter(Boolean)).then(function (set) {
        p.setId = set.id; p.queue = []; P.syncQueue(p, set);
        return D.store.addProgram(p);
      }).then(function () {
        var id = p.id; SH.close(); U.view = 'program'; U.programId = id; U.ptab = 'setup'; ui.render(); window.scrollTo(0, 0);
      }, function (err) {
        t.disabled = false;
        if (err && /dtt_program_limit/.test((err.data && err.data.message) || err.message || '')) { SH.close(); return ui.plusSheet('programs'); }
        X.toast(T('The program was not saved. Check your connection and try again.', 'Program belum tersimpan. Periksa koneksi lalu coba lagi.'));
      });
    }
  }
})();
