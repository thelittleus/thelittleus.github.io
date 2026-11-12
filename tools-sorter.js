/* Little Us · Problem Sorter
   Children aged 8 to 14 learn that the size of a reaction should match the size of the problem. Three activities:
   sorting problems by size, sorting reactions by size, and a seesaw that weighs a problem against a reaction.
   The guide is one of the shared Conversation Starters characters (tools-talk.js, loaded first on this page).
   Settings and the grown-up's own cards (Plus) are kept with the child's other tool settings (X.D().sorter,
   saved by X.save(), and to the account when signed in). What the child sorts is not kept after a round.
   Every word the screen shows lives in TXT, DEFS and DECKS (English only for now: add an "id" entry to each later).
   Loaded only when /tools/problem-sorter is opened. */
(function () {
  'use strict';
  if (!window.LUTools || !LUTools.register || window.LUSorter) return;
  var X = LUTools.api, esc = X.esc;
  var K = '#2B2A35', SIZES = ['small', 'medium', 'big'];

  /* ===================== words ===================== */
  var TXT = {
    en: {
      title: 'Problem Sorter', settings: 'Tool settings', hi: 'Hi! Pick an activity.',
      sizesBtn: 'What do the sizes mean?', addBtn: 'Add your own cards', order: 'Suggested order', start: 'Start',
      mode1: 'Size of Problems', mode2: 'Size of Reactions', mode3: 'Problem and Reaction Together',
      feelings: 'Big feelings are okay. In these activities we are sizing what we do and say, not whether a feeling is allowed.',
      small: 'Small', medium: 'Medium', big: 'Big', smallR: 'Small reaction', mediumR: 'Medium reaction', bigR: 'Big reaction',
      cardOf: 'Card {0} of {1}', backStart: 'Back to start', problem: 'Problem', reaction: 'Reaction', yourCard: 'Your card',
      askP: 'How big is this problem?', askR: 'How big is this reaction?', dragHint: 'Drag the card to a size, or tap a size.',
      keys: 'Keyboard: press 1, 2 or 3.', youChose: 'You chose', nextCard: 'Next card', finish: 'Finish',
      cardAria: '{0} card: {1}', zoneAria: '{0}. {1}', zoneCount: '{0} so far.',
      // messages after a sort (the grown-up's exact wording, split around the card's reason)
      matchP: 'Nice match. Most people sort this as {0}.', matchR: 'Nice match. This is a {0} reaction.',
      differ: 'Some people see this as {0}.', differP: 'It is okay to see it a different way. This could be a good one to talk about with a grown-up.',
      differR: 'Reactions can look different to different people. This could be a good one to talk about with a grown-up.',
      safeP: 'This one is a Big problem because someone could be hurt or in danger. Big problems need a grown-up right away.',
      safeR: 'A reaction that could hurt someone or break things is a Big reaction.',
      helpBig: 'Yes, this is a Big reaction. When something is truly unsafe, a big, fast reaction like this is the right one.',
      helpLow: 'This is a Big reaction because it is loud and fast, and it is used when someone needs help right now.',
      open: 'Where would you put this one, and why? Talk about it with a grown-up.',
      // seesaw
      ssPick: 'Pick a reaction for this problem.', ssBal: 'Balanced! The reaction is the same size as the problem.',
      ssBig: 'The reaction is bigger than the problem. Want to try a smaller one?',
      ssSmall: 'The reaction is smaller than the problem. Some problems need a stronger reaction.',
      ssSafe: 'This problem could be unsafe. It needs a big, quick reaction, like getting a grown-up right away.',
      oBal: 'Balanced', oBig: 'Reaction is bigger', oSmall: 'Reaction is smaller', tryAnother: 'Try another reaction', onSeesaw: 'On the seesaw',
      ssAria: 'Seesaw. Problem: {0}', ssAriaR: 'Reaction: {0}', ssNoR: 'No reaction yet.', hand: 'Reaction cards', pickR: 'Pick a reaction',
      // summary
      roundDone: 'Round done', card1: '{0} card', cardN: '{0} cards', talkH: 'Cards to talk about', noTalk: 'No cards to talk about this round.',
      chose: 'You chose {0}', usual: 'Usually {0}', firstPick: 'First pick: {0}', again: 'Play another round',
      // sizes sheet
      defsP: 'Size of a problem', defsR: 'Size of a reaction',
      reactIs: 'A reaction is what a person does, says or shows with their body when a problem happens. It is not a feeling, and it is not good or bad.',
      reactBased: 'Reaction size is based on how loud, how big in the body, how long it lasts, and whether it affects other people or safety.',
      // guide picker
      pickH: 'Choose your guide', animals: 'Animals', figures: 'Fun figures', surprise: 'Surprise me', done: 'Done',
      // settings
      sGuide: 'Guide character', change: 'Change', sProblem: 'Problem style', sReaction: 'Reaction style', sPer: 'Cards per round',
      sDeck: 'Cards to use', dStarter: 'Starter deck', dMine: 'My cards', dBoth: 'Both', sMeanings: 'Show size meanings beside the zones',
      plusLine: 'Add your own cards with Little Us Plus.', plus: 'Plus',
      // your own cards
      typeP: 'Problem card', typeR: 'Reaction card', cardType: 'Card type', labP: 'Problem', labR: 'Reaction',
      phP: 'My friend lost the book I lent them.', phR: 'I count to five in my head.', firstPerson: 'Write it starting with “I”.',
      needText: 'Write the card first.', needI: 'Start the reaction with “I”.', usualSize: 'Usual size', optional: 'optional', notSet: 'Not set',
      reasonL: 'Reason', phReasonP: 'I need to tell them how I feel.', phReasonR: 'It is quiet and only I know.',
      addCard: 'Add card', saveCard: 'Save card', cancel: 'Cancel', edit: 'Edit', remove: 'Remove', removeSure: 'Tap again to remove',
      yourCards: 'Your cards ({0})', noSizeNote: 'Cards without a usual size are skipped in Problem and Reaction Together.', noUsual: 'No usual size',
      empty: 'There are no cards for this activity yet.',
      // style names and their objects (also read out by screen readers)
      rocks: 'Rocks', animalsS: 'Animals', bags: 'Bags', bubbles: 'Speech bubbles', weather: 'Weather', waves: 'Waves',
      o_rocks: ['pebble', 'rock', 'boulder'], o_animals: ['mouse', 'sheep', 'hippo'], o_bags: ['pencil pouch', 'school backpack', 'large suitcase'],
      o_bubbles: ['whisper bubble', 'talking bubble', 'shout bubble'], o_weather: ['light breeze with a small cloud', 'rain cloud', 'thunderstorm cloud'], o_waves: ['ripple', 'wave', 'large crashing wave']
    }
  };
  function T(k) {
    var tb = TXT[X.L()] || TXT.en, s = tb[k] != null ? tb[k] : TXT.en[k], a = arguments;
    if (s == null) return k;
    return a.length > 1 ? String(s).replace(/\{(\d)\}/g, function (m, i) { return a[+i + 1]; }) : s;
  }
  function join() { return [].slice.call(arguments).filter(Boolean).join(' '); }
  function sizeWord(sz) { return T(sz); }
  function zoneWord(kind, sz) { return kind === 'reaction' ? T(sz + 'R') : T(sz); }

  // size meanings: "def" is the full wording, "short" its first sentence(s), shown beside the zones
  var DEFS = {
    en: {
      problem: {
        small: ['I can fix it myself or let it go.', 'I can fix it myself or let it go. Nobody is hurt. I will probably forget about it by tomorrow.'],
        medium: ['I can’t fix it on my own in a minute.', 'I can’t fix it on my own in a minute. I need to tell someone, ask for help, or spend a few days sorting it out. Nobody is in danger.'],
        big: ['Someone is hurt or in danger, or I need a grown-up right now.', 'Someone is hurt or in danger, or I need a grown-up right now.']
      },
      reaction: {
        small: ['Quiet and quick.', 'Quiet and quick. Mostly in my head, or a small movement, or just a few words. Other people may not even notice.'],
        medium: ['People can tell I am upset.', 'People can tell I am upset. My voice, face or body shows it, and I may need a break or some help.'],
        big: ['Very strong. Loud, fast, whole body, or completely shutting down.', 'Very strong. Loud, fast, whole body, or completely shutting down. It can affect safety, or it is a fast, strong action to get help in an emergency.']
      }
    }
  };
  function def(kind, sz, full) { var d = (DEFS[X.L()] || DEFS.en)[kind][sz]; return d[full ? 1 : 0]; }

  /* ===================== the starter decks =====================
     [usual size, card, reason, mark]. S = safety card (always Big), H = a helpful big reaction (always Big).
     The marks are never shown on screen. */
  function deck(kind, rows) { return rows.map(function (r, i) { return { id: kind.charAt(0) + (i + 1), kind: kind, size: r[0], text: r[1], reason: r[2], safety: r[3] === 'S', h: r[3] === 'H' }; }); }
  var DECKS = {
    en: {
      problem: deck('problem', [
        ['small', 'My pencil broke in the middle of class.', 'I can sharpen it or borrow one.'],
        ['small', 'I dropped my snack on the floor.', 'It is annoying, but I can get another or go without.'],
        ['small', 'It started raining on the day I wanted to play outside.', 'I can’t change the weather and I can do something else.'],
        ['small', 'I got a seat in class that I did not want.', 'It is only for a short time.'],
        ['small', 'I lost a card game with my family.', 'A game ends, and I can play again.'],
        ['small', 'My shoelace came undone.', 'I can tie it in a moment.'],
        ['small', 'Someone cut in front of me in the canteen line.', 'It is annoying, but it won’t matter later.'],
        ['small', 'I forgot my water bottle at home.', 'I can ask for water.'],
        ['small', 'I made a small spelling mistake on my worksheet.', 'I can fix it.'],
        ['small', 'The show I wanted to watch was not on.', 'I can watch something else.'],
        ['medium', 'I forgot to do my homework and it is due today.', 'I need to tell my teacher and ask what to do.'],
        ['medium', 'A friend said they did not want to sit with me at lunch.', 'It hurts and I may need to talk about it.'],
        ['medium', 'I failed a test I studied hard for.', 'It matters to me, and I can ask my teacher how to do better next time.'],
        ['medium', 'My brother broke something that belongs to me.', 'I need to talk to him or ask a grown-up to help sort it out.'],
        ['medium', 'I was left out of a group chat.', 'It hurts and may need a conversation.'],
        ['medium', 'I had a big argument with my best friend.', 'We will probably need to talk it through.'],
        ['medium', 'I lost my school jacket.', 'I need help looking for it or telling someone.'],
        ['medium', 'I have to present in front of the class tomorrow and I feel very nervous.', 'I can practise with someone before tomorrow.'],
        ['medium', 'Someone in my class keeps making jokes about me and I do not like it.', 'It keeps happening, so I should tell someone who can help.'],
        ['medium', 'I accidentally broke a classmate’s belongings.', 'I should tell the truth and ask for help to fix it.'],
        ['big', 'Someone hurt me on purpose and it really hurt.', 'Someone is hurting me, so I need a grown-up right away.', 'S'],
        ['big', 'I am lost in a busy place and I cannot find my family.', 'I am lost and could get hurt, so I need to find a grown-up right away.', 'S'],
        ['big', 'I smell smoke and the fire alarm is ringing.', 'Smoke and an alarm can mean a fire, so I need to get out and find a grown-up right away.', 'S'],
        ['big', 'Someone I do not know online keeps asking me to send photos or tell them where I live.', 'Someone I don’t know could use my photos or address to hurt me, so I need to tell a grown-up right away.', 'S'],
        ['big', 'A friend fell and is badly hurt and cannot get up.', 'My friend could be badly hurt, so I need to get a grown-up right away.', 'S'],
        ['big', 'An adult or older kid asks me to keep a secret that makes me feel scared or uncomfortable.', 'A secret that makes me feel scared is not safe to keep, so I need to tell a grown-up.', 'S'],
        ['big', 'A group of older kids is threatening me.', 'I could get hurt, so I need to tell a grown-up right away.', 'S'],
        ['big', 'A stranger is trying to take me somewhere.', 'A stranger taking me somewhere is not safe, so I need to get away and tell a grown-up right away.', 'S'],
        ['big', 'I feel very sick and dizzy and I am alone.', 'I could be really sick and I am alone, so I need to get a grown-up right away.', 'S'],
        ['big', 'I am being bullied every day and it is not stopping.', 'It is serious and it keeps happening, so I need to tell a grown-up.']
      ]),
      reaction: deck('reaction', [
        ['small', 'I take a slow breath and keep going.', 'It is quiet and quick, and only I know.'],
        ['small', 'I sigh and say “oh well”.', 'It is just a few words and a sigh.'],
        ['small', 'I shrug and move on.', 'It is a tiny movement and over fast.'],
        ['small', 'I quietly fix it myself.', 'It is quiet, and I am solving it myself.'],
        ['small', 'I think “that is annoying” in my head and let it go.', 'It stays in my head and nobody notices.'],
        ['small', 'I make a small face and then carry on.', 'It is a small look that is over quickly.'],
        ['small', 'I tell myself “it’s okay”.', 'It is quiet and only I hear it.'],
        ['small', 'I stay quiet and try again.', 'It is calm and I keep going.'],
        ['small', 'I give a small laugh and keep going.', 'It is small and over fast.'],
        ['small', 'I tell myself it is a small thing and do something else.', 'It stays calm and I move on quickly.'],
        ['medium', 'I ask a friend or teacher for help.', 'Someone else gets involved because I asked.'],
        ['medium', 'I tell someone calmly that I am upset.', 'People can tell I am upset because I say it.'],
        ['medium', 'I go to a quiet spot for a few minutes.', 'I leave for a few minutes to settle down.'],
        ['medium', 'I frown, huff and use a louder voice.', 'People can hear and see that I am upset.'],
        ['medium', 'I cry a little and then talk about it.', 'People can see I am upset, and I can still talk.'],
        ['medium', 'I stomp my feet and walk away.', 'My body shows it and other people notice.'],
        ['medium', 'I stay upset for a while and do not want to join in.', 'It lasts a while and changes what I do.'],
        ['medium', 'I complain to the people near me.', 'Other people hear about it.'],
        ['medium', 'I ask a grown-up to help me work out what to do.', 'I ask someone else to help me think.'],
        ['medium', 'I say I need a break.', 'I tell people I need time away from what is happening.'],
        ['big', 'I scream loudly.', 'It is very loud.'],
        ['big', 'I throw or break something.', 'Someone could get hurt or something could break.', 'S'],
        ['big', 'I hit, kick or push someone.', 'Someone could get hurt.', 'S'],
        ['big', 'I run out of the room.', 'My whole body moves fast and I leave.'],
        ['big', 'I cry so hard that I cannot stop or talk.', 'It is so strong that I cannot talk or stop.'],
        ['big', 'I shut down completely and will not talk to anyone.', 'It is so strong that I stop talking to everyone.'],
        ['big', 'I shout hurtful things at someone.', 'It is loud and it can hurt someone’s feelings.'],
        ['big', 'I bang the table and yell.', 'It is loud and my whole body is involved.'],
        ['big', 'I shout for help and run straight to a grown-up.', 'It is loud and fast because someone needs help right now.', 'H'],
        ['big', 'I call out loudly until a grown-up hears me.', 'It is loud on purpose so a grown-up will hear and come.', 'H']
      ])
    }
  };
  function starter(kind) { return (DECKS[X.L()] || DECKS.en)[kind]; }

  /* ===================== settings (kept per child with the other tools) ===================== */
  var PSTYLES = ['rocks', 'animals', 'bags'], RSTYLES = ['bubbles', 'weather', 'waves'];
  var DEF_CFG = { guide: '', ps: 'rocks', rs: 'bubbles', per: 10, deck: 'starter', meanings: true };
  function cfg() {
    var d = X.D(); if (!d.sorter || typeof d.sorter !== 'object') d.sorter = {};
    var c = d.sorter;
    Object.keys(DEF_CFG).forEach(function (k) { if (c[k] === undefined) c[k] = DEF_CFG[k]; });
    if (!Array.isArray(c.cards)) c.cards = [];
    if (PSTYLES.indexOf(c.ps) < 0) c.ps = 'rocks';
    if (RSTYLES.indexOf(c.rs) < 0) c.rs = 'bubbles';
    if ([5, 10, 15].indexOf(c.per) < 0) c.per = 10;
    return c;
  }
  function keepCfg() { try { X.save(); } catch (e) { } }

  /* ===================== Plus: adding your own cards ===================== */
  var FEAT = 'sorter.cards';
  function acc() { return window.LUAcc || null; }
  if (acc() && acc().addFeatures) acc().addFeatures([{ id: FEAT, tool: 'sorter', name_en: 'Adding your own cards', name_id: 'Adding your own cards', access: 'plus', sort: 60 }]);
  function plusOK() { var a = acc(); return !a || !a.allowed || a.allowed(FEAT); }
  function plusHidden() { var a = acc(); return !!(a && a.access && a.access(FEAT) === 'hidden'); }
  var LOCK = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';
  function lockPill() { return plusOK() ? '' : '<span class="ps-lock">' + LOCK + esc(T('plus')) + '</span>'; }
  function showLock() { var a = acc(); if (a && a.lockSheet) a.lockSheet(FEAT, objSVG(cfg().ps, 'medium'), '', T('plusLine')); }
  function deckMode() { return plusOK() ? cfg().deck : 'starter'; }
  function mine(kind) { return plusOK() ? cfg().cards.filter(function (c) { return c.kind === kind && c.text; }) : []; }
  function pool(kind) {
    var dm = deckMode();
    return (dm === 'mine' ? [] : starter(kind)).concat(dm === 'starter' ? [] : mine(kind));
  }

  /* ===================== guide characters (shared with Conversation Starters) ===================== */
  function CH() { return window.LUTalk && LUTalk.chars; }
  function guideId() { var g = cfg().guide, c = CH(); return g && c && c.has(g) ? g : 'fox'; }
  function charSVG(id, mood, live) { return window.LUTalk ? LUTalk.charSVG(id, mood, !!live && !reduced()) : ''; }
  function guideSVG(mood, live) { return charSVG(guideId(), mood, live); }
  // a character drawn inside a bigger scene
  function nestChar(id, mood, x, y, w, live) { return charSVG(id, mood, live).replace(/^<svg[^>]*>/, '<svg x="' + x + '" y="' + y + '" width="' + w + '" height="' + (w * 1.28).toFixed(1) + '" viewBox="0 -14 100 128" overflow="visible">'); }
  function charName(id) { var c = CH(); return c ? c.name(id) : id; }

  function reduced() {
    try { return matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('tl-still') || !!((X.S() || {}).settings || {}).reduce; } catch (e) { return false; }
  }

  /* ===================== illustrations =====================
     Drawn flat, then LUArt.fx adds the shared three-tone shading (light from the top left) and the heavier outer line,
     the same treatment as the other Little Us art. Each object sits in a 160 x 110 box on a ground line at y = 100. */
  function P(d, fill, extra) { return '<path d="' + d + '" fill="' + (fill || 'none') + '"' + (extra || '') + '/>'; }
  function O(cx, cy, r, fill, extra) { return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + (fill || 'none') + '"' + (extra || '') + '/>'; }
  function E(cx, cy, rx, ry, fill, extra) { return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="' + (fill || 'none') + '"' + (extra || '') + '/>'; }
  function R(x, y, w, h, rx, fill, extra) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + (rx || 0) + '" fill="' + (fill || 'none') + '"' + (extra || '') + '/>'; }
  function G(t, inner, cls) { return '<g' + (t ? ' transform="' + t + '"' : '') + (cls ? ' class="' + cls + '"' : '') + '>' + inner + '</g>'; }
  var NS = ' stroke="none"';
  function ln(col, w) { return ' stroke="' + (col || K) + '" stroke-width="' + (w || 1.6) + '"'; }
  function HL(d, w) { return '<path d="' + d + '" fill="none" stroke="#fff" stroke-width="' + (w || 2.6) + '" opacity=".9"/>'; }
  function SH(rx, cx, cy) { return E(cx || 80, cy || 101, rx, 4, K, NS + ' opacity=".13"'); }
  function TUBE(d, w, col) { return P(d, 'none', ln(K, w + 3)) + P(d, 'none', ln(col, w)); }
  function fx(inner, w) {
    var F = window.LUArt && LUArt.fx;
    return '<g fill="none" stroke="' + K + '" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">' + (F ? F.outline(inner, w || 5.5) + F.enrich(inner) : inner) + '</g>';
  }
  var uidN = 0;
  function uid(p) { return (p || 'ps') + (++uidN).toString(36) + Math.random().toString(36).slice(2, 5); }

  function starburst(cx, cy, rx, ry, rx2, ry2, n) {
    var d = '';
    for (var i = 0; i < n * 2; i++) {
      var a = -Math.PI / 2 + i * Math.PI / n, o = i % 2 === 0;
      d += (i ? 'L' : 'M') + (cx + Math.cos(a) * (o ? rx : rx2)).toFixed(1) + ' ' + (cy + Math.sin(a) * (o ? ry : ry2)).toFixed(1);
    }
    return d + 'Z';
  }
  var ART = {
    rocks: {
      small: function () { return SH(22) + P('M62 99C60 92 66 86 77 85C89 84 98 89 97 95C96 99 90 100 79 100Z', '#D3CBBE') + HL('M69 90q4-3.5 9-3.5') + P('M87 89l-2 4', 'none', ln('#9A9184', 1.4)); },
      medium: function () { return SH(42) + E(124, 97, 7, 4, '#DAD3C7') + P('M44 100C40 86 46 70 61 63C76 56 99 59 109 71C118 82 117 94 113 100Z', '#C9C0B2') + P('M92 68l-5 9 5 7', 'none', ln('#8E8577', 1.7)) + P('M58 90l8 2', 'none', ln('#8E8577', 1.4)) + HL('M56 74c3-6 9-9 16-10', 3); },
      big: function () { return SH(68) + E(10, 98, 6, 3.6, '#D8D0C4') + E(151, 97, 8, 4.4, '#CFC6B8') + P('M16 100C10 70 22 40 50 26C76 14 112 16 132 36C148 52 150 80 144 100Z', '#BDB3A4') + P('M50 28C58 19 77 16 88 21C82 28 64 31 50 28Z', '#93C98F') + P('M60 24l2-4M70 22l1-5M80 22l2-4', 'none', ln('#5E9E61', 1.4)) + P('M112 40l-8 14 6 10-4 12', 'none', ln('#857C6E', 1.9)) + P('M38 70l11 6M126 74l8-4', 'none', ln('#857C6E', 1.6)) + HL('M32 60c4-13 13-22 26-27', 3.4) + O(60, 50, 2.6, '#fff', NS + ' opacity=".6"'); }
    },
    animals: {
      small: function () { return SH(24) + P('M62 95C50 97 44 90 49 85', 'none', ln(K, 2.4)) + E(80, 90, 17, 11, '#C9C2D6') + O(92, 80, 6, '#C9C2D6') + O(92, 80, 3, '#F6B3C2', NS) + P('M90 84C97 78 107 83 109 92C104 97 96 97 90 94Z', '#C9C2D6') + O(101, 87, 1.7, K, NS) + O(109, 91.5, 2, '#F6B3C2', ln(K, 1.2)) + P('M106 94l7 1M106 96l6 3', 'none', ln(K, 1.1)) + E(71, 100.5, 4.5, 2, '#B3ABC2', ln(K, 1.6)) + E(88, 100.5, 4.5, 2, '#B3ABC2', ln(K, 1.6)); },
      medium: function () { return SH(40) + R(60, 84, 6, 16, 3, '#5A4E5E') + R(72, 86, 6, 14, 3, '#5A4E5E') + R(90, 86, 6, 14, 3, '#5A4E5E') + R(102, 84, 6, 16, 3, '#5A4E5E') + O(52, 74, 5, '#FFF8EC') + P('M56 80C50 74 56 64 64 66C64 58 76 54 82 60C88 54 100 56 102 64C110 64 114 74 108 80C112 88 104 94 98 90C94 96 82 96 78 92C72 96 60 94 60 88C52 88 50 82 56 80Z', '#FFF8EC') + P('M68 72q3-3 6 0M84 66q3-3 6 0M90 82q3-3 6 0M72 84q3-3 6 0', 'none', ln('#CFC4B2', 1.6)) + E(106, 64, 7, 3.4, '#5A4E5E', ' transform="rotate(-25 106 64)"') + P('M104 62C113 57 123 63 122 74C121 83 112 86 107 80C103 75 102 68 104 62Z', '#5A4E5E') + O(109, 59, 5.5, '#FFF8EC') + O(115, 70, 2.1, '#fff', NS) + O(115.5, 70.5, 1, K, NS) + P('M116 79q2.5 1.6 5 0', 'none', ln('#fff', 1.3)); },
      big: function () { return SH(66) + P('M24 66l-9 5', 'none', ln(K, 3)) + R(32, 84, 16, 16, 6, '#958FC2') + R(56, 86, 15, 14, 6, '#958FC2') + R(84, 86, 15, 14, 6, '#958FC2') + R(104, 84, 16, 16, 6, '#958FC2') + E(72, 70, 50, 29, '#A9A4D2') + P('M40 88C56 95 92 95 108 85', 'none', ln('#8C86BC', 1.6)) + E(110, 40, 5, 7, '#A9A4D2', ' transform="rotate(-18 110 40)"') + E(110, 41, 2.4, 3.8, '#F6B3C2', NS + ' transform="rotate(-18 110 41)"') + P('M102 50C114 40 138 42 146 56C152 68 148 84 134 88C120 92 106 84 102 72C100 64 100 56 102 50Z', '#A9A4D2') + E(136, 74, 13, 11, '#C8C4E6') + O(131, 70, 1.9, K, NS) + O(140, 70, 1.9, K, NS) + O(120, 54, 3.2, '#fff', ln(K, 1.6)) + O(121, 54.6, 1.6, K, NS) + E(124, 72, 4, 2.6, '#F4A3A0', NS + ' opacity=".6"') + P('M128 83q6 3 12 0', 'none', ln(K, 1.6)) + O(52, 52, 3, '#fff', NS + ' opacity=".55"'); }
    },
    bags: {
      small: function () { return SH(28) + G('rotate(-22 104 80)', R(86, 74, 32, 7, 2, '#FFC94A') + P('M118 74L127 77.5L118 81Z', '#F3D3B0') + P('M124.5 76.3l2.5 1.2-2.5 1.2Z', K, NS) + R(81, 74, 6, 7, 1.5, '#F6B3C2')) + P('M60 100C56 100 55 86 59 82H103C107 86 106 100 102 100Z', '#B9A3E3') + P('M60 85H102', 'none', ln(K, 1.6)) + P('M62 85H100', 'none', ' stroke="#fff" stroke-width="1.4" stroke-dasharray="1.5 2.5"') + R(97, 83, 5, 9, 2, '#C9CED6', ln(K, 1.4)) + P('M64 96H98', 'none', ' stroke="#8F78C6" stroke-width="1.2" stroke-dasharray="2 2.5"'); },
      medium: function () { return SH(38) + P('M70 39C70 29 90 29 90 39', 'none', ln(K, 3.4)) + TUBE('M51 52C43 60 43 84 51 94', 3.5, '#4F86C6') + TUBE('M109 52C117 60 117 84 109 94', 3.5, '#4F86C6') + R(50, 38, 60, 62, 18, '#7DB3E8') + R(58, 68, 44, 26, 9, '#BFDCF6') + R(61, 71, 38, 20, 7, 'none', ' stroke="#4F86C6" stroke-width="1.2" stroke-dasharray="2 2.5"') + P('M62 75H98', 'none', ln(K, 1.6)) + R(93, 72, 4, 8, 1.5, '#FFC94A', ln(K, 1.2)) + O(80, 53, 5, '#FFC94A') + HL('M56 50c1-4 3-6 6-7'); },
      big: function () { return SH(64) + P('M64 22V14C64 9 96 9 96 14V22', 'none', ln(K, 4.6)) + O(38, 96, 4.5, '#6B6875') + O(122, 96, 4.5, '#6B6875') + R(20, 20, 120, 72, 14, '#F0894F') + P('M46 23V89M114 23V89', 'none', ln('#C9653A', 2)) + R(20, 51, 120, 9, 2, '#B98157') + R(74, 49, 12, 13, 3, '#FFC94A') + O(36, 37, 7, '#FFE29A') + P('M36 33l1.2 2.6 2.8.4-2 2 .5 2.8-2.5-1.3-2.5 1.3.5-2.8-2-2 2.8-.4z', '#FFC94A', ln(K, 1.1)) + R(98, 66, 22, 14, 4, '#DCEBFA', ' transform="rotate(8 109 73)"') + HL('M28 34c1-5 4-8 9-9', 3); }
    },
    bubbles: {
      small: function () { return SH(18) + E(80, 82, 19, 13, '#FFFFFF', ' stroke-dasharray="3 4" stroke-width="2.4" opacity="1"') + O(64, 96, 3.2, '#FFFFFF', ' stroke-dasharray="2 3" stroke-width="2" opacity="1"') + O(73, 82, 1.6, K, NS) + O(80, 82, 1.6, K, NS) + O(87, 82, 1.6, K, NS); },
      medium: function () { return SH(36) + P('M50 54H110C117 54 121 58 121 65V80C121 87 117 91 110 91H78L66 100L68 91H50C43 91 39 87 39 80V65C39 58 43 54 50 54Z', '#BFDCF6') + P('M54 72q5-6 10 0t10 0t10 0t10 0t10 0', 'none', ln(K, 2.6)) + HL('M46 63c1-4 4-6 8-6'); },
      big: function () { return SH(62) + P('M56 86L44 102L76 92Z', '#FFD36B') + P(starburst(80, 54, 70, 44, 52, 32, 12), '#FFD36B') + P('M80 36V60', 'none', ln(K, 6.5)) + O(80, 71, 4, K, NS) + P('M8 30l-6-4M5 54H-4M9 78l-6 4M152 30l6-4M155 54h9M151 78l6 4', 'none', ln('#F0694F', 3.2)) + HL('M40 34l8-4', 3); }
    },
    weather: {
      small: function () { return SH(20) + P('M98 80h16c6 0 6-8 0-7M102 88h22c6 0 6 8 0 7M30 86h20M36 78h12', 'none', ln('#7DB3E8', 2.4)) + P('M60 94C53 94 51 85 58 83C58 76 67 74 71 78C73 72 84 72 86 79C93 79 95 88 88 92C86 94 63 94 60 94Z', '#FFFFFF') + P('M67 86q2-2 4 0M77 86q2-2 4 0', 'none', ln(K, 1.6)) + P('M71 89.5q2.5 2 5 0', 'none', ln(K, 1.4)) + E(65, 89, 2.4, 1.5, '#F4A3A0', NS + ' opacity=".7"') + E(83, 89, 2.4, 1.5, '#F4A3A0', NS + ' opacity=".7"'); },
      medium: function () {
        var drop = function (x, y) { return P('M' + x + ' ' + y + 'q-3.5 6 0 8q3.5-2 0-8Z', '#7DB3E8', ln(K, 1.6)); };
        return SH(36) + drop(58, 86) + drop(72, 90) + drop(88, 86) + drop(102, 90) + P('M48 80C37 80 35 64 46 60C46 47 61 43 69 49C73 38 92 38 96 49C107 46 118 55 113 66C122 70 119 81 108 81Z', '#D5DEEB') + O(70, 63, 2.3, K, NS) + O(90, 63, 2.3, K, NS) + P('M76 69q4 3 8 0', 'none', ln(K, 1.8)) + E(64, 69, 3.4, 2, '#F4A3A0', NS + ' opacity=".7"') + E(96, 69, 3.4, 2, '#F4A3A0', NS + ' opacity=".7"') + HL('M52 56c2-4 6-6 10-6');
      },
      big: function () {
        var drop = function (x, y) { return P('M' + x + ' ' + y + 'q-3.5 6 0 8q3.5-2 0-8Z', '#7DB3E8', ln(K, 1.6)); };
        return SH(62) + drop(34, 80) + drop(48, 88) + drop(118, 86) + drop(134, 78) + P('M88 66L74 86H85L78 101L102 78H90L97 66Z', '#FFC94A') + P('M30 70C13 70 11 47 28 43C27 25 50 17 62 27C68 11 97 9 105 26C121 19 141 32 135 48C152 52 149 72 132 72Z', '#9EAAC2') + P('M64 46q4 4 8 0M90 46q4 4 8 0', 'none', ln(K, 2.3)) + P('M77 56q4 3 8 0', 'none', ln(K, 2)) + E(60, 54, 4.4, 2.6, '#F4A3A0', NS + ' opacity=".7"') + E(102, 54, 4.4, 2.6, '#F4A3A0', NS + ' opacity=".7"') + HL('M40 38c2-6 8-10 14-10', 3);
      }
    },
    waves: {
      small: function () { return E(80, 95, 36, 7, '#9CCBF2') + E(80, 94, 11, 3, 'none', ' stroke="#fff" stroke-width="2"') + E(80, 94, 22, 5, 'none', ' stroke="#fff" stroke-width="1.6" opacity=".8"') + P('M80 73q-4 6 0 10q4-4 0-10Z', '#7DB3E8', ln(K, 1.8)); },
      medium: function () { return R(18, 94, 124, 7, 3.5, '#9CCBF2') + P('M30 98C32 76 50 58 76 58C98 58 112 72 108 86C104 96 92 96 88 88C94 86 94 76 86 74C76 72 70 84 78 98Z', '#7FC8E0') + P('M70 60C80 52 100 54 108 68C100 64 88 62 78 66Z', '#FFFFFF') + P('M44 90C46 78 54 70 64 66', 'none', ln('#4E9CC4', 1.6)) + O(112, 60, 2.2, '#fff') + O(117, 67, 1.6, '#fff'); },
      big: function () { return R(4, 94, 152, 7, 3.5, '#9CCBF2') + P('M8 98C8 60 38 22 82 18C118 15 146 38 144 64C142 82 126 90 114 82C124 74 120 58 106 56C88 54 76 72 88 98Z', '#6FBDE0') + P('M106 56C90 54 80 66 82 80', 'none', ln('#3F8DB8', 2)) + P('M26 80C30 62 40 48 52 40', 'none', ln('#3F8DB8', 1.6)) + P('M58 26C80 9 122 11 142 36C130 29 112 26 100 32C90 22 74 22 58 26Z', '#FFFFFF') + O(150, 28, 3.2, '#fff') + O(156, 40, 2.4, '#fff') + O(145, 15, 2.2, '#fff') + O(20, 95, 3, '#fff') + O(98, 95, 3, '#fff'); }
    }
  };
  // what each zone looks like behind its object: piles, pens, shelves, frames, patches of sky, stretches of water
  var BACK = {
    rocks: function () { return P('M-4 112C12 99 44 95 80 95C116 95 148 99 164 112Z', '#E8D5B5', NS + ' opacity=".9"') + P('M10 104v-7M14 104v-5M146 103v-7M150 103v-5', 'none', ln('#5FAE7B', 2)) + E(30, 104, 3, 2, '#CFC6B8', NS + ' opacity=".9"') + E(132, 105, 4, 2.2, '#CFC6B8', NS + ' opacity=".9"'); },
    animals: function () { return P('M-4 112V100C40 95 120 95 164 100V112Z', '#C3E8CF', NS + ' opacity=".9"') + R(2, 60, 156, 7, 3, '#E5BE93', ' opacity=".95"') + R(2, 78, 156, 7, 3, '#E5BE93', ' opacity=".95"') + R(6, 52, 9, 50, 3, '#E5BE93', ' opacity=".95"') + R(145, 52, 9, 50, 3, '#E5BE93', ' opacity=".95"') + P('M20 102v-6M24 102v-4M136 101v-6M140 101v-4', 'none', ln('#5FAE7B', 2)); },
    bags: function () { return R(2, 100, 156, 8, 3, '#C98B5A', ' opacity=".95"') + P('M12 104h28M70 103.5h20M118 104.5h26', 'none', ln('#8C5A36', 1.2) + ' opacity=".55"') + O(10, 104, 1.5, K, NS) + O(150, 104, 1.5, K, NS); },
    bubbles: function () { return R(6, 7, 148, 96, 14, '#FFFFFF', ' stroke="#C98B5A" stroke-width="4" opacity=".7"') + O(80, 3, 2.4, K, NS); },
    weather: function () { return R(6, 7, 148, 96, 18, '#E3F0FC', NS + ' opacity=".85"') + P('M24 24q4-4 8 0q4-4 8 0M126 34q3-3 6 0q3-3 6 0', 'none', ln('#8FA3C0', 1.4)); },
    waves: function () { return P('M-4 112V96C18 92 38 99 60 95S102 92 122 97 150 94 164 96V112Z', '#BFE0F7', NS + ' opacity=".9"') + P('M20 105h14M92 107h18M56 102h10', 'none', ln('#fff', 1.8)); }
  };
  function objInner(style, size) { return fx(ART[style][size]()); }
  function objSVG(style, size, back) {
    return '<svg viewBox="0 0 160 110" aria-hidden="true" focusable="false">' + (back ? BACK[style]() : '') + '<g class="ps-o">' + objInner(style, size) + '</g></svg>';
  }
  function objName(style, sz) { return T('o_' + style)[SIZES.indexOf(sz)]; }
  function trio(style) { return '<span class="ps-trio">' + SIZES.map(function (s) { return objSVG(style, s); }).join('') + '</span>'; }
  function styleName(st) { return T(st === 'animals' ? 'animalsS' : st); }

  /* ---------- landscape layers (sky, far hills, meadow, near grass and flowers) ---------- */
  function cloud(x, y, sc, cls, dur) {
    return '<g class="' + (cls || 'ps-drift') + '" style="animation-duration:' + (dur || 40) + 's"><g transform="translate(' + x + ' ' + y + ') scale(' + sc + ')"><path d="M0 0c-14 0-16-14-4-16c0-12 18-14 22-5c6-10 24-8 24 4c10-2 16 10 7 17z" fill="#fff" stroke="' + K + '" stroke-width="' + (2.6 / sc).toFixed(2) + '" stroke-linejoin="round"/><path d="M-2 -8c2-4 6-6 10-6" fill="none" stroke="#EAF2FB" stroke-width="' + (2.4 / sc).toFixed(2) + '" stroke-linecap="round"/></g></g>';
  }
  function flower(x, y, col, delay) {
    return '<g class="ps-bob" style="animation-delay:' + (delay || 0) + 's"><path d="M' + x + ' ' + (y + 14) + 'V' + y + '" stroke="#4FA772" stroke-width="2.4" stroke-linecap="round"/>' +
      '<g stroke="' + K + '" stroke-width="1.8">' + [[0, -5], [5, -1], [3, 5], [-3, 5], [-5, -1]].map(function (p) { return '<circle cx="' + (x + p[0]) + '" cy="' + (y + p[1]) + '" r="3.6" fill="' + col + '"/>'; }).join('') + '<circle cx="' + x + '" cy="' + y + '" r="2.6" fill="#FFC94A"/></g></g>';
  }
  function blades(x, y, n, delay) {
    var d = ''; for (var i = 0; i < n; i++) { var bx = x + i * 5; d += 'M' + bx + ' ' + y + 'q' + (i % 2 ? 2 : -1) + ' -6 ' + (i % 2 ? 1 : 3) + ' -' + (8 + (i * 7) % 6); }
    return '<g class="ps-sway" style="animation-delay:' + (delay || 0) + 's"><path d="' + d + '" fill="none" stroke="#4FA772" stroke-width="2.2" stroke-linecap="round"/></g>';
  }
  function grainDef(tint, size, op) { var F = window.LUArt && LUArt.fx; return F && F.grain ? F.grain(tint, size, op) : null; }
  // a whole landscape, w x h; groundY is where things stand
  function landscape(w, h, groundY, o) {
    o = o || {};
    var sky = uid('sky'), g1 = grainDef('#BFE5CA', 9, .45), g2 = grainDef('#DCEBFA', 11, .3);
    var defs = '<defs><linearGradient id="' + sky + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F6FBFF"/><stop offset="1" stop-color="#DDEEFB"/></linearGradient>' + (g1 ? g1.def : '') + (g2 ? g2.def : '') + '</defs>';
    var f = groundY - h * .3, m = groundY - h * .12;
    var s = defs + '<rect width="' + w + '" height="' + h + '" fill="url(#' + sky + ')"/>' + (g2 ? '<rect width="' + w + '" height="' + h + '" fill="url(#' + g2.id + ')"/>' : '');
    if (o.sun !== false) {
      var sx = o.sunX || w * .09, sy = o.sunY || h * .18, sr = o.sunR || h * .085, rays = '';
      for (var i = 0; i < 10; i++) { var a = i * Math.PI / 5; rays += 'M' + (sx + Math.cos(a) * sr * 1.35).toFixed(1) + ' ' + (sy + Math.sin(a) * sr * 1.35).toFixed(1) + 'L' + (sx + Math.cos(a) * sr * 1.7).toFixed(1) + ' ' + (sy + Math.sin(a) * sr * 1.7).toFixed(1); }
      s += '<path d="' + rays + '" stroke="#FFC94A" stroke-width="' + (sr * .16).toFixed(1) + '" stroke-linecap="round"/><circle cx="' + sx + '" cy="' + sy + '" r="' + sr + '" fill="#FFD36B" stroke="' + K + '" stroke-width="2.6"/><circle cx="' + (sx - sr * .1) + '" cy="' + (sy - sr * .1) + '" r="' + (sr * .78) + '" fill="#FFE29A"/><ellipse cx="' + (sx - sr * .38) + '" cy="' + (sy - sr * .42) + '" rx="' + (sr * .26) + '" ry="' + (sr * .15) + '" fill="#fff" opacity=".8" transform="rotate(-32 ' + (sx - sr * .38) + ' ' + (sy - sr * .42) + ')"/>';
    }
    (o.clouds || []).forEach(function (c) { s += cloud(c[0], c[1], c[2], o.cloudCls, c[3]); });
    // far hills (three tones: base, shade, crest light)
    s += '<path d="M0 ' + (f + 12) + 'C' + w * .1 + ' ' + (f - 22) + ' ' + w * .22 + ' ' + (f - 18) + ' ' + w * .32 + ' ' + (f + 2) + 'C' + w * .42 + ' ' + (f - 26) + ' ' + w * .55 + ' ' + (f - 30) + ' ' + w * .66 + ' ' + (f - 4) + 'C' + w * .76 + ' ' + (f - 26) + ' ' + w * .9 + ' ' + (f - 22) + ' ' + w + ' ' + (f + 4) + 'V' + h + 'H0Z" fill="#D3ECDC"/>';
    s += '<path d="M' + w * .32 + ' ' + (f + 2) + 'C' + w * .36 + ' ' + (f + 14) + ' ' + w * .4 + ' ' + (f + 26) + ' ' + w * .38 + ' ' + (f + 40) + 'M' + w * .66 + ' ' + (f - 4) + 'C' + w * .7 + ' ' + (f + 10) + ' ' + w * .74 + ' ' + (f + 22) + ' ' + w * .72 + ' ' + (f + 36) + '" fill="none" stroke="#C0E2CB" stroke-width="10" stroke-linecap="round"/>';
    s += '<path d="M' + w * .05 + ' ' + (f + 2) + 'C' + w * .12 + ' ' + (f - 14) + ' ' + w * .2 + ' ' + (f - 14) + ' ' + w * .26 + ' ' + (f - 6) + 'M' + w * .46 + ' ' + (f - 12) + 'C' + w * .52 + ' ' + (f - 24) + ' ' + w * .58 + ' ' + (f - 22) + ' ' + w * .62 + ' ' + (f - 14) + '" fill="none" stroke="#E9F6EE" stroke-width="3" stroke-linecap="round"/>';
    // middle meadow, with grain
    var md = 'M0 ' + (m + 6) + 'C' + w * .2 + ' ' + (m - 16) + ' ' + w * .4 + ' ' + (m - 8) + ' ' + w * .5 + ' ' + (m - 4) + 'C' + w * .65 + ' ' + (m - 14) + ' ' + w * .82 + ' ' + (m - 16) + ' ' + w + ' ' + (m + 2) + 'V' + h + 'H0Z';
    s += '<path d="' + md + '" fill="#B7E2C4" stroke="' + K + '" stroke-width="2.4" stroke-opacity=".18"/>' + (g1 ? '<path d="' + md + '" fill="url(#' + g1.id + ')"/>' : '');
    s += '<path d="M' + w * .08 + ' ' + (m + 2) + 'C' + w * .18 + ' ' + (m - 10) + ' ' + w * .3 + ' ' + (m - 8) + ' ' + w * .4 + ' ' + (m - 5) + '" fill="none" stroke="#D2EEDB" stroke-width="3" stroke-linecap="round"/>';
    // the ground the scene stands on, and a near strip of grass
    s += '<path d="M0 ' + (groundY - 4) + 'C' + w * .3 + ' ' + (groundY - 10) + ' ' + w * .7 + ' ' + (groundY - 10) + ' ' + w + ' ' + (groundY - 4) + 'V' + h + 'H0Z" fill="#A6DBB5"/>';
    var n = h - 6;
    s += '<path d="M0 ' + (n - 4) + 'C' + w * .25 + ' ' + (n - 10) + ' ' + w * .75 + ' ' + (n - 10) + ' ' + w + ' ' + (n - 4) + 'V' + h + 'H0Z" fill="#7FCB98" stroke="' + K + '" stroke-width="2.4" stroke-opacity=".25"/><path d="M0 ' + (h - 2) + 'H' + w + '" stroke="#5FAE7B" stroke-width="4"/>';
    (o.blades || []).forEach(function (b, i) { s += blades(b[0], b[1] || n - 4, b[2] || 4, i * .4); });
    (o.flowers || []).forEach(function (fl, i) { s += flower(fl[0], fl[1] || n - 14, fl[2] || ['#F6B3C2', '#fff', '#B9A3E3', '#FFE29A'][i % 4], i * .7); });
    return s;
  }

  /* ---------- the seesaw scene (800 x 340): pivot at (400, 212), ground at 318 ---------- */
  var PIV = { x: 400, y: 212 }, LC = 170, RC = 630; // left and right tray centres
  function miniCard(x, y, rot, col) {
    return G('rotate(' + rot + ' ' + (x + 18) + ' ' + (y + 46) + ')', R(x, y, 36, 46, 5, '#fff', ln(K, 2.4)) + R(x + 5, y + 6, 26, 5, 2.5, col, NS) + P('M' + (x + 6) + ' ' + (y + 20) + 'h22M' + (x + 6) + ' ' + (y + 27) + 'h24M' + (x + 6) + ' ' + (y + 34) + 'h16', 'none', ln('#CFC4B2', 2.2)));
  }
  function closedBox(cx) {
    return '<g class="ps-box"><g class="ps-boxb">' + fx(R(cx - 38, 138, 76, 54, 6, '#C98B5A') + P('M' + (cx - 38) + ' 156H' + (cx + 38) + 'M' + (cx - 38) + ' 174H' + (cx + 38), 'none', ln('#8C5A36', 1.6)) + O(cx - 32, 144, 1.6, K, NS) + O(cx + 32, 144, 1.6, K, NS)) +
      '<path d="M' + (cx - 8) + ' 156c0-9 16-9 16 0 0 7-8 6-8 14" fill="none" stroke="#FFF8EC" stroke-width="4.5" stroke-linecap="round"/><circle cx="' + cx + '" cy="181" r="3" fill="#FFF8EC"/></g>' +
      '<g class="ps-lid">' + fx(R(cx - 44, 128, 88, 13, 5, '#B5784A') + R(cx - 8, 124, 16, 6, 3, '#8C5A36')) + '</g></g>';
  }
  function basket(cx, w) {
    var x0 = cx - w / 2, x1 = cx + w / 2, d = '';
    for (var x = x0 + 10; x < x1 - 6; x += 10) d += 'M' + x + ' 176V190';
    return fx(P('M' + x0 + ' 174H' + x1 + 'L' + (x1 - 6) + ' 192H' + (x0 + 6) + 'Z', '#D9A877') + P(d, 'none', ln('#A87A4C', 1.4)) + P('M' + (x0 + 3) + ' 182H' + (x1 - 3), 'none', ln('#A87A4C', 1.4)), 4.5);
  }
  var BASKET_W = { small: 60, medium: 96, big: 150 };
  function leftTray(p, open) {
    var st = cfg().ps;
    return miniCard(68, 146, -6, '#F7A08C') +
      '<g class="ps-pobj"' + (open ? '' : ' style="opacity:0"') + '><svg x="' + (LC + 12 - 80) + '" y="92" width="160" height="110" viewBox="0 0 160 110" overflow="visible">' + (p ? objInner(st, p.size) : '') + '</svg></g>' +
      (open ? '' : closedBox(LC + 12));
  }
  function rightTray(r) {
    if (!r) return '<rect x="' + (RC - 66) + '" y="112" width="132" height="78" rx="14" fill="#fff" fill-opacity=".45" stroke="#CFC4B2" stroke-width="2.4" stroke-dasharray="7 7"/>';
    var st = cfg().rs;
    return miniCard(696, 146, 6, '#7DB3E8') + basket(RC - 12, BASKET_W[r.size]) +
      '<svg x="' + (RC - 12 - 80) + '" y="74" width="160" height="110" viewBox="0 0 160 110" overflow="visible">' + objInner(st, r.size) + '</svg>';
  }
  function tag(cx, label) { return '<g><rect x="' + (cx - 54) + '" y="225" width="108" height="26" rx="13" fill="#FFF8EC" stroke="' + K + '" stroke-width="2"/><text x="' + cx + '" y="243" text-anchor="middle" font-family="Figtree,sans-serif" font-weight="700" font-size="15" fill="' + K + '">' + esc(label) + '</text></g>'; }
  function plankSVG(angle, p, r, open) {
    var grain = 'M70 211h70M160 216h90M280 212h60M430 216h80M540 211h70M640 216h80';
    return '<g class="ps-plank" style="transform:rotate(' + angle + 'deg)">' +
      tag(LC, T('problem')) + tag(RC, T('reaction')) +
      fx(R(48, 203, 704, 19, 9.5, '#C98B5A') + P(grain, 'none', ln('#8C5A36', 1.3) + ' opacity=".5"') + O(PIV.x, PIV.y + 0.5, 4, '#8C5A36') +
        R(58, 190, 230, 13, 4, '#E5BE93') + R(512, 190, 230, 13, 4, '#E5BE93') + P('M70 196h40M150 197h60M530 196h50M640 197h70', 'none', ln('#B98157', 1.1) + ' opacity=".6"'), 6) +
      '<g class="ps-lt">' + leftTray(p, open) + '</g><g class="ps-rt">' + rightTray(r) + '</g></g>';
  }
  function fulcrum() {
    return fx(P('M346 322C352 280 372 238 392 218C397 213 403 213 408 218C428 238 448 280 454 322Z', '#C4BAAB') + P('M386 262l8 10-4 12M418 296l-8 8', 'none', ln('#8E8577', 1.7)) + O(372, 300, 2.4, '#fff', NS + ' opacity=".5"') + HL('M378 250c4-10 10-20 16-26', 3.2), 6);
  }
  function sceneSVG(angle, p, r, open, mood) {
    var bg = landscape(800, 340, 318, { clouds: [[150, 70, 1.2, 46], [520, 44, .9, 58], [690, 96, 1.05, 52]], sunX: 62, sunY: 56, sunR: 26, blades: [[16], [118], [214], [560], [646], [760]], flowers: [[42], [176], [598, 322, '#fff'], [740]] });
    return '<svg viewBox="0 0 800 340" aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid meet">' + bg +
      E(400, 323, 64, 6, K, NS + ' opacity=".14"') +
      shadowEl('L', angle) + shadowEl('R', angle) +
      fulcrum() + plankSVG(angle, p, r, open) +
      '<g class="ps-gw">' + nestChar(guideId(), mood || 'present', 424, 208, 86, true) + '</g>' +
      '<g class="ps-spark" style="opacity:0">' + P('M400 186l3.4 7.4 7.6 3.4-7.6 3.4-3.4 7.4-3.4-7.4-7.6-3.4 7.6-3.4z', '#FFE29A', ln(K, 2)) + P('M380 182l1.8 3.8 3.8 1.8-3.8 1.8-1.8 3.8-1.8-3.8-3.8-1.8 3.8-1.8zM420 176l1.6 3.4 3.4 1.6-3.4 1.6-1.6 3.4-1.6-3.4-3.4-1.6 3.4-1.6z', '#FFC94A', ln(K, 1.6)) + '</g>' +
      '<g class="ps-fx"></g></svg>';
  }
  // soft contact shadows on the ground under each end of the plank: bigger and darker as the end comes down
  function shadowLook(side, angle) {
    var dx = side === 'L' ? -330 : 330, endY = PIV.y + dx * Math.sin(angle * Math.PI / 180), h = Math.max(0, 318 - endY - 10);
    var k = Math.max(0, Math.min(1, 1 - h / 110));
    return { s: (0.6 + k * 0.6).toFixed(3), o: (0.06 + k * 0.14).toFixed(3) };
  }
  function shadowEl(side, angle) { var l = shadowLook(side, angle); return '<ellipse class="ps-sh ps-sh' + side + '" cx="' + (side === 'L' ? 82 : 718) + '" cy="322" rx="60" ry="6" fill="' + K + '" style="transform:scale(' + l.s + ');opacity:' + l.o + '"/>'; }

  /* ---------- small pictures: mode previews, summary seesaws, the start screen backdrop ---------- */
  var TINTS = { small: '#DDF2E4', medium: '#FFF1C7', big: '#FFE9DA' };
  function previewSort(kind) {
    var st = kind === 'problem' ? cfg().ps : cfg().rs;
    var s = landscape(300, 130, 118, { sun: false, clouds: [[60, 30, .55, 9]], cloudCls: 'ps-loop ps-drift2', blades: [[8, 126, 3], [280, 126, 3]] });
    SIZES.forEach(function (sz, i) {
      var x = 104 + i * 64;
      s += '<rect x="' + x + '" y="34" width="58" height="80" rx="12" fill="' + TINTS[sz] + '" stroke="' + K + '" stroke-width="2"/><svg x="' + (x + 1) + '" y="66" width="56" height="38.5" viewBox="0 0 160 110" overflow="visible">' + BACK[st]() + objInner(st, sz) + '</svg><rect x="' + (x + 12) + '" y="104" width="34" height="5" rx="2.5" fill="' + K + '" opacity=".25"/>';
    });
    s += '<g class="ps-loop ps-fly"><g transform="rotate(-6 64 74)"><rect x="54" y="66" width="22" height="16" rx="3" fill="#fff" stroke="' + K + '" stroke-width="1.8"/><path d="M58 72h13M58 76h9" stroke="#CFC4B2" stroke-width="1.6" stroke-linecap="round"/></g></g>';
    s += '<g class="ps-loop ps-pbob">' + nestChar(guideId(), 'present', 8, 22, 72, false) + '</g>';
    return '<svg viewBox="0 0 300 130" aria-hidden="true" focusable="false">' + s + '</svg>';
  }
  function previewSeesaw() {
    var c = cfg();
    var s = landscape(300, 130, 118, { sun: false, clouds: [[70, 28, .55, 9]], cloudCls: 'ps-loop ps-drift2', blades: [[8, 126, 3], [280, 126, 3]] });
    s += E(196, 120, 26, 3, K, NS + ' opacity=".14"') + fx(P('M182 120C184 108 190 96 194 90C195 88 197 88 198 90C202 96 208 108 210 120Z', '#C4BAAB'), 4.5);
    s += '<g class="ps-loop ps-rock">' + fx(R(112, 84, 168, 7, 3.5, '#C98B5A') + R(116, 79, 64, 5, 2, '#E5BE93') + R(212, 79, 64, 5, 2, '#E5BE93'), 4.5) +
      '<svg x="118" y="40" width="54" height="37" viewBox="0 0 160 110" overflow="visible">' + objInner(c.ps, 'medium') + '</svg>' +
      fx(P('M224 72H264L261 79H227Z', '#D9A877'), 4) + '<svg x="217" y="34" width="54" height="37" viewBox="0 0 160 110" overflow="visible">' + objInner(c.rs, 'medium') + '</svg></g>';
    s += '<g class="ps-loop ps-pbob">' + nestChar(guideId(), 'happy', 22, 36, 60, false) + '</g>';
    return '<svg viewBox="0 0 300 130" aria-hidden="true" focusable="false">' + s + '</svg>';
  }
  function miniSeesaw(deg) {
    return '<svg viewBox="0 0 160 110" aria-hidden="true" focusable="false">' + E(80, 102, 40, 4, K, NS + ' opacity=".13"') +
      fx(P('M66 100C68 88 74 76 78 70C79 68 81 68 82 70C86 76 92 88 94 100Z', '#C4BAAB') +
        G('rotate(' + deg + ' 80 68)', R(14, 64, 132, 8, 4, '#C98B5A') + R(20, 46, 34, 18, 5, '#D3CBBE') + P('M108 46H140C143 46 145 48 145 51V59C145 62 143 64 140 64H118L112 68L113 64H108C105 64 103 62 103 59V51C103 48 105 46 108 46Z', '#BFDCF6')), 4.5) + '</svg>';
  }
  function heroArt() {
    return '<svg viewBox="0 0 1000 260" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">' +
      landscape(1000, 260, 236, { clouds: [[300, 60, 1.1, 50], [640, 40, .8, 64], [880, 84, 1, 56]], sunX: 70, sunY: 52, sunR: 24, blades: [[30], [210], [520], [760], [940]], flowers: [[90], [470, 0, '#fff'], [700], [960]] }) + '</svg>';
  }
  function stageArt() {
    return '<svg viewBox="0 0 1000 120" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">' +
      '<path d="M0 70C150 40 300 46 450 62C600 40 800 38 1000 60V120H0Z" fill="#E7DFD1"/><path d="M0 96C250 80 750 80 1000 96V120H0Z" fill="#DDD3C2"/>' +
      blades(40, 112, 4, 0) + blades(930, 112, 4, .6) + flower(80, 98, '#F6B3C2', .3) + flower(900, 98, '#fff', 1.1) + '</svg>';
  }

  /* ===================== state ===================== */
  var ST = { screen: '', mode: 1, round: [], idx: 0, phase: 'present', results: [], first: [], hand: [], pick: null, open: false, angle: 0, fx: '', ctab: 'a', pickSel: '' };
  function cur() { return ST.round[ST.idx]; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function pick1(a) { return a.length ? a[Math.floor(Math.random() * a.length)] : null; }
  function modeKind() { return ST.mode === 2 ? 'reaction' : 'problem'; }

  function msgFor(card, choice) {
    var reason = (card.reason || '').trim();
    if (!card.size) return { kind: 'open', text: T('open') };
    if (card.kind === 'reaction') {
      if (card.h) return choice === 'big' ? { kind: 'match', text: T('helpBig') } : { kind: 'calm', text: T('helpLow') };
      if (choice === card.size) return { kind: card.safety ? 'calm' : 'match', text: join(T('matchR', sizeWord(card.size)), reason) };
      if (card.safety) return { kind: 'calm', text: T('safeR') };
      return { kind: 'differ', text: join(T('differ', sizeWord(card.size)), reason, T('differR')) };
    }
    if (choice === card.size) return { kind: card.safety ? 'calm' : 'match', text: join(T('matchP', sizeWord(card.size)), reason) };
    if (card.safety) return { kind: 'calm', text: T('safeP') };
    return { kind: 'differ', text: join(T('differ', sizeWord(card.size)), reason, T('differP')) };
  }
  function moodFor(kind) { return kind === 'match' ? 'happy' : kind === 'calm' ? 'calm' : 'curious'; }

  function outcomeOf(p, r) { var d = SIZES.indexOf(r.size) - SIZES.indexOf(p.size); return d === 0 ? 'balanced' : d > 0 ? 'bigger' : 'smaller'; }
  function angleFor(p, r) { var d = SIZES.indexOf(r.size) - SIZES.indexOf(p.size); return d === 0 ? 0 : (d > 0 ? 1 : -1) * (Math.abs(d) > 1 ? 12 : 8); }
  var OUT = { balanced: 'oBal', bigger: 'oBig', smaller: 'oSmall' };
  function ssMsg(p, o) { return o === 'balanced' ? T('ssBal') : o === 'bigger' ? T('ssBig') : p.safety ? T('ssSafe') : T('ssSmall'); }
  function ssMood(p, o) { return o === 'balanced' ? 'happy' : (o === 'smaller' && p.safety) ? 'calm' : 'curious'; }

  // a hand of three reactions: one Small, one Medium, one Big. Safety problems get a helpful Big (H); others a non-H Big.
  function dealHand(p) {
    var R = pool('reaction').filter(function (r) { return r.size; }), S0 = starter('reaction');
    function from(list, test) { var a = list.filter(test); return a; }
    var sm = from(R, function (r) { return r.size === 'small'; }), md = from(R, function (r) { return r.size === 'medium'; });
    var bg = from(R, function (r) { return r.size === 'big' && (p.safety ? r.h : !r.h); });
    if (!sm.length) sm = from(S0, function (r) { return r.size === 'small'; });
    if (!md.length) md = from(S0, function (r) { return r.size === 'medium'; });
    if (!bg.length) bg = from(S0, function (r) { return r.size === 'big' && (p.safety ? r.h : !r.h); });
    return [pick1(sm), pick1(md), pick1(bg)];
  }
  function startMode(m) {
    clearSeq();
    var per = cfg().per, round;
    if (m === 3) round = shuffle(pool('problem').filter(function (p) { return p.size; })).slice(0, per);
    else round = shuffle(pool(m === 1 ? 'problem' : 'reaction')).slice(0, per);
    if (!round.length) { X.toast(T('empty')); return; }
    ST.screen = m === 3 ? 'seesaw' : 'sort'; ST.mode = m; ST.round = round; ST.idx = 0; ST.results = []; ST.first = [];
    ST.phase = m === 3 ? 'pick' : 'present'; ST.pick = null; ST.open = false; ST.angle = 0; ST.hand = m === 3 ? dealHand(round[0]) : [];
    ST.fx = 'enter';
    try { X.setLast('sorter'); } catch (e) { }
    draw(); scrollTop();
  }
  function toStart() { clearSeq(); ST.screen = 'start'; ST.fx = 'start'; draw(); scrollTop(); }
  function scrollTop() { var el = document.getElementById('psApp'); if (el && el.getBoundingClientRect().top < 0) el.scrollIntoView({ block: 'start' }); }

  /* ===================== screens ===================== */
  function bar() {
    var total = ST.round.length, done = ST.mode === 3 ? ST.first.filter(Boolean).length : ST.results.length;
    var dots = ST.round.map(function (_, i) { return '<i class="' + (i < done ? 'd' : i === ST.idx ? 'c' : '') + '"></i>'; }).join('');
    return '<div class="ps-bar"><span class="ps-mt">' + esc(T('mode' + ST.mode)) + '</span><b>' + esc(T('cardOf', Math.min(ST.idx + 1, total), total)) + '</b><span class="ps-dots" aria-hidden="true">' + dots + '</span><span class="sp"></span>' +
      '<button type="button" class="tl-btn outline sm" data-ps="tostart">' + esc(T('backStart')) + '</button></div>';
  }
  function guideBox(mood, cls) { return '<div class="ps-guide ' + (cls || '') + '">' + guideSVG(mood, true) + '</div>'; }

  function screenStart() {
    var add = plusHidden() ? '' : '<button type="button" class="tl-btn outline ps-hbtn" data-ps="add">' + esc(T('addBtn')) + lockPill() + '</button>';
    var modes = [[1, '#DDF2E4', previewSort('problem')], [2, '#E9E1F7', previewSort('reaction')], [3, '#DCEBFA', previewSeesaw()]].map(function (m) {
      return '<button type="button" class="ps-mode" data-ps="mode" data-v="' + m[0] + '" style="background:' + m[1] + '"><span class="ps-prev">' + m[2] + '</span>' +
        '<span class="ps-mhead"><span class="ps-num">' + m[0] + '</span><span class="ps-mtitle">' + esc(T('mode' + m[0])) + '</span><span class="ps-go">' + esc(T('start')) + '</span></span></button>';
    }).join('');
    return '<section class="ps-hero"><div class="ps-heroart">' + heroArt() + '</div>' +
      '<div class="ps-herog">' + guideBox('idle', 'big') + '<p class="ps-say left">' + esc(T('hi')) + '</p></div>' +
      '<div class="ps-herobtns"><button type="button" class="tl-btn outline ps-hbtn" data-ps="defs">' + esc(T('sizesBtn')) + '</button>' + add + '</div></section>' +
      '<section class="ps-modesec" aria-labelledby="psOrder"><h2 class="ps-eyebrow" id="psOrder">' + esc(T('order')) + '</h2><div class="ps-modes">' + modes + '</div>' +
      '<p class="ps-feel">' + esc(T('feelings')) + '</p></section>';
  }

  function zonesHTML() {
    var kind = modeKind(), st = kind === 'problem' ? cfg().ps : cfg().rs, on = ST.phase === 'present', counts = { small: 0, medium: 0, big: 0 };
    ST.results.forEach(function (r) { counts[r.choice]++; });
    return '<div class="ps-zones" role="group" aria-label="' + esc(T('mode' + ST.mode)) + '">' + SIZES.map(function (sz, i) {
      var lab = zoneWord(kind, sz);
      return '<button type="button" class="ps-zone sz-' + sz + '" data-ps="zone" data-v="' + sz + '" data-st="' + st + '"' + (on ? '' : ' aria-disabled="true"') +
        ' aria-label="' + esc(T('zoneAria', lab, def(kind, sz, true)) + (counts[sz] ? ' ' + T('zoneCount', counts[sz]) : '')) + '">' +
        '<span class="ps-zkey" aria-hidden="true">' + (i + 1) + '</span>' + (counts[sz] ? '<span class="ps-zcount" aria-hidden="true">' + counts[sz] + '</span>' : '') +
        '<span class="ps-zart">' + objSVG(st, sz, true) + '</span><b class="ps-zlab">' + esc(lab) + '</b>' +
        (cfg().meanings ? '<small class="ps-zdef">' + esc(def(kind, sz)) + '</small>' : '') + '</button>';
    }).join('') + '</div>';
  }
  function screenSort() {
    var kind = modeKind(), card = cur(), h = bar(), last = ST.results[ST.results.length - 1];
    var mood = ST.phase === 'present' ? 'present' : ST.phase === 'placing' ? 'curious' : moodFor(msgFor(last.card, last.choice).kind);
    h += '<div class="ps-stage"><div class="ps-stagebg">' + stageArt() + '</div><div class="ps-gcol">';
    if (ST.phase !== 'reflect') h += '<p class="ps-say down">' + esc(T(kind === 'problem' ? 'askP' : 'askR')) + '</p>';
    h += guideBox(mood) + '</div><div class="ps-carea">';
    if (ST.phase !== 'reflect') {
      h += '<div class="ps-deck" id="psDeck"><span class="ps-under u2"></span><span class="ps-under u1"></span>' +
        '<div class="ps-card" id="psCard" tabindex="-1" role="group" aria-label="' + esc(T('cardAria', T(kind), card.text)) + '">' +
        '<span class="ps-crow"><span class="ps-eyebrow">' + esc(T(kind)) + '</span>' + (card.custom ? '<span class="ps-mine">' + esc(T('yourCard')) + '</span>' : '') + '</span>' +
        '<p class="ps-ctext">' + esc(card.text) + '</p><span class="ps-hint">' + esc(T('dragHint')) + '</span></div></div>';
    } else {
      var m = msgFor(last.card, last.choice);
      h += '<div class="ps-msg" id="psMsg"><div class="ps-mrow"><span class="ps-eyebrow">' + esc(T('youChose')) + '</span><span class="ps-chip sz-' + last.choice + '">' + esc(zoneWord(kind, last.choice)) + '</span></div>' +
        '<p class="ps-quote">“' + esc(last.card.text) + '”</p><p class="ps-mtext">' + esc(m.text) + '</p>' +
        '<div class="ps-mfoot"><button type="button" class="tl-btn primary lg" id="psNext" data-ps="next">' + esc(T(ST.idx + 1 >= ST.round.length ? 'finish' : 'nextCard')) + '</button></div></div>';
    }
    h += '</div></div>' + zonesHTML() + '<p class="ps-keys">' + esc(T('keys')) + '</p>';
    return h;
  }

  function sceneAria() {
    var p = cur(); if (!p) return '';
    var s = T('ssAria', p.text) + '. ';
    if (ST.pick && ST.phase !== 'moving') s += T('ssAriaR', ST.pick.text) + '. ' + T(OUT[outcomeOf(p, ST.pick)]) + '.';
    else s += T('ssNoR');
    return s;
  }
  function ssMsgText() { var p = cur(); return ST.phase === 'result' && ST.pick ? ssMsg(p, outcomeOf(p, ST.pick)) : T('ssPick'); }
  function ssCardsHTML() {
    var p = cur(), r = ST.pick;
    return '<div class="ps-sc p"><span class="ps-eyebrow">' + esc(T('problem')) + '</span><p>' + esc(p.text) + '</p></div>' +
      (r ? '<div class="ps-sc r"><span class="ps-scrow"><span class="ps-eyebrow">' + esc(T('reaction')) + '</span><span class="ps-chip sz-' + r.size + '">' + esc(zoneWord('reaction', r.size)) + '</span></span><p>' + esc(r.text) + '</p></div>'
        : '<div class="ps-sc empty"><span class="ps-eyebrow">' + esc(T('reaction')) + '</span></div>');
  }
  function handHTML() {
    var rs = cfg().rs, can = ST.phase === 'pick';
    return ST.hand.map(function (r, i) {
      var onS = ST.pick === r, lab = zoneWord('reaction', r.size), dis = !can || onS;
      return '<button type="button" class="ps-hcard' + (onS ? ' on' : '') + '" data-ps="hand" data-v="' + i + '"' + (dis ? ' aria-disabled="true"' : '') + ' aria-label="' + esc(lab + ' (' + (i + 1) + '): ' + r.text) + '">' +
        '<span class="ps-hrow"><span class="ps-hart">' + objSVG(rs, r.size) + '</span><b>' + esc(lab) + '</b><span class="ps-zkey" aria-hidden="true">' + (i + 1) + '</span></span>' +
        '<span class="ps-htext">' + esc(r.text) + '</span>' + (onS ? '<span class="ps-on">' + esc(T('onSeesaw')) + '</span>' : '') + '</button>';
    }).join('');
  }
  function ssBtnsHTML() {
    if (ST.phase !== 'result') return '';
    return '<button type="button" class="tl-btn outline lg" data-ps="tryother">' + esc(T('tryAnother')) + '</button><button type="button" class="tl-btn primary lg" id="psNext" data-ps="ssnext">' + esc(T(ST.idx + 1 >= ST.round.length ? 'finish' : 'nextCard')) + '</button>';
  }
  function screenSeesaw() {
    var p = cur(), o = ST.phase === 'result' && ST.pick ? outcomeOf(p, ST.pick) : null;
    return bar() +
      '<div class="ps-ssmsg" id="psSsMsg"><p>' + esc(ssMsgText()) + '</p></div>' +
      '<div class="ps-scene" id="psScene" role="img" aria-label="' + esc(sceneAria()) + '">' + sceneSVG(ST.angle, p, ST.pick, ST.open, o ? ssMood(p, o) : 'present') +
      '<span class="ps-outcome" id="psOutcome"' + (o ? '' : ' hidden') + '>' + (o ? esc(T(OUT[o])) : '') + '</span></div>' +
      '<div class="ps-sscards" id="psSsCards">' + ssCardsHTML() + '</div>' +
      '<div class="ps-hand" id="psHand" role="group" aria-label="' + esc(T('hand')) + '">' + handHTML() + '</div>' +
      '<div class="ps-ssbtns" id="psSsBtns">' + ssBtnsHTML() + '</div><p class="ps-keys">' + esc(T('keys')) + '</p>';
  }

  function screenSummary() {
    var tiles, talk, kind = modeKind();
    if (ST.mode === 3) {
      var c = { balanced: 0, bigger: 0, smaller: 0 }, firsts = ST.first.filter(Boolean);
      firsts.forEach(function (f) { c[f.outcome]++; });
      tiles = [['balanced', 0, '#DDF2E4'], ['bigger', 10, '#FFE9DA'], ['smaller', -10, '#DCEBFA']].map(function (x) {
        return '<div class="ps-tile" style="background:' + x[2] + '"><span class="ps-tart">' + miniSeesaw(x[1]) + '</span><b>' + esc(T(OUT[x[0]])) + '</b><span>' + esc(T(c[x[0]] === 1 ? 'card1' : 'cardN', c[x[0]])) + '</span></div>';
      }).join('');
      talk = firsts.filter(function (f) { return f.outcome !== 'balanced'; }).map(function (f) {
        return '<li class="ps-titem"><b>' + esc(f.problem.text) + '</b><span class="ps-tsub">' + esc(T('firstPick', f.reaction.text)) + '</span><span class="ps-tchips"><span class="ps-chip plain">' + esc(T(OUT[f.outcome])) + '</span><span class="ps-chip sz-' + f.reaction.size + '">' + esc(zoneWord('reaction', f.reaction.size)) + '</span></span></li>';
      });
    } else {
      var st = kind === 'problem' ? cfg().ps : cfg().rs, n = { small: 0, medium: 0, big: 0 };
      ST.results.forEach(function (r) { n[r.choice]++; });
      tiles = SIZES.map(function (sz) { return '<div class="ps-tile sz-' + sz + '"><span class="ps-tart">' + objSVG(st, sz) + '</span><b>' + esc(zoneWord(kind, sz)) + '</b><span>' + esc(T(n[sz] === 1 ? 'card1' : 'cardN', n[sz])) + '</span></div>'; }).join('');
      talk = ST.results.filter(function (r) { return r.card.size && r.choice !== r.card.size; }).map(function (r) {
        return '<li class="ps-titem"><b>' + esc(r.card.text) + '</b><span class="ps-tchips"><span class="ps-chip sz-' + r.choice + '">' + esc(T('chose', zoneWord(kind, r.choice))) + '</span><span class="ps-chip plain">' + esc(T('usual', zoneWord(kind, r.card.size))) + '</span></span>' + (r.card.reason ? '<span class="ps-tsub">' + esc(r.card.reason) + '</span>' : '') + '</li>';
      });
    }
    return '<section class="ps-sumhero">' + guideBox('happy', 'sum') + '<div><span class="ps-mt">' + esc(T('mode' + ST.mode)) + '</span><h2 class="ps-h">' + esc(T('roundDone')) + '</h2></div></section>' +
      '<div class="ps-tiles">' + tiles + '</div>' +
      '<section class="ps-talk" aria-labelledby="psTalkH"><h2 class="ps-h2" id="psTalkH">' + esc(T('talkH')) + '</h2>' +
      (talk.length ? '<ul class="ps-tlist">' + talk.join('') + '</ul>' : '<p class="ps-none">' + esc(T('noTalk')) + '</p>') + '</section>' +
      '<div class="ps-endbtns"><button type="button" class="tl-btn primary lg" id="psAgain" data-ps="again">' + esc(T('again')) + '</button><button type="button" class="tl-btn outline lg" data-ps="tostart">' + esc(T('backStart')) + '</button></div>';
  }

  // the guide picker (first visit, and from the settings)
  function pickerHTML(sel, inSheet) {
    var c = CH(); if (!c) return '';
    var ids = c.ids.filter(function (id) { return c.group(id) === ST.ctab; });
    return '<div class="ps-pickhead"><div class="ps-ctabs" role="group">' + [['a', 'animals'], ['f', 'figures']].map(function (t) {
      return '<button type="button" data-ps="ctab" data-v="' + t[0] + '" aria-pressed="' + (ST.ctab === t[0]) + '"' + (ST.ctab === t[0] ? ' class="on"' : '') + '>' + esc(T(t[1])) + '</button>';
    }).join('') + '</div><button type="button" class="tl-btn primary sm ps-surprise" data-ps="surprise"><svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4z" fill="#fff" stroke="#2B2A35" stroke-width="1.8" stroke-linejoin="round"/></svg>' + esc(T('surprise')) + '</button></div>' +
      '<div class="ps-chargrid' + (inSheet ? ' insheet' : '') + '">' + ids.map(function (id) {
        var on = sel === id;
        return '<button type="button" class="ps-char' + (on ? ' on' : '') + '" data-ps="pickch" data-v="' + id + '" aria-pressed="' + on + '"><span class="ps-cart" style="background:' + c.tint(id) + '">' + charSVG(id, on ? 'happy' : 'idle', false) + '</span><b>' + esc(c.name(id)) + '</b></button>';
      }).join('') + '</div>';
  }
  function screenPick() {
    return '<section class="ps-pickscreen"><h2 class="ps-h">' + esc(T('pickH')) + '</h2>' + pickerHTML(ST.pickSel) +
      '<div class="ps-endbtns"><button type="button" class="tl-btn primary lg" data-ps="pickdone"' + (ST.pickSel ? '' : ' disabled') + '>' + esc(T('done')) + '</button></div></section>';
  }

  function screenHTML() {
    if (!window.LUTalk) return '';
    if (!ST.screen) ST.screen = cfg().guide ? 'start' : 'pick';
    if (ST.screen === 'pick') return screenPick();
    if (ST.screen === 'sort' && cur()) return screenSort();
    if (ST.screen === 'seesaw' && cur()) return screenSeesaw();
    if (ST.screen === 'summary') return screenSummary();
    ST.screen = 'start'; return screenStart();
  }
  var GEAR = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>';
  function topHTML() {
    var tb = X.topbar(T('title'), '', { help: 'sorter' });
    var gear = '<button type="button" class="tl-iconbtn ps-gear" data-ps="settings" aria-label="' + esc(T('settings')) + '">' + GEAR + '</button>';
    return tb.indexOf('<button type="button" class="tl-profbtn"') >= 0 ? tb.replace('<button type="button" class="tl-profbtn"', gear + '<button type="button" class="tl-profbtn"') : tb.replace(/<\/div>$/, gear + '</div>');
  }
  function page() {
    addCSS();
    setTimeout(post, 0);
    return '<div class="tl-page ps-page">' + topHTML() + '<div class="ps-app" id="psApp">' + screenHTML() + '</div><div class="ps-sr" aria-live="polite" id="psLive"></div></div>';
  }
  function draw() { var el = document.getElementById('psApp'); if (!el) return; el.innerHTML = screenHTML(); post(); }
  function say(msg) { var el = document.getElementById('psLive'); if (!el) return; el.textContent = ''; setTimeout(function () { el.textContent = msg; }, 60); }
  function $(s) { return document.querySelector(s); }

  /* ===================== motion ===================== */
  var SEQ = { t: [], a: [] }, FAST = false;
  function anim(el, frames, opts) {
    if (!el || !el.animate || FAST || reduced()) return null;
    var a = el.animate(frames, Object.assign({ easing: 'cubic-bezier(.2,.8,.2,1)' }, opts));
    SEQ.a.push(a); a.onfinish = a.oncancel = function () { SEQ.a = SEQ.a.filter(function (x) { return x !== a; }); };
    return a;
  }
  function fade(el, ms) { if (!el || !el.animate || FAST) return; el.animate([{ opacity: 0.25 }, { opacity: 1 }], { duration: ms || 220, easing: 'ease-out' }); }
  function later(fn, ms) { if (FAST) return fn(); var o = { fn: fn }; o.id = setTimeout(function () { SEQ.t = SEQ.t.filter(function (x) { return x !== o; }); fn(); }, ms); SEQ.t.push(o); }
  function busy() { return SEQ.t.length > 0; }
  function clearSeq() { SEQ.t.forEach(function (o) { clearTimeout(o.id); }); SEQ.t = []; SEQ.a.slice().forEach(function (a) { try { a.cancel(); } catch (e) { } }); SEQ.a = []; }
  // a tap (or Enter / Space) during the seesaw sequence jumps straight to the end
  function skipSeq() {
    var pend = SEQ.t.slice(); SEQ.t = []; pend.forEach(function (o) { clearTimeout(o.id); });
    SEQ.a.slice().forEach(function (a) { try { a.finish(); } catch (e) { } }); SEQ.a = [];
    FAST = true; try { pend.forEach(function (o) { o.fn(); }); } finally { FAST = false; }
  }
  function guideMove(kind, el) {
    el = el || $('#psApp .ps-guide'); if (!el) return;
    if (kind === 'happy') anim(el, [{ transform: 'none' }, { transform: 'translateY(-14px)', offset: .4 }, { transform: 'translateY(0) scale(1.03,.97)', offset: .75 }, { transform: 'none' }], { duration: 480 });
    else if (kind === 'calm') anim(el, [{ transform: 'none' }, { transform: 'translateY(3px) scale(1.03)' }, { transform: 'none' }], { duration: 900, easing: 'ease-in-out' });
    else if (kind === 'present') anim(el, [{ transform: 'none' }, { transform: 'rotate(-6deg) translateY(-4px)' }, { transform: 'none' }], { duration: 420 });
    else anim(el, [{ transform: 'none' }, { transform: 'rotate(-8deg)', offset: .35 }, { transform: 'rotate(4deg)', offset: .7 }, { transform: 'none' }], { duration: 620 });
  }
  // how each style's object reacts when a card lands in its zone
  var REACT = {
    rocks: [{ transform: 'rotate(0)' }, { transform: 'rotate(-6deg)' }, { transform: 'rotate(5deg)' }, { transform: 'rotate(-3deg)' }, { transform: 'rotate(0)' }],
    animals: [{ transform: 'none' }, { transform: 'translateY(-14px)', offset: .35 }, { transform: 'translateY(0) scale(1.08,.92)', offset: .65 }, { transform: 'none' }],
    bags: [{ transform: 'none' }, { transform: 'scale(1.06,.88)', offset: .3 }, { transform: 'scale(.97,1.04)', offset: .65 }, { transform: 'none' }],
    bubbles: [{ transform: 'scale(.6)', opacity: .4 }, { transform: 'scale(1.16)', opacity: 1, offset: .55 }, { transform: 'none' }],
    weather: [{ transform: 'none' }, { transform: 'scale(1.12) translateX(-3px)', offset: .4 }, { transform: 'scale(.96) translateX(3px)', offset: .75 }, { transform: 'none' }],
    waves: [{ transform: 'none' }, { transform: 'translateX(-7px) skewX(6deg)', offset: .35 }, { transform: 'translateX(6px) skewX(-5deg)', offset: .7 }, { transform: 'none' }]
  };

  /* ---------- sorting (activities 1 and 2) ---------- */
  function zoneEl(sz) { return document.querySelector('.ps-zone[data-v="' + sz + '"]'); }
  function hit(x, y) {
    for (var i = 0; i < SIZES.length; i++) { var el = zoneEl(SIZES[i]); if (!el) continue; var r = el.getBoundingClientRect(); if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return SIZES[i]; }
    return null;
  }
  function hover(sz) { SIZES.forEach(function (s) { var el = zoneEl(s); if (el) el.classList.toggle('is-hover', s === sz); }); }
  function dragT(dx, dy) { var tilt = reduced() ? 0 : Math.max(-9, Math.min(9, dx / 18)); return 'translate(' + dx + 'px,' + dy + 'px) rotate(' + tilt + 'deg) scale(' + (reduced() ? 1 : 1.04) + ')'; }
  function wireCard() {
    var c = document.getElementById('psCard'); if (!c) return;
    c.addEventListener('pointerdown', function (e) {
      if (ST.phase !== 'present' || (e.button && e.button !== 0)) return;
      e.preventDefault();
      try { c.setPointerCapture(e.pointerId); } catch (er) { }
      var d = { x: e.clientX, y: e.clientY, dx: 0, dy: 0 };
      c.classList.add('is-drag');
      function move(ev) { d.dx = ev.clientX - d.x; d.dy = ev.clientY - d.y; c.style.transform = dragT(d.dx, d.dy); hover(hit(ev.clientX, ev.clientY)); }
      function up(ev) {
        c.removeEventListener('pointermove', move); c.removeEventListener('pointerup', up); c.removeEventListener('pointercancel', up);
        var z = ev.type === 'pointerup' ? hit(ev.clientX, ev.clientY) : null;
        hover(null); c.classList.remove('is-drag');
        if (z) return place(z, d);
        var from = c.style.transform; c.style.transform = '';
        anim(c, [{ transform: from || 'none' }, { transform: 'none' }], { duration: 260, easing: 'cubic-bezier(.3,1.4,.5,1)' });
      }
      c.addEventListener('pointermove', move); c.addEventListener('pointerup', up); c.addEventListener('pointercancel', up);
    });
  }
  function place(sz, d) {
    if (ST.phase !== 'present') return;
    ST.phase = 'placing';
    var card = document.getElementById('psCard'), zone = zoneEl(sz), fired = false;
    function done() { if (fired) return; fired = true; finishPlace(sz); }
    var guard = setTimeout(done, 450);
    if (!card || !zone || reduced()) { clearTimeout(guard); return done(); }
    var from = d ? card.style.transform : 'none', dx = d ? d.dx : 0, dy = d ? d.dy : 0;
    var cr = card.getBoundingClientRect(), zr = zone.getBoundingClientRect();
    // from where the card sits now (cr already includes any drag offset) to the middle of the zone
    var tx = dx + (zr.left + zr.width / 2) - (cr.left + cr.width / 2), ty = dy + (zr.top + zr.height * .4) - (cr.top + cr.height / 2);
    var a = card.animate([{ transform: from || 'none', opacity: 1 }, { transform: 'translate(' + tx + 'px,' + ty + 'px) rotate(' + (tx > 0 ? 8 : -8) + 'deg) scale(.18)', opacity: .15 }], { duration: 300, easing: 'cubic-bezier(.5,0,.75,.4)', fill: 'forwards' });
    a.onfinish = function () { clearTimeout(guard); done(); };
  }
  function finishPlace(sz) {
    var card = cur();
    ST.results.push({ card: card, choice: sz });
    ST.phase = 'reflect'; ST.fx = 'reflect'; ST.lastZone = sz;
    draw();
  }
  function nextCard() {
    if (ST.idx + 1 >= ST.round.length) { ST.screen = 'summary'; ST.fx = 'summary'; draw(); scrollTop(); return; }
    ST.idx++; ST.phase = 'present'; ST.fx = 'enter'; draw();
  }

  /* ---------- the seesaw (activity 3) ---------- */
  function sc(sel) { return document.querySelector('#psScene ' + sel); }
  function rot(x, y, deg) { var a = deg * Math.PI / 180, dx = x - PIV.x, dy = y - PIV.y; return [PIV.x + dx * Math.cos(a) - dy * Math.sin(a), PIV.y + dx * Math.sin(a) + dy * Math.cos(a)]; }
  function setAngle(deg) {
    ST.angle = deg;
    var pl = sc('.ps-plank'); if (pl) pl.style.transform = 'rotate(' + deg + 'deg)';
    ['L', 'R'].forEach(function (s) { var el = sc('.ps-sh' + s), l = shadowLook(s, deg); if (el) { el.style.transform = 'scale(' + l.s + ')'; el.style.opacity = l.o; } });
  }
  function swing(keys, offs, dur) {
    var pl = sc('.ps-plank'); if (!pl) return;
    anim(pl, keys.map(function (k, i) { return { transform: 'rotate(' + k + 'deg)', offset: offs[i] }; }), { duration: dur, easing: 'ease-out' });
    ['L', 'R'].forEach(function (s) { anim(sc('.ps-sh' + s), keys.map(function (k, i) { var l = shadowLook(s, k); return { transform: 'scale(' + l.s + ')', opacity: +l.o, offset: offs[i] }; }), { duration: dur, easing: 'ease-out' }); });
  }
  function effect(kind, x, y, big) {
    var layer = sc('.ps-fx'); if (!layer || FAST || reduced()) return;
    var g = document.createElementNS('http://www.w3.org/2000/svg', 'g'), s = big ? 1.5 : 1, parts = [], i;
    if (kind === 'dust' || kind === 'fluff') {
      var col = kind === 'dust' ? '#E3D9C8' : '#FFFFFF';
      for (i = 0; i < 5; i++) parts.push({ el: '<circle cx="' + x + '" cy="' + y + '" r="' + (5 * s) + '" fill="' + col + '" stroke="' + K + '" stroke-width="1.6" stroke-opacity=".5"/>', dx: (i - 2) * 16 * s, dy: -6 - (i % 2) * 8 });
    } else if (kind === 'splash') {
      for (i = 0; i < 6; i++) parts.push({ el: '<path d="M' + x + ' ' + y + 'q-3 5 0 7q3-2 0-7Z" fill="#9CCBF2" stroke="' + K + '" stroke-width="1.4"/>', dx: (i - 2.5) * 12 * s, dy: -18 - (i % 3) * 8 });
    } else if (kind === 'pop') {
      for (i = 0; i < 7; i++) { var a = -Math.PI + i * Math.PI / 6; parts.push({ el: '<path d="M' + (x + Math.cos(a) * 14) + ' ' + (y + Math.sin(a) * 14) + 'L' + (x + Math.cos(a) * 22) + ' ' + (y + Math.sin(a) * 22) + '" stroke="#F0A93A" stroke-width="3" stroke-linecap="round"/>', dx: Math.cos(a) * 10, dy: Math.sin(a) * 10 }); }
    }
    g.innerHTML = parts.map(function (p) { return '<g>' + p.el + '</g>'; }).join('');
    layer.appendChild(g);
    [].forEach.call(g.children, function (el, j) { var p = parts[j]; el.animate([{ transform: 'translate(0,0) scale(.4)', opacity: 1 }, { transform: 'translate(' + p.dx + 'px,' + p.dy + 'px) scale(1)', opacity: 0 }], { duration: 520, easing: 'ease-out', fill: 'forwards' }); el.style.transformBox = 'fill-box'; el.style.transformOrigin = 'center'; });
    setTimeout(function () { g.remove(); }, 600);
  }
  var LAND_R = { bubbles: 'pop', weather: 'fluff', waves: 'splash' }, LAND_P = { rocks: 'dust', animals: 'fluff', bags: 'dust' };
  function setGuide(mood, move) {
    var gw = sc('.ps-gw'); if (!gw) return;
    gw.innerHTML = nestChar(guideId(), mood, 424, 208, 86, true);
    if (move) anim(gw, mood === 'happy' ? [{ transform: 'none' }, { transform: 'translateY(-14px)', offset: .4 }, { transform: 'none' }] : [{ transform: 'none' }, { transform: 'rotate(-5deg)', offset: .4 }, { transform: 'none' }], { duration: 480 });
  }
  function ssPaint() {
    var m = $('#psSsMsg p'); if (m) m.textContent = ssMsgText();
    var p = cur(), o = ST.phase === 'result' && ST.pick ? outcomeOf(p, ST.pick) : null, pill = $('#psOutcome');
    if (pill) { pill.hidden = !o; pill.textContent = o ? T(OUT[o]) : ''; }
    var s = $('#psScene'); if (s) s.setAttribute('aria-label', sceneAria());
    var c = $('#psSsCards'); if (c) c.innerHTML = ssCardsHTML();
    var h = $('#psHand'); if (h) h.innerHTML = handHTML();
    var b = $('#psSsBtns'); if (b) b.innerHTML = ssBtnsHTML();
    var bars = $('#psApp .ps-bar'); if (bars) bars.outerHTML = bar();
  }
  function arrive() {
    // the problem card and its closed box drop onto the tray; the plank dips, then settles a little to the problem side
    var lt = sc('.ps-lt');
    if (reduced()) { setAngle(-5); fade($('#psScene svg'), 240); return; }
    setAngle(-5);
    anim(lt, [{ transform: 'translateY(-90px)', opacity: 0 }, { transform: 'translateY(4px) scaleY(.94)', opacity: 1, offset: .7 }, { transform: 'none' }], { duration: 380 });
    swing([0, 0, -9, -3.5, -5], [0, .55, .75, .9, 1], 620);
    later(function () { var pt = rot(LC + 12, 192, -5); effect(LAND_P[cfg().ps] || 'dust', pt[0], pt[1]); }, 260);
    var hand = $('#psHand'); anim(hand, [{ transform: 'translateY(16px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 300, delay: 120, fill: 'backwards' });
  }
  function pickReaction(i) {
    if (ST.phase !== 'pick') return;
    var r = ST.hand[i], p = cur(); if (!r || r === ST.pick) return;
    var o = outcomeOf(p, r), target = angleFor(p, r), swap = !!ST.pick, wasOpen = ST.open;
    if (!ST.first[ST.idx]) ST.first[ST.idx] = { problem: p, reaction: r, outcome: o };
    ST.pick = r; ST.phase = 'moving';
    ssPaint();
    var rt = sc('.ps-rt'), lt = sc('.ps-lt');
    function finish() {
      ST.phase = 'result'; setAngle(target); ssPaint();
      setGuide(ssMood(p, o), true);
      var msg = $('#psSsMsg'); anim(msg, [{ transform: 'scale(.96)', opacity: .3 }, { transform: 'none', opacity: 1 }], { duration: 240 });
      say(T(OUT[o]) + '. ' + ssMsg(p, o));
      var n = document.getElementById('psNext'); if (n) n.focus({ preventScroll: true });
    }
    if (reduced()) {
      if (rt) rt.innerHTML = rightTray(r);
      if (lt && !wasOpen) { ST.open = true; lt.innerHTML = leftTray(p, true); }
      ST.open = true; finish(); fade($('#psScene svg'), 260); return;
    }
    var t = 0;
    function drop() {
      if (rt) { if (rt.getAnimations) rt.getAnimations().forEach(function (x) { x.cancel(); }); rt.innerHTML = rightTray(r); }
      anim(rt, [{ transform: 'translateY(-80px)', opacity: 0 }, { transform: 'translateY(3px) scale(1.04,.86)', opacity: 1, offset: .72 }, { transform: 'none' }], { duration: 320 });
      later(function () { var pt = rot(RC - 12, 178, ST.angle); effect(LAND_R[cfg().rs] || 'pop', pt[0], pt[1] - 20); }, 250);
    }
    if (swap) { anim(rt, [{ transform: 'none', opacity: 1 }, { transform: 'translateY(-60px)', opacity: 0 }], { duration: 160, fill: 'forwards' }); later(drop, 160); t = 160; } else drop();
    t += 380;
    if (!wasOpen) {
      // the box opens: the lid lifts away, the box fades and the problem's object pops up
      later(function () {
        var lid = sc('.ps-lid'), box = sc('.ps-boxb'), po = sc('.ps-pobj');
        anim(lid, [{ transform: 'none', opacity: 1 }, { transform: 'translate(-14px,-46px) rotate(-24deg)', opacity: 0 }], { duration: 320, easing: 'ease-in', fill: 'forwards' });
        anim(box, [{ opacity: 1 }, { opacity: 0 }], { duration: 260, delay: 120, fill: 'forwards' });
        later(function () {
          if (po) { po.style.opacity = ''; anim(po, [{ transform: 'translateY(26px) scale(.3)', opacity: 0 }, { transform: 'translateY(-8px) scale(1.12)', opacity: 1, offset: .6 }, { transform: 'none' }], { duration: 340 }); }
          var b = sc('.ps-box'); if (b) b.remove();
          ST.open = true;
        }, 200);
      }, t);
      t += 460;
    }
    // the plank: a small wobble, then a springy swing that overshoots and settles; the ends thud
    later(function () {
      var a0 = ST.angle, d = target - a0, ov = d * .3, keys, offs;
      if (Math.abs(d) < .01) { keys = [a0, a0 + 1.8, a0 - 1.2, a0 + .5, a0]; offs = [0, .3, .6, .82, 1]; }
      else { keys = [a0, a0 - (d > 0 ? 1.4 : -1.4), target + ov, target - ov * .5, target + ov * .15, target]; offs = [0, .14, .46, .68, .86, 1]; }
      setAngle(target); swing(keys, offs, 760);
      anim(lt, [{ transform: 'rotate(0)' }, { transform: 'rotate(-2deg)', offset: .3 }, { transform: 'rotate(1.6deg)', offset: .55 }, { transform: 'rotate(-.8deg)', offset: .8 }, { transform: 'rotate(0)' }], { duration: 700 });
      anim(rt, [{ transform: 'rotate(0)' }, { transform: 'rotate(2deg)', offset: .3 }, { transform: 'rotate(-1.6deg)', offset: .55 }, { transform: 'rotate(.8deg)', offset: .8 }, { transform: 'rotate(0)' }], { duration: 700 });
      if (target !== 0) later(function () { effect('dust', target > 0 ? 712 : 88, 318, true); }, Math.round(760 * .46));
      else later(function () { var sp = sc('.ps-spark'); if (sp) { sp.style.opacity = '1'; anim(sp, [{ transform: 'scale(.4)', opacity: 0 }, { transform: 'scale(1.1)', opacity: 1, offset: .5 }, { transform: 'scale(1)', opacity: 0 }], { duration: 700 }); setTimeout(function () { sp.style.opacity = '0'; }, 720); } }, 520);
      later(finish, 780);
    }, t);
  }
  function tryAnother() { if (ST.phase !== 'result') return; ST.phase = 'pick'; ssPaint(); say(T('ssPick')); var b = $('#psHand .ps-hcard:not([aria-disabled])'); if (b) b.focus(); }
  function ssNext() {
    if (ST.idx + 1 >= ST.round.length) { ST.screen = 'summary'; ST.fx = 'summary'; clearSeq(); draw(); scrollTop(); return; }
    clearSeq(); ST.idx++; ST.phase = 'pick'; ST.pick = null; ST.open = false; ST.angle = 0; ST.hand = dealHand(cur()); ST.fx = 'enter'; draw();
  }

  /* ---------- after every draw: entrances, focus and announcements ---------- */
  function post() {
    var app = document.getElementById('psApp'); if (!app) return;
    var fxk = ST.fx; ST.fx = '';
    if (ST.screen === 'sort') {
      wireCard();
      if (fxk === 'enter') {
        var deckEl = document.getElementById('psDeck');
        if (reduced()) fade(deckEl, 200);
        else anim(deckEl, [{ transform: 'translate(-160px,40px) rotate(-12deg) rotateY(75deg)', opacity: 0 }, { transform: 'translate(10px,-4px) rotate(1.5deg) rotateY(0)', opacity: 1, offset: .7 }, { transform: 'none', opacity: 1 }], { duration: 440 });
        guideMove('present');
        var c = document.getElementById('psCard'); if (c) c.focus({ preventScroll: true });
        say(T('cardOf', ST.idx + 1, ST.round.length) + '. ' + cur().text);
      }
      if (fxk === 'reflect') {
        var last = ST.results[ST.results.length - 1], m = msgFor(last.card, last.choice), msg = document.getElementById('psMsg');
        if (reduced()) fade(msg, 200); else anim(msg, [{ transform: 'translateY(12px) scale(.94)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 260 });
        guideMove(moodFor(m.kind));
        var z = zoneEl(ST.lastZone), o = z && z.querySelector('.ps-o'), st = z && z.getAttribute('data-st');
        if (o) { o.style.transformBox = 'fill-box'; o.style.transformOrigin = '50% 100%'; if (reduced()) fade(o, 200); else anim(o, REACT[st] || REACT.rocks, { duration: 460 }); }
        var nb = document.getElementById('psNext'); if (nb) nb.focus({ preventScroll: true });
        say(T('youChose') + ' ' + zoneWord(modeKind(), last.choice) + '. ' + m.text);
      }
    }
    if (ST.screen === 'seesaw') {
      var scene = document.getElementById('psScene');
      if (scene && !scene._ps) { scene._ps = 1; scene.addEventListener('click', function () { if (busy()) skipSeq(); }); }
      if (fxk === 'enter') { arrive(); say(T('cardOf', ST.idx + 1, ST.round.length) + '. ' + T('problem') + ': ' + cur().text + '. ' + T('ssPick')); var hb = $('#psHand .ps-hcard'); if (hb) hb.focus({ preventScroll: true }); }
    }
    if (ST.screen === 'summary' && fxk === 'summary') {
      var g = $('#psApp .ps-guide');
      if (reduced()) fade(g, 300);
      else anim(g, [{ transform: 'none' }, { transform: 'translateY(-12px) rotate(-4deg)', offset: .25 }, { transform: 'none', offset: .5 }, { transform: 'translateY(-8px) rotate(4deg)', offset: .75 }, { transform: 'none' }], { duration: 1000, easing: 'ease-in-out' });
      var ag = document.getElementById('psAgain'); if (ag) ag.focus({ preventScroll: true });
      say(T('roundDone'));
    }
  }

  /* ===================== sheets: sizes, settings, guide picker, your own cards ===================== */
  function defsHTML() {
    var c = cfg();
    function grid(kind, st) {
      return '<div class="ps-defs">' + SIZES.map(function (sz) { return '<div class="ps-def sz-' + sz + '"><span class="ps-dart">' + objSVG(st, sz) + '</span><b>' + esc(zoneWord(kind, sz)) + '</b><span>' + esc(def(kind, sz, true)) + '</span></div>'; }).join('') + '</div>';
    }
    return '<h2 class="tl-h2">' + esc(T('sizesBtn')) + '</h2><h3 class="ps-h3">' + esc(T('defsP')) + '</h3>' + grid('problem', c.ps) +
      '<h3 class="ps-h3">' + esc(T('defsR')) + '</h3><p class="tl-p ps-p">' + esc(T('reactIs')) + '</p>' + grid('reaction', c.rs) + '<p class="tl-p ps-p">' + esc(T('reactBased')) + '</p>' +
      '<button type="button" class="tl-btn primary lg block" data-close>' + esc(T('done')) + '</button>';
  }
  function openDefs() { var sh = X.sheet(defsHTML()); sh.wrap.classList.add('tall', 'ps-sheet'); sh.el.onclick = function (e) { if (e.target.closest('[data-close]')) sh.close(); }; }

  function settingsHTML() {
    var c = cfg(), g = guideId(), ok = plusOK(), dm = deckMode();
    var opt = function (key, st) { return '<button type="button" class="tl-opt ps-sopt' + (c[key] === st ? ' on' : '') + '" data-ps="' + key + '" data-v="' + st + '" aria-pressed="' + (c[key] === st) + '">' + trio(st) + '<b>' + esc(styleName(st)) + '</b></button>'; };
    var deckBtn = function (v, lab, locked) { return '<button type="button" data-ps="deck" data-v="' + v + '" class="' + (dm === v ? 'on' : '') + '" aria-pressed="' + (dm === v) + '">' + esc(T(lab)) + (locked ? ' <span class="ps-lock">' + LOCK + esc(T('plus')) + '</span>' : '') + '</button>'; };
    return '<h2 class="tl-h2">' + esc(T('settings')) + '</h2>' +
      '<div class="tl-lab2">' + esc(T('sGuide')) + '</div><div class="tl-panel"><div class="tl-row"><span class="ps-sava" style="background:' + CH().tint(g) + '">' + charSVG(g, 'idle', false) + '</span><div><b>' + esc(charName(g)) + '</b></div><button type="button" class="tl-btn outline sm" data-ps="guide">' + esc(T('change')) + '</button></div></div>' +
      '<div class="tl-lab2">' + esc(T('sProblem')) + '</div><div class="ps-stylegrid">' + PSTYLES.map(function (s) { return opt('ps', s); }).join('') + '</div>' +
      '<div class="tl-lab2">' + esc(T('sReaction')) + '</div><div class="ps-stylegrid">' + RSTYLES.map(function (s) { return opt('rs', s); }).join('') + '</div>' +
      '<div class="tl-lab2">' + esc(T('sPer')) + '</div>' + X.seg('psper', [[5, '5'], [10, '10'], [15, '15']], c.per) +
      (plusHidden() ? '' : '<div class="tl-lab2">' + esc(T('sDeck')) + '</div><div class="tl-seg ps-deckseg" role="group">' + deckBtn('starter', 'dStarter') + deckBtn('mine', 'dMine', !ok) + deckBtn('both', 'dBoth', !ok) + '</div>') +
      '<div class="tl-panel">' + X.row(esc(T('sMeanings')), '', X.toggle('meanings', c.meanings)) + '</div>' +
      '<button type="button" class="tl-btn primary lg block" data-close>' + esc(T('done')) + '</button>';
  }
  function openSettings() {
    var sh = X.sheet(settingsHTML()); sh.wrap.classList.add('tall', 'ps-sheet');
    sh.el.onclick = function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (b.hasAttribute('data-close')) return sh.close();
      var c = cfg(), a = b.getAttribute('data-ps'), v = b.getAttribute('data-v');
      if (a === 'guide') { sh.close(); return openPicker(); }
      if (a === 'ps' || a === 'rs') c[a] = v;
      else if (b.getAttribute('data-seg') === 'psper') c.per = +b.getAttribute('data-v');
      else if (a === 'deck') { if (v !== 'starter' && !plusOK()) return showLock(); c.deck = v; }
      else if (b.getAttribute('data-tog') === 'meanings') c.meanings = b.getAttribute('aria-checked') !== 'true';
      else return;
      keepCfg(); sh.set(settingsHTML()); redrawLive();
    };
  }
  // style changes show straight away; on the seesaw only the tray contents are redrawn, so the round carries on
  function redrawLive() {
    if (ST.screen === 'seesaw' && cur()) {
      var lt = sc('.ps-lt'), rt = sc('.ps-rt');
      if (lt) lt.innerHTML = leftTray(cur(), ST.open);
      if (rt) rt.innerHTML = rightTray(ST.phase === 'moving' ? null : ST.pick);
      var h = $('#psHand'); if (h) h.innerHTML = handHTML();
      var gw = sc('.ps-gw'); if (gw) gw.innerHTML = nestChar(guideId(), ST.phase === 'result' && ST.pick ? ssMood(cur(), outcomeOf(cur(), ST.pick)) : 'present', 424, 208, 86, true);
      return;
    }
    if (ST.screen === 'sort' && ST.phase === 'placing') return;
    draw();
  }
  function openPicker() {
    var sel = guideId(); ST.ctab = (CH() && CH().group(sel)) || 'a';
    var sh = X.sheet(''); sh.wrap.classList.add('tall', 'ps-sheet');
    function paint() { sh.set('<h2 class="tl-h2">' + esc(T('pickH')) + '</h2>' + pickerHTML(guideId(), true) + '<button type="button" class="tl-btn primary lg block" data-close>' + esc(T('done')) + '</button>'); }
    paint();
    sh.el.onclick = function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (b.hasAttribute('data-close')) return sh.close();
      var a = b.getAttribute('data-ps'), v = b.getAttribute('data-v'), c = cfg();
      if (a === 'ctab') ST.ctab = v;
      else if (a === 'pickch') c.guide = v;
      else if (a === 'surprise') { c.guide = randomChar(c.guide); ST.ctab = CH().group(c.guide); }
      else return;
      if (a !== 'ctab') { keepCfg(); redrawLive(); }
      var y = sh.el.scrollTop; paint(); sh.el.scrollTop = y;
    };
  }
  function randomChar(not) { var ids = CH().ids.filter(function (id) { return id !== not; }); return ids[Math.floor(Math.random() * ids.length)]; }

  // the grown-up's own cards (Plus)
  function openAdd() {
    if (!plusOK()) return showLock();
    var F = { type: 'problem', text: '', size: null, reason: '', edit: null, err: '' };
    var sh = X.sheet(''); sh.wrap.classList.add('tall', 'ps-sheet');
    function sizeLab(sz) { return F.type === 'reaction' ? zoneWord('reaction', sz) : T(sz); }
    function paint(focus) {
      var c = cfg(), list = c.cards, isR = F.type === 'reaction';
      var seg = function (name, opts, curV) { return '<div class="tl-seg" role="group">' + opts.map(function (o) { var on = String(curV) === String(o[0]); return '<button type="button" data-ps="' + name + '" data-v="' + o[0] + '" class="' + (on ? 'on' : '') + '" aria-pressed="' + on + '">' + esc(o[1]) + '</button>'; }).join('') + '</div>'; };
      var h = '<h2 class="tl-h2">' + esc(T('addBtn')) + '</h2>' +
        '<div class="tl-lab2">' + esc(T('cardType')) + '</div>' + seg('ftype', [['problem', T('typeP')], ['reaction', T('typeR')]], F.type) +
        '<label class="tl-field ps-field"><span>' + esc(T(isR ? 'labR' : 'labP')) + '</span><textarea id="psFText" rows="2" placeholder="' + esc(T(isR ? 'phR' : 'phP')) + '">' + esc(F.text) + '</textarea>' + (isR ? '<small>' + esc(T('firstPerson')) + '</small>' : '') + '</label>' +
        (F.err ? '<p class="ps-err" role="alert">' + esc(F.err) + '</p>' : '') +
        '<div class="tl-lab2">' + esc(T('usualSize')) + ' <small>' + esc(T('optional')) + '</small></div>' + seg('fsize', SIZES.map(function (s) { return [s, sizeLab(s)]; }).concat([['', T('notSet')]]), F.size || '') +
        '<label class="tl-field ps-field"><span>' + esc(T('reasonL')) + ' <small>' + esc(T('optional')) + '</small></span><input id="psFReason" type="text" value="' + esc(F.reason) + '" placeholder="' + esc(T(isR ? 'phReasonR' : 'phReasonP')) + '"></label>' +
        '<div class="ps-frow">' + (F.edit ? '<button type="button" class="tl-btn quiet" data-ps="fcancel">' + esc(T('cancel')) + '</button>' : '') + '<button type="button" class="tl-btn primary" data-ps="fsave">' + esc(T(F.edit ? 'saveCard' : 'addCard')) + '</button></div>' +
        '<p class="tl-note2 ps-note">' + esc(T('noSizeNote')) + '</p>';
      if (list.length) {
        h += '<div class="tl-lab2">' + esc(T('yourCards', list.length)) + '</div><div class="tl-panel">' + list.map(function (cd) {
          var meta = T(cd.kind === 'reaction' ? 'reaction' : 'problem') + ' · ' + (cd.size ? (cd.kind === 'reaction' ? zoneWord('reaction', cd.size) : T(cd.size)) : T('noUsual')) + (cd.reason ? ' · ' + cd.reason : '');
          return '<div class="tl-row ps-crowi"><div><b>' + esc(cd.text) + '</b><small>' + esc(meta) + '</small></div><button type="button" class="tl-btn outline sm" data-ps="fedit" data-v="' + esc(cd.id) + '">' + esc(T('edit')) + '</button><button type="button" class="tl-btn quiet sm ps-del" data-ps="fdel" data-v="' + esc(cd.id) + '"><b>' + esc(T('remove')) + '</b></button></div>';
        }).join('') + '</div>';
      }
      h += '<button type="button" class="tl-btn outline lg block" data-close>' + esc(T('done')) + '</button>';
      var y = sh.el.scrollTop; sh.set(h); sh.el.scrollTop = y;
      var ta = sh.el.querySelector('#psFText'), ri = sh.el.querySelector('#psFReason');
      ta.oninput = function () { F.text = ta.value; }; ri.oninput = function () { F.reason = ri.value; };
      if (focus) setTimeout(function () { ta.focus(); }, 40);
    }
    paint(true);
    sh.el.onclick = function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (b.hasAttribute('data-close')) return sh.close();
      var a = b.getAttribute('data-ps'), v = b.getAttribute('data-v'), c = cfg();
      if (a === 'ftype') { F.type = v; F.err = ''; return paint(); }
      if (a === 'fsize') { F.size = v || null; return paint(); }
      if (a === 'fcancel') { F = { type: F.type, text: '', size: null, reason: '', edit: null, err: '' }; return paint(true); }
      if (a === 'fedit') { var cd = c.cards.filter(function (x) { return x.id === v; })[0]; if (!cd) return; F = { type: cd.kind, text: cd.text, size: cd.size || null, reason: cd.reason || '', edit: cd.id, err: '' }; sh.el.scrollTop = 0; return paint(true); }
      if (a === 'fdel') {
        if (!b.dataset.sure) { b.dataset.sure = '1'; b.querySelector('b').textContent = T('removeSure'); return; }
        c.cards = c.cards.filter(function (x) { return x.id !== v; }); if (F.edit === v) F.edit = null; keepCfg(); return paint();
      }
      if (a === 'fsave') {
        var text = F.text.trim().replace(/\s+/g, ' ');
        if (!text) { F.err = T('needText'); return paint(true); }
        if (F.type === 'reaction' && !/^I(\s|’|')/.test(text)) { F.err = T('needI'); return paint(true); }
        var card = { id: F.edit || 'c' + Date.now().toString(36), kind: F.type, text: text, size: F.size || null, reason: F.reason.trim(), custom: true };
        if (F.edit) c.cards = c.cards.map(function (x) { return x.id === F.edit ? card : x; }); else c.cards.push(card);
        keepCfg();
        F = { type: F.type, text: '', size: null, reason: '', edit: null, err: '' };
        return paint(true);
      }
    };
  }
  // custom cards come back from storage as plain objects: mark them so the card shows "Your card"
  function markCustom() { try { cfg().cards.forEach(function (c) { c.custom = true; c.safety = false; c.h = false; }); } catch (e) { } }

  /* ===================== clicks and keys ===================== */
  function click(b, e) {
    var a = b.getAttribute('data-ps'); if (!a) return false;
    var v = b.getAttribute('data-v');
    if (b.getAttribute('aria-disabled') === 'true') return true;
    switch (a) {
      case 'settings': openSettings(); break;
      case 'defs': openDefs(); break;
      case 'add': openAdd(); break;
      case 'mode': markCustom(); startMode(+v); break;
      case 'tostart': toStart(); break;
      case 'zone': place(v, null); break;
      case 'next': nextCard(); break;
      case 'hand': pickReaction(+v); break;
      case 'tryother': tryAnother(); break;
      case 'ssnext': ssNext(); break;
      case 'again': markCustom(); startMode(ST.mode); break;
      case 'ctab': ST.ctab = v; draw(); break;
      case 'pickch': ST.pickSel = v; draw(); break;
      case 'surprise': ST.pickSel = randomChar(ST.pickSel); ST.ctab = CH().group(ST.pickSel); draw(); break;
      case 'pickdone': if (ST.pickSel) { cfg().guide = ST.pickSel; keepCfg(); ST.screen = 'start'; ST.fx = 'start'; draw(); scrollTop(); } break;
      default: return false;
    }
    return true;
  }
  document.addEventListener('keydown', function (e) {
    if (!document.getElementById('psApp') || e.ctrlKey || e.metaKey || e.altKey) return;
    if (document.querySelector('.tl-sheetwrap, .la-scrim')) return;
    var t = e.target; if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
    if (ST.screen === 'seesaw' && busy() && (e.key === ' ' || e.key === 'Enter')) { e.preventDefault(); skipSeq(); return; }
    var i = ['1', '2', '3'].indexOf(e.key); if (i < 0) return;
    if (ST.screen === 'sort' && ST.phase === 'present') { e.preventDefault(); place(SIZES[i], null); }
    else if (ST.screen === 'seesaw' && ST.phase === 'pick') { e.preventDefault(); pickReaction(i); }
  });
  // leaving the page stops any running motion
  function leaveWatch() { if (!document.getElementById('psApp')) clearSeq(); }
  window.addEventListener('hashchange', function () { setTimeout(leaveWatch, 50); });

  /* ===================== styles ===================== */
  var CSS = [
    '.ps-page{gap:16px}',
    '.ps-app{container-type:inline-size;display:flex;flex-direction:column;gap:18px;-webkit-tap-highlight-color:transparent;min-width:0}',
    '.ps-app *{box-sizing:border-box}',
    '.ps-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}',
    '.ps-app svg{display:block}',
    '.ps-eyebrow{margin:0;font:700 12px Figtree,sans-serif;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)}',
    '.ps-h{margin:0;font:600 clamp(26px,4cqw,36px)/1.1 Fredoka,sans-serif}',
    '.ps-h2{margin:0;font:600 22px/1.2 Fredoka,sans-serif}',
    '.ps-mt{font-size:13px;font-weight:700;color:var(--muted)}',
    '.ps-guide{flex:none;width:150px;aspect-ratio:100/128}',
    '.ps-guide svg{width:100%;height:100%}',
    '.ps-lock{display:inline-flex;align-items:center;gap:4px;padding:3px 8px 3px 6px;border-radius:999px;background:var(--ink);color:#fff;font:800 11.5px Figtree,sans-serif;letter-spacing:.02em;vertical-align:middle;white-space:nowrap}',
    '.ps-hbtn{gap:10px;background:#fff}',
    /* speech bubbles */
    '.ps-say{position:relative;margin:0;background:#fff;border:2px solid var(--ink);border-radius:20px;padding:10px 14px;font:600 15.5px/1.35 Figtree,sans-serif;text-align:center;max-width:220px}',
    '.ps-say:after{content:"";position:absolute;width:16px;height:16px;background:#fff}',
    '.ps-say.down:after{bottom:-10px;left:50%;margin-left:-8px;border-right:2px solid var(--ink);border-bottom:2px solid var(--ink);transform:rotate(45deg)}',
    '.ps-say.left:after{left:-10px;bottom:20px;border-left:2px solid var(--ink);border-bottom:2px solid var(--ink);transform:rotate(45deg)}',
    /* start */
    '.ps-hero{position:relative;overflow:hidden;border-radius:28px;background:#E4F1FC;min-height:240px;display:flex;align-items:flex-end;flex-wrap:wrap;gap:14px 24px;padding:20px clamp(16px,4cqw,40px) 18px;box-shadow:inset 0 0 0 1px var(--line)}',
    '.ps-heroart{position:absolute;inset:0;pointer-events:none}',
    '.ps-heroart svg{width:100%;height:100%}',
    '.ps-herog{position:relative;display:flex;align-items:flex-start;gap:6px}',
    '.ps-herog .ps-guide{width:clamp(120px,20cqw,170px)}',
    '.ps-herog .ps-say{margin-top:18px}',
    '.ps-herobtns{position:relative;display:flex;flex-wrap:wrap;gap:10px;margin-left:auto;margin-bottom:6px}',
    '.ps-modesec{display:flex;flex-direction:column;gap:12px}',
    '.ps-modes{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}',
    '.ps-mode{display:flex;flex-direction:column;gap:12px;padding:12px 12px 16px;border-radius:24px;border:0;text-align:left;font:inherit;color:var(--ink);cursor:pointer;transition:transform .15s,box-shadow .15s;min-width:0}',
    '.ps-mode:hover{transform:translateY(-3px);box-shadow:0 10px 26px rgba(43,42,53,.12)}',
    '.ps-mode:focus-visible{outline:3px solid var(--ink);outline-offset:3px}',
    '.ps-prev{display:block;border-radius:16px;overflow:hidden;aspect-ratio:300/130;background:#fff;box-shadow:inset 0 0 0 1px rgba(43,42,53,.08)}',
    '.ps-prev svg{width:100%;height:100%}',
    '.ps-mhead{display:flex;align-items:center;gap:10px;min-width:0}',
    '.ps-num{flex:none;width:34px;height:34px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;font:700 16px Fredoka,sans-serif}',
    '.ps-mtitle{flex:1;min-width:0;font:600 clamp(18px,2.2cqw,21px)/1.15 Fredoka,sans-serif}',
    '.ps-go{flex:none;padding:7px 14px;border-radius:999px;background:var(--sunny);box-shadow:0 2px 0 var(--sunny-shadow);font-weight:800;font-size:13.5px}',
    '.ps-feel{margin:2px 0 0;font-size:16px;font-weight:600;color:var(--body);text-wrap:pretty}',
    '.ps-loop{animation-play-state:paused!important}',
    '.ps-mode:hover .ps-loop,.ps-mode:focus-visible .ps-loop{animation-play-state:running!important}',
    '.ps-fly{transform-box:fill-box;animation:psFly 2.4s ease-in-out infinite}',
    '.ps-pbob{transform-box:fill-box;transform-origin:50% 100%;animation:luBob 1.2s ease-in-out infinite}',
    '.ps-rock{transform-box:view-box;transform-origin:196px 88px;animation:psRock 2.6s ease-in-out infinite}',
    '.ps-drift2{animation:psDrift2 6s ease-in-out infinite alternate}',
    /* progress row */
    '.ps-bar{display:flex;align-items:center;gap:8px 14px;flex-wrap:wrap}',
    '.ps-bar b{font:600 20px Fredoka,sans-serif}',
    '.ps-bar .sp{flex:1}',
    '.ps-dots{display:flex;gap:5px;flex-wrap:wrap}.ps-dots i{width:16px;height:8px;border-radius:99px;background:var(--input)}.ps-dots i.d{background:var(--ink)}.ps-dots i.c{background:var(--sunny)}',
    /* sorting stage */
    '.ps-stage{position:relative;border-radius:28px;background:#F3EEE6;padding:22px clamp(14px,3cqw,32px) 26px;display:flex;gap:16px 28px;align-items:center;min-height:320px}',
    '.ps-stagebg{position:absolute;left:0;right:0;bottom:0;height:96px;border-radius:0 0 28px 28px;overflow:hidden;pointer-events:none}',
    '.ps-stagebg svg{width:100%;height:100%}',
    '.ps-gcol{position:relative;flex:0 0 190px;display:flex;flex-direction:column;align-items:center;gap:12px}',
    '.ps-gcol .ps-guide{width:150px}',
    '.ps-carea{position:relative;flex:1;display:flex;justify-content:center;min-width:0}',
    '.ps-deck{position:relative;width:min(480px,100%);perspective:900px}',
    '.ps-under{position:absolute;inset:0;border-radius:24px;background:#fff;border:2px solid #E4DCCF}',
    '.ps-under.u1{transform:translate(5px,5px) rotate(1.5deg)}.ps-under.u2{transform:translate(10px,10px) rotate(3deg)}',
    '.ps-card{position:relative;z-index:2;background:#fff;border:2px solid var(--ink);border-radius:24px;padding:22px 26px 20px;min-height:210px;display:flex;flex-direction:column;gap:12px;box-shadow:0 8px 20px rgba(120,80,40,.10);touch-action:none;user-select:none;-webkit-user-select:none;cursor:grab;transition:box-shadow .15s}',
    '.ps-card:focus-visible{outline:3px solid var(--sunny);outline-offset:3px}',
    '.ps-card.is-drag{cursor:grabbing;box-shadow:0 24px 40px rgba(120,80,40,.22);z-index:30}',
    '.ps-crow{display:flex;align-items:center;gap:8px}',
    '.ps-mine{font-size:11px;font-weight:800;padding:2px 8px;border-radius:999px;background:var(--lilac)}',
    '.ps-ctext{margin:0;flex:1;font:500 clamp(21px,3cqw,29px)/1.25 Fredoka,sans-serif;text-wrap:pretty}',
    '.ps-hint{font-size:13px;font-weight:600;color:var(--muted)}',
    '.ps-msg{position:relative;width:min(580px,100%);background:#fff;border:2px solid var(--ink);border-radius:26px;padding:20px 24px;box-shadow:0 14px 30px rgba(120,80,40,.12);display:flex;flex-direction:column;gap:10px}',
    '.ps-msg:before{content:"";position:absolute;left:-12px;top:56px;width:20px;height:20px;background:#fff;border-left:2px solid var(--ink);border-bottom:2px solid var(--ink);transform:rotate(45deg)}',
    '.ps-mrow,.ps-scrow{display:flex;align-items:center;gap:10px;flex-wrap:wrap}',
    '.ps-quote{margin:0;font-size:15px;line-height:1.45;color:var(--muted)}',
    '.ps-mtext{margin:0;font:600 clamp(17px,2.2cqw,19px)/1.5 Figtree,sans-serif;text-wrap:pretty}',
    '.ps-mfoot{display:flex;justify-content:flex-end}',
    '.ps-chip{display:inline-flex;align-items:center;padding:3px 12px;border-radius:999px;background:var(--t,#fff);border:1.5px solid var(--ink);font:700 13.5px Figtree,sans-serif}',
    '.ps-chip.plain{background:var(--sand);border-color:transparent}',
    '.sz-small{--t:var(--mint)}.sz-medium{--t:var(--butter)}.sz-big{--t:var(--peach)}',
    /* zones */
    '.ps-zones{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:clamp(8px,1.6cqw,16px)}',
    '.ps-zone{position:relative;display:flex;flex-direction:column;align-items:center;gap:4px;padding:12px clamp(6px,1.4cqw,16px) 16px;border-radius:24px;border:2.5px solid #E4DCCF;background:var(--t);font:inherit;color:var(--ink);text-align:center;cursor:pointer;box-shadow:0 2px 0 #ECE6DC;transition:transform .16s,box-shadow .16s,border-color .16s;min-width:0}',
    '.ps-zone:not([aria-disabled=true]):hover,.ps-zone.is-hover{border-color:var(--ink);box-shadow:0 0 0 4px var(--sunny),0 16px 30px rgba(120,80,40,.16);transform:translateY(-4px) scale(1.03)}',
    '.ps-zone.is-hover .ps-zart{transform:scale(1.06)}',
    '.ps-zone[aria-disabled=true]{cursor:default}',
    '.ps-zone:focus-visible{outline:3px solid var(--ink);outline-offset:3px}',
    '.ps-zart{display:block;width:100%;max-width:200px;aspect-ratio:160/110;transition:transform .16s}',
    '.ps-zart svg{width:100%;height:100%;overflow:visible}',
    '.ps-zlab{font:600 clamp(16px,2.4cqw,24px)/1.1 Fredoka,sans-serif}',
    '.ps-zdef{font-size:clamp(12px,1.5cqw,14px);font-weight:600;line-height:1.35;color:var(--body);text-wrap:pretty}',
    '.ps-zkey{position:absolute;top:8px;left:12px;font:700 12px Figtree,sans-serif;color:var(--muted)}',
    '.ps-zcount{position:absolute;top:8px;right:8px;min-width:28px;height:28px;padding:0 8px;border-radius:99px;background:#fff;border:1.5px solid var(--ink);font:700 13px/25px Figtree,sans-serif}',
    '.ps-keys{margin:0;text-align:center;font-size:13px;color:var(--muted)}',
    '@media (hover:none){.ps-keys{display:none}}',
    /* seesaw */
    '.ps-ssmsg{position:relative;width:100%;max-width:880px;margin:0 auto;background:#fff;border:2px solid var(--ink);border-radius:22px;padding:12px 18px;min-height:52px;display:flex;align-items:center}',
    '.ps-ssmsg p{margin:0;font:600 clamp(16px,2.2cqw,18px)/1.45 Figtree,sans-serif;text-wrap:pretty}',
    '.ps-ssmsg:after{content:"";position:absolute;bottom:-11px;left:calc(57% - 9px);width:18px;height:18px;background:#fff;border-right:2px solid var(--ink);border-bottom:2px solid var(--ink);transform:rotate(45deg)}',
    '.ps-scene{position:relative;width:100%;max-width:880px;margin:0 auto;border-radius:24px;overflow:hidden;aspect-ratio:800/340;box-shadow:inset 0 0 0 1px var(--line);cursor:default}',
    '.ps-scene svg{width:100%;height:100%}',
    '.ps-outcome{position:absolute;top:10px;left:50%;transform:translateX(-50%);padding:6px 16px;border-radius:999px;background:#fff;border:2px solid var(--ink);font:600 clamp(15px,2.2cqw,19px)/1.2 Fredoka,sans-serif;white-space:nowrap}',
    '.ps-outcome[hidden]{display:none}',
    '.ps-plank{transform-box:view-box;transform-origin:400px 212px}',
    '.ps-sh{transform-box:fill-box;transform-origin:50% 50%}',
    '.ps-lt,.ps-rt,.ps-gw{transform-box:fill-box;transform-origin:50% 100%}',
    '.ps-lid,.ps-pobj,.ps-spark{transform-box:fill-box;transform-origin:50% 100%}',
    '.ps-sscards{display:grid;grid-template-columns:1fr 1fr;gap:12px;width:100%;max-width:880px;margin:0 auto}',
    '.ps-sc{background:#fff;border:2px solid var(--ink);border-radius:18px;padding:12px 14px;display:flex;flex-direction:column;gap:6px;min-width:0}',
    '.ps-sc.p{box-shadow:inset 0 4px 0 #F7A08C}.ps-sc.r{box-shadow:inset 0 4px 0 #7DB3E8}',
    '.ps-sc.empty{border:2px dashed #CFC4B2;background:rgba(255,255,255,.5);justify-content:center;min-height:72px}',
    '.ps-sc p{margin:0;font:500 clamp(16px,2cqw,19px)/1.3 Fredoka,sans-serif;text-wrap:pretty}',
    '.ps-hand{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}',
    '.ps-hcard{position:relative;display:flex;flex-direction:column;gap:6px;padding:12px 14px 14px;border-radius:20px;border:2.5px solid #E4DCCF;background:#fff;text-align:left;font:inherit;color:var(--ink);cursor:pointer;box-shadow:0 2px 0 #ECE6DC;transition:transform .15s,box-shadow .15s;min-width:0}',
    '.ps-hcard:not([aria-disabled=true]):hover{transform:translateY(-2px);border-color:var(--ink)}',
    '.ps-hcard.on{border-color:var(--ink);box-shadow:0 0 0 4px var(--sunny)}',
    '.ps-hcard[aria-disabled=true]{cursor:default}',
    '.ps-hcard[aria-disabled=true]:not(.on){opacity:.6}',
    '.ps-hcard:focus-visible{outline:3px solid var(--ink);outline-offset:3px}',
    '.ps-hrow{position:relative;display:flex;align-items:flex-end;gap:10px;padding-right:18px}',
    '.ps-hart{flex:none;width:72px;aspect-ratio:160/110}',
    '.ps-hart svg{width:100%;height:100%;overflow:visible}',
    '.ps-hrow b{flex:1;font:600 18px/1.1 Fredoka,sans-serif}',
    '.ps-hrow .ps-zkey{top:0;left:auto;right:0}',
    '.ps-htext{font:500 17px/1.3 Fredoka,sans-serif;text-wrap:pretty}',
    '.ps-on{align-self:flex-start;font-size:12px;font-weight:800;padding:2px 10px;border-radius:999px;background:var(--butter)}',
    '.ps-ssbtns{display:flex;gap:12px;flex-wrap:wrap;justify-content:flex-end;min-height:56px}',
    /* summary */
    '.ps-sumhero{border-radius:28px;background:var(--butter);padding:20px clamp(18px,4cqw,40px);display:flex;align-items:center;gap:18px;flex-wrap:wrap}',
    '.ps-sumhero .ps-guide{width:110px}',
    '.ps-tiles{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:clamp(8px,1.6cqw,16px)}',
    '.ps-tile{background:var(--t);border-radius:22px;padding:16px 10px 18px;display:flex;flex-direction:column;align-items:center;gap:4px;text-align:center;min-width:0}',
    '.ps-tart{width:100%;max-width:150px;aspect-ratio:160/110}',
    '.ps-tart svg{width:100%;height:100%;overflow:visible}',
    '.ps-tile b{font:600 clamp(16px,2.2cqw,22px)/1.15 Fredoka,sans-serif}',
    '.ps-tile>span:last-child{font-size:15px;font-weight:700;color:var(--body)}',
    '.ps-talk{background:#fff;border:1px solid var(--line);border-radius:24px;padding:20px clamp(16px,3cqw,26px);display:flex;flex-direction:column;gap:12px}',
    '.ps-tlist{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:10px}',
    '.ps-titem{border-radius:16px;background:var(--paper);padding:12px 16px;display:flex;flex-direction:column;gap:6px}',
    '.ps-titem>b{font:500 18px/1.3 Fredoka,sans-serif}',
    '.ps-tsub{font-size:14.5px;color:var(--body)}',
    '.ps-tchips{display:flex;gap:8px;flex-wrap:wrap}',
    '.ps-tchips .ps-chip{font-size:12.5px;padding:2px 10px}',
    '.ps-none{margin:0;font-size:15px;color:var(--body);padding:12px 16px;border-radius:16px;background:var(--paper)}',
    '.ps-endbtns{display:flex;gap:12px;flex-wrap:wrap}',
    /* picker */
    '.ps-pickscreen{background:#fff;border:1px solid var(--line);border-radius:28px;padding:22px clamp(16px,3cqw,28px);display:flex;flex-direction:column;gap:16px}',
    '.ps-pickhead{display:flex;align-items:center;gap:10px;flex-wrap:wrap;justify-content:space-between}',
    '.ps-ctabs{display:inline-flex;gap:2px;padding:4px;border-radius:999px;background:var(--sand)}',
    '.ps-ctabs button{min-height:40px;padding:0 16px;border-radius:999px;border:1.5px solid transparent;background:none;font:700 14px Figtree,sans-serif;color:var(--body);cursor:pointer}',
    '.ps-ctabs button.on{background:#fff;border-color:var(--ink);color:var(--ink)}',
    '.ps-surprise{gap:8px}',
    '.ps-chargrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(96px,1fr));gap:10px;max-height:min(56vh,480px);overflow:auto;padding:4px}',
    '.ps-chargrid.insheet{max-height:none;overflow:visible}',
    '.ps-char{border-radius:18px;padding:8px 4px 10px;background:var(--paper);border:1.5px solid var(--line);display:flex;flex-direction:column;align-items:center;gap:4px;cursor:pointer;font:inherit;color:var(--ink);min-height:120px}',
    '.ps-char:hover{border-color:var(--ink)}',
    '.ps-char.on{border:2.5px solid var(--ink);box-shadow:0 0 0 4px var(--sunny)}',
    '.ps-cart{width:72px;height:72px;border-radius:50%;overflow:hidden;display:flex;align-items:flex-end;justify-content:center}',
    '.ps-cart svg{width:64px;height:82px}',
    '.ps-char b{font-size:13px;line-height:1.2;text-align:center}',
    /* sheets */
    '.ps-sheet .ps-h3{margin:4px 0 -4px;font:600 18px Fredoka,sans-serif}',
    '.ps-sheet .ps-p{margin:0;font-size:14.5px;color:var(--body);line-height:1.5}',
    '.ps-defs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}',
    '.ps-def{background:var(--t);border-radius:18px;padding:12px 12px 14px;display:flex;flex-direction:column;gap:6px;min-width:0}',
    '.ps-def b{font:600 18px/1.1 Fredoka,sans-serif}',
    '.ps-def>span:last-child{font-size:14px;line-height:1.45;color:var(--body)}',
    '.ps-dart{width:96px;aspect-ratio:160/110}.ps-dart svg{width:100%;height:100%;overflow:visible}',
    '.ps-stylegrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}',
    '.ps-sopt{padding:10px 6px;min-width:0}',
    '.ps-trio{display:flex;align-items:flex-end;justify-content:center;width:100%;gap:1px}',
    '.ps-trio svg{width:33%;height:auto;overflow:visible}',
    '.ps-sava{flex:none;width:48px;height:48px;border-radius:50%;overflow:hidden;display:flex;align-items:flex-end;justify-content:center}',
    '.ps-sava svg{width:44px;height:56px}',
    '.ps-deckseg button{display:inline-flex;align-items:center;justify-content:center;gap:6px;flex-wrap:wrap}',
    '.ps-field textarea{min-height:76px;border-radius:14px;border:1.5px solid var(--ink);padding:12px 14px;font:inherit;font-size:16px;color:var(--ink);background:#fff;resize:vertical}',
    '.ps-field textarea:focus{outline:0;box-shadow:0 0 0 4px var(--butter)}',
    '.ps-field small{font-size:12.5px;color:var(--muted)}',
    '.ps-field span small{font-weight:500}',
    '.ps-err{margin:-6px 0 0;font-size:13.5px;font-weight:700;color:var(--error,#B23A2E)}',
    '.ps-frow{display:flex;gap:10px;justify-content:flex-end}',
    '.ps-note{margin:0}',
    '.ps-crowi{flex-wrap:wrap}.ps-crowi>div{min-width:180px}',
    /* scene motion */
    '.ps-drift{animation:psDrift 46s ease-in-out infinite alternate}',
    '.ps-sway{transform-box:fill-box;transform-origin:50% 100%;animation:luSway 3.6s ease-in-out infinite}',
    '.ps-bob{transform-box:fill-box;transform-origin:50% 100%;animation:psBob 3.2s ease-in-out infinite}',
    '@keyframes psDrift{from{transform:translateX(-40px)}to{transform:translateX(50px)}}',
    '@keyframes psDrift2{from{transform:translateX(-10px)}to{transform:translateX(14px)}}',
    '@keyframes psBob{0%,100%{transform:translateY(0) rotate(-2deg)}50%{transform:translateY(-3px) rotate(2deg)}}',
    '@keyframes psFly{0%,15%{transform:translate(0,0) rotate(0);opacity:1}55%{transform:translate(96px,-26px) rotate(10deg);opacity:1}75%{transform:translate(100px,-6px) rotate(4deg) scale(.6);opacity:0}100%{transform:translate(0,0);opacity:0}}',
    '@keyframes psRock{0%,100%{transform:rotate(-4deg)}50%{transform:rotate(4deg)}}',
    '@keyframes luBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-2.5px)}}@keyframes luHop{0%,100%{transform:translateY(0)}35%,55%{transform:translateY(-9px)}}@keyframes luWob{0%,100%{transform:rotate(-6deg)}50%{transform:rotate(6deg)}}@keyframes luBlink{0%,92%,100%{transform:scaleY(1)}95%{transform:scaleY(.1)}}@keyframes luWave{0%,100%{transform:rotate(-14deg)}50%{transform:rotate(16deg)}}@keyframes luSway{0%,100%{transform:rotate(-5deg)}50%{transform:rotate(5deg)}}',
    /* sizes */
    '@container (max-width:759px){.ps-modes{grid-template-columns:1fr}.ps-prev{aspect-ratio:300/110}.ps-prev svg{height:auto;margin-top:-4%}.ps-hand{grid-template-columns:1fr}.ps-hcard{flex-direction:row;align-items:center}.ps-hrow{flex:none;flex-direction:column;align-items:center;gap:2px;padding-right:0;width:96px}.ps-hrow b{font-size:14px;text-align:center}.ps-hrow .ps-zkey{display:none}.ps-hart{width:64px}}',
    '@container (max-width:639px){.ps-stage{flex-direction:column;align-items:stretch;padding:14px 14px 18px;min-height:0;gap:12px}.ps-gcol{flex:none;flex-direction:row-reverse;justify-content:flex-end;align-items:flex-end;gap:8px}.ps-gcol .ps-guide{width:72px}.ps-say.down:after{bottom:16px;left:-10px;margin-left:0;border-right:0;border-bottom:2px solid var(--ink);border-left:2px solid var(--ink)}.ps-card{min-height:150px;padding:16px 18px}.ps-msg:before{left:28px;top:-12px;border-bottom:0;border-top:2px solid var(--ink)}.ps-stagebg{height:60px}.ps-hero{min-height:0}.ps-herobtns{margin-left:0;width:100%}.ps-herobtns .tl-btn{flex:1 1 200px}.ps-defs,.ps-stylegrid{grid-template-columns:1fr 1fr 1fr}.ps-def{padding:10px}.ps-dart{width:72px}.ps-zone{padding:10px 4px 12px;border-radius:18px}.ps-zkey{display:none}.ps-sscards{gap:8px}.ps-sc{padding:10px}.ps-ssmsg{padding:10px 14px}.ps-ssbtns .tl-btn{flex:1 1 160px}.ps-endbtns .tl-btn{flex:1 1 200px}}',
    '@container (max-width:420px){.ps-defs{grid-template-columns:1fr}.ps-def{flex-direction:row;flex-wrap:wrap;align-items:center}.ps-def>span:last-child{flex-basis:100%}.ps-zdef{font-size:11.5px}.ps-zcount{min-width:22px;height:22px;font-size:11.5px;line-height:19px;padding:0 5px;top:4px;right:4px}}',
    '@media (prefers-reduced-motion:reduce){.ps-app *,.ps-sheet *{animation:none!important;transition:none!important}}',
    'html.tl-still .ps-app *,html.tl-still .ps-sheet *{animation:none!important}'
  ].join('');
  function addCSS() { if (document.getElementById('psCSS')) return; var s = document.createElement('style'); s.id = 'psCSS'; s.textContent = CSS; document.head.appendChild(s); }

  /* ===================== register ===================== */
  function hubVis() { var A = window.LUArt; return '<div class="tl-mini-art">' + (A && A.toolArt ? A.toolArt('sorter') : '') + '</div>'; }
  LUTools.register('tools/problem-sorter', {
    page: page, click: click,
    card: { grp: 'emo', tint: '#FFE9DA', order: 1, vis: hubVis, title: function () { return T('title'); }, desc: function () { return 'Learn to match the size of a reaction to the size of the problem.'; } }
  });
  window.LUSorter = { version: '1' };
  if (LUTools.render) try { LUTools.render(); } catch (e) { }
})();
