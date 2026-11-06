/* Little Us · Discrete Trial Teaching
   Teachers and therapists create teaching programs for a child and run teacher-led sessions.
   Where data lives: signed-in accounts only, in owner-only tables and the private dtt-images bucket (supabase/dtt-setup.sql).
   Photos are compressed in the browser first, and only the small copy leaves the device. Device preferences stay in this browser.
   Loaded only when /tools/dtt is opened. tools.js registers its tile on the tools page. */
(function () {
  'use strict';
  if (!window.LUTools || !LUTools.register || !window.LUDtt || window.LUDtt.mounted) return;
  var D = window.LUDtt, ui = D.ui;
  D.mounted = true;

  if (window.LUAcc && LUAcc.addFeatures) LUAcc.addFeatures([
    { id: 'dtt.programs', tool: 'dtt', name_en: 'More than one DTT program', name_id: 'Lebih dari satu program DTT', access: 'plus', sort: 60 },
    { id: 'dtt.photos', tool: 'dtt', name_en: 'More than 10 uploaded photos', name_id: 'Lebih dari 10 foto unggahan', access: 'plus', sort: 61 }
  ]);
  if (window.LUAcc && LUAcc.onChange) LUAcc.onChange(function () { ui.render(); });

  // sessions waiting to upload go as soon as the connection returns
  window.addEventListener('online', function () { D.store.flush(); });
  D.store.onSync(function () { if (!D.session.running() && document.getElementById('dttApp')) ui.render(); });

  function mount() {
    var el = document.getElementById('dttApp'); if (!el || el.dataset.bound) return;
    el.dataset.bound = '1'; ui.bind(el); ui.render();
    D.session.checkResume();
  }
  LUTools.register('tools/dtt', {
    page: function () { Promise.resolve().then(mount); return '<div class="tl-page dtt-page"><div id="dttApp"></div></div>'; },
    click: function () { },
    card: { grp: 'teach', tint: '#FFF1C7', vis: function () { var A = window.LUArt; return '<div class="tl-mini-art">' + (A && A.toolArt ? A.toolArt('dtt') : '') + '</div>'; },
      title: function () { return 'Discrete Trial Teaching'; },
      desc: function () { return D.i18n.T('Create teaching programs for a child, run teacher-led sessions with picture cards, and follow the progress.', 'Buat program mengajar untuk anak, jalankan session yang dipimpin guru dengan kartu gambar, dan pantau kemajuannya.'); } }
  });
})();
