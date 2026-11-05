/* Little Us · Calm & feelings tools
   Breathing Buddy, Feelings (check-in, body map and calm-down menu) and Worry jar.
   Loaded after tools.js on the /tools pages and registers its pages there. Settings are saved per child on this
   device with the other tools. Nothing from the check-in or body map is recorded; the worry jar keeps its notes
   on this device until an adult lets them float away. */
(function () {
  'use strict';
  if (!window.LUTools || !LUTools.register || window.LUCalm) return;
  var X = LUTools.api;
  var esc = X.esc;
  function isId() { return X.L() === 'id'; }

  /* ===================== illustrations for the calm & feelings tools ===================== */
  var K = '#2B2A35';
  var C = {
    yellow: '#FFC94A', yellowL: '#FFE29A', coral: '#F0694F', coralL: '#F7A08C', coralD: '#D9573F', pink: '#F6B3C2', pinkL: '#FBD5DE',
    blue: '#7DB3E8', blueL: '#BFDCF6', green: '#7FCB98', greenL: '#C3E8CF', greenD: '#4FA772', lilac: '#B9A3E3', lilacL: '#DCCFF3',
    brown: '#B98157', brownL: '#E5BE93', brownD: '#7A4E35', skin: '#F7D3B7', skinD: '#EDB894', hair: '#3A3036', grey: '#C9CED6', greyL: '#E8EBF0',
    cheek: '#F4A3A0', water: '#9CCBF2', cream: '#FFF8EC', peach: '#FFD9B8'
  };
  function f1(n) { return Math.round(n * 10) / 10; }
  function sw(w) { return ' stroke-width="' + w + '"'; }
  function P(d, fill, extra) { return '<path d="' + d + '" fill="' + (fill || 'none') + '"' + (extra || '') + '/>'; }
  function O(cx, cy, r, fill, extra) { return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + (fill || 'none') + '"' + (extra || '') + '/>'; }
  function E(cx, cy, rx, ry, fill, extra) { return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="' + (fill || 'none') + '"' + (extra || '') + '/>'; }
  function R(x, y, w, h, rx, fill, extra) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + (rx || 0) + '" fill="' + (fill || 'none') + '"' + (extra || '') + '/>'; }
  function G(tf, inner, extra) { return '<g' + (tf ? ' transform="' + tf + '"' : '') + (extra || '') + '>' + inner + '</g>'; }
  var NS = ' stroke="none"';
  function HL(d, w) { return '<path d="' + d + '" fill="none" stroke="#fff" stroke-width="' + (w || 3) + '" stroke-linecap="round" opacity=".9"/>'; }
  function TUBE(d, w, col) { return P(d, 'none', sw(w + 5.5)) + P(d, 'none', ' stroke="' + col + '"' + sw(w)); }
  // shading, rim light and the heavier outer line come from the shared art helpers (LUArt.fx)
  var FX = window.LUArt && LUArt.fx;
  function svgWrap(vb, inner, cls, bg) {
    var w = parseFloat(vb.split(' ')[2]) || 120, d = Math.min(4, 2.5 * Math.sqrt(w / 120));
    var body = FX ? (/\sdata-/.test(inner) ? '' : FX.outline(inner, 6)) + FX.enrich(inner, { d: d }) : inner;
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + vb + '"' + (cls ? ' class="' + cls + '"' : '') + ' aria-hidden="true">' + (bg || '') + '<g fill="none" stroke="' + K + '" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">' + body + '</g></svg>';
  }
  var BLOB = 'M60 8C88 6 112 24 113 56 114 88 92 112 60 112 28 112 6 92 7 60 8 30 30 10 60 8Z';
  function tileBg(tint) {
    if (!tint) return '';
    if (!FX) return P(BLOB, tint, NS);
    var cid = FX.uid('lcb'), gr = FX.grain(tint, 6, 0.4);
    return '<defs><clipPath id="' + cid + '"><path d="' + BLOB + '"/></clipPath>' + gr.def + '</defs><path d="' + BLOB + '" fill="' + FX.tone(tint, -0.07) + '"/>' +
      '<g clip-path="url(#' + cid + ')"><path d="' + BLOB + '" fill="' + tint + '" transform="translate(-3 -3.6)"/><rect width="120" height="120" fill="url(#' + gr.id + ')"/><ellipse cx="40" cy="30" rx="28" ry="13" fill="#fff" opacity=".32" transform="rotate(-28 40 30)"/></g>';
  }
  function tile(inner, tint) { return svgWrap('0 0 120 120', inner, '', tileBg(tint)); }

  /* ---------- a child's head, used for the feeling faces ---------- */
  var HAIR_BOY = 'M-18-1C-20-15-11-23 1-23 12-22 20-15 18-1 15-7 11-9 7-8 4-12-1-12-4-8-8-11-13-9-14-5-16-5-17-3-18-1Z';
  var HAIR_GIRL_BACK = 'M-21-1C-23-20-10-27 0-27 10-27 23-20 21-1L23 15C17 20 11 19 8 14H-8C-11 19-17 20-23 15Z';
  var HAIR_GIRL = 'M-18 2C-21-15-10-24 1-23 13-22 21-14 18 2 16-6 12-10 6-10 2-14-6-13-9-9-13-9-17-5-18 2Z';
  // draws head at (cx,cy) with face radius r; features are drawn by the caller in the same space
  function kidHead(g, cx, cy, r) {
    var s = r / 18, inner = '';
    if (g === 'girl') inner += P(HAIR_GIRL_BACK, C.hair);
    inner += O(-18, 3, 4.2, C.skin) + O(18, 3, 4.2, C.skin) + O(0, 0, 18, C.skin);
    inner += g === 'girl' ? P(HAIR_GIRL, C.hair) + G('rotate(24 11 -13)', R(6, -16, 11, 6, 3, C.yellow)) : P(HAIR_BOY, C.hair);
    return '<g transform="translate(' + cx + ' ' + cy + ') scale(' + f1(s) + ')" stroke-width="' + f1(3.2 / s * 1.0) + '">' + inner + '</g>';
  }
  // feeling faces: 10 feelings, each with a tint, expression and a small extra
  var FEEL = {
    happy: { tint: '#FFE29A', en: 'Happy', id: 'Senang' },
    sad: { tint: '#BFDCF6', en: 'Sad', id: 'Sedih' },
    angry: { tint: '#F7A08C', en: 'Angry', id: 'Marah' },
    scared: { tint: '#DCCFF3', en: 'Scared', id: 'Takut' },
    worried: { tint: '#FFD9B8', en: 'Worried', id: 'Khawatir' },
    tired: { tint: '#E8EBF0', en: 'Tired', id: 'Capek' },
    calm: { tint: '#C3E8CF', en: 'Calm', id: 'Tenang' },
    excited: { tint: '#FBD5DE', en: 'Excited', id: 'Bersemangat' },
    frustrated: { tint: '#FFC9A8', en: 'Frustrated', id: 'Kesal' },
    surprised: { tint: '#DCEBFA', en: 'Surprised', id: 'Terkejut' }
  };
  var FEEL_ORDER = ['happy', 'sad', 'angry', 'scared', 'worried', 'tired', 'calm', 'excited', 'frustrated', 'surprised'];
  function feelFace(kind, g, opts) {
    opts = opts || {};
    var f = FEEL[kind] || FEEL.happy, cx = 60, cy = 66, s = '';
    var eyeL = 47, eyeR = 73, ey = 66;
    var dot = function (x, y, rx, ry) { return E(x, y, rx || 3.4, ry || 4.4, K, NS) + O(x + 1.1, y - 1.5, 1.1, '#fff', NS); };
    var cheeks = E(38, 77, 5.6, 3.4, C.cheek, NS + ' opacity=".85"') + E(82, 77, 5.6, 3.4, C.cheek, NS + ' opacity=".85"');
    s += kidHead(g, cx, cy, 34);
    switch (kind) {
      case 'happy':
        s += P('M42 64Q47 58 52 64M68 64Q73 58 78 64', 'none', sw(3.2)) + cheeks + P('M48 76Q60 92 72 76Z', '#C9574A', sw(3)) + P('M53 84Q60 81 67 84', 'none', ' stroke="' + C.coralL + '"' + sw(3));
        s += P('M98 24l2 5 5 2-5 2-2 5-2-5-5-2 5-2zM18 34l1.4 3.4 3.4 1.4-3.4 1.4-1.4 3.4-1.4-3.4-3.4-1.4 3.4-1.4z', C.yellow, sw(2));
        break;
      case 'sad':
        s += P('M42 57 51 54M78 57 69 54', 'none', sw(2.8)) + dot(eyeL, ey + 1) + dot(eyeR, ey + 1) + P('M51 86Q60 78 69 86', 'none', sw(3.2)) +
          P('M77 72C74 78 74 82 77.5 82 81 82 81 78 77 72Z', C.water, sw(2.2)) + E(38, 78, 5, 3, C.cheek, NS + ' opacity=".5"');
        break;
      case 'angry':
        s += P('M41 55 53 61M79 55 67 61', 'none', sw(3.4)) + dot(eyeL, ey + 2, 3, 3.4) + dot(eyeR, ey + 2, 3, 3.4) + P('M50 85Q60 77 70 85', 'none', sw(3.2)) +
          E(37, 77, 6, 3.6, C.coral, NS + ' opacity=".55"') + E(83, 77, 6, 3.6, C.coral, NS + ' opacity=".55"') +
          P('M92 22l4 6M100 26l-6 3M96 34l5 1M86 26l2-6', 'none', ' stroke="' + C.coral + '"' + sw(3.2)) +
          P('M16 40c-4-6 2-10 6-6 2-6 10-4 8 2', 'none', ' stroke="' + C.grey + '"' + sw(3));
        break;
      case 'scared':
        s += P('M41 55Q46 50 52 54M68 54Q74 50 79 55', 'none', sw(2.8)) + O(eyeL, ey, 6.2, '#fff', sw(2.4)) + O(eyeR, ey, 6.2, '#fff', sw(2.4)) + O(eyeL, ey + 1, 2.4, K, NS) + O(eyeR, ey + 1, 2.4, K, NS) +
          P('M48 85 52 81 56 85 60 81 64 85 68 81 72 85', 'none', sw(2.8)) +
          P('M90 46C87 52 87 56 90.5 56 94 56 94 52 90 46Z', C.water, sw(2.2)) + P('M14 60h6M12 70h7M106 60h-6M108 70h-7', 'none', sw(2.6));
        break;
      case 'worried':
        s += P('M42 56 51 59M78 56 69 59', 'none', sw(2.8)) + dot(eyeL, ey + 1) + dot(eyeR, ey + 1) + P('M51 84Q55 80 60 84 65 88 69 84', 'none', sw(3)) +
          E(38, 77, 5, 3, C.cheek, NS + ' opacity=".6"') + E(82, 77, 5, 3, C.cheek, NS + ' opacity=".6"') +
          P('M24 44C21 50 21 54 24.5 54 28 54 28 50 24 44Z', C.water, sw(2.2)) +
          P('M92 30c0-7 10-7 10 0 0 5-5 5-5 10M97 46v.5', 'none', ' stroke="' + C.coral + '"' + sw(3.2));
        break;
      case 'tired':
        s += P('M42 64Q47 68 52 64M68 64Q73 68 78 64', 'none', sw(3)) + P('M43 60H52M68 60H77', 'none', ' stroke="' + C.skinD + '"' + sw(2.6)) +
          E(60, 84, 4.6, 5.4, '#C9574A', sw(2.6)) + cheeks +
          P('M88 26H98L88 38H98', 'none', ' stroke="' + C.blue + '"' + sw(3)) + P('M102 12H108L102 20H108', 'none', ' stroke="' + C.blue + '"' + sw(2.6));
        break;
      case 'calm':
        s += P('M42 65Q47 69 52 65M68 65Q73 69 78 65', 'none', sw(3)) + cheeks + P('M52 79Q60 85 68 79', 'none', sw(3.2)) +
          P('M18 48c6-2 6 6 12 4M90 40c6-2 6 6 12 4', 'none', ' stroke="' + C.greenD + '"' + sw(2.8));
        break;
      case 'excited':
        var star = function (x, y, r) { var p = ''; for (var i = 0; i < 10; i++) { var a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; p += (i ? 'L' : 'M') + f1(x + rr * Math.cos(a)) + ' ' + f1(y + rr * Math.sin(a)); } return P(p + 'Z', C.yellow, sw(2)); };
        s += star(eyeL, ey - 1, 7.5) + star(eyeR, ey - 1, 7.5) + cheeks + P('M46 76Q60 96 74 76Z', '#C9574A', sw(3)) + P('M52 85Q60 81 68 85', 'none', ' stroke="' + C.coralL + '"' + sw(3)) +
          P('M14 30l4 4M10 46h6M106 30l-4 4M110 46h-6', 'none', sw(2.8));
        break;
      case 'frustrated':
        s += P('M40 56 52 60M80 56 68 60', 'none', sw(3.2)) + P('M43 64l7 3-7 3M77 64l-7 3 7 3', 'none', sw(2.8)) +
          R(49, 79, 22, 9, 3, '#fff', sw(2.6)) + P('M54.5 79V88M60 79V88M65.5 79V88', 'none', sw(1.8)) +
          P('M86 20c4-4 8 2 4 4s0 8 4 4 8 2 4 4', 'none', ' stroke="' + C.coral + '"' + sw(2.8)) + P('M14 26c4-4 8 2 4 4s0 8 4 4', 'none', ' stroke="' + C.coral + '"' + sw(2.6));
        break;
      case 'surprised':
        s += P('M40 52Q46 46 52 51M68 51Q74 46 80 52', 'none', sw(2.8)) + O(eyeL, ey, 5, '#fff', sw(2.4)) + O(eyeR, ey, 5, '#fff', sw(2.4)) + O(eyeL, ey, 2.4, K, NS) + O(eyeR, ey, 2.4, K, NS) +
          E(60, 84, 5.4, 6.6, '#C9574A', sw(2.8)) + cheeks + P('M98 18v14M98 40v.5', 'none', ' stroke="' + C.coral + '"' + sw(4.2));
        break;
    }
    return svgWrap('0 0 120 120', (opts.noBg ? '' : O(60, 64, 52, f.tint, NS)) + s);
  }

  /* ---------- body sensations ---------- */
  var SENS = {
    tight: { en: 'Tight', id: 'Tegang', tint: '#E9E1F7' },
    hot: { en: 'Hot', id: 'Panas', tint: '#FFE9DA' },
    shaky: { en: 'Shaky', id: 'Gemetar', tint: '#DDF2E4' },
    butterflies: { en: 'Butterflies', id: 'Perut geli', tint: '#FBE0E6' },
    heavy: { en: 'Heavy', id: 'Berat', tint: '#E8EBF0' },
    heart: { en: 'Fast heartbeat', id: 'Jantung berdebar', tint: '#FBE0E6' },
    cold: { en: 'Cold', id: 'Dingin', tint: '#DCEBFA' },
    fizzy: { en: 'Fizzy', id: 'Kesemutan', tint: '#FFF1C7' }
  };
  var SENS_ORDER = ['tight', 'hot', 'shaky', 'butterflies', 'heavy', 'heart', 'cold', 'fizzy'];
  function eyesSmall(x1, x2, y, closed) {
    return closed ? P('M' + (x1 - 3) + ' ' + y + 'q3 3 6 0M' + (x2 - 3) + ' ' + y + 'q3 3 6 0', 'none', sw(2.2)) : E(x1, y, 2.2, 2.8, K, NS) + E(x2, y, 2.2, 2.8, K, NS);
  }
  function sensArt(kind) {
    var s = '';
    switch (kind) {
      case 'tight':
        s = P('M18 62C30 50 40 74 52 62', 'none', sw(9)) + P('M18 62C30 50 40 74 52 62', 'none', ' stroke="' + C.lilac + '"' + sw(4)) +
          P('M68 62C80 50 90 74 102 62', 'none', sw(9)) + P('M68 62C80 50 90 74 102 62', 'none', ' stroke="' + C.lilac + '"' + sw(4)) +
          O(60, 62, 14, C.lilac) + P('M50 56C56 64 64 60 70 68M50 68C56 60 64 64 70 56', 'none', sw(2.4)) +
          P('M40 34l6 8M80 34l-6 8M60 28v9M40 90l6-8M80 90l-6-8', 'none', sw(2.6));
        break;
      case 'hot':
        s = R(50, 18, 20, 66, 10, '#fff') + O(60, 88, 16, C.coral) + R(56, 40, 8, 40, 4, C.coral, NS) + P('M70 34h6M70 46h6M70 58h6', 'none', sw(2.4)) +
          HL('M54 82c0-4 2-7 5-8') + P('M24 40c-6 6 6 10 0 16s6 10 0 16M96 40c-6 6 6 10 0 16s6 10 0 16', 'none', ' stroke="' + C.coralL + '"' + sw(3.4));
        break;
      case 'shaky':
        s = P('M30 90C28 62 40 40 60 40 80 40 92 62 90 90Z', C.green) + P('M30 90H90', 'none') + HL('M40 64c2-8 6-12 12-14') +
          eyesSmall(51, 69, 64) + P('M53 76 56 73 60 76 64 73 67 76', 'none', sw(2.4)) +
          P('M18 52c-4 4 4 8 0 12s4 8 0 12M102 52c4 4-4 8 0 12s-4 8 0 12', 'none', sw(2.8)) + E(60, 96, 34, 4, K, NS + ' opacity=".12"');
        break;
      case 'butterflies':
        var bf = function (x, y, sc, col, r) {
          return G('translate(' + x + ' ' + y + ') rotate(' + r + ') scale(' + sc + ')', P('M0 0C-6-18-26-20-26-6-26 6-12 8 0 0ZM0 0C6-18 26-20 26-6 26 6 12 8 0 0Z', col) + P('M0 0C-4 10-18 16-20 8-21 2-10 0 0 0ZM0 0C4 10 18 16 20 8 21 2 10 0 0 0Z', C.yellowL) + R(-2.5, -10, 5, 20, 2.5, K, NS) + P('M-1-10-6-18M1-10 6-18', 'none', sw(2)));
        };
        s = bf(44, 58, 1.1, C.pink, -12) + bf(82, 80, 0.8, C.lilac, 14) + P('M30 92c8-6 14 2 22-4M74 40c6-4 12 2 18-2', 'none', ' stroke="' + C.grey + '"' + sw(2.6) + ' stroke-dasharray="2 6"');
        break;
      case 'heavy':
        s = P('M44 46C44 30 76 30 76 46', 'none', sw(10)) + P('M44 46C44 30 76 30 76 46', 'none', ' stroke="' + C.grey + '"' + sw(4.5)) +
          P('M32 96C28 66 40 46 60 46 80 46 92 66 88 96Z', '#8A8693') + HL('M40 72c2-8 6-14 12-17') +
          P('M50 70q3 3 6 0M64 70q3 3 6 0', 'none', ' stroke="#fff"' + sw(2.4)) + P('M54 82Q60 79 66 82', 'none', ' stroke="#fff"' + sw(2.4)) +
          P('M24 104H96', 'none', sw(3.2)) + P('M18 82l-6-2M16 92l-7 1M102 82l6-2M104 92l7 1', 'none', sw(2.4));
        break;
      case 'heart':
        s = P('M60 96C46 86 28 74 28 54 28 42 36 34 46 34 52 34 57 38 60 44 63 38 68 34 74 34 84 34 92 42 92 54 92 74 74 86 60 96Z', C.coral) +
          HL('M36 52c0-6 3-10 8-11') + eyesSmall(50, 70, 58) + E(60, 70, 4, 5, '#C9574A', sw(2.4)) +
          P('M8 64h14l5-10 6 20 5-10h4M84 64h6l5-10 6 20 5-10h6', 'none', ' stroke="' + C.coralD + '"' + sw(2.6)) +
          P('M24 30l5 5M96 30l-5 5', 'none', sw(2.6));
        break;
      case 'cold':
        var arm = function (r) { return G('rotate(' + r + ' 60 60)', P('M60 22V98M60 34l-8-8M60 34l8-8M60 86l-8 8M60 86l8 8', 'none', ' stroke="' + C.blue + '"' + sw(5))); };
        s = arm(0) + arm(60) + arm(120) + O(60, 60, 12, '#fff') + eyesSmall(56, 64, 59) + P('M57 65Q60 63 63 65', 'none', sw(2));
        break;
      case 'fizzy':
        var spark = function (x, y, r, col) { return P('M' + x + ' ' + (y - r) + 'L' + (x + r * 0.3) + ' ' + (y - r * 0.3) + 'L' + (x + r) + ' ' + y + 'L' + (x + r * 0.3) + ' ' + (y + r * 0.3) + 'L' + x + ' ' + (y + r) + 'L' + (x - r * 0.3) + ' ' + (y + r * 0.3) + 'L' + (x - r) + ' ' + y + 'L' + (x - r * 0.3) + ' ' + (y - r * 0.3) + 'Z', col, sw(2.2)); };
        s = spark(44, 46, 16, C.yellow) + spark(78, 72, 12, C.pink) + spark(36, 86, 9, C.blue) + spark(84, 34, 7, C.green) +
          O(64, 50, 3, C.lilac, sw(2)) + O(56, 96, 3.4, C.yellowL, sw(2)) + O(96, 92, 2.6, C.coralL, sw(2)) + O(24, 64, 2.6, C.greenL, sw(2));
        break;
    }
    return tile(s, (SENS[kind] || {}).tint);
  }

  /* ---------- the body map child ---------- */
  var ZONES = {
    head: { en: 'Head', id: 'Kepala', pts: [[120, 70, 50]] },
    throat: { en: 'Throat', id: 'Leher', pts: [[120, 130, 18]] },
    chest: { en: 'Chest', id: 'Dada', pts: [[120, 166, 30]] },
    tummy: { en: 'Tummy', id: 'Perut', pts: [[120, 218, 30]] },
    arms: { en: 'Arms', id: 'Lengan', pts: [[70, 190, 18], [170, 190, 18]] },
    hands: { en: 'Hands', id: 'Tangan', pts: [[54, 246, 18], [186, 246, 18]] },
    legs: { en: 'Legs', id: 'Kaki', pts: [[102, 312, 22], [138, 312, 22]] },
    feet: { en: 'Feet', id: 'Telapak kaki', pts: [[94, 378, 20], [146, 378, 20]] }
  };
  var ZONE_ORDER = ['head', 'throat', 'chest', 'tummy', 'arms', 'hands', 'legs', 'feet'];
  function bodySVG(g, opts) {
    opts = opts || {};
    var id = 'lcb' + Math.random().toString(36).slice(2, 7), glow = opts.glow || C.coral, on = opts.on || [];
    var shirt = g === 'girl' ? C.lilac : C.yellow, shirtL = g === 'girl' ? C.lilacL : C.yellowL;
    var s = '<defs><radialGradient id="' + id + '"><stop offset="0" stop-color="' + glow + '" stop-opacity=".9"/><stop offset=".55" stop-color="' + glow + '" stop-opacity=".45"/><stop offset="1" stop-color="' + glow + '" stop-opacity="0"/></radialGradient></defs>';
    s += E(120, 392, 66, 7, K, NS + ' opacity=".1"');
    // legs + shoes
    s += TUBE('M104 262 100 362', 22, C.skin) + TUBE('M136 262 140 362', 22, C.skin);
    s += P('M78 380C78 366 90 362 102 364 110 365 114 372 112 380Z', C.coral) + P('M162 380C162 366 150 362 138 364 130 365 126 372 128 380Z', C.coral) +
      P('M84 372h10M146 372h10', 'none', ' stroke="#fff"' + sw(2.4));
    s += g === 'girl' ? P('M84 240H156L172 290C150 298 90 298 68 290Z', C.pink) + P('M100 248 94 290M120 248V294M140 248 146 290', 'none', ' stroke="' + C.pinkL + '"' + sw(3))
      : P('M84 244H156L160 286H126L120 270 114 286H80Z', C.blue) + P('M120 250V268', 'none', ' stroke="' + C.blueL + '"' + sw(2.4));
    // arms
    s += TUBE('M88 148C70 168 62 196 58 232', 18, C.skin) + TUBE('M152 148C170 168 178 196 182 232', 18, C.skin);
    s += O(56, 244, 13, C.skin) + O(184, 244, 13, C.skin) + P('M50 240q6 4 12 0M178 240q6 4 12 0', 'none', ' stroke="' + C.skinD + '"' + sw(2.2));
    // shirt
    s += P('M88 134C98 128 142 128 152 134L166 154 176 178 158 186 156 252H84L82 186 64 178 74 154Z', shirt);
    s += P('M104 132C108 142 132 142 136 132', 'none', ' stroke="' + shirtL + '"' + sw(4)) + HL('M92 158c4-6 8-10 14-12', 3.4);
    // neck + head
    s += R(108, 112, 24, 26, 10, C.skin) + P('M108 132q12 6 24 0', 'none', ' stroke="' + C.skinD + '"' + sw(2.4));
    s += kidHead(g, 120, 72, 46);
    s += E(102, 78, 4.2, 5.4, K, NS) + E(138, 78, 4.2, 5.4, K, NS) + O(103.4, 76, 1.4, '#fff', NS) + O(139.4, 76, 1.4, '#fff', NS) +
      E(90, 92, 7, 4.2, C.cheek, NS + ' opacity=".85"') + E(150, 92, 7, 4.2, C.cheek, NS + ' opacity=".85"') + P('M110 94Q120 104 130 94', 'none', sw(3.2));
    // glows + hit areas
    ZONE_ORDER.forEach(function (z) {
      var isOn = on.indexOf(z) >= 0;
      if (!opts.hit && !isOn) return;
      ZONES[z].pts.forEach(function (p) {
        s += '<circle class="lc-glow' + (isOn ? ' on' : '') + '" data-z="' + z + '" cx="' + p[0] + '" cy="' + p[1] + '" r="' + (p[2] * 1.55) + '" fill="url(#' + id + ')" stroke="none"/>';
      });
    });
    if (opts.hit) ZONE_ORDER.forEach(function (z) {
      ZONES[z].pts.forEach(function (p) { s += '<circle class="lc-hit" data-zone="' + z + '" cx="' + p[0] + '" cy="' + p[1] + '" r="' + (p[2] + 8) + '" fill="#fff" fill-opacity="0" stroke="none"/>'; });
    });
    return svgWrap('0 0 240 400', s, 'lc-body');
  }

  /* ---------- breathing buddies ---------- */
  function starPts(cx, cy, R1, R2) { var pts = []; for (var i = 0; i < 10; i++) { var a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? R2 : R1; pts.push([f1(cx + r * Math.cos(a)), f1(cy + r * Math.sin(a))]); } return pts; }
  var BUD = {
    balloon: function () {
      return O(150, 150, 118, '#DCEBFA', NS + ' class="lc-halo"') +
        '<g class="lc-string">' + P('M150 206C142 222 158 236 148 252 142 262 150 272 146 286', 'none', sw(3)) + '</g>' +
        '<g data-b="grow">' + P('M150 34C192 34 216 66 216 106 216 150 182 190 150 196 118 190 84 150 84 106 84 66 108 34 150 34Z', C.pink) +
        P('M142 196 150 208 158 196Z', C.pink, sw(3)) + HL('M108 84C110 68 120 56 134 52', 5) + O(112, 106, 4, '#fff', NS) +
        '<g class="lc-open">' + E(130, 110, 4.6, 6, K, NS) + E(170, 110, 4.6, 6, K, NS) + O(131.6, 107.6, 1.6, '#fff', NS) + O(171.6, 107.6, 1.6, '#fff', NS) + E(150, 132, 6.5, 7.5, '#C9574A', sw(3)) + '</g>' +
        '<g class="lc-shut">' + P('M124 112q6 5 12 0M164 112q6 5 12 0', 'none', sw(3.2)) + P('M138 128q12 12 24 0', 'none', sw(3.2)) + '</g>' +
        E(120, 126, 8, 5, C.cheek, NS + ' opacity=".85"') + E(180, 126, 8, 5, C.cheek, NS + ' opacity=".85"') + '</g>';
    },
    star: function () {
      var p = starPts(150, 156, 120, 52), d = 'M' + p.map(function (q) { return q.join(' '); }).join('L') + 'Z';
      return P(d, '#FFF1C7', ' stroke="none"') + P(d, 'none', ' stroke="' + K + '"' + sw(4.5)) + P(d, 'none', ' stroke="#fff"' + sw(2) + ' stroke-dasharray="4 7"') +
        '<path data-b="trail" d="M0 0" fill="none" stroke="' + C.yellow + '" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" opacity=".9"/>' +
        G('translate(150 162)', E(-14, 0, 3.4, 4.4, K, NS) + E(14, 0, 3.4, 4.4, K, NS) + P('M-8 10q8 8 16 0', 'none', sw(3)) + E(-24, 9, 6, 3.6, C.cheek, NS + ' opacity=".85"') + E(24, 9, 6, 3.6, C.cheek, NS + ' opacity=".85"')) +
        '<g data-b="dot">' + O(0, 0, 22, C.coral, NS + ' opacity=".22"') + O(0, 0, 13, C.coral, sw(3.4)) + O(-4, -4, 3.4, '#fff', NS + ' opacity=".9"') + '</g>';
    },
    flower: function () {
      var pet = '';
      for (var i = 0; i < 8; i++) pet += G('rotate(' + (i * 45) + ')', E(0, -30, 15, 21, i % 2 ? C.pink : C.pinkL, sw(3)));
      return O(84, 150, 74, '#FBE0E6', NS + ' data-b="fhalo"') + O(222, 150, 66, '#FFF1C7', NS + ' data-b="chalo"') +
        '<g data-b="flower">' + P('M84 266V170', 'none', ' stroke="' + C.greenD + '"' + sw(6)) + P('M84 230C64 230 54 214 56 202 72 200 84 212 84 230Z', C.green, sw(3)) + P('M84 214C102 212 114 198 112 186 96 186 84 198 84 214Z', C.green, sw(3)) +
        G('translate(84 132)', pet + O(0, 0, 22, C.yellow, sw(3.2)) + E(-7, -2, 2.6, 3.4, K, NS) + E(7, -2, 2.6, 3.4, K, NS) + P('M-6 7q6 6 12 0', 'none', sw(2.6)) + E(-13, 6, 4, 2.4, C.cheek, NS) + E(13, 6, 4, 2.4, C.cheek, NS)) +
        '<g class="lc-scent">' + P('M110 100c8-6 0-14 8-20s0-14 8-20', 'none', ' stroke="' + C.pink + '"' + sw(3.4)) + P('M126 116c8-6 0-14 8-20', 'none', ' stroke="' + C.lilac + '"' + sw(3.4)) + '</g></g>' +
        '<g data-b="candle">' + E(222, 268, 40, 7, K, NS + ' opacity=".1"') + P('M196 262C196 252 248 252 248 262 248 270 196 270 196 262Z', C.yellowL, sw(3)) +
        R(200, 162, 44, 100, 12, C.coralL, sw(3.4)) + P('M200 182C210 190 232 190 244 182', 'none', ' stroke="#fff"' + sw(3)) + HL('M210 200V244', 4) +
        E(214, 214, 2.6, 3.4, K, NS) + E(230, 214, 2.6, 3.4, K, NS) + P('M216 224q6 5 12 0', 'none', sw(2.6)) + E(208, 222, 4, 2.4, C.cheek, NS) + E(236, 222, 4, 2.4, C.cheek, NS) +
        P('M222 162V148', 'none', sw(3.4)) +
        '<g data-b="flame">' + P('M222 92C210 110 206 122 208 132 210 144 234 144 236 132 238 122 234 110 222 92Z', C.yellow, sw(3.2)) + P('M222 112C216 122 216 130 218 134 220 138 226 138 227 134 229 130 228 122 222 112Z', C.coral, NS) + '</g>' +
        '<g data-b="smoke" opacity="0">' + P('M222 140c-8-10 8-16 0-26s8-16 0-26', 'none', ' stroke="' + C.grey + '"' + sw(4)) + '</g></g>';
    },
    box: function () {
      return R(50, 50, 200, 200, 30, '#EEE8FA', NS) + '<rect data-b="fill" x="50" y="250" width="200" height="0" rx="30" fill="' + C.lilacL + '" stroke="none"/>' +
        R(50, 50, 200, 200, 30, 'none', sw(4.5)) +
        '<path data-b="side" d="M0 0" fill="none" stroke="' + C.yellow + '" stroke-width="10" stroke-linecap="round"/>' +
        '<g data-b="dot">' + O(0, 0, 22, C.lilac, NS + ' opacity=".3"') + O(0, 0, 13, C.lilac, sw(3.4)) + O(-4, -4, 3.4, '#fff', NS) + '</g>';
    },
    belly: function () {
      var leg = function (x, r) { return G('rotate(' + r + ' ' + x + ' 186)', R(x - 11, 146, 22, 44, 11, C.green, sw(3.2)) + E(x, 152, 7.5, 4.5, C.greenL, NS) + O(x - 5, 146.5, 1.8, C.greenD, NS) + O(x, 145.5, 1.8, C.greenD, NS) + O(x + 5, 146.5, 1.8, C.greenD, NS)); };
      return R(24, 204, 252, 40, 20, '#E9E1F7', NS) + P('M44 214H256', 'none', ' stroke="#fff"' + sw(3) + ' stroke-dasharray="2 10"') +
        P('M232 196C252 192 270 182 282 170 274 192 258 206 236 210Z', C.green, sw(3.2)) +
        leg(108, -22) + leg(204, 22) +
        P('M70 206C66 170 100 150 150 150 200 150 236 170 232 206Z', C.green, sw(3.4)) +
        '<g data-b="belly">' + E(150, 180, 64, 30, C.greenL, sw(3.2)) + P('M106 176C126 168 174 168 194 176', 'none', ' stroke="#fff"' + sw(3) + ' opacity=".8"') +
        G('translate(150 136)', P('M0-26 7.6-9 26-8 12 4 16 22 0 13-16 22-12 4-26-8-7.6-9Z', C.yellow, sw(3)) + E(-5, -2, 2, 2.6, K, NS) + E(5, -2, 2, 2.6, K, NS) + P('M-4 4q4 3 8 0', 'none', sw(2)), ' data-b="toy"') + '</g>' +
        leg(126, -10) + leg(184, 10) +
        O(66, 196, 32, C.green, sw(3.4)) + P('M48 192q6 5 12 0M70 192q6 5 12 0', 'none', sw(3)) + P('M58 206q6 5 12 0', 'none', sw(2.8)) +
        E(46, 202, 5, 3, C.cheek, NS + ' opacity=".85"') + E(84, 202, 5, 3, C.cheek, NS + ' opacity=".85"') + P('M38 176l-4-4M52 166l-2-6M66 164v-6', 'none', ' stroke="' + C.greenD + '"' + sw(3));
    }
  };
  function buddySVG(style) {
    var vb = style === 'flower' ? '0 0 300 290' : style === 'belly' ? '0 0 300 260' : '0 0 300 300';
    return svgWrap(vb, (BUD[style] || BUD.balloon)(), 'lc-bud ' + style);
  }
  // small icons for the style picker
  function buddyIcon(style) {
    var s = '';
    if (style === 'balloon') s = P('M60 18C80 18 92 34 92 52 92 74 74 88 60 90 46 88 28 74 28 52 28 34 40 18 60 18Z', C.pink) + P('M56 90 60 96 64 90Z', C.pink, sw(2.4)) + P('M60 96C56 104 64 108 60 116', 'none', sw(2.4)) + HL('M42 44c1-8 6-14 13-16') + E(52, 54, 2.4, 3, K, NS) + E(68, 54, 2.4, 3, K, NS) + P('M54 64q6 5 12 0', 'none', sw(2.4));
    else if (style === 'star') { var p = starPts(60, 64, 46, 20); s = P('M' + p.map(function (q) { return q.join(' '); }).join('L') + 'Z', C.yellowL) + O(p[0][0], p[0][1], 8, C.coral, sw(2.6)); }
    else if (style === 'flower') s = P('M38 108V68', 'none', ' stroke="' + C.greenD + '"' + sw(4)) + G('translate(38 56)', [0, 60, 120, 180, 240, 300].map(function (r) { return G('rotate(' + r + ')', E(0, -13, 7, 10, C.pink, sw(2.4))); }).join('') + O(0, 0, 9, C.yellow, sw(2.4))) +
      R(70, 60, 26, 48, 8, C.coralL, sw(2.6)) + P('M83 60V52', 'none', sw(2.6)) + P('M83 26C76 36 74 42 75 46 76 52 90 52 91 46 92 42 90 36 83 26Z', C.yellow, sw(2.6));
    else if (style === 'box') s = R(24, 24, 72, 72, 14, C.lilacL) + P('M24 92V40', 'none', ' stroke="' + C.yellow + '"' + sw(6)) + O(24, 40, 8, C.lilac, sw(2.6));
    // the same dino as the full Belly Buddy (legs, tail, star toy), just smaller, so the picker matches the animation
    else if (style === 'belly') s = G('translate(-1 6) scale(.41)', BUD.belly());
    return tile(s);
  }

  /* ---------- the worry jar ---------- */
  function jarSVG(opts) {
    opts = opts || {};
    var n = Math.min(opts.n == null ? 3 : opts.n, 9), notes = '';
    var spots = [[128, 236, -12, C.yellowL], [168, 240, 10, C.blueL], [146, 214, 4, C.pinkL], [112, 210, -20, C.greenL], [180, 212, 18, C.lilacL], [140, 190, -6, C.yellowL], [104, 186, 12, C.blueL], [176, 186, -14, C.pinkL], [150, 166, 8, C.greenL]];
    for (var i = 0; i < n; i++) { var q = spots[i]; notes += G('translate(' + q[0] + ' ' + q[1] + ') rotate(' + q[2] + ')', R(-17, -13, 34, 26, 4, q[3], sw(3)) + P('M-9-4h18M-9 3h12', 'none', ' stroke="' + K + '"' + sw(1.8) + ' opacity=".35"')); }
    var face = opts.face === false ? '' : G('translate(146 132)', E(-16, 0, 4, 5, K, NS) + E(16, 0, 4, 5, K, NS) + O(-14.6, -2, 1.4, '#fff', NS) + O(17.4, -2, 1.4, '#fff', NS) + P('M-8 9q8 8 16 0', 'none', sw(3)) + E(-28, 9, 6.5, 4, C.cheek, NS + ' opacity=".85"') + E(28, 9, 6.5, 4, C.cheek, NS + ' opacity=".85"'));
    var body = P('M104 82H188C192 92 196 98 206 108 222 124 230 150 230 186V230C230 254 212 266 190 266H102C80 266 62 254 62 230V186C62 150 70 124 86 108 96 98 100 92 104 82Z', '#EEF6FD');
    var lid = '<g data-j="lid">' + R(96, 52, 100, 32, 12, C.coralL, sw(3.6)) + P('M106 62H186M106 72H186', 'none', ' stroke="#fff"' + sw(2.4) + ' opacity=".7"') + '</g>';
    return svgWrap('0 0 292 290', E(146, 276, 92, 8, K, NS + ' opacity=".1"') + body + '<g data-j="notes">' + notes + '</g>' + face +
      HL('M80 140C82 124 88 114 96 108', 6) + HL('M76 182v30', 6) +
      P('M104 82H188C192 92 196 98 206 108 222 124 230 150 230 186V230C230 254 212 266 190 266H102C80 266 62 254 62 230V186C62 150 70 124 86 108 96 98 100 92 104 82Z', 'none', sw(4.2)) + lid, 'lc-jar');
  }
  function noteSVG(col) {
    return svgWrap('0 0 120 96', R(8, 8, 104, 80, 8, col || C.yellowL, sw(3.2)) + P('M24 32h72M24 48h72M24 64h48', 'none', ' stroke="' + K + '"' + sw(2.2) + ' opacity=".3"'));
  }
  // small icons for the hub and setup
  function feelIcon() { return tile(G('translate(-2 4) scale(.55)', feelFace('happy', 'girl', { noBg: true }).replace(/^<svg[^>]*><g[^>]*>/, '').replace(/<\/g><\/svg>$/, '')) + G('translate(52 34) scale(.55)', feelFace('sad', 'boy', { noBg: true }).replace(/^<svg[^>]*><g[^>]*>/, '').replace(/<\/g><\/svg>$/, ''))); }
  function bodyIcon(g) {
    return tile(G('translate(36 8) scale(.27)', bodySVG(g || 'boy', { on: ['tummy'], glow: C.coral }).replace(/^<svg[^>]*><g[^>]*>/, '').replace(/<\/g><\/svg>$/, '')));
  }
  function menuIcon() {
    return tile(R(18, 22, 38, 38, 8, '#fff') + R(64, 22, 38, 38, 8, C.yellowL) + R(18, 66, 38, 38, 8, '#fff') + R(64, 66, 38, 38, 8, '#fff') +
      O(37, 41, 10, C.pink) + P('M74 41h18', 'none', sw(3)) + O(83, 41, 6, C.green) + P('M28 86h18M37 77v18', 'none', ' stroke="' + C.blue + '"' + sw(3.4)) + P('M74 86c6-8 12 8 18 0', 'none', ' stroke="' + C.lilac + '"' + sw(3.4)));
  }

  /* ===================== words ===================== */
  var W = {
    // shared
    again: ['Again', 'Lagi'], done: ['Done', 'Selesai'], next: ['Next', 'Lanjut'], back: ['Back', 'Kembali'], clear: ['Clear', 'Hapus'],
    livePreview: ['Live preview', 'Pratinjau langsung'], style: ['Style', 'Gaya'], soon: ['Soon', 'Segera'], close: ['Close', 'Tutup'],
    min: ['min', 'menit'], minLeft: ['minutes left', 'menit lagi'],
    // breathing buddy
    bbTitle: ['Breathing Buddy', 'Teman Napas'], bbDesc: ['A friendly animation to breathe along with, like a balloon that grows and shrinks. It helps your child slow down and calm their body.', 'Animasi ramah untuk bernapas bersama, seperti balon yang membesar dan mengecil. Membantu anak memperlambat napas dan menenangkan tubuhnya.'],
    balloon: ['Balloon', 'Balon'], star: ['Star', 'Bintang'], flower: ['Flower & candle', 'Bunga & lilin'], box: ['Box', 'Kotak'], belly: ['Belly Buddy', 'Dino perut'],
    styleD: {
      balloon: ['Grows as you breathe in, shrinks as you breathe out.', 'Membesar saat tarik napas, mengecil saat buang napas.'],
      star: ['Trace up to a point as you breathe in, and down as you breathe out.', 'Naik ke ujung saat tarik napas, turun saat buang napas.'],
      flower: ['Smell the flower, then blow out the candle.', 'Cium bunganya, lalu tiup lilinnya.'],
      box: ['In, hold, out, hold. Best for children aged 7 and up.', 'Tarik, tahan, buang, tahan. Cocok untuk usia 7 tahun ke atas.'],
      belly: ['A little dino lies on its back. Its tummy rises and falls, and the star toy rides along.', 'Dino kecil berbaring. Perutnya naik turun, dan mainan bintang ikut bergerak.']
    },
    pace: ['Pace', 'Kecepatan'], paceNote: ['Never shown to the child', 'Tidak tampil untuk anak'], pLittle: ['Little ones', 'Si kecil'], pKids: ['Kids', 'Anak'], pCalm: ['Slow & calm', 'Pelan & tenang'],
    inS: ['Breathe in', 'Tarik napas'], outS: ['Breathe out', 'Buang napas'], holdS: ['Hold', 'Tahan'], holdNote: ['Box only', 'Khusus kotak'],
    nBreaths: ['Number of breaths', 'Jumlah napas'], breathsRange: ['breaths · 3 to 10', 'napas · 3 sampai 10'],
    summary: [function (a, b, n) { return a + ' s in · ' + b + ' s out · ' + n + ' breaths'; }, function (a, b, n) { return a + ' dtk tarik · ' + b + ' dtk buang · ' + n + ' napas'; }],
    soundsFeel: ['Sounds & feel', 'Suara & getaran'],
    sayIO: ['Say “breathe in / breathe out”', 'Ucapkan “tarik napas / buang napas”'], sayIOd: ['A soft voice, in the site language', 'Suara lembut, dalam bahasa situs'],
    counting: ['Soft counting', 'Hitungan pelan'], countingD: ['“1, 2, 3, 4” on each breath', '“1, 2, 3, 4” di setiap napas'],
    tone: ['Gentle breath sound', 'Suara napas lembut'], toneD: ['A soft tone that rises and falls', 'Nada lembut yang naik dan turun'],
    vib: ['Gentle vibration', 'Getaran lembut'], vibD: ['A soft buzz when the breath changes', 'Getar pelan saat napas berganti'],
    showWords: ['Show words on screen', 'Tampilkan kata di layar'], showWordsD: ['“Breathe in” and “Breathe out” under the buddy', '“Tarik napas” dan “Buang napas” di bawah gambar'],
    blowReal: ['Blow for real', 'Tiup sungguhan'], flowerOnly: ['Flower & candle only', 'Khusus bunga & lilin'],
    useMic: ['Use the microphone', 'Pakai mikrofon'], useMicD: ['The flame flickers and goes out when your child really blows. Sound is never recorded or saved.', 'Api bergoyang dan padam saat anak benar-benar meniup. Suara tidak pernah direkam atau disimpan.'],
    micAskH: ['Turn on “blow for real”?', 'Nyalakan “tiup sungguhan”?'],
    micAskP: ['Your child blows towards the screen and the candle really goes out. The microphone only listens for a puff of air while the candle is showing.', 'Anak meniup ke arah layar dan lilinnya benar-benar padam. Mikrofon hanya mendengarkan tiupan selama lilin tampil.'],
    micL1: ['Nothing is recorded, saved or sent', 'Tidak ada yang direkam, disimpan, atau dikirim'], micL2: ['A small “Mic on” dot shows while it listens', 'Tanda kecil “Mik nyala” tampil saat mendengarkan'], micL3: ['Tapping the candle always works too', 'Mengetuk lilin juga selalu bisa'],
    allowMic: ['Allow microphone', 'Izinkan mikrofon'], notNow: ['Not now', 'Nanti saja'], micAsk2: ['Your browser asks next. You can turn this off any time here.', 'Browser akan bertanya setelah ini. Bisa dimatikan kapan saja di sini.'],
    micNo: ['The microphone isn’t available here. Tapping the candle still works.', 'Mikrofon tidak tersedia. Mengetuk lilin tetap bisa.'], micOn: ['Mic on', 'Mik nyala'],
    noCount: ['<b>No countdown, on purpose.</b> Your child sees dots fill in, never a number going down. Breathing Buddy also opens from Feelings Check-In.', '<b>Sengaja tanpa hitung mundur.</b> Anak melihat titik terisi, bukan angka yang berkurang. Teman Napas juga bisa dibuka dari Cek Perasaan.'],
    stayAwake: ['The screen stays awake. Press and hold to exit.', 'Layar tetap menyala. Tekan lama untuk keluar.'],
    smell: ['Smell the flower', 'Cium bunganya'], blow: ['Blow out the candle', 'Tiup lilinnya'], whoosh: ['Whoosh!', 'Wuuus!'], relight: ['The candle lights again for the next breath', 'Lilin menyala lagi untuk napas berikutnya'],
    youDid: ['You did it', 'Kamu berhasil'],
    // feelings
    feTitle: ['Feelings Check-In', 'Cek Perasaan'], feDesc: ['Your child picks how they feel and how big the feeling is, shows where they feel it in their body, and chooses something that helps.', 'Anak memilih apa yang dirasakan dan seberapa besar perasaannya, menunjukkan di mana terasa di tubuh, lalu memilih hal yang membantu.'],
    whatUse: ['What will your child use?', 'Apa yang akan dipakai anak?'],
    mCheck: ['How I feel', 'Perasaanku'], mCheckD: ['How do you feel, and how big?', 'Merasa apa, seberapa besar?'],
    mBody: ['Body map', 'Peta tubuh'], mBodyD: ['Where do you feel it?', 'Di mana terasa?'],
    mMenu: ['Calm-down menu', 'Menu tenang'], mMenuD: ['Choose what helps', 'Pilih yang membantu'],
    steps: ['Steps', 'Langkah'], sBoth: ['Feeling + size', 'Perasaan + ukuran'], sFace: ['Feeling only', 'Perasaan saja'], sSize: ['Size only', 'Ukuran saja'],
    sizeOnlyD: ['Size only works well for children who can’t name the feeling yet.', 'Ukuran saja cocok untuk anak yang belum bisa menyebut perasaannya.'],
    feelShow: ['Feelings to show', 'Perasaan yang ditampilkan'], upTo6: [function (n) { return n + ' chosen · up to 6'; }, function (n) { return n + ' dipilih · maks. 6'; }],
    levels: ['How big is it? · levels', 'Seberapa besar? · tingkat'],
    askHelp: ['Then show “What can help?”', 'Lalu tampilkan “Apa yang bisa membantu?”'], askHelpD: ['Uses the cards in your calm-down menu', 'Memakai kartu di menu tenangmu'],
    sayQ: ['Say the question out loud', 'Ucapkan pertanyaannya'], sayQD: ['Also says each choice when tapped', 'Juga mengucapkan pilihan yang diketuk'],
    sensCards: ['Sensation cards', 'Kartu rasa'], askSens: ['Ask what it feels like', 'Tanyakan rasanya seperti apa'], askSensD: ['Off: just tap the body', 'Mati: cukup ketuk tubuh'],
    sayParts: ['Say body parts out loud', 'Ucapkan bagian tubuh'], glowCol: ['Glow colour', 'Warna cahaya'],
    menuH: ['Calm-down menu', 'Menu tenang'], menuSub: [function (n) { return n + ' of 6 · tap to change'; }, function (n) { return n + ' dari 6 · ketuk untuk mengubah'; }],
    addHelp: ['+ Add from library or photo', '+ Tambah dari perpustakaan atau foto'], whenChosen: ['When this card is chosen', 'Saat kartu ini dipilih'],
    actNone: ['Just show it', 'Tampilkan saja'], actTimer: [function (m) { return 'Timer · ' + m + ' min'; }, function (m) { return 'Timer · ' + m + ' menit'; }], actBreathe: ['Open Breathing Buddy', 'Buka Teman Napas'],
    removeCard: ['Remove from menu', 'Hapus dari menu'], moveUp: ['Move up', 'Naikkan'],
    comeBack: ['Come back to', 'Kembali ke'], showNext: ['Show what comes next', 'Tampilkan kegiatan berikutnya'], showNextD: ['After calming, a First–Then ending: “Then: …”', 'Setelah tenang, penutup Pertama–Lalu: “Lalu: …”'],
    chooseNext: ['Choose the next activity', 'Pilih kegiatan berikutnya'],
    menuTip: ['<b>Tip:</b> practise the menu when your child is calm, so it’s familiar when it’s needed.', '<b>Tips:</b> latih menu ini saat anak sedang tenang, agar sudah terbiasa saat dibutuhkan.'],
    nothingSaved: ['<b>Nothing is saved.</b> Each check-in starts fresh. No history, no charts.', '<b>Tidak ada yang disimpan.</b> Setiap cek dimulai dari awal. Tanpa riwayat, tanpa grafik.'],
    startCheck: ['Start check-in', 'Mulai cek perasaan'], startBody: ['Start body map', 'Mulai peta tubuh'], startMenu: ['Open calm-down menu', 'Buka menu tenang'],
    howFeel: ['How do you feel?', 'Kamu merasa apa?'], howBig: ['How big is it?', 'Seberapa besar?'], howBigSolo: ['How big is your feeling?', 'Seberapa besar perasaanmu?'],
    whatHelp: ['What can help?', 'Apa yang bisa membantu?'], thanksTell: ['Thank you for telling me', 'Terima kasih sudah cerita'],
    letsBreathe: ['Let’s breathe', 'Yuk, tarik napas'], startTimerN: [function (m) { return 'Start timer · ' + m + ' min'; }, function (m) { return 'Mulai timer · ' + m + ' menit'; }],
    lv3: [['A little', 'Medium', 'Big'], ['Sedikit', 'Sedang', 'Besar']],
    lv4: [['A little', 'Medium', 'Big', 'Very big'], ['Sedikit', 'Sedang', 'Besar', 'Besar sekali']],
    lv5: [['A tiny bit', 'A little', 'Medium', 'Big', 'Very big'], ['Sedikit sekali', 'Sedikit', 'Sedang', 'Besar', 'Besar sekali']],
    whereFeel: ['Where do you feel it?', 'Di mana kamu merasakannya?'], feelLike: ['What does it feel like?', 'Rasanya seperti apa?'], tapBody: ['Tap the body', 'Ketuk tubuhnya'],
    thanksShow: ['Thank you for showing me', 'Terima kasih sudah menunjukkan'], inMy: [function (l) { return 'In my ' + l; }, function (l) { return 'Terasa di ' + l; }], and: ['and', 'dan'],
    calmI: ['To feel calm, I can…', 'Supaya tenang, aku bisa…'], chooseAnother: ['Choose another', 'Pilih yang lain'], feelCalm: ['I feel calm', 'Aku sudah tenang'],
    wellDone: ['Well done for calming down', 'Hebat, kamu sudah tenang'], ready: ['I’m ready', 'Aku siap'], emptyMenu: ['Add a few cards to the calm-down menu first.', 'Tambahkan beberapa kartu ke menu tenang dulu.'],
    // worry jar
    wjTitle: ['Worry jar', 'Toples khawatir'], wjDesc: ['Your child draws or writes a worry and puts it in a jar on screen. Later, you open the jar together and talk it through.', 'Anak menggambar atau menulis kekhawatirannya lalu memasukkannya ke toples di layar. Nanti, kalian membuka toples bersama dan membicarakannya.'],
    inJar: [function (n) { return n === 0 ? 'The jar is empty' : n + (n === 1 ? ' worry in the jar' : ' worries in the jar'); }, function (n) { return n === 0 ? 'Toplesnya kosong' : n + ' kekhawatiran di toples'; }],
    lookTogether: ['Look together →', 'Lihat bersama →'], worryIn: [function (m) { return 'Worry time in ' + m + ' min'; }, function (m) { return 'Waktunya cerita dalam ' + m + ' menit'; }], worryNow: ['It’s worry time', 'Sudah waktunya cerita'],
    addedWhen: [function (s) { return 'Last added ' + s; }, function (s) { return 'Terakhir ditambahkan ' + s; }],
    howAdd: [function (n) { return 'How ' + n + ' adds a worry'; }, function (n) { return 'Cara ' + n + ' menambah kekhawatiran'; }],
    draw: ['Draw', 'Gambar'], type: ['Type', 'Tulis'], voice: ['Voice', 'Suara'],
    worryLater: ['Worry time later', 'Waktu cerita nanti'], openLater: ['Open the jar together later', 'Buka toples bersama nanti'], openLaterD: ['A timer starts when a worry goes in. When it ends, the jar opens.', 'Timer mulai saat kekhawatiran masuk. Saat selesai, toples terbuka.'],
    keptHere: [function (n) { return '<b>Kept on this device only.</b> ' + n + ' can add worries but not remove them. Only an adult can let one float away, after talking it through.'; }, function (n) { return '<b>Hanya tersimpan di perangkat ini.</b> ' + n + ' bisa menambah tapi tidak bisa menghapus. Hanya orang dewasa yang bisa melepaskannya, setelah dibicarakan bersama.'; }],
    openWorryNow: ['Open worry time now', 'Buka waktu cerita sekarang'], startWorry: ['Start in child mode', 'Mulai mode anak'],
    somethingWorry: ['Is something worrying you?', 'Ada yang bikin kamu khawatir?'], drawIt: ['Draw it', 'Gambar'], writeIt: ['Write it', 'Tulis'], sayIt: ['Say it · coming later', 'Ucapkan · segera hadir'],
    drawWorry: ['Draw your worry', 'Gambar kekhawatiranmu'], worriedThat: ['I’m worried that…', 'Aku khawatir kalau…'], putIn: ['Put it in the jar', 'Masukkan ke toples'],
    undo: ['Undo', 'Batal'], eraser: ['Eraser', 'Penghapus'], itsIn: ['It’s in the jar', 'Sudah masuk toples'],
    safe: ['Your worry is safe in the jar', 'Kekhawatiranmu aman di toples'], lookSoon: ['We’ll look together soon', 'Nanti kita lihat bersama'], another: ['+ Another', '+ Tambah lagi'],
    worryTime: ['Worry time', 'Waktunya cerita'], tapOne: ['Tap a worry to look at it together', 'Ketuk satu untuk dilihat bersama'],
    forAdult: ['For the adult', 'Untuk orang dewasa'], forAdultP: ['Ask what happened, what might help, and what to do if it happens. When you’ve talked it through, you can let it go together.', 'Tanyakan apa yang terjadi, apa yang bisa membantu, dan apa yang dilakukan jika itu terjadi. Setelah dibicarakan, kalian bisa melepaskannya bersama.'],
    holdFloat: ['Hold: float away', 'Tahan: lepaskan'], holdFloatD: ['Adults · hold for 2 seconds', 'Orang dewasa · tahan 2 detik'], closeJar: ['Close the jar', 'Tutup toples'],
    byeWorry: ['Bye bye, worry', 'Dadah, khawatir'], leftInJar: [function (n) { return n === 0 ? 'The jar is empty' : n + ' left in the jar'; }, function (n) { return n === 0 ? 'Toplesnya kosong' : 'Sisa ' + n + ' di toples'; }],
    keepIt: ['Keep it in the jar', 'Simpan di toples'],
    today: ['today', 'hari ini'], yesterday: ['yesterday', 'kemarin'], daysAgo: [function (n) { return n + ' days ago'; }, function (n) { return n + ' hari lalu'; }],
    // download
    dlBreath: ['Breathing card', 'Kartu napas'], dlBreathCards: ['Breathing buddies to cut out', 'Kartu teman napas untuk digunting'],
    dlColour: ['Colour in a dot after each breath', 'Warnai satu titik setiap selesai bernapas'],
    dlFeel: ['How do I feel?', 'Aku merasa apa?'], dlBig: ['How big?', 'Seberapa besar?'], dlBody: ['Where do I feel it?', 'Di mana aku merasakannya?'],
    dlJar: ['My worry jar', 'Toples khawatirku'], dlJarP: ['Draw or write a worry, fold it, and put it in the jar.', 'Gambar atau tulis kekhawatiranmu, lipat, lalu masukkan ke toples.'], dlSlips: ['Worry notes to cut out', 'Catatan khawatir untuk digunting']
  };
  function w(k) {
    var v = W[k]; if (!v) return k;
    v = v[isId() ? 1 : 0];
    return typeof v === 'function' ? v.apply(null, Array.prototype.slice.call(arguments, 1)) : v;
  }
  function wd(pair) { return pair[isId() ? 1 : 0]; }
  function feelName(k) { var f = FEEL[k]; return f ? (isId() ? f.id : f.en) : ''; }
  function sensName(k) { var f = SENS[k]; return f ? (isId() ? f.id : f.en) : ''; }
  function zoneName(k) { var f = ZONES[k]; return f ? (isId() ? f.id : f.en) : ''; }
  function kid() { var p = X.prof(); return (p && p.kid) || 'boy'; }
  function lab() { return isId() ? 'id' : 'en'; }
  function card(ref, o) { o = o || {}; o.labels = o.labels || lab(); return X.cardHTML(ref, o); }
  function heartSVG(n, col) { return X.heart(n || 40, col); }
  function clampN(n, a, b) { return Math.max(a, Math.min(b, n)); }

  /* ===================== settings (saved per child on this device) ===================== */
  var MENU_DEFAULT = [{ ref: 'tarik-napas', act: 'breathe' }, { ref: 'peluk-bantal', act: 'none' }, { ref: 'minum', act: 'none' }, { ref: 'pojok-tenang', act: 't3' }, { ref: 'pelukan', act: 'none' }, { ref: 'dorong-tembok', act: 'none' }];
  function CFG() {
    var d = X.D();
    if (!d.calm) d.calm = {};
    var c = d.calm;
    function fill(k, def) { if (!c[k] || typeof c[k] !== 'object') c[k] = {}; for (var x in def) if (c[k][x] === undefined) c[k][x] = def[x]; }
    fill('bb', { style: 'balloon', pace: 'kids', inS: 4, outS: 4, hold: 4, n: 5, say: true, count: false, tone: true, vib: false, mic: false, words: true });
    fill('fe', { mode: 'check', steps: 'both', show: ['happy', 'sad', 'angry', 'scared', 'tired', 'calm'], levels: 4, help: true, sayQ: true, sens: true, sensShow: ['tight', 'hot', 'shaky', 'butterflies', 'heavy', 'heart'], sayParts: true, bodyHelp: true, glow: '#F0694F', menu: MENU_DEFAULT.map(function (m) { return { ref: m.ref, act: m.act }; }), back: false, backRef: null });
    fill('wj', { draw: true, type: true, later: false, laterMin: 20, at: null, items: [] });
    return c;
  }
  function save() { X.save(); }
  function keep() { X.keep(); }
  function actMin(act) { var m = /^t(\d+)$/.exec(act || ''); return m ? Number(m[1]) : 0; }
  function actLabel(act) { return act === 'breathe' ? w('actBreathe') : actMin(act) ? w('actTimer', actMin(act)) : w('actNone'); }
  function menuItems() { return CFG().fe.menu.filter(function (m) { return X.cardInfo(m.ref); }); }

  /* ===================== sound ===================== */
  var AC2 = null;
  function settings() { return X.S().settings; }
  function tone(up, dur) {
    if (!settings().sound) return;
    try {
      AC2 = AC2 || new (window.AudioContext || window.webkitAudioContext)();
      var o = AC2.createOscillator(), g = AC2.createGain(), f = AC2.createBiquadFilter(), t = AC2.currentTime, v = 0.07 * clampN(settings().volume, 0, 1);
      o.type = 'sine'; f.type = 'lowpass'; f.frequency.value = 900;
      o.frequency.setValueAtTime(up ? 220 : 330, t); o.frequency.linearRampToValueAtTime(up ? 330 : 220, t + dur);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + Math.min(0.6, dur / 3)); g.gain.setValueAtTime(v, t + dur * 0.7); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(f); f.connect(g); g.connect(AC2.destination); o.start(t); o.stop(t + dur + 0.05);
    } catch (e) {}
  }
  function speak(text, keepQueue) {
    if (!settings().sound || !window.speechSynthesis) return;
    try {
      var u = new SpeechSynthesisUtterance(text);
      u.lang = isId() ? 'id-ID' : 'en-US'; u.rate = 0.85; u.pitch = 1.05; u.volume = clampN(settings().volume + 0.2, 0, 1);
      if (!keepQueue) speechSynthesis.cancel();
      speechSynthesis.speak(u);
    } catch (e) {}
  }
  function reduced() { return !!settings().reduce || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches); }
  function later(fn, ms) { var t = setTimeout(fn, ms); X.addTimer(t); return t; }

  /* ===================== Breathing Buddy engine ===================== */
  function ease(p) { return (1 - Math.cos(Math.PI * clampN(p, 0, 1))) / 2; }
  function phasesFor(c) {
    return c.style === 'box' ? [['in', c.inS], ['hold', c.hold], ['out', c.outS], ['hold2', c.hold]] : [['in', c.inS], ['out', c.outS]];
  }
  // runs the animation inside `root` (which holds the buddy svg). hooks: phase(name, breathIndex), done(), word(text), dots(n)
  function breather(root, c, hooks) {
    hooks = hooks || {};
    var svg = root.querySelector('svg.lc-bud'), q = function (k) { return svg.querySelector('[data-b="' + k + '"]'); };
    var ph = phasesFor(c), cycle = ph.reduce(function (s, x) { return s + x[1]; }, 0);
    var t0 = performance.now() + (hooks.delay || 0), lastKey = '', raf = 0, stopped = false, blown = false, lastSec = -1;
    var star = c.style === 'star' ? starPts(150, 156, 120, 52) : null, order = [9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    var toy = q('toy'), bellyG = q('belly');
    if (toy && bellyG && toy.parentNode === bellyG) bellyG.parentNode.insertBefore(toy, bellyG.nextSibling);
    function set(el, tf) { if (el) el.setAttribute('transform', tf); }
    function sc(cx, cy, sx, sy) { return 'translate(' + cx + ' ' + cy + ') scale(' + sx.toFixed(3) + ' ' + (sy == null ? sx : sy).toFixed(3) + ') translate(' + (-cx) + ' ' + (-cy) + ')'; }
    function draw(name, p, bi) {
      var e = ease(p), lv = name === 'in' ? e : name === 'out' ? 1 - e : name === 'hold' ? 1 : 0;
      svg.classList.toggle('is-out', name === 'out' || name === 'hold2');
      if (c.style === 'balloon') {
        set(q('grow'), sc(150, 200, 0.62 + 0.38 * lv));
        var halo = svg.querySelector('.lc-halo'); if (halo) set(halo, sc(150, 150, 0.78 + 0.22 * lv));
      } else if (c.style === 'star') {
        var lap = bi % 5, seg = lap * 2 + (name === 'in' ? 0 : 1), a = star[order[seg]], b = star[order[seg + 1]];
        var x = a[0] + (b[0] - a[0]) * e, y = a[1] + (b[1] - a[1]) * e;
        set(q('dot'), 'translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ')');
        var d = 'M' + star[order[0]].join(' ');
        for (var i = 1; i <= seg; i++) d += 'L' + star[order[i]].join(' ');
        q('trail').setAttribute('d', d + 'L' + x.toFixed(1) + ' ' + y.toFixed(1));
      } else if (c.style === 'flower') {
        var fl = q('flower'), cd = q('candle'), flame = q('flame'), smoke = q('smoke');
        if (name === 'in') {
          blown = false;
          set(fl, sc(84, 200, 1 + 0.08 * e)); fl.style.opacity = 1; cd.style.opacity = 0.5;
          q('fhalo').style.opacity = 1; q('chalo').style.opacity = 0.35;
          set(flame, sc(222, 142, 1, 0.75 + 0.25 * Math.min(1, p * 3))); flame.style.opacity = 1; smoke.setAttribute('opacity', '0');
        } else {
          set(fl, sc(84, 200, 1.08 - 0.08 * e)); fl.style.opacity = 0.55; cd.style.opacity = 1;
          q('fhalo').style.opacity = 0.35; q('chalo').style.opacity = 1;
          var out = blown || p > 0.9;
          if (out) { flame.style.opacity = 0; smoke.setAttribute('opacity', String(Math.max(0, 1 - (p - 0.5) * 1.4))); }
          else { var bend = (hooks.level ? hooks.level() : 0); set(flame, 'translate(222 142) skewX(' + (-(10 + 26 * e + bend * 30)).toFixed(1) + ') scale(1 ' + (1 - 0.45 * e - bend * 0.3).toFixed(3) + ') translate(-222 -142)'); }
        }
      } else if (c.style === 'box') {
        var P4 = [[50, 250], [50, 50], [250, 50], [250, 250], [50, 250]], k = { in: 0, hold: 1, out: 2, hold2: 3 }[name];
        var s0 = P4[k], s1 = P4[k + 1], bx = s0[0] + (s1[0] - s0[0]) * e, by = s0[1] + (s1[1] - s0[1]) * e;
        set(q('dot'), 'translate(' + bx.toFixed(1) + ' ' + by.toFixed(1) + ')');
        q('side').setAttribute('d', 'M' + s0.join(' ') + 'L' + bx.toFixed(1) + ' ' + by.toFixed(1));
        var hgt = 200 * lv; q('fill').setAttribute('y', (250 - hgt).toFixed(1)); q('fill').setAttribute('height', hgt.toFixed(1));
      } else if (c.style === 'belly') {
        var sy = 1 + 0.32 * lv;
        set(bellyG, sc(150, 210, 1 + 0.06 * lv, sy));
        set(toy, 'translate(150 ' + (136 - 60 * (sy - 1)).toFixed(1) + ')');
      }
    }
    function frame(now) {
      if (stopped) return;
      if (!document.body.contains(svg)) { stop(); return; }
      var el = Math.max(0, (now - t0) / 1000), bi = Math.floor(el / cycle);
      if (c.n && bi >= c.n) { draw(ph[ph.length - 1][0], 1, c.n - 1); stop(); hooks.done && hooks.done(); return; }
      var within = el - bi * cycle, acc = 0, name = ph[0][0], p = 0, dur = ph[0][1];
      for (var i = 0; i < ph.length; i++) { if (within < acc + ph[i][1] || i === ph.length - 1) { name = ph[i][0]; dur = ph[i][1]; p = (within - acc) / ph[i][1]; break; } acc += ph[i][1]; }
      var key = bi + ':' + name;
      if (key !== lastKey) { lastKey = key; lastSec = 0; hooks.phase && hooks.phase(name, bi, dur); }
      else { var sec = Math.floor(p * dur); if (sec !== lastSec) { lastSec = sec; hooks.second && hooks.second(name, sec + 1); } }
      if (c.style === 'flower' && name === 'out' && hooks.level && !blown && hooks.level() > 0.55) { blown = true; hooks.blown && hooks.blown(); }
      draw(name, p, bi);
      raf = requestAnimationFrame(frame);
    }
    function stop() { stopped = true; cancelAnimationFrame(raf); }
    draw('in', 0, 0);
    raf = requestAnimationFrame(frame);
    return { stop: stop, blow: function () { blown = true; } };
  }

  // microphone for "blow for real": returns {level(), stop()} or null
  function startMic(onReady, onFail) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { onFail && onFail(); return null; }
    var api = { lv: 0, stream: null, ctx: null, stopped: false, level: function () { return api.lv; }, stop: function () { api.stopped = true; try { api.stream && api.stream.getTracks().forEach(function (t) { t.stop(); }); api.ctx && api.ctx.close(); } catch (e) {} } };
    navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false } }).then(function (st) {
      if (api.stopped) { st.getTracks().forEach(function (t) { t.stop(); }); return; }
      api.stream = st;
      var ctx = api.ctx = new (window.AudioContext || window.webkitAudioContext)(), src = ctx.createMediaStreamSource(st), an = ctx.createAnalyser();
      an.fftSize = 512; src.connect(an);
      var buf = new Float32Array(an.fftSize);
      (function tick() {
        if (api.stopped) return;
        an.getFloatTimeDomainData(buf);
        var s = 0; for (var i = 0; i < buf.length; i++) s += buf[i] * buf[i];
        var rms = Math.sqrt(s / buf.length), v = clampN((rms - 0.02) / 0.16, 0, 1);
        api.lv = api.lv * 0.6 + v * 0.4;
        requestAnimationFrame(tick);
      })();
      onReady && onReady();
    }).catch(function () { onFail && onFail(); });
    return api;
  }

  function bbWords(name) {
    var c = CFG().bb;
    if (c.style === 'flower') return name === 'in' ? w('smell') : w('blow');
    return name === 'in' ? w('inS') : name === 'out' ? w('outS') : w('holdS');
  }
  function dotsHTML(n, done, cur) {
    var h = '<div class="lc-dots">';
    for (var i = 0; i < n; i++) h += '<i class="' + (i < done ? 'on' : i === cur ? 'cur' : '') + '"></i>';
    return h + '</div>';
  }

  /* ---------- Breathing Buddy: child mode ---------- */
  function runBreathe(opts) {
    opts = opts || {};
    var c = Object.assign({}, CFG().bb, opts.cfg || {}), mic = null;
    if (!opts.fromOther) X.setLast('breathe');
    X.childOpen(function (el) {
      function play() {
        X.childClear();
        el.innerHTML = '<div class="tl-cwrap lc-child lc-bbc ' + c.style + '">' + X.exitPill() +
          (c.style === 'flower' && c.mic ? '<span class="lc-micpill" hidden><i></i>' + esc(w('micOn')) + '<span class="lc-bars"><b></b><b></b><b></b></span></span>' : '') +
          '<div class="lc-bbvis">' + buddySVG(c.style) + '</div>' +
          '<div class="lc-word' + (c.words ? '' : ' quiet') + '"><b></b><small></small></div>' + dotsHTML(c.n, 0, 0) + '</div>';
        X.wireExit(el);
        var wordB = el.querySelector('.lc-word b'), wordS = el.querySelector('.lc-word small'), dots = el.querySelector('.lc-dots');
        var pill = el.querySelector('.lc-micpill'), bars = el.querySelectorAll('.lc-bars b');
        if (c.style === 'flower' && c.mic && !mic) {
          mic = startMic(function () { if (pill) pill.hidden = false; }, function () { X.toast(w('micNo')); });
        }
        if (mic && pill && mic.stream) pill.hidden = false;
        var eng;
        var candle = el.querySelector('[data-b="candle"]');
        if (candle) candle.addEventListener('pointerdown', function () { if (eng) { eng.blow(); onBlown(); } });
        function onBlown() { wordB.textContent = w('whoosh'); wordS.textContent = w('relight'); X.chime('pop'); }
        function setWord(t) {
          wordB.classList.remove('show'); void wordB.offsetWidth;
          wordB.textContent = t; wordS.textContent = ''; wordB.classList.add('show');
        }
        eng = breather(el, c, {
          delay: 500,
          level: mic ? function () { var v = mic.level(); bars.forEach(function (b, i) { b.style.transform = 'scaleY(' + Math.max(0.25, Math.min(1, v * 1.8 - i * 0.25)).toFixed(2) + ')'; }); return v; } : null,
          blown: onBlown,
          phase: function (name, bi, dur) {
            var t = bbWords(name);
            setWord(t);
            if (dots) dots.outerHTML = dotsHTML(c.n, bi, bi), dots = el.querySelector('.lc-dots');
            if (c.say) speak(t); else if (c.count) speak('1');
            if (c.tone && (name === 'in' || name === 'out')) tone(name === 'in', dur);
            if (c.vib) X.buzz(name === 'in' ? 40 : [30, 60, 30]);
          },
          second: function (name, n) { if (c.count) speak(String(n), true); },
          done: function () { if (mic) { mic.stop(); mic = null; } later(finish, 700); }
        });
        // stop the mic if the child view closes
        var watch = setInterval(function () { if (!document.body.contains(el)) { clearInterval(watch); eng.stop(); if (mic) { mic.stop(); mic = null; } } }, 500);
      }
      function finish() {
        X.chime('done');
        if (c.say) speak(w('youDid'));
        el.innerHTML = '<div class="tl-cwrap lc-child lc-end ' + c.style + '">' + X.exitPill() + '<div class="lc-endin"><span class="lc-heartbig">' + heartSVG(70, '#FBD5DE') + '</span><h2 class="lc-bigq">' + esc(w('youDid')) + '</h2>' + dotsHTML(c.n, c.n, -1) + '</div>' +
          '<div class="lc-endbtns"><button type="button" class="lc-bigbtn" data-again>↻ ' + esc(w('again')) + '</button><button type="button" class="lc-bigbtn yellow" data-done>✓ ' + esc(w('done')) + '</button></div></div>';
        X.wireExit(el);
        el.querySelector('[data-again]').onclick = play;
        el.querySelector('[data-done]').onclick = function () { if (opts.onDone) opts.onDone(); else X.childClose(); };
      }
      play();
    }, opts.onExit || function () { X.rerender(); });
  }

  /* ---------- Breathing Buddy: parent setup ---------- */
  var PREV = null;
  function pageBreathe() {
    var c = CFG().bb;
    var styles = ['balloon', 'star', 'flower', 'box', 'belly'];
    var stepper = function (key, label, val, note) {
      return '<div class="tl-row"><div><b>' + esc(label) + '</b>' + (note ? '<small>' + esc(note) + '</small>' : '') + '</div><div class="lc-step"><button type="button" class="tl-iconbtn round" data-lc="bstep" data-k="' + key + '" data-d="-1" aria-label="−">−</button><b>' + val + ' s</b><button type="button" class="tl-iconbtn round" data-lc="bstep" data-k="' + key + '" data-d="1" aria-label="+">+</button></div></div>';
    };
    var h = '<div class="tl-page narrow lc-setup">' + X.topbar(w('bbTitle'), X.tr('parentSetup'), { dl: true }) +
      '<div class="tl-previewbox lc-pv" style="background:#DCEBFA"><span class="lc-pvtag">' + esc(w('livePreview')) + '</span><div class="lc-pvbud" id="lcPrev">' + buddySVG(c.style) + '</div><div class="lc-pvword"><b>' + esc(bbWords('in')) + '</b><small>' + esc(w('summary', c.style === 'box' ? c.inS : c.inS, c.outS, c.n)) + '</small></div></div>' +
      '<div class="tl-lab2">' + esc(w('style')) + '</div><div class="lc-stylegrid">' + styles.map(function (s) {
        return '<button type="button" class="tl-opt' + (c.style === s ? ' on' : '') + '" data-lc="bstyle" data-v="' + s + '"><span class="tl-optvis">' + buddyIcon(s) + '</span><b>' + esc(w(s)) + (s === 'box' ? ' <em>7+</em>' : '') + '</b></button>';
      }).join('') + '</div><p class="lc-hint">' + esc(wd(W.styleD[c.style])) + '</p>' +
      '<div class="tl-lab2">' + esc(w('pace')) + '</div>' +
      '<div class="tl-panel">' + stepper('inS', w('inS'), c.inS) + (c.style === 'box' ? stepper('hold', w('holdS'), c.hold, w('holdNote')) : '') + stepper('outS', w('outS'), c.outS) + '</div>' +
      '<div class="tl-lab2">' + esc(w('nBreaths')) + '</div>' +
      '<div class="tl-panel stepper"><button type="button" class="tl-iconbtn" data-lc="bn" data-d="-1">−</button><div><b>' + c.n + '</b><span class="lc-ndots">' + new Array(c.n + 1).join('<i></i>') + '</span><small>' + esc(w('breathsRange')) + '</small></div><button type="button" class="tl-iconbtn" data-lc="bn" data-d="1">+</button></div>' +
      '<div class="tl-lab2">' + esc(w('soundsFeel')) + '</div><div class="tl-panel">' +
      X.row(esc(w('sayIO')), esc(w('sayIOd')), X.toggle('say', c.say)) + X.row(esc(w('counting')), esc(w('countingD')), X.toggle('count', c.count)) +
      X.row(esc(w('tone')), esc(w('toneD')), X.toggle('tone', c.tone)) + X.row(esc(w('vib')), esc(w('vibD')), X.toggle('vib', c.vib)) +
      X.row(esc(w('showWords')), esc(w('showWordsD')), X.toggle('words', c.words)) + '</div>' +
      '<div class="tl-lab2 between"><span>' + esc(w('blowReal')) + '</span><small>' + esc(w('flowerOnly')) + '</small></div>' +
      '<div class="tl-panel' + (c.style === 'flower' ? '' : ' lc-dim') + '"><div class="tl-row"><span class="lc-micico">🎙</span><div><b>' + esc(w('useMic')) + '</b><small>' + esc(w('useMicD')) + '</small></div>' + X.toggle('mic', c.mic && c.style === 'flower') + '</div></div>' +
      '<div class="tl-foot"><button type="button" class="tl-btn primary lg block" data-lc="bstart">' + esc(X.tr('startChild')) + '</button><small>' + esc(w('stayAwake')) + '</small></div></div>';
    later(function () { startPreview(); }, 30);
    return h;
  }
  function startPreview() {
    if (PREV) { PREV.stop(); PREV = null; }
    var box = document.getElementById('lcPrev'); if (!box) return;
    var c = Object.assign({}, CFG().bb, { n: 0 }), word = document.querySelector('.lc-pvword b');
    PREV = breather(box, c, { phase: function (name) { if (word) word.textContent = bbWords(name); } });
  }
  function askMic(onYes) {
    var sh = X.sheet('<div class="lc-sheetico">🎙</div><h2 class="tl-h2">' + esc(w('micAskH')) + '</h2><p class="tl-p">' + esc(w('micAskP')) + '</p>' +
      '<ul class="lc-checks"><li>' + esc(w('micL1')) + '</li><li>' + esc(w('micL2')) + '</li><li>' + esc(w('micL3')) + '</li></ul>' +
      '<button type="button" class="tl-btn primary lg block" data-yes>' + esc(w('allowMic')) + '</button><button type="button" class="tl-btn quiet lg block" data-no>' + esc(w('notNow')) + '</button><p class="lc-small">' + esc(w('micAsk2')) + '</p>');
    sh.el.onclick = function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (b.hasAttribute('data-no')) return sh.close();
      if (b.hasAttribute('data-yes')) {
        sh.close();
        var m = startMic(function () { m.stop(); onYes(); }, function () { X.toast(w('micNo')); });
      }
    };
  }
  function clickBreathe(b) {
    var c = CFG().bb, ds = b.dataset, lc = ds.lc;
    if (ds.act === 'download') { openDl('breathe'); return true; }
    if (lc === 'bstyle') { c.style = ds.v; if (c.style !== 'flower') c.mic = false; keep(); return true; }
    if (ds.seg === 'lcpace') { c.pace = ds.v; var v = { little: 3, kids: 4, calm: 5 }[ds.v]; c.inS = c.outS = c.hold = v; keep(); return true; }
    if (lc === 'bstep') { c[ds.k] = clampN(c[ds.k] + Number(ds.d), 2, 8); c.pace = 'custom'; keep(); return true; }
    if (lc === 'bn') { c.n = clampN(c.n + Number(ds.d), 3, 10); keep(); return true; }
    if (ds.tog) {
      var on = b.getAttribute('aria-checked') !== 'true';
      if (ds.tog === 'mic') {
        if (c.style !== 'flower') return true;
        if (on) { askMic(function () { c.mic = true; keep(); }); return true; }
      }
      c[ds.tog] = on; keep(); return true;
    }
    if (lc === 'bstart') { if (PREV) PREV.stop(); runBreathe(); return true; }
    if (ds.seg) return true;
    return false;
  }

  /* ===================== Feelings ===================== */
  function levelsFor(n) { return wd(W['lv' + n] || W.lv4); }
  var LV_COL = { 3: ['#9FD9B0', '#FFD36B', '#F0694F'], 4: ['#9FD9B0', '#FFD36B', '#F7A08C', '#F0694F'], 5: ['#C3E8CF', '#9FD9B0', '#FFD36B', '#F7A08C', '#F0694F'] };
  function feelTile(k, opts) {
    opts = opts || {};
    return '<button type="button" class="lc-feel' + (opts.on ? ' on' : '') + (opts.cls ? ' ' + opts.cls : '') + '" data-' + (opts.attr || 'feel') + '="' + k + '"><span class="lc-feelart">' + feelFace(k, kid()) + '</span><b>' + esc(feelName(k)) + '</b>' + (opts.check ? '<i class="lc-check">✓</i>' : '') + '</button>';
  }
  function sensTile(k, opts) {
    opts = opts || {};
    return '<button type="button" class="lc-feel sens' + (opts.on ? ' on' : '') + '" data-' + (opts.attr || 'sens') + '="' + k + '"><span class="lc-feelart">' + sensArt(k) + '</span><b>' + esc(sensName(k)) + '</b>' + (opts.check ? '<i class="lc-check">✓</i>' : '') + '</button>';
  }
  function thermo(n, sel, interactive) {
    var cols = LV_COL[n], names = levelsFor(n), h = '<div class="lc-thermo n' + n + '"><div class="lc-tube">';
    for (var i = n - 1; i >= 0; i--) {
      h += '<button type="button" class="lc-seg' + (sel != null && i <= sel ? ' fill' : '') + (i === sel ? ' sel' : '') + '"' + (interactive ? ' data-lv="' + i + '"' : ' tabindex="-1"') + ' style="--c:' + cols[i] + '"><span></span></button>';
    }
    h += '</div><span class="lc-bulb" style="background:' + (sel != null ? cols[sel] : '#fff') + '"></span><div class="lc-lvnames">';
    for (var j = n - 1; j >= 0; j--) h += '<button type="button" class="lc-lvname' + (j === sel ? ' sel' : '') + '"' + (interactive ? ' data-lv="' + j + '"' : ' tabindex="-1"') + '><b>' + esc(names[j]) + '</b></button>';
    return h + '</div></div>';
  }
  function pageFeelings() {
    var c = CFG().fe, p = X.prof();
    var modes = [['check', 'mCheck', 'mCheckD', feelIcon()], ['body', 'mBody', 'mBodyD', bodyIcon(kid())], ['menu', 'mMenu', 'mMenuD', menuIcon()]];
    var h = '<div class="tl-page narrow lc-setup">' + X.topbar(w('feTitle'), X.tr('parentSetup'), { dl: true }) +
      '<div class="tl-lab2">' + esc(w('whatUse')) + '</div><div class="lc-modes">' + modes.map(function (m) {
        return '<button type="button" class="tl-opt lc-mode' + (c.mode === m[0] ? ' on' : '') + '" data-lc="fmode" data-v="' + m[0] + '"><span class="tl-optvis">' + m[3] + '</span><b>' + esc(w(m[1])) + '</b><small>' + esc(w(m[2])) + '</small></button>';
      }).join('') + '</div>';
    if (c.mode === 'check') {
      h += '<div class="tl-lab2">' + esc(w('steps')) + '</div>' + X.seg('lcsteps', [['both', esc(w('sBoth'))], ['face', esc(w('sFace'))], ['size', esc(w('sSize'))]], c.steps) +
        (c.steps === 'size' ? '<p class="lc-hint">' + esc(w('sizeOnlyD')) + '</p>' : '');
      if (c.steps !== 'size') h += '<div class="tl-lab2 between"><span>' + esc(w('feelShow')) + '</span><small>' + esc(w('upTo6', c.show.length)) + '</small></div><div class="lc-feelgrid setup">' +
        FEEL_ORDER.map(function (k) { return feelTile(k, { on: c.show.indexOf(k) >= 0, attr: 'fshow', check: true }); }).join('') + '</div>';
      if (c.steps !== 'face') h += '<div class="tl-lab2">' + esc(w('levels')) + '</div>' + X.seg('lclevels', [['3', '3'], ['4', '4'], ['5', '5']], String(c.levels)) +
        '<div class="lc-lvbar">' + LV_COL[c.levels].map(function (col, i) { return '<span style="background:' + col + '"><small>' + esc(levelsFor(c.levels)[i]) + '</small></span>'; }).join('') + '</div>';
      h += '<div class="tl-panel">' + X.row(esc(w('askHelp')), esc(w('askHelpD')), X.toggle('help', c.help)) + X.row(esc(w('sayQ')), esc(w('sayQD')), X.toggle('sayQ', c.sayQ)) + '</div>';
    } else if (c.mode === 'body') {
      h += '<div class="tl-panel">' + X.row(esc(w('askSens')), esc(w('askSensD')), X.toggle('sens', c.sens)) + X.row(esc(w('sayParts')), '', X.toggle('sayParts', c.sayParts)) +
        X.row(esc(w('askHelp')), esc(w('askHelpD')), X.toggle('bodyHelp', c.bodyHelp)) + '</div>';
      if (c.sens) h += '<div class="tl-lab2 between"><span>' + esc(w('sensCards')) + '</span><small>' + esc(w('upTo6', c.sensShow.length)) + '</small></div><div class="lc-feelgrid setup">' +
        SENS_ORDER.map(function (k) { return sensTile(k, { on: c.sensShow.indexOf(k) >= 0, attr: 'fsens', check: true }); }).join('') + '</div>';
      h += '<div class="tl-lab2">' + esc(w('glowCol')) + '</div><div class="lc-swatches">' + ['#F0694F', '#FFC94A', '#B9A3E3', '#7DB3E8'].map(function (col) {
        return '<button type="button" class="lc-swatch' + (c.glow === col ? ' on' : '') + '" data-lc="fglow" data-v="' + col + '" style="background:' + col + '" aria-label="' + col + '"></button>';
      }).join('') + '</div>';
    }
    // calm-down menu: its own mode, or the "What can help" cards for the other two
    var showMenu = c.mode === 'menu' || (c.mode === 'check' && c.help) || (c.mode === 'body' && c.bodyHelp);
    if (showMenu) {
      var items = menuItems();
      h += '<div class="tl-lab2 between"><span>' + esc(c.mode === 'menu' ? (p ? w('calmI') : w('menuH')) : w('whatHelp')) + '</span><small>' + esc(w('menuSub', items.length)) + '</small></div><div class="tl-panel lc-menulist">' +
        items.map(function (m, i) {
          return '<div class="tl-row lc-mrow">' + card(m.ref, { size: 'xs', labels: 'none' }) + '<div><b>' + esc(X.cardLabel(m.ref)) + '</b><button type="button" class="lc-actchip' + (m.act !== 'none' ? ' on' : '') + '" data-lc="mact" data-i="' + i + '">' + esc(actLabel(m.act)) + ' ▾</button></div>' +
            (i ? '<button type="button" class="tl-iconbtn round" data-lc="mup" data-i="' + i + '" aria-label="' + esc(w('moveUp')) + '">↑</button>' : '') +
            '<button type="button" class="tl-iconbtn round" data-lc="mdel" data-i="' + i + '" aria-label="' + esc(w('removeCard')) + '">✕</button></div>';
        }).join('') + (items.length < 6 ? '<button type="button" class="tl-row act lc-addrow" data-lc="madd"><div><b>' + esc(w('addHelp')) + '</b></div></button>' : '') + '</div>';
      if (c.mode === 'menu') {
        h += '<div class="tl-lab2">' + esc(w('comeBack')) + '</div><div class="tl-panel">' + X.row(esc(w('showNext')), esc(w('showNextD')), X.toggle('back', c.back)) +
          (c.back ? '<div class="tl-row lc-mrow">' + (c.backRef && X.cardInfo(c.backRef) ? card(c.backRef, { size: 'xs', labels: 'none' }) : '<span class="tl-card tl-xs tl-addcard"><span>+</span></span>') +
            '<div><small>' + esc(X.tr('then')) + '</small><b>' + esc(c.backRef ? X.cardLabel(c.backRef) : w('chooseNext')) + '</b></div><button type="button" class="tl-link" data-lc="mback">' + esc(X.tr('change')) + '</button></div>' : '') + '</div>' +
          '<div class="tl-tip">' + heartSVG(22) + '<span>' + w('menuTip') + '</span></div>';
      }
    }

    h += '<div class="tl-foot"><button type="button" class="tl-btn primary lg block" data-lc="fstart">' + esc(w(c.mode === 'check' ? 'startCheck' : c.mode === 'body' ? 'startBody' : 'startMenu')) + '</button><small>' + esc(w('stayAwake')) + '</small></div></div>';
    return h;
  }
  function chooseAct(i) {
    var c = CFG().fe, m = c.menu[i]; if (!m) return;
    var opts = [['none', w('actNone')], ['breathe', w('actBreathe')]].concat([1, 2, 3, 5, 10].map(function (n) { return ['t' + n, w('actTimer', n)]; }));
    var sh = X.sheet('<h2 class="tl-h2">' + esc(w('whenChosen')) + '</h2><p class="tl-p">' + esc(X.cardLabel(m.ref)) + '</p><div class="lc-actlist">' + opts.map(function (o) {
      return '<button type="button" class="lc-actopt' + (m.act === o[0] ? ' on' : '') + '" data-v="' + o[0] + '">' + esc(o[1]) + '</button>';
    }).join('') + '</div>');
    sh.el.onclick = function (e) { var b = e.target.closest('[data-v]'); if (!b) return; m.act = b.dataset.v; sh.close(); keep(); };
  }
  function clickFeelings(b) {
    var c = CFG().fe, ds = b.dataset, lc = ds.lc;
    if (ds.act === 'download') { openDl('feelings'); return true; }
    if (lc === 'fmode') { c.mode = ds.v; keep(); return true; }
    if (ds.seg === 'lcsteps') { c.steps = ds.v; keep(); return true; }
    if (ds.seg === 'lclevels') { c.levels = Number(ds.v); keep(); return true; }
    if (ds.fshow) {
      var i = c.show.indexOf(ds.fshow);
      if (i >= 0) { if (c.show.length > 1) c.show.splice(i, 1); }
      else if (c.show.length < 6) c.show.push(ds.fshow); else X.toast(w('upTo6', 6));
      c.show = FEEL_ORDER.filter(function (k) { return c.show.indexOf(k) >= 0; });
      keep(); return true;
    }
    if (ds.fsens) {
      var j = c.sensShow.indexOf(ds.fsens);
      if (j >= 0) { if (c.sensShow.length > 1) c.sensShow.splice(j, 1); }
      else if (c.sensShow.length < 6) c.sensShow.push(ds.fsens); else X.toast(w('upTo6', 6));
      c.sensShow = SENS_ORDER.filter(function (k) { return c.sensShow.indexOf(k) >= 0; });
      keep(); return true;
    }
    if (lc === 'fglow') { c.glow = ds.v; keep(); return true; }
    if (ds.tog) { c[ds.tog] = b.getAttribute('aria-checked') !== 'true'; if (ds.tog === 'back' && c.back && !c.backRef) { keep(); X.openPicker({ title: w('chooseNext'), onPick: function (r) { c.backRef = r; keep(); } }); return true; } keep(); return true; }
    var items = c.menu;
    if (lc === 'mact') { c.menu = menuItems(); chooseAct(Number(ds.i)); return true; }
    if (lc === 'mdel') { c.menu = menuItems(); c.menu.splice(Number(ds.i), 1); keep(); return true; }
    if (lc === 'mup') { c.menu = menuItems(); var k = Number(ds.i), t = c.menu[k]; c.menu[k] = c.menu[k - 1]; c.menu[k - 1] = t; keep(); return true; }
    if (lc === 'madd') {
      X.openPicker({ title: w('addHelp').replace(/^\+\s*/, ''), onPick: function (r) { c.menu = menuItems(); if (c.menu.length < 6 && !c.menu.some(function (m) { return m.ref === r; })) c.menu.push({ ref: r, act: r === 'tarik-napas' ? 'breathe' : 'none' }); keep(); } });
      return true;
    }
    if (lc === 'mback') { X.openPicker({ title: w('chooseNext'), current: c.backRef, onPick: function (r) { c.backRef = r; keep(); } }); return true; }
    if (lc === 'fstart') {
      X.setLast('feelings');
      if (c.mode === 'check') runCheck(); else if (c.mode === 'body') runBody(); else runMenu();
      return true;
    }
    if (ds.seg) return true;
    void items;
    return false;
  }

  /* ---------- small child-mode helpers ---------- */
  function head(q, sub, opts) {
    opts = opts || {};
    return '<div class="lc-qhead">' + (opts.spk ? '<button type="button" class="lc-spk" data-spk aria-label="Say it again">' + SPK + '</button>' : '') + '<div><h2 class="lc-bigq">' + esc(q) + '</h2>' + (sub ? '<p class="lc-qsub">' + sub + '</p>' : '') + '</div></div>';
  }
  var SPK = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4z" fill="currentColor"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/></svg>';
  function chip(art, text) { return '<span class="lc-chip">' + (art ? '<i>' + art + '</i>' : '') + esc(text) + '</span>'; }
  function shell(el, cls, inner) {
    el.innerHTML = '<div class="tl-cwrap lc-child ' + cls + '">' + X.exitPill() + inner + '</div>';
    X.wireExit(el);
    var root = el.firstChild;
    root.classList.add('lc-in');
    return root;
  }

  /* ---------- Feelings check-in: child ---------- */
  function runCheck(state) {
    var c = CFG().fe, st = state || { step: c.steps === 'size' ? 'size' : 'face', feel: null, lv: null, help: null };
    X.childOpen(function (el) {
      function go(step) { st.step = step; render(); }
      function after() { if (c.help && menuItems().length) go('help'); else go('end'); }
      function render() {
        X.childClear();
        var r;
        if (st.step === 'face') {
          r = shell(el, 'lc-fe lc-checkin', head(w('howFeel'), '', { spk: true }) + '<div class="lc-feelgrid n' + c.show.length + '">' + c.show.map(function (k) { return feelTile(k, { on: st.feel === k }); }).join('') + '</div>');
          if (c.sayQ) speak(w('howFeel'));
          r.onclick = function (e) {
            if (e.target.closest('[data-spk]')) return speak(w('howFeel'));
            var b = e.target.closest('[data-feel]'); if (!b || st.lock) return;
            st.feel = b.dataset.feel; st.lock = true;
            r.querySelectorAll('[data-feel]').forEach(function (x) { x.classList.toggle('on', x === b); x.classList.toggle('dim', x !== b); });
            X.chime('pop'); if (c.sayQ) speak(feelName(st.feel));
            later(function () { st.lock = false; if (c.steps === 'face') after(); else go('size'); }, 1100);
          };
        } else if (st.step === 'size') {
          var q = st.feel ? w('howBig') : w('howBigSolo');
          r = shell(el, 'lc-fe lc-size', (st.feel ? chip(feelFace(st.feel, kid()), feelName(st.feel)) : '') + head(q, '', { spk: true }) +
            '<div class="lc-thermowrap">' + thermo(c.levels, st.lv, true) + '</div>' +
            '<div class="lc-endbtns one"><button type="button" class="lc-bigbtn yellow" data-next' + (st.lv == null ? ' hidden' : '') + '>' + esc(w('next')) + ' →</button></div>');
          if (c.sayQ) speak(q);
          r.onclick = function (e) {
            if (e.target.closest('[data-spk]')) return speak(q);
            var b = e.target.closest('[data-lv]');
            if (b) { st.lv = Number(b.dataset.lv); X.chime('pop'); if (c.sayQ) speak(levelsFor(c.levels)[st.lv]); render(); return; }
            if (e.target.closest('[data-next]')) after();
          };
        } else if (st.step === 'help') {
          var items = menuItems();
          r = shell(el, 'lc-fe lc-help', summaryChip() + head(w('whatHelp'), '', { spk: true }) + '<div class="lc-cardgrid n' + items.length + '">' + items.map(function (m, i) { return '<button type="button" class="lc-cardbtn" data-hi="' + i + '">' + card(m.ref, { size: 'l' }) + (m.act !== 'none' ? '<span class="lc-actdot">' + (m.act === 'breathe' ? '🎈' : '⏱') + '</span>' : '') + '</button>'; }).join('') + '</div>');
          if (c.sayQ) speak(w('whatHelp'));
          r.onclick = function (e) {
            if (e.target.closest('[data-spk]')) return speak(w('whatHelp'));
            var b = e.target.closest('[data-hi]'); if (!b) return;
            st.help = menuItems()[Number(b.dataset.hi)]; X.chime('pop'); if (c.sayQ) speak(X.cardLabel(st.help.ref)); go('end');
          };
        } else {
          var m = st.help, mm = m ? actMin(m.act) : 0;
          r = shell(el, 'lc-fe lc-end', '<div class="lc-endin">' + head(w('thanksTell')) + summaryChip() +
            (m ? '<div class="lc-chosen">' + card(m.ref, { size: 'l', state: 'selected' }) + '</div>' : '<span class="lc-heartbig">' + heartSVG(70, '#E9E1F7') + '</span>') + '</div>' +
            '<div class="lc-endbtns col">' + (m && m.act === 'breathe' ? '<button type="button" class="lc-bigbtn yellow" data-breathe>▶ ' + esc(w('letsBreathe')) + '</button>' : '') +
            (mm ? '<button type="button" class="lc-bigbtn yellow" data-timer>⏱ ' + esc(w('startTimerN', mm)) + '</button>' : '') +
            '<div class="lc-endbtns"><button type="button" class="lc-bigbtn" data-again>↻ ' + esc(w('again')) + '</button><button type="button" class="lc-bigbtn' + (m && m.act !== 'none' ? '' : ' yellow') + '" data-done>✓ ' + esc(w('done')) + '</button></div></div>');
          if (c.sayQ) speak(w('thanksTell'));
          r.onclick = function (e) {
            if (e.target.closest('[data-again]')) { st = { step: c.steps === 'size' ? 'size' : 'face', feel: null, lv: null, help: null }; render(); return; }
            if (e.target.closest('[data-done]')) return X.childClose();
            if (e.target.closest('[data-breathe]')) return runBreathe({ fromOther: true, onDone: function () { runCheck(st); } });
            if (e.target.closest('[data-timer]')) return X.runTimer(Object.assign({}, X.D().timer, { minutes: mm, seconds: 0, next: null }), { next: null, backLabel: w('back'), onBack: function () { runCheck(st); }, onExit: function () { X.rerender(); } });
          };
        }
      }
      function summaryChip() {
        if (!st.feel && st.lv == null) return '';
        var t = (st.feel ? feelName(st.feel) : '') + (st.feel && st.lv != null ? ' · ' : '') + (st.lv != null ? levelsFor(c.levels)[st.lv] : '');
        return chip(st.feel ? feelFace(st.feel, kid()) : '<span class="lc-chipdot" style="background:' + LV_COL[c.levels][st.lv] + '"></span>', t);
      }
      render();
    }, function () { X.rerender(); });
  }

  /* ---------- Body map: child ---------- */
  function runBody(state) {
    var c = CFG().fe, st = state || { step: 'where', on: [], sens: [] };
    X.childOpen(function (el) {
      function go(step) { st.step = step; render(); }
      function placeList() {
        var names = st.on.map(zoneName).map(function (s) { return s.toLowerCase(); });
        return names.length > 1 ? names.slice(0, -1).join(', ') + ' ' + w('and') + ' ' + names[names.length - 1] : names[0] || '';
      }
      function render() {
        X.childClear();
        var r;
        if (st.step === 'where') {
          r = shell(el, 'lc-fe lc-bodyc', head(w('whereFeel'), '', { spk: true }) +
            '<div class="lc-bodywrap" style="--glow:' + c.glow + '">' + bodySVG(kid(), { hit: true, on: st.on, glow: c.glow }) + '<div class="lc-zlabels"></div></div>' +
            '<div class="lc-endbtns"><button type="button" class="lc-bigbtn" data-clear' + (st.on.length ? '' : ' disabled') + '>' + esc(w('clear')) + '</button><button type="button" class="lc-bigbtn yellow" data-next' + (st.on.length ? '' : ' disabled') + '>' + esc(w('next')) + ' →</button></div>');
          if (c.sayQ !== false && c.sayParts) speak(w('whereFeel'));
          labels(r);
          r.onclick = function (e) {
            if (e.target.closest('[data-spk]')) return speak(w('whereFeel'));
            var z = e.target.closest('[data-zone]');
            if (z) {
              var k = z.getAttribute('data-zone'), i = st.on.indexOf(k);
              if (i >= 0) st.on.splice(i, 1); else { st.on.push(k); if (c.sayParts) speak(zoneName(k)); X.chime('pop'); }
              r.querySelectorAll('.lc-glow').forEach(function (g) { g.classList.toggle('on', st.on.indexOf(g.getAttribute('data-z')) >= 0); });
              r.querySelector('[data-clear]').disabled = r.querySelector('[data-next]').disabled = !st.on.length;
              labels(r);
              return;
            }
            if (e.target.closest('[data-clear]')) { st.on = []; render(); return; }
            if (e.target.closest('[data-next]')) go(c.sens ? 'like' : 'end');
          };
        } else if (st.step === 'like') {
          r = shell(el, 'lc-fe lc-like', head(w('feelLike'), '', { spk: true }) + '<div class="lc-feelgrid n' + c.sensShow.length + '">' + c.sensShow.map(function (k) { return sensTile(k, { on: st.sens.indexOf(k) >= 0, check: true }); }).join('') + '</div>' +
            '<div class="lc-endbtns one"><button type="button" class="lc-bigbtn yellow" data-next>' + esc(w('next')) + ' →</button></div>');
          if (c.sayParts) speak(w('feelLike'));
          r.onclick = function (e) {
            if (e.target.closest('[data-spk]')) return speak(w('feelLike'));
            var b = e.target.closest('[data-sens]');
            if (b) { var k = b.dataset.sens, i = st.sens.indexOf(k); if (i >= 0) st.sens.splice(i, 1); else { st.sens.push(k); if (c.sayParts) speak(sensName(k)); X.chime('pop'); } b.classList.toggle('on', st.sens.indexOf(k) >= 0); return; }
            if (e.target.closest('[data-next]')) go('end');
          };
        } else {
          r = shell(el, 'lc-fe lc-end lc-bodyend', '<div class="lc-endin">' + head(w('thanksShow')) +
            '<div class="lc-bodysum"><div class="lc-bodymini">' + bodySVG(kid(), { on: st.on, glow: c.glow }) + '</div><div class="lc-sumlist">' +
            st.sens.map(function (k) { return chip(sensArt(k), sensName(k)); }).join('') + (st.on.length ? '<p>' + esc(w('inMy', placeList())) + '</p>' : '') + '</div></div></div>' +
            '<div class="lc-endbtns col">' + (c.bodyHelp && menuItems().length ? '<button type="button" class="lc-bigbtn yellow" data-help>' + esc(w('whatHelp')) + '</button>' : '') +
            '<div class="lc-endbtns"><button type="button" class="lc-bigbtn" data-again>↻ ' + esc(w('again')) + '</button><button type="button" class="lc-bigbtn' + (c.bodyHelp ? '' : ' yellow') + '" data-done>✓ ' + esc(w('done')) + '</button></div></div>');
          if (c.sayParts) speak(w('thanksShow'));
          r.onclick = function (e) {
            if (e.target.closest('[data-again]')) { st = { step: 'where', on: [], sens: [] }; render(); return; }
            if (e.target.closest('[data-done]')) return X.childClose();
            if (e.target.closest('[data-help]')) return runMenu({ fromOther: true });
          };
        }
      }
      function labels(r) {
        var box = r.querySelector('.lc-zlabels'); if (!box) return;
        box.innerHTML = st.on.map(function (k) { var p = ZONES[k].pts[ZONES[k].pts.length > 1 ? 1 : 0]; return '<span style="left:' + (p[0] / 240 * 100).toFixed(1) + '%;top:' + (p[1] / 400 * 100).toFixed(1) + '%">' + esc(zoneName(k)) + '</span>'; }).join('');
      }
      render();
    }, function () { X.rerender(); });
  }

  /* ---------- Calm-down menu: child ---------- */
  function runMenu(opts) {
    opts = opts || {};
    var c = CFG().fe, st = { step: 'menu', item: null, endAt: 0 };
    X.childOpen(function (el) {
      function render() {
        X.childClear();
        var items = menuItems(), r;
        if (st.step === 'menu') {
          r = shell(el, 'lc-fe lc-menu', head(w('calmI'), '', { spk: true }) + (items.length ? '<div class="lc-cardgrid n' + items.length + '">' + items.map(function (m, i) { return '<button type="button" class="lc-cardbtn" data-mi="' + i + '">' + card(m.ref, { size: 'l' }) + '</button>'; }).join('') + '</div>' : '<p class="lc-qsub">' + esc(w('emptyMenu')) + '</p>'));
          if (c.sayQ) speak(w('calmI'));
          r.onclick = function (e) {
            if (e.target.closest('[data-spk]')) return speak(w('calmI'));
            var b = e.target.closest('[data-mi]'); if (!b) return;
            st.item = items[Number(b.dataset.mi)]; X.chime('pop'); speak(X.cardLabel(st.item.ref));
            if (st.item.act === 'breathe') return runBreathe({ fromOther: true, onDone: function () { runMenuChosen(); } });
            st.step = 'chosen'; st.endAt = actMin(st.item.act) ? Date.now() + actMin(st.item.act) * 60000 : 0;
            if (!reduced()) { b.classList.add('pick'); r.classList.add('picking'); later(render, 420); } else render();
          };
        } else if (st.step === 'chosen') {
          var mm = actMin(st.item.act);
          r = shell(el, 'lc-fe lc-menu lc-chosenv', '<div class="lc-endin"><div class="lc-chosen big">' + card(st.item.ref, { size: 'l', state: 'selected' }) + '</div>' +
            (mm ? '<div class="lc-mtimer"><span class="lc-mtv">' + X.timerSVG('circle', 1) + '</span><div><b class="lc-mtt"></b><small>' + esc(w('minLeft')) + '</small></div></div>' : '') + '</div>' +
            '<div class="lc-endbtns"><button type="button" class="lc-bigbtn" data-another>' + esc(w('chooseAnother')) + '</button><button type="button" class="lc-bigbtn yellow" data-calm>' + esc(w('feelCalm')) + '</button></div>');
          if (mm) {
            var tv = r.querySelector('.lc-mtv'), tt = r.querySelector('.lc-mtt'), total = mm * 60000;
            var tick = function () {
              var left = st.endAt - Date.now();
              if (left <= 0) { X.childClear(); X.timerSet(tv.firstChild, 'circle', 0); tt.textContent = '0:00'; X.chime('done'); r.querySelector('[data-calm]').classList.add('pulse'); return; }
              X.timerSet(tv.firstChild, 'circle', left / total); tt.textContent = X.fmt(left);
            };
            tick(); X.addTimer(setInterval(tick, reduced() ? 10000 : 250));
          }
          r.onclick = function (e) {
            if (e.target.closest('[data-another]')) { st.step = 'menu'; render(); return; }
            if (e.target.closest('[data-calm]')) { st.step = 'end'; render(); }
          };
        } else {
          var back = c.back && c.backRef && X.cardInfo(c.backRef);
          X.chime('done');
          r = shell(el, 'lc-fe lc-end lc-menuend', '<div class="lc-endin">' + head(w('wellDone')) +
            (back ? '<div class="lc-ftend"><div class="lc-ftbox done"><small>' + esc(X.tr('first')) + '</small>' + card(st.item.ref, { size: 's', labels: 'none' }) + '<b>' + esc(X.cardLabel(st.item.ref)) + '</b><i class="lc-tick">✓</i></div>' +
              '<div class="lc-ftbox then"><small>' + esc(X.tr('then')) + '</small>' + card(c.backRef, { size: 'l' }) + '</div></div>' : '<span class="lc-heartbig">' + heartSVG(70, '#DDF2E4') + '</span>') + '</div>' +
            '<div class="lc-endbtns one">' + (back ? '<button type="button" class="lc-bigbtn yellow" data-ready>' + esc(w('ready')) + '</button>' : '<button type="button" class="lc-bigbtn yellow" data-done>✓ ' + esc(w('done')) + '</button>') + '</div>');
          speak(w('wellDone') + (back ? '. ' + X.tr('then') + ': ' + X.cardLabel(c.backRef) : ''));
          r.onclick = function (e) { if (e.target.closest('[data-ready],[data-done]')) X.childClose(); };
        }
      }
      render();
    }, function () { X.rerender(); });
    function runMenuChosen() {
      // after breathing from the menu, come back to "I feel calm"
      X.childOpen(function (el) { el.innerHTML = ''; }, function () { X.rerender(); });
      var el = X.childEl();
      st.step = 'chosen'; st.endAt = 0;
      var r = shell(el, 'lc-fe lc-menu lc-chosenv', '<div class="lc-endin"><div class="lc-chosen big">' + card(st.item.ref, { size: 'l', state: 'selected' }) + '</div></div>' +
        '<div class="lc-endbtns"><button type="button" class="lc-bigbtn" data-another>' + esc(w('chooseAnother')) + '</button><button type="button" class="lc-bigbtn yellow" data-calm>' + esc(w('feelCalm')) + '</button></div>');
      r.onclick = function (e) {
        if (e.target.closest('[data-another]')) return runMenu(opts);
        if (e.target.closest('[data-calm]')) {
          var back = c.back && c.backRef && X.cardInfo(c.backRef);
          X.chime('done');
          var r2 = shell(el, 'lc-fe lc-end lc-menuend', '<div class="lc-endin">' + head(w('wellDone')) +
            (back ? '<div class="lc-ftend"><div class="lc-ftbox done"><small>' + esc(X.tr('first')) + '</small>' + card(st.item.ref, { size: 's', labels: 'none' }) + '<b>' + esc(X.cardLabel(st.item.ref)) + '</b><i class="lc-tick">✓</i></div><div class="lc-ftbox then"><small>' + esc(X.tr('then')) + '</small>' + card(c.backRef, { size: 'l' }) + '</div></div>' : '<span class="lc-heartbig">' + heartSVG(70, '#DDF2E4') + '</span>') + '</div>' +
            '<div class="lc-endbtns one"><button type="button" class="lc-bigbtn yellow" data-done>' + esc(back ? w('ready') : '✓ ' + w('done')) + '</button></div>');
          speak(w('wellDone'));
          r2.onclick = function (ev) { if (ev.target.closest('[data-done]')) X.childClose(); };
        }
      };
    }
  }

  /* ===================== Worry jar ===================== */
  var NOTE_COLS = ['#FFE29A', '#BFDCF6', '#FBD5DE', '#C3E8CF', '#DCCFF3'];
  function relDay(t) {
    var d0 = new Date(); d0.setHours(0, 0, 0, 0);
    var days = Math.round((d0 - new Date(new Date(t).setHours(0, 0, 0, 0))) / 86400000);
    return days <= 0 ? w('today') : days === 1 ? w('yesterday') : w('daysAgo', days);
  }
  function worryNote(it, big) {
    var col = NOTE_COLS[(it.c || 0) % NOTE_COLS.length];
    var inner = it.kind === 'draw' ? (X.PH[it.img] ? '<img src="' + X.PH[it.img] + '" alt="">' : '') : '<p>' + esc(it.text || '') + '</p>';
    return '<div class="lc-note' + (big ? ' big' : '') + (it.kind === 'draw' ? ' pic' : '') + '" style="--nc:' + col + '">' + inner + '</div>';
  }
  function pageWorry() {
    var c = CFG().wj, n = c.items.length, name = X.profName(), now = Date.now();
    var timeLine = c.at ? (c.at > now ? w('worryIn', Math.max(1, Math.ceil((c.at - now) / 60000))) : w('worryNow')) : (n ? w('addedWhen', relDay(c.items[n - 1].at)) : '');
    var h = '<div class="tl-page narrow lc-setup">' + X.topbar(w('wjTitle'), X.tr('parentSetup'), { dl: true }) +
      '<div class="lc-jarcard' + (c.at && c.at <= now ? ' due' : '') + '"><span class="lc-jarmini">' + jarSVG({ n: n, face: true }) + '</span><div><b>' + esc(w('inJar', n)) + '</b><small>' + esc(timeLine) + '</small>' +
      (n ? '<button type="button" class="tl-btn outline sm" data-lc="wnow">' + esc(w('lookTogether')) + '</button>' : '') + '</div></div>' +
      '<div class="tl-lab2">' + esc(w('howAdd', name)) + '</div><div class="lc-addways">' +
      '<button type="button" class="tl-opt' + (c.draw ? ' on' : '') + '" data-lc="wway" data-v="draw"><span class="lc-wico">✎</span><b>' + esc(w('draw')) + '</b></button>' +
      '<button type="button" class="tl-opt' + (c.type ? ' on' : '') + '" data-lc="wway" data-v="type"><span class="lc-wico">Aa</span><b>' + esc(w('type')) + '</b></button>' +
      '<button type="button" class="tl-opt lc-off" disabled><span class="lc-wico">🎙</span><b>' + esc(w('voice')) + '</b><em class="lc-soon">' + esc(w('soon')) + '</em></button></div>' +
      '<div class="tl-lab2">' + esc(w('worryLater')) + '</div><div class="tl-panel">' + X.row(esc(w('openLater')), esc(w('openLaterD')), X.toggle('later', c.later)) +
      (c.later ? '<div class="tl-row"><div class="tl-chips wrap">' + [10, 20, 30, 60].map(function (m) { return '<button type="button" class="tl-chip' + (c.laterMin === m ? ' on' : '') + '" data-lc="wmin" data-v="' + m + '">' + m + ' ' + esc(w('min')) + '</button>'; }).join('') + '</div></div>' : '') + '</div>' +
      '<div class="tl-tip mint">' + heartSVG(22) + '<span>' + w('keptHere', esc(name)) + '</span></div>' +
      '<div class="tl-foot"><button type="button" class="tl-btn primary lg block" data-lc="wstart">' + esc(X.tr('startChild')) + '</button>' + (n ? '<button type="button" class="tl-btn outline lg block" data-lc="wnow">' + esc(w('openWorryNow')) + '</button>' : '') + '<small>' + esc(w('stayAwake')) + '</small></div></div>';
    if (c.at && c.at > now) later(function () { if (X.route() === 'tools/worry') X.rerender(); }, Math.min(60000, c.at - now + 500));
    return h;
  }
  function clickWorry(b) {
    var c = CFG().wj, ds = b.dataset, lc = ds.lc;
    if (ds.act === 'download') { openDl('worry'); return true; }
    if (lc === 'wway') { var k = ds.v; if (c[k] && !(k === 'draw' ? c.type : c.draw)) return true; c[k] = !c[k]; keep(); return true; }
    if (ds.tog === 'later') { c.later = b.getAttribute('aria-checked') !== 'true'; if (!c.later) c.at = null; keep(); return true; }
    if (lc === 'wmin') { c.laterMin = Number(ds.v); keep(); return true; }
    if (lc === 'wstart') { X.setLast('worry'); runWorry(); return true; }
    if (lc === 'wnow') { runWorryTime(); return true; }
    if (ds.seg || ds.tog) return true;
    return false;
  }

  /* ---------- drawing pad ---------- */
  var PEN = ['#2B2A35', '#F0694F', '#7DB3E8', '#7FCB98', '#FFC94A'];
  function pad(box) {
    var cv = document.createElement('canvas'), cx = cv.getContext('2d'), strokes = [], cur = null, col = PEN[0], erase = false, dpr = Math.min(2, window.devicePixelRatio || 1);
    box.appendChild(cv);
    function size() { var r = box.getBoundingClientRect(); cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr); cv.style.width = r.width + 'px'; cv.style.height = r.height + 'px'; paint(); }
    function paint() {
      cx.setTransform(1, 0, 0, 1, 0, 0); cx.fillStyle = '#fff'; cx.fillRect(0, 0, cv.width, cv.height);
      cx.setTransform(dpr, 0, 0, dpr, 0, 0); cx.lineCap = cx.lineJoin = 'round';
      strokes.forEach(function (s) {
        cx.strokeStyle = s.e ? '#fff' : s.c; cx.lineWidth = s.e ? 28 : 7; cx.beginPath();
        s.p.forEach(function (q, i) { if (i) cx.lineTo(q[0] * cv.width / dpr, q[1] * cv.height / dpr); else cx.moveTo(q[0] * cv.width / dpr, q[1] * cv.height / dpr); });
        if (s.p.length === 1) cx.lineTo(s.p[0][0] * cv.width / dpr + 0.1, s.p[0][1] * cv.height / dpr);
        cx.stroke();
      });
    }
    function pt(e) { var r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height]; }
    cv.addEventListener('pointerdown', function (e) { e.preventDefault(); try { cv.setPointerCapture(e.pointerId); } catch (er) {} cur = { c: col, e: erase, p: [pt(e)] }; strokes.push(cur); paint(); api.onchange && api.onchange(); });
    cv.addEventListener('pointermove', function (e) { if (!cur) return; cur.p.push(pt(e)); paint(); });
    ['pointerup', 'pointercancel'].forEach(function (ev) { cv.addEventListener(ev, function () { cur = null; }); });
    window.addEventListener('resize', size);
    var api = {
      setColor: function (c2) { col = c2; erase = false; }, setErase: function () { erase = true; },
      undo: function () { strokes.pop(); paint(); api.onchange && api.onchange(); }, empty: function () { return !strokes.some(function (s) { return !s.e; }); },
      image: function () {
        var out = document.createElement('canvas'), sc = Math.min(1, 560 / cv.width); out.width = Math.round(cv.width * sc); out.height = Math.round(cv.height * sc);
        out.getContext('2d').drawImage(cv, 0, 0, out.width, out.height);
        return out.toDataURL('image/jpeg', 0.85);
      }
    };
    requestAnimationFrame(size);
    return api;
  }

  /* ---------- Worry jar: child ---------- */
  function runWorry() {
    var c = CFG().wj;
    X.childOpen(function (el) {
      function ask() {
        X.childClear();
        if (c.draw && !c.type) return drawScreen();
        if (c.type && !c.draw) return writeScreen();
        var r = shell(el, 'lc-wj', head(w('somethingWorry'), '', { spk: true }) + '<div class="lc-jarbig">' + jarSVG({ n: Math.min(c.items.length, 6) }) + '</div>' +
          '<div class="lc-endbtns"><button type="button" class="lc-bigbtn tall" data-draw><span class="lc-wico">✎</span>' + esc(w('drawIt')) + '</button><button type="button" class="lc-bigbtn tall" data-write><span class="lc-wico">Aa</span>' + esc(w('writeIt')) + '</button></div>' +
          '<p class="lc-later">' + esc(w('sayIt')) + '</p>');
        speak(w('somethingWorry'));
        r.onclick = function (e) {
          if (e.target.closest('[data-spk]')) return speak(w('somethingWorry'));
          if (e.target.closest('[data-draw]')) drawScreen();
          if (e.target.closest('[data-write]')) writeScreen();
        };
      }
      function drawScreen() {
        X.childClear();
        var r = shell(el, 'lc-wj lc-wjdraw', head(w('drawWorry')) + '<div class="lc-padwrap"><div class="lc-pad"></div><div class="lc-tools">' +
          PEN.map(function (p, i) { return '<button type="button" class="lc-pen' + (i ? '' : ' on') + '" data-pen="' + p + '" style="background:' + p + '" aria-label="' + p + '"></button>'; }).join('') +
          '<button type="button" class="lc-tool" data-erase>' + esc(w('eraser')) + '</button><button type="button" class="lc-tool" data-undo>↶ ' + esc(w('undo')) + '</button></div></div>' +
          '<div class="lc-endbtns one"><button type="button" class="lc-bigbtn yellow" data-put disabled>' + esc(w('putIn')) + '</button></div>');
        var pd = pad(r.querySelector('.lc-pad')), put = r.querySelector('[data-put]');
        pd.onchange = function () { put.disabled = pd.empty(); };
        r.onclick = function (e) {
          var b = e.target.closest('button'); if (!b) return;
          if (b.dataset.pen) { pd.setColor(b.dataset.pen); r.querySelectorAll('.lc-pen,[data-erase]').forEach(function (x) { x.classList.toggle('on', x === b); }); }
          if (b.hasAttribute('data-erase')) { pd.setErase(); r.querySelectorAll('.lc-pen,[data-erase]').forEach(function (x) { x.classList.toggle('on', x === b); }); }
          if (b.hasAttribute('data-undo')) pd.undo();
          if (b.hasAttribute('data-put') && !pd.empty()) {
            var id = 'w' + Date.now().toString(36), key = 'wj_' + id, img = pd.image();
            X.photoPut(key, img);
            drop({ id: id, kind: 'draw', img: key, at: Date.now(), c: c.items.length });
          }
        };
      }
      function writeScreen() {
        X.childClear();
        var r = shell(el, 'lc-wj lc-wjwrite', head(w('worriedThat')) + '<div class="lc-writebox"><textarea maxlength="240" rows="5" aria-label="' + esc(w('worriedThat')) + '"></textarea></div>' +
          '<div class="lc-endbtns one"><button type="button" class="lc-bigbtn yellow" data-put disabled>' + esc(w('putIn')) + '</button></div>');
        var ta = r.querySelector('textarea'), put = r.querySelector('[data-put]');
        setTimeout(function () { try { ta.focus(); } catch (e) {} }, 300);
        ta.oninput = function () { put.disabled = !ta.value.trim(); };
        put.onclick = function () { if (!ta.value.trim()) return; drop({ id: 'w' + Date.now().toString(36), kind: 'text', text: ta.value.trim(), at: Date.now(), c: c.items.length }); };
      }
      function drop(item) {
        X.childClear();
        c.items.push(item);
        if (c.later && (!c.at || c.at < Date.now())) c.at = Date.now() + c.laterMin * 60000;
        save();
        var r = shell(el, 'lc-wj lc-wjdrop', '<div class="lc-dropstage"><div class="lc-flynote">' + worryNote(item) + '</div><div class="lc-jarbig">' + jarSVG({ n: Math.min(c.items.length - 1, 6) }) + '</div></div><h2 class="lc-bigq lc-itsin">' + esc(w('itsIn')) + '</h2>');
        var stage = r.querySelector('.lc-dropstage');
        if (reduced()) { stage.classList.add('fold', 'drop', 'lidclose'); later(safe, 400); return; }
        later(function () { stage.classList.add('fold'); }, 150);
        later(function () { stage.classList.add('lidopen'); }, 700);
        later(function () { stage.classList.add('drop'); }, 1000);
        later(function () { stage.classList.add('lidclose'); X.chime('pop'); r.classList.add('said'); }, 1900);
        later(safe, 3300);
      }
      function safe() {
        X.childClear();
        var mins = c.at ? Math.max(0, c.at - Date.now()) : 0;
        var r = shell(el, 'lc-wj lc-end', '<div class="lc-endin">' + head(w('safe')) + '<div class="lc-jarbig">' + jarSVG({ n: Math.min(c.items.length, 6) }) + '</div>' +
          (c.at ? '<div class="lc-mtimer"><span class="lc-mtv">' + X.timerSVG('circle', 1) + '</span><div><b>' + esc(w('lookSoon')) + '</b><small class="lc-mtt"></small></div></div>' : '') + '</div>' +
          '<div class="lc-endbtns"><button type="button" class="lc-bigbtn" data-another>' + esc(w('another')) + '</button><button type="button" class="lc-bigbtn yellow" data-done>✓ ' + esc(w('done')) + '</button></div>');
        speak(w('safe'));
        if (c.at) {
          var tv = r.querySelector('.lc-mtv'), tt = r.querySelector('.lc-mtt'), total = c.laterMin * 60000;
          var tick = function () {
            var left = c.at - Date.now();
            if (left <= 0) { X.childClear(); X.chime('done'); return runWorryTime(); }
            X.timerSet(tv.firstChild, 'circle', Math.min(1, left / total)); tt.textContent = X.fmt(left) + ' ' + w('minLeft');
          };
          tick(); X.addTimer(setInterval(tick, 1000));
        }
        void mins;
        r.onclick = function (e) {
          if (e.target.closest('[data-another]')) ask();
          if (e.target.closest('[data-done]')) X.childClose();
        };
      }
      ask();
    }, function () { X.rerender(); });
  }
  function runWorryTime() {
    var c = CFG().wj;
    c.at = null; save();
    X.childOpen(function (el) {
      function list() {
        X.childClear();
        var r = shell(el, 'lc-wj lc-wtime', head(w('worryTime'), esc(c.items.length ? w('tapOne') : w('leftInJar', 0))) +
          '<div class="lc-wtstage"><div class="lc-jarbig open">' + jarSVG({ n: 0 }) + '</div><div class="lc-notefan">' + c.items.map(function (it, i) {
            return '<button type="button" class="lc-notebtn" data-wi="' + i + '" style="--r:' + ((i % 5) - 2) * 4 + 'deg;--d:' + (i * 0.08) + 's">' + worryNote(it) + '<small>' + esc(relDay(it.at)) + '</small></button>';
          }).join('') + '</div></div>' +
          '<div class="lc-endbtns one"><button type="button" class="lc-bigbtn yellow" data-close>' + esc(w('closeJar')) + '</button></div>');
        speak(w('worryTime'));
        r.onclick = function (e) {
          var b = e.target.closest('[data-wi]'); if (b) return detail(Number(b.dataset.wi));
          if (e.target.closest('[data-close]')) X.childClose();
        };
      }
      function detail(i) {
        X.childClear();
        var it = c.items[i]; if (!it) return list();
        var r = shell(el, 'lc-wj lc-wdetail', head(w('worryTime')) + '<div class="lc-detail"><div class="lc-floatnote">' + worryNote(it, true) + '<small class="lc-when">' + esc(relDay(it.at)) + '</small></div>' +
          '<div class="lc-adult"><b>' + esc(w('forAdult')) + '</b><p>' + esc(w('forAdultP')) + '</p></div></div>' +
          '<div class="lc-endbtns col"><button type="button" class="lc-holdbtn" data-hold><span class="lc-holdring"><svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="16" fill="none" stroke="#E4DCCF" stroke-width="4"/><circle class="lc-arc" cx="20" cy="20" r="16" fill="none" stroke="#2B2A35" stroke-width="4" stroke-linecap="round" stroke-dasharray="100.5" stroke-dashoffset="100.5" transform="rotate(-90 20 20)"/></svg></span><span><b>' + esc(w('holdFloat')) + '</b><small>' + esc(w('holdFloatD')) + '</small></span></button>' +
          '<div class="lc-endbtns"><button type="button" class="lc-bigbtn" data-keep>' + esc(w('keepIt')) + '</button><button type="button" class="lc-bigbtn yellow" data-close>' + esc(w('closeJar')) + '</button></div></div>');
        var hb = r.querySelector('[data-hold]'), arc = r.querySelector('.lc-arc'), t = null;
        function start(e) {
          e.preventDefault(); if (t) return;
          try { hb.setPointerCapture(e.pointerId); } catch (er) {}
          var t0 = Date.now();
          t = setInterval(function () {
            var p = Math.min(1, (Date.now() - t0) / 2000); arc.setAttribute('stroke-dashoffset', String(100.5 * (1 - p)));
            if (p >= 1) { clearInterval(t); t = null; floatAway(i, r); }
          }, 30);
        }
        function stop() { if (t) { clearInterval(t); t = null; arc.setAttribute('stroke-dashoffset', '100.5'); } }
        hb.addEventListener('pointerdown', start);
        ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(function (ev) { hb.addEventListener(ev, stop); });
        hb.addEventListener('contextmenu', function (e) { e.preventDefault(); });
        r.onclick = function (e) {
          if (e.target.closest('[data-keep]')) list();
          if (e.target.closest('[data-close]')) X.childClose();
        };
      }
      function floatAway(i, r) {
        var it = c.items[i];
        c.items.splice(i, 1);
        if (it && it.img) X.photoDel(it.img);
        save();
        X.chime('pop');
        var fl = r.querySelector('.lc-floatnote');
        r.classList.add('floating');
        if (fl && !reduced()) fl.classList.add('away');
        later(function () {
          X.childClear();
          var r2 = shell(el, 'lc-wj lc-bye', '<div class="lc-endin">' + head(w('byeWorry')) + '<div class="lc-jarbig small">' + jarSVG({ n: Math.min(c.items.length, 6) }) + '</div><p class="lc-qsub">' + esc(w('leftInJar', c.items.length)) + '</p></div>');
          speak(w('byeWorry'));
          void r2;
          later(function () { if (c.items.length) list(); else X.childClose(); }, 2600);
        }, reduced() ? 300 : 1500);
      }
      list();
    }, function () { X.rerender(); });
  }

  /* ===================== downloads (PDF / picture) ===================== */
  function staticBud(style) {
    var s = buddySVG(style).replace('<g class="lc-shut">', '<g class="lc-shut" display="none">');
    if (style === 'star' || style === 'box') s = s.replace('<g data-b="dot">', '<g data-b="dot" transform="translate(' + (style === 'box' ? '50 250' : starPts(150, 156, 120, 52)[0].join(' ')) + ')">');
    if (style === 'balloon') s = s.replace('<g data-b="grow">', '<g data-b="grow" transform="translate(150 200) scale(.9) translate(-150 -200)">');
    return s;
  }
  var INSTR = {
    breathe: {
      en: ['Practise when your child is calm first, so the buddy is familiar when feelings get big.', 'Breathe along together. Point to the picture and say the words slowly.', 'Colour in one dot after each breath. Stop when all the dots are full.', 'Keep it short and kind. Three to five breaths is plenty.'],
      id: ['Latih dulu saat anak sedang tenang, agar sudah terbiasa saat perasaannya besar.', 'Bernapaslah bersama. Tunjuk gambarnya dan ucapkan katanya pelan-pelan.', 'Warnai satu titik setiap selesai bernapas. Berhenti saat semua titik penuh.', 'Buat singkat dan lembut. Tiga sampai lima napas sudah cukup.']
    },
    feelings: {
      en: ['Put the chart somewhere your child can reach, and check in at calm times too.', 'Let your child point. Name the feeling back to them: "You feel worried."', 'Use the thermometer to talk about how big the feeling is, not whether it is right or wrong.', 'Then choose one thing from the calm-down menu together.'],
      id: ['Taruh bagan di tempat yang bisa dijangkau anak, dan cek perasaan juga saat sedang tenang.', 'Biarkan anak menunjuk. Sebutkan kembali perasaannya: "Kamu merasa khawatir."', 'Pakai termometer untuk membicarakan seberapa besar perasaannya, bukan benar atau salah.', 'Lalu pilih satu hal dari menu tenang bersama.']
    },
    worry: {
      en: ['Your child draws or writes a worry on a note, folds it and puts it in a real jar.', 'Choose a regular worry time to open the jar together.', 'Read each worry, listen, and talk about what might help.', 'When a worry has been talked through, you can let it go together.'],
      id: ['Anak menggambar atau menulis kekhawatiran di catatan, melipatnya, lalu memasukkannya ke toples sungguhan.', 'Tentukan waktu cerita yang rutin untuk membuka toples bersama.', 'Baca setiap kekhawatiran, dengarkan, dan bicarakan apa yang bisa membantu.', 'Setelah dibicarakan, kalian bisa melepaskannya bersama.']
    }
  };
  // a picture card whose label wraps onto two lines (long strategy names don't get cut off)
  function calmCard(ref, x, y, s, o, H) {
    var info = X.cardInfo(ref);
    if (!info || info.type === 'photo' || info.type === 'text' || !LUArt.get(ref)) return H.pcard(ref, x, y, s, o).svg;
    var pad = s * 0.07, art = s - pad * 2, fs = Math.min(s * 0.12, 6.4), lines = H.wrapText(X.cardLabel(ref), s * 0.9, fs).slice(0, 2), hh = s + (lines.length > 1 ? fs * 1.15 : 0) + fs * 0.4;
    var g = '<rect x="' + x + '" y="' + y + '" width="' + s + '" height="' + hh + '" rx="' + s * 0.08 + '" fill="#fff" stroke="' + (o.ink ? H.INK : '#E4DCCF') + '" stroke-width=".6"/>';
    g += svgIn(LUArt.svg(ref, { gender: X.kidFor(ref), ink: o.ink }), x + pad + art * 0.08, y + pad, art * 0.84, art * 0.84);
    lines.forEach(function (ln, i) { g += H.text(x + s / 2, y + pad + art * 0.84 + fs * 1.3 + i * fs * 1.15, ln, fs, { anchor: 'middle' }); });
    return g;
  }
  function openDl(kind) {
    var title = kind === 'breathe' ? w('bbTitle') : kind === 'feelings' ? w('feTitle') : w('wjTitle');
    X.openDownload('ext', { title: title, file: kind === 'breathe' ? 'breathing-buddy' : kind === 'feelings' ? 'feelings' : 'worry-jar', velcro: kind === 'feelings', instr: INSTR[kind], build: function (o, pw, ph, H) { return buildPages(kind, o, pw, ph, H); } });
  }
  function svgIn(svg, x, y, wdt, hgt) { return svg.replace(/^<svg /, '<svg x="' + x + '" y="' + y + '" width="' + wdt + '" height="' + hgt + '" '); }
  function inkify(svg, o) { return o.ink ? svg.replace(/fill="(?!none|url)[^"]*"/g, 'fill="#fff"') : svg; }
  function buildPages(kind, o, pw, ph, H) {
    var out = [], T2 = H.text, mid = pw / 2, c = CFG();
    if (kind === 'breathe') {
      var b = c.bb, g = T2(mid, 26, w('bbTitle'), 11, { anchor: 'middle' }) + T2(mid, 34, w(b.style), 5.4, { anchor: 'middle', fill: H.MUTED, body: true, weight: 600 });
      var vb = b.style === 'flower' ? [300, 290] : b.style === 'belly' ? [300, 260] : [300, 300], bw = pw - 50, bh = bw * vb[1] / vb[0];
      if (bh > 150) { bh = 150; bw = bh * vb[0] / vb[1]; }
      g += svgIn(inkify(staticBud(b.style), o), (pw - bw) / 2, 44, bw, bh);
      var y = 44 + bh + 14;
      var words = b.style === 'flower' ? [w('smell'), w('blow')] : b.style === 'box' ? [w('inS') + ' · ' + b.inS, w('holdS') + ' · ' + b.hold, w('outS') + ' · ' + b.outS, w('holdS') + ' · ' + b.hold] : [w('inS'), w('outS')];
      g += T2(mid, y, words.join('   →   '), b.style === 'box' ? 6 : 8, { anchor: 'middle' });
      y += 10;
      H.wrapText(wd(W.styleD[b.style]), pw - 60, 4.6).forEach(function (ln) { g += T2(mid, y, ln, 4.6, { anchor: 'middle', body: true, weight: 500, fill: '#4A4855' }); y += 6.2; });
      y += 8; g += T2(mid, y, w('dlColour'), 4.4, { anchor: 'middle', fill: H.MUTED, body: true, weight: 600 }); y += 8;
      var dr = 6.5, gap = 6, tw = b.n * dr * 2 + (b.n - 1) * gap;
      for (var i = 0; i < b.n; i++) g += '<circle cx="' + (mid - tw / 2 + dr + i * (dr * 2 + gap)) + '" cy="' + (y + dr) + '" r="' + dr + '" fill="#fff" stroke="' + H.INK + '" stroke-width=".6" stroke-dasharray="1.6 1.2"/>';
      out.push(H.page(pw, ph, g));
      // cut-out buddies
      var g2 = T2(14, 22, w('dlBreathCards'), 7.5), sz = (pw - 28 - 10) / 2, styles = ['balloon', 'star', 'flower', 'box', 'belly'];
      styles.forEach(function (s, k) {
        var x = 14 + (k % 2) * (sz + 10), yy = 30 + Math.floor(k / 2) * (sz * 0.78 + 8), hh = sz * 0.78;
        if (o.cut) g2 += H.cutRect(x, yy, sz, hh);
        g2 += '<rect x="' + (x + 2) + '" y="' + (yy + 2) + '" width="' + (sz - 4) + '" height="' + (hh - 4) + '" rx="5" fill="' + (o.ink ? '#fff' : ['#DCEBFA', '#FFF1C7', '#FBE0E6', '#E9E1F7', '#DDF2E4'][k]) + '"/>';
        g2 += svgIn(inkify(staticBud(s), o), x + 8, yy + 6, sz - 16, hh - 22) + T2(x + sz / 2, yy + hh - 7, w(s), 5.2, { anchor: 'middle' });
      });
      out.push(H.page(pw, ph, g2));
    } else if (kind === 'feelings') {
      var f = c.fe, show = f.show.length ? f.show : FEEL_ORDER.slice(0, 6);
      var gx = 5, cols = 3, cw = (pw - 28 - 70 - gx * 2) / cols, chh = cw + 9, startX = 14, g3 = T2(14, 24, w('dlFeel'), 10);
      show.forEach(function (k, i) {
        var x = startX + (i % cols) * (cw + gx), y = 34 + Math.floor(i / cols) * (chh + gx);
        if (o.cut) g3 += H.cutRect(x - 1, y - 1, cw + 2, chh + 2);
        g3 += '<rect x="' + x + '" y="' + y + '" width="' + cw + '" height="' + chh + '" rx="5" fill="#fff" stroke="#E4DCCF" stroke-width=".5"/>' + svgIn(inkify(feelFace(k, kid()), o), x + 3, y + 2, cw - 6, cw - 6) + T2(x + cw / 2, y + chh - 4, feelName(k), 4.4, { anchor: 'middle' });
        if (o.velcro && !o.cut) g3 += H.velcro(x + cw / 2, y + chh + 3, 1.6);
      });
      // thermometer on the right
      var tx = pw - 50, ty = 34, tH = 150, n = f.levels, segH = (tH - 20) / n, names = levelsFor(n);
      g3 += T2(tx + 12, ty - 2, w('dlBig'), 6, { anchor: 'middle' });
      for (var j = 0; j < n; j++) {
        var sy = ty + 6 + (n - 1 - j) * segH;
        g3 += '<rect x="' + tx + '" y="' + sy + '" width="24" height="' + (segH - 2) + '" rx="4" fill="' + (o.ink ? '#fff' : LV_COL[n][j]) + '" stroke="' + H.INK + '" stroke-width=".6"/>' + T2(tx + 28, sy + segH / 2 + 1.5, names[j], 4.4, { body: true, weight: 600 });
      }
      g3 += '<circle cx="' + (tx + 12) + '" cy="' + (ty + 6 + n * segH + 9) + '" r="11" fill="' + (o.ink ? '#fff' : LV_COL[n][n - 1]) + '" stroke="' + H.INK + '" stroke-width=".6"/>';
      out.push(H.page(pw, ph, g3));
      // body map page
      var g4 = T2(14, 24, w('dlBody'), 10), bH = 150, bW = bH * 0.6;
      g4 += svgIn(inkify(bodySVG(kid(), {}), o), 18, 34, bW, bH);
      var sx = 18 + bW + 14, sw2 = (pw - sx - 14 - 6) / 2;
      f.sensShow.forEach(function (k, i) {
        var x = sx + (i % 2) * (sw2 + 6), y = 36 + Math.floor(i / 2) * (sw2 + 14);
        if (o.cut) g4 += H.cutRect(x - 1, y - 1, sw2 + 2, sw2 + 10);
        g4 += svgIn(inkify(sensArt(k), o), x + 3, y, sw2 - 6, sw2 - 6) + T2(x + sw2 / 2, y + sw2 + 3, sensName(k), 4.6, { anchor: 'middle' });
      });
      out.push(H.page(pw, ph, g4));
      // calm-down menu page
      var items = menuItems().map(function (m) { return m.ref; }), g5 = T2(mid, 26, w('calmI'), 10, { anchor: 'middle' }), s = H.SIZE[o.size] || 52, colsN = Math.max(1, Math.min(3, Math.floor((pw - 28 + 8) / (s + 8))));
      var rowsTop = 38, chH = H.cardH(s, o) + 8, sx2 = (pw - (colsN * s + (colsN - 1) * 8)) / 2;
      items.forEach(function (r, i) {
        var x = sx2 + (i % colsN) * (s + 8), y = rowsTop + Math.floor(i / colsN) * chH;
        if (o.cut) g5 += H.cutRect(x - 2, y - 2, s + 4, chH - 4);
        g5 += calmCard(r, x, y, s, o, H);
        if (o.velcro && !o.cut) g5 += H.velcro(x + s / 2, y + chH - 5, 1.6);
      });
      if (f.back && f.backRef && X.cardInfo(f.backRef)) {
        var by2 = rowsTop + Math.ceil(items.length / colsN) * chH + 10;
        g5 += T2(mid, by2, X.tr('then'), 7, { anchor: 'middle' }) + calmCard(f.backRef, mid - s / 2, by2 + 5, s, o, H);
      }
      out.push(H.page(pw, ph, g5));
    } else {
      var g6 = T2(mid, 28, w('dlJar'), 12, { anchor: 'middle' }) + T2(mid, 37, w('dlJarP'), 4.8, { anchor: 'middle', body: true, weight: 500, fill: '#4A4855' });
      var jw = pw - 50, jh = jw * 290 / 292; if (jh > 200) { jh = 200; jw = jh * 292 / 290; }
      g6 += svgIn(inkify(jarSVG({ n: 0 }), o), (pw - jw) / 2, 46, jw, jh);
      out.push(H.page(pw, ph, g6));
      var g7 = T2(14, 22, w('dlSlips'), 7.5), nw = (pw - 28 - 8) / 2, nh = 52;
      for (var q = 0; q < 8; q++) {
        var x2 = 14 + (q % 2) * (nw + 8), y2 = 30 + Math.floor(q / 2) * (nh + 8);
        if (o.cut) g7 += H.cutRect(x2, y2, nw, nh);
        g7 += '<rect x="' + (x2 + 2) + '" y="' + (y2 + 2) + '" width="' + (nw - 4) + '" height="' + (nh - 4) + '" rx="4" fill="' + (o.ink ? '#fff' : NOTE_COLS[q % 5]) + '" stroke="' + H.INK + '" stroke-width=".4"/>' +
          T2(x2 + 7, y2 + 11, w('worriedThat'), 4.6) + [22, 31, 40].map(function (ly) { return '<line x1="' + (x2 + 7) + '" y1="' + (y2 + ly) + '" x2="' + (x2 + nw - 7) + '" y2="' + (y2 + ly) + '" stroke="#B9AF9F" stroke-width=".35"/>'; }).join('');
      }
      out.push(H.page(pw, ph, g7));
    }
    return out;
  }

  /* ===================== register with the tools ===================== */
  function hubVis(kind) {
    if (kind === 'breathe') return '<div class="lc-hubvis">' + buddyIcon('balloon') + '</div>';
    if (kind === 'feelings') return '<div class="lc-hubvis two"><i>' + feelFace('happy', kid(), { noBg: false }) + '</i><i>' + feelFace('worried', kid()) + '</i></div>';
    return '<div class="lc-hubvis">' + jarSVG({ n: 3 }) + '</div>';
  }
  LUTools.register('tools/breathe', { page: pageBreathe, click: clickBreathe, card: { tint: '#DCEBFA', vis: function () { return hubVis('breathe'); }, title: function () { return w('bbTitle'); }, desc: function () { return w('bbDesc'); } } });
  LUTools.register('tools/feelings', { page: pageFeelings, click: clickFeelings, card: { tint: '#E9E1F7', vis: function () { return hubVis('feelings'); }, title: function () { return w('feTitle'); }, desc: function () { return w('feDesc'); } } });
  LUTools.register('tools/worry', { page: pageWorry, click: clickWorry, card: { tint: '#FBE0E6', vis: function () { return hubVis('worry'); }, title: function () { return w('wjTitle'); }, desc: function () { return w('wjDesc'); } } });

  window.LUCalm = { version: '1', runBreathe: runBreathe, runCheck: runCheck, runBody: runBody, runMenu: runMenu, runWorry: runWorry, runWorryTime: runWorryTime, art: { feelFace: feelFace, sensArt: sensArt, bodySVG: bodySVG, buddySVG: buddySVG, jarSVG: jarSVG } };
  if (LUTools.render) try { LUTools.render(); } catch (e) {}
})();
