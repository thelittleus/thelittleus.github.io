/* Little Us · DTT · the read-only starter library. Teachers copy items from it into their own sets.
   Colours and shapes are drawn here. PLACEHOLDER: the "pending" sets are waiting for real pictures and licence details.
   To add one: put the file at /dtt-lib-<group>-<name>.webp, for example dtt-lib-objects-cup.webp, add its ref to the item's images, remove pending, and fill in license. */
(function () {
  'use strict';
  var D = window.LUDtt, INK = '#2B2A35';
  function svg(body) { return 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="#FFFFFF"/>' + body + '</svg>'); }
  var stroke = ' stroke="' + INK + '" stroke-width="6" stroke-linejoin="round"';
  var HUES = { red: '#E5484D', blue: '#3E8EDE', yellow: '#FFC94A', green: '#46A758', orange: '#F5873B', purple: '#8E6BD1', pink: '#F18DB0', brown: '#A0704A', black: '#33323C', white: '#FFFFFF' };
  var SHAPES = {
    circle: '<circle cx="100" cy="100" r="70" fill="#7DB3E8"' + stroke + '/>',
    square: '<rect x="35" y="35" width="130" height="130" rx="8" fill="#7FCB98"' + stroke + '/>',
    triangle: '<path d="M100 30 L172 165 L28 165 Z" fill="#FFC94A"' + stroke + '/>',
    rectangle: '<rect x="22" y="58" width="156" height="84" rx="8" fill="#F0694F"' + stroke + '/>',
    oval: '<ellipse cx="100" cy="100" rx="80" ry="52" fill="#B9A3E3"' + stroke + '/>',
    star: '<path d="M100 26l22 48 52 6-39 35 11 52-46-27-46 27 11-52-39-35 52-6z" fill="#FFC94A"' + stroke + '/>',
    heart: '<path d="M100 170C40 125 26 95 34 68c9-28 48-32 66-4 18-28 57-24 66 4 8 27-6 57-66 102z" fill="#F6B3C2"' + stroke + '/>',
    diamond: '<path d="M100 22 L168 100 L100 178 L32 100 Z" fill="#7DB3E8"' + stroke + '/>'
  };
  var ART = {};
  Object.keys(HUES).forEach(function (k) { ART['colors/' + k] = svg('<path d="M100 28c44 0 76 30 76 72s-32 72-76 72-76-30-76-72 32-72 76-72z" fill="' + HUES[k] + '"' + stroke + '/>'); });
  Object.keys(SHAPES).forEach(function (k) { ART['shapes/' + k] = svg(SHAPES[k]); });

  function drawn(group, list, tag) { return list.map(function (x) { return { id: x[0], labels: [x[0], x[1]], images: [group + '/' + x[0]], tags: [tag] }; }); }
  function pending(list, tag) { return list.map(function (x) { return { id: x[0], labels: [x[0], x[1]], images: [], tags: [tag], pending: true }; }); }
  var OWN = { name: 'Little Us original drawing', source: 'Little Us' };

  D.library = {
    sets: [
      { id: 'colors', name: ['Colors', 'Warna'], license: OWN, items: drawn('colors', [['red', 'merah'], ['blue', 'biru'], ['yellow', 'kuning'], ['green', 'hijau'], ['orange', 'oranye'], ['purple', 'ungu'], ['pink', 'merah muda'], ['brown', 'cokelat'], ['black', 'hitam'], ['white', 'putih']], 'color') },
      { id: 'shapes', name: ['Shapes', 'Bentuk'], license: OWN, items: drawn('shapes', [['circle', 'lingkaran'], ['square', 'persegi'], ['triangle', 'segitiga'], ['rectangle', 'persegi panjang'], ['oval', 'oval'], ['star', 'bintang'], ['heart', 'hati'], ['diamond', 'belah ketupat']], 'shape') },
      { id: 'objects', name: ['Common objects', 'Benda sehari-hari'], license: null, items: pending([['cup', 'cangkir'], ['ball', 'bola'], ['spoon', 'sendok'], ['shoe', 'sepatu'], ['book', 'buku'], ['chair', 'kursi'], ['key', 'kunci'], ['bag', 'tas'], ['hat', 'topi'], ['clock', 'jam']], 'object') },
      { id: 'body', name: ['Body parts', 'Anggota tubuh'], license: null, items: pending([['nose', 'hidung'], ['eye', 'mata'], ['ear', 'telinga'], ['mouth', 'mulut'], ['hand', 'tangan'], ['foot', 'kaki'], ['tummy', 'perut'], ['hair', 'rambut']], 'body') }
    ],
    src: function (ref) { return ART[ref] || '/dtt-lib-' + ref.replace('/', '-') + '.webp'; }
  };
})();
