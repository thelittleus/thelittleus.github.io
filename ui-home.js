/* Little Us · DTT · the top-level views: programs, the program page, student setup and device preferences. */
(function () {
  'use strict';
  var D = window.LUDtt, X = LUTools.api, P = D.programs, DEF = D.defaults, T = D.i18n.T, esc = X.esc, ui = D.ui, U = ui.U, ACT = ui.ACT, INP = ui.INP;

  ACT.tab = function (b) { U.view = b.dataset.v; ui.render(); window.scrollTo(0, 0); };

  function viewPrograms() {
    var list = D.store.programs(ui.student().id);
    return ui.syncBadge() +
      '<div class="dtt-head"><div><h2 class="tl-h2">' + esc(T('Programs', 'Program')) + '</h2><p class="tl-p">' + esc(T('You lead every session. Each program teaches one group of targets in one way.', 'Kamu yang memimpin setiap %session%. Setiap program mengajarkan satu kelompok %targets% dengan satu cara.')) + '</p></div>' +
      '<button type="button" class="tl-btn primary" data-a="newProgram">' + esc(T('New program', 'Program baru')) + '</button></div>' +
      (list.length ? '<div class="tl-panel">' + list.map(function (p) {
        var set = D.store.set(p.setId), n = P.issues(p, set).length;
        return '<button type="button" class="tl-row act" data-a="openProgram" data-id="' + p.id + '"><div class="dtt-grow"><b>' + esc(p.name) + '</b><small>' + esc(ui.typeName(p.type) + (set && set.name ? ' · ' + set.name : '')) + '</small></div>' + (n ? '<span class="dtt-chip warn">' + esc(T('Needs setup', 'Perlu dilengkapi')) + '</span>' : '') + '<span aria-hidden="true">›</span></button>';
      }).join('') + '</div>' : '<div class="dtt-empty tl-panel pad"><p class="tl-p">' + esc(T('No programs yet for ' + ui.student().name + '. Create the first one with a short guided setup.', 'Belum ada program untuk ' + ui.student().name + '. Buat yang pertama dengan panduan singkat.')) + '</p></div>') +
      '<p class="tl-privacy dtt-privacy">' + esc(T('Programs, photos and session data are saved privately in your account. Please use first names or nicknames, and only add photos you have permission to use.', 'Program, foto, dan data %session% disimpan secara privat di akunmu. Gunakan nama depan atau panggilan, dan hanya tambahkan foto yang sudah kamu dapat izinnya.')) + '</p>';
  }
  ACT.openProgram = function (b) { U.programId = b.dataset.id; U.view = 'program'; U.ptab = 'overview'; ui.render(); window.scrollTo(0, 0); };

  function viewProgram() {
    var p = D.store.program(U.programId), set = D.store.set(p.setId);
    P.syncQueue(p, set);
    var body = U.ptab === 'settings' ? ui.settingsScreen(p) : U.ptab === 'data' ? ui.dataTab(p, set) : overview(p, set);
    return '<div class="dtt-progh"><h2 class="tl-h2">' + esc(p.name || T('Program', 'Program')) + '</h2><p class="tl-note2">' + esc(ui.typeName(p.type)) + '</p></div>' + body;
  }
  ACT.ptab = function (b) { U.ptab = b.dataset.v; ui.render(); window.scrollTo(0, 0); };
  var RUNNABLE = DEF.TYPES;
  // one chip per operation, so a mixed program shows Listener and Tact separately
  ui.statusChips = function (p, id) {
    var ops = DEF.OPS[p.type];
    return ops.map(function (op) {
      var st = ui.targetStatus(p, id, op), pre = ops.length > 1 ? (op === 'listener' ? 'Listener: ' : 'Tact: ') : '';
      return '<span class="dtt-chip' + (st === 'attention' ? ' warn' : st !== 'waiting' ? ' on' : '') + '">' + esc(pre + ui.statusName(st)) + '</span>';
    }).join(' ');
  };
  ui.targetStatus = function (p, id, op) {
    var pr = D.store.progressOf(p.id), ps = pr[D.targets.key(id, op)];
    if (ps && ps.masteredAt) return ps.retentionDue ? 'mastered' : 'maintenance';
    if (D.mastery.needsAttention(ps)) return 'attention';
    return D.targets.active(p, pr, op).indexOf(id) >= 0 ? 'learning' : 'waiting';
  };
  ui.statusName = function (st) { return { mastered: T('Mastered', '%mastered%'), maintenance: T('In maintenance', 'Dalam %maintenance%'), attention: T('Needs attention', 'Perlu perhatian'), learning: T('Learning', 'Dipelajari'), waiting: T('Waiting', 'Menunggu') }[st]; };
  function targetList(p, set) {
    return '<div class="tl-panel"><button type="button" class="tl-row act" data-a="ptab" data-v="settings"><div class="dtt-grow"><b>' + esc(T('Stimulus set', 'Stimulus set')) + ': ' + esc((set && set.name) || T('Unnamed set', 'Set tanpa nama')) + '</b><small>' + esc(T(p.queue.length + (p.queue.length === 1 ? ' target' : ' targets') + ' in the queue, ' + p.activeCount + ' active at a time', p.queue.length + ' %targets% dalam antrean, ' + p.activeCount + ' aktif sekaligus')) + '</small></div><span aria-hidden="true">›</span></button>' +
      p.queue.map(function (id) {
        var it = P.itemById(set, id), name = ui.targetName(p, set, id);
        return '<div class="tl-row"><span class="dtt-thumb">' + ui.img(it && it.images[0], name) + '</span><div class="dtt-grow"><b>' + esc(name || T('No label yet', 'Belum ada label')) + '</b></div>' + ui.statusChips(p, id) + '</div>';
      }).join('') + '</div>';
  }
  // flagged on the program page: an active target still not mastered after 10 sessions
  function attention(p, set) {
    var pr = D.store.progressOf(p.id), names = [];
    DEF.OPS[p.type].forEach(function (op) { p.queue.forEach(function (id) { if (D.mastery.needsAttention(pr[D.targets.key(id, op)]) && names.indexOf(ui.targetName(p, set, id)) < 0) names.push(ui.targetName(p, set, id)); }); });
    return names.length ? '<div class="tl-tip dtt-tiplist"><b>' + esc(T('Needs attention: ', 'Perlu perhatian: ')) + esc(names.join(', ')) + '</b><br>' + esc(T('Not yet mastered after 10 sessions. You could try a different prompt, a smaller array, or new pictures.', 'Belum %mastered% setelah 10 %sessions%. Kamu bisa mencoba Prompt lain, kartu lebih sedikit, atau gambar baru.')) + '</div>' : '';
  }
  function overview(p, set) {
    var probs = P.issues(p, set), can = RUNNABLE.indexOf(p.type) >= 0, ready = can && !probs.length;
    var note = !can ? T('Sessions for this type arrive in a later phase of this build.', '%session% untuk jenis ini hadir di tahap berikutnya.') : probs.length ? T('Finish the setup below first.', 'Lengkapi pengaturan di bawah dulu.') : T('Runs full screen on this device. You lead it from the panel along the bottom.', 'Berjalan layar penuh di perangkat ini. Kamu memimpinnya dari panel di bagian bawah.');
    return ui.syncBadge() + '<div class="dtt-head"><div><b>' + esc(T('Run a session', 'Jalankan %session%')) + '</b><p class="tl-note2">' + esc(note) + '</p></div><button type="button" class="tl-btn primary" data-a="startSession" data-id="' + p.id + '"' + (ready ? '' : ' disabled') + '>' + esc(T('Start session', 'Mulai %session%')) + '</button></div>' +
      (probs.length ? '<div class="tl-tip dtt-tiplist"><b>' + esc(T('To finish before the first session:', 'Lengkapi sebelum %session% pertama:')) + '</b><ul>' + probs.map(function (x) { return '<li>' + esc(ui.issueText(x)) + '</li>'; }).join('') + '</ul></div>' : '') +
      attention(p, set) + targetList(p, set) +
      '<div class="tl-panel pad">' + ui.field(T('Program name', 'Nama program'), p.name, 'data-in="progText" data-k="name"') + ui.field(T('Goal', 'Tujuan'), p.goal, 'data-in="progText" data-k="goal"') + '</div>' +
      '<div class="dtt-rowbtns"><button type="button" class="tl-btn outline" data-a="transfer" data-id="' + p.id + '">' + esc(T('Use these targets for another type', 'Pakai %targets% ini untuk jenis lain')) + '</button></div>' +
      '<div><button type="button" class="tl-link dtt-danger" data-a="delProgram" data-id="' + p.id + '" data-confirm="' + esc(T('Tap again to delete this program and its data', 'Ketuk lagi untuk menghapus program dan datanya')) + '">' + esc(T('Delete this program', 'Hapus program ini')) + '</button></div>';
  }
  ACT.startSession = function (b) { D.session.start(D.store.program(b.dataset.id)); };
  ACT.transfer = function (b) {
    var src = D.store.program(b.dataset.id), set = D.store.set(src.setId);
    if (!D.store.allowed('dtt.programs')) { if (window.LUAcc) LUAcc.lockSheet('dtt.programs'); return; }
    var st = { type: DEF.TYPES.filter(function (t) { return t !== src.type; })[0], first: false }, sh = X.sheet('');
    function draw() {
      sh.set('<div class="tl-sheethead"><h2>' + esc(T('Use these targets for another type', 'Pakai %targets% ini untuk jenis lain')) + '</h2><button type="button" class="tl-iconbtn round" data-x aria-label="' + esc(T('Close', 'Tutup')) + '">✕</button></div>' +
        '<p class="tl-note2">' + esc(T('This makes a new program on the same stimulus set, with no re-uploading. Changes to the pictures reach both programs. Reinforcement, timing, error correction and mastery start as copies. Card layout and prompt styles start fresh.', 'Ini membuat program baru dengan stimulus set yang sama, tanpa mengunggah ulang. Perubahan gambar berlaku untuk kedua program. Reinforcement, waktu, Error correction, dan %mastery% disalin. Susunan kartu dan bentuk Prompt dimulai dari awal.')) + '</p>' +
        '<div class="dtt-cards" role="group">' + DEF.TYPES.filter(function (t) { return t !== src.type; }).map(function (t) {
          var on = st.type === t; return '<button type="button" class="dtt-card' + (on ? ' on' : '') + '" aria-pressed="' + on + '" data-t="' + t + '"><b>' + esc(ui.typeName(t)) + '</b></button>';
        }).join('') + '</div>' +
        '<button type="button" class="dtt-switch" role="switch" aria-checked="' + st.first + '" data-first><span class="tl-tog" aria-hidden="true"></span><span class="dtt-swtx"><b>' + esc(T('Start with targets already mastered in this program', 'Mulai dengan %targets% yang sudah %mastered% di program ini')) + '</b><small>' + esc(T('This only puts them first in the queue. Nothing is marked as mastered in the new program.', 'Ini hanya menaruhnya di awal antrean. Tidak ada yang ditandai %mastered% di program baru.')) + '</small></span></button>' +
        '<div class="tl-sheetfoot"><button type="button" class="tl-btn primary block" data-go>' + esc(T('Create program', 'Buat program')) + '</button></div>');
    }
    sh.el.addEventListener('click', function (e) {
      var t = e.target.closest('button'); if (!t) return;
      if (t.hasAttribute('data-x')) return sh.close();
      if (t.dataset.t) { st.type = t.dataset.t; return draw(); }
      if (t.hasAttribute('data-first')) { st.first = !st.first; return draw(); }
      if (t.hasAttribute('data-go')) {
        t.disabled = true;
        var p = D.transfer.create(src, { type: st.type, set: set, lang: D.i18n.lang(), name: src.name + ' (' + ui.typeName(st.type) + ')', startMastered: st.first, progress: D.store.progressOf(src.id) });
        D.store.addProgram(p).then(function () { sh.close(); U.programId = p.id; U.view = 'program'; U.ptab = 'overview'; ui.render(); window.scrollTo(0, 0); },
          function (err) { t.disabled = false; if (err && /dtt_program_limit/.test((err.data && err.data.message) || err.message || '')) { sh.close(); if (window.LUAcc) LUAcc.lockSheet('dtt.programs'); return; } X.toast(T('The program was not saved. Check your connection and try again.', 'Program belum tersimpan. Periksa koneksi lalu coba lagi.')); });
      }
    });
    draw();
  };
  INP.progText = function (el) { var p = ui.ctx(); p[el.dataset.k] = el.value; ui.touchProgram(); };
  ACT.delProgram = function (b) {
    D.store.deleteProgram(D.store.program(b.dataset.id)).then(function () { U.view = 'programs'; ui.render(); }, function () { X.toast(T('The program was not deleted. Check your connection.', 'Program belum dihapus. Periksa koneksi.')); });
  };

  /* student setup: favorite themes, reinforcer photos, deleting data */
  var THEME_NAMES = {
    space: ['Space', 'Luar angkasa', 'Planets, rockets, astronauts, stars and friendly aliens.', 'Planet, roket, astronaut, bintang, dan alien ramah.'],
    sea: ['Under the sea', 'Bawah laut', 'Fish, turtles, jellyfish, mermaids and treasure.', 'Ikan, kura-kura, ubur-ubur, putri duyung, dan harta karun.'],
    garden: ['Garden', 'Kebun', 'Flowers, butterflies, bees, ladybugs and smiling fruit.', 'Bunga, kupu-kupu, lebah, kumbang, dan buah tersenyum.'],
    fantasy: ['Fantasy', 'Dunia dongeng', 'Unicorns, fairies, friendly dragons and castles.', 'Unicorn, peri, naga ramah, dan istana.'],
    vehicles: ['Vehicles', 'Kendaraan', 'Cars, trucks, trains, diggers, planes and boats.', 'Mobil, truk, kereta, ekskavator, pesawat, dan perahu.'],
    weather: ['Weather and sky', 'Cuaca dan langit', 'A smiling sun, rainbows, clouds, balloons and raindrops.', 'Matahari tersenyum, pelangi, awan, balon, dan tetes hujan.']
  };
  ui.studentSections = function () { return [['themes', T('Favorite themes', 'Tema favorit')], ['photos', T('Reinforcer photos', 'Foto reinforcer')], ['delete', T('Delete data', 'Hapus data')]]; };
  function viewStudent() {
    var kid = ui.student(), st = D.store.student(kid.id), n = D.store.programs(kid.id).length;
    var ids = X.S().profiles.map(function (x) { return x.id; }), orphans = D.store.orphanIds(ids);
    if (U.stuSec === 'photos') return '<section class="tl-panel pad">' + ui.opt(T('Own reinforcer photos', 'Foto reinforcer sendiri'), T('Photos of what ' + kid.name + ' actually loves. They appear in celebrations and as the reward on a token board.', 'Foto hal yang benar-benar disukai ' + kid.name + '. Muncul di perayaan dan sebagai hadiah di Token board.'),
        '<div class="dtt-imgs">' + st.photos.map(function (m) {
          return '<span class="dtt-imgwrap">' + ui.img(m, '') + '<button type="button" class="dtt-imgx" data-a="delReinf" data-v="' + m.id + '" data-confirm="?" aria-label="' + esc(T('Remove this photo', 'Hapus foto ini')) + '">✕</button></span>';
        }).join('') + '<label class="dtt-addimg" aria-label="' + esc(T('Add a photo', 'Tambah foto')) + '">+<input type="file" accept="image/*,.heic,.heif" data-in="reinfPhoto" data-on="change"></label></div>') + '</section>';
    if (U.stuSec === 'delete') return '<section class="tl-panel pad">' + ui.opt(T('Delete DTT data', 'Hapus data DTT'), T('Removes ' + kid.name + '\'s programs (' + n + '), progress, sessions, favorite themes and reinforcer photos. Stimulus sets stay, because other students may use them. This cannot be undone.', 'Menghapus program ' + kid.name + ' (' + n + '), kemajuan, %sessions%, tema favorit, dan foto reinforcer. Stimulus set tetap ada karena mungkin dipakai anak lain. Ini tidak bisa dibatalkan.'),
        '<button type="button" class="tl-link dtt-danger" data-a="wipe" data-v="' + esc(kid.id) + '" data-confirm="' + esc(T('Tap again to delete all of it', 'Ketuk lagi untuk menghapus semuanya')) + '">' + esc(T('Delete all DTT data for ' + kid.name, 'Hapus semua data DTT untuk ' + kid.name)) + '</button>') + '</section>' +
      (orphans.length ? '<section class="tl-panel pad">' + ui.opt(T('Data from removed profiles', 'Data dari profil yang dihapus'), T('This account still holds DTT data for ' + orphans.length + ' child profile(s) that no longer exist.', 'Akun ini masih menyimpan data DTT untuk ' + orphans.length + ' profil anak yang sudah tidak ada.'),
        orphans.map(function (id) { return '<button type="button" class="tl-link dtt-danger" data-a="wipe" data-v="' + esc(id) + '" data-confirm="' + esc(T('Tap again to delete it', 'Ketuk lagi untuk menghapus')) + '">' + esc(T('Delete this leftover data', 'Hapus sisa data ini')) + '</button>'; }).join(' ')) + '</section>' : '');
    return '<section class="tl-panel pad">' + ui.opt(T('Favorite themes', 'Tema favorit'), T('Celebrations and fun breaks use only these themes. If you choose none, all six are used. These stay in this tool and do not change the Little Us profile.', 'Perayaan dan istirahat seru hanya memakai tema ini. Jika tidak ada yang dipilih, keenam tema dipakai. Pilihan ini hanya untuk alat ini dan tidak mengubah profil Little Us.'),
        '<div class="dtt-cards" role="group">' + DEF.THEMES.map(function (k) {
          var t = THEME_NAMES[k], on = st.themes.indexOf(k) >= 0, chars = D.themes.chosen([k])[0].characters.slice(0, 4).map(function (c) { return D.themes.svg(c, 'dtt-char tiny'); }).join('');
          return '<button type="button" class="dtt-card' + (on ? ' on' : '') + '" aria-pressed="' + on + '" data-a="themeTog" data-v="' + k + '"><span class="dtt-themechars" aria-hidden="true">' + chars + '</span><b>' + esc(T(t[0], t[1])) + '</b><small>' + esc(T(t[2], t[3])) + '</small></button>';
        }).join('') + '</div>') + '</section>';
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

  /* device preferences: stored in this browser, not on the program */
  var PKEY = 'lu_dtt_prefs';
  ui.prefs = function () { var v = null; try { v = JSON.parse(localStorage.getItem(PKEY)); } catch (e) { } return Object.assign({}, DEF.DEF_PREFS, v || {}); };
  function savePrefs(p) { try { localStorage.setItem(PKEY, JSON.stringify(p)); } catch (e) { } }
  function viewDevice() {
    var p = ui.prefs();
    function psw(k, title, desc) { return ui.sw(k, p[k], title, desc, 'prefTog'); }
    function pseg(k, opts, cards) { return ui.seg(k, p[k], opts, cards).replace(/data-a="set"/g, 'data-a="prefSet"'); }
    return '<section class="tl-panel pad"><p class="tl-p">' + esc(T('These settings belong to this device and apply to every student and program. The app never speaks. You give the instructions, prompts and spoken models yourself.', 'Pengaturan ini berlaku untuk perangkat ini, semua anak, dan semua program. Aplikasi tidak pernah berbicara. Instruksi, Prompt, dan model lisan berasal darimu.')) + '</p>' +
      ui.opt(T('Celebration sounds', 'Suara perayaan'), '', psw('sfx', T('Play celebration sounds', 'Putar suara perayaan'), '') +
        (p.sfx ? psw('cheer', T('Play the cheer', 'Putar sorakan'), '') + psw('charSnd', T('Play character sounds', 'Putar suara karakter'), '') + psw('ding', T('Soft ding for brief praise', 'Bunyi lembut untuk pujian singkat'), '') : '')) +
      (p.sfx ? ui.opt(T('Volume', 'Volume'), '', pseg('vol', [['soft', T('Soft', 'Pelan')], ['medium', T('Medium', 'Sedang')], ['loud', T('Loud', 'Keras')]])) : '') +
      ui.opt(T('Target label in your panel', 'Label %target% di panelmu'), T('In listener trials you read the label aloud, so your panel can hide it from the student. To see it, hold the eye button, or the W key on a laptop.', 'Pada trial listener kamu membacakan label, jadi panel bisa menyembunyikannya dari anak. Untuk melihatnya, tahan tombol mata, atau tombol W di laptop.'),
        pseg('labelView', [['hold', T('Hidden, hold to see', 'Tersembunyi, tahan untuk melihat'), T('Recommended', 'Disarankan')], ['flash', T('Show for 2 seconds', 'Tampil 2 detik'), T('Then it hides. Hold to see it again.', 'Lalu tersembunyi. Tahan untuk melihat lagi.')], ['small', T('Small and faded', 'Kecil dan pudar'), T('Hard to read from a distance', 'Sulit dibaca dari jauh')], ['always', T('Always shown', 'Selalu tampil'), '']], true)) +
      ui.opt(T('Teacher buttons', 'Tombol guru'), T('On a tablet the student may tap your scoring buttons by accident.', 'Di tablet, anak mungkin tidak sengaja mengetuk tombol penilaianmu.'), psw('hold', T('Require a short hold to press teacher buttons', 'Perlu ditahan sebentar untuk menekan tombol guru'), T('Buttons fire after holding for half a second.', 'Tombol aktif setelah ditahan setengah detik.'))) +
      ui.opt(T('Motion', 'Gerakan'), '', psw('reduce', T('Reduce motion', 'Kurangi gerakan'), T('Celebrations and prompts stay still or move very little.', 'Perayaan dan Prompt diam atau hampir tidak bergerak.'))) + '</section>';
  }
  ACT.prefTog = function (b) { var p = ui.prefs(); p[b.dataset.k] = !p[b.dataset.k]; savePrefs(p); ui.render(); };
  ACT.prefSet = function (b) { var p = ui.prefs(); p[b.dataset.k] = b.dataset.v; savePrefs(p); ui.render(); };

  ui.VIEWS.programs = viewPrograms;
  ui.VIEWS.program = viewProgram;
  ui.VIEWS.student = viewStudent;
  ui.VIEWS.device = viewDevice;
})();
