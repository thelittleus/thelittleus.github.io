/* Little Us · DTT · the numbers behind the data view. Percentages leave out error correction trials, as everywhere else. */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) module.exports = factory(require('./dtt-mastery.js'), require('./dtt-errorCorrection.js'), require('./dtt-targets.js'));
  else { root.LUDtt = root.LUDtt || {}; root.LUDtt.data = factory(root.LUDtt.mastery, root.LUDtt.errorCorrection, root.LUDtt.targets); }
})(typeof self !== 'undefined' ? self : this, function (MA, EC, TG) {
  'use strict';
  var KEEP_RECENT = 20, KEEP_SERIES = 10; // the same as dtt-mastery.js
  function byDate(a, b) { return String(a.started_at).localeCompare(String(b.started_at)); }

  // oldest first. op limits it to one operation; a session with no trials of that operation is left out.
  function series(sessions, op) {
    return sessions.slice().sort(byDate).map(function (s) {
      var t = op ? s.trials.filter(function (x) { return x.op === op; }) : s.trials, sum = MA.summarize(t);
      return { id: s.id, date: s.started_at, n: sum.n, pct: sum.pctInd, sum: sum, early: !!s.ended_early };
    }).filter(function (x) { return x.n > 0; });
  }
  function rows(sessions) { return series(sessions).reverse(); }
  function operations(sessions) {
    var seen = {}; sessions.forEach(function (s) { s.trials.forEach(function (t) { seen[t.op] = 1; }); });
    return Object.keys(seen);
  }
  function byOperation(sessions) {
    return operations(sessions).map(function (op) {
      var all = sessions.reduce(function (acc, s) { return acc.concat(s.trials.filter(function (t) { return t.op === op; })); }, []);
      return { op: op, sum: MA.summarize(all) };
    });
  }

  // after a session is deleted its trials must stop counting. Mastery already earned and prompt levels stay as they are,
  // because the teacher decides those with undo. Returns the progress keys that changed.
  function rebuild(progress, sessions) {
    var fresh = {};
    sessions.slice().sort(byDate).forEach(function (s) {
      var perKey = {};
      s.trials.filter(function (t) { return EC.counted(t.kind); }).forEach(function (t) {
        var k = TG.key(t.target, t.op);
        fresh[k] = fresh[k] || { recent: [], series: [], sessions: 0 };
        fresh[k].recent.push(t.result);
        perKey[k] = perKey[k] || { n: 0, ind: 0, pr: 0 };
        perKey[k].n++; if (t.result === 'independent') perKey[k].ind++; if (t.result === 'prompted') perKey[k].pr++;
      });
      Object.keys(perKey).forEach(function (k) { fresh[k].series.push(perKey[k]); fresh[k].sessions++; });
    });
    var changed = [];
    Object.keys(progress).forEach(function (k) {
      var ps = progress[k], f = fresh[k] || { recent: [], series: [], sessions: 0 };
      var recent = f.recent.slice(-KEEP_RECENT), ser = f.series.slice(-KEEP_SERIES);
      if (JSON.stringify(ps.recent || []) !== JSON.stringify(recent) || JSON.stringify(ps.series || []) !== JSON.stringify(ser)) {
        ps.recent = recent; ps.series = ser; ps.sessions = ps.masteredAt ? (ps.sessions || 0) : f.sessions;
        changed.push(k);
      }
    });
    return changed;
  }
  function toRows(progress, keys) { return keys.map(function (k) { var i = k.indexOf('|'); return { target_id: k.slice(i + 1), operation: k.slice(0, i), data: progress[k] }; }); }
  return { series: series, rows: rows, operations: operations, byOperation: byOperation, rebuild: rebuild, toRows: toRows };
});
