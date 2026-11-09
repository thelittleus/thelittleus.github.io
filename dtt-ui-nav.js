/* Little Us · DTT · the menu. Wide screens: a left sidebar with the student, three places (Programs, Stimulus Sets, Settings)
   and the way back to the Little Us homepage. Phones: a slim top bar and the same three places as tabs along the bottom. */
(function () {
  'use strict';
  var D = window.LUDtt, X = LUTools.api, T = D.i18n.T, esc = X.esc, ui = D.ui, U = ui.U, ACT = ui.ACT, INP = ui.INP;
  var PF = X.profiles;
  var ICON = {
    programs: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="3"/><path d="M8 9h8M8 13h8M8 17h5"/></svg>',
    sets: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="8" height="8" rx="2"/><rect x="13" y="3" width="8" height="8" rx="2"/><rect x="3" y="13" width="8" height="8" rx="2"/><rect x="13" y="13" width="8" height="8" rx="2"/></svg>',
    settings: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" aria-hidden="true"><path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2.3"/><circle cx="10" cy="17" r="2.3"/></svg>',
    home: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>'
  };
  function place() { return { program: 'programs', set: 'sets' }[U.view] || U.view; }
  function places() { return [['programs', T('Programs', 'Program')], ['sets', T('Stimulus Sets', 'Stimulus Set')], ['settings', T('Settings', 'Pengaturan')]]; }
  function homeLink(cls) { return '<a class="' + cls + '" href="/">' + ICON.home + '<span>' + esc(T('Back to Little Us Homepage', 'Kembali ke Beranda Little Us')) + '</span></a>'; }
  function who() {
    var kid = ui.student();
    return '<button type="button" class="dtt-who" data-a="whoMenu" aria-haspopup="dialog">' + PF.avatar(kid, 32) + '<b>' + esc(kid ? kid.name : T('Add Student', 'Tambah Anak')) + '</b><span aria-hidden="true">▾</span></button>';
  }
  function account() {
    var a = window.LUAcc, on = a && a.signedIn && a.signedIn(), me = on && a.me ? a.me() : null;
    if (!on) return '<button type="button" class="dtt-acct" data-a="signIn"><span class="dtt-dot off" aria-hidden="true"></span>' + esc(T('Not signed in', 'Belum masuk')) + '<u>' + esc(T('Sign in', 'Masuk')) + '</u></button>';
    return '<a class="dtt-acct" href="/#/account"><span class="dtt-dot" aria-hidden="true"></span>' + esc((me && (me.name || me.email)) || T('Signed in', 'Sudah masuk')) + (a.isPlus && a.isPlus() ? ' <span class="dtt-plus sm">Plus</span>' : '') + '</a>';
  }

  ui.sidebar = function () {
    var cur = place();
    return '<aside class="dtt-side" aria-label="' + esc(T('Discrete Trial Teaching menu', 'Menu Discrete Trial Teaching')) + '">' +
      '<a class="dtt-brand" href="/dtt" data-a="tab" data-v="programs"><img src="/logo.png" alt="Little Us" width="118" height="28"><span>DTT</span></a>' + who() +
      '<nav class="dtt-places">' + places().map(function (p) {
        return '<button type="button" class="dtt-place' + (cur === p[0] ? ' on' : '') + '" data-a="tab" data-v="' + p[0] + '" data-nav' + (cur === p[0] ? ' aria-current="page"' : '') + '>' + ICON[p[0]] + '<span>' + esc(p[1]) + '</span></button>';
      }).join('') + '</nav>' +
      '<div class="dtt-sidefoot">' + account() + homeLink('dtt-home') + '</div></aside>' +
      // phones: the same, folded into a top bar
      '<header class="dtt-top"><a class="dtt-topback" href="/" aria-label="' + esc(T('Back to Little Us Homepage', 'Kembali ke Beranda Little Us')) + '">' + ICON.home + '<img src="/logo.png" alt="Little Us" width="84" height="20"></a><span class="dtt-brand sm">DTT</span>' + who() + '</header>';
  };
  ui.tabbar = function () {
    var cur = place();
    return '<nav class="dtt-tabbar" aria-label="' + esc(T('Discrete Trial Teaching menu', 'Menu Discrete Trial Teaching')) + '">' + places().map(function (p) {
      return '<button type="button" class="' + (cur === p[0] ? 'on' : '') + '" data-a="tab" data-v="' + p[0] + '"' + (cur === p[0] ? ' aria-current="page"' : '') + '>' + ICON[p[0]] + '<span>' + esc(p[1]) + '</span></button>';
    }).join('') + '</nav>';
  };
  ACT.tab = function (b) { U.view = b.dataset.v; ui.render(); window.scrollTo(0, 0); };

  /* ---------- whose programs: switching student, adding one ---------- */
  ACT.whoMenu = function () {
    var list = PF.list(), cur = ui.student();
    if (!list.length) return ACT.addStudent();
    var sh = X.sheet('<div class="dtt-dlg"><div class="dtt-dlghead"><h2>' + esc(T('Students', 'Anak')) + '</h2><button type="button" class="dtt-x" data-x aria-label="' + esc(T('Close', 'Tutup')) + '">✕</button></div><div class="dtt-wholist">' +
      list.map(function (p) { var on = cur && p.id === cur.id; return '<button type="button" class="dtt-whorow' + (on ? ' on' : '') + '" data-kid="' + esc(p.id) + '" aria-pressed="' + !!on + '">' + PF.avatar(p, 36) + '<b>' + esc(p.name) + '</b>' + (on ? '<span aria-hidden="true">✓</span>' : '') + '</button>'; }).join('') +
      '<button type="button" class="dtt-whorow add" data-add><span class="dtt-ava add" aria-hidden="true">+</span><b>' + esc(T('Add Student', 'Tambah Anak')) + '</b></button></div></div>');
    sh.el.addEventListener('click', function (e) {
      var t = e.target.closest('button'); if (!t) return;
      if (t.hasAttribute('data-x')) return sh.close();
      if (t.dataset.kid) { sh.close(); U.view = U.view === 'program' ? 'programs' : U.view; PF.choose(t.dataset.kid); return; }
      if (t.hasAttribute('data-add')) { sh.close(); ACT.addStudent(); }
    });
  };
  ACT.addStudent = function () {
    if (PF.list().length && window.LUAcc && LUAcc.canAddChild && !LUAcc.canAddChild()) { if (LUAcc.childLockSheet) LUAcc.childLockSheet(); return; }
    var st = { kid: 'boy' }, sh = X.sheet('');
    function pick(k, label) {
      var on = st.kid === k;
      return '<button type="button" class="dtt-kidpick' + (on ? ' on' : '') + '" aria-pressed="' + on + '" data-kid="' + k + '">' + (window.LUAcc && LUAcc.face ? '<span class="dtt-kidface">' + LUAcc.face(k) + '</span>' : '') + '<b>' + esc(label) + '</b></button>';
    }
    function draw() {
      var name = sh.el.querySelector('input') ? sh.el.querySelector('input').value : '';
      sh.set('<div class="dtt-dlg"><div class="dtt-dlghead"><h2>' + esc(T('Add Student', 'Tambah Anak')) + '</h2><button type="button" class="dtt-x" data-x aria-label="' + esc(T('Close', 'Tutup')) + '">✕</button></div>' +
        '<label class="dtt-field"><span>' + esc(T('First Name or Nickname', 'Nama Depan atau Panggilan')) + '</span><input type="text" maxlength="30" autocomplete="off" value="' + esc(name) + '" autofocus></label>' +
        '<div class="dtt-field"><span>' + esc(T('Profile Picture', 'Gambar Profil')) + '</span><div class="dtt-kidpicks">' + pick('girl', T('Girl', 'Perempuan')) + pick('boy', T('Boy', 'Laki-laki')) + '</div></div>' +
        '<p class="dtt-hint">' + esc(T('Also added to your Little Us profile.', 'Juga ditambahkan ke profil Little Us-mu.')) + '</p>' +
        '<div class="dtt-dlgbtns"><button type="button" class="dtt-btn" data-x>' + esc(T('Cancel', 'Batal')) + '</button><button type="button" class="dtt-btn primary" data-go>' + esc(T('Add Student', 'Tambah Anak')) + '</button></div></div>');
    }
    draw();
    sh.el.addEventListener('click', function (e) {
      var t = e.target.closest('button'); if (!t) return;
      if (t.hasAttribute('data-x')) return sh.close();
      if (t.dataset.kid) { st.kid = t.dataset.kid; return draw(); }
      if (t.hasAttribute('data-go')) {
        var v = sh.el.querySelector('input').value.trim();
        if (!v) { sh.el.querySelector('input').focus(); return; }
        PF.add(v, st.kid); sh.close(); U.view = 'programs'; ui.render();
      }
    });
    sh.el.addEventListener('keydown', function (e) { if (e.key === 'Enter' && e.target.tagName === 'INPUT') { e.preventDefault(); var g = sh.el.querySelector('[data-go]'); if (g) g.click(); } });
  };
  INP.noop = function () { };
})();
