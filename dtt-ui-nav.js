/* Little Us · DTT · the left sidebar: the one menu for the whole tool, with submenus for the section you are in. */
(function () {
  'use strict';
  var D = window.LUDtt, X = LUTools.api, T = D.i18n.T, esc = X.esc, ui = D.ui, U = ui.U, ACT = ui.ACT;

  function leaving() { return U.wizard ? ' data-confirm="' + esc(T('Tap again to leave this new program', 'Ketuk lagi untuk keluar dari program baru ini')) + '"' : ''; }
  // o: { a, v, id, k, label, level, on, tint, num, off, plus }
  function item(o) {
    var attrs = ' data-a="' + o.a + '"' + (o.v != null ? ' data-v="' + esc(o.v) + '"' : '') + (o.id != null ? ' data-id="' + esc(o.id) + '"' : '') + (o.k != null ? ' data-k="' + esc(o.k) + '"' : '');
    return '<button type="button" class="dtt-nav l' + (o.level || 0) + (o.tint ? ' ' + o.tint : '') + (o.plus ? ' plus' : '') + '"' + attrs + (o.on ? ' aria-current="page"' : '') + (o.off ? ' disabled' : ' data-nav' + (o.keepWizard ? ' data-keepwiz' : leaving())) + '>' +
      (o.num != null ? '<span class="dtt-n">' + o.num + '</span>' : o.tint ? '<span class="dtt-navdot" aria-hidden="true"></span>' : '') + '<span class="dtt-navtx">' + esc(o.label) + '</span></button>';
  }
  function list(items) { return items.length ? '<ul class="dtt-navlist">' + items.map(function (h) { return '<li>' + h + '</li>'; }).join('') + '</ul>' : ''; }

  function programsMenu() {
    var inView = U.wizard || U.view === 'programs' || U.view === 'program', subs = [];
    if (!inView) return '';
    D.store.programs(ui.student().id).forEach(function (p) {
      var open = !U.wizard && U.view === 'program' && U.programId === p.id, kids = '';
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
    if (U.wizard) subs.push(item({ a: 'wizGo', v: U.wizard.step, label: T('New program', 'Program baru'), level: 1, keepWizard: true }) + list(ui.wizardSteps().map(function (s, i) {
      return item({ a: 'wizGo', v: i, label: D.i18n.fill(s[1]), level: 2, num: i + 1, on: U.wizard.step === i, off: i > U.wizard.max, keepWizard: true });
    })));
    else subs.push(item({ a: 'newProgram', label: T('New program', 'Program baru'), level: 1, plus: true }));
    return list(subs);
  }
  function setsMenu() {
    if (U.view !== 'sets' && U.view !== 'set') return '';
    var subs = D.store.sets().map(function (s) { return item({ a: 'openSet', id: s.id, label: s.name || T('Unnamed set', 'Set tanpa nama'), level: 1, on: U.view === 'set' && U.setId === s.id }); });
    subs.push(item({ a: 'newSet', label: T('New set', 'Set baru'), level: 1, plus: true }));
    return list(subs);
  }
  function studentMenu() {
    if (U.view !== 'student') return '';
    return list(ui.studentSections().map(function (s) { return item({ a: 'stuSec', v: s[0], label: s[1], level: 1, on: U.stuSec === s[0] }); }));
  }

  ui.sidebar = function () {
    var w = !!U.wizard;
    return '<nav class="dtt-side" aria-label="' + esc(T('Discrete Trial Teaching menu', 'Menu Discrete Trial Teaching')) + '">' + list([
      item({ a: 'tab', v: 'programs', label: T('Programs', 'Program'), tint: 'sky', on: !w && U.view === 'programs' }) + programsMenu(),
      item({ a: 'tab', v: 'sets', label: T('Stimulus sets', 'Stimulus set'), tint: 'peach', on: U.view === 'sets' && !w }) + setsMenu(),
      item({ a: 'tab', v: 'student', label: T('Student setup', 'Atur anak'), tint: 'mint' }) + (w ? '' : studentMenu()),
      item({ a: 'tab', v: 'device', label: T('This device', 'Perangkat ini'), tint: 'lilac', on: !w && U.view === 'device' })
    ]) + '</nav>';
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
  ACT.stuSec = function (b) { U.stuSec = b.dataset.v; ui.render(); window.scrollTo(0, 0); };
})();
