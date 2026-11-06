/* Little Us · DTT · what the student sees on a Tact trial: one picture to name. The teacher scores it. */
(function () {
  'use strict';
  var D = window.LUDtt, P = D.programs, esc = LUTools.api.esc;
  var MAX_CARD = 640;
  D.stages = D.stages || {};
  D.stages.tact = {
    touch: false,
    draw: function (stage, cur, S) {
      var it = P.itemById(S.set, cur.spec.target), imgs = (it && it.images) || [];
      // a different picture of the item each time, to support generalization
      var m = imgs.length ? imgs[(S.st.trials.filter(function (t) { return t.target === cur.spec.target; }).length) % imgs.length] : null;
      stage.innerHTML = '<div class="dtt-cardgrid tact"><div class="dtt-pic">' + D.ui.img(m, '') + '</div><p class="dtt-writelabel" hidden>' + esc(P.labelOf(S.program, it)) + '</p></div>';
      D.ui.hydrate(stage);
    },
    layout: function (stage) {
      var card = stage.querySelector('.dtt-pic'); if (!card) return;
      var w = Math.min(stage.clientWidth - 32, stage.clientHeight - 100, MAX_CARD);
      card.style.width = card.style.height = Math.max(120, Math.floor(w)) + 'px';
    },
    prompt: function (stage, cur, level, s) {
      var card = stage.querySelector('.dtt-pic'), lab = stage.querySelector('.dtt-writelabel');
      if (level === 1 && s.tPart === 'label' && lab) lab.hidden = false;
      if (level >= 2 && card) { card.classList.add('pr-glow'); if (lab) lab.hidden = true; }
    },
    showResult: function (stage, cur, correct) {
      var card = stage.querySelector('.dtt-pic'); if (!card) return;
      card.classList.remove('pr-glow');
      card.classList.add(correct ? 'ok' : 'dim');
    }
  };
})();
