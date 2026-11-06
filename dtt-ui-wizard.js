/* Little Us · DTT · the program creation wizard. It edits a draft; nothing is saved as a program until the last step.
   Every step is open at any time. Review lists whatever is still missing. */
(function () {
  'use strict';
  var D = window.LUDtt, X = LUTools.api, P = D.programs, T = D.i18n.T, esc = X.esc, ui = D.ui, U = ui.U, ACT = ui.ACT, INP = ui.INP;

  function steps() {
    // also drawn as a submenu in the sidebar
    return [['goal', T('Goal and name', 'Tujuan dan nama')], ['type', T('Type', 'Jenis')], ['targets', T('Targets', '%targets%')], ['teach', T('Teaching', 'Pengajaran')], ['reinf', 'Reinforcement'], ['mastery', T('Mastery', '%mastery%')], ['review', T('Review', 'Tinjau')]];
  }
  ACT.newProgram = function () {
    if (U.wizard) { U.wizard.away = false; U.navShut = false; ui.render(); window.scrollTo(0, 0); return; }
    if (D.store.programs().length && !D.store.allowed('dtt.programs')) { if (window.LUAcc) LUAcc.lockSheet('dtt.programs'); return; }
    var p = P.create({ studentId: ui.student().id, lang: D.i18n.lang() });
    U.wizard = { p: p, step: 0, seen: { 0: true }, family: 'listener', newSet: false };
    ui.render(); window.scrollTo(0, 0);
  };
  ui.wizardSteps = steps;
  // the program name falls back to the goal, once the teacher moves on from that step
  function go(i) {
    var w = U.wizard;
    if (steps()[w.step][0] === 'goal' && !w.p.name.trim() && w.p.goal.trim()) w.p.name = w.p.goal.trim();
    w.step = i; w.seen[i] = true; w.away = false; U.navShut = false; ui.render(); window.scrollTo(0, 0);
  }
  // which step fixes each problem Review reports
  function stepOf(code) { var id = code === 'name' ? 'goal' : 'targets'; return steps().map(function (s) { return s[0]; }).indexOf(id); }
  // how the sidebar draws a step: now, next (not visited yet), warn (visited, something missing) or done
  ui.wizardStepState = function (i) {
    var w = U.wizard;
    if (ui.wiz() && w.step === i) return 'now';
    if (!w.seen[i]) return 'next';
    return P.issues(w.p, D.store.set(w.p.setId)).some(function (x) { return stepOf(x.code) === i; }) ? 'warn' : 'done';
  };
  ACT.wizGo = function (b) { if (U.wizard) go(Number(b.dataset.v)); };
  ACT.wizCancel = function () { U.wizard = null; U.view = 'programs'; ui.render(); };
  ACT.wizBack = function () { go(U.wizard.step - 1); };
  ACT.wizNext = function () { go(U.wizard.step + 1); };
  INP.wizText = function (el) { U.wizard.p[el.dataset.k] = el.value; };

  /* step 2 */
  function stepType(w) {
    var p = w.p, fam = D.defaults.FAMILY[p.type];
    var h = '<h2 class="tl-h2">' + esc(T('What kind of program is this?', 'Program seperti apa ini?')) + '</h2>' +
      '<div class="dtt-cards" role="group">' + [
        ['listener', 'Listener Responding', T('The student touches the picture you name.', 'Anak menyentuh gambar yang kamu sebutkan.')],
        ['tact', 'Tact', T('The student names the picture they see.', 'Anak menyebutkan nama gambar yang dilihatnya.')],
        ['mixed', T('Mixed (Listener and Tact)', 'Mixed (Listener dan Tact)'), T('Both kinds of trial on the same targets. Progress is kept separately for each.', 'Kedua jenis trial pada %targets% yang sama. Kemajuan dicatat terpisah.')],
        ['visual', T('Matching and visual', 'Matching dan visual'), T('Matching, sorting into bins, or what comes next in a pattern.', 'Matching, mengelompokkan ke wadah, atau melanjutkan pola.')]
      ].map(function (o) {
        var on = fam === o[0];
        return '<button type="button" class="dtt-card' + (on ? ' on' : '') + '" aria-pressed="' + on + '" data-a="wizFam" data-v="' + o[0] + '"><b>' + esc(o[1]) + '</b><small>' + esc(o[2]) + '</small></button>';
      }).join('') + '</div>';
    if (fam === 'visual') h += ui.opt(T('Which one?', 'Yang mana?'), '', ui.seg('type', p.type, [
      ['matching', 'Matching', T('Touch or drag the sample to the matching card.', 'Sentuh atau seret contoh ke kartu yang cocok.')],
      ['sorting', T('Sorting', 'Mengelompokkan'), T('Place each card into the correct bin.', 'Masukkan setiap kartu ke wadah yang benar.')],
      ['pattern', T('Pattern', 'Pola'), T('Touch the card that comes next.', 'Sentuh kartu yang berikutnya.')]], true));
    return h;
  }
  ACT.wizFam = function (b) {
    var p = U.wizard.p, v = b.dataset.v;
    p.type = v === 'visual' ? (D.defaults.FAMILY[p.type] === 'visual' ? p.type : 'matching') : v;
    P.syncQueue(p, D.store.set(p.setId)); ui.render();
  };

  /* step 3 */
  function stepTargets(w) {
    var p = w.p, sets = D.store.sets(), set = D.store.set(p.setId);
    var h = '<h2 class="tl-h2">' + esc(T('Which pictures will you teach with?', 'Gambar apa yang akan dipakai?')) + '</h2>' +
      (sets.length ? ui.opt(T('Stimulus set', 'Stimulus set'), '', '<div class="dtt-cards" role="group">' + sets.map(function (s) {
        var on = s.id === p.setId;
        return '<button type="button" class="dtt-card' + (on ? ' on' : '') + '" aria-pressed="' + on + '" data-a="wizSet" data-v="' + s.id + '"><b>' + esc(s.name || T('Unnamed set', 'Set tanpa nama')) + '</b><small>' + esc(T(s.items.length + ' items', s.items.length + ' item')) + '</small></button>';
      }).join('') + '</div>') : '') +
      '<div class="dtt-rowbtns"><button type="button" class="tl-btn outline" data-a="wizNewSet">' + esc(T('Make a new set', 'Buat set baru')) + '</button></div>';
    if (set) h += ui.setEditor(set) + ui.SEC.targets.draw(p, set, p.settings);
    return h;
  }
  ACT.wizSet = function (b) { var p = U.wizard.p; p.setId = b.dataset.v; p.queue = []; p.excluded = []; p.pinned = []; p.categories = []; p.patterns = []; P.syncQueue(p, D.store.set(p.setId)); ui.render(); };
  ACT.wizNewSet = function () {
    var p = U.wizard.p;
    D.store.addSet(p.goal || p.name || '').then(function (s) { p.setId = s.id; p.queue = []; p.excluded = []; p.pinned = []; ui.render(); }, function () { X.toast(T('The set was not created. Check your connection.', 'Set belum dibuat. Periksa koneksi.')); });
  };

  /* step 4 */
  function stepTeach(w) {
    var p = w.p, set = D.store.set(p.setId);
    return '<h2 class="tl-h2">' + esc(T('How will you teach?', 'Bagaimana cara mengajarnya?')) + '</h2>' +
      '<div class="dtt-cards" role="group">' + [
        ['errorless', T('Errorless start', 'Mulai tanpa salah'), T('One card, the strongest prompt first, and every correct response reinforced.', 'Satu kartu, Prompt terkuat dulu, dan setiap respons benar diberi Reinforcement.')],
        ['acquisition', T('Acquisition', 'Akuisisi'), T('Three cards with prompts that fade. A good start for new targets.', 'Tiga kartu dengan Prompt yang memudar. Awal yang baik untuk %targets% baru.')],
        ['maintenance', T('Maintenance', '%maintenance%'), T('Four cards, prompts only when you choose, and reinforcement on VR 2.', 'Empat kartu, Prompt hanya saat kamu memilih, dan Reinforcement VR 2.')]
      ].map(function (o) {
        var on = p.preset === o[0];
        return '<button type="button" class="dtt-card' + (on ? ' on' : '') + '" aria-pressed="' + on + '" data-a="wizPreset" data-v="' + o[0] + '"><b>' + esc(o[1]) + '</b><small>' + esc(o[2]) + '</small></button>';
      }).join('') + '</div>' +
      '<details class="dtt-more" data-keep="fine"' + (w.fine ? ' open' : '') + '><summary>' + esc(T('Fine-tune these settings', 'Sesuaikan pengaturan')) + '</summary><div class="dtt-finetune">' +
      ['type', 'array', 'order', 'prompt', 'ec'].filter(function (k) { return ui.SEC[k].on(p); }).map(function (k) { return ui.SEC[k].draw(p, set, p.settings); }).join('') + '</div></details>';
  }
  ACT.wizPreset = function (b) { P.applyPreset(U.wizard.p, b.dataset.v); ui.render(); };

  /* step 7 */
  function issueText(x) {
    return {
      name: T('Give the program a name.', 'Beri nama program.'), set: T('Choose a stimulus set.', 'Pilih stimulus set.'), items: T('Add at least one item to the set.', 'Tambahkan setidaknya satu item ke set.'),
      noImage: T('Some items have no picture yet.', 'Beberapa item belum punya gambar.'), queue: T('The target queue is empty.', 'Antrean %targets% masih kosong.'),
      patterns: T('Add a pattern.', 'Tambahkan pola.'), patternFill: T('Fill in every part of each pattern.', 'Lengkapi setiap bagian pola.'),
      twoImages: T(x.n + ' targets need a second picture for non-identical matching.', x.n + ' %targets% perlu gambar kedua untuk pencocokan tidak sama persis.'),
      categories: T('Choose at least ' + x.n + ' categories for the bins.', 'Pilih setidaknya ' + x.n + ' kategori untuk wadah.'),
      oneCategory: T(x.n + ' targets need to belong to exactly one chosen category.', x.n + ' %targets% harus masuk ke tepat satu kategori yang dipilih.')
    }[x.code] || x.code;
  }
  ui.issueText = issueText;
  function stepReview(w) {
    var p = w.p, s = p.settings, set = D.store.set(p.setId), probs = P.issues(p, set);
    function row(a, b, missing) { return '<div class="tl-row"><div class="dtt-grow"><small>' + esc(a) + '</small><b' + (b ? '' : ' class="dtt-missing"') + '>' + esc(b || missing) + '</b></div></div>'; }
    var none = T('Not filled in', 'Belum diisi'), must = probs.filter(function (x) { return x.code === 'name' || x.code === 'set'; }), later = probs.filter(function (x) { return must.indexOf(x) < 0; });
    function warn(title, list) {
      return list.length ? '<div class="tl-tip dtt-tiplist"><b>' + esc(title) + '</b><ul>' + list.map(function (x) {
        var i = stepOf(x.code);
        return '<li>' + esc(issueText(x)) + ' <button type="button" class="tl-link" data-a="wizGo" data-v="' + i + '">' + esc(T('Go to ', 'Ke ') + D.i18n.fill(steps()[i][1])) + '</button></li>';
      }).join('') + '</ul></div>' : '';
    }
    return '<h2 class="tl-h2">' + esc(T('Check everything looks right', 'Periksa apakah semuanya sudah benar')) + '</h2><div class="tl-panel">' +
      row(T('Program', 'Program'), p.name.trim(), none) + (p.goal ? row(T('Goal', 'Tujuan'), p.goal) : '') + row(T('Student', 'Anak'), ui.student().name) + row(T('Type', 'Jenis'), ui.typeName(p.type)) +
      row(T('Stimulus set', 'Stimulus set'), set ? set.name || T('Unnamed set', 'Set tanpa nama') : '', T('Not chosen', 'Belum dipilih')) +
      row(T('Targets', '%targets%'), T(p.queue.length + ' in the queue, ' + p.activeCount + ' active at a time', p.queue.length + ' dalam antrean, ' + p.activeCount + ' aktif sekaligus')) +
      row('Prompt', { manual: 'Manual', mtl: 'Most-to-least', ltm: 'Least-to-most', td: 'Time delay' }[s.prompt]) +
      row('Reinforcement', ui.schedName(s.sched)) +
      row(T('Mastery', '%mastery%'), s.mRule === 'rolling' ? T(s.mNeed + ' of the last ' + s.mWin + ' independent', s.mNeed + ' dari ' + s.mWin + ' terakhir Independent') : T(s.mPct + '% in ' + s.mSess + ' sessions', s.mPct + '% dalam ' + s.mSess + ' %sessions%')) + '</div>' +
      warn(T('Fill these in to create the program:', 'Isi dulu untuk membuat program:'), must) +
      warn(T('You can save now, and finish these before the first session:', 'Kamu bisa menyimpan sekarang, lalu lengkapi ini sebelum %session% pertama:'), later);
  }
  ACT.wizSave = function (b) {
    var w = U.wizard, p = w.p; b.disabled = true;
    D.store.addProgram(p).then(function () {
      U.wizard = null; U.view = 'program'; U.programId = p.id; U.ptab = 'overview'; ui.render(); window.scrollTo(0, 0);
    }, function (e) {
      b.disabled = false;
      if (e && /dtt_program_limit/.test((e.data && e.data.message) || e.message || '')) { if (window.LUAcc) LUAcc.lockSheet('dtt.programs'); return; }
      X.toast(T('The program was not saved. Check your connection and try again.', 'Program belum tersimpan. Periksa koneksi lalu coba lagi.'));
    });
  };

  ui.VIEWS.wizard = function () {
    var w = U.wizard, p = w.p, list = steps(), id = list[w.step][0], set = D.store.set(p.setId), body;
    if (id === 'goal') body = '<h2 class="tl-h2">' + esc(T('What do you want to teach?', 'Apa yang ingin diajarkan?')) + '</h2>' +
      ui.field(T('Goal', 'Tujuan'), p.goal, 'data-in="wizText" data-k="goal"', T('Learn animals', 'Belajar hewan')) +
      ui.field(T('Program name', 'Nama program'), p.name, 'data-in="wizText" data-k="name"', T('Animals', 'Hewan'));
    else if (id === 'type') body = stepType(w);
    else if (id === 'targets') body = stepTargets(w);
    else if (id === 'teach') body = stepTeach(w);
    else if (id === 'reinf') body = ui.SEC.reinf.draw(p, set, p.settings);
    else if (id === 'mastery') body = ui.SEC.mastery.draw(p, set, p.settings);
    else body = stepReview(w);
    var last = w.step === list.length - 1;
    return '<div class="dtt-progh"><h2 class="tl-h2">' + esc(T('New program', 'Program baru')) + '</h2><p class="tl-note2 dtt-phoneonly">' + esc(T('Step ' + (w.step + 1) + ' of ' + list.length + ': ', 'Langkah ' + (w.step + 1) + ' dari ' + list.length + ': ') + D.i18n.fill(list[w.step][1])) + '</p></div>' +
      '<div class="dtt-wizbody tl-panel pad">' + body + '</div>' +
      '<div class="dtt-secfoot">' + (w.step ? '<button type="button" class="tl-btn quiet" data-a="wizBack">' + esc(T('Back', 'Kembali')) + '</button>' : '<button type="button" class="tl-btn quiet" data-a="wizCancel">' + esc(T('Cancel', 'Batal')) + '</button>') +
      (last ? '<button type="button" class="tl-btn primary" data-a="wizSave"' + (p.name.trim() && set ? '' : ' disabled') + '>' + esc(T('Create program', 'Buat program')) + '</button>' : '<button type="button" class="tl-btn primary" data-a="wizNext">' + esc(T('Next', 'Lanjut')) + '</button>') + '</div>';
  };
  // keep "fine-tune" open across re-renders
  document.addEventListener('toggle', function (e) { var t = e.target; if (U.wizard && t && t.dataset && t.dataset.keep === 'fine') U.wizard.fine = t.open; }, true);
})();
