/* Little Us · Discrete Trial Teaching · starts the full-screen page (dtt.html, at /dtt).
   Teachers and therapists create teaching programs for a child and run teacher-led sessions.
   Where data lives: signed in, in owner-only tables and the private dtt-images bucket (supabase/dtt-setup.sql);
   signed out, in this browser only until they sign in (dtt-guest.js). Photos are compressed in the browser first.
   Device preferences stay in this browser. */
(function () {
  'use strict';
  if (!window.LUDtt || window.LUDtt.mounted) return;
  var D = window.LUDtt, ui = D.ui;
  D.mounted = true;

  if (window.LUAcc && LUAcc.addFeatures) LUAcc.addFeatures([
    { id: 'dtt.programs', tool: 'dtt', name_en: 'More than 2 DTT programs', name_id: 'Lebih dari 2 program DTT', access: 'plus', sort: 60 },
    { id: 'dtt.photos', tool: 'dtt', name_en: 'More than 50 uploaded photos', name_id: 'Lebih dari 50 foto unggahan', access: 'plus', sort: 61 }
  ]);
  // signing in or out switches where the work is kept
  if (window.LUAcc && LUAcc.onChange) LUAcc.onChange(function () { D.guest.pick(); if (!D.session.running()) ui.render(); });

  // sessions waiting to upload go as soon as the connection returns
  window.addEventListener('online', function () { D.store.flush(); });
  D.store.onSync(function () { if (!D.session.running()) ui.render(); });
  var w = window.innerWidth;
  window.addEventListener('resize', function () { if (Math.abs(window.innerWidth - w) > 80 && !D.session.running()) { w = window.innerWidth; ui.render(); } });

  function mount() {
    var el = document.getElementById('dttApp'); if (!el || el.dataset.bound) return;
    el.dataset.bound = '1'; ui.bind(el);
    // shows Discrete Trial Teaching first in the home banner's "used last" row
    if (window.LUTools && LUTools.markUsed) try { LUTools.markUsed('dtt'); } catch (e) { }
    D.guest.pick(); ui.render();
    D.session.checkResume();
    D.guest.offer();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
})();
