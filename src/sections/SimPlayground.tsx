'use client';
import { useEffect, useRef, useState } from 'react';
import { createSim, stepSim, renderSim, resizeSim, type SimOptions, type SimState } from '../lib/v2vSim';
import {
  V2VSimEngine3D,
  RIDE_CHAPTERS,
  type CameraMode,
  type SimTelemetry,
  type RideChapterInfo,
} from '../lib/v2vSim3D';

const LOGICAL_W = 1000;
const LOGICAL_H = 470;

interface Stats {
  vehicles: number;
  links: number;
  latency: number;
  flow: number;
  conflicts: number;
  egoSpeed?: number;
  egoIntent?: string;
  activeNegotiation?: string | null;
  rideActive?: boolean;
  rideProgress?: number;
  currentChapter?: RideChapterInfo;
  egoSteer?: number;
}

export function SimPlayground() {
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');
  const [cameraMode, setCameraMode] = useState<CameraMode>('chase');
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const [lanes, setLanes] = useState(3);
  const [density, setDensity] = useState(3);
  const [v2v, setV2v] = useState(true);
  const [ramp, setRamp] = useState(true);
  const [heatmap, setHeatmap] = useState(true);
  const [speed, setSpeed] = useState(1);

  const [stats, setStats] = useState<Stats>({
    vehicles: 18,
    links: 42,
    latency: 34,
    flow: 58,
    conflicts: 0,
    egoSpeed: 96,
    egoIntent: 'Cruising',
    activeNegotiation: null,
    rideActive: true,
    rideProgress: 0,
    currentChapter: RIDE_CHAPTERS[0],
  });

  const stageRef = useRef<HTMLDivElement>(null);
  const container3DRef = useRef<HTMLDivElement>(null);
  const engine3DRef = useRef<V2VSimEngine3D | null>(null);

  const canvas2DRef = useRef<HTMLCanvasElement>(null);
  const sim2DRef = useRef<SimState | null>(null);
  const opts2DRef = useRef<SimOptions>({ lanes, density, v2v, ramp, heatmap, speed });

  const isPausedRef = useRef<boolean>(false);
  const pauseSim2DRef = useRef<(() => void) | null>(null);
  const resumeSim2DRef = useRef<(() => void) | null>(null);

  // ----------------------------------------------------
  // 3D WebGL Simulation Lifecycle
  // ----------------------------------------------------
  useEffect(() => {
    if (viewMode !== '3d') return;
    const container = container3DRef.current;
    if (!container) return;

    const engine = new V2VSimEngine3D(
      container,
      { lanes, density, v2v, ramp, heatmap, speed, cameraMode, rideActive: true },
      (telemetry: SimTelemetry) => {
        setStats({
          vehicles: telemetry.vehicles,
          links: telemetry.links,
          latency: telemetry.latency,
          flow: telemetry.flow,
          conflicts: telemetry.conflicts,
          egoSpeed: telemetry.egoSpeed,
          egoIntent: telemetry.egoIntent,
          activeNegotiation: telemetry.activeNegotiation,
          rideActive: telemetry.rideActive,
          rideProgress: telemetry.rideProgress,
          currentChapter: telemetry.currentChapter,
        });
      }
    );
    engine3DRef.current = engine;
    if (!isPausedRef.current) {
      engine.start();
    }

    const handleResize = () => engine.resize();
    const ro = new ResizeObserver(handleResize);
    ro.observe(container);

    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting && !isPausedRef.current) engine.start();
        else engine.pause();
      }
    }, { threshold: 0.05 });
    io.observe(container);

    const handleVisibility = () => {
      if (document.hidden) engine.pause();
      else if (!isPausedRef.current) engine.start();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', handleVisibility);
      engine.dispose();
      engine3DRef.current = null;
    };
  }, [viewMode]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (engine3DRef.current) {
      engine3DRef.current.setOptions({ lanes, density, v2v, ramp, heatmap, speed, cameraMode });
    }
  }, [lanes, density, v2v, ramp, heatmap, speed, cameraMode]);

  // ----------------------------------------------------
  // 2D Canvas Fallback Lifecycle
  // ----------------------------------------------------
  useEffect(() => {
    opts2DRef.current = { lanes, density, v2v, ramp, heatmap, speed };
    if (sim2DRef.current) {
      sim2DRef.current.opts.v2v = v2v;
      sim2DRef.current.opts.heatmap = heatmap;
      sim2DRef.current.opts.speed = speed;
    }
  }, [lanes, density, v2v, ramp, heatmap, speed]);

  useEffect(() => {
    if (viewMode !== '2d') return;
    sim2DRef.current = createSim(LOGICAL_W, LOGICAL_H, { lanes, density, v2v, ramp, heatmap, speed });
  }, [viewMode, lanes, density, ramp]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (viewMode !== '2d') return;
    const canvas = canvas2DRef.current;
    const stage = stageRef.current;
    if (!canvas || !stage) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    if (!sim2DRef.current) {
      sim2DRef.current = createSim(LOGICAL_W, LOGICAL_H, opts2DRef.current);
    }

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
      if (sim2DRef.current) resizeSim(sim2DRef.current, LOGICAL_W, LOGICAL_H);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(stage);

    let raf = 0;
    let last = performance.now();
    let acc = 0;
    let physAcc = 0;
    const FIXED_DT = 1 / 60;
    let isVisible = true;
    let isTabVisible = !document.hidden;

    const frame = (now: number) => {
      if (!isVisible || !isTabVisible || isPausedRef.current) {
        raf = 0;
        return;
      }
      const elapsed = Math.min((now - last) / 1000, 0.1);
      last = now;
      const sim = sim2DRef.current;
      if (!sim) return;

      physAcc += elapsed;
      let steps = 0;
      while (physAcc >= FIXED_DT && steps < 3) {
        stepSim(sim, FIXED_DT);
        physAcc -= FIXED_DT;
        steps++;
      }
      if (steps >= 3) physAcc = 0;

      const { latency, links, conflicts } = renderSim(ctx, sim, cssW, cssH, dpr);
      acc += elapsed;
      if (acc > 0.25) {
        acc = 0;
        const flow = sim.cars.length
          ? Math.round((sim.cars.reduce((s, c) => s + c.v, 0) / sim.cars.length) * 0.7)
          : 0;
        setStats((prev) => ({ ...prev, vehicles: sim.cars.length, links, latency, flow, conflicts }));
      }
      raf = requestAnimationFrame(frame);
    };

    const pauseSim = () => {
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };
    const resumeSim = () => {
      if (raf || !isVisible || !isTabVisible || isPausedRef.current) return;
      last = performance.now();
      physAcc = 0;
      raf = requestAnimationFrame(frame);
    };

    pauseSim2DRef.current = pauseSim;
    resumeSim2DRef.current = resumeSim;

    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const visible = entry.isIntersecting && entry.intersectionRatio > 0.05;
        if (visible !== isVisible) {
          isVisible = visible;
          if (visible && isTabVisible && !isPausedRef.current) resumeSim();
          else pauseSim();
        }
      }
    });
    io.observe(stage);

    const onVisibility = () => {
      isTabVisible = !document.hidden;
      if (isTabVisible && isVisible && !isPausedRef.current) resumeSim();
      else pauseSim();
    };
    document.addEventListener('visibilitychange', onVisibility);

    if (!isPausedRef.current) {
      last = performance.now();
      raf = requestAnimationFrame(frame);
    } else {
      if (sim2DRef.current) {
        renderSim(ctx, sim2DRef.current, cssW, cssH, dpr);
      }
    }

    return () => {
      pauseSim();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [viewMode]);

  // Real Play / Pause handler
  const togglePause = () => {
    setIsPaused((prev) => {
      const next = !prev;
      isPausedRef.current = next;
      if (viewMode === '3d') {
        if (engine3DRef.current) {
          if (next) engine3DRef.current.pause();
          else engine3DRef.current.start();
        }
      } else {
        if (next) pauseSim2DRef.current?.();
        else resumeSim2DRef.current?.();
      }
      return next;
    });
  };

  const reseed = () => {
    if (viewMode === '3d' && engine3DRef.current) {
      engine3DRef.current.reseedTraffic();
    } else if (sim2DRef.current) {
      sim2DRef.current = createSim(LOGICAL_W, LOGICAL_H, opts2DRef.current);
      if (isPausedRef.current && canvas2DRef.current && stageRef.current) {
        const ctx = canvas2DRef.current.getContext('2d');
        if (ctx) {
          const r = stageRef.current.getBoundingClientRect();
          const dpr = Math.min(window.devicePixelRatio || 1, 2);
          renderSim(ctx, sim2DRef.current, r.width, r.height, dpr);
        }
      }
    }
  };

  const chapter = stats.currentChapter || RIDE_CHAPTERS[0];

  return (
    <div className="dlw-sim">
      {/* Sleek Unified Simulator Console Window */}
      <div className="dlw-sim-console">
        {/* Integrated Console Header Toolbar */}
        <div className="dlw-sim-console-header">
          {/* Left: Primary 2-Button Toggle: strictly [ 3D ] and [ 2D ] */}
          <div className="dlw-sim-primary-toggle">
            <button
              className={`dlw-sim-primary-btn ${viewMode === '3d' ? 'active' : ''}`}
              onClick={() => setViewMode('3d')}
              id="sim-btn-3d"
            >
              3D
            </button>
            <button
              className={`dlw-sim-primary-btn ${viewMode === '2d' ? 'active' : ''}`}
              onClick={() => setViewMode('2d')}
              id="sim-btn-2d"
            >
              2D
            </button>
          </div>

          {/* 3D Contextual Perspective Sub-Group & Scenario Indicator */}
          {viewMode === '3d' && (
            <div className="dlw-sim-3d-features">
              <div className="dlw-sim-sub-cam-group">
                <button
                  className={`dlw-sim-sub-cam-btn ${cameraMode === 'chase' ? 'active' : ''}`}
                  onClick={() => setCameraMode('chase')}
                  title="Third-person chase camera"
                >
                  Chase
                </button>
                <button
                  className={`dlw-sim-sub-cam-btn ${cameraMode === 'drone' ? 'active' : ''}`}
                  onClick={() => setCameraMode('drone')}
                  title="Aerial drone overview"
                >
                  Drone
                </button>
                <button
                  className={`dlw-sim-sub-cam-btn ${cameraMode === 'cockpit' ? 'active' : ''}`}
                  onClick={() => setCameraMode('cockpit')}
                  title="First-person driver cockpit view"
                >
                  Cockpit
                </button>
              </div>

              <div className="dlw-sim-scenario-pill">
                <span className="dot" />
                <span className="title">0{chapter.index} · {chapter.title}</span>
              </div>
            </div>
          )}

          {viewMode === '2d' && (
            <div className="dlw-sim-scenario-pill">
              <span className="dot" />
              <span className="title">2D Microscopic Traffic Model</span>
            </div>
          )}

          {/* Right: Functional Pause/Resume and Reseed */}
          <div className="dlw-sim-quick-actions">
            <button
              className={`dlw-sim-pill-btn ${isPaused ? 'is-paused' : ''}`}
              onClick={togglePause}
              title={isPaused ? 'Resume simulation' : 'Pause simulation'}
              id="sim-pause-btn"
            >
              {isPaused ? '▶ Resume' : '⏸ Pause'}
            </button>
            <button className="dlw-sim-pill-btn" onClick={reseed} title="Regenerate traffic seed">
              ↻ Reseed
            </button>
          </div>
        </div>

        {/* Main Simulation Viewport */}
        <div className="dlw-sim-stage" ref={stageRef}>
          {viewMode === '3d' ? (
            <div
              ref={container3DRef}
              style={{ width: '100%', height: '100%', display: 'block', position: 'relative' }}
            />
          ) : (
            <canvas ref={canvas2DRef} style={{ width: '100%', height: '100%', display: 'block' }} />
          )}

          {/* Subtle Paused Status Glass Indicator */}
          {isPaused && (
            <div className="dlw-sim-paused-indicator">
              <span className="paused-dot" />
              <span>SIMULATION PAUSED</span>
            </div>
          )}

        {/* 7D Dynamic Walkthrough Story Narrative Card (in chase/drone mode) */}
        {viewMode === '3d' && !isPaused && cameraMode !== 'cockpit' && (
          <div className={`dlw-sim-story-card ${chapter.statusType}`}>
            <div className="dlw-sim-story-header">
              <span className="dlw-sim-story-title">
                CH 0{chapter.index} · {chapter.title}
              </span>
              <span className="dlw-sim-story-tagline">{chapter.tagline}</span>
            </div>
            <div className="dlw-sim-story-action">{chapter.action}</div>
          </div>
        )}

        {/* Authentic Car Cockpit View (Completely unobstructed panoramic windshield) */}
        {viewMode === '3d' && cameraMode === 'cockpit' && (
          <div className="dlw-sim-cockpit-container">
            {/* Photorealistic Luxury Car Cockpit Interior Frame */}
            <img
              src="/cockpit_interior.png?v=flawless1"
              alt="Autonomous Vehicle Cockpit Frame"
              className="dlw-sim-cockpit-frame"
            />

            {/* Integrated Live Digital Cluster Speedometer */}
            <div className="dlw-sim-cluster-gauge-live">
              <span className="speed-num">{stats.egoSpeed || 96}</span>
              <span className="speed-unit">km/h</span>
            </div>
          </div>
        )}

        {/* Status Badges (in 2D mode) */}
        {viewMode === '2d' && (
          <div className="dlw-sim-badges">
            <span className={`dlw-sim-badge ${v2v ? 'on' : 'off'}`}>
              <span className="d" /> V2V mesh {v2v ? 'ON' : 'OFF'}
            </span>
            <span className="dlw-sim-badge muted">
              drv-mesh · v0.1
            </span>
          </div>
        )}

        {/* Live Metrics Telemetry Bar (in 3rd-person & 2D modes) */}
        {cameraMode !== 'cockpit' && (
          <div className="dlw-sim-stats">
            <Stat label="Vehicles" value={`${stats.vehicles}`} />
            <Stat label="V2V links" value={`${stats.links}`} />
            <Stat label="Conflicts" value={`${stats.conflicts}`} danger={stats.conflicts > 0} />
            <Stat label="Avg latency" value={`${stats.latency}ms`} />
            <Stat label="Avg flow" value={`${stats.flow} km/h`} />
          </div>
        )}

        {/* Progress Line */}
        {viewMode === '3d' && !isPaused && (
          <div
            className="dlw-sim-7d-progress"
            style={{ width: `${Math.round((stats.rideProgress || 0) * 100)}%` }}
          />
        )}
      </div>

      {/* Interactive Network & Traffic Controls (Lanes, Density, Speed, Toggles) */}
      <div className="dlw-sim-controls">
        <div className="dlw-sim-ctl is-toggles">
          <span className="lbl">Mesh Protocol</span>
          <div className="dlw-sim-toggles">
            <button
              className={`dlw-sim-toggle ${v2v ? 'active' : ''}`}
              onClick={() => setV2v((x) => !x)}
            >
              V2V negotiation
            </button>
            <button
              className={`dlw-sim-toggle ${ramp ? 'active' : ''}`}
              onClick={() => setRamp((x) => !x)}
            >
              On-ramp merge
            </button>
            <button
              className={`dlw-sim-toggle ${heatmap ? 'danger' : ''}`}
              onClick={() => setHeatmap((x) => !x)}
            >
              Conflict heatmap
            </button>
          </div>
        </div>

        <div className="dlw-sim-ctl">
          <label className="lbl" htmlFor="sim-lanes">
            Lanes <b>{lanes}</b>
          </label>
          <input
            id="sim-lanes"
            type="range"
            min={2}
            max={4}
            step={1}
            value={lanes}
            onChange={(e) => setLanes(+e.target.value)}
          />
        </div>

        <div className="dlw-sim-ctl">
          <label className="lbl" htmlFor="sim-density">
            Density <b>{density}/lane</b>
          </label>
          <input
            id="sim-density"
            type="range"
            min={1}
            max={6}
            step={1}
            value={density}
            onChange={(e) => setDensity(+e.target.value)}
          />
        </div>

        <div className="dlw-sim-ctl">
          <label className="lbl" htmlFor="sim-speed">
            Speed <b>{speed.toFixed(1)}×</b>
          </label>
          <input
            id="sim-speed"
            type="range"
            min={0.4}
            max={2}
            step={0.1}
            value={speed}
            onChange={(e) => setSpeed(+e.target.value)}
          />
        </div>

        <button className="dlw-sim-reseed" onClick={reseed}>
          ↻ Reseed traffic
        </button>
      </div>
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
