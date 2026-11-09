/* Little Us · DTT · fun breaks: short games between trials. They are never trials, are never saved, can always be skipped,
   last at most 12 seconds, and have no wrong answer, because any tap works. Each one is re-skinned with the chosen themes' characters.
   Every break shows its instruction as large text at the top (no voice: the grown-up reads it out), and a hand points at what to tap. */
(function () {
  'use strict';
  var D = window.LUDtt, T = D.i18n.T, esc = LUTools.api.esc, TH = D.themes, RF = D.reinforcement, DEF = D.defaults, R = D.reinforce;
  var MAX_MS = 12000, END_MS = 1900, HINT_MS = 1400, last = null, active = null;
  var INK = TH.INK, O = ' stroke="' + INK + '" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"';

  function pool(themes, n) { return D.targets.shuffle(TH.pool(themes)).slice(0, n); }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function nm(c) { return T(c.name[0], c.name[1]); }
  function themeOf(c) { return TH.THEMES.filter(function (t) { return t.id === c.theme; })[0]; }
  function svg(inner, cls, box) { return '<svg class="' + cls + '" viewBox="' + (box || '0 0 120 120') + '" aria-hidden="true">' + inner + '</svg>'; }

  /* ---------- the scene behind each break: sky, ground and a few moving details, drawn per theme ---------- */
  // small soft stars with no outline, so the background stays quiet behind the characters
  function softStar(cx, cy, r, f) {
    var d = '';
    for (var i = 0; i < 10; i++) { var a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? r * 0.45 : r; d += (i ? 'L' : 'M') + (cx + q * Math.cos(a)).toFixed(1) + ' ' + (cy + q * Math.sin(a)).toFixed(1); }
    return '<path d="' + d + 'Z" fill="' + f + '" stroke="' + f + '" stroke-width="2" stroke-linejoin="round"/>';
  }
  function twinkles(n, col) {
    var h = '';
    for (var i = 0; i < n; i++) h += '<g class="gd-twinkle" style="animation-delay:' + (i * 0.37 % 2).toFixed(2) + 's">' + softStar(20 + (i * 83) % 360, 18 + (i * 47) % 150, 3 + i % 3 * 2, col) + '</g>';
    return h;
  }
  function bubbles(n) {
    var h = '';
    for (var i = 0; i < n; i++) h += '<g class="gd-rise" style="animation-delay:' + (i * 0.9).toFixed(1) + 's;animation-duration:' + (6 + i % 3) + 's"><circle cx="' + (30 + (i * 61) % 340) + '" cy="300" r="' + (5 + i % 3 * 3) + '" fill="rgba(255,255,255,.55)" stroke="#fff" stroke-width="2"/></g>';
    return h;
  }
  function clouds(n) {
    var h = '';
    for (var i = 0; i < n; i++) { var y = 30 + i * 34, x = (i * 140) % 360; h += '<g class="gd-drift" style="animation-delay:-' + (i * 6) + 's"><path d="M' + x + ' ' + y + 'q-14 0-12-12q4-12 18-8q6-14 22-8q12 4 10 16q12 2 8 12z" fill="#fff" opacity=".9"/></g>'; }
    return h;
  }
  function flowers(n) {
    var h = '', cols = ['#F6B3C2', '#FFC94A', '#B9A3E3', '#F0694F'];
    for (var i = 0; i < n; i++) {
      var x = 18 + (i * 53) % 370, y = 262 + (i % 3) * 10;
      h += '<g class="gd-sway" style="animation-delay:' + (i * 0.3).toFixed(1) + 's"><path d="M' + x + ' ' + (y + 30) + 'V' + y + '" stroke="#4E9A63" stroke-width="3"/>' +
        [0, 72, 144, 216, 288].map(function (a) { var r = a * Math.PI / 180; return '<circle cx="' + (x + 6 * Math.cos(r)).toFixed(1) + '" cy="' + (y + 6 * Math.sin(r)).toFixed(1) + '" r="5" fill="' + cols[i % 4] + '"/>'; }).join('') + '<circle cx="' + x + '" cy="' + y + '" r="3.5" fill="#FFF8EC"/></g>';
    }
    return h;
  }
  var SCENES = {
    space: { sky: ['#3C3770', '#6E5FB0'], dark: true, deco: function () { return twinkles(16, '#FFE27A') + '<g class="gd-float"><ellipse cx="350" cy="52" rx="30" ry="8" fill="none" stroke="#FFC94A" stroke-width="4"/><circle cx="350" cy="52" r="18" fill="#F0694F"/></g><path d="M0 280 Q200 250 400 280 V300 H0Z" fill="#B7BCC8"/><circle cx="90" cy="285" r="7" fill="#9FA4B2"/><circle cx="300" cy="288" r="9" fill="#9FA4B2"/>'; } },
    sea: { sky: ['#BFE0F7', '#5FA8DE'], deco: function () { return bubbles(9) + '<path d="M0 278 Q100 268 200 278 T400 278 V300 H0Z" fill="#F4DDA8"/>' + [30, 110, 330, 370].map(function (x, i) { return '<g class="gd-sway" style="animation-delay:' + i * 0.4 + 's"><path d="M' + x + ' 290 q-10-20 0-40 q10-20 0-40" fill="none" stroke="#4E9A63" stroke-width="6" stroke-linecap="round"/></g>'; }).join(''); } },
    garden: { sky: ['#DCEFFB', '#FFF6DA'], deco: function () { return '<g class="gd-spin"><circle cx="350" cy="44" r="22" fill="#FFC94A"/></g>' + clouds(2) + '<path d="M0 262 Q120 236 220 258 T400 252 V300 H0Z" fill="#9FD8AE"/>' + flowers(8); } },
    fantasy: { sky: ['#FBE0E6', '#E9E1F7'], deco: function () { return '<g opacity=".75">' + ['#F0694F', '#FFC94A', '#7FCB98', '#7DB3E8', '#B9A3E3'].map(function (c, i) { return '<path d="M30 300 A170 170 0 0 1 370 300" fill="none" stroke="' + c + '" stroke-width="10" transform="translate(0 ' + (i * 10) + ')"/>'; }).join('') + '</g>' + twinkles(10, '#FFF8EC') + '<path d="M0 280 Q200 262 400 280 V300 H0Z" fill="#C9E9D2"/>'; } },
    vehicles: { sky: ['#DCEBFA', '#FFE9DA'], deco: function () { return clouds(3) + '<rect x="0" y="262" width="400" height="38" fill="#6B6875"/><g class="gd-road">' + [0, 1, 2, 3, 4, 5, 6, 7, 8].map(function (i) { return '<rect x="' + (i * 56) + '" y="279" width="28" height="5" rx="2" fill="#FFF8EC"/>'; }).join('') + '</g>'; } },
    weather: { sky: ['#BFE0F7', '#FFF1C7'], deco: function () { return '<g class="gd-spin"><circle cx="70" cy="60" r="26" fill="#FFC94A"/>' + [0, 45, 90, 135, 180, 225, 270, 315].map(function (a) { var r = a * Math.PI / 180; return '<path d="M' + (70 + 34 * Math.cos(r)).toFixed(1) + ' ' + (60 + 34 * Math.sin(r)).toFixed(1) + 'L' + (70 + 44 * Math.cos(r)).toFixed(1) + ' ' + (60 + 44 * Math.sin(r)).toFixed(1) + '" stroke="#FFC94A" stroke-width="5" stroke-linecap="round"/>'; }).join('') + '</g>' + clouds(3) + '<path d="M0 270 Q200 252 400 270 V300 H0Z" fill="#9FD8AE"/>'; } }
  };
  function scene(themes) {
    var t = TH.chosen(themes); t = t[Math.floor(Math.random() * t.length)];
    var s = SCENES[t.id] || SCENES.garden;
    return { theme: t, dark: !!s.dark, bg: 'linear-gradient(180deg,' + s.sky[0] + ',' + s.sky[1] + ')', art: '<svg class="dtt-gdeco" viewBox="0 0 400 300" preserveAspectRatio="xMidYMax slice" aria-hidden="true">' + s.deco() + '</svg>' };
  }

  /* ---------- art used by the games ---------- */
  var COVERS = {
    bush: '<ellipse cx="60" cy="80" rx="58" ry="40" fill="#7FCB98"' + O + '/><circle cx="26" cy="62" r="24" fill="#7FCB98"' + O + '/><circle cx="92" cy="60" r="26" fill="#7FCB98"' + O + '/><circle cx="58" cy="52" r="24" fill="#7FCB98"' + O + '/><circle cx="40" cy="80" r="4" fill="#F0694F"/><circle cx="82" cy="88" r="4" fill="#F0694F"/>',
    rock: '<path d="M2 118 Q6 56 40 44 Q80 30 112 66 Q120 92 118 118Z" fill="#B7BCC8"' + O + '/><path d="M30 70 Q44 62 56 68M74 84 Q86 78 96 84" fill="none"' + O + '/>',
    cloud: '<path d="M16 112 Q-6 104 4 78 Q10 58 32 62 Q40 32 70 38 Q98 40 96 66 Q122 68 116 94 Q112 112 92 112Z" fill="#FFFFFF"' + O + '/>',
    moon: '<path d="M0 120 Q8 52 60 50 Q112 52 120 120Z" fill="#E7E1F2"' + O + '/><circle cx="34" cy="86" r="8" fill="#C9C2DA"/><circle cx="84" cy="96" r="10" fill="#C9C2DA"/><circle cx="62" cy="70" r="5" fill="#C9C2DA"/>',
    garage: '<rect x="6" y="46" width="108" height="72" rx="6" fill="#F5873B"' + O + '/><path d="M6 66H114M6 86H114M6 104H114" fill="none"' + O + '/>'
  };
  var OPENERS = {
    egg: function (n) { return '<path d="M60 8 Q100 40 96 76 Q92 112 60 112 Q28 112 24 76 Q20 40 60 8Z" fill="#FFF8EC"' + O + '/><circle cx="46" cy="40" r="5" fill="#F6B3C2"/><circle cx="74" cy="64" r="6" fill="#B9A3E3"/><circle cx="48" cy="92" r="5" fill="#7FCB98"/>' + (n > 0 ? '<path d="M34 58 L46 68 L56 56 L64 66" fill="none"' + O + '/>' : '') + (n > 1 ? '<path d="M60 80 L72 70 L80 82 L90 74" fill="none"' + O + '/>' : ''); },
    chest: function (n) { var y = 22 - n * 8; return '<rect x="14" y="56" width="92" height="50" rx="8" fill="#B98157"' + O + '/><path d="M14 56 Q14 ' + y + ' 60 ' + y + ' Q106 ' + y + ' 106 56Z" fill="#F5873B"' + O + '/><rect x="52" y="48" width="16" height="18" rx="4" fill="#FFC94A"' + O + '/>' + (n ? TH.star(60, 44 - n * 6, 6 + n * 2, '#FFE27A') : ''); },
    garage: function (n) { var top = 30 + n * 20; return '<path d="M4 34 L60 6 L116 34Z" fill="#E5484D"' + O + '/><rect x="8" y="30" width="104" height="82" rx="6" fill="#4A4855"' + O + '/><rect x="8" y="' + top + '" width="104" height="' + (82 - n * 20) + '" rx="6" fill="#F5873B"' + O + '/>'; },
    launch: function (n) { return '<g transform="translate(0,' + (-n * 7) + ')">' + TH.THEMES[0].characters[1].art + '</g>' + (n ? '<path d="M42 116 Q60 ' + (116 - n * 6) + ' 78 116Z" fill="#FFC94A"' + O + '/>' : ''); },
    cloud: function (n) { return COVERS.cloud.replace('#FFFFFF', n ? '#DCEBFA' : '#FFFFFF') + (n ? '<path d="M' + (36 + n * 8) + ' 114 l-4 10 M' + (66 + n * 4) + ' 114 l-4 10 M' + (90 - n * 2) + ' 114 l-4 10" fill="none" stroke="#5FA8DE" stroke-width="4" stroke-linecap="round"/>' : ''); }
  };
  var TREATS = {
    star: { art: function () { return TH.star(30, 30, 26, '#FFC94A'); }, name: ['star', 'bintang'] },
    shell: { art: function () { return '<path d="M30 54 Q4 40 8 24 Q14 6 30 6 Q46 6 52 24 Q56 40 30 54Z" fill="#F6B3C2"' + O + '/><path d="M30 54 V14M30 54 L16 22M30 54 L44 22" fill="none"' + O + '/>'; }, name: ['shell', 'kerang'] },
    leaf: { art: function () { return '<path d="M8 52 Q4 8 52 6 Q56 54 8 52Z" fill="#7FCB98"' + O + '/><path d="M8 52 L34 26" fill="none"' + O + '/>'; }, name: ['leaf', 'daun'] },
    fuel: { art: function () { return '<rect x="12" y="14" width="36" height="42" rx="6" fill="#E5484D"' + O + '/><rect x="22" y="4" width="16" height="12" rx="3" fill="#4A4855"' + O + '/><path d="M20 30 H40" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/>'; }, name: ['fuel', 'bensin'] }
  };
  var POPS = {
    bubble: { name: ['bubbles', 'gelembung'], art: function () { return '<circle cx="30" cy="30" r="25" fill="rgba(220,235,250,.85)"' + O + '/><path d="M16 22 Q20 12 30 10" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/><circle cx="40" cy="40" r="3" fill="#fff"/>'; } },
    balloon: { name: ['balloons', 'balon'], art: function (i) { return '<path d="M30 54 q-4 8 2 14" fill="none" stroke="' + INK + '" stroke-width="2.5"/><ellipse cx="30" cy="27" rx="22" ry="25" fill="var(--dtt-c' + (1 + i % 5) + ')"' + O + '/><path d="M26 52 L34 52 L30 56Z" fill="' + INK + '"/><path d="M18 18 Q22 10 30 9" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".8"/>'; }, box: '0 0 60 72' },
    star: { name: ['stars', 'bintang'], art: function () { return TH.star(30, 30, 27, '#FFC94A') + TH.face(30, 32, 0.55); } }
  };
  var HAND = '<svg class="dtt-ghand" viewBox="0 0 64 76" aria-hidden="true"><path d="M22 8 Q28 1 34 8 V34 Q40 30 46 34 Q52 31 56 37 Q62 36 62 44 V56 Q62 72 44 72 H34 Q22 72 16 60 L6 42 Q4 34 12 34 Q16 34 22 42Z" fill="#fff" stroke="' + INK + '" stroke-width="4" stroke-linejoin="round"/><path d="M34 34 V46M46 36 V46" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/></svg>';

  /* ---------- the games. Each sets its instruction (cue) and what the "done" line says ---------- */
  var GAMES = {
    // a dark silhouette fills with colour when tapped
    shadow: function (g) {
      var c = pool(g.themes, 1)[0];
      g.cue(T('Who is hiding in the shadow?', 'Siapa yang bersembunyi di bayangan?'), T('Tap the shadow to find out!', 'Ketuk bayangannya!'));
      g.el.innerHTML = '<button type="button" class="dtt-gamebtn dtt-gin" data-tap aria-label="' + esc(T('Show who it is', 'Tampilkan siapa ini')) + '">' + TH.svg(c, 'dtt-char big dark wobble') + '</button>';
      g.on(function () { var s = g.el.querySelector('svg'); s.classList.remove('dark', 'wobble'); s.classList.add('joy'); g.sound(c.sound); g.win(T('It\'s the ' + nm(c) + '!', 'Ternyata ' + nm(c) + '!'), s); });
    },
    // the top of a character shows from behind something, and a tap makes it jump out
    peek: function (g) {
      var c = pool(g.themes, 1)[0], cover = COVERS[themeOf(c).cover] || COVERS.bush;
      g.cue(T('Someone is hiding!', 'Ada yang bersembunyi!'), T('Tap to make them jump out!', 'Ketuk supaya dia melompat keluar!'));
      g.el.innerHTML = '<button type="button" class="dtt-gamebtn dtt-peekwrap dtt-gin" data-tap aria-label="' + esc(T('Make it jump out', 'Buat melompat keluar')) + '">' + TH.svg(c, 'dtt-char peeking') + svg(cover, 'dtt-cover') + '</button>';
      g.on(function () { var s = g.el.querySelector('.peeking'); s.classList.remove('peeking'); s.classList.add('jumped'); g.sound(c.sound); g.win(T('Peekaboo, ' + nm(c) + '!', 'Cilukba, ' + nm(c) + '!'), s); });
    },
    // a zoomed-in part, and a tap reveals the whole
    closeup: function (g) {
      var c = pool(g.themes, 1)[0], x = 25 + Math.round(Math.random() * 30), y = 25 + Math.round(Math.random() * 30);
      g.cue(T('What is it?', 'Apa ini?'), T('Tap the circle to see all of it!', 'Ketuk lingkarannya untuk melihat semuanya!'));
      g.el.innerHTML = '<button type="button" class="dtt-gamebtn dtt-zoom dtt-gin" data-tap aria-label="' + esc(T('See all of it', 'Lihat seluruhnya')) + '">' + svg(c.art, 'dtt-char big', x + ' ' + y + ' 40 40') + '</button>';
      g.on(function () { var b = g.el.querySelector('.dtt-zoom'), s = b.querySelector('svg'); b.classList.add('open'); s.setAttribute('viewBox', '0 0 120 120'); s.classList.add('joy'); g.sound(c.sound); g.win(T('It\'s the ' + nm(c) + '!', 'Ternyata ' + nm(c) + '!'), s); });
    },
    // one silly part flies away when tapped
    silly: function (g) {
      var c = pool(g.themes, 1)[0], parts = [
        ['<circle cx="60" cy="60" r="12" fill="#E5484D"' + O + '/><circle cx="56" cy="56" r="3" fill="#fff"/>', ['a red nose', 'hidung merah']],
        ['<path d="M34 72 Q46 62 60 72 Q74 62 86 72 Q74 84 60 76 Q46 84 34 72Z" fill="#4A4855"' + O + '/>', ['a moustache', 'kumis']],
        ['<path d="M30 30 L60 0 L90 30Z" fill="#B9A3E3"' + O + '/><circle cx="60" cy="2" r="6" fill="#FFC94A"' + O + '/><circle cx="50" cy="20" r="3" fill="#FFF8EC"/><circle cx="68" cy="16" r="3" fill="#FFF8EC"/>', ['a party hat', 'topi pesta']]
      ], p = pick(parts);
      g.cue(T('Silly ' + nm(c) + ' has ' + p[1][0] + '!', nm(c) + ' memakai ' + p[1][1] + '!'), T('Tap to take it off!', 'Ketuk untuk melepasnya!'));
      g.el.innerHTML = '<button type="button" class="dtt-gamebtn dtt-silly dtt-gin" data-tap aria-label="' + esc(T('Take away the silly part', 'Lepaskan bagian yang lucu')) + '">' + TH.svg(c, 'dtt-char big') + svg(p[0], 'dtt-char big dtt-sillypart') + '</button>';
      g.on(function () { g.el.querySelector('.dtt-sillypart').classList.add('fly'); var s = g.el.querySelector('svg'); s.classList.add('joy'); g.sound('whoosh'); g.win(T('That\'s better!', 'Nah, begitu!'), s); });
    },
    // three taps open an egg, chest or garage door, or launch a rocket
    open: function (g) {
      var c = pool(g.themes, 1)[0], kind = themeOf(c).opener || 'egg', n = 0;
      var what = { egg: ['the egg', 'telurnya'], chest: ['the treasure chest', 'peti hartanya'], garage: ['the garage', 'garasinya'], launch: ['the rocket', 'roketnya'], cloud: ['the cloud', 'awannya'] }[kind];
      g.cue(T('What is inside ' + what[0] + '?', 'Ada apa di dalam ' + what[1] + '?'), T('Tap it 3 times!', 'Ketuk 3 kali!'));
      function draw() { g.el.innerHTML = '<button type="button" class="dtt-gamebtn' + (n ? '' : ' dtt-gin') + '" data-tap aria-label="' + esc(T('Tap to open', 'Ketuk untuk membuka')) + '">' + svg(OPENERS[kind](n), 'dtt-char big ' + (n ? 'shake' : 'wobble')) + '</button>' + '<div class="dtt-gametaps" aria-hidden="true">' + [0, 1, 2].map(function (i) { return '<i class="' + (i < n ? 'on' : '') + '">' + (i + 1) + '</i>'; }).join('') + '</div>'; }
      draw();
      g.on(function () {
        n++;
        if (n < 3) { R.charSound('boop', g.prefs, 0); draw(); g.sub(n === 1 ? T('2 more taps!', '2 kali lagi!') : T('1 more tap!', '1 kali lagi!')); return false; }
        g.el.innerHTML = '<div class="dtt-gin">' + TH.svg(c, 'dtt-char big joy') + '</div>'; g.sound(c.sound); g.win(T('Hello, ' + nm(c) + '!', 'Halo, ' + nm(c) + '!'), g.el.querySelector('svg'));
      });
    },
    // drag an item to the character, or tap it
    feed: function (g) {
      var c = pool(g.themes, 1)[0], tr = TREATS[themeOf(c).treat] || TREATS.star;
      g.cue(T('Give the ' + tr.name[0] + ' to ' + nm(c) + '!', 'Berikan ' + tr.name[1] + ' ke ' + nm(c) + '!'), T('Drag it over, or just tap it.', 'Geser ke sana, atau ketuk saja.'));
      g.el.innerHTML = '<div class="dtt-feed">' + '<div class="dtt-gin">' + TH.svg(c, 'dtt-char big wobble') + '</div><button type="button" class="dtt-gamebtn dtt-treat dtt-gin" data-tap aria-label="' + esc(T('Give it', 'Berikan')) + '">' + svg(tr.art(), 'dtt-treatart', '0 0 60 60') + '</button></div>';
      var t = g.el.querySelector('.dtt-treat'), done = false, ox = 0, oy = 0;
      function give() {
        if (done) return; done = true; g.tapped();
        var ch = g.el.querySelector('.dtt-char'), a = t.getBoundingClientRect(), b = ch.getBoundingClientRect();
        t.style.transition = 'transform .45s ease, opacity .3s ease .35s'; t.style.transform = 'translate(' + (b.left + b.width / 2 - a.left - a.width / 2) + 'px,' + (b.top + b.height / 2 - a.top - a.height / 2) + 'px) scale(.4)'; t.style.opacity = 0;
        ch.classList.remove('wobble'); ch.classList.add('joy'); g.sound(c.sound); g.win(T('Yum! Thank you!', 'Nyam! Terima kasih!'), ch);
      }
      t.addEventListener('pointerdown', function (e) {
        e.preventDefault(); e.stopPropagation(); if (done) return;
        try { t.setPointerCapture(e.pointerId); } catch (err) { }
        var x0 = e.clientX, y0 = e.clientY; t.style.transition = 'none';
        function move(ev) { ox = ev.clientX - x0; oy = ev.clientY - y0; t.style.transform = 'translate(' + ox + 'px,' + oy + 'px) scale(1.1)'; }
        function up() { t.removeEventListener('pointermove', move); t.removeEventListener('pointerup', up); give(); }
        t.addEventListener('pointermove', move); t.addEventListener('pointerup', up);
      });
      t.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); give(); } });
    },
    // a small character finds its big twin
    match: function (g) {
      var cs = pool(g.themes, 3), baby = cs[0], order = D.targets.shuffle(cs);
      g.cue(T('Where is the big ' + nm(baby) + '?', 'Di mana ' + nm(baby) + ' yang besar?'), T('Tap the one that is the same!', 'Ketuk yang sama!'));
      g.el.innerHTML = '<div class="dtt-matchgame"><div class="dtt-gin dtt-baby">' + TH.svg(baby, 'dtt-char small wobble') + '</div><div class="dtt-row">' + order.map(function (c, i) { return '<button type="button" class="dtt-gamebtn dtt-gin" style="animation-delay:' + (0.15 * i + 0.15) + 's" data-tap data-i="' + i + '" aria-label="' + esc(T('Choose this one', 'Pilih yang ini')) + '">' + TH.svg(c, 'dtt-char mid' + (c === baby ? ' parent' : '')) + '</button>'; }).join('') + '</div></div>';
      g.hintAt = function () { return g.el.querySelector('.parent'); };
      g.on(function () {
        var small = g.el.querySelector('.small'), big = g.el.querySelector('.parent'), a = small.getBoundingClientRect(), b = big.getBoundingClientRect();
        small.classList.remove('wobble'); small.style.transition = 'transform .6s ease'; small.style.transform = 'translate(' + (b.left + b.width / 2 - a.left - a.width / 2) + 'px,' + (b.top - a.top - a.height * 0.6) + 'px)';
        big.classList.add('joy'); g.sound(baby.sound); g.win(T('They found each other!', 'Mereka bertemu!'), big);
      });
    },
    // tap to pop bubbles, balloons or stars
    pop: function (g) {
      var kind = POPS[pick(TH.chosen(g.themes)).pop] || POPS.bubble, many = 8, left = many, h = '';
      for (var i = 0; i < many; i++) h += '<button type="button" class="dtt-gamebtn dtt-popit" data-tap style="animation-delay:' + (i * 0.17).toFixed(2) + 's,' + (i * 0.23).toFixed(2) + 's" aria-label="' + esc(T('Pop', 'Pecahkan')) + '">' + svg(kind.art(i), 'dtt-popart', kind.box || '0 0 60 60') + '</button>';
      g.cue(T('Pop all the ' + kind.name[0] + '!', 'Pecahkan semua ' + kind.name[1] + '!'), T(many + ' to go', 'Tinggal ' + many));
      g.el.innerHTML = '<div class="dtt-popfield">' + h + '</div>';
      g.el.addEventListener('click', function (e) {
        var b = e.target.closest('.dtt-popit'); if (!b || b.classList.contains('gone')) return;
        g.tapped(); g.burst(b, 6); b.classList.add('gone'); R.charSound('plop', g.prefs, 0); left--;
        if (left) g.sub(T(left + ' to go', 'Tinggal ' + left)); else g.win(T('All gone! Hooray!', 'Habis semua! Hore!'));
      });
    }
  };

  D.games = {
    isActive: function () { return !!active; },
    skip: function () { if (active) active(); },
    // c: { s, prefs, themes }. Calls done once. Works with sound off and reduced motion.
    show: function (host, c, done, forced) {
      var list = RF.enabledGames(c.s, DEF.GAMES), id = forced || RF.pickFrom(list, last);
      if (!id) { done(); return; }
      if (!forced) last = id;
      var wrap = document.createElement('div'), timers = [], over = false, sc = scene(c.themes);
      wrap.className = 'dtt-game' + (sc.dark ? ' dark' : '') + (c.prefs.reduce ? ' still' : ''); wrap.id = 'dttGame';
      wrap.style.background = sc.bg;
      wrap.innerHTML = sc.art +
        '<div class="dtt-gametop"><span class="dtt-gamebadge">★ ' + esc(T('Fun Break', 'Istirahat Seru')) + '</span><button type="button" class="dtt-gameskip" data-skip>' + esc(T('Skip', 'Lewati')) + ' <kbd>S</kbd></button></div>' +
        '<div class="dtt-gamecue" role="status" aria-live="polite"><b></b><span></span></div>' +
        '<div class="dtt-gamearea" id="dttGameArea"></div>';
      host.appendChild(wrap);
      var cueB = wrap.querySelector('.dtt-gamecue b'), cueS = wrap.querySelector('.dtt-gamecue span'), hand = null;
      function end() {
        if (over) return; over = true;
        timers.forEach(clearTimeout); active = null; wrap.remove(); done();
      }
      active = end;
      wrap.querySelector('[data-skip]').addEventListener('click', end);
      timers.push(setTimeout(end, MAX_MS));
      var finished = false, tapFn = null;
      function dropHand() { if (hand) { hand.remove(); hand = null; } }
      var g = {
        el: wrap.querySelector('#dttGameArea'), themes: c.themes, prefs: c.prefs,
        sound: function (name) { if (c.prefs.sfx && c.prefs.charSnd) R.charSound(name, c.prefs, 0); },
        cue: function (main, sub) { cueB.textContent = main; cueS.textContent = sub || ''; },
        sub: function (sub) { cueS.textContent = sub; },
        tapped: dropHand,
        // sparkles fly out from an element
        burst: function (el, n) {
          if (!el || c.prefs.reduce) return;
          var a = el.getBoundingClientRect(), w = wrap.getBoundingClientRect(), b = document.createElement('div'), cols = ['#FFC94A', '#F6B3C2', '#7FCB98', '#7DB3E8', '#B9A3E3'];
          b.className = 'dtt-burst'; b.style.left = (a.left + a.width / 2 - w.left) + 'px'; b.style.top = (a.top + a.height / 2 - w.top) + 'px';
          for (var i = 0; i < n; i++) b.innerHTML += '<i style="--a:' + (360 / n * i) + 'deg;--d:' + (a.width * 0.55 + 30) + 'px">' + svg(TH.star(15, 15, 13, cols[i % 5]), '', '0 0 30 30') + '</i>';
          wrap.appendChild(b); timers.push(setTimeout(function () { b.remove(); }, 900));
        },
        win: function (txt, el) {
          if (finished) return; finished = true; dropHand();
          var cue = wrap.querySelector('.dtt-gamecue'); cue.classList.add('win'); g.cue(txt, '');
          g.burst(el, 12); timers.push(setTimeout(end, END_MS));
        },
        on: function (fn) { tapFn = fn; }
      };
      g.el.addEventListener('click', function (e) {
        if (!tapFn || finished || !e.target.closest('[data-tap]')) return;
        dropHand(); tapFn();
      });
      GAMES[id](g);
      // after a moment, a hand shows where to tap (or drag), and keeps tapping until the child does
      timers.push(setTimeout(function () {
        if (finished || over) return;
        var target = (g.hintAt && g.hintAt()) || g.el.querySelector('[data-tap]:not(.gone)'); if (!target) return;
        var a = target.getBoundingClientRect(), w = wrap.getBoundingClientRect();
        hand = document.createElement('div'); hand.className = 'dtt-ghandw' + (id === 'feed' ? ' drag' : ''); hand.innerHTML = HAND;
        hand.style.left = (a.left + a.width / 2 - w.left) + 'px'; hand.style.top = (a.top + a.height * 0.62 - w.top) + 'px';
        if (id === 'feed') { var ch = g.el.querySelector('.dtt-char').getBoundingClientRect(); hand.style.setProperty('--dx', (ch.left + ch.width / 2 - a.left - a.width / 2) + 'px'); }
        wrap.appendChild(hand);
      }, HINT_MS));
      var firstBtn = g.el.querySelector('button'); if (firstBtn) firstBtn.focus({ preventScroll: true });
    },
    IDS: Object.keys(GAMES),
    preview: function (id, s, themes) {
      var host = document.createElement('div'), prefs = D.ui.prefs();
      host.className = 'dtt-session dtt-preview' + (prefs.reduce ? ' calm' : '');
      document.body.appendChild(host); R.audio();
      D.games.show(host, { s: s, prefs: prefs, themes: themes }, function () { host.remove(); }, id);
    }
  };
})();
