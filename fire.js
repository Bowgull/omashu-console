// The Omashu campfire: one fire for two screens (the TV in Couch Mode and the phone remote).
// makeFire({cx, cy, w, h}) returns {draw(c, t, dt, level, touch)} that paints the live pit onto a
// pixel-grid canvas of w×h: soft dithered firelight, sooted stones, an ash bed, a low pile of charred
// crossed logs, flames (noise heat field in six bands), slow sparks and smoke. level 0 = out (embers),
// 1 = full fire; in between = catching / dying down. touch = {x, y, k, spread} for a finger flare.
// Pace is a calm campfire. Approved 2026-11-08 (DECISIONS "One fire, two screens").
(function () {
  const px = (c, x, y, col) => { c.fillStyle = col; c.fillRect(x, y, 1, 1) };
  const hash = (x, y) => { let h = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263); h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967295 };
  const noise = (x, y) => { const xi = Math.floor(x), yi = Math.floor(y), u = (x - xi) ** 2 * (3 - 2 * (x - xi)), v = (y - yi) ** 2 * (3 - 2 * (y - yi));
    const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1); return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v };
  const BAND = [[122, 36, 16], [200, 64, 28], [240, 122, 44], [255, 184, 74], [255, 233, 160], [255, 251, 230]];
  const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

  window.makeFire = function ({ cx, cy, w, h }) {
    const FX = cx, FY = cy;
    // stones on an oval, lit on the side facing the flames, sooted inside when the fire is out
    const STONES = []; { let s = 5; const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280; const n = 14;
      for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2 + .1; STONES.push({ a, x: FX + Math.cos(a) * 30, y: FY + Math.sin(a) * 11, w: 9 + Math.floor(rnd() * 5), h: 6 + Math.floor(rnd() * 3), m: rnd() }) } }
    function stones(c, lv, back) {
      STONES.forEach(s => { if ((s.y < FY) !== back) return;
        const x0 = Math.round(s.x - s.w / 2), y0 = Math.round(s.y - s.h / 2), toFire = Math.atan2(FY - 6 - s.y, FX - s.x);
        for (let dy = 0; dy < s.h; dy++) for (let dx = 0; dx < s.w; dx++) {
          const nx = (dx + .5) / s.w * 2 - 1, ny = (dy + .5) / s.h * 2 - 1, r = nx * nx + ny * ny * 1.1; if (r > 1) continue;
          const lit = Math.cos(Math.atan2(ny, nx) - toFire) * Math.sqrt(r) * lv, top = -ny, edge = r > .72;
          let col = lit > .45 ? '#b48a62' : lit > .15 ? '#7e6650' : top > .3 ? '#4a4a4e' : ny > .45 ? '#1e1e22' : '#35363a';
          if (edge && lit < .3) col = '#151518';
          const inner = Math.cos(Math.atan2(ny, nx) - toFire) > .55 && r > .45; if (inner && lv < .5) col = hash(dx + x0 * 3, dy) > .4 ? '#1a1a1c' : '#25252a';
          if (!edge && s.m > .5 && lit < -.1 && hash(dx + x0, dy) > .55) col = '#2c4a2a';
          px(c, x0 + dx, y0 + dy, col) } }) }
    function ashbed(c, lv) {
      for (let y = FY - 7; y <= FY + 9; y++) for (let x = FX - 24; x <= FX + 24; x++) {
        const nx = (x - FX) / 24, ny = (y - FY - 1) / 8, r = nx * nx + ny * ny; if (r > 1) continue;
        const n = hash(x, y);
        let col = r > .78 ? (n > .5 ? '#1b1715' : '#232020') : n > .82 ? '#5a5450' : n > .55 ? '#454140' : n > .25 ? '#363232' : '#2a2726';
        if (r < .5 && n > .965) col = lv > .5 ? '#ff9a3a' : '#c8502a';
        px(c, x, y, col) } }
    const LOGS = [[FX - 21, FY - 2, FX + 17, FY - 9, 5, 'back'], [FX + 19, FY + 1, FX - 15, FY - 8, 5, 'back'],
                  [FX - 22, FY + 6, FX + 20, FY + 1, 6, 'front'], [FX + 23, FY + 8, FX - 18, FY + 4, 6, 'front']];
    function logs(c, t, lv, which) {
      const ember = .3 + .7 * lv, pulse = .88 + .12 * Math.sin(t * .6);
      LOGS.forEach(([x1, y1, x2, y2, th, layer], li) => { if (layer !== which) return;
        const len = Math.hypot(x2 - x1, y2 - y1);
        for (let k = 0; k <= len; k++) { const tt = k / len, x = Math.round(x1 + (x2 - x1) * tt), y = Math.round(y1 + (y2 - y1) * tt), mid = 1 - Math.abs(tt - .5) * 2;
          for (let j = 0; j < th; j++) { const yy = y - j, n = hash(x, yy + li * 50), bark = hash(x >> 1, yy + li * 31), charred = mid > .35 + bark * .3;
            let col;
            if (j === 0) col = '#0d0906';
            else if (charred) col = j === th - 1 ? (n > .6 ? '#3a3330' : '#2a2423') : n > .75 ? '#1a1512' : '#231c18';
            else col = j === th - 1 ? '#7a5230' : j === th - 2 ? '#5a3a1e' : bark > .7 ? '#4a2c16' : '#3a2210';
            if (charred && j > 0 && j < th - 1 && n > .45) { const e = ((n + t * .18 + k * .07) % 1) * ember * pulse;
              if (e > .78) col = '#ffb24a'; else if (e > .55) col = '#e8602c'; else if (e > .38) col = '#8a2a14'; else if (e > .22 && lv > .3) col = '#4a1a0c' }
            px(c, x, yy, col) } }
        [[x1, y1], [x2, y2]].forEach(([ex, ey]) => { c.fillStyle = '#8a6a44'; c.fillRect(ex - 1, ey - th + 1, 2, th); c.fillStyle = '#5a3e24'; c.fillRect(ex - 1, ey - Math.floor(th / 2), 2, 1) }) }) }
    // flames into a small buffer, then blitted
    const FW = 56, FH = 70, FB = document.createElement('canvas'); FB.width = FW; FB.height = FH; const fbc = FB.getContext('2d'); const FIM = fbc.createImageData(FW, FH);
    function flames(c, t, lv, touch) {
      if (lv < .03) return;
      const base = FY + 1, H = 58 * (.55 + .45 * lv), ox = FX - FW / 2, oy = base - FH;
      FIM.data.fill(0);
      for (let yy = 0; yy < FH; yy++) { const y = oy + yy, hh = (base - y) / H; if (hh > 1.15 || hh < 0) continue;
        for (let xx = 0; xx < FW; xx++) { const x = ox + xx, dx = (x - FX) / (19 * Math.max(.1, 1 - hh) ** .65 + 1);
          let heat = 1.02 * Math.min(1, lv * 1.25) - Math.abs(dx) ** 1.8 - hh * .95;
          if (hh > .6) heat -= (hh - .6) * 2.4;
          heat += (noise(x * .17, y * .13 + t * 1.5) - .5) * (.5 + hh * .8) + (noise(x * .38 + 9, y * .29 + t * 2.4) - .5) * .3;
          if (touch) { const d = Math.hypot(x - touch.x, y - touch.y); heat += touch.k * .8 * Math.exp(-d * d / 160); if (touch.spread < 1 && d > touch.spread * 70) heat -= 1.5 }
          if (y > base - 5) heat -= (y - (base - 5)) * .1;
          const b = heat > .95 ? 5 : heat > .78 ? 4 : heat > .58 ? 3 : heat > .4 ? 2 : heat > .26 ? 1 : heat > .17 ? 0 : -1;
          if (b >= 0 && !(b === 0 && hh > .45)) { const i = (yy * FW + xx) * 4, col = BAND[b]; FIM.data[i] = col[0]; FIM.data[i + 1] = col[1]; FIM.data[i + 2] = col[2]; FIM.data[i + 3] = 255 } } }
      fbc.putImageData(FIM, 0, 0); c.drawImage(FB, ox, oy) }
    // soft pixel light on everything round the fire, made once
    const GLOW = (() => { const g = document.createElement('canvas'); g.width = w; g.height = h; const c = g.getContext('2d'); const im = c.createImageData(w, h);
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const d = Math.hypot(x - FX, (y - (FY - 10)) * 1.9); let v = Math.max(0, 1 - d / 95); v = v * v;
        v += (BAYER[(y & 3) * 4 + (x & 3)] / 16 - .5) * .06; v = Math.round(Math.max(0, v) * 6) / 6;
        const i = (y * w + x) * 4; im.data[i] = 255; im.data[i + 1] = 138; im.data[i + 2] = 58; im.data[i + 3] = Math.round(v * 120) }
      c.putImageData(im, 0, 0); return g })();
    function glow(c, t, lv) { if (lv < .03) return; const f = lv * (.9 + .1 * noise(t * .7, 3));
      c.globalCompositeOperation = 'lighter'; c.globalAlpha = f; c.drawImage(GLOW, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over' }
    // particles
    class Parts { constructor(n, spawn, step) { this.p = []; this.n = n; this.spawn = spawn; this.step = step }
      run(c, dt, rate) { for (let i = this.p.length - 1; i >= 0; i--) { const q = this.p[i]; this.step(q, dt); if (q.life <= 0) this.p.splice(i, 1); else { c.globalAlpha = q.a; px(c, Math.round(q.x), Math.round(q.y), q.col) } }
        c.globalAlpha = 1; if (this.p.length < this.n && Math.random() < rate) this.p.push(this.spawn()) } }
    const sparks = new Parts(10, () => ({ x: FX - 6 + Math.random() * 12, y: FY - 30 - Math.random() * 16, vx: (Math.random() - .5) * 3, vy: -9 - Math.random() * 6, ph: Math.random() * 6.28, life: 1, a: 1, col: '#ffe9a0' }),
      (q, dt) => { q.x += q.vx * dt + Math.sin(q.ph + q.life * 4) * 3 * dt; q.y += q.vy * dt; q.vy *= .995; q.life -= dt * .22; q.a = Math.min(1, q.life * 1.4); q.col = q.life > .6 ? '#ffe9a0' : q.life > .3 ? '#ffb24a' : '#e8602c' });
    const smoke = new Parts(18, () => ({ x: FX - 3 + Math.random() * 6, y: FY - 34, vx: (Math.random() - .5) * 2, vy: -5 - Math.random() * 3, life: 1, a: 0 }),
      (q, dt) => { q.x += q.vx * dt + Math.sin(q.y * .06 + q.vx) * 2 * dt; q.y += q.vy * dt; q.life -= dt * .12; q.a = Math.max(0, Math.min(.14, q.life * .3)); q.col = 'rgb(120,130,140)' });

    return { FX, FY,
      draw(c, t, dt, lv, touch) {
        glow(c, t, lv);
        stones(c, lv, true); ashbed(c, lv); logs(c, t, lv, 'back'); flames(c, t, lv, touch); logs(c, t, lv, 'front'); stones(c, lv, false);
        sparks.run(c, dt, lv > .3 ? lv * .08 : 0); smoke.run(c, dt, lv < .6 ? .12 : .04);
      } };
  };
})();
