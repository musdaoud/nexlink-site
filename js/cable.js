/* ==========================================================================
   RJ45 cable engine
   - Builds a spline through every .cable-pt (DOM order, document coords)
   - Draws 4 twisted pairs (T568B colours) on a fixed canvas — visible slice only
   - The RJ45 plug rides the tip; the tip follows the scroll with inertia,
     so scrolling up literally pulls the cable back
   ========================================================================== */
(() => {
  'use strict';

  const canvas = document.getElementById('cable');
  const plug = document.getElementById('plug');
  if (!canvas || !plug) return;
  const ctx = canvas.getContext('2d');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- wire spec ---------- */
  // 'brand' = HyperLink blues; 't568b' = real-world RJ45 wire colours
  const PALETTE = 't568b';
  const COLORS = {
    brand: { white: '#E6E6E6', a: '#00F0FF', b: '#1E6BFF', c: '#3BA0FF', d: '#8FA6C4', packets: ['#00F0FF', '#FFFFFF', '#3BA0FF', '#00F0FF'] },
    t568b: { white: '#ece6da', a: '#ff8a1f', b: '#22c55e', c: '#2f7bff', d: '#b8743f', packets: ['#ff8a1f', '#22c55e', '#2f7bff', '#ffffff'] },
  }[PALETTE];
  const WHITE = COLORS.white;
  // pin 1 → 8 (T568B layout). slot = pair position inside the jacket, side = strand of that pair
  const WIRES = [
    { base: WHITE, stripe: COLORS.a, slot: 0, side: 1 },
    { base: COLORS.a,                slot: 0, side: -1 },
    { base: WHITE, stripe: COLORS.b, slot: 1, side: 1 },
    { base: COLORS.c,                slot: 2, side: 1 },
    { base: WHITE, stripe: COLORS.c, slot: 2, side: -1 },
    { base: COLORS.b,                slot: 1, side: -1 },
    { base: WHITE, stripe: COLORS.d, slot: 3, side: 1 },
    { base: COLORS.d,                slot: 3, side: -1 },
  ].map(w => ({ ...w, baseDark: shade(w.base, .55), stripeDark: w.stripe && shade(w.stripe, .55) }));
  const TWIST = [62, 74, 55, 86];            // lay length per pair — different, like real CAT6
  const PACKET_COLORS = COLORS.packets;

  const STEP = 3;          // resample spacing (px)
  const U = 3;             // wire thickness at scale 1
  const FLAT = 1.06;       // wire pitch inside the plug (× U) — matches the SVG pins
  const PAIR_GAP = 1.9;
  const TWIST_R = 0.46;
  const STRAIGHT = 74;     // plug + boot length (plug units): cable is straight here
  const JACKET_END = 62;

  /* ---------- state ---------- */
  let vw = 0, vh = 0, dpr = 1, buildVW = 0, buildVH = 0;
  let N = 0, PX, PY, NX, NY, SS, FF, UU, YMAX;
  let sHero = 0, heroY = 0, sEnd = 0, endY = 0;
  let nodes = [];
  let tip = 0, tipPrev = 0, whip = 0, time = 0, last = performance.now();
  let snap = true, connected = false, lastLen = '';
  let intro = reduced ? null : { t0: 0, crimped: false, started: false };
  const packets = [];
  let spawnIn = 0;
  const hudLen = [...document.querySelectorAll('#hud-len, [data-hud-len]')];

  // per-frame buffers
  let cap = 0, CX, CY, CNX, CNY, CS, CF, CD, CU;
  const WX = [], WY = [], WZ = [];

  /* ---------- helpers ---------- */
  function shade(hex, k) {
    const n = parseInt(hex.slice(1), 16);
    return `rgb(${((n >> 16) & 255) * k | 0},${((n >> 8) & 255) * k | 0},${(n & 255) * k | 0})`;
  }
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  const easeInOut = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  function ensure(n) {
    if (n <= cap) return;
    cap = Math.ceil(n * 1.5);
    CX = new Float32Array(cap); CY = new Float32Array(cap); CNX = new Float32Array(cap); CNY = new Float32Array(cap);
    CS = new Float32Array(cap); CF = new Float32Array(cap); CD = new Float32Array(cap); CU = new Float32Array(cap);
    for (let i = 0; i < 8; i++) { WX[i] = new Float32Array(cap); WY[i] = new Float32Array(cap); WZ[i] = new Float32Array(cap); }
  }

  /* centripetal Catmull-Rom through the anchors */
  function spline(pts) {
    const n = pts.length;
    const P = [
      { x: 2 * pts[0].x - pts[1].x, y: 2 * pts[0].y - pts[1].y },
      ...pts,
      { x: 2 * pts[n - 1].x - pts[n - 2].x, y: 2 * pts[n - 1].y - pts[n - 2].y },
    ];
    const L = (p, q, ta, tb, t) => { const k = (t - ta) / (tb - ta); return { x: p.x + (q.x - p.x) * k, y: p.y + (q.y - p.y) * k }; };
    const d = (a, b) => Math.max(1e-3, Math.sqrt(Math.hypot(b.x - a.x, b.y - a.y)));
    const out = [[pts[0].x, pts[0].y]];
    for (let i = 1; i < P.length - 2; i++) {
      const p0 = P[i - 1], p1 = P[i], p2 = P[i + 1], p3 = P[i + 2];
      const t1 = d(p0, p1), t2 = t1 + d(p1, p2), t3 = t2 + d(p2, p3);
      const steps = Math.max(6, Math.ceil(Math.hypot(p2.x - p1.x, p2.y - p1.y) / 4));
      for (let s = 1; s <= steps; s++) {
        const t = t1 + (t2 - t1) * s / steps;
        const a1 = L(p0, p1, 0, t1, t), a2 = L(p1, p2, t1, t2, t), a3 = L(p2, p3, t2, t3, t);
        const b1 = L(a1, a2, 0, t2, t), b2 = L(a2, a3, t1, t3, t);
        const c = L(b1, b2, t1, t2, t);
        out.push([c.x, c.y]);
      }
    }
    return out;
  }

  /* ---------- build the route from the DOM ---------- */
  function build() {
    resizeCanvas();
    buildVW = vw; buildVH = vh;
    const sy = window.scrollY, sx = window.scrollX;
    const els = [...document.querySelectorAll('.cable-pt')].filter(el => el.getClientRects().length);
    const pts = els.map(el => {
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2 + sx, y: r.top + r.height / 2 + sy, el };
    });
    if (pts.length < 3) { N = 0; return; }
    for (let i = 1; i < pts.length; i++) if (pts[i].y < pts[i - 1].y + 2) pts[i].y = pts[i - 1].y + 2;

    // resample to uniform spacing
    const raw = spline(pts);
    const xs = [raw[0][0]], ys = [raw[0][1]];
    let carry = 0;
    for (let i = 1; i < raw.length; i++) {
      const ax = raw[i - 1][0], ay = raw[i - 1][1], bx = raw[i][0], by = raw[i][1];
      const seg = Math.hypot(bx - ax, by - ay);
      let pos = STEP - carry;
      while (pos <= seg) { const t = pos / seg; xs.push(ax + (bx - ax) * t); ys.push(ay + (by - ay) * t); pos += STEP; }
      carry = seg - (pos - STEP);
    }
    N = xs.length;
    PX = Float32Array.from(xs); PY = Float32Array.from(ys);
    NX = new Float32Array(N); NY = new Float32Array(N); SS = new Float32Array(N);
    FF = new Float32Array(N); UU = new Float32Array(N); YMAX = new Float32Array(N);

    const heroEl = pts.find(p => p.el.classList.contains('is-hero')) || pts[1];
    heroY = heroEl.y;
    const fHero = vw < 640 ? 1.15 : vw < 900 ? 1.9 : vw < 1200 ? 2.6 : 3.1;
    const fBase = vw < 640 ? .66 : vw < 900 ? .78 : 1;

    let ym = -Infinity;
    for (let k = 0; k < N; k++) {
      const a = Math.max(0, k - 1), b = Math.min(N - 1, k + 1);
      let tx = PX[b] - PX[a], ty = PY[b] - PY[a];
      const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
      NX[k] = -ty; NY[k] = tx;
      SS[k] = k * STEP;
      FF[k] = lerp(fHero, fBase, smooth(heroY, heroY + vh * .9, PY[k]));
      UU[k] = k ? UU[k - 1] + STEP / FF[k] : 0;
      ym = Math.max(ym, PY[k]); YMAX[k] = ym;
    }
    sHero = sAtY(heroY);
    sEnd = SS[N - 1];
    endY = PY[N - 1];

    nodes = pts.filter(p => p.el.classList.contains('node') || p.el.classList.contains('step-port'))
      .map(p => ({ el: p.el, y: p.y, live: false, scope: p.el.dataset.scope ? p.el.closest(p.el.dataset.scope) : null }));
    nodes.forEach(n => { n.el.classList.remove('is-live'); n.scope && n.scope.classList.remove('is-live'); });
    ensure(Math.ceil((vh + 800) / STEP * 3) + 16);
    snap = true;
  }

  function resizeCanvas() {
    vw = window.innerWidth; vh = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(vw * dpr); canvas.height = Math.round(vh * dpr);
  }

  function sAtY(y) {
    if (y <= PY[0]) return 0;
    if (YMAX[N - 1] <= y) return SS[N - 1];
    let lo = 0, hi = N - 1;
    while (lo < hi) { const mid = (lo + hi) >> 1; if (YMAX[mid] >= y) hi = mid; else lo = mid + 1; }
    if (lo === 0) return 0;
    const y0 = YMAX[lo - 1], y1 = YMAX[lo];
    return SS[lo - 1] + (y1 > y0 ? (y - y0) / (y1 - y0) : 0) * STEP;
  }

  function at(s) {
    const fk = clamp(s / STEP, 0, N - 1.0001), k = fk | 0, t = fk - k;
    return {
      x: lerp(PX[k], PX[k + 1], t), y: lerp(PY[k], PY[k + 1], t),
      f: lerp(FF[k], FF[k + 1], t), u: lerp(UU[k], UU[k + 1], t),
    };
  }

  function firstIndexY(y) {
    let lo = 0, hi = N - 1;
    while (lo < hi) { const mid = (lo + hi) >> 1; if (YMAX[mid] >= y) hi = mid; else lo = mid + 1; }
    return lo;
  }

  /* ---------- scroll → tip target ---------- */
  function targetS(sy) {
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - vh);
    const screenY = (s) => lerp(heroY, vh * .6, smooth(0, vh * .8, s));
    let ty = sy + screenY(sy);
    // make sure the plug reaches the switch port when the page bottoms out
    const extra = Math.max(0, endY - (maxScroll + screenY(maxScroll)));
    ty += extra * smooth(maxScroll - vh * 1.2, maxScroll, sy);
    let s = clamp(sAtY(ty), sHero, sEnd);
    if (sy >= maxScroll - 2 && extra > 0) s = sEnd;
    return s;
  }

  /* ---------- frame ---------- */
  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min(.05, Math.max(.001, (now - last) / 1000));
    last = now; time += dt;
    if (!N) return;

    const sy = window.scrollY;
    const target = targetS(sy);

    let splay = 1, plugAlpha = 1, plugMul = 1, prog = null;
    if (intro) {
      if (!intro.started) { intro.started = true; intro.t0 = now; }
      const t = (now - intro.t0) / 1000;
      tip = target;
      prog = WIRES.map((_, i) => easeOut(clamp((t - .1 - i * .065) / .9, 0, 1)));
      splay = 1 + 6 * (1 - easeInOut(clamp((t - .95) / .75, 0, 1)));
      const p = easeOut(clamp((t - 1.3) / .45, 0, 1));
      plugAlpha = p; plugMul = 1 + .4 * (1 - p);
      if (t > 1.78 && !intro.crimped) {
        intro.crimped = true;
        plug.classList.add('is-crimped');
        document.body.classList.add('is-ready');
      }
      if (t > 2.4) intro = null;
    } else if (snap || reduced) {
      tip = target;
    } else {
      tip += (target - tip) * (1 - Math.exp(-dt * 7));
      if (Math.abs(target - tip) < .05) tip = target;
    }
    snap = false;

    const vel = (tip - tipPrev) / dt;
    tipPrev = tip;
    if (!reduced) whip += (clamp(vel / 2400, -1, 1) - whip) * (1 - Math.exp(-dt * 4));

    draw(sy, splay, prog, dt);

    // plug
    const T = at(tip), fT = T.f;
    const B = at(Math.max(0, tip - 90 * fT));
    let dx = T.x - B.x, dy = T.y - B.y;
    const dl = Math.hypot(dx, dy) || 1; dx /= dl; dy /= dl;
    const ang = Math.atan2(-dx, dy) * 57.29578;
    plug.setAttribute('transform', `translate(${T.x.toFixed(2)} ${(T.y - sy).toFixed(2)}) rotate(${ang.toFixed(2)}) scale(${(fT * plugMul).toFixed(4)})`);
    plug.style.opacity = plugAlpha;

    // nodes light up as the plug passes them
    for (const n of nodes) {
      const live = T.y >= n.y - 2;
      if (live !== n.live) {
        n.live = live;
        n.el.classList.toggle('is-live', live);
        n.scope && n.scope.classList.toggle('is-live', live);
      }
    }

    // link state
    const conn = connected ? tip > sEnd - 30 : tip >= sEnd - 2;
    if (conn !== connected && !intro) {
      connected = conn;
      document.body.classList.toggle('is-linked', conn);
      if (conn) { plug.classList.remove('is-crimped'); void plug.getBBox(); plug.classList.add('is-crimped'); }
      window.dispatchEvent(new CustomEvent('cable:link', { detail: conn }));
    }

    if (hudLen.length) {
      const len = (tip / 160).toFixed(2) + ' m';
      if (len !== lastLen) { hudLen.forEach(el => { el.textContent = len; }); lastLen = len; }
    }
  }

  function draw(sy, splay, prog, dt) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, -sy * dpr);
    ctx.clearRect(0, sy, vw, vh);

    const T = at(tip), fT = T.f;
    const B = at(Math.max(0, tip - 90 * fT));
    let dx = T.x - B.x, dy = T.y - B.y;
    const dl = Math.hypot(dx, dy) || 1; dx /= dl; dy /= dl;
    const dnx = -dy, dny = dx;

    const top = sy - 160, bot = sy + vh + 160;
    const k0 = Math.max(0, firstIndexY(top) - 1);
    const kTip = Math.min(N - 1, Math.floor(tip / STEP));
    if (k0 > kTip) return;

    const straight = STRAIGHT * fT, blendEnd = straight + 110 * fT;
    ensure(kTip - k0 + 3);

    /* centerline slice (with whip + straight section under the plug) */
    let m = 0;
    for (let k = k0; k <= kTip + 1; k++) {
      let s, x, y, nx, ny, f, u;
      if (k > kTip) {
        if (tip - SS[kTip] < .5) break;
        s = tip; x = T.x; y = T.y; nx = dnx; ny = dny; f = fT; u = T.u;
      } else {
        s = SS[k]; x = PX[k]; y = PY[k]; nx = NX[k]; ny = NY[k]; f = FF[k]; u = UU[k];
        if (y > bot) break;
      }
      const d = tip - s;
      if (whip && !reduced) {
        const w = whip * 18 * f * Math.exp(-d / 420) * Math.sin(d * .016 - time * 8) * smooth(straight, blendEnd + 80, d);
        x += nx * w; y += ny * w;
      }
      if (d < blendEnd) {
        const lx = T.x - dx * d, ly = T.y - dy * d;
        const w = smooth(straight, blendEnd, d);
        x = lx + (x - lx) * w; y = ly + (y - ly) * w;
        nx = dnx + (nx - dnx) * w; ny = dny + (ny - dny) * w;
        const nl = Math.hypot(nx, ny) || 1; nx /= nl; ny /= nl;
      }
      CX[m] = x; CY[m] = y; CNX[m] = nx; CNY[m] = ny; CS[m] = s; CF[m] = f; CD[m] = d; CU[m] = u;
      m++;
    }
    if (m < 2) return;

    /* per-wire positions: twisted pairs that untwist into a flat row inside the plug */
    for (let j = 0; j < m; j++) {
      const u = U * CF[j];
      const flat = 1 - smooth(58 * CF[j], 150 * CF[j], CD[j]);
      for (let i = 0; i < 8; i++) {
        const w = WIRES[i];
        const ph = CU[j] / TWIST[w.slot] * 6.28318 + w.slot * 1.7;
        const tw = (w.slot - 1.5) * PAIR_GAP * u + w.side * TWIST_R * u * Math.cos(ph);
        const fl = (3.5 - i) * FLAT * u;
        const off = (tw + (fl - tw) * flat) * splay;
        WX[i][j] = CX[j] + CNX[j] * off;
        WY[i][j] = CY[j] + CNY[j] * off;
        WZ[i][j] = flat > .5 ? 1 : w.side * Math.sin(ph);
      }
    }

    ctx.lineJoin = 'round';

    /* jacket (translucent sleeve under the wires) */
    const jacketA = 1 - clamp((splay - 1) / 1.5, 0, 1);
    let jm = m - 1;
    while (jm > 0 && CD[jm] < JACKET_END * fT) jm--;
    if (jacketA > 0 && jm > 1) {
      ctx.beginPath();
      for (let j = 0; j <= jm; j++) { const h = 4.2 * U * CF[j]; ctx.lineTo(CX[j] + CNX[j] * h, CY[j] + CNY[j] * h); }
      for (let j = jm; j >= 0; j--) { const h = 4.2 * U * CF[j]; ctx.lineTo(CX[j] - CNX[j] * h, CY[j] - CNY[j] * h); }
      ctx.closePath();
      ctx.fillStyle = `rgba(0,150,255,${.14 * jacketA})`;
      ctx.fill();
      ctx.strokeStyle = `rgba(120,225,255,${.32 * jacketA})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    /* wires — back strands first, then front strands */
    ctx.lineCap = 'butt';
    for (let pass = 0; pass < 2; pass++) {
      for (let i = 0; i < 8; i++) {
        const lim = prog ? tip * prog[i] : Infinity;
        const Z = WZ[i];
        let start = -1;
        for (let j = 0; j <= m; j++) {
          const ok = j < m && CS[j] <= lim && ((Z[j] >= 0) === (pass === 1));
          if (ok && start < 0) { start = j; continue; }
          if (start >= 0 && (!ok || (j - start > 24 && Math.abs(CF[j] - CF[start]) > .05))) {
            strokeRun(i, Math.max(0, start - 1), Math.min(m - 1, j), pass);
            start = ok ? j : -1;
          }
        }
      }
    }

    /* glossy sleeve highlight on top */
    if (jacketA > 0 && jm > 1) {
      ctx.beginPath();
      for (let j = 0; j <= jm; j++) { const h = -3.1 * U * CF[j]; ctx.lineTo(CX[j] + CNX[j] * h, CY[j] + CNY[j] * h); }
      ctx.strokeStyle = `rgba(255,255,255,${.16 * jacketA})`;
      ctx.lineWidth = 1.4;
      ctx.stroke();
    }

    /* intro: glowing heads on the falling wires */
    if (prog) {
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 8; i++) {
        if (prog[i] >= 1 || prog[i] <= 0) continue;
        const lim = tip * prog[i];
        let j = m - 1; while (j > 0 && CS[j] > lim) j--;
        glow(WX[i][j], WY[i][j], 14 * CF[j], WIRES[i].stripe || WIRES[i].base, .9);
      }
      ctx.globalCompositeOperation = 'source-over';
    }

    /* data packets flowing down the cable to the plug */
    if (!reduced && !prog) {
      spawnIn -= dt;
      if (spawnIn <= 0) {
        spawnIn = (vw < 900 ? .4 : .18) + Math.random() * .4;
        packets.push({ s: CS[0], v: 650 + Math.random() * 600, c: PACKET_COLORS[(Math.random() * 4) | 0], lane: (Math.random() * 2 - 1) * 2.4 });
      }
      ctx.globalCompositeOperation = 'lighter';
      const endS = tip - straight;
      for (let p = packets.length - 1; p >= 0; p--) {
        const pk = packets[p];
        pk.s += pk.v * dt;
        if (pk.s > endS || pk.s < CS[0] - 400) { packets.splice(p, 1); continue; }
        let lo = 0, hi = m - 1;
        while (lo < hi) { const mid = (lo + hi) >> 1; if (CS[mid] >= pk.s) hi = mid; else lo = mid + 1; }
        const u = U * CF[lo];
        const fade = smooth(0, 60, endS - pk.s);
        for (let t = 0; t < 5; t++) {
          const q = Math.max(0, lo - t * 3);
          const h = pk.lane * u;
          glow(CX[q] + CNX[q] * h, CY[q] + CNY[q] * h, (t ? 5 : 9) * CF[q], pk.c, (t ? .35 - t * .06 : .95) * fade);
        }
      }
      ctx.globalCompositeOperation = 'source-over';
    }
  }

  function strokeRun(i, a, b, pass) {
    if (b <= a) return;
    const X = WX[i], Y = WY[i], w = WIRES[i], u = U * CF[a];
    ctx.beginPath();
    ctx.moveTo(X[a], Y[a]);
    for (let j = a + 1; j <= b; j++) ctx.lineTo(X[j], Y[j]);
    ctx.lineWidth = u * .96;
    ctx.strokeStyle = pass ? w.base : w.baseDark;
    ctx.stroke();
    if (w.stripe) {
      ctx.lineWidth = u * .42;
      ctx.strokeStyle = pass ? w.stripe : w.stripeDark;
      ctx.stroke();
    }
    if (pass) {
      ctx.lineWidth = u * .18;
      ctx.strokeStyle = 'rgba(255,255,255,.3)';
      ctx.stroke();
    }
  }

  function glow(x, y, r, color, a) {
    if (a <= 0) return;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(255,255,255,${a})`);
    g.addColorStop(.25, hexA(color, a * .9));
    g.addColorStop(1, hexA(color, 0));
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.fill();
  }
  function hexA(hex, a) {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  }

  /* ---------- lifecycle ---------- */
  let rebuildTimer;
  function scheduleBuild() { clearTimeout(rebuildTimer); rebuildTimer = setTimeout(build, 120); }

  window.addEventListener('resize', () => {
    resizeCanvas();
    // ignore mobile URL-bar height jitter; rebuild on real layout changes
    if (vw !== buildVW || Math.abs(vh - buildVH) > 140) scheduleBuild();
  });
  if ('ResizeObserver' in window) {
    let lastH = 0;
    new ResizeObserver(() => {
      const h = document.documentElement.scrollHeight;
      if (Math.abs(h - lastH) > 2) { lastH = h; scheduleBuild(); }
    }).observe(document.body);
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(build);
  window.addEventListener('load', build);

  build();
  if (reduced) { plug.classList.add('is-crimped'); document.body.classList.add('is-ready'); }
  requestAnimationFrame(frame);

  window.NexCable = { rebuild: build };
})();
