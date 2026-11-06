/* Little Us · DTT · the settings sections. The left-navigation screen and the wizard both draw from SEC.
   Wording comes from the reference app wherever it still applies. */
(function () {
  'use strict';
  var D = window.LUDtt, X = LUTools.api, P = D.programs, DEF = D.defaults, T = D.i18n.T, esc = X.esc, ui = D.ui, U = ui.U, ACT = ui.ACT, INP = ui.INP;
  var opt = ui.opt, seg = ui.seg, sw = ui.sw, stepper = ui.stepper;

  function secondsWord() { return T('s', 'dtk'); }
  function isLT(p) { return p.type === 'listener' || p.type === 'tact' || p.type === 'mixed'; }
  function hasListener(p) { return p.type === 'listener' || p.type === 'mixed'; }
  function hasTact(p) { return p.type === 'tact' || p.type === 'mixed'; }
  function isTouch(p) { return p.type !== 'tact'; }

  ui.typeName = function (t) {
    return { listener: 'Listener Responding', tact: 'Tact', mixed: T('Mixed (Listener and Tact)', 'Mixed (Listener dan Tact)'), matching: 'Matching', sorting: T('Sorting', 'Mengelompokkan'), pattern: T('Pattern', 'Pola') }[t] || t;
  };
  ui.schedName = function (v) { return { crf: 'CRF', fr2: 'FR 2', fr3: 'FR 3', vr2: 'VR 2', vr3: 'VR 3' }[v] || v; };

  /* 1 targets ------------------------------------------------------------------------------------------------- */
  function secTargets(p, set) {
    var head = '<header><h2 class="tl-h2">' + esc(T('Targets', 'Target')) + '</h2><p class="tl-p">' + esc(T('The app teaches the first targets in this queue that are not mastered. When one is mastered, the next enters by itself. Pinned targets are always active.', 'Aplikasi mengajarkan %targets% pertama dalam antrean ini yang belum %mastered%. Saat satu %target% %mastered%, %target% berikutnya masuk dengan sendirinya. %target% yang disematkan selalu aktif.')) + '</p></header>';
    var h = head + opt(T('Active targets at a time', '%targets% aktif sekaligus'), '', stepper('activeCount', p.activeCount));
    if (p.type === 'sorting') h += categories(p, set);
    if (p.type === 'pattern') h += patterns(p, set);
    h += queue(p, set);
    return h;
  }
  function targetName(p, set, id) {
    if (p.type === 'pattern') {
      var pt = (p.patterns || []).filter(function (x) { return x.id === id; })[0]; if (!pt) return '';
      return pt.unit.split('').map(function (l) { var it = P.itemById(set, pt.fill[l]); return it ? P.labelOf(p, it) || '?' : '?'; }).join(' ');
    }
    return P.labelOf(p, P.itemById(set, id));
  }
  ui.targetName = targetName;
  function queue(p, set) {
    if (!set) return ui.tip(T('Choose a stimulus set first.', 'Pilih stimulus set dulu.'));
    var rows = p.queue.map(function (id, n) {
      var it = p.type === 'pattern' ? null : P.itemById(set, id), pinned = p.pinned.indexOf(id) >= 0, st = ui.targetStatus ? ui.targetStatus(p, id, DEF.OPS[p.type][0]) : 'waiting', active = st === 'learning' || st === 'attention', a = 'data-v="' + id + '"';
      return '<li class="dtt-q' + (active ? ' active' : '') + '"><span class="dtt-thumb">' + (it ? ui.img(it.images[0], P.labelOf(p, it)) : '<span class="dtt-noimg" aria-hidden="true"></span>') + '</span>' +
        '<b class="dtt-qlab">' + esc(targetName(p, set, id) || T('No label yet', 'Belum ada label')) + '</b>' +
        ui.statusChips(p, id) +
        '<span class="dtt-qbtns"><button type="button" class="tl-iconbtn" data-a="qPin" ' + a + ' aria-pressed="' + pinned + '" aria-label="' + esc(T('Pin as always active', 'Sematkan agar selalu aktif')) + '">' + (pinned ? '★' : '☆') + '</button>' +
        '<button type="button" class="tl-iconbtn" data-a="qUp" ' + a + ' aria-label="' + esc(T('Move up', 'Naikkan')) + '"' + (n === 0 ? ' disabled' : '') + '>↑</button>' +
        '<button type="button" class="tl-iconbtn" data-a="qDown" ' + a + ' aria-label="' + esc(T('Move down', 'Turunkan')) + '"' + (n === p.queue.length - 1 ? ' disabled' : '') + '>↓</button>' +
        '<button type="button" class="tl-iconbtn" data-a="qRemove" ' + a + ' aria-label="' + esc(T('Remove from this program', 'Hapus dari program ini')) + '">✕</button></span></li>';
    }).join('');
    var out = (p.excluded || []).length ? '<p class="dtt-optd">' + esc(T('Removed from this program. Tap to add back:', 'Dihapus dari program ini. Ketuk untuk menambahkan lagi:')) + '</p><div class="tl-chips">' + p.excluded.map(function (id) { return '<button type="button" class="tl-chip" data-a="qAdd" data-v="' + id + '">' + esc(targetName(p, set, id) || '?') + ' +</button>'; }).join('') + '</div>' : '';
    return opt(T('Target queue', 'Antrean %targets%'), T('Reorder, pin or remove targets here. To change a label, edit the item in its stimulus set.', 'Atur urutan, sematkan, atau hapus %targets% di sini. Untuk mengubah label, ubah item di stimulus set.'),
      (rows ? '<ol class="dtt-queue">' + rows + '</ol>' : ui.tip(T('The queue is empty.', 'Antrean masih kosong.'))) + out +
      (U.wizard ? '' : '<div class="dtt-rowbtns"><button type="button" class="tl-btn outline sm" data-a="editSet" data-id="' + set.id + '">' + esc(T('Add or edit items in the set', 'Tambah atau ubah item di set')) + '</button></div>'));
  }
  ACT.qPin = function (b) { P.togglePin(ui.ctx(), b.dataset.v); ui.touchProgram(); ui.render(); };
  ACT.qUp = function (b) { P.moveTarget(ui.ctx(), b.dataset.v, -1); ui.touchProgram(); ui.render(); };
  ACT.qDown = function (b) { P.moveTarget(ui.ctx(), b.dataset.v, 1); ui.touchProgram(); ui.render(); };
  ACT.qRemove = function (b) { P.removeTarget(ui.ctx(), b.dataset.v); ui.touchProgram(); ui.render(); };
  ACT.qAdd = function (b) { P.addTarget(ui.ctx(), b.dataset.v); ui.touchProgram(); ui.render(); };
  ACT.editSet = function (b) { U.setId = b.dataset.id; U.view = 'set'; ui.render(); };

  function categories(p, set) {
    var tags = P.tagsOf(set);
    return opt(T('Categories for the bins', 'Kategori untuk wadah'), T('Choose from the categories on your items. Each item in the queue must belong to exactly one of them.', 'Pilih dari kategori pada item. Setiap item dalam antrean harus masuk ke tepat satu kategori.'),
      tags.length ? '<div class="tl-chips">' + tags.map(function (t) {
        var on = p.categories.indexOf(t) >= 0;
        return '<button type="button" class="tl-chip' + (on ? ' on' : '') + '" aria-pressed="' + on + '" data-a="catTog" data-v="' + esc(t) + '">' + esc(t) + '</button>';
      }).join('') + '</div>' : ui.tip(T('No categories yet. Add them to the items in your set.', 'Belum ada kategori. Tambahkan pada item di set.')));
  }
  ACT.catTog = function (b) { var p = ui.ctx(), v = b.dataset.v, i = p.categories.indexOf(v); if (i >= 0) p.categories.splice(i, 1); else p.categories.push(v); ui.touchProgram(); ui.render(); };

  function patterns(p, set) {
    var items = (set && set.items) || [];
    var rows = (p.patterns || []).map(function (pt, n) {
      return '<div class="dtt-pattern tl-panel col"><div class="dtt-head"><b>' + esc(T('Pattern ' + (n + 1), 'Pola ' + (n + 1))) + '</b><button type="button" class="tl-link dtt-danger" data-a="patDel" data-v="' + pt.id + '" data-confirm="' + esc(T('Tap again to remove', 'Ketuk lagi untuk menghapus')) + '">' + esc(T('Remove', 'Hapus')) + '</button></div>' +
        '<div class="tl-seg dtt-seg" role="group">' + DEF.PATTERN_UNITS.map(function (u) { return '<button type="button" class="' + (pt.unit === u ? 'on' : '') + '" aria-pressed="' + (pt.unit === u) + '" data-a="patUnit" data-v="' + pt.id + '" data-k="' + u + '">' + u + '</button>'; }).join('') + '</div>' +
        '<div class="dtt-patfill">' + P.unitLetters(pt.unit).map(function (l) {
          return '<label class="tl-field"><span>' + l + '</span><select data-in="patFill" data-on="change" data-v="' + pt.id + '" data-k="' + l + '"><option value="">' + esc(T('Choose an item', 'Pilih item')) + '</option>' + items.map(function (i) { return '<option value="' + i.id + '"' + (pt.fill[l] === i.id ? ' selected' : '') + '>' + esc(P.labelOf(p, i) || '?') + '</option>'; }).join('') + '</select></label>';
        }).join('') + '</div></div>';
    }).join('');
    return opt(T('Patterns', 'Pola'), T('Choose the repeating unit and the items that fill it. Each pattern is one target. The student touches the card that continues it.', 'Pilih unit yang berulang dan item pengisinya. Setiap pola adalah satu %target%. Anak menyentuh kartu yang melanjutkan pola.'),
      rows + '<div class="dtt-rowbtns"><button type="button" class="tl-btn outline sm" data-a="patAdd"' + (items.length ? '' : ' disabled') + '>' + esc(T('Add a pattern', 'Tambah pola')) + '</button></div>');
  }
  function findPat(p, id) { return p.patterns.filter(function (x) { return x.id === id; })[0]; }
  function patChanged(p) { P.syncQueue(p, D.store.set(p.setId)); ui.touchProgram(); }
  ACT.patAdd = function () { var p = ui.ctx(); p.patterns.push(P.newPattern('AB')); patChanged(p); ui.render(); };
  ACT.patDel = function (b) { var p = ui.ctx(); p.patterns = p.patterns.filter(function (x) { return x.id !== b.dataset.v; }); patChanged(p); ui.render(); };
  ACT.patUnit = function (b) { var p = ui.ctx(), pt = findPat(p, b.dataset.v); pt.unit = b.dataset.k; var keep = {}; P.unitLetters(pt.unit).forEach(function (l) { if (pt.fill[l]) keep[l] = pt.fill[l]; }); pt.fill = keep; patChanged(p); ui.render(); };
  INP.patFill = function (el) { var p = ui.ctx(), pt = findPat(p, el.dataset.v); if (el.value) pt.fill[el.dataset.k] = el.value; else delete pt.fill[el.dataset.k]; patChanged(p); };

  /* 2 trial type ---------------------------------------------------------------------------------------------- */
  function hintField(key, s, label) { return ui.field(label, s[key], 'data-in="txt" data-k="' + key + '"'); }
  function secType(p, set, s) {
    var h = '<header><h2 class="tl-h2">' + esc(T('Trial type', 'Jenis trial')) + '</h2><p class="tl-p">' + esc(T('Choose how the student responds. You give the instruction yourself as the cards appear. The app never speaks.', 'Pilih cara anak merespons. Kamu sendiri yang memberi instruksi saat kartu muncul. Aplikasi tidak pernah berbicara.')) + '</p></header>';
    if (isLT(p)) h += opt(T('Response type', 'Jenis respons'), '', seg('type', p.type, [
      ['listener', 'Listener Responding', T('You say "Touch cat" and the student taps the card. Scored automatically.', 'Kamu berkata "Sentuh kucing" dan anak mengetuk kartunya. Dinilai otomatis.')],
      ['tact', 'Tact', T('The student sees one picture and names it. You score it.', 'Anak melihat satu gambar dan menyebutkan namanya. Kamu yang menilai.')],
      ['mixed', 'Mixed', T('Listener and tact trials mixed at random on the same targets.', 'Trial listener dan tact diacak pada %targets% yang sama.')]], true));
    else h += opt(T('Response type', 'Jenis respons'), T('Touch and drag responses are scored automatically.', 'Respons sentuh dan seret dinilai otomatis.'), '<p class="tl-p"><b>' + esc(ui.typeName(p.type)) + '</b></p>');
    var say = T('Shown in your panel so you know what to say. {label} is replaced with the target.', 'Ditampilkan di panelmu sebagai pengingat. {label} diganti dengan %target%.');
    var f = '';
    if (hasListener(p)) f += hintField('sdHint', s, T('Listener trials', 'Trial listener'));
    if (hasTact(p)) f += hintField('tHint', s, T('Tact trials', 'Trial tact'));
    if (p.type === 'matching') f += hintField('mHint', s, 'Matching');
    if (p.type === 'sorting') f += hintField('sHint', s, T('Sorting', 'Mengelompokkan'));
    if (p.type === 'pattern') f += hintField('patHint', s, T('Pattern', 'Pola'));
    return h + opt(T('Instruction reminder', 'Pengingat instruksi'), say, f);
  }

  /* 3 array and layout ---------------------------------------------------------------------------------------- */
  function disOptions() {
    return [['random', T('Random', 'Acak'), T('Any other item from the set', 'Item lain dari set')],
      ['different', T('Very different', 'Sangat berbeda'), T('Easier: items that share no category', 'Lebih mudah: item tanpa kategori yang sama')],
      ['similar', T('Similar', 'Mirip'), T('Harder: items that share a category', 'Lebih sulit: item dengan kategori yang sama')],
      ['avoid', T('Avoid confusable pairs', 'Hindari pasangan yang membingungkan'), T('Keeps apart items in the same category. Items you marked as not to be paired never appear together under any option.', 'Memisahkan item dalam kategori yang sama. Item yang ditandai tidak boleh berpasangan tidak pernah tampil bersama di pilihan mana pun.')]];
  }
  var sizes = [[1, '1'], [2, '2'], [3, '3'], [4, '4'], [6, '6']];
  function secArray(p, set, s) {
    var h = '<header><h2 class="tl-h2">' + esc(T('Array and layout', 'Susunan kartu')) + '</h2><p class="tl-p">' + esc(T('How the cards are laid out for the student. Cards resize to fit the screen.', 'Bagaimana kartu disusun untuk anak. Ukuran kartu menyesuaikan layar.')) + '</p></header>';
    if (p.type === 'sorting') h += opt(T('Number of bins', 'Jumlah wadah'), T('Start with one bin and add more as the student improves.', 'Mulai dengan satu wadah dan tambah saat anak makin mahir.'), seg('bins', s.bins, [[1, '1'], [2, '2'], [3, '3']]));
    else h += opt(p.type === 'matching' ? T('Field size', 'Jumlah kartu pilihan') : T('Number of cards', 'Jumlah kartu'), T('A field of 1 is errorless teaching. Larger arrays make the discrimination harder.', 'Satu kartu berarti pengajaran tanpa salah. Makin banyak kartu makin sulit.'), seg('array', s.array, sizes));
    if (p.type === 'matching') {
      h += opt(T('Match kind', 'Jenis pencocokan'), '', seg('matchKind', s.matchKind, [['identical', T('Identical', 'Sama persis'), T('The same image', 'Gambar yang sama')], ['nonidentical', T('Non-identical', 'Tidak sama persis'), T('A different image of the same item. Needs two images per item.', 'Gambar lain dari item yang sama. Perlu dua gambar per item.')], ['both', T('Both mixed', 'Campuran'), '']], true));
      h += opt(T('Sample position', 'Posisi contoh'), '', seg('samplePos', s.samplePos, [['centre', T('Centre', 'Tengah')], ['top', T('Top', 'Atas')], ['side', T('Side', 'Samping')]]));
    }
    if (p.type !== 'sorting') h += opt(T('Distractors', 'Distraktor'), T('The other cards shown with the target. They come from this set.', 'Kartu lain yang ditampilkan bersama %target%. Diambil dari set ini.'), seg('dis', s.dis, disOptions(), true));
    h += opt(T('Card positions', 'Posisi kartu'), '', sw('rpos', s.rpos, T('Shuffle card positions every trial', 'Acak posisi kartu di setiap trial'), T('Recommended, so the correct card is not always in the same place.', 'Disarankan, agar kartu yang benar tidak selalu di tempat yang sama.')));
    return h + '<p class="tl-note2">' + esc(T('All cards in a trial share the same border colour, so colour never gives away the answer. The colour changes between trials.', 'Semua kartu dalam satu trial memiliki warna bingkai yang sama, sehingga warna tidak membocorkan jawaban. Warnanya berganti antar trial.')) + '</p>';
  }

  /* 4 order and timing ---------------------------------------------------------------------------------------- */
  function secOrder(p, set, s) {
    return '<header><h2 class="tl-h2">' + esc(T('Order and timing', 'Urutan dan waktu')) + '</h2><p class="tl-p">' + esc(T('How many trials to run, how they are spaced, and how often maintenance targets come back.', 'Berapa trial yang dijalankan, jaraknya, dan seberapa sering %targets% %maintenance% muncul kembali.')) + '</p></header>' +
      opt(T('Trials per session', 'Trial per %session%'), T('Includes maintenance trials. Error correction trials are added on top and not counted in the data.', 'Termasuk trial %maintenance%. Trial Error correction ditambahkan di luar itu dan tidak dihitung dalam data.'), stepper('trials', s.trials)) +
      opt(T('Trial order', 'Urutan trial'), '', seg('order', s.order, [['random', T('Random rotation', 'Rotasi acak'), T('Targets rotate without repeating back to back', '%targets% bergiliran tanpa berulang berturut-turut')], ['block', T('Massed', 'Mass trial'), T('Each target 3 times in a row before the next', 'Setiap %target% 3 kali berturut-turut sebelum berikutnya')]], true)) +
      opt(T('Maintenance trials', 'Trial %maintenance%'), T('Mastered targets from this program, mixed in between targets.', '%targets% %mastered% dari program ini, diselipkan di antara %targets%.'), seg('maint', s.maint, [[0, T('Off', 'Mati')], [4, T('Every 4', 'Tiap 4')], [3, T('Every 3', 'Tiap 3')], [2, T('Every 2', 'Tiap 2')]])) +
      opt('Inter-trial interval', T('A short blank screen before the next cards appear.', 'Layar kosong sebentar sebelum kartu berikutnya muncul.'), stepper('iti', s.iti, secondsWord())) +
      (isTouch(p) ? opt(T('Response window', 'Batas waktu respons'), T('Counted from when the cards appear. If the student does not respond in this time, the trial counts as no response, or the next prompt is given when using least-to-most.', 'Dihitung sejak kartu muncul. Jika anak tidak merespons dalam waktu ini, trial dihitung tidak ada respons, atau Prompt berikutnya diberikan saat memakai Least-to-most.'), stepper('resp', s.resp, secondsWord())) : '');
  }

  /* 5 prompting ----------------------------------------------------------------------------------------------- */
  function styles(title, key, cur, list) { return '<div class="dtt-sublabel">' + esc(title) + '</div>' + seg(key, cur, list, true); }
  function secPrompt(p, set, s) {
    var desc = {
      manual: T('Every trial starts without a prompt. Use the Partial or Full buttons (keys P and F) whenever you want the app to show a prompt.', 'Setiap trial dimulai tanpa Prompt. Gunakan tombol Partial atau Full (tombol P dan F) kapan pun kamu ingin aplikasi menampilkan Prompt.'),
      mtl: T('New targets start at the highest prompt you allow. After ' + s.fade + ' correct in a row the prompt fades one level, and an error moves it back up one level.', '%targets% baru dimulai dari Prompt tertinggi yang diizinkan. Setelah ' + s.fade + ' benar berturut-turut Prompt turun satu tingkat, dan kesalahan menaikkannya satu tingkat.'),
      ltm: T('Every trial starts without a prompt. If there is no response within the response window, the app moves up to the next prompt level you allow.', 'Setiap trial dimulai tanpa Prompt. Jika tidak ada respons dalam batas waktu, aplikasi naik ke tingkat Prompt berikutnya.'),
      td: T('New targets start at 0 seconds delay, with the prompt shown straight away. After the set number of correct responses the app waits before prompting, so the student can answer independently first.', '%targets% baru dimulai dengan jeda 0 detik, Prompt langsung ditampilkan. Setelah jumlah benar yang ditentukan, aplikasi menunggu sebelum memberi Prompt, agar anak bisa menjawab Independent lebih dulu.')
    }[s.prompt];
    var part = s.levels !== 'full', full = s.levels !== 'partial', st = '';
    if (hasListener(p)) {
      if (part) st += styles(T('Listener: Partial prompt', 'Listener: Prompt Partial'), 'lPart', s.lPart, [['pulse', T('Card pulses', 'Kartu berdenyut')], ['point', T('Pointing arrow', 'Panah menunjuk')], ['bigger', T('Card grows', 'Kartu membesar')]]);
      if (full) st += styles(T('Listener: Full prompt', 'Listener: Prompt Full'), 'lFull', s.lFull, [['glow', T('Glow and fade others', 'Menyala, yang lain memudar')], ['only', T('Show correct card only', 'Hanya kartu yang benar')]]);
    }
    if (hasTact(p)) {
      if (part) st += styles(T('Tact: Partial prompt', 'Tact: Prompt Partial'), 'tPart', s.tPart, [['first', T('First-sound cue', 'Isyarat bunyi awal'), T('Your panel shows the first sound to say.', 'Panelmu menampilkan bunyi awal untuk diucapkan.')], ['fill', T('Fill-in cue', 'Isyarat melengkapi'), T('Your panel shows a sentence to finish.', 'Panelmu menampilkan kalimat untuk dilengkapi.')], ['label', T('Written label', 'Label tertulis'), T('The label appears under the picture.', 'Label muncul di bawah gambar.')]]);
      if (part && s.tPart === 'fill') st += ui.field(T('Fill-in script', 'Naskah melengkapi'), s.tFill, 'data-in="txt" data-k="tFill"');
      if (full) st += '<p class="tl-p"><b>' + esc(T('Tact: Full prompt.', 'Tact: Prompt Full.')) + '</b> ' + esc(T('Echoic model. Your panel reminds you to say the whole word.', 'Model echoic. Panelmu mengingatkan untuk mengucapkan seluruh kata.')) + '</p>';
    }
    if (p.type === 'matching') {
      if (part) st += styles(T('Matching: Partial prompt', 'Matching: Prompt Partial'), 'mPart', s.mPart, [['position', T('Position', 'Posisi'), T('The correct card sits closer and slightly larger.', 'Kartu yang benar lebih dekat dan sedikit lebih besar.')], ['pulse', T('Pulse', 'Berdenyut')], ['point', T('Pointing arrow', 'Panah menunjuk')]]) + sw('mFade', s.mFade, T('Use stimulus fading', 'Pakai stimulus fading'), T('The wrong cards shrink or dim step by step as the prompt fades.', 'Kartu yang salah mengecil atau meredup bertahap saat Prompt memudar.'));
      if (full) st += '<p class="tl-p"><b>' + esc(T('Matching: Full prompt.', 'Matching: Prompt Full.')) + '</b> ' + esc(T('The sample slides most of the way to the correct card and the student finishes the move.', 'Contoh bergeser hampir sampai ke kartu yang benar dan anak menyelesaikannya.')) + '</p>';
    }
    if (p.type === 'sorting') {
      if (part) st += styles(T('Sorting: Partial prompt', 'Mengelompokkan: Prompt Partial'), 'sPart', s.sPart, [['pulse', T('Correct bin pulses', 'Wadah yang benar berdenyut')], ['point', T('Pointing arrow', 'Panah menunjuk')]]);
      if (full) st += styles(T('Sorting: Full prompt', 'Mengelompokkan: Prompt Full'), 'sFull', s.sFull, [['slide', T('Card slides halfway', 'Kartu bergeser setengah jalan')], ['only', T('Only the correct bin remains', 'Hanya wadah yang benar')]]);
    }
    if (p.type === 'pattern') {
      if (part) st += styles(T('Pattern: Partial prompt', 'Pola: Prompt Partial'), 'patPart', s.patPart, [['flash', T('Unit flashes in order', 'Unit menyala berurutan')], ['pulse', T('Correct card pulses', 'Kartu yang benar berdenyut')]]);
      if (full) st += styles(T('Pattern: Full prompt', 'Pola: Prompt Full'), 'patFull', s.patFull, [['glow', T('Pattern animates, correct card glows', 'Pola bergerak, kartu benar menyala')], ['only', T('Show correct card only', 'Hanya kartu yang benar')]]);
    }
    return '<header><h2 class="tl-h2">Prompt</h2><p class="tl-p">' + esc(T('Choose which prompts the app shows, what they look like, and how they fade. Spoken prompts and models come from you. A correct response after any prompt is recorded as prompted.', 'Pilih Prompt yang ditampilkan aplikasi, bentuknya, dan cara memudarkannya. Prompt lisan dan model berasal darimu. Respons benar setelah Prompt apa pun dicatat sebagai Prompted.')) + '</p></header>' +
      opt(T('Prompt levels', 'Tingkat Prompt'), T('Controls which prompt buttons appear during the session and which levels the automatic methods step through.', 'Menentukan tombol Prompt yang muncul saat %session% dan tingkat yang dilalui metode otomatis.'), seg('levels', s.levels, [['both', T('Partial and full', 'Partial dan Full'), T('Two-step hierarchy', 'Dua tingkat')], ['full', T('Full only', 'Full saja'), T('Full prompt or nothing', 'Prompt Full atau tidak sama sekali')], ['partial', T('Partial only', 'Partial saja'), T('Lighter help only', 'Bantuan ringan saja')]], true)) +
      opt(T('Prompt method', 'Metode Prompt'), desc, seg('prompt', s.prompt, [['manual', 'Manual'], ['mtl', 'Most-to-least'], ['ltm', 'Least-to-most'], ['td', 'Time delay']])) +
      (s.prompt === 'mtl' || s.prompt === 'td' ? opt(T('Fade after', 'Pudar setelah'), T('Correct responses in a row before the prompt fades.', 'Jumlah benar berturut-turut sebelum Prompt memudar.'), stepper('fade', s.fade, T('correct', 'benar'))) : '') +
      (s.prompt === 'td' ? opt(T('Delay length', 'Lama jeda'), T('How long the app waits before prompting once the target is on delay.', 'Berapa lama aplikasi menunggu sebelum memberi Prompt saat %target% sudah memakai jeda.'), stepper('tdDelay', s.tdDelay, secondsWord())) : '') +
      opt(T('Prompt styles', 'Bentuk Prompt'), '', st);
  }

  /* 6 error correction ---------------------------------------------------------------------------------------- */
  function secEC(p, set, s) {
    return '<header><h2 class="tl-h2">Error correction</h2><p class="tl-p">' + esc(T('What happens after an incorrect response or no response. The error is followed by a short neutral pause with no sound.', 'Apa yang terjadi setelah respons salah atau tidak ada respons. Setelah itu ada jeda netral singkat tanpa suara.')) + '</p></header>' +
      opt('', '', sw('ec', s.ec, T('Use error correction', 'Pakai Error correction'), T('Recommended. Correction trials are kept out of the session percentage.', 'Disarankan. Trial koreksi tidak masuk persentase %session%.'))) +
      (s.ec ? opt(T('Sequence after an error', 'Urutan setelah kesalahan'), '', sw('ecD', s.ecD, T('Include a distractor trial', 'Sertakan trial distraktor'), T('A different, easier or mastered target between the correction and the retry.', '%target% lain yang lebih mudah atau sudah %mastered% di antara koreksi dan percobaan ulang.')) +
        '<ol class="dtt-steps"><li>' + esc(T('Correction trial: same target with a ' + (s.levels === 'partial' ? 'partial' : 'full') + ' prompt', 'Trial koreksi: %target% yang sama dengan Prompt ' + (s.levels === 'partial' ? 'Partial' : 'Full'))) + '</li>' + (s.ecD ? '<li>' + esc(T('Distractor trial: a different, easier target', 'Trial distraktor: %target% lain yang lebih mudah')) + '</li>' : '') + '<li>' + esc(T('Transfer trial: same target again with no prompt', 'Trial transfer: %target% yang sama tanpa Prompt')) + '</li></ol>') : '');
  }

  /* 7 reinforcement ------------------------------------------------------------------------------------------- */
  var SCENE_NAMES = {
    center: ['Bouncing and waving', 'Melompat dan melambai'], walk: ['Parade', 'Parade'], race: ['Running race', 'Lomba lari'], hop: ['Hopping', 'Melompat-lompat'], skate: ['Skateboarding', 'Bermain skateboard'], balloons: ['Balloon float', 'Terbang dengan balon'], popup: ['Pop-up peekaboo', 'Cilukba'], dance: ['Dance party', 'Pesta menari'], slide: ['Rainbow slide', 'Perosotan pelangi'], rocket: ['Rocket launch', 'Peluncuran roket'], fireworks: ['Fireworks show', 'Pertunjukan kembang api'], train: ['Train ride', 'Naik kereta'], surf: ['Surf and splash', 'Berselancar']
  };
  var GAME_NAMES = {
    shadow: ['Shadow guess', 'Tebak bayangan', 'A dark silhouette fills with colour when tapped.', 'Bayangan gelap berubah berwarna saat diketuk.'],
    peek: ['Peekaboo', 'Cilukba', 'Part of a character shows from behind something. A tap makes it jump out.', 'Sebagian karakter terlihat dari balik benda. Ketukan membuatnya melompat keluar.'],
    closeup: ['Close-up guess', 'Tebak dari dekat', 'A zoomed-in part. A tap reveals the whole.', 'Bagian yang diperbesar. Ketukan menampilkan seluruhnya.'],
    silly: ['Silly mix', 'Campuran lucu', 'One wrong part flies away when tapped.', 'Satu bagian yang salah terbang saat diketuk.'],
    open: ['Tap to open', 'Ketuk untuk membuka', 'Three taps open an egg, chest or garage door, or launch a rocket.', 'Tiga ketukan membuka telur, peti, atau pintu garasi, atau meluncurkan roket.'],
    feed: ['Feed or give', 'Beri makan', 'Drag an item to the character, or tap it.', 'Seret benda ke karakter, atau ketuk.'],
    match: ['Find the match', 'Cari pasangan', 'A baby finds its parent, or a small thing finds its big partner.', 'Bayi menemukan induknya, atau benda kecil menemukan pasangan besarnya.'],
    pop: ['Pop and splash', 'Pecahkan', 'Tap to pop bubbles, balloons or stars.', 'Ketuk untuk memecahkan gelembung, balon, atau bintang.']
  };
  function pair(a) { return T(a[0], a[1]); }
  function secReinf(p, set, s) {
    var kid = ui.student(), name = kid ? kid.name : T('the student', 'anak');
    return '<header><h2 class="tl-h2">Reinforcement</h2><p class="tl-p">' + esc(T('The celebration shows the student\'s photo with happy characters from their favorite themes and confetti, plays a cheer, and shows your praise phrase.', 'Perayaan menampilkan foto anak bersama karakter dari tema favoritnya dan konfeti, memutar sorakan, dan menampilkan kalimat pujianmu.')) + '</p></header>' +
      opt(T('Schedule', 'Jadwal'), T('How often a correct response earns the full celebration. Other correct responses get a short "Yes!" bubble and a soft ding.', 'Seberapa sering respons benar mendapat perayaan penuh. Respons benar lainnya mendapat gelembung "Ya!" singkat dan bunyi lembut.'), seg('sched', s.sched, [['crf', 'CRF', T('Every correct', 'Setiap benar')], ['fr2', 'FR 2', T('Every 2nd', 'Setiap ke-2')], ['fr3', 'FR 3', T('Every 3rd', 'Setiap ke-3')], ['vr2', 'VR 2', T('About every 2nd', 'Sekitar setiap ke-2')], ['vr3', 'VR 3', T('About every 3rd', 'Sekitar setiap ke-3')]], true)) +
      opt('Differential reinforcement', '', sw('diff', s.diff, T('Full celebration only for independent responses', 'Perayaan penuh hanya untuk respons Independent'), T('Prompted correct responses get brief praise and do not count toward the schedule.', 'Respons Prompted yang benar mendapat pujian singkat dan tidak dihitung dalam jadwal.'))) +
      opt(T('Celebration length', 'Lama perayaan'), T('Allow at least 3 seconds so the sounds have time to play.', 'Beri setidaknya 3 detik agar suaranya sempat terputar.'), stepper('dur', s.dur, secondsWord())) +
      opt(T('Celebration styles', 'Gaya perayaan'), T(s.scenes.length + ' of ' + DEF.SCENES.length + ' on. A different style is picked each time.', s.scenes.length + ' dari ' + DEF.SCENES.length + ' aktif. Gaya berbeda dipilih setiap kali.'), '<div class="dtt-grid">' + DEF.SCENES.map(function (k) {
        return '<div class="dtt-gamecard">' + ui.sw(k, s.scenes.indexOf(k) >= 0, pair(SCENE_NAMES[k]), '', 'sceneTog') + '<button type="button" class="tl-btn quiet sm" data-a="previewScene" data-v="' + k + '">' + esc(T('Preview', 'Coba')) + '</button></div>';
      }).join('') + '</div>') +
      opt(T('Photos', 'Foto'), '', sw('photos', s.photos, T('Show ' + name + '\'s photo', 'Tampilkan foto ' + name), T('The photo comes from the child\'s Little Us profile on this device.', 'Foto berasal dari profil Little Us anak di perangkat ini.')) +
        sw('ownPhotos', s.ownPhotos, T('Use own reinforcer photos', 'Pakai foto reinforcer sendiri'), T('Photos of what the student loves. Add them under Student setup.', 'Foto hal yang disukai anak. Tambahkan di Atur anak.'))) +
      opt('Token board', '', sw('tokenOn', s.tokenOn, T('Use a token board', 'Pakai Token board'), T('Tokens are earned by the reinforcement schedule. A full board shows the reward and offers a break.', 'Token didapat sesuai jadwal Reinforcement. Papan penuh menampilkan hadiah dan menawarkan istirahat.')) +
        (s.tokenOn ? seg('tokens', s.tokens, [[3, '3'], [5, '5'], [10, '10']]) + tokenReward(s) : '')) +
      opt(T('Praise phrases on screen', 'Kalimat pujian di layar'), T('One phrase per line. {name} is replaced with the student\'s name. A phrase is picked at random and shown in big letters.', 'Satu kalimat per baris. {name} diganti dengan nama anak. Kalimat dipilih acak dan ditampilkan dengan huruf besar.'), ui.area(T('Phrases', 'Kalimat'), s.praise, 'data-in="txt" data-k="praise"', 6) + sw('cheer', s.cheer, T('Start with a cheer word', 'Mulai dengan kata sorakan'), T('Adds "Yay!", "Woohoo!" or "Hooray!" before the praise.', 'Menambahkan "Yay!", "Asyik!", atau "Hore!" sebelum pujian.'))) +
      opt(T('Brief praise', 'Pujian singkat'), T('Shown for prompted responses and when the schedule has not been met yet. One per line.', 'Ditampilkan untuk respons Prompted dan saat jadwal belum terpenuhi. Satu per baris.'), ui.area(T('Phrases', 'Kalimat'), s.brief, 'data-in="txt" data-k="brief"', 3)) +
      opt(T('Fun breaks', 'Istirahat seru'), T('A short game between trials. Fun breaks never count as trials, are not saved in the data, wait until any error correction is finished, and can always be skipped.', 'Permainan singkat di antara trial. Tidak dihitung sebagai trial, tidak disimpan dalam data, menunggu Error correction selesai, dan selalu bisa dilewati.'), seg('inter', s.inter, [[0, T('Off', 'Mati')], [3, T('Every 3 trials', 'Tiap 3 trial')], [5, T('Every 5 trials', 'Tiap 5 trial')]]) +
        (s.inter ? '<div class="dtt-grid">' + DEF.GAMES.map(function (k) { var g = GAME_NAMES[k]; return '<div class="dtt-gamecard">' + ui.sw(k, s.games[k] !== false, T(g[0], g[1]), T(g[2], g[3]), 'gameTog') + '<button type="button" class="tl-btn quiet sm" data-a="tryGame" data-v="' + k + '">' + esc(T('Try it', 'Coba')) + '</button></div>'; }).join('') + '</div>' : ''));
  }
  function tokenReward(s) {
    var kid = ui.student(), photos = kid ? D.store.student(kid.id).photos : [];
    return '<div class="dtt-sublabel">' + esc(T('Reward when the board is full', 'Hadiah saat papan penuh')) + '</div><div class="dtt-imgs"><button type="button" class="dtt-card' + (s.tokenReward === 'celebration' ? ' on' : '') + '" aria-pressed="' + (s.tokenReward === 'celebration') + '" data-a="tokenReward" data-v="celebration"><b>' + esc(T('A celebration', 'Perayaan')) + '</b></button>' + photos.map(function (m) {
      var on = s.tokenReward === m.id; return '<button type="button" class="dtt-rewardpic' + (on ? ' on' : '') + '" aria-pressed="' + on + '" aria-label="' + esc(T('Use this photo as the reward', 'Pakai foto ini sebagai hadiah')) + '" data-a="tokenReward" data-v="' + m.id + '">' + ui.img(m, '') + '</button>';
    }).join('') + '</div>' + (photos.length ? '' : '<p class="tl-note2">' + esc(T('To use a photo, add one under Student setup.', 'Untuk memakai foto, tambahkan di Atur anak.')) + '</p>');
  }
  ACT.tokenReward = function (b) { ui.ctx().settings.tokenReward = b.dataset.v; ui.touchProgram(); ui.render(); };
  function previewCtx() { var kid = ui.student(), st = kid ? D.store.student(kid.id) : { themes: [], photos: [] }; return { kid: kid, st: st }; }
  ACT.previewScene = function (b) { var c = previewCtx(); D.reinforce.preview(b.dataset.v, ui.ctx().settings, c.kid, c.st.themes, c.st.photos); };
  ACT.tryGame = function (b) { D.games.preview(b.dataset.v, ui.ctx().settings, previewCtx().st.themes); };
  ACT.sceneTog = function (b) { var s = ui.ctx().settings, k = b.dataset.k, i = s.scenes.indexOf(k); if (i >= 0) s.scenes.splice(i, 1); else s.scenes.push(k); ui.touchProgram(); ui.render(); };
  ACT.gameTog = function (b) { var s = ui.ctx().settings, k = b.dataset.k; s.games[k] = s.games[k] === false; ui.touchProgram(); ui.render(); };

  /* 8 mastery ------------------------------------------------------------------------------------------------- */
  function secMastery(p, set, s) {
    var roll = s.mRule === 'rolling';
    return '<header><h2 class="tl-h2">' + esc(T('Mastery', '%mastery%')) + '</h2><p class="tl-p">' + esc(T('When a target meets this rule at the end of a session, it is marked as mastered and moves to this program\'s maintenance pool. Only independent correct responses count. You can undo mastery in the Data tab.', 'Saat %target% memenuhi aturan ini di akhir %session%, ia ditandai %mastered% dan masuk ke kumpulan %maintenance% program ini. Hanya respons Independent yang benar yang dihitung. %mastery% bisa dibatalkan di tab Data.')) + '</p></header>' +
      opt(T('Mastery rule', 'Aturan %mastery%'), '', seg('mRule', s.mRule, [['rolling', T('Rolling', 'Rolling'), T('Mastered when at least ' + s.mNeed + ' of the last ' + s.mWin + ' trials of the target are independent, counted across sessions. A retention check follows.', '%mastered% jika setidaknya ' + s.mNeed + ' dari ' + s.mWin + ' trial terakhir Independent, dihitung lintas %sessions%. Lalu ada pemeriksaan retensi.')], ['classic', T('Classic', 'Klasik'), T('Mastered at ' + s.mPct + '% independent in ' + s.mSess + (s.mSess > 1 ? ' sessions' : ' session') + ' in a row, with a minimum number of trials each time.', '%mastered% pada ' + s.mPct + '% Independent dalam ' + s.mSess + ' %session% berturut-turut, dengan jumlah trial minimum.')]], true)) +
      (roll ? opt(T('Trials looked at', 'Trial yang dilihat'), T('The last trials of the target, from target and maintenance trials. Error correction trials never count. Prompted correct counts as not independent.', 'Trial terakhir dari %target%, dari trial %target% dan %maintenance%. Trial Error correction tidak dihitung. Prompted dianggap tidak Independent.'), stepper('mWin', s.mWin, 'trial')) +
        opt(T('Independent needed', 'Independent yang diperlukan'), '', stepper('mNeed', s.mNeed, T('of ' + s.mWin, 'dari ' + s.mWin), s.mWin)) +
        opt(T('Retention check after', 'Pemeriksaan retensi setelah'), T('A mastered target comes back once in the maintenance trials after this many days. Independent and correct confirms it. Otherwise it goes back to learning at the partial prompt.', '%target% %mastered% muncul sekali lagi dalam trial %maintenance% setelah sekian hari. Independent dan benar mengonfirmasinya. Jika tidak, ia kembali dipelajari dengan Prompt Partial.'), stepper('retDays', s.retDays, T('days', 'hari')))
      : opt(T('Independent correct', 'Independent yang benar'), '', seg('mPct', s.mPct, [[70, '70%'], [80, '80%'], [90, '90%'], [100, '100%']])) +
        opt(T('Consecutive sessions', '%sessions% berturut-turut'), '', seg('mSess', s.mSess, [[1, '1'], [2, '2'], [3, '3']])) +
        opt(T('Minimum trials per target', 'Trial minimum per %target%'), T('A session only counts toward mastery if the target had at least this many trials.', '%session% hanya dihitung jika %target% mendapat setidaknya sekian trial.'), stepper('mMin', s.mMin, 'trial'))) +
      '<p class="tl-note2">' + esc(T('A target that is still not mastered after 10 sessions is flagged on the program page.', '%target% yang belum %mastered% setelah 10 %sessions% ditandai di halaman program.')) + '</p>';
  }

  var SEC = {
    targets: { name: function () { return T('Targets', '%targets%'); }, tint: 'sky', draw: secTargets, on: function () { return true; } },
    type: { name: function () { return T('Trial type', 'Jenis trial'); }, tint: 'rose', draw: secType, on: function () { return true; } },
    array: { name: function () { return T('Array and layout', 'Susunan kartu'); }, tint: 'peach', draw: secArray, on: function (p) { return p.type !== 'tact'; } },
    order: { name: function () { return T('Order and timing', 'Urutan dan waktu'); }, tint: 'mint', draw: secOrder, on: function () { return true; } },
    prompt: { name: function () { return 'Prompt'; }, tint: 'lilac', draw: secPrompt, on: function () { return true; } },
    ec: { name: function () { return 'Error correction'; }, tint: 'rose', draw: secEC, on: function () { return true; } },
    reinf: { name: function () { return 'Reinforcement'; }, tint: 'butter', draw: secReinf, on: function () { return true; } },
    mastery: { name: function () { return T('Mastery', '%mastery%'); }, tint: 'mint', draw: secMastery, on: function () { return true; } }
  };
  ui.SEC = SEC;
  var ORDER = ['targets', 'type', 'array', 'order', 'prompt', 'ec', 'reinf', 'mastery'];

  ui.settingsList = function (p) { return ORDER.filter(function (k) { return SEC[k].on(p); }); };
  ui.settingsScreen = function (p) {
    var list = ui.settingsList(p);
    if (list.indexOf(U.sec) < 0) U.sec = list[0];
    var i = list.indexOf(U.sec), prev = list[i - 1], next = list[i + 1], set = D.store.set(p.setId);
    return '<section class="dtt-sec tl-panel pad">' + SEC[U.sec].draw(p, set, p.settings) +
      '<div class="dtt-secfoot">' + (prev ? '<button type="button" class="tl-btn quiet" data-a="sec" data-v="' + prev + '">← ' + esc(D.i18n.fill(SEC[prev].name())) + '</button>' : '<span></span>') +
      (next ? '<button type="button" class="tl-btn primary" data-a="sec" data-v="' + next + '">' + esc(D.i18n.fill(SEC[next].name())) + ' →</button>' : '<button type="button" class="tl-btn primary" data-a="ptab" data-v="overview">' + esc(T('Done', 'Selesai')) + '</button>') + '</div></section>';
  };
  ACT.sec = function (b) { U.sec = b.dataset.v; ui.render(); window.scrollTo(0, 0); };
})();
