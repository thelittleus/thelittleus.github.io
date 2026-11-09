/* Little Us · DTT · a program's data (3a): the chart (by session or by target), each target with its last trials, and the
   sessions list beside it. A session opens in a panel (3b). Undo mastery (5p) and Export CSV (5q) are dialogs. */
(function () {
  'use strict';
  var D = window.LUDtt, X = LUTools.api, P = D.programs, DA = D.data, MA = D.mastery, EC = D.errorCorrection, T = D.i18n.T, esc = X.esc, ui = D.ui, U = ui.U, ACT = ui.ACT;
  var cache = {};
  function locale() { return D.i18n.lang() === 'id' ? 'id-ID' : 'en-GB'; }
  function shortDate(iso) { return new Date(iso).toLocaleDateString(locale(), { day: 'numeric', month: 'short' }); }
  function dayName(iso) { var d = new Date(iso), t = new Date(); if (d.toDateString() === t.toDateString()) return T('Today', 'Hari ini'); t.setDate(t.getDate() - 1); if (d.toDateString() === t.toDateString()) return T('Yesterday', 'Kemarin'); return shortDate(iso); }
  function time(iso) { return new Date(iso).toLocaleTimeString(locale(), { hour: '2-digit', minute: '2-digit' }); }
  function sq(r) { return '<i class="dtt-sq ' + ({ independent: 'i', prompted: 'p', incorrect: 'e', 'no-response': 'n' }[r] || '') + '" title="' + esc(resName(r)) + '"></i>'; }
  function resName(r) { return { independent: 'Independent', prompted: 'Prompted', incorrect: T('Error', 'Salah'), 'no-response': T('No Response', 'Tidak Ada Respons') }[r] || r; }
  function key() { return '<div class="dtt-sqkey">' + ['independent', 'prompted', 'incorrect', 'no-response'].map(function (r) { return '<span>' + sq(r) + esc(resName(r)) + '</span>'; }).join('') + '</div>'; }
  function threshold(s) { return s.mRule === 'rolling' ? Math.round(100 * s.mNeed / s.mWin) : s.mPct; }

  ui.dataTab = function (p, set) {
    var c = cache[p.id];
    if (!c || c.stale) {
      if (!c || !c.loading) {
        cache[p.id] = { loading: true, sessions: (c && c.sessions) || null };
        D.store.sessions(p.id).then(function (r) { cache[p.id] = { sessions: r.sessions, partial: r.partial }; ui.render(); }, function () { cache[p.id] = { failed: true }; ui.render(); });
      }
      if (!c || !c.sessions) return '<div class="dtt-loading" role="status">' + esc(T('Opening the data...', 'Membuka data...')) + '</div>';
      c = cache[p.id];
    }
    if (c.failed) return '<div class="dtt-empty"><p class="dtt-p">' + esc(T('The data could not open. Check your connection and try again.', 'Data belum bisa dibuka. Periksa koneksi lalu coba lagi.')) + '</p><button type="button" class="dtt-btn sec" data-a="dataRetry" data-id="' + p.id + '">' + esc(T('Try again', 'Coba lagi')) + '</button></div>';
    var sessions = c.sessions || [];
    if (!sessions.length) return '<div class="dtt-empty"><h2 class="dtt-h2">' + esc(T('No Sessions Yet', 'Belum Ada %session%')) + '</h2><p class="dtt-p">' + esc(T('Results appear here after your first real session.', 'Hasil muncul di sini setelah %session% pertama.')) + '</p><button type="button" class="dtt-btn primary" data-a="startSession" data-id="' + p.id + '"' + (P.issues(p, set).length ? ' disabled' : '') + '>▶ ' + esc(T('Start Real Session', 'Mulai Session')) + '</button></div>';
    return ui.syncBadge() + (c.partial ? '<p class="dtt-tip">' + esc(T('You are offline, so this shows only the sessions saved on this device.', 'Kamu sedang offline, jadi hanya %sessions% di perangkat ini yang ditampilkan.')) + '</p>' : '') +
      '<div class="dtt-datagrid"><div class="dtt-col">' + chartPanel(p, set, sessions) + targetPanel(p, set, sessions) + '</div>' + sessionsPanel(p, sessions) + '</div>';
  };
  ui.dataStale = function (id) { if (cache[id]) cache[id].stale = true; };
  ACT.dataRetry = function (b) { delete cache[b.dataset.id]; ui.render(); };

  /* ---------- chart: Independent % per session, or per target ---------- */
  function chartPanel(p, set, sessions) {
    var mode = U.chart || 'sessions', th = threshold(p.settings), body;
    if (mode === 'targets') {
      var rows = p.queue.map(function (id) {
        var t = [], it = p.type === 'pattern' ? null : P.itemById(set, id);
        sessions.forEach(function (s) { (s.trials || []).forEach(function (x) { if (x.target === id && EC.counted(x.kind)) t.push(x); }); });
        var sum = MA.summarize(t);
        return '<div class="dtt-hbar"><span class="dtt-hlab">' + ui.dot(it) + esc(ui.targetName(p, set, id) || '?') + '</span><span class="dtt-htrack"><i style="width:' + sum.pctInd + '%"></i><em style="left:' + th + '%"></em></span><b>' + (sum.n ? sum.pctInd + '%' : '—') + '</b></div>';
      }).join('');
      body = '<div class="dtt-hbars">' + rows + '</div>';
    } else body = chart(DA.series(sessions, null), th);
    return '<section class="dtt-panel"><div class="dtt-panelhead"><h2 class="dtt-h2">' + esc(T('Independent %', 'Independent %')) + '</h2>' +
      '<div class="tl-seg dtt-seg sm" role="group"><button type="button" class="' + (mode === 'sessions' ? 'on' : '') + '" aria-pressed="' + (mode === 'sessions') + '" data-a="chartMode" data-v="sessions">' + esc(T('Sessions', '%sessions%')) + '</button><button type="button" class="' + (mode === 'targets' ? 'on' : '') + '" aria-pressed="' + (mode === 'targets') + '" data-a="chartMode" data-v="targets">' + esc(T('Targets', '%targets%')) + '</button></div></div>' + body + '</section>';
  }
  ACT.chartMode = function (b) { U.chart = b.dataset.v; ui.render(); };
  function chart(pts, th) {
    var n = pts.length, last = pts.slice(-12);
    return '<div class="dtt-cols" role="img" aria-label="' + esc(T('Independent percent for the last ' + last.length + ' sessions', 'Persen Independent untuk ' + last.length + ' %session% terakhir')) + '"><div class="dtt-yax">' + [100, th, 50, 0].filter(function (v, i, a) { return a.indexOf(v) === i; }).map(function (v) { return '<span style="bottom:' + v + '%">' + v + '%</span>'; }).join('') + '</div><div class="dtt-plot"><em style="bottom:' + th + '%" title="' + esc(T('Mastery line', 'Garis %mastery%')) + '"></em>' +
      last.map(function (x) { return '<span class="dtt-colw" title="' + esc(shortDate(x.date) + ': ' + x.pct + '%') + '"><b>' + x.pct + '</b><i style="height:' + Math.max(2, x.pct) + '%" class="' + (x.pct >= th ? 'ok' : '') + '"></i></span>'; }).join('') + '</div></div>' +
      '<div class="dtt-xax">' + last.map(function (x) { return '<span>' + esc(shortDate(x.date)) + '</span>'; }).join('') + '</div>' + (n > 12 ? '<p class="dtt-hint">' + esc(T('The last 12 sessions. All of them are in the export.', '12 %session% terakhir. Semuanya ada di ekspor.')) + '</p>' : '');
  }

  /* ---------- targets: status, last 5 trials, undo mastery ---------- */
  function targetPanel(p, set, sessions) {
    var ops = D.defaults.OPS[p.type], pr = D.store.progressOf(p.id), s = p.settings, rule = s.mRule === 'rolling' ? ui.masteryText(s) : ui.masteryText(s);
    var rows = '';
    p.queue.forEach(function (id) {
      var it = p.type === 'pattern' ? null : P.itemById(set, id), name = ui.targetName(p, set, id);
      ops.forEach(function (op) {
        var st = ui.targetStatus(p, id, op), ps = pr[D.targets.key(id, op)], recent = ((ps && ps.recent) || []).slice(-5);
        var streak = s.mRule === 'classic' && ps && ps.series ? ps.series.slice().reverse().filter(function (x, i, a) { return a.slice(0, i + 1).every(function (y) { return y.n >= s.mMin && Math.round(100 * (y.ind + (s.mCount === 'any' ? (y.pr || 0) : 0)) / y.n) >= s.mPct; }); }).length : null;
        rows += '<div class="dtt-trow">' + ui.dot(it) + '<b>' + esc(name || '?') + (ops.length > 1 ? ' <small>' + esc(op === 'tact' ? 'Tact' : 'Listener') + '</small>' : '') + '</b><span class="dtt-chip ' + st + '">' + esc(ui.statusName(st)) + '</span>' +
          (streak != null && !(ps && ps.masteredAt) ? '<span class="dtt-hint">' + esc(T(streak + ' of ' + s.mSess + ' sessions', streak + ' dari ' + s.mSess + ' %sessions%')) + '</span>' : '') +
          '<span class="dtt-sqs">' + (recent.length ? recent.map(sq).join('') : '<span class="dtt-hint">' + esc(T('No trials yet', 'Belum ada trial')) + '</span>') + '</span>' +
          (ps && ps.masteredAt ? '<button type="button" class="dtt-linkbtn" data-a="askUndo" data-id="' + esc(id) + '" data-k="' + op + '">' + esc(T('Undo Mastery', 'Batalkan %mastery%')) + '</button>' : '') + '</div>';
      });
    });
    return '<section class="dtt-panel"><div class="dtt-panelhead"><h2 class="dtt-h2">' + esc(T('Targets', '%targets%')) + '</h2><span class="dtt-hint">' + esc(T('Rule: ', 'Aturan: ') + D.i18n.fill(rule)) + ' · ' + esc(T('Last 5 trials', '5 trial terakhir')) + '</span></div>' +
      (rows || '<p class="dtt-hint">' + esc(T('No targets yet.', 'Belum ada %targets%.')) + '</p>') + key() + '</section>';
  }
  ACT.askUndo = function (b) {
    var p = ui.ctx(), set = D.store.set(p.setId), id = b.dataset.id, op = b.dataset.k, name = ui.targetName(p, set, id);
    var sh = X.sheet(ui.dlg({ title: T('Undo Mastery for ' + name + '?', 'Batalkan %mastery% untuk ' + name + '?'),
      body: '<p class="dtt-dlgp">' + esc(T(name + ' goes back to Learning at the Partial prompt. Its session history stays.', name + ' kembali Dipelajari dengan Prompt Partial. Riwayat %session%-nya tetap ada.')) + '</p>',
      foot: '<button type="button" class="dtt-btn sec" data-x>' + esc(T('Cancel', 'Batal')) + '</button><button type="button" class="dtt-btn primary" data-go>' + esc(T('Undo Mastery', 'Batalkan %mastery%')) + '</button>' }));
    sh.el.addEventListener('click', function (e) {
      if (e.target.closest('[data-x]')) return sh.close();
      if (!e.target.closest('[data-go]')) return;
      var pr = D.store.progressOf(p.id); MA.undo(pr, id, op, p.settings);
      D.store.saveProgress(p.id, DA.toRows(pr, [D.targets.key(id, op)])).then(function () { sh.close(); ui.render(); }, function () { X.toast(T('This was not saved. Check your connection.', 'Belum tersimpan. Periksa koneksi.')); });
    });
  };

  /* ---------- sessions list, and one session (3b) ---------- */
  function sessionsPanel(p, sessions) {
    return '<section class="dtt-panel dtt-sesslist"><div class="dtt-panelhead"><h2 class="dtt-h2">' + esc(T('Sessions', '%sessions%')) + '</h2><button type="button" class="dtt-btn sec xs" data-a="exportCsv">⤓ ' + esc(T('Export CSV', 'Ekspor CSV')) + '</button></div>' +
      DA.rows(sessions).map(function (r) {
        return '<button type="button" class="dtt-sessrow" data-a="openSession" data-id="' + r.id + '"><span class="dtt-swtx"><b>' + esc(dayName(r.date)) + (r.early ? ' <span class="dtt-chip">' + esc(T('Ended early', 'Diakhiri awal')) + '</span>' : '') + '</b><small>' + esc(time(r.date) + ' · ' + T(r.n + ' trials', r.n + ' trial')) + '</small></span><b class="dtt-pct">' + r.sum.pctInd + '%</b><span aria-hidden="true">›</span></button>';
      }).join('') + '</section>';
  }
  ACT.openSession = function (b) {
    var p = ui.ctx(), set = D.store.set(p.setId), c = cache[p.id], s = (c.sessions || []).filter(function (x) { return x.id === b.dataset.id; })[0]; if (!s) return;
    var sum = MA.summarize(s.trials || []), mins = Math.max(1, Math.round((new Date(s.ended_at) - new Date(s.started_at)) / 60000)), n = 0;
    var list = (s.trials || []).map(function (t) {
      var counted = EC.counted(t.kind), it = p.type === 'pattern' ? null : P.itemById(set, t.target), lv = t.level >= 2 ? 'Full' : t.level === 1 ? 'Partial' : '—';
      if (counted) n++;
      return '<div class="dtt-trial' + (counted ? '' : ' sub') + '"><span class="dtt-tn">' + (counted ? n : '↳') + '</span>' + ui.dot(it) + '<b>' + esc(ui.targetName(p, set, t.target) || '?') + (counted ? '' : ' <small>· ' + esc(T('Correction, not counted', 'Koreksi, tidak dihitung')) + '</small>') + '</b><span class="dtt-tlv">' + lv + '</span>' + sq(t.result) + '</div>';
    }).join('');
    var sh = X.sheet('', { drawer: true });
    sh.set('<div class="dtt-drawer"><div class="dtt-drhead"><h2 class="dtt-drtitle">' + esc(dayName(s.started_at) + ' · ' + time(s.started_at)) + '</h2><button type="button" class="dtt-x" data-x aria-label="' + esc(T('Close', 'Tutup')) + '">✕</button></div><div class="dtt-drbody">' +
      '<div class="dtt-tiles3"><span><b>' + sum.pctInd + '%</b>Independent</span><span><b>' + sum.n + ' / ' + (s.trials || []).length + '</b>' + esc(T('Trials Scored', 'Trial Dinilai')) + '</span><span><b>' + mins + ' min</b>' + esc(T('Length', 'Durasi')) + '</span></div>' +
      '<div class="dtt-trials">' + list + '</div>' + key() + (s.note ? '<div class="dtt-blk">' + ui.lab(T('Note', 'Catatan')) + '<p class="dtt-p">' + esc(s.note) + '</p></div>' : '') +
      '<button type="button" class="dtt-linkbtn danger" data-del data-confirm="1">🗑 ' + esc(T('Delete Session', 'Hapus Session')) + '</button></div>' +
      '<div class="dtt-drfoot"><span></span><button type="button" class="dtt-btn primary" data-x>' + esc(T('Done', 'Selesai')) + '</button></div></div>');
    ui.hydrate(sh.el);
    sh.el.addEventListener('click', function (e) {
      if (e.target.closest('[data-x]')) return sh.close();
      var d = e.target.closest('[data-del]'); if (!d) return;
      if (!d.dataset.sure) { d.dataset.sure = '1'; d.textContent = T('Tap again to delete this session', 'Ketuk lagi untuk menghapus session ini'); return; }
      var left = c.sessions.filter(function (x) { return x.id !== s.id; });
      D.store.deleteSession(p.id, s.id, left).then(function () { cache[p.id] = { sessions: left }; sh.close(); ui.render(); }, function () { X.toast(T('It was not deleted. Check your connection.', 'Belum terhapus. Periksa koneksi.')); });
    });
  };

  /* ---------- Export (5q) ---------- */
  ACT.exportCsv = function () {
    var p = ui.ctx(), st = { all: false, days: 0, per: 'trial', notes: true }, sh = X.sheet('');
    function radio(k, v, label) { var on = st[k] === v; return '<button type="button" class="dtt-radio' + (on ? ' on' : '') + '" role="radio" aria-checked="' + on + '" data-k="' + k + '" data-v="' + v + '"><i></i>' + esc(label) + '</button>'; }
    function draw() {
      sh.set(ui.dlg({ title: T('Export Data', 'Ekspor Data'),
        body: '<div class="dtt-blk">' + ui.lab(T('Programs', 'Program')) + ui.seg('all', st.all ? 1 : 0, [[0, T('This Program', 'Program Ini')], [1, T('All Programs', 'Semua Program')]]).replace(/data-a="set" /g, '') + '</div>' +
          '<div class="dtt-blk">' + ui.lab(T('Dates', 'Tanggal')) + ui.seg('days', st.days, [[0, T('All', 'Semua')], [30, T('Last 30 Days', '30 Hari Terakhir')], [90, T('Last 90 Days', '90 Hari Terakhir')]]).replace(/data-a="set" /g, '') + '</div>' +
          '<div class="dtt-blk">' + ui.lab(T('Include', 'Isi')) + radio('per', 'session', T('One row per session', 'Satu baris per session')) + radio('per', 'trial', T('One row per trial', 'Satu baris per trial')) +
          '<button type="button" class="dtt-check' + (st.notes ? ' on' : '') + '" role="checkbox" aria-checked="' + st.notes + '" data-notes><i>' + (st.notes ? '✓' : '') + '</i>' + esc(T('Session notes', 'Catatan session')) + '</button></div>',
        foot: '<button type="button" class="dtt-btn sec" data-x>' + esc(T('Cancel', 'Batal')) + '</button><button type="button" class="dtt-btn primary" data-go>⤓ ' + esc(T('Download CSV', 'Unduh CSV')) + '</button>' }));
    }
    sh.el.addEventListener('click', function (e) {
      var t = e.target.closest('button'); if (!t) return;
      if (t.hasAttribute('data-x')) return sh.close();
      if (t.dataset.k === 'all') { st.all = t.dataset.v === '1'; return draw(); }
      if (t.dataset.k === 'days') { st.days = Number(t.dataset.v); return draw(); }
      if (t.dataset.k === 'per') { st.per = t.dataset.v; return draw(); }
      if (t.hasAttribute('data-notes')) { st.notes = !st.notes; return draw(); }
      if (!t.hasAttribute('data-go')) return;
      t.disabled = true;
      var progs = st.all ? D.store.programs(p.studentId) : [p];
      Promise.all(progs.map(function (q) { return cache[q.id] && cache[q.id].sessions ? Promise.resolve({ sessions: cache[q.id].sessions }) : D.store.sessions(q.id); })).then(function (res) {
        download(progs, res.map(function (r) { return r.sessions; }), st, st.all ? 'all-programs' : p.name); sh.close();
      }, function () { t.disabled = false; X.toast(T('The data could not open. Check your connection.', 'Data belum bisa dibuka. Periksa koneksi.')); });
    });
    draw();
  };
  function download(progs, lists, st, name) {
    function q(v) { v = String(v == null ? '' : v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }
    var since = st.days ? Date.now() - st.days * 86400000 : 0, out = [];
    out.push((st.per === 'trial' ? ['program', 'session_date', 'session_id', 'trial', 'target', 'operation', 'kind', 'result', 'prompt_level', 'counted'] : ['program', 'session_date', 'session_id', 'trials_counted', 'independent_pct', 'prompted_pct', 'incorrect_pct', 'ended_early']).concat(st.notes ? ['note'] : []).join(','));
    progs.forEach(function (p, k) {
      var set = D.store.set(p.setId);
      (lists[k] || []).filter(function (s) { return new Date(s.started_at).getTime() >= since; }).sort(function (a, b) { return String(a.started_at).localeCompare(String(b.started_at)); }).forEach(function (s) {
        var note = st.notes ? [s.note || ''] : [];
        if (st.per === 'trial') (s.trials || []).forEach(function (t, i) { out.push([p.name, s.started_at, s.id, i + 1, ui.targetName(p, set, t.target), t.op, t.kind, t.result, t.level == null ? '' : t.level, EC.counted(t.kind) ? 'yes' : 'no'].concat(i ? (st.notes ? [''] : []) : note).map(q).join(',')); });
        else { var m = MA.summarize(s.trials || []); out.push([p.name, s.started_at, s.id, m.n, m.pctInd, m.pctPr, m.pctEr, s.ended_early ? 'yes' : 'no'].concat(note).map(q).join(',')); }
      });
    });
    var a = document.createElement('a'), url = URL.createObjectURL(new Blob(['﻿' + out.join('\r\n')], { type: 'text/csv' }));
    a.href = url; a.download = String(name || 'program').replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '-') + '-dtt-data.csv';
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
  }
})();
