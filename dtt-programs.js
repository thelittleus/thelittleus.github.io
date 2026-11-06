/* Little Us · DTT · program rules: creating a program, presets, safe setting changes, the target queue and readiness checks.
   No browser code here, so it can be unit tested. */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) module.exports = factory(require('./dtt-defaults.js'));
  else { root.LUDtt = root.LUDtt || {}; root.LUDtt.programs = factory(root.LUDtt.defaults); }
})(typeof self !== 'undefined' ? self : this, function (DEF) {
  'use strict';

  function uuid() {
    var c = typeof crypto !== 'undefined' ? crypto : null;
    if (c && c.randomUUID) return c.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-8xxx-xxxxxxxxxxxx'.replace(/x/g, function () { return Math.floor(Math.random() * 16).toString(16); });
  }

  function create(o) {
    o = o || {};
    var p = {
      id: o.id || uuid(), studentId: o.studentId || '', setId: o.setId || null, goal: o.goal || '', name: o.name || '',
      type: DEF.TYPES.indexOf(o.type) >= 0 ? o.type : 'listener', settings: DEF.settings(o.lang), preset: 'acquisition',
      activeCount: DEF.ACTIVE_DEFAULT, queue: [], pinned: [], excluded: [], patterns: [], categories: []
    };
    return p;
  }

  function applyPreset(p, id) {
    var pr = DEF.PRESETS[id]; if (!pr) return p;
    Object.keys(pr).forEach(function (k) { p.settings[k] = pr[k]; });
    p.preset = id;
    return p;
  }

  // the one way a form changes a setting: keeps values inside their range and related values consistent
  function setValue(s, key, value) {
    var r = DEF.RANGES[key], c = DEF.CHOICES[key], v = value;
    if (r) { v = Number(v); if (isNaN(v)) return false; v = Math.max(r[0], Math.min(r[1], Math.round(v))); }
    else if (c) { var hit = c.filter(function (x) { return String(x) === String(v); })[0]; if (hit === undefined) return false; v = hit; }
    s[key] = v;
    if (key === 'mWin' && s.mNeed > v) s.mNeed = v;
    if (key === 'mNeed' && s.mNeed > s.mWin) s.mNeed = s.mWin;
    return true;
  }

  function targetIds(p, set) {
    if (p.type === 'pattern') return (p.patterns || []).map(function (x) { return x.id; });
    return ((set && set.items) || []).map(function (i) { return i.id; });
  }

  // brings the queue in step with the set: items added to the set join the end, deleted items leave.
  // Items the teacher removed from this program stay out.
  function syncQueue(p, set) {
    var ids = targetIds(p, set), excl = p.excluded || [];
    p.queue = (p.queue || []).filter(function (id) { return ids.indexOf(id) >= 0; });
    ids.forEach(function (id) { if (p.queue.indexOf(id) < 0 && excl.indexOf(id) < 0) p.queue.push(id); });
    p.pinned = (p.pinned || []).filter(function (id) { return p.queue.indexOf(id) >= 0; });
    p.excluded = excl.filter(function (id) { return ids.indexOf(id) >= 0; });
    return p;
  }

  function moveTarget(p, id, dir) {
    var i = p.queue.indexOf(id), j = i + dir;
    if (i < 0 || j < 0 || j >= p.queue.length) return false;
    p.queue[i] = p.queue[j]; p.queue[j] = id;
    return true;
  }
  function togglePin(p, id) {
    var i = p.pinned.indexOf(id);
    if (i >= 0) p.pinned.splice(i, 1); else if (p.queue.indexOf(id) >= 0) p.pinned.push(id);
    return i < 0;
  }
  function removeTarget(p, id) {
    p.queue = p.queue.filter(function (x) { return x !== id; });
    p.pinned = p.pinned.filter(function (x) { return x !== id; });
    if (p.excluded.indexOf(id) < 0) p.excluded.push(id);
  }
  function addTarget(p, id) {
    p.excluded = p.excluded.filter(function (x) { return x !== id; });
    if (p.queue.indexOf(id) < 0) p.queue.push(id);
  }

  function itemById(set, id) { return ((set && set.items) || []).filter(function (i) { return i.id === id; })[0] || null; }
  function labelOf(p, item) { return (item && item.labels && item.labels.primary) || ''; }
  function tagsOf(set) {
    var seen = {}, out = [];
    ((set && set.items) || []).forEach(function (i) { (i.tags || []).forEach(function (t) { var k = t.toLowerCase(); if (!seen[k]) { seen[k] = 1; out.push(t); } }); });
    return out;
  }
  function categoryOf(p, item) {
    var low = (item.tags || []).map(function (t) { return t.toLowerCase(); });
    return (p.categories || []).filter(function (c) { return low.indexOf(c.toLowerCase()) >= 0; });
  }
  function unitLetters(unit) {
    var seen = {}, out = [];
    String(unit || '').split('').forEach(function (c) { if (!seen[c]) { seen[c] = 1; out.push(c); } });
    return out;
  }
  function newPattern(unit) { return { id: uuid(), unit: unit || 'AB', fill: {} }; }
  function patternComplete(pt) { return unitLetters(pt.unit).every(function (l) { return !!(pt.fill && pt.fill[l]); }); }

  // what still stops this program from running. Each entry is a code the interface turns into a sentence.
  function issues(p, set) {
    var out = [], items = (set && set.items) || [], s = p.settings;
    if (!(p.name || '').trim()) out.push({ code: 'name' });
    if (!p.setId || !set) { out.push({ code: 'set' }); return out; }
    if (!items.length) { out.push({ code: 'items' }); return out; }
    if (items.some(function (i) { return !(i.images || []).length; })) out.push({ code: 'noImage' });
    if (p.type === 'pattern') {
      if (!(p.patterns || []).length) out.push({ code: 'patterns' });
      else if (p.patterns.some(function (x) { return !patternComplete(x); })) out.push({ code: 'patternFill' });
    } else if (!p.queue.length) out.push({ code: 'queue' });
    if (p.type === 'matching' && s.matchKind !== 'identical') {
      var few = p.queue.map(function (id) { return itemById(set, id); }).filter(function (i) { return i && (i.images || []).length < 2; });
      if (few.length) out.push({ code: 'twoImages', n: few.length });
    }
    if (p.type === 'sorting') {
      if ((p.categories || []).length < s.bins) out.push({ code: 'categories', n: s.bins });
      else {
        var bad = p.queue.map(function (id) { return itemById(set, id); }).filter(function (i) { return i && categoryOf(p, i).length !== 1; });
        if (bad.length) out.push({ code: 'oneCategory', n: bad.length });
      }
    }
    return out;
  }

  function newItem(primary) { return { id: uuid(), labels: { primary: primary || '' }, images: [], tags: [], doNotPairWith: [] }; }

  // copies items out of the read-only library. An item already copied from the same library item is skipped.
  function importFromLibrary(set, libSet, itemIds, lang) {
    var added = [];
    (libSet.items || []).forEach(function (li) {
      if (itemIds.indexOf(li.id) < 0 || li.pending) return;
      var key = libSet.id + '/' + li.id;
      if ((set.items || []).some(function (i) { return i.from === key; })) return;
      var en = li.labels[0], idn = li.labels[1], it = newItem(lang === 'id' ? idn : en);
      it.images = (li.images || []).map(function (r) { return { id: uuid(), lib: r }; });
      it.tags = (li.tags || []).slice();
      it.from = key;
      set.items.push(it); added.push(it);
    });
    return added;
  }

  function photoLimit(plusUnlocked) { return plusUnlocked ? DEF.PHOTO.maxLimit : DEF.PHOTO.freeLimit; }
  function countUploaded(sets, studentRows) {
    var n = 0;
    (sets || []).forEach(function (s) { (s.items || []).forEach(function (i) { (i.images || []).forEach(function (m) { if (m.path) n++; }); }); });
    (studentRows || []).forEach(function (r) { n += ((r.photos || []).filter(function (x) { return x.path; })).length; });
    return n;
  }

  return {
    uuid: uuid, create: create, applyPreset: applyPreset, setValue: setValue, syncQueue: syncQueue, moveTarget: moveTarget, togglePin: togglePin,
    removeTarget: removeTarget, addTarget: addTarget, itemById: itemById, labelOf: labelOf, tagsOf: tagsOf, categoryOf: categoryOf,
    unitLetters: unitLetters, newPattern: newPattern, patternComplete: patternComplete, issues: issues, newItem: newItem,
    importFromLibrary: importFromLibrary, photoLimit: photoLimit, countUploaded: countUploaded
  };
});
