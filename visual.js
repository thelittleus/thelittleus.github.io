/* Little Us · DTT · what each kind of trial puts on the screen. Everything the stage needs is decided here, so a resumed trial looks the same. */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) module.exports = factory(require('./programs.js'), require('./targets.js'));
  else { root.LUDtt = root.LUDtt || {}; root.LUDtt.visual = factory(root.LUDtt.programs, root.LUDtt.targets); }
})(typeof self !== 'undefined' ? self : this, function (P, TG) {
  'use strict';
  function pick(a, r) { return a[Math.floor((r || Math.random)() * a.length)]; }

  // the sample and each comparison card, with the image each one shows
  function matching(p, set, id, rng) {
    var s = p.settings, r = rng || Math.random, options = TG.pickOptions(p, set, id, r), item = P.itemById(set, id), imgs = (item && item.images) || [];
    var sample = imgs.length ? pick(imgs, r) : null, kind = s.matchKind === 'both' ? (r() < 0.5 ? 'identical' : 'nonidentical') : s.matchKind;
    var others = imgs.filter(function (m) { return !sample || m.id !== sample.id; });
    var same = kind === 'nonidentical' && others.length ? pick(others, r) : sample, cards = {};
    options.forEach(function (o) {
      if (o === id) { cards[o] = same; return; }
      var it = P.itemById(set, o), a = (it && it.images) || [];
      cards[o] = a.length ? pick(a, r) : null;
    });
    return { options: options, correct: id, sample: sample, cards: cards, matchKind: same && sample && same.id !== sample.id ? 'nonidentical' : 'identical' };
  }

  // the bin for the card's category, plus others up to the bin count. Each bin shows a picture from its category and a name.
  function sorting(p, set, id, rng) {
    var s = p.settings, r = rng || Math.random, item = P.itemById(set, id), cats = p.categories || [];
    var mine = P.categoryOf(p, item)[0] || cats[0] || '';
    var rest = TG.shuffle(cats.filter(function (c) { return c !== mine; }), r).slice(0, Math.max(0, s.bins - 1));
    var names = s.rpos ? TG.shuffle([mine].concat(rest), r) : cats.filter(function (c) { return c === mine || rest.indexOf(c) >= 0; });
    function binImage(c) {
      var from = ((set && set.items) || []).filter(function (i) { return i.id !== id && (i.images || []).length && P.categoryOf(p, i).indexOf(c) >= 0; });
      if (from.length) return from[0].images[0];
      return c === mine && (item.images || [])[0] ? item.images[0] : null;
    }
    var imgs = (item && item.images) || [];
    return { options: names, correct: mine, card: imgs.length ? pick(imgs, r) : null, bins: names.map(function (c) { return { name: c, image: binImage(c) }; }) };
  }

  // the unit shown twice with the last element missing: AB gives A B A ?
  function pattern(p, set, id, rng) {
    var pt = (p.patterns || []).filter(function (x) { return x.id === id; })[0], r = rng || Math.random;
    if (!pt) return { options: [], correct: null, sequence: [], unitLength: 0 };
    var letters = (pt.unit + pt.unit).split(''), last = letters.pop(), answer = pt.fill[last];
    var options = TG.pickOptions(p, set, answer, r);
    return { options: options, correct: answer, sequence: letters.map(function (l) { return pt.fill[l]; }), unitLength: pt.unit.length };
  }

  function build(p, set, spec, rng) {
    if (spec.op === 'matching') return matching(p, set, spec.target, rng);
    if (spec.op === 'sorting') return sorting(p, set, spec.target, rng);
    if (spec.op === 'pattern') return pattern(p, set, spec.target, rng);
    if (spec.op === 'tact') return { options: [spec.target], correct: spec.target };
    return { options: TG.pickOptions(p, set, spec.target, rng), correct: spec.target };
  }
  return { build: build, matching: matching, sorting: sorting, pattern: pattern };
});
