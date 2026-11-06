/* Little Us · DTT · the six reinforcement themes, as data. Original drawings in one flat style: thick ink outline, flat colours, happy faces.
   To add a character, add one line to a theme. No text in the art. */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) module.exports = factory();
  else { root.LUDtt = root.LUDtt || {}; root.LUDtt.themes = factory(); }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  var INK = '#2B2A35', O = ' stroke="' + INK + '" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"';
  var C = { yellow: '#FFC94A', coral: '#F0694F', pink: '#F6B3C2', blue: '#7DB3E8', green: '#7FCB98', lilac: '#B9A3E3', brown: '#B98157', skin: '#F7D3B7', cream: '#FFF8EC', red: '#E5484D', orange: '#F5873B', sky: '#BFE0F7', teal: '#5CC4B4', white: '#FFFFFF', grey: '#B7BCC8', dark: '#4A4855' };

  // a happy face centred at (x, y); s scales it
  function face(x, y, s) {
    s = s || 1;
    var e = 9 * s, r = 3.6 * s;
    return '<circle cx="' + (x - e) + '" cy="' + y + '" r="' + r + '" fill="' + INK + '"/><circle cx="' + (x + e) + '" cy="' + y + '" r="' + r + '" fill="' + INK + '"/>' +
      '<circle cx="' + (x - e + r * 0.4) + '" cy="' + (y - r * 0.4) + '" r="' + (r * 0.35) + '" fill="#fff"/><circle cx="' + (x + e + r * 0.4) + '" cy="' + (y - r * 0.4) + '" r="' + (r * 0.35) + '" fill="#fff"/>' +
      '<circle cx="' + (x - e - 5 * s) + '" cy="' + (y + 7 * s) + '" r="' + (3.6 * s) + '" fill="#F4A3A0"/><circle cx="' + (x + e + 5 * s) + '" cy="' + (y + 7 * s) + '" r="' + (3.6 * s) + '" fill="#F4A3A0"/>' +
      '<path d="M' + (x - 6 * s) + ' ' + (y + 6 * s) + ' Q' + x + ' ' + (y + 14 * s) + ' ' + (x + 6 * s) + ' ' + (y + 6 * s) + '" fill="none" stroke="' + INK + '" stroke-width="' + (3 * s) + '" stroke-linecap="round"/>';
  }
  function circle(x, y, r, f) { return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + f + '"' + O + '/>'; }
  function ell(x, y, a, b, f) { return '<ellipse cx="' + x + '" cy="' + y + '" rx="' + a + '" ry="' + b + '" fill="' + f + '"' + O + '/>'; }
  function rect(x, y, w, h, r, f) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + r + '" fill="' + f + '"' + O + '/>'; }
  function path(d, f) { return '<path d="' + d + '" fill="' + (f || 'none') + '"' + O + '/>'; }
  function wheel(x, y, r) { return circle(x, y, r || 11, C.dark) + '<circle cx="' + x + '" cy="' + y + '" r="' + ((r || 11) * 0.4) + '" fill="' + C.cream + '"/>'; }
  function legs(x1, x2, y) { return path('M' + x1 + ' ' + y + 'v14M' + x2 + ' ' + y + 'v14'); }
  function star(cx, cy, r, f) {
    var d = '', i, a, q;
    for (i = 0; i < 10; i++) { a = -Math.PI / 2 + i * Math.PI / 5; q = i % 2 ? r * 0.48 : r; d += (i ? 'L' : 'M') + (cx + q * Math.cos(a)).toFixed(1) + ' ' + (cy + q * Math.sin(a)).toFixed(1); }
    return path(d + 'Z', f);
  }

  function ch(id, en, idn, sound, art) { return { id: id, name: [en, idn], sound: sound, art: art }; }

  var THEMES = [
    { id: 'space', name: ['Space', 'Luar angkasa'], backgrounds: ['#E9E1F7', '#DCEBFA'], sounds: ['boop', 'whoosh', 'sparkle'], opener: 'launch', cover: 'moon', treat: 'star', pop: 'star',
      characters: [
        ch('planet', 'Planet', 'Planet', 'boop', ell(60, 60, 54, 13, C.yellow) + circle(60, 60, 32, C.coral) + path('M28 66 Q60 84 92 66', 'none') + face(60, 52)),
        ch('rocket', 'Rocket', 'Roket', 'whoosh', path('M34 80 L16 104 L38 98Z', C.coral) + path('M86 80 L104 104 L82 98Z', C.coral) + path('M60 6 Q92 34 86 96 H34 Q28 34 60 6Z', C.cream) + path('M44 96 Q60 120 76 96Z', C.yellow) + circle(60, 40, 13, C.sky) + face(60, 72, 0.8)),
        ch('astronaut', 'Astronaut', 'Astronaut', 'boop', rect(40, 62, 40, 36, 12, C.white) + legs(50, 70, 98) + path('M40 72 L24 58M80 72 L96 58') + circle(60, 40, 30, C.white) + rect(38, 24, 44, 36, 16, C.sky) + face(60, 40, 0.85)),
        ch('star', 'Star', 'Bintang', 'sparkle', star(60, 62, 50, C.yellow) + face(60, 62, 0.9)),
        ch('alien', 'Friendly alien', 'Alien ramah', 'boop', path('M42 24 L34 6M78 24 L86 6') + circle(34, 6, 5, C.yellow) + circle(86, 6, 5, C.yellow) + ell(60, 52, 36, 34, C.green) + rect(44, 80, 32, 22, 10, C.green) + legs(50, 70, 102) + face(60, 50)),
        ch('moon', 'Moon', 'Bulan', 'sparkle', circle(60, 60, 46, C.cream) + circle(36, 42, 6, C.grey) + circle(88, 76, 8, C.grey) + circle(80, 34, 5, C.grey) + face(60, 62)),
        ch('comet', 'Comet', 'Komet', 'whoosh', path('M70 40 L12 10 L34 44 L4 44 L40 66 L14 84 L68 78Z', C.orange) + circle(76, 62, 28, C.yellow) + face(76, 58, 0.75)),
        ch('ufo', 'Flying saucer', 'Piring terbang', 'whoosh', path('M34 56 Q34 18 60 18 Q86 18 86 56Z', C.sky) + ell(60, 66, 52, 18, C.lilac) + circle(32, 68, 4, C.yellow) + circle(60, 74, 4, C.yellow) + circle(88, 68, 4, C.yellow) + face(60, 38, 0.75)),
        ch('robot', 'Robot', 'Robot', 'boop', path('M60 12 V22') + circle(60, 9, 5, C.coral) + rect(32, 22, 56, 44, 10, C.grey) + rect(38, 70, 44, 28, 8, C.blue) + legs(48, 72, 98) + path('M38 78 L22 86M82 78 L98 86') + face(60, 42))
      ] },
    { id: 'sea', name: ['Under the sea', 'Bawah laut'], backgrounds: ['#DCEBFA', '#DDF2E4'], sounds: ['bubble', 'splash', 'sparkle'], opener: 'chest', cover: 'rock', treat: 'shell', pop: 'bubble',
      characters: [
        ch('fish', 'Fish', 'Ikan', 'bubble', path('M86 60 L114 36 V84Z', C.coral) + ell(54, 60, 46, 32, C.orange) + path('M46 30 Q60 12 72 34', C.coral) + face(40, 56, 0.85)),
        ch('turtle', 'Turtle', 'Kura-kura', 'splash', ell(30, 96, 12, 8, C.green) + ell(90, 96, 12, 8, C.green) + circle(100, 58, 17, C.green) + path('M14 86 Q14 34 60 34 Q100 34 100 86Z', C.teal) + path('M40 86 V54M64 86 V46M28 66 H92', 'none') + face(100, 56, 0.55)),
        ch('jellyfish', 'Jellyfish', 'Ubur-ubur', 'bubble', path('M36 70 q-6 16 2 34M52 72 q-6 16 2 36M68 72 q6 16 -2 36M84 70 q6 16 -2 34') + path('M20 70 Q20 16 60 16 Q100 16 100 70 Q60 84 20 70Z', C.pink) + face(60, 46)),
        ch('mermaid', 'Mermaid', 'Putri duyung', 'sparkle', path('M46 104 L28 116 L54 114 L60 104Z', C.teal) + path('M74 104 L92 116 L66 114 L60 104Z', C.teal) + path('M42 58 Q38 92 60 106 Q82 92 78 58Z', C.teal) + path('M42 60 L24 48M78 60 L96 48') + rect(44, 46, 32, 18, 8, C.lilac) + path('M28 34 Q24 72 40 58 M92 34 Q96 72 80 58', C.orange) + circle(60, 28, 24, C.skin) + path('M36 30 Q40 2 60 4 Q80 2 84 30 Q72 12 60 14 Q48 12 36 30Z', C.orange) + face(60, 28, 0.75)),
        ch('treasure', 'Treasure', 'Harta karun', 'sparkle', rect(18, 58, 84, 46, 8, C.brown) + path('M18 58 Q18 24 60 24 Q102 24 102 58Z', C.orange) + rect(52, 50, 16, 18, 4, C.yellow) + circle(36, 42, 5, C.yellow) + circle(84, 42, 5, C.yellow) + face(60, 84, 0.85)),
        ch('crab', 'Crab', 'Kepiting', 'splash', path('M26 60 Q10 44 18 26 M94 60 Q110 44 102 26') + circle(18, 24, 11, C.coral) + circle(102, 24, 11, C.coral) + path('M30 88 L18 102M46 94 L38 110M74 94 L82 110M90 88 L102 102') + ell(60, 70, 38, 28, C.coral) + face(60, 66)),
        ch('octopus', 'Octopus', 'Gurita', 'bubble', path('M34 74 Q18 92 26 108M48 80 Q40 100 48 112M72 80 Q80 100 72 112M86 74 Q102 92 94 108') + path('M24 66 Q24 16 60 16 Q96 16 96 66 Q96 86 60 86 Q24 86 24 66Z', C.lilac) + face(60, 54)),
        ch('seahorse', 'Seahorse', 'Kuda laut', 'bubble', path('M64 26 Q98 34 82 70 Q72 96 88 104 Q64 116 56 92 Q50 72 46 56 Q44 30 64 26Z', C.yellow) + path('M46 40 L18 44 L44 54', C.yellow) + path('M90 56 L108 52 L96 70', C.orange) + face(64, 44, 0.6)),
        ch('starfish', 'Starfish', 'Bintang laut', 'splash', star(60, 62, 52, C.coral) + face(60, 62, 0.9))
      ] },
    { id: 'garden', name: ['Garden', 'Kebun'], backgrounds: ['#DDF2E4', '#FFF1C7'], sounds: ['chirp', 'buzz', 'sparkle'], opener: 'egg', cover: 'bush', treat: 'leaf', pop: 'bubble',
      characters: [
        ch('flower', 'Flower', 'Bunga', 'sparkle', path('M60 76 V114') + ell(46, 100, 12, 6, C.green) + circle(60, 24, 16, C.pink) + circle(32, 44, 16, C.pink) + circle(88, 44, 16, C.pink) + circle(42, 72, 16, C.pink) + circle(78, 72, 16, C.pink) + circle(60, 50, 22, C.yellow) + face(60, 48, 0.65)),
        ch('butterfly', 'Butterfly', 'Kupu-kupu', 'chirp', path('M60 56 Q24 8 14 34 Q6 60 58 66Z', C.lilac) + path('M60 56 Q96 8 106 34 Q114 60 62 66Z', C.lilac) + path('M58 68 Q20 70 28 94 Q44 104 60 78Z', C.pink) + path('M62 68 Q100 70 92 94 Q76 104 60 78Z', C.pink) + path('M54 28 L46 14M66 28 L74 14') + rect(50, 26, 20, 66, 10, C.dark) + face(60, 42, 0.45)),
        ch('bee', 'Bee', 'Lebah', 'buzz', ell(36, 34, 18, 13, C.sky) + ell(70, 30, 18, 13, C.sky) + ell(58, 66, 42, 30, C.yellow) + path('M56 38 Q48 66 56 94', 'none') + path('M80 42 Q74 66 80 90', 'none') + path('M100 66 h14') + face(36, 62, 0.7)),
        ch('ladybug', 'Ladybug', 'Kumbang', 'chirp', legs(36, 84, 90) + ell(60, 62, 44, 36, C.red) + path('M60 30 V96') + circle(40, 54, 6, INK) + circle(80, 54, 6, INK) + circle(40, 78, 5, INK) + circle(80, 78, 5, INK) + circle(60, 28, 21, C.dark) + face(60, 26, 0.55)),
        ch('apple', 'Smiling apple', 'Apel tersenyum', 'chirp', path('M60 28 Q62 14 74 8') + ell(82, 18, 12, 7, C.green) + path('M60 30 Q18 16 18 60 Q18 108 60 104 Q102 108 102 60 Q102 16 60 30Z', C.red) + face(60, 62)),
        ch('carrot', 'Smiling carrot', 'Wortel tersenyum', 'chirp', path('M60 28 Q42 6 34 16 M60 28 Q60 2 60 8 M60 28 Q78 6 86 16', C.green) + path('M28 36 Q60 18 92 36 Q84 92 60 114 Q36 92 28 36Z', C.orange) + face(60, 54, 0.85)),
        ch('strawberry', 'Smiling strawberry', 'Stroberi tersenyum', 'chirp', path('M22 38 Q60 18 98 38 Q100 86 60 112 Q20 86 22 38Z', C.red) + path('M34 28 L44 16 L60 26 L76 16 L86 28 L60 38Z', C.green) + face(60, 62, 0.85)),
        ch('snail', 'Snail', 'Siput', 'buzz', path('M12 92 Q12 60 22 44 L30 44 L36 80 H104 Q112 92 96 96 H20Z', C.skin) + path('M22 44 L14 24M30 44 L34 24') + circle(74, 58, 32, C.brown) + path('M74 58 m-12 0 a12 12 0 1 1 12 12', 'none') + face(24, 64, 0.5)),
        ch('mushroom', 'Mushroom', 'Jamur', 'sparkle', rect(40, 58, 40, 50, 16, C.cream) + path('M10 62 Q14 12 60 12 Q106 12 110 62Z', C.coral) + circle(40, 36, 7, C.white) + circle(78, 34, 8, C.white) + face(60, 80, 0.8))
      ] },
    { id: 'fantasy', name: ['Fantasy', 'Dunia dongeng'], backgrounds: ['#E9E1F7', '#FBE0E6'], sounds: ['sparkle', 'chime', 'boop'], opener: 'egg', cover: 'cloud', treat: 'star', pop: 'star',
      characters: [
        ch('unicorn', 'Unicorn', 'Unicorn', 'chime', path('M58 32 L52 2 L70 28', C.yellow) + rect(26, 66, 66, 32, 16, C.white) + legs(38, 80, 96) + path('M36 22 Q18 40 22 70', C.pink) + rect(40, 24, 48, 48, 22, C.white) + path('M82 72 Q106 66 100 94', C.lilac) + face(66, 46, 0.8)),
        ch('fairy', 'Fairy', 'Peri', 'sparkle', ell(26, 56, 20, 28, C.sky) + ell(94, 56, 20, 28, C.sky) + path('M42 60 L34 98 H86 L78 60Z', C.pink) + legs(50, 70, 98) + circle(60, 36, 24, C.skin) + path('M36 36 Q38 8 60 10 Q82 8 84 36 Q70 20 60 22 Q50 20 36 36Z', C.yellow) + star(60, 6, 7, C.yellow) + face(60, 38, 0.7)),
        ch('dragon', 'Friendly dragon', 'Naga ramah', 'boop', path('M34 56 Q6 34 14 72 Z', C.lilac) + path('M86 94 Q116 96 110 70 L98 82Z', C.green) + ell(60, 78, 34, 26, C.green) + legs(44, 76, 98) + path('M40 22 L44 6 L54 20M72 20 L82 6 L84 24', C.yellow) + rect(32, 16, 60, 44, 22, C.green) + face(62, 36, 0.85)),
        ch('castle', 'Castle', 'Istana', 'chime', rect(14, 46, 26, 62, 4, C.lilac) + rect(80, 46, 26, 62, 4, C.lilac) + rect(36, 58, 48, 50, 4, C.pink) + path('M14 46 L27 18 L40 46Z', C.coral) + path('M80 46 L93 18 L106 46Z', C.coral) + path('M50 108 V90 Q60 78 70 90 V108Z', C.brown) + face(60, 70, 0.6)),
        ch('wand', 'Magic wand', 'Tongkat ajaib', 'sparkle', rect(52, 56, 14, 58, 6, C.lilac) + star(60, 38, 34, C.yellow) + face(60, 38, 0.6)),
        ch('gnome', 'Gnome', 'Kurcaci', 'boop', path('M34 44 L60 2 L86 44Z', C.red) + rect(40, 74, 40, 28, 12, C.blue) + legs(50, 70, 102) + circle(60, 54, 22, C.skin) + path('M40 62 Q60 92 80 62 Q60 74 40 62Z', C.white) + face(60, 48, 0.65)),
        ch('potion', 'Magic potion', 'Ramuan ajaib', 'chime', rect(50, 8, 20, 22, 4, C.brown) + path('M46 28 H74 V42 Q100 60 96 86 Q94 110 60 110 Q26 110 24 86 Q20 60 46 42Z', C.pink) + path('M26 78 Q60 62 94 78', 'none') + face(60, 82, 0.8)),
        ch('crown', 'Crown', 'Mahkota', 'chime', path('M16 92 L10 30 L38 58 L60 18 L82 58 L110 30 L104 92Z', C.yellow) + circle(10, 28, 6, C.coral) + circle(60, 16, 6, C.lilac) + circle(110, 28, 6, C.coral) + face(60, 66, 0.85)),
        ch('pegasus', 'Winged horse', 'Kuda bersayap', 'chime', path('M50 66 Q30 20 8 36 Q12 66 46 78Z', C.sky) + rect(30, 66, 62, 30, 14, C.lilac) + legs(40, 80, 94) + rect(50, 24, 42, 46, 20, C.lilac) + path('M50 30 Q40 44 46 62', C.pink) + face(74, 44, 0.7))
      ] },
    { id: 'vehicles', name: ['Vehicles', 'Kendaraan'], backgrounds: ['#FFE9DA', '#DCEBFA'], sounds: ['honk', 'whoosh', 'boop'], opener: 'garage', cover: 'garage', treat: 'fuel', pop: 'balloon',
      characters: [
        ch('car', 'Car', 'Mobil', 'honk', path('M30 56 L42 28 H78 L90 56Z', C.sky) + rect(8, 54, 104, 34, 12, C.red) + wheel(34, 90) + wheel(86, 90) + face(60, 68, 0.75)),
        ch('truck', 'Truck', 'Truk', 'honk', rect(6, 30, 66, 56, 6, C.blue) + rect(72, 46, 42, 40, 8, C.yellow) + rect(84, 52, 20, 14, 4, C.sky) + wheel(30, 90) + wheel(90, 90) + face(38, 56, 0.8)),
        ch('train', 'Train', 'Kereta', 'whoosh', rect(70, 18, 18, 26, 3, C.dark) + rect(12, 22, 48, 66, 8, C.red) + rect(56, 44, 54, 44, 10, C.blue) + rect(22, 32, 28, 22, 5, C.sky) + wheel(30, 92) + wheel(66, 92) + wheel(96, 92) + face(84, 62, 0.65)),
        ch('digger', 'Digger', 'Ekskavator', 'boop', path('M64 50 L96 22 L114 50', 'none') + path('M108 44 L116 66 L96 64Z', C.dark) + rect(14, 36, 54, 40, 8, C.yellow) + rect(8, 76, 80, 22, 11, C.dark) + circle(22, 87, 5, C.cream) + circle(48, 87, 5, C.cream) + circle(74, 87, 5, C.cream) + face(40, 52, 0.75)),
        ch('plane', 'Plane', 'Pesawat', 'whoosh', path('M46 60 L30 100 L58 90 L78 60Z', C.blue) + path('M20 44 L8 18 L34 40Z', C.coral) + path('M10 58 Q10 36 40 36 H88 Q116 44 114 58 Q112 72 88 72 H36 Q10 72 10 58Z', C.white) + face(84, 52, 0.7)),
        ch('boat', 'Boat', 'Perahu', 'splash', path('M56 12 V64') + path('M60 16 L100 60 H60Z', C.coral) + path('M8 68 H112 Q102 106 84 106 H34 Q18 106 8 68Z', C.yellow) + face(60, 84, 0.8)),
        ch('bus', 'Bus', 'Bus', 'honk', rect(6, 26, 108, 62, 12, C.yellow) + rect(16, 36, 24, 18, 4, C.sky) + rect(48, 36, 24, 18, 4, C.sky) + rect(80, 36, 24, 18, 4, C.sky) + wheel(32, 90) + wheel(88, 90) + face(60, 70, 0.6)),
        ch('helicopter', 'Helicopter', 'Helikopter', 'whoosh', path('M16 16 H104') + path('M60 16 V30') + path('M84 62 L114 54 L110 74Z', C.lilac) + ell(52, 60, 42, 30, C.lilac) + path('M28 96 H80M40 88 V96M68 88 V96') + face(40, 56, 0.75)),
        ch('firetruck', 'Fire truck', 'Mobil pemadam', 'honk', path('M16 40 L74 24', 'none') + rect(6, 42, 70, 44, 6, C.red) + rect(76, 34, 38, 52, 8, C.red) + rect(86, 42, 20, 16, 4, C.sky) + rect(84, 22, 14, 12, 3, C.blue) + wheel(30, 90) + wheel(90, 90) + face(40, 62, 0.75))
      ] },
    { id: 'weather', name: ['Weather and sky', 'Cuaca dan langit'], backgrounds: ['#DCEBFA', '#FFF1C7'], sounds: ['sparkle', 'plop', 'whoosh'], opener: 'cloud', cover: 'cloud', treat: 'star', pop: 'balloon',
      characters: [
        ch('sun', 'Smiling sun', 'Matahari tersenyum', 'sparkle', path('M60 4 V20M60 100 V116M4 60 H20M100 60 H116M20 20 L32 32M88 88 L100 100M20 100 L32 88M88 32 L100 20') + circle(60, 60, 36, C.yellow) + face(60, 56)),
        ch('rainbow', 'Rainbow', 'Pelangi', 'sparkle', path('M8 92 A52 52 0 0 1 112 92 H96 A36 36 0 0 0 24 92Z', C.coral) + path('M24 92 A36 36 0 0 1 96 92 H82 A22 22 0 0 0 38 92Z', C.yellow) + path('M38 92 A22 22 0 0 1 82 92Z', C.blue) + ell(20, 94, 18, 12, C.white) + ell(100, 94, 18, 12, C.white) + face(60, 80, 0.55)),
        ch('cloud', 'Cloud', 'Awan', 'whoosh', path('M26 92 Q2 88 8 64 Q12 44 34 48 Q40 18 68 24 Q94 26 92 52 Q118 54 112 78 Q108 94 90 92Z', C.white) + face(60, 66)),
        ch('balloon', 'Balloon', 'Balon', 'boop', path('M60 88 Q52 100 62 116') + path('M54 88 H66 L60 80Z', C.coral) + ell(60, 44, 36, 42, C.coral) + face(60, 42)),
        ch('raindrop', 'Raindrop', 'Tetes hujan', 'plop', path('M60 6 Q100 56 94 80 Q88 110 60 110 Q32 110 26 80 Q20 56 60 6Z', C.blue) + face(60, 74, 0.9)),
        ch('skystar', 'Star', 'Bintang', 'sparkle', star(60, 62, 50, C.yellow) + face(60, 62, 0.9)),
        ch('snowflake', 'Snowflake', 'Kepingan salju', 'sparkle', path('M60 6 V114M14 32 L106 88M14 88 L106 32M60 24 L50 14M60 24 L70 14M60 96 L50 106M60 96 L70 106') + circle(60, 60, 24, C.sky) + face(60, 58, 0.65)),
        ch('lightning', 'Friendly lightning', 'Petir ramah', 'whoosh', path('M70 6 L26 66 H54 L44 114 L94 48 H64Z', C.yellow) + face(60, 58, 0.55)),
        ch('umbrella', 'Umbrella', 'Payung', 'plop', path('M60 62 V102 Q60 114 72 112') + path('M10 62 Q14 12 60 12 Q106 12 110 62 Q94 50 78 62 Q60 50 42 62 Q26 50 10 62Z', C.lilac) + face(60, 38, 0.8))
      ] }
  ];

  function all() { return THEMES.reduce(function (acc, t) { return acc.concat(t.characters.map(function (c) { return Object.assign({ theme: t.id }, c); })); }, []); }
  // no choice means all six
  function chosen(ids) { var pick = THEMES.filter(function (t) { return (ids || []).indexOf(t.id) >= 0; }); return pick.length ? pick : THEMES; }
  function pool(ids) { return chosen(ids).reduce(function (acc, t) { return acc.concat(t.characters.map(function (c) { return Object.assign({ theme: t.id }, c); })); }, []); }
  function svg(c, cls) { return '<svg class="' + (cls || 'dtt-char') + '" viewBox="0 0 120 120" aria-hidden="true">' + c.art + '</svg>'; }

  return { THEMES: THEMES, all: all, chosen: chosen, pool: pool, svg: svg, star: star, circle: circle, path: path, rect: rect, ell: ell, face: face, INK: INK, C: C };
});
