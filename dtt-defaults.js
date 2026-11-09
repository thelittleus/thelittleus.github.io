/* Little Us · DTT · every setting, its default and its range. No browser code here, so it can be unit tested. */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) module.exports = factory();
  else { root.LUDtt = root.LUDtt || {}; root.LUDtt.defaults = factory(); }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var TYPES = ['listener', 'tact', 'mixed', 'matching', 'sorting', 'pattern'];
  var FAMILY = { listener: 'listener', tact: 'tact', mixed: 'mixed', matching: 'visual', sorting: 'visual', pattern: 'visual' };
  // a mixed program records listener and tact separately
  var OPS = { listener: ['listener'], tact: ['tact'], mixed: ['listener', 'tact'], matching: ['matching'], sorting: ['sorting'], pattern: ['pattern'] };

  var SCENES = ['center', 'walk', 'race', 'hop', 'skate', 'balloons', 'popup', 'dance', 'slide', 'rocket', 'fireworks', 'train', 'surf'];
  var GAMES = ['shadow', 'peek', 'closeup', 'silly', 'open', 'feed', 'match', 'pop'];
  var THEMES = ['space', 'sea', 'garden', 'fantasy', 'vehicles', 'weather'];
  var PATTERN_UNITS = ['AB', 'AAB', 'ABB', 'ABC', 'AABB', 'ABCD'];

  var PRAISE = {
    en: "Well done, {name}!\nGood job, {name}!\nGreat work, {name}!\nYou got it, {name}!\nAwesome, {name}!\nSuper star, {name}!\nFantastic, {name}!\nYou did it, {name}!\nHigh five, {name}!\nWay to go, {name}!\nBrilliant, {name}!\nAmazing work, {name}!\nHooray for {name}!\nThat's it, {name}!\nSo clever, {name}!\nLook at you go, {name}!",
    id: 'Hebat, {name}!\nBagus sekali, {name}!\nKerja bagus, {name}!\nBetul, {name}!\nKeren, {name}!\nJuara, {name}!\nLuar biasa, {name}!\nKamu berhasil, {name}!\nTos dulu, {name}!\nTerus begitu, {name}!\nPintar, {name}!\nHore untuk {name}!\nItu dia, {name}!\nPintar sekali, {name}!'
  };
  var BRIEF = { en: "Yes!\nThat's right!\nNice one!", id: 'Ya!\nBetul!\nBagus!' };
  var HINTS = {
    en: { sdHint: 'Touch {label}', tHint: 'What is this?', mHint: 'Match', sHint: 'Put it where it goes', patHint: 'What comes next?', tFill: 'It says ..., it is a {label}' },
    id: { sdHint: 'Sentuh {label}', tHint: 'Ini apa?', mHint: 'Cocokkan', sHint: 'Taruh di tempatnya', patHint: 'Selanjutnya apa?', tFill: 'Bunyinya ..., ini {label}' }
  };

  function arr(a) { return a.slice(); }
  function gamesOn() { var g = {}; GAMES.forEach(function (k) { g[k] = true; }); return g; }

  function base(lang) {
    var l = lang === 'id' ? 'id' : 'en', h = HINTS[l];
    return {
      // 2 trial type
      sdHint: h.sdHint, tHint: h.tHint, mHint: h.mHint, sHint: h.sHint, patHint: h.patHint, tFill: h.tFill,
      // 3 array and layout
      array: 3, bins: 2, dis: 'random', rpos: true, matchKind: 'identical', samplePos: 'centre',
      // 4 order and timing
      trials: 10, order: 'random', maint: 3, iti: 2, resp: 8,
      // 5 prompting
      levels: 'both', prompt: 'mtl', fade: 2, tdDelay: 3,
      lPart: 'pulse', lFull: 'glow', tPart: 'first',
      mPart: 'position', mFade: false, mFull: 'slide',
      sPart: 'pulse', sFull: 'slide',
      patPart: 'flash', patFull: 'glow',
      // 6 error correction
      ec: true, ecD: true,
      // 7 reinforcement
      sched: 'crf', diff: true, dur: 3, scenes: arr(SCENES), photos: true, ownPhotos: false,
      // token board: one token per correct response; a full board shows the reward and starts a break of breakMin minutes
      tokenOn: false, tokens: 5, tokenReward: 'celebration', tokenPrompted: true, breakMin: 1,
      praise: PRAISE[l], brief: BRIEF[l], cheer: true, inter: 3, games: gamesOn(),
      // 8 mastery
      mRule: 'rolling', mWin: 5, mNeed: 4, retDays: 7, mPct: 80, mSess: 3, mMin: 2,
      // what counts toward mastery (ind: independent only, any: independent or prompted correct), and what a session below the rule does to the streak
      mCount: 'ind', mMiss: 'reset'
    };
  }

  // [min, max, step]
  var RANGES = {
    activeCount: [1, 6, 1], trials: [3, 40, 1], iti: [0, 10, 1], resp: [3, 20, 1], fade: [1, 5, 1], tdDelay: [1, 10, 1],
    dur: [2, 8, 1], mWin: [3, 20, 1], mNeed: [1, 20, 1], retDays: [1, 30, 1], mMin: [1, 20, 1],
    mPct: [50, 100, 5], mSess: [1, 10, 1], tokens: [2, 10, 1], breakMin: [1, 10, 1]
  };
  var CHOICES = {
    array: [1, 2, 3, 4, 6], bins: [1, 2, 3], maint: [0, 4, 3, 2], inter: [0, 3, 5],
    dis: ['random', 'different', 'similar', 'avoid'], order: ['random', 'block'], levels: ['both', 'full', 'partial'], prompt: ['manual', 'mtl', 'ltm', 'td'],
    sched: ['crf', 'fr2', 'fr3', 'vr2', 'vr3'], mRule: ['rolling', 'classic'], mCount: ['ind', 'any'], mMiss: ['reset', 'pause'], matchKind: ['identical', 'nonidentical', 'both'], samplePos: ['centre', 'top', 'side'],
    lPart: ['pulse', 'point', 'bigger'], lFull: ['glow', 'only'], tPart: ['first', 'fill', 'label'],
    mPart: ['position', 'pulse', 'point'], mFull: ['slide'], sPart: ['pulse', 'point'], sFull: ['slide', 'only'], patPart: ['flash', 'pulse'], patFull: ['glow', 'only']
  };

  // presets only pre-fill settings; everything stays editable
  var PRESETS = {
    errorless: { array: 1, bins: 1, prompt: 'mtl', levels: 'both', fade: 2, ec: true, sched: 'crf' },
    acquisition: { array: 3, bins: 2, prompt: 'mtl', levels: 'both', fade: 2, ec: true, sched: 'crf' },
    maintenance: { array: 4, bins: 3, prompt: 'manual', levels: 'both', ec: true, sched: 'vr2' }
  };

  // stored per device or browser, not per program
  var DEF_PREFS = { sfx: true, cheer: true, charSnd: true, ding: true, vol: 'soft', labelView: 'hold', hold: false, reduce: false };

  return {
    TYPES: TYPES, FAMILY: FAMILY, OPS: OPS, SCENES: SCENES, GAMES: GAMES, THEMES: THEMES, PATTERN_UNITS: PATTERN_UNITS,
    RANGES: RANGES, CHOICES: CHOICES, PRESETS: PRESETS, DEF_PREFS: DEF_PREFS, ACTIVE_DEFAULT: 3,
    // free accounts (and people trying it before signing in): 2 programs and 50 uploaded photos. Plus: no program limit, 500 photos.
    FREE_PROGRAMS: 2,
    PHOTO: { freeLimit: 50, maxLimit: 500, side: 800, targetBytes: 120000, hardBytes: 256000, maxPickBytes: 50000000 },
    settings: base
  };
});
