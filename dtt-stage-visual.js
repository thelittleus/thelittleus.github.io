/* Little Us · DTT · what the student sees on Matching, Sorting and Pattern trials.
   A card marked dtt-drag can be dragged onto a dtt-drop. Touching a dtt-drop directly counts too. */
(function () {
  'use strict';
  var D = window.LUDtt, P = D.programs, esc = LUTools.api.esc, ui = D.ui;
  var POINTER = '<svg class="dtt-pointer" viewBox="0 0 48 60" aria-hidden="true"><path d="M24 58L6 34h11V4h14v30h11z" fill="var(--dtt-select)" stroke="var(--dtt-ink)" stroke-width="4" stroke-linejoin="round"/></svg>';
  var MAX = 420;

  function each(root, sel, fn) { Array.prototype.forEach.call(root.querySelectorAll(sel), fn); }
  function sizeAll(root, sel, w) { each(root, sel, function (el) { el.style.width = el.style.height = Math.floor(w) + 'px'; }); }
  function clearPrompt(stage) {
    each(stage, '.dtt-drop', function (el) { el.classList.remove('pr-pulse', 'pr-big', 'pr-glow', 'pr-near', 'dim', 'gone', 'fade1', 'fade2'); el.style.transform = ''; var o = el.querySelector('.dtt-pointer'); if (o) o.remove(); });
  }
  function correctDrop(stage, cur) { return stage.querySelector('.dtt-drop[data-t="' + CSS.escape(String(cur.correct)) + '"]'); }
  function others(stage, cur, fn) { each(stage, '.dtt-drop', function (el) { if (el.dataset.t !== String(cur.correct)) fn(el); }); }
  function slide(stage, drag, drop, share) {
    if (!drag || !drop) return;
    var a = drag.getBoundingClientRect(), b = drop.getBoundingClientRect();
    var x = ((b.left + b.width / 2) - (a.left + a.width / 2) + Number(drag.dataset.ox || 0)) * share, y = ((b.top + b.height / 2) - (a.top + a.height / 2) + Number(drag.dataset.oy || 0)) * share;
    drag.dataset.ox = x; drag.dataset.oy = y;
    drag.style.transform = 'translate(' + x + 'px,' + y + 'px)';
  }
  function result(stage, cur, correct) {
    each(stage, '.dtt-pointer', function (x) { x.remove(); });
    each(stage, '.dtt-drop', function (el) {
      el.classList.remove('pr-pulse', 'pr-big', 'pr-glow', 'pr-near', 'fade1', 'fade2'); el.style.transform = '';
      if (correct && el.dataset.t === String(cur.correct)) el.classList.add('ok'); else el.classList.add('dim');
    });
    var drag = stage.querySelector('.dtt-drag');
    if (drag) { var drop = correct && correctDrop(stage, cur); if (drop) slide(stage, drag, drop, 1); else if (!correct) drag.classList.add('dim'); }
  }
  function touchStage(def) {
    def.touch = true;
    def.tapped = function (e) { var b = e.target.closest('.dtt-drop'); return b && !b.classList.contains('gone') ? b : null; };
    def.isCorrect = function (b, cur) { return b.dataset.t === String(cur.correct); };
    def.showResult = result;
    return def;
  }

  D.stages = D.stages || {};

  /* ---------- matching: a sample and a field ---------- */
  D.stages.matching = touchStage({
    draw: function (stage, cur, S) {
      var pos = S.program.settings.samplePos, cards = cur.options.map(function (id) { return '<button type="button" class="dtt-pic dtt-drop" data-t="' + esc(id) + '">' + ui.img(cur.cards[id], P.labelOf(S.program, P.itemById(S.set, id))) + '</button>'; });
      var sample = '<div class="dtt-pic dtt-sample dtt-drag">' + ui.img(cur.sample, '') + '</div>';
      if (pos === 'centre' && cards.length > 1) {
        var half = Math.ceil(cards.length / 2);
        stage.innerHTML = '<div class="dtt-match centre"><div class="dtt-field col">' + cards.slice(0, half).join('') + '</div>' + sample + '<div class="dtt-field col">' + cards.slice(half).join('') + '</div></div>';
      } else stage.innerHTML = '<div class="dtt-match ' + (pos === 'side' ? 'side' : 'top') + '">' + sample + '<div class="dtt-field">' + cards.join('') + '</div></div>';
      ui.hydrate(stage);
    },
    layout: function (stage) {
      var m = stage.querySelector('.dtt-match'); if (!m) return;
      var n = stage.querySelectorAll('.dtt-drop').length, W = stage.clientWidth - 32, H = stage.clientHeight - 32, gap = 18, w, cols = 1;
      // no room beside the field on a narrow upright screen, so the sample sits above it
      if (m.classList.contains('side') && W < H) { m.classList.remove('side'); m.classList.add('top'); }
      if (m.classList.contains('centre')) {
        var perSide = Math.ceil(n / 2);
        if (W < H) { m.classList.remove('centre'); m.classList.add('wrapcentre'); }
        w = W < H ? Math.min((W - 2 * gap) / 3, (H - gap) / (perSide + 1)) : Math.min((W - 2 * gap) / 3, (H - gap * (perSide - 1)) / perSide);
        m.style.gap = gap + 'px';
      } else {
        var side = m.classList.contains('side'), best = 0;
        for (var c = 1; c <= n; c++) {
          var r = Math.ceil(n / c), t = side ? Math.min((W - gap * c) / (c + 1), (H - gap * (r - 1)) / r) : Math.min((W - gap * (c - 1)) / c, (H - gap * r) / (r + 1));
          if (t > best) { best = t; cols = c; }
        }
        w = best;
        var f = m.querySelector('.dtt-field'); f.style.gridTemplateColumns = 'repeat(' + cols + ',max-content)'; f.style.gap = gap + 'px'; m.style.gap = gap + 'px';
      }
      w = Math.max(70, Math.min(w, MAX));
      sizeAll(stage, '.dtt-pic', w);
      each(stage, '.dtt-field.col', function (f) { f.style.gap = gap + 'px'; });
    },
    prompt: function (stage, cur, level, s) {
      clearPrompt(stage);
      var drop = correctDrop(stage, cur), drag = stage.querySelector('.dtt-drag');
      if (s.mFade) others(stage, cur, function (el) { el.classList.add(level >= 2 ? 'fade2' : 'fade1'); });
      if (level === 1 && drop) {
        if (s.mPart === 'pulse') drop.classList.add('pr-pulse');
        if (s.mPart === 'point') drop.insertAdjacentHTML('beforeend', POINTER);
        if (s.mPart === 'position' && drag) {
          var a = drop.getBoundingClientRect(), b = drag.getBoundingClientRect();
          drop.style.transform = 'translate(' + ((b.left - a.left) * 0.18) + 'px,' + ((b.top - a.top) * 0.18) + 'px) scale(1.08)';
          drop.classList.add('pr-near');
        }
      }
      // the sample goes most of the way, and the student finishes the move
      if (level >= 2) slide(stage, drag, drop, 0.8);
    }
  });

  /* ---------- sorting: a card and its bins ---------- */
  D.stages.sorting = touchStage({
    draw: function (stage, cur) {
      stage.innerHTML = '<div class="dtt-sort"><div class="dtt-pic dtt-sample dtt-drag">' + ui.img(cur.card, '') + '</div><div class="dtt-bins">' + cur.bins.map(function (b) {
        return '<button type="button" class="dtt-bin dtt-drop" data-t="' + esc(b.name) + '"><span class="dtt-binimg">' + ui.img(b.image, b.name) + '</span><span class="dtt-binname">' + esc(b.name) + '</span></button>';
      }).join('') + '</div></div>';
      ui.hydrate(stage);
    },
    layout: function (stage) {
      var W = stage.clientWidth - 32, H = stage.clientHeight - 32, n = stage.querySelectorAll('.dtt-bin').length, gap = 16;
      var binW = Math.max(90, Math.min((W - gap * (n - 1)) / n, H * 0.5, MAX)), cardW = Math.max(90, Math.min(H * 0.38, W * 0.5, 320));
      sizeAll(stage, '.dtt-sample', cardW);
      each(stage, '.dtt-bin', function (b) { b.style.width = Math.floor(binW) + 'px'; });
      each(stage, '.dtt-binimg', function (b) { b.style.height = Math.floor(Math.min(binW, H * 0.36)) + 'px'; });
    },
    prompt: function (stage, cur, level, s) {
      clearPrompt(stage);
      var drop = correctDrop(stage, cur), drag = stage.querySelector('.dtt-drag'); if (!drop) return;
      if (level === 1) { if (s.sPart === 'point') drop.insertAdjacentHTML('beforeend', POINTER); else drop.classList.add('pr-pulse'); }
      if (level >= 2) {
        if (s.sFull === 'only') others(stage, cur, function (el) { el.classList.add('gone'); });
        else slide(stage, drag, drop, 0.5);
      }
    }
  });

  /* ---------- pattern: what comes next ---------- */
  D.stages.pattern = touchStage({
    draw: function (stage, cur, S) {
      function pic(id) { var it = P.itemById(S.set, id); return ui.img(it && it.images[0], P.labelOf(S.program, it)); }
      stage.innerHTML = '<div class="dtt-pat"><div class="dtt-patrow">' + cur.sequence.map(function (id, i) { return '<span class="dtt-patcell" data-i="' + i + '">' + pic(id) + '</span>'; }).join('') + '<span class="dtt-patcell blank" aria-hidden="true">?</span></div>' +
        '<div class="dtt-field">' + cur.options.map(function (id) { return '<button type="button" class="dtt-pic dtt-drop" data-t="' + esc(id) + '">' + pic(id) + '</button>'; }).join('') + '</div></div>';
      ui.hydrate(stage);
    },
    layout: function (stage) {
      var W = stage.clientWidth - 32, H = stage.clientHeight - 32, cells = stage.querySelectorAll('.dtt-patcell').length, n = stage.querySelectorAll('.dtt-drop').length, gap = 12, best = 0, cols = 1;
      var cell = Math.max(44, Math.min((W - gap * (cells - 1)) / cells, H * 0.3, 200));
      sizeAll(stage, '.dtt-patcell', cell);
      var free = H - cell - 24;
      for (var c = 1; c <= n; c++) { var r = Math.ceil(n / c), t = Math.min((W - gap * (c - 1)) / c, (free - gap * (r - 1)) / r); if (t > best) { best = t; cols = c; } }
      var f = stage.querySelector('.dtt-field'); if (!f) return;
      f.style.gridTemplateColumns = 'repeat(' + cols + ',max-content)'; f.style.gap = gap + 'px';
      sizeAll(stage, '.dtt-drop', Math.max(70, Math.min(best, 300)));
    },
    prompt: function (stage, cur, level, s) {
      clearPrompt(stage);
      each(stage, '.dtt-patcell', function (x) { x.classList.remove('flash'); x.style.animationDelay = ''; });
      var drop = correctDrop(stage, cur); if (!drop) return;
      function flash() { each(stage, '.dtt-patcell:not(.blank)', function (el, i) { el.classList.add('flash'); el.style.animationDelay = (i * 0.35) + 's'; }); }
      if (level === 1) { if (s.patPart === 'flash') flash(); else drop.classList.add('pr-pulse'); }
      if (level >= 2) {
        if (s.patFull === 'glow') flash();
        drop.classList.add('pr-glow');
        others(stage, cur, function (el) { el.classList.add(s.patFull === 'only' ? 'gone' : 'dim'); });
      }
    }
  });
})();
