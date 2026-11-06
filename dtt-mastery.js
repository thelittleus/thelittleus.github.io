/* Little Us · DTT · mastery. Only target and maintenance trials count, and only independent responses count toward mastery.
   Progress for one target and operation: { lv, c, st, recent: ['independent', ...], series: [{ n, ind }], sessions, masteredAt, retentionDue } */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) module.exports = factory(require('./dtt-prompting.js'), require('./dtt-errorCorrection.js'), require('./dtt-targets.js'));
  else { root.LUDtt = root.LUDtt || {}; root.LUDtt.mastery = factory(root.LUDtt.prompting, root.LUDtt.errorCorrection, root.LUDtt.targets); }
})(typeof self !== 'undefined' ? self : this, function (PR, EC, TG) {
  'use strict';
  var KEEP_RECENT = 10, KEEP_SERIES = 3, DAY = 86400000, FLAG_AFTER = 10;

  function newProgress(s) { var ps = PR.newState(s); ps.recent = []; ps.series = []; ps.sessions = 0; ps.masteredAt = null; ps.retentionDue = null; return ps; }
  function get(progress, id, op, s) { var k = TG.key(id, op); if (!progress[k]) progress[k] = newProgress(s); return progress[k]; }

  function rollingMet(ps, s) {
    var win = (ps.recent || []).slice(-s.mWin);
    return win.length >= s.mWin && win.filter(function (r) { return r === 'independent'; }).length >= s.mNeed;
  }
  function classicMet(ps, s) {
    var ser = (ps.series || []).filter(function (x) { return x.n >= s.mMin; }).slice(-s.mSess);
    return ser.length >= s.mSess && ser.every(function (x) { return Math.round(100 * x.ind / x.n) >= s.mPct; });
  }

  function unmaster(ps, s) {
    ps.masteredAt = null; ps.retentionDue = null; ps.recent = []; ps.series = []; ps.sessions = 0;
    return PR.backToLearning(s, ps);
  }
  // the teacher can undo mastery from the data view
  function undo(progress, id, op, s) { return unmaster(get(progress, id, op, s), s); }

  // applies one finished session. Returns what changed, and marks which rows need saving.
  function applySession(progress, trials, s, now) {
    var real = trials.filter(function (t) { return EC.counted(t.kind); }), byKey = {}, order = [];
    real.forEach(function (t) {
      var k = TG.key(t.target, t.op);
      if (!byKey[k]) { byKey[k] = { id: t.target, op: t.op, n: 0, ind: 0, retention: null }; order.push(k); }
      var b = byKey[k]; b.n++;
      if (t.result === 'independent') b.ind++;
      var ps = get(progress, t.target, t.op, s);
      ps.recent = (ps.recent || []).concat([t.result]).slice(-KEEP_RECENT);
      if (t.retention && b.retention == null) b.retention = t.result === 'independent';
    });
    var newly = [], retention = [];
    order.forEach(function (k) {
      var b = byKey[k], ps = get(progress, b.id, b.op, s), wasMastered = !!ps.masteredAt;
      ps.series = (ps.series || []).concat([{ n: b.n, ind: b.ind }]).slice(-KEEP_SERIES);
      if (b.retention != null && wasMastered) {
        retention.push({ target: b.id, op: b.op, ok: b.retention });
        if (b.retention) ps.retentionDue = null; else unmaster(ps, s);
        return;
      }
      if (wasMastered) return;
      ps.sessions = (ps.sessions || 0) + 1;
      if (s.mRule === 'rolling' ? rollingMet(ps, s) : classicMet(ps, s)) {
        ps.masteredAt = now;
        ps.retentionDue = s.mRule === 'rolling' ? now + s.retDays * DAY : null;
        PR.mastered(ps);
        newly.push({ target: b.id, op: b.op });
      }
    });
    return { newly: newly, retention: retention, touched: order };
  }

  function needsAttention(ps) { return !!ps && !ps.masteredAt && (ps.sessions || 0) >= FLAG_AFTER; }

  function pct(a, b) { return b ? Math.round(100 * a / b) : 0; }
  // Percentages leave out error correction trials
  function summarize(trials) {
    var t = trials.filter(function (x) { return EC.counted(x.kind); });
    var ind = t.filter(function (x) { return x.result === 'independent'; }).length, pr = t.filter(function (x) { return x.result === 'prompted'; }).length, er = t.length - ind - pr;
    return { n: t.length, ind: ind, pr: pr, er: er, pctInd: pct(ind, t.length), pctPr: pct(pr, t.length), pctEr: pct(er, t.length), notCounted: trials.length - t.length };
  }
  function perTarget(trials) {
    var seen = {}, out = [];
    trials.filter(function (x) { return EC.counted(x.kind); }).forEach(function (x) {
      var k = TG.key(x.target, x.op);
      if (!seen[k]) { seen[k] = { target: x.target, op: x.op, list: [], maintenance: false, retention: false }; out.push(seen[k]); }
      seen[k].list.push(x);
      if (x.kind === 'maintenance') seen[k].maintenance = true;
      if (x.retention) seen[k].retention = true;
    });
    return out.map(function (e) { return { target: e.target, op: e.op, maintenance: e.maintenance, retention: e.retention, sum: summarize(e.list) }; });
  }
  return { newProgress: newProgress, get: get, rollingMet: rollingMet, classicMet: classicMet, undo: undo, applySession: applySession, needsAttention: needsAttention, summarize: summarize, perTarget: perTarget, FLAG_AFTER: FLAG_AFTER };
});
