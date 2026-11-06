/* Little Us · DTT · how a photo is squeezed small. Teachers can pick a large file; only the small result is uploaded.
   encode(side, quality) is supplied by the caller (a canvas in the browser, a stub in tests) and resolves to something with .size. */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) module.exports = factory();
  else { root.LUDtt = root.LUDtt || {}; root.LUDtt.compress = factory(); }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  var QUALITIES = [0.8, 0.7, 0.6, 0.5, 0.42];

  // the steps tried in order: lower the quality first, because card photos need their size, then lower the size
  function ladder(side) {
    var out = [];
    [side, Math.round(side * 0.8), Math.round(side * 0.6)].forEach(function (s) { QUALITIES.forEach(function (q) { out.push({ side: s, quality: q }); }); });
    return out;
  }

  // resolves to the first result at or under target. Past that, the smallest result seen, which the caller checks against its hard limit.
  function toTarget(encode, side, target) {
    var steps = ladder(side), best = null, i = 0;
    function next() {
      if (i >= steps.length) return Promise.resolve(best);
      var st = steps[i++];
      return Promise.resolve(encode(st.side, st.quality)).then(function (blob) {
        var res = { blob: blob, side: st.side, quality: st.quality };
        if (!best || blob.size < best.blob.size) best = res;
        return blob.size <= target ? res : next();
      });
    }
    return next();
  }

  // the square of the source image shown for a crop: zoom 1 fits the short side, x and y run from 0 to 1 across the spare room
  function cropRect(w, h, crop) {
    crop = crop || {};
    var zoom = Math.max(1, crop.zoom || 1), side = Math.min(w, h) / zoom;
    var x = crop.x == null ? 0.5 : crop.x, y = crop.y == null ? 0.5 : crop.y;
    return { sx: (w - side) * Math.max(0, Math.min(1, x)), sy: (h - side) * Math.max(0, Math.min(1, y)), side: side };
  }

  return { ladder: ladder, toTarget: toTarget, cropRect: cropRect };
});
