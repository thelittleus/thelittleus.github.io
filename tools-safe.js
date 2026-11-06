/* Little Us · Safe People Map
   A child and a grown-up fill this in together, side by side, to show who the child trusts. Every map starts empty.
   People are drawn in the same style as the Conversation Starters characters (two-tone fills, ink outline, shiny eyes).
   Without an account the map stays in this browser. With an account it is saved privately (table safe_maps, private
   bucket safe-people; see supabase/safe-people-setup.sql). Loaded only when /tools/safe-people is opened. */
(function () {
  'use strict';
  if (!window.LUTools || !LUTools.register || window.LUSafe) return;
  var X = LUTools.api;
  function isId() { return X.L() === 'id'; }
  function t(en, id) { return isId() ? id : en; }
  function pick(a) { return a[isId() ? 1 : 0]; }

  /* ===================== drawing helpers (same recipe as the Conversation Starters characters) ===================== */
  var K = '#2B2A35';
  var LW = ' stroke="' + K + '" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"';
  var W2 = ' stroke="' + K + '" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"';
  function st(w) { return ' stroke="' + K + '" stroke-width="' + (w || 3) + '" stroke-linejoin="round" stroke-linecap="round"'; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function polar(cx, cy, r, a) { var q = a * Math.PI / 180; return [cx + r * Math.sin(q), cy - r * Math.cos(q)]; }
  function shade(h, a) {
    h = String(h).replace('#', ''); if (h.length === 3) h = h.replace(/./g, '$&$&');
    return '#' + [0, 2, 4].map(function (i) { var v = parseInt(h.substr(i, 2), 16); v = a < 0 ? v * (1 + a) : v + (255 - v) * a; v = Math.max(0, Math.min(255, Math.round(v))).toString(16); return v.length < 2 ? '0' + v : v; }).join('');
  }
  function SE(cx, cy, rx, ry, col, rot, noHi) {
    return '<g' + (rot ? ' transform="rotate(' + rot + ' ' + cx + ' ' + cy + ')"' : '') + '><ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="' + shade(col, -.2) + '"' + LW + '/><ellipse cx="' + (cx - 1.3) + '" cy="' + (cy - 1.5) + '" rx="' + Math.max(1, rx - 2.2) + '" ry="' + Math.max(1, ry - 2.2) + '" fill="' + col + '"/>' +
      (noHi ? '' : '<ellipse cx="' + (cx - rx * .38) + '" cy="' + (cy - ry * .45) + '" rx="' + (rx * .24) + '" ry="' + (ry * .14) + '" fill="#fff" opacity=".5" transform="rotate(-30 ' + (cx - rx * .38) + ' ' + (cy - ry * .45) + ')"/>') + '</g>';
  }
  function SP(d, col, cx, cy, k) {
    return '<path d="' + d + '" fill="' + shade(col, -.2) + '"' + LW + '/><path d="' + d + '" fill="' + col + '" transform="translate(' + (cx - 1.2) + ' ' + (cy - 1.4) + ') scale(' + (k || .93) + ') translate(' + (-cx) + ' ' + (-cy) + ')"/>';
  }

  /* ===================== characters ===================== */
  var SK = { a: '#F7D3B7', b: '#F3C9A5', c: '#EDB894', d: '#C98E64', e: '#8D5B3F', f: '#6B4430' };
  var HC = { brown: '#7A4E35', black: '#3A3540', dark: '#4A3B3F', grey: '#C9CED6', blond: '#E5BE93', red: '#C9653F' };
  var GROUPS = [
    { id: 'family', name: ['Family', 'Keluarga'], face: 'f1' }, { id: 'school', name: ['School', 'Sekolah'], face: 's1' },
    { id: 'helpers', name: ['Helpers', 'Penolong'], face: 'h5' }, { id: 'friends', name: ['Friends', 'Teman'], face: 'r1' }
  ];
  var LIB = [
    ['f1', 'family', { skin: 'a', hair: 'long', hc: 'brown', shirt: '#F7A08C', bg: '#FBE0E6' }],
    ['f2', 'family', { skin: 'c', hair: 'short', hc: 'dark', shirt: '#7DB3E8', bg: '#DCEBFA', beard: 1 }],
    ['f3', 'family', { skin: 'd', hijab: '#B9A3E3', shirt: '#B9A3E3', bg: '#E9E1F7' }],
    ['f4', 'family', { skin: 'e', hair: 'afro', hc: 'black', shirt: '#F0694F', bg: '#FFE9DA' }],
    ['f13', 'family', { skin: 'b', hair: 'long', hc: 'black', shirt: '#7FCB98', bg: '#DDF2E4' }],
    ['f12', 'family', { skin: 'b', hair: 'short', hc: 'brown', shirt: '#F7A08C', bg: '#FFE9DA', glasses: 1, chair: 1 }],
    ['f5', 'family', { skin: 'a', hair: 'bun', hc: 'grey', shirt: '#B9A3E3', bg: '#E9E1F7', glasses: 1, age: 'old' }],
    ['f6', 'family', { skin: 'd', hair: 'bald', hc: 'grey', shirt: '#7FCB98', bg: '#DDF2E4', glasses: 1, beard: 1, age: 'old' }],
    ['f7', 'family', { skin: 'e', hair: 'curly', hc: 'grey', shirt: '#FFC94A', bg: '#FFF1C7', age: 'old' }],
    ['f8', 'family', { skin: 'a', hair: 'ponytail', hc: 'red', shirt: '#7FCB98', bg: '#DDF2E4', age: 'teen' }],
    ['f9', 'family', { skin: 'c', hair: 'spiky', hc: 'black', shirt: '#7DB3E8', bg: '#DCEBFA', age: 'teen', role: 'hoodie' }],
    ['f10', 'family', { skin: 'e', hair: 'braids', hc: 'black', shirt: '#F6B3C2', bg: '#FBE0E6', age: 'kid' }],
    ['f11', 'family', { skin: 'a', hair: 'curly', hc: 'blond', shirt: '#FFC94A', bg: '#FFF1C7', age: 'kid' }],
    ['s1', 'school', { skin: 'd', hair: 'curly', hc: 'dark', shirt: '#FFC94A', bg: '#FFF1C7', glasses: 1, role: 'teacher' }],
    ['s2', 'school', { skin: 'a', hair: 'short', hc: 'blond', shirt: '#7DB3E8', bg: '#DCEBFA', beard: 1, role: 'teacher' }],
    ['s3', 'school', { skin: 'c', hijab: '#3E5A8A', shirt: '#7DB3E8', bg: '#DCEBFA', role: 'teacher' }],
    ['s4', 'school', { skin: 'e', hair: 'bun', hc: 'black', shirt: '#F7A08C', bg: '#FBE0E6', role: 'teacher' }],
    ['s6', 'school', { skin: 'd', hair: 'bald', hc: 'dark', shirt: '#B9A3E3', bg: '#E9E1F7', beard: 1, role: 'teacher' }],
    ['s5', 'school', { skin: 'b', hair: 'short', hc: 'grey', shirt: '#7FCB98', bg: '#DDF2E4', age: 'old', role: 'apron' }],
    ['s7', 'school', { skin: 'a', hair: 'short', hc: 'brown', shirt: '#7FCB98', bg: '#DDF2E4', age: 'kid', glasses: 1 }],
    ['s8', 'school', { skin: 'b', hair: 'ponytail', hc: 'black', shirt: '#F6B3C2', bg: '#FBE0E6', age: 'kid', chair: 1 }],
    ['s9', 'school', { skin: 'e', hair: 'afro', hc: 'black', shirt: '#FFC94A', bg: '#FFF1C7', age: 'kid' }],
    ['h1', 'helpers', { skin: 'c', hair: 'long', hc: 'dark', shirt: '#FFFFFF', bg: '#DDF2E4', role: 'doctor' }],
    ['h2', 'helpers', { skin: 'e', hair: 'short', hc: 'black', shirt: '#FFFFFF', bg: '#DCEBFA', beard: 1, glasses: 1, role: 'doctor' }],
    ['h3', 'helpers', { skin: 'a', hair: 'spiky', hc: 'brown', shirt: '#7DB3E8', bg: '#DCEBFA', role: 'nurse' }],
    ['h4', 'helpers', { skin: 'd', hijab: '#7FCB98', shirt: '#7FCB98', bg: '#DDF2E4', role: 'nurse' }],
    ['h5', 'helpers', { skin: 'b', hair: 'bun', hc: 'black', shirt: '#3E5A8A', bg: '#DCEBFA', role: 'police' }],
    ['h6', 'helpers', { skin: 'd', hair: 'short', hc: 'dark', shirt: '#3E5A8A', bg: '#E6F0FB', role: 'police' }],
    ['h7', 'helpers', { skin: 'a', hair: 'long', hc: 'red', shirt: '#F7A08C', bg: '#FFE9DA', role: 'fire' }],
    ['h8', 'helpers', { skin: 'c', hair: 'bald', hc: 'grey', shirt: '#B98157', bg: '#FFF1C7', beard: 1, age: 'old', role: 'cap' }],
    ['h9', 'helpers', { skin: 'e', hair: 'long', hc: 'grey', shirt: '#B9A3E3', bg: '#E9E1F7', glasses: 1, age: 'old' }],
    ['h10', 'helpers', { skin: 'b', hair: 'short', hc: 'black', shirt: '#FFC94A', bg: '#FFF1C7', role: 'apron' }],
    ['r1', 'friends', { skin: 'e', hair: 'curly', hc: 'black', shirt: '#F7A08C', bg: '#FFE9DA', age: 'kid' }],
    ['r2', 'friends', { skin: 'a', hair: 'spiky', hc: 'blond', shirt: '#7DB3E8', bg: '#DCEBFA', age: 'kid', glasses: 1 }],
    ['r3', 'friends', { skin: 'c', hijab: '#F6B3C2', shirt: '#F6B3C2', bg: '#FBE0E6', age: 'teen' }],
    ['r4', 'friends', { skin: 'd', hair: 'short', hc: 'black', shirt: '#FFC94A', bg: '#FFF1C7', age: 'kid', chair: 1 }],
    ['r5', 'friends', { skin: 'e', hair: 'braids', hc: 'black', shirt: '#B9A3E3', bg: '#E9E1F7', age: 'teen' }],
    ['r6', 'friends', { skin: 'a', hair: 'bun', hc: 'brown', shirt: '#7FCB98', bg: '#DDF2E4', age: 'kid' }],
    ['r7', 'friends', { skin: 'b', hair: 'curly', hc: 'dark', shirt: '#F0694F', bg: '#FFE9DA', age: 'teen', role: 'hoodie' }],
    ['r8', 'friends', { skin: 'c', hair: 'short', hc: 'brown', shirt: '#7FCB98', bg: '#DDF2E4', age: 'kid' }]
  ];
  var CH = {}; LIB.forEach(function (l) { CH[l[0]] = l[2]; });
  var TAGCOLS = ['#FFC94A', '#F7A08C', '#7FCB98', '#7DB3E8', '#B9A3E3', '#F6B3C2'];
  // tiles have no words, so each one gets a label for screen readers
  function charLabel(c) {
    var ROLE = { teacher: ['Teacher', 'Guru'], doctor: ['Doctor', 'Dokter'], nurse: ['Nurse', 'Perawat'], police: ['Police officer', 'Polisi'], fire: ['Firefighter', 'Pemadam kebakaran'], cap: ['Neighbour', 'Tetangga'], apron: ['Helper', 'Petugas'] };
    if (ROLE[c.role]) return pick(ROLE[c.role]);
    return pick({ kid: ['Child', 'Anak'], teen: ['Teenager', 'Remaja'], old: ['Grandparent', 'Kakek atau nenek'] }[c.age] || ['Grown-up', 'Orang dewasa']);
  }
  function initials(n) { n = String(n || '').trim(); if (!n) return '?'; var w = n.split(/\s+/); return (w.length > 1 && /^(mr|ms|mrs|dr|miss|bu|pak)$/i.test(w[0].replace('.', '')) ? w[1][0] : w[0][0]).toUpperCase(); }

  // a whole person, in the same 100 × 128 box and proportions as the Conversation Starters characters
  function personInner(c) {
    var skin = SK[c.skin] || c.skin, hc = HC[c.hc] || c.hc || K, shirt = c.shirt, s = '', back = '', head = '', hats = '';
    var eyeY = c.hijab ? 45 : 44, gap = c.hijab ? 9 : 11, chX = c.hijab ? 15 : 18;
    if (c.role === 'hoodie') back += SP('M16 52C14 20 86 20 84 52 86 74 72 84 50 84 28 84 14 74 16 52Z', shirt, 50, 54);
    if (!c.hijab) {
      if (c.hair === 'long') back += SP('M19 46C15 14 35 9 50 9 65 9 85 14 81 46L85 82C78 88 69 86 67 78H33C31 86 22 88 15 82Z', hc, 50, 48);
      if (c.hair === 'bun') back += SE(50, 11, 11, 10, hc);
      if (c.hair === 'afro') back += SE(50, 34, 38, 33, hc);
      if (c.hair === 'ponytail') back += SP('M72 20C92 18 96 38 88 60 84 50 80 42 72 36Z', hc, 82, 38);
      if (c.hair === 'braids') back += SE(19, 62, 6, 15, hc, 0, 1) + SE(81, 62, 6, 15, hc, 0, 1) + SE(19, 80, 4, 3.5, '#F7A08C', 0, 1) + SE(81, 80, 4, 3.5, '#F7A08C', 0, 1);
    }
    var feet = shade(shirt === '#FFFFFF' ? '#7DB3E8' : shirt, -.28);
    var body = SE(40, 105, 8.5, 4.6, feet, 0, 1) + SE(60, 105, 8.5, 4.6, feet, 0, 1) + SE(50, 90, 20, 16, shirt);
    if (c.role === 'teacher') body += '<path d="M42 76L50 88L58 76" fill="none"' + W2 + '/><rect x="45" y="87" width="10" height="11" rx="2" fill="#fff"' + W2 + '/>';
    if (c.role === 'doctor') body += '<path d="M50 76V105M43 76L50 88 57 76" fill="none"' + W2 + '/><path d="M40 78C36 92 44 98 52 95" fill="none" stroke="#5E7FA8" stroke-width="2.6" stroke-linecap="round"/><circle cx="54" cy="94" r="3.2" fill="#C9CED6"' + W2 + '/>';
    if (c.role === 'nurse') body += '<path d="M42 76L50 86L58 76" fill="none"' + W2 + '/><path d="M58 90h7M61.5 86.500v7" fill="none" stroke="#F0694F" stroke-width="2.8" stroke-linecap="round"/>';
    if (c.role === 'police') body += '<path d="M43 76L50 84L57 76" fill="none"' + W2 + '/><path d="M60 86l1.7 3.6 3.9.5-2.9 2.700.8 3.900-3.500-2-3.500 2 .8-3.900-2.900-2.700 3.900-.5z" fill="#FFC94A"' + st(1.6) + '/>';
    if (c.role === 'fire') body += '<path d="M31.500 90H68.500M33 98H67" fill="none" stroke="#FFE29A" stroke-width="3.6" stroke-linecap="round"/>';
    if (c.role === 'hoodie') body += '<path d="M45 76V88M55 76V88" fill="none"' + W2 + '/>';
    if (c.role === 'apron') body += '<rect x="38" y="82" width="24" height="23" rx="4" fill="#fff"' + W2 + '/><path d="M44 92h12" fill="none"' + W2 + '/>';
    body += SE(31, 88, 5.5, 10, shirt, 25, 1) + SE(69, 88, 5.5, 10, shirt, -25, 1) + SE(26.500, 97, 4.2, 4.2, skin, 0, 1) + SE(73.500, 97, 4.2, 4.2, skin, 0, 1);
    if (c.hijab) {
      head += SP('M17 50C13 16 33 7 50 7 67 7 87 16 83 50 85 72 70 86 50 86 30 86 15 72 17 50Z', c.hijab, 50, 48) + SE(50, 46, 21, 23, skin, 0, 1);
    } else {
      head += SE(21, 47, 4.5, 5.5, skin, 0, 1) + SE(79, 47, 4.5, 5.5, skin, 0, 1) + SE(50, 44, 29, 27, skin);
      if (c.beard) head += SP('M22 48C23 68 38 76 50 76 62 76 77 68 78 48 72 58 62 60 50 60 38 60 28 58 22 48Z', hc, 50, 62);
      if (c.hair === 'short') head += SP('M21 44C18 18 36 11 52 12 70 13 82 26 79 44 74 33 66 28 56 30 45 32 31 33 21 44Z', hc, 50, 26);
      if (c.hair === 'long' || c.hair === 'bun' || c.hair === 'ponytail' || c.hair === 'braids') head += SP('M21 46C18 20 36 12 50 12 64 12 82 20 79 46 72 34 60 28 49 31 38 33 28 38 21 46Z', hc, 50, 27);
      if (c.hair === 'curly') [[25, 33, 8], [33, 23, 9], [44, 17, 9.500], [56, 17, 9.500], [67, 23, 9], [75, 33, 8]].forEach(function (q) { head += SE(q[0], q[1], q[2], q[2], hc, 0, 1); });
      if (c.hair === 'bald') head += SE(22, 37, 4, 7, hc, 0, 1) + SE(78, 37, 4, 7, hc, 0, 1);
      if (c.hair === 'spiky') head += SP('M21 42L22 22 31 28 35 13 44 24 52 10 59 24 69 16 72 28 79 26 79 42C72 33 62 30 50 31 38 31 28 35 21 42Z', hc, 50, 26);
      if (c.hair === 'afro') head += '<path d="M28 30C36 24 44 23 50 25 56 23 64 24 72 30" fill="none"' + W2 + '/>';
    }
    if (c.role === 'police') hats += SP('M20 33C22 7 78 7 80 33Z', '#3E5A8A', 50, 22) + '<path d="M15 34C32 28 68 28 85 34 85 39 15 39 15 34Z" fill="#2F3F66"' + W2 + '/><circle cx="50" cy="22" r="3.600" fill="#FFC94A"' + st(1.8) + '/>';
    if (c.role === 'fire') hats += SP('M19 34C19 4 81 4 81 34Z', '#F0694F', 50, 22) + '<path d="M12 35C30 29 70 29 88 35 88 40 12 40 12 35Z" fill="#C2462E"' + W2 + '/><path d="M50 8V30" fill="none"' + W2 + '/>';
    if (c.role === 'cap') hats += SP('M22 31C24 9 76 9 78 29L92 33C80 38 40 37 22 33Z', '#B98157', 50, 24);
    var eye = function (x) { return '<ellipse cx="' + x + '" cy="' + eyeY + '" rx="3.800" ry="4.600" fill="' + K + '"/><circle cx="' + (x - 1.3) + '" cy="' + (eyeY - 1.8) + '" r="1.500" fill="#fff"/>'; };
    var face = eye(50 - gap) + eye(50 + gap) + '<ellipse cx="' + (50 - chX) + '" cy="' + (eyeY + 9) + '" rx="4.500" ry="3" fill="#F0694F" opacity=".32"/><ellipse cx="' + (50 + chX) + '" cy="' + (eyeY + 9) + '" rx="4.500" ry="3" fill="#F0694F" opacity=".32"/>';
    face += c.age === 'kid' ? '<path d="M44 55q6 8 12 0z" fill="#B23A2B"' + st(2.2) + '/>' : '<path d="M45 56q5 4 10 0" stroke="' + K + '" stroke-width="2.600" fill="none" stroke-linecap="round"/>';
    if (c.age === 'old') face += '<path d="M' + (50 - gap - 8) + ' 39l-3-2M' + (50 + gap + 8) + ' 39l3-2" fill="none"' + st(2) + '/>';
    if (c.glasses) face += '<circle cx="' + (50 - gap) + '" cy="' + eyeY + '" r="7.500" fill="#fff" fill-opacity=".22"' + st(2.4) + '/><circle cx="' + (50 + gap) + '" cy="' + eyeY + '" r="7.500" fill="#fff" fill-opacity=".22"' + st(2.4) + '/><path d="M' + (50 - gap + 7.5) + ' ' + eyeY + 'H' + (50 + gap - 7.5) + '" fill="none"' + st(2.4) + '/>';
    var k = c.age === 'kid' ? .86 : c.age === 'teen' ? .94 : 1;
    var inner = back + body + head + hats + face;
    if (c.chair) {
      // sitting in a wheelchair: the big wheel and footrest sit in front of the person
      s += '<ellipse cx="50" cy="111" rx="36" ry="4.500" fill="' + K + '" opacity=".16"/>';
      s += '<path d="M82 52V88" fill="none" stroke="' + K + '" stroke-width="6.500" stroke-linecap="round"/><path d="M82 52V88" fill="none" stroke="#7DB3E8" stroke-width="2.800" stroke-linecap="round"/>';
      s += '<g transform="translate(47 100) scale(' + (k * .84) + ') translate(-50 -106)">' + inner + '</g>';
      s += '<path d="M20 92H78" fill="none" stroke="' + K + '" stroke-width="7" stroke-linecap="round"/><path d="M20 92H78" fill="none" stroke="#7DB3E8" stroke-width="3.400" stroke-linecap="round"/>';
      s += '<path d="M14 106H34" fill="none" stroke="' + K + '" stroke-width="6" stroke-linecap="round"/><path d="M14 106H34" fill="none" stroke="#7DB3E8" stroke-width="2.600" stroke-linecap="round"/>';
      s += '<circle cx="62" cy="94" r="16" fill="#fff"' + st(3.400) + '/><circle cx="62" cy="94" r="10.500" fill="none" stroke="#C9CED6" stroke-width="2.600"/><circle cx="62" cy="94" r="3" fill="' + K + '"/>';
      s += '<circle cx="26" cy="108" r="4.500" fill="#fff"' + st(2.4) + '/>';
      return s;
    }
    s += '<ellipse cx="50" cy="109" rx="24" ry="4.500" fill="' + K + '" opacity=".16"/>';
    return s + (k === 1 ? inner : '<g transform="translate(50 110) scale(' + k + ') translate(-50 -110)">' + inner + '</g>');
  }
  var FULL = {};
  function fullSVG(id, extra) {
    var c = CH[id] || CH.f1;
    return FULL[id] || (FULL[id] = '<svg viewBox="0 -14 100 128" style="width:100%;height:100%;display:block;overflow:visible" aria-hidden="true">' + personInner(c) + '</svg>');
  }
  function photoSrc(av) { return (av && av.pid && X.PH[av.pid]) || ''; }
  // the round picture of a person: head and shoulders, or the whole chair so the wheelchair still shows
  function avatarInner(av) {
    if (av && av.kind === 'photo') {
      var src = photoSrc(av);
      if (!src) return '<rect width="100" height="100" fill="#EAE2D4"/><circle cx="50" cy="40" r="16" fill="#D3C7B3"/><path d="M18 100C18 72 34 62 50 62 66 62 82 72 82 100Z" fill="#D3C7B3"/>';
      return '<rect width="100" height="100" fill="#EFE9DF"/><image href="' + src + '" width="100" height="100" preserveAspectRatio="xMidYMid slice"/>';
    }
    if (av && av.kind === 'name') return '<rect width="100" height="100" fill="' + (av.col || TAGCOLS[0]) + '"/><text x="50" y="65" text-anchor="middle" font-family="Fredoka, Figtree, sans-serif" font-size="40" font-weight="600" fill="' + K + '">' + esc(initials(av.name)) + '</text>';
    var c = CH[(av && av.c) || 'f1'] || CH.f1;
    return '<rect width="100" height="100" fill="' + c.bg + '"/><svg x="0" y="0" width="100" height="100" viewBox="' + (c.chair ? '-14 -14 128 128' : '6 -2 88 88') + '">' + personInner(c) + '</svg>';
  }
  var AVC = {};
  function avatarSVG(av) {
    var key = av && av.kind === 'photo' ? 'p' + av.pid + (photoSrc(av) ? 1 : 0) : av && av.kind === 'name' ? 'n' + (av.col || '') + initials(av.name) : 'i' + ((av && av.c) || 'f1');
    if (AVC[key]) return AVC[key];
    var id = 'spmav' + key.replace(/[^a-z0-9]/gi, '');
    return (AVC[key] = '<svg viewBox="0 0 100 100" width="100%" height="100%" style="display:block" aria-hidden="true"><defs><clipPath id="' + id + '"><circle cx="50" cy="50" r="46"/></clipPath></defs><g clip-path="url(#' + id + ')">' + avatarInner(av) + '</g><circle cx="50" cy="50" r="44" fill="none" stroke="#fff" stroke-width="3"/><circle cx="50" cy="50" r="46.500" fill="none"' + st(3.400) + '/></svg>');
  }

  /* ===================== themes and layouts ===================== */
  var THEMES = {
    plain: { id: 'plain', name: ['Plain', 'Polos'], sub: ['Soft and simple', 'Lembut dan sederhana'], bg: '#FBF8F3', ground: '#EFE7DA', disc: '#FFC94A', roof: '#F7A08C', bus: '#FFD36B', palm: '#FFF8EC', crust: '#E5BE93',
      palettes: [
        { name: ['Sunny', 'Cerah'], c: ['#FFE29A', '#FFD9C4', '#CDEBD6', '#CFE3F7', '#E2D7F5', '#F9D3DC'] },
        { name: ['Sky', 'Langit'], c: ['#A9D0F3', '#CFE3F7', '#E6F0FB', '#CDEBD6', '#E2D7F5', '#FFE29A'] },
        { name: ['Meadow', 'Padang'], c: ['#B4E0C2', '#D3EEDC', '#ECF7EF', '#FFE29A', '#CFE3F7', '#F9D3DC'] },
        { name: ['Berry', 'Beri'], c: ['#F6B9C8', '#F9D3DC', '#FCEBEF', '#E2D7F5', '#FFE29A', '#CFE3F7'] }] },
    dino: { id: 'dino', name: ['Dinosaur nest', 'Sarang dinosaurus'], sub: ['Everyone is a dinosaur', 'Semua jadi dinosaurus'], bg: '#EDF5E6', ground: '#D3E8C2', disc: '#F3E4C8', roof: '#9FD3AE', bus: '#B9DDA1', palm: '#FFF8EC', crust: '#D9B98F', dino: 1,
      palettes: [
        { name: ['Jungle', 'Hutan'], c: ['#F3E4C8', '#CFE7B8', '#B0D896', '#FFE29A', '#CFE3F7', '#F9D3DC'] },
        { name: ['Volcano', 'Gunung api'], c: ['#FFE29A', '#FFC9A8', '#F3E4C8', '#CFE7B8', '#E2D7F5', '#F9D3DC'] },
        { name: ['Swamp', 'Rawa'], c: ['#D9EFD9', '#BFE3C8', '#9FD3AE', '#F3E4C8', '#CFE3F7', '#FFE29A'] }] },
    car: { id: 'car', name: ['Car garage', 'Garasi mobil'], sub: ['Everyone drives a car', 'Semua menyetir mobil'], bg: '#EEF1F5', ground: '#D5DCE6', disc: '#FFC94A', roof: '#7DB3E8', bus: '#7DB3E8', palm: '#FFFFFF', crust: '#C9D1DC', car: 1,
      palettes: [
        { name: ['Road', 'Jalan'], c: ['#E3E8EF', '#CBD3DE', '#B4BFCD', '#FFE29A', '#CFE3F7', '#F9D3DC'] },
        { name: ['Racing', 'Balap'], c: ['#FFE29A', '#FFD9C4', '#CBD3DE', '#CFE3F7', '#E2D7F5', '#F9D3DC'] },
        { name: ['Night', 'Malam'], c: ['#CFE3F7', '#B9CBE4', '#A3B4D0', '#FFE29A', '#E2D7F5', '#F9D3DC'] }] }
  };
  var BUDDY = ['#7FCB98', '#7DB3E8', '#FFC94A', '#F7A08C', '#B9A3E3', '#F6B3C2'];
  var LAYOUTS = [
    { id: 'circles', name: ['Circles', 'Lingkaran'], sub: ['Closer or further away', 'Lebih dekat atau lebih jauh'], group: ['Rings', 'Cincin'], zones: [['Middle ring', 'Cincin tengah'], ['Second ring', 'Cincin kedua'], ['Outside ring', 'Cincin luar']], caps: [5, 8, 12], labels: [['I tell them anything', 'Aku cerita apa saja'], ['I can ask for help', 'Aku bisa minta tolong'], ['I say hi', 'Aku menyapa']] },
    { id: 'hand', name: ['Five-finger hand', 'Lima jari'], sub: ['Five go-to people', 'Lima orang andalan'], group: ['Fingers', 'Jari'], zones: [['Thumb', 'Ibu jari'], ['Pointer finger', 'Jari telunjuk'], ['Middle finger', 'Jari tengah'], ['Ring finger', 'Jari manis'], ['Little finger', 'Jari kelingking']], caps: [1, 1, 1, 1, 1], labels: [['At home', 'Di rumah'], ['At home', 'Di rumah'], ['At school', 'Di sekolah'], ['Outside my family', 'Di luar keluarga'], ['I can call them', 'Bisa kutelepon']] },
    { id: 'house', name: ['House', 'Rumah'], sub: ['Someone in each room', 'Seseorang di tiap ruangan'], group: ['Rooms', 'Ruangan'], zones: [['Top left room', 'Ruang kiri atas'], ['Top right room', 'Ruang kanan atas'], ['Bottom left room', 'Ruang kiri bawah'], ['Bottom right room', 'Ruang kanan bawah']], caps: [3, 3, 3, 3], labels: [['My bedroom', 'Kamarku'], ['Kitchen', 'Dapur'], ['Living room', 'Ruang keluarga'], ['Front door', 'Pintu depan']] },
    { id: 'tree', name: ['Tree', 'Pohon'], sub: ['Closest on the trunk', 'Paling dekat di batang'], group: ['Tree parts', 'Bagian pohon'], zones: [['Trunk', 'Batang'], ['Branches', 'Dahan'], ['Leaves', 'Daun']], caps: [2, 4, 6], labels: [['Closest to me', 'Paling dekat'], ['I can ask for help', 'Aku bisa minta tolong'], ['I say hi', 'Aku menyapa']] },
    { id: 'bus', name: ['Bus', 'Bus'], sub: ['Everyone in a seat', 'Semua punya kursi'], group: ['Seats', 'Kursi'], zones: [['Front seats', 'Kursi depan'], ['Middle seats', 'Kursi tengah'], ['Back seats', 'Kursi belakang']], caps: [2, 2, 2], labels: [['Next to me', 'Di sebelahku'], ['In the middle', 'Di tengah'], ['At the back', 'Di belakang']] },
    { id: 'solar', name: ['Solar system', 'Tata surya'], sub: ['Your child is the sun', 'Anakmu jadi mataharinya'], group: ['Orbits', 'Orbit'], zones: [['Closest orbit', 'Orbit terdekat'], ['Middle orbit', 'Orbit tengah'], ['Far orbit', 'Orbit jauh']], caps: [4, 7, 10], labels: [['I tell them anything', 'Aku cerita apa saja'], ['I can ask for help', 'Aku bisa minta tolong'], ['I say hi', 'Aku menyapa']] },
    { id: 'castle', name: ['Castle', 'Istana'], sub: ['Closest inside the walls', 'Paling dekat di dalam tembok'], group: ['Castle parts', 'Bagian istana'], zones: [['Tower', 'Menara'], ['Inside the walls', 'Dalam tembok'], ['Outside', 'Luar']], caps: [2, 4, 4], labels: [['In my tower', 'Di menaraku'], ['Inside the walls', 'Dalam tembok'], ['Outside the gate', 'Di luar gerbang']] },
    { id: 'pizza', name: ['Pizza', 'Pizza'], sub: ['Home, school, out and about', 'Rumah, sekolah, di luar'], group: ['Slices', 'Potongan'], zones: [['Top slice', 'Potongan atas'], ['Right slice', 'Potongan kanan'], ['Left slice', 'Potongan kiri']], caps: [4, 4, 4], labels: [['Home', 'Rumah'], ['School', 'Sekolah'], ['Out and about', 'Di luar']] },
    { id: 'hero', name: ['Superhero team', 'Tim pahlawan'], sub: ['Everyone has a power', 'Semua punya kekuatan'], group: ['Powers', 'Kekuatan'], zones: [['Hero 1', 'Pahlawan 1'], ['Hero 2', 'Pahlawan 2'], ['Hero 3', 'Pahlawan 3'], ['Hero 4', 'Pahlawan 4'], ['Hero 5', 'Pahlawan 5'], ['Hero 6', 'Pahlawan 6']], caps: [1, 1, 1, 1, 1, 1], labels: [['Helps me when I’m sad', 'Menolong saat aku sedih'], ['Keeps me safe', 'Menjagaku aman'], ['Listens to me', 'Mendengarkanku'], ['Makes me laugh', 'Membuatku tertawa'], ['Helps me at school', 'Menolong di sekolah'], ['Comes when I call', 'Datang saat kupanggil']] }
  ];
  var LBY = {}; LAYOUTS.forEach(function (l) { LBY[l.id] = l; });
  // these layouts only come in the Plain theme
  var PLAIN_ONLY = { hand: 1, house: 1, tree: 1 };
  function themeFor(layout, theme) { return PLAIN_ONLY[layout] ? 'plain' : theme; }
  var PROMPTS = [
    ['Who could you tell if something felt wrong?', 'Kepada siapa kamu bisa cerita kalau ada sesuatu yang terasa tidak benar?'],
    ['Who helps you when you’re sad?', 'Siapa yang membantumu waktu kamu sedih?'],
    ['Who would you look for if you got lost?', 'Siapa yang akan kamu cari kalau kamu tersesat?'],
    ['Who makes you feel safe at school?', 'Siapa yang membuatmu merasa aman di sekolah?'],
    ['Who could you talk to about a worry?', 'Kepada siapa kamu bisa bercerita tentang hal yang membuatmu khawatir?']
  ];

  /* ===================== the map picture ===================== */
  function wrapText(s, max) {
    var w = String(s).split(' '), lines = [''], i;
    for (i = 0; i < w.length; i++) {
      var cur = lines[lines.length - 1];
      if (cur && (cur + ' ' + w[i]).length > max && lines.length < 2) lines.push(w[i]); else lines[lines.length - 1] = cur ? cur + ' ' + w[i] : w[i];
    }
    return lines;
  }
  function pill(x, y, s, o) {
    o = o || {}; var fs = o.fs || 12.5, lines = wrapText(s, o.max || 22), lh = fs + 3;
    var w = Math.max.apply(null, lines.map(function (l) { return l.length; })) * fs * 0.56 + 18, h = lines.length * lh + 8;
    var anchor = o.anchor || 'middle', x0 = anchor === 'start' ? x : x - w / 2;
    if (anchor === 'middle') x0 = Math.max(4, Math.min(396 - w, x0));
    var r = '<rect x="' + x0 + '" y="' + (y - h / 2) + '" width="' + w + '" height="' + h + '" rx="' + Math.min(h / 2, 11) + '" fill="#fff"' + st(1.8) + ' pointer-events="none"/>';
    lines.forEach(function (l, i) { r += '<text x="' + (x0 + w / 2) + '" y="' + (y - h / 2 + 4 + lh * (i + 1) - 3.5) + '" text-anchor="middle" font-size="' + fs + '" font-weight="700" fill="' + K + '" pointer-events="none">' + esc(l) + '</text>'; });
    return r;
  }
  function kidFig(x, y, h, g) {
    var w = h * 100 / 128, c = g === 'girl' ? { skin: 'b', hair: 'long', hc: 'dark', shirt: '#F6B3C2', age: 'kid' } : { skin: 'b', hair: 'short', hc: 'dark', shirt: '#7DB3E8', age: 'kid' };
    return '<svg x="' + (x - w / 2) + '" y="' + (y - h / 2) + '" width="' + w + '" height="' + h + '" viewBox="0 -14 100 128" pointer-events="none" style="overflow:visible">' + personInner(c) + '</svg>';
  }
  function kid(c, x, y, h) {
    var s = '';
    if (c.T.dino) {
      s += SE(x, y + h * 0.44, h * 0.42, h * 0.12, '#B98157', 0, 1);
      s += '<path d="M' + (x - h * 0.32) + ' ' + (y + h * 0.42) + 'L' + (x - h * 0.1) + ' ' + (y + h * 0.48) + 'M' + (x + h * 0.08) + ' ' + (y + h * 0.4) + 'L' + (x + h * 0.3) + ' ' + (y + h * 0.47) + '" fill="none" stroke="#7A4E35" stroke-width="2.4" stroke-linecap="round"/>';
      s += SE(x + h * 0.36, y + h * 0.32, h * 0.09, h * 0.12, '#FFF8EC', 0, 1);
    }
    s += kidFig(x, y, h, c.g);
    if (c.T.car) {
      var bw = h * 0.86, by = y + h * 0.12;
      s += '<g pointer-events="none"><rect x="' + (x - bw / 2) + '" y="' + by + '" width="' + bw + '" height="' + h * 0.3 + '" rx="' + h * 0.12 + '" fill="#C2462E"' + st(2.8) + '/><rect x="' + (x - bw / 2 + 2) + '" y="' + (by + 1.5) + '" width="' + (bw - 5) + '" height="' + (h * 0.3 - 5) + '" rx="' + h * 0.1 + '" fill="#F0694F"/>';
      s += '<circle cx="' + (x - bw * 0.28) + '" cy="' + (by + h * 0.31) + '" r="' + h * 0.08 + '" fill="' + K + '"/><circle cx="' + (x + bw * 0.28) + '" cy="' + (by + h * 0.31) + '" r="' + h * 0.08 + '" fill="' + K + '"/>';
      s += '<rect x="' + (x + bw * 0.3) + '" y="' + (by + h * 0.08) + '" width="' + h * 0.08 + '" height="' + h * 0.06 + '" rx="2" fill="#FFC94A"' + st(1.8) + '/></g>';
    }
    return s;
  }
  function decor(T) {
    var s = '';
    if (T.dino) {
      [[22, 384, 1], [378, 18, -1]].forEach(function (p) { [-42, 0, 42].forEach(function (a) { s += '<g transform="rotate(' + a + ' ' + p[0] + ' ' + p[1] + ')">' + SE(p[0], p[1] - 20 * p[2], 8, 22, '#9FD3AE', 0, 1) + '</g>'; }); });
      [[372, 360], [350, 384], [30, 30]].forEach(function (p) { s += '<g fill="#B9D6A3"><ellipse cx="' + p[0] + '" cy="' + p[1] + '" rx="5" ry="6"/><circle cx="' + (p[0] - 6) + '" cy="' + (p[1] - 8) + '" r="2.4"/><circle cx="' + p[0] + '" cy="' + (p[1] - 10) + '" r="2.4"/><circle cx="' + (p[0] + 6) + '" cy="' + (p[1] - 8) + '" r="2.4"/></g>'; });
    }
    if (T.car) {
      [[24, 380], [376, 380]].forEach(function (p) { s += SP('M' + (p[0] - 11) + ' ' + (p[1] + 8) + 'L' + p[0] + ' ' + (p[1] - 20) + 'L' + (p[0] + 11) + ' ' + (p[1] + 8) + 'Z', '#F0694F', p[0], p[1] - 2) + '<path d="M' + (p[0] - 6) + ' ' + (p[1] - 4) + 'H' + (p[0] + 6) + '" stroke="#fff" stroke-width="3"/><rect x="' + (p[0] - 15) + '" y="' + (p[1] + 7) + '" width="30" height="6" rx="2" fill="#F0694F"' + st(2.4) + '/>'; });
      s += '<g transform="translate(352 14)">' + [0, 1, 2, 3].map(function (i) { return '<rect x="' + (i % 2) * 9 + '" y="' + Math.floor(i / 2) * 9 + '" width="9" height="9" fill="' + (i % 3 === 0 ? K : '#fff') + '"/>'; }).join('') + '<rect width="18" height="18" fill="none"' + st(2) + '/><path d="M0 0V30" fill="none"' + st(2.4) + '/></g>';
    }
    return s;
  }
  function rings(counts, radii) {
    var placed = [];
    return counts.map(function (n, z) {
      if (!n) return [];
      var best = null, bd = -1e9;
      for (var ph = 0.02; ph < 1; ph += 0.04) {
        var pts = [], d = 1e9;
        for (var k = 0; k < n; k++) pts.push(polar(200, 200, radii[z], 50 + 260 * (k + ph) / n));
        pts.forEach(function (p) {
          if (p[0] > 368) d = Math.min(d, 40 - (p[0] - 368));
          if (p[0] < 32) d = Math.min(d, 40 - (32 - p[0]));
          if (p[1] > 348) d = Math.min(d, 40 - (p[1] - 348) * 2);
          placed.forEach(function (q) { d = Math.min(d, Math.hypot(p[0] - q[0], (p[1] - q[1]) * 1.3)); });
        });
        d -= Math.abs(ph - 0.5) * 4;
        if (d > bd) { bd = d; best = pts; }
      }
      placed = placed.concat(best);
      return best;
    });
  }
  // Each layout draws into c. c.Z(i, shape, fill, centre) makes a two-tone zone and remembers it for the "free spot" glow.
  var GEO = {
    circles: function (c) {
      var R = [44, 95, 148, 198], s = '', i;
      for (i = 2; i >= 0; i--) s += c.Z(i, '<circle cx="200" cy="200" r="' + R[i + 1] + '"', c.pal[i], [200, 200]);
      if (c.T.car) for (i = 0; i < 3; i++) s += '<circle cx="200" cy="200" r="' + (R[i] + R[i + 1]) / 2 + '" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="10 12" pointer-events="none"/>';
      s += SE(200, 200, 44, 44, c.T.disc) + kid(c, 200, 196, 76);
      var lab = '';
      for (i = 0; i < 3; i++) {
        var r = R[i + 1] - 16, id = c.uid + 'a' + i;
        lab += '<path id="' + id + '" d="M' + (200 - r) + ' 200A' + r + ' ' + r + ' 0 0 1 ' + (200 + r) + ' 200" fill="none"/><text font-size="13" font-weight="700" fill="' + K + '" stroke="#fff" stroke-width="4" paint-order="stroke" stroke-linejoin="round" pointer-events="none"><textPath href="#' + id + '" startOffset="50%" text-anchor="middle">' + esc(c.labels[i]) + '</textPath></text>';
      }
      return { svg: s, labels: lab, all: function (counts) { return rings(counts, [69.5, 121.5, 173]); } };
    },
    solar: function (c) {
      var O = [90, 140, 188], B = [48, 115, 165, 212], s = '<rect width="400" height="400" fill="#2F3352"/>', i;
      [[30, 40], [80, 20], [360, 60], [372, 330], [40, 350], [300, 384], [16, 210], [388, 190], [120, 386]].forEach(function (p, j) { s += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + (j % 3 ? 1.6 : 2.6) + '" fill="#fff" opacity=".8"/>'; });
      for (i = 2; i >= 0; i--) s += c.Z(i, '<circle cx="200" cy="200" r="' + B[i + 1] + '"', '#fff', null, ' fill-opacity="' + (0.03 + i * 0.02) + '" stroke="none"');
      for (i = 0; i < 3; i++) s += '<circle cx="200" cy="200" r="' + O[i] + '" fill="none" stroke="' + c.pal[i] + '" stroke-width="2.4" stroke-dasharray="3 8" stroke-linecap="round" pointer-events="none"/>';
      for (i = 0; i < 12; i++) { var a = polar(200, 200, 54, i * 30), b = polar(200, 200, 64, i * 30); s += '<path d="M' + a[0] + ' ' + a[1] + 'L' + b[0] + ' ' + b[1] + '" stroke="#FFC94A" stroke-width="5" stroke-linecap="round"/>'; }
      s += SE(200, 200, 47, 47, '#FFC94A') + kid(c, 200, 196, 76);
      var lab = '';
      for (i = 0; i < 3; i++) {
        var r = i === 2 ? O[i] - 16 : O[i] + 7, id = c.uid + 'o' + i; // the far orbit's label sits just inside it, or it would run off the top
        lab += '<path id="' + id + '" d="M' + (200 - r) + ' 200A' + r + ' ' + r + ' 0 0 1 ' + (200 + r) + ' 200" fill="none"/><text font-size="13" font-weight="700" fill="#fff" pointer-events="none"><textPath href="#' + id + '" startOffset="50%" text-anchor="middle">' + esc(c.labels[i]) + '</textPath></text>';
      }
      return { svg: s, labels: lab, halo: function (z) { return c.pal[z]; }, all: function (counts) { return rings(counts, O); } };
    },
    hand: function (c) {
      var F = [{ b: [140, 304], a: -56, l: 112 }, { b: [154, 238], a: -17, l: 140 }, { b: [200, 228], a: 0, l: 158 }, { b: [246, 236], a: 15, l: 142 }, { b: [284, 264], a: 34, l: 106 }];
      var s = '', lab = '';
      function at(f, d) { var q = f.a * Math.PI / 180; return [f.b[0] + d * Math.sin(q), f.b[1] - d * Math.cos(q)]; }
      F.forEach(function (f, i) { s += '<g transform="translate(' + f.b[0] + ' ' + f.b[1] + ') rotate(' + f.a + ')">' + c.Z(i, '<rect x="-27" y="' + (-f.l) + '" width="54" height="' + (f.l + 40) + '" rx="27"', c.pal[i % c.pal.length], [0, -f.l / 2 + 20], null, ' transform="translate(' + f.b[0] + ' ' + f.b[1] + ') rotate(' + f.a + ')"') + '</g>'; });
      s += SP('M108 266C108 232 132 216 200 216 268 216 300 238 300 270V312C300 360 262 392 204 392 146 392 108 360 108 312Z', c.T.palm, 204, 304, .97);
      s += kid(c, 204, 304, 88);
      F.forEach(function (f, i) { var p = at(f, f.l + 24); lab += pill(p[0], Math.max(22, p[1]), c.labels[i], { max: 11, fs: 12 }); });
      return { svg: s, labels: lab, pos: function (z) { return at(F[z], F[z].l - 26); } };
    },
    house: function (c) {
      var NP = ' pointer-events="none"', WOOD = '#B98157', roof = c.T.roof, s = '';
      // sky and garden behind the house
      s += '<g' + NP + '><path d="M28 72c-11 0-13-12-3-14 1-11 16-13 20-5 6-8 21-6 21 4 9-1 13 15 2 15z" fill="#fff"' + st(2.4) + '/><path d="M346 92c-8 0-10-9-2-11 1-8 12-10 15-4 5-6 16-4 16 3 7-1 9 12 1 12z" fill="#fff"' + st(2.2) + '/></g>';
      s += '<rect x="0" y="384" width="400" height="16" fill="#BFE3C8"' + NP + '/>';
      // chimney with a little smoke
      s += '<g' + NP + '>' + SE(310, 40, 7, 6, '#fff', 0, 1) + SE(322, 25, 9, 8, '#fff', 0, 1) + SE(339, 11, 11, 9, '#fff', 0, 1) + '</g>';
      s += SP('M286 62H322V136H286Z', '#E9A58C', 304, 99, .95) + '<path d="M286 80H322M286 98H322M286 116H322M298 62V80M310 80V98M298 98V116M310 116V134" fill="none" stroke="' + shade('#E9A58C', -.28) + '" stroke-width="2"' + NP + '/><rect x="280" y="54" width="48" height="13" rx="5" fill="#F7D3B7"' + st(3) + '/>';
      // tiled roof
      s += SP('M4 168L200 36 396 168Z', roof, 200, 118, .97);
      for (var ry = 84, rw = 0; ry < 160; ry += 19, rw++) {
        var half = (ry - 36) * 196 / 132 - 14, n = Math.max(2, Math.round(half * 2 / 25)), step = half * 2 / n, tile = 'M' + (200 - half).toFixed(1) + ' ' + ry;
        for (var ti = 0; ti < n; ti++) tile += 'q' + (step / 2).toFixed(1) + ' 11 ' + step.toFixed(1) + ' 0';
        s += '<path d="' + tile + '" fill="none" stroke="' + shade(roof, -.2) + '" stroke-width="2.2" stroke-linecap="round"' + NP + '/>';
      }
      // round attic window, where the child looks out
      s += SE(200, 118, 36, 36, WOOD, 0, 1) + SE(200, 118, 28, 28, '#DCEBFA', 0, 1) + '<path d="M180 100q8-8 16-9" fill="none" stroke="#fff" stroke-width="3.500" stroke-linecap="round"' + NP + '/>' + kid(c, 200, 118, 54);
      var XX = [14, 200], Y = [158, 276], lab = '', i, x, y;
      for (i = 0; i < 4; i++) {
        x = XX[i % 2]; y = Y[Math.floor(i / 2)];
        var wall = c.pal[i], line = shade(wall, -.24), d = '';
        s += c.Z(i, '<rect x="' + x + '" y="' + y + '" width="186" height="118"', wall, [x + 93, y + 59]);
        // wooden floor along the bottom of each room
        d += '<rect x="' + (x + 2) + '" y="' + (y + 98) + '" width="182" height="18" fill="#E5BE93"/><path d="M' + (x + 2) + ' ' + (y + 98) + 'H' + (x + 184) + '" fill="none"' + st(2.4) + '/><path d="M' + (x + 34) + ' ' + (y + 98) + 'V' + (y + 116) + 'M' + (x + 82) + ' ' + (y + 98) + 'V' + (y + 116) + 'M' + (x + 130) + ' ' + (y + 98) + 'V' + (y + 116) + '" fill="none" stroke="#C99A6B" stroke-width="2"/>';
        var fx = x + 142, fy = y + 9;
        if (i === 0) d += '<rect x="' + fx + '" y="' + fy + '" width="34" height="27" rx="3" fill="#fff"' + st(2.6) + '/><path d="M' + (fx + 17) + ' ' + (fy + 21) + 'c-5-4-9-7-9-11a4.500 4.500 0 0 1 9-1.500 4.500 4.500 0 0 1 9 1.500c0 4-4 7-9 11z" fill="#F0694F"' + st(1.8) + '/>';
        if (i === 1) d += '<path d="M' + (fx - 4) + ' ' + (fy + 26) + 'H' + (fx + 38) + '" fill="none" stroke="' + K + '" stroke-width="6" stroke-linecap="round"/><path d="M' + (fx - 4) + ' ' + (fy + 26) + 'H' + (fx + 38) + '" fill="none" stroke="' + WOOD + '" stroke-width="2.600" stroke-linecap="round"/><rect x="' + (fx + 1) + '" y="' + (fy + 9) + '" width="12" height="14" rx="3" fill="#7DB3E8"' + st(2.2) + '/><path d="M' + (fx + 13) + ' ' + (fy + 12) + 'q6 3 0 7" fill="none"' + st(2.2) + '/><rect x="' + (fx + 22) + '" y="' + (fy + 4) + '" width="11" height="19" rx="3" fill="#FFC94A"' + st(2.2) + '/>';
        if (i === 2) d += '<rect x="' + fx + '" y="' + fy + '" width="34" height="30" rx="4" fill="#DCEBFA"' + st(2.6) + '/><path d="M' + (fx + 17) + ' ' + fy + 'V' + (fy + 30) + 'M' + fx + ' ' + (fy + 15) + 'H' + (fx + 34) + '" fill="none"' + st(2.2) + '/><path d="M' + (x + 8) + ' ' + (y + 98) + 'l2-13h16l2 13z" fill="#F7A08C"' + st(2.4) + '/><path d="M' + (x + 18) + ' ' + (y + 85) + 'c-1-10-8-13-11-14 0 8 4 13 11 14zM' + (x + 18) + ' ' + (y + 85) + 'c1-12 8-16 12-17 0 9-4 15-12 17z" fill="#7FCB98"' + st(2.2) + '/>';
        if (i === 3) d += '<path d="M' + (x + 136) + ' ' + (y + 116) + 'V' + (y + 54) + 'a21 21 0 0 1 42 0V' + (y + 116) + 'z" fill="' + WOOD + '"' + st(2.8) + '/><circle cx="' + (x + 157) + '" cy="' + (y + 52) + '" r="9" fill="#DCEBFA"' + st(2.2) + '/><circle cx="' + (x + 170) + '" cy="' + (y + 86) + '" r="3" fill="#FFC94A"' + st(1.8) + '/>';
        s += '<g' + NP + '>' + d + '</g>';
        lab += pill(x + 8, y + 17, c.labels[i], { anchor: 'start', max: 18, fs: 12 });
      }
      // outer walls, the white trim under the roof, and bushes at the corners
      s += '<g' + NP + '><rect x="14" y="158" width="372" height="236" fill="none"' + st(4.5) + '/><rect x="2" y="150" width="396" height="13" rx="6.500" fill="#FFF8EC"' + st(3) + '/>' +
        SE(9, 386, 20, 16, '#7FCB98') + SE(391, 386, 20, 16, '#7FCB98') + '<circle cx="6" cy="381" r="3" fill="#F6B3C2"' + st(1.6) + '/><circle cx="16" cy="389" r="3" fill="#FFC94A"' + st(1.6) + '/><circle cx="386" cy="382" r="3" fill="#FFC94A"' + st(1.6) + '/><circle cx="395" cy="391" r="3" fill="#F6B3C2"' + st(1.6) + '/></g>';
      return { svg: s, labels: lab, pos: function (z, k, n) { var x = XX[z % 2], y = Y[Math.floor(z / 2)] + 66, xs = n === 1 ? [93] : n === 2 ? [56, 130] : [32, 93, 154]; return [x + xs[k], y]; } };
    },
    tree: function (c) {
      var NP = ' pointer-events="none"', WOOD = '#C99A6B', BARK = '#A5774C', leaf = c.pal[2];
      // a scalloped outline, like a leafy cloud
      var cloud = function (cx, cy, rx, ry, n) {
        var pts = [], i; for (i = 0; i < n; i++) { var a = i * 2 * Math.PI / n; pts.push([cx + rx * Math.sin(a), cy - ry * Math.cos(a)]); }
        var d = 'M' + pts[0][0].toFixed(1) + ' ' + pts[0][1].toFixed(1);
        for (i = 0; i < n; i++) { var p = pts[i], q = pts[(i + 1) % n], r = (Math.hypot(q[0] - p[0], q[1] - p[1]) * .6).toFixed(1); d += 'A' + r + ' ' + r + ' 0 0 1 ' + q[0].toFixed(1) + ' ' + q[1].toFixed(1); }
        return d + 'Z';
      };
      // grassy hill
      var s = '<path d="M-10 410V374C60 352 130 362 200 370C270 362 340 352 410 374V410Z" fill="#BFE3C8"' + st(3) + NP + '/>';
      s += '<g' + NP + '><path d="M28 386l-3-8M34 386l1-9M40 386l4-7M300 390l-3-8M306 390l1-9M312 390l4-7" fill="none" stroke="#4FA772" stroke-width="2.400" stroke-linecap="round"/>' + [[352, 378, '#F6B3C2'], [376, 388, '#FFC94A'], [58, 380, '#F0694F']].map(function (f) { return '<path d="M' + f[0] + ' ' + (f[1] + 2) + 'v10" fill="none" stroke="#4FA772" stroke-width="2.400"/><circle cx="' + f[0] + '" cy="' + f[1] + '" r="4.500" fill="' + f[2] + '"' + st(2) + '/><circle cx="' + f[0] + '" cy="' + f[1] + '" r="1.500" fill="#fff"/>'; }).join('') + '</g>';
      // trunk with flared roots and bark
      s += c.Z(0, '<path d="M146 392C166 382 174 352 176 312C177 280 176 252 178 224H222C224 252 223 280 224 312C226 352 234 382 254 392C236 388 222 394 200 390C178 394 164 388 146 392Z"', WOOD, [200, 310]);
      s += '<path d="M188 244q-4 16 0 32M214 240q4 14 1 28M186 304q-4 20-2 36M216 300q5 22 4 40M200 352q-2 16 0 28" fill="none" stroke="' + BARK + '" stroke-width="2.600" stroke-linecap="round"' + NP + '/>';
      // leafy crown, with lighter clumps and leaf marks for depth
      s += c.Z(2, '<path d="' + cloud(200, 120, 182, 96, 16) + '"', leaf, [200, 120]);
      s += '<g' + NP + '>' + [[122, 68, 50, 30], [256, 62, 56, 32], [70, 140, 38, 24], [330, 138, 38, 24], [196, 138, 60, 30]].map(function (b) { return '<path d="' + cloud(b[0], b[1], b[2], b[3], 8) + '" fill="' + shade(leaf, .38) + '" opacity=".75"/>'; }).join('');
      s += [[84, 90], [160, 36], [232, 30], [318, 88], [44, 166], [356, 170], [116, 148], [288, 150], [176, 92], [236, 104]].map(function (m) { return '<path d="M' + m[0] + ' ' + m[1] + 'q7 7 14 0" fill="none" stroke="' + shade(leaf, -.26) + '" stroke-width="2.600" stroke-linecap="round"/>'; }).join('');
      s += [[150, 54], [252, 50], [52, 112], [348, 112], [164, 146], [244, 152]].map(function (f) { return '<circle cx="' + f[0] + '" cy="' + f[1] + '" r="7" fill="#F0694F"' + st(2.2) + '/><path d="M' + f[0] + ' ' + (f[1] - 7) + 'q1-4 4-5" fill="none"' + st(2) + '/><circle cx="' + (f[0] - 2.5) + '" cy="' + (f[1] - 2.5) + '" r="1.500" fill="#fff"/>'; }).join('') + '</g>';
      // twigs reaching up into the leaves, then the two big branches people sit on
      var twig = 'M92 180C86 154 70 136 54 126M152 182C146 160 136 146 122 134M248 182C254 160 264 146 278 134M308 180C314 154 330 136 346 126';
      s += '<path d="' + twig + '" fill="none" stroke="' + K + '" stroke-width="9" stroke-linecap="round"' + NP + '/><path d="' + twig + '" fill="none" stroke="' + WOOD + '" stroke-width="4.500" stroke-linecap="round"' + NP + '/>';
      s += c.Z(1, '<path d="M38 190C38 172 66 170 96 175C130 181 166 178 200 178C234 178 270 181 304 175C334 170 362 172 362 190C362 208 334 213 304 213C272 213 246 222 226 240H174C154 222 128 213 96 213C66 213 38 208 38 190Z"', WOOD, [200, 198]);
      s += '<path d="M60 188q14-4 26 0M116 198q16 4 30 2M254 200q16 2 30-2M314 188q14-4 26 0M190 214q10 4 20 0" fill="none" stroke="' + BARK + '" stroke-width="2.400" stroke-linecap="round"' + NP + '/>';
      s += kid(c, 96, 346, 74);
      var lab = pill(200, 16, c.labels[2], { max: 24 }) + pill(78, 262, c.labels[1], { max: 14, fs: 12 }) + pill(318, 300, c.labels[0], { max: 14, fs: 12 });
      var P = [[[200, 282], [200, 338]], [[90, 192], [310, 192], [160, 200], [240, 200]], [[200, 62], [122, 102], [278, 102], [62, 166], [338, 166], [200, 122]]];
      return { svg: s, labels: lab, pos: function (z, k, n) { if (z === 0 && n === 1) return [200, 300]; return P[z][k]; } };
    },
    bus: function (c) {
      var s = '<rect x="0" y="334" width="400" height="66" fill="' + c.T.ground + '"/><path d="M14 368H386" fill="none" stroke="#fff" stroke-width="4" stroke-dasharray="18 14"/>';
      s += SP('M40 112H372C384 112 392 120 392 132V296C392 306 386 312 376 312H22C14 312 8 306 8 298V170C8 136 22 112 40 112Z', c.T.bus, 200, 212, .98);
      s += '<path d="M8 250H392" fill="none" stroke="#fff" stroke-width="12"/><path d="M8 244H392M8 256H392" fill="none"' + st(2.4) + '/>';
      s += '<path d="M14 178C16 150 26 132 44 132H76V232H14Z" fill="#E6F0FB"' + st(3) + '/>' + kid(c, 48, 186, 74);
      var WX = [], i;
      for (i = 0; i < 6; i++) WX.push(88 + i * 49);
      for (i = 0; i < 6; i++) {
        var x = WX[i], z = Math.floor(i / 2);
        s += c.Z(z, '<rect x="' + x + '" y="132" width="43" height="100" rx="10"', c.pal[z], [x + 21.5, 182]);
        s += '<path d="M' + (x + 8) + ' 232V206C' + (x + 8) + ' 200 ' + (x + 12) + ' 196 ' + (x + 18) + ' 196H' + (x + 25) + 'C' + (x + 31) + ' 196 ' + (x + 35) + ' 200 ' + (x + 35) + ' 206V232" fill="#fff" fill-opacity=".7"' + st(2.4) + ' pointer-events="none"/>';
      }
      s += '<rect x="30" y="262" width="14" height="10" rx="3" fill="#FFE29A"' + st(2.4) + '/>';
      s += '<circle cx="86" cy="314" r="28" fill="' + K + '"/><circle cx="86" cy="314" r="10" fill="#C9CED6"/><circle cx="320" cy="314" r="28" fill="' + K + '"/><circle cx="320" cy="314" r="10" fill="#C9CED6"/>';
      var lab = '';
      [0, 1, 2].forEach(function (zz) { var cx = (WX[zz * 2] + WX[zz * 2 + 1] + 43) / 2; lab += pill(cx, 92, c.labels[zz], { max: 14, fs: 12 }); lab += '<path d="M' + (WX[zz * 2] + 6) + ' 112V106H' + (WX[zz * 2 + 1] + 37) + 'V112" fill="none"' + st(2) + ' pointer-events="none"/>'; });
      return { svg: s, labels: lab, pos: function (zz, k) { var n = zz * 2 + k; return [WX[n] + 21.5, 170, { sc: 0.86, ndy: n % 2 ? 26 : 0, narrow: 1 }]; } };
    },
    castle: function (c) {
      var s = c.Z(2, '<rect width="400" height="400"', c.pal[2], null, ' stroke="none"');
      for (var x = 56; x < 340; x += 34) s += '<rect x="' + x + '" y="134" width="20" height="22" fill="' + shade(c.pal[1], -.12) + '"' + st(3) + '/>';
      s += c.Z(1, '<rect x="56" y="150" width="288" height="232"', c.pal[1], [200, 266]);
      s += SP('M180 382V356C180 346 190 340 200 340 210 340 220 346 220 356V382Z', '#B98157', 200, 361);
      s += '<path d="M236 160V128" fill="none"' + st(3) + '/><path d="M236 128L262 136 236 144Z" fill="#F0694F"' + st(2.6) + '/>';
      [140, 174, 208, 242].forEach(function (xx) { s += '<rect x="' + xx + '" y="162" width="18" height="18" fill="' + shade(c.pal[0], -.12) + '"' + st(3) + '/>'; });
      s += c.Z(0, '<rect x="140" y="176" width="120" height="156"', c.pal[0], [200, 254]);
      s += kid(c, 200, 238, 50);
      var lab = pill(200, 18, c.labels[2], { max: 24 }) + pill(200, 194, c.labels[0], { max: 18, fs: 11.5 }) + pill(64, 364, c.labels[1], { anchor: 'start', max: 18, fs: 12 });
      var P = [[[174, 290], [226, 290]], [[100, 204], [300, 204], [100, 300], [300, 300]], [[54, 74], [148, 62], [252, 62], [346, 74]]];
      return { svg: s, labels: lab, pos: function (z, k, n) { if (z === 0 && n === 1) return [200, 290]; return P[z][k]; } };
    },
    pizza: function (c) {
      var cx = 200, cy = 204, s = SE(cx, cy, 184, 184, c.T.crust, 0, 1);
      var S = [[300, 420], [60, 180], [180, 300]], lab = '';
      S.forEach(function (q, i) {
        var a = polar(cx, cy, 164, q[0]), b = polar(cx, cy, 164, q[1]), m0 = polar(cx, cy, 90, (q[0] + q[1]) / 2);
        s += c.Z(i, '<path d="M' + cx + ' ' + cy + 'L' + a[0] + ' ' + a[1] + 'A164 164 0 0 1 ' + b[0] + ' ' + b[1] + 'Z"', c.pal[i], m0);
        // the labels curve along the crust so they can't sit on top of anyone's name; lower slices run the other way to stay upright
        var low = i > 0, pr = low ? 181 : 167, st0 = polar(cx, cy, pr, low ? q[1] - 8 : q[0] + 8), st1 = polar(cx, cy, pr, low ? q[0] + 8 : q[1] - 8), pid = c.uid + 'z' + i;
        lab += '<path id="' + pid + '" d="M' + st0[0] + ' ' + st0[1] + 'A' + pr + ' ' + pr + ' 0 0 ' + (low ? 0 : 1) + ' ' + st1[0] + ' ' + st1[1] + '" fill="none"/><text font-size="13" font-weight="700" fill="' + K + '" stroke="#fff" stroke-width="4" paint-order="stroke" stroke-linejoin="round" pointer-events="none"><textPath href="#' + pid + '" startOffset="50%" text-anchor="middle">' + esc(c.labels[i]) + '</textPath></text>';
      });
      s += SE(cx, cy, 42, 42, '#FFF8EC', 0, 1) + kid(c, cx, cy - 4, 70);
      return { svg: s, labels: lab, pos: function (z, k, n) {
        var m = (S[z][0] + S[z][1]) / 2, L = n === 1 ? [[104, 0]] : n === 2 ? [[112, -24], [112, 24]] : [[130, -34], [130, 0], [130, 34], [80, 0]];
        return polar(cx, cy, L[k][0], m + L[k][1]);
      } };
    },
    hero: function (c) {
      var s = SP('M187 56L164 110Q200 118 236 110L213 56Z', '#F0694F', 200, 86) + kid(c, 200, 62, 92);
      var XX = [16, 146, 276], Y = [120, 260], lab = '';
      for (var i = 0; i < 6; i++) {
        var x = XX[i % 3], y = Y[Math.floor(i / 3)];
        s += c.Z(i, '<rect x="' + x + '" y="' + y + '" width="108" height="134" rx="18"', c.pal[i % c.pal.length], [x + 54, y + 67]);
        wrapText(c.labels[i], 15).forEach(function (l, j) { lab += '<text x="' + (x + 54) + '" y="' + (y + 106 + j * 14) + '" text-anchor="middle" font-size="12" font-weight="700" fill="' + K + '" pointer-events="none">' + esc(l) + '</text>'; });
      }
      return { svg: s, labels: lab, pos: function (z) { return [XX[z % 3] + 54, Y[Math.floor(z / 3)] + 38]; } };
    }
  };
  function token(c, p, x, y, idx, o) {
    var ex = o.x || {}, sc = ex.sc || 1, col = BUDDY[idx % BUDDY.length], nm = String(p.name || '').trim();
    var s = '<g transform="translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ')' + (sc !== 1 ? ' scale(' + sc + ')' : '') + '">';
    if (p.av && p.av.kind === 'name') {
      var txt = o.names === false ? initials(nm) : nm, lines = ex.narrow && txt.indexOf(' ') > 0 ? txt.split(/\s+/).slice(0, 2) : [txt];
      var tw = Math.max(ex.narrow ? 46 : 58, Math.max.apply(null, lines.map(function (l) { return l.length; })) * 8.6 + (ex.narrow ? 16 : 26)), th = lines.length > 1 ? 46 : 36, tc = p.av.col || TAGCOLS[0];
      if (o.sel) s += '<rect x="' + (-tw / 2 - 7) + '" y="' + (-th / 2 - 7) + '" width="' + (tw + 14) + '" height="' + (th + 14) + '" rx="' + (th / 2 + 7) + '" fill="none" stroke="#FFC94A" stroke-width="7"/>';
      s += '<rect x="' + (-tw / 2) + '" y="' + (-th / 2) + '" width="' + tw + '" height="' + th + '" rx="' + Math.min(18, th / 2) + '" fill="' + shade(tc, -.2) + '"' + st(2.8) + '/><rect x="' + (-tw / 2 + 1) + '" y="' + (-th / 2 + 1) + '" width="' + (tw - 4) + '" height="' + (th - 5) + '" rx="' + Math.min(16, th / 2 - 2) + '" fill="' + tc + '"/>';
      lines.forEach(function (l, i) { s += '<text y="' + (5.5 + (lines.length > 1 ? (i - 0.5) * 16 : 0)) + '" text-anchor="middle" font-size="15" font-weight="800" fill="' + K + '">' + esc(l) + '</text>'; });
      return s + '</g>';
    }
    if (o.sel) s += '<circle r="36" fill="none" stroke="#FFC94A" stroke-width="7"/>';
    if (c.T.dino) {
      [-42, 0, 42].forEach(function (a) { var b1 = polar(0, 0, 22, a - 13), q = polar(0, 0, 37, a), b2 = polar(0, 0, 22, a + 13); s += '<path d="M' + b1.join(' ') + 'L' + q.join(' ') + 'L' + b2.join(' ') + 'Z" fill="' + shade(col, -.12) + '"' + st(2.4) + '/>'; });
      s += SE(0, 0, 27, 27, col, 0, 1);
    } else if (c.T.car) {
      s += '<rect x="-32" y="-26" width="64" height="52" rx="18" fill="' + shade(col, -.18) + '"' + st(2.6) + '/><rect x="-30" y="-25" width="58" height="47" rx="16" fill="' + col + '"/><circle cx="-18" cy="27" r="7" fill="' + K + '"/><circle cx="18" cy="27" r="7" fill="' + K + '"/>';
    } else {
      s += '<circle r="27" fill="' + (o.halo || '#fff') + '"' + st(2.6) + '/>';
    }
    var cid = c.uid + 'c' + String(p.id).replace(/[^a-z0-9]/gi, '');
    s += '<clipPath id="' + cid + '"><circle r="21"/></clipPath><g clip-path="url(#' + cid + ')"><svg x="-21" y="-21" width="42" height="42" viewBox="0 0 100 100">' + avatarInner(p.av) + '</svg></g><circle r="21" fill="none"' + st(2.6) + '/>';
    if (o.names !== false && nm) {
      var w = Math.max(30, nm.length * 7.1 + 14), ny = (c.T.car ? 36 : 31) + (ex.ndy || 0);
      var nx = Math.max((4 - x) / sc + w / 2, Math.min((396 - x) / sc - w / 2, 0));
      s += '<rect x="' + (nx - w / 2) + '" y="' + ny + '" width="' + w + '" height="19" rx="9.5" fill="#fff"' + st(1.6) + '/><text x="' + nx + '" y="' + (ny + 14) + '" text-anchor="middle" font-size="12.5" font-weight="700" fill="' + K + '">' + esc(nm) + '</text>';
    }
    return s + '</g>';
  }
  var UID = 0;
  /* o: {layout, theme, pal, labels, people, names, labelsOn, hideId, selId, highlight, g} */
  function drawMap(o) {
    var T = THEMES[o.theme] || THEMES.plain, L = LBY[o.layout] || LAYOUTS[0];
    var c = { T: T, pal: o.pal || T.palettes[0].c, labels: o.labels || L.labels.map(pick), uid: 'spm' + (++UID), shapes: {}, g: o.g || 'boy' };
    c.Z = function (i, el, fill, ctr, extra, hlT) {
      c.shapes[i] = (c.shapes[i] || '') + (hlT ? el + hlT : el) + ' HL/>'; extra = extra || '';
      if (!ctr) return el + ' data-zone="' + i + '" fill="' + fill + '"' + (/stroke=/.test(extra) ? extra : st(3) + extra) + '/>';
      return el + ' data-zone="' + i + '" fill="' + shade(fill, -.14) + '"' + st(3) + '/><g transform="translate(' + (ctr[0] - 1) + ' ' + (ctr[1] - 1.5) + ') scale(.975) translate(' + (-ctr[0]) + ' ' + (-ctr[1]) + ')">' + el + ' data-zone="' + i + '" fill="' + fill + '"/></g>';
    };
    var G = GEO[L.id](c), toks = [], s = '';
    var groups = L.caps.map(function () { return []; });
    (o.people || []).forEach(function (p, i) { if (p.zone != null && groups[p.zone] && groups[p.zone].length < L.caps[p.zone]) groups[p.zone].push([p, i]); });
    var ALL = G.all ? G.all(groups.map(function (g) { return g.length; })) : null;
    groups.forEach(function (g, z) {
      g.forEach(function (pi, k) {
        var pos = ALL ? ALL[z][k] : G.pos(z, k, g.length), p = pi[0];
        toks.push({ id: p.id, name: p.name, x: pos[0], y: pos[1], zone: z });
        if (p.id !== o.hideId) s += token(c, p, pos[0], pos[1], pi[1], { sel: p.id === o.selId, names: o.names, halo: G.halo ? G.halo(z) : null, x: pos[2] });
      });
    });
    var hl = '';
    if (o.highlight) L.caps.forEach(function (cap, z) { if (groups[z].length < cap && c.shapes[z]) hl += c.shapes[z].split(' HL/>').join(' fill="none" stroke="#FFC94A" stroke-width="6" stroke-dasharray="2 10" pointer-events="none"/>'); });
    var bg = L.id === 'solar' ? '' : '<rect width="400" height="400" fill="' + (L.id === 'castle' ? c.pal[2] : T.bg) + '"/>' + (L.id === 'castle' ? '' : decor(T));
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%" style="display:block" font-family="Figtree, system-ui, sans-serif">' +
      bg + G.svg + (L.id === 'castle' ? decor(T) : '') + (o.labelsOn === false ? '' : G.labels) + hl + s + '</svg>';
    return { svg: svg, tokens: toks };
  }
  function remap(people, from, to) {
    var Lf = LBY[from], Lt = LBY[to], Zo = Lf.caps.length, Zn = Lt.caps.length, used = Lt.caps.map(function () { return 0; }), waiting = [];
    var order = people.map(function (p, i) { return [p, i]; }).filter(function (q) { return q[0].zone != null; }).sort(function (a, b) { return a[0].zone - b[0].zone || a[1] - b[1]; });
    var out = people.map(function (p) { return Object.assign({}, p, { zone: null }); });
    order.forEach(function (q) {
      var rank = Zo > 1 ? q[0].zone / (Zo - 1) : 0, n = Math.round(rank * (Zn - 1)), z = null, i;
      for (i = n; i < Zn && z == null; i++) if (used[i] < Lt.caps[i]) z = i;
      for (i = n - 1; i >= 0 && z == null; i--) if (used[i] < Lt.caps[i]) z = i;
      if (z != null) { used[z]++; out[q[1]].zone = z; } else waiting.push(q[0].name);
    });
    return { people: out, waiting: waiting };
  }
  // the people in the small pictures on the choosing screens: made up, never a real map
  var SAMPLE = [['f1', 'Mum'], ['f2', 'Dad'], ['f5', 'Nan'], ['f6', 'Grandpa'], ['s1', 'Ms Lee'], ['f4', 'Raj'], ['h1', 'Dr Ana'], ['r1', 'Ari']];
  function sample(layout) {
    var L = LBY[layout], left = L.caps.slice(), z = 0, out = [];
    SAMPLE.forEach(function (q, i) {
      var tries = 0; while (tries < L.caps.length && (left[z] <= 0 || (L.caps[z] > 2 && i >= (z + 1) * Math.ceil(SAMPLE.length / L.caps.length)))) { z = (z + 1) % L.caps.length; tries++; }
      if (left[z] > 0) { left[z]--; out.push({ id: 'x' + i, name: q[1], av: { kind: 'ill', c: q[0] }, zone: z }); }
    });
    return out;
  }

  /* ===================== Plus: which options are locked ===================== */
  var FEATURES = [
    ['safe.bus', 'Bus map', 'Peta bus'], ['safe.solar', 'Solar system map', 'Peta tata surya'], ['safe.castle', 'Castle map', 'Peta istana'], ['safe.pizza', 'Pizza map', 'Peta pizza'], ['safe.hero', 'Superhero team map', 'Peta tim pahlawan'],
    ['safe.dino', 'Dinosaur nest theme', 'Tema sarang dinosaurus'], ['safe.car', 'Car garage theme', 'Tema garasi mobil'],
    ['safe.photos', 'Adding photos to the map', 'Menambah foto ke peta'], ['safe.prompts', 'Writing your own prompts', 'Menulis pertanyaan sendiri']
  ];
  function acc() { return window.LUAcc || null; }
  if (acc() && acc().addFeatures) acc().addFeatures(FEATURES.map(function (f, i) { return { id: f[0], tool: 'safe', name_en: f[1], name_id: f[2], access: 'plus', sort: 40 + i }; }));
  function locked(id) { var a = acc(); return !!a && !a.allowed(id); }
  function hidden(id) { var a = acc(); return !!a && a.access(id) === 'hidden'; }
  function plusPill(id) { var a = acc(); if (!locked(id) || hidden(id)) return ''; var acct = a.access(id) === 'account'; return '<span class="spm-pill' + (acct ? ' free' : '') + '">' + esc(acct ? a.t('free') : a.t('plus')) + '</span>'; }
  function showLock(id, vis) { var a = acc(); if (a) a.lockSheet(id, vis || '', ''); }

  /* ===================== saving: this browser, and privately to the account when signed in ===================== */
  var BUCKET = 'safe-people';
  function uid() {
    var a = acc(), s = a && a._session && a._session(); if (!s || !s.access_token) return null;
    if (s.user && s.user.id) return s.user.id;
    try { return JSON.parse(atob(s.access_token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))).sub || null; } catch (e) { return null; }
  }
  function storeKey() { return 'lu_safe_v1:' + (uid() || 'anon'); }
  var STORE = null, STORE_KEY = null, pushT = 0, pushing = false;
  function loadStore() {
    var k = storeKey(); if (STORE && STORE_KEY === k) return STORE;
    var got = null; try { got = JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) {}
    // the first time someone signs in, the map they made before signing in comes with them
    if (!got && k !== 'lu_safe_v1:anon') { try { got = JSON.parse(localStorage.getItem('lu_safe_v1:anon') || 'null'); if (got) localStorage.removeItem('lu_safe_v1:anon'); } catch (e) {} }
    STORE = got && got.maps ? got : { maps: {}, dels: [] }; STORE.dels = STORE.dels || []; STORE_KEY = k;
    if (got) writeLocal();
    return STORE;
  }
  function writeLocal() { try { localStorage.setItem(STORE_KEY, JSON.stringify(STORE)); } catch (e) {} }
  function childKey() { var p = X.prof(); return p ? p.id : '_'; }
  function blankMap() { return { layout: 'circles', theme: 'plain', people: [], labels: {}, pal: {}, pEdit: {}, pOwn: [], started: false, updated: 0 }; }
  function curMap() {
    var s = loadStore(), k = childKey();
    if (!s.maps[k] || s.maps[k].deleted) s.maps[k] = blankMap();
    s.maps[k].theme = themeFor(s.maps[k].layout, s.maps[k].theme);
    return s.maps[k];
  }
  // always newer than the last save, even if this device's clock is behind another device's
  function nextStamp(m) { return Math.max(Date.now(), ((m && m.updated) || 0) + 1); }
  function saveMap() {
    var m = curMap(); m.updated = nextStamp(m); m.started = true;
    writeLocal(); schedulePush();
  }
  function schedulePush() { if (!uid()) return; clearTimeout(pushT); pushT = setTimeout(sync, 1500); }
  function b64Blob(data) { var p = data.split(','), bin = atob(p[1]), a = new Uint8Array(bin.length), i; for (i = 0; i < bin.length; i++) a[i] = bin.charCodeAt(i); return new Blob([a], { type: 'image/jpeg' }); }
  function storageReq(path, opts) {
    var a = acc();
    return a._token().then(function (tk) {
      var h = { apikey: a._key, Authorization: 'Bearer ' + tk }; Object.keys(opts.headers || {}).forEach(function (n) { h[n] = opts.headers[n]; });
      return fetch(a._sb + '/storage/v1/object/' + BUCKET + '/' + path, { method: opts.method || 'GET', headers: h, body: opts.body });
    });
  }
  function eachPhoto(fn) { var s = loadStore(); Object.keys(s.maps).forEach(function (k) { (s.maps[k].people || []).forEach(function (p) { if (p.av && p.av.kind === 'photo') fn(p.av); }); }); }
  function syncPhotos(me) {
    var jobs = [], changed = false;
    eachPhoto(function (av) {
      var src = X.PH[av.pid];
      if (src && !av.up) jobs.push(function () { return storageReq(me + '/' + av.pid + '.jpg', { method: 'POST', headers: { 'Content-Type': 'image/jpeg', 'x-upsert': 'true' }, body: b64Blob(src) }).then(function (r) { if (r.ok) { av.up = 1; changed = true; } }); });
      if (!src && av.up) jobs.push(function () {
        return storageReq(me + '/' + av.pid + '.jpg', {}).then(function (r) { return r.ok ? r.blob() : null; }).then(function (b) {
          if (!b) return;
          return new Promise(function (res) { var fr = new FileReader(); fr.onload = function () { X.photoPut(av.pid, fr.result).then(function () { AVC = {}; changed = true; res(); }); }; fr.onerror = res; fr.readAsDataURL(b); });
        });
      });
    });
    (loadStore().dels || []).slice().forEach(function (pid) {
      jobs.push(function () { return storageReq(me + '/' + pid + '.jpg', { method: 'DELETE' }).then(function () { STORE.dels = STORE.dels.filter(function (x) { return x !== pid; }); changed = true; }); });
    });
    return jobs.reduce(function (p, j) { return p.then(j).catch(function () {}); }, Promise.resolve()).then(function () { return changed; });
  }
  function mergeIn(remote) {
    var s = loadStore(), changed = false, needPush = false;
    Object.keys((remote && remote.maps) || {}).forEach(function (k) {
      var r = remote.maps[k], l = s.maps[k];
      if (!l || (r.updated || 0) > (l.updated || 0)) { s.maps[k] = r; changed = true; }
      else if ((l.updated || 0) > (r.updated || 0)) needPush = true;
    });
    Object.keys(s.maps).forEach(function (k) { if (s.maps[k].updated && !(remote && remote.maps && remote.maps[k])) needPush = true; });
    return { changed: changed, needPush: needPush };
  }
  // keeps this device and the account in step; if the account table isn't reachable the map simply stays on this device
  function sync() {
    var me = uid(), a = acc(); if (!me || !a || pushing) return Promise.resolve();
    pushing = true;
    return a._http('/rest/v1/safe_maps?select=data&user_id=eq.' + me).then(function (rows) {
      var m = mergeIn(rows && rows[0] && rows[0].data);
      if (m.changed) { writeLocal(); if (BOOT) { BOOT = false; } refresh(); }
      return syncPhotos(me).then(function (photosChanged) {
        if (photosChanged) { writeLocal(); refresh(); }
        var body = { maps: STORE.maps, dels: STORE.dels };
        if (!m.needPush && !photosChanged && !DIRTY) return;
        DIRTY = false;
        return a._http('/rest/v1/safe_maps?on_conflict=user_id', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' }, body: [{ user_id: me, data: body, updated_at: new Date().toISOString() }] });
      });
    }).catch(function () { }).then(function () { pushing = false; });
  }
  var DIRTY = false, BOOT = true;
  function removePhotos(people) {
    (people || []).forEach(function (p) { if (p.av && p.av.kind === 'photo') { X.photoDel(p.av.pid); if (p.av.up) STORE.dels.push(p.av.pid); } });
  }

  /* ===================== state ===================== */
  var HOST = null, ST = null, CACHE = {}, offDrag = null, toastT = 0, skipClick = false;
  function blankAdd() { return { step: 'how', group: 'family', c: null, pid: null, col: TAGCOLS[0], name: '', editing: null }; }
  function initState() {
    var m = curMap();
    return { screen: m.started ? 'map' : 'layout', sheet: null, add: blankAdd(), edit: false, selected: null, look: null, dl: 'png', toast: null, drag: null, prompt: null, promptEdit: null, newPrompt: '', editFocus: null, confirm: false, photoBusy: false };
  }
  function kidName() { var p = X.prof(); return p && p.name ? p.name : ''; }
  function kidG() { var p = X.prof(); return (p && p.kid) || 'boy'; }
  function labelsFor(m, l) { return (m.labels && m.labels[l]) || LBY[l].labels.map(pick); }
  function palFor(m, th) { var P = THEMES[th].palettes; return P[(m.pal && m.pal[th]) || 0].c; }
  function promptList(m) { return PROMPTS.map(function (q, i) { return (m.pEdit && m.pEdit[i]) || pick(q); }).concat(m.pOwn || []); }
  function layoutName(id) { return pick(LBY[id].name); }
  function titleText() { var n = kidName(); return n ? t(n + '’s safe people', 'Orang aman ' + n) : t('My safe people', 'Orang amanku'); }
  function set(p) { Object.assign(ST, p); render(); }
  function flash(msg) { clearTimeout(toastT); ST.toast = msg; render(); toastT = setTimeout(function () { ST.toast = null; render(); }, 4500); }
  function thumb(key, o) {
    var k = key + JSON.stringify(o.people ? o.people.map(function (p) { return p.id + p.zone; }) : 0) + (o.pal || []).join('') + o.g + (isId() ? 1 : 0);
    if (!CACHE[k]) CACHE[k] = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(drawMap(Object.assign({ names: false, labelsOn: false }, o)).svg);
    return '<img src="' + CACHE[k] + '" alt="" draggable="false">';
  }

  /* ===================== the screens ===================== */
  var ICON = {
    lock: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1E6B45" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex:none"><rect x="5" y="11" width="14" height="10" rx="3"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
    camera: '<svg width="74" height="58" viewBox="0 0 74 58" fill="none" stroke="#2B2A35" stroke-width="3" stroke-linejoin="round" aria-hidden="true"><rect x="24" y="4" width="26" height="12" rx="4" fill="#B9A3E3"/><rect x="3" y="11" width="68" height="44" rx="12" fill="#DCEBFA"/><circle cx="37" cy="33" r="13" fill="#fff"/><circle cx="37" cy="33" r="6" fill="#7DB3E8"/></svg>',
    gallery: '<svg width="60" height="50" viewBox="0 0 60 50" fill="none" stroke="#2B2A35" stroke-width="3" stroke-linejoin="round" aria-hidden="true"><rect x="10" y="3" width="47" height="38" rx="8" fill="#FFE9DA"/><rect x="3" y="9" width="47" height="38" rx="8" fill="#DDF2E4"/><circle cx="18" cy="21" r="5" fill="#FFC94A"/><path d="M3 40L18 30 28 37 36 31 50 41"/></svg>'
  };
  function dots(n) { return '<div class="spm-dots" aria-hidden="true">' + [0, 1, 2].map(function (i) { return '<i class="' + (i === n ? 'on' : i < n ? 'done' : '') + '"></i>'; }).join('') + '</div>'; }
  function topBar(back, n) {
    return '<div class="spm-top wrap">' + back + '<div class="spm-toptx"><b>' + esc(t('Safe People Map', 'Peta Orang Aman')) + '</b></div>' + dots(n) + '</div>';
  }
  function layoutCard(l, m) {
    var free = !locked('safe.' + l.id);
    return '<button type="button" class="spm-card' + (m.layout === l.id ? ' on' : '') + (free ? '' : ' lockd') + '" data-a="pick-layout" data-v="' + l.id + '"><span class="spm-thumb">' + thumb('L' + l.id + m.theme, { layout: l.id, theme: themeFor(l.id, m.theme), people: sample(l.id), g: kidG() }) + '</span><b>' + esc(pick(l.name)) + '</b><small>' + esc(pick(l.sub)) + '</small>' +
      (l.id === 'circles' ? '<span class="spm-sug">' + esc(t('Suggested', 'Disarankan')) + '</span>' : '') + plusPill('safe.' + l.id) + (m.layout === l.id ? '<span class="spm-tick">✓</span>' : '') + '</button>';
  }
  function screenLayout(m) {
    var shown = LAYOUTS.filter(function (l) { return !hidden('safe.' + l.id); });
    return '<div class="spm-screen">' + topBar('<a class="spm-iconbtn" href="#/tools" aria-label="' + esc(t('Back', 'Kembali')) + '">‹</a>', 0) +
      '<div class="spm-body wrap"><h2 class="spm-h">' + esc(t('Which map shall we make?', 'Peta mana yang mau kita buat?')) + '</h2>' +
      '<div class="spm-grid">' + shown.map(function (l) { return layoutCard(l, m); }).join('') + '</div>' +
      '</div><div class="spm-foot"><button type="button" class="spm-cta" data-a="go-theme">' + esc(t('Next', 'Lanjut')) + '</button></div></div>';
  }
  function screenTheme(m) {
    return '<div class="spm-screen">' + topBar('<button type="button" class="spm-iconbtn" data-a="go-layout" aria-label="' + esc(t('Back', 'Kembali')) + '">‹</button>', 1) +
      '<div class="spm-body wrap"><h2 class="spm-h">' + esc(t('What should it look like?', 'Mau terlihat seperti apa?')) + '</h2>' +
      '<div class="spm-grid big">' + Object.keys(THEMES).filter(function (k) { return k === 'plain' || !hidden('safe.' + k); }).map(function (k) {
        var T = THEMES[k], lk = k !== 'plain' && locked('safe.' + k);
        return '<button type="button" class="spm-card' + (m.theme === k ? ' on' : '') + (lk ? ' lockd' : '') + '" data-a="pick-theme" data-v="' + k + '"><span class="spm-thumb">' + thumb('T' + k + m.layout, { layout: m.layout, theme: k, people: sample(m.layout), g: kidG() }) + '</span><b>' + esc(pick(T.name)) + '</b><small>' + esc(pick(T.sub)) + '</small>' + (k !== 'plain' ? plusPill('safe.' + k) : '') + (m.theme === k ? '<span class="spm-tick">✓</span>' : '') + '</button>';
      }).join('') + '</div></div>' +
      '<div class="spm-foot"><div class="spm-foot2"><button type="button" class="spm-soft" data-a="skip-theme">' + esc(t('Skip', 'Lewati')) + '</button><button type="button" class="spm-cta" data-a="go-map">' + esc(t('Let’s start', 'Ayo mulai')) + '</button></div></div></div>';
  }
  function mapHTML(m) {
    var drag = ST.drag ? ST.drag.id : null;
    var r = drawMap({ layout: m.layout, theme: m.theme, pal: palFor(m, m.theme), labels: labelsFor(m, m.layout), people: m.people, hideId: drag, selId: ST.selected, highlight: !!ST.selected || !!drag, g: kidG() });
    return '<div class="spm-map' + (ST.selected ? ' picking' : '') + '" data-a="map">' + r.svg + r.tokens.map(function (k) { return '<button type="button" class="spm-tok" data-tok="' + esc(k.id) + '" aria-label="' + esc(k.name || t('Person', 'Orang')) + '" style="left:' + k.x / 4 + '%;top:' + k.y / 4 + '%"></button>'; }).join('') + '</div>';
  }
  function hints(m) {
    var name = kidName(), sel = m.people.filter(function (p) { return p.id === ST.selected; })[0], waiting = m.people.filter(function (p) { return p.zone == null; }), placed = m.people.length - waiting.length;
    if (sel) return sel.name ? [t('Where does ' + sel.name + ' go?', sel.name + ' ada di mana?'), t('Drag them onto the map, or tap a spot.', 'Seret ke peta, atau ketuk satu tempat.')] : [t('Where do they go?', 'Dia ada di mana?'), t('Drag them onto the map, or tap a spot.', 'Seret ke peta, atau ketuk satu tempat.')];
    if (waiting.length) return [t('Who’s waiting?', 'Siapa yang menunggu?'), t('Drag someone onto the map. Or tap them, then tap a spot.', 'Seret seseorang ke peta. Atau ketuk dia, lalu ketuk satu tempat.')];
    if (!m.people.length) return [name ? t('Who are your safe people, ' + name + '?', 'Siapa orang amanmu, ' + name + '?') : t('Who are your safe people?', 'Siapa orang amanmu?'), ''];
    return [t('Who else?', 'Siapa lagi?'), t(placed + (placed === 1 ? ' person' : ' people') + ' on the map. You can drag anyone to move them.', placed + ' orang di peta. Kamu bisa menyeret siapa saja untuk memindahkannya.')];
  }
  function screenMap(m) {
    var L = LBY[m.layout], T = THEMES[m.theme], h = hints(m), waiting = m.people.filter(function (p) { return p.zone == null; }), labels = labelsFor(m, m.layout);
    var head = '<div class="spm-top">' + (ST.edit ? '' : '<button type="button" class="spm-iconbtn" data-a="map-back" aria-label="' + esc(t('Back', 'Kembali')) + '">‹</button>') +
      '<div class="spm-toptx"><b class="big">' + esc(titleText()) + '</b><small>' + esc(ST.edit ? t('Editing', 'Sedang mengubah') : pick(L.name) + ' · ' + pick(T.name)) + '</small></div>' +
      (ST.edit ? '<button type="button" class="spm-done" data-a="toggle-edit">' + esc(t('Done', 'Selesai')) + '</button>' : '<button type="button" class="spm-grown" data-a="open-tools"><i></i><i></i><i></i>' + esc(t('Menu', 'Menu')) + '</button>') + '</div>';
    var prompt = ST.prompt ? '<div class="spm-prompt"><b>' + esc(ST.prompt) + '</b><button type="button" data-a="hide-prompt" aria-label="' + esc(t('Hide question', 'Sembunyikan pertanyaan')) + '">×</button></div>' : '';
    var side;
    if (ST.edit) {
      var ZC = function (i) { return m.layout === 'tree' && i < 2 ? '#C99A6B' : palFor(m, m.theme)[i % 6]; };
      side = '<div class="spm-side"><div class="spm-editgrp"><div class="spm-edith"><b>' + esc(pick(L.group)) + '</b><small>' + esc(t('Tap to rename', 'Ketuk untuk mengganti nama')) + '</small></div>' +
        labels.map(function (s, i) { return '<label class="spm-editrow"><span class="spm-zdot" style="background:' + ZC(i) + '"></span><span class="spm-zname">' + esc(pick(L.zones[i])) + '</span><input class="spm-input sm" data-in="label" data-v="' + i + '" value="' + esc(s) + '" maxlength="40"></label>'; }).join('') + '</div>' +
        '<div class="spm-editgrp"><b>' + esc(t('Colours', 'Warna')) + '</b><div class="spm-pals">' + T.palettes.map(function (p, i) { return '<button type="button" class="spm-palbtn' + (((m.pal && m.pal[m.theme]) || 0) === i ? ' on' : '') + '" data-a="pick-pal" data-v="' + i + '"><span>' + p.c.slice(0, 3).map(function (c) { return '<i style="background:' + c + '"></i>'; }).join('') + '</span>' + esc(pick(p.name)) + '</button>'; }).join('') + '</div></div>' +
        '<div class="spm-editgrp"><b>' + esc(t('People', 'Orang')) + '</b>' + (m.people.length ? '<div class="spm-plist">' + m.people.map(function (p) { return '<div class="spm-prow"><span class="spm-av40">' + avatarSVG(p.av) + '</span><div><b>' + esc(p.name || t('No name', 'Tanpa nama')) + '</b><small>' + esc(p.zone == null ? t('Waiting beside the map', 'Menunggu di samping peta') : labels[p.zone]) + '</small></div><button type="button" class="spm-mini" data-a="edit-person" data-v="' + esc(p.id) + '">' + esc(t('Edit', 'Ubah')) + '</button><button type="button" class="spm-mini red" data-a="remove-person" data-v="' + esc(p.id) + '">' + esc(t('Remove', 'Hapus')) + '</button></div>'; }).join('') + '</div>' : '<p class="spm-p">' + esc(t('Nobody on the map yet.', 'Belum ada orang di peta.')) + '</p>') + '</div></div>';
    } else {
      var picking = ST.selected ? '<div class="spm-sr">' + L.caps.map(function (c, z) { return '<button type="button" data-a="place" data-v="' + z + '">' + esc(pick(L.zones[z]) + ': ' + labels[z]) + '</button>'; }).join('') + '</div>' : '';
      side = '<div class="spm-side"><div class="spm-tray" data-zone="tray"><b>' + esc(h[0]) + '</b>' + (h[1] ? '<span>' + esc(h[1]) + '</span>' : '') + picking +
        (waiting.length ? '<div class="spm-trayrow">' + waiting.map(function (p) { return '<button type="button" class="spm-trayp' + (p.id === ST.selected ? ' on' : '') + '" data-tray="' + esc(p.id) + '"><span class="spm-av62">' + avatarSVG(p.av) + '</span><small>' + esc(p.name || ' ') + '</small></button>'; }).join('') + '</div>' : '') + '</div>' +
        '<button type="button" class="spm-add" data-a="open-add"><span class="spm-plus">+</span><b>' + esc(t('Add a person', 'Tambah orang')) + '</b><span class="spm-addfaces">' + ['f5', 's3', 'r4'].map(function (c) { return '<span>' + avatarSVG({ kind: 'ill', c: c }) + '</span>'; }).join('') + '</span></button></div>';
    }
    return '<div class="spm-screen mapscr">' + head + '<div class="spm-mapwrap"><div class="spm-mapcol">' + prompt + '<div class="spm-mapbox" id="spmMapBox">' + mapHTML(m) + '</div></div>' + side + '</div></div>';
  }

  /* ---------- sheets ---------- */
  function sheetAdd(m) {
    var a = ST.add, b = '';
    if (a.step === 'how') {
      b = '<div class="spm-ways">' +
        '<button type="button" class="spm-way" data-a="add-step" data-v="library"><span class="spm-wayart faces">' + ['f1', 'h5', 'r3'].map(function (c) { return '<span>' + avatarSVG({ kind: 'ill', c: c }) + '</span>'; }).join('') + '</span><b>' + esc(t('Choose a character', 'Pilih tokoh')) + '</b><small>' + esc(t('Family, school, helpers, friends', 'Keluarga, sekolah, penolong, teman')) + '</small></button>' +
        '<button type="button" class="spm-way" data-a="add-step" data-v="tag"><span class="spm-wayart"><span class="spm-tagmini">' + esc(t('Name', 'Nama')) + '</span></span><b>' + esc(t('Just a name', 'Nama saja')) + '</b><small>' + esc(t('A name tag, no picture', 'Label nama, tanpa gambar')) + '</small></button>' +
        (hidden('safe.photos') ? '' : '<button type="button" class="spm-way" data-a="add-photo"><span class="spm-wayart">' + ICON.camera + '</span><b>' + esc(t('Use a photo', 'Pakai foto')) + '</b><small>' + esc(t('Camera or gallery', 'Kamera atau galeri')) + '</small>' + plusPill('safe.photos') + '</button>') + '</div>';
    } else if (a.step === 'library') {
      b = '<div class="spm-groups">' + GROUPS.map(function (g) { return '<button type="button" class="' + (a.group === g.id ? 'on' : '') + '" data-a="add-group" data-v="' + g.id + '"><span>' + avatarSVG({ kind: 'ill', c: g.face }) + '</span><b>' + esc(pick(g.name)) + '</b></button>'; }).join('') + '</div>' +
        '<div class="spm-chars">' + LIB.filter(function (l) { return l[1] === a.group; }).map(function (l) { return '<button type="button" style="background:' + l[2].bg + '" data-a="add-char" data-v="' + l[0] + '" aria-label="' + esc(charLabel(l[2])) + '">' + fullSVG(l[0]) + '</button>'; }).join('') + '</div>';
    } else if (a.step === 'name-char') {
      b = '<div class="spm-chosen"><span class="spm-chosenart" style="background:' + (CH[a.c] || CH.f1).bg + '">' + fullSVG(a.c) + '</span>' + (a.editing ? '' : '<button type="button" class="spm-linkbtn" data-a="add-step" data-v="library">' + esc(t('Pick someone else', 'Pilih yang lain')) + '</button>') + '</div>' +
        '<label class="spm-field"><b>' + esc(t('Give them a name', 'Beri nama')) + '</b><input class="spm-input" data-in="add-name" value="' + esc(a.name) + '" placeholder="' + esc(t('Type a name', 'Ketik nama')) + '" maxlength="24"></label>';
    } else if (a.step === 'tag') {
      b = '<div class="spm-tagbox"><span class="spm-tagbig" id="spmTag" style="background:' + a.col + '">' + esc(a.name.trim() || t('Name', 'Nama')) + '</span></div>' +
        '<label class="spm-field"><b>' + esc(t('Name', 'Nama')) + '</b><input class="spm-input" data-in="add-name" value="' + esc(a.name) + '" placeholder="' + esc(t('Type a name', 'Ketik nama')) + '" maxlength="24"></label>' +
        '<div class="spm-field"><b class="sm">' + esc(t('Pick a colour', 'Pilih warna')) + '</b><div class="spm-cols">' + TAGCOLS.map(function (c) { return '<button type="button" class="' + (a.col === c ? 'on' : '') + '" style="background:' + c + '" data-a="add-col" data-v="' + c + '" aria-label="' + esc(t('Colour', 'Warna')) + '"></button>'; }).join('') + '</div></div>';
    } else if (a.step === 'photo') {
      var inAccount = !!uid();
      b = (a.pid ? '<div class="spm-chosen"><span class="spm-chosenart round">' + avatarSVG({ kind: 'photo', pid: a.pid }) + '</span><label class="spm-linkbtn"><input type="file" accept="image/*" data-file hidden>' + esc(t('Choose another photo', 'Pilih foto lain')) + '</label></div>' +
        '<label class="spm-field"><b>' + esc(t('Name', 'Nama')) + ' <span class="opt">' + esc(t('optional', 'boleh dikosongkan')) + '</span></b><input class="spm-input" data-in="add-name" value="' + esc(a.name) + '" placeholder="' + esc(t('Type a name', 'Ketik nama')) + '" maxlength="24"></label>' :
        '<div class="spm-two"><label class="spm-src"><input type="file" accept="image/*" capture="environment" data-file hidden>' + ICON.camera + esc(t('Take a photo', 'Ambil foto')) + '</label><label class="spm-src"><input type="file" accept="image/*" data-file hidden>' + ICON.gallery + esc(t('From gallery', 'Dari galeri')) + '</label></div>') +
        '<div class="spm-safe">' + ICON.lock + '<span>' + esc(inAccount ? t('Photos are saved privately in your account, so you can see them on your other devices. You can remove them at any time.', 'Foto disimpan secara pribadi di akunmu, sehingga bisa dilihat di perangkatmu yang lain. Kamu bisa menghapusnya kapan saja.') : t('This photo stays on this device.', 'Foto ini tetap di perangkat ini.')) + ' ' + esc(t('Please only add photos you have permission to use.', 'Mohon hanya menambahkan foto yang boleh kamu pakai.')) + '</span></div>';
    }
    if (a.editing) b += '<button type="button" class="spm-linkbtn red" data-a="remove-person" data-v="' + esc(a.editing) + '">' + esc(t('Remove from the map', 'Hapus dari peta')) + '</button>';
    return b;
  }
  function canSave(a) { return a.step === 'name-char' ? !!a.c : a.step === 'tag' ? !!a.name.trim() : a.step === 'photo' ? !!a.pid : false; }
  function sheetHTML(m) {
    var s = ST.sheet; if (!s) return '';
    var a = ST.add, body = '', title = '', back = false, foot = null, cancel = false;
    if (s === 'add') {
      title = a.editing ? t('Edit person', 'Ubah orang') : { how: t('Add a person', 'Tambah orang'), library: t('Choose a character', 'Pilih tokoh'), 'name-char': t('What’s their name?', 'Siapa namanya?'), tag: t('Just a name', 'Nama saja'), photo: t('Add a photo', 'Tambah foto') }[a.step];
      back = a.step !== 'how' && !a.editing; body = sheetAdd(m);
      if (a.step !== 'how' && a.step !== 'library') foot = [a.editing ? t('Save', 'Simpan') : t('Add to the map', 'Masukkan ke peta'), 'save-add', canSave(a)];
    } else if (s === 'tools') {
      title = t('For grown-ups', 'Untuk orang dewasa');
      var rows = [
        ['open-look', t('Change look', 'Ganti tampilan'), t('Switch layout or theme. Everyone stays on the map.', 'Ganti peta atau tema. Semua orang tetap di peta.')],
        ['toggle-edit', t('Edit map', 'Ubah peta'), t('Rename labels, change colours, edit or remove people.', 'Ganti nama label, warna, ubah atau hapus orang.')],
        ['open-prompts', t('Prompts', 'Pertanyaan'), t('Gentle questions to show on the map.', 'Pertanyaan lembut untuk ditampilkan di peta.')],
        ['open-download', t('Download', 'Unduh'), t('Save a picture, or a PDF to print.', 'Simpan gambar, atau PDF untuk dicetak.')],
        ['open-new', t('Start a new map', 'Mulai peta baru'), t('Clears this map and its photos.', 'Menghapus peta ini beserta fotonya.')]
      ];
      body = '<div class="spm-toolrows">' + rows.map(function (r) { return '<button type="button" data-a="' + r[0] + '"><div><b>' + esc(r[1]) + '</b><small>' + esc(r[2]) + '</small></div><span>›</span></button>'; }).join('') + '</div>';
    } else if (s === 'look') {
      var lk = ST.look; title = t('Change look', 'Ganti tampilan');
      body = (PLAIN_ONLY[lk.layout] ? '' : '<div class="spm-tabs">' + [['layout', t('Layout', 'Peta')], ['theme', t('Theme', 'Tema')]].map(function (x) { return '<button type="button" class="' + (lk.tab === x[0] ? 'on' : '') + '" data-a="look-tab" data-v="' + x[0] + '">' + esc(x[1]) + '</button>'; }).join('') + '</div>') +
        '<div class="spm-info">' + esc(t('Everyone stays. They move into the new shape, and anyone who doesn’t fit waits beside the map.', 'Semua tetap ada. Mereka pindah ke bentuk baru, dan yang tidak muat menunggu di samping peta.')) + '</div>' +
        '<div class="spm-grid sm">' + (lk.tab === 'layout' ? LAYOUTS.filter(function (l) { return !hidden('safe.' + l.id); }).map(function (l) {
          return '<button type="button" class="spm-card sm' + (lk.layout === l.id ? ' on' : '') + (locked('safe.' + l.id) ? ' lockd' : '') + '" data-a="look-layout" data-v="' + l.id + '"><span class="spm-thumb">' + thumb('K' + l.id + lk.theme, { layout: l.id, theme: themeFor(l.id, lk.theme), pal: palFor(m, themeFor(l.id, lk.theme)), people: l.id === m.layout ? m.people : remap(m.people, m.layout, l.id).people, g: kidG() }) + '</span><b>' + esc(pick(l.name)) + '</b>' + (m.layout === l.id ? '<span class="spm-now">' + esc(t('Now', 'Sekarang')) + '</span>' : plusPill('safe.' + l.id)) + '</button>';
        }).join('') : Object.keys(THEMES).filter(function (k) { return k === 'plain' || !hidden('safe.' + k); }).map(function (k) {
          return '<button type="button" class="spm-card sm' + (lk.theme === k ? ' on' : '') + (k !== 'plain' && locked('safe.' + k) ? ' lockd' : '') + '" data-a="look-theme" data-v="' + k + '"><span class="spm-thumb">' + thumb('KT' + k + lk.layout, { layout: lk.layout, theme: k, people: lk.layout === m.layout ? m.people : remap(m.people, m.layout, lk.layout).people, g: kidG() }) + '</span><b>' + esc(pick(THEMES[k].name)) + '</b>' + (m.theme === k ? '<span class="spm-now">' + esc(t('Now', 'Sekarang')) + '</span>' : k !== 'plain' ? plusPill('safe.' + k) : '') + '</button>';
        }).join('')) + '</div>';
      foot = [t('Use this look', 'Pakai tampilan ini'), 'apply-look', true]; cancel = true;
    } else if (s === 'prompts') {
      title = t('Prompts', 'Pertanyaan');
      var name = kidName(), ownLock = locked('safe.prompts');
      body = '<p class="spm-p">' + esc(t('Show a question on the map to start a gentle chat.', 'Tampilkan pertanyaan di peta untuk memulai obrolan yang lembut.') + (ownLock ? '' : ' ' + t('Change the words to suit ' + (name || 'your child') + '.', 'Ubah kata-katanya agar cocok untuk ' + (name || 'anakmu') + '.'))) + '</p><div class="spm-qs">' +
        promptList(m).map(function (q, i) {
          return '<div class="spm-q">' + (ST.promptEdit === i ? '<input class="spm-input sm on" data-in="prompt" data-v="' + i + '" value="' + esc(q) + '" maxlength="120"><button type="button" class="spm-dark" data-a="prompt-done">' + esc(t('Save', 'Simpan')) + '</button>' :
            '<b>' + esc(q) + '</b><button type="button" class="spm-linkmini" data-a="prompt-edit" data-v="' + i + '">' + esc(t('Edit', 'Ubah')) + plusPill('safe.prompts') + '</button><button type="button" class="spm-show' + (ST.prompt === q ? ' on' : '') + '" data-a="prompt-show" data-v="' + i + '">' + esc(ST.prompt === q ? t('Showing', 'Ditampilkan') : t('Show', 'Tampilkan')) + '</button>') + '</div>';
        }).join('') + '</div>' +
        (hidden('safe.prompts') ? '' : '<div class="spm-newq"><input class="spm-input sm dash" data-in="new-prompt" value="' + esc(ST.newPrompt) + '" placeholder="' + esc(t('Write your own question', 'Tulis pertanyaanmu sendiri')) + '" maxlength="120"><button type="button" class="spm-dark" data-a="prompt-add">' + esc(t('Add', 'Tambah')) + plusPill('safe.prompts') + '</button></div>');
    } else if (s === 'download') {
      title = t('Download', 'Unduh');
      body = '<div class="spm-dlprev"><b>' + esc(titleText()) + '</b><div>' + drawMap({ layout: m.layout, theme: m.theme, pal: palFor(m, m.theme), labels: labelsFor(m, m.layout), people: m.people, g: kidG() }).svg + '</div></div>' +
        '<div class="spm-two">' + [['png', t('Picture (PNG)', 'Gambar (PNG)'), t('For a phone, tablet or message', 'Untuk HP, tablet, atau pesan')], ['pdf', t('PDF to print', 'PDF untuk dicetak'), t('A full page for the fridge or classroom', 'Satu halaman untuk kulkas atau kelas')]].map(function (o) { return '<button type="button" class="spm-opt' + (ST.dl === o[0] ? ' on' : '') + '" data-a="pick-dl" data-v="' + o[0] + '"><b>' + esc(o[1]) + '</b><small>' + esc(o[2]) + '</small></button>'; }).join('') + '</div>' +
        '<div class="spm-safe big">' + ICON.lock + '<span>' + esc(t('The file saves straight to this device.', 'File langsung tersimpan di perangkat ini.')) + '</span></div>';
      foot = [t('Download', 'Unduh'), 'do-download', true]; cancel = true;
    } else if (s === 'new') {
      title = t('Start a new map?', 'Mulai peta baru?');
      body = '<p class="spm-p">' + esc(t('This clears everyone from this map, along with any photos on it. Download the map first if you’d like to keep it.', 'Ini menghapus semua orang dari peta ini, beserta fotonya. Unduh petanya dulu kalau ingin menyimpannya.')) + '</p>';
      foot = [t('Yes, start again', 'Ya, mulai lagi'), 'do-new', true]; cancel = true;
    }
    return '<div class="spm-scrim" data-a="close"></div><div class="spm-sheet" role="dialog" aria-modal="true" aria-label="' + esc(title) + '"><div class="spm-grab"><i></i></div><div class="spm-shead">' +
      (back ? '<button type="button" class="spm-iconbtn" data-a="sheet-back" aria-label="' + esc(t('Back', 'Kembali')) + '">‹</button>' : '') + '<b>' + esc(title) + '</b><button type="button" class="spm-x" data-a="close" aria-label="' + esc(t('Close', 'Tutup')) + '">×</button></div>' +
      '<div class="spm-sbody" id="spmSBody">' + body + '</div>' +
      (foot ? '<div class="spm-sfoot">' + (cancel ? '<button type="button" class="spm-soft" data-a="close">' + esc(t('Cancel', 'Batal')) + '</button>' : '') + '<button type="button" class="spm-cta' + (foot[2] ? '' : ' off') + '" id="spmPrimary" data-a="' + foot[1] + '">' + esc(foot[0]) + '</button></div>' : '') + '</div>';
  }

  /* ===================== drawing to the page ===================== */
  function render() {
    if (!HOST || !HOST.isConnected || !ST) return;
    var m = curMap(), sb = document.getElementById('spmSBody'), top = sb ? sb.scrollTop : 0, sheetWas = ST._sheetKey;
    var html = ST.screen === 'layout' ? screenLayout(m) : ST.screen === 'theme' ? screenTheme(m) : screenMap(m);
    html += sheetHTML(m);
    if (ST.toast) html += '<div class="spm-toast" role="status"><div>' + esc(ST.toast) + '</div></div>';
    HOST.innerHTML = html;
    document.documentElement.classList.toggle('spm-lock', !!ST.sheet);
    ST._sheetKey = ST.sheet + (ST.add ? ST.add.step : '');
    var nb = document.getElementById('spmSBody'); if (nb && sheetWas === ST._sheetKey) nb.scrollTop = top;
    var f = HOST.querySelector('.spm-input.on'); if (f) { f.focus(); f.setSelectionRange(f.value.length, f.value.length); }
  }
  function updateMapOnly() { var box = document.getElementById('spmMapBox'); if (box) box.innerHTML = mapHTML(curMap()); }
  function refresh() { if (ST && !ST.drag && !ST.sheet) { var m = curMap(); if (m.started && ST.screen === 'layout') ST.screen = 'map'; render(); } }
  /* ===================== actions ===================== */
  function place(id, zone) {
    var m = curMap(), L = LBY[m.layout], me = m.people.filter(function (p) { return p.id === id; })[0]; if (!me) return;
    var old = me.zone;
    if (zone != null) {
      var inZone = m.people.filter(function (p) { return p.zone === zone && p.id !== id; });
      if (inZone.length >= L.caps[zone]) {
        if (L.caps[zone] === 1) inZone[0].zone = old;
        else { ST.selected = null; flash(t('That spot is full. Try another one.', 'Tempat itu sudah penuh. Coba yang lain.')); return; }
      }
    }
    me.zone = zone;
    m.people = m.people.filter(function (p) { return p.id !== id; }).concat([me]);
    ST.selected = null; DIRTY = true; saveMap(); render();
  }
  function hitZone(x, y) {
    var els = document.elementsFromPoint(x, y);
    for (var i = 0; i < els.length; i++) {
      var n = els[i]; if (!HOST.contains(n)) continue;
      while (n && n !== HOST) { var z = n.getAttribute && n.getAttribute('data-zone'); if (z != null) return z === 'tray' ? null : +z; if (n.tagName === 'svg' || n.tagName === 'BUTTON') break; n = n.parentNode; }
    }
    return undefined;
  }
  function startDrag(e, id, from) {
    var m = curMap();
    if (ST.edit && from === 'map') { openPerson(id); return; }
    e.preventDefault();
    var sx = e.clientX, sy = e.clientY, moved = false, ghost = null, who = m.people.filter(function (p) { return p.id === id; })[0]; if (!who) return;
    var move = function (ev) {
      if (!moved && Math.hypot(ev.clientX - sx, ev.clientY - sy) > 6) {
        moved = true; ST.drag = { id: id }; updateMapOnly();
        ghost = document.createElement('div'); ghost.className = 'spm-ghost'; ghost.innerHTML = avatarSVG(who.av); document.body.appendChild(ghost);
      }
      if (ghost) { ghost.style.left = ev.clientX + 'px'; ghost.style.top = ev.clientY + 'px'; }
    };
    var up = function (ev) {
      offDrag();
      if (ghost) ghost.remove();
      if (moved) {
        var z = hitZone(ev.clientX, ev.clientY); ST.drag = null;
        if (z !== undefined) place(id, z); else render();
      } else { ST.selected = ST.selected === id ? null : id; render(); }
      skipClick = true; setTimeout(function () { skipClick = false; }, 0);
    };
    offDrag = function () { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up); offDrag = null; };
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
  }
  function openPerson(id) {
    var m = curMap(), p = m.people.filter(function (q) { return q.id === id; })[0]; if (!p) return;
    var a = Object.assign(blankAdd(), { name: p.name || '', editing: id });
    if (p.av.kind === 'ill') Object.assign(a, { step: 'name-char', c: p.av.c });
    else if (p.av.kind === 'name') Object.assign(a, { step: 'tag', col: p.av.col });
    else Object.assign(a, { step: 'photo', pid: p.av.pid });
    set({ sheet: 'add', add: a });
  }
  function saveAdd() {
    var a = ST.add, m = curMap(); if (!canSave(a)) return;
    var name = a.name.trim(), av = a.step === 'name-char' ? { kind: 'ill', c: a.c } : a.step === 'tag' ? { kind: 'name', col: a.col, name: name } : { kind: 'photo', pid: a.pid };
    if (a.editing) m.people = m.people.map(function (p) {
      if (p.id !== a.editing) return p;
      if (p.av.kind === 'photo' && p.av.pid === a.pid) av.up = p.av.up;
      else removePhotos([p]);
      return Object.assign({}, p, { name: name, av: av });
    });
    else { var id = 'n' + Date.now(); m.people.push({ id: id, name: name, av: av, zone: null }); ST.selected = id; }
    ST.sheet = null; DIRTY = true; saveMap(); render();
  }
  function applyLook() {
    var lk = ST.look, m = curMap(), msg = null;
    m.theme = themeFor(lk.layout, lk.theme);
    if (lk.layout !== m.layout) {
      var r = remap(m.people, m.layout, lk.layout), w = r.waiting.filter(Boolean);
      m.people = r.people; m.layout = lk.layout;
      msg = t('Everyone moved into the ' + layoutName(lk.layout).toLowerCase() + '.', 'Semua pindah ke peta ' + layoutName(lk.layout).toLowerCase() + '.');
      if (r.waiting.length) msg += ' ' + (w.length === r.waiting.length ? w.join(t(' and ', ' dan ')) + t(w.length === 1 ? ' is waiting' : ' are waiting', ' menunggu') : t(r.waiting.length + ' waiting', r.waiting.length + ' menunggu')) + t(' beside the map.', ' di samping peta.');
    }
    ST.sheet = null; DIRTY = true; saveMap();
    if (msg) flash(msg); else render();
  }
  function compact(file) {
    return new Promise(function (res, rej) {
      var url = URL.createObjectURL(file), img = new Image();
      img.onload = function () {
        var S = 512, w = img.naturalWidth, h = img.naturalHeight, side = Math.min(w, h), cv = document.createElement('canvas'); cv.width = S; cv.height = S;
        // a square from the middle, nudged upward because faces tend to sit in the top half of a portrait
        cv.getContext('2d').drawImage(img, (w - side) / 2, Math.max(0, (h - side) * .3), side, side, 0, 0, S, S);
        URL.revokeObjectURL(url); res(cv.toDataURL('image/jpeg', .82));
      };
      img.onerror = function () { URL.revokeObjectURL(url); rej(); };
      img.src = url;
    });
  }
  function onFile(input) {
    var f = input.files && input.files[0]; if (!f) return;
    compact(f).then(function (data) {
      var pid = 'spm_' + Date.now(), old = ST.add.pid;
      return X.photoPut(pid, data).then(function () {
        if (old && !ST.add.editing) X.photoDel(old);
        ST.add.pid = pid; render();
      });
    }).catch(function () { flash(t('We couldn’t open that photo. Try another one.', 'Foto itu tidak bisa dibuka. Coba foto lain.')); });
  }
  function exportSVG(m) {
    var title = esc(titleText()), r = drawMap({ layout: m.layout, theme: m.theme, pal: palFor(m, m.theme), labels: labelsFor(m, m.layout), people: m.people, g: kidG() });
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 440 500" width="1320" height="1500"><rect width="440" height="500" fill="#FBF8F3"/><text x="220" y="44" text-anchor="middle" font-family="Fredoka, Figtree, system-ui, sans-serif" font-weight="600" font-size="26" fill="' + K + '">' + title + '</text>' +
      r.svg.replace('<svg ', '<svg x="20" y="64" ').replace('width="100%" height="100%"', 'width="400" height="400"') + '<text x="220" y="488" text-anchor="middle" font-family="Figtree, system-ui, sans-serif" font-size="11" fill="#6B6875">Little Us · ' + esc(t('Safe People Map', 'Peta Orang Aman')) + '</text></svg>';
  }
  function doDownload() {
    var m = curMap(), url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(exportSVG(m));
    if (ST.dl === 'png') {
      var img = new Image();
      img.onload = function () { var cv = document.createElement('canvas'); cv.width = 1320; cv.height = 1500; cv.getContext('2d').drawImage(img, 0, 0, 1320, 1500); var a = document.createElement('a'); a.download = 'safe-people-map.png'; a.href = cv.toDataURL('image/png'); document.body.appendChild(a); a.click(); a.remove(); };
      img.src = url;
    } else {
      var fr = document.createElement('iframe'); fr.style.cssText = 'position:fixed;width:0;height:0;border:0;left:-9999px'; document.body.appendChild(fr);
      var d = fr.contentWindow.document; d.open(); d.write('<!doctype html><title>' + esc(titleText()) + '</title><body style="margin:0;display:flex;justify-content:center"><img id="m" src="' + url + '" style="width:100%;max-width:180mm"></body>'); d.close();
      var im = d.getElementById('m'), go = function () { setTimeout(function () { fr.contentWindow.focus(); fr.contentWindow.print(); setTimeout(function () { fr.remove(); }, 60000); }, 200); };
      if (im.complete) go(); else im.onload = go;
    }
    ST.sheet = null; flash(t('Saved to this device.', 'Tersimpan di perangkat ini.'));
  }
  function act(a, v, el) {
    var m = curMap();
    switch (a) {
      case 'close': return set({ sheet: null });
      case 'sheet-back': return (function () { ST.add.step = { library: 'how', 'name-char': 'library', tag: 'how', photo: 'how' }[ST.add.step] || 'how'; render(); })();
      case 'go-layout': return set({ screen: 'layout' });
      case 'map-back': return set({ screen: PLAIN_ONLY[m.layout] ? 'layout' : 'theme', edit: false });
      case 'go-theme':
        if (PLAIN_ONLY[m.layout]) { m.started = true; DIRTY = true; saveMap(); return set({ screen: 'map' }); }
        return set({ screen: 'theme', edit: false });
      case 'go-map': m.started = true; DIRTY = true; saveMap(); return set({ screen: 'map' });
      case 'skip-theme': m.theme = 'plain'; m.started = true; DIRTY = true; saveMap(); return set({ screen: 'map' });
      case 'pick-layout':
        if (locked('safe.' + v)) return showLock('safe.' + v, el.querySelector('.spm-thumb').innerHTML);
        if (m.people.length && v !== m.layout) m.people = remap(m.people, m.layout, v).people;
        m.layout = v; m.theme = themeFor(v, m.theme); return render();
      case 'pick-theme':
        if (v !== 'plain' && locked('safe.' + v)) return showLock('safe.' + v, el.querySelector('.spm-thumb').innerHTML);
        m.theme = v; return render();
      case 'open-add': return set({ sheet: 'add', add: blankAdd() });
      case 'open-tools': return set({ sheet: 'tools' });
      case 'open-look': return set({ sheet: 'look', look: { tab: 'layout', layout: m.layout, theme: m.theme } });
      case 'open-prompts': return set({ sheet: 'prompts', promptEdit: null });
      case 'open-download': return set({ sheet: 'download' });
      case 'open-new': return set({ sheet: 'new' });
      case 'do-new':
        removePhotos(m.people);
        STORE.maps[childKey()] = Object.assign(blankMap(), { updated: nextStamp(m) }); DIRTY = true; writeLocal(); schedulePush();
        return set({ sheet: null, screen: 'layout', prompt: null, selected: null, edit: false });
      case 'toggle-edit': return set({ sheet: null, edit: !ST.edit, selected: null });
      case 'hide-prompt': return set({ prompt: null });
      case 'add-step': ST.add.step = v; return render();
      case 'add-photo':
        if (locked('safe.photos')) return showLock('safe.photos', ICON.camera);
        ST.add.step = 'photo'; return render();
      case 'add-group': ST.add.group = v; return render();
      case 'add-char': ST.add.c = v; ST.add.step = 'name-char'; return render();
      case 'add-col': ST.add.col = v; return render();
      case 'save-add': return saveAdd();
      case 'edit-person': return openPerson(v);
      case 'remove-person':
        removePhotos(m.people.filter(function (p) { return p.id === v; }));
        m.people = m.people.filter(function (p) { return p.id !== v; });
        ST.sheet = null; DIRTY = true; saveMap(); return render();
      case 'pick-pal': m.pal = m.pal || {}; m.pal[m.theme] = +v; DIRTY = true; saveMap(); return render();
      case 'place': return place(ST.selected, +v);
      case 'look-tab': ST.look.tab = v; return render();
      case 'look-layout':
        if (locked('safe.' + v) && v !== m.layout) return showLock('safe.' + v, el.querySelector('.spm-thumb').innerHTML);
        ST.look.layout = v; if (PLAIN_ONLY[v]) ST.look.tab = 'layout'; return render();
      case 'look-theme':
        if (v !== 'plain' && locked('safe.' + v) && v !== m.theme) return showLock('safe.' + v, el.querySelector('.spm-thumb').innerHTML);
        ST.look.theme = v; return render();
      case 'apply-look': return applyLook();
      case 'prompt-show': return set({ prompt: promptList(m)[+v], sheet: null });
      case 'prompt-edit':
        if (locked('safe.prompts')) return showLock('safe.prompts');
        return set({ promptEdit: +v });
      case 'prompt-done': return set({ promptEdit: null });
      case 'prompt-add':
        if (locked('safe.prompts')) return showLock('safe.prompts');
        if (ST.newPrompt.trim()) { m.pOwn = (m.pOwn || []).concat([ST.newPrompt.trim()]); ST.newPrompt = ''; DIRTY = true; saveMap(); return render(); }
        return;
      case 'pick-dl': return set({ dl: v });
      case 'do-download': return doDownload();
    }
  }
  function onClick(e) {
    var b = e.target.closest('[data-a]'); if (!b || !HOST.contains(b)) return;
    if (b.getAttribute('data-a') === 'map') {
      if (skipClick || !ST.selected) return;
      var z = hitZone(e.clientX, e.clientY);
      if (z !== undefined && z !== null) place(ST.selected, z);
      return;
    }
    if (b.classList.contains('off')) return;
    act(b.getAttribute('data-a'), b.getAttribute('data-v'), b);
  }
  function onInput(e) {
    var el = e.target, k = el.getAttribute('data-in'); if (!k) return;
    var m = curMap(), v = el.value;
    if (k === 'add-name') {
      ST.add.name = v;
      var tag = document.getElementById('spmTag'); if (tag) tag.textContent = v.trim() || t('Name', 'Nama');
      var p = document.getElementById('spmPrimary'); if (p) p.classList.toggle('off', !canSave(ST.add));
    } else if (k === 'label') {
      var arr = labelsFor(m, m.layout).slice(); arr[+el.getAttribute('data-v')] = v;
      m.labels = m.labels || {}; m.labels[m.layout] = arr; DIRTY = true; saveMap(); updateMapOnly();
    } else if (k === 'prompt') {
      var i = +el.getAttribute('data-v');
      if (i < PROMPTS.length) { m.pEdit = m.pEdit || {}; m.pEdit[i] = v; } else { m.pOwn[i - PROMPTS.length] = v; }
      DIRTY = true; saveMap();
    } else if (k === 'new-prompt') ST.newPrompt = v;
  }
  function onChange(e) { if (e.target.hasAttribute && e.target.hasAttribute('data-file')) onFile(e.target); }
  function onDown(e) {
    if (e.button) return;
    var n = e.target.closest && e.target.closest('[data-tok],[data-tray]'); if (!n || !HOST.contains(n)) return;
    if (n.hasAttribute('data-tok')) startDrag(e, n.getAttribute('data-tok'), 'map');
    else startDrag(e, n.getAttribute('data-tray'), 'tray');
  }
  function onKey(e) {
    if (e.key === 'Escape' && ST && ST.sheet && HOST && HOST.isConnected) set({ sheet: null });
    // keyboard users pick someone up with Enter or Space; the free spots then appear as a list of buttons
    if ((e.key === 'Enter' || e.key === ' ') && e.target.closest) { var n = e.target.closest('[data-tok],[data-tray]'); if (n && HOST && HOST.contains(n)) { e.preventDefault(); var id = n.getAttribute('data-tok') || n.getAttribute('data-tray'); if (ST.edit) openPerson(id); else set({ selected: ST.selected === id ? null : id }); } }
  }

  /* ===================== styles ===================== */
  var CSS = [
    '.spm-page{padding:0!important;max-width:none!important}',
    '.spm-app{--sp-ink:#2B2A35;--sp-soft:#6B6875;--sp-line:#ECE6DC;background:#FBF8F3;color:var(--sp-ink);font-family:Figtree,system-ui,sans-serif;font-size:15px;line-height:1.45;min-height:70vh}',
    '.spm-app button,.spm-app input{font:inherit;color:inherit}',
    '.spm-app button{cursor:pointer;-webkit-tap-highlight-color:transparent}',
    '.spm-screen{display:flex;flex-direction:column;min-height:70vh}',
    '.spm-top{display:flex;align-items:center;gap:12px;padding:14px 16px 8px}',
    '.spm-top.wrap,.spm-body.wrap{max-width:812px;width:100%;margin:0 auto;box-sizing:border-box}',
    '.spm-iconbtn{flex:none;width:44px;height:44px;border-radius:14px;background:#fff;border:1px solid var(--sp-line);font:700 22px Figtree,sans-serif;display:flex;align-items:center;justify-content:center;text-decoration:none;color:var(--sp-ink)}',
    '.spm-toptx{flex:1;min-width:0;display:flex;flex-direction:column}.spm-toptx b{font:600 18px/1.15 Fredoka,sans-serif}.spm-toptx b.big{font-size:21px}.spm-toptx small{font-size:12.5px;color:var(--sp-soft)}',
    '.spm-dots{display:flex;align-items:center;gap:6px}.spm-dots i{width:8px;height:8px;border-radius:99px;background:#E4DCCF}.spm-dots i.done{background:var(--sp-ink)}.spm-dots i.on{width:22px;background:var(--sp-ink)}',
    '.spm-body{flex:1;padding:6px 16px 24px;display:flex;flex-direction:column;gap:14px}',
    '.spm-h{font:600 30px/1.12 Fredoka,sans-serif;margin:0;text-wrap:balance}.spm-p{margin:0;color:var(--sp-soft);font-size:14px;text-wrap:pretty}',
    '.spm-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px}.spm-grid.big{grid-template-columns:repeat(auto-fill,minmax(200px,1fr))}.spm-grid.sm{grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:10px}',
    '.spm-card{position:relative;display:flex;flex-direction:column;gap:2px;padding:8px 8px 12px;background:#fff;border:1px solid #E4DCCF;border-radius:22px;box-shadow:0 3px 0 #EFE7DA;text-align:left;min-width:0}',
    '.spm-card b{font:600 19px/1.2 Fredoka,sans-serif;padding:6px 4px 0}.spm-card small{font-size:13px;color:var(--sp-soft);line-height:1.3;padding:0 4px}.spm-card.sm{border-radius:18px;padding:6px 6px 10px;box-shadow:none}.spm-card.sm b{font-size:14.5px}',
    '.spm-card.on{box-shadow:0 0 0 2.5px var(--sp-ink),0 0 0 6.5px #FFC94A;border-color:transparent}',
    '.spm-thumb{display:block;width:100%;aspect-ratio:1;border-radius:16px;overflow:hidden;background:#F3EEE6}.spm-thumb img{width:100%;height:100%;display:block}.spm-card.lockd .spm-thumb img{opacity:.72}',
    '.spm-sug,.spm-now{position:absolute;top:14px;left:14px;padding:3px 10px;border-radius:999px;background:#DDF2E4;color:#1E6B45;font-size:12px;font-weight:800;box-shadow:0 0 0 1.5px #fff}.spm-now{background:#fff;color:var(--sp-ink);font-size:11px;top:10px;left:10px;padding:2px 8px}',
    '.spm-tick{position:absolute;top:12px;right:12px;width:30px;height:30px;border-radius:50%;background:var(--sp-ink);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:15px;box-shadow:0 0 0 2px #fff}',
    '.spm-pill{display:inline-block;padding:2px 9px;border-radius:999px;background:#2B2A35;color:#FFC94A;font:800 11px/1.5 Figtree,sans-serif;letter-spacing:.03em}.spm-pill.free{background:#DDF2E4;color:#1E6B45}',
    '.spm-card>.spm-pill,.spm-way>.spm-pill{position:absolute;top:13px;right:13px;box-shadow:0 0 0 2px #fff}',
    '.spm-foot{position:sticky;bottom:0;z-index:3;padding:12px 16px 20px;border-top:1px solid var(--sp-line);background:#FBF8F3;display:flex;justify-content:center}.spm-foot2{width:100%;max-width:440px;display:flex;gap:10px}.spm-foot>.spm-cta{max-width:440px}',
    '.spm-cta{width:100%;flex:1;min-height:58px;border-radius:18px;border:0;background:#FFC94A;box-shadow:0 3px 0 #E0A92A;font:600 21px Fredoka,sans-serif!important}.spm-cta:hover{background:#FFD060}.spm-cta.off{opacity:.5;cursor:default}',
    '.spm-soft{flex:0 0 34%;min-height:58px;border-radius:18px;border:0;background:#F3EEE6;font:600 18px Fredoka,sans-serif!important}',
    '.spm-grown{flex:none;min-height:44px;padding:0 16px;border-radius:14px;border:0;background:#2B2A35;font:700 15px Figtree,sans-serif!important;color:#fff!important;display:flex;align-items:center;gap:2.5px;white-space:nowrap}.spm-grown:hover{background:#44424F}.spm-grown i{width:4px;height:4px;border-radius:50%;background:#FFC94A}.spm-grown i:nth-child(3){margin-right:4px}',
    '.spm-done{flex:none;min-height:44px;padding:0 20px;border-radius:14px;border:0;background:var(--sp-ink);color:#fff!important;font:700 15px Figtree,sans-serif!important}',
    '.spm-mapwrap{padding:4px 16px 24px;display:flex;flex-wrap:wrap;gap:16px 28px;align-items:flex-start;justify-content:center}',
    '.spm-mapcol{flex:1 1 340px;min-width:0;max-width:min(760px,calc(100dvh - 190px));display:flex;flex-direction:column;gap:10px}',
    'html.lu-desk .spm-mapcol{min-width:320px}',
    '.spm-prompt{display:flex;align-items:center;gap:12px;padding:12px 12px 12px 16px;border-radius:18px;background:#FFF1C7;border:1.5px solid var(--sp-ink)}.spm-prompt b{flex:1;min-width:0;font:600 20px/1.25 Fredoka,sans-serif;text-wrap:pretty}.spm-prompt button{flex:none;width:40px;height:40px;border-radius:50%;border:0;background:#fff;font:700 18px Figtree,sans-serif}',
    '.spm-map{position:relative;width:100%;aspect-ratio:1;border-radius:24px;overflow:hidden;box-shadow:0 0 0 1px #E4DCCF,0 2px 0 #EFE7DA;touch-action:manipulation}.spm-map.picking{cursor:pointer}.spm-map>svg{position:absolute;inset:0}',
    '.spm-tok{position:absolute;width:15%;height:15%;transform:translate(-50%,-50%);border-radius:50%;background:transparent;border:0;padding:0;cursor:grab!important;touch-action:none}.spm-tok:focus-visible{outline:3px solid #2B2A35;outline-offset:2px}',
    '.spm-side{flex:1 1 300px;max-width:420px;display:flex;flex-direction:column;gap:12px;min-width:0}',
    '.spm-tray{display:flex;flex-direction:column;gap:8px;padding:16px;border-radius:22px;background:#fff;border:1px solid var(--sp-line)}.spm-tray>b{font:600 25px/1.15 Fredoka,sans-serif;text-wrap:balance}.spm-tray>span{font-size:15px;color:#4A4855;text-wrap:pretty}',
    '.spm-trayrow{display:flex;gap:10px;flex-wrap:wrap;margin-top:4px}.spm-trayp{position:relative;width:88px;min-height:106px;border-radius:18px;border:1px solid var(--sp-line);background:#FBF8F3;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;cursor:grab!important;touch-action:none}.spm-trayp small{font-weight:700;font-size:13px;max-width:84px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.spm-trayp.on{box-shadow:0 0 0 2.5px var(--sp-ink),0 0 0 6.5px #FFC94A}',
    '.spm-av62{width:62px;height:62px;display:block}.spm-av40{flex:none;width:40px;height:40px;display:block}',
    '.spm-add{display:flex;align-items:center;gap:14px;min-height:84px;padding:10px 18px 10px 12px;border-radius:22px;border:0;background:#FFC94A;box-shadow:0 4px 0 #E0A92A;text-align:left}.spm-add:hover{background:#FFD060}.spm-add:active{transform:translateY(2px);box-shadow:0 2px 0 #E0A92A}',
    '.spm-plus{flex:none;width:58px;height:58px;border-radius:50%;background:#fff;border:2.5px solid var(--sp-ink);display:flex;align-items:center;justify-content:center;font:600 34px/1 Fredoka,sans-serif}.spm-add>b{flex:1;font:600 24px/1.1 Fredoka,sans-serif}.spm-addfaces{flex:none;display:flex;padding-left:14px}.spm-addfaces span{width:34px;height:34px;display:block;margin-left:-14px;border-radius:50%}',
    '.spm-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}.spm-sr:focus-within{position:static;width:auto;height:auto;clip-path:none;display:flex;flex-wrap:wrap;gap:6px}.spm-sr button{min-height:40px;padding:0 10px;border-radius:10px;border:1px solid var(--sp-line);background:#fff}',
    '.spm-editgrp{display:flex;flex-direction:column;gap:8px}.spm-editgrp>b,.spm-edith b{font-size:15px}.spm-edith{display:flex;justify-content:space-between;align-items:baseline}.spm-edith small{color:var(--sp-soft);font-size:12.5px}',
    '.spm-editrow{display:flex;align-items:center;gap:10px;padding:6px 6px 6px 12px;border-radius:14px;background:#fff;border:1px solid var(--sp-line)}.spm-zdot{flex:none;width:22px;height:22px;border-radius:50%;border:1.5px solid var(--sp-ink)}.spm-zname{flex:none;width:74px;font-size:12.5px;color:var(--sp-soft);font-weight:700;line-height:1.2}',
    '.spm-pals{display:flex;gap:8px;flex-wrap:wrap}.spm-palbtn{display:flex;align-items:center;gap:8px;padding:6px 12px 6px 6px;min-height:44px;border-radius:999px;background:#fff;border:1px solid var(--sp-line);font:700 13.5px Figtree,sans-serif!important}.spm-palbtn.on{box-shadow:0 0 0 2.5px var(--sp-ink)}.spm-palbtn span{display:flex}.spm-palbtn i{width:20px;height:20px;border-radius:50%;border:1.5px solid var(--sp-ink);margin-left:-6px}.spm-palbtn i:first-child{margin-left:0}',
    '.spm-plist{display:flex;flex-direction:column;border-radius:16px;background:#fff;border:1px solid var(--sp-line);overflow:hidden}.spm-prow{display:flex;align-items:center;gap:12px;padding:8px 8px 8px 10px;border-top:1px solid #F1ECE4}.spm-prow:first-child{border-top:0}.spm-prow>div{flex:1;min-width:0;display:flex;flex-direction:column}.spm-prow b{font-size:15px}.spm-prow small{font-size:12.5px;color:var(--sp-soft)}',
    '.spm-mini{min-height:40px;padding:0 12px;border-radius:11px;border:0;background:#F3EEE6;font:700 13.5px Figtree,sans-serif!important}.spm-mini.red{background:none;padding:0 8px;color:#B23A4E!important}',
    '.spm-scrim{position:fixed;inset:0;z-index:880;background:rgba(43,42,53,.38)}',
    '.spm-sheet{position:fixed;left:0;right:0;bottom:0;margin:0 auto;width:100%;max-width:640px;max-height:92dvh;z-index:881;background:#FBF8F3;border-radius:28px 28px 0 0;display:flex;flex-direction:column;box-shadow:0 -10px 40px rgba(0,0,0,.14);box-sizing:border-box}',
    '.spm-grab{flex:none;display:flex;justify-content:center;padding:8px 0 0}.spm-grab i{width:40px;height:5px;border-radius:9px;background:#E4DCCF}',
    '.spm-shead{flex:none;display:flex;align-items:center;gap:10px;padding:8px 18px 4px}.spm-shead>b{flex:1;min-width:0;font:600 24px/1.2 Fredoka,sans-serif}.spm-x{flex:none;width:44px;height:44px;border-radius:50%;background:#fff;border:1px solid var(--sp-line);font:700 18px Figtree,sans-serif!important}',
    '.spm-sbody{flex:1;min-height:0;overflow-y:auto;padding:8px 18px 18px;display:flex;flex-direction:column;gap:14px}',
    '.spm-sfoot{flex:none;display:flex;gap:10px;padding:12px 18px calc(18px + env(safe-area-inset-bottom));border-top:1px solid var(--sp-line);background:#FBF8F3;border-radius:0 0 28px 28px}',
    '@media (min-width:700px){.spm-sheet{left:50%;right:auto;bottom:auto;top:50%;transform:translate(-50%,-50%);margin:0;width:min(640px,calc(100vw - 48px));max-height:min(760px,calc(100dvh - 48px));border-radius:28px}.spm-grab{display:none}.spm-shead{padding-top:16px}}',
    'html.lu-desk .spm-sheet{left:50%;right:auto;bottom:auto;top:50%;transform:translate(-50%,-50%);margin:0;width:min(640px,calc(100vw - 32px));max-height:min(760px,calc(100dvh - 32px));border-radius:28px}html.lu-desk .spm-grab{display:none}html.lu-desk .spm-shead{padding-top:16px}',
    'html.spm-lock{overflow:hidden}',
    '.spm-ways{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px}.spm-way{position:relative;display:flex;flex-direction:column;align-items:center;gap:6px;padding:18px 14px 16px;border-radius:24px;background:#fff;border:1px solid #E4DCCF;box-shadow:0 3px 0 #EFE7DA;text-align:center}.spm-way b{font:600 22px/1.15 Fredoka,sans-serif}.spm-way small{font-size:13.5px;color:var(--sp-soft)}',
    '.spm-wayart{height:76px;display:flex;align-items:center}.spm-wayart.faces{padding-left:18px}.spm-wayart.faces>span{width:62px;height:62px;display:block;margin-left:-18px}.spm-tagmini{padding:9px 24px;border-radius:999px;background:#7FCB98;border:2.5px solid var(--sp-ink);font:600 24px/1.1 Fredoka,sans-serif}',
    '.spm-groups{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;padding:5px;border-radius:20px;background:#F3EEE6}.spm-groups button{display:flex;flex-direction:column;align-items:center;gap:4px;padding:8px 2px 7px;min-height:82px;border-radius:15px;border:0;background:transparent}.spm-groups button.on{background:#fff;box-shadow:0 0 0 2px var(--sp-ink)}.spm-groups span{width:42px;height:42px;display:block}.spm-groups b{font-size:13.5px}',
    '.spm-chars{display:grid;grid-template-columns:repeat(auto-fill,minmax(84px,1fr));gap:10px}.spm-chars button{aspect-ratio:.86;padding:6px 8px 2px;border:0;border-radius:20px;box-shadow:inset 0 0 0 1px rgba(43,42,53,.08);transition:transform .12s}.spm-chars button:hover{transform:scale(1.05)}',
    '.spm-chosen{display:flex;flex-direction:column;align-items:center;gap:6px;padding:4px 0}.spm-chosenart{width:136px;height:156px;display:block;border-radius:26px;padding:8px 12px 2px;box-sizing:border-box}.spm-chosenart.round{width:150px;height:150px;padding:0;border-radius:50%}',
    '.spm-linkbtn{min-height:40px;display:inline-flex;align-items:center;border:0;background:none;font:700 14px Figtree,sans-serif!important;color:#4A4855!important;text-decoration:underline;text-underline-offset:4px;cursor:pointer;white-space:nowrap;align-self:center}.spm-linkbtn.red{color:#B23A4E!important;align-self:flex-start;padding:0 4px}',
    '.spm-field{display:flex;flex-direction:column;gap:8px}.spm-field>b{font:600 21px Fredoka,sans-serif}.spm-field>b.sm{font-size:19px}.spm-field .opt{font:600 14px Figtree,sans-serif;color:var(--sp-soft)}',
    '.spm-input{min-height:60px;border-radius:16px;border:2px solid var(--sp-ink);padding:0 16px;font:600 21px Fredoka,sans-serif!important;background:#fff;outline:0;box-sizing:border-box;width:100%;min-width:0}.spm-input:focus{box-shadow:0 0 0 4px #FFF1C7}.spm-input.sm{flex:1;min-height:44px;border-radius:11px;border:1.5px solid #E4DCCF;padding:0 12px;font:600 15px Figtree,sans-serif!important;background:#FBF8F3}.spm-input.sm:focus,.spm-input.sm.on{border-color:var(--sp-ink);background:#fff}.spm-input.dash{min-height:50px;border-radius:14px;border-style:dashed;border-color:#CFC4B2}',
    '.spm-tagbox{display:flex;justify-content:center;align-items:center;min-height:120px;padding:14px;border-radius:22px;background:#F3EEE6}.spm-tagbig{min-width:110px;max-width:100%;box-sizing:border-box;padding:14px 30px;border-radius:999px;border:3px solid var(--sp-ink);font:600 30px/1.1 Fredoka,sans-serif;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.spm-cols{display:flex;gap:10px;flex-wrap:wrap}.spm-cols button{width:52px;height:52px;border-radius:50%;border:2px solid var(--sp-ink)}.spm-cols button.on{box-shadow:0 0 0 3px #FBF8F3,0 0 0 6px var(--sp-ink)}',
    '.spm-two{display:grid;grid-template-columns:1fr 1fr;gap:12px}.spm-src{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;min-height:150px;border-radius:24px;background:#fff;border:1px solid #E4DCCF;box-shadow:0 3px 0 #EFE7DA;cursor:pointer;font:600 20px Fredoka,sans-serif;text-align:center;padding:8px}',
    '.spm-safe{display:flex;gap:8px;align-items:flex-start;font-size:13px;color:#4A4855;padding:10px 12px;border-radius:14px;background:#DDF2E4}.spm-safe.big{font-size:13.5px;padding:12px 14px}',
    '.spm-toolrows{display:flex;flex-direction:column;border-radius:18px;background:#fff;border:1px solid var(--sp-line);overflow:hidden}.spm-toolrows button{display:flex;align-items:center;gap:12px;padding:14px 16px;border:0;border-top:1px solid #F1ECE4;background:none;text-align:left}.spm-toolrows button:first-child{border-top:0}.spm-toolrows button:hover{background:#FBF8F3}.spm-toolrows div{flex:1;min-width:0;display:flex;flex-direction:column;gap:1px}.spm-toolrows b{font-size:15.5px}.spm-toolrows small{font-size:13px;color:var(--sp-soft);line-height:1.35}.spm-toolrows span{font-weight:800;color:var(--sp-soft)}',
    '.spm-tabs{display:grid;grid-auto-flow:column;grid-auto-columns:1fr;gap:4px;padding:4px;border-radius:14px;background:#F3EEE6}.spm-tabs button{min-height:44px;border-radius:11px;border:0;background:transparent;font:700 14.5px Figtree,sans-serif!important}.spm-tabs button.on{background:#fff;box-shadow:0 0 0 1.5px var(--sp-ink)}',
    '.spm-info{padding:10px 12px;border-radius:14px;background:#F3EEE6;font-size:13.5px;color:#4A4855}',
    '.spm-qs{display:flex;flex-direction:column;gap:8px}.spm-q{display:flex;align-items:center;gap:10px;padding:8px 8px 8px 14px;border-radius:16px;background:#fff;border:1px solid var(--sp-line)}.spm-q>b{flex:1;min-width:0;font:600 16px/1.3 Fredoka,sans-serif;text-wrap:pretty}',
    '.spm-linkmini{flex:none;min-height:44px;padding:0 8px;border:0;background:none;font:700 13.5px Figtree,sans-serif!important;color:var(--sp-soft)!important;display:inline-flex;align-items:center;gap:5px}.spm-linkmini .spm-pill{font-size:9.5px;padding:1px 6px}',
    '.spm-show{flex:none;min-height:44px;padding:0 16px;border-radius:12px;border:0;background:#FFC94A;box-shadow:0 2px 0 #E0A92A;font:700 14px Figtree,sans-serif!important}.spm-show.on{background:#FFE29A}',
    '.spm-newq{display:flex;gap:8px}.spm-dark{flex:none;min-height:44px;padding:0 16px;border-radius:12px;border:0;background:var(--sp-ink);color:#fff!important;font:700 14px Figtree,sans-serif!important;display:inline-flex;align-items:center;gap:6px}',
    '.spm-dlprev{align-self:center;width:min(100%,260px);padding:10px 10px 12px;border-radius:18px;background:#fff;border:1px solid var(--sp-line);box-shadow:0 2px 0 #EFE7DA;display:flex;flex-direction:column;gap:8px}.spm-dlprev>b{font:600 15px Fredoka,sans-serif;text-align:center}.spm-dlprev>div{aspect-ratio:1;border-radius:10px;overflow:hidden}',
    '.spm-opt{position:relative;display:flex;flex-direction:column;gap:2px;padding:14px;border-radius:16px;background:#fff;border:1px solid var(--sp-line);text-align:left}.spm-opt.on{box-shadow:0 0 0 2.5px var(--sp-ink),0 0 0 6.5px #FFC94A}.spm-opt b{font-size:15.5px}.spm-opt small{font-size:12.5px;color:var(--sp-soft);line-height:1.35}',
    '.spm-toast{position:fixed;left:16px;right:16px;bottom:calc(24px + var(--ua-bar,0px));z-index:9100;display:flex;justify-content:center;pointer-events:none}.spm-toast div{max-width:460px;padding:12px 18px;border-radius:16px;background:var(--sp-ink,#2B2A35);color:#fff;font-weight:600;font-size:14.5px;line-height:1.4;box-shadow:0 10px 30px rgba(0,0,0,.2);text-wrap:pretty}',
    '.spm-ghost{position:fixed;width:64px;height:64px;transform:translate(-50%,-50%) scale(1.1);pointer-events:none;z-index:9200;filter:drop-shadow(0 8px 12px rgba(0,0,0,.25))}',
    'html.lu-app .spm-foot{bottom:calc(var(--ua-bar,84px) + env(safe-area-inset-bottom));box-shadow:0 40px 0 #FBF8F3}',
    '@media (max-width:420px){.spm-toptx b.big{font-size:19px}.spm-tray>b{font-size:22px}.spm-add>b{font-size:21px}.spm-addfaces{display:none}}'
  ].join('');

  /* ===================== mount ===================== */
  function addCSS() { if (document.getElementById('spmCSS')) return; var s = document.createElement('style'); s.id = 'spmCSS'; s.textContent = CSS; document.head.appendChild(s); }
  var bound = false;
  function mount() {
    var el = document.getElementById('spmApp');
    if (!el || el === HOST) return;
    HOST = el; addCSS();
    el.addEventListener('click', onClick); el.addEventListener('input', onInput); el.addEventListener('change', onChange); el.addEventListener('pointerdown', onDown);
    if (!bound) {
      bound = true;
      document.addEventListener('keydown', onKey);
      window.addEventListener('hashchange', function () { document.documentElement.classList.remove('spm-lock'); if (offDrag) offDrag(); });
      if (acc() && acc().onChange) acc().onChange(function () { STORE = null; if (HOST && HOST.isConnected) { CACHE = {}; ST = initState(); render(); sync(); } });
    }
    // a child switch, or coming back to the page, opens that child's own map
    var k = childKey() + storeKey();
    if (!ST || ST._key !== k) { ST = initState(); ST._key = k; }
    else { ST.sheet = null; ST.drag = null; }
    var ready = X.photosLoad ? X.photosLoad() : Promise.resolve();
    ready.then(function () { AVC = {}; render(); return sync(); });
    render();
  }
  function page() {
    Promise.resolve().then(mount);
    return '<div class="tl-page spm-page"><div class="spm-app" id="spmApp"></div></div>';
  }
  function hubVis() { var A = window.LUArt; return '<div class="tl-mini-art">' + (A && A.toolArt ? A.toolArt('safe') : '') + '</div>'; }
  LUTools.register('tools/safe-people', {
    page: page, click: function () { },
    card: { grp: 'talk', tint: '#DDF2E4', vis: hubVis, title: function () { return t('Safe People Map', 'Peta Orang Aman'); },
      desc: function () { return t('A child and a grown-up map out, together, the people the child trusts and when to go to each of them.', 'Anak dan orang dewasa memetakan bersama orang-orang yang dipercaya anak, dan kapan harus menghampiri mereka.'); } }
  });
  window.LUSafe = { version: '1', drawMap: drawMap, avatarSVG: avatarSVG, fullSVG: fullSVG, LIB: LIB };
  if (LUTools.render) try { LUTools.render(); } catch (e) { }
})();
