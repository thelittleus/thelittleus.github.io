/* Little Us · DTT · the left sidebar: the one menu for the whole tool. Each section is a tinted card, and the section you are in opens to show its submenu. */
(function () {
  'use strict';
  var D = window.LUDtt, X = LUTools.api, T = D.i18n.T, esc = X.esc, ui = D.ui, U = ui.U, ACT = ui.ACT;

  // o: { a, v, id, k, label, level, on, tint, num, state, plus, keepWizard }
  function item(o) {
    var attrs = ' data-a="' + o.a + '"' + (o.v != null ? ' data-v="' + esc(o.v) + '"' : '') + (o.id != null ? ' data-id="' + esc(o.id) + '"' : '') + (o.k != null ? ' data-k="' + esc(o.k) + '"' : '');
    var mark = o.state === 'done' ? '✓' : o.state === 'warn' ? '!' : o.num;
    var say = o.state === 'done' ? T('done', 'selesai') : o.state === 'warn' ? T('something is missing', 'ada yang belum diisi') : '';
    return '<button type="button" class="dtt-nav l' + (o.level || 0) + (o.tint ? ' ' + o.tint : '') + (o.plus ? ' plus' : '') + (o.state ? ' dtt-st dtt-st-' + o.state : '') + '"' + attrs + (o.on ? ' aria-current="page"' : '') + ' data-nav' + (o.keepWizard ? ' data-keepwiz' : '') + '>' +
      (o.num != null ? '<span class="dtt-n" aria-hidden="true">' + mark + '</span>' : '') + '<span class="dtt-navtx">' + esc(o.label) + (say ? '<span class="dtt-sr"> (' + esc(say) + ')</span>' : '') + '</span></button>';
  }
  function list(items) { return items.length ? '<ul class="dtt-navlist">' + items.map(function (h) { return '<li>' + h + '</li>'; }).join('') + '</ul>' : ''; }

  function programsMenu() {
    var w = ui.wiz(), subs = [];
    D.store.programs(ui.student().id).forEach(function (p) {
      var open = !w && U.view === 'program' && U.programId === p.id, kids = '';
      if (open) {
        var settings = U.ptab === 'settings' ? list(ui.settingsList(p).map(function (k, n) {
          return item({ a: 'progNav', id: p.id, k: 'settings', v: k, label: D.i18n.fill(ui.SEC[k].name()), level: 3, num: n + 1, tint: ui.SEC[k].tint, on: U.sec === k });
        })) : '';
        kids = list([
          item({ a: 'progNav', id: p.id, k: 'overview', label: T('Overview', 'Ringkasan'), level: 2, on: U.ptab === 'overview' }),
          item({ a: 'progNav', id: p.id, k: 'settings', label: T('Settings', 'Pengaturan'), level: 2 }) + settings,
          item({ a: 'progNav', id: p.id, k: 'data', label: 'Data', level: 2, on: U.ptab === 'data' })
        ]);
      }
      subs.push(item({ a: 'progNav', id: p.id, k: 'overview', label: p.name || T('Unnamed program', 'Program tanpa nama'), level: 1 }) + kids);
    });
    if (U.wizard) subs.push('<div class="dtt-navlabel">' + esc(T('New program', 'Program baru')) + '</div>' + list(ui.wizardSteps().map(function (s, i) {
      var state = ui.wizardStepState(i);
      return item({ a: 'wizGo', v: i, label: D.i18n.fill(s[1]), level: 2, num: i + 1, state: state, on: state === 'now', keepWizard: true });
    })));
    else subs.push(item({ a: 'newProgram', label: T('New program', 'Program baru'), level: 1, plus: true }));
    return list(subs);
  }
  function setsMenu() {
    var w = ui.wiz();
    var subs = D.store.sets().map(function (s) { return item({ a: 'openSet', id: s.id, label: s.name || T('Unnamed set', 'Set tanpa nama'), level: 1, on: !w && U.view === 'set' && U.setId === s.id }); });
    subs.push(item({ a: 'newSet', label: T('New set', 'Set baru'), level: 1, plus: true }));
    return list(subs);
  }
  function studentMenu() {
    return list(ui.studentSections().map(function (s) { return item({ a: 'stuSec', v: s[0], label: s[1], level: 1, on: U.view === 'student' && U.stuSec === s[0] }); }));
  }

  // only the section you are in is open
  function currentSection() { return ui.wiz() ? 'programs' : { program: 'programs', set: 'sets' }[U.view] || U.view; }
  ui.sidebar = function () {
    var cur = currentSection();
    if (U.navSec !== cur) { U.navSec = cur; U.navShut = false; }
    function section(v, tint, label, menu) {
      var open = !!menu && cur === v && !U.navShut;
      return '<li class="dtt-navcard ' + tint + '"><button type="button" class="dtt-nav l0" data-a="tab" data-v="' + v + '" data-nav data-keepwiz' + (menu ? ' aria-expanded="' + open + '"' : '') + (!ui.wiz() && U.view === v ? ' aria-current="page"' : '') + '><span class="dtt-navtx">' + esc(label) + '</span>' + (menu ? '<span class="dtt-navchev" aria-hidden="true"></span>' : '') + '</button>' +
        (open ? '<div class="dtt-navpanel">' + menu() + '</div>' : '') + '</li>';
    }
    return '<nav class="dtt-side" aria-label="' + esc(T('Discrete Trial Teaching menu', 'Menu Discrete Trial Teaching')) + '"><ul class="dtt-navlist dtt-navcards">' +
      section('programs', 'sky', T('Programs', 'Program'), programsMenu) +
      section('sets', 'peach', T('Stimulus sets', 'Stimulus set'), setsMenu) +
      section('student', 'mint', T('Student setup', 'Atur anak'), studentMenu) +
      section('device', 'lilac', T('This device', 'Perangkat ini')) +
      '</ul></nav>';
  };
  // on a phone the sidebar folds away behind this button
  ui.menuButton = function () {
    return '<button type="button" class="tl-btn outline dtt-menubtn" data-a="menuTog" aria-expanded="' + !!U.menuOpen + '">' + esc(U.menuOpen ? T('Close menu', 'Tutup menu') : T('Menu', 'Menu')) + '</button>';
  };
  ACT.menuTog = function () { U.menuOpen = !U.menuOpen; ui.render(); };
  ACT.progNav = function (b) {
    U.view = 'program'; U.programId = b.dataset.id; U.ptab = b.dataset.k;
    if (b.dataset.v) U.sec = b.dataset.v;
    ui.render(); window.scrollTo(0, 0);
  };
  ACT.stuSec = function (b) { U.view = 'student'; U.stuSec = b.dataset.v; ui.render(); window.scrollTo(0, 0); };
})();
