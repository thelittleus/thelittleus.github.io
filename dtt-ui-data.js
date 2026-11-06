/* Little Us · DTT · the data view for one program: a chart, a breakdown by operation, each target's status, and the session table. */
(function () {
  'use strict';
  var D = window.LUDtt, X = LUTools.api, P = D.programs, DA = D.data, MA = D.mastery, T = D.i18n.T, esc = X.esc, ui = D.ui, U = ui.U, ACT = ui.ACT;
  var cache = {};
  function locale() { return D.i18n.lang() === 'id' ? 'id-ID' : 'en-GB'; }
  function shortDate(iso) { return new Date(iso).toLocaleDateString(locale(), { day: 'numeric', month: 'short' }); }
  function opName(op) { return { listener: 'Listener', tact: 'Tact', matching: 'Matching', sorting: T('Sorting', 'Mengelompokkan'), pattern: T('Pattern', 'Pola') }[op] || op; }

  ui.dataTab = function (p, set) {
    var c = cache[p.id];
    if (!c || c.stale) {
      if (!c || !c.loading) {
        cache[p.id] = { loading: true, sessions: (c && c.sessions) || null };
        D.store.sessions(p.id).then(function (r) { cache[p.id] = { sessions: r.sessions, partial: r.partial }; ui.render(); }, function () { cache[p.id] = { failed: true }; ui.render(); });
      }
      if (!c || !c.sessions) return ui.syncBadge() + '<div class="dtt-loading" role="status">' + esc(T('Opening the data...', 'Membuka data...')) + '</div>';
      c = cache[p.id];
    }
    if (c.failed) return '<div class="dtt-empty tl-panel pad"><p class="tl-p">' + esc(T('The data could not open. Check your connection and try again.', 'Data belum bisa dibuka. Periksa koneksi lalu coba lagi.')) + '</p><div class="dtt-rowbtns" style="justify-content:center"><button type="button" class="tl-btn outline" data-a="dataRetry" data-id="' + p.id + '">' + esc(T('Try again', 'Coba lagi')) + '</button></div></div>';
    var sessions = c.sessions || [];
    return ui.syncBadge() + (c.partial ? ui.tip(T('You are offline, so this shows only the sessions saved on this device.', 'Kamu sedang offline, jadi hanya %sessions% di perangkat ini yang ditampilkan.')) : '') +
      (sessions.length ? chartPanel(p, sessions) + operationPanel(p, sessions) : '<div class="dtt-empty tl-panel pad"><p class="tl-p">' + esc(T('No sessions yet. Run one, and the results will appear here.', 'Belum ada %session%. Jalankan satu, lalu hasilnya muncul di sini.')) + '</p></div>') +
      targetPanel(p, set) + (sessions.length ? tablePanel(sessions) : '');
  };
  ui.dataStale = function (id) { if (cache[id]) cache[id].stale = true; };
  ACT.dataRetry = function (b) { delete cache[b.dataset.id]; ui.render(); };

  /* ---------- chart: percent independent per session, one line per operation ---------- */
  function chartPanel(p, sessions) {
    var ops = DA.operations(sessions), multi = D.defaults.OPS[p.type].length > 1 && ops.length > 1;
    var lines = (multi ? ops : [null]).map(function (op, i) { return { op: op, name: op ? opName(op) : T('Independent', 'Independent'), cls: 's' + (i + 1), pts: DA.series(sessions, op) }; });
    return '<section class="tl-panel pad dtt-chartbox"><h2 class="tl-h2">' + esc(T('Independent responses per session', 'Respons Independent per %session%')) + '</h2>' +
      (multi ? '<div class="dtt-legend">' + lines.map(function (l) { return '<span><i class="' + l.cls + '" aria-hidden="true"></i>' + esc(l.name) + '</span>'; }).join('') + '</div>' : '') +
      chart(lines) + '</section>';
  }
  function chart(lines) {
    var app = document.querySelector('#dttApp .dtt-mainc'), W = Math.max(260, (app ? app.clientWidth : 640) - 40), H = 240, L = 42, Rt = lines.length > 1 ? 66 : 18, Tp = 12, B = 30;
    var dates = {}; lines.forEach(function (l) { l.pts.forEach(function (x) { dates[x.date] = 1; }); });
    var xs = Object.keys(dates).sort(), n = xs.length;
    function px(date) { var i = xs.indexOf(date); return n === 1 ? L + (W - L - Rt) / 2 : L + i * (W - L - Rt) / (n - 1); }
    function py(v) { return Tp + (100 - v) * (H - Tp - B) / 100; }
    var grid = [0, 50, 100].map(function (v) { return '<line class="dtt-grid" x1="' + L + '" x2="' + (W - Rt) + '" y1="' + py(v) + '" y2="' + py(v) + '"/><text class="dtt-axis" x="' + (L - 8) + '" y="' + (py(v) + 4) + '" text-anchor="end">' + v + '%</text>'; }).join('');
    var step = Math.max(1, Math.ceil(n / Math.floor((W - L - Rt) / 70))), ticks = '';
    xs.forEach(function (d, i) { if (i % step === 0 || i === n - 1) { if (i === n - 1 && i % step !== 0 && n > 1 && (n - 1) % step < step / 2) return; ticks += '<text class="dtt-axis" x="' + px(d) + '" y="' + (H - 8) + '" text-anchor="middle">' + esc(shortDate(d)) + '</text>'; } });
    var marks = lines.map(function (l) {
      var d = l.pts.map(function (x, i) { return (i ? 'L' : 'M') + px(x.date).toFixed(1) + ' ' + py(x.pct).toFixed(1); }).join('');
      var dots = l.pts.map(function (x) {
        var label = shortDate(x.date) + ': ' + l.name + ' ' + x.pct + '%, ' + T(x.n + ' trials', x.n + ' trial');
        return '<circle class="dtt-pt ' + l.cls + '" cx="' + px(x.date).toFixed(1) + '" cy="' + py(x.pct).toFixed(1) + '" r="5" tabindex="0" role="img" aria-label="' + esc(label) + '" data-tip="' + esc(label) + '"/>';
      }).join('');
      var last = l.pts[l.pts.length - 1];
      var direct = lines.length > 1 && last ? '<text class="dtt-axis strong" x="' + (px(last.date) + 10) + '" y="' + (py(last.pct) + 4) + '">' + esc(l.name) + '</text>' : '';
      return '<path class="dtt-ln ' + l.cls + '" d="' + d + '"/>' + dots + direct;
    }).join('');
    return '<div class="dtt-chart" data-chart><svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" role="group" aria-label="' + esc(T('Chart of independent responses. The same numbers are in the session table below.', 'Grafik respons Independent. Angka yang sama ada di tabel %session% di bawah.')) + '"><line class="dtt-cross" x1="0" x2="0" y1="' + Tp + '" y2="' + (H - B) + '" hidden/>' + grid + ticks + marks + '</svg><div class="dtt-tooltip" hidden role="status"></div></div>';
  }
  // the nearest point answers, so the hit area is much bigger than the mark
  function wireChart(root) {
    var box = root.querySelector('[data-chart]'); if (!box || box.dataset.wired) return;
    box.dataset.wired = '1';
    var tip = box.querySelector('.dtt-tooltip'), cross = box.querySelector('.dtt-cross'), pts = Array.prototype.slice.call(box.querySelectorAll('.dtt-pt'));
    function show(pt) {
      var cx = Number(pt.getAttribute('cx')), cy = Number(pt.getAttribute('cy')), same = pts.filter(function (x) { return x.getAttribute('cx') === pt.getAttribute('cx'); });
      tip.textContent = same.map(function (x) { return x.getAttribute('data-tip'); }).join(' · ');
      tip.hidden = false;
      var w = tip.offsetWidth; tip.style.left = Math.max(0, Math.min(box.clientWidth - w, cx - w / 2)) + 'px'; tip.style.top = Math.max(0, cy - tip.offsetHeight - 12) + 'px';
      cross.setAttribute('x1', cx); cross.setAttribute('x2', cx); cross.removeAttribute('hidden');
    }
    function hide() { tip.hidden = true; cross.setAttribute('hidden', ''); }
    box.addEventListener('pointermove', function (e) {
      var r = box.querySelector('svg').getBoundingClientRect(), x = e.clientX - r.left, best = null, gap = 1e9;
      pts.forEach(function (p) { var d = Math.abs(Number(p.getAttribute('cx')) - x); if (d < gap) { gap = d; best = p; } });
      if (best) show(best);
    });
    box.addEventListener('pointerleave', hide);
    pts.forEach(function (p) { p.addEventListener('focus', function () { show(p); }); p.addEventListener('blur', hide); });
  }
  ui.afterRender.push(function (root) { wireChart(root); });

  function operationPanel(p, sessions) {
    if (D.defaults.OPS[p.type].length < 2) return '';
    return '<section class="tl-panel dtt-tablewrap"><table class="dtt-table"><caption class="dtt-sr">' + esc(T('Results by operation', 'Hasil per operasi')) + '</caption><thead><tr><th>' + esc(T('Operation', 'Operasi')) + '</th><th>' + esc(T('Trials', 'Trial')) + '</th><th>Independent</th><th>Prompted</th><th>' + esc(T('Incorrect', 'Salah')) + '</th></tr></thead><tbody>' +
      DA.byOperation(sessions).map(function (o) { return '<tr><td><b>' + esc(opName(o.op)) + '</b></td><td>' + o.sum.n + '</td><td>' + o.sum.pctInd + '%</td><td>' + o.sum.pctPr + '%</td><td>' + o.sum.pctEr + '%</td></tr>'; }).join('') + '</tbody></table></section>';
  }

  function targetPanel(p, set) {
    var ops = D.defaults.OPS[p.type], pr = D.store.progressOf(p.id), rows = '';
    p.queue.forEach(function (id) {
      var it = p.type === 'pattern' ? null : P.itemById(set, id), name = ui.targetName(p, set, id);
      ops.forEach(function (op) {
        var st = ui.targetStatus(p, id, op), ps = pr[D.targets.key(id, op)], undo = ps && ps.masteredAt;
        rows += '<div class="tl-row"><span class="dtt-thumb">' + ui.img(it && it.images[0], name) + '</span><div class="dtt-grow"><b>' + esc(name || '?') + '</b>' + (ops.length > 1 ? '<small>' + esc(opName(op)) + '</small>' : '') + '</div><span class="dtt-chip' + (st === 'attention' ? ' warn' : st !== 'waiting' ? ' on' : '') + '">' + esc(ui.statusName(st)) + '</span>' +
          (undo ? '<button type="button" class="tl-link dtt-danger" data-a="undoMastery" data-id="' + esc(id) + '" data-k="' + op + '" data-confirm="' + esc(T('Tap again to undo', 'Ketuk lagi untuk membatalkan')) + '">' + esc(T('Undo mastery', 'Batalkan %mastery%')) + '</button>' : '') + '</div>';
      });
    });
    return '<section class="tl-panel"><h2 class="tl-h2 dtt-paneltitle">' + esc(T('Targets', '%targets%')) + '</h2>' + (rows || '<p class="tl-p dtt-paneltitle">' + esc(T('The target queue is empty.', 'Antrean %targets% masih kosong.')) + '</p>') + '</section>';
  }
  ACT.undoMastery = function (b) {
    var p = ui.ctx(), pr = D.store.progressOf(p.id), id = b.dataset.id, op = b.dataset.k;
    MA.undo(pr, id, op, p.settings);
    D.store.saveProgress(p.id, DA.toRows(pr, [D.targets.key(id, op)])).then(function () { ui.render(); }, function () { X.toast(T('This was not saved. Check your connection.', 'Belum tersimpan. Periksa koneksi.')); ui.render(); });
  };

  function tablePanel(sessions) {
    return '<section class="tl-panel dtt-tablewrap"><table class="dtt-table"><caption class="dtt-sr">' + esc(T('All sessions, newest first', 'Semua %sessions%, terbaru lebih dulu')) + '</caption><thead><tr><th>' + esc(T('Date', 'Tanggal')) + '</th><th>' + esc(T('Trials', 'Trial')) + '</th><th>Independent</th><th>Prompted</th><th>' + esc(T('Incorrect', 'Salah')) + '</th><th><span class="dtt-sr">' + esc(T('Delete', 'Hapus')) + '</span></th></tr></thead><tbody>' +
      DA.rows(sessions).map(function (r) {
        return '<tr><td><b>' + esc(new Date(r.date).toLocaleDateString(locale(), { day: 'numeric', month: 'short', year: 'numeric' })) + '</b>' + (r.early ? ' <span class="dtt-chip">' + esc(T('Ended early', 'Diakhiri awal')) + '</span>' : '') + '</td><td>' + r.n + '</td><td>' + r.sum.pctInd + '%</td><td>' + r.sum.pctPr + '%</td><td>' + r.sum.pctEr + '%</td>' +
          '<td><button type="button" class="tl-link dtt-danger" data-a="delSession" data-id="' + r.id + '" data-confirm="' + esc(T('Tap again', 'Ketuk lagi')) + '">' + esc(T('Delete', 'Hapus')) + '</button></td></tr>';
      }).join('') + '</tbody></table></section>';
  }
  ACT.delSession = function (b) {
    var p = ui.ctx(), c = cache[p.id], left = c.sessions.filter(function (s) { return s.id !== b.dataset.id; });
    D.store.deleteSession(p.id, b.dataset.id, left).then(function () { cache[p.id] = { sessions: left }; ui.render(); }, function () { X.toast(T('It was not deleted. Check your connection.', 'Belum terhapus. Periksa koneksi.')); });
  };
})();
