/* Little Us · DTT · one session as plain data, so it can be saved after every trial and picked up again after a reload.
   The interface asks this what to show and tells it what happened. No browser code here. */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) module.exports = factory(require('./dtt-prompting.js'), require('./dtt-reinforcement.js'), require('./dtt-targets.js'), require('./dtt-errorCorrection.js'), require('./dtt-mastery.js'), require('./dtt-visual.js'));
  else { root.LUDtt = root.LUDtt || {}; root.LUDtt.engine = factory(root.LUDtt.prompting, root.LUDtt.reinforcement, root.LUDtt.targets, root.LUDtt.errorCorrection, root.LUDtt.mastery, root.LUDtt.visual); }
})(typeof self !== 'undefined' ? self : this, function (PR, RF, TG, EC, MA, VI) {
  'use strict';
  function clone(x) { return JSON.parse(JSON.stringify(x)); }

  // progress is copied: the saved progress only changes when the session finishes
  function create(o) {
    var queue = TG.buildQueue(o.program, o.progress, o.now, o.rng);
    if (!queue || !queue.length) return null;
    return {
      id: o.id, programId: o.program.id, studentId: o.program.studentId, startedAt: o.now, endedAt: null, endedEarly: false,
      queue: queue, total: queue.length, pending: [], trials: [], cur: null, trialNo: 0, reinf: RF.newState(o.program.settings, o.rng),
      progress: clone(o.progress), countedDone: 0, breakDue: false,
      activeBefore: {}
    };
  }
  function countedDone(st) { return st.trials.filter(function (t) { return EC.counted(t.kind); }).length; }

  // the next trial, or null when the list has run out
  function next(st, program, set, now, rng) {
    var spec = st.pending.shift() || st.queue.shift();
    if (!spec) { st.cur = null; return null; }
    var s = program.settings, ps = MA.get(st.progress, spec.target, spec.op, s), begin = PR.start(s, ps, spec.force);
    st.trialNo++;
    st.cur = Object.assign({ spec: spec, level: 0, maxLevel: 0, startLevel: begin.level, delay: begin.delay, t0: now, locked: false, no: st.trialNo }, VI.build(program, set, spec, rng));
    return st.cur;
  }
  // false when the prompt cannot be shown (already there, or that level is not allowed)
  function applyPrompt(st, program, level) {
    var c = st.cur; if (!c || c.locked || level <= c.level || PR.chain(program.settings).indexOf(level) < 0) return false;
    c.level = level; c.maxLevel = Math.max(c.maxLevel, level);
    return true;
  }
  function onTimeout(st, program) {
    var c = st.cur; if (!c || c.locked) return {};
    return PR.onTimeout(program.settings, c.level, c.spec.force != null);
  }
  // correct: true or false. noResponse: the window ran out, or the teacher pressed No response.
  function respond(st, program, a, now, rng) {
    var c = st.cur; if (!c || c.locked) return null;
    c.locked = true;
    var s = program.settings, spec = c.spec, real = EC.counted(spec.kind);
    var result = a.correct ? (c.maxLevel > 0 ? 'prompted' : 'independent') : (a.noResponse ? 'no-response' : 'incorrect');
    var trial = { target: spec.target, op: spec.op, kind: spec.kind, level: c.maxLevel, result: result, ms: now - c.t0, distractors: (c.options || []).filter(function (id) { return id !== c.correct; }) };
    if (spec.retention) trial.retention = true;
    st.trials.push(trial);
    if (real) {
      PR.afterResponse(s, MA.get(st.progress, spec.target, spec.op, s), result);
      if (s.inter && countedDone(st) % s.inter === 0 && st.queue.length) st.breakDue = true;
    }
    var full = false, boardFull = false;
    if (a.correct) { full = RF.decide(st.reinf, s, result, spec.kind, rng); boardFull = RF.earnToken(st.reinf, s, result, spec.kind); }
    else if (s.ec && real) {
      var pool = TG.maintenancePool(program, st.progress, spec.op), others = TG.active(program, st.progress, spec.op);
      st.pending = EC.sequence(spec, s, pool, others, rng).concat(st.pending);
    }
    return { result: result, correct: !!a.correct, full: full, boardFull: boardFull };
  }
  // fun breaks wait until any error correction is finished
  function takeBreak(st) { if (st.breakDue && !st.pending.length) { st.breakDue = false; return true; } return false; }

  // after a reload the unfinished trial runs again from its start
  function resume(st) {
    if (st.cur && !st.cur.locked) { st.pending.unshift(st.cur.spec); st.trialNo--; }
    st.cur = null;
    return st;
  }

  // the teacher skips the trial on screen: it is not recorded and the session gets one trial shorter
  function skip(st) {
    if (!st.cur || st.cur.locked) return false;
    if (EC.counted(st.cur.spec.kind)) st.total = Math.max(countedDone(st), st.total - 1);
    st.cur = null;
    return true;
  }

  // ends the session: mastery runs now, on the saved progress plus this session's prompt state. Null when no real trial was done.
  function finish(st, program, savedProgress, now, early) {
    var s = program.settings;
    if (!countedDone(st)) return null;
    var progress = clone(st.progress), ops = {};
    var before = {};
    st.trials.forEach(function (t) { ops[t.op] = 1; });
    Object.keys(ops).forEach(function (op) { before[op] = TG.active(program, savedProgress, op); });
    var out = MA.applySession(progress, st.trials, s, now);
    var entered = [];
    Object.keys(ops).forEach(function (op) {
      TG.active(program, progress, op).forEach(function (id) { if (before[op].indexOf(id) < 0) entered.push({ target: id, op: op }); });
    });
    st.endedAt = now; st.endedEarly = !!early;
    var rows = out.touched.map(function (k) { var i = k.indexOf('|'); return { target_id: k.slice(i + 1), operation: k.slice(0, i), data: progress[k] }; });
    return {
      session: { id: st.id, program_id: st.programId, student_id: st.studentId, started_at: new Date(st.startedAt).toISOString(), ended_at: new Date(now).toISOString(), ended_early: !!early, trials: st.trials },
      rows: rows, progress: progress, newly: out.newly, retention: out.retention, entered: entered,
      summary: MA.summarize(st.trials), perTarget: MA.perTarget(st.trials)
    };
  }
  return { create: create, next: next, applyPrompt: applyPrompt, onTimeout: onTimeout, respond: respond, takeBreak: takeBreak, resume: resume, skip: skip, finish: finish, countedDone: countedDone };
});
