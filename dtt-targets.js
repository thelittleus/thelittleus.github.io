/* Little Us · DTT · which targets are taught: the active set, the maintenance pool, retention checks, the trial list and distractors. */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) module.exports = factory(require('./dtt-defaults.js'));
  else { root.LUDtt = root.LUDtt || {}; root.LUDtt.targets = factory(root.LUDtt.defaults); }
})(typeof self !== 'undefined' ? self : this, function (DEF) {
  'use strict';
  function key(id, op) { return op + '|' + id; }
  function isMastered(progress, id, op) { var ps = progress[key(id, op)]; return !!(ps && ps.masteredAt); }
  function shuffle(a, rng) {
    var r = rng || Math.random, out = a.slice(), i, j, t;
    for (i = out.length - 1; i > 0; i--) { j = Math.floor(r() * (i + 1)); t = out[i]; out[i] = out[j]; out[j] = t; }
    return out;
  }

  // pinned targets are always active; the rest of N comes from the front of the queue, skipping mastered ones
  function active(p, progress, op) {
    var out = p.queue.filter(function (id) { return p.pinned.indexOf(id) >= 0; });
    p.queue.forEach(function (id) {
      if (out.length < p.activeCount && out.indexOf(id) < 0 && !isMastered(progress, id, op)) out.push(id);
    });
    return out;
  }
  function maintenancePool(p, progress, op) {
    return p.queue.filter(function (id) { return isMastered(progress, id, op) && p.pinned.indexOf(id) < 0; });
  }
  function dueRetention(p, progress, now) {
    var out = [];
    DEF.OPS[p.type].forEach(function (op) {
      p.queue.forEach(function (id) { var ps = progress[key(id, op)]; if (ps && ps.masteredAt && ps.retentionDue && ps.retentionDue <= now) out.push({ target: id, op: op }); });
    });
    return out;
  }

  var MAX_RETENTION = 4;
  // the trial list for one session. Trials per session includes maintenance. Null when there is nothing to run.
  function buildQueue(p, progress, now, rng) {
    var s = p.settings, r = rng || Math.random, ops = DEF.OPS[p.type], tgt = {}, pool = {};
    ops.forEach(function (op) { tgt[op] = active(p, progress, op); pool[op] = maintenancePool(p, progress, op); });
    var live = ops.filter(function (op) { return tgt[op].length; });
    var withPool = ops.filter(function (op) { return pool[op].length; });
    var out = [], n = s.trials;

    if (!live.length) {
      if (!withPool.length) return null;
      // everything is mastered: the session keeps these targets and their retention checks going
      var mq = {};
      while (out.length < n) {
        var o = withPool[Math.floor(r() * withPool.length)];
        if (!mq[o] || !mq[o].length) mq[o] = shuffle(pool[o], r);
        out.push({ target: mq[o].shift(), op: o, kind: 'maintenance' });
      }
    } else {
      var rot = {}, last = {}, m = {}, cnt = 0, recentOps = [];
      var nextTarget = function (op) {
        if (!rot[op] || !rot[op].length) {
          var b = shuffle(tgt[op], r);
          if (b.length > 1 && b[0] === last[op]) b.push(b.shift());
          rot[op] = s.order === 'block' ? b.reduce(function (acc, id) { return acc.concat([id, id, id]); }, []) : b;
        }
        return rot[op].shift();
      };
      while (out.length < n) {
        var t = live.length === 1 ? live[0] : (r() < 0.5 ? live[0] : live[1]);
        if (live.length > 1 && recentOps[0] === t && recentOps[1] === t) t = t === live[0] ? live[1] : live[0];
        recentOps = [t].concat(recentOps).slice(0, 2);
        var id = nextTarget(t); last[t] = id;
        out.push({ target: id, op: t, kind: 'target' }); cnt++;
        if (s.maint > 0 && cnt % s.maint === 0 && out.length < n) {
          var mo = pool[t].length ? t : withPool[0];
          if (mo) { if (!m[mo] || !m[mo].length) m[mo] = shuffle(pool[mo], r); out.push({ target: m[mo].shift(), op: mo, kind: 'maintenance' }); }
        }
      }
    }
    // due retention checks use maintenance slots first, and only then are added on top
    shuffle(dueRetention(p, progress, now), r).slice(0, MAX_RETENTION).forEach(function (d) {
      var spec = { target: d.target, op: d.op, kind: 'maintenance', retention: true, force: 0 };
      var dup = out.map(function (x, i) { return x.kind === 'maintenance' && !x.retention && x.target === d.target && x.op === d.op ? i : -1; }).filter(function (i) { return i >= 0; });
      var slots = dup.length ? dup : out.map(function (x, i) { return x.kind === 'maintenance' && !x.retention ? i : -1; }).filter(function (i) { return i >= 0; });
      if (slots.length) out[slots[Math.floor(r() * slots.length)]] = spec;
      else out.splice(Math.min(out.length, 1 + Math.floor(r() * out.length)), 0, spec);
    });
    return out;
  }

  function sharedTags(a, b) {
    var low = (b.tags || []).map(function (t) { return t.toLowerCase(); });
    return (a.tags || []).filter(function (t) { return low.indexOf(t.toLowerCase()) >= 0; }).length;
  }
  function blocked(a, b) { return (a.doNotPairWith || []).indexOf(b.id) >= 0 || (b.doNotPairWith || []).indexOf(a.id) >= 0; }

  // the cards for one touch trial. Items marked not to be paired never appear together, even if that means fewer cards.
  function pickOptions(p, set, targetId, rng) {
    var s = p.settings, r = rng || Math.random, size = s.array, items = (set && set.items) || [];
    var target = items.filter(function (i) { return i.id === targetId; })[0];
    if (!target || size <= 1) return [targetId];
    var cands = shuffle(items.filter(function (i) {
      // a pattern's queue holds patterns, not items, so its distractors come from the whole set
      return i.id !== targetId && (i.images || []).length && (p.type === 'pattern' || p.queue.indexOf(i.id) >= 0) && !blocked(target, i);
    }), r);
    if (s.dis === 'different' || s.dis === 'avoid') cands.sort(function (a, b) { return sharedTags(target, a) - sharedTags(target, b); });
    else if (s.dis === 'similar') cands.sort(function (a, b) { return sharedTags(target, b) - sharedTags(target, a); });
    var picks = [];
    cands.forEach(function (c) {
      if (picks.length >= size - 1) return;
      if (picks.some(function (x) { return blocked(x, c); })) return;
      picks.push(c);
    });
    var ids = [targetId].concat(picks.map(function (x) { return x.id; }));
    if (s.rpos) return shuffle(ids, r);
    var order = p.type === 'pattern' ? items.map(function (i) { return i.id; }) : p.queue;
    return ids.sort(function (a, b) { return order.indexOf(a) - order.indexOf(b); });
  }

  return { key: key, isMastered: isMastered, shuffle: shuffle, active: active, maintenancePool: maintenancePool, dueRetention: dueRetention, buildQueue: buildQueue, pickOptions: pickOptions, MAX_RETENTION: MAX_RETENTION };
});
