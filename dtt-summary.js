/* Little Us · DTT · Session Complete (3m), for the teacher: the counts, each target's trials, what was mastered, and a note. */
(function () {
  'use strict';
  var D = window.LUDtt, X = LUTools.api, P = D.programs, EC = D.errorCorrection, T = D.i18n.T, esc = X.esc, ui = D.ui, U = ui.U;
  function name(p, set, id) { return ui.targetName(p, set, id) || '?'; }
  function sq(r) { return '<i class="dtt-sq ' + ({ independent: 'i', prompted: 'p', incorrect: 'e', 'no-response': 'n' }[r] || '') + '"></i>'; }

  D.summary = {
    show: function (host, p, set, kid, out, saving, session) {
      var practice = !!(session.practice && session.practice()), trials = out.session.trials.filter(function (t) { return EC.counted(t.kind); });
      var c = { i: 0, p: 0, e: 0, n: 0 };
      trials.forEach(function (t) { c[{ independent: 'i', prompted: 'p', 'no-response': 'n' }[t.result] || 'e']++; });
      var newly = {}, back = {}, mixed = D.defaults.OPS[p.type].length > 1;
      if (!practice) { out.newly.forEach(function (x) { newly[x.op + '|' + x.target] = 1; }); out.retention.forEach(function (x) { if (!x.ok) back[x.op + '|' + x.target] = 1; }); }
      var order = [], by = {};
      trials.forEach(function (t) { var k = t.op + '|' + t.target; if (!by[k]) { by[k] = []; order.push(t); } by[k].push(t.result); });
      var rows = order.map(function (t) {
        var k = t.op + '|' + t.target, it = p.type === 'pattern' ? null : P.itemById(set, t.target);
        return '<div class="dtt-sumrow">' + ui.dot(it) + '<b>' + esc(name(p, set, t.target)) + (mixed ? ' <small>' + esc(t.op === 'tact' ? T('Labeling', 'Menamai') : T('Identifying', 'Mengenali')) + '</small>' : '') + '</b>' +
          (newly[k] ? '<span class="dtt-chip mastered">★ ' + esc(T('Mastered!', '%mastered%!')) + '</span>' : back[k] ? '<span class="dtt-chip learning">' + esc(T('Back to learning', 'Kembali dipelajari')) + '</span>' : '') +
          '<span class="dtt-sqs">' + by[k].map(sq).join('') + '</span></div>';
      }).join('');
      var el = document.createElement('div');
      el.className = 'dtt-summary';
      el.innerHTML = '<div class="dtt-sumin">' + (practice ? '<span class="dtt-practag">' + esc(T('Practice · Not Recorded', 'Latihan · Tidak Dicatat')) + '</span>' : '') +
        '<h1 class="dtt-h1 big">' + esc(out.session.ended_early ? T('Session Ended', '%session% Diakhiri') : T('Session Complete', '%session% Selesai')) + '</h1>' +
        '<div class="dtt-tiles4"><span class="mint"><b>' + c.i + '</b>Independent</span><span class="butter"><b>' + c.p + '</b>Prompted</span><span class="rose"><b>' + c.e + '</b>' + esc(T('Error', 'Salah')) + '</span><span class="sand"><b>' + c.n + '</b>' + esc(T('No Response', 'Tidak Ada Respons')) + '</span></div>' +
        '<div class="dtt-panel dtt-sumlist">' + rows + '</div>' +
        (!practice && out.entered.length ? '<p class="dtt-hint">' + esc(T('Now learning: ', 'Kini dipelajari: ') + out.entered.map(function (x) { return name(p, set, x.target); }).join(', ')) + '</p>' : '') +
        (practice ? '' : '<label class="dtt-notefield"><span class="dtt-sr">' + esc(T('Add a note', 'Tambah catatan')) + '</span><textarea rows="2" maxlength="2000" placeholder="' + esc(T('Add a note (optional)', 'Tambah catatan (opsional)')) + '" data-note></textarea></label>') +
        '<p class="dtt-hint" id="dttSync" role="status"></p>' +
        '<div class="dtt-rowbtns end"><button type="button" class="dtt-btn sec" data-s="again">' + esc(T('Run Another', 'Jalankan Lagi')) + '</button><button type="button" class="dtt-btn primary" data-s="back">' + esc(T('Back to Program', 'Kembali ke Program')) + '</button></div></div>';
      host.appendChild(el);
      ui.hydrate(el);
      var line = el.querySelector('#dttSync'), note = el.querySelector('[data-note]');
      function sync() { line.textContent = practice ? T('Practice: nothing was recorded.', 'Latihan: tidak ada yang dicatat.') : D.store.guest() ? T('Saved on this device. Sign in to keep it in your account.', 'Tersimpan di perangkat ini. Masuk agar tersimpan di akunmu.') : D.store.waiting() ? T('Saved on this device. It will sync when you are online.', 'Tersimpan di perangkat ini. Akan disinkronkan saat online.') : T('Saved to Data.', 'Tersimpan di Data.'); }
      line.textContent = T('Saving...', 'Menyimpan...');
      saving.then(sync); D.store.onSync(function () { if (line.isConnected) sync(); });
      el.addEventListener('click', function (e) {
        var b = e.target.closest('[data-s]'); if (!b) return;
        var act = b.dataset.s, live = D.store.program(p.id), txt = note ? note.value.trim() : '';
        b.disabled = true;
        (txt ? saving.then(function () { return D.store.saveNote(out.session.id, txt); }).catch(function () { X.toast(T('The note was not saved.', 'Catatan belum tersimpan.')); }) : Promise.resolve()).then(function () {
          if (txt) ui.dataStale(p.id);
          U.view = 'program'; U.programId = p.id; U.ptab = 'setup';
          session.close();
          if (act === 'again' && live) session.start(live, practice ? { practice: true } : null);
        });
      });
      var first = el.querySelector('[data-s=back]'); if (first) first.focus();
    }
  };
})();
