import { describe, it, expect, afterEach } from 'vitest';
import {
  createSim,
  stepSim,
  reseed,
  resizeSim,
  computeConflicts,
  laneY,
  DEFAULT_OPTIONS,
  type SimOptions,
} from '../src/lib/v2vSim';

/**
 * The hero and /product simulations are the most-watched thing on the site, and
 * they run unattended in a rAF loop — a car that escapes the road or drives
 * through another car is visible to every visitor and reported by none.
 *
 * makeCar() calls Math.random, so each test pins it to a small LCG. Seeding it
 * is what makes "run 2000 frames and assert nothing broke" reproducible rather
 * than a flake generator.
 */
const realRandom = Math.random;
afterEach(() => {
  Math.random = realRandom;
});

function seed(n: number) {
  let s = n >>> 0;
  Math.random = () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
}

const W = 1000;
const H = 437.5;
const opts = (o: Partial<SimOptions> = {}): SimOptions => ({ ...DEFAULT_OPTIONS, ...o });

describe('createSim / reseed', () => {
  it('lays out one car per lane per density step', () => {
    seed(1);
    const s = createSim(W, H, opts({ lanes: 3, density: 4, ramp: false }));
    expect(s.cars).toHaveLength(12);
    expect(new Set(s.cars.map((c) => c.lane))).toEqual(new Set([0, 1, 2]));
  });

  it('adds exactly one ramp vehicle when the on-ramp is enabled', () => {
    seed(1);
    const s = createSim(W, H, opts({ lanes: 3, density: 4, ramp: true }));
    expect(s.cars).toHaveLength(13);
    expect(s.cars.filter((c) => c.ramp)).toHaveLength(1);
  });

  it('centres the road vertically and derives lane centres from it', () => {
    seed(1);
    const s = createSim(W, H, opts({ lanes: 3, ramp: false }));
    expect(s.roadH).toBe(3 * 52);
    expect(s.roadTop).toBeCloseTo((H - s.roadH) / 2);
    expect(laneY(s, 0)).toBeCloseTo(s.roadTop + 26);
    expect(laneY(s, 2)).toBeCloseTo(s.roadTop + s.roadH - 26);
  });

  it('reseed restores the starting population and id sequence', () => {
    seed(1);
    const s = createSim(W, H, opts({ lanes: 2, density: 3, ramp: false }));
    for (let i = 0; i < 200; i++) stepSim(s, 1 / 60);
    reseed(s);
    expect(s.cars).toHaveLength(6);
    expect(s.seq).toBe(6);
  });
});

describe('resizeSim', () => {
  it('re-derives the merge point and vertical centring without touching traffic', () => {
    seed(1);
    const s = createSim(W, H, opts({ lanes: 3, ramp: false }));
    const before = s.cars.length;
    resizeSim(s, 1600, 700);
    expect(s.W).toBe(1600);
    expect(s.mergeX).toBeCloseTo(1600 * 0.56);
    expect(s.roadTop).toBeCloseTo((700 - s.roadH) / 2);
    expect(s.cars).toHaveLength(before);
  });
});

describe('stepSim invariants', () => {
  const FRAMES = 2000; // ~33 seconds at 60fps

  it.each([
    ['mesh on', true],
    ['mesh off', false],
  ])('holds the road with %s', (_label, v2v) => {
    seed(42);
    const s = createSim(W, H, opts({ lanes: 3, density: 3, v2v, ramp: false }));

    // Collected rather than asserted per frame: 2000 frames x 9 cars is
    // 100k+ assertions, which costs seconds and reports the same failure once
    // per frame. One assertion at the end names the first real violation.
    const violations: string[] = [];
    for (let frame = 0; frame < FRAMES; frame++) {
      stepSim(s, 1 / 60);
      for (const c of s.cars) {
        if (!Number.isFinite(c.x) || !Number.isFinite(c.v)) violations.push(`frame ${frame} ${c.id}: non-finite state`);
        // Cars loop rather than escape: the wrap happens at W + 60.
        else if (c.x < -60 || c.x > s.W + 60) violations.push(`frame ${frame} ${c.id}: x=${c.x} off canvas`);
        // Never reversing, never leaving the painted lanes.
        else if (c.v < 0) violations.push(`frame ${frame} ${c.id}: v=${c.v} reversing`);
        else if (c.lf < 0 || c.lf > s.opts.lanes - 1) violations.push(`frame ${frame} ${c.id}: lf=${c.lf} off road`);
      }
    }
    expect(violations.slice(0, 5)).toEqual([]);
  });

  it('never lets two cars in the same lane overlap', () => {
    seed(42);
    const s = createSim(W, H, opts({ lanes: 3, density: 3, v2v: true, ramp: false }));
    const CAR_LEN = 46;

    const overlaps: string[] = [];
    for (let frame = 0; frame < FRAMES; frame++) {
      stepSim(s, 1 / 60);
      for (let i = 0; i < s.cars.length; i++) {
        for (let j = i + 1; j < s.cars.length; j++) {
          const a = s.cars[i];
          const b = s.cars[j];
          if (Math.abs(a.lf - b.lf) > 0.35) continue; // different lanes
          const gap = Math.abs(a.x - b.x);
          if (gap <= CAR_LEN) overlaps.push(`frame ${frame}: ${a.id}/${b.id} gap ${gap.toFixed(1)}`);
        }
      }
    }
    expect(overlaps.slice(0, 5)).toEqual([]);
  });

  it('scales elapsed time by the speed option', () => {
    seed(7);
    const slow = createSim(W, H, opts({ speed: 1, ramp: false }));
    seed(7);
    const fast = createSim(W, H, opts({ speed: 2, ramp: false }));
    for (let i = 0; i < 60; i++) {
      stepSim(slow, 1 / 60);
      stepSim(fast, 1 / 60);
    }
    expect(fast.time).toBeCloseTo(slow.time * 2);
  });
});

describe('the claim the simulation exists to make', () => {
  /**
   * The on-ramp gate is the whole argument: with the mesh on, the merging car
   * asks neighbours to yield and accepts a tighter gap (78/58 vs 120/110), so
   * it merges sooner. That is a statistical claim, not a per-run one — on a
   * given seed the plain run can get lucky with an early gap, and pinning the
   * test to one seed would encode that luck as a requirement.
   */
  function framesToMerge(v2v: boolean, s0: number): number {
    seed(s0);
    const s = createSim(W, H, opts({ lanes: 3, density: 4, v2v, ramp: true }));
    const ramp = s.cars[s.cars.length - 1];
    for (let frame = 0; frame < 3000; frame++) {
      stepSim(s, 1 / 60);
      if (ramp.rampJoined) return frame;
    }
    return 3000;
  }

  const seeds = Array.from({ length: 30 }, (_, i) => i * 37 + 1);

  it('merges the on-ramp vehicle materially sooner in aggregate', () => {
    const withMesh = seeds.reduce((t, s) => t + framesToMerge(true, s), 0);
    const without = seeds.reduce((t, s) => t + framesToMerge(false, s), 0);
    expect(withMesh).toBeLessThan(without * 0.95);
  });

  it('always completes the merge, mesh or not', () => {
    for (const s of seeds) {
      expect(framesToMerge(true, s)).toBeLessThan(3000);
      expect(framesToMerge(false, s)).toBeLessThan(3000);
    }
  });
});

describe('computeConflicts', () => {
  it('reports finite risk points inside the canvas', () => {
    seed(3);
    const s = createSim(W, H, opts({ lanes: 3, density: 4, ramp: false }));
    for (let i = 0; i < 120; i++) stepSim(s, 1 / 60);
    for (const p of computeConflicts(s)) {
      expect(Number.isFinite(p.x)).toBe(true);
      expect(Number.isFinite(p.y)).toBe(true);
      expect(p.risk).toBeGreaterThan(0);
      expect(p.risk).toBeLessThanOrEqual(1);
    }
  });

  it('finds nothing when a single car has nobody to conflict with', () => {
    seed(3);
    const s = createSim(W, H, opts({ lanes: 1, density: 1, ramp: false }));
    expect(s.cars).toHaveLength(1);
    expect(computeConflicts(s)).toHaveLength(0);
  });
});
