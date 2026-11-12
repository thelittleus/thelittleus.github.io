/* Little Us · downloads for the tools (PDF and picture)
   Pages are drawn as SVG in millimetres, turned into images on this device, then saved as a
   PDF (built here, no outside service) or a PNG picture. Loaded on demand by tools.js. */
(function () {
  'use strict';
  var A = window.LUArt;
  var X = null; // tools api
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var PAPER = { a4: [210, 297] }; // every download is A4
  var SIZE = { s: 38, m: 52, l: 66 };
  var INK = '#2B2A35', LINE = '#D8CFC0', MUTED = '#6B6875';
  var FONT = "Fredoka, 'Arial Rounded MT Bold', 'Trebuchet MS', Arial, sans-serif";
  var BODY = "Figtree, 'Segoe UI', Arial, sans-serif";

  var W = {
    title: { en: 'Download', id: 'Unduh' }, format: { en: 'Format', id: 'Format' }, printAs: { en: 'Print as', id: 'Cetak sebagai' },
    pdf: { en: 'PDF', id: 'PDF' }, png: { en: 'Picture · PNG', id: 'Gambar · PNG' },
    poster: { en: 'Poster · PNG', id: 'Poster · PNG' }, cutting: { en: 'Cutting activity · PDF', id: 'Kartu gunting · PDF' },
    posterD: { en: 'Ready to hang up. Nothing to cut, glue or stick.', id: 'Siap ditempel. Tidak perlu digunting, dilem, atau ditempel velcro.' },
    cuttingD: { en: 'Picture cards to cut out.', id: 'Kartu bergambar untuk digunting.' },
    labels: { en: 'Labels', id: 'Label' }, both: { en: 'Both', id: 'Keduanya' }, none: { en: 'None', id: 'Tanpa' },
    size: { en: 'Card size', id: 'Ukuran kartu' }, s: { en: 'Small', id: 'Kecil' }, m: { en: 'Medium', id: 'Sedang' }, l: { en: 'Large', id: 'Besar' },
    instr:{ en: 'Instruction sheet for the adult', id: 'Lembar petunjuk untuk orang dewasa' }, instrD: { en: 'One extra page, how to use the board', id: 'Satu halaman tambahan, cara memakai papan' },
    dlPdf: { en: '↓ Download PDF', id: '↓ Unduh PDF' }, dlPng: { en: '↓ Download picture', id: '↓ Unduh gambar' }, made: { en: 'Made on this device. Works offline.', id: 'Dibuat di perangkat ini. Bisa offline.' },
    pages: { en: function (n) { return n + (n === 1 ? ' page' : ' pages') + ' · live'; }, id: function (n) { return n + ' halaman · langsung'; } },
    working: { en: "I'm working for…", id: 'Aku mau dapat…' }, cutTok: { en: 'Cut-out tokens', id: 'Token untuk digunting' }, cutCards: { en: 'Cut-out cards', id: 'Kartu untuk digunting' },
    first: { en: 'First', id: 'Pertama' }, then: { en: 'Then', id: 'Setelah itu' }, done: { en: 'Done', id: 'Selesai' }, wait: { en: 'Wait', id: 'Tunggu' }, finish: { en: 'Time to finish', id: 'Waktunya selesai' },
    cover: { en: 'Cover a number each minute', id: 'Tutup satu angka setiap menit' }, making: { en: 'Making your file…', id: 'Sedang membuat file…' },
    cards: { en: 'Cards', id: 'Kartu' }, tokensN: { en: function (n) { return n + ' tokens'; }, id: function (n) { return n + ' token'; } },
    howTo: { en: 'How to use it', id: 'Cara memakainya' }, fail: { en: "Sorry, the file couldn't be made. Please try again.", id: 'Maaf, file belum berhasil dibuat. Coba lagi ya.' },
    phone: { en: 'Picture for the phone', id: 'Gambar untuk HP' }
  };
  function w(k) { var v = W[k]; if (!v) return k; v = v[X.L()]; return typeof v === 'function' ? v.apply(null, Array.prototype.slice.call(arguments, 1)) : v; }
  // text in the label language chosen for the printout
  function lt(k) { return W[k][X.L()]; }
  function ltSub() { return ''; }

  var INSTR = {
    tokens: {
      en: ['Before you start, show your child the reward at the top of the board.', 'Give a token straight after the behaviour you want to see more of, and say what it was for ("You put your shoes on, here is a star").', 'Never take tokens away. What your child earns, they keep.', 'When the board is full, give the reward right away, then start a new board.', 'Start with few tokens so success comes quickly, then add more over time.'],
      id: ['Sebelum mulai, tunjukkan hadiah di bagian atas papan kepada anak.','Beri token segera setelah anak menunjukkan perilaku yang ingin dilatih, dan sebutkan alasannya (“Kamu pakai sepatu sendiri, ini bintangnya”).', 'Jangan pernah mengambil token. Yang sudah didapat anak, tetap miliknya.', 'Saat papan penuh, langsung berikan hadiahnya, lalu mulai papan baru.', 'Mulai dengan sedikit token agar anak cepat berhasil, lalu tambah perlahan.']
    },
    ft: {
      en: ['Put the task in "First" and something your child enjoys in "Then".', 'Point and say it simply: "First bath, then play."', 'When "First" is finished, move or tick it, and give "Then" straight away.', 'Keep the words the same each time so the board becomes familiar.'],
      id: ['Taruh tugas di “Pertama” dan hal yang disukai anak di “Setelah itu”.', 'Tunjuk sambil bilang singkat: "Pertama mandi, lalu main."', 'Saat “Pertama” selesai, pindahkan atau centang, lalu langsung berikan “Setelah itu”.', 'Pakai kata yang sama setiap kali agar papan terasa akrab.']
    },
    sched: {
      en: ['Go through the schedule together before the routine starts.', 'Point to the current step and say it simply.', 'When a step is done, tick it or cross it out together.', 'If plans change, show the change on the schedule before it happens.', 'Keep the schedule where your child can see it.'],
      id: ['Lihat jadwal bersama sebelum rutinitas dimulai.', 'Tunjuk langkah yang sedang berjalan dan sebutkan dengan singkat.', 'Saat langkah selesai, centang atau coret bersama anak.', 'Jika rencana berubah, tunjukkan perubahannya di jadwal sebelum terjadi.', 'Letakkan jadwal di tempat yang mudah dilihat anak.']
    },
    timer: {
      en: ['Show the "Wait" card and say how long: "Wait, five minutes."', 'Cover one number on the strip each minute, or point to it as time passes.', 'At the end, show "Time to finish" and move to what comes next.', 'Use the same signal every time so waiting feels predictable.'],
      id: ['Tunjukkan kartu "Tunggu" dan sebutkan lamanya: "Tunggu, lima menit."', 'Tutup satu angka setiap menit, atau tunjuk angkanya seiring waktu berjalan.', 'Di akhir, tunjukkan "Waktunya selesai" lalu lanjut ke kegiatan berikutnya.', 'Pakai tanda yang sama setiap kali, supaya anak tahu apa yang akan terjadi saat menunggu.']
    },
    cards: {
      en: ['Cut out each card along its edge. Laminate the cards if you can, so they last.', 'Use one picture for one idea, and say the word as you show the card.'],
      id: ['Gunting setiap kartu mengikuti tepinya. Laminasi kartu jika bisa, agar awet.', 'Satu gambar untuk satu hal, dan ucapkan katanya saat menunjukkan kartu.']
    }
  };

  /* ---------- svg building blocks (units: mm) ---------- */
  function nest(svg, x, y, s) {
    return svg.replace(/^<svg /, '<svg x="' + x + '" y="' + y + '" width="' + s + '" height="' + s + '" ').replace(/ width="\d+" height="\d+"( aria)/, '$1');
  }
  function text(x, y, str, size, opts) {
    opts = opts || {};
    return '<text x="' + x + '" y="' + y + '" font-family="' + (opts.body ? BODY : FONT) + '" font-weight="' + (opts.weight || 600) + '" font-size="' + size + '" fill="' + (opts.fill || INK) + '"' +
      (opts.anchor ? ' text-anchor="' + opts.anchor + '"' : '') + '>' + esc(str) + '</text>';
  }
  function wrapText(str, maxW, size) {
    var words = String(str || '').split(/\s+/), lines = [], cur = '';
    var cw = size * 0.55;
    words.forEach(function (wd) {
      var t = cur ? cur + ' ' + wd : wd;
      if (t.length * cw > maxW && cur) { lines.push(cur); cur = wd; } else cur = t;
    });
    if (cur) lines.push(cur);
    return lines;
  }
  function velcro(cx, cy, r) { return '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r || 4) + '" fill="#EFE7DA" stroke="' + LINE + '" stroke-width=".5"/>'; }
  function cutRect(x, y, w, h) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="none" stroke="#B9AF9F" stroke-width=".35" stroke-dasharray="2 1.6"/>'; }
  // one picture card at (x,y), width s. returns {svg, h}
  function pcard(ref, x, y, s, o) {
    var info = X.cardInfo(ref);
    var lb = info ? X.labelsFor(info, o.labels) : { main: '', sub: '' };
    if (info && info.type === 'text') lb = { main: '', sub: '' };
    var pad = s * 0.07, art = s - pad * 2;
    var lblH = lb.main ? s * 0.2 + (lb.sub ? s * 0.11 : 0) : 0;
    var h = s + lblH - (lb.main ? pad * 0.6 : 0);
    var g = '<rect x="' + x + '" y="' + y + '" width="' + s + '" height="' + h + '" rx="' + s * 0.08 + '" fill="#fff" stroke="' + (o.ink ? INK : '#E4DCCF') + '" stroke-width="' + (o.ink ? 0.5 : 0.6) + '"/>';
    if (!info) return { svg: g, h: h };
    if (info.type === 'photo') {
      var id = 'c' + Math.random().toString(36).slice(2, 8);
      g += '<clipPath id="' + id + '"><rect x="' + (x + pad) + '" y="' + (y + pad) + '" width="' + art + '" height="' + art + '" rx="' + s * 0.05 + '"/></clipPath>' +
        (X.PH[info.photo] ? '<image href="' + X.PH[info.photo] + '" x="' + (x + pad) + '" y="' + (y + pad) + '" width="' + art + '" height="' + art + '" preserveAspectRatio="xMidYMid slice" clip-path="url(#' + id + ')"/>' : '');
    } else if (info.type === 'text') {
      var tl = X.labelsFor(info, o.labels === 'none' ? X.L() : o.labels).main || info.idn;
      g += '<rect x="' + (x + pad) + '" y="' + (y + pad) + '" width="' + art + '" height="' + art + '" rx="' + s * 0.05 + '" fill="' + (o.ink ? '#fff' : (info.color || '#E9E1F7')) + '"' + (o.ink ? ' stroke="' + INK + '" stroke-width=".4"' : '') + '/>';
      var fs = s * 0.16, lines = wrapText(tl, art * 0.9, fs);
      lines.forEach(function (ln, i) { g += text(x + s / 2, y + pad + art / 2 + (i - (lines.length - 1) / 2) * fs * 1.15 + fs * 0.35, ln, fs, { anchor: 'middle' }); });
    } else {
      g += nest(A.svg(ref, { gender: X.kidFor(ref), ink: o.ink }), x + pad, y + pad, art);
    }
    if (lb.main) {
      var fs2 = Math.min(s * 0.13, 7.5);
      g += text(x + s / 2, y + s - pad * 0.2 + fs2 * 0.2, fitStr(lb.main, s * 0.92, fs2), fs2, { anchor: 'middle' });
      if (lb.sub) g += text(x + s / 2, y + s - pad * 0.2 + fs2 * 1.25, fitStr(lb.sub, s * 0.92, fs2 * 0.7), fs2 * 0.7, { anchor: 'middle', fill: MUTED, body: true, weight: 500 });
    }
    return { svg: g, h: h };
  }
  function fitStr(s, maxW, size) { var max = Math.floor(maxW / (size * 0.55)); return s.length > max ? s.slice(0, Math.max(1, max - 1)) + '…' : s; }
  function cardH(s, o) { var r = pcard('makan', 0, 0, s, o); return r.h; }

  var LOGO = null;
  function footer(pw, ph) {
    var y = ph - 10;
    return '<line x1="14" y1="' + (y - 6) + '" x2="' + (pw - 14) + '" y2="' + (y - 6) + '" stroke="#ECE6DC" stroke-width=".4"/>' +
      (LOGO ? '<image href="' + LOGO + '" x="14" y="' + (y - 4) + '" height="5" width="24" preserveAspectRatio="xMinYMid meet"/>' : text(14, y, 'Little Us', 4.2)) +
      text(pw - 14, y, 'thelittleus.com', 3.4, { anchor: 'end', fill: MUTED, body: true, weight: 500 });
  }
  function page(pw, ph, inner) { return { w: pw, h: ph, body: '<rect width="' + pw + '" height="' + ph + '" fill="#fff"/>' + inner + footer(pw, ph) }; }
  function heading(x, y, k, mode, size, anchor) {
    var s = text(x, y, lt(k, mode), size || 9, { anchor: anchor });
    var sub = ltSub(k, mode);
    if (sub) s += text(x, y + (size || 9) * 0.75, sub, (size || 9) * 0.5, { anchor: anchor, fill: MUTED, body: true, weight: 500 });
    return s;
  }
  // lay out cards in a grid with optional cut lines, returns array of pages
  function cardPages(refs, o, pw, ph, titleKey) {
    var s = SIZE[o.size], gap = o.cut ? 0 : 5, ch = cardH(s, o) + (o.cut ? 8 : 0), cw = s + (o.cut ? 8 : 0);
    var cols = Math.max(1, Math.floor((pw - 28 + gap) / (cw + gap)));
    var top = 30, rows = Math.max(1, Math.floor((ph - top - 22 + gap) / (ch + gap)));
    var per = cols * rows, out = [];
    for (var p = 0; p * per < refs.length || (p === 0 && !refs.length); p++) {
      var chunk = refs.slice(p * per, p * per + per), g = heading(14, 22, titleKey, o.labels, 7.5);
      var startX = (pw - (cols * cw + (cols - 1) * gap)) / 2;
      chunk.forEach(function (r, i) {
        var cx = startX + (i % cols) * (cw + gap), cy = top + Math.floor(i / cols) * (ch + gap);
        if (o.cut) g += cutRect(cx, cy, cw, ch);
        g += pcard(r, cx + (o.cut ? 4 : 0), cy + (o.cut ? 4 : 0), s, o).svg;
        if (o.velcro && !o.cut) g += velcro(cx + s / 2, cy + ch + 2.5, 1.6);
      });
      out.push(page(pw, ph, g));
      if (!refs.length) break;
    }
    return out;
  }
  function instrPage(kind, o, pw, ph, customTitle) {
    var lang = X.L();
    var lines = typeof kind === 'object' ? kind[lang] : INSTR[kind] ? INSTR[kind][lang] : [];
    var title = customTitle || { tokens: 'Token Board', ft: lang === 'id' ? 'First–Then Board' : 'First–Then Board', sched: lang === 'id' ? 'Visual Schedule' : 'Visual Schedule', timer: lang === 'id' ? 'Visual Timer' : 'Visual Timer', cards: lang === 'id' ? 'Kartu Bergambar' : 'Picture Cards' }[kind];
    var g = text(14, 30, title, 11) + text(14, 40, lang === 'id' ? W.howTo.id : W.howTo.en, 6, { fill: MUTED, body: true, weight: 500 }), y = 56;
    lines.forEach(function (ln, i) {
      g += '<circle cx="19" cy="' + (y - 1.6) + '" r="4.2" fill="' + ['#FFF1C7', '#DDF2E4', '#DCEBFA', '#E9E1F7', '#FBE0E6'][i % 5] + '"/>' + text(19, y, String(i + 1), 4.2, { anchor: 'middle' });
      wrapText(ln, pw - 48, 4.6).forEach(function (l, j) { g += text(28, y + j * 6.4, l, 4.6, { body: true, weight: 500, fill: '#4A4855' }); });
      y += Math.max(1, wrapText(ln, pw - 48, 4.6).length) * 6.4 + 7;
    });
    g += '<rect x="14" y="' + (y + 4) + '" width="' + (pw - 28) + '" height="22" rx="5" fill="#FFF8EC"/>' + nest(A.heart(30), 20, y + 9, 12) +
      text(36, y + 14, lang === 'id' ? 'Dibuat oleh Little Us, alat bantu visual gratis.' : 'Made with Little Us, free visual-support tools.', 4.4, { body: true, weight: 600 }) +
      text(36, y + 20.5, 'thelittleus.com/tools', 4, { body: true, weight: 500, fill: MUTED });
    return page(pw, ph, g);
  }

  /* ---------- page builders per tool ---------- */
  // tools that print two different things: a finished poster (PNG) or picture cards to cut out (PDF)
  function hasModes(kind, ctx) { return ctx && ctx.build ? !!ctx.modes : kind === 'sched' || kind === 'ft'; }
  function uniq(list) { return list.filter(function (v, i, a) { return a.indexOf(v) === i; }); }
  function build(kind, ctx, o) {
    var pp = PAPER.a4, pw = pp[0], ph = pp[1], d = X.D(), out = [];
    o = Object.assign({}, o, { cut: false, velcro: false });
    o.mode = hasModes(kind, ctx) ? (o.format === 'pdf' ? 'cut' : 'poster') : '';
    // tools from tools-calm.js bring their own page builder
    if (ctx && ctx.build) {
      out = ctx.build(o, pw, ph, H);
      if (o.instr && ctx.instr) out.push(instrPage(ctx.instr, o, pw, ph, ctx.title));
      return out;
    }
    var mode = o.labels;
    if (kind === 'tokens') {
      var c = d.tokens, n = c.count, g = '';
      g += heading(pw / 2, 30, 'working', mode, 11, 'middle');
      // the chosen reward is printed in its place; the token circles stay empty
      var rs = 70, rx = (pw - rs) / 2, ry = 46;
      g += pcard(c.reward, rx, ry, rs, o).svg;
      var per = Math.min(5, n), rows = Math.ceil(n / per), dd = Math.min(32, (pw - 40 - (per - 1) * 6) / per), ty = ry + rs + 28;
      for (var i = 0; i < n; i++) {
        var row = Math.floor(i / per), inRow = row === rows - 1 ? n - row * per : per, col = i - row * per;
        var cx = pw / 2 - (inRow * dd + (inRow - 1) * 6) / 2 + col * (dd + 6) + dd / 2, cy = ty + row * (dd + 8) + dd / 2;
        g += '<circle cx="' + cx + '" cy="' + cy + '" r="' + dd / 2 + '" fill="#FBF8F3" stroke="#C9BFAE" stroke-width=".6" stroke-dasharray="2.5 2"/>';
      }
      var p = X.prof();
      g += text(pw / 2, ty + rows * (dd + 8) + 8, (p ? p.name + ' · ' : '') + w('tokensN', n), 4.2, { anchor: 'middle', fill: MUTED, body: true, weight: 500 });
      out.push(page(pw, ph, g));
      // the tokens on their own page, the same size as the empty circles
      var tsz = dd - 1, cell = dd + 4, cols = Math.max(1, Math.min(n, Math.floor((pw - 28) / cell))), sx = (pw - cols * cell) / 2, g2 = heading(14, 22, 'cutTok', mode, 7.5);
      for (var k = 0; k < n; k++) {
        var x = sx + (k % cols) * cell + (cell - tsz) / 2, y = 32 + Math.floor(k / cols) * cell;
        g2 += nest(A.token(c.shape, true), x, y, tsz);
      }
      out.push(page(pw, ph, g2));
    } else if (kind === 'ft') {
      var f = d.ft;
      if (o.mode === 'cut') out = cardPages(uniq([f.first].concat(f.then)), o, pw, ph, 'cutCards');
      else {
        // the finished board, pictures already in place (landscape)
        var lw = ph, lh = pw, g3 = '', bw = (lw - 28 - 24) / 2, bh = lh - 60, by = 24;
        ['first', 'then'].forEach(function (k2, idx) {
          var bx = 14 + idx * (bw + 24);
          g3 += '<rect x="' + bx + '" y="' + by + '" width="' + bw + '" height="' + bh + '" rx="10" fill="#fff" stroke="' + INK + '" stroke-width="1"/>';
          g3 += heading(bx + bw / 2, by + 16, k2, mode, 12, 'middle');
          var cs = Math.min(bh - 50, bw - 30);
          g3 += pcard(k2 === 'first' ? f.first : f.then[0], bx + (bw - cs) / 2, by + 28, cs, o).svg;
        });
        g3 += text(lw / 2, by + bh / 2 + 4, '→', 14, { anchor: 'middle' });
        out.push(page(lw, lh, g3));
      }
    } else if (kind === 'sched') {
      var s2 = X.activeSched(); if (!s2) return out;
      var steps = s2.steps.map(function (x) { return x.card; });
      if (o.mode === 'cut') out = cardPages(uniq(steps), o, pw, ph, 'cutCards');
      else {
        // the finished schedule: every step in order with its picture and words
        var g5 = text(14, 28, X.schedName(s2), 11), n3 = steps.length, top = 40, gap5 = 4, rw = pw - 28;
        var slotH = Math.min(40, (ph - top - 24 - (n3 - 1) * gap5) / Math.max(1, n3)), TINT = ['#FFF1C7', '#DDF2E4', '#DCEBFA', '#E9E1F7', '#FBE0E6'];
        steps.forEach(function (r, i6) {
          var y6 = top + i6 * (slotH + gap5), lb2 = X.labelsFor(X.cardInfo(r), mode), nr = Math.min(6, slotH * 0.2), cs = slotH - 6;
          var nx = 14 + 4 + nr, px = nx + nr + 4, tx = px + cs + 6, fs = Math.min(10, slotH * 0.26);
          g5 += '<rect x="14" y="' + y6 + '" width="' + rw + '" height="' + slotH + '" rx="6" fill="' + TINT[i6 % 5] + '"/>' +
            '<circle cx="' + nx + '" cy="' + (y6 + slotH / 2) + '" r="' + nr + '" fill="#fff"/>' + text(nx, y6 + slotH / 2 + nr * 0.4, String(i6 + 1), nr * 1.1, { anchor: 'middle' }) +
            pcard(r, px, y6 + 3, cs, Object.assign({}, o, { labels: 'none' })).svg;
          if (lb2.main) g5 += text(tx, y6 + slotH / 2 + (lb2.sub ? -fs * 0.1 : fs * 0.35), fitStr(lb2.main, pw - 14 - tx - 4, fs), fs);
          if (lb2.sub) g5 += text(tx, y6 + slotH / 2 + fs * 0.85, fitStr(lb2.sub, pw - 14 - tx - 4, fs * 0.62), fs * 0.62, { fill: MUTED, body: true, weight: 500 });
        });
        out.push(page(pw, ph, g5));
      }
    } else if (kind === 'timer') {
      var t = d.timer, g6 = '', cw2 = (pw - 28 - 10) / 2, chh2 = cw2 * 0.9;
      [['wait', '#DCEBFA'], ['finish', '#FFF1C7']].forEach(function (x, i8) {
        var x8 = 14 + i8 * (cw2 + 10);
        g6 += (o.cut ? cutRect(x8 - 2, 22, cw2 + 4, chh2 + 4) : '') + '<rect x="' + x8 + '" y="24" width="' + cw2 + '" height="' + chh2 + '" rx="8" fill="' + (o.ink ? '#fff' : x[1]) + '" stroke="' + (o.ink ? INK : 'none') + '" stroke-width=".6"/>' +
          nest(A.heart(30), x8 + cw2 / 2 - 10, 24 + chh2 * 0.2, 20) + heading(x8 + cw2 / 2, 24 + chh2 * 0.68, x[0], mode, 11, 'middle');
      });
      var sy = 24 + chh2 + 16, sw = (pw - 28) / 5;
      g6 += '<rect x="14" y="' + sy + '" width="' + (pw - 28) + '" height="' + sw + '" rx="7" fill="#fff" stroke="' + INK + '" stroke-width="1"/>';
      for (var j = 0; j < 5; j++) {
        if (j) g6 += '<line x1="' + (14 + j * sw) + '" y1="' + sy + '" x2="' + (14 + j * sw) + '" y2="' + (sy + sw) + '" stroke="#C9BFAE" stroke-width=".5" stroke-dasharray="2 1.6"/>';
        g6 += text(14 + j * sw + sw / 2, sy + sw / 2 + 6, String(5 - j), 18, { anchor: 'middle' });
      }
      g6 += text(pw / 2, sy + sw + 10, W.cover[X.L()], 4.2, { anchor: 'middle', fill: MUTED, body: true, weight: 500 });
      if (t.next && X.cardInfo(t.next)) {
        var ns = SIZE[o.size], ny = sy + sw + 22;
        g6 += heading(pw / 2, ny, 'then', mode, 7, 'middle') + pcard(t.next, (pw - ns) / 2, ny + 8, ns, o).svg;
      }
      out.push(page(pw, ph, g6));
    } else if (kind === 'cards') {
      out = cardPages(ctx.cards || [], o, pw, ph, 'cards');
    }
    if (o.instr) out.push(instrPage(kind, o, pw, ph));
    return out;
  }

  /* ---------- fonts + logo for the final file ---------- */
  // the fonts are kept on this device after the first download, so later downloads don't wait for the network
  var FONTCSS = null, FONTKEY = 'lu_print_fonts_v1', ASSETS = null;
  try { FONTCSS = localStorage.getItem(FONTKEY) || null; } catch (e) { }
  function loadAssets() {
    if (ASSETS) return ASSETS;
    var jobs = [];
    if (LOGO === null) jobs.push(fetch('/logo.png').then(function (r) { return r.blob(); }).then(blobToData).then(function (d) { LOGO = d; }).catch(function () { LOGO = ''; }));
    if (FONTCSS === null) {
      jobs.push(timeout(fetch('https://fonts.googleapis.com/css2?family=Fredoka:wght@600&family=Figtree:wght@500;600&display=swap').then(function (r) { return r.text(); }).then(function (css) {
        // keep only the latin subsets; the same font file is fetched once even when two weights share it
        var faces = css.split('@font-face').slice(1).filter(function (f) { return /U\+0000-00FF/.test(f); }), files = {};
        faces.forEach(function (f) { var m = f.match(/url\((https:[^)]+)\)/); if (m && !files[m[1]]) files[m[1]] = fetch(m[1]).then(function (r) { return r.blob(); }).then(blobToData); });
        return Promise.all(faces.map(function (f) {
          var m = f.match(/url\((https:[^)]+)\)/); if (!m) return '';
          return files[m[1]].then(function (d) { return '@font-face' + f.replace(m[1], d).replace(/\/\*[\s\S]*?\*\//g, ''); });
        })).then(function (list) {
          FONTCSS = list.join('\n');
          try { if (FONTCSS) localStorage.setItem(FONTKEY, FONTCSS); } catch (e) { }
        });
      }), 5000).catch(function () { FONTCSS = ''; }));
    }
    ASSETS = Promise.all(jobs).then(function () { if (FONTCSS === '' || LOGO === '') ASSETS = null; });
    return ASSETS;
  }
  function timeout(p, ms) { return Promise.race([p, new Promise(function (_, rej) { setTimeout(function () { rej(new Error('timeout')); }, ms); })]); }
  function blobToData(b) { return new Promise(function (res, rej) { var r = new FileReader(); r.onload = function () { res(r.result); }; r.onerror = rej; r.readAsDataURL(b); }); }

  function svgDoc(pg, forRaster) {
    return '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ' + pg.w + ' ' + pg.h + '"' + (forRaster ? ' width="' + forRaster[0] + '" height="' + forRaster[1] + '"' : '') + '>' +
      (forRaster && FONTCSS ? '<style>' + FONTCSS + '</style>' : '') + pg.body + '</svg>';
  }
  function raster(pg, dpi) {
    var pxW = Math.round(pg.w / 25.4 * dpi), pxH = Math.round(pg.h / 25.4 * dpi);
    return new Promise(function (res, rej) {
      var url = URL.createObjectURL(new Blob([svgDoc(pg, [pxW, pxH])], { type: 'image/svg+xml' }));
      var img = new Image();
      img.onload = function () {
        var cv = document.createElement('canvas'); cv.width = pxW; cv.height = pxH;
        var ctx = cv.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, pxW, pxH); ctx.drawImage(img, 0, 0, pxW, pxH);
        URL.revokeObjectURL(url); res(cv);
      };
      img.onerror = function (e) { URL.revokeObjectURL(url); rej(e); };
      img.src = url;
    });
  }

  /* ---------- a tiny PDF writer (one JPEG image per page) ---------- */
  function pdfFromPages(items) {
    var enc = new TextEncoder(), parts = [], offsets = [], len = 0;
    function add(x) { var b = typeof x === 'string' ? enc.encode(x) : x; parts.push(b); len += b.length; }
    function obj(n, body) { offsets[n] = len; add(n + ' 0 obj\n'); body.forEach(add); add('\nendobj\n'); }
    add('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');
    var n = items.length, kids = [];
    for (var i = 0; i < n; i++) kids.push((3 + i * 3) + ' 0 R');
    obj(1, ['<< /Type /Catalog /Pages 2 0 R >>']);
    obj(2, ['<< /Type /Pages /Kids [' + kids.join(' ') + '] /Count ' + n + ' >>']);
    items.forEach(function (it, i) {
      var p = 3 + i * 3, im = p + 1, ct = p + 2;
      var w = (it.w * 72 / 25.4).toFixed(2), h = (it.h * 72 / 25.4).toFixed(2);
      obj(p, ['<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + w + ' ' + h + '] /Resources << /XObject << /Im' + i + ' ' + im + ' 0 R >> >> /Contents ' + ct + ' 0 R >>']);
      obj(im, ['<< /Type /XObject /Subtype /Image /Width ' + it.px[0] + ' /Height ' + it.px[1] + ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ' + it.jpg.length + ' >>\nstream\n', it.jpg, '\nendstream']);
      var cs = 'q ' + w + ' 0 0 ' + h + ' 0 0 cm /Im' + i + ' Do Q';
      obj(ct, ['<< /Length ' + cs.length + ' >>\nstream\n' + cs + '\nendstream']);
    });
    var xref = len, last = 3 + n * 3;
    add('xref\n0 ' + last + '\n0000000000 65535 f \n');
    for (var k = 1; k < last; k++) add(String(offsets[k]).padStart(10, '0') + ' 00000 n \n');
    add('trailer\n<< /Size ' + last + ' /Root 1 0 R >>\nstartxref\n' + xref + '\n%%EOF');
    return new Blob(parts, { type: 'application/pdf' });
  }
  function canvasJPEG(cv) {
    return new Promise(function (res) {
      cv.toBlob(function (b) { b.arrayBuffer().then(function (ab) { res(new Uint8Array(ab)); }); }, 'image/jpeg', 0.9);
    });
  }
  function save(blob, name) {
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 5000);
  }

  /* ---------- the options sheet ---------- */
  var OPT = null;
  function open(kind, ctx, api) {
    X = api;
    var S = X.S();
    var prev = OPT || {};
    // the poster (PNG) comes first and is the default
    OPT = { format: prev.format || 'png', labels: S.settings.labels, size: prev.size || 'm', instr: false };
    var sh = X.sheet('', { full: true });
    var toolName = ctx && ctx.title ? ctx.title : { tokens: X.tr('tokens'), ft: X.tr('ft'), sched: X.tr('sched'), timer: X.tr('timer'), cards: X.tr('printCards') }[kind];
    var modes = hasModes(kind, ctx);
    function opts() { return { format: OPT.format, ink: false, labels: OPT.labels, size: OPT.size, instr: OPT.instr }; }
    // card size only matters where loose picture cards are printed
    function showSize() { return kind === 'cards' || (ctx && ctx.build ? ctx.file === 'feelings' : modes && OPT.format === 'pdf'); }
    function segH(name, list, cur) { return '<div class="tl-seg">' + list.map(function (o) { return '<button type="button" data-o="' + name + '" data-v="' + o[0] + '" class="' + (cur === o[0] ? 'on' : '') + '">' + esc(o[1]) + '</button>'; }).join('') + '</div>'; }
    function tog(name, on) { return '<button type="button" class="tl-tog" role="switch" aria-checked="' + !!on + '" data-t="' + name + '"></button>'; }
    function render() {
      var pages = build(kind, ctx, opts());
      var p = X.prof();
      var h = '<div class="tl-top" style="padding:0 0 10px"><button type="button" class="tl-iconbtn" data-x aria-label="Back"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 18l-6-6 6-6"/></svg></button><div class="tl-toptx"><h1>' + esc(w('title')) + '</h1><small>' + esc(toolName + (p ? ' · ' + p.name : '')) + '</small></div></div>' +
        '<div class="tl-dlprev"><div class="tl-dlpages">' + pages.slice(0, 4).map(function (pg) {
          return '<div class="tl-dlpage" style="aspect-ratio:' + pg.w + '/' + pg.h + '">' + svgDoc(pg) + '</div>';
        }).join('') + '</div><span class="tl-dlcount">' + esc(w('pages', pages.length)) + '</span></div>' +
        '<div class="tl-lab2">' + esc(w(modes ? 'printAs' : 'format')) + '</div>' + segH('format', modes ? [['png', w('poster')], ['pdf', w('cutting')]] : [['png', w('png')], ['pdf', w('pdf')]], OPT.format) +
        (modes ? '<small style="display:block;margin:8px 2px 0;font-size:13px;line-height:1.4;color:var(--muted,#6B6875)">' + esc(w(OPT.format === 'pdf' ? 'cuttingD' : 'posterD')) + '</small>' : '') +
        '<div class="tl-lab2">' + esc(w('labels')) + '</div>' + segH('labels', [['id', 'ID'], ['en', 'EN'], ['both', w('both')], ['none', w('none')]], OPT.labels) +
        (showSize() ? '<div class="tl-lab2">' + esc(w('size')) + '</div>' + segH('size', [['s', w('s')], ['m', w('m')], ['l', w('l')]], OPT.size) : '') +
        '<div class="tl-panel">' +
        '<div class="tl-row"><div><b>' + esc(w('instr')) + '</b><small>' + esc(w('instrD')) + '</small></div>' + tog('instr', OPT.instr) + '</div></div>' +
        '<div class="tl-sheetfoot col"><button type="button" class="tl-btn primary lg block" data-go>' + esc(OPT.format === 'pdf' ? w('dlPdf') : w('dlPng')) + '</button><small>' + esc(w('made')) + '</small></div>';
      sh.set(h);
    }
    sh.el.onclick = function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (b.hasAttribute('data-x')) return sh.close();
      if (b.dataset.o) { OPT[b.dataset.o] = b.dataset.v; return render(); }
      if (b.dataset.t) { OPT[b.dataset.t] = !OPT[b.dataset.t]; return render(); }
      if (b.hasAttribute('data-go')) {
        b.disabled = true; b.textContent = w('making');
        make(kind, ctx, opts()).then(function () { b.disabled = false; render(); }).catch(function (err) { console.error('[Little Us] download failed', err); X.toast(w('fail')); render(); });
      }
    };
    loadAssets().then(function () { if (document.body.contains(sh.el)) render(); });
    render();
  }
  function make(kind, ctx, o) {
    return loadAssets().then(function () {
      var pages = build(kind, ctx, o);
      var base = 'littleus-' + (ctx && ctx.file ? ctx.file : { tokens: 'token-board', ft: 'first-then', sched: 'schedule', timer: 'timer-cards', cards: 'cards' }[kind]) + (X.prof() ? '-' + X.prof().name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : '');
      if (o.format === 'png') {
        var dpi = 200;
        return Promise.all(pages.map(function (pg) { return raster(pg, dpi); })).then(function (cvs) {
          var gap = 30, W2 = Math.max.apply(null, cvs.map(function (c) { return c.width; })), H2 = cvs.reduce(function (s, c) { return s + c.height; }, 0) + gap * (cvs.length - 1);
          var out = document.createElement('canvas'); out.width = W2; out.height = H2;
          var cx = out.getContext('2d'); cx.fillStyle = '#EEE9E0'; cx.fillRect(0, 0, W2, H2);
          var y = 0; cvs.forEach(function (c) { cx.drawImage(c, (W2 - c.width) / 2, y); y += c.height + gap; });
          return new Promise(function (res) { out.toBlob(function (b) { save(b, base + '.png'); res(); }, 'image/png'); });
        });
      }
      var dpi2 = 150, items = [];
      return pages.reduce(function (pr, pg) {
        return pr.then(function () { return raster(pg, dpi2); }).then(function (cv) { return canvasJPEG(cv).then(function (jpg) { items.push({ w: pg.w, h: pg.h, px: [cv.width, cv.height], jpg: jpg }); }); });
      }, Promise.resolve()).then(function () { save(pdfFromPages(items), base + '.pdf'); });
    });
  }

  // drawing helpers handed to page builders in other files (units: mm)
  var H = { page: page, text: text, wrapText: wrapText, nest: nest, pcard: pcard, cutRect: cutRect, velcro: velcro, cardPages: cardPages, fitStr: fitStr, cardH: cardH, SIZE: SIZE, INK: INK, MUTED: MUTED, LINE: LINE };
  // warm(): fetch the fonts and logo in the background, so pressing Download doesn't wait for them
  window.LUPrint = { open: open, warm: function () { loadAssets(); }, build: function (k, c, o, api) { X = api; return build(k, c, o); }, svgDoc: svgDoc };
})();
