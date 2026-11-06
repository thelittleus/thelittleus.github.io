/* Little Us · DTT · what follows an error: a correction trial, an optional distractor trial, then a transfer trial. */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) module.exports = factory();
  else { root.LUDtt = root.LUDtt || {}; root.LUDtt.errorCorrection = factory(); }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  function counted(kind) { return kind === 'target' || kind === 'maintenance'; }

  // easier: mastered targets first, otherwise another target. No distractor trial if there is nothing else to show.
  function sequence(spec, s, pool, others, rng) {
    if (!s.ec || !counted(spec.kind)) return [];
    var r = rng || Math.random, out = [{ target: spec.target, op: spec.op, kind: 'ec-correction', force: 'max' }];
    if (s.ecD) {
      var from = (pool || []).filter(function (id) { return id !== spec.target; });
      if (!from.length) from = (others || []).filter(function (id) { return id !== spec.target; });
      if (from.length) out.push({ target: from[Math.floor(r() * from.length)], op: spec.op, kind: 'ec-distractor', force: 0 });
    }
    out.push({ target: spec.target, op: spec.op, kind: 'ec-transfer', force: 0 });
    return out;
  }
  return { counted: counted, sequence: sequence };
});
