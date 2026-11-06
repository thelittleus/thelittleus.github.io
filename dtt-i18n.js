/* Little Us · DTT · language.
   Strings sit next to the code as T('English', 'Indonesia'), the same pattern as tools-safe.js.
   Terms that teachers may later want translated are written as %mastery% in the Indonesian text and set here. */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) module.exports = factory();
  else { root.LUDtt = root.LUDtt || {}; root.LUDtt.i18n = factory(); }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  // Change a value here to translate that term everywhere in the Indonesian interface.
  var TERMS_ID = { mastery: 'Mastery', mastered: 'Mastered', maintenance: 'Maintenance', session: 'Session', sessions: 'Session', target: 'Target', targets: 'Target' };

  function lang() { return (typeof window !== 'undefined' && window.LU && window.LU.lang === 'id') ? 'id' : 'en'; }
  function fill(s) { return String(s).replace(/%([a-z]+)%/g, function (m, k) { return TERMS_ID[k] || m; }); }
  function T(en, idn) { return lang() === 'id' ? fill(idn) : en; }
  return { T: T, lang: lang, fill: fill, TERMS_ID: TERMS_ID };
});
