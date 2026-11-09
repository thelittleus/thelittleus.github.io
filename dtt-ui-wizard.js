/* Little Us · DTT · New Program: one screen. Name, type, a stimulus set and how to start; everything else uses defaults
   and can be fine-tuned on the program page. The draft is U.wizard.p while the dialog is open. */
(function () {
  'use strict';
  var D = window.LUDtt, X = LUTools.api, P = D.programs, T = D.i18n.T, esc = X.esc, ui = D.ui, U = ui.U, ACT = ui.ACT;

  function issueText(x) {
    return {
      name: T('Give the program a name.', 'Beri nama program.'), set: T('Choose a stimulus set.', 'Pilih stimulus set.'), items: T('Add at least one stimulus to the set.', 'Tambahkan setidaknya satu stimulus ke set.'),
      noImage: T('Some stimuli have no picture yet.', 'Beberapa stimulus belum punya gambar.'), queue: T('The target queue is empty.', 'Antrean %targets% masih kosong.'),
      patterns: T('Add a pattern (Edit Order).', 'Tambahkan pola (Ubah Urutan).'), patternFill: T('Fill in every part of each pattern.', 'Lengkapi setiap bagian pola.'),
      twoImages: T(x.n + ' targets need a second picture for non-identical matching.', x.n + ' %targets% perlu gambar kedua untuk pencocokan tidak sama persis.'),
      categories: T('Choose at least ' + x.n + ' categories for the bins (Edit Order).', 'Pilih setidaknya ' + x.n + ' kategori untuk wadah (Ubah Urutan).'),
      oneCategory: T(x.n + ' targets need to belong to exactly one chosen category.', x.n + ' %targets% harus masuk ke tepat satu kategori yang dipilih.')
    }[x.code] || x.code;
  }
  ui.issueText = function (x) { return D.i18n.fill(issueText(x)); };

  var TYPES = [['listener', 'Listener', T('Touches what you say', 'Menyentuh yang kamu sebut')], ['tact', 'Tact', T('Names the picture', 'Menyebut nama gambar')], ['mixed', T('Mixed', 'Mixed'), T('Both, random', 'Keduanya, acak')], ['visual', 'Matching', T('Match, sort, pattern', 'Cocokkan, kelompokkan, pola')]];
  var STARTS = [['errorless', T('Errorless', 'Tanpa Salah'), T('1 card', '1 kartu')], ['acquisition', T('Acquisition', 'Akuisisi'), T('3 cards', '3 kartu')], ['maintenance', T('Maintenance', '%maintenance%'), T('4 cards', '4 kartu')]];
  var SH = null;

  ACT.newProgram = function () {
    if (!D.store.canAddProgram()) return ui.plusSheet('programs');
    var p = P.create({ studentId: ui.student().id, lang: D.i18n.lang() });
    P.applyPreset(p, 'acquisition');
    U.wizard = { p: p };
    SH = X.sheet('', { wide: true, onClose: function () { U.wizard = null; SH = null; } });
    SH.el.addEventListener('click', onClick);
    SH.el.addEventListener('input', function (e) { if (e.target.dataset.k === 'name') U.wizard.p.name = e.target.value; });
    draw();
  };
  function draw() {
    if (!SH || !U.wizard) return;
    var p = U.wizard.p, fam = D.defaults.FAMILY[p.type], set = D.store.set(p.setId), fresh = D.store.sets().length === 0;
    var typeCards = TYPES.map(function (t) {
      var on = (t[0] === 'visual' ? fam === 'visual' : p.type === t[0]);
      return '<button type="button" class="dtt-typecard' + (on ? ' on' : '') + '" aria-pressed="' + on + '" data-type="' + t[0] + '"><b>' + esc(t[1]) + '</b><small>' + esc(t[2]) + '</small></button>';
    }).join('');
    var visual = fam === 'visual' ? '<div class="tl-seg dtt-seg" role="group">' + [['matching', 'Matching'], ['sorting', T('Sorting', 'Mengelompokkan')], ['pattern', T('Pattern', 'Pola')]].map(function (o) {
      var on = p.type === o[0]; return '<button type="button" class="' + (on ? 'on' : '') + '" aria-pressed="' + on + '" data-sub="' + o[0] + '">' + esc(o[1]) + '</button>';
    }).join('') + '</div>' : '';
    var name = SH.el.querySelector('[data-k="name"]'), focusName = !name;
    SH.set('<div class="dtt-dlg dtt-newprog"><div class="dtt-dlghead"><h2>' + esc(T('New Program', 'Program Baru')) + '</h2><button type="button" class="dtt-x" data-x aria-label="' + esc(T('Close', 'Tutup')) + '">✕</button></div>' +
      '<label class="dtt-field"><span>' + esc(T('Name', 'Nama')) + '</span><input type="text" maxlength="60" data-k="name" value="' + esc(p.name) + '" placeholder="' + esc(T('Receptive animals', 'Mengenal hewan')) + '"' + (focusName ? ' autofocus' : '') + '></label>' +
      '<div class="dtt-field"><span>' + esc(T('Type', 'Jenis')) + '</span><div class="dtt-typegrid">' + typeCards + '</div>' + visual + '</div>' +
      '<div class="dtt-field"><span>' + esc(T('Stimulus Set', 'Stimulus Set')) + '</span>' +
      (set ? '<div class="dtt-setchip">' + (set.items[0] ? '<span class="dtt-tthumb">' + ui.img(set.items[0].images[0], '') + '</span>' : '') + '<b>' + esc(set.name || T('Unnamed set', 'Set tanpa nama')) + '</b><small>' + set.items.length + '</small><button type="button" class="dtt-x sm" data-unset aria-label="' + esc(T('Remove', 'Hapus')) + '">✕</button></div>' :
        '<div class="dtt-setbtns"><button type="button" class="dtt-pickbtn" data-newset><span aria-hidden="true">+</span>' + esc(T('Create New Set', 'Buat Set Baru')) + '</button><button type="button" class="dtt-pickbtn" data-choose><span aria-hidden="true">▦</span>' + esc(fresh ? T('Use a Little Us Set', 'Pakai Set Little Us') : T('Choose Existing Set', 'Pilih Set yang Ada')) + '</button></div>') + '</div>' +
      '<div class="dtt-field"><span>' + esc(T('Start With', 'Mulai Dengan')) + '</span><div class="dtt-typegrid three">' + STARTS.map(function (s) {
        var on = p.preset === s[0]; return '<button type="button" class="dtt-typecard' + (on ? ' on' : '') + '" aria-pressed="' + on + '" data-preset="' + s[0] + '"><b>' + esc(D.i18n.fill(s[1])) + '</b><small>' + esc(s[2]) + '</small></button>';
      }).join('') + '</div><p class="dtt-hint">' + esc(T('Fine-tune anything later.', 'Bisa diatur lagi nanti.')) + '</p></div>' +
      '<div class="dtt-dlgbtns"><button type="button" class="dtt-btn primary block" data-create' + (set ? '' : ' disabled') + '>' + esc(T('Create Program', 'Buat Program')) + '</button></div></div>');
    ui.hydrate(SH.el);
  }
  ui.wizardRedraw = draw;
  function useSet(s) { var p = U.wizard && U.wizard.p; if (!p) return; p.setId = s.id; p.queue = []; p.excluded = []; p.pinned = []; p.categories = []; p.patterns = []; P.syncQueue(p, s); if (!p.name.trim()) p.name = s.name || ''; draw(); }
  function onClick(e) {
    var t = e.target.closest('button'); if (!t || !U.wizard) return;
    var p = U.wizard.p;
    if (t.hasAttribute('data-x')) return SH.close();
    if (t.dataset.type) { var v = t.dataset.type; p.type = v === 'visual' ? (D.defaults.FAMILY[p.type] === 'visual' ? p.type : 'matching') : v; P.syncQueue(p, D.store.set(p.setId)); return draw(); }
    if (t.dataset.sub) { p.type = t.dataset.sub; P.syncQueue(p, D.store.set(p.setId)); return draw(); }
    if (t.dataset.preset) { P.applyPreset(p, t.dataset.preset); return draw(); }
    if (t.hasAttribute('data-unset')) { p.setId = null; p.queue = []; return draw(); }
    if (t.hasAttribute('data-choose')) return ui.chooseSet(useSet);
    if (t.hasAttribute('data-newset')) return ui.newSetFlow(p.name, useSet);
    if (t.hasAttribute('data-create')) {
      if (!p.name.trim()) { var f = SH.el.querySelector('[data-k="name"]'); var s0 = D.store.set(p.setId); if (s0 && s0.name) p.name = s0.name; else { f.focus(); f.classList.add('bad'); return; } }
      t.disabled = true;
      D.store.addProgram(p).then(function () {
        var id = p.id; SH.close(); U.view = 'program'; U.programId = id; U.ptab = 'setup'; ui.render(); window.scrollTo(0, 0);
      }, function (err) {
        t.disabled = false;
        if (err && /dtt_program_limit/.test((err.data && err.data.message) || err.message || '')) { SH.close(); return ui.plusSheet('programs'); }
        X.toast(T('The program was not saved. Check your connection and try again.', 'Program belum tersimpan. Periksa koneksi lalu coba lagi.'));
      });
    }
  }
})();
