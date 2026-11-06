/* Little Us · DTT · fun breaks: short games between trials. They are never trials, are never saved, can always be skipped,
   last at most 10 seconds, and have no wrong answer, because any tap works. Each one is re-skinned with the chosen themes' characters. */
(function () {
  'use strict';
  var D = window.LUDtt, T = D.i18n.T, esc = LUTools.api.esc, TH = D.themes, RF = D.reinforcement, DEF = D.defaults, R = D.reinforce;
  var MAX_MS = 10000, END_MS = 1600, last = null, active = null;
  var O = ' stroke="' + TH.INK + '" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"';

  function pool(themes, n) { return D.targets.shuffle(TH.pool(themes)).slice(0, n); }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

  var COVERS = {
    bush: '<ellipse cx="60" cy="72" rx="56" ry="42" fill="#7FCB98"' + O + '/><circle cx="30" cy="54" r="22" fill="#7FCB98"' + O + '/><circle cx="84" cy="50" r="24" fill="#7FCB98"' + O + '/>',
    rock: '<path d="M4 112 Q8 48 44 36 Q84 22 112 64 Q118 92 116 112Z" fill="#B7BCC8"' + O + '/>',
    cloud: '<path d="M18 104 Q-4 96 6 72 Q12 52 34 56 Q42 26 72 32 Q98 34 96 60 Q120 62 114 86 Q110 104 92 104Z" fill="#FFFFFF"' + O + '/>',
    moon: '<circle cx="60" cy="72" r="50" fill="#FFF8EC"' + O + '/><circle cx="36" cy="56" r="7" fill="#B7BCC8"/><circle cx="84" cy="86" r="9" fill="#B7BCC8"/>',
    garage: '<rect x="8" y="30" width="104" height="82" rx="6" fill="#F5873B"' + O + '/><path d="M8 52H112M8 72H112M8 92H112" fill="none"' + O + '/>'
  };
  var OPENERS = {
    egg: function (n) { return '<path d="M60 8 Q100 40 96 76 Q92 112 60 112 Q28 112 24 76 Q20 40 60 8Z" fill="#FFF8EC"' + O + '/>' + (n > 0 ? '<path d="M38 56 L50 66 L58 54" fill="none"' + O + '/>' : '') + (n > 1 ? '<path d="M64 76 L76 66 L84 78" fill="none"' + O + '/>' : ''); },
    chest: function (n) { return '<rect x="14" y="56" width="92" height="50" rx="8" fill="#B98157"' + O + '/><path d="M14 56 Q14 ' + (22 - n * 6) + ' 60 ' + (22 - n * 6) + ' Q106 ' + (22 - n * 6) + ' 106 56Z" fill="#F5873B"' + O + '/><rect x="52" y="48" width="16" height="18" rx="4" fill="#FFC94A"' + O + '/>'; },
    garage: function (n) { var top = 30 + n * 20; return '<rect x="8" y="30" width="104" height="82" rx="6" fill="#4A4855"' + O + '/><rect x="8" y="' + top + '" width="104" height="' + (82 - n * 20) + '" rx="6" fill="#F5873B"' + O + '/>'; },
    launch: function (n) { return '<g transform="translate(0,' + (-n * 6) + ')">' + TH.THEMES[0].characters[1].art + '</g>' + (n ? '<path d="M44 112 Q60 ' + (112 - n * 3) + ' 76 112Z" fill="#F5873B"/>' : ''); },
    cloud: function (n) { return COVERS.cloud + (n ? '<path d="M' + (40 + n * 8) + ' 106 l-4 12 M' + (70 + n * 4) + ' 106 l-4 12" fill="none"' + O + '/>' : ''); }
  };
  var TREATS = {
    star: function () { return TH.star(30, 30, 26, '#FFC94A'); },
    shell: function () { return '<path d="M30 54 Q4 40 8 24 Q14 6 30 6 Q46 6 52 24 Q56 40 30 54Z" fill="#F6B3C2"' + O + '/><path d="M30 54 V14M30 54 L16 22M30 54 L44 22" fill="none"' + O + '/>'; },
    leaf: function () { return '<path d="M8 52 Q4 8 52 6 Q56 54 8 52Z" fill="#7FCB98"' + O + '/><path d="M8 52 L34 26" fill="none"' + O + '/>'; },
    fuel: function () { return '<rect x="12" y="14" width="36" height="42" rx="6" fill="#E5484D"' + O + '/><rect x="22" y="4" width="16" height="12" rx="3" fill="#4A4855"' + O + '/>'; }
  };
  function themeOf(c) { return TH.THEMES.filter(function (t) { return t.id === c.theme; })[0]; }
  function svg(inner, cls, box) { return '<svg class="' + cls + '" viewBox="' + (box || '0 0 120 120') + '" aria-hidden="true">' + inner + '</svg>'; }
  function say(g, txt) { return '<p class="dtt-gamesay" aria-hidden="true">' + esc(txt) + '</p>'; }

  var GAMES = {
    // a dark silhouette fills with colour when tapped
    shadow: function (g) {
      var c = pool(g.themes, 1)[0];
      g.el.innerHTML = '<button type="button" class="dtt-gamebtn" data-tap aria-label="' + esc(T('Show who it is', 'Tampilkan siapa ini')) + '">' + TH.svg(c, 'dtt-char big dark') + '</button>';
      g.on(function () { g.el.querySelector('svg').classList.remove('dark'); g.el.querySelector('svg').classList.add('joy'); g.sound(c.sound); g.finish(); });
    },
    // part of a character shows from behind something, and a tap makes it jump out
    peek: function (g) {
      var c = pool(g.themes, 1)[0], cover = COVERS[themeOf(c).cover] || COVERS.bush;
      g.el.innerHTML = '<button type="button" class="dtt-gamebtn dtt-peekwrap" data-tap aria-label="' + esc(T('Make it jump out', 'Buat melompat keluar')) + '">' + TH.svg(c, 'dtt-char big peeking') + svg(cover, 'dtt-cover') + '</button>';
      g.on(function () { var s = g.el.querySelector('.peeking'); s.classList.remove('peeking'); s.classList.add('jumped'); g.sound(c.sound); g.finish(); });
    },
    // a zoomed-in part, and a tap reveals the whole
    closeup: function (g) {
      var c = pool(g.themes, 1)[0], x = 20 + Math.round(Math.random() * 40), y = 20 + Math.round(Math.random() * 40);
      g.el.innerHTML = '<button type="button" class="dtt-gamebtn dtt-zoom" data-tap aria-label="' + esc(T('See all of it', 'Lihat seluruhnya')) + '">' + svg(c.art, 'dtt-char big', x + ' ' + y + ' 40 40') + '</button>';
      g.on(function () { var s = g.el.querySelector('svg'); s.setAttribute('viewBox', '0 0 120 120'); s.classList.add('joy'); g.sound(c.sound); g.finish(); });
    },
    // one wrong part flies away when tapped
    silly: function (g) {
      var c = pool(g.themes, 1)[0], parts = ['<circle cx="60" cy="60" r="11" fill="#E5484D"' + O + '/>', '<path d="M34 72 Q46 62 60 72 Q74 62 86 72 Q74 84 60 76 Q46 84 34 72Z" fill="#4A4855"' + O + '/>', '<path d="M30 30 L60 2 L90 30Z" fill="#B9A3E3"' + O + '/><circle cx="60" cy="2" r="6" fill="#FFC94A"' + O + '/>'];
      g.el.innerHTML = '<button type="button" class="dtt-gamebtn dtt-silly" data-tap aria-label="' + esc(T('Take away the silly part', 'Lepaskan bagian yang lucu')) + '">' + TH.svg(c, 'dtt-char big') + svg(pick(parts), 'dtt-char big dtt-sillypart') + '</button>';
      g.on(function () { g.el.querySelector('.dtt-sillypart').classList.add('fly'); g.el.querySelector('svg').classList.add('joy'); g.sound('whoosh'); g.finish(); });
    },
    // three taps open an egg, chest or garage door, or launch a rocket
    open: function (g) {
      var c = pool(g.themes, 1)[0], kind = themeOf(c).opener || 'egg', n = 0;
      function draw() { g.el.innerHTML = '<button type="button" class="dtt-gamebtn" data-tap aria-label="' + esc(T('Tap to open', 'Ketuk untuk membuka')) + '">' + svg(OPENERS[kind](n), 'dtt-char big wobble') + '</button>' + '<div class="dtt-gametaps" aria-hidden="true">' + [0, 1, 2].map(function (i) { return '<i class="' + (i < n ? 'on' : '') + '"></i>'; }).join('') + '</div>'; }
      draw();
      g.on(function () {
        n++;
        if (n < 3) { R.charSound('boop', g.prefs, 0); draw(); return false; }
        g.el.innerHTML = TH.svg(c, 'dtt-char big joy'); g.sound(c.sound); g.finish();
      });
    },
    // drag an item to the character, or tap it
    feed: function (g) {
      var c = pool(g.themes, 1)[0], treat = TREATS[themeOf(c).treat] || TREATS.star;
      g.el.innerHTML = '<div class="dtt-feed">' + TH.svg(c, 'dtt-char big') + '<button type="button" class="dtt-gamebtn dtt-treat" data-tap aria-label="' + esc(T('Give it', 'Berikan')) + '">' + svg(treat(), 'dtt-treatart', '0 0 60 60') + '</button></div>';
      var t = g.el.querySelector('.dtt-treat'), done = false, ox = 0, oy = 0;
      function give() {
        if (done) return; done = true;
        var a = t.getBoundingClientRect(), b = g.el.querySelector('.dtt-char').getBoundingClientRect();
        t.style.transition = 'transform .4s ease, opacity .4s ease .3s'; t.style.transform = 'translate(' + (b.left + b.width / 2 - a.left - a.width / 2 + ox) + 'px,' + (b.top + b.height / 2 - a.top - a.height / 2 + oy) + 'px) scale(.4)'; t.style.opacity = 0;
        g.el.querySelector('.dtt-char').classList.add('joy'); g.sound(c.sound); g.finish();
      }
      t.addEventListener('pointerdown', function (e) {
        e.preventDefault(); e.stopPropagation(); if (done) return;
        try { t.setPointerCapture(e.pointerId); } catch (err) { }
        var x0 = e.clientX, y0 = e.clientY, moved = false;
        function move(ev) { ox = ev.clientX - x0; oy = ev.clientY - y0; if (Math.abs(ox) + Math.abs(oy) > 6) moved = true; t.style.transform = 'translate(' + ox + 'px,' + oy + 'px)'; }
        function up() { t.removeEventListener('pointermove', move); t.removeEventListener('pointerup', up); give(); }
        t.addEventListener('pointermove', move); t.addEventListener('pointerup', up);
      });
      t.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); give(); } });
    },
    // a baby finds its parent, or a small thing finds its big partner
    match: function (g) {
      var cs = pool(g.themes, 3), baby = cs[0], order = D.targets.shuffle(cs);
      g.el.innerHTML = '<div class="dtt-matchgame">' + TH.svg(baby, 'dtt-char small') + '<div class="dtt-row">' + order.map(function (c, i) { return '<button type="button" class="dtt-gamebtn" data-tap data-i="' + i + '" aria-label="' + esc(T('Choose this one', 'Pilih yang ini')) + '">' + TH.svg(c, 'dtt-char mid' + (c === baby ? ' parent' : '')) + '</button>'; }).join('') + '</div></div>';
      g.on(function () {
        var small = g.el.querySelector('.small'), big = g.el.querySelector('.parent'), a = small.getBoundingClientRect(), b = big.getBoundingClientRect();
        small.style.transition = 'transform .6s ease'; small.style.transform = 'translate(' + (b.left + b.width / 2 - a.left - a.width / 2) + 'px,' + (b.top - a.top) + 'px)';
        big.classList.add('joy'); g.sound(baby.sound); g.finish();
      });
    },
    // tap to pop bubbles, balloons or stars
    pop: function (g) {
      var kind = TH.chosen(g.themes), name = pick(kind).pop || 'bubble', many = 8, left = many, h = '';
      for (var i = 0; i < many; i++) {
        var art = name === 'star' ? TH.star(30, 30, 26, '#FFC94A') : name === 'balloon' ? '<ellipse cx="30" cy="30" rx="24" ry="26" fill="var(--dtt-c' + (1 + i % 5) + ')"' + O + '/>' : '<circle cx="30" cy="30" r="25" fill="#DCEBFA"' + O + '/><circle cx="21" cy="20" r="6" fill="#fff"/>';
        h += '<button type="button" class="dtt-gamebtn dtt-popit" data-tap style="animation-delay:' + (i * 0.1).toFixed(1) + 's" aria-label="' + esc(T('Pop', 'Pecahkan')) + '">' + svg(art, 'dtt-popart', '0 0 60 60') + '</button>';
      }
      g.el.innerHTML = '<div class="dtt-popfield">' + h + '</div>';
      g.el.addEventListener('click', function (e) {
        var b = e.target.closest('.dtt-popit'); if (!b || b.classList.contains('gone')) return;
        b.classList.add('gone'); R.charSound('plop', g.prefs, 0); left--;
        if (!left) g.finish();
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
      var wrap = document.createElement('div'), timers = [], over = false;
      wrap.className = 'dtt-game' + (c.prefs.reduce ? ' still' : ''); wrap.id = 'dttGame';
      var bg = TH.chosen(c.themes)[0].backgrounds[0];
      wrap.style.background = bg;
      wrap.innerHTML = '<button type="button" class="tl-btn quiet sm dtt-gameskip" data-skip>' + esc(T('Skip', 'Lewati')) + ' <kbd>S</kbd></button><div class="dtt-gamearea" id="dttGameArea"></div>';
      host.appendChild(wrap);
      function end() {
        if (over) return; over = true;
        timers.forEach(clearTimeout); active = null; wrap.remove(); done();
      }
      active = end;
      wrap.querySelector('[data-skip]').addEventListener('click', end);
      timers.push(setTimeout(end, MAX_MS));
      var finished = false, tapFn = null;
      var g = {
        el: wrap.querySelector('#dttGameArea'), themes: c.themes, prefs: c.prefs,
        sound: function (name) { if (c.prefs.sfx && c.prefs.charSnd) R.charSound(name, c.prefs, 0); },
        finish: function () { if (finished) return; finished = true; timers.push(setTimeout(end, END_MS)); },
        on: function (fn) { tapFn = fn; }
      };
      g.el.addEventListener('click', function (e) {
        if (!tapFn || finished || !e.target.closest('[data-tap]')) return;
        tapFn();
      });
      GAMES[id](g);
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
