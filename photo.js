/* Little Us · DTT · turns any picked photo into a small square JPEG in the browser. Only the small result is ever uploaded. */
(function () {
  'use strict';
  var D = window.LUDtt, C = D.compress, LIM = D.defaults.PHOTO, DECODER = '/dtt/vendor/heic2any.min.js?v=1';

  function open(file) {
    return new Promise(function (res, rej) {
      if (file.size > LIM.maxPickBytes) return rej(new Error('too_big'));
      // any format this browser can open is accepted: only the small JPEG made from it is stored
      var iphone = /\.(heic|heif)$/i.test(file.name || '') || /hei[cf]/i.test(file.type || '');
      // Safari opens iPhone photos by itself; other browsers get the decoder, and the photo stays in the browser
      show(file).then(res, function () {
        if (!iphone) return rej(new Error('unreadable'));
        decodeHeic(file).then(show).then(res, function () { rej(new Error('heic')); });
      });
    });
  }
  function show(blob) {
    return new Promise(function (res, rej) {
      var url = URL.createObjectURL(blob), img = new Image();
      img.onload = function () { URL.revokeObjectURL(url); if (img.naturalWidth) res(img); else rej(new Error('empty')); };
      img.onerror = function () { URL.revokeObjectURL(url); rej(new Error('unreadable')); };
      img.src = url;
    });
  }
  // about 1.3 MB, so it loads only the first time someone picks a photo that needs it
  function decodeHeic(file) {
    LUTools.api.toast(D.i18n.T('Opening the iPhone photo. This can take a moment.', 'Membuka foto iPhone. Mohon tunggu sebentar.'));
    return window.luLoad(DECODER).then(function () {
      return window.heic2any({ blob: file, toType: 'image/jpeg', quality: 0.9 });
    }).then(function (out) { return Array.isArray(out) ? out[0] : out; });
  }
  function draw(img, crop, side) {
    var cv = document.createElement('canvas'), r = C.cropRect(img.naturalWidth, img.naturalHeight, crop);
    cv.width = side; cv.height = side;
    var g = cv.getContext('2d');
    g.fillStyle = '#fff'; g.fillRect(0, 0, side, side);
    g.imageSmoothingQuality = 'high';
    g.drawImage(img, r.sx, r.sy, r.side, r.side, 0, 0, side, side);
    return cv;
  }
  function encode(img, crop) {
    return function (side, quality) {
      return new Promise(function (res, rej) {
        draw(img, crop, Math.min(side, Math.max(img.naturalWidth, img.naturalHeight))).toBlob(function (b) { if (b) res(b); else rej(new Error('encode')); }, 'image/jpeg', quality);
      });
    };
  }
  function compress(img, crop) {
    return C.toTarget(encode(img, crop), LIM.side, LIM.targetBytes).then(function (res) {
      if (!res || res.blob.size > LIM.hardBytes) throw new Error('still_big');
      return res.blob;
    });
  }
  D.photo = { open: open, draw: draw, compress: compress };
})();
