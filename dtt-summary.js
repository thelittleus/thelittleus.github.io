/* Little Us · DTT · the session summary, for the teacher. */
(function () {
  'use strict';
  var D = window.LUDtt, X = LUTools.api, P = D.programs, T = D.i18n.T, esc = X.esc, ui = D.ui, U = ui.U;
  function opName(op) { return { listener: 'Listener', tact: 'Tact', matching: 'Matching', sorting: T('Sorting', 'Mengelompokkan'), pattern: T('Pattern', 'Pola') }[op] || op; }
  function name(p, set, id) { return ui.targetName(p, set, id) || '?'; }
  function chips(list, p, set, withOp, extra) {
    return list.map(function (x) { return '<span class="dtt-chip on">' + esc(name(p, set, x.target) + (withOp ? ' · ' + opName(x.op) : '') + (extra ? extra(x) : '')) + '</span>'; }).join(' ');
  }
  function banner(cls, html) { return '<div class="dtt-banner ' + cls + '">' + html + '</div>'; }
  function stat(cls, label, value) { return '<div class="dtt-stat ' + cls + '"><span>' + esc(label) + '</span><b>' + value + '</b></div>'; }

  D.summary = {
    show: function (host, p, set, kid, out, saving, session) {
      var s = out.summary, mixed = D.defaults.OPS[p.type].length > 1, when = new Date(out.session.ended_at), practice = !!(session.practice && session.practice());
      var rows = out.perTarget.map(function (r) {
        return '<tr><td><b>' + esc(name(p, set, r.target)) + '</b>' + (mixed ? ' <span class="dtt-chip">' + esc(opName(r.op)) + '</span>' : '') + (r.maintenance ? ' <span class="dtt-chip">' + esc(T('Maintenance', '%maintenance%')) + '</span>' : '') + (r.retention ? ' <span class="dtt-chip">' + esc(T('Retention check', 'Pemeriksaan retensi')) + '</span>' : '') + '</td><td>' + r.sum.n + '</td><td>' + r.sum.pctInd + '%</td><td>' + r.sum.pctPr + '%</td><td>' + r.sum.pctEr + '%</td></tr>';
      }).join('');
      var el = document.createElement('div');
      el.className = 'dtt-summary';
      el.innerHTML = '<div class="dtt-sumin"><div><p class="tl-eyebrow">' + esc(p.name) + ' · ' + esc(practice ? T('Practice · Not recorded', 'Latihan · Tidak dicatat') : out.session.ended_early ? T('Session ended early', '%session% diakhiri lebih awal') : T('Session complete', '%session% selesai')) + '</p><h1 class="tl-h1">' + esc((kid ? kid.name + ', ' : '') + when.toLocaleDateString(D.i18n.lang() === 'id' ? 'id-ID' : 'en-GB', { day: 'numeric', month: 'long' })) + '</h1></div>' +
        '<div class="dtt-stats">' + stat('mint', 'Independent', s.pctInd + '%') + stat('peach', 'Prompted', s.pctPr + '%') + stat('rose', T('Incorrect or no response', 'Salah atau tidak ada respons'), s.pctEr + '%') + stat('lilac', T('Trials counted', 'Trial dihitung'), s.n) + '</div>' +
        (!practice && out.newly.length ? banner('mint', esc(T('Mastered: ', '%mastered%: ')) + chips(out.newly, p, set, mixed) + (p.settings.mRule === 'rolling' ? ' ' + esc(T('A retention check comes back in ' + p.settings.retDays + (p.settings.retDays > 1 ? ' days.' : ' day.'), 'Pemeriksaan retensi kembali dalam ' + p.settings.retDays + ' hari.')) : '')) : '') +
        (!practice && out.retention.length ? banner('sky', esc(T('Retention checks: ', 'Pemeriksaan retensi: ')) + chips(out.retention, p, set, mixed, function (x) { return ' · ' + (x.ok ? T('confirmed', 'terkonfirmasi') : T('back to learning', 'kembali dipelajari')); })) : '') +
        (!practice && out.entered.length ? banner('butter', esc(T('Now in the active set: ', 'Kini aktif: ')) + chips(out.entered, p, set, mixed)) : '') +
        (p.type === 'sorting' && out.newly.length && p.settings.bins < 3 && p.settings.bins < p.categories.length ? banner('sky', esc(T('Going well. You could try ' + (p.settings.bins + 1) + ' bins under Settings, Array and layout.', 'Berjalan baik. Kamu bisa mencoba ' + (p.settings.bins + 1) + ' wadah di Pengaturan, Susunan kartu.'))) : '') +
        '<div class="tl-panel dtt-tablewrap"><table class="dtt-table"><thead><tr><th>' + esc(T('Target', '%target%')) + '</th><th>' + esc(T('Trials', 'Trial')) + '</th><th>Independent</th><th>Prompted</th><th>' + esc(T('Incorrect', 'Salah')) + '</th></tr></thead><tbody>' + rows + '</tbody></table></div>' +
        '<p class="tl-note2">' + esc(T(s.notCounted + ' error correction ' + (s.notCounted === 1 ? 'trial' : 'trials') + ' not counted.', s.notCounted + ' trial Error correction tidak dihitung.')) + '</p>' +
        '<p class="dtt-syncline" id="dttSync" role="status"></p>' +
        '<div class="dtt-rowbtns"><button type="button" class="dtt-btn primary" data-s="again">' + esc(T('Run another session', 'Jalankan %session% lagi')) + '</button><button type="button" class="dtt-btn" data-s="data">' + esc(T('View data', 'Lihat data')) + '</button><button type="button" class="dtt-btn quiet" data-s="back">' + esc(T('Back to program', 'Kembali ke program')) + '</button></div></div>';
      host.appendChild(el);
      var line = el.querySelector('#dttSync');
      function sync() { line.textContent = practice ? T('Practice: nothing was recorded.', 'Latihan: tidak ada yang dicatat.') : D.store.guest() ? T('Saved on this device. Sign in to keep it in your account.', 'Tersimpan di perangkat ini. Masuk agar tersimpan di akunmu.') : D.store.waiting() ? T('Saved on this device. It will sync when you are online.', 'Tersimpan di perangkat ini. Akan disinkronkan saat online.') : T('Saved to your account.', 'Tersimpan di akunmu.'); }
      line.textContent = T('Saving...', 'Menyimpan...');
      saving.then(sync); D.store.onSync(function () { if (line.isConnected) sync(); });
      el.addEventListener('click', function (e) {
        var b = e.target.closest('[data-s]'); if (!b) return;
        var act = b.dataset.s, live = D.store.program(p.id);
        U.view = 'program'; U.programId = p.id; U.ptab = act === 'data' ? 'data' : 'setup';
        session.close();
        if (act === 'again' && live) session.start(live, practice ? { practice: true } : null);
      });
      var first = el.querySelector('[data-s=again]'); if (first) first.focus();
    }
  };
})();
