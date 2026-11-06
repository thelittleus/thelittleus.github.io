/* Little Us · app layout for phones and tablets
   On phones and tablets the site becomes the Little Us app: an opening screen, a tab bar (phone and tablet
   portrait) or a left rail (tablet landscape) with Home · Tools · Shop · Articles · Settings, and app versions
   of Home, Tools, Settings and Child. Laptops and desktops keep the website layout.
   The tools, shop, articles and account pages are the same pages as on the website; this file only changes
   their frame and adds the app-only screens. Everything a child sets up is still kept by tools.js. */
(function () {
  'use strict';
  if (window.LUApp) return;
  var DOC = document.documentElement;
  var REG = window.LU_PAGES = window.LU_PAGES || {};

  /* ===================== words ===================== */
  var W = {
    home: ['Home', 'Beranda'], tools: ['Tools', 'Alat'], shop: ['Shop', 'Toko'], articles: ['Articles', 'Artikel'], settings: ['Settings', 'Pengaturan'],
    ready: ['Getting your tools ready…', 'Menyiapkan alatmu…'],
    hiWelcome: ['Hi, welcome!', 'Halo, selamat datang!'], hiAgain: ['Hi again!', 'Halo lagi!'],
    welcomeP: ['All-in-one hub for learning tools, visual supports, and printables', 'Satu tempat untuk alat belajar, bantuan visual, dan materi cetak'],
    login: ['Login', 'Masuk'], whoWith: ['Who are we learning with?', 'Kita belajar bersama siapa?'], setChild: ['Set up your child', 'Atur untuk anakmu'],
    langNote: ['You can change this anytime in Settings.', 'Kamu bisa menggantinya kapan saja di Pengaturan.'],
    againP: [function (n) { return 'What would you like to do with ' + n + ' today?'; }, function (n) { return 'Mau melakukan apa bersama ' + n + ' hari ini?'; }],
    againP0: ['What would you like to do today?', 'Mau melakukan apa hari ini?'],
    toolsP: ['Customizable tools for learning and everyday routines', 'Alat yang bisa disesuaikan untuk belajar dan rutinitas sehari-hari'], toolsPL: ['Customizable tools for learning and everyday routines', 'Alat yang bisa disesuaikan untuk belajar dan rutinitas sehari-hari'],
    shopP: ['Printable files and activities', 'File dan aktivitas untuk dicetak'], articlesP: ['A short read on what’s new', 'Bacaan singkat tentang hal terbaru'], free: ['FREE', 'GRATIS'],
    change: ['Change', 'Ganti'], cont: ['Continue', 'Lanjutkan'],
    plusCard: ['More styles, every download', 'Lebih banyak gaya, semua unduhan'], plusCardP: ['One payment, never renews', 'Sekali bayar, tidak diperpanjang otomatis'], upgrade: ['Upgrade', 'Upgrade'],
    unlocked: ['Everything is unlocked', 'Semuanya sudah terbuka'], plusUntil: [function (d) { return 'Little Us Plus until ' + d; }, function (d) { return 'Little Us Plus sampai ' + d; }],
    endsIn: [function (n) { return 'Plus ends in ' + n + (n === 1 ? ' day' : ' days'); }, function (n) { return 'Plus berakhir dalam ' + n + ' hari'; }],
    endsInP: [function (d) { return 'On ' + d + '. Add time and nothing changes.'; }, function (d) { return 'Pada ' + d + '. Tambah waktu dan tidak ada yang berubah.'; }], addTime: ['Add time', 'Tambah waktu'],
    ended: [function (d) { return 'Plus ended on ' + d; }, function (d) { return 'Plus berakhir pada ' + d; }], endedP: [function (n) { return n + '’s boards are all still here'; }, function (n) { return 'Semua papan ' + n + ' masih ada'; }], buyAgain: ['Buy again', 'Beli lagi'],
    labEn: ['English card labels', 'Label kartu bahasa Inggris'], labId: ['Indonesian card labels', 'Label kartu bahasa Indonesia'], labBoth: ['Bilingual card labels', 'Label kartu dua bahasa'], labNone: ['Pictures only', 'Gambar saja'],
    langEn: ['English', 'Bahasa Inggris'], langId: ['Indonesian', 'Bahasa Indonesia'],
    whoFor: ['Who is this for?', 'Untuk siapa ini?'], usingNow: ['Using now', 'Sedang dipakai'], addChild: ['Add a child', 'Tambah anak'], editProfiles: ['Edit profiles', 'Ubah profil'],
    cards: ['Cards', 'Kartu'], pickTool: [function (n) { return 'Pick a tool, set it up in a minute, then hand it to ' + n + '.'; }, function (n) { return 'Pilih alat, atur dalam semenit, lalu serahkan ke ' + n + '.'; }],
    pickTool0: ['Pick a tool, set it up in a minute, then use it together with your child.', 'Pilih alat, atur dalam semenit, lalu gunakan bersama anakmu.'],
    grpRoutine: ['Everyday routines', 'Rutinitas sehari-hari'], grpCalm: ['Emotional Regulation', 'Regulasi Emosi'], grpTalk: ['Social skills', 'Keterampilan sosial'], grpTeach: ['Teaching tools', 'Alat mengajar'], soon: ['Coming soon', 'Segera hadir'],
    usingDefaults: ['Using default settings.', 'Memakai pengaturan bawaan.'], setUpFor: ['Set up for your child', 'Atur untuk anakmu'],
    close: ['Close', 'Tutup'], open: ['Open', 'Buka'],
    skipH: ['No problem! Until you set up a child, the tools use:', 'Tidak apa-apa! Sebelum anak diatur, alat memakai:'],
    skip1: ['English, with English card labels', 'Bahasa Inggris, dengan label kartu bahasa Inggris'], skip1id: ['Indonesian, with Indonesian card labels', 'Bahasa Indonesia, dengan label kartu bahasa Indonesia'],
    skip2: ['The boy character on the cards', 'Karakter anak laki-laki di kartu'], skip3: ['A starter set of favourite rewards', 'Satu set hadiah favorit bawaan'], skip4: ['No child name or photo', 'Tanpa nama atau foto anak'],
    skipNote: ['You can set up a child any time from the Child tab.', 'Kamu bisa mengatur anak kapan saja dari menu Anak.'], setUpNow: ['Set up now', 'Atur sekarang'], contDefaults: ['Continue with defaults', 'Lanjut dengan bawaan'],
    a2hsH: ['Keep Little Us on your home screen', 'Simpan Little Us di layar utama'], a2hsP: ['Opens full screen and works offline.', 'Terbuka layar penuh dan bisa offline.'], notNow: ['Not now', 'Nanti saja'], a2hsBtn: ['Add to home screen', 'Tambah ke layar utama'],
    iosH: ['Add Little Us to your Home Screen', 'Tambahkan Little Us ke Layar Utama'], ios1: ['Tap <b>Share</b> in the bar below', 'Ketuk <b>Bagikan</b> di bilah bawah'], ios2: ['Choose <b>Add to Home Screen</b>', 'Pilih <b>Tambah ke Layar Utama</b>'], ios3: ['Tap <b>Add</b>. Done!', 'Ketuk <b>Tambah</b>. Selesai!'],
    language: ['App Language', 'Bahasa Aplikasi'], cardLabels: ['Card labels', 'Label kartu'], both: ['Both', 'Keduanya'], none: ['None', 'Tanpa'],
    sounds: ['Sounds', 'Suara'], soundsP: ['Chimes and spoken warnings', 'Bunyi dan peringatan suara'], soft: ['Soft', 'Pelan'], loud: ['Loud', 'Keras'],
    reduce: ['Reduce motion', 'Kurangi gerakan'], reduceP: ['No movement at all. Already on if your phone asks for it.', 'Tanpa gerakan sama sekali. Otomatis aktif jika HP-mu memintanya.'],
    leaving: ['Leaving child mode', 'Keluar dari mode anak'], hold3: ['Hold 3 seconds', 'Tahan 3 detik'], adultCheck: ['Adult check', 'Cek orang dewasa'],
    children: ['Children', 'Anak'], childrenP: ['backup and share', 'cadangan dan berbagi'], noChildYet: ['No child set up yet', 'Belum ada anak'],
    plusRow: ['Little Us Plus', 'Little Us Plus'], fromPrice: ['From $9', 'Mulai $9'], plusRowP: ['More styles, every download', 'Lebih banyak gaya, semua unduhan'], getPlus: ['Get Plus', 'Dapatkan Plus'],
    more: ['More', 'Lainnya'], cardLibrary: ['Card library', 'Perpustakaan kartu'], backupShare: ['Backup & share', 'Cadangan & berbagi'], findOrder: ['Find my order', 'Cari pesanan saya'], about: ['About Little Us', 'Tentang Little Us'], help: ['Help and FAQ', 'Bantuan dan FAQ'],
    child: ['Child', 'Anak'], edit: ['Edit', 'Ubah'], character: ['Character', 'Karakter'], favRewards: ['Favourite rewards', 'Hadiah favorit'], otherChildren: ['Other children', 'Anak lainnya'], sw: ['Switch', 'Ganti'],
    backupH: ['Backup and share', 'Cadangan dan berbagi'], saveBackup: ['Save a backup file', 'Simpan file cadangan'], saveBackupP: ['Keep a copy of every board and setting', 'Simpan salinan semua papan dan pengaturan'],
    sendTeacher: ['Send to a teacher or therapist', 'Kirim ke guru atau terapis'], sendTeacherP: ['Shares one file through WhatsApp, email…', 'Bagikan satu file lewat WhatsApp, email…'],
    emptyH: ['Make the tools feel like theirs', 'Buat alatnya terasa milik mereka'], emptyP: ['Add a nickname, pick a character and choose favourite rewards. About a minute, and it stays on this phone.', 'Tambahkan nama panggilan, pilih karakter, dan hadiah favorit. Sekitar semenit, dan tersimpan di HP ini.'],
    setUpMine: ['Set up for my child', 'Atur untuk anakku'], restore: ['Restore from a backup file', 'Pulihkan dari file cadangan'],
    boyChar: ['Boy character', 'Karakter laki-laki'], girlChar: ['Girl character', 'Karakter perempuan'], done: ['Done', 'Selesai'], addReward: ['Add a reward', 'Tambah hadiah'], remove: ['Remove', 'Hapus'],
    shopH: ['Shop', 'Toko'], articlesH: ['Articles', 'Artikel'], back: ['Back', 'Kembali'],
    tl: {
      timer: [['Visual Timer', 'A countdown your child can see, not just hear. It helps with waiting, taking turns and knowing when an activity will end.'], ['Timer Visual', 'Hitungan mundur yang bisa dilihat anak, bukan hanya didengar. Membantu saat menunggu, bergantian, dan tahu kapan kegiatan selesai.']],
      tokens: [['Token Board', 'Your child earns a star for each step or good effort, and gets the reward they chose when the board is full.'], ['Papan Token', 'Anak mendapat bintang untuk setiap langkah atau usaha baik, lalu mendapat hadiah pilihannya saat papan penuh.']],
      ft: [['First–Then Board', 'Shows the task that comes first and the fun thing after, so “first bath, then play” is easy to understand.'], ['Papan Pertama–Lalu', 'Menunjukkan tugas yang dilakukan dulu dan hal menyenangkan sesudahnya, agar “mandi dulu, lalu main” mudah dipahami.']],
      sched: [['Visual Schedule', 'The steps of a routine or the whole day in pictures, so your child knows what is happening now and next.'], ['Jadwal Visual', 'Langkah rutinitas atau kegiatan seharian dalam gambar, agar anak tahu apa yang terjadi sekarang dan selanjutnya.']],
      breathe: [['Breathing Buddy', 'A friendly shape to breathe along with. It grows as you breathe in and shrinks as you breathe out.'], ['Teman Napas', 'Bentuk ramah untuk bernapas bersama. Membesar saat menarik napas dan mengecil saat mengembuskan napas.']],
      feelings: [['Feelings Check-In', 'Your child picks how they feel and how big the feeling is, then chooses something that helps.'], ['Cek Perasaan', 'Anak memilih perasaannya dan seberapa besar perasaan itu, lalu memilih hal yang membantu.']],
      worry: [['Worry Jar', 'Your child draws or writes a worry and puts it in a jar. Later, you open the jar together and talk it through.'], ['Toples Khawatir', 'Anak menggambar atau menulis kekhawatiran lalu memasukkannya ke toples. Nanti, kalian membukanya bersama dan membicarakannya.']],
      talk: [['Conversation Starters', 'Board and party games for a grown-up and child. Each turn opens up a gentle chat about feelings, friends and choices.'], ['Pembuka Obrolan', 'Permainan papan dan permainan seru untuk anak dan orang dewasa. Setiap giliran membuka obrolan hangat tentang perasaan, teman, dan pilihan.']]
    }
  };
  function lang() { return (window.LU && LU.lang) || 'en'; }
  function isId() { return lang() === 'id'; }
  function t(k) { var v = W[k]; if (!v) return k; v = v[isId() ? 1 : 0]; return px(typeof v === 'function' ? v.apply(null, [].slice.call(arguments, 1)) : v); }
  // Plus prices in the words are written in US dollars; show them in the visitor's currency (see LUAcc.priceLabel)
  function px(s) { var a = window.LUAcc; if (typeof s !== 'string' || !a || !a.priceLabel || s.indexOf('$') < 0) return s; return s.replace(/\$29\b/g, function () { return a.priceLabel('12m'); }).replace(/\$9\b/g, function () { return a.priceLabel('3m'); }); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { return null; } }
  function go(h) { if (window.LU && LU.go) LU.go(h); else location.hash = h; }
  var MON = { en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], id: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'] };
  function fmtDate(d) { d = new Date(d); return d.getDate() + ' ' + MON[isId() ? 'id' : 'en'][d.getMonth()] + ' ' + d.getFullYear(); }
  function fmtDay(d) { d = new Date(d); return d.getDate() + ' ' + MON[isId() ? 'id' : 'en'][d.getMonth()]; }

  /* ===================== icons ===================== */
  function svgI(inner, s, col, sw) { return '<svg width="' + (s || 24) + '" height="' + (s || 24) + '" viewBox="0 0 24 24" fill="none" stroke="' + (col || 'currentColor') + '" stroke-width="' + (sw || 2.2) + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + inner + '</svg>'; }
  var PATH = {
    home: '<path d="M4 10.5l8-6.5 8 6.5V19a2 2 0 0 1-2 2h-3.5v-6h-5v6H6a2 2 0 0 1-2-2z"/>',
    tools: '<rect x="3" y="3" width="7.5" height="7.5" rx="2.5"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="2.5"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="2.5"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2.5"/>',
    shop: '<path d="M5 8.5h14l-1.2 12H6.2z"/><path d="M9 8.5a3 3 0 0 1 6 0"/>',
    articles: '<path d="M6 3h9l4 4v12.5A1.5 1.5 0 0 1 17.5 21h-11A1.5 1.5 0 0 1 5 19.5v-15A1.5 1.5 0 0 1 6.5 3z"/><path d="M9 11h6M9 15h6M9 7h3"/>',
    settings: '<path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="2.6" fill="#fff"/><circle cx="15" cy="17" r="2.6" fill="#fff"/>',
    next: '<path d="M9 5l7 7-7 7"/>', back: '<path d="M15 5l-7 7 7 7"/>', close: '<path d="M6 6l12 12M18 6L6 18"/>', check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>', plus: '<path d="M12 5v14M5 12h14"/>',
    cards: '<rect x="4" y="6.5" width="12" height="14.5" rx="3"/><path d="M8.5 3H17a3 3 0 0 1 3 3v10.5"/>',
    share: '<path d="M12 3v12M7.5 7.5L12 3l4.5 4.5"/><path d="M8 11H6.5A1.5 1.5 0 0 0 5 12.5v7A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5v-7A1.5 1.5 0 0 0 17.5 11H16"/>',
    addsq: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M12 8.5v7M8.5 12h7"/>', cam: '<rect x="3" y="7" width="18" height="13" rx="3"/><path d="M8.5 7l1.5-3h4l1.5 3"/><circle cx="12" cy="13.5" r="3.2"/>'
  };
  function ic(k, s, col, sw) { return svgI(PATH[k] || '', s, col, sw); }

  /* ===================== mode ===================== */
  // Phones always use the app. Tablets use it when the main pointer is touch; laptops keep the website.
  var MODE = null;
  function calcMode() {
    var w = window.innerWidth, h = window.innerHeight, coarse = false;
    try { coarse = window.matchMedia('(pointer:coarse)').matches; } catch (e) { }
    if (/[?&]app=(1|phone|tablet)/.test(location.search)) store('lu_force_app', '1');
    if (/[?&]app=0/.test(location.search)) store('lu_force_app', null);
    var forced = store('lu_force_app') === '1';
    // desktop computers keep the website even in a narrow window (see the first script in index.html)
    if (window.LU_DESK && !forced) return null;
    if (w < 760) return 'phone';
    if ((coarse || forced) && w <= 1400) return w > h ? 'land' : 'port';
    return null;
  }
  function isApp() { return !!MODE; }
  function applyMode() {
    var m = calcMode(), was = MODE;
    MODE = m;
    DOC.classList.toggle('lu-app', !!m);
    DOC.classList.toggle('lu-phone', m === 'phone');
    DOC.classList.toggle('lu-land', m === 'land');
    DOC.classList.toggle('lu-port', m === 'port');
    return was !== m && (!!was !== !!m);
  }
  applyMode();
  var rz = 0;
  window.addEventListener('resize', function () {
    clearTimeout(rz);
    rz = setTimeout(function () { var flip = applyMode(); nav(); if (flip && window.LU && LU.go) LU.go(location.pathname + location.search, true); }, 150);
  });

  /* ===================== shared data ===================== */
  function api() { return window.LUTools && LUTools.api; }
  function S() { var a = api(); return a ? a.S() : null; }
  function prof() { var a = api(); return a ? a.prof() : null; }
  function profiles() { var s = S(); return s ? s.profiles : []; }
  function A() { return window.LUArt; }
  function acc() { return window.LUAcc || null; }
  function accStatus() { var a = acc(); try { return a ? a.status() : 'none'; } catch (e) { return 'none'; } }
  function load() {
    if (!window.luLoad) return Promise.resolve();
    return luLoad('/tools.css?v=20').then(function () { return luLoad('/tools-art.js?v=23'); }).then(function () { return luLoad('/tools.js?v=23'); })
      .then(function () { return luLoad('/tools-calm.js?v=16'); }).then(function () { var a = api(); return a && a.photosLoad ? a.photosLoad() : null; }).catch(function () { });
  }
  function photo(p) { var a = api(); return p && p.photo && a && a.PH && a.PH[p.photo] ? a.PH[p.photo] : ''; }
  function ava(p, size, cls) {
    var s = size || 44, ph = photo(p), col = (p && p.color) || '#F3EEE6';
    return '<span class="ua-ava ' + (cls || '') + '" style="width:' + s + 'px;height:' + s + 'px;background:' + col + ';font-size:' + Math.round(s * 0.45) + 'px">' + (ph ? '<img src="' + ph + '" alt="">' : p && A() && A().face ? '<span class="lu-face" data-face="' + (p.kid === 'girl' ? 'girl' : 'boy') + '" data-done="1">' + A().face(p.kid) + '</span>' : esc(p ? (p.name || '?').trim().charAt(0).toUpperCase() : '')) + '</span>';
  }
  function labelsText() { var s = S(), l = (s && s.settings.labels) || (isId() ? 'id' : 'en'); return (isId() ? t('langId') : t('langEn')) + ' · ' + t(l === 'id' ? 'labId' : l === 'both' ? 'labBoth' : l === 'none' ? 'labNone' : 'labEn'); }

  /* ===================== tool art (tiles and rows) ===================== */
  function fit(s) { return (s || '').replace('<svg ', '<svg style="width:100%;height:100%;display:block" '); }
  function toolArt(k) {
    var a = api(), Ar = A(), C = window.LUCalm && LUCalm.art;
    try {
      if (k === 'timer') return '<div class="ua-art timer">' + fit(a.timerSVG('circle', 0.72)) + '</div>';
      if (k === 'tokens') return '<div class="ua-art one">' + fit(Ar.tokenBoard ? Ar.tokenBoard({ lang: lang(), gender: kid() }) : Ar.toolArt('tokens')) + '</div>';
      if (k === 'ft') return '<div class="ua-art ft"><i>' + fit(Ar.svg('mandi', { gender: kid() })) + '</i><b>→</b><i class="on">' + fit(Ar.svg('main', { gender: kid() })) + '</i></div>';
      if (k === 'sched') return '<div class="ua-art sch">' + ['sarapan', 'pakai-baju', 'sekolah'].map(function (id, i) { return '<span class="' + (i === 1 ? 'on' : '') + '"><i>' + fit(Ar.svg(id, { gender: kid(), noBg: true })) + '</i><u></u></span>'; }).join('') + '</div>';
      if (k === 'breathe' && C) return '<div class="ua-art one">' + fit(C.buddySVG('balloon')) + '</div>';
      if (k === 'feelings' && C) return '<div class="ua-art two"><i>' + fit(C.feelFace('happy', kid())) + '</i><i>' + fit(C.feelFace('worried', kid() === 'girl' ? 'boy' : 'girl')) + '</i></div>';
      if (k === 'worry' && C) return '<div class="ua-art one">' + fit(C.jarSVG({ n: 2 })) + '</div>';
      if (k === 'talk') return '<div class="ua-art one">' + fit(Ar.toolArt('talk')) + '</div>';
    } catch (e) { }
    return '';
  }
  function kid() { var p = prof(); return (p && p.kid) || 'boy'; }
  var TOOLS = [
    { k: 'timer', r: 'tools/timer', tint: '#DCEBFA', g: 'routine' }, { k: 'tokens', r: 'tools/tokens', tint: '#FFF1C7', g: 'routine' },
    { k: 'ft', r: 'tools/first-then', tint: '#DDF2E4', g: 'routine' }, { k: 'sched', r: 'tools/schedule', tint: '#E9E1F7', g: 'routine' },
    { k: 'breathe', r: 'tools/breathe', tint: '#DCEBFA', g: 'calm' }, { k: 'feelings', r: 'tools/feelings', tint: '#E9E1F7', g: 'calm' }, { k: 'worry', r: 'tools/worry', tint: '#FBE0E6', g: 'calm' },
    { k: 'talk', r: 'tools/conversation-starters', tint: '#FFF1C7', g: 'talk' }
  ];
  function toolName(k) { return W.tl[k][isId() ? 1 : 0][0]; }
  function toolDesc(k) { return W.tl[k][isId() ? 1 : 0][1]; }

  // the "Continue" card: back into the last tool, exactly as it was left
  function lastInfo() {
    var s = S(), a = api(); if (!s || !s.last || !s.last.tool || !a) return null;
    var map = { timer: ['tools/timer', 'timer'], tokens: ['tools/tokens', 'tokens'], ft: ['tools/first-then', 'ft'], sched: ['tools/schedule', 'sched'], breathe: ['tools/breathe', 'breathe'], feelings: ['tools/feelings', 'feelings'], worry: ['tools/worry', 'worry'] };
    var m = map[s.last.tool]; if (!m) return null;
    var d = a.D(), sub = '', ref = null;
    try {
      if (s.last.tool === 'tokens') { var tk = d.tokens; sub = (tk.earned || 0) + (isId() ? ' dari ' : ' of ') + (tk.count || 5); ref = tk.reward; }
      else if (s.last.tool === 'timer') { sub = Math.floor(((d.timer.minutes || 0) * 60 + (d.timer.seconds || 0)) / 60) + ':' + String((d.timer.seconds || 0) % 60).padStart(2, '0'); ref = d.timer.showNext ? d.timer.next : null; }
      else if (s.last.tool === 'ft') { if (!d.ft.first) return null; sub = a.cardLabel(d.ft.first) + ' → ' + a.cardLabel(d.ft.then[0]); ref = d.ft.first; }
      else if (s.last.tool === 'sched') { var sc = a.activeSched(); if (!sc) return null; sub = a.schedName(sc); ref = (sc.steps[0] || {}).card; }
    } catch (e) { }
    return { route: m[0], name: toolName(m[1]), sub: sub, art: ref ? a.cardHTML(ref, { size: 'xs', labels: 'none' }) : '<span class="ua-contart">' + toolArt(m[1]) + '</span>' };
  }
  function contCard(big) {
    var li = lastInfo(); if (!li) return '';
    return '<a class="ua-cont' + (big ? ' big' : '') + '" href="#/' + li.route + '"><span class="ua-contthumb">' + li.art + '</span><span class="ua-conttx"><small>' + esc(t('cont')) + '</small><b>' + esc(li.name) + (li.sub && !big ? ' · ' + esc(li.sub) : '') + '</b>' + (big && li.sub ? '<em>' + esc(li.sub) + '</em>' : '') + '</span><span class="ua-go">' + ic('next', 22, '#2B2A35', 2.6) + '</span></a>';
  }

  /* ===================== sheets ===================== */
  var SHEET = null;
  function sheet(html, cls) {
    closeSheet();
    var w = document.createElement('div');
    w.className = 'ua-sheetwrap' + (cls ? ' ' + cls : '');
    w.innerHTML = '<div class="ua-scrim" data-ua-close></div><div class="ua-sheet" role="dialog" aria-modal="true"><span class="ua-grab"></span>' + html + '</div>';
    document.body.appendChild(w);
    requestAnimationFrame(function () { w.classList.add('open'); });
    w.addEventListener('click', function (e) { if (e.target.closest('[data-ua-close]')) closeSheet(); });
    SHEET = w;
    var f = w.querySelector('button,a'); if (f) setTimeout(function () { try { f.focus({ preventScroll: true }); } catch (e) { } }, 60);
    return w;
  }
  function closeSheet() { if (SHEET) { var s = SHEET; SHEET = null; s.classList.remove('open'); setTimeout(function () { s.remove(); }, 220); } }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && SHEET) closeSheet(); });

  function switcher() {
    var s = S(); if (!s) return;
    var cur = prof();
    var h = '<h2 class="ua-sh2">' + esc(t('whoFor')) + '</h2><div class="ua-list">' +
      s.profiles.map(function (p) { var on = cur && cur.id === p.id; return '<div class="tl-prow"><button type="button" class="ua-row" style="flex:1;min-width:0" data-pick="' + esc(p.id) + '">' + ava(p, 44) + '<span class="ua-rowtx"><b>' + esc(p.name) + '</b>' + (on ? '<small>' + esc(t('usingNow')) + '</small>' : '') + '</span>' + (on ? '<span class="ua-tick">' + ic('check', 16, '#2B2A35', 3) + '</span>' : '') + '</button>' + api().delBtn(p) + '</div>'; }).join('') +
      '<a class="ua-row" href="#/tools/setup" data-ua-close><span class="ua-ava add">' + ic('plus', 20) + '</span><span class="ua-rowtx"><b>' + esc(t('addChild')) + '</b></span></a></div>' +
      (s.profiles.length ? '<a class="ua-link center" href="#/child" data-ua-close>' + esc(t('editProfiles')) + '</a>' : '');
    var w = sheet(h);
    w.addEventListener('click', function (e) {
      var d = e.target.closest('[data-delp]');
      if (d) { if (api().delConfirm(d)) { api().deleteProfile(d.dataset.delp); closeSheet(); refresh(); } return; }
      var b = e.target.closest('[data-pick]'); if (!b) return;
      var st = S(); st.current = b.dataset.pick; api().save(); closeSheet(); refresh();
    });
  }
  function infoSheet(tl) {
    var w = sheet('<div class="ua-info"><span class="ua-infoart" style="background:' + tl.tint + '">' + toolArt(tl.k) + '</span><h2 class="ua-sh2">' + esc(toolName(tl.k)) + '</h2></div><p class="ua-p">' + esc(toolDesc(tl.k)) + '</p>' +
      '<div class="ua-two"><button type="button" class="ua-btn quiet" data-ua-close>' + esc(t('close')) + '</button><a class="ua-btn primary" href="#/' + tl.r + '" data-ua-close>' + esc(t('open')) + ' ' + esc(toolName(tl.k)) + '</a></div>');
    return w;
  }
  function skipSheet(route) {
    var Ar = A();
    var h = '<div class="ua-skiphead">' + (Ar ? Ar.heart(40) : '') + '<h2 class="ua-sh2">' + esc(t('skipH')) + '</h2></div><ul class="ua-skip">' +
      '<li><span class="ua-skipic en">' + (isId() ? 'ID' : 'EN') + '</span>' + esc(isId() ? t('skip1id') : t('skip1')) + '</li>' +
      '<li><span class="ua-skipic">' + (Ar ? fit(Ar.kid('boy')).replace('height:100%', 'height:130%') : '') + '</span>' + esc(t('skip2')) + '</li>' +
      '<li><span class="ua-skipic">' + (Ar ? fit(Ar.svg('lego')) : '') + '</span>' + esc(t('skip3')) + '</li>' +
      '<li><span class="ua-skipic dash"></span>' + esc(t('skip4')) + '</li></ul><p class="ua-p small">' + esc(t('skipNote')) + '</p>' +
      '<div class="ua-two"><a class="ua-btn primary" href="#/tools/setup" data-ua-close>' + esc(t('setUpNow')) + '</a><button type="button" class="ua-btn dark" data-defaults>' + esc(t('contDefaults')) + '</button></div>';
    var w = sheet(h);
    w.querySelector('[data-defaults]').onclick = function () { store('lu_defaults_ok', '1'); closeSheet(); go('#/' + route); };
  }

  /* first visit: choose the language. A choice is required, so tapping outside does nothing. */
  function langAsk() {
    if (!isApp() || store('lu_lang') || /^\/(admin|pilot)/.test(location.pathname) || document.querySelector('.ua-langsheet')) return;
    DOC.classList.add('ua-asklang'); // the cookie note waits until a language is chosen
    if (document.querySelector('.ua-splash')) { setTimeout(langAsk, 200); return; } // wait for the opening screen
    var words = { en: [W.cont[0], W.langNote[0]], id: [W.cont[1], W.langNote[1]] }, pick = lang();
    var opt = function (v, tag, name) { return '<button type="button" class="ua-lopt" role="radio" data-pick-lang="' + v + '" lang="' + v + '"><span class="ua-lbadge">' + tag + '</span><b>' + name + '</b><span class="ua-lradio">' + ic('check', 15, '#2B2A35', 3) + '</span></button>'; };
    var w = sheet('<h2 class="ua-lang-h" id="uaLangH">Choose your language</h2><p class="ua-lang-sub" lang="id">Pilih bahasa kamu</p>' +
      '<div class="ua-lopts" role="radiogroup" aria-labelledby="uaLangH">' + opt('en', 'EN', 'English') + opt('id', 'ID', 'Bahasa Indonesia') + '</div>' +
      '<button type="button" class="ua-btn primary lg ua-lgo" data-lgo></button><p class="ua-lnote"></p>', 'ua-langsheet');
    w.querySelector('.ua-scrim').removeAttribute('data-ua-close');
    var show = function () {
      [].forEach.call(w.querySelectorAll('[data-pick-lang]'), function (b) { var on = b.dataset.pickLang === pick; b.classList.toggle('on', on); b.setAttribute('aria-checked', String(on)); });
      w.querySelector('[data-lgo]').textContent = words[pick][0];
      w.querySelector('.ua-lnote').textContent = words[pick][1];
    };
    show();
    w.addEventListener('click', function (e) {
      var b = e.target.closest('[data-pick-lang]');
      if (b) { pick = b.dataset.pickLang; show(); return; }
      if (e.target.closest('[data-lgo]')) { closeSheet(); DOC.classList.remove('ua-asklang'); if (window.LU && LU.setLang) LU.setLang(pick); else store('lu_lang', pick); }
    });
  }

  /* ===================== add to home screen ===================== */
  var DEFER = null;
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); DEFER = e; });
  function standalone() { try { return window.matchMedia('(display-mode: standalone)').matches || navigator.standalone; } catch (e) { return false; } }
  function maybeA2HS() {
    if (!isApp() || standalone() || store('lu_a2hs') || !store('lu_tool_used')) return;
    var ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    var safari = ios && /safari/i.test(navigator.userAgent) && !/crios|fxios|edgios/i.test(navigator.userAgent);
    if (!DEFER && !safari) return;
    store('lu_a2hs', '1');
    var Ar = A(), heart = '<span class="ua-a2ic">' + (Ar ? Ar.heart(30) : '') + '</span>';
    var box = document.createElement('div');
    box.className = 'ua-a2hs' + (safari ? ' ios' : '');
    box.innerHTML = safari
      ? '<div class="ua-a2top">' + heart + '<b>' + esc(t('iosH')) + '</b><button type="button" class="ua-x" data-x aria-label="' + esc(t('close')) + '">' + ic('close', 20) + '</button></div><ol class="ua-ios"><li><span>1</span><p>' + t('ios1') + '</p><i>' + ic('share', 18) + '</i></li><li><span>2</span><p>' + t('ios2') + '</p><i>' + ic('addsq', 18) + '</i></li><li><span>3</span><p>' + t('ios3') + '</p></li></ol>'
      : '<div class="ua-a2top">' + heart + '<div><b>' + esc(t('a2hsH')) + '</b><small>' + esc(t('a2hsP')) + '</small></div><button type="button" class="ua-x" data-x aria-label="' + esc(t('close')) + '">' + ic('close', 20) + '</button></div><div class="ua-two"><button type="button" class="ua-btn quiet" data-x>' + esc(t('notNow')) + '</button><button type="button" class="ua-btn primary" data-add>' + esc(t('a2hsBtn')) + '</button></div>';
    document.body.appendChild(box);
    requestAnimationFrame(function () { box.classList.add('open'); });
    box.addEventListener('click', function (e) {
      if (e.target.closest('[data-add]') && DEFER) { DEFER.prompt(); DEFER = null; }
      if (e.target.closest('[data-x],[data-add]')) { box.classList.remove('open'); setTimeout(function () { box.remove(); }, 250); }
    });
  }

  /* ===================== opening screen ===================== */
  function splash() {
    if (!isApp() || sessionStorage.getItem('lu_opened') || /^\/(admin|pilot)/.test(location.pathname)) return;
    try { sessionStorage.setItem('lu_opened', '1'); } catch (e) { }
    var s = document.createElement('div');
    s.className = 'ua-splash';
    s.setAttribute('aria-hidden', 'true');
    var heart = '<svg viewBox="0 0 64 60" width="132" height="124"><path d="M31 54C24 49 6 37 6 21 6 12 12 6 20 6 26 6 30 10 32 15 34 10 38 6 44 6 52 6 58 12 58 21 58 34 46 44 38 50" fill="none" stroke="#2B2A35" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M38 50 46 57" stroke="#2B2A35" stroke-width="3.6" stroke-linecap="round"/><path d="M28 22V28M36 22V28" stroke="#2B2A35" stroke-width="3.4" stroke-linecap="round"/><path d="M24 34C28 39 36 39 40 34" fill="none" stroke="#2B2A35" stroke-width="3.2" stroke-linecap="round"/></svg>';
    s.innerHTML = '<div class="ua-splmid">' + heart + '<img src="/logo.png" alt="" class="ua-spllogo"></div><div class="ua-splbot"><div class="ua-bar"><i><em>' + heart.replace('width="132" height="124"', 'width="26" height="24"') + '</em></i></div><small>' + esc(t('ready')) + '</small></div>';
    document.body.appendChild(s);
    var t0 = Date.now();
    var done = function () { var wait = Math.max(0, 1600 - (Date.now() - t0)); setTimeout(function () { s.classList.add('out'); setTimeout(function () { s.remove(); }, 400); }, wait); };
    if (document.readyState === 'complete') done(); else window.addEventListener('load', done);
    setTimeout(function () { if (s.parentNode) { s.classList.add('out'); setTimeout(function () { s.remove(); }, 400); } }, 4000);
  }

  /* ===================== tab bar / rail ===================== */
  function routeName() { return (window.LU && LU.route != null ? LU.route : location.pathname.replace(/^\/+/, '').replace(/\/+$/, '')) || ''; }
  var NOTABS = /^(tools\/setup|signup|login|forgot-password|reset-password|check-email|welcome|plus|plus\/checkout|checkout|cart)$/;
  function activeTab(r) {
    if (r === '' ) return 'home';
    if (r === 'tools/settings' || r === 'child' || r === 'account' || r === 'tools/backup') return 'settings';
    if (/^tools/.test(r)) return 'tools';
    if (/^(catalogue|product|request|order|find-order)/.test(r)) return 'shop';
    if (/^article/.test(r)) return 'articles';
    if (/^(about|faq|license|privacy|terms|refund|contact)$/.test(r)) return 'settings';
    return '';
  }
  function navHTML() {
    var r = routeName(), on = activeTab(r), land = MODE === 'land';
    var items = [['home', '#/'], ['tools', '#/tools'], ['shop', '#/catalogue'], ['articles', '#/articles'], ['settings', '#/tools/settings']];
    var plus = acc() && (accStatus() === 'plus' || accStatus() === 'expiring');
    var h = '';
    if (land) { var p = prof(); h += '<button type="button" class="ua-railava" data-switch aria-label="' + esc(t('whoFor')) + '">' + (p ? ava(p, 52) : '<span class="ua-ava" style="width:52px;height:52px;background:#F3EEE6"></span>') + '<i>▾</i></button>'; }
    h += items.map(function (it) {
      var a = it[0] === on;
      return '<a href="' + it[1] + '" class="ua-tab' + (a ? ' on' : '') + '"' + (a ? ' aria-current="page"' : '') + '><span class="ua-pill">' + ic(it[0], 24, a ? '#2B2A35' : '#6B6875') + (it[0] === 'settings' && plus ? '<em>PLUS</em>' : '') + '</span><span class="ua-tlab">' + esc(t(it[0])) + '</span></a>';
    }).join('');
    return h;
  }
  var NAV = null;
  function nav() {
    if (!isApp()) { if (NAV) { NAV.remove(); NAV = null; } DOC.classList.remove('ua-notabs'); return; }
    if (!NAV) {
      NAV = document.createElement('nav');
      NAV.id = 'uaNav';
      NAV.setAttribute('aria-label', 'Little Us');
      document.body.appendChild(NAV);
      NAV.addEventListener('click', function (e) { if (e.target.closest('[data-switch]')) { e.preventDefault(); if (api()) switcher(); else load().then(switcher); } });
    }
    NAV.className = MODE === 'land' ? 'rail' : 'bar';
    NAV.innerHTML = navHTML();
    var r = routeName();
    DOC.classList.toggle('ua-notabs', NOTABS.test(r) || DOC.classList.contains('tl-childon'));
    DOC.dataset.uaRoute = r || 'home';
  }

  /* ===================== Home ===================== */
  function kidsArt() { var Ar = A(); return Ar ? '<span class="ua-kids"><i>' + fit(Ar.kid('boy')) + '</i><i>' + fit(Ar.kid('girl')) + '</i></span>' : ''; }
  function whereRows(land) {
    var Ar = A();
    var rows = [
      ['#/tools', t('tools'), land ? t('toolsPL') : t('toolsP'), '#FFF1C7', land ? toolsCluster() : '<span class="ua-rowart">' + toolArt('timer') + '</span>', true],
      ['#/catalogue', t('shop'), t('shopP'), '#FFE9DA', sheetArt('shop'), false],
      ['#/articles', t('articles'), t('articlesP'), '#DCEBFA', sheetArt('art'), false]
    ];
    return '<div class="ua-where' + (land ? ' big' : '') + '">' + rows.map(function (r) {
      return '<a class="ua-wrow" href="' + r[0] + '"><span class="ua-wart" style="background:' + r[3] + '">' + r[4] + '</span><span class="ua-wtx"><b>' + esc(r[1]) + '' + '</b><small>' + esc(r[2]) + '</small></span></a>';
    }).join('') + '</div>';
  }
  function toolsCluster() {
    var Ar = A(), a = api(); if (!Ar || !a) return '';
    return '<span class="ua-cluster"><i class="c1">' + fit(a.timerSVG('circle', 0.72)) + '</i><i class="c2"><span class="ua-art tok">' + [1, 1, 1].map(function () { return '<b>' + fit(Ar.token('star', true)) + '</b>'; }).join('') + '</span></i><i class="c3">' + (window.LUCalm ? fit(LUCalm.art.buddySVG('balloon')) : '') + '</i></span>';
  }
  function sheetArt(kind) {
    var Ar = A(); if (!Ar) return '';
    var cells = kind === 'shop' ? ['makan', 'mandi', 'main', 'tidur', 'sekolah', 'sikat-gigi'] : null;
    var front = kind === 'shop'
      ? '<span class="ua-pg front">' + cells.map(function (id) { return '<i>' + fit(Ar.svg(id, { gender: kid() })) + '</i>'; }).join('') + '</span><em class="ua-pdf">PDF</em>'
      : '<span class="ua-pg front art"><span class="ua-pghero">' + fit(Ar.heart(40, '#fff')) + '</span><u></u><u></u><u class="s"></u><u></u></span>';
    return '<span class="ua-sheets"><span class="ua-pg backp"><u></u><u></u><u class="s"></u></span>' + front + '</span>';
  }
  function plusStateCard() {
    var st = accStatus(), a = acc(), p = prof(), nm = p ? p.name : (isId() ? 'anakmu' : 'your child');
    var until = a && a.plusUntil ? a.plusUntil() : null;
    if (st === 'plus') {
      return ''; // Plus members don't need an 'Everything is unlocked' banner
    }
    if (st === 'expiring') {
      var days = until ? Math.max(1, Math.ceil((until - new Date()) / 86400000)) : 14;
      if (days > 3 && Number(store('lu_exp_hide') || 0) > Date.now()) return '';
      return '<div class="ua-note yellow"><span><b>' + esc(t('endsIn', days)) + '</b><small>' + esc(t('endsInP', until ? fmtDay(until) : '')) + '</small></span><a class="ua-btn dark sm" href="#/plus">' + esc(t('addTime')) + '</a><button type="button" class="ua-x sm" data-hide="lu_exp_hide" aria-label="' + esc(t('close')) + '">' + ic('close', 14) + '</button></div>';
    }
    if (st === 'expired') {
      return '<div class="ua-note line"><span><b>' + esc(t('ended', until ? fmtDay(until) : '')) + '</b><small>' + esc(t('endedP', nm)) + '</small></span><a class="ua-btn primary sm" href="#/plus">' + esc(t('buyAgain')) + '</a></div>';
    }
    if (Number(store('lu_plus_hide') || 0) > Date.now()) return '';
    return '<div class="ua-note line"><span><span class="ua-plusrow"><em class="ua-plus">PLUS</em><b>' + esc(t('plusCard')) + '</b></span><small>' + esc(t('plusCardP')) + '</small></span><a class="ua-btn primary sm" href="#/plus">' + esc(t('upgrade')) + '</a><button type="button" class="ua-x sm" data-hide="lu_plus_hide" aria-label="' + esc(t('close')) + '">' + ic('close', 14) + '</button></div>';
  }
  function childRow(p) {
    return '<div class="ua-childrow">' + ava(p, 44) + '<span class="ua-rowtx"><b>' + esc(p.name) + '</b></span><button type="button" class="ua-btn quiet sm" data-switch>' + esc(t('change')) + '</button></div>';
  }
  function homeHTML() {
    var p = prof(), first = !profiles().length, st = accStatus(), land = MODE === 'land';
    var logo = '<span class="ua-logo"><img src="/logo.png" alt="Little Us">' + (st === 'plus' || st === 'expiring' ? '<em class="ua-plus">PLUS</em>' : '') + '</span>';
    var login = st === 'none' ? '<a class="ua-login" href="#/login">' + esc(t('login')) + '</a>' : '';
    var hero = '<div class="ua-hero"><div class="ua-htop">' + logo + login + '</div><div class="ua-hbody"><div class="ua-herotx"><h1>' + esc(first ? t('hiWelcome') : t('hiAgain')) + '</h1><p>' + esc(first ? t('welcomeP') : p ? t('againP', p.name) : t('againP0')) + '</p></div>' + kidsArt() + '</div></div>';
    var quick = '';
    if (first) quick = '<div class="ua-who"><h2>' + esc(t('whoWith')) + '</h2><a class="ua-btn primary lg" href="#/tools/setup">' + esc(t('setChild')) + '</a></div>';
    else if (p) quick = '<div class="ua-who"><h2>' + esc(t('whoWith')) + '</h2>' + childRow(p) + '</div>';
    var where = whereRows(land);
    var bottom = (first ? '' : contCard()) + (first ? '' : plusStateCard());
    if (land) {
      return '<div class="ua-page ua-home land"><div class="ua-homeL">' + hero.replace('ua-hero', 'ua-hero tall') + '<div class="ua-homeLb">' + quick + (first ? '' : plusStateCard()) + '</div></div><div class="ua-homeR">' + where + (first ? '' : contCard()) + '</div></div>';
    }
    return '<div class="ua-page ua-home">' + hero + '<div class="ua-pad">' + quick + where + bottom + '</div></div>';
  }
  function wireHome(el) {
    el.addEventListener('click', function (e) {
      var h = e.target.closest('[data-hide]'); if (h) { e.preventDefault(); store(h.dataset.hide, String(Date.now() + 30 * 86400000)); refresh(); return; }
      if (e.target.closest('[data-switch]')) { switcher(); }
    });
  }

  /* ===================== Tools home ===================== */
  function toolsHTML() {
    var p = prof(), first = !profiles().length, land = MODE === 'land';
    var head = '<div class="ua-head"><button type="button" class="ua-avabtn" data-switch aria-label="' + esc(t('whoFor')) + '">' + (p ? ava(p, 44) : '<span class="ua-ava none" style="width:44px;height:44px">' + ic('home', 0) + '</span>') + '</button><h1>' + esc(t('tools')) + '</h1>' +
      (land ? contCard(false) : '') + '</div>';
    var top = '';
    if (first && !store('lu_defaults_hint_hide') && store('lu_defaults_ok') === '1') top = '<div class="ua-defaults"><span>' + esc(t('usingDefaults')) + ' <a href="#/tools/setup">' + esc(t('setUpFor')) + '</a></span><button type="button" class="ua-x sm" data-hide="lu_defaults_hint_hide" aria-label="' + esc(t('close')) + '">' + ic('close', 14) + '</button></div>';
    else if (!land) top = contCard(true) || '<div class="ua-hint">' + (A() ? A().heart(30) : '') + '<span>' + esc(p ? t('pickTool', p.name) : t('pickTool0')) + '</span></div>';
    var grp = function (g, title) {
      return '<h2 class="ua-h2">' + esc(title) + '</h2><div class="ua-tiles">' + TOOLS.filter(function (x) { return x.g === g; }).map(function (x) {
        return '<div class="ua-tile" style="background:' + x.tint + '"><a class="ua-tilelink" href="#/' + x.r + '" data-tool="' + x.r + '">' + toolArt(x.k) + '<b>' + esc(toolName(x.k)) + '</b></a><button type="button" class="ua-q" data-info="' + x.k + '" aria-label="' + esc(toolName(x.k)) + ': ?">?</button></div>';
      }).join('') + soon(g) + '</div>';
    };
    // tools still being made: same tile, no link, a "Coming soon" badge
    var soon = function (g) {
      var Ar = A(); if (!Ar || !Ar.soon) return '';
      return Ar.soon.filter(function (x) { return x.grp === g; }).map(function (x) {
        return '<div class="ua-tile soon" style="background:' + x.tint + '"><div class="ua-tilelink"><div class="ua-art one">' + fit(Ar.toolArt(x.k)) + '</div><b>' + esc(isId() ? x.idn : x.en) + '</b><i class="ua-soon">' + esc(t('soon')) + '</i></div></div>';
      }).join('');
    };
    return '<div class="ua-page ua-tools">' + head + top + grp('routine', t('grpRoutine')) + grp('calm', t('grpCalm')) + grp('talk', t('grpTalk')) + grp('teach', t('grpTeach')) + '</div>';
  }
  function wireTools(el) {
    el.addEventListener('click', function (e) {
      var q = e.target.closest('[data-info]'); if (q) { e.preventDefault(); infoSheet(TOOLS.filter(function (x) { return x.k === q.dataset.info; })[0]); return; }
      var h = e.target.closest('[data-hide]'); if (h) { e.preventDefault(); store(h.dataset.hide, '1'); refresh(); return; }
      if (e.target.closest('[data-switch]')) { switcher(); return; }
      var tl = e.target.closest('[data-tool]');
      if (tl && !profiles().length && store('lu_defaults_ok') !== '1' && !/conversation/.test(tl.dataset.tool)) { e.preventDefault(); e.stopPropagation(); skipSheet(tl.dataset.tool); }
    }, true);
  }

  /* ===================== Settings ===================== */
  function seg(name, opts, cur) { return '<div class="ua-seg wide" role="group">' + opts.map(function (o) { return '<button type="button" class="' + (o[0] === cur ? 'on' : '') + '" data-' + name + '="' + o[0] + '" aria-pressed="' + (o[0] === cur) + '">' + esc(o[1]) + '</button>'; }).join('') + '</div>'; }
  function tog(name, on) { return '<button type="button" class="ua-tog' + (on ? ' on' : '') + '" role="switch" aria-checked="' + !!on + '" data-tog="' + name + '"><i></i></button>'; }
  function settingsHTML() {
    var s = S(), st = accStatus(), a = acc(), kids = profiles();
    var accCard = a && a.settingsCard ? a.settingsCard() : '';
    var plusRow = st === 'none' ? '<a class="ua-srow" href="#/plus"><em class="ua-plus">PLUS</em><b>' + esc(t('plusRow')) + '</b><small class="ua-right">' + esc(t('fromPrice')) + '</small><span class="ua-chev">›</span></a>'
      : st === 'free' || st === 'expired' ? '<div class="ua-srow"><em class="ua-plus">PLUS</em><span class="ua-rowtx"><b>' + esc(t('plusRow')) + '</b><small>' + esc(t('plusRowP')) + '</small></span><a class="ua-btn primary sm" href="#/plus">' + esc(t('getPlus')) + '</a></div>' : '';
    var p = prof();
    var kidsRow = '<a class="ua-srow kids" href="#/child">' + (p ? ava(p, 40) : '<span class="ua-ava add" style="width:40px;height:40px">' + ic('plus', 18) + '</span>') + '<span class="ua-rowtx"><b>' + esc(t('children')) + '</b><small>' + esc(kids.length ? kids.map(function (k) { return k.name; }).join(', ') + ' · ' + t('childrenP') : t('noChildYet')) + '</small></span><span class="ua-chev">›</span></a>';
    var set = s ? s.settings : { labels: 'en', sound: true, volume: .6, reduce: false, exit: 'hold' };
    var vol = Math.round((set.volume == null ? .6 : set.volume) * 100);
    var left = '<h1 class="ua-title">' + esc(t('settings')) + '</h1>' + accCard + (accCard ? '' : plusRow) + kidsRow;
    var right =
      '<h3 class="ua-lab">' + esc(t('language')) + '</h3>' + seg('lang', [['en', 'English'], ['id', 'Indonesia']].map(function (x) { return [x[0], x[0] === 'en' ? (isId() ? 'Inggris' : 'English') : (isId() ? 'Indonesia' : 'Indonesian')]; }), lang()) +
      '<h3 class="ua-lab">' + esc(t('cardLabels')) + '</h3>' + seg('labels', [['en', 'Eng'], ['id', 'Indo'], ['both', t('both')], ['none', t('none')]], set.labels) +
      '<div class="ua-panel"><div class="ua-prow"><span class="ua-rowtx"><b>' + esc(t('sounds')) + '</b><small>' + esc(t('soundsP')) + '</small></span>' + tog('sound', set.sound !== false) + '</div>' +
      '<div class="ua-prow vol"><small>' + esc(t('soft')) + '</small><input type="range" min="0" max="100" value="' + vol + '" data-vol aria-label="' + esc(t('sounds')) + '" style="--v:' + vol + '%"><small>' + esc(t('loud')) + '</small></div>' +
      '<div class="ua-prow"><span class="ua-rowtx"><b>' + esc(t('reduce')) + '</b></span>' + tog('reduce', !!set.reduce) + '</div></div>' +
      '<h3 class="ua-lab">' + esc(t('more')) + '</h3><div class="ua-panel links">' +
      [['#/tools/library', t('cardLibrary')], ['#/tools/backup', t('backupShare')], ['#/find-order', t('findOrder')], ['#/faq', t('help')], ['#/about', t('about')]].map(function (l) { return '<a class="ua-prow link" href="' + l[0] + '"><b>' + esc(l[1]) + '</b><span class="ua-chev">›</span></a>'; }).join('') + '</div>';
    if (MODE === 'land') return '<div class="ua-page ua-settings land"><div class="ua-setL">' + left + '</div><div class="ua-setR">' + right + '</div></div>';
    return '<div class="ua-page ua-settings">' + left + right + '</div>';
  }
  function wireSettings(el) {
    el.addEventListener('click', function (e) {
      var s = S(), b;
      if ((b = e.target.closest('[data-lang]'))) { if (window.LU && LU.setLang) LU.setLang(b.dataset.lang); return; }
      if (!s) return;
      if ((b = e.target.closest('[data-labels]'))) { s.settings.labels = b.dataset.labels; api().save(); refresh(); return; }
      if ((b = e.target.closest('[data-exit]'))) { s.settings.exit = b.dataset.exit; api().save(); refresh(); return; }
      if ((b = e.target.closest('[data-tog]'))) { var k = b.dataset.tog; s.settings[k] = !(k === 'sound' ? s.settings.sound !== false : s.settings[k]); api().save(); if (k === 'sound' && s.settings.sound) try { api().chime('pop'); } catch (er) { } DOC.classList.toggle('tl-still', !!s.settings.reduce); refresh(); }
    });
    var r = el.querySelector('[data-vol]');
    if (r) {
      r.addEventListener('input', function () { r.style.setProperty('--v', r.value + '%'); });
      r.addEventListener('change', function () { var s = S(); if (!s) return; s.settings.volume = Number(r.value) / 100; api().save(); try { api().chime('pop'); } catch (e) { } });
    }
  }

  /* ===================== Child ===================== */
  function childHTML() {
    var p = prof(), Ar = A(), a = api();
    var head = '<div class="ua-head plain"><a class="ua-iconbtn" href="#/tools/settings" aria-label="' + esc(t('back')) + '">' + ic('back', 22) + '</a><h1>' + esc(t('child')) + '</h1></div>';
    if (!p) {
      return '<div class="ua-page ua-child empty">' + head + '<div class="ua-empty"><span class="ua-emptyart">' + kidsArt() + '</span><h2>' + esc(t('emptyH')) + '</h2><p>' + esc(t('emptyP')) + '</p><a class="ua-btn primary lg" href="#/tools/setup">' + esc(t('setUpMine')) + '</a><a class="ua-link" href="#/tools/backup">' + esc(t('restore')) + '</a></div></div>';
    }
    var others = profiles().filter(function (x) { return x.id !== p.id; });
    var rewards = (p.rewards || []).slice(0, 10);
    var left = '<div class="ua-kidcard">' + ava(p, 76, 'big') + '<b>' + esc(p.name) + '</b><span style="display:flex;gap:8px;align-items:center"><button type="button" class="ua-btn white sm" data-edit>' + esc(t('edit')) + '</button>' + a.delBtn(p) + '</span></div>' +
      '<div class="ua-panel"><button type="button" class="ua-prow link" data-char><b>' + esc(t('character')) + '</b><span class="ua-charthumb">' + (Ar ? fit(Ar.kid(p.kid || 'boy')).replace('height:100%', 'height:150%') : '') + '</span><span class="ua-chev">›</span></button>' +
      '<div class="ua-prow col"><div class="ua-between"><b>' + esc(t('favRewards')) + '</b><button type="button" class="ua-link" data-rewards>' + esc(t('edit')) + '</button></div><div class="ua-rewards">' + rewards.map(function (r) { return a.cardHTML(r, { size: 'xs', labels: 'none' }); }).join('') + '</div></div></div>';
    var right = '<h3 class="ua-lab">' + esc(t('otherChildren')) + '</h3><div class="ua-panel">' + others.map(function (o) { return '<div class="ua-prow">' + ava(o, 36) + '<b class="ua-grow">' + esc(o.name) + '</b><button type="button" class="ua-link" data-pick="' + esc(o.id) + '">' + esc(t('sw')) + '</button>' + a.delBtn(o) + '</div>'; }).join('') +
      '<a class="ua-prow link" href="#/tools/setup"><span class="ua-ava add" style="width:36px;height:36px">' + ic('plus', 18) + '</span><b class="ua-grow">' + esc(t('addChild')) + '</b></a></div>' +
      '<h3 class="ua-lab">' + esc(t('backupH')) + '</h3><div class="ua-panel"><a class="ua-prow link" href="#/tools/backup"><span class="ua-rowtx"><b>' + esc(t('saveBackup')) + '</b><small>' + esc(t('saveBackupP')) + '</small></span><span class="ua-chev">›</span></a>' +
      '<a class="ua-prow link" href="#/tools/backup"><span class="ua-rowtx"><b>' + esc(t('sendTeacher')) + '</b><small>' + esc(t('sendTeacherP')) + '</small></span><span class="ua-chev">›</span></a></div>';
    if (MODE === 'land') return '<div class="ua-page ua-child land">' + head + '<div class="ua-cols"><div>' + left + '</div><div>' + right + '</div></div></div>';
    return '<div class="ua-page ua-child">' + head + left + right + '</div>';
  }
  function wireChild(el) {
    el.addEventListener('click', function (e) {
      var s = S(), a = api(), p = prof(), b; if (!s || !a) return;
      if ((b = e.target.closest('[data-delp]'))) { if (a.delConfirm(b)) { a.deleteProfile(b.dataset.delp); refresh(); } return; }
      if ((b = e.target.closest('[data-pick]'))) { s.current = b.dataset.pick; a.save(); refresh(); return; }
      if (e.target.closest('[data-edit]')) { a.openProfiles(); return; }
      if (e.target.closest('[data-char]') && p) {
        var w = sheet('<h2 class="ua-sh2">' + esc(t('character')) + '</h2><div class="ua-charpick">' + ['boy', 'girl'].map(function (g) { return '<button type="button" class="' + ((p.kid || 'boy') === g ? 'on' : '') + '" data-kid="' + g + '" aria-label="' + esc(t(g === 'boy' ? 'boyChar' : 'girlChar')) + '">' + fit(A().kid(g)) + '</button>'; }).join('') + '</div>');
        w.addEventListener('click', function (ev) { var k = ev.target.closest('[data-kid]'); if (!k) return; p.kid = k.dataset.kid; a.save(); closeSheet(); refresh(); });
        return;
      }
      if (e.target.closest('[data-rewards]') && p) rewardsSheet(p);
    });
  }
  function rewardsSheet(p) {
    var a = api();
    var draw = function () {
      return '<div class="ua-between"><h2 class="ua-sh2">' + esc(t('favRewards')) + '</h2><button type="button" class="ua-btn dark sm" data-ua-close>' + esc(t('done')) + '</button></div><div class="ua-rewards edit">' +
        (p.rewards || []).map(function (r) { return '<span class="ua-rw">' + a.cardHTML(r, { size: 's' }) + '<button type="button" class="ua-rmv" data-rm="' + esc(r) + '" aria-label="' + esc(t('remove')) + '">' + ic('close', 14, '#fff', 3) + '</button></span>'; }).join('') +
        '<button type="button" class="ua-addrw" data-add>' + ic('plus', 26) + '<small>' + esc(t('addReward')) + '</small></button></div>';
    };
    var w = sheet(draw(), 'tall');
    var sh = w.querySelector('.ua-sheet');
    w.addEventListener('click', function (e) {
      var rm = e.target.closest('[data-rm]');
      if (rm) { p.rewards = (p.rewards || []).filter(function (x) { return x !== rm.dataset.rm; }); a.save(); sh.innerHTML = '<span class="ua-grab"></span>' + draw(); return; }
      if (e.target.closest('[data-add]')) { closeSheet(); a.openPicker(function (ref) { if (ref && (p.rewards || []).indexOf(ref) < 0) { p.rewards = (p.rewards || []).concat(ref); a.save(); } refresh(); setTimeout(function () { rewardsSheet(p); }, 260); }, { title: t('addReward') }); }
    });
    w.addEventListener('transitionend', function () { if (!w.classList.contains('open')) refresh(); });
  }

  /* ===================== page plumbing ===================== */
  var CUR = null;
  function appPage(key, render, wire, title) {
    return function () {
      var main = document.getElementById('lu-main');
      LU.page({
        title: function () { return title(); }, ordersBanner: false,
        init: function () { return load(); },
        render: function () {
          var el = document.getElementById('uaRoot'); if (!el) return;
          CUR = { el: el, render: render, wire: wire };
          el.innerHTML = render();
          if (!el.dataset.wired) { el.dataset.wired = '1'; wire(el); }
          nav();
        }
      });
    };
  }
  function refresh() { if (CUR && CUR.el && CUR.el.isConnected) { CUR.el.innerHTML = CUR.render(); } nav(); }
  function override(key, render, wire, title) {
    var orig = REG[key], run = appPage(key, render, wire, title);
    REG[key] = {
      get html() { return isApp() || !orig ? '<div class="ua-main" id="uaRoot"></div>' : orig.html; },
      run: function () { if (isApp() || !orig) return run(); return orig.run(); }
    };
  }
  function install() {
    override('', homeHTML, wireHome, function () { return 'Little Us'; });
    override('tools', toolsHTML, wireTools, function () { return t('tools'); });
    override('tools/settings', settingsHTML, wireSettings, function () { return t('settings'); });
    override('child', childHTML, wireChild, function () { return t('child'); });
    // on a laptop the Child page lives inside the tools settings
    var c = REG.child, crun = c.run; REG.child = { get html() { return c.html; }, run: function () { if (!isApp()) { if (window.LU) LU.go('#/tools/settings', true); return; } crun(); } };
  }

  // keep the frame in step with every page change
  function watch() {
    var main = document.getElementById('lu-main');
    if (!main) return;
    new MutationObserver(function () {
      nav();
      var r = routeName();
      if (/^tools\/./.test(r) && !/^tools\/(settings|setup|library|backup)$/.test(r)) store('lu_tool_used', '1');
      if (r === 'tools') setTimeout(maybeA2HS, 1200);
      if (isApp()) decorate(r);
    }).observe(main, { childList: true });
    new MutationObserver(function () { nav(); }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
    new MutationObserver(function (ms) { for (var i = 0; i < ms.length; i++) { var t0 = ms[i].target; if (!(t0.closest && t0.closest('.ud-x'))) { deskTick(); return; } } }).observe(document.body, { childList: true, subtree: true });
  }
  // small additions to the shared pages so they read like the app
  function decorate(r) {
    setTimeout(function () {
      var main = document.getElementById('lu-main'); if (!main) return;
      if ((r === 'catalogue' || r === 'articles') && !main.querySelector('.ua-pagetitle')) {
        var h = document.createElement('h1'); h.className = 'ua-pagetitle'; h.textContent = r === 'catalogue' ? t('shopH') : t('articlesH');
        main.insertBefore(h, main.firstChild);
      }
    }, 0);
  }


  /* ===================== desktop homepage (Desktop Home 3a / 4a) =====================
     Laptops keep the website, with the reference's home layout: the three ways to use Little Us along the
     bottom of the banner for visitors, and for signed-in parents the dashboard banner followed by compact
     Tools, Shop and Articles rows. The illustrations are the shaded ones from tools-art.js. */
  var DW = {
    threeWays: ['Three ways to use Little Us', 'Tiga cara memakai Little Us'],
    upgradeTo: ['Upgrade to', 'Upgrade ke'], fromP: ['From', 'Mulai'], for3: ['for 3 months', 'untuk 3 bulan'],
    pb1: ['About 60% more tool styles', 'Sekitar 60% lebih banyak gaya alat'], pb2: ['Save settings up to 6 children', 'Simpan pengaturan hingga 6 anak'],
    pb3: ['Add your own photos and texts', 'Tambah foto dan teks sendiri'], pb4: ['Every resource in the shop', 'Semua materi di toko'],
    explore: ['Explore right away', 'Langsung jelajahi'], createAcc: ['Create an account', 'Buat akun'],
    whyAcc: ['Why create a free account?', 'Kenapa membuat akun gratis?'],
    why1: ['Save your settings, pick up where you left off on any device', 'Simpan pengaturanmu, lanjutkan dari mana saja di perangkat apa pun'],
    why2: ['Can upgrade to unlock all tool styles and resources', 'Bisa upgrade untuk membuka semua gaya alat dan materi'],
    justStart: ['Just start', 'Langsung mulai'], noAccount: ['NO ACCOUNT', 'TANPA AKUN'], justStartP: ['Every tool and free printable. Setup stays on this device.', 'Semua alat dan materi gratis. Pengaturan tersimpan di perangkat ini.'], tryTools: ['Try the free tools', 'Coba alat gratis'],
    freeAcc: ['Free account', 'Akun gratis'], freeAccP: ['Your child’s setup on every phone, tablet and computer.', 'Pengaturan anakmu di setiap HP, tablet, dan komputer.'], makeAcc: ['Make an account', 'Buat akun'],
    upgradeH: ['Upgrade to Little Us', 'Upgrade ke Little Us'], upgradeP: ['Get more tool styles and all our resources', 'Dapatkan lebih banyak gaya alat dan semua materi kami'], seePlans: ['See plans · from $9', 'Lihat paket · mulai $9'], seePlans0: ['See plans', 'Lihat paket'],
    moreDev: ['Use them on more than one device?', 'Mau memakainya di lebih dari satu perangkat?'], moreDevP: ['Without an account, your setup stays on this device. A free account keeps it on your phone and tablet too.', 'Tanpa akun, pengaturanmu hanya tersimpan di perangkat ini. Akun gratis menyimpannya juga di HP dan tablet.'],
    m3: ['3 Months', '3 Bulan'], m6: ['6 Months', '6 Bulan'], m12: ['12 Months', '12 Bulan'],
    tools: ['Tools', 'Alat'], shop: ['Shop', 'Toko'], articles: ['Articles', 'Artikel'], allTools: ['All tools →', 'Semua alat →'], browseShop: ['Browse the shop →', 'Lihat toko →'], allArticles: ['All articles →', 'Semua artikel →'],
    account: ['Account', 'Akun'],
    cWork: ['Worksheet', 'Lembar kerja'], cStory: ['Social story', 'Cerita sosial'], cPrint: ['Printable', 'Materi cetak'],
    cTimer: ['Visual Timer', 'Timer Visual'], cTokens: ['Token Board', 'Papan Token'], cSched: ['Visual Schedule', 'Jadwal Visual']
  };
  function dt(k) { return px(DW[k][isId() ? 1 : 0]); }
  function deskHome() {
    if (isApp() || routeName() !== '') return;
    var main = document.getElementById('lu-main'), hero = main && main.querySelector('.h2-hero');
    if (!hero) return;
    var st = accStatus(), inn = st !== 'none', Ar = A();
    DOC.classList.add('ud-home'); DOC.classList.toggle('ud-in', inn); DOC.classList.toggle('ud-out', !inn);
    deskArt(main, Ar);
    var key = lang() + '|' + st;
    if (main.dataset.ud === key && main.querySelector('.ud-hacts')) return;
    main.dataset.ud = key;
    [].slice.call(main.querySelectorAll('.ud-x')).forEach(function (n) { n.remove(); });
    // visitor banner: "Explore right away" (glides down to the tools) and "Create an account" with a "?" for why
    var copy = hero.querySelector('.h2-copy');
    if (copy) copy.insertAdjacentHTML('beforeend', '<div class="ud-hacts ud-x">' +
      '<a class="btn btn-primary btn-lg" href="#/tools" data-explore="1">' + esc(dt('explore')) + ' <span aria-hidden="true">↓</span></a>' +
      '<span class="ud-accwrap"><a class="btn btn-outline btn-lg ud-accbtn" href="#/signup">' + esc(dt('createAcc')) + '</a>' +
      '<button type="button" class="ud-hq" aria-expanded="false" aria-label="' + esc(dt('whyAcc')) + '">?</button></span></div>');
    var ph = main.querySelector('#hPop');
    // signed in: short section titles, as in the reference
    var tH = main.querySelector('#hTools'), aT = main.querySelector('.h2-head a[href$="tools"]'), aS = main.querySelector('#secPop .h2-head > a');
    if (inn) {
      if (tH) { tH.dataset.udOld = tH.dataset.udOld || tH.textContent; tH.textContent = dt('tools'); }
      if (ph) { ph.dataset.udOld = ph.dataset.udOld || ph.textContent; ph.textContent = dt('shop'); }
      if (aS) { aS.dataset.udOld = aS.dataset.udOld || aS.textContent; aS.textContent = dt('browseShop'); }
    } else {
      [tH, ph, aS].forEach(function (n) { if (n && n.dataset.udOld) { n.textContent = n.dataset.udOld; delete n.dataset.udOld; } });
    }
    // closing: the Upgrade card in place of the list signup (not for members)
    var closing = main.querySelector('.closing'), sg = closing && closing.querySelector('.signup');
    if (sg && st !== 'plus' && st !== 'expiring') {
      // compact, centred card: "Upgrade to Little Us PLUS", what you get, the starting price, one button
      var from = window.LUAcc && LUAcc.priceLabel ? LUAcc.priceLabel('3m') : '';
      sg.insertAdjacentHTML('afterend', '<div class="ud-upcard ud-x"><h3>' + esc(dt('upgradeTo')) + ' <span class="ud-pname">Little Us <em class="ud-plus">PLUS</em></span></h3><p>' + esc(dt('upgradeP')) + '</p>' +
        '<ul class="ud-pben">' + ['pb1', 'pb2', 'pb3', 'pb4'].map(function (k) { return '<li>' + esc(dt(k)) + '</li>'; }).join('') + '</ul>' +
        '<div class="ud-pfoot">' + (from ? '<span class="ud-from">' + esc(dt('fromP')) + ' <b>' + esc(from) + '</b> ' + esc(dt('for3')) + '</span>' : '') + '<a class="btn btn-primary" href="#/plus">' + esc(dt('seePlans0')) + '</a></div></div>');
    }
  }
  // art that other scripts may redraw: put back on every pass
  /* banner collage: real resource covers (when the catalogue has loaded) mixed with the free tools */
  function heroCollage(main, Ar) {
    var art = main.querySelector('.h2-art'); if (!art) return;
    var covers = (window.LUHeroCovers || []).slice(0, 3);
    var sig = lang() + '|' + covers.map(function (c) { return c.id || c.cover_url; }).join(',');
    var old = art.querySelector('.ud-collage');
    if (old && old.dataset.sig === sig) return;
    if (old) old.remove();
    var fb = [['sekolah-gedung', 'cWork', '#DCEBFA'], ['makan', 'cStory', '#DDF2E4'], ['taman', 'cPrint', '#FFF1C7']];
    function res(i) {
      var c = covers[i], f = fb[i];
      if (c) {
        var ttl = (window.LU && LU.title ? LU.title(c) : c.title_en) || '';
        return '<div class="ud-ct"><div class="ud-cimg" style="background:' + f[2] + '"><img src="' + esc(window.LU && LU.imgAt ? LU.imgAt(c.cover_url, 420) : c.cover_url) + '" alt="" loading="lazy"></div><b>' + esc(ttl) + '</b></div>';
      }
      return '<div class="ud-ct"><div class="ud-cimg fb" style="background:' + f[2] + '">' + fit(Ar.svg(f[0], { gender: 'boy' })) + '</div><b>' + esc(dt(f[1])) + '</b></div>';
    }
    function tool(k, lab, bg) { return '<div class="ud-ct tool"><div class="ud-cimg" style="background:' + bg + '">' + fit(Ar.toolArt ? Ar.toolArt(k) : '') + '</div><b>' + esc(dt(lab)) + '<i>' + (isId() ? 'GRATIS' : 'FREE') + '</i></b></div>'; }
    var el = document.createElement('div');
    el.className = 'ud-collage ud-x'; el.dataset.sig = sig; el.setAttribute('aria-hidden', 'true');
    el.innerHTML = res(0) + tool('timer', 'cTimer', '#DCEBFA') + res(1) + tool('tokens', 'cTokens', '#FFF1C7') + res(2) + tool('sched', 'cSched', '#E9E1F7');
    art.appendChild(el); art.classList.add('ud-hascol');
  }
  // desktop banner: the hills are one low strip along the bottom, drawn in full (never cropped)
  function flatHills(main) {
    var h = main.querySelector('.h2-hills');
    if (h && h.getAttribute('preserveAspectRatio') !== 'none') h.setAttribute('preserveAspectRatio', 'none');
    var hero = main.querySelector('.h2-hero');
    if (hero && !hero.querySelector('.ud-flowers')) hero.insertAdjacentHTML('beforeend', meadowHTML());
  }
  // flowers, grass and a butterfly on the hills; drawn separately so they keep their shape
  function meadowHTML() {
    var INK = '#2B2A35';
    function flower(c, mid) {
      return '<svg viewBox="0 0 40 56" aria-hidden="true"><path d="M20 55V26" stroke="#4FA772" stroke-width="3" stroke-linecap="round"/><path d="M20 44c-6-1-10-5-10-10 6 0 9 4 10 10z" fill="#9ED9B0" stroke="' + INK + '" stroke-width="2" stroke-linejoin="round"/>' +
        '<g stroke="' + INK + '" stroke-width="2.2"><circle cx="20" cy="10" r="7" fill="' + c + '"/><circle cx="30" cy="18" r="7" fill="' + c + '"/><circle cx="20" cy="26" r="7" fill="' + c + '"/><circle cx="10" cy="18" r="7" fill="' + c + '"/><circle cx="20" cy="18" r="5.2" fill="' + (mid || '#FFC94A') + '"/></g></svg>';
    }
    function tuft() { return '<svg viewBox="0 0 40 30" aria-hidden="true"><path d="M8 29c-2-10 2-18 8-20M18 29c0-12 6-20 14-21M27 29c1-7 4-11 9-12" fill="none" stroke="#4FA772" stroke-width="3.2" stroke-linecap="round"/></svg>'; }
    var bfly = '<svg viewBox="0 0 44 36" aria-hidden="true"><g class="ud-wings" stroke="' + INK + '" stroke-width="2" stroke-linejoin="round"><path d="M22 18C14 4 4 4 4 12s8 10 18 6z" fill="#F7A8C4"/><path d="M22 18c8-14 18-14 18-6s-8 10-18 6z" fill="#F7A8C4"/><path d="M22 19c-7 3-12 8-9 13s7-4 9-13z" fill="#FFC94A"/><path d="M22 19c7 3 12 8 9 13s-7-4-9-13z" fill="#FFC94A"/></g><path d="M22 10v18" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/></svg>';
    var items = [
      ['t', 1.2, 4, 34], ['f', 4.2, 6, 40, '#F7A8C4'], ['f', 9.5, 2, 30, '#fff'], ['t', 15, 0, 30],
      ['f', 33.6, 4, 32, '#FFE07A', '#F0694F'], ['t', 36.5, 0, 28], ['f', 50, 2, 34, '#F7A8C4'], ['t', 64.8, 2, 30],
      ['f', 67.6, 5, 30, '#fff'], ['f', 86, 3, 34, '#FFE07A', '#F0694F'], ['t', 90.5, 0, 30], ['f', 95, 6, 40, '#fff'], ['t', 97.8, 2, 32]
    ];
    return '<div class="ud-flowers" aria-hidden="true">' + items.map(function (x, i) {
      var st = 'left:' + x[1] + '%;bottom:' + x[2] + 'px;width:' + x[3] + 'px;animation-delay:-' + (i * 0.7 % 3).toFixed(1) + 's;animation-duration:' + (3 + i % 3) + 's';
      return '<span class="ud-fl ' + (x[0] === 't' ? 'tuft' : 'flower') + '" style="' + st + '">' + (x[0] === 't' ? tuft() : flower(x[4], x[5])) + '</span>';
    }).join('') + '<span class="ud-bfly">' + bfly + '</span></div>';
  }
  function deskArt(main, Ar) {
    // banner picture: a grown-up and child with a tablet (hero-family.webp, transparent background)
    var hart = main.querySelector('.h2-hero .h2-art');
    if (hart && !hart.querySelector('.ud-heroimg')) hart.insertAdjacentHTML('beforeend', '<img class="ud-heroimg ud-x" src="/hero-family.webp?v=5" width="1000" height="598" alt="" fetchpriority="high" decoding="async">');
    if (!Ar) return;
    flatHills(main);
    var cov = main.querySelector('#heroCover');
    if (cov && !cov.querySelector('.ud-page')) { cov.classList.add('ud-cov'); cov.insertAdjacentHTML('beforeend', '<span class="ud-page ud-x"><u></u><u class="s"></u><i>' + fit(Ar.svg('sekolah-gedung', { gender: 'boy' })) + '</i><u></u><u class="s"></u></span>'); }
    var tv = main.querySelector('.h2-tool[href$="tools/timer"] .h2-vis');
    if (tv && Ar.toolArt && !tv.querySelector('.ud-timer')) tv.insertAdjacentHTML('afterbegin', '<span class="ud-timer ud-x">' + fit(Ar.toolArt('timer')) + '</span>');
    if (DOC.classList.contains('ud-in')) { toolBadges(main); fitPreviews(main); }
    [].slice.call(main.querySelectorAll('.la-used')).forEach(function (a) {
      var ic = a.querySelector('.ic'); if (!ic || ic.querySelector('.ud-ic')) return;
      var h = a.getAttribute('href') || '', k = /timer/.test(h) ? 'timer' : /tokens/.test(h) ? 'tokens' : /first-then/.test(h) ? 'ft' : /schedule/.test(h) ? 'sched' : /conversation/.test(h) ? 'talk' : '';
      var C = window.LUCalm && LUCalm.art, art = k && Ar.toolArt ? Ar.toolArt(k) : '';
      if (!art) return;
      ic.innerHTML = '<span class="ud-ic ud-x">' + fit(art) + '</span>';
    });
  }
  // signed-in Tools row: a "?" on each preview that shows what the tool is for
  var QCOL = { timer: '#3F6FA8', tokens: '#9A6A00', 'first-then': '#2F7A4D', schedule: '#6B55C8', breathe: '#3F6FA8', feelings: '#6B55C8', worry: '#C2456A', 'conversation-starters': '#9A6A00' };
  function toolBadges(main) {
    [].slice.call(main.querySelectorAll('.h2-tool:not(.soon)')).forEach(function (a) {
      var vis = a.querySelector('.h2-vis'); if (!vis || vis.querySelector('.ud-q')) return;
      var k = (a.getAttribute('href') || '').replace(/^.*tools\//, ''), name = (a.querySelector('h3') || {}).textContent || '';
      vis.insertAdjacentHTML('beforeend', '<span class="ud-q ud-x" role="button" tabindex="0" aria-label="' + esc((isId() ? 'Tentang ' : 'About ') + name) + '" style="background:' + (QCOL[k] || '#2B2A35') + '">?</span>');
    });
  }
  // tapping "?" opens a small popup next to it with what the tool is for, and a button to open it
  var POP = null;
  function closeInfo() { if (POP) { var q = POP.q; POP.el.remove(); POP = null; if (q) q.setAttribute('aria-expanded', 'false'); } }
  function toggleInfo(e) {
    var q = e.target.closest && e.target.closest('.ud-q, .ud-hq');
    if (!q) { if (POP && e.type === 'click' && !POP.el.contains(e.target)) closeInfo(); if (POP && e.type === 'keydown' && e.key === 'Escape') closeInfo(); return; }
    if (e.type === 'keydown' && e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault(); e.stopPropagation();
    var same = POP && POP.q === q; closeInfo(); if (same) return;
    var el = document.createElement('div');
    el.className = 'ud-pop'; el.setAttribute('role', 'dialog');
    if (q.classList.contains('ud-hq')) {
      // the banner's "?": why a free account helps
      el.setAttribute('aria-label', dt('whyAcc'));
      el.innerHTML = '<b>' + esc(dt('whyAcc')) + '</b><div class="ud-why"><p><i aria-hidden="true">✓</i>' + esc(dt('why1')) + '</p><p><i aria-hidden="true">✓</i>' + esc(dt('why2')) + '</p></div>';
    } else {
      var card = q.closest('.h2-tool'), name = ((card.querySelector('h3') || {}).textContent || '').trim(), desc = ((card.querySelector('p') || {}).textContent || '').trim();
      el.setAttribute('aria-label', name);
      el.innerHTML = '<b>' + esc(name) + '</b><p>' + esc(desc) + '</p><a class="btn btn-primary btn-sm" href="' + esc(card.getAttribute('href') || '#/tools') + '">' + esc(isId() ? 'Buka alat' : 'Open tool') + ' →</a>';
    }
    document.body.appendChild(el);
    var r = q.getBoundingClientRect(), w = el.offsetWidth, x = Math.min(Math.max(12, r.left + r.width / 2 - w / 2), window.innerWidth - w - 12);
    el.style.left = x + window.scrollX + 'px'; el.style.top = r.bottom + window.scrollY + 10 + 'px';
    el.style.setProperty('--ax', (r.left + r.width / 2 - x) + 'px');
    POP = { el: el, q: q }; q.setAttribute('aria-expanded', 'true');
    el.addEventListener('click', function (ev) { if (ev.target.closest('a')) closeInfo(); });
  }
  document.addEventListener('click', toggleInfo, true);
  // banner "Explore right away": glide down to the Free Tools section instead of leaving the page
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('[data-explore]'); if (!a) return;
    var main = document.getElementById('lu-main'), h = main && main.querySelector('#hTools'), sec = h && (h.closest('section') || h);
    if (!sec) return;
    e.preventDefault(); e.stopPropagation();
    var reduce = false; try { reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (er) { }
    window.scrollTo({ top: sec.getBoundingClientRect().top + window.scrollY - 20, behavior: reduce ? 'auto' : 'smooth' });
  }, true);
  document.addEventListener('keydown', toggleInfo, true);
  window.addEventListener('resize', closeInfo);
  // shrink each preview drawing so it fits inside its box (stars, schedule cards and faces used to spill over)
  // previews are drawn in after the page appears, so each box refits whenever its drawing changes
  var fitWatch = window.MutationObserver ? new MutationObserver(function (list) {
    var seen = []; list.forEach(function (m) { var v = m.target.closest && m.target.closest('.h2-vis'); if (v && seen.indexOf(v) < 0) seen.push(v); });
    if (seen.length) requestAnimationFrame(function () { var m = document.getElementById('lu-main'); if (m && DOC.classList.contains('ud-in')) fitPreviews(m); });
  }) : null;
  function fitPreviews(main) {
    [].slice.call(main.querySelectorAll('.h2-tool .h2-vis')).forEach(function (vis) {
      if (fitWatch && !vis.dataset.fitw) { vis.dataset.fitw = '1'; fitWatch.observe(vis, { childList: true, subtree: true }); }
      var bw = vis.clientWidth - 16, bh = vis.clientHeight - 20; if (bw <= 0) return;
      [].slice.call(vis.children).forEach(function (el) {
        if (el.classList.contains('ud-q') || getComputedStyle(el).display === 'none') return;
        // measure what is actually drawn (the children), not a wrapper that stretches to the box.
        // offset sizes are layout sizes, so the current scale doesn't affect them (no reset, no restarted animation)
        var er = el.getBoundingClientRect(), now = el.offsetWidth ? er.width / el.offsetWidth : 1; // the scale on screen right now
        var ks = el.children.length ? [].slice.call(el.children) : [el];
        var l = Infinity, r = -Infinity, tp = Infinity, b = -Infinity;
        ks.forEach(function (k) {
          var x, y, kw, kh;
          if (k === el) { x = 0; y = 0; kw = el.offsetWidth; kh = el.offsetHeight; }
          else { var kr = k.getBoundingClientRect(); x = (kr.left - er.left) / now; y = (kr.top - er.top) / now; kw = kr.width / now; kh = kr.height / now; }
          l = Math.min(l, x); r = Math.max(r, x + kw); tp = Math.min(tp, y); b = Math.max(b, y + kh);
        });
        var w = Math.max(r - l, el.scrollWidth > el.offsetWidth ? el.scrollWidth : 0), h = b - tp;
        var s = Math.min(1, bw / (w || 1), bh / (h || 1)).toFixed(3);
        if (el.style.getPropertyValue('--fit') !== s) el.style.setProperty('--fit', s);
      });
    });
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { var m = document.getElementById('lu-main'); if (m && DOC.classList.contains('ud-in')) fitPreviews(m); });
  var fq = 0;
  window.addEventListener('resize', function () { clearTimeout(fq); fq = setTimeout(function () { var m = document.getElementById('lu-main'); if (m && DOC.classList.contains('ud-in')) fitPreviews(m); }, 150); });
  function deskHeader() {
    if (isApp()) return;
    var btn = document.querySelector('.la-hdr-login');
    if (btn && !btn.classList.contains('ud-icon')) { btn.classList.add('ud-icon'); var lbl = isId() ? 'Masuk' : 'Login'; btn.setAttribute('aria-label', lbl); btn.innerHTML = svgI('<circle cx="12" cy="8.5" r="3.8"/><path d="M4.5 20.5c1-4 4-6.2 7.5-6.2s6.5 2.2 7.5 6.2"/>', 22, '#2B2A35', 2) + '<span>' + esc(lbl) + '</span>'; }
  }
  var dq = 0;
  function deskTick() { clearTimeout(dq); dq = setTimeout(function () { if (!isApp()) { if (routeName() !== '') DOC.classList.remove('ud-home', 'ud-in', 'ud-out'); deskHome(); deskHeader(); } }, 60); }
  window.LUApp = { isApp: isApp, mode: function () { return MODE; }, refresh: refresh, nav: nav, switcher: switcher, langAsk: langAsk };
  install();
  function start() { splash(); nav(); watch(); var tries = 0, iv = setInterval(function () { if (api() || ++tries > 60) { clearInterval(iv); nav(); } }, 250); if (isApp() && routeName() === '' && document.getElementById('lu-main')) { } }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
  if (window.LUAcc && LUAcc.onChange) LUAcc.onChange(function () { refresh(); var m = document.getElementById('lu-main'); if (m) delete m.dataset.ud; deskTick(); });
})();

/* Lighter pages: looping animations (clouds, sun, butterflies, timer previews) pause while their part of the page
   is scrolled out of view, so phones are not busy drawing what nobody can see. The child's full-screen view is never paused. */
(function () {
  if (!('IntersectionObserver' in window) || !document.getAnimations) return;
  var seen = new WeakSet();
  var io = new IntersectionObserver(function (list) {
    list.forEach(function (en) { en.target.classList.toggle('lu-off', !en.isIntersecting); });
  }, { rootMargin: '120px 0px' });
  function scan() {
    try {
      document.getAnimations().forEach(function (a) {
        var t = a.effect && a.effect.target; if (!t || !t.closest || t.closest('#tl-child')) return;
        var box = t.closest('section, header, .tl-previewbox, .tl-grid, .tl-panel, .la-dash, .ud-way, .ua-hero, .h2-tool') || null;
        if (box && !seen.has(box)) { seen.add(box); io.observe(box); }
      });
    } catch (e) {}
  }
  setInterval(function () { if (document.visibilityState === 'visible') scan(); }, 3000);
  window.addEventListener('hashchange', function () { setTimeout(scan, 600); });
  setTimeout(scan, 1200);
})();

/* Scroll safety net: a full-screen game (cs-lock), the child view (tl-childon) or the phone menu (locked) stop the page
   from scrolling while they are open. If one of them is left by a link (e.g. "Back to tools") without cleaning up,
   remove the lock once its screen is gone, so the homepage can always scroll. */
(function () {
  function unlock() {
    var html = document.documentElement, body = document.body; if (!body) return;
    if (html.classList.contains('cs-lock') && !document.querySelector('.cs-app.cs-full')) html.classList.remove('cs-lock');
    if (body.classList.contains('tl-childon') && !document.getElementById('tl-child')) body.classList.remove('tl-childon');
    if (body.classList.contains('locked')) { var dr = document.getElementById('drawer'); if (!dr || dr.getAttribute('aria-hidden') === 'true') body.classList.remove('locked'); }
  }
  ['popstate', 'hashchange', 'pageshow', 'focus'].forEach(function (ev) { window.addEventListener(ev, function () { setTimeout(unlock, 50); setTimeout(unlock, 600); }); });
  document.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('a[href], [data-back], [data-exit]')) { setTimeout(unlock, 300); setTimeout(unlock, 1200); } }, true);
  setInterval(unlock, 1500);
})();
