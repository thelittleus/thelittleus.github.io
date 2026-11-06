/* Little Us · DTT · what the student sees on a Listener Responding trial: an array of pictures to touch. */
(function () {
  'use strict';
  var D = window.LUDtt, P = D.programs, X = LUTools.api, esc = X.esc;
  var POINTER = '<svg class="dtt-pointer" viewBox="0 0 48 60" aria-hidden="true"><path d="M24 58L6 34h11V4h14v30h11z" fill="var(--dtt-select)" stroke="var(--dtt-ink)" stroke-width="4" stroke-linejoin="round"/></svg>';
  var CARD_RATIO = 1, MAX_CARD = 560;

  function imageFor(item, trialNo) { var a = (item && item.images) || []; return a.length ? a[trialNo % a.length] : null; }
  D.stages = D.stages || {};
  D.stages.listener = {
    touch: true,
    draw: function (stage, cur, S) {
      stage.innerHTML = '<div class="dtt-cardgrid">' + cur.options.map(function (id) {
        var it = P.itemById(S.set, id);
        return '<button type="button" class="dtt-pic" data-t="' + esc(id) + '">' + D.ui.img(imageFor(it, cur.no), P.labelOf(S.program, it)) + '</button>';
      }).join('') + '</div>';
      D.ui.hydrate(stage);
    },
    // cards take the size that leaves the biggest picture without overflowing
    layout: function (stage) {
      var grid = stage.querySelector('.dtt-cardgrid'); if (!grid) return;
      var n = grid.children.length, W = stage.clientWidth - 32, H = stage.clientHeight - 36, best = null;
      for (var c = 1; c <= n; c++) {
        var r = Math.ceil(n / c), gap = Math.max(14, Math.min(34, W * 0.03));
        var w = Math.min((W - gap * (c - 1)) / c, ((H - gap * (r - 1)) / r) * CARD_RATIO, MAX_CARD);
        if (w > 0 && (!best || w > best.w + 1)) best = { c: c, w: w, gap: gap };
      }
      if (!best) best = { c: n, w: 90, gap: 10 };
      grid.style.gridTemplateColumns = 'repeat(' + best.c + ',' + Math.floor(best.w) + 'px)';
      grid.style.gap = Math.floor(best.gap) + 'px';
      Array.prototype.forEach.call(grid.children, function (el) { el.style.width = el.style.height = Math.floor(best.w) + 'px'; });
    },
    prompt: function (stage, cur, level, s) {
      Array.prototype.forEach.call(stage.querySelectorAll('.dtt-pic'), function (el) {
        var isT = el.dataset.t === cur.spec.target, old = el.querySelector('.dtt-pointer');
        el.classList.remove('pr-pulse', 'pr-big', 'pr-glow', 'dim', 'gone'); if (old) old.remove();
        if (level === 1 && isT) {
          if (s.lPart === 'pulse') el.classList.add('pr-pulse');
          if (s.lPart === 'bigger') el.classList.add('pr-big');
          if (s.lPart === 'point') el.insertAdjacentHTML('beforeend', POINTER);
        }
        if (level >= 2) { if (isT) el.classList.add('pr-glow'); else el.classList.add(s.lFull === 'only' ? 'gone' : 'dim'); }
      });
    },
    tapped: function (e) { var b = e.target.closest('.dtt-pic'); return b && !b.classList.contains('gone') ? b : null; },
    isCorrect: function (b, cur) { return b.dataset.t === cur.spec.target; },
    showResult: function (stage, cur, correct) {
      Array.prototype.forEach.call(stage.querySelectorAll('.dtt-pic'), function (el) {
        var old = el.querySelector('.dtt-pointer'); if (old) old.remove();
        el.classList.remove('pr-pulse', 'pr-big', 'pr-glow');
        if (correct && el.dataset.t === cur.spec.target) el.classList.add('ok'); else el.classList.add('dim');
      });
    }
  };
})();
