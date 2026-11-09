/* Little Us · DTT · what the full-screen DTT page (dtt.html) needs from the main site, without loading the main site.
   - LU: language, toasts and links back to the main site.
   - LUTools.api: the small part of tools.js the DTT files use (escaping, dialogs, toasts, child profiles).
   Students are the child profiles in Little Us (localStorage lu_tools_v1, the same record tools.js keeps), so they stay
   in step with the rest of the site and, when signed in, with the account. */
(function () {
  'use strict';
  if (window.LUTools) return;
  var KEY = 'lu_tools_v1', COLORS = ['#DDF2E4', '#FFF1C7', '#DCEBFA', '#E9E1F7', '#FBE0E6', '#FFE9DA'];

  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }
  function readLang() {
    var q = /[?&]lang=(en|id)\b/.exec(location.search); if (q) return q[1];
    try { var v = String(localStorage.getItem('lu_lang') || '').replace(/"/g, ''); if (v === 'en' || v === 'id') return v; } catch (e) { }
    return /^id\b/i.test(navigator.language || '') ? 'id' : 'en';
  }
  function rerender() { var d = window.LUDtt; if (d && d.ui && d.ui.render) d.ui.render(); }

  /* ---------- toasts ---------- */
  function toast(msg, o) {
    var box = document.getElementById('dttToasts');
    if (!box) { box = document.createElement('div'); box.id = 'dttToasts'; box.className = 'dtt-toasts'; box.setAttribute('role', 'status'); box.setAttribute('aria-live', 'polite'); document.body.appendChild(box); }
    var el = document.createElement('div'); el.className = 'dtt-toast ' + ((o && o.kind) || 'info'); el.textContent = msg;
    box.appendChild(el);
    requestAnimationFrame(function () { el.classList.add('show'); });
    setTimeout(function () { el.classList.remove('show'); setTimeout(function () { el.remove(); }, 250); }, (o && o.ms) || 3000);
  }

  window.LU = window.LU || {
    lang: readLang(), route: 'dtt',
    toast: toast,
    // links to the main site (sign in, Plus, account) leave this page
    go: function (h) { location.href = '/' + String(h || '').replace(/^\//, ''); },
    setLang: function () { rerender(); }
  };
  // links written for the main site ("#/plus", "#/login") open the main site
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#/"]'); if (!a) return;
    e.preventDefault(); location.href = '/' + a.getAttribute('href');
  });

  /* ---------- dialogs: a centred card on wide screens, a sheet from the bottom on phones ---------- */
  var stack = [];
  function sheet(html, opts) {
    opts = opts || {};
    var wrap = document.createElement('div');
    wrap.className = 'tl-sheetwrap' + (opts.wide ? ' wide' : '') + (opts.drawer ? ' drawer' : '');
    wrap.innerHTML = '<div class="tl-scrim"></div><div class="tl-sheet" role="dialog" aria-modal="true"><div class="tl-sheetin">' + html + '</div></div>';
    document.body.appendChild(wrap);
    requestAnimationFrame(function () { wrap.classList.add('open'); });
    var last = document.activeElement;
    var api = {
      el: wrap.querySelector('.tl-sheetin'), wrap: wrap, noEsc: !!opts.noEsc,
      close: function () {
        if (!wrap.isConnected) return;
        wrap.classList.remove('open');
        stack = stack.filter(function (s) { return s !== api; });
        setTimeout(function () { wrap.remove(); }, 200);
        if (last && last.focus && last.isConnected) try { last.focus({ preventScroll: true }); } catch (e) { }
        if (opts.onClose) opts.onClose();
      },
      set: function (h) { api.el.innerHTML = h; }
    };
    if (!opts.noScrimClose) wrap.querySelector('.tl-scrim').onclick = api.close;
    stack.push(api);
    setTimeout(function () { var f = api.el.querySelector('[autofocus],input,button'); if (f && f.focus) try { f.focus({ preventScroll: true }); } catch (e) { } }, 60);
    return api;
  }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && stack.length && !stack[stack.length - 1].noEsc) { e.preventDefault(); stack[stack.length - 1].close(); } });

  /* ---------- child profiles (students) ---------- */
  function freshState() {
    return { v: 1, profiles: [], current: 'default', data: {}, custom: {}, labels: {}, recent: [],
      settings: { labels: window.LU.lang === 'id' ? 'id' : 'en', sound: true, volume: 0.6, reduce: false, exit: 'hold', lastBackup: null }, last: null };
  }
  var S = null;
  function load() { S = null; try { var s = JSON.parse(localStorage.getItem(KEY)); if (s && s.v === 1) S = s; } catch (e) { } if (!S) S = freshState(); if (!S.profiles) S.profiles = []; return S; }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { toast(window.LU.lang === 'id' ? 'Penyimpanan perangkat penuh.' : 'Device storage is full.'); } if (window.LUAcc && LUAcc.stateChanged) try { LUAcc.stateChanged(); } catch (e) { } }
  load();
  function prof() { return S.profiles.filter(function (p) { return p.id === S.current; })[0] || S.profiles[0] || null; }
  function uid(p) { return p + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

  // profile photos live in this browser's IndexedDB (lu-tools / photos), keyed by the profile's photo id
  var PH = {};
  function photosLoad() {
    return new Promise(function (res) {
      try {
        var r = indexedDB.open('lu-tools', 1);
        r.onupgradeneeded = function () { r.result.createObjectStore('photos'); };
        r.onerror = function () { res(); };
        r.onsuccess = function () {
          var db = r.result, ids = S.profiles.map(function (p) { return p.photo; }).filter(Boolean);
          if (!ids.length || !db.objectStoreNames.contains('photos')) return res();
          var tx = db.transaction('photos', 'readonly'), st = tx.objectStore('photos');
          ids.forEach(function (id) { var g = st.get(id); g.onsuccess = function () { if (g.result) PH[id] = g.result; }; });
          tx.oncomplete = function () { res(); }; tx.onerror = function () { res(); };
        };
      } catch (e) { res(); }
    });
  }

  var profiles = {
    list: function () { return S.profiles; },
    current: prof,
    choose: function (id) { S.current = id; save(); rerender(); },
    add: function (name, kid) {
      var p = { id: uid('k'), name: String(name || '').trim() || (window.LU.lang === 'id' ? 'Anak' : 'Child'), color: COLORS[S.profiles.length % COLORS.length], photo: null, rewards: [], kid: kid === 'girl' ? 'girl' : 'boy' };
      var first = !S.profiles.length;
      S.profiles.push(p);
      if (first && S.data['default']) { S.data[p.id] = S.data['default']; delete S.data['default']; }
      S.current = p.id; save(); return p;
    },
    avatar: function (p, size) {
      size = size || 32;
      var ini = p ? (p.name || '?').trim().charAt(0).toUpperCase() : '?';
      return '<span class="dtt-ava" style="width:' + size + 'px;height:' + size + 'px;font-size:' + Math.round(size * 0.44) + 'px;background:' + esc((p && p.color) || '#F3EEE6') + '">' +
        (p && p.photo && PH[p.photo] ? '<img src="' + PH[p.photo] + '" alt="">' : esc(ini)) + '</span>';
    }
  };

  window.LUTools = {
    api: { esc: esc, toast: function (m) { toast(m, { kind: 'info', ms: 2800 }); }, sheet: sheet, prof: prof, S: function () { return S; }, PH: PH, photosLoad: photosLoad, profiles: profiles },
    register: function () { },
    render: rerender,
    // the account brought a newer child setup from another device
    reloadState: function () { load(); photosLoad().then(rerender); },
    fixLocked: function () { }
  };
  photosLoad().then(rerender);
  // another tab (the main site) changed the profiles
  window.addEventListener('storage', function (e) { if (e.key === KEY) window.LUTools.reloadState(); });
})();
