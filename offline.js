/* Little Us · DTT · what a running session keeps in this browser (IndexedDB database lu-dtt):
   the session in progress, finished sessions waiting to upload, and the session's images. Images are removed when the session closes. */
(function () {
  'use strict';
  var D = window.LUDtt, dbp = null;
  function db() {
    if (!dbp) dbp = new Promise(function (res, rej) {
      var r = indexedDB.open('lu-dtt', 1);
      r.onupgradeneeded = function () { var d = r.result; d.createObjectStore('active'); d.createObjectStore('queue', { keyPath: 'id' }); d.createObjectStore('images'); };
      r.onsuccess = function () { res(r.result); };
      r.onerror = function () { dbp = null; rej(r.error); };
    });
    return dbp;
  }
  function run(store, mode, fn) {
    return db().then(function (d) {
      return new Promise(function (res, rej) {
        var tx = d.transaction(store, mode), req = fn(tx.objectStore(store)), out;
        if (req) req.onsuccess = function () { out = req.result; };
        tx.oncomplete = function () { res(out); };
        tx.onerror = tx.onabort = function () { rej(tx.error); };
      });
    });
  }
  D.offline = {
    saveActive: function (uid, snap) { return run('active', 'readwrite', function (s) { return s.put(snap, uid); }); },
    getActive: function (uid) { return run('active', 'readonly', function (s) { return s.get(uid); }); },
    clearActive: function (uid) { return run('active', 'readwrite', function (s) { return s.delete(uid); }); },
    enqueue: function (entry) { return run('queue', 'readwrite', function (s) { return s.put(entry); }); },
    queued: function (uid) { return run('queue', 'readonly', function (s) { return s.getAll(); }).then(function (a) { return (a || []).filter(function (e) { return e.userId === uid; }).sort(function (x, y) { return x.at - y.at; }); }); },
    unqueue: function (id) { return run('queue', 'readwrite', function (s) { return s.delete(id); }); },
    putImage: function (path, blob) { return run('images', 'readwrite', function (s) { return s.put(blob, path); }); },
    getImage: function (path) { return run('images', 'readonly', function (s) { return s.get(path); }); },
    clearImages: function () { return run('images', 'readwrite', function (s) { return s.clear(); }); }
  };
})();
