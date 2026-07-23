/* ============================================================
   DriveLink V2V simulation engine (shared).
   Pure client-side traffic model: IDM-lite car-following,
   V2V-negotiated lane changes, and an on-ramp merge gate.
   Rendered to a 2D canvas. Used by the hero (ambient) and the
   Product page (interactive). Mirrors the DriveLink Godot sim.
   ============================================================ */

export interface SimOptions {
  lanes: number;
  density: number; // target vehicles per lane
  v2v: boolean; // enable V2V negotiation + mesh links
  ramp: boolean; // enable on-ramp merge gate
  heatmap: boolean; // render conflict-zone risk heatmap
  speed: number; // global speed multiplier
};

export const DEFAULT_OPTIONS: SimOptions = {
  lanes: 3,
  density: 3,
  v2v: true,
  ramp: false,
  heatmap: false,
  speed: 1,
};

// Dynamics (logical px, seconds).
const CAR_LEN = 46;
const A_MAX = 70;
const B_COMF = 95;
const B_MAX = 220;
const MIN_GAP = 28;
const HEADWAY = 0.75;
const CHANGE_DUR = 0.9;
export const V2V_R = 175;

const PALETTE = ['#0F4C81', '#1E3A8A', '#1E60A3', '#2563EB'];

export interface Car {
  id: string;
  x: number;
  v: number;
  vDesired: number;
  lf: number; // current lane (float; interpolates during a change)
  lane: number; // committed lane
  target: number;
  changing: boolean;
  changeT: number;
  yieldT: number; // V2V "yield" cooldown
  color: string;
  intent: string;
  ramp: boolean;
  rampJoined: boolean;
};

export interface SimState {
  W: number;
  H: number;
  roadTop: number;
  roadH: number;
  laneH: number;
  mergeX: number;
  cars: Car[];
  time: number;
  links: number; // active V2V links this frame
  opts: SimOptions;
  seq: number;
};

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

export const laneY = (s: SimState, lf: number) => s.roadTop + s.laneH * (lf + 0.5);

function makeCar(seq: number, x: number, lane: number, ramp = false): Car {
  return {
    id: `DRV-${String.fromCharCode(65 + (seq % 6))}${((seq * 7) % 9) + 1}`,
    x,
    v: 70 + Math.random() * 30,
    vDesired: 100 + Math.random() * 45,
    lf: lane,
    lane,
    target: lane,
    changing: false,
    changeT: 0,
    yieldT: 0,
    color: PALETTE[seq % PALETTE.length],
    intent: 'Cruising',
    ramp,
    rampJoined: !ramp,
  };
}

export function createSim(W: number, H: number, opts: SimOptions): SimState {
  const lanes = opts.lanes;
  const laneSpacing = 52;
  const roadH = lanes * laneSpacing;
  const roadTop = (H - roadH) / 2 - (opts.ramp ? 26 : 0);
  const s: SimState = {
    W,
    H,
    roadTop,
    roadH,
    laneH: laneSpacing,
    mergeX: W * 0.56,
    cars: [],
    time: 0,
    links: 0,
    opts,
    seq: 0,
  };
  reseed(s);
  return s;
}

export function reseed(s: SimState) {
  s.cars = [];
  s.seq = 0;
  for (let lane = 0; lane < s.opts.lanes; lane++) {
    for (let k = 0; k < s.opts.density; k++) {
      const spacing = s.W / Math.max(1, s.opts.density);
      s.cars.push(makeCar(s.seq++, 80 + k * spacing + lane * 70, lane));
    }
  }
  if (s.opts.ramp) {
    s.cars.push(makeCar(s.seq++, s.mergeX - 300, s.opts.lanes - 1, true));
  }
}

// Re-resolve geometry when the canvas size changes.
export function resizeSim(s: SimState, W: number, H: number) {
  s.W = W;
  s.H = H;
  s.roadTop = (H - s.roadH) / 2 - (s.opts.ramp ? 26 : 0);
  s.mergeX = W * 0.56;
}

function neighbor(s: SimState, self: Car, lane: number, ahead: boolean): Car | null {
  let best: Car | null = null;
  let bestGap = Infinity;
  for (const o of s.cars) {
    if (o === self) continue;
    if (Math.abs(o.lf - lane) > 0.55) continue;
    let d = ahead ? o.x - self.x : self.x - o.x;
    if (d <= 0) d += s.W + 120; // wrap-around awareness
    if (d < bestGap) {
      bestGap = d;
      best = o;
    }
  }
  return best;
}

function gapAhead(s: SimState, self: Car, lane: number): number {
  const lead = neighbor(s, self, lane, true);
  if (!lead) return 9999;
  let d = lead.x - self.x;
  if (d <= 0) d += s.W + 120;
  return d - CAR_LEN;
}
function gapBehind(s: SimState, self: Car, lane: number): number {
  const back = neighbor(s, self, lane, false);
  if (!back) return 9999;
  let d = self.x - back.x;
  if (d <= 0) d += s.W + 120;
  return d - CAR_LEN;
}

function follow(self: Car, lead: Car | null, gap: number): number {
  if (!lead) return A_MAX * (1 - Math.pow(self.v / self.vDesired, 4));
  const s = Math.max(gap, 1);
  const dv = self.v - lead.v;
  const sStar = MIN_GAP + Math.max(0, self.v * HEADWAY + (self.v * dv) / (2 * Math.sqrt(A_MAX * B_COMF)));
  return A_MAX * (1 - Math.pow(self.v / self.vDesired, 4) - Math.pow(sStar / s, 2));
}

export function stepSim(s: SimState, dtRaw: number) {
  const dt = dtRaw * s.opts.speed;
  s.time += dt;
  const lastLane = s.opts.lanes - 1;

  for (const c of s.cars) {
    c.yieldT = Math.max(0, c.yieldT - dt);

    // --- on-ramp merge gate ---
    if (c.ramp && !c.rampJoined) {
      if (c.x < s.mergeX - 4) {
        c.intent = 'On ramp';
        c.v = Math.min(c.v + 40 * dt, c.vDesired * 0.8);
        c.x += c.v * dt;
        c.lf = lastLane + 0.92;
        continue;
      }
      const ga = gapAhead(s, c, lastLane);
      const gb = gapBehind(s, c, lastLane);
      if (s.opts.v2v ? ga > 78 && gb > 58 : ga > 120 && gb > 110) {
        c.intent = 'MERGE';
        c.rampJoined = true;
        c.changing = true;
        c.target = lastLane;
        c.changeT = 0;
      } else {
        c.intent = 'WAIT · gate';
        c.v = Math.max(c.v - 60 * dt, 18);
        c.x = Math.min(c.x + c.v * dt, s.mergeX);
        c.lf = lastLane + 0.92;
        if (s.opts.v2v) {
          const back = neighbor(s, c, lastLane, false);
          if (back) back.yieldT = 0.5;
        }
        continue;
      }
    }

    // --- lane-change decision (V2V negotiated) ---
    if (!c.changing && !c.ramp && s.opts.lanes > 1) {
      const myGap = gapAhead(s, c, c.lane);
      const blocked = myGap < 95 && c.v < c.vDesired * 0.9;
      if (blocked) {
        let bestLane = c.lane;
        let bestGap = myGap + 55;
        for (const cand of [c.lane - 1, c.lane + 1]) {
          if (cand < 0 || cand >= s.opts.lanes) continue;
          const ahead = gapAhead(s, c, cand);
          const behind = gapBehind(s, c, cand);
          const safeBehind = s.opts.v2v ? 60 : 110; // V2V lets peers yield → tighter gaps
          if (ahead > bestGap && behind > safeBehind) {
            bestGap = ahead;
            bestLane = cand;
          }
        }
        if (bestLane !== c.lane) {
          c.changing = true;
          c.target = bestLane;
          c.changeT = 0;
          c.intent = bestLane < c.lane ? 'Lane change ↑' : 'Lane change ↓';
          if (s.opts.v2v) {
            const back = neighbor(s, c, bestLane, false);
            if (back) back.yieldT = 0.6;
          }
        }
      }
    }

    // --- dynamics ---
    const yielding = s.opts.v2v && c.yieldT > 0;
    const vd = yielding ? c.vDesired * 0.6 : c.vDesired;
    const lane = c.changing ? c.target : c.lane;
    const lead = neighbor(s, c, lane, true);
    const gap = gapAhead(s, c, lane);
    const savedVd = c.vDesired;
    c.vDesired = vd;
    let a = follow(c, lead, gap);
    c.vDesired = savedVd;

    a = clamp(a, -B_MAX, A_MAX);
    c.v = Math.max(0, c.v + a * dt);
    c.x += c.v * dt;

    // --- execute lane change ---
    if (c.changing) {
      c.changeT += dt / CHANGE_DUR;
      const from = c.lane;
      const to = c.target;
      c.lf = from + (to - from) * easeInOut(clamp(c.changeT, 0, 1));
      if (c.changeT >= 1) {
        c.changing = false;
        c.lane = to;
        c.lf = to;
        c.ramp = false;
        c.intent = 'Cruising';
      }
    } else if (!c.ramp) {
      c.intent = yielding
        ? 'Yielding · V2V'
        : lead && gap < 110
        ? 'Car-following'
        : 'Cruising';
    }

    // --- loop forever ---
    if (c.x > s.W + 60) {
      c.x = -60;
      c.v = 70 + Math.random() * 30;
      c.vDesired = 100 + Math.random() * 45;
    }
  }
}

/* ---------------------- conflict detection ---------------------- */

export interface Conflict { x: number; y: number; risk: number }
const CONFLICT_RANGE = 135;

// Pairwise risk field: rear-end risk (same lane, closing) + side/merge risk
// (adjacent lane, amplified when a vehicle is changing lanes or merging).
export function computeConflicts(s: SimState): Conflict[] {
  const pts: Conflict[] = [];
  for (let i = 0; i < s.cars.length; i++) {
    for (let j = i + 1; j < s.cars.length; j++) {
      const a = s.cars[i];
      const b = s.cars[j];
      const dl = Math.abs(a.lf - b.lf);
      if (dl > 1.15) continue;
      const gap = Math.abs(a.x - b.x) - CAR_LEN;
      if (gap > CONFLICT_RANGE || gap < -CAR_LEN) continue;
      const prox = clamp(1 - gap / CONFLICT_RANGE, 0, 1);
      const rear = a.x < b.x ? a : b;
      const front = a.x < b.x ? b : a;
      const closing = clamp((rear.v - front.v) / 28, 0, 1);
      let risk: number;
      if (dl < 0.5) {
        risk = prox * (0.35 + 0.65 * closing); // rear-end
      } else {
        const changing = a.changing || b.changing ? 1 : 0;
        const merging = (a.ramp && !a.rampJoined) || (b.ramp && !b.rampJoined) ? 1 : 0;
        risk = prox * (0.4 + 0.34 * changing + 0.3 * merging + 0.18 * closing); // side/merge
      }
      risk = clamp(risk, 0, 1);
      if (risk < 0.12) continue;
      pts.push({ x: (a.x + b.x) / 2, y: (laneY(s, a.lf) + laneY(s, b.lf)) / 2, risk });
    }
  }
  return pts;
}

/* ---------------------- rendering ---------------------- */

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

export interface RenderResult { links: number; latency: number; conflicts: number }

export function renderSim(
  ctx: CanvasRenderingContext2D,
  s: SimState,
  cssW: number,
  cssH: number,
  dpr: number,
): RenderResult {
  const sx = cssW / s.W;
  const sy = cssH / s.H;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cssW, cssH);

  const X = (x: number) => x * sx;
  const Y = (y: number) => y * sy;

  // road band
  const top = s.roadTop;
  const bottom = s.roadTop + s.roadH;
  const grad = ctx.createLinearGradient(0, Y(top), 0, Y(bottom));
  grad.addColorStop(0, 'rgba(15,76,129,0.05)');
  grad.addColorStop(1, 'rgba(15,76,129,0.02)');
  ctx.fillStyle = grad;
  roundRect(ctx, X(40), Y(top), X(s.W - 80) - X(40), s.roadH * sy, 16 * sy);
  ctx.fill();
  ctx.strokeStyle = 'rgba(15,76,129,0.10)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // on-ramp (only when enabled) — a contained, shaded merging wedge
  if (s.opts.ramp) {
    const last = s.opts.lanes - 1;
    const my = laneY(s, last);
    const x0 = s.mergeX - 280;
    const y0 = my + 78;
    ctx.fillStyle = 'rgba(15,76,129,0.04)';
    ctx.beginPath();
    ctx.moveTo(X(x0), Y(y0));
    ctx.lineTo(X(s.mergeX), Y(my - s.laneH * 0.5));
    ctx.lineTo(X(s.mergeX + 6), Y(my + s.laneH * 0.5));
    ctx.lineTo(X(x0), Y(y0 + s.laneH * 0.9));
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(15,76,129,0.16)';
    ctx.lineWidth = 1.4 * sy;
    ctx.setLineDash([8 * sx, 7 * sx]);
    ctx.beginPath();
    ctx.moveTo(X(x0), Y(y0 + s.laneH * 0.45));
    ctx.lineTo(X(s.mergeX), Y(my));
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // conflict-zone heatmap (risk field) — drawn under dividers/cars
  const conflictPts = computeConflicts(s);
  let conflicts = 0;
  for (const p of conflictPts) if (p.risk > 0.42) conflicts++;
  if (s.opts.heatmap) {
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    const pulse = 0.78 + 0.22 * Math.sin(s.time * 4);
    for (const p of conflictPts) {
      const r = (38 + 80 * p.risk) * sx;
      const cx = X(p.x);
      const cy = Y(p.y);
      const t = p.risk;
      const cr = Math.round(250 + (231 - 250) * t);
      const cg = Math.round(176 + (76 - 176) * t);
      const cb = Math.round(60 + (60 - 60) * t);
      const alpha = (0.08 + 0.5 * p.risk) * pulse;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      g.addColorStop(0, `rgba(${cr},${cg},${cb},${alpha})`);
      g.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    // mark the highest-risk hotspots with a dashed ring
    ctx.strokeStyle = 'rgba(231,76,60,0.55)';
    ctx.lineWidth = 1 * sy;
    ctx.setLineDash([3 * sx, 4 * sx]);
    for (const p of conflictPts) {
      if (p.risk < 0.6) continue;
      const rr = (20 + 8 * Math.sin(s.time * 5)) * sx;
      ctx.beginPath();
      ctx.arc(X(p.x), Y(p.y), rr, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.setLineDash([]);
  }

  // lane dividers (animated dash flow)
  ctx.strokeStyle = 'rgba(15,76,129,0.20)';
  ctx.lineWidth = 1.2 * sy;
  ctx.setLineDash([10 * sx, 10 * sx]);
  ctx.lineDashOffset = -((s.time * 70) % 1000) * sx;
  for (let i = 1; i < s.opts.lanes; i++) {
    const y = Y(s.roadTop + s.laneH * i);
    ctx.beginPath();
    ctx.moveTo(X(48), y);
    ctx.lineTo(X(s.W - 48), y);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  // V2V mesh links + travelling packets
  let links = 0;
  if (s.opts.v2v) {
    for (let i = 0; i < s.cars.length; i++) {
      for (let j = i + 1; j < s.cars.length; j++) {
        const a = s.cars[i];
        const b = s.cars[j];
        const ax = a.x;
        const ay = laneY(s, a.lf);
        const bx = b.x;
        const by = laneY(s, b.lf);
        const dist = Math.hypot(ax - bx, ay - by);
        if (dist > V2V_R) continue;
        links++;
        const negotiating = a.yieldT > 0 || b.yieldT > 0;
        const fade = 1 - dist / V2V_R;
        const alpha = fade * (negotiating ? 0.8 : 0.28);
        ctx.strokeStyle = negotiating ? `rgba(245,140,55,${alpha})` : `rgba(15,76,129,${alpha})`;
        ctx.lineWidth = (negotiating ? 1.3 : 0.9) * sy;
        ctx.setLineDash([2 * sx, 7 * sx]);
        ctx.beginPath();
        ctx.moveTo(X(ax), Y(ay));
        ctx.lineTo(X(bx), Y(by));
        ctx.stroke();
        ctx.setLineDash([]);
        const t = (s.time * 0.9 + i * 0.17 + j * 0.07) % 1;
        const px = ax + (bx - ax) * t;
        const py = ay + (by - ay) * t;
        ctx.fillStyle = negotiating ? 'rgba(245,140,55,0.95)' : `rgba(15,76,129,${0.55 * fade + 0.25})`;
        ctx.beginPath();
        ctx.arc(X(px), Y(py), 2 * sy, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  s.links = links;

  // cars
  for (const c of s.cars) {
    const x = X(c.x);
    const y = Y(laneY(s, c.lf));
    const w = CAR_LEN * sx;
    const h = 23 * sy;

    // soft shadow
    ctx.fillStyle = 'rgba(15,76,129,0.14)';
    ctx.beginPath();
    ctx.ellipse(x, y + 10 * sy, w * 0.52, 3.5 * sy, 0, 0, Math.PI * 2);
    ctx.fill();

    // body
    ctx.fillStyle = c.color;
    roundRect(ctx, x - w / 2, y - h / 2, w, h, 7 * sy);
    ctx.fill();
    // windshield
    ctx.fillStyle = 'rgba(255,255,255,0.70)';
    roundRect(ctx, x - w * 0.20, y - h * 0.32, w * 0.32, h * 0.64, 2.5 * sy);
    ctx.fill();
    // headlight strip
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    roundRect(ctx, x + w * 0.40, y - h * 0.30, 1.8 * sx, h * 0.6, 1 * sy);
    ctx.fill();
  }

  const latency = Math.round(26 + links * 1.4 + Math.sin(s.time * 3) * 3);
  return { links, latency, conflicts };
}
