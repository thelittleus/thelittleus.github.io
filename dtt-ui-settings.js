/* Little Us · DTT · a program's settings, drawn as the five drawer tabs (Trials, Prompts, Error Correction, Rewards, Mastery)
   and the Target Order drawer, plus the one-line summaries on the program page's cards. Every change saves itself. */
(function () {
  'use strict';
  var D = window.LUDtt, X = LUTools.api, P = D.programs, DEF = D.defaults, T = D.i18n.T, esc = X.esc, ui = D.ui, U = ui.U, ACT = ui.ACT, INP = ui.INP;
  var seg = ui.seg, sw = ui.sw, stepper = ui.stepper, row = ui.row, lab = ui.lab, div = ui.divider;

  function sec() { return T('s', 'dtk'); }
  function isLT(p) { return p.type === 'listener' || p.type === 'tact' || p.type === 'mixed'; }
  function hasListener(p) { return p.type === 'listener' || p.type === 'mixed'; }
  function hasTact(p) { return p.type === 'tact' || p.type === 'mixed'; }
  function isTouch(p) { return p.type !== 'tact'; }
  function block(title, html, extra) { return '<div class="dtt-blk">' + lab(title, extra) + html + '</div>'; }

  ui.typeName = function (t) {
    return { listener: 'Listener', tact: 'Tact', mixed: T('Mixed', 'Mixed'), matching: 'Matching', sorting: T('Sorting', 'Mengelompokkan'), pattern: T('Pattern', 'Pola') }[t] || t;
  };
  ui.schedName = function (v) { return { crf: 'CRF', fr2: 'FR 2', fr3: 'FR 3', vr2: 'VR 2', vr3: 'VR 3' }[v] || v; };
  function targetName(p, set, id) {
    if (p.type === 'pattern') {
      var pt = (p.patterns || []).filter(function (x) { return x.id === id; })[0]; if (!pt) return '';
      return pt.unit.split('').map(function (l) { var it = P.itemById(set, pt.fill[l]); return it ? P.labelOf(p, it) || '?' : '?'; }).join(' ');
    }
    return P.labelOf(p, P.itemById(set, id));
  }
  ui.targetName = targetName;

  /* ---------- Trials (3e) ---------- */
  function hintKey(p) { return { listener: 'sdHint', tact: 'tHint', mixed: 'sdHint', matching: 'mHint', sorting: 'sHint', pattern: 'patHint' }[p.type]; }
  function sayField(key, s, title) {
    return block(title, '<label class="dtt-input"><input type="text" value="' + esc(s[key]) + '" data-in="txt" data-k="' + key + '" aria-label="' + esc(title) + '"></label><p class="dtt-hint">' + esc(T('{label} becomes the target word. Shown only on your bar.', '{label} diganti kata target. Hanya tampil di panelmu.')) + '</p>');
  }
  function tabTrials(p, set, s) {
    var h = '';
    if (isLT(p)) h += block(T('Response Type', 'Jenis Respons'), seg('type', p.type, [['listener', 'Listener'], ['tact', 'Tact'], ['mixed', T('Mixed', 'Mixed')]]));
    else h += block(T('Activity', 'Aktivitas'), '<div class="dtt-static">' + esc(ui.typeName(p.type)) + '</div>');
    h += sayField(hintKey(p), s, hasTact(p) && !hasListener(p) ? T('What You Ask', 'Yang Kamu Tanyakan') : T('What You Say', 'Yang Kamu Ucapkan'));
    if (p.type === 'mixed') h += sayField('tHint', s, T('What You Ask (Tact)', 'Yang Kamu Tanyakan (Tact)'));
    if (p.type === 'sorting') h += block(T('Number of Bins', 'Jumlah Wadah'), seg('bins', s.bins, [[1, '1'], [2, '2'], [3, '3']]));
    else if (p.type !== 'tact') h += block(p.type === 'matching' ? T('Cards to Choose From', 'Kartu Pilihan') : T('Number of Cards', 'Jumlah Kartu'), seg('array', s.array, [[1, '1'], [2, '2'], [3, '3'], [4, '4'], [6, '6']]));
    if (p.type === 'matching') h += block(T('Match', 'Cocokkan'), seg('matchKind', s.matchKind, [['identical', T('Same Picture', 'Gambar Sama')], ['nonidentical', T('Another Picture', 'Gambar Lain')], ['both', T('Both', 'Keduanya')]])) +
      block(T('Sample Position', 'Posisi Contoh'), seg('samplePos', s.samplePos, [['centre', T('Centre', 'Tengah')], ['top', T('Top', 'Atas')], ['side', T('Side', 'Samping')]]));
    if (p.type !== 'sorting' && p.type !== 'tact') h += block(T('Other Cards', 'Kartu Lain'), seg('dis', s.dis, [['random', T('Random', 'Acak')], ['different', T('Very Different', 'Sangat Beda')], ['similar', T('Similar', 'Mirip')], ['avoid', T('No Look-alikes', 'Tanpa Mirip')]]));
    if (p.type !== 'tact') h += sw('rpos', s.rpos, T('Shuffle Card Positions', 'Acak Posisi Kartu'), '');
    h += div() + block(T('Trial Order', 'Urutan Trial'), seg('order', s.order, [['random', T('Random', 'Acak')], ['block', T('Massed', 'Massed')]])) +
      block(T('Maintenance Trials', 'Trial %maintenance%'), seg('maint', s.maint, [[0, T('Off', 'Mati')], [4, T('Every 4', 'Tiap 4')], [3, T('Every 3', 'Tiap 3')], [2, T('Every 2', 'Tiap 2')]])) +
      '<div class="dtt-steps3">' + block(T('Trials', 'Trial'), stepper('trials', s.trials)) + block(T('Time Between', 'Jeda'), stepper('iti', s.iti, sec())) +
      (isTouch(p) ? block(T('Time to Respond', 'Waktu Respons'), stepper('resp', s.resp, sec())) : '') + '</div>';
    return h;
  }

  /* ---------- Prompts (1c): with a small picture of each style ---------- */
  function mini(kind) {
    var c = '<i class="pv-c"></i>';
    return '<span class="dtt-pv pv-' + kind + '" aria-hidden="true">' + ({
      pulse: c, point: '<b class="pv-ar">▼</b>' + c, bigger: c, glow: '<i class="pv-s f"></i><i class="pv-s on"></i><i class="pv-s f"></i>', only: '<i class="pv-s d"></i><i class="pv-s"></i><i class="pv-s d"></i>',
      position: '<i class="pv-s"></i><i class="pv-s big"></i><i class="pv-s"></i>', first: '<b class="pv-tx">c…</b>', fill: '<b class="pv-tx sm">It\'s a …</b>', label: c + '<b class="pv-tx sm">cat</b>',
      slide: '<i class="pv-s"></i><b class="pv-ar">→</b><i class="pv-s"></i>', flash: '<i class="pv-s on"></i><i class="pv-s"></i><i class="pv-s on"></i>'
    }[kind] || c) + '</span>';
  }
  function styles(title, key, cur, list) {
    return block(title, '<div class="dtt-pvgrid n' + list.length + '">' + list.map(function (o) {
      var on = String(cur) === o[0];
      return '<button type="button" class="dtt-pvcard' + (on ? ' on' : '') + '" aria-pressed="' + on + '" data-a="set" data-k="' + key + '" data-v="' + o[0] + '">' + mini(o[2] || o[0]) + '<span>' + esc(o[1]) + '</span></button>';
    }).join('') + '</div>');
  }
  function tabPrompts(p, set, s) {
    var desc = { manual: T('No prompt until you press Partial or Full.', 'Tanpa Prompt sampai kamu menekan Partial atau Full.'), mtl: T('Starts at full prompt, fades after a correct streak, steps back on error.', 'Mulai dari Prompt penuh, memudar setelah benar berturut-turut, naik lagi saat salah.'), ltm: T('Starts with no prompt, steps up when there is no response.', 'Mulai tanpa Prompt, naik saat tidak ada respons.'), td: T('Prompts straight away at first, then waits a little longer before prompting.', 'Awalnya langsung memberi Prompt, lalu menunggu sebelum memberi Prompt.') }[s.prompt];
    var part = s.levels !== 'full', full = s.levels !== 'partial', h = '';
    h += block(T('Prompt Levels', 'Tingkat Prompt'), seg('levels', s.levels, [['both', T('Partial + Full', 'Partial + Full')], ['full', T('Full Only', 'Full Saja')], ['partial', T('Partial Only', 'Partial Saja')]]));
    h += block(T('Method', 'Metode'), seg('prompt', s.prompt, [['manual', 'Manual'], ['mtl', 'Most → Least'], ['ltm', 'Least → Most'], ['td', T('Delay', 'Jeda')]]) + '<p class="dtt-hint">' + esc(desc) + '</p>');
    if (s.prompt === 'mtl' || s.prompt === 'td') h += row(T('Fade After', 'Pudar Setelah'), '', stepper('fade', s.fade, T('correct', 'benar')));
    if (s.prompt === 'td') h += row(T('Delay', 'Jeda'), '', stepper('tdDelay', s.tdDelay, sec()));
    if (hasListener(p)) {
      if (part) h += styles(T('Partial Prompt Style', 'Gaya Prompt Partial'), 'lPart', s.lPart, [['pulse', T('Pulse', 'Berdenyut')], ['point', T('Arrow', 'Panah')], ['bigger', T('Grow', 'Membesar')]]);
      if (full) h += styles(T('Full Prompt Style', 'Gaya Prompt Full'), 'lFull', s.lFull, [['glow', T('Glow, Fade Others', 'Menyala, Lain Pudar')], ['only', T('Correct Card Only', 'Hanya Kartu Benar')]]);
    }
    if (hasTact(p)) {
      if (part) h += styles(T('Tact: Partial Prompt', 'Tact: Prompt Partial'), 'tPart', s.tPart, [['first', T('First Sound', 'Bunyi Awal')], ['fill', T('Fill-in', 'Melengkapi')], ['label', T('Written Word', 'Kata Tertulis')]]);
      if (part && s.tPart === 'fill') h += block(T('Fill-in Script', 'Naskah Melengkapi'), '<label class="dtt-input"><input type="text" value="' + esc(s.tFill) + '" data-in="txt" data-k="tFill"></label>');
      if (full) h += '<p class="dtt-hint">' + esc(T('Full prompt for Tact: you say the whole word (your bar reminds you).', 'Prompt Full untuk Tact: kamu ucapkan seluruh kata (panelmu mengingatkan).')) + '</p>';
    }
    if (p.type === 'matching') {
      if (part) h += styles(T('Partial Prompt Style', 'Gaya Prompt Partial'), 'mPart', s.mPart, [['position', T('Closer', 'Lebih Dekat')], ['pulse', T('Pulse', 'Berdenyut')], ['point', T('Arrow', 'Panah')]]) + sw('mFade', s.mFade, T('Fade the Other Cards', 'Pudarkan Kartu Lain'), T('They shrink step by step as the prompt fades', 'Mengecil bertahap saat Prompt memudar'));
      if (full) h += '<p class="dtt-hint">' + esc(T('Full prompt: the sample slides most of the way to the match.', 'Prompt Full: contoh bergeser hampir sampai ke pasangannya.')) + '</p>';
    }
    if (p.type === 'sorting') {
      if (part) h += styles(T('Partial Prompt Style', 'Gaya Prompt Partial'), 'sPart', s.sPart, [['pulse', T('Bin Pulses', 'Wadah Berdenyut')], ['point', T('Arrow', 'Panah')]]);
      if (full) h += styles(T('Full Prompt Style', 'Gaya Prompt Full'), 'sFull', s.sFull, [['slide', T('Card Slides Halfway', 'Kartu Bergeser')], ['only', T('Correct Bin Only', 'Hanya Wadah Benar')]]);
    }
    if (p.type === 'pattern') {
      if (part) h += styles(T('Partial Prompt Style', 'Gaya Prompt Partial'), 'patPart', s.patPart, [['flash', T('Pattern Flashes', 'Pola Menyala')], ['pulse', T('Pulse', 'Berdenyut')]]);
      if (full) h += styles(T('Full Prompt Style', 'Gaya Prompt Full'), 'patFull', s.patFull, [['glow', T('Glow', 'Menyala')], ['only', T('Correct Card Only', 'Hanya Kartu Benar')]]);
    }
    return h;
  }

  /* ---------- Error Correction (3f) ---------- */
  function tabEC(p, set, s) {
    var step = function (n, title, sub, extra, dashed) { return '<div class="dtt-ecstep' + (dashed ? ' dashed' : '') + '"><span class="dtt-ecn">' + n + '</span><span class="dtt-swtx"><b>' + esc(title) + '</b><small>' + esc(sub) + '</small></span>' + (extra || '') + '</div>'; };
    return sw('ec', s.ec, T('Use Error Correction', 'Pakai Error Correction'), T('Correction trials are not counted', 'Trial koreksi tidak dihitung')) +
      (s.ec ? div() + block(T('After an Error', 'Setelah Salah'), '<div class="dtt-ecsteps">' +
        step(1, T('Correction Trial', 'Trial Koreksi'), T('Same target, ' + (s.levels === 'partial' ? 'partial' : 'full') + ' prompt', '%target% sama, Prompt ' + (s.levels === 'partial' ? 'Partial' : 'Full'))) +
        step(2, T('Distractor Trial', 'Trial Distraktor'), T('An easier or mastered target', '%target% yang lebih mudah atau sudah %mastered%'), '<button type="button" class="dtt-mini-sw" role="switch" aria-checked="' + !!s.ecD + '" aria-label="' + esc(T('Distractor trial', 'Trial distraktor')) + '" data-a="tog" data-k="ecD"><span class="tl-tog"></span></button>', true) +
        step(3, T('Transfer Trial', 'Trial Transfer'), T('Same target, no prompt', '%target% sama, tanpa Prompt')) + '</div>') : '');
  }

  /* ---------- Rewards (3g, 5f) ---------- */
  var SCENE_NAMES = {
    center: ['Bouncing', 'Melompat'], walk: ['Parade', 'Parade'], race: ['Running Race', 'Lomba Lari'], hop: ['Hopping', 'Melompat-lompat'], skate: ['Skateboarding', 'Skateboard'], balloons: ['Balloon Float', 'Balon Terbang'], popup: ['Peekaboo', 'Cilukba'], dance: ['Dance Party', 'Pesta Dansa'], slide: ['Rainbow Slide', 'Perosotan Pelangi'], rocket: ['Rocket Launch', 'Roket'], fireworks: ['Fireworks', 'Kembang Api'], train: ['Train Ride', 'Naik Kereta'], surf: ['Surf and Splash', 'Berselancar']
  };
  var GAME_NAMES = { shadow: ['Shadow Guess', 'Tebak Bayangan'], peek: ['Peekaboo', 'Cilukba'], closeup: ['Close-up', 'Dari Dekat'], silly: ['Silly Mix', 'Campuran Lucu'], open: ['Tap to Open', 'Ketuk Buka'], feed: ['Feed or Give', 'Beri Makan'], match: ['Find the Match', 'Cari Pasangan'], pop: ['Pop and Splash', 'Pecahkan'] };
  ui.SCENE_NAMES = SCENE_NAMES;
  function pair(a) { return T(a[0], a[1]); }
  function tabRewards(p, set, s) {
    var kid = ui.student(), name = kid ? kid.name : T('the student', 'anak'), photos = kid ? D.store.student(kid.id).photos : [];
    var h = block(T('Full Celebration Every', 'Perayaan Penuh Setiap'), seg('sched', s.sched, [['crf', T('Correct', 'Benar')], ['fr2', T('2nd', 'Ke-2')], ['fr3', T('3rd', 'Ke-3')], ['vr2', '~' + T('2nd', 'ke-2')], ['vr3', '~' + T('3rd', 'ke-3')]])) +
      sw('diff', s.diff, T('Only for Independent', 'Hanya untuk Independent'), T('Prompted gets a quick "Yes!"', 'Prompted mendapat "Ya!" singkat')) +
      row(T('Celebration Length', 'Lama Perayaan'), '', stepper('dur', s.dur, sec())) + div() +
      block(T('Celebrations', 'Perayaan'), '<div class="dtt-chips">' + DEF.SCENES.map(function (k) {
        var on = s.scenes.indexOf(k) >= 0;
        return '<span class="dtt-schip' + (on ? ' on' : '') + '"><button type="button" class="dtt-schipt" role="switch" aria-checked="' + on + '" data-a="sceneTog" data-k="' + k + '">' + esc(pair(SCENE_NAMES[k])) + '</button><button type="button" class="dtt-play" data-a="previewScene" data-v="' + k + '" aria-label="' + esc(T('Preview', 'Coba')) + '">▶</button></span>';
      }).join('') + '</div>', T(s.scenes.length + ' of ' + DEF.SCENES.length + ' On', s.scenes.length + ' dari ' + DEF.SCENES.length + ' Aktif')) +
      sw('photos', s.photos, T('Show ' + name + '\'s Photo', 'Tampilkan Foto ' + name), T('Their Little Us profile picture', 'Foto profil Little Us-nya')) +
      sw('ownPhotos', s.ownPhotos, T('Show Reward Photos', 'Tampilkan Foto Reward'), T('From Reward Photos in Settings', 'Dari Foto Reward di Pengaturan')) + div() +
      sw('tokenOn', s.tokenOn, T('Token Board', 'Token Board'), T('One token per correct response', 'Satu token per respons benar'));
    if (s.tokenOn) h += row(T('Tokens to Earn', 'Token yang Dikumpulkan'), '', stepper('tokens', s.tokens)) +
      block(T('Reward', 'Hadiah'), '<div class="dtt-rewards"><button type="button" class="dtt-reward' + (s.tokenReward === 'celebration' ? ' on' : '') + '" aria-pressed="' + (s.tokenReward === 'celebration') + '" data-a="tokenReward" data-v="celebration"><span class="dtt-rewardimg">★</span><span>' + esc(T('Celebration', 'Perayaan')) + '</span></button>' +
        photos.map(function (m, i) { var on = s.tokenReward === m.id; return '<button type="button" class="dtt-reward' + (on ? ' on' : '') + '" aria-pressed="' + on + '" data-a="tokenReward" data-v="' + m.id + '"><span class="dtt-rewardimg">' + ui.img(m, '') + '</span><span>' + esc(m.name || T('Photo ' + (i + 1), 'Foto ' + (i + 1))) + '</span></button>'; }).join('') +
        '<button type="button" class="dtt-reward add" data-a="goRewardPhotos"><span class="dtt-rewardimg">+</span><span>' + esc(T('Add', 'Tambah')) + '</span></button></div>') +
      row(T('Break Length', 'Lama Istirahat'), T('After a full board', 'Setelah papan penuh'), stepper('breakMin', s.breakMin, 'min')) +
      sw('tokenPrompted', s.tokenPrompted, T('Count Prompted Correct', 'Hitung Prompted yang Benar'), '');
    h += div() + block(T('Fun Breaks', 'Istirahat Seru'), seg('inter', s.inter, [[0, T('Off', 'Mati')], [3, T('Every 3 trials', 'Tiap 3 trial')], [5, T('Every 5 trials', 'Tiap 5 trial')]]) +
      '<p class="dtt-hint">' + esc(T('A short game between trials. The instruction appears in big words at the top, and a hand shows where to tap. Read it out to your student. Any tap is right, and you can skip it.', 'Permainan singkat di antara trial. Petunjuknya muncul dengan huruf besar di atas, dan gambar tangan menunjukkan tempat mengetuk. Bacakan untuk anak. Ketukan apa pun benar, dan bisa dilewati.')) + '</p>' +
      (s.inter ? '<div class="dtt-chips">' + DEF.GAMES.map(function (k) { var on = s.games[k] !== false; return '<span class="dtt-schip' + (on ? ' on' : '') + '"><button type="button" class="dtt-schipt" role="switch" aria-checked="' + on + '" data-a="gameTog" data-k="' + k + '">' + esc(pair(GAME_NAMES[k])) + '</button><button type="button" class="dtt-play" data-a="tryGame" data-v="' + k + '" aria-label="' + esc(T('Try it', 'Coba')) + '">▶</button></span>'; }).join('') + '</div>' : '')) +
      '<details class="dtt-fold"><summary>' + esc(T('Praise Words', 'Kata Pujian')) + '</summary>' +
      block(T('Big Praise', 'Pujian Besar'), '<textarea class="dtt-textarea" rows="5" data-in="txt" data-k="praise">' + esc(s.praise) + '</textarea><p class="dtt-hint">' + esc(T('One per line. {name} becomes the student\'s name.', 'Satu per baris. {name} diganti nama anak.')) + '</p>') +
      sw('cheer', s.cheer, T('Start With a Cheer', 'Mulai dengan Sorakan'), '"Yay!", "Woohoo!"') +
      block(T('Quick Praise', 'Pujian Singkat'), '<textarea class="dtt-textarea" rows="3" data-in="txt" data-k="brief">' + esc(s.brief) + '</textarea>') + '</details>';
    return h;
  }
  ACT.tokenReward = function (b) { ui.ctx().settings.tokenReward = b.dataset.v; ui.touchProgram(); ui.render(); };
  ACT.goRewardPhotos = function () { if (ui.drawerOpen()) ACT.drClose(); U.view = 'settings'; ui.render(); window.scrollTo(0, 0); };
  function previewCtx() { var kid = ui.student(), st = kid ? D.store.student(kid.id) : { themes: [], photos: [] }; return { kid: kid, st: st }; }
  ACT.previewScene = function (b) { ui.celebrationPreview(b.dataset.v); };
  // 5i: a celebration plays for real, with ‹ › to step through and "Use This" to switch it on
  ui.celebrationPreview = function (k) {
    var p = ui.ctx(), list = DEF.SCENES, i = list.indexOf(k), c = previewCtx();
    D.reinforce.preview(list[i], p.settings, c.kid, c.st.themes, c.st.photos);
    var bar = document.createElement('div'); bar.className = 'dtt-pvbar';
    function draw() {
      var key = list[i], on = p.settings.scenes.indexOf(key) >= 0;
      bar.innerHTML = '<button type="button" data-n="-1" aria-label="' + esc(T('Previous', 'Sebelumnya')) + '">‹</button><span><b>' + esc(pair(SCENE_NAMES[key])) + '</b><small>' + (i + 1) + ' ' + esc(T('of', 'dari')) + ' ' + list.length + '</small></span><button type="button" data-n="1" aria-label="' + esc(T('Next', 'Berikutnya')) + '">›</button>' +
        '<button type="button" class="dtt-btn sm" data-r>↻ ' + esc(T('Replay', 'Ulangi')) + '</button><button type="button" class="dtt-btn sm primary" data-use>' + esc(on ? T('In Use ✓', 'Dipakai ✓') : T('Use This', 'Pakai Ini')) + '</button><button type="button" class="dtt-x" data-x aria-label="' + esc(T('Close', 'Tutup')) + '">✕</button>';
    }
    function play() { document.querySelectorAll('.dtt-cele').forEach(function (x) { x.remove(); }); D.reinforce.preview(list[i], p.settings, c.kid, c.st.themes, c.st.photos); document.body.appendChild(bar); }
    bar.addEventListener('click', function (e) {
      var t = e.target.closest('button'); if (!t) return;
      if (t.hasAttribute('data-x')) { bar.remove(); document.querySelectorAll('.dtt-cele').forEach(function (x) { x.remove(); }); return; }
      if (t.dataset.n) { i = (i + Number(t.dataset.n) + list.length) % list.length; draw(); play(); }
      if (t.hasAttribute('data-r')) play();
      if (t.hasAttribute('data-use')) { if (p.settings.scenes.indexOf(list[i]) < 0) { p.settings.scenes.push(list[i]); ui.touchProgram(); ui.render(); } draw(); }
    });
    draw(); document.body.appendChild(bar);
  };
  ACT.tryGame = function (b) { D.games.preview(b.dataset.v, ui.ctx().settings, previewCtx().st.themes); };
  ACT.sceneTog = function (b) { var s = ui.ctx().settings, k = b.dataset.k, i = s.scenes.indexOf(k); if (i >= 0) s.scenes.splice(i, 1); else s.scenes.push(k); ui.touchProgram(); ui.render(); };
  ACT.gameTog = function (b) { var s = ui.ctx().settings, k = b.dataset.k; s.games[k] = s.games[k] === false; ui.touchProgram(); ui.render(); };

  /* ---------- Mastery (4a, 4b, 4c): the rule as one sentence with editable parts ---------- */
  function pick(key, cur, opts, label) {
    return '<label class="dtt-chipsel"><span class="dtt-sr">' + esc(label) + '</span><select data-in="selSet" data-on="change" data-k="' + key + '">' + opts.map(function (o) {
      return '<option value="' + esc(o[0]) + '"' + (String(o[0]) === String(cur) ? ' selected' : '') + '>' + esc(o[1]) + '</option>';
    }).join('') + '</select></label>';
  }
  function nums(a, b, step, suffix) { var o = []; for (var n = a; n <= b; n += (step || 1)) o.push([n, n + (suffix || '')]); return o; }
  function tabMastery(p, set, s) {
    var roll = s.mRule === 'rolling', word = pick('mCount', s.mCount, [['ind', T('independent', 'independent')], ['any', T('correct', 'benar')]], T('What counts', 'Yang dihitung'));
    var sentence = roll
      ? esc(T('Mastered when', '%mastered% jika')) + ' ' + pick('mNeed', s.mNeed, nums(1, s.mWin), T('Needed', 'Diperlukan')) + ' ' + esc(T('of the last', 'dari')) + ' ' + pick('mWin', s.mWin, nums(3, 20), T('Trials looked at', 'Trial yang dilihat')) + ' ' + esc(T('trials are', 'trial terakhir')) + ' ' + word
      : esc(T('Mastered at', '%mastered% pada')) + ' ' + pick('mPct', s.mPct, nums(50, 100, 5, '%'), T('Percentage', 'Persentase')) + ' ' + word + ' ' + esc(T('for', 'selama')) + ' ' + pick('mSess', s.mSess, nums(1, 10), T('Sessions', 'Session')) + ' ' + esc(T('sessions in a row', '%sessions% berturut-turut'));
    return block(T('Mastery Rule', 'Aturan %mastery%'), seg('mRule', s.mRule, [['classic', T('Consecutive Sessions', '%sessions% Berturut-turut')], ['rolling', T('Recent Trials', 'Trial Terakhir')]])) +
      '<div class="dtt-sentence">' + D.i18n.fill(sentence) + '</div>' +
      block(T('What Counts', 'Yang Dihitung'), seg('mCount', s.mCount, [['ind', T('Independent Only', 'Independent Saja')], ['any', T('Independent + Prompted', 'Independent + Prompted')]])) +
      (roll ? '<p class="dtt-hint">' + esc(T('Counted across sessions. Error correction trials never count.', 'Dihitung lintas %sessions%. Trial Error correction tidak pernah dihitung.')) + '</p>'
        : row(T('Min. Trials per Session', 'Trial Minimum per %session%'), T('Sessions with fewer don\'t count', '%sessions% dengan trial lebih sedikit tidak dihitung'), stepper('mMin', s.mMin)) +
          row(T('A Missed Session', '%session% yang Gagal'), T('Below ' + s.mPct + '% breaks the streak', 'Di bawah ' + s.mPct + '% memutus rangkaian'), '<div class="dtt-segw">' + seg('mMiss', s.mMiss, [['reset', T('Resets', 'Mulai Lagi')], ['pause', T('Pauses', 'Ditahan')]]) + '</div>')) +
      div() + row(T('Recheck After', 'Periksa Ulang Setelah'), T('Comes back once in maintenance', 'Muncul sekali lagi di %maintenance%'), stepper('retDays', s.retDays, T('days', 'hari')));
  }
  ui.masteryText = function (s) {
    var w = s.mCount === 'any' ? T('correct', 'benar') : T('independent', 'independent');
    return s.mRule === 'rolling' ? T(s.mNeed + ' of last ' + s.mWin + ' ' + w, s.mNeed + ' dari ' + s.mWin + ' terakhir ' + w) : T(s.mPct + '% ' + w + ', ' + s.mSess + (s.mSess > 1 ? ' sessions' : ' session') + ' in a row', s.mPct + '% ' + w + ', ' + s.mSess + ' %sessions% berturut-turut');
  };

  /* ---------- Target Order (3d): drag to reorder, pin, remove ---------- */
  function swatchOf(it) { return it ? '<span class="dtt-qimg">' + ui.img(it.images[0], '') + '</span>' : '<span class="dtt-qimg"></span>'; }
  function tabOrder(p, set, s) {
    if (!set) return '<p class="dtt-hint">' + esc(T('Choose a stimulus set first.', 'Pilih stimulus set dulu.')) + '</p>';
    var h = row(T('Active at Once', 'Aktif Sekaligus'), '', stepper('activeCount', p.activeCount));
    if (p.type === 'sorting') h += categories(p, set);
    if (p.type === 'pattern') h += patterns(p, set);
    h += '<ol class="dtt-order" data-order>' + p.queue.map(function (id, n) {
      var it = p.type === 'pattern' ? null : P.itemById(set, id), pinned = p.pinned.indexOf(id) >= 0, st = ui.targetStatus(p, id, DEF.OPS[p.type][0]), a = 'data-v="' + id + '"';
      return '<li class="dtt-orow" data-id="' + id + '"><span class="dtt-drag" tabindex="0" role="button" aria-label="' + esc(T('Move ' + (targetName(p, set, id) || '') + '. Use the arrow keys.', 'Pindahkan. Pakai tombol panah.')) + '" data-drag="' + id + '">⋮⋮</span><span class="dtt-on">' + (n + 1) + '</span>' + swatchOf(it) +
        '<b>' + esc(targetName(p, set, id) || T('No label', 'Tanpa label')) + '</b><span class="dtt-chip ' + st + '">' + esc(ui.statusName(st)) + '</span>' +
        '<button type="button" class="dtt-qbtn' + (pinned ? ' on' : '') + '" data-a="qPin" ' + a + ' aria-pressed="' + pinned + '" aria-label="' + esc(T('Pin as always active', 'Sematkan agar selalu aktif')) + '">' + (pinned ? '★' : '☆') + '</button>' +
        '<button type="button" class="dtt-qbtn" data-a="qRemove" ' + a + ' aria-label="' + esc(T('Remove from this program', 'Hapus dari program ini')) + '">✕</button></li>';
    }).join('') + '</ol><p class="dtt-hint dtt-orderhint"><span>⋮⋮ ' + esc(T('Drag to reorder', 'Seret untuk mengurutkan')) + '</span><span>★ ' + esc(T('Pinned = always active', 'Disematkan = selalu aktif')) + '</span></p>';
    var out = p.excluded || [];
    if (out.length) h += '<div class="dtt-chips">' + out.map(function (id) { return '<button type="button" class="dtt-chip add" data-a="qAdd" data-v="' + id + '">+ ' + esc(targetName(p, set, id) || '?') + '</button>'; }).join('') + '</div>';
    h += '<div class="dtt-rowbtns"><button type="button" class="dtt-btn sec" data-a="editSet" data-id="' + set.id + '">+ ' + esc(T('Add From ' + (set.name || 'the set'), 'Tambah dari ' + (set.name || 'set'))) + '</button></div>';
    return h;
  }
  ACT.qPin = function (b) { P.togglePin(ui.ctx(), b.dataset.v); ui.touchProgram(); ui.render(); };
  ACT.qRemove = function (b) { P.removeTarget(ui.ctx(), b.dataset.v); ui.touchProgram(); ui.render(); };
  ACT.qAdd = function (b) { P.addTarget(ui.ctx(), b.dataset.v); ui.touchProgram(); ui.render(); };
  ACT.editSet = function (b) { if (ui.drawerOpen && ui.drawerOpen()) ACT.drClose(); U.setId = b.dataset.id; U.view = 'set'; U.item = null; ui.render(); window.scrollTo(0, 0); };
  function moveTo(p, id, to) { var q = p.queue, from = q.indexOf(id); if (from < 0 || to === from) return; q.splice(from, 1); q.splice(Math.max(0, Math.min(q.length, to)), 0, id); ui.touchProgram(); ui.render(); }
  // dragging works with a mouse, a finger or a pen; on a keyboard, the arrow keys move the focused row
  function wireDrag(root) {
    if (root.dataset.dragWired) return; root.dataset.dragWired = '1';
    root.addEventListener('pointerdown', function (e) {
      var hnd = e.target.closest('[data-drag]'); if (!hnd) return;
      e.preventDefault();
      var li = hnd.closest('li'), list = li.parentNode, rows = Array.prototype.slice.call(list.children), y0 = e.clientY, idx = rows.indexOf(li), to = idx;
      li.classList.add('dragging'); try { hnd.setPointerCapture(e.pointerId); } catch (er) { }
      function move(ev) {
        var dy = ev.clientY - y0; li.style.transform = 'translateY(' + dy + 'px)';
        var mid = li.getBoundingClientRect().top + li.offsetHeight / 2; to = 0;
        rows.forEach(function (r, i) { if (r === li) return; var rr = r.getBoundingClientRect(); if (mid > rr.top + rr.height / 2) to = i < idx ? i + 1 : i; });
        if (to > idx) to = Math.min(to, rows.length - 1);
      }
      function up() { hnd.removeEventListener('pointermove', move); hnd.removeEventListener('pointerup', up); hnd.removeEventListener('pointercancel', up); li.classList.remove('dragging'); li.style.transform = ''; if (to !== idx) moveTo(ui.ctx(), hnd.dataset.drag, to); }
      hnd.addEventListener('pointermove', move); hnd.addEventListener('pointerup', up); hnd.addEventListener('pointercancel', up);
    });
    root.addEventListener('keydown', function (e) {
      var hnd = e.target.closest('[data-drag]'); if (!hnd || (e.key !== 'ArrowUp' && e.key !== 'ArrowDown')) return;
      e.preventDefault(); var p = ui.ctx(), id = hnd.dataset.drag, at = p.queue.indexOf(id);
      moveTo(p, id, at + (e.key === 'ArrowUp' ? -1 : 1));
      var again = document.querySelector('[data-drag="' + id + '"]'); if (again) again.focus();
    });
  }

  function categories(p, set) {
    var tags = P.tagsOf(set);
    return block(T('Bins', 'Wadah'), tags.length ? '<div class="dtt-chips">' + tags.map(function (t) {
      var on = p.categories.indexOf(t) >= 0;
      return '<button type="button" class="dtt-chip' + (on ? ' on' : '') + '" aria-pressed="' + on + '" data-a="catTog" data-v="' + esc(t) + '">' + esc(t) + '</button>';
    }).join('') + '</div>' : '<p class="dtt-hint">' + esc(T('Add categories to the stimuli in the set first.', 'Tambahkan kategori pada stimulus di set dulu.')) + '</p>');
  }
  ACT.catTog = function (b) { var p = ui.ctx(), v = b.dataset.v, i = p.categories.indexOf(v); if (i >= 0) p.categories.splice(i, 1); else p.categories.push(v); ui.touchProgram(); ui.render(); };
  function patterns(p, set) {
    var items = (set && set.items) || [];
    return block(T('Patterns', 'Pola'), (p.patterns || []).map(function (pt, n) {
      return '<div class="dtt-patcard"><div class="dtt-crow"><b>' + esc(T('Pattern ' + (n + 1), 'Pola ' + (n + 1))) + '</b><button type="button" class="dtt-qbtn" data-a="patDel" data-v="' + pt.id + '" aria-label="' + esc(T('Remove', 'Hapus')) + '">✕</button></div>' +
        '<div class="tl-seg dtt-seg" role="group">' + DEF.PATTERN_UNITS.map(function (u) { return '<button type="button" class="' + (pt.unit === u ? 'on' : '') + '" aria-pressed="' + (pt.unit === u) + '" data-a="patUnit" data-v="' + pt.id + '" data-k="' + u + '">' + u + '</button>'; }).join('') + '</div>' +
        '<div class="dtt-patfill">' + P.unitLetters(pt.unit).map(function (l) {
          return '<label class="dtt-input"><span>' + l + '</span><select data-in="patFill" data-on="change" data-v="' + pt.id + '" data-k="' + l + '"><option value="">' + esc(T('Choose', 'Pilih')) + '</option>' + items.map(function (i) { return '<option value="' + i.id + '"' + (pt.fill[l] === i.id ? ' selected' : '') + '>' + esc(P.labelOf(p, i) || '?') + '</option>'; }).join('') + '</select></label>';
        }).join('') + '</div></div>';
    }).join('') + '<button type="button" class="dtt-btn sec sm" data-a="patAdd"' + (items.length ? '' : ' disabled') + '>+ ' + esc(T('Add a Pattern', 'Tambah Pola')) + '</button>');
  }
  function findPat(p, id) { return p.patterns.filter(function (x) { return x.id === id; })[0]; }
  function patChanged(p) { P.syncQueue(p, D.store.set(p.setId)); ui.touchProgram(); }
  ACT.patAdd = function () { var p = ui.ctx(); p.patterns.push(P.newPattern('AB')); patChanged(p); ui.render(); };
  ACT.patDel = function (b) { var p = ui.ctx(); p.patterns = p.patterns.filter(function (x) { return x.id !== b.dataset.v; }); patChanged(p); ui.render(); };
  ACT.patUnit = function (b) { var p = ui.ctx(), pt = findPat(p, b.dataset.v); pt.unit = b.dataset.k; var keep = {}; P.unitLetters(pt.unit).forEach(function (l) { if (pt.fill[l]) keep[l] = pt.fill[l]; }); pt.fill = keep; patChanged(p); ui.render(); };
  INP.patFill = function (el) { var p = ui.ctx(), pt = findPat(p, el.dataset.v); if (el.value) pt.fill[el.dataset.k] = el.value; else delete pt.fill[el.dataset.k]; patChanged(p); };

  /* ---------- the tabs and the summaries ---------- */
  var TABS = {
    trials: { name: function () { return T('Trials', 'Trial'); }, draw: tabTrials },
    prompts: { name: function () { return T('Prompts', 'Prompt'); }, draw: tabPrompts },
    correction: { name: function () { return T('Error Correction', 'Error Correction'); }, draw: tabEC },
    rewards: { name: function () { return T('Rewards', 'Reward'); }, draw: tabRewards },
    mastery: { name: function () { return T('Mastery', '%mastery%'); }, draw: tabMastery }
  };
  ui.TABS = TABS;
  ui.TAB_ORDER = ['trials', 'prompts', 'correction', 'rewards', 'mastery'];
  ui.summary = function (k, p) {
    var s = p.settings;
    if (k === 'trials') return [p.type === 'tact' ? T('1 picture', '1 gambar') : p.type === 'sorting' ? T(s.bins + (s.bins === 1 ? ' bin' : ' bins'), s.bins + ' wadah') : T(s.array + (s.array === 1 ? ' card' : ' cards') + (s.rpos ? ' · shuffled' : ''), s.array + ' kartu' + (s.rpos ? ' · diacak' : '')), T(s.trials + ' per session · ' + (s.order === 'block' ? 'massed' : 'random'), s.trials + ' per %session% · ' + (s.order === 'block' ? 'massed' : 'acak')), isTouch(p) ? T(s.resp + ' s to respond', s.resp + ' dtk untuk merespons') : ''];
    if (k === 'prompts') {
      var st = { pulse: 'Pulse', point: 'Arrow', bigger: 'Grow', glow: 'Glow', only: T('Correct only', 'Hanya benar'), first: T('First sound', 'Bunyi awal'), fill: 'Fill-in', label: T('Written word', 'Kata tertulis'), position: T('Closer', 'Lebih dekat'), slide: T('Slide', 'Geser'), flash: T('Flash', 'Menyala') };
      var pk = hasListener(p) ? ['lPart', 'lFull'] : p.type === 'tact' ? ['tPart'] : p.type === 'matching' ? ['mPart'] : p.type === 'sorting' ? ['sPart', 'sFull'] : ['patPart', 'patFull'];
      return [{ manual: 'Manual', mtl: 'Most-to-least', ltm: 'Least-to-most', td: T('Time delay', 'Time delay') }[s.prompt], s.prompt === 'mtl' || s.prompt === 'td' ? T('Fade after ' + s.fade + ' correct', 'Pudar setelah ' + s.fade + ' benar') : '', pk.map(function (x) { return st[s[x]] || s[x]; }).join(' · ')];
    }
    if (k === 'correction') return s.ec ? [T('On', 'Aktif'), s.ecD ? T('Correct → distractor → retry', 'Koreksi → distraktor → ulang') : T('Correct → retry', 'Koreksi → ulang')] : [T('Off', 'Mati')];
    if (k === 'rewards') return [{ crf: T('Every correct (CRF)', 'Setiap benar (CRF)'), fr2: T('Every 2nd (FR 2)', 'Setiap ke-2 (FR 2)'), fr3: T('Every 3rd (FR 3)', 'Setiap ke-3 (FR 3)'), vr2: T('About every 2nd (VR 2)', 'Sekitar ke-2 (VR 2)'), vr3: T('About every 3rd (VR 3)', 'Sekitar ke-3 (VR 3)') }[s.sched], s.dur + ' ' + sec() + ' · ' + T(s.scenes.length + ' celebrations', s.scenes.length + ' perayaan'), s.tokenOn ? T('Token board: ' + s.tokens, 'Token board: ' + s.tokens) : ''];
    if (k === 'mastery') return [ui.masteryText(s), T('Recheck after ' + s.retDays + ' days', 'Periksa ulang setelah ' + s.retDays + ' hari')];
    return [];
  };

  /* ---------- the drawer ---------- */
  var DR = null; // { sh, tab, kind: 'settings' | 'order' }
  function drawerHTML() {
    var p = ui.ctx(); if (!p) return '';
    var set = D.store.set(p.setId), head = DR.kind === 'order' ? '<h2 class="dtt-drtitle">' + esc(T('Target Order', 'Urutan %targets%')) + '</h2>'
      : '<div class="dtt-drtabs tl-seg" role="tablist">' + ui.TAB_ORDER.map(function (k) { var on = DR.tab === k; return '<button type="button" role="tab" aria-selected="' + on + '" class="' + (on ? 'on' : '') + '" data-a="drTab" data-v="' + k + '">' + esc(D.i18n.fill(TABS[k].name())) + '</button>'; }).join('') + '</div>';
    var body = DR.kind === 'order' ? tabOrder(p, set, p.settings) : TABS[DR.tab].draw(p, set, p.settings);
    return '<div class="dtt-drawer"><div class="dtt-drhead">' + head + '<button type="button" class="dtt-x" data-a="drClose" aria-label="' + esc(T('Close', 'Tutup')) + '">✕</button></div>' +
      '<div class="dtt-drbody">' + D.i18n.fill(body) + '</div>' +
      '<div class="dtt-drfoot"><span class="dtt-ok">✓ ' + esc(T('Saved', 'Tersimpan')) + '</span><button type="button" class="dtt-btn primary" data-a="drClose">' + esc(T('Done', 'Selesai')) + '</button></div></div>';
  }
  function redraw() {
    if (!DR || !DR.sh.wrap.isConnected) return;
    var b = DR.sh.el.querySelector('.dtt-drbody'), y = b ? b.scrollTop : 0, fk = document.activeElement && DR.sh.el.contains(document.activeElement) ? document.activeElement : null;
    var sel = fk && fk.dataset ? ['a', 'in', 'k', 'v', 'drag'].map(function (n) { return fk.dataset[n] != null ? '[data-' + n + '="' + String(fk.dataset[n]).replace(/["\\]/g, '\\$&') + '"]' : ''; }).join('') : '';
    DR.sh.set(drawerHTML()); ui.hydrate(DR.sh.el);
    var nb = DR.sh.el.querySelector('.dtt-drbody'); if (nb) nb.scrollTop = y;
    var fold = DR.fold && DR.sh.el.querySelector('.dtt-fold'); if (fold) fold.open = true;
    if (sel) { var again = DR.sh.el.querySelector(sel); if (again && again.focus) again.focus({ preventScroll: true }); }
  }
  ui.openDrawer = function (kind, tab) {
    if (DR && DR.sh.wrap.isConnected) DR.sh.close();
    DR = { kind: kind, tab: tab || 'trials' };
    DR.sh = X.sheet('', { drawer: true, onClose: function () { DR = null; ui.render(); } });
    ui.bindIn(DR.sh.el); wireDrag(DR.sh.el);
    DR.sh.el.addEventListener('toggle', function (e) { if (e.target.classList && e.target.classList.contains('dtt-fold')) DR.fold = e.target.open; }, true);
    redraw();
  };
  ui.drawerOpen = function () { return !!DR; };
  ui.afterRender.push(function () { redraw(); });
  ACT.drTab = function (b) { DR.tab = b.dataset.v; DR.fold = false; redraw(); var bd = DR.sh.el.querySelector('.dtt-drbody'); if (bd) bd.scrollTop = 0; };
  ACT.drClose = function () { if (DR) DR.sh.close(); };
})();
