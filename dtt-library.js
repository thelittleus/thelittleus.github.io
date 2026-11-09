/* Little Us · DTT · the read-only Little Us library. Teachers copy items from it into their own sets.
   It holds Colours, Shapes, Numbers 0–20 and Letters (A–Z and a–z), all drawn here, so nothing is uploaded or downloaded.
   Typed text stimuli are drawn here too: an image ref "txt/<style>/<text>" becomes a card picture. */
(function () {
  'use strict';
  var D = window.LUDtt, INK = '#2B2A35';
  function svg(body) { return 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="#FFFFFF"/>' + body + '</svg>'); }
  var stroke = ' stroke="' + INK + '" stroke-width="6" stroke-linejoin="round"';
  var HUES = { red: '#E5484D', blue: '#3E8EDE', yellow: '#FFC94A', green: '#46A758', orange: '#F5873B', purple: '#8E6BD1', pink: '#F18DB0', brown: '#A0704A', black: '#33323C', white: '#FFFFFF',
    grey: '#9A98A3', 'light blue': '#9FD0F5', 'dark blue': '#1F3F8F', 'light green': '#A8E07A', 'dark green': '#1F6B3A', turquoise: '#2FC1C1', maroon: '#7E1F2E', cream: '#F6EBCB', gold: '#D9A520', silver: '#C4C8D0' };
  var ART = {};
  Object.keys(HUES).forEach(function (k) { ART['colors/' + k.replace(/ /g, '-')] = svg('<path d="M100 28c44 0 76 30 76 72s-32 72-76 72-76-30-76-72 32-72 76-72z" fill="' + HUES[k] + '"' + stroke + '/>'); });
  // shapes: a flat fill and the same thick outline as the colours, one fixed colour per shape so the shape is what changes
  var SHAPES = {
    circle: '<circle cx="100" cy="100" r="70" fill="#7DB3E8"' + stroke + '/>', square: '<rect x="35" y="35" width="130" height="130" rx="8" fill="#7FCB98"' + stroke + '/>',
    triangle: '<path d="M100 30 L172 165 L28 165 Z" fill="#FFC94A"' + stroke + '/>', rectangle: '<rect x="22" y="58" width="156" height="84" rx="8" fill="#F0694F"' + stroke + '/>',
    oval: '<ellipse cx="100" cy="100" rx="80" ry="52" fill="#B9A3E3"' + stroke + '/>', star: '<path d="M100 26l22 48 52 6-39 35 11 52-46-27-46 27 11-52-39-35 52-6z" fill="#FFC94A"' + stroke + '/>',
    heart: '<path d="M100 170C40 125 26 95 34 68c9-28 48-32 66-4 18-28 57-24 66 4 8 27-6 57-66 102z" fill="#F6B3C2"' + stroke + '/>', diamond: '<path d="M100 22 L168 100 L100 178 L32 100 Z" fill="#7DB3E8"' + stroke + '/>',
    pentagon: poly(5, 74, '#F5873B'), hexagon: poly(6, 74, '#5CC4B4'), octagon: poly(8, 74, '#E5484D'),
    semicircle: '<path d="M24 140 A76 76 0 0 1 176 140 Z" fill="#B98157"' + stroke + '/>', crescent: '<path d="M120 26 A76 76 0 1 0 120 174 A92 92 0 0 1 120 26 Z" fill="#FFC94A"' + stroke + '/>',
    cross: '<path d="M78 26 H122 V78 H174 V122 H122 V174 H78 V122 H26 V78 H78 Z" fill="#E5484D"' + stroke + '/>', arrow: '<path d="M24 80 H110 V44 L176 100 L110 156 V120 H24 Z" fill="#7FCB98"' + stroke + '/>',
    trapezoid: '<path d="M60 52 H140 L176 148 H24 Z" fill="#B9A3E3"' + stroke + '/>', parallelogram: '<path d="M62 56 H182 L138 144 H18 Z" fill="#F6B3C2"' + stroke + '/>'
  };
  function poly(n, r, f) { var d = ''; for (var i = 0; i < n; i++) { var a = -Math.PI / 2 + i * 2 * Math.PI / n + (n % 2 ? 0 : Math.PI / n); d += (i ? 'L' : 'M') + (100 + r * Math.cos(a)).toFixed(1) + ' ' + (100 + r * Math.sin(a)).toFixed(1); } return '<path d="' + d + 'Z" fill="' + f + '"' + stroke + '/>'; }
  Object.keys(SHAPES).forEach(function (k) { ART['shapes/' + k] = svg(SHAPES[k]); });

  // card styles for typed text: plain, large, coloured (a soft tint picked from the text, so it stays the same every time)
  var TINTS = ['#DCEBFA', '#FFE9DA', '#DDF2E4', '#E9E1F7', '#FFF1C7', '#FBE0E6'];
  function xml(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function textCard(style, text) {
    var t = String(text || ''), n = Array.from(t).length || 1, h = 0;
    for (var i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) % 997;
    var big = style === 'large', size = Math.max(22, Math.min(big ? 150 : 96, Math.floor((big ? 300 : 250) / n)));
    var bg = style === 'coloured' ? TINTS[h % TINTS.length] : '#FFFFFF';
    return 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="' + bg + '"/>' +
      '<text x="100" y="104" text-anchor="middle" dominant-baseline="middle" font-family="Fredoka, Figtree, Arial, sans-serif" font-weight="600" font-size="' + size + '" fill="' + INK + '">' + xml(t) + '</text></svg>');
  }
  function textRef(style, text) { return 'txt/' + (style || 'plain') + '/' + encodeURIComponent(text); }

  // ids and picture names use dashes (light-blue); the labels keep the spaces (light blue)
  function drawn(group, list, tag) { return list.map(function (x) { var id = x[0].replace(/ /g, '-'); return { id: id, labels: [x[0], x[1]], images: [group + '/' + id], tags: [tag] }; }); }
  function typed(list, tag, style) { return list.map(function (x) { return { id: x, labels: [x, x], images: [textRef(style, x)], tags: [tag], text: true }; }); }
  var OWN = { name: 'Little Us original drawing', source: 'Little Us' };
  var NUMS = [], ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''), abc = 'abcdefghijklmnopqrstuvwxyz'.split('');
  for (var n = 0; n <= 20; n++) NUMS.push(String(n));

  D.library = {
    // kind: what the card shows, for the library filter (Swatches, Text)
    sets: [
      { id: 'colors', name: ['Colours', 'Warna'], kind: 'swatch', license: OWN, items: drawn('colors', [['red', 'merah'], ['blue', 'biru'], ['yellow', 'kuning'], ['green', 'hijau'], ['orange', 'oranye'], ['purple', 'ungu'], ['pink', 'merah muda'], ['brown', 'cokelat'], ['black', 'hitam'], ['white', 'putih'],
        ['grey', 'abu-abu'], ['light blue', 'biru muda'], ['dark blue', 'biru tua'], ['light green', 'hijau muda'], ['dark green', 'hijau tua'], ['turquoise', 'toska'], ['maroon', 'merah marun'], ['cream', 'krem'], ['gold', 'emas'], ['silver', 'perak']], 'color') },
      { id: 'shapes', name: ['Shapes', 'Bentuk'], kind: 'shape', license: OWN, items: drawn('shapes', [['circle', 'lingkaran'], ['square', 'persegi'], ['triangle', 'segitiga'], ['rectangle', 'persegi panjang'], ['oval', 'oval'], ['star', 'bintang'], ['heart', 'hati'], ['diamond', 'belah ketupat'],
        ['pentagon', 'segi lima'], ['hexagon', 'segi enam'], ['octagon', 'segi delapan'], ['semicircle', 'setengah lingkaran'], ['crescent', 'bulan sabit'], ['cross', 'tanda tambah'], ['arrow', 'panah'], ['trapezoid', 'trapesium'], ['parallelogram', 'jajar genjang']], 'shape') },
      { id: 'numbers', name: ['Numbers 0–20', 'Angka 0–20'], kind: 'text', license: OWN, items: typed(NUMS, 'number', 'large') },
      { id: 'letters', name: ['Capital Letters A–Z', 'Huruf Besar A–Z'], kind: 'text', license: OWN, items: typed(ABC, 'letter', 'large') },
      { id: 'lowercase', name: ['Small Letters a–z', 'Huruf Kecil a–z'], kind: 'text', license: OWN, items: typed(abc, 'letter', 'large') }
    ],
    textRef: textRef,
    isText: function (ref) { return String(ref || '').indexOf('txt/') === 0; },
    textOf: function (ref) { var m = /^txt\/[^/]+\/(.*)$/.exec(String(ref || '')); return m ? decodeURIComponent(m[1]) : ''; },
    styleOf: function (ref) { var m = /^txt\/([^/]+)\//.exec(String(ref || '')); return m ? m[1] : 'plain'; },
    src: function (ref) {
      if (ART[ref]) return ART[ref];
      var m = /^txt\/([^/]+)\/(.*)$/.exec(ref);
      if (m) return textCard(m[1], decodeURIComponent(m[2]));
      return '/dtt-lib-' + String(ref).replace('/', '-') + '.webp';
    }
  };
})();
