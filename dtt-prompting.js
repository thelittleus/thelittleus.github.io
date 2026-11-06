/* Little Us · DTT · prompt levels and the four prompt methods. Level 0 is no prompt, 1 partial, 2 full.
   ps is the per-target prompt state: { lv, c, st } (level, correct in a row, time delay stage). */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) module.exports = factory();
  else { root.LUDtt = root.LUDtt || {}; root.LUDtt.prompting = factory(); }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  function chain(s) { return s.levels === 'full' ? [0, 2] : s.levels === 'partial' ? [0, 1] : [0, 1, 2]; }
  function top(s) { return s.levels === 'partial' ? 1 : 2; }
  function isCorrect(r) { return r === 'independent' || r === 'prompted'; }

  function newState(s) { return { lv: top(s), c: 0, st: 0 }; }

  // where a trial begins. force: 'max' for the top allowed level, 0 for no prompt (error correction and retention checks)
  function start(s, ps, force) {
    if (force === 'max') return { level: top(s), delay: null };
    if (force === 0) return { level: 0, delay: null };
    if (s.prompt === 'mtl') return { level: chain(s).indexOf(ps.lv) >= 0 ? ps.lv : top(s), delay: null };
    if (s.prompt === 'td') return ps.st === 0 ? { level: top(s), delay: null } : { level: 0, delay: s.tdDelay };
    return { level: 0, delay: null }; // manual and least-to-most
  }

  // the response window ran out
  function onTimeout(s, level, forced) {
    if (s.prompt === 'ltm' && !forced) {
      var nxt = chain(s).filter(function (l) { return l > level; })[0];
      if (nxt != null) return { prompt: nxt };
    }
    return { noResponse: true };
  }

  // only real trials move this; error correction trials never do
  function afterResponse(s, ps, result) {
    var ok = isCorrect(result);
    if (s.prompt === 'mtl') {
      var ch = chain(s), idx = ch.indexOf(ps.lv);
      if (idx < 0) idx = ch.length - 1;
      if (ok) { ps.c++; if (ps.c >= s.fade && idx > 0) { ps.lv = ch[idx - 1]; ps.c = 0; } else ps.lv = ch[idx]; }
      else { ps.lv = ch[Math.min(ch.length - 1, idx + 1)]; ps.c = 0; }
    } else if (s.prompt === 'td') {
      if (ps.st === 0) { if (ok) { ps.c++; if (ps.c >= s.fade) { ps.st = 1; ps.c = 0; } } else ps.c = 0; }
      else if (!ok) { ps.st = 0; ps.c = 0; }
    }
    return ps;
  }

  // a target coming back after a failed retention check or undone mastery: back to learning at the partial prompt
  function backToLearning(s, ps) { ps.lv = chain(s).indexOf(1) >= 0 ? 1 : top(s); ps.c = 0; ps.st = 0; return ps; }
  // a mastered target is on no prompt from here on
  function mastered(ps) { ps.lv = 0; ps.c = 0; ps.st = 1; return ps; }

  return { chain: chain, top: top, isCorrect: isCorrect, newState: newState, start: start, onTimeout: onTimeout, afterResponse: afterResponse, backToLearning: backToLearning, mastered: mastered };
});
