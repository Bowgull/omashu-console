// A plain pixel painter with the two calls forest.js uses (fillStyle, fillRect, plus globalAlpha).
// Same picture as the browser's canvas, many times faster, and it runs in a
// Web Worker too (no page needed), so the forest is drawn on another processor core.
function softCtx(w, h) {
  const img = new ImageData(w, h), d = img.data, cache = new Map(); let col = [0, 0, 0, 1];
  const parse = s => { let v = cache.get(s); if (v) return v;
    if (s[0] === '#') { const x = s.length === 4 ? s.slice(1).split('').map(ch => parseInt(ch + ch, 16)) : [1, 3, 5].map(i => parseInt(s.slice(i, i + 2), 16)); v = [...x, 1] }
    else { const n = s.slice(s.indexOf('(') + 1, -1).split(',').map(Number); v = [n[0], n[1], n[2], n.length > 3 ? n[3] : 1] }
    if (cache.size > 4000) cache.clear(); cache.set(s, v); return v };
  return { img, globalAlpha: 1,
    set fillStyle(s) { col = parse(s) }, get fillStyle() { return '' },
    fillRect(x, y, rw, rh) { const x0 = Math.max(0, Math.round(x)), y0 = Math.max(0, Math.round(y)), x1 = Math.min(w, Math.round(x + rw)), y1 = Math.min(h, Math.round(y + rh));
      const a = Math.min(1, Math.max(0, col[3] * this.globalAlpha)); if (a <= 0 || x1 <= x0 || y1 <= y0) return; const r = col[0], g = col[1], b = col[2];
      for (let yy = y0; yy < y1; yy++) { let i = (yy * w + x0) * 4;
        if (a >= 1) for (let xx = x0; xx < x1; xx++, i += 4) { d[i] = r; d[i + 1] = g; d[i + 2] = b; d[i + 3] = 255 }
        else for (let xx = x0; xx < x1; xx++, i += 4) { d[i] += (r - d[i]) * a; d[i + 1] += (g - d[i + 1]) * a; d[i + 2] += (b - d[i + 2]) * a; d[i + 3] = 255 } } } } }
