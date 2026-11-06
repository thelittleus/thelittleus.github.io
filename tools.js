/* Little Us · free visual-support tools
   Visual Timer, Token Board, First–Then Board and Visual Schedule, plus the shared card library,
   child profiles, settings and backup. Everything is saved on this device only (localStorage + IndexedDB).
   Loaded on demand by the /tools pages in index.html. Needs tools-art.js. Downloads live in tools-print.js. */
(function () {
  'use strict';
  if (window.LUTools) return;

  /* ===================== access (subscription-ready) =====================
     Everything is free at launch. When "Little Us Plus" starts, set PLUS_ON to true and mark
     tools or picture packs with tier: 'plus'. canUse() is the only place that decides access. */
  var PLUS_ON = true;
  function hasPlus() { return !!(window.LUAcc && LUAcc.isPlus()); }
  function canUse(item) { return !PLUS_ON || !item || item.tier !== 'plus' || hasPlus(); }

  var A = window.LUArt;
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var L = function () { return (window.LU && LU.lang) || 'en'; };
  var uid = function (p) { return (p || 'x') + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); };
  var clamp = function (n, a, b) { return Math.max(a, Math.min(b, n)); };

  /* ===================== words ===================== */
  var T = {
    freeTools: ['Free tools', 'Alat gratis'],
    grpRoutine: ['Everyday routines', 'Rutinitas sehari-hari'], grpCalm: ['Emotional Regulation', 'Regulasi Emosi'], grpTalk: ['Social skills', 'Keterampilan sosial'], grpTeach: ['Teaching tools', 'Alat mengajar'], soon: ['Coming soon', 'Segera hadir'],
    timerL: ['A countdown your child can see, not just hear. It helps with waiting, taking turns and knowing when an activity will end.', 'Hitungan mundur yang bisa dilihat anak. Membantu saat menunggu, bergantian, dan tahu kapan kegiatan akan selesai.'],
    tokensL: ['Your child earns a star for each step or good effort, and gets the reward they chose when the board is full. Great for building new habits.', 'Anak mendapat bintang untuk setiap langkah atau usaha baik, lalu mendapat hadiah pilihannya saat papan penuh. Bagus untuk membangun kebiasaan baru.'],
    ftL: ['Shows the task that comes first and the fun thing that comes after, so “first bath, then play” is easy to understand.', 'Menunjukkan tugas yang dilakukan dulu dan hal menyenangkan sesudahnya, agar “mandi dulu, lalu main” mudah dipahami.'],
    schedL: ['The steps of a routine or the whole day in pictures, so your child knows what is happening now and what comes next.', 'Langkah rutinitas atau kegiatan seharian dalam gambar, agar anak tahu apa yang sedang terjadi dan apa selanjutnya.'], newTag: ['New', 'Baru'],
    hubP: ['Pick a tool, set it up in a minute, then use it together.', 'Pilih alat, atur dalam semenit, lalu gunakan bersama anak.'],
    setUpFor: ['Setting up for', 'Untuk'],
    sw: ['Switch', 'Ganti'],
    open: ['Open', 'Buka'],
    timer: ['Visual Timer', 'Timer Visual'], timerD: ['See how much time is left.', 'Lihat berapa lama waktu tersisa.'],
    tokens: ['Token Board', 'Papan Token'], tokensD: ['Earn tokens towards a reward.', 'Kumpulkan token untuk hadiah.'],
    ft: ['First–Then Board', 'Papan Pertama–Lalu'], ftD: ['First the task, then the fun part.', 'Tugas dulu, lalu bagian serunya.'],
    sched: ['Visual Schedule', 'Jadwal Visual'], schedD: ['The day in pictures, step by step.', 'Hari ini dalam gambar, langkah demi langkah.'],
    library: ['Card library', 'Perpustakaan kartu'], settings: ['Settings', 'Pengaturan'], allTools: ['All tools', 'Semua alat'],
    cont: ['Continue', 'Lanjutkan'], addSteps: ['Add steps', 'Tambah langkah'], pickCards: ['Pick cards', 'Pilih kartu'],
    pickSeveral: ['Tap all the steps you need. They are added in the order you tap them.', 'Ketuk semua langkah yang dibutuhkan. Langkah ditambahkan sesuai urutan ketukan.'],
    addNSteps: [function (n) { return 'Add ' + n + (n === 1 ? ' step' : ' steps'); }, function (n) { return 'Tambah ' + n + ' langkah'; }], lastUsed: ['Last used', 'Terakhir dipakai'],
    how: ['How it works', 'Cara pakainya'],
    how1: ['Pick a tool', 'Pilih alat'], how1d: ['Routines, tokens, breathing, feelings and more.', 'Rutinitas, token, napas, perasaan, dan lainnya.'],
    how2: ['Make it yours', 'Sesuaikan'], how2d: ['Use Little Us pictures or your own photos.', 'Pakai gambar Little Us atau foto sendiri.'],
    how3: ['Hand it over', 'Serahkan ke anak'], how3d: ['Child mode shows only what your child needs.', 'Mode anak hanya menampilkan yang dibutuhkan anak.'],
    privacy: ['<b>Saved on your device.</b> No account needed, and it works offline once opened. A free account keeps your setup on every device.', '<b>Tersimpan di perangkatmu.</b> Tanpa perlu akun, dan bisa offline setelah dibuka. Akun gratis menyimpan pengaturanmu di semua perangkat.'],
    letsSet: ["Let's set things up for your child", 'Yuk, siapkan untuk anakmu'],
    letsSetP: ['A nickname and a few favourite rewards. It takes under a minute, and every tool is then ready for your child.', 'Nama panggilan dan beberapa hadiah favorit. Kurang dari semenit, lalu semua alat siap dipakai anakmu.'],
    needName: ['Please add a nickname or initials first.', 'Isi nama panggilan atau inisial dulu ya.'],
    startSetup: ['Start setup', 'Mulai'],
    orTry: ['What you’ll find here', 'Isi alat-alatnya'], orTryP: ['Set up your child first, then every tool is ready to use.', 'Atur profil anak dulu, lalu semua alat siap dipakai.'],
    parentSetup: ['Parent setup', 'Pengaturan orang tua'],
    startChild: ['Hand to child', 'Serahkan ke anak'], forName: [function (n) { return 'for ' + n; }, function (n) { return 'untuk ' + n; }],
    step4: [function (a) { return 'Step ' + a + ' of 4'; }, function (a) { return 'Langkah ' + a + ' dari 4'; }], callChild: ['What do you call your child?', 'Siapa nama panggilan anakmu?'],
    kidLike: [function (n) { return 'Which character looks more like ' + n + '?'; }, function (n) { return 'Karakter mana yang lebih mirip ' + n + '?'; }], kidLikeP: ['Cards that show a child use this character. You can switch it any time, even for a single card.', 'Kartu yang menampilkan anak memakai karakter ini. Bisa diganti kapan saja, bahkan per kartu.'],
    noPhotoCol: ['No photo? Pick a colour', 'Tanpa foto? Pilih warna'], nickLabel: ['Nickname', 'Nama panggilan'], takePhoto: ['Take a photo', 'Ambil foto'], fromGallery: ['From gallery', 'Dari galeri'],
    wordsCards: ['Words on the cards', 'Kata di kartu'], loveP: ['Pick a few. They become rewards.', 'Pilih beberapa. Ini akan jadi hadiah.'], nPicked: [function (n) { return 'Next · ' + n + ' picked'; }, function (n) { return 'Lanjut · ' + n + ' dipilih'; }],
    allSet: ['All set!', 'Siap!'], allSetP: [function (n) { return n + '’s tools are ready. You can change anything later in the Child tab.'; }, function (n) { return 'Alat untuk ' + n + ' sudah siap. Kamu bisa mengubah apa saja nanti di menu Anak.'; }], openTools: ['Open the tools', 'Buka alat'],
    lEnEx: ['Eat', 'Eat'], lIdEx: ['Makan', 'Makan'], lBothEx: ['Makan · Eat', 'Makan · Eat'], lNoneEx: ['Pictures only', 'Gambar saja'], lEnName: ['English', 'Inggris'], lIdName: ['Indonesian', 'Indonesia'], lBothName: ['Both', 'Keduanya'], lNoneName: ['No words', 'Tanpa kata'],
    download: ['Download', 'Unduh'],
    whoHelp: ['Who are we helping?', 'Untuk siapa?'],
    addChild: ['Add a child', 'Tambah anak'], editProfiles: ['Edit profiles', 'Ubah profil'], saveBackupShare: ['Save backup to share with a teacher', 'Simpan cadangan untuk dibagikan ke guru'],
    nRewards: [function (n) { return n + (n === 1 ? ' reward' : ' rewards'); }, function (n) { return n + ' hadiah'; }],
    nScheds: [function (n) { return n + (n === 1 ? ' schedule' : ' schedules'); }, function (n) { return n + ' jadwal'; }],
    child: ['Child', 'Anak'],
    // setup
    skip: ['Skip', 'Lewati'], next: ['Next', 'Lanjut'], back: ['Back', 'Kembali'],
    stepOf: [function (a, b) { return a + ' of ' + b + ' · about a minute'; }, function (a, b) { return a + ' dari ' + b + ' · sekitar semenit'; }],
    whoFor: ['Who is this for?', 'Untuk siapa ini?'], whoForP: ['A nickname or initials is enough. A photo is optional.', 'Nama panggilan atau inisial sudah cukup. Foto boleh dilewati.'],
    addPhoto: ['Add photo', 'Tambah foto'], camera: ['Camera', 'Kamera'], gallery: ['Gallery', 'Galeri'],
    nick: ['Nickname or initials', 'Nama panggilan atau inisial'], pickColour: ['Or pick a colour for the initials', 'Atau pilih warna untuk inisial'],
    savedPhone: ['Saved only on this device. Nothing is uploaded.', 'Hanya tersimpan di perangkat ini. Tidak ada yang diunggah.'],
    whatLove: [function (n) { return 'What does ' + n + ' love?'; }, function (n) { return 'Apa kesukaan ' + n + '?'; }],
    whatLoveP: ['Pick a few. They appear first when you choose a reward.', 'Pilih beberapa. Ini muncul paling atas saat memilih hadiah.'],
    nChosen: [function (n) { return 'Next · ' + n + ' chosen'; }, function (n) { return 'Lanjut · ' + n + ' dipilih'; }],
    ownPhoto: ['Own photo', 'Foto sendiri'],
    howLabel: ['How should cards be labelled?', 'Bagaimana label kartunya?'], howLabelP: ['You can change this per tool later.', 'Bisa diubah nanti di pengaturan.'],
    lId: ['Indonesian', 'Indonesia'], lEn: ['English', 'Inggris'], lBoth: ['Both', 'Keduanya'], lNone: ['No label', 'Tanpa label'],
    kidCards: ['Cards that show a child', 'Kartu yang menampilkan anak'], kidPick: ['Which character looks more like your child?', 'Karakter mana yang lebih mirip anakmu?'], boy: ['Boy', 'Laki-laki'], girl: ['Girl', 'Perempuan'],
    kidNote: ['Every card with a child exists in both versions. Switch any single card later.', 'Setiap kartu bergambar anak ada dalam dua versi. Bisa diganti per kartu nanti.'],
    finish: ['Finish setup', 'Selesai'],
    // timer
    funTimers: ['Fun timers', 'Timer seru'], funTimersD: ['Travels to what’s next', 'Berjalan ke kegiatan berikutnya'],
    tBunny: ['Bunny', 'Kelinci'], tDino: ['Dinosaur', 'Dinosaurus'], tCar: ['Car', 'Mobil'],
    preview: ['Preview', 'Pratinjau'], style: ['Style', 'Gaya'], circle: ['Circle', 'Lingkaran'], sand: ['Sand timer', 'Jam pasir'], bar: ['Bar', 'Batang'],
    time: ['Time', 'Waktu'], custom: ['Custom…', 'Atur sendiri…'], min: ['min', 'menit'], minutes: ['minutes', 'menit'],
    warns: ['Warnings before the end', 'Peringatan sebelum selesai'],
    w2: ['“2 minutes left”', '“2 menit lagi”'], w2d: ['Shown on screen', 'Tampil di layar'],
    w1: ['“1 minute left”', '“1 menit lagi”'], w1d: ['Shown on screen', 'Tampil di layar'],
    speak: ['Say warnings out loud', 'Ucapkan peringatan'], speakD: ['Uses the language set for labels', 'Memakai bahasa label'],
    whatsNext: ["What's next", 'Selanjutnya'], fromLib: ['From the card library', 'Dari perpustakaan kartu'], change: ['Change', 'Ganti'],
    shownUnder: ['Shown under the timer', 'Tampil di bawah timer'], showNext: ['Show what comes next', 'Tampilkan yang selanjutnya'], showNextD: ['A picture card under the timer, so your child knows what happens after.', 'Kartu gambar di bawah timer, agar anak tahu apa yang terjadi sesudahnya.'],
    endSig: ['End signal', 'Tanda selesai'], chime: ['Soft chime', 'Bunyi lembut'], vibrate: ['Vibrate', 'Getar'], silent: ['Silent', 'Senyap'],
    alsoOpens: ['Also opens from First–Then and schedule steps', 'Juga bisa dibuka dari Pertama–Lalu dan langkah jadwal'],
    customMin: ['How many minutes?', 'Berapa menit?'], moreMin: ['More minutes', 'Tambah menit'], lessMin: ['Fewer minutes', 'Kurangi menit'], moreSec: ['More seconds', 'Tambah detik'], lessSec: ['Fewer seconds', 'Kurangi detik'], secs: ['sec', 'detik'],
    // tokens
    working: ["I'm working for…", 'Aku sedang bekerja untuk…'], favs: [function (n) { return n + "'s favourites"; }, function (n) { return 'Favorit ' + n; }],
    nTokens: ['Number of tokens', 'Jumlah token'], tokensRange: ['tokens · 1 to 10', 'token · 1 sampai 10'],
    shape: ['Token shape', 'Bentuk token'], whenFull: ['When the board is full', 'Saat papan penuh'], calmStars: ['Calm stars', 'Bintang tenang'], quiet: ['Quiet', 'Tenang'],
    onlyAdd: ['<b>Tokens are earned, not taken away.</b> If you give one by accident in child mode, tap “Undo” under the board (or press and hold the token for 2 seconds), then pass the quick adult check.', '<b>Token didapat, bukan diambil.</b> Jika terlanjur memberi token di mode anak, ketuk “Batalkan” di bawah papan (atau tekan dan tahan token 2 detik), lalu lewati cek orang dewasa.'],
    undoTok: ['Undo last token', 'Batalkan token terakhir'],
    schedule: ['Schedule', 'Jadwal'], schedPick: ['Create or choose a schedule', 'Buat atau pilih jadwal'], mySchedules: ['My schedules', 'Jadwal saya'],
    untitled: ['Untitled schedule', 'Jadwal tanpa nama'], schedNamePh: ['e.g. Saturday morning', 'mis. Sabtu pagi'], autoSaved: ['Changes are saved automatically', 'Perubahan tersimpan otomatis'],
    emptySchedPick: ['Start a new schedule, or choose a ready-made example and change it to fit your child.', 'Mulai jadwal baru, atau pilih contoh siap pakai lalu sesuaikan dengan anakmu.'],
    chooseReady: ['Choose a ready-made one', 'Pilih yang siap pakai'],
    board: ['Board', 'Papan'], boardPick: ['Create or choose a board', 'Buat atau pilih papan'], myBoards: ['My boards', 'Papan saya'], newBoard: ['+ New board', '+ Papan baru'],
    newBoardTx: ['Choose your own pictures', 'Pilih gambar sendiri'], newSchedTx: ['Add your own steps', 'Tambahkan langkah sendiri'],
    emptyBoardPick: ['Make a new board with your own pictures, or start from a ready-made one.', 'Buat papan baru dengan gambar sendiri, atau mulai dari yang siap pakai.'],
    yourBoard: ['Your board', 'Papanmu'], firstHelp: ['What needs to happen first', 'Yang harus dilakukan dulu'], thenHelp: ['What comes after, something they enjoy', 'Yang datang sesudahnya, hal yang disukai'],
    thenHelp2: ['Two things to choose from', 'Dua pilihan untuk anak'], choosePic: ['Choose picture', 'Pilih gambar'], untitledBoard: ['New board', 'Papan baru'],
    delBoard: ['Delete this board', 'Hapus papan ini'], delSched: ['Delete this schedule', 'Hapus jadwal ini'],
    tokenBack: ['Token taken back', 'Token diambil kembali'], takeBack: ['Take back the last token?', 'Ambil kembali token terakhir?'],
    beforeStart: ['Before you start', 'Sebelum mulai'], setupWhy: ['Set this up once. The tools use it to show the right pictures, language and rewards.', 'Atur sekali saja. Alat memakainya untuk menampilkan gambar, bahasa, dan hadiah yang sesuai.'],
    tapToken: [function (a, b) { return a + ' of ' + b + ' · Tap an empty circle to give a token'; }, function (a, b) { return a + ' dari ' + b + ' · Ketuk lingkaran kosong untuk memberi token'; }],
    great: [function (r) { return 'Great work! Time for ' + r; }, function (r) { return 'Hebat! Waktunya ' + r; }],
    again: ['Start again', 'Mulai lagi'], againNote: ['One tap clears the board. Celebration stays still, no flashing.', 'Satu ketukan mengosongkan papan. Perayaan tenang, tanpa kedip.'],
    starStar: ['Star', 'Bintang'], starCar: ['Car', 'Mobil'], starFlower: ['Flower', 'Bunga'], starBall: ['Ball', 'Bola'], starDino: ['Dino', 'Dino'],
    // first then
    readyMade: ['Ready-made', 'Siap pakai'], first: ['First', 'Pertama'], then: ['Then', 'Lalu'], childPicks: ['Child picks one', 'Anak memilih satu'],
    offerChoice: ['Offer a choice of two in “Then”', 'Beri dua pilihan di “Lalu”'], offerChoiceD: ['Good for building choice-making', 'Baik untuk melatih memilih'],
    timerBtn: ['Timer button on the board', 'Tombol timer di papan'], timerBtnD: [function (m) { return 'Starts the Visual Timer · ' + m + ' min'; }, function (m) { return 'Memulai Timer Visual · ' + m + ' menit'; }],
    whenFirst: ['When “First” is done', 'Saat “Pertama” selesai'], whenFirstD: ['Highlight “Then” in yellow', 'Sorot “Lalu” dengan kuning'], auto: ['Auto', 'Otomatis'],
    pickOne: ['Pick one', 'Pilih satu'], timerN: [function (m) { return 'Timer ' + m + ' min'; }, function (m) { return 'Timer ' + m + ' menit'; }],
    // schedule
    steps: ['Steps', 'Langkah'], addStep: ['+ Add step from library', '+ Tambah langkah dari perpustakaan'],
    layout: ['Layout', 'Tata letak'], vertical: ['Vertical', 'Vertikal'], horizontal: ['Horizontal', 'Horizontal'],
    show: ['Show', 'Tampilkan'], wholeDay: ['Whole day', 'Seharian'], next3: ['Next 3 steps', '3 langkah berikutnya'],
    whenDone: ['When a step is done', 'Saat langkah selesai'], crossOut: ['Cross out', 'Coret'], moveDone: ['Move to Done', 'Pindah ke Selesai'], checklist: ['Checklist', 'Daftar centang'],
    save: ['Save', 'Simpan'], saved: ['Saved', 'Tersimpan'], savedScheds: ['Saved schedules', 'Jadwal tersimpan'], newSched: ['+ New schedule', '+ Jadwal baru'],
    readyEx: ['Ready-made examples', 'Contoh siap pakai'], use: ['Use', 'Pakai'], nSteps: [function (n) { return n + ' steps'; }, function (n) { return n + ' langkah'; }],
    rename: ['Rename', 'Ganti nama'], del: ['Delete', 'Hapus'], dup: ['Duplicate', 'Duplikat'], schedName: ['Schedule name', 'Nama jadwal'],
    now: ['Now', 'Sekarang'], done: ['Done', 'Selesai'], changePlan: ['Change of plan', 'Ganti rencana'], stepTimer: ['Timer for this step', 'Timer untuk langkah ini'],
    noTimer: ['No timer', 'Tanpa timer'], moveUp: ['Move up', 'Naikkan'], moveDown: ['Move down', 'Turunkan'], remove: ['Remove', 'Hapus'],
    emptySched: ['No steps yet. Add a few from the library, or start from an example.', 'Belum ada langkah. Tambahkan dari perpustakaan, atau mulai dari contoh.'],
    allDone: ['All done!', 'Semua selesai!'], newPlan: ['What happens instead?', 'Apa yang terjadi sebagai gantinya?'],
    // child mode
    holdExit: ['Hold to exit', 'Tahan untuk keluar'], holding: ['Hold for 2 seconds to exit', 'Tahan 2 detik untuk keluar'], holdingD: ['Keep holding to return to parent setup', 'Terus tahan untuk kembali ke pengaturan'],
    adultCheck: ['Adult check', 'Cek orang dewasa'], tapNum: [function (n, w) { return 'Tap the number ' + w; }, function (n, w) { return 'Ketuk angka ' + w; }],
    stay: ['Stay in child mode', 'Tetap di mode anak'],
    wait: ['Wait', 'Tunggu'], timeFinish: ['Time to finish', 'Waktunya selesai'], left: [function (m) { return m + ' min left'; }, function (m) { return m + ' menit lagi'; }],
    nextL: ['Next', 'Lalu'], nowL: ['Now', 'Sekarang'], backSched: ['Back to the schedule', 'Kembali ke jadwal'], backBoard: ['Back to the board', 'Kembali ke papan'],
    // library
    searchCards: ['Search cards', 'Cari kartu'], tabLu: ['Little Us', 'Little Us'], tabPhotos: ['My photos', 'Foto saya'], tabText: ['Text', 'Teks'],
    favourites: ['Favourites', 'Favorit'], recent: ['Recently used', 'Terakhir dipakai'], all: ['All', 'Semua'],
    photo: ['+ Photo', '+ Foto'], textCard: ['Aa Text card', 'Aa Kartu teks'], useX: [function (x) { return 'Use “' + x + '”'; }, function (x) { return 'Pakai “' + x + '”'; }],
    chooseCard: ['Choose a card', 'Pilih kartu'], chooseReward: ['Choose a reward', 'Pilih hadiah'],
    matches: [function (n, q) { return n + ' cards match <b>' + esc(q) + '</b> in English or Indonesian'; }, function (n, q) { return n + ' kartu cocok dengan <b>' + esc(q) + '</b> dalam bahasa Indonesia atau Inggris'; }],
    cantFind: ["Can't find it? <b>Add your own photo</b> or make a text card.", 'Tidak ketemu? <b>Tambah foto sendiri</b> atau buat kartu teks.'],
    noCardFor: [function (q) { return 'No card for “' + q + '”'; }, function (q) { return 'Belum ada kartu untuk “' + q + '”'; }],
    makeOne: ['Make one now with your own photo or words.', 'Buat sekarang dengan foto atau kata-katamu sendiri.'],
    wantIllus: ['Want a Little Us illustration for this?', 'Mau ilustrasi Little Us untuk ini?'], wantIllusP: ["Request picture cards. They'll appear here in your library.", 'Minta kartu bergambar. Nanti muncul di perpustakaanmu.'],
    reqCards: ['Request picture cards →', 'Minta kartu bergambar →'],
    noPhotos: ['No photos yet', 'Belum ada foto'], noPhotosP: ['A photo of the real toothbrush, the real school gate. Children often recognise these fastest.', 'Foto sikat gigi asli, gerbang sekolah asli. Anak sering paling cepat mengenali ini.'],
    photosNever: ['Photos never leave this device.', 'Foto tidak pernah keluar dari perangkat ini.'],
    editLabel: ['Edit label', 'Ubah label'], editLabelD: ['Rename in Indonesian or English', 'Ganti nama dalam bahasa Indonesia atau Inggris'],
    addFav: ['Add to favourites', 'Tambah ke favorit'], removeFav: ['Remove from favourites', 'Hapus dari favorit'], favD: ['Shows first in every tool', 'Muncul paling atas di setiap alat'],
    printCard: ['Print this card', 'Cetak kartu ini'], delCard: ['Delete this card', 'Hapus kartu ini'],
    showAs: ['Show the child as', 'Tampilkan anak sebagai'], thisCardOnly: ['This card only', 'Kartu ini saja'],
    printCards: ['Print cards', 'Cetak kartu'], noBoard: ['No board needed', 'Tanpa papan'], selected: [function (n) { return '<b>' + n + ' cards</b> selected'; }, function (n) { return '<b>' + n + ' kartu</b> dipilih'; }],
    selectAll: ['Select all', 'Pilih semua'], nextPrint: ['Next: print options →', 'Lanjut: opsi cetak →'],
    addOwn: ['Add your own photo', 'Tambah foto sendiri'], addOwnP: ['Real objects and places from your child’s day. Photos stay on this device.', 'Benda dan tempat nyata dari hari anakmu. Foto tetap di perangkat ini.'],
    takePhoto: ['Take a photo', 'Ambil foto'], fromGallery: ['From gallery', 'Dari galeri'], textOnly: ['Text-only card', 'Kartu teks saja'], textOnlyD: ['No picture, just words', 'Tanpa gambar, hanya kata'],
    crop: ['Crop', 'Potong'], cancel: ['Cancel', 'Batal'], rotate: ['↻ Rotate', '↻ Putar'], pinch: ['Drag to move. Cards are always square.', 'Geser untuk memindah. Kartu selalu persegi.'],
    nameCard: ['Name this card', 'Beri nama kartu'], labelId: ['Label in Indonesian', 'Label bahasa Indonesia'], labelEn: ['Label in English', 'Label bahasa Inggris'],
    category: ['Category', 'Kategori'], saveCard: ['Save card', 'Simpan kartu'], availEvery: ['Available in every tool', 'Tersedia di setiap alat'],
    indonesian: ['Indonesian', 'Bahasa Indonesia'], english: ['English', 'Bahasa Inggris'], optional: ['optional', 'opsional'],
    showOn: ['Show on cards', 'Tampilkan di kartu'], resetTo: [function (a) { return 'Reset to original “' + a + '”'; }, function (a) { return 'Kembalikan ke “' + a + '”'; }],
    colour: ['Colour', 'Warna'],
    // settings
    language: ['Language', 'Bahasa'], cardLabels: ['Card labels', 'Label kartu'], childInCards: ['Child in cards', 'Anak di kartu'], forX: [function (n) { return 'For ' + n; }, function (n) { return 'Untuk ' + n; }],
    sound: ['Sound', 'Suara'], sounds: ['Sounds', 'Suara'], soundsD: ['Chimes and spoken warnings', 'Bunyi dan peringatan suara'], volume: ['Volume', 'Volume'], soft: ['Soft', 'Pelan'], loud: ['Loud', 'Keras'],
    comfort: ['Comfort', 'Kenyamanan'], reduce: ['Reduce motion', 'Kurangi gerakan'], reduceD: ['', ''],
    leaving: ['Leaving child mode', 'Keluar dari mode anak'], longPress: ['Long press', 'Tekan lama'],
    childData: ['Children & data', 'Anak & data'], profiles: ['Profiles', 'Profil'], backup: ['Backup & restore', 'Cadangkan & pulihkan'],
    lastSaved: [function (d) { return 'Last saved ' + d; }, function (d) { return 'Terakhir disimpan ' + d; }], never: ['Not saved yet', 'Belum pernah'],
    storage: ['Storage on this device', 'Penyimpanan di perangkat ini'], ready: ['Ready', 'Siap'], worksOff: ['works offline', 'bisa offline'],
    // backup
    backupShare: ['Backup & share', 'Cadangan & berbagi'], backupP: ['Download your saved settings and send to another person.', 'Unduh pengaturan yang tersimpan dan kirim ke orang lain.'],
    saveBackup: ['Save backup', 'Simpan cadangan'], saveBackupFile: ['↓ Save backup file', '↓ Simpan file cadangan'], thenShare: ['Then share it on WhatsApp, Drive or email.', 'Lalu bagikan lewat WhatsApp, Drive, atau email.'],
    restore: ['Restore backup', 'Pulihkan cadangan'], restoreP: ['Open a .lu file to import data.', 'Buka file .lu untuk mengimpor data.'],
    chooseFile: ['Choose file', 'Pilih file'], lastBackup: ['Last backup', 'Cadangan terakhir'],
    howAdd: ['How to add it', 'Cara menambahkannya'], addTo: ["Add to what's here", 'Tambahkan ke yang ada'], addToD: ['Keeps your current children and cards', 'Anak dan kartu saat ini tetap ada'],
    replaceAll: ['Replace everything', 'Ganti semuanya'], replaceAllD: ['This device will match the backup', 'Perangkat ini akan sama dengan cadangan'],
    restoreBtn: ['Restore', 'Pulihkan'], restored: ['Backup restored', 'Cadangan dipulihkan'], badFile: ["That file isn't a Little Us backup.", 'File itu bukan cadangan Little Us.'],
    childrenN: [function (n) { return n + (n === 1 ? ' child' : ' children'); }, function (n) { return n + ' anak'; }],
    cardsN: [function (n) { return n + ' cards'; }, function (n) { return n + ' kartu'; }], photosN: [function (n) { return n + ' photos'; }, function (n) { return n + ' foto'; }],
    profileWith: [function (n) { return 'Profile with ' + n + ' rewards'; }, function (n) { return 'Profil dengan ' + n + ' hadiah'; }],
    // plus (hidden)
    plusPart: [function (n) { return '“' + n + '” is part of Little Us Plus'; }, function (n) { return '“' + n + '” termasuk Little Us Plus'; }],
    plusP: ["All four tools, your photos and every card you've made stay free, always.", 'Keempat alat, fotomu, dan semua kartu buatanmu tetap gratis, selamanya.'],
    seePlus: ["See what's in Plus", 'Lihat isi Plus'], notNow: ['Not now', 'Nanti saja'],
    goesWell: ['Goes well with this', 'Cocok dipakai bersama'], shop: ['Shop', 'Toko'],
    close: ['Close', 'Tutup'], edit: ['Edit', 'Ubah'], name: ['Name', 'Nama'], deleteChild: ['Delete this child', 'Hapus anak ini'],
    confirmDel: ['Delete? This cannot be undone.', 'Hapus? Ini tidak bisa dibatalkan.'], delQ: ['Delete?', 'Hapus?'],
    photoFail: ["We couldn't open that photo. Try another one.", 'Foto itu tidak bisa dibuka. Coba foto lain.'],
    childModeTip: ['Child mode is full-screen. Hold the button in the corner to come back.', 'Mode anak tampil layar penuh. Tahan tombol di pojok untuk kembali.']
  };
  function tr(k) {
    var v = T[k];
    if (!v) return k;
    v = v[L() === 'id' ? 1 : 0];
    if (typeof v === 'function') return v.apply(null, Array.prototype.slice.call(arguments, 1));
    return v;
  }

  /* ===================== state (device only) ===================== */
  var KEY = 'lu_tools_v1';
  var COLORS = ['#DDF2E4', '#FFF1C7', '#DCEBFA', '#E9E1F7', '#FBE0E6', '#FFE9DA'];
  var READY_SCHED = [
    { key: 'pagi', id: 'Pagi sebelum sekolah', en: 'Morning before school', steps: [['bangun'], ['toilet'], ['mandi', 10], ['pakai-baju'], ['sarapan'], ['naik-motor'], ['sekolah-gedung']] },
    { key: 'maghrib', id: 'Sholat Maghrib', en: 'Maghrib prayer', steps: [['wudhu'], ['sholat'], ['mengaji'], ['selesai']] },
    { key: 'mandi-sore', id: 'Mandi sore', en: 'Evening bath', steps: [['mandi', 10], ['handuk'], ['pakai-baju'], ['makan']] },
    { key: 'minimarket', id: 'Ke minimarket', en: 'To the mini-mart', steps: [['naik-motor'], ['minimarket'], ['biskuit'], ['pulang']] },
    { key: 'nenek', id: 'Ke rumah Nenek', en: "To Grandma's house", steps: [['naik-mobil'], ['rumah-nenek'], ['main'], ['pulang']] },
    { key: 'gigi', id: 'Ke dokter gigi', en: 'Dentist visit', steps: [['naik-mobil'], ['tunggu'], ['dokter-gigi'], ['selesai']] },
    { key: 'sabtu', id: 'Hari Sabtu', en: 'Saturday', steps: [['bangun'], ['sarapan'], ['taman'], ['makan'], ['tidur']] }
  ];
  var READY_FT = [['mandi', 'main'], ['makan', 'nonton'], ['sepatu', 'naik-motor'], ['beres-beres', 'main-tablet']];
  var DEFAULT_REWARDS = ['ayunan', 'lego', 'gelembung', 'stiker'];

  function freshProfileData() {
    return {
      timer: { style: 'circle', minutes: 5, w2: true, w1: true, speak: false, showNext: false, next: 'main', end: 'chime' },
      tokens: { reward: 'ayunan', count: 5, shape: 'star', full: 'stars', earned: 0 },
      ft: { first: null, then: [], choice: false, timerBtn: true, timerMin: 5, boardId: null }, boards: [],
      sched: { layout: 'vertical', show: 'all', done: 'move' },
      schedules: [],
      active: null, favs: [], kidCards: {}
    };
  }
  function schedFromReady(r) {
    return { id: uid('s'), from: r.key, name: { id: r.id, en: r.en }, steps: r.steps.map(function (s) { return { card: s[0], min: s[1] || 0 }; }), used: 0 };
  }
  function freshState() {
    var d = freshProfileData();
    return {
      v: 1, profiles: [], current: 'default', data: { 'default': d }, custom: {}, labels: {}, recent: [],
      settings: { labels: L() === 'id' ? 'id' : 'en', sound: true, volume: 0.6, reduce: false, exit: 'hold', lastBackup: null }, last: null
    };
  }
  var S = (function () {
    try {
      var s = JSON.parse(localStorage.getItem(KEY));
      if (s && s.v === 1) return s;
    } catch (e) {}
    return freshState();
  })();
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { toast(L() === 'id' ? 'Penyimpanan perangkat penuh.' : 'Device storage is full.'); } if (window.LUAcc) LUAcc.stateChanged(); }
  // Account sync: another device changed the setup, or a parent just logged in.
  function reloadState() {
    try { var s = JSON.parse(localStorage.getItem(KEY)); if (s && s.v === 1) { S = s; if (!S.data[S.current]) S.current = (S.profiles[0] && S.profiles[0].id) || 'default'; } } catch (e) {}
    fixLocked(); rerender();
  }
  // Plus styles that are no longer available fall back to a free one (e.g. Dino → Bunny).
  function fixLocked() { if (window.LUAcc && LUAcc.fixState(S)) { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} } }
  function prof() { return S.profiles.filter(function (p) { return p.id === S.current; })[0] || null; }
  function D() {
    if (!S.data[S.current]) S.data[S.current] = freshProfileData();
    var d = S.data[S.current];
    if (!d.boards) { // older saves: turn the single First–Then into a saved board
      d.boards = [];
      if (d.ft.first) { var bb = { id: uid('b'), first: d.ft.first, then: d.ft.then.slice() }; d.boards.push(bb); d.ft.boardId = bb.id; }
    }
    return d;
  }
  function kidFor(ref) { var p = prof(), d = D(); return (d.kidCards && d.kidCards[ref]) || (p && p.kid) || 'boy'; }
  function profName() { var p = prof(); return p ? p.name : (L() === 'id' ? 'anakmu' : 'your child'); }
  function touchRecent(ref) { S.recent = [ref].concat(S.recent.filter(function (r) { return r !== ref; })).slice(0, 8); }
  function setLast(tool) { S.last = { tool: tool, at: Date.now() }; save(); }

  /* ===================== photos (IndexedDB) ===================== */
  var PH = {};
  var idb = null;
  function db() {
    if (idb) return idb;
    idb = new Promise(function (res) {
      try {
        var r = indexedDB.open('lu-tools', 1);
        r.onupgradeneeded = function () { r.result.createObjectStore('photos'); };
        r.onsuccess = function () { res(r.result); };
        r.onerror = function () { res(null); };
      } catch (e) { res(null); }
    });
    return idb;
  }
  function photoPut(id, data) {
    PH[id] = data;
    return db().then(function (d) {
      if (!d) { try { localStorage.setItem('lu_ph_' + id, data); } catch (e) {} return; }
      return new Promise(function (res) { var tx = d.transaction('photos', 'readwrite'); tx.objectStore('photos').put(data, id); tx.oncomplete = res; tx.onerror = res; });
    });
  }
  function photoDel(id) {
    delete PH[id];
    return db().then(function (d) {
      if (!d) { try { localStorage.removeItem('lu_ph_' + id); } catch (e) {} return; }
      var tx = d.transaction('photos', 'readwrite'); tx.objectStore('photos').delete(id);
    });
  }
  function photosLoad() {
    return db().then(function (d) {
      if (!d) {
        try { Object.keys(localStorage).forEach(function (k) { if (k.indexOf('lu_ph_') === 0) PH[k.slice(6)] = localStorage.getItem(k); }); } catch (e) {}
        return;
      }
      return new Promise(function (res) {
        try {
          var tx = d.transaction('photos', 'readonly'), st = tx.objectStore('photos'), req = st.openCursor();
          req.onsuccess = function () { var c = req.result; if (c) { PH[c.key] = c.value; c.continue(); } else res(); };
          req.onerror = function () { res(); };
        } catch (e) { res(); }
      });
    });
  }

  /* ===================== cards ===================== */
  function isCustom(ref) { return /^c_/.test(ref); }
  function cardInfo(ref) {
    if (isCustom(ref)) {
      var c = S.custom[ref];
      if (!c) return null;
      return { ref: ref, type: c.type, cat: c.cat || 'self', en: c.en || c.idn || '', idn: c.idn || c.en || '', photo: c.photo, color: c.color };
    }
    var a = A.get(ref);
    if (!a) return null;
    var o = S.labels[ref] || {};
    return { ref: ref, type: 'illus', cat: a.cat, en: o.en || a.en, idn: o.idn || a.idn, kid: !!a.kid, baseEn: a.en, baseId: a.idn };
  }
  function labelsFor(info, mode) {
    mode = mode || S.settings.labels;
    if (!info) return { main: '', sub: '' };
    if (mode === 'none') return { main: '', sub: '' };
    if (mode === 'en') return { main: info.en, sub: '' };
    if (mode === 'id') return { main: info.idn, sub: '' };
    return { main: info.idn, sub: info.en && info.en !== info.idn ? info.en : '' };
  }
  function cardLabel(ref) { var i = cardInfo(ref); return i ? (L() === 'id' ? i.idn : i.en) : ''; }
  function artHTML(ref, opts) {
    opts = opts || {};
    var i = cardInfo(ref);
    if (!i) return '<div class="tl-art tl-missing"></div>';
    if (i.type === 'photo') return '<div class="tl-art tl-photo">' + (PH[i.photo] ? '<img src="' + PH[i.photo] + '" alt="">' : '') + '<span class="tl-fototag">' + (L() === 'id' ? 'Foto' : 'Photo') + '</span></div>';
    if (i.type === 'text') return '<div class="tl-art tl-textart" style="background:' + esc(i.color || COLORS[3]) + '"><span>' + esc(labelsFor(i, S.settings.labels === 'none' ? (L() === 'id' ? 'id' : 'en') : S.settings.labels).main || i.idn) + '</span></div>';
    return '<div class="tl-art">' + A.svg(ref, { gender: opts.gender || kidFor(ref) }) + '</div>';
  }
  // the picture card component
  function cardHTML(ref, opts) {
    opts = opts || {};
    var i = cardInfo(ref);
    var lb = labelsFor(i, opts.labels);
    if (i && i.type === 'text') lb = { main: '', sub: '' };
    var cls = 'tl-card' + (opts.size ? ' tl-' + opts.size : '') + (opts.state ? ' is-' + opts.state : '') + (opts.cls ? ' ' + opts.cls : '');
    return '<div class="' + cls + '"' + (opts.attrs || '') + '>' + artHTML(ref, opts) +
      (lb.main ? '<span class="tl-lab">' + esc(lb.main) + '</span>' : '') + (lb.sub ? '<span class="tl-sub">' + esc(lb.sub) + '</span>' : '') +
      (opts.state === 'done' ? '<span class="tl-check">✓</span>' : '') + (opts.fav ? '<span class="tl-heart">♥</span>' : '') + '</div>';
  }
  // two-language text for child screens (Indonesian large, English small in "both")
  function dual(idT, enT, cls) {
    return '<span class="' + (cls || '') + '">' + esc(L() === 'id' ? idT : enT) + '</span>';
    var m = S.settings.labels;
    if (m === 'none') m = L();
    if (m === 'en') return '<span class="' + (cls || '') + '">' + esc(enT) + '</span>';
    if (m === 'id') return '<span class="' + (cls || '') + '">' + esc(idT) + '</span>';
    return '<span class="' + (cls || '') + '">' + esc(idT) + '</span> <span class="tl-dualsub">' + esc(enT) + '</span>';
  }
  function dualKey(k, a, b) {
    var en = T[k][0], id = T[k][1];
    if (typeof en === 'function') { en = en(a, b); id = id(a, b); }
    return { en: en, id: id };
  }
  function speakLang() { var m = S.settings.labels; return m === 'en' || m === 'id' ? m : L(); }

  function allLibrary() {
    var out = A.CARDS.map(function (c) { return c.id; });
    Object.keys(S.custom).forEach(function (k) { out.unshift(k); });
    return out;
  }
  function searchCards(q, list) {
    q = (q || '').toLowerCase().trim();
    list = list || allLibrary();
    if (!q) return list;
    return list.filter(function (ref) {
      var i = cardInfo(ref); if (!i) return false;
      var a = A.get(ref);
      var hay = (i.en + ' ' + i.idn + ' ' + (a ? a.tags + ' ' + a.en + ' ' + a.idn : '')).toLowerCase();
      return q.split(/\s+/).every(function (w) { return hay.indexOf(w) >= 0; });
    });
  }

  /* ===================== sound, speech, vibration ===================== */
  var AC = null;
  function chime(kind) {
    if (!S.settings.sound) return;
    try {
      AC = AC || new (window.AudioContext || window.webkitAudioContext)();
      var vol = 0.25 * clamp(S.settings.volume, 0, 1);
      var notes = kind === 'pop' ? [[880, 0, 0.18]] : kind === 'done' ? [[523, 0, 0.6], [659, 0.18, 0.6], [784, 0.36, 0.9]] : [[659, 0, 0.9], [880, 0.22, 1.1]];
      notes.forEach(function (n) {
        var o = AC.createOscillator(), g = AC.createGain(), t = AC.currentTime + n[1];
        o.type = 'sine'; o.frequency.value = n[0];
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.03); g.gain.exponentialRampToValueAtTime(0.0001, t + n[2]);
        o.connect(g); g.connect(AC.destination); o.start(t); o.stop(t + n[2] + 0.05);
      });
    } catch (e) {}
  }
  function say(text) {
    if (!S.settings.sound || !window.speechSynthesis) return;
    try {
      var u = new SpeechSynthesisUtterance(text);
      u.lang = speakLang() === 'id' ? 'id-ID' : 'en-US'; u.rate = 0.9; u.volume = clamp(S.settings.volume + 0.2, 0, 1);
      speechSynthesis.cancel(); speechSynthesis.speak(u);
    } catch (e) {}
  }
  function buzz(p) { try { navigator.vibrate && navigator.vibrate(p); } catch (e) {} }

  /* ===================== small UI helpers ===================== */
  function toast(msg) { if (window.LU && LU.toast) LU.toast(msg, { kind: 'info', ms: 2600 }); }
  function seg(name, opts, cur) {
    return '<div class="tl-seg" role="group">' + opts.map(function (o) {
      return '<button type="button" data-seg="' + name + '" data-v="' + esc(o[0]) + '" class="' + (String(cur) === String(o[0]) ? 'on' : '') + '" aria-pressed="' + (String(cur) === String(o[0])) + '">' + o[1] + '</button>';
    }).join('') + '</div>';
  }
  function toggle(name, on) { return '<button type="button" class="tl-tog" role="switch" aria-checked="' + !!on + '" data-tog="' + name + '"></button>'; }
  function row(title, desc, ctrl) { return '<div class="tl-row"><div><b>' + title + '</b>' + (desc ? '<small>' + desc + '</small>' : '') + '</div>' + ctrl + '</div>'; }
  var ICO = {
    cam: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="7" width="18" height="13" rx="3"/><path d="M8.5 7l1.5-3h4l1.5 3"/><circle cx="12" cy="13.5" r="3.2"/></svg>',
    img: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="2"/><path d="M4 18l5-5 4 4 3-3 4 4"/></svg>',
    hand: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 13V6.5a1.5 1.5 0 0 1 3 0V12M11 11V5a1.5 1.5 0 0 1 3 0v6M14 11V6.5a1.5 1.5 0 0 1 3 0V14c0 4-2.5 7-6 7-2.5 0-4-1.5-5.5-4L4 14.5a1.5 1.5 0 0 1 2.5-1.6L8 15"/></svg>',
    x: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    back: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>',
    dl: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg>',
    gear: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
    replan: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/></svg>',
    lib: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="8" height="8" rx="2"/><rect x="13" y="3" width="8" height="8" rx="2"/><rect x="3" y="13" width="8" height="8" rx="2"/><rect x="13" y="13" width="8" height="8" rx="2"/></svg>'
  };
  function avatar(p, size) {
    size = size || 40;
    if (!p) return '<span class="tl-ava" style="width:' + size + 'px;height:' + size + 'px;background:#F3EEE6">' + A.heart(Math.round(size * 0.55)) + '</span>';
    var ini = (p.name || '?').trim().split(/\s+/).map(function (w) { return w[0]; }).join('').slice(0, 2).toUpperCase() || '?';
    return '<span class="tl-ava" style="width:' + size + 'px;height:' + size + 'px;background:' + esc(p.color || COLORS[0]) + ';font-size:' + Math.round(size * 0.4) + 'px">' +
      (p.photo && PH[p.photo] ? '<img src="' + PH[p.photo] + '" alt="">' : A.face ? '<span class="lu-face" data-face="' + (p.kid === 'girl' ? 'girl' : 'boy') + '" data-done="1">' + A.face(p.kid) + '</span>' : esc(ini)) + '</span>';
  }
  function topbar(title, sub, opts) {
    opts = opts || {};
    return '<div class="tl-top">' + (opts.backAct ? '<button type="button" class="tl-iconbtn" data-act="' + opts.backAct + '" aria-label="' + esc(tr('back')) + '">' + ICO.back + '</button>' : '<a class="tl-iconbtn" href="' + (opts.back || '#/tools') + '" aria-label="' + esc(tr('back')) + '">' + ICO.back + '</a>') +
      '<div class="tl-toptx"><h1>' + esc(title) + '</h1>' + (sub ? '<small>' + esc(sub === tr('parentSetup') && prof() ? tr('forName', prof().name) : sub) + '</small>' : '') + '</div>' +
      (opts.dl ? '<button type="button" class="tl-iconbtn" data-act="download" aria-label="' + esc(tr('download')) + '">' + ICO.dl + '</button>' : '') +
      (opts.noProf ? '' : '<button type="button" class="tl-profbtn" data-act="profiles" aria-label="' + esc(tr('whoHelp')) + '">' + avatar(prof(), 30) + '<span aria-hidden="true">▾</span></button>') + '</div>';
  }

  /* ===================== sheets (bottom sheets / dialogs) ===================== */
  var sheetStack = [];
  function sheet(html, opts) {
    opts = opts || {};
    var wrap = document.createElement('div');
    wrap.className = 'tl-sheetwrap' + (opts.full ? ' full' : '') + (opts.dark ? ' dark' : '');
    wrap.innerHTML = '<div class="tl-scrim"></div><div class="tl-sheet" role="dialog" aria-modal="true">' + (opts.full ? '' : '<span class="tl-handle"></span>') + '<div class="tl-sheetin">' + html + '</div></div>';
    ((typeof CH !== 'undefined' && CH && CH.el) || document.body).appendChild(wrap);
    requestAnimationFrame(function () { wrap.classList.add('open'); });
    var api = {
      el: wrap.querySelector('.tl-sheetin'), wrap: wrap,
      close: function () {
        wrap.classList.remove('open');
        sheetStack = sheetStack.filter(function (s) { return s !== api; });
        setTimeout(function () { wrap.remove(); }, S.settings.reduce ? 0 : 220);
        opts.onClose && opts.onClose();
      },
      set: function (h) { api.el.innerHTML = h; },
      noEsc: !!opts.noEsc
    };
    if (!opts.noScrimClose) wrap.querySelector('.tl-scrim').onclick = api.close;
    sheetStack.push(api);
    return api;
  }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && DD && !sheetStack.length) { DD = null; rerender(); return; } if (e.key === 'Escape' && sheetStack.length && !sheetStack[sheetStack.length - 1].noEsc) sheetStack[sheetStack.length - 1].close(); });
  document.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('[data-tl-prof]')) { e.preventDefault(); openProfiles(); } });

  /* ---------- card picker (shared by every tool) ---------- */
  function openPicker(o) {
    o = o || {};
    // o.multi: pick several cards in one go (they come back in the order they were tapped, through o.onPickMany)
    var st = { tab: o.tab || 'lu', cat: 'all', q: '', sel: o.current || null, sels: [] };
    function stateOf(r) { return o.multi ? (st.sels.indexOf(r) >= 0 ? 'selected' : '') : (st.sel === r ? 'selected' : ''); }
    function numAttr(r) { var i = st.sels.indexOf(r); return o.multi && i >= 0 ? ' data-n="' + (i + 1) + '"' : ''; }
    var sh = sheet('', { full: false });
    sh.wrap.classList.add('tall');
    function list() {
      if (st.tab === 'photos') return allLibrary().filter(function (r) { var i = cardInfo(r); return i && i.type === 'photo'; });
      if (st.tab === 'text') return allLibrary().filter(function (r) { var i = cardInfo(r); return i && i.type === 'text'; });
      var l = A.CARDS.map(function (c) { return c.id; });
      if (st.cat !== 'all') l = l.filter(function (r) { return A.get(r).cat === st.cat; });
      return l;
    }
    function render() {
      var res = st.q ? searchCards(st.q) : list();
      var favs = (o.rewards ? (prof() && prof().rewards || []) : []).concat(D().favs).filter(function (v, i, a) { return a.indexOf(v) === i && cardInfo(v); });
      var h = '<div class="tl-sheethead"><h2>' + esc(o.title || tr('chooseCard')) + '</h2><button type="button" class="tl-iconbtn round" data-x aria-label="' + esc(tr('close')) + '">✕</button></div>' +
        '<label class="tl-search">' + (window.LU ? LU.ICON.search : '') + '<input type="search" value="' + esc(st.q) + '" placeholder="' + esc(tr('searchCards')) + '" data-q></label>';
      if (!st.q) {
        h += seg('ptab', [['lu', tr('tabLu')], ['photos', tr('tabPhotos')], ['text', tr('tabText')]], st.tab);
        if (st.tab === 'lu') {
          if (favs.length) h += '<div class="tl-mini"><b>' + esc(tr('favourites')) + '</b>' + (prof() ? '<small>' + esc(prof().name) + '</small>' : '') + '</div><div class="tl-strip">' + favs.map(function (r) { return cardHTML(r, { size: 's', state: stateOf(r), fav: true, attrs: ' data-pick="' + r + '"' + numAttr(r) }); }).join('') + '</div>';
          var rec = S.recent.filter(function (r) { return cardInfo(r); });
          if (rec.length) h += '<div class="tl-mini"><b>' + esc(tr('recent')) + '</b></div><div class="tl-strip">' + rec.map(function (r) { return cardHTML(r, { size: 's', state: stateOf(r), attrs: ' data-pick="' + r + '"' + numAttr(r) }); }).join('') + '</div>';
          h += '<div class="tl-chips">' + [['all', tr('all')]].concat(A.CATS.map(function (c) { return [c.id, L() === 'id' ? c.idn : c.en]; })).map(function (c) {
            return '<button type="button" class="tl-chip' + (st.cat === c[0] ? ' on' : '') + '" data-cat="' + c[0] + '">' + esc(c[1]) + '</button>';
          }).join('') + '</div>';
        }
      } else {
        h += '<p class="tl-note2">' + tr('matches', res.length, st.q) + '</p>';
      }
      if (o.multi && !st.q) h += '<p class="tl-note2 tl-multinote">' + esc(tr('pickSeveral')) + '</p>';
      if (res.length) h += '<div class="tl-grid tl-pickgrid">' + res.map(function (r) { return cardHTML(r, { state: stateOf(r), attrs: ' data-pick="' + r + '"' + numAttr(r) }); }).join('') + '</div>';
      else if (st.tab === 'photos' && !st.q) h += '<div class="tl-empty"><b>' + esc(tr('noPhotos')) + '</b><p>' + esc(tr('noPhotosP')) + '</p></div>';
      else if (st.tab === 'text' && !st.q) h += '<div class="tl-empty"><p>' + esc(tr('textOnlyD')) + '</p></div>';
      if (st.q) h += '<div class="tl-tip">' + A.heart(22) + '<span>' + tr('cantFind') + '</span></div>';
      var sel = st.sel && cardInfo(st.sel);
      h += '<div class="tl-sheetfoot"><button type="button" class="tl-btn outline" data-addphoto>' + esc(st.tab === 'text' ? tr('textCard') : tr('photo')) + '</button>' +
        (o.multi ? '<button type="button" class="tl-btn primary" data-use' + (st.sels.length ? '' : ' disabled') + '>' + esc(st.sels.length ? tr('addNSteps', st.sels.length) : tr('pickCards')) + '</button></div>'
          : '<button type="button" class="tl-btn primary" data-use' + (sel ? '' : ' disabled') + '>' + esc(sel ? tr('useX', L() === 'id' ? sel.idn : sel.en) : tr('use')) + '</button></div>');
      sh.set(h);
      var inp = sh.el.querySelector('[data-q]');
      inp.oninput = function () { st.q = inp.value; var pos = inp.selectionStart; render(); var n = sh.el.querySelector('[data-q]'); n.focus(); try { n.setSelectionRange(pos, pos); } catch (e) {} };
    }
    sh.el.addEventListener('click', function (e) {
      var t = e.target.closest('button,[data-pick]'); if (!t) return;
      if (t.hasAttribute('data-x')) return sh.close();
      if (t.dataset.seg === 'ptab') { st.tab = t.dataset.v; return render(); }
      if (t.dataset.cat) { st.cat = t.dataset.cat; return render(); }
      if (t.dataset.pick) {
        if (o.multi) { var at = st.sels.indexOf(t.dataset.pick); if (at >= 0) st.sels.splice(at, 1); else st.sels.push(t.dataset.pick); var y = sh.el.scrollTop; render(); sh.el.scrollTop = y; return; }
        if (st.sel === t.dataset.pick && o.quick !== false) { finish(); return; }
        st.sel = t.dataset.pick; return render();
      }
      if (t.hasAttribute('data-use')) return finish();
      if (t.hasAttribute('data-addphoto')) {
        if (st.tab === 'text') return openTextCard(function (ref) { if (o.multi) st.sels.push(ref); else st.sel = ref; render(); });
        return openAddPhoto(function (ref) { st.tab = 'photos'; if (o.multi) st.sels.push(ref); else st.sel = ref; render(); });
      }
    });
    function finish() {
      if (o.multi) { if (!st.sels.length) return; st.sels.forEach(touchRecent); save(); sh.close(); if (o.onPickMany) o.onPickMany(st.sels.slice()); return; }
      if (!st.sel) return; touchRecent(st.sel); save(); sh.close(); o.onPick && o.onPick(st.sel);
    }
    render();
    return sh;
  }

  /* ---------- add your own photo: source → crop → name ---------- */
  // every photo the grown-up adds (camera or gallery) comes through here: it is a Little Us Plus feature
  function pickFile(capture, cb) {
    if (PLUS_ON && window.LUAcc && LUAcc.canUsePhotos && !LUAcc.canUsePhotos()) { LUAcc.photoLockSheet(); return; }
    var f = document.createElement('input');
    f.type = 'file'; f.accept = 'image/*';
    if (capture) f.setAttribute('capture', 'environment');
    f.style.display = 'none';
    document.body.appendChild(f);
    f.onchange = function () { var file = f.files && f.files[0]; f.remove(); if (file) cb(file); };
    f.click();
  }
  function openAddPhoto(done, opts) {
    opts = opts || {};
    var sh = sheet('<h2 class="tl-h2">' + esc(tr('addOwn')) + '</h2><p class="tl-p">' + esc(tr('addOwnP')) + '</p>' +
      '<div class="tl-two"><button type="button" class="tl-src" data-src="cam" style="background:#DCEBFA">📷<b>' + esc(tr('takePhoto')) + '</b></button>' +
      '<button type="button" class="tl-src" data-src="gal" style="background:#DDF2E4">🖼️<b>' + esc(tr('fromGallery')) + '</b></button></div>' +
      (opts.noText ? '' : '<button type="button" class="tl-listbtn" data-src="text"><span class="tl-aa">Aa</span><span><b>' + esc(tr('textOnly')) + '</b><small>' + esc(tr('textOnlyD')) + '</small></span><span>›</span></button>'));
    sh.el.onclick = function (e) {
      var b = e.target.closest('[data-src]'); if (!b) return;
      if (b.dataset.src === 'text') { sh.close(); return openTextCard(done); }
      pickFile(b.dataset.src === 'cam', function (file) {
        sh.close();
        openCrop(file, function (dataUrl) {
          if (opts.raw) return done(dataUrl);
          openNameCard(dataUrl, done);
        });
      });
    };
  }
  function openCrop(file, cb) {
    var url = URL.createObjectURL(file);
    var img = new Image();
    img.onload = function () {
      var st = { rot: 0, zoom: 1, x: 0, y: 0 };
      var sh = sheet('<div class="tl-crophead"><button type="button" data-c="cancel">' + esc(tr('cancel')) + '</button><b>' + esc(tr('crop')) + '</b><button type="button" data-c="ok">' + esc(tr('next')) + '</button></div>' +
        '<div class="tl-cropbox"><canvas width="600" height="600"></canvas><div class="tl-cropgrid"></div></div>' +
        '<input type="range" min="1" max="3" step="0.01" value="1" class="tl-range" data-zoom aria-label="Zoom">' +
        '<p class="tl-note2" style="text-align:center">' + esc(tr('pinch')) + '</p><div style="display:flex;justify-content:center"><button type="button" class="tl-btn quiet sm" data-c="rot">' + esc(tr('rotate')) + '</button></div>', { full: true, dark: true, noScrimClose: true });
      var cv = sh.el.querySelector('canvas'), ctx = cv.getContext('2d');
      function draw(target, size) {
        var c = target.getContext('2d');
        c.fillStyle = '#fff'; c.fillRect(0, 0, size, size);
        var w = img.naturalWidth, h = img.naturalHeight;
        var rw = st.rot % 180 ? h : w, rh = st.rot % 180 ? w : h;
        var base = size / Math.min(rw, rh) * st.zoom;
        c.save(); c.translate(size / 2 + st.x * size, size / 2 + st.y * size); c.rotate(st.rot * Math.PI / 180); c.scale(base, base);
        c.drawImage(img, -w / 2, -h / 2); c.restore();
      }
      function redraw() { draw(cv, 600); }
      redraw();
      var drag = null;
      cv.addEventListener('pointerdown', function (e) { drag = { x: e.clientX, y: e.clientY, sx: st.x, sy: st.y }; cv.setPointerCapture(e.pointerId); });
      cv.addEventListener('pointermove', function (e) { if (!drag) return; var r = cv.getBoundingClientRect(); st.x = drag.sx + (e.clientX - drag.x) / r.width; st.y = drag.sy + (e.clientY - drag.y) / r.height; redraw(); });
      cv.addEventListener('pointerup', function () { drag = null; });
      sh.el.querySelector('[data-zoom]').oninput = function (e) { st.zoom = Number(e.target.value); redraw(); };
      sh.el.onclick = function (e) {
        var b = e.target.closest('[data-c]'); if (!b) return;
        if (b.dataset.c === 'cancel') { URL.revokeObjectURL(url); return sh.close(); }
        if (b.dataset.c === 'rot') { st.rot = (st.rot + 90) % 360; return redraw(); }
        var out = document.createElement('canvas'); out.width = out.height = 480; draw(out, 480);
        var data = out.toDataURL('image/jpeg', 0.84);
        URL.revokeObjectURL(url); sh.close(); cb(data);
      };
    };
    img.onerror = function () { URL.revokeObjectURL(url); toast(tr('photoFail')); };
    img.src = url;
  }
  function openNameCard(dataUrl, done, existing) {
    var st = { idn: existing ? existing.idn : '', en: existing ? existing.en : '', cat: existing ? existing.cat : 'self', fav: true };
    var sh = sheet('', { full: true });
    function render() {
      sh.set('<div class="tl-top" style="padding:0 0 8px"><button type="button" class="tl-iconbtn" data-n="back">' + ICO.back + '</button><div class="tl-toptx"><h1>' + esc(tr('nameCard')) + '</h1></div></div>' +
        '<div class="tl-center"><div class="tl-card tl-m"><div class="tl-art tl-photo"><img src="' + dataUrl + '" alt=""><span class="tl-fototag">' + (L() === 'id' ? 'Foto' : 'Photo') + '</span></div><span class="tl-lab">' + esc(st.idn || st.en || '…') + '</span>' + (st.en && st.idn ? '<span class="tl-sub">' + esc(st.en) + '</span>' : '') + '</div></div>' +
        '<label class="tl-field"><span>' + esc(tr('labelId')) + '</span><input data-f="idn" value="' + esc(st.idn) + '" placeholder="Sikat gigi"></label>' +
        '<label class="tl-field"><span>' + esc(tr('labelEn')) + '</span><input data-f="en" value="' + esc(st.en) + '" placeholder="Brush teeth"></label>' +
        '<div class="tl-lab2">' + esc(tr('category')) + '</div><div class="tl-chips wrap">' + A.CATS.map(function (c) { return '<button type="button" class="tl-chip' + (st.cat === c.id ? ' on yellow' : '') + '" data-cat="' + c.id + '">' + esc(L() === 'id' ? c.idn : c.en) + '</button>'; }).join('') + '</div>' +
        '<div class="tl-panel">' + row(esc(tr('addFav')), '', toggle('fav', st.fav)) + '</div>' +
        '<div class="tl-sheetfoot col"><button type="button" class="tl-btn primary lg" data-n="save">' + esc(tr('saveCard')) + '</button><small>' + esc(tr('availEvery')) + '</small></div>');
      sh.el.querySelectorAll('[data-f]').forEach(function (inp) { inp.oninput = function () { st[inp.dataset.f] = inp.value; var c = sh.el.querySelector('.tl-card'); c.querySelector('.tl-lab').textContent = st.idn || st.en || '…'; }; });
    }
    sh.el.onclick = function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (b.dataset.cat) { st.cat = b.dataset.cat; return render(); }
      if (b.dataset.tog === 'fav') { st.fav = !st.fav; return render(); }
      if (b.dataset.n === 'back') return sh.close();
      if (b.dataset.n === 'save') {
        var pid = uid('p'), ref = existing ? existing.ref : uid('c_');
        photoPut(pid, dataUrl).then(function () {
          S.custom[ref] = { id: ref, type: 'photo', photo: pid, en: st.en.trim(), idn: st.idn.trim(), cat: st.cat };
          if (st.fav && D().favs.indexOf(ref) < 0) D().favs.unshift(ref);
          touchRecent(ref); save(); sh.close(); done && done(ref);
        });
      }
    };
    render();
  }
  function openTextCard(done, existing) {
    var st = { idn: existing ? existing.idn : '', en: existing ? existing.en : '', color: existing ? existing.color : '#E9E1F7' };
    var sh = sheet('', { full: true });
    function render() {
      sh.set('<div class="tl-top" style="padding:0 0 8px"><button type="button" class="tl-iconbtn" data-n="back">' + ICO.back + '</button><div class="tl-toptx"><h1>' + esc(L() === 'id' ? 'Kartu teks' : 'Text card') + '</h1></div></div>' +
        '<div class="tl-center"><div class="tl-card tl-m"><div class="tl-art tl-textart" style="background:' + st.color + '"><span>' + esc(st.idn || st.en || 'Aa') + '</span></div></div></div>' +
        '<label class="tl-field"><span>' + esc(tr('indonesian')) + '</span><input data-f="idn" value="' + esc(st.idn) + '" placeholder="Tunggu sebentar"></label>' +
        '<label class="tl-field"><span>' + esc(tr('english')) + '</span><input data-f="en" value="' + esc(st.en) + '" placeholder="Wait a moment (' + esc(tr('optional')) + ')"></label>' +
        '<div class="tl-lab2">' + esc(tr('colour')) + '</div><div class="tl-swatches">' + COLORS.concat(['#FFFFFF']).map(function (c) { return '<button type="button" class="tl-sw' + (st.color === c ? ' on' : '') + '" style="background:' + c + '" data-col="' + c + '" aria-label="' + c + '"></button>'; }).join('') + '</div>' +
        '<div class="tl-sheetfoot"><button type="button" class="tl-btn primary lg" data-n="save"' + (st.idn || st.en ? '' : ' disabled') + '>' + esc(tr('saveCard')) + '</button></div>');
      sh.el.querySelectorAll('[data-f]').forEach(function (inp) { inp.oninput = function () { st[inp.dataset.f] = inp.value; sh.el.querySelector('.tl-textart span').textContent = st.idn || st.en || 'Aa'; sh.el.querySelector('[data-n=save]').disabled = !(st.idn || st.en); }; });
    }
    sh.el.onclick = function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (b.dataset.col) { st.color = b.dataset.col; return render(); }
      if (b.dataset.n === 'back') return sh.close();
      if (b.dataset.n === 'save') {
        var ref = existing ? existing.ref : uid('c_');
        S.custom[ref] = { id: ref, type: 'text', en: st.en.trim(), idn: st.idn.trim(), color: st.color, cat: 'feel' };
        touchRecent(ref); save(); sh.close(); done && done(ref);
      }
    };
    render();
  }
  function openEditLabel(ref, done) {
    var i = cardInfo(ref); if (!i) return;
    if (i.type === 'text') return openTextCard(done, i);
    var st = { idn: i.idn, en: i.en, mode: S.settings.labels };
    var sh = sheet('', { full: true });
    function render() {
      var preview = Object.assign({}, i, { idn: st.idn || i.idn, en: st.en || i.en });
      var lb = labelsFor(preview, st.mode);
      sh.set('<div class="tl-top" style="padding:0 0 8px"><button type="button" class="tl-iconbtn" data-n="back">' + ICO.back + '</button><div class="tl-toptx"><h1>' + esc(tr('editLabel')) + '</h1><small>' + esc(i.type === 'illus' ? 'Little Us' : (L() === 'id' ? 'Foto' : 'Photo')) + '</small></div></div>' +
        '<div class="tl-center"><div class="tl-card tl-m is-selected">' + artHTML(ref) + (lb.main ? '<span class="tl-lab">' + esc(lb.main) + '</span>' : '') + (lb.sub ? '<span class="tl-sub">' + esc(lb.sub) + '</span>' : '') + '</div></div>' +
        '<label class="tl-field"><span>' + esc(tr('indonesian')) + '</span><input data-f="idn" value="' + esc(st.idn) + '"></label>' +
        '<label class="tl-field"><span>' + esc(tr('english')) + '</span><input data-f="en" value="' + esc(st.en) + '"></label>' +
        '<div class="tl-lab2">' + esc(tr('showOn')) + '</div>' + seg('mode', [['id', 'ID'], ['en', 'EN'], ['both', tr('lBoth')], ['none', L() === 'id' ? 'Tanpa' : 'None']], st.mode) +
        (i.type === 'illus' ? '<button type="button" class="tl-link" data-n="reset">' + esc(tr('resetTo', i.baseId + ' / ' + i.baseEn)) + '</button>' : '') +
        '<div class="tl-sheetfoot"><button type="button" class="tl-btn primary lg" data-n="save">' + esc(tr('save')) + '</button></div>');
      sh.el.querySelectorAll('[data-f]').forEach(function (inp) { inp.onchange = inp.oninput = function () { st[inp.dataset.f] = inp.value; }; });
    }
    sh.el.onclick = function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (b.dataset.seg === 'mode') { st.mode = b.dataset.v; return render(); }
      if (b.dataset.n === 'back') return sh.close();
      if (b.dataset.n === 'reset') { st.idn = i.baseId; st.en = i.baseEn; return render(); }
      if (b.dataset.n === 'save') {
        if (isCustom(ref)) { S.custom[ref].idn = st.idn.trim(); S.custom[ref].en = st.en.trim(); }
        else if (st.idn === i.baseId && st.en === i.baseEn) delete S.labels[ref];
        else S.labels[ref] = { idn: st.idn.trim() || i.baseId, en: st.en.trim() || i.baseEn };
        S.settings.labels = st.mode; save(); sh.close(); done && done(ref);
      }
    };
    render();
  }

  /* ---------- profiles ---------- */
  function openProfiles() {
    var sh = sheet('');
    function render() {
      var h = '<div class="tl-sheethead"><h2>' + esc(tr('whoHelp')) + '</h2><button type="button" class="tl-iconbtn round" data-x>✕</button></div><div class="tl-plist">';
      S.profiles.forEach(function (p) {
        var d = S.data[p.id] || {};
        h += '<div class="tl-prow"><button type="button" class="tl-pitem' + (p.id === S.current ? ' on' : '') + '" data-p="' + p.id + '">' + avatar(p, 44) + '<span><b>' + esc(p.name) + '</b><small>' + esc(tr('nRewards', (p.rewards || []).length)) + ' · ' + esc(tr('nScheds', (d.schedules || []).length)) + '</small></span>' + (p.id === S.current ? '<span class="tl-tick">✓</span>' : '') + '</button>' + delBtn(p) + '</div>';
      });
      h += '<a class="tl-pitem add" href="#/tools/setup?new=1"><span class="tl-ava plus">+</span><b>' + esc(tr('addChild')) + '</b></a></div>' +
        '<div class="tl-links">' + (S.profiles.length ? '<a href="#/tools/settings#profiles">' + esc(tr('editProfiles')) + '<span>›</span></a>' : '') + '<a href="#/tools/backup">' + esc(tr('saveBackupShare')) + '<span>›</span></a></div>';
      sh.set(h);
    }
    sh.el.onclick = function (e) {
      if (e.target.closest('a')) return sh.close();
      var b = e.target.closest('button'); if (!b) return;
      if (b.hasAttribute('data-x')) return sh.close();
      if (b.dataset.delp) { if (delConfirm(b)) { deleteProfile(b.dataset.delp); if (!S.profiles.length) sh.close(); else render(); refreshAll(); } return; }
      if (b.dataset.p) { S.current = b.dataset.p; save(); sh.close(); refreshAll(); }
    };
    render();
  }

  /* ---------- hidden Plus sheet (designed, not active at launch) ---------- */
  function openPlus(name) {
    var sh = sheet('<div class="tl-center col"><span class="tl-plus">' + A.heart(14, '#FFC94A') + ' Little Us Plus</span><h2 class="tl-h2" style="text-align:center">' + esc(tr('plusPart', name)) + '</h2><p class="tl-p" style="text-align:center">' + esc(tr('plusP')) + '</p></div>' +
      '<button type="button" class="tl-btn primary lg block" data-x>' + esc(tr('seePlus')) + '</button><button type="button" class="tl-btn quiet lg block" data-x>' + esc(tr('notNow')) + '</button>');
    sh.el.onclick = function (e) { if (e.target.closest('[data-x]')) sh.close(); };
  }

  /* ===================== child mode ===================== */
  var CH = { el: null, timers: [], lock: null, onExit: null };
  function childOpen(renderFn, onExit) {
    childClose(true);
    var el = document.createElement('div');
    el.id = 'tl-child'; el.className = 'tl-child' + (S.settings.reduce ? ' still' : '');
    document.body.appendChild(el); document.body.classList.add('tl-childon');
    CH.el = el; CH.onExit = onExit || null;
    try { if (el.requestFullscreen && window.matchMedia('(pointer:coarse)').matches) el.requestFullscreen().catch(function () {}); } catch (e) {}
    try { navigator.wakeLock && navigator.wakeLock.request('screen').then(function (l) { CH.lock = l; }).catch(function () {}); } catch (e) {}
    renderFn(el);
  }
  function childClear() { CH.timers.forEach(function (t) { clearInterval(t); clearTimeout(t); }); CH.timers = []; }
  function childClose(silent) {
    childClear();
    if (CH.el) { CH.el.remove(); CH.el = null; }
    document.body.classList.remove('tl-childon');
    try { if (document.fullscreenElement) document.exitFullscreen(); } catch (e) {}
    try { CH.lock && CH.lock.release(); } catch (e) {}
    CH.lock = null;
    try { window.speechSynthesis && speechSynthesis.cancel(); } catch (e) {}
    var cb = CH.onExit; CH.onExit = null;
    if (!silent && cb) cb();
  }
  function exitPill() {
    return '<button type="button" class="tl-exit" data-exit>' + '<span class="tl-ring"></span>' + dual(T.holdExit[1], T.holdExit[0]) + '</button>';
  }
  function wireExit(el) {
    var b = el.querySelector('[data-exit]'); if (!b) return;
    var t = null, ov = null;
    function start(e) {
      e.preventDefault();
      if (t) return;
      try { b.setPointerCapture(e.pointerId); } catch (er) {}
      ov = document.createElement('div'); ov.className = 'tl-holdov';
      ov.innerHTML = '<div class="tl-holdring"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,.25)" stroke-width="10"/><circle class="tl-holdarc" cx="60" cy="60" r="52" fill="none" stroke="#FFC94A" stroke-width="10" stroke-linecap="round" stroke-dasharray="327" stroke-dashoffset="327" transform="rotate(-90 60 60)"/></svg><span>' + A.heart(54) + '</span></div><h2>' + esc(L() === 'id' ? T.holding[1] : T.holding[0]) + '</h2><p>' + esc(L() === 'id' ? T.holdingD[1] : T.holdingD[0]) + '</p>';
      CH.el.appendChild(ov);
      var arc = ov.querySelector('.tl-holdarc'), t0 = Date.now();
      t = setInterval(function () {
        var p = Math.min(1, (Date.now() - t0) / 2000);
        arc.setAttribute('stroke-dashoffset', String(327 * (1 - p)));
        if (p >= 1) { stop(); childClose(); }
      }, 40);
    }
    function stop() { clearInterval(t); t = null; ov && ov.remove(); ov = null; }
    b.addEventListener('pointerdown', start);
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(function (ev) { b.addEventListener(ev, function () { if (t) stop(); }); });
    b.addEventListener('keydown', function (e) { if ((e.key === 'Enter' || e.key === ' ') && !t && !e.repeat) start(e); });
    b.addEventListener('keyup', function (e) { if ((e.key === 'Enter' || e.key === ' ') && t) stop(); });
    b.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  }
  function adultCheck(onPass, title) {
    onPass = typeof onPass === 'function' ? onPass : function () { childClose(); };
    var words = { en: ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'], id: ['nol', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan'] };
    var nums = []; while (nums.length < 6) { var n = 1 + Math.floor(Math.random() * 9); if (nums.indexOf(n) < 0) nums.push(n); }
    var target = nums[Math.floor(Math.random() * 6)];
    var sh = sheet('<div class="tl-center col"><span class="tl-eyebrow">' + esc(tr('adultCheck')) + '</span>' + (title ? '<p class="tl-p">' + esc(title) + '</p>' : '') + '<h2 class="tl-h2">' + esc(tr('tapNum', target, words[L()][target])) + '</h2></div>' +
      '<div class="tl-numgrid">' + nums.map(function (n) { return '<button type="button" data-n="' + n + '">' + n + '</button>'; }).join('') + '</div>' +
      '<button type="button" class="tl-btn quiet lg block" data-stay>' + esc(tr('stay')) + '</button>');
    sh.el.onclick = function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (b.hasAttribute('data-stay')) return sh.close();
      if (Number(b.dataset.n) === target) { sh.close(); onPass(); } else { sh.close(); }
    };
  }

  /* ---------- visual timer drawings ----------
     timerSVG(style, frac) draws a timer with frac of the time left (1 = full, 0 = finished).
     timerSet(svg, style, frac) moves only the parts that change, so the small animations
     (falling sand, sliding stripes) keep running smoothly while the timer counts down. */
  var TID = 0;
  function f1(n) { return Math.round(n * 10) / 10; }
  function isFun(style) { return !!(A.sceneStyles && A.sceneStyles.indexOf(style) >= 0); }
  function timerGeo(style, frac, info) {
    if (isFun(style)) return A.sceneGeo(style, frac, info);
    frac = clamp(frac, 0, 1);
    if (style === 'sand') {
      var on = frac > 0.004, run = frac > 0.004 && frac < 0.996;
      var ys = 128 - 86 * frac, dip = Math.min(12, 3 + 10 * (1 - frac));
      var top = on ? 'M30 ' + f1(ys) + 'Q100 ' + f1(ys + dip * 2) + ' 170 ' + f1(ys) + 'V140H30Z' : 'M0 0Z';
      var hb = 84 * (1 - frac), yb = 226 - hb, k = Math.min(11, 2 + hb * 0.35);
      var bot = hb > 0.5 ? 'M30 236V' + f1(yb + k) + 'Q100 ' + f1(yb - k) + ' 170 ' + f1(yb + k) + 'V236Z' : 'M0 0Z';
      return { top: { d: top }, topSp: { d: top }, bot: { d: bot }, botSp: { d: bot },
        stream: { y2: f1(Math.max(132, yb)), opacity: run ? 1 : 0 }, grain: { y2: f1(Math.max(132, yb)), opacity: run ? 1 : 0 } };
    }
    if (style === 'bar') {
      var w = frac > 0.002 ? Math.max(42, 286 * frac) : 0;
      return { clip: { width: f1(w) }, out: { width: f1(w), opacity: w ? 1 : 0 } };
    }
    // circle: a pie of colour that shrinks clockwise back to 12 o'clock
    var a = 360 * frac, rad = (a - 90) * Math.PI / 180, R0 = 78, cx = 120, cy = 128, d;
    if (frac >= 0.999) d = 'M' + cx + ' ' + (cy - R0) + 'A' + R0 + ' ' + R0 + ' 0 1 1 ' + (cx - 0.01) + ' ' + (cy - R0) + 'Z';
    else if (frac <= 0.001) d = 'M0 0Z';
    else d = 'M' + cx + ' ' + cy + 'L' + cx + ' ' + (cy - R0) + 'A' + R0 + ' ' + R0 + ' 0 ' + (a > 180 ? 1 : 0) + ' 1 ' + f1(cx + R0 * Math.cos(rad)) + ' ' + f1(cy + R0 * Math.sin(rad)) + 'Z';
    return { wedge: { d: d }, hand: { transform: 'rotate(' + f1(a) + ' ' + cx + ' ' + cy + ')' } };
  }
  function gAttr(g, k) { var o = g[k], s = ' data-k="' + k + '"'; for (var a in o) s += ' ' + a + '="' + o[a] + '"'; return s; }
  function timerSet(svg, style, frac, info) {
    if (!svg || !svg.querySelectorAll) return;
    var g = timerGeo(style, frac, info);
    Array.prototype.forEach.call(svg.querySelectorAll('[data-k]'), function (n) {
      var o = g[n.getAttribute('data-k')]; if (!o) return;
      for (var a in o) if (n.getAttribute(a) !== String(o[a])) n.setAttribute(a, o[a]);
    });
  }
  // the classic timers get the same shading as the picture cards; the moving parts (data-k) are left as they are
  function timerSVG(style, frac, opts) { var out = timerSVG0(style, frac, opts); return isFun(style) || !A.fx ? out : A.fx.enrich(out, { d: 3, maxW: 150 }); }
  function timerSVG0(style, frac, opts) {
    if (isFun(style)) return A.scene(style, frac, opts);
    var K = '#2B2A35', id = 'tlT' + (++TID), g = timerGeo(style, frac);
    if (style === 'sand') {
      var GL = 'M44 34H156C156 82 112 102 104 130C112 158 156 178 156 226H44C44 178 88 158 96 130C88 102 44 82 44 34Z';
      var post = function (x) {
        return '<rect x="' + x + '" y="34" width="10" height="192" rx="5" fill="#E5BE93" stroke="' + K + '" stroke-width="3.5"/>' +
          [82, 130, 178].map(function (y, i) { return '<ellipse cx="' + (x + 5) + '" cy="' + y + '" rx="' + (i === 1 ? 9 : 8) + '" ry="' + (i === 1 ? 7 : 5.5) + '" fill="#B98157" stroke="' + K + '" stroke-width="3"/>'; }).join('');
      };
      var cap = function (y) {
        return '<rect x="20" y="' + y + '" width="160" height="22" rx="9" fill="#B98157" stroke="' + K + '" stroke-width="4.5"/>' +
          '<path d="M30 ' + (y + 6) + 'H170" stroke="#E5BE93" stroke-width="3" stroke-linecap="round" opacity=".9"/>' +
          '<path d="M38 ' + (y + 14) + 'h26M86 ' + (y + 16) + 'h34M138 ' + (y + 13) + 'h22" stroke="#7A4E35" stroke-width="2.2" stroke-linecap="round" opacity=".55"/>' +
          '<circle cx="30" cy="' + (y + 11) + '" r="2.4" fill="#7A4E35"/><circle cx="170" cy="' + (y + 11) + '" r="2.4" fill="#7A4E35"/>';
      };
      return '<svg viewBox="0 0 200 260" class="tl-tsvg sand" aria-hidden="true"><defs>' +
        '<clipPath id="' + id + 'g"><path d="' + GL + '"/></clipPath>' +
        '<pattern id="' + id + 'p" width="13" height="11" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="1.3" fill="#D99A1E"/><circle cx="9.5" cy="8" r="1.1" fill="#D99A1E"/><circle cx="11" cy="2" r=".8" fill="#fff"/></pattern></defs>' +
        '<ellipse cx="100" cy="252" rx="78" ry="5" fill="' + K + '" opacity=".1"/>' +
        post(27) + post(163) +
        '<path d="' + GL + '" fill="#EEF6FD"/>' +
        '<g clip-path="url(#' + id + 'g)">' +
        '<path' + gAttr(g, 'top') + ' fill="#FFC94A" stroke="#E0A92A" stroke-width="2.5"/><path' + gAttr(g, 'topSp') + ' fill="url(#' + id + 'p)" opacity=".55"/>' +
        '<path' + gAttr(g, 'bot') + ' fill="#FFC94A" stroke="#E0A92A" stroke-width="2.5"/><path' + gAttr(g, 'botSp') + ' fill="url(#' + id + 'p)" opacity=".55"/>' +
        '<line x1="100" y1="128"' + gAttr(g, 'stream') + ' x2="100" stroke="#FFC94A" stroke-width="3.5"/>' +
        '<line class="tl-tgrain" x1="100" y1="128"' + gAttr(g, 'grain') + ' x2="100" stroke="#D99A1E" stroke-width="3.5" stroke-dasharray="2 7"/>' +
        '<path d="M58 46C60 68 70 82 84 94M150 44C150 52 147 58 143 63" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".85"/>' +
        '<path d="M58 214C59 196 67 184 79 174" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".7"/></g>' +
        '<path d="' + GL + '" fill="none" stroke="' + K + '" stroke-width="5" stroke-linejoin="round"/>' +
        cap(14) + cap(222) + '</svg>';
    }
    if (style === 'bar') {
      var stripes = '';
      for (var i = -3; i < 12; i++) { var x0 = 17 + i * 28; stripes += '<path d="M' + x0 + ' 61h13l22-42h-13z"/>'; }
      var ticks = '';
      [0, 0.25, 0.5, 0.75, 1].forEach(function (p, j) {
        var tx = f1(38 + 244 * p);
        ticks += j % 2 === 0 ? '<circle cx="' + tx + '" cy="86" r="4.5" fill="' + (j === 4 ? '#FFC94A' : '#fff') + '" stroke="' + K + '" stroke-width="2.5"/>' : '<circle cx="' + tx + '" cy="86" r="2.6" fill="#C9BFAE"/>';
      });
      return '<svg viewBox="0 0 320 96" class="tl-tsvg bar" aria-hidden="true"><defs><clipPath id="' + id + 'c"><rect x="17" y="19"' + gAttr(g, 'clip') + ' height="42" rx="21"/></clipPath></defs>' +
        '<rect x="8" y="10" width="304" height="60" rx="30" fill="#fff" stroke="' + K + '" stroke-width="5"/>' +
        '<rect x="17" y="19" width="286" height="42" rx="21" fill="#F3EEE6"/>' +
        '<path d="M88.5 24v32M160 24v32M231.5 24v32" stroke="#D9CDB8" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="1 6"/>' +
        '<g clip-path="url(#' + id + 'c)"><rect x="17" y="19" width="286" height="42" fill="#FFC94A"/>' +
        '<g class="tl-tstripe" fill="#FFE29A" opacity=".75">' + stripes + '</g>' +
        '<rect x="17" y="50" width="286" height="11" fill="#F5B92E" opacity=".7"/>' +
        '<path d="M32 27H290" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".7"/></g>' +
        '<rect x="17" y="19"' + gAttr(g, 'out') + ' height="42" rx="21" fill="none" stroke="' + K + '" stroke-width="3"/>' + ticks + '</svg>';
    }
    var cx = 120, cy = 128, tk = '';
    for (var m = 0; m < 60; m++) {
      var an = m * 6 * Math.PI / 180, big = m % 5 === 0, r1 = big ? 82 : 86, r2 = 91;
      tk += big ? '<line x1="' + f1(cx + r1 * Math.sin(an)) + '" y1="' + f1(cy - r1 * Math.cos(an)) + '" x2="' + f1(cx + r2 * Math.sin(an)) + '" y2="' + f1(cy - r2 * Math.cos(an)) + '"/>'
        : '<circle cx="' + f1(cx + 88.5 * Math.sin(an)) + '" cy="' + f1(cy - 88.5 * Math.cos(an)) + '" r="1.3" fill="#C9BFAE" stroke="none"/>';
    }
    return '<svg viewBox="0 0 240 240" class="tl-tsvg circle" aria-hidden="true">' +
      '<ellipse cx="120" cy="234" rx="70" ry="4.5" fill="' + K + '" opacity=".1"/>' +
      '<rect x="106" y="4" width="28" height="16" rx="6" fill="#F0694F" stroke="' + K + '" stroke-width="4"/><path d="M113 9h14" stroke="#F7A08C" stroke-width="2.5" stroke-linecap="round"/>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="104" fill="#7DB3E8" stroke="' + K + '" stroke-width="5"/>' +
      '<path d="M44 92A84 84 0 0 1 92 38" fill="none" stroke="#BFDCF6" stroke-width="5" stroke-linecap="round"/>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="94" fill="#fff" stroke="' + K + '" stroke-width="3.5"/>' +
      '<g stroke="' + K + '" stroke-width="3.5" stroke-linecap="round">' + tk + '</g>' +
      '<path' + gAttr(g, 'wedge') + ' fill="#FFC94A" stroke="' + K + '" stroke-width="3.5" stroke-linejoin="round"/>' +
      '<g' + gAttr(g, 'hand') + '><path d="M' + cx + ' ' + cy + 'V' + (cy - 74) + '" stroke="' + K + '" stroke-width="5" stroke-linecap="round"/><circle cx="' + cx + '" cy="' + (cy - 74) + '" r="5" fill="#F0694F" stroke="' + K + '" stroke-width="3"/></g>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="13" fill="#F0694F" stroke="' + K + '" stroke-width="4"/><circle cx="' + (cx - 4) + '" cy="' + (cy - 4) + '" r="3" fill="#fff" opacity=".85"/></svg>';
  }

  /* ---------- visual timer: child view ---------- */
  // the next activity, shown in the speech bubble at the end of a fun timer's path
  // a bold yellow arrow pointing down (rotated by CSS when the layout runs sideways)
  var ARROW = '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M17 5h14v19h9L24 43 8 24h9z" fill="#FFC94A" stroke="#2B2A35" stroke-width="3.6" stroke-linejoin="round"/></svg>';
  function jcard(ref) { return '<div class="tl-jcard">' + artHTML(ref) + '<b>' + esc(cardLabel(ref)) + '</b></div>'; }
  function fmt(ms) { var s = Math.ceil(ms / 1000), m = Math.floor(s / 60); return m + ':' + String(s % 60).padStart(2, '0'); }
  function runTimer(cfg, opts) {
    opts = opts || {};
    var total = Math.max(5, Math.round(cfg.minutes * 60 + (Number(cfg.seconds) || 0))) * 1000;
    var endAt = Date.now() + total;
    var warned = {};
    var nextRef = opts.next !== undefined ? opts.next : cfg.next;
    childOpen(function (el) {
      var fun = isFun(cfg.style), hasNext = !!(nextRef && cardInfo(nextRef));
      el.innerHTML = '<div class="tl-cwrap timer ' + (cfg.style || 'circle') + (fun ? ' fun' : '') + '">' + exitPill() + '<div class="tl-tleft"><div class="tl-warn" hidden></div><div class="tl-tvis"></div>' +
        (cfg.style === 'sand' ? '<div class="tl-bigword">' + dual(T.wait[1], T.wait[0]) + '</div>' : '') + '<div class="tl-time"></div></div>' +
        (hasNext ? '<div class="tl-tnext' + (fun ? ' funnext' : '') + '"><div class="tl-eyebrow">' + dual(T.nextL[1], T.nextL[0]) + '</div>' + cardHTML(nextRef, { size: 'l' }) + '</div>' : '') + '</div>';
      wireExit(el);
      var vis = el.querySelector('.tl-tvis'), tm = el.querySelector('.tl-time'), wn = el.querySelector('.tl-warn');
      vis.innerHTML = timerSVG(cfg.style, 1, { info: { left: total, total: total } }) + (fun && hasNext ? jcard(nextRef) : '');
      function tick() {
        var left = endAt - Date.now();
        if (left <= 0) { childClear(); return finished(); }
        timerSet(vis.firstChild, cfg.style, left / total, { left: left, total: total });
        tm.textContent = fmt(left);
        [[2, 'w2'], [1, 'w1']].forEach(function (w) {
          if (cfg[w[1]] && total > w[0] * 60000 + 2000 && left <= w[0] * 60000 && !warned[w[0]]) {
            warned[w[0]] = true;
            var d = dualKey('left', w[0]);
            wn.hidden = false; wn.innerHTML = dual(d.id, d.en);
            chime('pop'); if (cfg.speak) say(speakLang() === 'id' ? d.id : d.en);
          }
        });
      }
      tick();
      CH.timers.push(setInterval(tick, 250));
      function finished() {
        if (cfg.end === 'chime') chime('done'); else if (cfg.end === 'vibrate') buzz([200, 120, 200]);
        if (cfg.speak) say(speakLang() === 'id' ? T.timeFinish[1] : T.timeFinish[0]);
        el.innerHTML = '<div class="tl-cwrap done' + (fun ? ' fun' : '') + '">' + exitPill() + '<div class="tl-fin">' + (fun ? '<div class="tl-tvis">' + timerSVG(cfg.style, 0, { arrived: true }) + (hasNext ? jcard(nextRef) : '') + '</div>' : A.heart(64)) + '<h2>' + dual(T.timeFinish[1], T.timeFinish[0], 'big') + '</h2>' +
          (cfg.style === 'bar' ? timerSVG('bar', 1) : '') + '</div>' +
          (nextRef && cardInfo(nextRef) ? '<div class="tl-tnext"><div class="tl-eyebrow">' + dual(T.nowL[1], T.nowL[0]) + '</div>' + cardHTML(nextRef, { size: 'l', state: 'selected' }) + '</div>' : '') +
          (opts.backLabel ? '<button type="button" class="tl-btn primary lg" data-back>' + esc(opts.backLabel) + '</button>' : '') + '</div>';
        wireExit(el);
        var bb = el.querySelector('[data-back]');
        if (bb) bb.onclick = function () { opts.onBack && opts.onBack(); };
      }
    }, opts.onExit);
  }

  /* ---------- token board: child view ---------- */
  function runTokens() {
    var cfg = D().tokens;
    childOpen(function (el) {
      function render() {
        var rw = cardInfo(cfg.reward);
        if (cfg.earned >= cfg.count) {
          var g = dualKey('great', rw ? rw.en : '');
          var gi = dualKey('great', rw ? rw.idn : '');
          el.innerHTML = '<div class="tl-cwrap full">' + exitPill() + '<div class="tl-glow"></div><div class="tl-fin">' + A.heart(64) + '<h2>' + dual(gi.id, g.en, 'big') + '</h2></div>' +
            (rw ? cardHTML(cfg.reward, { size: 'l', state: 'selected' }) : '') +
            '<div class="tl-tokrow">' + Array.from({ length: cfg.count }, function () { return '<span class="tl-tok on">' + A.token(cfg.shape, true) + '</span>'; }).join('') + '</div>' +
            '<button type="button" class="tl-btn primary lg" data-again>↻ ' + dual(T.again[1], T.again[0]) + '</button></div>';
        } else {
          el.innerHTML = '<div class="tl-cwrap tokens">' + exitPill() + '<div class="tl-tokside"><h2 class="tl-chtitle">' + dual(T.working[1], T.working[0]) + '</h2>' + (rw ? cardHTML(cfg.reward, { size: 'l' }) : '') + '</div>' +
            '<div class="tl-tokpanel"><div class="tl-tokgrid n' + cfg.count + '">' + Array.from({ length: cfg.count }, function (_, i) {
              var on = i < cfg.earned;
              return '<button type="button" class="tl-tok' + (on ? ' on' : '') + '" data-tok="' + i + '"' + (on ? ' data-earned="1"' : '') + ' aria-label="token ' + (i + 1) + '">' + A.token(cfg.shape, on) + '</button>';
            }).join('') + '</div><p class="tl-tokhint">' + esc(tr('tapToken', cfg.earned, cfg.count)) + '</p>' + (cfg.earned ? '<button type="button" class="tl-undo" data-undo>↶ ' + esc(tr('undoTok')) + '</button>' : '') + '</div></div>';
        }
        wireExit(el);
      }
      el.addEventListener('click', function (e) {
        var b = e.target.closest('[data-tok]');
        if (b && !b.dataset.earned) {
          cfg.earned = Math.min(cfg.count, cfg.earned + 1); save(); chime('pop'); buzz(30);
          if (cfg.earned >= cfg.count) { if (cfg.full === 'chime') chime('done'); }
          return render();
        }
        if (e.target.closest('[data-again]')) { cfg.earned = 0; save(); render(); }
        if (e.target.closest('[data-undo]')) takeBack();
      });
      function takeBack() { adultCheck(function () { cfg.earned = Math.max(0, cfg.earned - 1); save(); render(); toast(tr('tokenBack')); }, tr('takeBack')); }
      var lp = null;
      function lpStop() { if (lp) { clearTimeout(lp); lp = null; } }
      el.addEventListener('pointerdown', function (e) {
        var b = e.target.closest('[data-earned]'); if (!b) return;
        lpStop();
        lp = setTimeout(function () {
          lp = null; buzz(40); takeBack();
        }, 2000);
      });
      ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (ev) { el.addEventListener(ev, lpStop); });
      el.addEventListener('contextmenu', function (e) { if (e.target.closest('[data-tok]')) e.preventDefault(); });
      render();
    }, function () { rerender(); });
  }

  /* ---------- first-then: child view ---------- */
  function runFT(resume) {
    var cfg = D().ft;
    var st = resume || { done: false, pick: null };
    childOpen(function (el) {
      function render() {
        var thens = (cfg.choice ? cfg.then.slice(0, 2) : cfg.then.slice(0, 1)).filter(Boolean);
        el.innerHTML = '<div class="tl-cwrap ft">' + exitPill() +
          '<div class="tl-ftbox first' + (st.done ? ' done' : ' active') + '" data-first><div class="tl-fthead">' + dual(T.first[1], T.first[0], 'big') + '</div>' + cardHTML(cfg.first, { size: 'l', state: st.done ? 'done' : '' }) + '</div>' +
          '<div class="tl-ftarrow" aria-hidden="true">' + ARROW + '</div>' +
          '<div class="tl-ftbox then' + (st.done ? ' active' : '') + '"><div class="tl-fthead">' + dual(T.then[1], T.then[0], 'big') + '</div><div class="tl-ftthens">' +
          thens.map(function (r) { return cardHTML(r, { size: thens.length > 1 ? 'm' : 'l', state: st.pick === r ? 'selected' : '', attrs: ' data-then="' + r + '"' }); }).join('') + '</div>' +
          (thens.length > 1 && st.done ? '<div class="tl-pickone">' + dual(T.pickOne[1], T.pickOne[0]) + '</div>' : '') + '</div>' +
          (cfg.timerBtn ? '<button type="button" class="tl-btn outline lg tl-timerbtn" data-timer><span class="tl-dot"></span>' + dual(T.timerN[1](cfg.timerMin), T.timerN[0](cfg.timerMin)) + '</button>' : '') + '</div>';
        wireExit(el);
      }
      el.addEventListener('click', function (e) {
        if (e.target.closest('[data-exit]')) return;
        if (e.target.closest('[data-first]') && !st.done) { st.done = true; chime('pop'); return render(); }
        var t = e.target.closest('[data-then]');
        if (t && st.done) { st.pick = t.dataset.then; chime('pop'); return render(); }
        if (e.target.closest('[data-timer]')) {
          var tc = Object.assign({}, D().timer, { minutes: cfg.timerMin, seconds: 0 });
          runTimer(tc, { next: st.done ? (st.pick || cfg.then[0]) : cfg.first, backLabel: tr('backBoard'), onBack: function () { runFT(st); }, onExit: function () { rerender(); } });
        }
      });
      render();
    }, function () { rerender(); });
  }

  /* ---------- visual schedule: child view ---------- */
  function activeSched() {
    var d = D();
    return d.schedules.filter(function (x) { return x.id === d.active; })[0] || null;
  }
  function schedName(s) { var n = s && s.name ? (L() === 'id' ? s.name.id || s.name.en : s.name.en || s.name.id) : ''; return n || tr('untitled'); }
  function activeBoard() { var d = D(); return d.boards.filter(function (x) { return x.id === d.ft.boardId; })[0] || null; }
  function syncFT() { var d = D(), b = activeBoard(); d.ft.first = b ? b.first : null; d.ft.then = b ? b.then.slice() : []; }
  function boardName(b) { if (!b || !b.first) return tr('untitledBoard'); return cardLabel(b.first) + ' → ' + (b.then[0] ? cardLabel(b.then[0]) : '…'); }
  function runSched(resume) {
    var s = activeSched(), cfg = D().sched;
    var st = resume || { done: [], change: null };
    if (!st.steps) st.steps = s.steps.map(function (x) { return { card: x.card, min: x.min }; });
    s.used = Date.now(); save();
    childOpen(function (el) {
      function render() {
        var steps = st.steps.map(function (x, i) { return { i: i, card: x.card, min: x.min }; });
        var pending = steps.filter(function (x) { return st.done.indexOf(x.i) < 0; });
        var cur = pending[0], nxt = pending[1];
        var visible = steps;
        if (cfg.done === 'move') visible = steps.filter(function (x) { return st.done.indexOf(x.i) < 0; });
        if (cfg.show === 'next3') {
          var ci = cur ? cur.i : steps.length;
          visible = visible.filter(function (x) { return x.i >= ci - (cfg.done === 'move' ? 0 : 1) && x.i < ci + 3; });
        }
        var h = '<div class="tl-cwrap sched ' + cfg.layout + '">' + exitPill() +
          '<div class="tl-schedbar"><div class="tl-eyebrow">' + esc(schedName(s)) + '</div>' +
          (cur ? '<button type="button" class="tl-replan" data-replan>' + ICO.replan + '<span>' + dual(T.changePlan[1], T.changePlan[0]) + '</span></button>' : '') + '</div><div class="tl-steps">';
        if (!cur) h += '<div class="tl-fin">' + A.heart(64) + '<h2>' + dual(T.allDone[1], T.allDone[0], 'big') + '</h2></div>';
        visible.forEach(function (x, vi) {
          var isDone = st.done.indexOf(x.i) >= 0, isCur = cur && x.i === cur.i;
          if (vi) h += '<div class="tl-steparrow" aria-hidden="true">' + ARROW + '</div>';
          if (st.change && st.change.i === x.i && isCur) {
            h += '<div class="tl-change"><div class="tl-chhead">' + ICO.replan + dual(T.changePlan[1], T.changePlan[0]) + '</div><div class="tl-chrow">' +
              cardHTML(st.change.from, { size: 's', state: 'crossed' }) + '<span>→</span>' + cardHTML(x.card, { size: 's', state: 'selected' }) + '</div></div>';
          }
          var i = cardInfo(x.card), lb = labelsFor(i);
          var asCheck = cfg.done !== 'cross' && cfg.done !== 'move';
          h += '<button type="button" class="tl-step' + (isCur ? ' cur' : '') + (isDone ? ' is-' + (asCheck ? 'checked' : 'crossed') : '') + (asCheck ? ' has-box' : '') + (nxt && x.i === nxt.i ? ' nxt' : '') + '" data-step="' + x.i + '">' +
            cardHTML(x.card, { size: isCur ? 'm' : 's', state: isDone ? (asCheck ? '' : 'crossed') : '', labels: 'none' }) +
            '<span class="tl-steptx">' + (isCur ? '<span class="tl-nowpill">' + dual(T.now[1], T.now[0]) + '</span>' : '') + (lb.main ? '<b>' + esc(lb.main) + '</b>' : '') + (lb.sub ? '<small>' + esc(lb.sub) + '</small>' : '') +
            (isCur && x.min ? '<span class="tl-minchip" data-steptimer="' + x.i + '">⏱ ' + esc(L() === 'id' ? x.min + ' menit' : x.min + ' min') + '</span>' : '') + '</span>' +
            (asCheck ? '<span class="tl-tick' + (isDone ? ' on' : '') + '" aria-hidden="true">' + (isDone ? '✓' : '') + '</span>' : '') + '</button>';
        });
        h += '</div>';
        if (cfg.done === 'move' && st.done.length) {
          h += '<div class="tl-donebox"><div>' + A.heart(30) + dual(T.done[1], T.done[0]) + '</div><div class="tl-donecards">' + st.done.map(function (i) { return '<button type="button" class="tl-donecard" data-step="' + i + '">' + cardHTML(st.steps[i].card, { size: 'xs', state: 'done', labels: 'none' }) + '</button>'; }).join('') + '</div></div>';
        }
        h += '</div>';
        el.innerHTML = h;
        wireExit(el);
      }
      el.addEventListener('click', function (e) {
        if (e.target.closest('[data-exit]')) return;
        var tmr = e.target.closest('[data-steptimer]');
        if (tmr) {
          e.stopPropagation();
          var idx = Number(tmr.dataset.steptimer), step = st.steps[idx], nxt = st.steps[idx + 1];
          var snapshot = { done: st.done.slice(), change: st.change, steps: st.steps };
          runTimer(Object.assign({}, D().timer, { minutes: step.min, seconds: 0 }), { next: nxt ? nxt.card : step.card, backLabel: tr('backSched'), onBack: function () { snapshot.done.push(idx); runSched(snapshot); }, onExit: function () { rerender(); } });
          return;
        }
        if (e.target.closest('[data-replan]')) {
          var cur = st.steps.map(function (x, i) { return i; }).filter(function (i) { return st.done.indexOf(i) < 0; })[0];
          if (cur == null) return;
          openPicker({ title: tr('newPlan'), onPick: function (ref) { st.change = { i: cur, from: st.steps[cur].card }; st.steps[cur] = { card: ref, min: 0 }; render(); } });
          return;
        }
        var b = e.target.closest('[data-step]');
        if (b) {
          var i = Number(b.dataset.step);
          /* tap a finished task to go back to it (for a misclick); later ones become to-do again */
          if (st.done.indexOf(i) >= 0) { st.done = st.done.filter(function (k) { return k < i; }); st.change = null; chime('pop'); render(); return; }
          var pend = st.steps.map(function (x, k) { return k; }).filter(function (k) { return st.done.indexOf(k) < 0; });
          /* tap the NEXT task to finish the current one; the last task is finished by tapping itself */
          var adv = pend.length > 1 ? pend[1] : pend[0];
          if (i === adv) { st.done.push(pend[0]); st.change = null; chime(st.done.length === st.steps.length ? 'done' : 'pop'); render(); }
        }
      });
      render();
    }, function () { rerender(); });
  }

  /* ===================== pages ===================== */
  var ROOT = null, ROUTE = 'tools', PAGE = {};
  // extra tools (Breathing Buddy, Feelings, Worry jar) live in tools-calm.js and register here
  var EXT = {}, EXT_ORDER = [];
  function rerender() { if (ROOT && document.body.contains(ROOT)) render(); }
  function go(h) { if (window.LU) LU.go(h); }

  function toolCards() {
    var vis = function (k) { return A.toolArt ? '<div class="tl-mini-art">' + A.toolArt(k) + '</div>' : ''; };
    var t = [['timer', 'timerL', '#DCEBFA', 'tools/timer', vis('timer')],
      ['tokens', 'tokensL', '#FFF1C7', 'tools/tokens', vis('tokens')],
      ['ft', 'ftL', '#DDF2E4', 'tools/first-then', vis('ft')],
      ['sched', 'schedL', '#E9E1F7', 'tools/schedule', vis('sched')]];
    var GRP = { routine: 'grpRoutine', emo: 'grpCalm', talk: 'grpTalk', teach: 'grpTeach' };
    function row(x, grp) {
      var title = x[5] || tr(x[0]), soon = !!x[8];
      return (soon ? '<div class="tl-trow soon">' : '<a class="tl-trow" href="#/' + x[3] + '">') + '<span class="tl-tart" style="background:' + x[2] + '" aria-hidden="true"><span class="tl-tartin">' + x[4] + '</span></span>' +
        '<span class="tl-ttx"><b>' + esc(title) + '</b><small>' + esc(x[6] || tr(x[1])) + '</small></span>' +
        '<span class="tl-tcat ' + grp + '">' + esc(tr(GRP[grp] || 'grpRoutine')) + '</span>' +
        (soon ? '<span class="tl-soon">' + esc(tr('soon')) + '</span></div>' : '<span class="tl-topen">' + esc(tr('open')) + ' <span aria-hidden="true">→</span></span></a>');
    }
    var ext = EXT_ORDER.map(function (r) { var e = EXT[r]; return e.card ? [r, '', e.card.tint, r, e.card.vis(), e.card.title(), e.card.desc(), e.card.grp || 'emo'] : null; }).filter(Boolean);
    var soon = (A.soon || []).map(function (s) { return [s.k, '', s.tint, '', vis(s.k), L() === 'id' ? s.idn : s.en, L() === 'id' ? s.d[1] : s.d[0], s.grp, true]; });
    var all = t.map(function (x) { return x.concat(['', '', 'routine']); }).concat(ext, soon);
    return '<div class="tl-tlist">' + ['routine', 'emo', 'talk', 'teach'].map(function (g) {
      return all.filter(function (x) { return x[7] === g; }).map(function (x) { return row(x, g); }).join('');
    }).join('') + '</div>';
  }

  function pageHub() {
    var p = prof();
    var h = '<div class="tl-page hub">';
    if (p) {
      h += '<h1 class="tl-h1">' + esc(tr('freeTools')) + '</h1><p class="tl-lead">' + esc(tr('hubP')) + '</p>' + toolCards();
    } else {
      h += '<div class="tl-setupcard">' + A.heart(34) + '<h2>' + esc(tr('letsSet')) + '</h2><p>' + esc(tr('letsSetP')) + '</p><button type="button" class="tl-btn primary lg" data-act="startSetup">' + esc(tr('startSetup')) + '</button><span class="tl-sun"></span></div>' +
        '<h2 class="tl-h3">' + esc(tr('orTry')) + '</h2><p class="tl-note2">' + esc(tr('orTryP')) + '</p>' + toolCards();
    }
    if (S.last && S.last.tool) {
      var map = { timer: ['tools/timer', 'timer'], tokens: ['tools/tokens', 'tokens'], ft: ['tools/first-then', 'ft'], sched: ['tools/schedule', 'sched'] };
      var m = map[S.last.tool];
      if (m && ((S.last.tool === 'sched' && activeSched()) || (S.last.tool === 'ft' && D().ft.first) || S.last.tool === 'tokens' || S.last.tool === 'timer')) {
        var sub = S.last.tool === 'sched' ? schedName(activeSched()) : S.last.tool === 'tokens' ? cardLabel(D().tokens.reward) : S.last.tool === 'ft' ? cardLabel(D().ft.first) + ' → ' + cardLabel(D().ft.then[0]) : fmt(timerSecs(D().timer) * 1000);
        var ref = S.last.tool === 'sched' ? (activeSched().steps[0] || {}).card : S.last.tool === 'tokens' ? D().tokens.reward : S.last.tool === 'ft' ? D().ft.first : (D().timer.showNext ? D().timer.next : null);
        // Continue: the tool's picture, its name, what was set up, when, then a clear Open button
        var tint = { timer: '#DCEBFA', tokens: '#FFF1C7', ft: '#DDF2E4', sched: '#E9E1F7' }[S.last.tool];
        h += '<div class="tl-contsec"><h2 class="tl-h3">' + esc(tr('cont')) + '</h2><a class="tl-contcard" href="#/' + m[0] + '">' +
          '<span class="tl-contart" style="background:' + tint + '" aria-hidden="true">' + (A.toolArt ? A.toolArt(S.last.tool) : '') + '</span>' +
          '<span class="tl-conttx"><small>' + esc(tr('lastUsed')) + (S.last.at ? ' · ' + esc(relDate(S.last.at)) : '') + '</small><b>' + esc(tr(m[1])) + '</b><span>' + esc(sub) + '</span></span>' +
          (ref ? '<span class="tl-contref">' + cardHTML(ref, { size: 'xs', labels: 'none' }) + '</span>' : '') +
          '<span class="tl-contbtn">' + esc(tr('open')) + ' <span aria-hidden="true">→</span></span></a></div>';
      }
    }
    h += '</div>';
    return h;
  }

  /* ---------- setup ---------- */
  var SETUP = null;
  function pageSetup(modal) {
    if (!SETUP) SETUP = { step: 1, name: '', color: COLORS[0], photo: null, rewards: DEFAULT_REWARDS.slice(), labels: S.settings.labels || (L() === 'id' ? 'id' : 'en'), kid: 'boy' };
    var st = SETUP, nm = st.name.trim() || (L() === 'id' ? 'anakmu' : 'your child'), ini = esc((st.name.trim()[0] || 'A').toUpperCase());
    if (st.done) {
      return '<div class="tl-page narrow setup done"><div class="tl-allset"><i class="d1"></i><i class="d2"></i><i class="d3"></i><i class="d4"></i>' +
        '<div class="tl-allheart">' + A.heart(170, '#FFC94A') + '<span class="tl-allini" style="background:' + st.color + '">' + (st.photo && PH[st.photo] ? '<img src="' + PH[st.photo] + '" alt="">' : ini) + '</span></div>' +
        '<h1 class="tl-h1">' + esc(tr('allSet')) + '</h1><p class="tl-lead">' + esc(tr('allSetP', st.name.trim() || nm)) + '</p></div>' +
        '<div class="tl-foot"><button type="button" class="tl-btn dark lg block" data-act="setupDone">' + esc(tr('openTools')) + '</button></div></div>';
    }
    var h = '<div class="tl-page narrow setup s' + st.step + '"><div class="tl-sethead"><div class="tl-bars">' + [1, 2, 3, 4].map(function (n) { return '<i class="' + (n <= st.step ? 'on' : '') + '"></i>'; }).join('') + '</div>' +
      '<button type="button" class="tl-iconbtn tl-setupx" data-act="setupClose" aria-label="' + esc(tr('close')) + '">' + ICO.x + '</button></div>' +
      '<span class="tl-stepeye">' + esc(tr('step4', st.step)) + '</span>';
    if (st.step === 1) {
      h += '<h1 class="tl-h1">' + esc(tr('callChild')) + '</h1>' +
        '<div class="tl-center col"><button type="button" class="tl-bigava" data-act="setupPhoto" style="background:' + st.color + '" aria-label="' + esc(tr('addPhoto')) + '">' + (st.photo && PH[st.photo] ? '<img src="' + PH[st.photo] + '" alt="">' : '<span class="tl-sw ini">' + ini + '</span>') + '</button></div>' +
        '<label class="tl-field"><span>' + esc(tr('nickLabel')) + '</span><input id="tlNick" value="' + esc(st.name) + '" maxlength="24" autocomplete="off"></label>' +
        '<div class="tl-row2 photo"><button type="button" class="tl-btn outline" data-act="setupCam">' + ICO.cam + esc(tr('takePhoto')) + '</button><button type="button" class="tl-btn outline" data-act="setupGal">' + ICO.img + esc(tr('fromGallery')) + '</button></div>' +
        '<div class="tl-lab2">' + esc(tr('noPhotoCol')) + '</div><div class="tl-swatches">' + COLORS.map(function (c) { return '<button type="button" class="tl-sw ini' + (st.color === c ? ' on' : '') + '" style="background:' + c + '" data-col="' + c + '">' + ini + '</button>'; }).join('') + '</div>' +
        '<div class="tl-tip quiet">' + A.heart(22) + '<span>' + esc(tr('savedPhone')) + '</span></div>';
    } else if (st.step === 2) {
      h += '<h1 class="tl-h1">' + esc(tr('kidLike', nm)) + '</h1><div class="tl-kidpick big">' +
        ['boy', 'girl'].map(function (g) { return '<button type="button" class="tl-opt' + (st.kid === g ? ' on' : '') + '" data-kid="' + g + '" aria-label="' + esc(tr(g)) + '" aria-pressed="' + (st.kid === g) + '"><span class="tl-kidfig">' + (window.LUArt && LUArt.kid ? LUArt.kid(g) : '') + '</span></button>'; }).join('') +
        '</div><p class="tl-lead">' + esc(tr('kidLikeP')) + '</p>';
    } else if (st.step === 3) {
      var opts = ['lego', 'gelembung', 'ayunan', 'nonton', 'stiker', 'biskuit', 'pelukan', 'mobil-mobilan', 'es-krim', 'bola', 'boneka', 'main-tablet', 'menggambar', 'musik', 'taman', 'puzzle'];
      st.rewards.forEach(function (r) { if (opts.indexOf(r) < 0) opts.push(r); });
      h += '<h1 class="tl-h1">' + esc(tr('whatLove', nm)) + '</h1><p class="tl-lead">' + esc(tr('loveP')) + '</p><div class="tl-grid setuprw">' +
        '<button type="button" class="tl-card tl-addcard" data-act="setupOwn"><span>+</span><small>' + esc(tr('ownPhoto')) + '</small></button>' +
        opts.map(function (r) { return cardHTML(r, { state: st.rewards.indexOf(r) >= 0 ? 'selected' : '', attrs: ' data-rw="' + r + '"', labels: L() === 'id' ? 'id' : 'en' }); }).join('') + '</div>';
    } else {
      h += '<h1 class="tl-h1">' + esc(tr('wordsCards')) + '</h1><div class="tl-labsample">' + cardHTML('makan', { labels: st.labels, size: 'm' }) + '</div><div class="tl-radios">' +
        [['en', 'lEnName', 'lEnEx'], ['id', 'lIdName', 'lIdEx'], ['both', 'lBothName', 'lBothEx'], ['none', 'lNoneName', 'lNoneEx']].map(function (m) {
          return '<button type="button" class="tl-radio' + (st.labels === m[0] ? ' on' : '') + '" data-lab="' + m[0] + '" aria-pressed="' + (st.labels === m[0]) + '"><i></i><b>' + esc(tr(m[1])) + '</b><small>' + esc(tr(m[2])) + '</small></button>';
        }).join('') + '</div>';
    }
    h += '<div class="tl-foot setfoot">' + (st.step > 1 ? '<button type="button" class="tl-btn quiet lg" data-act="setupBack">' + esc(tr('back')) + '</button>' : '') +
      '<button type="button" class="tl-btn primary lg block" data-act="setupNext">' + esc(st.step === 3 ? tr('nPicked', st.rewards.length) : st.step === 4 ? tr('finish') : tr('next')) + '</button></div></div>';
    return h;
  }
  function setupPhoto(cap) {
    var go2 = function (file) {
      openCrop(file, function (data) { var id = uid('p'); photoPut(id, data).then(function () { SETUP.photo = id; setupRender(); }); });
    };
    if (cap === null) return openAddPhoto(function (data) { var id = uid('p'); photoPut(id, data).then(function () { SETUP.photo = id; setupRender(); }); }, { raw: true, noText: true });
    pickFile(cap, go2);
  }
  function setupFinish(skip) {
    var st = SETUP;
    var id = uid('k');
    var name = (st.name || '').trim() || (L() === 'id' ? 'Anak' : 'Child');
    var p = { id: id, name: name, color: st.color, photo: st.photo, rewards: skip ? DEFAULT_REWARDS.slice() : st.rewards.slice(), kid: st.kid };
    var fresh = !S.profiles.length;
    S.profiles.push(p);
    // the first child inherits whatever was set up before profiles existed
    S.data[id] = fresh && S.data['default'] ? S.data['default'] : freshProfileData();
    if (fresh) delete S.data['default'];
    if (p.rewards[0]) S.data[id].tokens.reward = p.rewards[0];
    S.current = id;
    if (!skip) S.settings.labels = st.labels;
    save();
    if (!skip) { SETUP = { done: true, name: name, color: st.color, photo: st.photo }; if (SETUPSH) SETUPSH.el.scrollTop = 0; window.scrollTo(0, 0); return setupRender(true); }
    var modal = !!SETUPSH;
    SETUP = null;
    if (modal) { SETUPSH.close(); refreshAll(); } else go('#/tools');
  }
  var SETUPSH = null, MOUNTING = false;
  function useDefaults() { try { return localStorage.getItem('lu_defaults_ok') === '1'; } catch (e) { return false; } }
  function appMode() { return document.documentElement.classList.contains('lu-app'); }
  function needSetup() { return !S.profiles.length && !useDefaults() && /^tools\/(timer|tokens|first-then|schedule|library|breathe|feelings|worry)$/.test(ROUTE); }
  function openSetupModal() {
    if (SETUPSH) return;
    SETUP = null;
    SETUPSH = sheet('', { full: false, noScrimClose: true, onClose: function () {
      SETUPSH = null; SETUP = null;
      // without a child set up, the tools can't open, so leaving setup goes back to the tools list
      if (!MOUNTING && (ROUTE === 'tools/setup' || needSetup())) go('#/tools');
    } });
    SETUPSH.wrap.classList.add('setupmodal', 'tall');
    SETUPSH.el.addEventListener('click', function (e) { handle(e, SETUPSH ? SETUPSH.el : null); });
    setupRender();
  }
  function setupRender(top) {
    if (!SETUPSH) { PAGE.keepScroll = !top; return render(); }
    var y = SETUPSH.el.scrollTop;
    SETUPSH.set(pageSetup(true));
    SETUPSH.el.scrollTop = top ? 0 : y;
    var nick = SETUPSH.el.querySelector('#tlNick');
    if (nick) nick.oninput = function () { SETUP.name = nick.value; SETUPSH.el.querySelectorAll('.tl-sw.ini').forEach(function (b) { b.textContent = (nick.value.trim()[0] || 'A').toUpperCase(); }); };
  }
  // re-draws the page and the site header (the header shows the current child)
  function refreshAll() { if (window.LU && LU.setLang) LU.setLang(LU.lang); else rerender(); }

  /* digital time picker: tens and ones of the minutes and the seconds, like a digital clock (deltas are in seconds) */
  function timerSecs(c) { return clamp(Math.round((Number(c.minutes) || 0) * 60 + (Number(c.seconds) || 0)), 5, 99 * 60 + 59); }
  function digitalTime(c) {
    var s = timerSecs(c), m = Math.floor(s / 60), sec = s % 60;
    function col(label, up, val, more, less) {
      return '<div class="tl-dcol"><button type="button" class="tl-dbtn" data-act="tdig" data-delta="' + up + '" aria-label="' + esc(more + ' ' + label) + '">▲</button><span class="tl-ddig">' + val + '</span><button type="button" class="tl-dbtn" data-act="tdig" data-delta="' + (-up) + '" aria-label="' + esc(less + ' ' + label) + '">▼</button></div>';
    }
    var mm = [tr('moreMin'), tr('lessMin')], ss = [tr('moreSec'), tr('lessSec')];
    return '<div class="tl-digital" role="group" aria-label="' + esc(tr('time')) + '">' + col('10', 600, Math.floor(m / 10), mm[0], mm[1]) + col('1', 60, m % 10, mm[0], mm[1]) +
      '<span class="tl-dcolon">:</span>' + col('10', 10, Math.floor(sec / 10), ss[0], ss[1]) + col('1', 1, sec % 10, ss[0], ss[1]) + '</div>' +
      '<div class="tl-dlabels"><span>' + esc(tr('min')) + '</span><span>' + esc(tr('secs')) + '</span></div>';
  }

  /* ---------- timer page ---------- */
  function pageTimer() {
    var c = D().timer;
    return '<div class="tl-page narrow">' + topbar(tr('timer'), tr('parentSetup'), { dl: true }) +
      '<div class="tl-previewbox" style="background:#DCEBFA"><div class="tl-pv' + (isFun(c.style) ? ' wide' : '') + '">' + timerSVG(c.style, c.style === 'bar' || isFun(c.style) ? 0.6 : 0.75) + '</div><div><div class="tl-pvtime">' + fmt(timerSecs(c) * 1000) + '</div><small>' + esc(tr('preview')) + '</small></div></div>' +
      '<div class="tl-lab2">' + esc(tr('style')) + '</div><div class="tl-grid three">' + [['circle', 'circle'], ['sand', 'sand'], ['bar', 'bar']].map(function (s) {
        return '<button type="button" class="tl-opt' + (c.style === s[0] ? ' on' : '') + '" data-tstyle="' + s[0] + '"><span class="tl-optvis">' + timerSVG(s[0], 0.6) + '</span><b>' + esc(tr(s[1])) + '</b></button>';
      }).join('') + '</div>' +
      '<div class="tl-lab2 between"><span>' + esc(tr('funTimers')) + '</span><small>' + esc(tr('funTimersD')) + '</small></div><div class="tl-grid three fun">' + [['bunny', 'tBunny'], ['dino', 'tDino'], ['car', 'tCar']].map(function (s) {
        return '<button type="button" class="tl-opt' + (c.style === s[0] ? ' on' : '') + '" data-tstyle="' + s[0] + '"><span class="tl-optvis wide">' + timerSVG(s[0], 0.55) + '</span><b>' + esc(tr(s[1])) + '</b></button>';
      }).join('') + '</div>' +
      '<div class="tl-lab2">' + esc(tr('time')) + '</div>' + digitalTime(c) +
      '<div class="tl-lab2">' + esc(tr('warns')) + '</div><div class="tl-panel">' + row(esc(tr('w2')), esc(tr('w2d')), toggle('w2', c.w2)) + row(esc(tr('w1')), esc(tr('w1d')), toggle('w1', c.w1)) + row(esc(tr('speak')), esc(tr('speakD')), toggle('speak', c.speak)) + '</div>' +
      '<div class="tl-lab2">' + esc(tr('whatsNext')) + '</div><div class="tl-panel">' + row(esc(tr('showNext')), esc(tr('showNextD')), toggle('showNext', c.showNext)) + '</div>' +
      (c.showNext ? '<div class="tl-panel pick">' + (c.next && cardInfo(c.next) ? cardHTML(c.next, { size: 'xs' }) : '<span class="tl-card tl-xs tl-addcard"><span>+</span></span>') + '<div><b>' + esc(c.next ? cardLabel(c.next) : '—') + '</b><small>' + esc(tr('fromLib')) + '</small></div><button type="button" class="tl-link" data-act="tnext">' + esc(tr('change')) + '</button></div>' : '') +
      '<div class="tl-lab2">' + esc(tr('endSig')) + '</div>' + seg('tend', [['chime', tr('chime')], ['vibrate', tr('vibrate')], ['silent', tr('silent')]], c.end) +
      '<div class="tl-foot"><button type="button" class="tl-btn primary lg block" data-act="tstart">' + esc(tr('startChild')) + '</button><small>' + esc(tr('alsoOpens')) + '</small></div></div>';
  }

  /* ---------- token board page ---------- */
  function pageTokens() {
    var c = D().tokens, p = prof();
    var favs = ((p && p.rewards) || DEFAULT_REWARDS).filter(function (r) { return cardInfo(r); });
    return '<div class="tl-page narrow">' + topbar(tr('tokens'), tr('parentSetup'), { dl: true }) +
      '<div class="tl-lab2 between"><span>' + esc(tr('working')) + '</span><button type="button" class="tl-link" data-act="kreward">' + esc(tr('change')) + ' ›</button></div>' +
      '<div class="tl-panel col"><div class="tl-rewardrow">' + (cardInfo(c.reward) ? cardHTML(c.reward, { size: 'm', state: 'selected' }) : '') + '<div><small>' + esc(tr('favs', p ? p.name : (L() === 'id' ? 'anak' : 'Child'))) + '</small><div class="tl-strip">' +
      favs.filter(function (r) { return r !== c.reward; }).slice(0, 4).map(function (r) { return cardHTML(r, { size: 'xs', attrs: ' data-reward="' + r + '"', labels: 'none' }); }).join('') + '</div></div></div></div>' +
      '<div class="tl-lab2">' + esc(tr('nTokens')) + '</div><div class="tl-panel stepper"><button type="button" class="tl-iconbtn" data-act="kminus" aria-label="−">−</button><div><b>' + c.count + '</b><small>' + esc(tr('tokensRange')) + '</small></div><button type="button" class="tl-iconbtn" data-act="kplus" aria-label="+">+</button></div>' +
      '<div class="tl-pips">' + Array.from({ length: 10 }, function (_, i) { return '<i class="' + (i < c.count ? 'on' : '') + '"></i>'; }).join('') + '</div>' +
      '<div class="tl-lab2">' + esc(tr('shape')) + '</div><div class="tl-shapes">' + A.tokenShapes.map(function (s) {
        return '<button type="button" class="tl-shape' + (c.shape === s ? ' on' : '') + '" data-shape="' + s + '">' + A.token(s, true) + '<small>' + esc(tr('star' + s[0].toUpperCase() + s.slice(1))) + '</small></button>';
      }).join('') + '</div>' +
      '<div class="tl-lab2">' + esc(tr('whenFull')) + '</div>' + seg('kfull', [['stars', tr('calmStars')], ['chime', tr('chime')], ['quiet', tr('quiet')]], c.full) +
      '<div class="tl-board-preview">' + Array.from({ length: c.count }, function (_, i) { return '<span class="tl-tok' + (i < c.earned ? ' on' : '') + '">' + A.token(c.shape, i < c.earned) + '</span>'; }).join('') + '</div>' +
      '<div class="tl-foot"><button type="button" class="tl-btn primary lg block" data-act="kstart">' + esc(tr('startChild')) + '</button></div></div>';
  }

  /* ---------- dropdown (schedules and First–Then boards) ---------- */
  var DD = null;
  function miniCards(refs) { return '<span class="tl-ddcards">' + refs.filter(Boolean).slice(0, 4).map(function (x) { return '<span class="tl-ddcard">' + artHTML(x) + '</span>'; }).join('') + '</span>'; }
  function ddButton(kind, label, placeholder) {
    return '<button type="button" class="tl-select' + (placeholder ? ' placeholder' : '') + '" data-act="dd" data-delta="' + kind + '" aria-haspopup="menu" aria-expanded="' + (DD === kind) + '"><b>' + esc(label) + '</b><span class="tl-ddchev' + (DD === kind ? ' up' : '') + '" aria-hidden="true"></span></button>';
  }

  /* ---------- first-then page ---------- */
  function pageFT() {
    var d = D(), c = d.ft, b = activeBoard();
    var ready = b && b.first && b.then[0];
    var h = '<div class="tl-page narrow">' + topbar(tr('ft'), tr('parentSetup'), { dl: !!ready }) +
      '<div class="tl-lab2">' + esc(tr('board')) + '</div><div class="tl-dd"><div class="tl-schedsel">' + ddButton('ft', b ? boardName(b) : tr('boardPick'), !b) +
      (b ? '<button type="button" class="tl-iconbtn" data-act="fmenu" aria-label="More">···</button>' : '') + '</div>';
    if (DD === 'ft') {
      h += '<div class="tl-ddpanel" role="menu"><button type="button" class="tl-ddrow new" data-act="fnew"><span class="tl-ddplus">+</span><span><b>' + esc(tr('newBoard').replace('+ ', '')) + '</b><small>' + esc(tr('newBoardTx')) + '</small></span></button>' +
        (d.boards.length ? '<div class="tl-ddh">' + esc(tr('myBoards')) + '</div>' + d.boards.map(function (x) {
          return '<button type="button" class="tl-ddrow' + (b && x.id === b.id ? ' on' : '') + '" data-board="' + x.id + '">' + miniCards([x.first].concat(x.then)) + '<span><b>' + esc(boardName(x)) + '</b></span>' + (b && x.id === b.id ? '<span class="tl-ddtick">✓</span>' : '') + '</button>';
        }).join('') : '') +
        '<div class="tl-ddh">' + esc(tr('readyMade')) + '</div>' + READY_FT.map(function (r, i) {
          return '<button type="button" class="tl-ddrow" data-ready="' + i + '">' + miniCards(r) + '<span><b>' + esc(cardLabel(r[0]) + ' → ' + cardLabel(r[1])) + '</b></span></button>';
        }).join('') + '</div>';
    }
    h += '</div>';
    if (!b) {
      return h + '<div class="tl-emptypick">' + A.heart(30) + '<p>' + esc(tr('emptyBoardPick')) + '</p><div class="tl-two"><button type="button" class="tl-btn primary" data-act="fnew">' + esc(tr('newBoard')) + '</button><button type="button" class="tl-btn outline" data-act="dd" data-delta="ft">' + esc(tr('chooseReady')) + '</button></div></div></div>';
    }
    var slot = function (ref, act, idx) {
      var small = c.choice && act === 'fthen';
      var attrs = ' data-act="' + act + '"' + (idx != null ? ' data-thenidx="' + idx + '"' : '');
      return ref ? cardHTML(ref, { size: small ? 's' : 'm', attrs: attrs, cls: 'tl-pickable' })
        : '<button type="button" class="tl-card tl-addcard ' + (small ? 'tl-s' : 'tl-m') + '"' + attrs + '><span>+</span><small>' + esc(tr('choosePic')) + '</small></button>';
    };
    h += '<div class="tl-lab2">' + esc(tr('yourBoard')) + '</div><div class="tl-ftset">' +
      '<div class="tl-ftcol"><div class="tl-ftstep"><span class="tl-stepnum">1</span><b>' + esc(tr('first')) + '</b></div><small class="tl-fthelp">' + esc(tr('firstHelp')) + '</small>' + slot(b.first, 'ffirst') +
      (b.first ? '<button type="button" class="tl-link" data-act="ffirst">' + esc(tr('change')) + '</button>' : '') + '</div>' +
      '<div class="tl-ftcol"><div class="tl-ftstep"><span class="tl-stepnum">2</span><b>' + esc(tr('then')) + '</b></div><small class="tl-fthelp">' + esc(c.choice ? tr('thenHelp2') : tr('thenHelp')) + '</small><div class="tl-ftthens">' +
      (c.choice ? [0, 1] : [0]).map(function (i) { return slot(b.then[i], 'fthen', i); }).join('') + '</div>' +
      (b.then[0] && !c.choice ? '<button type="button" class="tl-link" data-act="fthen" data-thenidx="0">' + esc(tr('change')) + '</button>' : '') + '</div></div>' +
      '<p class="tl-autosave">✓ ' + esc(tr('autoSaved')) + '</p>' +
      '<div class="tl-panel">' + row(esc(tr('offerChoice')), esc(tr('offerChoiceD')), toggle('choice', c.choice)) + row(esc(tr('timerBtn')), esc(tr('timerBtnD', c.timerMin)), toggle('timerBtn', c.timerBtn)) +
      (c.timerBtn ? '<div class="tl-row"><div><b>' + esc(tr('time')) + '</b></div><div class="tl-chips">' + [2, 5, 10].map(function (m) { return '<button type="button" class="tl-chip' + (c.timerMin === m ? ' on yellow' : '') + '" data-ftmin="' + m + '">' + m + ' ' + esc(tr('min')) + '</button>'; }).join('') + '</div></div>' : '') + '</div>' +
      '<div class="tl-foot"><button type="button" class="tl-btn primary lg block" data-act="fstart"' + (ready ? '' : ' disabled') + '>' + esc(tr('startChild')) + '</button></div></div>';
    return h;
  }

  /* ---------- schedule page ---------- */
  function pageSched() {
    var d = D(), s = activeSched(), c = d.sched;
    var h = '<div class="tl-page narrow">' + topbar(tr('sched'), tr('parentSetup'), { dl: !!(s && s.steps.length) }) +
      '<div class="tl-lab2">' + esc(tr('schedule')) + '</div><div class="tl-dd"><div class="tl-schedsel">' + ddButton('sched', s ? schedName(s) : tr('schedPick'), !s) +
      (s ? '<button type="button" class="tl-iconbtn" data-act="smenu" aria-label="More">···</button>' : '') + '</div>';
    if (DD === 'sched') {
      h += '<div class="tl-ddpanel" role="menu"><button type="button" class="tl-ddrow new" data-act="snew"><span class="tl-ddplus">+</span><span><b>' + esc(tr('newSched').replace('+ ', '')) + '</b><small>' + esc(tr('newSchedTx')) + '</small></span></button>' +
        (d.schedules.length ? '<div class="tl-ddh">' + esc(tr('mySchedules')) + '</div>' + d.schedules.map(function (x) {
          return '<button type="button" class="tl-ddrow' + (s && x.id === s.id ? ' on' : '') + '" data-sched="' + x.id + '">' + miniCards(x.steps.map(function (y) { return y.card; })) + '<span><b>' + esc(schedName(x)) + '</b><small>' + esc(tr('nSteps', x.steps.length)) + '</small></span>' + (s && x.id === s.id ? '<span class="tl-ddtick">✓</span>' : '') + '</button>';
        }).join('') : '') +
        '<div class="tl-ddh">' + esc(tr('readyEx')) + '</div>' + READY_SCHED.map(function (r, i) {
          return '<button type="button" class="tl-ddrow" data-readys="' + i + '">' + miniCards(r.steps.map(function (y) { return y[0]; })) + '<span><b>' + esc(L() === 'id' ? r.id : r.en) + '</b><small>' + esc(r.steps.map(function (x) { return cardLabel(x[0]); }).join(' → ')) + '</small></span></button>';
        }).join('') + '</div>';
    }
    h += '</div>';
    if (!s) {
      return h + '<div class="tl-emptypick">' + A.heart(30) + '<p>' + esc(tr('emptySchedPick')) + '</p><div class="tl-two"><button type="button" class="tl-btn primary" data-act="snew">' + esc(tr('newSched')) + '</button><button type="button" class="tl-btn outline" data-act="dd" data-delta="sched">' + esc(tr('chooseReady')) + '</button></div></div></div>';
    }
    var nm = s.name ? (L() === 'id' ? s.name.id || s.name.en : s.name.en || s.name.id) : '';
    h += '<label class="tl-field"><span>' + esc(tr('schedName')) + '</span><input id="tlSchedName" value="' + esc(nm) + '" placeholder="' + esc(tr('schedNamePh')) + '" maxlength="40" autocomplete="off"></label>' +
      '<p class="tl-autosave">✓ ' + esc(tr('autoSaved')) + '</p>' +
      '<div class="tl-lab2 between"><span>' + esc(tr('steps')) + '</span></div>' +
      (s.steps.length ? '<div class="tl-steplist">' + s.steps.map(function (x, i) {
        var info = cardInfo(x.card) || {};
        return '<div class="tl-steprow">' + cardHTML(x.card, { size: 'xs', labels: 'none' }) + '<div class="tl-steptx2"><b>' + esc(L() === 'id' ? info.idn || '' : info.en || '') + '</b></div>' +
          '<button type="button" class="tl-minbtn' + (x.min ? ' on' : '') + '" data-smin="' + i + '" aria-label="' + esc(tr('stepTimer')) + '">⏱ ' + (x.min ? esc(x.min + ' ' + tr('min')) : '') + '</button>' +
          '<span class="tl-stepbtns"><button type="button" data-sup="' + i + '" aria-label="' + esc(tr('moveUp')) + '"' + (i === 0 ? ' disabled' : '') + '>↑</button><button type="button" data-sdown="' + i + '" aria-label="' + esc(tr('moveDown')) + '"' + (i === s.steps.length - 1 ? ' disabled' : '') + '>↓</button><button type="button" data-sdel="' + i + '" aria-label="' + esc(tr('remove')) + '">✕</button></span></div>';
      }).join('') + '</div>' : '<p class="tl-note2">' + esc(tr('emptySched')) + '</p>') +
      '<button type="button" class="tl-addstep" data-act="sadd">' + esc(tr('addStep')) + '</button>' +
      '<div class="tl-lab2">' + esc(tr('layout')) + '</div>' + seg('slayout', [['vertical', tr('vertical')], ['horizontal', tr('horizontal')]], c.layout) +
      '<div class="tl-lab2">' + esc(tr('show')) + '</div>' + seg('sshow', [['all', tr('wholeDay')], ['next3', tr('next3')]], c.show) +
      '<div class="tl-lab2">' + esc(tr('whenDone')) + '</div>' + seg('sdone', [['cross', tr('crossOut')], ['move', tr('moveDone')], ['check', tr('checklist')]], c.done === 'fade' ? 'check' : c.done) +
      '<div class="tl-foot"><button type="button" class="tl-btn primary lg block" data-act="sstart"' + (s.steps.length ? '' : ' disabled') + '>' + esc(tr('startChild')) + '</button></div></div>';
    return h;
  }

  /* ---------- library page ---------- */
  var LIB = { tab: 'all', q: '', select: false, sel: [] };
  function pageLibrary() {
    var list;
    if (LIB.q) list = searchCards(LIB.q);
    else if (LIB.tab === 'fav') list = D().favs.filter(function (r) { return cardInfo(r); });
    else if (LIB.tab === 'photos') list = allLibrary().filter(function (r) { var i = cardInfo(r); return i && (i.type === 'photo' || i.type === 'text'); });
    else if (LIB.tab === 'all') list = allLibrary();
    else list = A.CARDS.filter(function (c) { return c.cat === LIB.tab; }).map(function (c) { return c.id; });
    var h = '<div class="tl-page lib">' + topbar(LIB.select ? tr('printCards') : tr('library'), LIB.select ? tr('noBoard') : tr('allTools'), { noProf: LIB.select, backAct: LIB.select ? 'lselexit' : '', back: '#/tools' }) +
      (prof() ? '<div class="tl-kidrow top"><span>' + esc(tr('showAs')) + '</span>' + seg('libkid', [['boy', tr('boy')], ['girl', tr('girl')]], prof().kid || 'boy') + '</div>' : '') +
      '<label class="tl-search">' + (window.LU ? LU.ICON.search : '') + '<input type="search" id="tlLibQ" value="' + esc(LIB.q) + '" placeholder="' + esc(tr('searchCards')) + '"></label>';
    if (!LIB.q) h += '<div class="tl-chips">' + [['all', tr('all')], ['fav', tr('favourites')], ['photos', tr('tabPhotos')]].concat(A.CATS.map(function (c) { return [c.id, L() === 'id' ? c.idn : c.en]; })).map(function (c) {
      return '<button type="button" class="tl-chip' + (LIB.tab === c[0] ? ' on' : '') + '" data-ltab="' + c[0] + '">' + esc(c[1]) + '</button>';
    }).join('') + '</div>';
    else h += '<p class="tl-note2">' + tr('matches', list.length, LIB.q) + '</p>';
    if (list.length) {
      h += '<div class="tl-grid lib">' + list.map(function (r) {
        var on = LIB.sel.indexOf(r) >= 0;
        return cardHTML(r, { state: LIB.select && on ? 'selected' : '', fav: !LIB.select && D().favs.indexOf(r) >= 0, attrs: ' data-lcard="' + r + '"', cls: LIB.select ? 'selectable' + (on ? ' picked' : '') : '' });
      }).join('') + '</div>';
    } else if (LIB.q) {
      h += '<div class="tl-empty"><div class="tl-emptyboxes"><i></i><i></i><i></i></div><b>' + esc(tr('noCardFor', LIB.q)) + '</b><p>' + esc(tr('makeOne')) + '</p><div class="tl-two"><button type="button" class="tl-btn outline lg" data-act="lphoto">' + esc(tr('photo')) + '</button><button type="button" class="tl-btn outline lg" data-act="ltext">' + esc(tr('textCard')) + '</button></div>' +
        '<a class="tl-reqcard" href="#/request?type=cards&about=' + encodeURIComponent(LIB.q) + '">' + A.heart(30) + '<span><b>' + esc(tr('wantIllus')) + '</b><small>' + esc(tr('wantIllusP')) + '</small><u>' + esc(tr('reqCards')) + '</u></span></a></div>';
    } else if (LIB.tab === 'photos') {
      h += '<div class="tl-empty"><div class="tl-photoph"></div><b>' + esc(tr('noPhotos')) + '</b><p>' + esc(tr('noPhotosP')) + '</p><div class="tl-two"><button type="button" class="tl-btn primary lg" data-act="lcam">' + esc(tr('camera')) + '</button><button type="button" class="tl-btn outline lg" data-act="lgal">' + esc(tr('gallery')) + '</button></div><small>' + esc(tr('photosNever')) + '</small></div>';
    } else {
      h += '<div class="tl-empty"><p>' + esc(L() === 'id' ? 'Belum ada kartu favorit. Buka kartu mana saja dan tambahkan ke favorit.' : 'No favourites yet. Open any card and add it to favourites.') + '</p></div>';
    }
    if (LIB.select) {
      h += '<div class="tl-stickyfoot"><div class="tl-selrow"><span>' + tr('selected', LIB.sel.length) + '</span><button type="button" class="tl-link" data-act="lselall">' + esc(tr('selectAll')) + '</button></div><button type="button" class="tl-btn primary lg block" data-act="lprintgo"' + (LIB.sel.length ? '' : ' disabled') + '>' + esc(tr('nextPrint')) + '</button></div>';
    } else {
      h += '<div class="tl-stickyfoot three"><button type="button" class="tl-btn outline" data-act="lphoto">' + esc(tr('photo')) + '</button><button type="button" class="tl-btn outline" data-act="ltext">' + esc(tr('textCard')) + '</button><button type="button" class="tl-btn dark" data-act="lprint">' + esc(tr('printCards')) + '</button></div>';
    }
    return h + '</div>';
  }
  function cardOptions(ref) {
    var i = cardInfo(ref); if (!i) return;
    var fav = D().favs.indexOf(ref) >= 0;
    var a = A.get(ref);
    var catName = (A.CATS.filter(function (c) { return c.id === i.cat; })[0] || {});
    var sh = sheet('<div class="tl-optshead">' + cardHTML(ref, { size: 's' }) + '<div><h2 class="tl-h2">' + esc(i.idn) + '</h2><small>' + esc(i.en + ' · ' + (i.type === 'illus' ? 'Little Us' : (L() === 'id' ? 'Foto' : 'Photo')) + ' · ' + (L() === 'id' ? catName.idn : catName.en)) + '</small></div></div>' +
      '<div class="tl-panel">' +
      '<button type="button" class="tl-row act" data-o="label"><div><b>' + esc(tr('editLabel')) + '</b><small>' + esc(tr('editLabelD')) + '</small></div><span>›</span></button>' +
      '<button type="button" class="tl-row act" data-o="fav"><div><b>' + esc(fav ? tr('removeFav') : tr('addFav')) + '</b><small>' + esc(tr('favD')) + '</small></div><span class="tl-hearticon' + (fav ? ' on' : '') + '">♥</span></button>' +
      (a && a.kid ? '<div class="tl-row col"><b>' + esc(tr('thisCardOnly')) + '</b><div class="tl-grid two">' + ['boy', 'girl'].map(function (g) { return '<button type="button" class="tl-opt' + (kidFor(ref) === g ? ' on' : '') + '" data-o="kid" data-g="' + g + '">' + cardHTML(ref, { gender: g, size: 'xs', labels: 'none' }) + '<b>' + esc(tr(g)) + '</b></button>'; }).join('') + '</div></div>' : '') +
      '<button type="button" class="tl-row act" data-o="print"><div><b>' + esc(tr('printCard')) + '</b></div><span>›</span></button>' +
      (isCustom(ref) ? '<button type="button" class="tl-row act danger" data-o="del"><div><b>' + esc(tr('delCard')) + '</b></div><span>✕</span></button>' : '') + '</div>');
    sh.el.onclick = function (e) {
      var b = e.target.closest('[data-o]'); if (!b) return;
      var o = b.dataset.o;
      if (o === 'label') { sh.close(); return openEditLabel(ref, rerender); }
      if (o === 'fav') { var f = D().favs; if (fav) f.splice(f.indexOf(ref), 1); else f.unshift(ref); save(); sh.close(); return rerender(); }
      if (o === 'kid') { D().kidCards[ref] = b.dataset.g; save(); sh.close(); return rerender(); }
      if (o === 'print') { sh.close(); return openDownload('cards', { cards: [ref] }); }
      if (o === 'del') {
        if (!confirmInline(b)) return;
        var c = S.custom[ref]; if (c && c.photo) photoDel(c.photo);
        delete S.custom[ref];
        Object.keys(S.data).forEach(function (k) { var d = S.data[k]; d.favs = d.favs.filter(function (r) { return r !== ref; }); });
        S.recent = S.recent.filter(function (r) { return r !== ref; });
        save(); sh.close(); rerender();
      }
    };
  }
  function confirmInline(btn) {
    if (btn.dataset.sure) return true;
    btn.dataset.sure = '1';
    var b = btn.querySelector('b'); if (b) b.textContent = tr('confirmDel');
    return false;
  }

  /* ---------- settings page ---------- */
  function pageSettings() {
    var s = S.settings, p = prof();
    var used = 0; try { used = (localStorage.getItem(KEY) || '').length; Object.keys(PH).forEach(function (k) { used += (PH[k] || '').length; }); } catch (e) {}
    var mb = (used / 1048576).toFixed(1).replace('.', L() === 'id' ? ',' : '.');
    return '<div class="tl-page narrow">' + topbar(tr('settings'), '', { noProf: true }) + (window.LUAcc ? LUAcc.settingsCard() : '') +
      '<div class="tl-lab2">' + esc(tr('language')) + '</div>' + seg('slang', [['id', 'Bahasa Indonesia'], ['en', 'English']], L()) +
      '<div class="tl-lab2">' + esc(tr('cardLabels')) + '</div>' + seg('slabels', [['id', 'ID'], ['en', 'EN'], ['both', tr('lBoth')], ['none', L() === 'id' ? 'Tanpa' : 'None']], s.labels) +
      (p ? '<div class="tl-lab2 between"><span>' + esc(tr('childInCards')) + '</span><small>' + esc(tr('forX', p.name)) + '</small></div>' + '<div class="tl-kidpick">' + ['boy', 'girl'].map(function (g) { var on = (p.kid || 'boy') === g; return '<button type="button" class="tl-opt' + (on ? ' on' : '') + '" data-seg="skid" data-v="' + g + '" aria-label="' + esc(tr(g)) + '" aria-pressed="' + on + '"><span class="tl-kidfig">' + (A.kid ? A.kid(g) : '') + '</span></button>'; }).join('') + '</div>' : '') +
      '<div class="tl-lab2">' + esc(tr('sound')) + '</div><div class="tl-panel">' + row(esc(tr('sounds')), esc(tr('soundsD')), toggle('sound', s.sound)) +
      '<div class="tl-row col"><b>' + esc(tr('volume')) + '</b><div class="tl-vol"><small>' + esc(tr('soft')) + '</small><input type="range" min="0" max="1" step="0.05" value="' + s.volume + '" id="tlVol" class="tl-range light"><small>' + esc(tr('loud')) + '</small></div></div></div>' +
      '<div class="tl-lab2">' + esc(tr('comfort')) + '</div><div class="tl-panel">' + row(esc(tr('reduce')), esc(tr('reduceD')), toggle('reduce', s.reduce)) + '</div>' +
      '<div class="tl-lab2" id="profiles">' + esc(tr('childData')) + '</div><div class="tl-panel">' +
      S.profiles.map(function (pp) { return '<div class="tl-row">' + avatar(pp, 34) + '<div style="flex:1"><b>' + esc(pp.name) + '</b><small>' + esc(tr('nRewards', (pp.rewards || []).length)) + '</small></div><button type="button" class="tl-link" data-act="pedit" data-pid="' + pp.id + '">' + esc(tr('edit')) + '</button>' + delBtn(pp) + '</div>'; }).join('') +
      '<a class="tl-row act" href="#/tools/setup?new=1"><div><b>' + esc(tr('addChild')) + '</b></div><span>+</span></a>' +
      '<a class="tl-row act" href="#/tools/backup"><div><b>' + esc(tr('backup')) + '</b><small>' + esc(s.lastBackup ? tr('lastSaved', relDate(s.lastBackup)) : tr('never')) + '</small></div><span>›</span></a>' +
      '<div class="tl-row"><div><b>' + esc(tr('storage')) + '</b><small>' + mb + ' MB · ' + esc(tr('worksOff')) + '</small></div><span class="tl-badge">' + esc(tr('ready')) + '</span></div></div></div>';
  }
  function relDate(t) {
    var d = Math.floor((Date.now() - t) / 86400000);
    if (L() === 'id') return d <= 0 ? 'hari ini' : d === 1 ? 'kemarin' : d + ' hari lalu';
    return d <= 0 ? 'today' : d === 1 ? 'yesterday' : d + ' days ago';
  }
  function editProfile(pid) {
    var p = S.profiles.filter(function (x) { return x.id === pid; })[0]; if (!p) return;
    var sh = sheet('<h2 class="tl-h2">' + esc(tr('edit')) + '</h2><label class="tl-field"><span>' + esc(tr('name')) + '</span><input id="tlPName" value="' + esc(p.name) + '" maxlength="24"></label>' +
      '<div class="tl-swatches">' + COLORS.map(function (c) { return '<button type="button" class="tl-sw' + (p.color === c ? ' on' : '') + '" style="background:' + c + '" data-col="' + c + '"></button>'; }).join('') + '</div>' +
      '<div class="tl-foot two"><button type="button" class="tl-btn quiet" data-d>' + esc(tr('deleteChild')) + '</button><button type="button" class="tl-btn primary" data-s>' + esc(tr('save')) + '</button></div>');
    sh.el.onclick = function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (b.dataset.col) { p.color = b.dataset.col; sh.el.querySelectorAll('.tl-sw').forEach(function (x) { x.classList.toggle('on', x === b); }); return; }
      if (b.hasAttribute('data-s')) { p.name = (sh.el.querySelector('#tlPName').value || '').trim() || p.name; save(); sh.close(); return refreshAll(); }
      if (b.hasAttribute('data-d')) {
        if (!b.dataset.sure) { b.dataset.sure = '1'; b.textContent = tr('confirmDel'); return; }
        deleteProfile(pid); sh.close(); refreshAll();
      }
    };
  }
  // removing a child: a trash button that asks once ("Delete?") before it removes the profile, its tools and photo
  function delBtn(p) { return '<button type="button" class="tl-delp" data-delp="' + p.id + '" aria-label="' + esc(tr('deleteChild') + ': ' + p.name) + '" title="' + esc(tr('deleteChild')) + '"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3"/></svg><span>' + esc(tr('delQ')) + '</span></button>'; }
  function delConfirm(b) {
    if (b.classList.contains('sure')) return true;
    document.querySelectorAll('.tl-delp.sure').forEach(function (x) { x.classList.remove('sure'); });
    b.classList.add('sure'); b.setAttribute('aria-label', tr('confirmDel'));
    setTimeout(function () { b.classList.remove('sure'); }, 4000);
    return false;
  }
  function deleteProfile(pid) {
    var p = S.profiles.filter(function (x) { return x.id === pid; })[0]; if (!p) return;
    S.profiles = S.profiles.filter(function (x) { return x.id !== pid; }); delete S.data[pid];
    if (p.photo) photoDel(p.photo);
    if (S.current === pid) S.current = S.profiles[0] ? S.profiles[0].id : 'default';
    if (!S.data[S.current]) S.data[S.current] = freshProfileData();
    save();
  }

  /* ---------- backup page ---------- */
  var RESTORE = null;
  function pageBackup() {
    if (RESTORE) {
      var b = RESTORE.data, kids = (b.state.profiles || []);
      var cards = Object.keys(b.state.custom || {}).length, photos = Object.keys(b.photos || {}).length;
      var sch = []; Object.keys(b.state.data || {}).forEach(function (k) { (b.state.data[k].schedules || []).forEach(function (s) { sch.push(schedName(s)); }); });
      return '<div class="tl-page narrow">' + '<div class="tl-top"><button type="button" class="tl-iconbtn" data-act="rcancel">' + ICO.back + '</button><div class="tl-toptx"><h1>' + esc(tr('restore')) + '</h1><small>' + esc(RESTORE.name) + '</small></div></div>' +
        '<div class="tl-panel col"><code class="tl-file">' + esc(RESTORE.name) + '</code>' +
        kids.map(function (k) { return '<div class="tl-row">' + avatar(k, 34) + '<div><b>' + esc(k.name) + '</b><small>' + esc(tr('profileWith', (k.rewards || []).length)) + '</small></div></div>'; }).join('') +
        '<div class="tl-row"><span class="tl-num">' + cards + '</span><div><b>' + esc(L() === 'id' ? 'Kartu' : 'Cards') + '</b><small>' + esc(tr('photosN', photos)) + '</small></div></div>' +
        '<div class="tl-row"><span class="tl-num">' + sch.length + '</span><div><b>' + esc(L() === 'id' ? 'Jadwal' : 'Schedules') + '</b><small>' + esc(sch.slice(0, 3).join(', ')) + '</small></div></div></div>' +
        '<div class="tl-lab2">' + esc(tr('howAdd')) + '</div>' +
        ['add', 'replace'].map(function (m) { return '<button type="button" class="tl-radio' + (RESTORE.mode === m ? ' on' : '') + '" data-rmode="' + m + '"><i></i><span><b>' + esc(tr(m === 'add' ? 'addTo' : 'replaceAll')) + '</b><small>' + esc(tr(m === 'add' ? 'addToD' : 'replaceAllD')) + '</small></span></button>'; }).join('') +
        '<div class="tl-foot"><button type="button" class="tl-btn primary lg block" data-act="rgo">' + esc(tr('restoreBtn')) + '</button></div></div>';
    }
    var kids = S.profiles.length, cards = Object.keys(S.custom).length, photos = Object.keys(S.custom).filter(function (k) { return S.custom[k].type === 'photo'; }).length;
    var sch = 0; Object.keys(S.data).forEach(function (k) { sch += (S.data[k].schedules || []).length; });
    return '<div class="tl-page narrow">' + topbar(tr('backupShare'), tr('settings'), { noProf: true, back: '#/tools/settings' }) + '<p class="tl-lead">' + esc(tr('backupP')) + '</p>' +
      '<div class="tl-bkcard"><h3>' + esc(tr('saveBackup')) + '</h3><div class="tl-file2"><code>' + esc(backupName()) + '</code><small>' + esc([tr('childrenN', kids), tr('cardsN', cards), tr('photosN', photos), tr('nScheds', sch)].join(' · ')) + '</small></div>' +
      '<button type="button" class="tl-btn primary lg block" data-act="bsave">' + esc(tr('saveBackupFile')) + '</button><small>' + esc(tr('thenShare')) + '</small></div>' +
      '<div class="tl-panel col pad"><h3>' + esc(tr('restore')) + '</h3><p class="tl-p">' + esc(tr('restoreP')) + '</p><button type="button" class="tl-btn outline lg block" data-act="bfile">' + esc(tr('chooseFile')) + '</button></div>' +
      '<div class="tl-lab2 between"><span>' + esc(tr('lastBackup')) + '</span><b>' + esc(S.settings.lastBackup ? relDate(S.settings.lastBackup) : tr('never')) + '</b></div></div>';
  }
  function backupName() {
    var d = new Date(), m = ['jan', 'feb', 'mar', 'apr', 'mei', 'jun', 'jul', 'agu', 'sep', 'okt', 'nov', 'des'][d.getMonth()];
    return 'littleus-backup-' + d.getDate() + m + d.getFullYear() + '.lu';
  }
  function doBackup() {
    var photos = {};
    Object.keys(S.custom).forEach(function (k) { var c = S.custom[k]; if (c.photo && PH[c.photo]) photos[c.photo] = PH[c.photo]; });
    S.profiles.forEach(function (p) { if (p.photo && PH[p.photo]) photos[p.photo] = PH[p.photo]; });
    var blob = new Blob([JSON.stringify({ app: 'Little Us', kind: 'tools-backup', v: 1, at: new Date().toISOString(), state: S, photos: photos })], { type: 'application/json' });
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = backupName(); document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
    S.settings.lastBackup = Date.now(); save(); rerender();
  }
  function readBackup() {
    var f = document.createElement('input'); f.type = 'file'; f.accept = '.lu,application/json'; f.style.display = 'none'; document.body.appendChild(f);
    f.onchange = function () {
      var file = f.files && f.files[0]; f.remove(); if (!file) return;
      var r = new FileReader();
      r.onload = function () {
        try {
          var data = JSON.parse(r.result);
          if (!data || data.kind !== 'tools-backup' || !data.state || data.state.v !== 1) throw new Error('bad');
          RESTORE = { name: file.name, data: data, mode: 'add' }; rerender();
        } catch (e) { toast(tr('badFile')); }
      };
      r.readAsText(file);
    };
    f.click();
  }
  function applyRestore() {
    var b = RESTORE.data, inc = b.state;
    Object.keys(b.photos || {}).forEach(function (k) { photoPut(k, b.photos[k]); });
    if (RESTORE.mode === 'replace') { S = inc; }
    else {
      inc.profiles.forEach(function (p) {
        if (S.profiles.some(function (x) { return x.id === p.id; })) return;
        S.profiles.push(p); S.data[p.id] = inc.data[p.id] || freshProfileData();
      });
      Object.keys(inc.custom || {}).forEach(function (k) { S.custom[k] = inc.custom[k]; });
      Object.keys(inc.labels || {}).forEach(function (k) { if (!S.labels[k]) S.labels[k] = inc.labels[k]; });
      if (S.current === 'default' && S.profiles[0]) { if (S.data['default']) delete S.data['default']; S.current = S.profiles[0].id; }
    }
    RESTORE = null; save(); toast(tr('restored')); go('#/tools');
  }

  /* ===================== downloads (lazy) ===================== */
  function openDownload(kind, ctx) {
    var go2 = function () { window.LUPrint.open(kind, ctx || {}, API); };
    if (window.LUPrint) return go2();
    var s = document.createElement('script'); s.src = '/tools-print.js?v=' + VERSION; s.onload = go2;
    s.onerror = function () { toast(L() === 'id' ? 'Gagal memuat. Periksa koneksi.' : "Couldn't load. Check your connection."); };
    document.head.appendChild(s);
  }

  /* ===================== render + events ===================== */
  function render() {
    var r = ROUTE;
    fixLocked();
    var html = EXT[r] ? EXT[r].page() : r === 'tools/timer' ? pageTimer() : r === 'tools/tokens' ? pageTokens() : r === 'tools/first-then' ? pageFT() : r === 'tools/schedule' ? pageSched() :
      r === 'tools/library' ? pageLibrary() : r === 'tools/settings' ? pageSettings() : r === 'tools/setup' ? (appMode() ? pageSetup(false) : pageHub()) : r === 'tools/backup' ? pageBackup() : pageHub();
    var y = window.scrollY;
    ROOT.innerHTML = html;
    if (PAGE.keepScroll) window.scrollTo(0, y);
    PAGE.keepScroll = false;
    document.documentElement.classList.toggle('tl-still', !!S.settings.reduce);
    var q = ROOT.querySelector('#tlLibQ');
    if (q) q.oninput = LU.debounce(function () { LIB.q = q.value; PAGE.keepScroll = true; render(); var n = ROOT.querySelector('#tlLibQ'); n.focus(); n.setSelectionRange(n.value.length, n.value.length); }, 180);
    var vol = ROOT.querySelector('#tlVol');
    if (vol) vol.onchange = function () { S.settings.volume = Number(vol.value); save(); chime('pop'); };
    var snm = ROOT.querySelector('#tlSchedName');
    if (snm) snm.oninput = function () {
      var sc = activeSched(); if (!sc) return;
      sc.name = { id: snm.value.trim(), en: snm.value.trim() }; save();
      var lb = ROOT.querySelector('[data-act=dd][data-delta=sched] b'); if (lb) lb.textContent = schedName(sc);
    };
    var nick = ROOT.querySelector('#tlNick');
    if (nick) nick.oninput = function () { SETUP.name = nick.value; ROOT.querySelectorAll('.tl-sw.ini').forEach(function (b) { b.textContent = (nick.value.trim()[0] || 'A').toUpperCase(); }); };
  }
  function keep() { PAGE.keepScroll = true; save(); render(); }

  function onClick(e) { handle(e, ROOT); }
  function handle(e, scope) {
    var b = e.target.closest('button,[data-act],[data-lcard],[data-reward],[data-rw]');
    if (DD && scope === ROOT && !e.target.closest('.tl-ddpanel') && !(b && b.dataset.act === 'dd')) { DD = null; PAGE.keepScroll = true; render(); return; }
    if (!b || !scope || !scope.contains(b)) return;
    if (b.dataset.delp) { if (delConfirm(b)) { deleteProfile(b.dataset.delp); refreshAll(); } return; }
    var d = D(), ds = b.dataset, act = ds.act;
    // shared
    if (act === 'profiles') return openProfiles();
    if (EXT[ROUTE] && EXT[ROUTE].click && EXT[ROUTE].click(b, e) !== false) return;
    if (act === 'download') {
      var kind = { 'tools/timer': 'timer', 'tools/tokens': 'tokens', 'tools/first-then': 'ft', 'tools/schedule': 'sched' }[ROUTE];
      return openDownload(kind, {});
    }
    // segmented controls
    if (ds.seg) {
      var v = ds.v;
      switch (ds.seg) {
        case 'tend': d.timer.end = v; break;
        case 'kfull': d.tokens.full = v; break;
        case 'slayout': d.sched.layout = v; break;
        case 'sshow': d.sched.show = v; break;
        case 'sdone': d.sched.done = v; break;
        case 'slabels': S.settings.labels = v; break;
        case 'sexit': S.settings.exit = v; break;
        case 'skid': case 'libkid': if (prof()) prof().kid = v; break;
        case 'slang': save(); return LU.setLang(v);
      }
      return keep();
    }
    if (ds.tog) {
      var on = b.getAttribute('aria-checked') !== 'true';
      if (ROUTE === 'tools/timer') d.timer[ds.tog] = on;
      else if (ROUTE === 'tools/first-then') d.ft[ds.tog] = on;
      else if (ROUTE === 'tools/settings') { S.settings[ds.tog] = on; if (ds.tog === 'sound' && on) chime('pop'); }
      if (ds.tog === 'choice' && on && d.ft.then.length < 2) d.ft.then.push(d.ft.then[0] === 'gelembung' ? 'lego' : 'gelembung');
      return keep();
    }
    // setup
    if (act === 'startSetup') return openSetupModal();
    if (ROUTE === 'tools/setup' || scope !== ROOT) {
      if (act === 'setupClose') { if (SETUPSH) SETUPSH.close(); else { SETUP = null; go('#/tools'); } return; }
      if (act === 'setupDone') { SETUP = null; if (SETUPSH) { SETUPSH.close(); refreshAll(); } else go('#/tools'); return; }
      if (act === 'setupBack') { if (SETUP.step > 1) { SETUP.step--; window.scrollTo(0, 0); return setupRender(true); } if (scope !== ROOT) return; SETUP = null; return go('#/tools'); }
      if (act === 'setupNext' && SETUP.step === 1 && !(SETUP.name || '').trim()) {
        toast(tr('needName'));
        var nk = document.getElementById('tlNick'); if (nk) { nk.focus(); nk.classList.add('tl-needed'); }
        return;
      }
      if (act === 'setupNext') { if (SETUP.step < 4) { SETUP.step++; window.scrollTo(0, 0); return setupRender(true); } return setupFinish(false); }
      if (act === 'setupPhoto') return setupPhoto(null);
      if (act === 'setupCam') return setupPhoto(true);
      if (act === 'setupGal') return setupPhoto(false);
      if (act === 'setupOwn') return openAddPhoto(function (ref) { SETUP.rewards.push(ref); setupRender(); });
      if (ds.col) { SETUP.color = ds.col; return setupRender(); }
      if (ds.rw) { var i = SETUP.rewards.indexOf(ds.rw); if (i >= 0) SETUP.rewards.splice(i, 1); else SETUP.rewards.push(ds.rw); return setupRender(); }
      if (ds.lab) { SETUP.labels = ds.lab; return setupRender(); }
      if (ds.kid) { SETUP.kid = ds.kid; return setupRender(); }
      if (scope !== ROOT) return;
    }
    // timer
    if (ds.tstyle) { d.timer.style = ds.tstyle; return keep(); }
    if (ds.tmin) { d.timer.minutes = Number(ds.tmin); return keep(); }
    if (act === 'tdig') { var ns = clamp(timerSecs(d.timer) + Number(ds.delta), 5, 99 * 60 + 59); d.timer.minutes = Math.floor(ns / 60); d.timer.seconds = ns % 60; return keep(); }
    if (act === 'tcustom') {
      var sh = sheet('<h2 class="tl-h2">' + esc(tr('customMin')) + '</h2><div class="tl-panel stepper"><button type="button" class="tl-iconbtn" data-m="-1">−</button><div><b id="tlCm">' + d.timer.minutes + '</b><small>' + esc(tr('minutes')) + '</small></div><button type="button" class="tl-iconbtn" data-m="1">+</button></div><div class="tl-chips wrap" style="justify-content:center">' + [3, 15, 20, 30, 45, 60].map(function (m) { return '<button type="button" class="tl-chip big" data-set="' + m + '">' + m + '</button>'; }).join('') + '</div><button type="button" class="tl-btn primary lg block" data-ok>' + esc(tr('save')) + '</button>');
      var cm = d.timer.minutes;
      sh.el.onclick = function (ev) {
        var x = ev.target.closest('button'); if (!x) return;
        if (x.dataset.m) cm = clamp(cm + Number(x.dataset.m), 1, 120);
        if (x.dataset.set) cm = Number(x.dataset.set);
        sh.el.querySelector('#tlCm').textContent = cm;
        if (x.hasAttribute('data-ok')) { d.timer.minutes = cm; sh.close(); keep(); }
      };
      return;
    }
    if (act === 'tnext') return openPicker({ current: d.timer.next, onPick: function (r) { d.timer.next = r; keep(); } });
    if (act === 'tstart') { setLast('timer'); return runTimer(d.timer, { next: d.timer.showNext ? d.timer.next : null, onExit: rerender }); }
    // tokens
    if (act === 'kreward') return openPicker({ title: tr('chooseReward'), rewards: true, current: d.tokens.reward, onPick: function (r) { d.tokens.reward = r; d.tokens.earned = 0; var p = prof(); if (p && p.rewards.indexOf(r) < 0) p.rewards.push(r); keep(); } });
    if (ds.reward) { d.tokens.reward = ds.reward; d.tokens.earned = 0; return keep(); }
    if (act === 'kminus' || act === 'kplus') { d.tokens.count = clamp(d.tokens.count + (act === 'kplus' ? 1 : -1), 1, 10); d.tokens.earned = Math.min(d.tokens.earned, d.tokens.count); return keep(); }
    if (ds.shape) { d.tokens.shape = ds.shape; return keep(); }
    if (act === 'kstart') { setLast('tokens'); if (d.tokens.earned >= d.tokens.count) d.tokens.earned = 0; return runTokens(); }
    // dropdowns
    // the dropdown buttons name their menu in data-delta ('sched' or 'ft')
    if (act === 'dd') { var kind = ds.dd || ds.delta; DD = DD === kind ? null : kind; PAGE.keepScroll = true; return render(); }
    // first-then
    if (act === 'fnew') { var nb = { id: uid('b'), first: null, then: [] }; d.boards.push(nb); d.ft.boardId = nb.id; DD = null; syncFT(); return keep(); }
    if (ds.board) { d.ft.boardId = ds.board; DD = null; syncFT(); return keep(); }
    if (ds.ready) {
      var r = READY_FT[Number(ds.ready)];
      var ex = d.boards.filter(function (x) { return x.first === r[0] && x.then[0] === r[1]; })[0];
      if (!ex) { ex = { id: uid('b'), first: r[0], then: [r[1]] }; d.boards.push(ex); }
      d.ft.boardId = ex.id; DD = null; syncFT(); return keep();
    }
    if (act === 'fmenu') return boardMenu();
    var fb = ROUTE === 'tools/first-then' ? activeBoard() : null;
    if (act === 'ffirst' && fb) return openPicker({ current: fb.first, onPick: function (x) { fb.first = x; syncFT(); keep(); } });
    if (act === 'fthen' && fb) {
      var idx = Number(ds.thenidx || 0);
      return openPicker({ title: tr('chooseReward'), rewards: true, current: fb.then[idx], onPick: function (x) { fb.then[idx] = x; for (var q = 0; q < fb.then.length; q++) if (!fb.then[q]) fb.then[q] = x; syncFT(); keep(); } });
    }
    if (ds.ftmin) { d.ft.timerMin = Number(ds.ftmin); return keep(); }
    if (act === 'fstart') { syncFT(); setLast('ft'); return runFT(); }
    // schedule
    var s = ROUTE === 'tools/schedule' ? activeSched() : null;
    if (act === 'lselexit') { LIB.select = false; LIB.sel = []; window.scrollTo(0, 0); return render(); }
    if (ds.sched) { d.active = ds.sched; DD = null; save(); return render(); }
    if (ds.readys) {
      var rs = READY_SCHED[Number(ds.readys)];
      var exs = d.schedules.filter(function (x) { return x.from === rs.key && JSON.stringify(x.steps.map(function (y) { return [y.card, y.min]; })) === JSON.stringify(rs.steps.map(function (y) { return [y[0], y[1] || 0]; })); })[0];
      if (!exs) { exs = schedFromReady(rs); d.schedules.push(exs); }
      d.active = exs.id; DD = null; save(); return render();
    }
    if (act === 'snew') {
      var n2 = { id: uid('s'), name: { id: '', en: '' }, steps: [], used: 0 }; d.schedules.push(n2); d.active = n2.id; DD = null; save(); render();
      var ni = ROOT.querySelector('#tlSchedName'); if (ni) ni.focus(); return;
    }
    if (act === 'smenu') return schedMenu(s);
    if (!s && /^s/.test(act || '')) return;
    if (act === 'sadd') return openPicker({ multi: true, title: tr('addSteps'), onPickMany: function (xs) { xs.forEach(function (x) { s.steps.push({ card: x, min: 0 }); }); keep(); } });
    if (ds.sup) { var a1 = Number(ds.sup); s.steps.splice(a1 - 1, 0, s.steps.splice(a1, 1)[0]); return keep(); }
    if (ds.sdown) { var a2 = Number(ds.sdown); s.steps.splice(a2 + 1, 0, s.steps.splice(a2, 1)[0]); return keep(); }
    if (ds.sdel) { s.steps.splice(Number(ds.sdel), 1); return keep(); }
    if (ds.smin) {
      var si = Number(ds.smin), stp = s.steps[si];
      var sh2 = sheet('<h2 class="tl-h2">' + esc(tr('stepTimer')) + '</h2><p class="tl-p">' + esc(cardLabel(stp.card)) + '</p><div class="tl-chips wrap">' + [0, 2, 5, 10, 15, 20, 30].map(function (m) { return '<button type="button" class="tl-chip big' + (stp.min === m ? ' on yellow' : '') + '" data-mm="' + m + '">' + (m ? m + ' ' + esc(tr('min')) : esc(tr('noTimer'))) + '</button>'; }).join('') + '</div>');
      sh2.el.onclick = function (ev) { var x = ev.target.closest('[data-mm]'); if (!x) return; stp.min = Number(x.dataset.mm); sh2.close(); keep(); };
      return;
    }
    if (act === 'sstart') { setLast('sched'); save(); return runSched(); }
    // library
    if (ds.ltab) { LIB.tab = ds.ltab; return keep(); }
    if (ds.lcard) {
      if (LIB.select) { var k = LIB.sel.indexOf(ds.lcard); if (k >= 0) LIB.sel.splice(k, 1); else LIB.sel.push(ds.lcard); return keep(); }
      return cardOptions(ds.lcard);
    }
    if (act === 'lphoto') return openAddPhoto(function () { LIB.tab = 'photos'; LIB.q = ''; render(); }, { noText: true });
    if (act === 'ltext') return openTextCard(function () { LIB.tab = 'photos'; LIB.q = ''; render(); });
    if (act === 'lcam' || act === 'lgal') return pickFile(act === 'lcam', function (file) { openCrop(file, function (data) { openNameCard(data, function () { render(); }); }); });
    if (act === 'lprint') { LIB.select = true; LIB.sel = []; window.scrollTo(0, 0); return render(); }
    if (act === 'lselall') {
      var vis = Array.prototype.map.call(ROOT.querySelectorAll('[data-lcard]'), function (x) { return x.dataset.lcard; });
      LIB.sel = vis.every(function (x) { return LIB.sel.indexOf(x) >= 0; }) ? [] : vis; return keep();
    }
    if (act === 'lprintgo') return openDownload('cards', { cards: LIB.sel.slice() });
    // settings
    if (act === 'pedit') return editProfile(ds.pid);
    // backup
    if (act === 'bsave') return doBackup();
    if (act === 'bfile') return readBackup();
    if (act === 'rcancel') { RESTORE = null; return render(); }
    if (ds.rmode) { RESTORE.mode = ds.rmode; return render(); }
    if (act === 'rgo') return applyRestore();
  }
  function schedMenu(s) {
    var sh = sheet('<h2 class="tl-h2">' + esc(schedName(s)) + '</h2><div class="tl-panel"><button type="button" class="tl-row act" data-m="dup"><div><b>' + esc(tr('dup')) + '</b></div><span>›</span></button>' +
      '<button type="button" class="tl-row act danger" data-m="del"><div><b>' + esc(tr('delSched')) + '</b></div><span>✕</span></button></div>');
    sh.el.onclick = function (e) {
      var b = e.target.closest('[data-m]'); if (!b) return;
      var m = b.dataset.m, d = D();
      if (m === 'dup') { var c = JSON.parse(JSON.stringify(s)); c.id = uid('s'); delete c.from; c.name = { id: schedName(s) + ' (2)', en: schedName(s) + ' (2)' }; d.schedules.push(c); d.active = c.id; save(); sh.close(); return render(); }
      if (m === 'del') { if (!confirmInline(b)) return; d.schedules = d.schedules.filter(function (x) { return x.id !== s.id; }); d.active = null; save(); sh.close(); render(); }
    };
  }
  function boardMenu() {
    var bd = activeBoard(); if (!bd) return;
    var sh = sheet('<h2 class="tl-h2">' + esc(boardName(bd)) + '</h2><div class="tl-panel"><button type="button" class="tl-row act danger" data-m="del"><div><b>' + esc(tr('delBoard')) + '</b></div><span>✕</span></button></div>');
    sh.el.onclick = function (e) {
      var b = e.target.closest('[data-m]'); if (!b) return;
      if (!confirmInline(b)) return;
      var d = D(); d.boards = d.boards.filter(function (x) { return x.id !== bd.id; }); d.ft.boardId = null; syncFT(); save(); sh.close(); render();
    };
  }

  /* ===================== mount ===================== */
  var VERSION = '13';
  var READY = null;
  var API = {
    S: function () { return S; }, D: D, activeBoard: activeBoard, prof: prof, cardInfo: cardInfo, labelsFor: labelsFor, artHTML: artHTML, cardHTML: cardHTML, kidFor: kidFor,
    PH: PH, tr: tr, L: L, esc: esc, sheet: sheet, save: save, keep: keep, rerender: rerender, openPicker: openPicker, topbar: topbar, row: row, toggle: toggle, seg: seg,
    childOpen: childOpen, childClose: childClose, childClear: childClear, addTimer: function (t) { CH.timers.push(t); }, childEl: function () { return CH.el; }, exitPill: exitPill, wireExit: wireExit,
    chime: chime, say: say, buzz: buzz, setLast: setLast, runTimer: runTimer, photoPut: photoPut, photoDel: photoDel, cardLabel: cardLabel, adultCheck: adultCheck, openDownload: openDownload,
    profName: profName, route: function () { return ROUTE; }, openProfiles: function () { return openProfiles(); }, deleteProfile: deleteProfile, delConfirm: delConfirm, delBtn: delBtn, photosLoad: function () { return READY = READY || photosLoad(); }, COLORS: COLORS, DEFAULT_REWARDS: DEFAULT_REWARDS, appMode: appMode, A: A, fmt: fmt, schedName: schedName, activeSched: activeSched, timerSVG: timerSVG, timerSet: timerSet, T: T, canUse: canUse, toast: toast, heart: A.heart
  };
  window.LUTools = {
    version: VERSION,
    canUse: canUse,
    api: API,
    mount: function (route, root) {
      ROUTE = route || 'tools'; ROOT = root;
      childClose(true);
      MOUNTING = true; sheetStack.slice().forEach(function (s) { s.close(); }); MOUNTING = false;
      DD = null;
      if (ROUTE !== 'tools/library') { LIB.select = false; LIB.sel = []; }
      if (ROUTE === 'tools/setup' && window.LU && LU.qs.get('new') && !SETUP) SETUP = null;
      if (ROUTE === 'tools/setup' && appMode() && !(SETUP && SETUP.step)) SETUP = null;
      if (ROUTE === 'tools/setup' && window.LUAcc && S.profiles.length && !LUAcc.canAddChild()) { LUAcc.childLockSheet(); ROUTE = 'tools'; if (window.LU) LU.go('#/tools', true); }
      if (ROUTE !== 'tools/backup') RESTORE = null;
      root.addEventListener('click', onClick);
      READY = READY || photosLoad();
      return READY.then(function () {
        if (ROUTE === 'tools/library' && window.LU && LU.qs.get('q')) { LIB.q = LU.qs.get('q'); }
        render();
        if (ROUTE === 'tools/setup' && appMode()) return;
        if (needSetup() && appMode()) { if (window.LU) LU.go('#/tools/setup', true); return; }
        if (needSetup() || ROUTE === 'tools/setup') openSetupModal();
        if (location.hash === '#profiles') { var el = document.getElementById('profiles'); el && el.scrollIntoView(); }
      });
    },
    render: function () { if (ROOT) render(); if (SETUPSH) setupRender(); },
    reloadState: reloadState,
    fixLocked: function () { fixLocked(); },
    unmount: function () { childClose(true); },
    register: function (route, def) { if (!EXT[route]) EXT_ORDER.push(route); EXT[route] = def; }
  };
  // Conversation Starters is a large script that loads only when it is opened; until then the tools list shows this card
  window.LUTools.register('tools/conversation-starters', { card: { grp: 'talk', tint: '#FFF1C7',
    vis: function () { return '<div class="tl-mini-art">' + (A.toolArt ? A.toolArt('talk') : '') + '</div>'; },
    title: function () { return L() === 'id' ? 'Pembuka Obrolan' : 'Conversation Starters'; },
    desc: function () { return L() === 'id' ? 'Permainan papan dan permainan seru untuk dimainkan anak bersama orang dewasa. Setiap giliran membuka obrolan hangat tentang perasaan, teman, dan pilihan.' : 'Board and party games for a grown-up and child to play together. Each turn opens up a gentle chat about feelings, friends and choices.'; } } });
  window.LUTools.register('tools/safe-people', { card: { grp: 'talk', tint: '#DDF2E4',
    vis: function () { return '<div class="tl-mini-art">' + (A.toolArt ? A.toolArt('safe') : '') + '</div>'; },
    title: function () { return L() === 'id' ? 'Peta Orang Aman' : 'Safe People Map'; },
    desc: function () { return L() === 'id' ? 'Anak dan orang dewasa memetakan bersama orang-orang yang dipercaya anak, dan kapan harus menghampiri mereka.' : 'A child and a grown-up map out, together, the people the child trusts and when to go to each of them.'; } } });
})();
