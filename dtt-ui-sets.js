/* Little Us · DTT · stimulus sets: the list, the item editor and copying from the starter library. */
(function () {
  'use strict';
  var D = window.LUDtt, X = LUTools.api, P = D.programs, T = D.i18n.T, esc = X.esc, ui = D.ui, U = ui.U, ACT = ui.ACT, INP = ui.INP;

  function viewSets() {
    var sets = D.store.sets();
    return '<div class="dtt-head"><div><h2 class="tl-h2">' + esc(T('Stimulus sets', 'Stimulus set')) + '</h2></div>' +
      '<button type="button" class="tl-btn primary" data-a="newSet">' + esc(T('New set', 'Set baru')) + '</button></div>' +
      (sets.length ? '<div class="tl-panel">' + sets.map(function (s) {
        var used = D.store.programsUsingSet(s.id).length, first = (s.items[0] && s.items[0].images[0]) || null;
        return '<button type="button" class="tl-row act" data-a="openSet" data-id="' + s.id + '"><span class="dtt-thumb">' + ui.img(first) + '</span><div class="dtt-grow"><b>' + esc(s.name || T('Unnamed set', 'Set tanpa nama')) + '</b><small>' + esc(T(s.items.length + ' items, used by ' + used + (used === 1 ? ' program' : ' programs'), s.items.length + ' item, dipakai ' + used + ' program')) + '</small></div><span aria-hidden="true">›</span></button>';
      }).join('') + '</div>' : '<div class="dtt-empty tl-panel pad"><p class="tl-p">' + esc(T('No sets yet.', 'Belum ada set.')) + '</p></div>') +
      photoMeter();
  }
  function photoMeter() {
    return '<p class="tl-note2">' + esc(T('Photos uploaded: ' + D.store.photoCount() + ' of ' + D.store.photoLimit() + '.', 'Foto terunggah: ' + D.store.photoCount() + ' dari ' + D.store.photoLimit() + '.')) + '</p>';
  }
  ACT.newSet = function () {
    D.store.addSet('').then(function (s) { U.setId = s.id; U.view = 'set'; ui.render(); }, function () { X.toast(T('The set was not created. Check your connection.', 'Set belum dibuat. Periksa koneksi.')); });
  };
  ACT.openSet = function (b) { U.setId = b.dataset.id; U.view = 'set'; ui.render(); };

  /* the editor; the wizard embeds the same body */
  function viewSet() {
    var s = D.store.set(U.setId);
    return '<div class="dtt-progh"><h2 class="tl-h2">' + esc(s.name || T('New set', 'Set baru')) + '</h2></div>' + editor(s) + deleteRow(s);
  }
  function deleteRow(s) {
    var used = D.store.programsUsingSet(s.id).length;
    return used ? '<p class="tl-note2">' + esc(T('This set is used by ' + used + (used === 1 ? ' program' : ' programs') + '. Delete those first if you want to remove it.', 'Set ini dipakai ' + used + ' program. Hapus programnya dulu jika ingin menghapus set ini.')) + '</p>'
      : '<div><button type="button" class="tl-link dtt-danger" data-a="deleteSet" data-id="' + s.id + '" data-confirm="' + esc(T('Tap again to delete this set and its photos', 'Ketuk lagi untuk menghapus set dan fotonya')) + '">' + esc(T('Delete this set', 'Hapus set ini')) + '</button></div>';
  }
  ACT.deleteSet = function (b) {
    var s = D.store.set(b.dataset.id);
    D.store.deleteSet(s).then(function () { U.view = 'sets'; ui.render(); }, function () { X.toast(T('The set was not deleted. Check your connection.', 'Set belum dihapus. Periksa koneksi.')); });
  };
  function editor(s) {
    return '<div class="dtt-setedit" data-set="' + s.id + '">' + ui.field(T('Set name', 'Nama set'), s.name, 'data-in="setName" data-id="' + s.id + '"', T('Animals', 'Hewan')) +
      '<div class="dtt-rowbtns"><label class="tl-btn outline dtt-file">' + esc(T('Add photos', 'Tambah foto')) + '<input type="file" accept="image/*,.heic,.heif" multiple data-in="bulk" data-on="change" data-id="' + s.id + '"></label>' +
      '<button type="button" class="tl-btn outline" data-a="addItem" data-id="' + s.id + '">' + esc(T('Add an item', 'Tambah item')) + '</button>' +
      '<button type="button" class="tl-btn quiet" data-a="openLib" data-id="' + s.id + '">' + esc(T('Copy from the library', 'Salin dari pustaka')) + '</button></div>' +
      (s.items.length ? '<div class="dtt-items">' + s.items.map(function (i) { return itemCard(s, i); }).join('') + '</div>' : ui.tip(T('Add photos to start. Each photo becomes an item, and you can type its label.', 'Tambahkan foto untuk mulai. Setiap foto menjadi satu item, lalu kamu bisa mengetik labelnya.'))) +
      photoMeter() + '</div>';
  }
  ui.setEditor = editor;
  function itemCard(s, i) {
    var a = 'data-set="' + s.id + '" data-item="' + i.id + '"';
    return '<div class="dtt-item tl-panel"><div class="dtt-imgs">' + i.images.map(function (m) {
      return '<span class="dtt-imgwrap' + (m.people ? ' people' : '') + '">' + ui.img(m, i.labels.primary) + '<button type="button" class="dtt-imgx" data-a="delImg" data-v="' + m.id + '" ' + a + ' aria-label="' + esc(T('Remove this picture', 'Hapus gambar ini')) + '" data-confirm="?">✕</button></span>';
    }).join('') + '<label class="dtt-addimg" aria-label="' + esc(T('Add another picture of this item', 'Tambah gambar lain untuk item ini')) + '">+<input type="file" accept="image/*,.heic,.heif" data-in="itemImg" data-on="change" ' + a + '></label></div>' +
      ui.field(T('Label', 'Label'), i.labels.primary, 'data-in="itemLabel" data-k="primary" ' + a, 'cat') +
      ui.field(T('Categories, separated by commas', 'Kategori, dipisah koma'), (i.tags || []).join(', '), 'data-in="itemTags" ' + a, T('animal, pet', 'hewan, peliharaan')) +
      '<details class="dtt-more"><summary>' + esc(T('More options', 'Pilihan lain')) + '</summary>' + moreOptions(s, i, a) + '</details></div>';
  }
  function moreOptions(s, i, a) {
    var others = s.items.filter(function (x) { return x.id !== i.id; });
    return (others.length ? '<p class="dtt-optd">' + esc(T('Never show together with:', 'Jangan ditampilkan bersama:')) + '</p><div class="tl-chips">' + others.map(function (o) {
      var on = (i.doNotPairWith || []).indexOf(o.id) >= 0;
      return '<button type="button" class="tl-chip' + (on ? ' on' : '') + '" aria-pressed="' + on + '" data-a="pairTog" data-v="' + o.id + '" ' + a + '>' + esc(o.labels.primary || '?') + '</button>';
    }).join('') + '</div>' : '') +
      i.images.map(function (m, n) {
        var who = 'data-v="' + m.id + '" ' + a;
        return ui.sw('people', !!m.people, T('Picture ' + (n + 1) + ' shows a person', 'Gambar ' + (n + 1) + ' menampilkan orang'), m.people ? '' : T('Turn on to record what it may be used for.', 'Nyalakan untuk mencatat izin pemakaiannya.'), 'peopleTog').replace('data-k="people"', 'data-k="people" ' + who) +
          (m.people ? '<div class="tl-seg dtt-seg" role="group" aria-label="' + esc(T('This picture may be used with', 'Gambar ini boleh dipakai untuk')) + '">' + [['one', T('One student', 'Satu anak')], ['all', T('All my students', 'Semua anakku')]].map(function (c) {
            return '<button type="button" class="' + (m.consent === c[0] ? 'on' : '') + '" aria-pressed="' + (m.consent === c[0]) + '" data-a="consent" data-k="' + c[0] + '" ' + who + '>' + esc(c[1]) + '</button>';
          }).join('') + '</div>' : '');
      }).join('') +
      '<button type="button" class="tl-link dtt-danger" data-a="delItem" ' + a + ' data-confirm="' + esc(T('Tap again to delete this item', 'Ketuk lagi untuk menghapus item ini')) + '">' + esc(T('Delete this item', 'Hapus item ini')) + '</button>';
  }
  function locate(el) { var s = D.store.set(el.dataset.set || el.dataset.id); return { s: s, i: s && P.itemById(s, el.dataset.item) }; }

  INP.setName = function (el) { var s = D.store.set(el.dataset.id); s.name = el.value; ui.touchSet(s); };
  INP.itemLabel = function (el) { var f = locate(el); f.i.labels[el.dataset.k] = el.value; ui.touchSet(f.s); };
  INP.itemTags = function (el) { var f = locate(el); f.i.tags = el.value.split(',').map(function (t) { return t.trim(); }).filter(Boolean); ui.touchSet(f.s); };
  ACT.addItem = function (b) { var s = D.store.set(b.dataset.id); s.items.push(P.newItem('')); syncDraft(s); ui.touchSet(s); ui.render(); };
  ACT.delItem = function (b) {
    var f = locate(b); D.store.dropImages(f.i.images);
    f.s.items = f.s.items.filter(function (x) { return x !== f.i; });
    f.s.items.forEach(function (x) { x.doNotPairWith = (x.doNotPairWith || []).filter(function (id) { return id !== f.i.id; }); });
    syncDraft(f.s); ui.touchSet(f.s); ui.render();
  };
  ACT.delImg = function (b) {
    var f = locate(b), m = f.i.images.filter(function (x) { return x.id === b.dataset.v; })[0];
    D.store.dropImages([m]); f.i.images = f.i.images.filter(function (x) { return x !== m; });
    ui.touchSet(f.s); ui.render();
  };
  ACT.pairTog = function (b) {
    var f = locate(b), id = b.dataset.v, o = P.itemById(f.s, id);
    function flip(x, y) { x.doNotPairWith = x.doNotPairWith || []; var n = x.doNotPairWith.indexOf(y); if (n >= 0) x.doNotPairWith.splice(n, 1); else x.doNotPairWith.push(y); }
    flip(f.i, id); if (o) flip(o, f.i.id);
    ui.touchSet(f.s); keepDetails(b, f.i.id);
  };
  ACT.peopleTog = function (b) {
    var f = locate(b), m = f.i.images.filter(function (x) { return x.id === b.dataset.v; })[0];
    m.people = !m.people; if (m.people && !m.consent) m.consent = 'one'; if (!m.people) delete m.consent;
    ui.touchSet(f.s); keepDetails(b, f.i.id);
  };
  ACT.consent = function (b) {
    var f = locate(b), m = f.i.images.filter(function (x) { return x.id === b.dataset.v; })[0];
    m.consent = b.dataset.k; ui.touchSet(f.s); keepDetails(b, f.i.id);
  };
  // a re-render closes <details>, so reopen the one being used
  function keepDetails(b, itemId) {
    ui.render();
    var again = document.querySelector('#dttApp [data-item="' + itemId + '"][data-in="itemTags"]');
    var card = again && again.closest('.dtt-item');
    if (card) card.querySelector('details').open = true;
  }
  function syncDraft(s) { var p = U.wizard && U.wizard.p; if (p && p.setId === s.id) P.syncQueue(p, s); }
  ui.syncDraft = syncDraft;

  function labelFromFile(name) {
    var base = String(name || '').replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim();
    return /^(img|dsc|pxl|photo|image|screenshot|whatsapp)\b/i.test(base) || /^\d[\d ]*$/.test(base) ? '' : base;
  }
  function uploadTo(s, item, blob) {
    return D.store.uploadImage(s.id, blob).then(function (m) { item.images.push(m); });
  }
  INP.bulk = function (el) {
    var s = D.store.set(el.dataset.id), files = Array.prototype.slice.call(el.files || []); el.value = '';
    if (!files.length || !ui.photoRoom(files.length)) return;
    if (files.length === 1) return ui.cropper(files[0], function (blob) {
      var it = P.newItem(labelFromFile(files[0].name));
      uploadTo(s, it, blob).then(function () { s.items.push(it); syncDraft(s); ui.touchSet(s); ui.render(); }, ui.photoError);
    });
    X.toast(T('Making ' + files.length + ' photos small and saving them...', 'Memperkecil dan menyimpan ' + files.length + ' foto...'));
    // one at a time, so a large batch does not use up the tablet's memory
    files.reduce(function (chain, f) {
      return chain.then(function () { return D.photo.open(f); }).then(function (img) { return D.photo.compress(img, {}); }).then(function (blob) {
        var it = P.newItem(labelFromFile(f.name));
        return uploadTo(s, it, blob).then(function () { s.items.push(it); });
      }).catch(ui.photoError);
    }, Promise.resolve()).then(function () { syncDraft(s); ui.touchSet(s); ui.render(); });
  };
  INP.itemImg = function (el) {
    var f = locate(el), file = el.files && el.files[0]; el.value = '';
    if (!file || !ui.photoRoom(1)) return;
    ui.cropper(file, function (blob) { uploadTo(f.s, f.i, blob).then(function () { ui.touchSet(f.s); ui.render(); }, ui.photoError); });
  };

  /* starter library */
  ACT.openLib = function (b) {
    var s = D.store.set(b.dataset.id), pick = {}, cur = D.library.sets[0], L = D.i18n.lang() === 'id' ? 1 : 0;
    var sh = X.sheet('');
    function draw() {
      var n = Object.keys(pick).length;
      sh.set('<div class="tl-sheethead"><h2>' + esc(T('Starter library', 'Pustaka awal')) + '</h2><button type="button" class="tl-iconbtn round" data-x aria-label="' + esc(T('Close', 'Tutup')) + '">✕</button></div>' +
        '<div class="tl-chips">' + D.library.sets.map(function (l) { return '<button type="button" class="tl-chip' + (l === cur ? ' on' : '') + '" aria-pressed="' + (l === cur) + '" data-lib="' + l.id + '">' + esc(l.name[L]) + '</button>'; }).join('') + '</div>' +
        (cur.items[0].pending ? ui.tip(T('Pictures for this group are coming soon.', 'Gambar untuk kelompok ini segera hadir.')) : '<button type="button" class="tl-link" data-all>' + esc(T('Select all in this group', 'Pilih semua di kelompok ini')) + '</button>') +
        '<div class="dtt-libgrid">' + cur.items.map(function (it) {
          var key = cur.id + '/' + it.id, on = !!pick[key], have = s.items.some(function (x) { return x.from === key; });
          return '<button type="button" class="dtt-libitem' + (on ? ' on' : '') + '" aria-pressed="' + on + '" data-it="' + it.id + '"' + (it.pending || have ? ' disabled' : '') + '>' + (it.images[0] ? '<img alt="" src="' + esc(D.library.src(it.images[0])) + '">' : '<span class="dtt-noimg" aria-hidden="true"></span>') + '<span>' + esc(it.labels[L]) + '</span>' + (have ? '<small>' + esc(T('In this set', 'Sudah ada')) + '</small>' : '') + '</button>';
        }).join('') + '</div>' +
        '<div class="tl-sheetfoot"><button type="button" class="tl-btn primary block" data-add' + (n ? '' : ' disabled') + '>' + esc(T('Copy ' + n + ' into this set', 'Salin ' + n + ' ke set ini')) + '</button></div>');
    }
    sh.el.addEventListener('click', function (e) {
      var t = e.target.closest('button'); if (!t) return;
      if (t.hasAttribute('data-x')) return sh.close();
      if (t.dataset.lib) { cur = D.library.sets.filter(function (l) { return l.id === t.dataset.lib; })[0]; return draw(); }
      if (t.hasAttribute('data-all')) { cur.items.forEach(function (it) { if (!it.pending && !s.items.some(function (x) { return x.from === cur.id + '/' + it.id; })) pick[cur.id + '/' + it.id] = 1; }); return draw(); }
      if (t.dataset.it) { var k = cur.id + '/' + t.dataset.it; if (pick[k]) delete pick[k]; else pick[k] = 1; return draw(); }
      if (t.hasAttribute('data-add')) {
        D.library.sets.forEach(function (l) {
          var ids = Object.keys(pick).filter(function (k) { return k.indexOf(l.id + '/') === 0; }).map(function (k) { return k.slice(l.id.length + 1); });
          if (ids.length) P.importFromLibrary(s, l, ids, D.i18n.lang());
        });
        sh.close(); syncDraft(s); ui.touchSet(s); ui.render();
      }
    });
    draw();
  };

  ui.VIEWS.sets = viewSets;
  ui.VIEWS.set = viewSet;
})();
