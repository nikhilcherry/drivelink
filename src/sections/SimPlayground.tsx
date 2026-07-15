'use client';
import { useEffect, useRef, useState } from 'react';
import { createSim, stepSim, renderSim, resizeSim, type SimOptions, type SimState } from '../lib/v2vSim';

const LOGICAL_W = 1000;
const LOGICAL_H = 470;

type Stats = { vehicles: number; links: number; latency: number; flow: number; conflicts: number };

export function SimPlayground() {
  const [lanes, setLanes] = useState(3);
  const [density, setDensity] = useState(3);
  const [v2v, setV2v] = useState(true);
  const [ramp, setRamp] = useState(true);
  const [heatmap, setHeatmap] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [stats, setStats] = useState<Stats>({ vehicles: 18, links: 42, latency: 34, flow: 58, conflicts: 2 });

  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const simRef = useRef<SimState | null>(null);
  const optsRef = useRef<SimOptions>({ lanes, density, v2v, ramp, heatmap, speed });

  // keep live (non-structural) options in sync without rebuilding
  optsRef.current = { lanes, density, v2v, ramp, heatmap, speed };
  if (simRef.current) {
    simRef.current.opts.v2v = v2v;
    simRef.current.opts.heatmap = heatmap;
    simRef.current.opts.speed = speed;
  }

  // rebuild the sim when structural options change
  useEffect(() => {
    simRef.current = createSim(LOGICAL_W, LOGICAL_H, { lanes, density, v2v, ramp, heatmap, speed });
  }, [lanes, density, ramp]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    if (!canvas || !stage) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    if (!simRef.current) {
      simRef.current = createSim(LOGICAL_W, LOGICAL_H, optsRef.current);
    }

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let cssW = 0;
    let cssH = 0;
    let dpr = 1;
    const resize = () => {
      const r = stage.getBoundingClientRect();
      cssW = r.width;
      cssH = r.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      if (simRef.current) resizeSim(simRef.current, LOGICAL_W, LOGICAL_H);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(stage);

    let raf = 0;
    let last = performance.now();
    let acc = 0;

    const publishStats = (sim: SimState, latency: number, links: number, conflicts: number) => {
      const flow = sim.cars.length
        ? Math.round((sim.cars.reduce((s, c) => s + c.v, 0) / sim.cars.length) * 0.7)
        : 0;
      setStats({ vehicles: sim.cars.length, links, latency, flow, conflicts });
    };

    const render = (dt: number) => {
      const sim = simRef.current;
      if (!sim) return;
      stepSim(sim, dt);
      const { latency, links, conflicts } = renderSim(ctx, sim, cssW, cssH, dpr);
      acc += dt;
      if (acc > 0.25) {
        acc = 0;
        publishStats(sim, latency, links, conflicts);
      }
    };

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      render(dt);
      raf = requestAnimationFrame(frame);
    };

    if (reduce) {
      const sim = simRef.current;
      if (sim) {
        stepSim(sim, 0);
        const { latency, links, conflicts } = renderSim(ctx, sim, cssW, cssH, dpr);
        publishStats(sim, latency, links, conflicts);
      }
    } else {
      raf = requestAnimationFrame(frame);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  const reseed = () => {
    simRef.current = createSim(LOGICAL_W, LOGICAL_H, optsRef.current);
  };

  return (
    <div className="dlw-sim">
      <div className="dlw-sim-stage" ref={stageRef}>
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
        <div className="dlw-sim-badges">
          <span className={`dlw-sim-badge ${v2v ? 'on' : 'off'}`}>
            <span className="d" /> V2V mesh {v2v ? 'ON' : 'OFF'}
          </span>
          <span className="dlw-sim-badge muted">drv-mesh · v0.1</span>
        </div>
        <div className="dlw-sim-stats">
          <Stat label="Vehicles" value={`${stats.vehicles}`} />
          <Stat label="V2V links" value={`${stats.links}`} />
          <Stat label="Conflicts" value={`${stats.conflicts}`} danger={stats.conflicts > 0} />
          <Stat label="Avg latency" value={`${stats.latency}ms`} />
          <Stat label="Avg flow" value={`${stats.flow} km/h`} />
        </div>
      </div>

      <div className="dlw-sim-controls">
        <div className="dlw-sim-ctl">
          <span className="lbl">Mesh</span>
          <div className="dlw-sim-toggles">
            <button className={`dlw-sim-toggle ${v2v ? 'active' : ''}`} onClick={() => setV2v((x) => !x)}>
              V2V negotiation
            </button>
            <button className={`dlw-sim-toggle ${ramp ? 'active' : ''}`} onClick={() => setRamp((x) => !x)}>
              On-ramp merge
            </button>
            <button className={`dlw-sim-toggle ${heatmap ? 'danger' : ''}`} onClick={() => setHeatmap((x) => !x)}>
              Conflict heatmap
            </button>
          </div>
        </div>

        <div className="dlw-sim-ctl">
          <span className="lbl">Lanes <b>{lanes}</b></span>
          <input type="range" min={2} max={4} step={1} value={lanes} onChange={(e) => setLanes(+e.target.value)} />
        </div>

        <div className="dlw-sim-ctl">
          <span className="lbl">Density <b>{density}/lane</b></span>
          <input type="range" min={1} max={6} step={1} value={density} onChange={(e) => setDensity(+e.target.value)} />
        </div>

        <div className="dlw-sim-ctl">
          <span className="lbl">Speed <b>{speed.toFixed(1)}×</b></span>
          <input type="range" min={0.4} max={2} step={0.1} value={speed} onChange={(e) => setSpeed(+e.target.value)} />
        </div>

        <button className="dlw-sim-reseed" onClick={reseed}>Reseed traffic</button>
      </div>

      <p className="dlw-sim-caption">
        Toggle <b>V2V negotiation</b> off to watch cooperation break down — cars demand larger gaps,
        merges stall at the gate, and average flow drops. Every decision (car-following, lane change,
        merge gate) runs client-side in your browser.
      </p>
    </div>
  );
}

function Stat({ label, value, danger }: { label: string; value: string; danger?: boolean }) {
  return (
    <div className={`dlw-sim-stat${danger ? ' danger' : ''}`}>
      <span className="v">{value}</span>
      <span className="k">{label}</span>
    </div>
  );
}
