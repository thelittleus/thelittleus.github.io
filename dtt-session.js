/* Little Us · DTT · the session screen: full screen for the student, a slim panel along the bottom for the teacher.
   The session runs entirely in the browser. It is saved locally after every trial and uploaded when it ends. */
(function () {
  'use strict';
  var D = window.LUDtt, X = LUTools.api, P = D.programs, EN = D.engine, PR = D.prompting, T = D.i18n.T, esc = X.esc, ui = D.ui, U = ui.U;
  var S = null, HOLD_PAUSE = 800, HOLD_PRESS = 450, COLORS = 5;
  var ICON = { eye: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>' };

  function $(id) { return document.getElementById(id); }
  function later(ms, fn) { var t = setTimeout(fn, ms); S.timers.push(t); return t; }
  function curLater(ms, fn) { var t = setTimeout(fn, ms); S.curTimers.push(t); return t; }
  function clearCur() { S.curTimers.forEach(clearTimeout); S.curTimers = []; }
  function clearAll() { S.timers.forEach(clearTimeout); S.timers = []; clearCur(); }
  function stageFor(op) { return D.stages[op]; }
  function levelName(l) { return [T('No prompt', 'Tanpa Prompt'), 'Partial', 'Full'][l]; }
  function kidOf(id) { return (X.S().profiles || []).filter(function (x) { return x.id === id; })[0] || null; }
  function label(id) { return ui.targetName(S.program, S.set, id); }

  function snapshot() {
    D.offline.saveActive(S.uid, { id: S.st.id, st: S.st, program: S.program, set: S.set, saved: S.saved, student: S.student, at: Date.now() }).catch(function () { });
  }

  /* ---------- starting ---------- */
  function start(program) {
    if (S) return;
    var set = D.store.set(program.setId), saved = D.store.progressOf(program.id);
    D.reinforce.audio(); // browsers only allow sound after a tap, and this is that tap
    var st = EN.create({ id: P.uuid(), program: program, progress: saved, now: Date.now() });
    if (!st) { X.toast(T('There are no targets to run yet. Add some in Settings.', 'Belum ada %targets% untuk dijalankan. Tambahkan di Pengaturan.')); return; }
    X.toast(T('Getting the pictures ready...', 'Menyiapkan gambar...'));
    var student = JSON.parse(JSON.stringify(D.store.student(program.studentId)));
    D.store.cacheImages(set, student.photos).then(function (failed) {
      if (failed) { X.toast(T('Some pictures could not load. Check your connection and try again.', 'Beberapa gambar belum bisa dimuat. Periksa koneksi lalu coba lagi.')); return; }
      open(st, JSON.parse(JSON.stringify(program)), JSON.parse(JSON.stringify(set)), JSON.parse(JSON.stringify(saved)), student);
    });
  }
  function open(st, program, set, saved, student) {
    S = { st: st, program: program, set: set, saved: saved, student: student || { themes: [], photos: [] }, uid: D.store.userId(), kid: kidOf(st.studentId), prefs: ui.prefs(), timers: [], curTimers: [], paused: false, waiting: false, ended: false, lock: null, peek: false, flash: false };
    var el = document.createElement('div');
    el.className = 'dtt-session' + (S.prefs.reduce ? ' calm' : ''); el.id = 'dttSession';
    el.innerHTML = '<div class="dtt-stop"><button type="button" class="dtt-pausebtn" id="dttPause"><span class="fill"></span><span>' + esc(T('Hold to pause', 'Tahan untuk jeda')) + '</span></button><div class="dtt-tokens" id="dttTokens" aria-hidden="true"></div><div class="dtt-sdots" id="dttDots" aria-hidden="true"></div></div>' +
      '<div class="dtt-stage" id="dttStage"></div><div class="dtt-teacher" id="dttTeacher"></div>';
    document.body.appendChild(el); document.body.style.overflow = 'hidden';
    holdable($('dttPause'), HOLD_PAUSE, pause);
    $('dttStage').addEventListener('pointerdown', onTap);
    document.addEventListener('keydown', onKey); document.addEventListener('keyup', onKeyUp);
    document.addEventListener('fullscreenchange', onFullscreen); window.addEventListener('resize', layout);
    try { var f = document.documentElement.requestFullscreen && document.documentElement.requestFullscreen(); if (f && f.catch) f.catch(function () { }); } catch (e) { }
    try { if (navigator.wakeLock) navigator.wakeLock.request('screen').then(function (l) { if (S) S.lock = l; else l.release(); }).catch(function () { }); } catch (e) { }
    dots(); snapshot();
    later(500, nextTrial);
  }

  /* ---------- trials ---------- */
  function dots() {
    var d = $('dttDots'); if (!d) return;
    var done = EN.countedDone(S.st), h = '';
    for (var i = 0; i < S.st.total; i++) h += '<i class="' + (i < done ? 'd' : '') + '"></i>';
    d.innerHTML = h;
    var tk = $('dttTokens'), s = S.program.settings;
    if (tk && s.tokenOn) { var out = ''; for (var j = 0; j < s.tokens; j++) out += '<svg viewBox="0 0 60 60" class="' + (j < (S.st.reinf.tokens || 0) ? 'on' : '') + '">' + D.themes.star(30, 30, 26, j < (S.st.reinf.tokens || 0) ? '#FFC94A' : 'none') + '</svg>'; tk.innerHTML = out; }
  }
  function rctx() { return { s: S.program.settings, prefs: S.prefs, kid: S.kid, themes: S.student.themes, photos: S.student.photos }; }
  function layout() { if (!S || !S.st.cur) return; stageFor(S.st.cur.spec.op).layout($('dttStage')); }
  function nextTrial() {
    if (!S || S.ended) return;
    if (S.paused) { S.waiting = true; return; }
    var c = EN.next(S.st, S.program, S.set, Date.now());
    if (!c) return finish(false);
    var stage = $('dttStage'), st = stageFor(c.spec.op);
    S.peek = false; S.flash = false;
    $('dttSession').style.setProperty('--dtt-cardc', 'var(--dtt-c' + (1 + c.no % COLORS) + ')');
    st.draw(stage, c, S); st.layout(stage);
    if (S.prefs.labelView === 'flash') { S.flash = true; curLater(2000, function () { S.flash = false; refreshLabel(); }); }
    teacher(); snapshot();
    if (c.startLevel > 0) curLater(350, function () { prompt(c.startLevel); });
    if (c.delay) curLater(c.delay * 1000, function () { prompt(PR.top(S.program.settings)); });
    if (st.touch) armWindow(c);
  }
  function armWindow(c) {
    curLater(S.program.settings.resp * 1000, function () {
      if (!S || S.st.cur !== c || c.locked || S.paused) return;
      var r = EN.onTimeout(S.st, S.program);
      if (r.prompt != null) { prompt(r.prompt); armWindow(c); } else if (r.noResponse) answer({ noResponse: true });
    });
  }
  function prompt(level) {
    if (!S || !EN.applyPrompt(S.st, S.program, level)) return;
    var c = S.st.cur;
    stageFor(c.spec.op).prompt($('dttStage'), c, level, S.program.settings, S);
    teacher();
  }
  function onTap(e) {
    if (!S || S.paused || !S.st.cur || S.st.cur.locked) return;
    var st = stageFor(S.st.cur.spec.op); if (!st.touch) return;
    var drag = e.target.closest('.dtt-drag');
    if (drag) return startDrag(e, drag, st);
    var b = st.tapped(e); if (!b) return;
    answer({ correct: st.isCorrect(b, S.st.cur) });
  }
  // dropped on a card it counts as an answer; dropped anywhere else the card goes back and the trial carries on
  function startDrag(e, drag, st) {
    e.preventDefault();
    var c = S.st.cur, ox = Number(drag.dataset.ox || 0), oy = Number(drag.dataset.oy || 0), x0 = e.clientX, y0 = e.clientY, id = e.pointerId;
    try { drag.setPointerCapture(id); } catch (err) { }
    drag.classList.add('dragging');
    function move(ev) { drag.style.transform = 'translate(' + (ox + ev.clientX - x0) + 'px,' + (oy + ev.clientY - y0) + 'px)'; }
    function up() {
      drag.removeEventListener('pointermove', move); drag.removeEventListener('pointerup', up); drag.removeEventListener('pointercancel', cancel);
      drag.classList.remove('dragging');
      if (!S || S.st.cur !== c || c.locked || S.paused) return;
      var a = drag.getBoundingClientRect(), cx = a.left + a.width / 2, cy = a.top + a.height / 2, hit = null;
      Array.prototype.forEach.call(document.querySelectorAll('#dttStage .dtt-drop:not(.gone)'), function (el) { var r = el.getBoundingClientRect(); if (cx >= r.left && cx <= r.right && cy >= r.top && cy <= r.bottom) hit = el; });
      if (hit) return answer({ correct: st.isCorrect(hit, c) });
      drag.style.transform = ox || oy ? 'translate(' + ox + 'px,' + oy + 'px)' : '';
    }
    function cancel() { drag.removeEventListener('pointermove', move); drag.removeEventListener('pointerup', up); drag.removeEventListener('pointercancel', cancel); drag.classList.remove('dragging'); drag.style.transform = ox || oy ? 'translate(' + ox + 'px,' + oy + 'px)' : ''; }
    drag.addEventListener('pointermove', move); drag.addEventListener('pointerup', up); drag.addEventListener('pointercancel', cancel);
  }
  function answer(a) {
    if (!S || !S.st.cur) return;
    clearCur();
    var c = S.st.cur, r = EN.respond(S.st, S.program, a, Date.now()); if (!r) return;
    stageFor(c.spec.op).showResult($('dttStage'), c, r.correct);
    dots(); teacher(); snapshot();
    var host = $('dttSession');
    // an error is followed by a short neutral pause with no sound
    if (!r.correct) { later(900, consequenceDone); return; }
    later(350, function () {
      if (!S) return;
      S.boardDue = r.boardFull;
      S.timers.push(r.full ? D.reinforce.full(host, rctx(), consequenceDone) : D.reinforce.brief(host, rctx(), consequenceDone));
    });
  }
  function consequenceDone() {
    if (!S || S.ended) return;
    $('dttStage').innerHTML = ''; S.st.cur = null; teacher();
    if (S.boardDue) {
      S.boardDue = false;
      S.timers.push(D.reinforce.boardReward($('dttSession'), rctx(), function (wantsBreak) {
        if (!S || S.ended) return;
        D.reinforcement.clearBoard(S.st.reinf); dots(); snapshot();
        if (wantsBreak) funBreak(); else later(300, nextTrial);
      }));
      return;
    }
    if (EN.takeBreak(S.st) && D.reinforcement.enabledGames(S.program.settings, D.defaults.GAMES).length) { later(500, funBreak); return; }
    later(Math.max(200, S.program.settings.iti * 1000), nextTrial);
  }
  function funBreak() {
    if (!S || S.ended) return;
    D.games.show($('dttSession'), rctx(), function () { if (S && !S.ended) later(Math.max(300, S.program.settings.iti * 1000), nextTrial); });
  }

  /* ---------- teacher panel ---------- */
  function labelVisible(c) { var m = S.prefs.labelView; return m === 'always' || m === 'small' || S.peek || S.flash || c.locked; }
  function firstSound(word) { var w = String(word || ''), m = /^[^aeiou\s]+/i.exec(w); return m ? m[0] : w.charAt(0); }
  // the reminder for the teacher. The app never speaks, so every spoken prompt appears here.
  function sayText(c, show) {
    var s = S.program.settings, op = c.spec.op, word = label(c.spec.target), name = show ? word : '•••', say = T('Say: ', 'Ucapkan: ');
    if (op === 'tact') {
      if (c.level >= 2) return T('Say the whole word: ', 'Ucapkan seluruh kata: ') + word;
      if (c.level === 1 && s.tPart === 'first') return T('Give the first sound: ', 'Beri bunyi awal: ') + firstSound(word) + '...';
      if (c.level === 1 && s.tPart === 'fill') return say + (s.tFill || '').replace(/\{label\}/g, '...');
      if (c.level === 1) return T('The label is showing. ', 'Label sedang tampil. ') + say + (s.tHint || '');
      return say + (s.tHint || '');
    }
    var hint = { listener: s.sdHint, matching: s.mHint, sorting: s.sHint, pattern: s.patHint }[op] || '';
    return say + hint.replace(/\{label\}/g, name);
  }
  function refreshLabel() {
    var c = S && S.st.cur, w = $('dttLabel'), y = $('dttSay'); if (!c || !w) return;
    var v = labelVisible(c); w.textContent = v ? label(c.spec.target) : '•••'; w.classList.toggle('masked', !v);
    if (y) y.textContent = sayText(c, v);
  }
  function resultStrip() {
    return S.st.trials.slice(-8).map(function (t) {
      var ok = t.result === 'independent', pr = t.result === 'prompted';
      return '<span class="dtt-res ' + (ok ? 'i' : pr ? 'p' : 'e') + '" title="' + esc(label(t.target)) + '">' + (ok ? '+' : pr ? 'P' : '−') + '</span>';
    }).join('');
  }
  function teacher() {
    var el = $('dttTeacher'); if (!el || !S) return;
    var c = S.st.cur, done = EN.countedDone(S.st), total = S.st.total, chain = PR.chain(S.program.settings), no = Math.min(done + 1, total);
    var count = '<span class="dtt-tcount">' + esc(T('Trial ' + no + ' of ' + total, 'Trial ' + no + ' dari ' + total)) + '</span>', strip = '<span class="dtt-strip">' + resultStrip() + '</span>';
    if (!c) { el.innerHTML = '<div class="dtt-tinfo">' + count + strip + '</div>'; return; }
    var kind = { maintenance: T('Maintenance', '%maintenance%'), 'ec-correction': T('Error correction: correction', 'Error correction: koreksi'), 'ec-distractor': T('Error correction: distractor', 'Error correction: distraktor'), 'ec-transfer': T('Error correction: transfer', 'Error correction: transfer') }[c.spec.kind];
    var mode = S.prefs.labelView, vis = labelVisible(c), lk = c.locked;
    el.innerHTML = '<div class="dtt-tinfo' + (mode === 'small' ? ' tiny' : '') + '">' + count +
      '<b class="dtt-tlabel' + (vis ? '' : ' masked') + '" id="dttLabel">' + esc(vis ? label(c.spec.target) : '•••') + '</b>' +
      ((mode === 'hold' || mode === 'flash') && !lk ? '<button type="button" class="dtt-peek" id="dttPeek" aria-label="' + esc(T('Hold to see the label', 'Tahan untuk melihat label')) + '">' + ICON.eye + '<kbd>W</kbd></button>' : '') +
      (kind ? '<span class="dtt-chip">' + esc(kind) + '</span>' : '') + (c.spec.retention ? '<span class="dtt-chip">' + esc(T('Retention check', 'Pemeriksaan retensi')) + '</span>' : '') +
      '<span class="dtt-chip' + (c.level ? ' warn' : '') + '">' + esc(levelName(c.level)) + '</span>' +
      '<span class="dtt-say" id="dttSay">' + esc(sayText(c, vis)) + '</span>' + strip + '</div>' +
      '<div class="dtt-tbtns">' + (chain.indexOf(1) >= 0 ? btn('partial', 'Partial', 'P', lk || c.level >= 1) : '') + (chain.indexOf(2) >= 0 ? btn('full', 'Full', 'F', lk || c.level >= 2) : '') +
      (stageFor(c.spec.op).touch ? btn('nr', T('No response', 'Tidak ada respons'), 'N', lk) : btn('bad', T('Incorrect', 'Salah'), '2', lk) + btn('ok', T('Correct', 'Benar'), '1', lk)) + '</div>';
    Array.prototype.forEach.call(el.querySelectorAll('.dtt-tbtn'), function (b) {
      if (S.prefs.hold) holdable(b, HOLD_PRESS, function () { command(b.dataset.cmd); }); else b.addEventListener('click', function () { command(b.dataset.cmd); });
    });
    var pk = $('dttPeek');
    if (pk) {
      pk.addEventListener('pointerdown', function (e) { e.preventDefault(); S.peek = true; refreshLabel(); });
      ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (ev) { pk.addEventListener(ev, function () { if (S) { S.peek = false; refreshLabel(); } }); });
      pk.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    }
  }
  function btn(cmd, name, key, off) { return '<button type="button" class="dtt-tbtn ' + cmd + '" data-cmd="' + cmd + '"' + (off ? ' disabled' : '') + '><span class="fill"></span><span>' + esc(name) + '</span><kbd>' + key + '</kbd></button>'; }
  function command(cmd) {
    if (!S || !S.st.cur || S.st.cur.locked || S.paused) return;
    if (cmd === 'partial') prompt(1);
    if (cmd === 'full') prompt(2);
    var touch = stageFor(S.st.cur.spec.op).touch;
    if (cmd === 'nr') answer(touch ? { noResponse: true } : { correct: false });
    if (cmd === 'ok' && !touch) answer({ correct: true });
    if (cmd === 'bad' && !touch) answer({ correct: false });
  }
  // a hold fires after ms; on a keyboard, Enter or Space does the same straight away
  function holdable(b, ms, fn) {
    var t = null;
    function stop() { b.classList.remove('holding'); if (t) { clearTimeout(t); t = null; } }
    b.addEventListener('pointerdown', function (e) { if (b.disabled) return; e.preventDefault(); b.classList.add('holding'); b.style.setProperty('--hold', ms + 'ms'); t = setTimeout(function () { stop(); fn(); }, ms); });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (ev) { b.addEventListener(ev, stop); });
    b.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); fn(); } });
  }
  function onKey(e) {
    if (!S || S.ended) return;
    if (D.games.isActive()) { if (e.key === 'Escape' || e.key.toLowerCase() === 's') { e.preventDefault(); D.games.skip(); } return; }
    if ($('dttBoard')) return;
    if (e.key === 'Escape') { e.preventDefault(); if (S.paused) resume(); else pause(); return; }
    if (S.paused || e.ctrlKey || e.metaKey || e.altKey) return;
    var k = e.key.toLowerCase();
    if (k === 'w') { e.preventDefault(); if (S.st.cur && !S.peek) { S.peek = true; refreshLabel(); } return; }
    var map = { p: 'partial', f: 'full', n: 'nr', '1': 'ok', '2': 'bad' };
    if (map[k]) { e.preventDefault(); command(map[k]); }
  }
  function onKeyUp(e) { if (S && e.key.toLowerCase() === 'w') { S.peek = false; refreshLabel(); } }
  // leaving full screen with Esc gives no key event in some browsers
  function onFullscreen() { if (S && !S.ended && !S.paused && !document.fullscreenElement) pause(); }

  /* ---------- pausing ---------- */
  function pause() {
    if (!S || S.paused || S.ended) return;
    S.paused = true; clearCur();
    if (S.st.cur && !S.st.cur.locked) { EN.resume(S.st); $('dttStage').innerHTML = ''; teacher(); snapshot(); }
    var n = EN.countedDone(S.st), p = document.createElement('div');
    p.className = 'dtt-paused'; p.id = 'dttPaused';
    p.innerHTML = '<div class="tl-panel pad" role="dialog" aria-modal="true"><h2 class="tl-h2">' + esc(T('Session paused', '%session% dijeda')) + '</h2><p class="tl-p">' + esc(T(n + ' of ' + S.st.total + ' trials done. Completed trials are kept if you end now.', n + ' dari ' + S.st.total + ' trial selesai. Trial yang selesai tetap tersimpan jika diakhiri sekarang.')) + '</p>' +
      '<button type="button" class="tl-btn primary lg" id="dttResume">' + esc(T('Resume', 'Lanjutkan')) + '</button><button type="button" class="tl-btn outline" id="dttEnd">' + esc(T('End session', 'Akhiri %session%')) + '</button></div>';
    $('dttSession').appendChild(p);
    $('dttResume').onclick = resume; $('dttEnd').onclick = function () { finish(true); };
    $('dttResume').focus();
  }
  function resume() {
    if (!S || !S.paused) return;
    S.paused = false;
    var p = $('dttPaused'); if (p) p.remove();
    if (S.waiting || !S.st.cur) { S.waiting = false; later(300, nextTrial); }
  }

  /* ---------- finishing ---------- */
  function finish(early) {
    if (!S || S.ended) return;
    S.ended = true; clearAll();
    var p = $('dttPaused'); if (p) p.remove();
    if (D.games.isActive()) D.games.skip();
    document.querySelectorAll('#dttSession .dtt-cele,#dttSession .dtt-brief,#dttSession #dttBoard').forEach(function (x) { x.remove(); });
    var out = EN.finish(S.st, S.program, S.saved, Date.now(), early);
    D.offline.clearActive(S.uid).catch(function () { });
    if (!out) { close(); return; } // nothing was done, so there is nothing to save
    var saving = D.store.recordSession(S.program.id, out).catch(function () { });
    $('dttStage').innerHTML = ''; $('dttTeacher').innerHTML = ''; $('dttDots').innerHTML = '';
    var pb = $('dttPause'); if (pb) pb.style.display = 'none';
    function show() { D.summary.show($('dttSession'), S.program, S.set, S.kid, out, saving, api); }
    if (early) return show();
    // a warm ending for the student before the numbers appear for the teacher
    D.reinforce.full($('dttSession'), rctx(), show, { big: true, text: T('All done, ' + ((S.kid && S.kid.name) || 'friend') + '!', 'Selesai, ' + ((S.kid && S.kid.name) || 'teman') + '!') });
  }
  function close() {
    if (!S) return;
    clearAll();
    document.removeEventListener('keydown', onKey); document.removeEventListener('keyup', onKeyUp);
    document.removeEventListener('fullscreenchange', onFullscreen); window.removeEventListener('resize', layout);
    if (S.lock) { try { S.lock.release(); } catch (e) { } }
    S = null;
    var el = $('dttSession'); if (el) el.remove();
    document.body.style.overflow = '';
    try { if (document.fullscreenElement) { var f = document.exitFullscreen(); if (f && f.catch) f.catch(function () { }); } } catch (e) { }
    D.offline.clearImages().catch(function () { });
    ui.render();
  }

  /* ---------- picking up after a reload ---------- */
  function checkResume() {
    var uid = D.store.userId(); if (!uid || S) return Promise.resolve();
    return D.offline.getActive(uid).then(function (snap) { if (snap && !S) { U.resume = snap; ui.render(); } }).catch(function () { });
  }
  function resumeFrom(snap) {
    U.resume = null;
    open(EN.resume(snap.st), snap.program, snap.set, snap.saved, snap.student);
  }
  function discard() { var uid = D.store.userId(); U.resume = null; D.offline.clearActive(uid).catch(function () { }); D.offline.clearImages().catch(function () { }); ui.render(); }

  var api = D.session = { start: start, close: close, checkResume: checkResume, resumeFrom: resumeFrom, discard: discard, running: function () { return !!S; } };
})();
