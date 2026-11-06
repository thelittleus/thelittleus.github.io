/* Little Us · DTT · consequences on the student's screen: the brief "Yes!", the full celebration and the token board reward.
   Any of the 13 styles can draw any theme's characters. Sounds are synthesized, soft by default, and follow the device preferences. */
(function () {
  'use strict';
  var D = window.LUDtt, X = LUTools.api, T = D.i18n.T, esc = X.esc, TH = D.themes, RF = D.reinforcement, DEF = D.defaults;
  var VOL = { soft: 0.3, medium: 0.6, loud: 0.9 }, CONFETTI = 44, ctx = null, noiseBuf = null, lastScene = null, lastText = null;
  var CHEERS = { en: ['Yay!', 'Woohoo!', 'Hooray!', 'Wow!', 'Yippee!', 'Bravo!'], id: ['Yay!', 'Asyik!', 'Hore!', 'Wah!', 'Keren!', 'Bravo!'] };
  var TEXT_STYLES = ['t-pop', 't-wave', 't-rainbow', 't-stamp', 't-ribbon', 't-bubble'], FRAMES = ['f-round', 'f-soft', 'f-dash'];
  var BIG_SCENES = ['walk', 'dance', 'balloons', 'popup'];

  /* ---------- sound ---------- */
  function audio() {
    if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { ctx = null; } }
    if (ctx && ctx.state === 'suspended') { try { ctx.resume(); } catch (e) { } }
    return ctx;
  }
  function level(prefs) { return VOL[prefs.vol] || VOL.soft; }
  function tone(freq, at, len, vol, type, to) {
    var c = audio(); if (!c) return;
    var o = c.createOscillator(), g = c.createGain(), t = c.currentTime + at;
    o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t); if (to) o.frequency.exponentialRampToValueAtTime(to, t + len);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0008, t + len);
    o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + len + 0.03);
  }
  function hiss(at, len, vol, from, to) {
    var c = audio(); if (!c) return;
    if (!noiseBuf) { noiseBuf = c.createBuffer(1, c.sampleRate, c.sampleRate); var d = noiseBuf.getChannelData(0); for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
    var s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(), t = c.currentTime + at;
    s.buffer = noiseBuf; s.loop = true; f.type = 'bandpass'; f.Q.value = 0.8; f.frequency.setValueAtTime(from, t); f.frequency.exponentialRampToValueAtTime(to, t + len);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + len * 0.3); g.gain.exponentialRampToValueAtTime(0.0008, t + len);
    s.connect(f); f.connect(g); g.connect(c.destination); s.start(t); s.stop(t + len + 0.03);
  }
  var FX = {
    boop: function (v, t) { tone(420, t, 0.16, v, 'sine', 640); },
    whoosh: function (v, t) { hiss(t, 0.5, v, 300, 2200); },
    sparkle: function (v, t) { [1568, 2093, 2637].forEach(function (f, i) { tone(f, t + i * 0.07, 0.2, v * 0.6); }); },
    bubble: function (v, t) { tone(300, t, 0.12, v, 'sine', 900); tone(420, t + 0.1, 0.12, v, 'sine', 1100); },
    splash: function (v, t) { hiss(t, 0.45, v, 1800, 500); },
    chirp: function (v, t) { tone(1400, t, 0.1, v * 0.7, 'sine', 2200); tone(1600, t + 0.13, 0.1, v * 0.7, 'sine', 2400); },
    buzz: function (v, t) { tone(190, t, 0.3, v * 0.5, 'sawtooth', 240); },
    chime: function (v, t) { [880, 1109, 1319].forEach(function (f, i) { tone(f, t + i * 0.1, 0.35, v * 0.6); }); },
    honk: function (v, t) { tone(340, t, 0.16, v * 0.6, 'square'); tone(340, t + 0.2, 0.16, v * 0.6, 'square'); },
    plop: function (v, t) { tone(700, t, 0.14, v, 'sine', 220); }
  };
  function ding(prefs) { if (prefs.sfx && prefs.ding) { var v = level(prefs) * 0.5; tone(880, 0, 0.25, v); tone(1175, 0.12, 0.35, v); } }
  // a soft cartoon crowd: a few voices gliding up, never a sudden loud sound
  function cheer(prefs) {
    var v = level(prefs) * 0.16;
    [200, 262, 330, 392].forEach(function (f, i) { tone(f, i * 0.02, 0.6, v, 'sawtooth', f * 1.5); });
    [523, 659, 784, 1047].forEach(function (f, i) { tone(f, 0.05 + i * 0.1, 0.32, level(prefs) * 0.3); });
  }
  function charSound(name, prefs, at) { var fx = FX[name]; if (fx) fx(level(prefs) * 0.5, at); }
  function soundsFor(chars, prefs) {
    if (!prefs.sfx) return;
    if (prefs.cheer) cheer(prefs);
    if (prefs.charSnd) chars.slice(0, 3).forEach(function (c, i) { charSound(c.sound, prefs, 0.5 + i * 0.5); });
  }

  /* ---------- helpers ---------- */
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function pickLine(text, fallback) {
    var lines = String(text || '').split('\n').map(function (x) { return x.trim(); }).filter(Boolean);
    return lines.length ? pick(lines) : fallback;
  }
  function calm(prefs) { return prefs.reduce || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches); }
  function praiseText(s, name) {
    var t = pickLine(s.praise, T('Well done, {name}!', 'Hebat, {name}!')).replace(/\{name\}/g, name || '').replace(/,\s*!/, '!');
    if (s.cheer) t = pick(CHEERS[D.i18n.lang()]) + ' ' + t;
    return t;
  }
  function textHTML(text, style) {
    if (style !== 't-wave' && style !== 't-rainbow') return esc(text);
    var n = 0;
    return text.split('').map(function (ch) {
      if (ch === ' ') return ' ';
      n++;
      return '<span style="--i:' + n + (style === 't-rainbow' ? ';color:var(--dtt-c' + (1 + n % 5) + ')' : '') + '">' + esc(ch) + '</span>';
    }).join('');
  }
  function takeChars(themes, n) { return D.targets.shuffle(TH.pool(themes)).slice(0, n); }

  /* ---------- props ---------- */
  var O = ' stroke="' + TH.INK + '" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"';
  var BOARD = '<svg class="dtt-prop board" viewBox="0 0 120 34" aria-hidden="true"><rect x="6" y="4" width="108" height="12" rx="6" fill="#F5873B"' + O + '/><circle cx="30" cy="24" r="7" fill="#FFF8EC"' + O + '/><circle cx="90" cy="24" r="7" fill="#FFF8EC"' + O + '/></svg>';
  function surfBoard(i) { return '<svg class="dtt-prop board" viewBox="0 0 200 40" aria-hidden="true"><path d="M8 20 Q20 4 100 6 Q186 8 194 20 Q186 32 100 34 Q20 36 8 20Z" fill="var(--dtt-c' + (1 + i % 5) + ')"' + O + '/></svg>'; }
  function balloon(i) { return '<svg class="dtt-prop balloon" viewBox="0 0 60 90" aria-hidden="true"><path d="M30 60 Q26 74 32 88" fill="none"' + O + '/><ellipse cx="30" cy="32" rx="24" ry="28" fill="var(--dtt-c' + (1 + i % 5) + ')"' + O + '/></svg>'; }
  function rocket(i) { return '<svg class="dtt-prop rkt" viewBox="0 0 80 120" aria-hidden="true"><path d="M26 86 Q40 120 54 86Z" fill="#FFC94A"/><path d="M18 62 L4 90 L20 84Z M62 62 L76 90 L60 84Z" fill="var(--dtt-c' + (1 + i % 5) + ')"' + O + '/><path d="M40 4 Q66 30 62 84 H18 Q14 30 40 4Z" fill="#FFF8EC"' + O + '/></svg>'; }
  function firework(i, left, top) {
    var rays = ''; for (var k = 0; k < 12; k++) { var a = k * Math.PI / 6; rays += '<path d="M' + (14 * Math.cos(a)).toFixed(1) + ' ' + (14 * Math.sin(a)).toFixed(1) + ' L' + (44 * Math.cos(a)).toFixed(1) + ' ' + (44 * Math.sin(a)).toFixed(1) + '" stroke="var(--dtt-c' + (1 + i % 5) + ')" stroke-width="5" stroke-linecap="round"/>'; }
    return '<svg class="dtt-fw" style="left:' + left + '%;top:' + top + '%;animation-delay:' + (i * 0.32).toFixed(2) + 's" viewBox="-50 -50 100 100" aria-hidden="true">' + rays + '</svg>';
  }
  var RAINBOW = '<svg class="dtt-rainbow" viewBox="0 0 400 300" preserveAspectRatio="none" aria-hidden="true">' + [1, 2, 3, 4, 5].map(function (c, i) { return '<path d="M-20 ' + (50 + i * 9) + ' Q200 ' + (50 + i * 9) + ' 420 ' + (285 + i * 9) + '" fill="none" stroke="var(--dtt-c' + c + ')" stroke-width="9"/>'; }).join('') + '</svg>';
  var ENGINE = '<svg class="dtt-prop engine" viewBox="0 0 120 120" aria-hidden="true">' + TH.THEMES[4].characters[2].art + '</svg>';
  var WAVE = '<svg class="dtt-waves" viewBox="0 0 800 120" preserveAspectRatio="none" aria-hidden="true"><path d="M0 60 Q50 34 100 60 T200 60 T300 60 T400 60 T500 60 T600 60 T700 60 T800 60 V120 H0Z" fill="var(--dtt-c3)"/></svg>';

  function mover(c, i, cls, o) {
    o = o || {};
    return '<div class="dtt-mover ' + cls + '" style="--i:' + i + ';' + (o.style || '') + '">' + (o.top || '') + TH.svg(c) + (o.after || '') + '</div>';
  }
  // each style returns { sky, ground, n }: what is above the praise and what runs along the bottom
  var SCENE = {
    center: function (cs) { return { ground: '<div class="dtt-row">' + cs.slice(0, 3).map(function (c, i) { return mover(c, i, 'bounce'); }).join('') + '</div>' }; },
    walk: function (cs) { return { ground: cs.slice(0, 4).map(function (c, i) { return mover(c, i, 'walk'); }).join('') }; },
    race: function (cs) { return { ground: cs.slice(0, 3).map(function (c, i) { return mover(c, i, 'race', { style: 'bottom:' + (i * 16) + 'px' }); }).join('') }; },
    hop: function (cs) { return { ground: cs.slice(0, 3).map(function (c, i) { return mover(c, i, 'hop'); }).join('') }; },
    skate: function (cs) { return { ground: cs.slice(0, 2).map(function (c, i) { return mover(c, i, 'skate', { after: BOARD }); }).join('') }; },
    balloons: function (cs) { return { sky: cs.slice(0, 3).map(function (c, i) { return mover(c, i, 'float', { top: balloon(i), style: 'left:' + [8, 42, 72][i] + '%' }); }).join('') }; },
    popup: function (cs) { return { ground: cs.slice(0, 4).map(function (c, i) { return mover(c, i, 'pop', { style: 'left:' + [4, 28, 52, 76][i] + '%' }); }).join('') }; },
    dance: function (cs) { var notes = ''; for (var i = 0; i < 10; i++) notes += '<i class="dtt-note" style="left:' + Math.round(4 + Math.random() * 90) + '%;animation-delay:' + (Math.random() * 2).toFixed(2) + 's;color:var(--dtt-c' + (1 + i % 5) + ')" aria-hidden="true">♪</i>'; return { sky: notes, ground: '<div class="dtt-row">' + cs.slice(0, 3).map(function (c, i) { return mover(c, i, 'dance'); }).join('') + '</div>' }; },
    slide: function (cs) { return { sky: RAINBOW + cs.slice(0, 4).map(function (c, i) { return mover(c, i, 'slide'); }).join('') }; },
    rocket: function (cs) { return { sky: cs.slice(0, 3).map(function (c, i) { return mover(c, i, 'rocket', { after: rocket(i), style: 'left:' + [10, 44, 74][i] + '%' }); }).join('') }; },
    fireworks: function (cs) { var f = ''; for (var i = 0; i < 9; i++) f += firework(i, Math.round(4 + Math.random() * 84), Math.round(2 + Math.random() * 42)); return { sky: f, ground: '<div class="dtt-row">' + cs.slice(0, 3).map(function (c, i) { return mover(c, i, 'bounce'); }).join('') + '</div>' }; },
    train: function (cs) { return { ground: '<div class="dtt-train">' + ENGINE + cs.slice(0, 3).map(function (c, i) { return '<div class="dtt-car" style="--i:' + i + '">' + TH.svg(c) + '<svg class="dtt-prop carbody" viewBox="0 0 120 50" aria-hidden="true"><rect x="4" y="4" width="112" height="30" rx="8" fill="var(--dtt-c' + (1 + i % 5) + ')"' + O + '/><circle cx="30" cy="38" r="9" fill="#FFF8EC"' + O + '/><circle cx="90" cy="38" r="9" fill="#FFF8EC"' + O + '/></svg></div>'; }).join('') + '</div>' }; },
    surf: function (cs) { return { ground: WAVE + cs.slice(0, 3).map(function (c, i) { return mover(c, i, 'surf', { after: surfBoard(i) }); }).join('') + WAVE.replace('dtt-waves', 'dtt-waves front') }; }
  };

  function photoFor(c) {
    var own = c.s.ownPhotos && c.photos && c.photos.length ? pick(c.photos) : null;
    var kid = c.s.photos && c.kid && c.kid.photo && X.PH[c.kid.photo] ? X.PH[c.kid.photo] : null;
    if (own && (!kid || Math.random() < 0.5)) return D.ui.img(own, '');
    return kid ? '<img alt="" src="' + esc(kid) + '">' : '';
  }

  /* c: { s: settings, prefs, kid, themes, photos } */
  D.reinforce = {
    audio: audio, tone: tone, charSound: charSound, SCENE_IDS: Object.keys(SCENE),
    brief: function (host, c, done) {
      var b = document.createElement('div');
      b.className = 'dtt-brief'; b.setAttribute('role', 'status');
      b.textContent = pickLine(c.s.brief, T('Yes!', 'Ya!'));
      host.appendChild(b); ding(c.prefs);
      return setTimeout(function () { b.remove(); done(); }, 1150);
    },
    // always calls done, so a session can never get stuck here
    full: function (host, c, done, o) {
      o = o || {};
      var s = c.s, list = (s.scenes && s.scenes.length ? s.scenes : DEF.SCENES);
      var scene = o.scene || RF.pickFrom(o.big ? (list.filter(function (x) { return BIG_SCENES.indexOf(x) >= 0; }).length ? list.filter(function (x) { return BIG_SCENES.indexOf(x) >= 0; }) : list) : list, lastScene);
      if (!o.scene) lastScene = scene;
      var style = RF.pickFrom(TEXT_STYLES, lastText); lastText = style;
      var chars = takeChars(c.themes, 4), parts = SCENE[scene](chars), still = calm(c.prefs), bgs = TH.chosen(c.themes).reduce(function (a, t) { return a.concat(t.backgrounds); }, []);
      var ms = Math.max(2, (o.big ? Math.max(s.dur, 4) : s.dur)) * 1000, bits = '', photo = photoFor(c);
      if (!still) for (var i = 0; i < CONFETTI; i++) bits += '<i style="left:' + Math.round(Math.random() * 100) + '%;animation-delay:' + (Math.random() * 0.8).toFixed(2) + 's;background:var(--dtt-c' + (1 + i % 5) + ')"></i>';
      var ov = document.createElement('div');
      ov.className = 'dtt-cele sc-' + scene + (still ? ' still' : '');
      ov.style.setProperty('--dtt-dur', (ms / 1000) + 's'); ov.style.background = pick(bgs);
      var text = o.text || praiseText(s, c.kid && c.kid.name);
      ov.innerHTML = '<div class="dtt-confetti" aria-hidden="true">' + bits + '</div>' + (parts.sky ? '<div class="dtt-sky" aria-hidden="true">' + parts.sky + '</div>' : '') +
        '<div class="dtt-celeinner">' + (o.rewardImg || (photo ? '<span class="dtt-celephoto ' + pick(FRAMES) + '">' + photo + '</span>' : '')) + '<p class="dtt-celetxt ' + style + '" role="status" aria-label="' + esc(text) + '">' + textHTML(text, style) + '</p></div>' +
        (parts.ground ? '<div class="dtt-ground" aria-hidden="true">' + parts.ground + '</div>' : '');
      host.appendChild(ov); D.ui.hydrate(ov); soundsFor(chars, c.prefs);
      return setTimeout(function () { ov.remove(); done(); }, ms);
    },
    // the board is full: the reward, then the teacher chooses to go on or take a break
    boardReward: function (host, c, done) {
      var reward = c.s.tokenReward !== 'celebration' && (c.photos || []).filter(function (m) { return m.id === c.s.tokenReward; })[0];
      return D.reinforce.full(host, c, function () {
        var wrap = document.createElement('div'), canBreak = RF.enabledGames(c.s, DEF.GAMES).length > 0 && !!c.s.inter;
        wrap.className = 'dtt-paused'; wrap.id = 'dttBoard';
        wrap.innerHTML = '<div class="tl-panel pad" role="dialog" aria-modal="true"><h2 class="tl-h2">' + esc(T('The token board is full', 'Token board sudah penuh')) + '</h2><p class="tl-p">' + esc(T('Would you like to keep going, or take a break first?', 'Mau lanjut, atau istirahat dulu?')) + '</p>' +
          '<button type="button" class="tl-btn primary lg" data-go="on">' + esc(T('Keep going', 'Lanjut')) + '</button>' + (canBreak ? '<button type="button" class="tl-btn outline" data-go="break">' + esc(T('Take a fun break', 'Istirahat seru')) + '</button>' : '') + '</div>';
        host.appendChild(wrap);
        wrap.addEventListener('click', function (e) { var b = e.target.closest('[data-go]'); if (!b) return; wrap.remove(); done(b.dataset.go === 'break'); });
        var first = wrap.querySelector('[data-go]'); if (first) first.focus();
      }, { text: T('You did it! The board is full!', 'Kamu berhasil! Papannya penuh!'), big: true, rewardImg: reward ? '<span class="dtt-celephoto big f-soft">' + D.ui.img(reward, '') + '</span>' : null });
    },
    // for the settings screen: runs one style on its own, with the sounds on this device
    preview: function (scene, s, kid, themes, photos) {
      var host = document.createElement('div'), prefs = D.ui.prefs();
      host.className = 'dtt-session dtt-preview' + (prefs.reduce ? ' calm' : '');
      document.body.appendChild(host); audio();
      var t = D.reinforce.full(host, { s: s, prefs: prefs, kid: kid, themes: themes, photos: photos }, function () { host.remove(); }, { scene: scene });
      host.addEventListener('click', function () { clearTimeout(t); host.remove(); });
    }
  };
})();
