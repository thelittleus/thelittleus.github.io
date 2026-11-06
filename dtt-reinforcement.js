/* Little Us · DTT · the reinforcement schedule: a full celebration, or a brief "Yes!". */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) module.exports = factory();
  else { root.LUDtt = root.LUDtt || {}; root.LUDtt.reinforcement = factory(); }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  // how many correct responses the next full celebration needs. VR values average 2 and 3.
  function requirement(sched, rng) {
    var r = rng || Math.random;
    if (sched === 'fr2') return 2;
    if (sched === 'fr3') return 3;
    if (sched === 'vr2') return 1 + Math.floor(r() * 3);
    if (sched === 'vr3') return 1 + Math.floor(r() * 5);
    return 1;
  }
  function newState(s, rng) { return { cnt: 0, req: requirement(s.sched, rng) }; }

  // st changes only when the response counts toward the schedule
  function decide(st, s, result, kind, rng) {
    if (kind === 'ec-correction' || kind === 'ec-distractor') return false;
    if (kind === 'ec-transfer') return result === 'independent';
    if (s.diff && result === 'prompted') return false;
    st.cnt++;
    if (st.cnt >= st.req) { st.cnt = 0; st.req = requirement(s.sched, rng); return true; }
    return false;
  }
  // a different style each time. No styles on means every style, so a celebration can always run.
  function pickFrom(list, last, rng) {
    var r = rng || Math.random, from = list.length > 1 ? list.filter(function (x) { return x !== last; }) : list;
    return from.length ? from[Math.floor(r() * from.length)] : null;
  }
  function enabledGames(s, all) { return all.filter(function (g) { return !s.games || s.games[g] !== false; }); }

  // tokens are earned by the schedule: one for each full celebration. Returns true when the board has just filled.
  function earnToken(st, s) {
    if (!s.tokenOn) return false;
    st.tokens = (st.tokens || 0) + 1;
    return st.tokens >= s.tokens;
  }
  function clearBoard(st) { st.tokens = 0; }
  return { requirement: requirement, newState: newState, decide: decide, pickFrom: pickFrom, enabledGames: enabledGames, earnToken: earnToken, clearBoard: clearBoard };
});
