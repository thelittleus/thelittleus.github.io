/* Little Us · DTT · the read-only Little Us library. Teachers copy items from it into their own sets.
   For now it holds Colours, Numbers 1–10 and Letters A–Z, all drawn here, so nothing is uploaded or downloaded.
   Typed text stimuli are drawn here too: an image ref "txt/<style>/<text>" becomes a card picture. */
(function () {
  'use strict';
  var D = window.LUDtt, INK = '#2B2A35';
  function svg(body) { return 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="#FFFFFF"/>' + body + '</svg>'); }
  var stroke = ' stroke="' + INK + '" stroke-width="6" stroke-linejoin="round"';
  var HUES = { red: '#E5484D', blue: '#3E8EDE', yellow: '#FFC94A', green: '#46A758', orange: '#F5873B', purple: '#8E6BD1', pink: '#F18DB0', brown: '#A0704A', black: '#33323C', white: '#FFFFFF' };
  var ART = {};
  Object.keys(HUES).forEach(function (k) { ART['colors/' + k] = svg('<path d="M100 28c44 0 76 30 76 72s-32 72-76 72-76-30-76-72 32-72 76-72z" fill="' + HUES[k] + '"' + stroke + '/>'); });
  // shapes left the library, but sets that already copied them still draw
  var SHAPES = {
    circle: '<circle cx="100" cy="100" r="70" fill="#7DB3E8"' + stroke + '/>', square: '<rect x="35" y="35" width="130" height="130" rx="8" fill="#7FCB98"' + stroke + '/>',
    triangle: '<path d="M100 30 L172 165 L28 165 Z" fill="#FFC94A"' + stroke + '/>', rectangle: '<rect x="22" y="58" width="156" height="84" rx="8" fill="#F0694F"' + stroke + '/>',
    oval: '<ellipse cx="100" cy="100" rx="80" ry="52" fill="#B9A3E3"' + stroke + '/>', star: '<path d="M100 26l22 48 52 6-39 35 11 52-46-27-46 27 11-52-39-35 52-6z" fill="#FFC94A"' + stroke + '/>',
    heart: '<path d="M100 170C40 125 26 95 34 68c9-28 48-32 66-4 18-28 57-24 66 4 8 27-6 57-66 102z" fill="#F6B3C2"' + stroke + '/>', diamond: '<path d="M100 22 L168 100 L100 178 L32 100 Z" fill="#7DB3E8"' + stroke + '/>'
  };
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

  function drawn(group, list, tag) { return list.map(function (x) { return { id: x[0], labels: [x[0], x[1]], images: [group + '/' + x[0]], tags: [tag] }; }); }
  function typed(list, tag, style) { return list.map(function (x) { return { id: x, labels: [x, x], images: [textRef(style, x)], tags: [tag], text: true }; }); }
  var OWN = { name: 'Little Us original drawing', source: 'Little Us' };
  var NUMS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'], ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  D.library = {
    // kind: what the card shows, for the library filter (Swatches, Text)
    sets: [
      { id: 'colors', name: ['Colours', 'Warna'], kind: 'swatch', license: OWN, items: drawn('colors', [['red', 'merah'], ['blue', 'biru'], ['yellow', 'kuning'], ['green', 'hijau'], ['orange', 'oranye'], ['purple', 'ungu'], ['pink', 'merah muda'], ['brown', 'cokelat'], ['black', 'hitam'], ['white', 'putih']], 'color') },
      { id: 'numbers', name: ['Numbers 1–10', 'Angka 1–10'], kind: 'text', license: OWN, items: typed(NUMS, 'number', 'large') },
      { id: 'letters', name: ['Letters A–Z', 'Huruf A–Z'], kind: 'text', license: OWN, items: typed(ABC, 'letter', 'large') }
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
