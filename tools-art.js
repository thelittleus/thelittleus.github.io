/* little us · picture card illustrations
   Each card is drawn as a small SVG (120 x 120) in the little us style:
   warm ink outline, flat pastel fills, and a soft brush-shape backdrop tinted by category.
   Cards that show a child have a boy and a girl version.
   To add a card: add an entry to CARDS with an id, category, labels and a draw function. */
(function () {
  'use strict';

  var K = '#2B2A35';
  var C = {
    white: '#FFFFFF', cream: '#FFF8EC', yellow: '#FFC94A', yellowL: '#FFE29A', coral: '#F0694F', coralL: '#F7A08C',
    coralD: '#D9573F', pink: '#F6B3C2', pinkL: '#FBD5DE', blue: '#7DB3E8', blueL: '#BFDCF6', green: '#7FCB98',
    greenL: '#C3E8CF', greenD: '#4FA772', lilac: '#B9A3E3', lilacL: '#DCCFF3', brown: '#B98157', brownL: '#E5BE93',
    brownD: '#7A4E35', skin: '#F7D3B7', skinD: '#EDB894', hair: '#3A3036', grey: '#C9CED6', greyL: '#E8EBF0',
    water: '#9CCBF2', cheek: '#F4A3A0', sand: '#F3E4C8'
  };

  // Category tints (backdrop brush shapes)
  var CATS = [
    { id: 'self', tint: '#DDF2E4', en: 'Self-care', idn: 'Merawat diri' },
    { id: 'food', tint: '#FFF1C7', en: 'Food', idn: 'Makanan' },
    { id: 'routine', tint: '#DCEBFA', en: 'Routines', idn: 'Rutinitas' },
    { id: 'play', tint: '#FBE0E6', en: 'Play & rewards', idn: 'Main & hadiah' },
    { id: 'places', tint: '#FFE9DA', en: 'Places', idn: 'Tempat' },
    { id: 'feel', tint: '#E9E1F7', en: 'Feelings & school', idn: 'Perasaan & sekolah' }
  ];
  var TINT = {};
  CATS.forEach(function (c) { TINT[c.id] = c.tint; });

  /* ---------- tiny drawing helpers ---------- */
  function P(d, fill, extra) { return '<path d="' + d + '" fill="' + (fill || 'none') + '"' + (extra || '') + '/>'; }
  function O(cx, cy, r, fill, extra) { return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + (fill || 'none') + '"' + (extra || '') + '/>'; }
  function E(cx, cy, rx, ry, fill, extra) { return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="' + (fill || 'none') + '"' + (extra || '') + '/>'; }
  function R(x, y, w, h, rx, fill, extra) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + (rx || 0) + '" fill="' + (fill || 'none') + '"' + (extra || '') + '/>'; }
  var NS = ' stroke="none"';
  function HL(d) { return '<path d="' + d + '" fill="none" stroke="#fff" stroke-width="2.6" opacity=".9"/>'; }
  function SW(w) { return ' stroke-width="' + w + '"'; }
  // an outlined thick line (like a tube): ink stroke underneath, colour on top
  function TUBE(d, w, col) { return P(d, 'none', SW(w + 5)) + P(d, 'none', ' stroke="' + col + '"' + SW(w)); }
  function G(t, inner) { return '<g transform="' + t + '">' + inner + '</g>'; }

  /* ---------- light, shade and line ----------
     Every filled shape gets three tones of its colour, lit from the top left: a darker tone shows along the
     bottom-right edge, the main tone sits on top, and round shapes get a soft highlight. Outlines are drawn
     last so they stay crisp. outline() adds a thicker ink line around the outside of a whole drawing, so
     the outer edge reads heavier than the small inner details. Both work on plain SVG markup, so every
     drawing stays a self-contained SVG that still prints and downloads as before. */
  var FX = (function () {
    var N = 0, CACHE = {};
    function hex2(h) {
      h = h.replace('#', ''); if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
      return [parseInt(h.slice(0, 2), 16) / 255, parseInt(h.slice(2, 4), 16) / 255, parseInt(h.slice(4, 6), 16) / 255];
    }
    function toHsl(c) {
      var r = c[0], g = c[1], b = c[2], mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, h = 0, s = 0, d = mx - mn;
      if (d) { s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h /= 6; }
      return [h, s, l];
    }
    function toHex(h, s, l) {
      function f(n) { var k = (n + h * 12) % 12, a = s * Math.min(l, 1 - l); var v = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)); return ('0' + Math.round(v * 255).toString(16)).slice(-2); }
      return '#' + f(0) + f(8) + f(4);
    }
    // k < 0 darker, k > 0 lighter. Shadows lean a little warm-to-cool so they read as shade, not dirt.
    function tone(col, k) {
      var key = col + k; if (CACHE[key]) return CACHE[key];
      var hs = toHsl(hex2(col)), h = hs[0], s = hs[1], l = hs[2], out;
      if (k < 0) {
        if (s < 0.12 && l > 0.88) out = toHex(0.1, 0.22, l + k * 0.75);
        else { var hh = h + (h > 0.08 && h < 0.5 ? 0.012 : -0.008); out = toHex((hh + 1) % 1, Math.min(1, s * 1.08 + 0.04), Math.max(0.12, l + k)); }
      } else out = toHex(h, s, l + (1 - l) * k);
      return (CACHE[key] = out);
    }
    function isInk(col) { var c = hex2(col); return toHsl(c)[2] < 0.3; }
    var SKIP = /(^|\s)(id|class|opacity|fill-opacity|clip-path|mask|filter|style|data-[\w-]+)=/;
    var GEO = /\s(stroke|stroke-width|stroke-linecap|stroke-linejoin|stroke-dasharray|stroke-opacity|fill|vector-effect)="[^"]*"/g;
    function num(a, k) { var m = new RegExp('\\s' + k + '="([-\\d.]+)"').exec(a); return m ? parseFloat(m[1]) : null; }
    function one(tag, attrs, o) {
      var fm = /\sfill="(#[0-9a-fA-F]{3,6})"/.exec(attrs);
      if (!fm || SKIP.test(attrs) || /\sstroke="none"/.test(attrs) || isInk(fm[1])) return null;
      var fill = fm[1], d = o.d || 2.5;
      if (tag === 'circle') { var r = num(attrs, 'r'); if (r == null || r < (o.min || 4)) return null; d = Math.min(d, r * 0.16); }
      if (tag === 'ellipse') { var rx = num(attrs, 'rx'), ry = num(attrs, 'ry'); if (rx == null || Math.min(rx, ry) < (o.min || 4) * 0.8) return null; d = Math.min(d, Math.min(rx, ry) * 0.18); }
      if (tag === 'rect') { var w = num(attrs, 'width'), hh = num(attrs, 'height'); if (w == null || hh == null || Math.min(w, hh) < (o.min || 4) * 1.5 || (o.maxW && w >= o.maxW)) return null; d = Math.min(d, Math.min(w, hh) * 0.12); }
      var geo = attrs.replace(GEO, ''), id = 'lux' + (++N).toString(36), dk = tone(fill, o.k || -0.15), dd = Math.round(d * 100) / 100;
      var s = '<' + tag + geo + ' fill="' + dk + '" stroke="none"/>' +
        '<clipPath id="' + id + '"><' + tag + geo + '/></clipPath><g clip-path="url(#' + id + ')"><g transform="translate(' + (-dd) + ' ' + (-dd * 1.15).toFixed(2) + ')"><' + tag + geo + ' fill="' + fill + '" stroke="none"/></g>';
      if (tag === 'path' || tag === 'rect') s += '<g transform="translate(' + (dd * 0.9).toFixed(2) + ' ' + dd + ')"><' + tag + geo + ' fill="none" stroke="' + tone(fill, 0.5) + '" stroke-width="' + (dd * 1.05).toFixed(2) + '" opacity=".7"/></g>';
      if (tag === 'circle' || tag === 'ellipse') {
        var cx = num(attrs, 'cx') || 0, cy = num(attrs, 'cy') || 0, ex = tag === 'circle' ? num(attrs, 'r') : num(attrs, 'rx'), ey = tag === 'circle' ? ex : num(attrs, 'ry');
        var tf = /\stransform="([^"]*)"/.exec(attrs), hx = cx - ex * 0.36, hy = cy - ey * 0.42;
        if (Math.min(ex, ey) >= 6) s += '<ellipse cx="' + hx.toFixed(1) + '" cy="' + hy.toFixed(1) + '" rx="' + (ex * 0.26).toFixed(1) + '" ry="' + (ey * 0.15).toFixed(1) + '" fill="' + tone(fill, 0.55) + '" stroke="none" opacity=".8" transform="' + (tf ? tf[1] + ' ' : '') + 'rotate(-32 ' + hx.toFixed(1) + ' ' + hy.toFixed(1) + ')"/>';
      }
      s += '</g><' + tag + attrs.replace(/\sfill="[^"]*"/, ' fill="none"') + '/>';
      return s;
    }
    var EL = /<(path|circle|ellipse|rect)\b([^>]*?)\s*\/>/g;
    var BLOCK = /<(defs|clipPath|mask|pattern|linearGradient|radialGradient|text|filter)\b[\s\S]*?<\/\1>/g;
    function blocks(svg, fn) {
      var out = '', last = 0, m; BLOCK.lastIndex = 0;
      while ((m = BLOCK.exec(svg))) { out += fn(svg.slice(last, m.index)) + m[0]; last = BLOCK.lastIndex; }
      return out + fn(svg.slice(last));
    }
    function enrich(svg, o) {
      o = o || {};
      return blocks(svg, function (part) { return part.replace(EL, function (m, tag, attrs) { attrs = ' ' + attrs.trim(); return one(tag, attrs, o) || m; }); });
    }
    // a heavier ink line around the outside of a drawing (placed underneath it)
    function outline(svg, w) {
      var s = blocks(svg, function (p) { return p; }).replace(BLOCK, '');
      s = s.replace(/<(path|circle|ellipse|rect)\b([^>]*?)\s*\/>/g, function (m, tag, a) {
        if (!/\sfill="(?!none)/.test(a) || /\sstroke="none"/.test(a)) return '';
        if (/\sopacity="/.test(a) || /\sclass="/.test(a) && /shadow/.test(a)) return '';
        a = a.replace(/\sfill="(?!none)[^"]*"/, ' fill="' + K + '"').replace(/\sstroke="(?!none)[^"]*"/, ' stroke="' + K + '"')
          .replace(/\sstroke-width="([\d.]+)"/, function (x, v) { return ' stroke-width="' + (parseFloat(v) + w - 3).toFixed(1) + '"'; })
          .replace(/\s(id|class|role|tabindex|aria-[\w-]+|data-[\w-]+)="[^"]*"/g, '');
        return '<' + tag + a + '/>';
      }).replace(/\s(id|role|tabindex|data-[\w-]+)="[^"]*"/g, '');
      return '<g stroke="' + K + '" stroke-width="' + w + '" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true">' + s + '</g>';
    }
    // soft texture for backgrounds: a fine dot grain in a slightly deeper tint
    function grain(tint, size, op) {
      var id = 'lug' + (++N).toString(36), z = size || 7;
      return { id: id, def: '<pattern id="' + id + '" width="' + z + '" height="' + z + '" patternUnits="userSpaceOnUse" patternTransform="rotate(18)"><circle cx="' + (z * 0.25) + '" cy="' + (z * 0.3) + '" r="' + (z * 0.11).toFixed(2) + '" fill="' + tone(tint, -0.22) + '" opacity="' + (op || 0.55) + '"/><circle cx="' + (z * 0.75) + '" cy="' + (z * 0.8) + '" r="' + (z * 0.07).toFixed(2) + '" fill="#fff" opacity=".7"/></pattern>' };
    }
    function mix(a, b, t) { var x = hex2(a), y = hex2(b); return '#' + [0, 1, 2].map(function (i) { return ('0' + Math.round((x[i] + (y[i] - x[i]) * t) * 255).toString(16)).slice(-2); }).join(''); }
    function uid(p) { return (p || 'lu') + (++N).toString(36); }
    return { tone: tone, mix: mix, enrich: enrich, outline: outline, grain: grain, uid: uid };
  })();

  var BLOBS = [
    'M62 11c25 1 46 17 47 42 2 27-15 51-44 55-29 4-54-13-55-40C8 42 33 10 62 11z',
    'M57 13c22-3 44 9 50 32 6 25-5 52-32 59-27 7-55-3-61-30-6-27 15-58 43-61z',
    'M60 12c28 0 48 19 48 46 0 29-21 50-48 50S11 88 12 60c1-27 21-48 48-48z',
    'M64 12c22 2 42 14 45 38 3 30-12 54-42 57-30 3-55-12-56-42C10 38 36 9 64 12z'
  ];

  /* ---------- child figure ---------- */
  // head drawn at the origin with radius 18; use G('translate(x y) scale(s)', head(...))
  function head(g, o) {
    o = o || {};
    var s = '';
    if (o.wrap === 'mukena') {
      s += P('M-27 30C-30 4-24-28 0-29 24-28 30 4 27 30Z', C.white);
    } else if (g === 'girl') {
      s += P('M-21-1C-23-20-10-27 0-27 10-27 23-20 21-1L23 15C17 20 11 19 8 14H-8C-11 19-17 20-23 15Z', C.hair);
    }
    if (o.wrap !== 'mukena') {
      s += O(-18, 3, 4.2, C.skin) + O(18, 3, 4.2, C.skin);
    }
    s += O(0, 0, 18, C.skin);
    if (o.wrap === 'mukena') {
      s += P('M-19 4C-20-14-11-22 0-22 11-22 20-14 19 4', 'none', SW(3));
    } else if (o.hat === 'peci') {
      s += P('M-17-6C-17-16-10-22 0-22 10-22 17-16 17-6Z', K);
      s += P('M-12-17C-6-20 6-20 12-17', 'none', ' stroke="#55525F"' + SW(1.6));
    } else if (g === 'girl') {
      s += P('M-18 2C-21-15-10-24 1-23 13-22 21-14 18 2 16-6 12-10 6-10 2-14-6-13-9-9-13-9-17-5-18 2Z', C.hair);
      s += G('rotate(24 11 -13)', R(6, -16, 11, 6, 3, C.yellow, SW(2)));
    } else {
      s += P('M-18-1C-20-15-11-23 1-23 12-22 20-15 18-1 15-7 11-9 7-8 4-12-1-12-4-8-8-11-13-9-14-5-16-5-17-3-18-1Z', C.hair);
    }
    // eyes
    if (o.eyes === 'closed') {
      s += P('M-9 3Q-6.5 5.5-4 3', 'none', SW(2.2)) + P('M4 3Q6.5 5.5 9 3', 'none', SW(2.2));
    } else {
      s += E(-6.5, 2.5, 1.9, 2.5, K, NS) + E(6.5, 2.5, 1.9, 2.5, K, NS);
    }
    s += E(-11, 8.5, 3.4, 2.2, C.cheek, NS + ' opacity=".85"') + E(11, 8.5, 3.4, 2.2, C.cheek, NS + ' opacity=".85"');
    if (o.mouth === 'open') s += P('M-4 9.5Q0 15.5 4 9.5Z', '#C9574A', SW(2));
    else if (o.mouth === 'o') s += E(0, 11, 2.6, 3, '#C9574A', SW(2));
    else if (o.mouth !== 'none') s += P('M-4 9.5Q0 13 4 9.5', 'none', SW(2.4));
    return s;
  }
  function torso(fill, extra) {
    return P('M-22 44C-22 28-13 21 0 21 13 21 22 28 22 44Z', fill, extra);
  }

  /* ---------- small reusable objects ---------- */
  function house(roof, wall, extra) {
    return P('M18 60 60 24 102 60Z', roof) + R(28, 56, 64, 42, 3, wall) + R(52, 72, 16, 26, 4, C.yellow) +
      R(34, 64, 13, 13, 2, C.blueL) + R(73, 64, 13, 13, 2, C.blueL) + O(64, 86, 1.6, K, NS) + (extra || '');
  }
  function car(col) {
    return P('M16 82V69C16 63 20 59 26 59L37 43C39 40 42 38 46 38H74C78 38 81 40 83 43L93 59H96C101 59 104 63 104 69V82Z', col) +
      P('M42 56 48 45H59V56Z', C.blueL) + P('M65 56V45H73L80 56Z', C.blueL) +
      HL('M24 66H32') + O(37, 83, 10, K) + O(37, 83, 4, C.grey, NS) + O(84, 83, 10, K) + O(84, 83, 4, C.grey, NS) +
      R(96, 63, 6, 5, 2, C.yellow, SW(2));
  }
  function face(col, kind) {
    var s = O(60, 62, 34, col);
    var eyes = E(48, 56, 3.2, 4.2, K, NS) + E(72, 56, 3.2, 4.2, K, NS);
    var cheeks = E(41, 68, 5, 3.2, C.cheek, NS + ' opacity=".7"') + E(79, 68, 5, 3.2, C.cheek, NS + ' opacity=".7"');
    switch (kind) {
      case 'happy': s += eyes + cheeks + P('M47 70Q60 84 73 70', 'none', SW(3.2)); break;
      case 'sad': s += eyes + P('M49 80Q60 70 71 80', 'none', SW(3.2)) + P('M74 62C72 68 72 72 75 72 78 72 78 68 74 62Z', C.water, SW(2)); break;
      case 'angry': s += P('M41 47 53 52', 'none', SW(3.2)) + P('M79 47 67 52', 'none', SW(3.2)) + E(48, 58, 3, 3.6, K, NS) + E(72, 58, 3, 3.6, K, NS) + P('M49 79Q60 71 71 79', 'none', SW(3.2)); break;
      case 'scared': s += O(48, 56, 5, '#fff', SW(2.2)) + O(72, 56, 5, '#fff', SW(2.2)) + O(48, 57, 2, K, NS) + O(72, 57, 2, K, NS) + P('M46 78 51 74 55 78 60 74 65 78 69 74 74 78', 'none', SW(2.6)); break;
      case 'tired': s += P('M42 58Q48 62 54 58', 'none', SW(3)) + P('M66 58Q72 62 78 58', 'none', SW(3)) + cheeks + E(60, 76, 4, 3, K, NS) + P('M86 30H94L86 40H94', 'none', SW(2.6)) + P('M78 20H84L78 27H84', 'none', SW(2.2)); break;
      case 'calm': s += P('M42 57Q48 62 54 57', 'none', SW(3)) + P('M66 57Q72 62 78 57', 'none', SW(3)) + cheeks + P('M51 72Q60 78 69 72', 'none', SW(3)); break;
      case 'sick': s += P('M42 58Q48 54 54 58', 'none', SW(3)) + P('M66 58Q72 54 78 58', 'none', SW(3)) + P('M50 76Q55 73 60 76 65 79 70 76', 'none', SW(2.8)) +
        G('rotate(-35 84 80)', R(78, 62, 9, 34, 4.5, '#fff', SW(2.4)) + O(82.5, 92, 5, C.coral, SW(2.4)) + R(81, 68, 3, 18, 1.5, C.coral, NS)); break;
    }
    return s;
  }

  /* ---------- the cards ---------- */
  // kid: true means the draw function receives 'boy' or 'girl'
  var CARDS = [
    // Self-care
    { id: 'mandi', cat: 'self', en: 'Bath', idn: 'Mandi', kid: true, tags: 'bath shower wash gayung ember mandi sore', draw: function (g) {
      return G('translate(56 62)', P('M-22 44C-22 30-13 23 0 23 13 23 22 30 22 44Z', C.skin)) +
        G('translate(56 60) scale(1.05)', head(g, { eyes: 'closed', mouth: 'smile' })) +
        P('M14 104C10 92 18 84 28 86 30 78 42 76 46 82 52 74 66 74 70 82 76 76 88 78 90 86 100 84 108 92 104 104Z', '#fff') +
        O(24, 72, 4, '#fff', SW(2)) + O(98, 70, 5, '#fff', SW(2)) + O(90, 58, 3, '#fff', SW(2)) +
        G('rotate(28 84 30)', P('M70 22H96L93 40C92 43 90 44 87 44H79C76 44 74 43 73 40Z', C.yellow) + R(95, 26, 16, 6, 3, C.yellow)) +
        P('M70 44C68 48 68 51 70 51 72 51 72 48 70 44Z', C.water, SW(1.8)) + P('M62 38C60 42 60 45 62 45 64 45 64 42 62 38Z', C.water, SW(1.8)) +
        P('M76 52C74 56 74 59 76 59 78 59 78 56 76 52Z', C.water, SW(1.8));
    } },
    { id: 'sikat-gigi', cat: 'self', en: 'Brush teeth', idn: 'Sikat gigi', kid: true, tags: 'teeth toothbrush brush gigi', draw: function (g) {
      return G('translate(58 60)', torso(g === 'girl' ? C.pink : C.blue)) +
        G('translate(58 56) scale(1.25)', head(g, { mouth: 'open' })) +
        G('rotate(-8 74 74)', R(60, 70, 44, 8, 4, C.green) + R(56, 66, 12, 9, 2, '#fff') + P('M57 66V62M60 66V62M63 66V62M66 66V62', 'none', SW(1.8))) +
        O(48, 76, 3, '#fff', SW(1.8)) + O(42, 70, 2.2, '#fff', SW(1.6)) + O(92, 46, 4, '#fff', SW(1.8)) + O(98, 56, 2.6, '#fff', SW(1.6));
    } },
    { id: 'wudhu', cat: 'self', en: 'Ablution', idn: 'Wudhu', kid: true, tags: 'wudhu ablution wash pray sholat', draw: function (g) {
      return TUBE('M118 28H86C80 28 76 32 76 38V44', 7, C.grey) + R(88, 18, 14, 8, 3, C.grey, SW(2.6)) +
        P('M76 50V62', 'none', ' stroke="' + C.water + '"' + SW(5)) + P('M71 66C69 70 69 72 71 72 73 72 73 70 71 66Z', C.water, SW(1.8)) +
        G('translate(44 64)', torso(g === 'girl' ? C.lilacL : C.greenL)) +
        G('translate(44 58) scale(1.05)', head(g, { mouth: 'smile' })) +
        G('rotate(-20 72 82)', E(72, 82, 13, 8, C.skin)) + G('rotate(20 82 82)', E(82, 82, 13, 8, C.skin)) +
        O(96, 70, 3.2, '#fff', SW(1.8)) + O(64, 70, 2.4, '#fff', SW(1.6));
    } },
    { id: 'pakai-baju', cat: 'self', en: 'Get dressed', idn: 'Pakai baju', kid: true, tags: 'dress clothes shirt baju', draw: function (g) {
      var shirt = g === 'girl' ? C.coralL : C.yellow;
      return G('translate(60 58)', head(g, { mouth: 'smile' })) +
        P('M38 80 24 88 18 102H40Z', shirt) + P('M82 80 96 88 102 102H80Z', shirt) +
        P('M40 78C46 76 52 75 60 75 68 75 74 76 80 78V106H40Z', shirt) + P('M52 76Q60 84 68 76', 'none', SW(2.6)) +
        (g === 'girl' ? O(60, 92, 3, '#fff', SW(2)) : P('M54 92H66', 'none', ' stroke="#fff"' + SW(3))) +
        P('M88 30 91 36 97 37 92 41 94 47 88 44 82 47 84 41 79 37 85 36Z', C.yellow, SW(2));
    } },
    { id: 'tidur', cat: 'self', en: 'Sleep', idn: 'Tidur', kid: true, tags: 'sleep bed nap tidur siang', draw: function (g) {
      return R(16, 48, 62, 30, 15, '#fff') + G('translate(46 60) rotate(-8)', head(g, { eyes: 'closed', mouth: 'none' })) +
        P('M12 74C26 68 52 66 70 70 88 74 100 70 108 66V96C108 99 106 101 103 101H17C14 101 12 99 12 96Z', C.lilac) +
        O(38, 86, 2.6, '#fff', NS) + O(58, 90, 2.6, '#fff', NS) + O(80, 86, 2.6, '#fff', NS) + O(96, 92, 2.6, '#fff', NS) +
        P('M80 24H92L80 38H92', 'none', SW(3)) + P('M98 14H106L98 23H106', 'none', SW(2.6));
    } },
    { id: 'bangun', cat: 'routine', en: 'Wake up', idn: 'Bangun', kid: true, tags: 'wake morning bangun pagi', draw: function (g) {
      return O(94, 26, 10, C.yellow) + P('M94 9V5M108 14 111 11M111 28H115M80 14 77 11', 'none', SW(2.6)) +
        TUBE('M40 76 24 42', 7, C.skin) + TUBE('M80 76 96 42', 7, C.skin) +
        O(24, 38, 6, C.skin) + O(96, 38, 6, C.skin) +
        G('translate(60 66)', torso(g === 'girl' ? C.pink : C.blueL)) + G('translate(60 58)', head(g, { mouth: 'o' })) +
        P('M10 84C30 78 90 78 110 84V102H10Z', C.lilac) + O(34, 92, 2.6, '#fff', NS) + O(60, 94, 2.6, '#fff', NS) + O(86, 92, 2.6, '#fff', NS);
    } },
    { id: 'sholat', cat: 'routine', en: 'Prayer', idn: 'Sholat', kid: true, tags: 'pray prayer sholat salat masjid ibadah', draw: function (g) {
      var mat = P('M20 108 32 84H88L100 108Z', C.green) + P('M30 102 38 88H82L90 102Z', 'none', ' stroke="#fff"' + SW(2)) + P('M52 88C52 84 56 82 60 82 64 82 68 84 68 88', 'none', ' stroke="#fff"' + SW(2));
      if (g === 'girl') {
        return mat + P('M36 98C36 70 44 50 60 50 76 50 84 70 84 98Z', '#fff') + P('M48 70C52 66 68 66 72 70', 'none', SW(2.4)) +
          G('translate(60 42) scale(1.05)', head('girl', { wrap: 'mukena', eyes: 'closed' }));
      }
      return mat + P('M44 74H76L80 98H40Z', C.brown) + P('M46 82H78M44 90H79', 'none', ' stroke="' + C.brownD + '"' + SW(2)) +
        P('M42 76C42 60 50 52 60 52 70 52 78 60 78 76Z', '#fff') + P('M60 54V70', 'none', SW(2)) +
        E(60, 66, 9, 5, C.skin) + G('translate(60 40)', head('boy', { hat: 'peci', eyes: 'closed' }));
    } },
    { id: 'toilet', cat: 'self', en: 'Toilet', idn: 'Ke toilet', tags: 'toilet potty wc pee poo kamar mandi', draw: function () {
      return R(36, 20, 48, 30, 7, '#fff') + R(70, 26, 8, 5, 2, C.grey, SW(2)) +
        P('M28 58H92C92 75 81 85 67 87L69 100H51L53 87C39 85 28 75 28 58Z', '#fff') + R(24, 52, 72, 11, 5.5, C.blueL) + HL('M40 70C44 76 50 79 56 80');
    } },
    { id: 'cuci-tangan', cat: 'self', en: 'Wash hands', idn: 'Cuci tangan', tags: 'wash hands soap tangan sabun', draw: function () {
      return TUBE('M14 30H52C58 30 62 34 62 40V46', 7, C.grey) + R(28, 20, 14, 8, 3, C.grey, SW(2.6)) +
        P('M62 52V62', 'none', ' stroke="' + C.water + '"' + SW(5)) +
        G('rotate(-24 52 84)', E(52, 84, 18, 11, C.skin)) + G('rotate(24 72 84)', E(72, 84, 18, 11, C.skin)) +
        O(34, 66, 5, '#fff', SW(2)) + O(90, 72, 6, '#fff', SW(2)) + O(84, 56, 3.5, '#fff', SW(2)) + O(26, 82, 3, '#fff', SW(1.8));
    } },
    { id: 'handuk', cat: 'self', en: 'Towel', idn: 'Handuk', tags: 'towel dry handuk', draw: function () {
      return P('M18 28H102', 'none', SW(3.4)) + O(18, 28, 4, C.grey) + O(102, 28, 4, C.grey) +
        P('M34 28H86V92C86 96 84 98 80 98H40C36 98 34 96 34 92Z', C.blue) + P('M34 28H86V40H34Z', C.blueL, NS) + P('M34 40H86', 'none', SW(2.4)) +
        P('M34 78H86M34 86H86', 'none', ' stroke="#fff"' + SW(3)) + P('M34 28H86V92C86 96 84 98 80 98H40C36 98 34 96 34 92Z', 'none');
    } },
    { id: 'sepatu', cat: 'self', en: 'Put on shoes', idn: 'Pakai sepatu', tags: 'shoes sepatu sandal', draw: function () {
      return P('M18 76C18 62 22 48 30 48H44C46 56 52 60 60 62L84 68C94 70 100 76 100 82V86H18Z', C.coral) +
        R(15, 84, 88, 11, 5.5, '#fff') + P('M44 56 52 52M47 62 55 58M52 66 60 62', 'none', ' stroke="#fff"' + SW(2.6)) + HL('M26 60V72');
    } },
    // Food
    { id: 'makan', cat: 'food', en: 'Eat', idn: 'Makan', tags: 'eat food rice nasi meal lunch makan siang', draw: function () {
      return TUBE('M78 48 98 24', 4, C.greyL) + P('M30 64C30 46 44 36 60 36 76 36 90 46 90 64Z', '#fff') +
        P('M47 50 50 48M60 44 63 45M70 53 68 56M53 58 56 58M76 46 78 49', 'none', SW(2)) +
        P('M24 62H96C96 82 80 94 60 94 40 94 24 82 24 62Z', C.coral) + P('M30 71C46 76 74 76 90 71', 'none', ' stroke="#fff"' + SW(3)) +
        P('M48 93 50 100H70L72 93', C.coralD);
    } },
    { id: 'minum', cat: 'food', en: 'Drink', idn: 'Minum', tags: 'drink water cup minum air', draw: function () {
      return TUBE('M66 60 72 24 86 20', 3.5, C.coral) + P('M38 38H82L77 92C76.5 96 74 98 70 98H50C46 98 43.5 96 43 92Z', '#fff') +
        P('M40.6 58H79.4L76.6 92C76.2 95 74 96.6 70.4 96.6H49.6C46 96.6 43.8 95 43.4 92Z', C.water, NS) +
        P('M38 38H82L77 92C76.5 96 74 98 70 98H50C46 98 43.5 96 43 92Z', 'none') + HL('M49 66 51 88');
    } },
    { id: 'sarapan', cat: 'food', en: 'Breakfast', idn: 'Sarapan', tags: 'breakfast morning sarapan pagi nasi goreng telur', draw: function () {
      return O(26, 30, 8, C.yellow) + P('M26 16V13M38 22 40 20M40 32H43M12 32H9M14 22 12 20', 'none', SW(2.4)) +
        E(60, 76, 44, 20, '#fff') + E(60, 74, 34, 13, C.greyL, SW(2)) +
        P('M28 74C30 62 44 58 56 62 60 59 68 61 70 67 68 76 48 80 28 74Z', '#E8A05A') + O(42, 68, 1.5, C.greenD, NS) + O(52, 72, 1.5, C.coralD, NS) +
        P('M64 62C68 54 84 52 90 60 96 66 92 78 82 78 74 80 62 74 64 62Z', '#fff') + O(78, 66, 6.5, C.yellow);
    } },
    { id: 'buah', cat: 'food', en: 'Fruit', idn: 'Buah', tags: 'fruit apple banana buah apel pisang', draw: function () {
      return P('M66 34C84 38 98 56 96 78 94 83 89 83 89 78 87 62 78 50 62 44 58 42 60 34 66 34Z', C.yellow) +
        P('M44 50C32 46 22 58 24 72 26 88 38 96 46 92 50 90 54 90 58 92 66 96 78 86 78 72 80 58 68 46 56 50 52 52 48 52 44 50Z', C.coral) +
        P('M50 50C50 44 52 40 55 38', 'none', SW(2.6)) + P('M54 42C58 34 68 34 70 38 66 44 58 44 54 42Z', C.green) + HL('M34 62C32 68 33 74 35 78');
    } },
    { id: 'susu', cat: 'food', en: 'Milk', idn: 'Susu', tags: 'milk susu', draw: function () {
      return P('M34 42 42 30H62L70 42V98H34Z', '#fff') + P('M42 30V22H62V30', '#fff') + R(34, 56, 36, 20, 0, C.blueL) +
        P('M52 61C49 66 48 69 52 71 56 69 55 66 52 61Z', '#fff', SW(2)) +
        P('M78 58H100L97 98H81Z', '#fff') + P('M79 68H99L97 96H81Z', C.cream, NS) + P('M78 58H100L97 98H81Z', 'none');
    } },
    { id: 'roti', cat: 'food', en: 'Bread', idn: 'Roti', tags: 'bread toast roti', draw: function () {
      return P('M30 58C24 42 40 32 60 32 80 32 96 42 90 58 88 62 86 63 86 67V92C86 95 84 97 81 97H39C36 97 34 95 34 92V67C34 63 32 62 30 58Z', '#D99A5B') +
        P('M38 60C34 48 46 40 60 40 74 40 86 48 82 60 80 63 79 64 79 67V90H41V67C41 64 40 63 38 60Z', '#FBE3B8', NS);
    } },
    { id: 'biskuit', cat: 'food', en: 'Biscuit', idn: 'Biskuit', tags: 'biscuit cookie snack biskuit kue jajan', draw: function () {
      return O(60, 62, 33, C.brownL) + O(48, 50, 3.5, C.brownD, NS) + O(70, 46, 3, C.brownD, NS) + O(76, 66, 3.5, C.brownD, NS) +
        O(52, 74, 3, C.brownD, NS) + O(62, 60, 2.5, C.brownD, NS) + O(40, 64, 2.5, C.brownD, NS) + O(64, 84, 2.5, C.brownD, NS) + HL('M38 44C34 50 32 56 32 62');
    } },
    { id: 'es-krim', cat: 'play', en: 'Ice cream', idn: 'Es krim', tags: 'ice cream es krim treat reward', draw: function () {
      return P('M44 60 60 104 76 60Z', C.brownL) + P('M50 70 70 66M53 80 67 77M47 64 62 92M73 64 58 92', 'none', ' stroke="' + C.brown + '"' + SW(2)) +
        O(50, 56, 13, C.pink) + O(70, 56, 13, C.cream) + O(60, 38, 14, C.coralL) + O(56, 34, 2, '#fff', NS);
    } },
    // Routines
    { id: 'sekolah', cat: 'routine', en: 'School', idn: 'Sekolah', tags: 'school bag backpack sekolah tas', draw: function () {
      return P('M48 34V28C48 22 52 18 60 18 68 18 72 22 72 28V34', 'none', SW(4)) + R(32, 32, 56, 66, 18, C.blue) +
        R(40, 64, 40, 26, 9, C.blueL) + P('M40 72H80', 'none', SW(2.4)) + R(44, 40, 32, 8, 4, C.blueL, SW(2.4)) +
        R(56, 69, 8, 6, 2, C.yellow, SW(2)) + HL('M38 46V58');
    } },
    { id: 'pulang', cat: 'routine', en: 'Go home', idn: 'Pulang', tags: 'home house go home pulang rumah', draw: function () { return house(C.coral, '#fff'); } },
    { id: 'naik-motor', cat: 'routine', en: 'Ride the motorbike', idn: 'Naik motor', tags: 'motorbike scooter motor ride ojek', draw: function () {
      return O(32, 84, 13, K) + O(32, 84, 5, C.grey, NS) + O(90, 84, 13, K) + O(90, 84, 5, C.grey, NS) +
        P('M16 82C16 68 24 60 38 60H62L66 74H42C36 74 33 78 33 84H16Z', C.blue) + R(30, 52, 30, 9, 4.5, K) +
        R(56, 74, 26, 7, 2, C.grey) + P('M76 84 80 36H90L88 60C96 64 100 72 100 82Z', C.blue) +
        P('M76 34 94 31', 'none', SW(4)) + O(91, 46, 3.5, C.yellow, SW(2)) + HL('M22 72C24 68 28 66 32 66');
    } },
    { id: 'naik-mobil', cat: 'routine', en: 'Ride in the car', idn: 'Naik mobil', tags: 'car drive mobil', draw: function () { return car(C.coral); } },
    { id: 'tunggu', cat: 'routine', en: 'Wait', idn: 'Tunggu', tags: 'wait waiting tunggu sabar sebentar', draw: function () {
      return P('M40 26H80C80 44 66 48 66 60 66 72 80 76 80 94H40C40 76 54 72 54 60 54 48 40 44 40 26Z', C.blueL) +
        P('M47 34H73C71 42 64 47 60 54 56 47 49 42 47 34Z', C.yellow, NS) + P('M44 91C46 81 54 77 60 75 66 77 74 81 76 91Z', C.yellow, NS) +
        P('M60 56V74', 'none', ' stroke="' + C.yellow + '"' + SW(2)) +
        P('M40 26H80C80 44 66 48 66 60 66 72 80 76 80 94H40C40 76 54 72 54 60 54 48 40 44 40 26Z', 'none') +
        R(32, 18, 56, 9, 4.5, C.coral) + R(32, 93, 56, 9, 4.5, C.coral);
    } },
    { id: 'selesai', cat: 'routine', en: 'Finished', idn: 'Selesai', tags: 'done finished selesai all done', draw: function () {
      return P('M60 100C40 86 18 72 18 48 18 33 29 24 42 24 51 24 56 29 60 37 64 29 69 24 78 24 91 24 102 33 102 48 102 72 80 86 60 100Z', C.green) +
        E(52, 56, 2.4, 4.2, K, NS) + E(66, 56, 2.4, 4.2, K, NS) + P('M47 68Q58 78 72 66', 'none', SW(3)) + HL('M30 42C30 37 33 34 37 33');
    } },
    { id: 'baca-buku', cat: 'routine', en: 'Read a book', idn: 'Baca buku', tags: 'read book story baca buku cerita', draw: function () {
      return P('M60 40C50 30 32 28 18 30V86C32 84 50 86 60 96 70 86 88 84 102 86V30C88 28 70 30 60 40Z', C.green) +
        P('M60 44C50 36 36 34 24 35V82C36 81 50 83 60 90Z', '#fff') + P('M60 44C70 36 84 34 96 35V82C84 81 70 83 60 90Z', '#fff') +
        P('M32 46C40 46 46 48 52 50M32 56C40 56 46 58 52 60M32 66C40 66 46 68 52 70M68 50C74 48 80 46 88 46M68 60C74 58 80 56 88 56', 'none', ' stroke="' + C.grey + '"' + SW(2.4));
    } },
    { id: 'mengaji', cat: 'routine', en: 'Read the Quran', idn: 'Mengaji', tags: 'quran ngaji mengaji rehal', draw: function () {
      return TUBE('M32 100 88 66', 5, C.brown) + TUBE('M32 66 88 100', 5, C.brown) +
        P('M20 62 60 72 100 62 95 34 60 42 25 34Z', C.greenD) + P('M27 58 60 66V46L30 39Z', '#fff') + P('M93 58 60 66V46L90 39Z', '#fff') +
        P('M36 46 52 50M36 52 52 56M68 50 84 46M68 56 84 52', 'none', ' stroke="' + C.grey + '"' + SW(2));
    } },
    { id: 'menulis', cat: 'feel', en: 'Write', idn: 'Menulis', tags: 'write pencil homework tulis pr belajar', draw: function () {
      return G('rotate(-8 52 60)', R(26, 24, 54, 72, 6, '#fff') + P('M34 40H72M34 50H72M34 60H64M34 70H70', 'none', ' stroke="' + C.grey + '"' + SW(2.4))) +
        G('rotate(-50 80 74)', R(60, 68, 42, 13, 2, C.yellow) + P('M60 68 46 74.5 60 81Z', C.brownL) + P('M50.5 72.4 46 74.5 50.5 76.6Z', K, NS) + R(98, 68, 6, 13, 0, C.grey) + R(104, 68, 8, 13, 4, C.pink));
    } },
    { id: 'beres-beres', cat: 'routine', en: 'Tidy up', idn: 'Beres-beres', tags: 'tidy clean up toys box beres rapikan mainan', draw: function () {
      return O(44, 52, 11, C.coral) + P('M35 48C40 50 48 50 53 47', 'none', ' stroke="#fff"' + SW(2.4)) + G('rotate(14 72 46)', R(62, 34, 20, 20, 3, C.yellow)) +
        R(24, 58, 72, 40, 6, C.brownL) + P('M24 70H96', 'none', SW(2.4)) + R(52, 76, 16, 8, 4, C.brown, SW(2.4));
    } },
    // Play & rewards
    { id: 'main', cat: 'play', en: 'Play', idn: 'Main', tags: 'play toys blocks main mainan', draw: function () {
      return R(24, 62, 32, 32, 4, C.yellow) + R(56, 62, 32, 32, 4, C.coral) + R(40, 30, 32, 32, 4, C.green) +
        O(40, 78, 7, '#fff', NS) + P('M65 86 72 72 79 86Z', '#fff', NS) + P('M56 36V56M46 46H66', 'none', ' stroke="#fff"' + SW(5));
    } },
    { id: 'lego', cat: 'play', en: 'Lego', idn: 'Lego', tags: 'lego bricks build blocks', draw: function () {
      return R(28, 32, 15, 8, 3, C.yellow) + R(48, 32, 15, 8, 3, C.yellow) + R(24, 38, 44, 24, 4, C.yellow) +
        R(34, 58, 15, 8, 3, C.blue) + R(54, 58, 15, 8, 3, C.blue) + R(74, 58, 15, 8, 3, C.blue) + R(26, 64, 70, 30, 4, C.blue) + HL('M32 72V86');
    } },
    { id: 'ayunan', cat: 'play', en: 'Swing', idn: 'Ayunan', tags: 'swing playground ayunan taman', draw: function () {
      return P('M14 100H106', 'none', ' stroke="' + C.greenD + '"' + SW(4)) + TUBE('M32 24 22 100', 4, C.coral) + TUBE('M88 24 98 100', 4, C.coral) + TUBE('M26 24H94', 5, C.coral) +
        P('M50 27V74M70 27V74', 'none', SW(2.6)) + R(42, 72, 36, 9, 4, C.yellow);
    } },
    { id: 'perosotan', cat: 'play', en: 'Slide', idn: 'Perosotan', tags: 'slide playground perosotan', draw: function () {
      return P('M14 102H106', 'none', ' stroke="' + C.greenD + '"' + SW(4)) + TUBE('M30 102V30', 3, C.grey) + TUBE('M46 102V30', 3, C.grey) +
        P('M30 44H46M30 58H46M30 72H46M30 86H46', 'none', SW(3)) + R(26, 26, 26, 8, 3, C.coral) +
        P('M48 30C66 32 70 60 84 82 88 90 94 96 104 96V104C88 104 80 96 74 86 62 66 58 42 48 40Z', C.yellow);
    } },
    { id: 'gelembung', cat: 'play', en: 'Bubbles', idn: 'Gelembung', tags: 'bubbles gelembung sabun', draw: function () {
      return TUBE('M30 104 50 74', 3, C.pink) + O(55, 66, 10, 'none', SW(4)) + O(55, 66, 10, 'none', ' stroke="' + C.pink + '"' + SW(1.8)) +
        O(78, 40, 16, '#E6F2FC') + P('M70 34C71 30 74 28 78 28', 'none', ' stroke="#fff"' + SW(3)) +
        O(48, 32, 10, '#E6F2FC') + P('M43 29C44 27 46 26 48 26', 'none', ' stroke="#fff"' + SW(2.6)) +
        O(90, 74, 9, '#E6F2FC') + O(30, 52, 6, '#E6F2FC');
    } },
    { id: 'stiker', cat: 'play', en: 'Stickers', idn: 'Stiker', tags: 'stickers stiker reward', draw: function () {
      return P('M28 26H92V82L74 100H28Z', '#fff') + P('M92 82 74 100V86C74 84 76 82 78 82Z', C.greyL) +
        P('M48 34 52 43 62 44 55 51 57 61 48 56 39 61 41 51 34 44 44 43Z', C.yellow, SW(2.4)) +
        P('M76 62C70 58 66 52 66 48 66 44 69 42 72 42 74 42 75 43 76 45 77 43 78 42 80 42 83 42 86 44 86 48 86 52 82 58 76 62Z', C.pink, SW(2.4)) +
        O(48, 80, 9, C.green, SW(2.4)) + O(76, 34, 5, C.blue, SW(2.4));
    } },
    { id: 'nonton', cat: 'play', en: 'Watch TV', idn: 'Nonton', tags: 'tv watch nonton televisi kartun', draw: function () {
      return P('M48 22 60 32 72 22', 'none', SW(3)) + R(18, 32, 84, 56, 9, K) + R(25, 38, 70, 44, 5, C.blueL, NS) + P('M54 50V70L70 60Z', '#fff', NS) +
        P('M40 88 34 100M80 88 86 100', 'none', SW(4));
    } },
    { id: 'main-tablet', cat: 'play', en: 'Tablet time', idn: 'Main tablet', tags: 'tablet hp phone ipad game gawai', draw: function () {
      return R(30, 20, 60, 82, 10, K) + R(36, 28, 48, 62, 4, C.lilacL, NS) + O(60, 96, 2.6, '#55525F', NS) +
        O(50, 50, 7, C.yellow, SW(2.4)) + R(62, 44, 14, 14, 3, C.coral, SW(2.4)) + P('M46 78 54 66 62 78Z', C.green, SW(2.4)) + O(72, 72, 6, C.blue, SW(2.4));
    } },
    { id: 'bola', cat: 'play', en: 'Ball', idn: 'Bola', tags: 'ball bola play', draw: function () {
      return O(60, 62, 32, C.yellow) + P('M60 30C44 40 40 64 46 92 36 86 28 76 28 62 28 46 42 32 60 30Z', C.coral, NS) +
        P('M60 30C76 40 80 64 74 92 84 86 92 76 92 62 92 46 78 32 60 30Z', C.blue, NS) + O(60, 62, 32, 'none') +
        P('M60 30C44 40 40 64 46 92M60 30C76 40 80 64 74 92', 'none', SW(2.4)) + O(60, 33, 4, C.yellow, SW(2));
    } },
    { id: 'mobil-mobilan', cat: 'play', en: 'Toy car', idn: 'Mobil-mobilan', tags: 'toy car mobilan', draw: function () { return car(C.yellow); } },
    { id: 'boneka', cat: 'play', en: 'Teddy', idn: 'Boneka', tags: 'teddy doll bear boneka', draw: function () {
      return O(40, 30, 9, C.brownL) + O(80, 30, 9, C.brownL) + E(60, 84, 26, 22, C.brownL) + E(60, 88, 13, 11, C.cream, NS) +
        O(32, 82, 9, C.brownL) + O(88, 82, 9, C.brownL) + O(60, 48, 24, C.brownL) + E(60, 56, 10, 8, C.cream) +
        E(51, 44, 2.4, 3, K, NS) + E(69, 44, 2.4, 3, K, NS) + E(60, 52.5, 3.4, 2.4, K, NS) + P('M57 58Q60 61 63 58', 'none', SW(2));
    } },
    { id: 'menggambar', cat: 'play', en: 'Drawing', idn: 'Menggambar', tags: 'draw crayons colour gambar mewarnai', draw: function () {
      var cr = function (x, col, r) { return G('rotate(' + r + ' ' + (x + 7) + ' 70)', R(x, 40, 14, 50, 3, col) + P('M' + x + ' 40 ' + (x + 7) + ' 26 ' + (x + 14) + ' 40Z', col) + P('M' + x + ' 56H' + (x + 14) + 'M' + x + ' 80H' + (x + 14), 'none', ' stroke="#fff"' + SW(2))); };
      return P('M22 98C34 88 46 104 58 94 70 84 82 102 98 92', 'none', ' stroke="' + C.coral + '"' + SW(4)) + cr(32, C.blue, -14) + cr(53, C.yellow, 0) + cr(74, C.green, 14);
    } },
    { id: 'puzzle', cat: 'play', en: 'Puzzle', idn: 'Puzzle', tags: 'puzzle jigsaw', draw: function () {
      return P('M30 40H50C48 32 52 26 58 26 64 26 68 32 66 40H86V58C94 56 100 60 100 66 100 72 94 76 86 74V94H66C68 86 64 80 58 80 52 80 48 86 50 94H30Z', C.lilac) + HL('M36 48V62');
    } },
    { id: 'musik', cat: 'play', en: 'Music', idn: 'Musik', tags: 'music song sing musik lagu nyanyi', draw: function () {
      return P('M44 82V36L88 26V72', 'none', SW(4)) + P('M44 36 88 26V38L44 48Z', K) +
        E(36, 84, 10, 8, C.coral) + E(80, 74, 10, 8, C.blue) + P('M24 30 28 34M20 44H25', 'none', SW(2.4));
    } },
    { id: 'pelukan', cat: 'play', en: 'Hug', idn: 'Pelukan', tags: 'hug cuddle peluk sayang', draw: function () {
      return P('M60 98C42 86 22 74 22 52 22 38 32 30 44 30 52 30 57 35 60 42 63 35 68 30 76 30 88 30 98 38 98 52 98 74 78 86 60 98Z', C.pink) +
        P('M26 62C36 74 48 78 60 78 72 78 84 74 94 62', 'none', ' stroke="' + C.skin + '"' + SW(9)) + P('M26 62C36 74 48 78 60 78 72 78 84 74 94 62', 'none', SW(1.6)) + HL('M32 46C32 42 35 39 39 38');
    } },
    // Places
    { id: 'rumah', cat: 'places', en: 'Home', idn: 'Rumah', tags: 'home house rumah', draw: function () { return house(C.coral, '#fff'); } },
    { id: 'rumah-nenek', cat: 'places', en: "Grandma's house", idn: 'Rumah Nenek', tags: 'grandma grandparents nenek kakek eyang oma', draw: function () {
      return house(C.lilac, C.cream, P('M88 30C84 27 82 24 82 22 82 20 84 19 85.5 19 86.5 19 87.5 20 88 21 88.5 20 89.5 19 90.5 19 92 19 94 20 94 22 94 24 92 27 88 30Z', C.pink, SW(2)));
    } },
    { id: 'sekolah-gedung', cat: 'places', en: 'School', idn: 'Sekolah', tags: 'school building sekolah kelas', draw: function () {
      return P('M60 16V36', 'none', SW(2.6)) + R(60, 16, 16, 5, 0, '#E6463B', SW(1.6)) + R(60, 21, 16, 5, 0, '#fff', SW(1.6)) +
        P('M14 56 60 34 106 56Z', C.yellow) + R(22, 54, 76, 46, 3, '#fff') + R(52, 74, 16, 26, 3, C.coral) +
        R(28, 62, 14, 12, 2, C.blueL) + R(78, 62, 14, 12, 2, C.blueL) + R(28, 80, 14, 12, 2, C.blueL) + R(78, 80, 14, 12, 2, C.blueL);
    } },
    { id: 'masjid', cat: 'places', en: 'Mosque', idn: 'Masjid', tags: 'mosque masjid musholla', draw: function () {
      return R(88, 40, 10, 62, 2, '#fff') + P('M86 42C86 34 89 30 93 28 97 30 100 34 100 42Z', C.green) +
        R(26, 60, 58, 42, 3, '#fff') + P('M28 62C28 42 42 32 55 28 68 32 82 42 82 62Z', C.green) + P('M55 28V20', 'none', SW(2.4)) +
        P('M55 13A5 5 0 1 0 58 21 4 4 0 1 1 55 13Z', C.yellow, SW(1.8)) + P('M48 102V86C48 81 51 78 55 78 59 78 62 81 62 86V102Z', C.yellow);
    } },
    { id: 'minimarket', cat: 'places', en: 'Mini-mart', idn: 'Minimarket', tags: 'shop minimarket store warung belanja jajan', draw: function () {
      var st = '';
      for (var i = 0; i < 6; i++) st += P('M' + (20 + i * 13.3) + ' 34H' + (33.3 + i * 13.3) + 'V46C' + (33.3 + i * 13.3) + ' 50 ' + (20 + i * 13.3) + ' 50 ' + (20 + i * 13.3) + ' 46Z', i % 2 ? '#fff' : C.green, SW(2.4));
      return R(24, 46, 72, 54, 3, '#fff') + R(30, 56, 30, 44, 2, C.blueL) + P('M45 56V100', 'none', SW(2)) + R(66, 56, 24, 22, 2, C.blueL) +
        R(18, 24, 84, 12, 4, C.coral) + st;
    } },
    { id: 'taman', cat: 'places', en: 'Park', idn: 'Taman', tags: 'park garden outside taman', draw: function () {
      return P('M12 100H108', 'none', ' stroke="' + C.greenD + '"' + SW(4)) + R(52, 62, 14, 38, 3, C.brown) +
        P('M58 18C76 18 90 30 90 46 98 50 98 66 86 70 80 78 66 78 60 72 52 78 38 76 34 68 22 66 20 50 30 44 30 28 44 18 58 18Z', C.green) +
        HL('M38 38C42 32 48 28 54 28') + O(26, 94, 4, C.yellow, SW(2)) + O(94, 94, 4, C.pink, SW(2));
    } },
    { id: 'pasar', cat: 'places', en: 'Market', idn: 'Pasar', tags: 'market pasar belanja', draw: function () {
      return P('M24 40V100M96 40V100', 'none', SW(3.4)) + P('M16 42 28 24H92L104 42Z', C.yellow) + P('M40 24 36 42M60 24V42M80 24 84 42', 'none', SW(2.4)) +
        R(20, 76, 80, 12, 3, C.brownL) + O(38, 70, 7, C.coral) + O(52, 70, 7, C.coral) + O(45, 62, 7, C.coral) +
        P('M66 76C66 66 72 62 78 62 84 62 90 66 90 76Z', C.green) + P('M70 66 74 70M80 64V70M86 66 84 70', 'none', SW(2));
    } },
    { id: 'dokter', cat: 'places', en: 'Doctor', idn: 'Dokter', tags: 'doctor clinic hospital dokter rumah sakit puskesmas', draw: function () {
      return P('M36 22V48C36 64 48 72 60 72 72 72 84 64 84 48V22', 'none', SW(8)) + P('M36 22V48C36 64 48 72 60 72 72 72 84 64 84 48V22', 'none', ' stroke="' + C.blue + '"' + SW(3.5)) +
        O(36, 22, 4, C.grey) + O(84, 22, 4, C.grey) + P('M60 72V82C60 92 70 96 78 92', 'none', SW(8)) + P('M60 72V82C60 92 70 96 78 92', 'none', ' stroke="' + C.blue + '"' + SW(3.5)) +
        O(86, 88, 12, C.grey) + O(86, 88, 6, '#fff');
    } },
    { id: 'dokter-gigi', cat: 'places', en: 'Dentist', idn: 'Dokter gigi', tags: 'dentist teeth tooth dokter gigi', draw: function () {
      return P('M40 26C30 26 24 34 24 46 24 60 32 66 34 78 36 92 38 102 46 102 54 102 52 82 60 82 68 82 66 102 74 102 82 102 84 92 86 78 88 66 96 60 96 46 96 34 90 26 80 26 72 26 68 32 60 32 52 32 48 26 40 26Z', '#fff') +
        HL('M34 40C34 36 36 34 40 33') + P('M100 18 102 24 108 26 102 28 100 34 98 28 92 26 98 24Z', C.yellow, SW(2)) + P('M16 66 17.5 70 22 71.5 17.5 73 16 77 14.5 73 10 71.5 14.5 70Z', C.yellow, SW(1.8));
    } },
    { id: 'potong-rambut', cat: 'places', en: 'Haircut', idn: 'Potong rambut', tags: 'haircut barber salon potong rambut cukur', draw: function () {
      return G('rotate(-30 46 56)', O(28, 76, 9, 'none', ' stroke="' + C.coral + '"' + SW(5)) + O(28, 76, 9, 'none', SW(1.5)) + O(52, 76, 9, 'none', ' stroke="' + C.coral + '"' + SW(5)) + O(52, 76, 9, 'none', SW(1.5)) +
        P('M34 68 52 26 44 66ZM46 68 28 26 36 66Z', C.grey) + O(40, 60, 2.6, K, NS)) +
        G('rotate(20 84 64)', R(74, 30, 18, 66, 4, C.yellow) + P('M74 42H66M74 50H66M74 58H66M74 66H66M74 74H66M74 82H66', 'none', SW(3)));
    } },
    // Feelings & school
    { id: 'senang', cat: 'feel', en: 'Happy', idn: 'Senang', tags: 'happy glad senang gembira', draw: function () { return face(C.yellow, 'happy'); } },
    { id: 'sedih', cat: 'feel', en: 'Sad', idn: 'Sedih', tags: 'sad cry sedih nangis', draw: function () { return face(C.blueL, 'sad'); } },
    { id: 'marah', cat: 'feel', en: 'Angry', idn: 'Marah', tags: 'angry mad marah kesal', draw: function () { return face(C.coralL, 'angry'); } },
    { id: 'takut', cat: 'feel', en: 'Scared', idn: 'Takut', tags: 'scared afraid takut cemas', draw: function () { return face(C.lilacL, 'scared'); } },
    { id: 'capek', cat: 'feel', en: 'Tired', idn: 'Capek', tags: 'tired sleepy capek ngantuk lelah', draw: function () { return face(C.greenL, 'tired'); } },
    { id: 'tenang', cat: 'feel', en: 'Calm', idn: 'Tenang', tags: 'calm relax tenang', draw: function () { return face(C.greenL, 'calm'); } },
    { id: 'sakit', cat: 'feel', en: 'Unwell', idn: 'Sakit', tags: 'sick unwell ill sakit demam', draw: function () { return face(C.pinkL, 'sick'); } },
    { id: 'istirahat', cat: 'feel', en: 'Break', idn: 'Istirahat', tags: 'break rest istirahat jeda pojok tenang', draw: function () {
      return P('M18 92C14 70 26 52 46 48 52 36 70 34 82 42 98 46 108 64 102 86 98 98 84 102 60 102 34 102 20 100 18 92Z', C.lilac) +
        P('M40 62C46 70 58 72 70 66', 'none', SW(2.4)) + O(62, 58, 3, '#fff', SW(2)) + HL('M30 70C30 64 32 60 36 58');
    } },
    { id: 'minta-tolong', cat: 'feel', en: 'Help please', idn: 'Minta tolong', tags: 'help please tolong bantu', draw: function () {
      return R(46, 20, 11, 34, 5.5, C.skin) + R(58, 16, 11, 38, 5.5, C.skin) + R(70, 22, 11, 32, 5.5, C.skin) + R(82, 32, 10, 26, 5, C.skin) +
        P('M44 50H92V72C92 88 82 98 68 98 54 98 44 88 44 76Z', C.skin) + P('M44 66C36 58 26 58 26 64 26 68 34 72 40 80', C.skin) +
        P('M54 64C58 66 66 66 70 64', 'none', ' stroke="' + C.skinD + '"' + SW(2.4)) + P('M26 30 34 36M20 46H28', 'none', SW(2.6));
    } },
    { id: 'duduk', cat: 'feel', en: 'Sit down', idn: 'Duduk', tags: 'sit chair duduk kursi', draw: function () {
      return TUBE('M40 70 34 102M80 70 86 102M44 76 46 102M76 76 74 102', 3, C.brown) + R(30, 62, 60, 12, 4, C.yellow) +
        R(36, 20, 48, 34, 8, C.yellow) + TUBE('M44 54V62M76 54V62', 3, C.brown);
    } },
    { id: 'dengar', cat: 'feel', en: 'Listen', idn: 'Dengarkan', tags: 'listen ear hear dengar', draw: function () {
      return P('M44 54C44 34 58 22 74 24 90 26 98 40 96 56 94 70 84 74 80 84 76 96 66 102 56 98 48 94 50 86 54 82', C.skin) +
        P('M62 56C62 44 70 38 78 40 86 42 88 52 82 58 78 62 72 62 72 70', 'none', ' stroke="' + C.skinD + '"' + SW(3)) +
        P('M28 50C24 56 24 64 28 70M18 44C12 54 12 66 18 76', 'none', ' stroke="' + C.blue + '"' + SW(3.2));
    } },
    { id: 'antre', cat: 'feel', en: 'My turn', idn: 'Giliranku', tags: 'turn taking my turn giliran antre', draw: function () {
      return P('M44 70 34 104 46 98 52 108 58 76Z', C.coral) + P('M76 70 86 104 74 98 68 108 62 76Z', C.coral) +
        O(60, 52, 32, C.yellow) + O(60, 52, 24, 'none', ' stroke="#fff"' + SW(3)) +
        P('M60 36 65 47 77 48 68 56 71 68 60 62 49 68 52 56 43 48 55 47Z', '#fff', SW(2.4));
    } },
    // ---------- added set 2 ----------
    // Self-care
    { id: 'sisir', cat: 'self', en: 'Comb hair', idn: 'Sisir rambut', tags: 'comb hair brush sisir rambut rapi', draw: function () {
      return P('M58 92 66 74', 'none', SW(7)) + P('M58 92 66 74', 'none', ' stroke="' + C.pink + '"' + SW(3)) + O(74, 46, 26, C.pink) + O(74, 46, 19, C.blueL) + HL('M64 36C67 32 71 30 75 30') +
        G('rotate(-35 40 70)', R(18, 62, 46, 12, 4, C.yellow) + P('M22 74V86M28 74V86M34 74V86M40 74V86M46 74V86M52 74V86M58 74V86', 'none', SW(3)));
    } },
    { id: 'potong-kuku', cat: 'self', en: 'Cut nails', idn: 'Potong kuku', tags: 'nails clipper potong kuku', draw: function () {
      return G('translate(-8 6)', R(36, 22, 11, 36, 5.5, C.skin) + R(48, 16, 11, 42, 5.5, C.skin) + R(60, 20, 11, 38, 5.5, C.skin) + R(72, 30, 10, 30, 5, C.skin) +
        P('M34 52H82V74C82 90 72 100 58 100 44 100 34 90 34 78Z', C.skin) + P('M34 68C26 60 16 60 16 66 16 70 24 74 30 82', C.skin) +
        E(41.5, 26, 3.4, 2.6, '#fff', SW(1.6)) + E(53.5, 20, 3.4, 2.6, '#fff', SW(1.6)) + E(65.5, 24, 3.4, 2.6, '#fff', SW(1.6)) + E(77, 34, 3.2, 2.4, '#fff', SW(1.6))) +
        G('rotate(-30 96 76)', R(84, 72, 30, 9, 4, C.grey) + P('M86 70 112 62', 'none', SW(4)) + P('M86 70 112 62', 'none', ' stroke="' + C.coral + '"' + SW(2)) + O(88, 76, 3, K, NS));
    } },
    { id: 'obat', cat: 'self', en: 'Medicine', idn: 'Minum obat', tags: 'medicine syrup obat sirup vitamin sakit', draw: function () {
      return R(30, 34, 36, 64, 8, C.coral) + R(34, 22, 28, 14, 4, '#fff') + R(30, 52, 36, 26, 0, '#fff') + P('M48 58V72M41 65H55', 'none', ' stroke="' + C.coral + '"' + SW(4)) +
        HL('M36 82V90') + G('rotate(-25 84 70)', R(70, 86, 6, 26, 3, C.greyL) + E(73, 76, 12, 9, C.greyL) + E(73, 76, 8, 5.5, C.coralL, NS));
    } },
    { id: 'tisu', cat: 'self', en: 'Tissue', idn: 'Tisu', tags: 'tissue nose blow ingus pilek tisu', draw: function () {
      return P('M60 46C52 34 56 22 64 18 66 28 74 32 72 44Z', '#fff') + R(22, 46, 76, 46, 8, C.blue) + E(60, 54, 22, 5, '#fff') +
        P('M30 70H90', 'none', ' stroke="#fff"' + SW(3)) + O(42, 80, 3, '#fff', NS) + O(60, 80, 3, '#fff', NS) + O(78, 80, 3, '#fff', NS);
    } },
    { id: 'kaus-kaki', cat: 'self', en: 'Socks', idn: 'Kaus kaki', tags: 'socks kaus kaki pakai', draw: function () {
      var sock = function (col) { return P('M10 18H34V58C34 66 40 70 46 74 52 78 52 92 40 92H22C12 92 10 82 10 74Z', col) + P('M10 28H34', 'none', ' stroke="#fff"' + SW(4)) + P('M10 36H34', 'none', ' stroke="#fff"' + SW(4)); };
      return G('translate(18 4)', sock(C.pink)) + G('translate(56 12)', sock(C.blue));
    } },
    // Food
    { id: 'telur', cat: 'food', en: 'Egg', idn: 'Telur', tags: 'egg boiled telur rebus', draw: function () {
      return E(44, 64, 20, 26, C.cream) + HL('M34 52C36 46 40 42 44 41') + P('M64 80C64 62 72 50 84 50 96 50 104 62 104 80Z', '#fff') + P('M60 80H108C108 92 98 98 84 98 70 98 60 92 60 80Z', '#fff') + O(84, 80, 10, C.yellow);
    } },
    { id: 'ayam', cat: 'food', en: 'Chicken', idn: 'Ayam goreng', tags: 'chicken fried ayam goreng lauk', draw: function () {
      return P('M66 66 86 86', 'none', SW(10)) + P('M66 66 86 86', 'none', ' stroke="#fff"' + SW(5)) + O(90, 84, 7, '#fff') + O(84, 92, 7, '#fff') +
        P('M24 54C20 36 36 22 54 26 72 30 80 48 72 64 64 76 44 80 34 72 28 68 26 62 24 54Z', '#D99A5B') + P('M36 46C40 40 46 36 52 36', 'none', ' stroke="#F3C48B"' + SW(3)) + O(46, 58, 2, '#B7763E', NS) + O(58, 50, 2, '#B7763E', NS);
    } },
    { id: 'sayur', cat: 'food', en: 'Vegetables', idn: 'Sayur', tags: 'vegetables veggies sayur brokoli wortel', draw: function () {
      return G('rotate(30 80 64)', P('M70 34 90 34 82 100Z', '#F59B3D') + P('M74 46H84M76 60H86M78 74H84', 'none', ' stroke="#D97B21"' + SW(2.4)) + P('M74 34C70 24 74 18 78 22 80 16 86 16 86 24 92 20 94 28 88 34Z', C.green)) +
        R(38, 64, 12, 30, 5, C.greenL) + P('M44 66C30 70 20 60 24 50 22 40 32 34 40 38 44 28 58 28 62 38 72 38 74 50 68 58 66 66 56 70 44 66Z', C.green) + O(36, 50, 2.6, C.greenD, NS) + O(54, 44, 2.6, C.greenD, NS) + O(50, 58, 2.6, C.greenD, NS);
    } },
    { id: 'mi', cat: 'food', en: 'Noodles', idn: 'Mi', tags: 'noodles mie mi bakmi', draw: function () {
      return P('M70 20 58 60M84 22 66 60', 'none', SW(4)) + P('M70 20 58 60M84 22 66 60', 'none', ' stroke="' + C.brownL + '"' + SW(2)) +
        P('M30 62C36 52 44 58 50 52 56 58 62 50 70 56 78 50 84 58 90 62Z', C.yellowL) + P('M38 60C40 56 46 56 48 60M56 58C58 54 64 54 66 58M74 60C76 56 82 56 84 60', 'none', ' stroke="#E0B046"' + SW(2.2)) +
        P('M24 62H96C96 82 80 94 60 94 40 94 24 82 24 62Z', C.blue) + P('M30 71C46 76 74 76 90 71', 'none', ' stroke="#fff"' + SW(3)) + P('M48 93 50 100H70L72 93', C.blue);
    } },
    { id: 'kue-ultah', cat: 'food', en: 'Birthday cake', idn: 'Kue ulang tahun', tags: 'birthday cake party kue ulang tahun pesta', draw: function () {
      return R(24, 58, 72, 40, 6, C.cream) + P('M24 64C30 72 36 72 42 64 48 72 54 72 60 64 66 72 72 72 78 64 84 72 90 72 96 64V60C96 58 94 56 92 56H28C26 56 24 58 24 60Z', C.pink) +
        P('M18 98H102', 'none', SW(3.4)) + R(40, 34, 6, 22, 2, C.blue) + R(57, 30, 6, 26, 2, C.yellow) + R(74, 34, 6, 22, 2, C.green) +
        P('M43 24C41 28 41 31 43 31 45 31 45 28 43 24Z', C.coral, SW(2)) + P('M60 20C58 24 58 27 60 27 62 27 62 24 60 20Z', C.coral, SW(2)) + P('M77 24C75 28 75 31 77 31 79 31 79 28 77 24Z', C.coral, SW(2)) +
        O(40, 84, 2.6, C.coral, NS) + O(60, 84, 2.6, C.blue, NS) + O(80, 84, 2.6, C.green, NS);
    } },
    { id: 'jus', cat: 'food', en: 'Juice', idn: 'Jus', tags: 'juice orange jus jeruk minum', draw: function () {
      return TUBE('M62 56 70 22 82 18', 3.5, C.green) + P('M36 40H80L75 94C74.5 97 72 99 68 99H48C44 99 41.5 97 41 94Z', '#fff') +
        P('M38.6 54H77.4L74.6 93C74.2 96 72 97.6 68.4 97.6H47.6C44 97.6 41.8 96 41.4 93Z', '#FDB44B', NS) + P('M36 40H80L75 94C74.5 97 72 99 68 99H48C44 99 41.5 97 41 94Z', 'none') +
        O(84, 44, 13, '#FDB44B') + O(84, 44, 8, '#FFD27F', NS) + P('M84 31V57M71 44H97', 'none', ' stroke="#fff"' + SW(1.6)) + HL('M47 62 49 86');
    } },
    { id: 'semangka', cat: 'food', en: 'Watermelon', idn: 'Semangka', tags: 'watermelon fruit semangka buah', draw: function () {
      return P('M14 46H106C106 74 86 96 60 96 34 96 14 74 14 46Z', C.green) + P('M22 46H98C98 68 82 86 60 86 38 86 22 68 22 46Z', '#F47A72', NS) +
        P('M14 46H106C106 74 86 96 60 96 34 96 14 74 14 46Z', 'none') + P('M22 46H98', 'none', SW(3)) +
        E(42, 58, 2, 3.4, K, NS) + E(58, 66, 2, 3.4, K, NS) + E(76, 58, 2, 3.4, K, NS) + E(66, 76, 2, 3.4, K, NS) + E(50, 74, 2, 3.4, K, NS);
    } },
    { id: 'bekal', cat: 'food', en: 'Lunchbox', idn: 'Bekal', tags: 'lunchbox lunch bekal kotak makan sekolah', draw: function () {
      return R(16, 50, 88, 46, 10, C.blue) + R(22, 56, 76, 34, 6, '#fff') + P('M60 56V90M60 73H98', 'none', SW(2.4)) +
        P('M26 84C26 70 34 62 42 62 50 62 56 70 56 84Z', '#fff', SW(2)) + O(36, 70, 1.4, K, NS) + O(46, 74, 1.4, K, NS) +
        O(72, 64, 5, C.yellow, SW(2)) + O(86, 64, 5, C.coral, SW(2)) + P('M66 84C70 78 76 78 80 84 84 78 90 78 94 84', 'none', ' stroke="' + C.greenD + '"' + SW(3)) +
        R(26, 36, 68, 12, 6, C.blueL) + P('M50 36V30H70V36', 'none', SW(3));
    } },
    // Routines
    { id: 'naik-bus', cat: 'routine', en: 'Ride the bus', idn: 'Naik bus', tags: 'bus school bus angkot naik', draw: function () {
      return R(14, 34, 92, 52, 10, C.yellow) + R(22, 42, 16, 16, 3, C.blueL) + R(42, 42, 16, 16, 3, C.blueL) + R(62, 42, 16, 16, 3, C.blueL) + R(84, 42, 14, 28, 3, C.blueL) +
        P('M14 70H84', 'none', ' stroke="' + C.coral + '"' + SW(4)) + O(34, 88, 10, K) + O(34, 88, 4, C.grey, NS) + O(86, 88, 10, K) + O(86, 88, 4, C.grey, NS) + R(102, 74, 6, 6, 2, '#fff', SW(2));
    } },
    { id: 'naik-sepeda', cat: 'routine', en: 'Ride a bike', idn: 'Naik sepeda', tags: 'bike bicycle sepeda gowes', draw: function () {
      return O(30, 78, 18, 'none', SW(4)) + O(90, 78, 18, 'none', SW(4)) + O(30, 78, 3, K, NS) + O(90, 78, 3, K, NS) +
        P('M30 78 50 50H80L90 78M50 50 62 78H30M62 78 80 50', 'none', ' stroke="' + C.coral + '"' + SW(4)) + P('M46 44H58', 'none', SW(5)) + P('M80 50 76 38H88', 'none', SW(3.4));
    } },
    { id: 'berdoa', cat: 'routine', en: 'Pray', idn: 'Berdoa', tags: 'pray doa berdoa ibadah', draw: function () {
      return P('M58 100V44C58 36 52 30 46 32 42 34 42 40 44 46L36 76C34 84 40 96 50 100Z', C.skin) + P('M62 100V44C62 36 68 30 74 32 78 34 78 40 76 46L84 76C86 84 80 96 70 100Z', C.skin) +
        P('M60 44V100', 'none', SW(2)) + P('M96 22 98 28 104 30 98 32 96 38 94 32 88 30 94 28Z', C.yellow, SW(2)) + P('M24 38 25.5 42 30 43.5 25.5 45 24 49 22.5 45 18 43.5 22.5 42Z', C.yellow, SW(1.8));
    } },
    // Play & rewards
    { id: 'layangan', cat: 'play', en: 'Kite', idn: 'Layangan', tags: 'kite layangan layang main luar', draw: function () {
      return P('M58 14 86 44 58 80 30 44Z', C.coral) + P('M58 14V80M30 44H86', 'none', ' stroke="#fff"' + SW(2.6)) + P('M58 14 86 44 58 80 30 44Z', 'none') +
        P('M58 80C52 90 66 96 58 106', 'none', SW(2.4)) + P('M54 90 50 86 50 94Z M62 98 66 94 66 102Z', C.yellow, SW(2)) + P('M86 44C96 60 100 80 104 104', 'none', ' stroke="#9C95A6"' + SW(1.6));
    } },
    { id: 'balon', cat: 'play', en: 'Balloons', idn: 'Balon', tags: 'balloons balon pesta party', draw: function () {
      return P('M46 72C44 86 52 96 50 108M76 66C80 82 70 94 74 108', 'none', SW(2)) + E(44, 46, 20, 25, C.coral) + P('M44 71 40 76H48Z', C.coral, SW(2)) +
        E(76, 40, 20, 25, C.blue) + P('M76 65 72 70H80Z', C.blue, SW(2)) + HL('M34 36C35 30 38 27 42 26') + HL('M66 30C67 24 70 21 74 20');
    } },
    { id: 'main-pasir', cat: 'play', en: 'Sand play', idn: 'Main pasir', tags: 'sand bucket spade pasir pantai main', draw: function () {
      return P('M12 100C24 84 44 80 60 82 78 84 96 88 108 100Z', C.sand) + P('M30 54H74L68 92H36Z', C.blue) + P('M28 54H76', 'none', SW(4)) + P('M34 54C34 40 70 40 70 54', 'none', SW(2.6)) +
        G('rotate(25 88 62)', R(85, 30, 6, 30, 3, C.yellow) + P('M80 58H96L94 74C94 78 82 78 82 74Z', C.yellow));
    } },
    { id: 'kereta-api', cat: 'play', en: 'Toy train', idn: 'Kereta api', tags: 'train toy kereta api mainan', draw: function () {
      return O(30, 36, 5, '#fff', SW(2)) + O(38, 26, 7, '#fff', SW(2)) + R(24, 44, 12, 14, 2, K) + R(16, 56, 46, 30, 6, C.coral) + R(40, 40, 22, 18, 4, C.coral) + R(45, 45, 12, 10, 2, C.blueL) +
        R(68, 56, 36, 30, 6, C.green) + R(74, 62, 10, 10, 2, C.blueL) + R(88, 62, 10, 10, 2, C.blueL) + P('M62 76H68', 'none', SW(3)) +
        O(28, 88, 7, K) + O(50, 88, 7, K) + O(78, 88, 7, K) + O(96, 88, 7, K);
    } },
    { id: 'kucing', cat: 'play', en: 'Cat', idn: 'Kucing', tags: 'cat pet kucing hewan peliharaan', draw: function () {
      return P('M90 96C104 92 106 76 96 72', 'none', SW(5)) + P('M90 96C104 92 106 76 96 72', 'none', ' stroke="#F5B25E"' + SW(2)) +
        P('M36 100C34 78 46 66 60 66 74 66 86 78 84 100Z', '#F5B25E') + P('M38 30 44 52 54 44Z M82 30 76 52 66 44Z', '#F5B25E') + O(60, 52, 22, '#F5B25E') +
        E(52, 50, 2.4, 3.2, K, NS) + E(68, 50, 2.4, 3.2, K, NS) + P('M57 57 60 60 63 57', 'none', SW(2)) + P('M36 56H46M36 62 46 60M84 56H74M84 62 74 60', 'none', SW(1.6)) +
        E(48, 58, 3.4, 2, C.cheek, NS + ' opacity=".8"') + E(72, 58, 3.4, 2, C.cheek, NS + ' opacity=".8"');
    } },
    // Places
    { id: 'pantai', cat: 'places', en: 'Beach', idn: 'Pantai', tags: 'beach sea pantai laut liburan', draw: function () {
      return O(94, 26, 9, C.yellow) + P('M10 82C24 76 34 88 48 82 62 76 72 88 86 82 96 78 104 82 110 82V104H10Z', C.blue) + P('M18 96C28 92 36 100 46 96', 'none', ' stroke="#fff"' + SW(2.6)) +
        P('M50 82 58 34', 'none', SW(3)) + P('M26 46C30 26 56 18 76 26 84 30 88 38 88 46 80 40 72 40 64 46 58 40 48 40 42 46 36 40 30 42 26 46Z', C.coral) + P('M44 30C42 36 42 42 42 46M68 26C70 32 72 40 72 44', 'none', ' stroke="#fff"' + SW(2.4));
    } },
    { id: 'kolam-renang', cat: 'places', en: 'Swimming pool', idn: 'Kolam renang', tags: 'swim pool swimming kolam renang berenang', draw: function () {
      return R(14, 50, 92, 48, 8, C.blueL) + P('M20 66C30 60 38 72 48 66 58 60 66 72 76 66 86 60 94 72 100 66M20 82C30 76 38 88 48 82 58 76 66 88 76 82 86 76 94 88 100 82', 'none', ' stroke="#fff"' + SW(3)) +
        P('M86 24V60M100 24V60', 'none', SW(3.4)) + P('M86 36H100M86 48H100', 'none', SW(3)) + P('M86 24C86 16 96 16 96 24', 'none', SW(3)) +
        O(42, 68, 13, C.coral) + O(42, 68, 6, C.blueL) + P('M32 60 36 64M52 60 48 64M32 76 36 72M52 76 48 72', 'none', ' stroke="#fff"' + SW(3));
    } },
    { id: 'perpustakaan', cat: 'places', en: 'Library', idn: 'Perpustakaan', tags: 'library books perpustakaan buku pinjam', draw: function () {
      return R(16, 22, 88, 80, 6, C.brownL) + P('M16 58H104', 'none', SW(3)) +
        R(24, 28, 10, 30, 2, C.coral) + R(36, 32, 10, 26, 2, C.blue) + R(48, 26, 10, 32, 2, C.yellow) + G('rotate(14 70 44)', R(64, 30, 10, 28, 2, C.green)) +
        R(24, 66, 12, 30, 2, C.lilac) + R(38, 62, 10, 34, 2, C.coral) + R(50, 68, 12, 28, 2, C.green) + R(64, 64, 10, 32, 2, C.blue) + R(76, 70, 12, 26, 2, C.yellow);
    } },
    { id: 'restoran', cat: 'places', en: 'Restaurant', idn: 'Restoran', tags: 'restaurant eat out makan di luar restoran rumah makan', draw: function () {
      return O(60, 64, 30, '#fff') + O(60, 64, 20, C.greyL, SW(2)) + P('M18 34V54C18 58 22 60 24 60V96M18 34V48M24 34V48M30 34V54C30 58 26 60 24 60', 'none', SW(3.4)) +
        P('M96 96V34C88 38 86 52 88 62H96', C.greyL);
    } },
    { id: 'bandara', cat: 'places', en: 'Airport', idn: 'Bandara', tags: 'airport plane pesawat terbang bandara mudik', draw: function () {
      return P('M14 70C14 62 22 58 30 58H92C100 58 106 62 106 66 106 70 100 72 92 72H30C22 72 14 74 14 70Z', '#fff') + P('M48 58 66 30H76L68 58Z', C.blue) + P('M54 72 70 94H80L70 72Z', C.blue) +
        P('M18 58 12 42H22L32 58Z', C.blue) + O(40, 64, 2.4, C.blue, NS) + O(50, 64, 2.4, C.blue, NS) + O(60, 64, 2.4, C.blue, NS) + O(70, 64, 2.4, C.blue, NS) + P('M94 62C98 62 100 64 100 66', 'none', SW(2));
    } },
    // Feelings & school
    { id: 'ya', cat: 'feel', en: 'Yes', idn: 'Ya', tags: 'yes ya iya mau', draw: function () { return O(60, 62, 36, C.green) + P('M42 63 55 76 80 48', 'none', ' stroke="#fff"' + SW(9)); } },
    { id: 'tidak', cat: 'feel', en: 'No', idn: 'Tidak', tags: 'no tidak nggak tidak mau', draw: function () { return O(60, 62, 36, C.coral) + P('M46 48 74 76M74 48 46 76', 'none', ' stroke="#fff"' + SW(9)); } },
    { id: 'berhenti', cat: 'feel', en: 'Stop', idn: 'Berhenti', tags: 'stop berhenti stop dulu jangan', draw: function () {
      return P('M45 24H75L98 47V77L75 100H45L22 77V47Z', C.coral) + P('M49 31H71L91 51V73L71 93H49L29 73V51Z', 'none', ' stroke="#fff"' + SW(2.4)) +
        R(48, 42, 7, 20, 3.5, '#fff', NS) + R(57, 38, 7, 24, 3.5, '#fff', NS) + R(66, 42, 7, 20, 3.5, '#fff', NS) + P('M46 58H75V68C75 78 69 84 61 84 53 84 46 78 46 70Z', '#fff', NS) + P('M46 64C42 58 38 60 40 64L46 72', '#fff', NS);
    } },
    { id: 'terkejut', cat: 'feel', en: 'Surprised', idn: 'Terkejut', tags: 'surprised shocked kaget terkejut', draw: function () {
      return O(60, 62, 34, C.yellowL) + O(48, 55, 5, '#fff', SW(2.2)) + O(72, 55, 5, '#fff', SW(2.2)) + O(48, 55, 2.2, K, NS) + O(72, 55, 2.2, K, NS) +
        P('M41 44 50 42M79 44 70 42', 'none', SW(2.6)) + E(60, 76, 6, 8, '#C9574A', SW(2.4));
    } },
    { id: 'bingung', cat: 'feel', en: 'Confused', idn: 'Bingung', tags: 'confused bingung tidak paham', draw: function () {
      return O(56, 64, 32, C.lilacL) + E(45, 58, 3, 4, K, NS) + E(67, 58, 3, 4, K, NS) + P('M40 48 50 46M62 44 72 48', 'none', SW(2.6)) + P('M46 78C52 74 58 80 66 74', 'none', SW(3)) +
        P('M90 22C90 14 104 14 104 22 104 28 97 28 97 34', 'none', ' stroke="' + C.lilac + '"' + SW(4.5)) + O(97, 41, 2.6, C.lilac, NS);
    } },
    { id: 'diam', cat: 'feel', en: 'Quiet please', idn: 'Diam dulu', tags: 'quiet shh hush diam tenang pelan', draw: function () {
      return O(60, 62, 34, C.blueL) + P('M42 56Q48 60 54 56', 'none', SW(3)) + P('M66 56Q72 60 78 56', 'none', SW(3)) + P('M52 76H68', 'none', SW(3)) +
        R(56, 60, 9, 34, 4.5, C.skin) + P('M86 64C92 60 96 60 100 62M88 74C94 72 98 74 102 78', 'none', ' stroke="' + C.blue + '"' + SW(3));
    } },
    { id: 'teman', cat: 'feel', en: 'Friends', idn: 'Teman', tags: 'friends friend teman main bersama', draw: function () {
      return G('translate(38 72) scale(.82)', torso(C.blue)) + G('translate(82 72) scale(.82)', torso(C.coralL)) +
        G('translate(38 60) scale(.82)', head('boy', {})) + G('translate(82 60) scale(.82)', head('girl', {})) +
        P('M60 32C56 29 54 26 54 24 54 22 56 21 57.5 21 58.5 21 59.5 22 60 23 60.5 22 61.5 21 62.5 21 64 21 66 22 66 24 66 26 64 29 60 32Z', C.pink, SW(2));
    } },
    // ---------- calm-down strategies (added for the Calm & feelings tools) ----------
    { id: 'peluk-bantal', cat: 'feel', en: 'Squeeze a pillow', idn: 'Peluk bantal erat', kid: true, tags: 'pillow squeeze hug cushion calm bantal peluk tenang', draw: function (g) {
      return G('translate(60 58)', torso(g === 'girl' ? C.pink : C.blue)) + G('translate(60 46) scale(1.02)', head(g, { eyes: 'closed', mouth: 'smile' })) +
        P('M28 78C28 68 36 65 60 65 84 65 92 68 92 78V93C92 103 84 106 60 106 36 106 28 103 28 93Z', C.lilacL) +
        P('M29 70 22 63M91 70 98 63M29 101 22 108M91 101 98 108', 'none', SW(2.8)) +
        P('M38 86H82', 'none', ' stroke="' + C.lilac + '"' + SW(2.4) + ' stroke-dasharray="3 5"') + HL('M36 76C38 72 42 71 46 71') +
        E(36, 80, 7, 6, C.skin) + E(84, 80, 7, 6, C.skin) + P('M14 80h-6M16 92h-7M106 80h6M104 92h7', 'none', SW(2.6));
    } },
    { id: 'pojok-tenang', cat: 'feel', en: 'Quiet corner', idn: 'Pojok tenang', tags: 'quiet corner calm tent rest pojok tenang istirahat', draw: function () {
      return P('M60 20 18 98H102Z', C.yellowL) + P('M60 20 18 98H40Z', C.yellow, NS) + P('M60 20 18 98H102Z', 'none') +
        P('M60 44C54 60 50 80 48 98H72C70 80 66 60 60 44Z', '#F3E4C8') + P('M53 12 60 20 67 12', 'none', SW(3)) +
        E(60, 97, 18, 6, C.lilac) + G('translate(60 82) scale(.32)', O(-14, -30, 8, C.brownL) + O(14, -30, 8, C.brownL) + O(0, -12, 20, C.brownL) + E(0, 26, 22, 20, C.brownL) + E(-6, -14, 2.5, 3, K, NS) + E(6, -14, 2.5, 3, K, NS)) +
        P('M30 66C46 72 74 72 90 66', 'none', ' stroke="' + C.brownD + '"' + SW(1.6)) +
        O(38, 70, 3, C.coral, SW(1.6)) + O(52, 72.5, 3, C.blue, SW(1.6)) + O(68, 72.5, 3, C.green, SW(1.6)) + O(82, 70, 3, C.pink, SW(1.6)) +
        P('M98 26l2 5 5 2-5 2-2 5-2-5-5-2 5-2z', C.yellow, SW(2)) + P('M20 34l1.4 3.4 3.4 1.4-3.4 1.4-1.4 3.4-1.4-3.4-3.4-1.4 3.4-1.4z', C.yellow, SW(1.8));
    } },
    { id: 'dorong-tembok', cat: 'feel', en: 'Push the wall', idn: 'Dorong tembok', kid: true, tags: 'push wall heavy work strong dorong tembok', draw: function (g) {
      var br = '';
      [[80, 14], [80, 38], [80, 62], [80, 86]].forEach(function (r, i) { br += P('M' + r[0] + ' ' + (r[1] + 24) + 'H112', 'none', ' stroke="' + C.coralD + '"' + SW(2)); br += P('M' + (i % 2 ? 96 : 104) + ' ' + r[1] + 'V' + (r[1] + 24), 'none', ' stroke="' + C.coralD + '"' + SW(2)); });
      return R(80, 6, 40, 110, 0, C.coralL) + br + P('M80 6V116', 'none', SW(3)) +
        G('translate(42 58) rotate(12)', torso(g === 'girl' ? C.pink : C.green)) +
        TUBE('M46 84 76 66', 5, C.skin) + TUBE('M50 94 76 86', 5, C.skin) + O(77, 65, 4.5, C.skin) + O(77, 86, 4.5, C.skin) +
        G('translate(40 56) rotate(10)', head(g, { mouth: 'o' })) + P('M62 46l6-4M64 54h7', 'none', SW(2.4)) +
        P('M14 34 8 30M12 44H5', 'none', SW(2.4));
    } },
    { id: 'tarik-napas', cat: 'feel', en: 'Take deep breaths', idn: 'Tarik napas', kid: true, tags: 'breathe breath deep breathing balloon calm napas tarik tenang', draw: function (g) {
      return G('translate(42 80)', torso(g === 'girl' ? C.lilac : C.blue)) + G('translate(42 66) scale(1.05)', head(g, { eyes: 'closed', mouth: 'o' })) +
        P('M58 72C66 70 70 64 68 58 66 52 72 48 78 50', 'none', ' stroke="' + C.blue + '"' + SW(3) + ' stroke-dasharray="1 6"') +
        P('M88 76C86 82 92 84 90 92 88 98 92 104 94 108', 'none', SW(2)) +
        E(88, 46, 20, 24, C.pink) + P('M85 70 88 75 91 70Z', C.pink, SW(2)) + HL('M78 36C79 31 82 28 86 27') +
        E(82, 46, 2, 2.6, K, NS) + E(94, 46, 2, 2.6, K, NS) + P('M84 53Q88 56 92 53', 'none', SW(2)) + E(78.5, 51, 2.6, 1.6, C.cheek, NS + ' opacity=".85"') + E(97.5, 51, 2.6, 1.6, C.cheek, NS + ' opacity=".85"');
    } },
    { id: 'remas-bola', cat: 'feel', en: 'Squeeze a ball', idn: 'Remas bola', tags: 'squeeze ball stress fidget remas bola', draw: function () {
      return E(60, 72, 34, 26, C.green) + HL('M36 62C38 56 42 53 47 51') +
        E(50, 74, 2.6, 3.2, K, NS) + E(70, 74, 2.6, 3.2, K, NS) + P('M55 82Q60 86 65 82', 'none', SW(2.4)) + E(44, 81, 3.6, 2.2, C.cheek, NS + ' opacity=".85"') + E(76, 81, 3.6, 2.2, C.cheek, NS + ' opacity=".85"') +
        R(38, 26, 11, 30, 5.5, C.skin) + R(50, 22, 11, 32, 5.5, C.skin) + R(62, 24, 11, 31, 5.5, C.skin) + R(74, 30, 10, 26, 5, C.skin) +
        P('M38 46C30 48 26 56 30 62', 'none', SW(3)) + P('M16 66h-7M18 78h-8M104 66h7M102 78h8', 'none', SW(2.6));
    } },
    { id: 'hitung-10', cat: 'feel', en: 'Count to 10', idn: 'Hitung sampai 10', tags: 'count ten numbers calm hitung sepuluh angka', draw: function () {
      var s = R(14, 36, 92, 46, 8, '#fff') + P('M32.4 36V82M50.8 36V82M69.2 36V82M87.6 36V82M14 59H106', 'none', ' stroke="' + C.grey + '"' + SW(2));
      var cols = [C.coral, C.yellow, C.green, C.blue, C.lilac];
      for (var i = 0; i < 10; i++) s += O(23.2 + (i % 5) * 18.4, i < 5 ? 47.5 : 70.5, 6.4, cols[i % 5], SW(2.4));
      return s + R(14, 36, 92, 46, 8, 'none') + P('M26 24l3 3M60 18v5M94 24l-3 3', 'none', SW(2.6)) + P('M52 98l4 4 9-9', 'none', ' stroke="' + C.greenD + '"' + SW(4));
    } },
    { id: 'selimut', cat: 'feel', en: 'Wrap in a blanket', idn: 'Pakai selimut', kid: true, tags: 'blanket wrap cosy cozy warm selimut hangat', draw: function (g) {
      return G('translate(60 48) scale(1.05)', head(g, { eyes: 'closed', mouth: 'smile' })) +
        P('M22 106C20 82 30 62 44 58 50 66 70 66 76 58 90 62 100 82 98 106Z', C.blueL) +
        P('M44 58C52 74 58 88 56 106', 'none', SW(2.6)) + O(36, 84, 3, '#fff', NS) + O(74, 80, 3, '#fff', NS) + O(84, 96, 3, '#fff', NS) + O(42, 98, 3, '#fff', NS) + O(66, 96, 3, '#fff', NS) +
        P('M22 106C20 82 30 62 44 58 50 66 70 66 76 58 90 62 100 82 98 106Z', 'none') + P('M96 20l1.6 4 4 1.6-4 1.6-1.6 4-1.6-4-4-1.6 4-1.6z', C.yellow, SW(1.8));
    } },
    { id: 'lompat', cat: 'feel', en: 'Jump and wiggle', idn: 'Lompat-lompat', kid: true, tags: 'jump move wiggle exercise body break lompat gerak', draw: function (g) {
      var top = g === 'girl' ? C.coralL : C.yellow;
      return TUBE('M52 86 42 104M68 86 78 104', 5, C.blue) + E(40, 106, 7, 4, C.coral) + E(80, 106, 7, 4, C.coral) +
        TUBE('M44 68 28 40M76 68 92 40', 5, C.skin) + O(27, 38, 5, C.skin) + O(93, 38, 5, C.skin) +
        G('translate(60 46)', torso(top)) +
        G('translate(60 40) scale(.98)', head(g, { mouth: 'open' })) + P('M16 70h-6M18 82h-8M104 70h6M102 82h8', 'none', SW(2.6)) + E(60, 114, 20, 3, K, NS + ' opacity=".12"');
    } }
  ];

  var BY = {};
  CARDS.forEach(function (c, i) { c.n = i; BY[c.id] = c; });

  /* ---------- tokens ---------- */
  var TOKENS = {
    star: function (on) { return P('M60 18 72 44 100 46 79 65 85 93 60 79 35 93 41 65 20 46 48 44Z', on ? C.yellow : 'none', on ? '' : ' stroke-dasharray="6 7" stroke="#CFC6B6"'); },
    car: function (on) { return on ? G('translate(0 4)', car(C.blue)) : O(60, 60, 40, 'none', ' stroke-dasharray="6 7" stroke="#CFC6B6"'); },
    flower: function (on) {
      if (!on) return O(60, 60, 40, 'none', ' stroke-dasharray="6 7" stroke="#CFC6B6"');
      var s = '';
      for (var i = 0; i < 6; i++) s += G('rotate(' + (i * 60) + ' 60 60)', E(60, 34, 13, 18, C.pink));
      return s + O(60, 60, 14, C.yellow);
    },
    ball: function (on) {
      if (!on) return O(60, 60, 40, 'none', ' stroke-dasharray="6 7" stroke="#CFC6B6"');
      return G('translate(0 -2)', BY.bola.draw());
    },
    dino: function (on) {
      if (!on) return O(60, 60, 40, 'none', ' stroke-dasharray="6 7" stroke="#CFC6B6"');
      return P('M22 84C20 70 30 58 46 58 56 58 62 50 62 40 62 30 70 24 80 24 92 24 100 32 100 42 100 50 94 54 86 54 82 54 80 58 80 64 80 78 74 90 60 92L62 100H52L50 92H44L42 100H32L32 90C26 90 22 88 22 84Z', C.green) +
        O(84, 38, 2.6, K, NS) + P('M88 46Q93 47 96 44', 'none', SW(2.2)) + P('M50 58 54 50 58 58M60 50 66 44 68 52', C.yellow, SW(2)) + E(74, 46, 3.2, 2, C.cheek, NS + ' opacity=".8"');
    }
  };

  /* ---------- public API ---------- */
  function wrap(inner, tint, n, opts) {
    opts = opts || {};
    var blob = BLOBS[(n || 0) % BLOBS.length], bg = '';
    if (!opts.noBg) {
      if (opts.ink) bg = '<path d="' + blob + '" fill="#fff"/>';
      else {
        var cid = FX.uid('lub'), gr = FX.grain(tint, 6, 0.4);
        bg = '<defs><clipPath id="' + cid + '"><path d="' + blob + '"/></clipPath>' + gr.def + '</defs>' +
          '<path d="' + blob + '" fill="' + FX.tone(tint, -0.07) + '"/><g clip-path="url(#' + cid + ')"><path d="' + blob + '" fill="' + tint + '" transform="translate(-3 -3.6)"/>' +
          '<rect width="120" height="120" fill="url(#' + gr.id + ')"/><ellipse cx="40" cy="30" rx="28" ry="13" fill="#fff" opacity=".32" transform="rotate(-28 40 30)"/></g>';
      }
    }
    var ink = opts.ink ? inner.replace(/fill="(?!none)[^"]*"/g, 'fill="#fff"') : inner;
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"' + (opts.size ? ' width="' + opts.size + '" height="' + opts.size + '"' : '') +
      ' aria-hidden="true">' + bg + '<g fill="none" stroke="' + K + '" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">' + FX.outline(ink, 6) + (opts.ink ? ink : FX.enrich(ink)) + '</g></svg>';
  }



  /* ===================== fun timer scenes =====================
     A character travels along a path to a destination; the path still ahead shows the time left.
     Themes: bunny (to its home), dino (to its nest), car (to the garage, with a traffic light).
     scene(style, frac, {arrived, info}) draws it. sceneGeo(style, frac, info) gives the parts that move,
     so the timer only nudges those and the looping animations keep running. */
  var SCENE = (function () {
    var SID = 0, X0 = 52, X1 = 292;
    var STYLES = ['bunny', 'dino', 'car'];
    function f1(n) { return Math.round(n * 10) / 10; }
    function py(x) { return 178 + 5 * Math.sin((x - 20) / 34); }
    function st(w) { return ' stroke="' + K + '" stroke-width="' + (w || 3.2) + '" stroke-linejoin="round" stroke-linecap="round"'; }
    function roadD(a, b) { var d = ''; for (var x = a; x <= b; x += 8) d += (d ? 'L' : 'M') + x + ' ' + f1(py(x)); return d; }

    function lightState(frac, info) {
      if (frac <= 0.001) return 'r';
      if (!info || !info.total) return 'g';
      if (info.total > 122000) return info.left <= 60000 ? 'r' : info.left <= 120000 ? 'y' : 'g';
      return frac <= 0.2 ? 'r' : frac <= 0.45 ? 'y' : 'g';
    }
    function geo(style, frac, info) {
      frac = Math.max(0, Math.min(1, frac));
      var x = X0 + (X1 - X0) * (1 - frac), y = py(x);
      var g = {
        mover: { style: 'transform:translate(' + f1(x) + 'px,' + f1(y) + 'px)' },
        trail: { width: f1(Math.max(0, x - 20)) },
        ahead: { x: f1(x + 22), width: f1(Math.max(0, 400 - x - 22)) }
      };
      if (style === 'car') {
        var s = lightState(frac, info);
        g.lr = { fill: s === 'r' ? '#F0694F' : '#5A5865' };
        g.ly = { fill: s === 'y' ? '#FFC94A' : '#5A5865' };
        g.lg = { fill: s === 'g' ? '#7FCB98' : '#5A5865' };
        g.glow = { cy: s === 'r' ? 52 : s === 'y' ? 71 : 90, fill: s === 'r' ? '#F0694F' : s === 'y' ? '#FFC94A' : '#7FCB98' };
      }
      return g;
    }
    function ga(g, k) { var o = g[k], s = ' data-k="' + k + '"'; for (var a in o) s += ' ' + a + '="' + o[a] + '"'; return s; }

    /* ---------- characters (feet at 0,0, facing right) ---------- */
    function bunny() {
      var s = st(3.2), W = '#FFFFFF';
      return '<ellipse class="tl-j-shadow" cx="0" cy="2" rx="22" ry="4.5" fill="' + K + '" opacity=".14"/>' +
        '<g class="tl-j-bob">' +
        '<ellipse cx="-13" cy="-5" rx="11" ry="5.5" fill="' + W + '"' + s + '/>' +
        '<circle cx="-23" cy="-23" r="7.5" fill="' + W + '"' + s + '/><path d="M-26 -25q2 -2 4 0" fill="none" stroke="#E8EBF0" stroke-width="2" stroke-linecap="round"/>' +
        '<ellipse cx="-3" cy="-21" rx="19.5" ry="16" fill="' + W + '"' + s + '/>' +
        '<path d="M-12 -9C-5 -6 5 -7 11 -12" fill="none" stroke="#E8EBF0" stroke-width="3" stroke-linecap="round"/>' +
        '<g class="tl-j-ear"><ellipse cx="6" cy="-60" rx="6" ry="15" transform="rotate(-18 6 -60)" fill="' + W + '"' + s + '/><ellipse cx="6" cy="-59" rx="2.6" ry="10" transform="rotate(-18 6 -59)" fill="#F6B3C2"/></g>' +
        '<ellipse cx="18" cy="-61" rx="6" ry="15" transform="rotate(10 18 -61)" fill="' + W + '"' + s + '/><ellipse cx="18" cy="-60" rx="2.6" ry="10" transform="rotate(10 18 -60)" fill="#F6B3C2"/>' +
        '<circle cx="15" cy="-38" r="13.5" fill="' + W + '"' + s + '/>' +
        '<circle cx="20" cy="-41" r="2.7" fill="' + K + '"/><circle cx="21" cy="-42" r=".9" fill="#fff"/>' +
        '<ellipse cx="19.5" cy="-33" rx="3.6" ry="2.4" fill="#F4A3A0" opacity=".85"/>' +
        '<circle cx="27.6" cy="-37" r="2" fill="#F0694F"/><path d="M23.5 -32.5q2.2 1.8 4.4 0" fill="none" stroke="' + K + '" stroke-width="1.8" stroke-linecap="round"/>' +
        '<ellipse cx="11" cy="-6" rx="7" ry="4.6" fill="' + W + '"' + s + '/></g>';
    }
    function dino() {
      var s = st(3.2), G1 = '#7FCB98', G2 = '#4FA772';
      var leg = function (x, cls, col) { return '<g class="tl-j-leg ' + cls + '"><path d="M' + (x - 5) + ' -16V-3C' + (x - 5) + ' -1 ' + (x - 4) + ' 0 ' + (x - 2) + ' 0H' + (x + 6) + 'C' + (x + 7) + ' 0 ' + (x + 7) + ' -2 ' + (x + 5) + ' -3V-16Z" fill="' + col + '"' + s + '/></g>'; };
      return '<ellipse cx="-2" cy="2" rx="30" ry="4.5" fill="' + K + '" opacity=".14"/>' +
        '<g class="tl-j-bob">' +
        leg(-12, 'b', G2) + leg(10, 'a', G2) +
        '<g class="tl-j-tail"><path d="M-17 -27C-28 -27 -38 -22 -46 -12C-36 -13 -27 -13 -16 -15Z" fill="' + G1 + '"' + s + '/><path d="M-38 -18l-2 -6 5 3M-30 -22l-1 -6 5 4" fill="#FFC94A"' + st(2.4) + '/></g>' +
        '<path d="M-21 -32L-15 -47L-8 -35Z" fill="#FFC94A"' + s + '/><path d="M-10 -36L-2 -52L5 -37Z" fill="#FFC94A"' + s + '/><path d="M3 -36L10 -49L15 -33Z" fill="#FFC94A"' + s + '/><path d="M13 -31L20 -41L22 -27Z" fill="#FFC94A"' + s + '/>' +
        '<path d="M-21 -14C-23 -30 -8 -38 4 -37C15 -36 22 -28 23 -19C23 -12 15 -10 1 -10C-10 -10 -20 -10 -21 -14Z" fill="' + G1 + '"' + s + '/>' +
        '<path d="M-13 -13C-4 -10 8 -10 16 -14" fill="none" stroke="#C3E8CF" stroke-width="4" stroke-linecap="round"/>' +
        '<circle cx="-7" cy="-26" r="2.8" fill="' + G2 + '"/><circle cx="3" cy="-30" r="2.1" fill="' + G2 + '"/><circle cx="10" cy="-21" r="2.4" fill="' + G2 + '"/><circle cx="-13" cy="-19" r="1.8" fill="' + G2 + '"/>' +
        '<path d="M16 -22C20 -30 26 -34 33 -33C40 -32 43 -27 42 -22C41 -17 35 -15 28 -16C23 -16 19 -17 16 -22Z" fill="' + G1 + '"' + s + '/>' +
        '<circle cx="33" cy="-27" r="2.6" fill="' + K + '"/><circle cx="34" cy="-28" r=".9" fill="#fff"/>' +
        '<ellipse cx="32" cy="-20.5" rx="3.2" ry="2.1" fill="#F4A3A0" opacity=".8"/><circle cx="40" cy="-26" r=".9" fill="' + K + '"/>' +
        '<path d="M36 -20.5q2.4 1.6 4.4 -.6" fill="none" stroke="' + K + '" stroke-width="1.8" stroke-linecap="round"/>' +
        leg(-6, 'a', G1) + leg(15, 'b', G1) + '</g>';
    }
    function car() {
      var s = st(3.2);
      var wheel = function (x) { return '<g transform="translate(' + x + ' -9)"><g class="tl-j-wheel"><circle r="9.5" fill="' + K + '"/><circle r="5" fill="#E8EBF0"/><path d="M0 -5V5M-5 0H5" stroke="#9AA1AC" stroke-width="1.8"/><circle r="1.6" fill="' + K + '"/></g></g>'; };
      return '<ellipse cx="0" cy="2" rx="36" ry="4.5" fill="' + K + '" opacity=".16"/>' +
        '<g class="tl-j-puffs"><circle class="tl-j-puff" cx="-38" cy="-12" r="4" fill="#E8EBF0"' + st(2) + '/><circle class="tl-j-puff p2" cx="-38" cy="-12" r="4" fill="#E8EBF0"' + st(2) + '/><circle class="tl-j-puff p3" cx="-38" cy="-12" r="4" fill="#E8EBF0"' + st(2) + '/></g>' +
        '<g class="tl-j-speed"><path d="M-50 -34h-12M-46 -26h-18" stroke="#fff" stroke-width="3" stroke-linecap="round"/></g>' +
        '<g class="tl-j-bob">' +
        '<path d="M-33 -13V-20C-33 -25 -29 -28 -24 -29L-14 -30L-8 -41C-6 -44 -3 -45 0 -45H12C16 -45 19 -43 21 -40L27 -30C32 -29 35 -26 35 -21V-13C35 -10 33 -9 30 -9H-30C-32 -9 -33 -10 -33 -13Z" fill="#F0694F"' + s + '/>' +
        '<path d="M-7 -30.5L-2 -39.5C-1 -41 0 -42 2 -42H6V-30.5Z" fill="#BFDCF6"' + st(2.4) + '/><path d="M9.5 -42H12C14 -42 15.6 -41 16.6 -39.4L21.5 -30.5H9.5Z" fill="#BFDCF6"' + st(2.4) + '/>' +
        '<path d="M0 -39l-2.6 4.6M13 -39.5l-2 3.6" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/>' +
        '<path d="M-29 -19H31" stroke="#F7A08C" stroke-width="3.4" stroke-linecap="round"/>' +
        '<path d="M7.8 -29V-11" stroke="' + K + '" stroke-width="2" opacity=".45"/><path d="M11.5 -24.5h4.5" stroke="' + K + '" stroke-width="2.4" stroke-linecap="round"/>' +
        '<circle cx="31" cy="-24" r="3.2" fill="#FFE29A"' + st(2) + '/><rect x="-34.5" y="-26" width="4.5" height="6" rx="1.6" fill="#FFC94A"' + st(1.6) + '/>' +
        '<rect x="28" y="-15" width="10" height="5.5" rx="2.6" fill="#C9CED6"' + st(2) + '/><rect x="-37" y="-15" width="8" height="5.5" rx="2.6" fill="#C9CED6"' + st(2) + '/>' +
        '<path d="M-23 -29.5C-21 -34 -16 -35 -13 -33" fill="none" stroke="#F7A08C" stroke-width="2.4" stroke-linecap="round"/>' +
        '</g>' + wheel(-19) + wheel(19);
    }

    /* ---------- backdrops and destinations ---------- */
    function cloud(x, y, sc, cls) {
      return '<g class="tl-j-cloud ' + (cls || '') + '"><g transform="translate(' + x + ' ' + y + ') scale(' + sc + ')"><path d="M-26 8C-34 8 -36 -2 -28 -4C-28 -14 -14 -16 -10 -9C-6 -18 10 -18 12 -7C22 -10 30 0 22 8Z" fill="#fff"' + st(3) + '/></g></g>';
    }
    function sun(x, y) {
      var rays = '';
      for (var i = 0; i < 8; i++) { var a = i * Math.PI / 4; rays += 'M' + f1(x + 23 * Math.cos(a)) + ' ' + f1(y + 23 * Math.sin(a)) + 'L' + f1(x + 30 * Math.cos(a)) + ' ' + f1(y + 30 * Math.sin(a)); }
      return '<g class="tl-j-rays"><path d="' + rays + '" stroke="#FFC94A" stroke-width="4" stroke-linecap="round"/></g>' +
        '<circle cx="' + x + '" cy="' + y + '" r="17" fill="#FFC94A"' + st(3) + '/><circle cx="' + (x - 5) + '" cy="' + (y - 2) + '" r="1.8" fill="' + K + '"/><circle cx="' + (x + 5) + '" cy="' + (y - 2) + '" r="1.8" fill="' + K + '"/><path d="M' + (x - 5) + ' ' + (y + 4) + 'q5 4 10 0" fill="none"' + st(2) + '/>';
    }
    function flower(x, y, col) {
      return '<path d="M' + x + ' ' + y + 'v10" stroke="#4FA772" stroke-width="2.4" stroke-linecap="round"/>' +
        '<g fill="' + col + '"' + st(1.8) + '><circle cx="' + (x - 3.5) + '" cy="' + y + '" r="3"/><circle cx="' + (x + 3.5) + '" cy="' + y + '" r="3"/><circle cx="' + x + '" cy="' + (y - 3.5) + '" r="3"/><circle cx="' + x + '" cy="' + (y + 3.5) + '" r="3"/></g><circle cx="' + x + '" cy="' + y + '" r="2.2" fill="#FFC94A"/>';
    }
    function tuft(x, y) { return '<path d="M' + (x - 5) + ' ' + y + 'l2 -7 3 6 3 -8 2 9" fill="none" stroke="#4FA772" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>'; }
    function tree(x, y, s) {
      return '<g transform="translate(' + x + ' ' + y + ') scale(' + (s || 1) + ')"><path d="M-4 0V-26H4V0Z" fill="#B98157"' + st(3) + '/>' +
        '<path d="M-22 -30C-28 -44 -16 -58 -4 -54C2 -66 22 -62 22 -48C32 -42 26 -26 14 -28C8 -20 -16 -20 -22 -30Z" fill="#7FCB98"' + st(3) + '/>' +
        '<circle cx="-8" cy="-40" r="2.6" fill="#F0694F"/><circle cx="8" cy="-46" r="2.6" fill="#F0694F"/><circle cx="12" cy="-34" r="2.6" fill="#F0694F"/></g>';
    }
    function palm(x, y) {
      return '<g transform="translate(' + x + ' ' + y + ')"><path d="M-3 0C-1 -20 2 -40 8 -58L14 -57C9 -40 6 -20 5 0Z" fill="#B98157"' + st(3) + '/>' +
        '<path d="M-2 -10h6M0 -24h6M3 -38h6" stroke="#7A4E35" stroke-width="2" stroke-linecap="round"/>' +
        '<g class="tl-j-palm"><path d="M11 -58C0 -70 -20 -66 -26 -52C-14 -60 -2 -58 11 -58ZM11 -58C22 -72 42 -66 46 -52C34 -60 22 -58 11 -58ZM11 -58C4 -78 18 -86 30 -80C20 -76 14 -68 11 -58ZM11 -58C2 -62 -12 -50 -12 -38C-4 -50 4 -56 11 -58Z" fill="#7FCB98"' + st(3) + '/></g></g>';
    }
    function bubble(icon) {
      return '<g class="tl-j-bubble"><path d="M308 10H380C386 10 390 14 390 20V86C390 92 386 96 380 96H357L348 108L339 96H308C302 96 298 92 298 86V20C298 14 302 10 308 10Z" fill="#fff"' + st(3.4) + '/>' + icon + '</g>';
    }
    var BACK = {
      bunny: function () {
        return '<rect x="0" y="0" width="400" height="240" fill="#DCEBFA"/>' + sun(236, 44) + cloud(80, 44, 1, '') + cloud(196, 86, 0.7, 'c2') +
          '<path d="M0 150C40 116 90 112 140 140C180 118 240 110 300 136C340 124 380 128 400 140V240H0Z" fill="#C3E8CF"' + st(3) + '/>' +
          tree(122, 160, 0.95) + tree(260, 150, 0.7) +
          '<path d="M0 162C60 152 120 158 200 154C280 150 340 156 400 160V240H0Z" fill="#9FD9B0"/>' +
          tuft(30, 214) + tuft(170, 226) + tuft(286, 222) + tuft(96, 232) + flower(64, 210, '#F6B3C2') + flower(150, 214, '#FFFFFF') + flower(232, 216, '#F6B3C2') + flower(206, 158, '#FFE29A');
      },
      dino: function () {
        return '<rect x="0" y="0" width="400" height="240" fill="#FFE9DA"/>' + sun(60, 44) +
          '<g class="tl-j-smoke"><circle cx="186" cy="62" r="7" fill="#E8EBF0"' + st(2.4) + '/><circle class="s2" cx="186" cy="62" r="7" fill="#E8EBF0"' + st(2.4) + '/><circle class="s3" cx="186" cy="62" r="7" fill="#E8EBF0"' + st(2.4) + '/></g>' +
          '<path d="M118 150L170 72C176 66 196 66 202 72L254 150Z" fill="#C9A47E"' + st(3) + '/>' +
          '<path d="M170 72C178 80 194 80 202 72C196 66 176 66 170 72Z" fill="#F0694F"' + st(2.6) + '/><path d="M176 76C178 88 172 96 176 106M194 78C192 86 198 92 194 100" fill="none" stroke="#F0694F" stroke-width="4" stroke-linecap="round"/>' +
          '<path d="M0 148C50 130 100 134 150 146C210 134 270 130 330 144C360 138 390 140 400 144V240H0Z" fill="#C3E8CF"' + st(3) + '/>' +
          palm(40, 160) + palm(262, 152) +
          '<path d="M0 162C60 154 140 160 200 156C280 152 340 158 400 160V240H0Z" fill="#A8D8A0"/>' +
          '<path d="M110 222c0 -8 14 -10 18 -2c6 0 6 6 0 6h-18z" fill="#C9CED6"' + st(2.6) + '/><path d="M250 220c0 -6 10 -8 14 -2c4 0 4 5 0 5h-14z" fill="#C9CED6"' + st(2.4) + '/>' +
          tuft(30, 216) + tuft(180, 228) + tuft(296, 224) +
          '<path d="M66 222c-6 -10 -2 -18 4 -20M70 222c0 -12 6 -18 12 -18M74 222c4 -8 12 -10 16 -6" fill="none" stroke="#4FA772" stroke-width="3" stroke-linecap="round"/>';
      },
      car: function () {
        var bld = '<g opacity=".9">' +
          '<rect x="186" y="74" width="30" height="80" rx="3" fill="#DCCFF3"' + st(2.6) + '/><rect x="218" y="96" width="26" height="58" rx="3" fill="#BFDCF6"' + st(2.6) + '/><rect x="246" y="84" width="22" height="70" rx="3" fill="#FBD5DE"' + st(2.6) + '/>';
        [[192, 82], [204, 82], [192, 98], [204, 98], [192, 114], [204, 114], [224, 104], [234, 104], [224, 120], [234, 120], [252, 92], [252, 108], [252, 124]].forEach(function (p) { bld += '<rect x="' + p[0] + '" y="' + p[1] + '" width="6" height="8" rx="1.5" fill="#fff"/>'; });
        bld += '</g>';
        return '<rect x="0" y="0" width="400" height="240" fill="#DCEBFA"/>' + sun(70, 40) + cloud(250, 40, 0.9, '') + cloud(120, 92, 0.6, 'c2') + bld +
          '<path d="M0 150C50 128 110 128 160 146C220 132 280 136 330 146C360 140 390 142 400 146V240H0Z" fill="#C3E8CF"' + st(3) + '/>' +
          tree(42, 156, 0.75) + tree(290, 152, 0.62) +
          '<path d="M0 160C60 152 140 158 200 154C280 150 340 156 400 158V240H0Z" fill="#9FD9B0"/>' +
          tuft(36, 220) + tuft(150, 230) + tuft(260, 224) + flower(90, 214, '#F6B3C2') + flower(214, 218, '#FFE29A');
      }
    };
    var ROAD = { bunny: '#F3E4C8', dino: '#F3E4C8', car: '#C9CED6' };
    function marks(style) {
      var out = '';
      if (style === 'car') return '<path d="' + roadD(-10, 340) + '" fill="none" stroke="#fff" stroke-width="3.2" stroke-dasharray="10 10" stroke-linecap="round"/>';
      for (var x = 16; x < 300; x += 20) {
        var y = py(x);
        if (style === 'bunny') out += '<ellipse cx="' + x + '" cy="' + f1(y - 4) + '" rx="3.4" ry="2.2" fill="#D9C6A5"/><ellipse cx="' + (x + 6) + '" cy="' + f1(y + 4) + '" rx="3.4" ry="2.2" fill="#D9C6A5"/>';
        else out += '<g fill="#D9C6A5"><ellipse cx="' + x + '" cy="' + f1(y + (x % 40 ? 4 : -4)) + '" rx="3.6" ry="2.8"/><circle cx="' + (x + 5) + '" cy="' + f1(y + (x % 40 ? 1 : -7)) + '" r="1.4"/><circle cx="' + (x + 5.6) + '" cy="' + f1(y + (x % 40 ? 4 : -4)) + '" r="1.4"/><circle cx="' + (x + 5) + '" cy="' + f1(y + (x % 40 ? 7 : -1)) + '" r="1.4"/></g>';
      }
      return out;
    }
    function ahead(style) {
      return style === 'car' ? '<path d="' + roadD(-10, 340) + '" fill="none" stroke="#FFC94A" stroke-width="3.6" stroke-dasharray="10 10" stroke-linecap="round"/>'
        : '<path d="' + roadD(-10, 330) + '" fill="none" stroke="#F5B92E" stroke-width="5" stroke-dasharray=".1 13" stroke-linecap="round"/>';
    }
    var DEST = {
      bunny: function () {
        var carrot = function (x, y, r) { return '<g transform="translate(' + x + ' ' + y + ') rotate(' + r + ')"><path d="M0 -6l-3 -9M0 -6v-11M0 -6l3 -9" stroke="#4FA772" stroke-width="3" stroke-linecap="round"/><path d="M-5 -6H5L1 12C.6 13.4 -.6 13.4 -1 12Z" fill="#F0694F"' + st(2.4) + '/><path d="M-3 -1h3M-2 4h3" stroke="#D9573F" stroke-width="1.6" stroke-linecap="round"/></g>'; };
        return '<path d="M298 190C300 152 322 128 350 128C378 128 400 150 402 190Z" fill="#7FCB98"' + st(3.2) + '/>' +
          '<path d="M312 152C318 140 330 134 342 134" fill="none" stroke="#C3E8CF" stroke-width="4" stroke-linecap="round"/>' +
          tuft(380, 150) + tuft(316, 168) +
          '<path d="M336 190V166C336 156 342 150 350 150C358 150 364 156 364 166V190Z" fill="#B98157"' + st(3) + '/>' +
          '<path d="M343 156V188M350 151V188M357 156V188" stroke="#7A4E35" stroke-width="1.6" opacity=".6"/><circle cx="359" cy="172" r="2.4" fill="#FFC94A"' + st(1.6) + '/>' +
          '<circle cx="384" cy="166" r="6.5" fill="#FFE29A"' + st(2.6) + '/><path d="M384 159.5v13M377.5 166h13" stroke="' + K + '" stroke-width="1.6"/>' +
          flower(326, 146, '#F6B3C2') +
          carrot(318, 204, -8) + carrot(376, 208, 6) + carrot(392, 200, 12);
      },
      dino: function () {
        return '<path d="M306 182C306 170 386 170 386 182" fill="#7A4E35"' + st(3) + '/>' +
          '<g class="tl-j-egg"><ellipse cx="346" cy="164" rx="15" ry="19" fill="#FFF8EC"' + st(3.2) + '/><circle cx="340" cy="158" r="3" fill="#7FCB98"/><circle cx="351" cy="152" r="2.2" fill="#7FCB98"/><circle cx="352" cy="168" r="3.4" fill="#7FCB98"/><circle cx="340" cy="172" r="2" fill="#7FCB98"/>' +
          '<path class="tl-j-crack" d="M332 164l5 -4 4 5 5 -5 5 5 5 -4 4 3" fill="none" stroke="' + K + '" stroke-width="2.4" stroke-linejoin="round"/></g>' +
          '<path d="M302 180C302 196 390 196 390 180C380 186 312 186 302 180Z" fill="#B98157"' + st(3) + '/>' +
          '<path d="M310 184l12 6M324 186l10 -4M340 188l12 3M356 186l12 -3M372 184l10 5" stroke="#7A4E35" stroke-width="2.2" stroke-linecap="round"/>' +
          '<path d="M300 180l-6 -6M388 180l7 -7M306 186l-8 2" stroke="#7A4E35" stroke-width="2.4" stroke-linecap="round"/>';
      },
      car: function () {
        var chk = '';
        for (var i = 0; i < 4; i++) for (var j = 0; j < 3; j++) if ((i + j) % 2 === 0) chk += '<rect x="' + (303 + i * 6) + '" y="' + (120 + j * 5.4) + '" width="6" height="5.4" fill="' + K + '"/>';
        return '<rect x="316" y="132" width="76" height="58" fill="#FFF8EC"' + st(3.2) + '/>' +
          '<path d="M308 136L354 110L400 136Z" fill="#7DB3E8"' + st(3.2) + '/><path d="M326 128L354 113" stroke="#BFDCF6" stroke-width="3" stroke-linecap="round"/>' +
          '<rect x="328" y="150" width="52" height="40" rx="3" fill="#9AA1AC"' + st(3) + '/><path d="M330 158h48M330 166h48M330 174h48M330 182h48" stroke="#6B6875" stroke-width="2"/>' +
          '<path d="M300 190V118" stroke="' + K + '" stroke-width="3.4" stroke-linecap="round"/>' +
          '<g class="tl-j-flag"><rect x="303" y="120" width="24" height="16.2" fill="#fff"/>' + chk + '<rect x="303" y="120" width="24" height="16.2" fill="none"' + st(2.4) + '/></g>' +
          '<circle cx="300" cy="117" r="3" fill="#FFC94A"' + st(2) + '/>';
      }
    };
    var ICON = {
      bunny: '<g transform="translate(344 53) rotate(18)"><path d="M0 -14l-6 -14M0 -14v-16M0 -14l6 -14" stroke="#4FA772" stroke-width="5" stroke-linecap="round"/><path d="M-10 -14H10L2 26C1 28 -1 28 -2 26Z" fill="#F0694F"' + st(3) + '/><path d="M-5 -3h5M-3 7h5M-2 16h4" stroke="#D9573F" stroke-width="2.4" stroke-linecap="round"/></g>',
      dino: '<g transform="translate(344 55)"><ellipse cx="0" cy="0" rx="20" ry="25" fill="#FFF8EC"' + st(3.4) + '/><circle cx="-7" cy="-8" r="4" fill="#7FCB98"/><circle cx="7" cy="-14" r="3" fill="#7FCB98"/><circle cx="8" cy="6" r="4.5" fill="#7FCB98"/><circle cx="-6" cy="12" r="3" fill="#7FCB98"/></g>',
      car: (function () { var c = ''; for (var i = 0; i < 4; i++) for (var j = 0; j < 3; j++) if ((i + j) % 2 === 0) c += '<rect x="' + (324 + i * 10) + '" y="' + (32 + j * 9) + '" width="10" height="9" fill="' + K + '"/>'; return '<path d="M320 82V28" stroke="' + K + '" stroke-width="4" stroke-linecap="round"/><rect x="324" y="32" width="40" height="27" fill="#fff"/>' + c + '<rect x="324" y="32" width="40" height="27" fill="none"' + st(3) + '/>'; })()
    };
    function lights(g) {
      return '<g><rect x="149" y="98" width="5" height="62" fill="#6B6875"' + st(2.4) + '/>' +
        '<rect x="138" y="40" width="27" height="63" rx="9" fill="' + K + '"/>' +
        '<circle r="12" cx="151.5"' + ga(g, 'glow') + ' opacity=".35"/>' +
        '<circle cx="151.5" cy="52" r="7.2"' + ga(g, 'lr') + '/><circle cx="151.5" cy="71" r="7.2"' + ga(g, 'ly') + '/><circle cx="151.5" cy="90" r="7.2"' + ga(g, 'lg') + '/>' +
        '<path d="M147 48a5 5 0 0 1 4 -2.5M147 67a5 5 0 0 1 4 -2.5M147 86a5 5 0 0 1 4 -2.5" stroke="#fff" stroke-width="1.8" stroke-linecap="round" opacity=".7"/></g>';
    }
    function confetti() {
      var cols = ['#F0694F', '#FFC94A', '#7DB3E8', '#7FCB98', '#F6B3C2', '#B9A3E3'], out = '<g class="tl-j-conf">';
      for (var i = 0; i < 18; i++) {
        var a = (i / 18) * Math.PI * 2 + 0.3, r = 40 + (i % 3) * 18, dx = f1(Math.cos(a) * r), dy = f1(Math.sin(a) * r * 0.8 - 20);
        var sty = ' style="--dx:' + dx + 'px;--dy:' + dy + 'px;--d:' + f1((i % 6) * 0.12) + 's"';
        out += i % 3 === 0 ? '<circle cx="0" cy="-40" r="3.2" fill="' + cols[i % 6] + '"' + sty + '/>'
          : i % 3 === 1 ? '<rect x="-4" y="-42" width="8" height="4" rx="1" fill="' + cols[i % 6] + '"' + sty + '/>'
            : '<path d="M0 -46l1.6 4 4 1.4-4 1.4-1.6 4-1.6-4-4-1.4 4-1.4z" fill="' + cols[i % 6] + '"' + sty + '/>';
      }
      return out + '</g>';
    }

    function draw(style, frac, opts) {
      opts = opts || {};
      if (STYLES.indexOf(style) < 0) style = 'bunny';
      var id = 'tlS' + (++SID), g = geo(style, opts.arrived ? 0 : frac, opts.info);
      var ch = style === 'car' ? car() : style === 'dino' ? dino() : bunny();
      // layered backdrop: a soft sky gradient with grain, far hazy hills, then the middle and near layers
      var back = BACK[style](), sky = /fill="(#[0-9A-Fa-f]{6})"/.exec(back)[1], gr = FX.grain(sky, 9, 0.3), far = FX.mix(sky, '#C3E8CF', 0.4), far2 = FX.mix(sky, '#7FCB98', 0.42);
      var farHills = '<path d="M0 132C34 112 74 106 112 120C150 102 200 98 246 114C286 100 336 100 400 118V240H0Z" fill="' + far + '"/>' +
        [[28, 116, 7], [62, 110, 9], [168, 104, 8], [318, 108, 9], [352, 112, 7]].map(function (t) { return '<path d="M' + t[0] + ' ' + (t[1] + 16) + 'V' + (t[1] + 4) + '" stroke="' + FX.mix(sky, '#B98157', 0.4) + '" stroke-width="2.4" stroke-linecap="round"/><path d="M' + (t[0] - t[2]) + ' ' + (t[1] + 3) + 'c-3-7 3-13 8-10c2-6 11-6 12 1c6 1 6 9 1 10c-1 4-6 5-9 3c-3 3-10 2-12-4z" transform="translate(' + (t[0] - t[0] * (t[2] / 9)) + ' ' + (t[1] - t[1] * (t[2] / 9)) + ') scale(' + (t[2] / 9) + ')" fill="' + far2 + '"/>'; }).join('') +
        '<path d="M0 138C60 124 120 130 180 132C250 120 320 124 400 132V240H0Z" fill="' + FX.tone(sky, -0.04) + '" opacity=".9"/>';
      back = back.replace('<rect x="0" y="0" width="400" height="240" fill="' + sky + '"/>', '<rect x="0" y="0" width="400" height="240" fill="url(#' + id + 'sky)"/><rect x="0" y="0" width="400" height="240" fill="url(#' + gr.id + ')"/>' + farHills);
      back = FX.enrich(back, { d: 3, maxW: 300 });
      return '<svg viewBox="0 0 400 240" class="tl-tsvg tl-scene ' + style + (opts.arrived ? ' arrived' : '') + '" aria-hidden="true"><defs>' +
        '<linearGradient id="' + id + 'sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + FX.tone(sky, 0.6) + '"/><stop offset=".7" stop-color="' + sky + '"/></linearGradient>' + gr.def +
        '<clipPath id="' + id + 'f"><rect x="4" y="4" width="392" height="232" rx="22"/></clipPath>' +
        '<clipPath id="' + id + 't"><rect x="0" y="0"' + ga(g, 'trail') + ' height="240"/></clipPath>' +
        '<clipPath id="' + id + 'a"><rect y="0"' + ga(g, 'ahead') + ' height="240"/></clipPath></defs>' +
        '<g clip-path="url(#' + id + 'f)">' + back +
        '<path d="' + roadD(-10, 350) + '" fill="none" stroke="' + K + '" stroke-width="' + (style === 'car' ? 36 : 30) + '" stroke-linecap="round" stroke-linejoin="round"/>' +
        '<path d="' + roadD(-10, 350) + '" fill="none" stroke="' + ROAD[style] + '" stroke-width="' + (style === 'car' ? 30 : 24) + '" stroke-linecap="round" stroke-linejoin="round"/>' +
        '<g clip-path="url(#' + id + 't)">' + marks(style) + '</g>' +
        '<g clip-path="url(#' + id + 'a)">' + ahead(style) + '</g>' +
        FX.enrich(DEST[style](), { d: 2.6 }) + (style === 'car' ? lights(g) : '') + bubble(ICON[style]) +
        '<g class="tl-j-mover"' + ga(g, 'mover') + '><g transform="scale(1.28)">' + FX.outline(ch, 5.5) + FX.enrich(ch, { d: 2 }) + '</g>' + confetti() + '</g></g>' +
        '<rect x="4" y="4" width="392" height="232" rx="22" fill="none"' + st(4) + '/></svg>';
    }
    return { draw: draw, geo: geo, styles: STYLES };
  })();

  /* ===================== tool illustrations (tools hub, home page) =====================
     Small scenes for each tool, drawn with the same helpers and shaded like the picture cards. */
  var TOOLART = (function () {
    function s(w) { return SW(w); }
    var D = {
      timer: function () {
        return E(60, 108, 30, 4.5, K, NS + ' opacity=".14"') +
          P('M33 98 27 106M87 98 93 106', 'none', s(4)) +
          G('rotate(-24 36 30)', E(36, 30, 13, 9, C.coral)) + G('rotate(24 84 30)', E(84, 30, 13, 9, C.coral)) +
          R(56, 18, 8, 10, 3, C.grey) + O(60, 64, 38, C.coral) + O(60, 64, 29, '#fff') +
          P('M60 64V35A29 29 0 0 1 86.6 75.5Z', C.yellow) +
          P('M60 41v4M60 83v4M37 64h4M79 64h4', 'none', s(2.4)) + P('M60 64 74 52', 'none', s(3.2)) + O(60, 64, 4.5, K, NS) +
          P('M16 50h-8M14 62h-9M16 74h-8', 'none', ' stroke="' + C.coralD + '"' + s(2.6));
      },
      tokens: function () {
        var star = function (x, y, on) { return P('M' + x + ' ' + (y - 13) + 'l3.9 8.3 9 1.1-6.6 6.2 1.7 8.9-8-4.5-8 4.5 1.7-8.9-6.6-6.2 9-1.1z', on ? C.yellow : 'none', on ? s(2.6) : ' stroke="#CFC6B6" stroke-dasharray="4 4"' + s(2.4)); };
        return E(60, 106, 42, 4.5, K, NS + ' opacity=".14"') +
          R(12, 34, 96, 66, 16, '#fff') + P('M12 56H108', 'none', ' stroke="' + C.greyL + '"' + s(2)) +
          star(32, 82, 1) + star(60, 82, 1) + star(88, 82, 0) +
          R(20, 41, 30, 8, 4, C.yellowL, s(2)) +
          G('rotate(8 86 26)', R(72, 16, 28, 24, 5, C.pink) + R(70, 12, 32, 9, 4, C.coral) + P('M86 12V40', 'none', s(2.6)) + P('M86 12C80 2 72 6 76 11M86 12C92 2 100 6 96 11', 'none', s(2.6)));
      },
      ft: function () {
        return E(60, 104, 46, 4.5, K, NS + ' opacity=".14"') +
          G('rotate(-6 34 62)', R(12, 30, 44, 62, 10, '#fff') + O(34, 56, 13, C.blueL) + P('M24 74h20M27 82h14', 'none', s(2.4)) + P('M28 50c3-4 9-4 12 0', 'none', ' stroke="#fff"' + s(2.4))) +
          P('M58 62h8M62 57l5 5-5 5', 'none', s(3.2)) +
          G('rotate(5 88 60)', R(66, 26, 44, 64, 10, C.yellowL) + O(88, 54, 15, C.coral) + P('M88 39C82 46 82 62 88 69M88 39C94 46 94 62 88 69M73 54H103', 'none', s(2.4)) + P('M76 78h24', 'none', s(2.4)) +
          P('M98 22l3 6 6 1-5 4 1 6-5-3-5 3 1-6-5-4 6-1z', C.yellow, s(2)));
      },
      sched: function () {
        var row = function (y, col, on, icon) { return R(24, y, 72, 20, 7, on ? C.yellowL : '#fff', on ? s(3) : s(2.4)) + O(36, y + 10, 6.5, col, s(2)) + icon + P('M48 ' + (y + 10) + 'h' + (on ? 30 : 24), 'none', ' stroke="' + (on ? K : '#CFC6B6') + '"' + s(2.6)); };
        return E(60, 112, 36, 4, K, NS + ' opacity=".14"') +
          R(14, 12, 92, 98, 14, C.lilacL) + R(42, 6, 36, 14, 6, C.lilac) + O(60, 12, 3, '#fff', s(2)) +
          row(28, C.yellow, 0, '') + row(52, C.coral, 1, '') + row(76, C.blue, 0, '') +
          P('M82 32l4 4 7-8', 'none', ' stroke="' + C.greenD + '"' + s(3));
      },
      talk: function () {
        return E(60, 108, 40, 4.5, K, NS + ' opacity=".14"') +
          P('M18 22H70C77 22 82 27 82 34V56C82 63 77 68 70 68H44L32 79V68H18C11 68 6 63 6 56V34C6 27 11 22 18 22Z', C.yellow) +
          O(28, 45, 4, K, NS) + O(44, 45, 4, K, NS) + O(60, 45, 4, K, NS) +
          P('M56 52H102C109 52 114 57 114 64V82C114 89 109 94 102 94H98V104L87 94H56C49 94 44 89 44 82V64C44 57 49 52 56 52Z', C.blueL) +
          P('M66 70q4-5 8 0q4 5 8 0q4-5 8 0', 'none', s(2.6)) +
          G('rotate(-12 26 92)', R(12, 78, 28, 28, 7, '#fff') + O(20, 86, 2.6, K, NS) + O(32, 98, 2.6, K, NS) + O(26, 92, 2.6, K, NS));
      }
    };
    function draw(kind, opts) {
      opts = opts || {};
      var inner = (D[kind] || D.timer)();
      return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"' + (opts.size ? ' width="' + opts.size + '" height="' + opts.size + '"' : '') + ' aria-hidden="true"><g fill="none" stroke="' + K + '" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">' + FX.outline(inner, 6) + FX.enrich(inner) + '</g></svg>';
    }
    // the home page hero backdrop: far, middle and near hills, a slow sun and drifting clouds
    function hero() {
      var cloud = function (x, y, sc, cls) { return '<g class="lu-drift ' + cls + '"><path d="M' + x + ' ' + y + 'c-14 0-16-14-4-16c0-12 18-14 22-5c6-10 24-8 24 4c10-2 16 10 7 17z" transform="translate(' + (x - x * sc).toFixed(1) + ' ' + (y - y * sc).toFixed(1) + ') scale(' + sc + ')" fill="#fff" stroke="' + K + '" stroke-width="' + (3 / sc).toFixed(2) + '"/></g>'; };
      var rays = ''; for (var i = 0; i < 10; i++) { var a = i * Math.PI / 5; rays += 'M' + (Math.cos(a) * 50).toFixed(1) + ' ' + (Math.sin(a) * 50).toFixed(1) + 'L' + (Math.cos(a) * 61).toFixed(1) + ' ' + (Math.sin(a) * 61).toFixed(1); }
      var flower = function (x, y, c) { return P('M' + (x + 7) + ' ' + (y - 2) + 'v12', 'none', ' stroke="#4FA772"' + s(2.6)) + G('translate(' + x + ' ' + y + ')', O(0, -8, 5, c, s(2)) + O(8, -12, 5, c, s(2)) + O(14, -5, 5, c, s(2)) + O(6, -2, 5, c, s(2)) + O(7, -7, 3.6, C.yellow, s(2))); };
      var hills = '<path d="M0 72C150 40 260 46 380 62C520 38 640 38 760 56V140H0Z" fill="#FBD9C2"/>' +
        FX.enrich('<path d="M0 90C120 56 220 60 330 82C440 52 560 50 760 78V140H0Z" fill="#F7C9A8"/>' +
          '<path d="M0 120C90 94 170 98 250 112C330 88 420 88 520 106C600 92 680 94 760 108V140H0Z" fill="#C3E8CF"/>', { d: 4, maxW: 700 }) +
        P('M48 118c-4-10 2-16 6-12M58 118c0-12 8-16 12-10M712 110c-4-10 2-16 6-12M722 110c0-12 8-16 12-10', 'none', ' stroke="#4FA772"' + s(3)) + flower(110, 112, C.pink) + flower(640, 106, '#fff');
      var sky = '<g transform="translate(222 84)"><g class="lu-spin"><path d="' + rays + '" stroke="' + C.yellow + '" stroke-width="7" stroke-linecap="round"/></g></g>' +
        '<g fill="none" stroke="' + K + '" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">' + FX.enrich(O(222, 84, 40, C.yellow), { d: 4 }) + O(210, 76, 3, K, NS) + O(234, 76, 3, K, NS) + P('M212 92q10 8 20 0', 'none', s(3)) + '</g>' +
        cloud(96, 70, 1, 'c1') + cloud(150, 160, 0.7, 'c2') +
        '<g class="lu-twinkle"><path d="M60 150l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill="#fff" stroke="' + K + '" stroke-width="2.4" stroke-linejoin="round"/></g>' +
        '<g class="lu-twinkle t2"><path d="M150 22l2.4 5.6 5.6 2.4-5.6 2.4-2.4 5.6-2.4-5.6-5.6-2.4 5.6-2.4z" fill="' + C.yellowL + '" stroke="' + K + '" stroke-width="2.2" stroke-linejoin="round"/></g>';
      return '<svg class="h2-hills" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 140" preserveAspectRatio="xMidYMax slice" aria-hidden="true"><g fill="none" stroke="' + K + '" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">' + hills + '</g></svg>' +
        '<svg class="h2-sky" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200" aria-hidden="true">' + sky + '</svg>';
    }
    return { draw: draw, hero: hero };
  })();

  window.LUArt = {
    toolArt: TOOLART.draw,
    heroScene: TOOLART.hero,
    fx: FX,
    scene: SCENE.draw,
    sceneGeo: SCENE.geo,
    sceneStyles: SCENE.styles,
    version: 2,
    CATS: CATS,
    CARDS: CARDS,
    tint: function (cat) { return TINT[cat] || '#F3EEE6'; },
    get: function (id) { return BY[id] || null; },
    // svg(id, {gender:'boy'|'girl', ink:true for the ink-saving outline version, noBg, size})
    svg: function (id, opts) {
      opts = opts || {};
      var c = BY[id];
      if (!c) return '';
      return wrap(c.draw(opts.gender === 'girl' ? 'girl' : 'boy'), TINT[c.cat], c.n, opts);
    },
    token: function (shape, on, opts) {
      opts = opts || {};
      var f = TOKENS[shape] || TOKENS.star;
      return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"' + (opts.size ? ' width="' + opts.size + '" height="' + opts.size + '"' : '') +
        ' aria-hidden="true"><g fill="none" stroke="' + K + '" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">' + (on ? FX.outline(f(on), 6.5) + FX.enrich(f(on), { d: 3 }) : f(on)) + '</g></svg>';
    },
    tokenShapes: ['star', 'car', 'flower', 'ball', 'dino'],
    // a standing child (used to pick the boy or girl character in setup)
    kid: function (g, opts) {
      opts = opts || {};
      var girl = g === 'girl', top = girl ? C.coralL : C.yellow;
      var body = E(60, 147, 26, 4, K, NS + ' opacity=".12"') +
        TUBE('M52 108V136M68 108V136', 6, C.skin) +
        P('M41 139C41 133 46 131 52 132 56 133 57 136 57 140H41Z', C.coral) + P('M79 139C79 133 74 131 68 132 64 133 63 136 63 140H79Z', C.coral) +
        TUBE('M45 72C40 82 37 90 36 98', 6, C.skin) + O(36, 100, 5.5, C.skin) +
        TUBE('M75 72C84 66 89 58 92 50', 6, C.skin) + O(93, 47, 5.5, C.skin) + P('M100 38l5-4M103 47h6M100 56l5 4', 'none', SW(2.6));
      body += girl
        ? P('M46 66C51 62 55 61 60 61 65 61 69 62 74 66L86 112C70 116 50 116 34 112Z', top) + P('M52 63Q60 70 68 63', 'none', SW(2.6)) + O(52, 96, 2.6, '#fff', NS) + O(66, 102, 2.6, '#fff', NS) + O(60, 88, 2.6, '#fff', NS)
        : P('M41 96C41 73 49 63 60 63 71 63 79 73 79 96Z', top) + P('M52 64Q60 71 68 64', 'none', SW(2.6)) +
          P('M42 92H78L80 114H64L60 104 56 114H40Z', C.blue) + P('M54 80H66', 'none', ' stroke="#fff"' + SW(3));
      body += G('translate(60 38) scale(1.15)', head(g, { mouth: 'smile' }));
      return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 156"' + (opts.size ? ' width="' + opts.size + '"' : '') + ' aria-hidden="true"><g fill="none" stroke="' + K + '" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">' + FX.outline(body, 6) + FX.enrich(body) + '</g></svg>';
    },
    // the little us heart with a face (brand signature for finish moments and print footers)
    heart: function (size, col) {
      return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 60" width="' + (size || 40) + '" height="' + Math.round((size || 40) * 60 / 64) + '" aria-hidden="true">' +
        '<path d="M31 54C24 49 6 37 6 21 6 12 12 6 20 6 26 6 30 10 32 15 34 10 38 6 44 6 52 6 58 12 58 21 58 34 46 44 38 50" fill="' + (col || 'none') + '" stroke="' + K + '" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/>' +
        '<path d="M38 50 46 57" stroke="' + K + '" stroke-width="3.6" stroke-linecap="round"/><path d="M28 22V28M36 22V28" stroke="' + K + '" stroke-width="3.4" stroke-linecap="round"/>' +
        '<path d="M24 34C28 39 36 39 40 34" fill="none" stroke="' + K + '" stroke-width="3.2" stroke-linecap="round"/></svg>';
    }
  };
})();
