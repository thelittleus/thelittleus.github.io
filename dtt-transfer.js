/* Little Us · DTT · "Use these targets for another type": a new program on the same stimulus set.
   Linked: the set and its images. Copied: reinforcement, timing, error correction, mastery and prompt method.
   Reset to the new type's defaults: card array, distractors, prompt styles, card positions and the instruction reminders.
   Nothing is ever marked as mastered in the new program. */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) module.exports = factory(require('./dtt-defaults.js'), require('./dtt-programs.js'), require('./dtt-targets.js'));
  else { root.LUDtt = root.LUDtt || {}; root.LUDtt.transfer = factory(root.LUDtt.defaults, root.LUDtt.programs, root.LUDtt.targets); }
})(typeof self !== 'undefined' ? self : this, function (DEF, P, TG) {
  'use strict';
  var COPIED = [
    'trials', 'order', 'maint', 'iti', 'resp', 'levels', 'prompt', 'fade', 'tdDelay', 'ec', 'ecD',
    'sched', 'diff', 'dur', 'scenes', 'photos', 'ownPhotos', 'tokenOn', 'tokens', 'tokenReward', 'praise', 'brief', 'cheer', 'inter', 'games',
    'mRule', 'mWin', 'mNeed', 'retDays', 'mPct', 'mSess', 'mMin'
  ];
  function clone(x) { return x === undefined ? x : JSON.parse(JSON.stringify(x)); }
  function masteredInSource(src, progress, id) { return DEF.OPS[src.type].some(function (op) { return TG.isMastered(progress || {}, id, op); }); }

  // o: { type, set, name, lang, startMastered, progress }
  function create(src, o) {
    var p = P.create({ studentId: src.studentId, setId: src.setId, type: o.type, name: o.name || src.name, goal: src.goal, lang: o.lang });
    p.goal = src.goal || '';
    COPIED.forEach(function (k) { p.settings[k] = clone(src.settings[k]); });
    p.preset = null;
    p.sourceProgramId = src.id;
    p.activeCount = src.activeCount;
    if (o.type !== 'pattern' && src.type !== 'pattern') { p.queue = src.queue.slice(); p.excluded = (src.excluded || []).slice(); }
    P.syncQueue(p, o.set);
    if (o.startMastered) {
      var first = p.queue.filter(function (id) { return masteredInSource(src, o.progress, id); });
      p.queue = first.concat(p.queue.filter(function (id) { return first.indexOf(id) < 0; }));
    }
    return p;
  }
  return { create: create, COPIED: COPIED };
});
