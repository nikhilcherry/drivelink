'use client';
import { useRef, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { createSim, stepSim, renderSim, resizeSim, laneY, type SimState } from '../lib/v2vSim';

type Page = 'home' | 'product' | 'team' | 'investors' | 'docs';

interface HeroProps {
  onCTA: (target: Page) => void;
}

export function HeroV2V({ onCTA }: HeroProps) {

  return (
    <section className="dlw-hero">
      <div className="dlw-hero-bg-grid" />
      <div className="dlw-container dlw-hero-wrap">
        <div className="dlw-hero-top">
          <h1 className="dlw-hero-title">
            <span className="dlw-hero-brand">DriveLink</span>
            <span className="dlw-sr-only"> — V2V Communication Backbone for Automotive AI</span>
          </h1>

          <p className="dlw-hero-headline">
            The <span className="dlw-text-gradient">Decentralized Backbone</span> for Automotive&nbsp;AI
          </p>

          {/* TODO(founder): confirm hero one-liner */}
          <p className="dlw-hero-sub">
            &ldquo;Connecting OEMs, Data, and Intelligence via a low-latency, intent-first protocol.&rdquo;
          </p>

          <div className="dlw-hero-ctas">
            <button className="dlw-btn dlw-btn-primary" onClick={() => onCTA('product')}>
              Explore 3D Walkthrough
              <ArrowRight size={16} />
            </button>
            <button className="dlw-btn dlw-btn-ghost" onClick={() => onCTA('investors')}>
              View Roadmap
            </button>
          </div>
        </div>

        <V2VSimulation />
        <p className="dlw-hero-caption">
          Interactive concept simulation. Every figure above is modelled in your browser from the planned
          Bangalore mesh corridor — a design target, not measured field telemetry.
        </p>

        <HeroMarquee />
      </div>
    </section>
  );
}

const MARQUEE_PHRASES = [
  'Sub-50ms latency',
  'Cross-OEM',
  'Intent-first',
  'drv-mesh',
  'AIR 5 · IIT Delhi',
  'Patent grant option · hackathon award',
];

function HeroMarquee() {
  return (
    <div className="dlw-hero-marquee">
      <div className="dlw-hero-marquee-track">
        {MARQUEE_PHRASES.map((phrase, i) => (
          <span className="dlw-hero-marquee-item" key={`a-${i}`}>
            <span className="dot" />
            {phrase}
          </span>
        ))}
        {MARQUEE_PHRASES.map((phrase, i) => (
          <span className="dlw-hero-marquee-item" key={`b-${i}`} aria-hidden="true">
            <span className="dot" />
            {phrase}
          </span>
        ))}
      </div>
    </div>
  );
}

const LOGICAL_W = 1000;
const LOGICAL_H = 437.5;
// Reduced speed for ambient hero feel (0.6 = slower, more relaxed motion)
const AMBIENT_SPEED = 0.6;
const FIXED_DT = 1 / 60; // 60Hz fixed simulation step for silky, deterministic physics

export function V2VSimulation() {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Direct element references to eliminate querySelector calls in rAF loop
  const hud0Ref = useRef<HTMLDivElement>(null);
  const hud1Ref = useRef<HTMLDivElement>(null);
  const hud0IdRef = useRef<HTMLDivElement>(null);
  const hud0SpdRef = useRef<HTMLSpanElement>(null);
  const hud0IntRef = useRef<HTMLSpanElement>(null);
  const hud1IdRef = useRef<HTMLDivElement>(null);
  const hud1SpdRef = useRef<HTMLSpanElement>(null);
  const hud1IntRef = useRef<HTMLSpanElement>(null);

  const latRef = useRef<HTMLSpanElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);

  const rafRef = useRef<number>(0);
  const simRef = useRef<SimState | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const isVisibleRef = useRef(true);
  const isTabVisibleRef = useRef(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    if (!canvas || !stage) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctxRef.current = ctx;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const sim = createSim(LOGICAL_W, LOGICAL_H, {
      lanes: 3,
      density: 3,
      v2v: true,
      ramp: false,
      heatmap: false,
      speed: AMBIENT_SPEED,
    });
    simRef.current = sim;

    let cssW = 0;
    let cssH = 0;
    let dpr = 1;

    const resize = () => {
      const r = stage.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return;
      cssW = r.width;
      cssH = r.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      resizeSim(sim, LOGICAL_W, LOGICAL_H);
      if (reduce) {
        renderSim(ctx, sim, cssW, cssH, dpr);
      }
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(stage);

    // Track cached text values to avoid redundant DOM mutations
    let h0LastId = '';
    let h0LastKmh = -1;
    let h0LastInt = '';
    let h1LastId = '';
    let h1LastKmh = -1;
    let h1LastInt = '';
    let lastLatency = -1;
    let lastLinks = -1;
    let lastCarCount = -1;

    const updateHud0 = (c: SimState['cars'][number]) => {
      const el = hud0Ref.current;
      if (!el) return;
      const x = Math.round((c.x / LOGICAL_W) * cssW);
      const y = Math.round((laneY(sim, c.lf) / LOGICAL_H) * cssH - 20);
      el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -100%)`;

      const kmh = Math.round(c.v * 0.7);
      const intent = kmh === 0 ? 'Idle' : c.intent;

      if (h0LastId !== c.id) {
        h0LastId = c.id;
        if (hud0IdRef.current) hud0IdRef.current.textContent = c.id;
      }
      if (h0LastKmh !== kmh) {
        h0LastKmh = kmh;
        if (hud0SpdRef.current) hud0SpdRef.current.textContent = `${kmh} km/h`;
      }
      if (h0LastInt !== intent) {
        h0LastInt = intent;
        if (hud0IntRef.current) hud0IntRef.current.textContent = intent;
      }
    };

    const updateHud1 = (c: SimState['cars'][number]) => {
      const el = hud1Ref.current;
      if (!el) return;
      const x = Math.round((c.x / LOGICAL_W) * cssW);
      const y = Math.round((laneY(sim, c.lf) / LOGICAL_H) * cssH - 20);
      el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -100%)`;

      const kmh = Math.round(c.v * 0.7);
      const intent = kmh === 0 ? 'Idle' : c.intent;

      if (h1LastId !== c.id) {
        h1LastId = c.id;
        if (hud1IdRef.current) hud1IdRef.current.textContent = c.id;
      }
      if (h1LastKmh !== kmh) {
        h1LastKmh = kmh;
        if (hud1SpdRef.current) hud1SpdRef.current.textContent = `${kmh} km/h`;
      }
      if (h1LastInt !== intent) {
        h1LastInt = intent;
        if (hud1IntRef.current) hud1IntRef.current.textContent = intent;
      }
    };

    let last = performance.now();
    let accumulator = 0;

    const renderFrame = (now: number) => {
      // If hero is off-screen or tab is hidden, stop the loop completely
      if (!isVisibleRef.current || !isTabVisibleRef.current) {
        rafRef.current = 0;
        return;
      }

      const elapsed = Math.min((now - last) / 1000, 0.1);
      last = now;

      const sim = simRef.current;
      if (!sim) {
        rafRef.current = 0;
        return;
      }

      // Fixed timestep accumulator for butter-smooth, frame-rate independent physics
      accumulator += elapsed;
      let steps = 0;
      while (accumulator >= FIXED_DT && steps < 3) {
        stepSim(sim, FIXED_DT);
        accumulator -= FIXED_DT;
        steps++;
      }
      if (steps >= 3) accumulator = 0; // Prevent spiral of death on long pause

      const { latency, links } = renderSim(ctx, sim, cssW, cssH, dpr);

      if (sim.cars.length > 0) {
        updateHud0(sim.cars[0]);
        updateHud1(sim.cars[Math.min(4, sim.cars.length - 1)]);
      }

      if (lastLatency !== latency) {
        lastLatency = latency;
        if (latRef.current) latRef.current.textContent = `${latency}ms`;
      }
      if (lastCarCount !== sim.cars.length || lastLinks !== links) {
        lastCarCount = sim.cars.length;
        lastLinks = links;
        if (countRef.current) {
          countRef.current.textContent = `${sim.cars.length} vehicles · ${links} V2V links`;
        }
      }

      rafRef.current = requestAnimationFrame(renderFrame);
    };

    const pauseSimulation = () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
    };

    const resumeSimulation = () => {
      if (rafRef.current) return;
      if (!isVisibleRef.current || !isTabVisibleRef.current) return;
      last = performance.now();
      accumulator = 0;
      rafRef.current = requestAnimationFrame(renderFrame);
    };

    // IntersectionObserver to cleanly pause when hero is off-screen
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const visible = entry.isIntersecting && entry.intersectionRatio > 0.05;
          if (visible !== isVisibleRef.current) {
            isVisibleRef.current = visible;
            if (visible && isTabVisibleRef.current) {
              resumeSimulation();
            } else {
              pauseSimulation();
            }
          }
        }
      },
      { threshold: [0, 0.05, 0.2] }
    );
    io.observe(stage);

    // Pause when tab is hidden, resume when active
    const handleVisibilityChange = () => {
      const tabVisible = !document.hidden;
      isTabVisibleRef.current = tabVisible;
      if (tabVisible && isVisibleRef.current) {
        resumeSimulation();
      } else {
        pauseSimulation();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    if (reduce) {
      stepSim(sim, 0);
      const { latency, links } = renderSim(ctx, sim, cssW, cssH, dpr);
      if (sim.cars.length > 0) {
        updateHud0(sim.cars[0]);
        updateHud1(sim.cars[Math.min(4, sim.cars.length - 1)]);
      }
      if (latRef.current) latRef.current.textContent = `${latency}ms`;
      if (countRef.current) {
        countRef.current.textContent = `${sim.cars.length} vehicles · ${links} V2V links`;
      }
    } else {
      last = performance.now();
      accumulator = 0;
      rafRef.current = requestAnimationFrame(renderFrame);
    }

    return () => {
      pauseSimulation();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <div className="dlw-hero-stage" ref={stageRef} aria-hidden="true">
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
      <div className="corner-label tl">
        <span className="dot" /> <span className="num">CONCEPT SIMULATION</span><span className="full-text"> · planned Bangalore corridor</span>
      </div>
      <div className="corner-label tr">
        <span className="num" ref={latRef}>34ms</span><span className="full-text"> · simulated latency</span> · &lt;50ms target
      </div>
      <div className="corner-label bl"><span ref={countRef}>9 vehicles</span></div>
      <div className="corner-label br"><span className="full-text">Protocol v0.1 · </span>drv-mesh</div>

      <div className="dlw-car-hud" ref={hud0Ref}>
        <div className="id" ref={hud0IdRef}>DRV-A1</div>
        <div className="row">
          <span className="spd" ref={hud0SpdRef}>46 km/h</span> · <span className="int" ref={hud0IntRef}>Cruising</span>
        </div>
      </div>
      <div className="dlw-car-hud" ref={hud1Ref}>
        <div className="id" ref={hud1IdRef}>DRV-D4</div>
        <div className="row">
          <span className="spd" ref={hud1SpdRef}>58 km/h</span> · <span className="int" ref={hud1IntRef}>Cruising</span>
        </div>
      </div>
    </div>
  );
}

export const CarSimulation = V2VSimulation;
export const TrafficSimulator = V2VSimulation;