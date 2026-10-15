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
              Explore Technology
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
  // Render the phrase list twice so the loop is seamless; the second copy is
  // decorative-only so screen readers get the content exactly once.
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

export function V2VSimulation() {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hud0 = useRef<HTMLDivElement>(null);
  const hud1 = useRef<HTMLDivElement>(null);
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
    const sim = createSim(LOGICAL_W, LOGICAL_H, { lanes: 3, density: 3, v2v: true, ramp: false, heatmap: false, speed: AMBIENT_SPEED });
    simRef.current = sim;

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
      resizeSim(sim, LOGICAL_W, LOGICAL_H);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(stage);

    const placeHud = (el: HTMLDivElement | null, c: SimState['cars'][number]) => {
      if (!el) return;
      el.style.left = `${(c.x / LOGICAL_W) * cssW}px`;
      el.style.top = `${(laneY(sim, c.lf) / LOGICAL_H) * cssH - 20}px`;
      const id = el.querySelector('.id');
      const spd = el.querySelector('.spd');
      const int = el.querySelector('.int');
      const kmh = Math.round(c.v * 0.7);
      if (id) id.textContent = c.id;
      if (spd) spd.textContent = `${kmh} km/h`;
      if (int) int.textContent = kmh === 0 ? 'Idle' : c.intent;
    };

    let last = performance.now();

    const renderFrame = (now: number) => {
      if (!isVisibleRef.current || !isTabVisibleRef.current) {
        rafRef.current = requestAnimationFrame(renderFrame);
        return;
      }
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const sim = simRef.current;
      if (!sim) return;
      stepSim(sim, dt);
      const { latency, links } = renderSim(ctx, sim, cssW, cssH, dpr);
      placeHud(hud0.current, sim.cars[0]);
      placeHud(hud1.current, sim.cars[Math.min(4, sim.cars.length - 1)]);
      if (latRef.current) latRef.current.textContent = `${latency}ms`;
      if (countRef.current) countRef.current.textContent = `${sim.cars.length} vehicles · ${links} V2V links`;
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
      last = performance.now();
      rafRef.current = requestAnimationFrame(renderFrame);
    };

    // IntersectionObserver to pause when hero is off-screen
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          // Pause when less than 50% visible
          isVisibleRef.current = entry.intersectionRatio >= 0.5;
          if (isVisibleRef.current && isTabVisibleRef.current) {
            resumeSimulation();
          } else {
            pauseSimulation();
          }
        }
      },
      { threshold: [0, 0.5, 1] }
    );
    io.observe(stage);

    // Pause when tab is hidden
    const handleVisibilityChange = () => {
      isTabVisibleRef.current = !document.hidden;
      if (isTabVisibleRef.current && isVisibleRef.current) {
        resumeSimulation();
      } else {
        pauseSimulation();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    if (reduce) {
      stepSim(sim, 0);
      const { latency, links } = renderSim(ctx, sim, cssW, cssH, dpr);
      placeHud(hud0.current, sim.cars[0]);
      placeHud(hud1.current, sim.cars[Math.min(4, sim.cars.length - 1)]);
      if (latRef.current) latRef.current.textContent = `${latency}ms`;
      if (countRef.current) countRef.current.textContent = `${sim.cars.length} vehicles · ${links} V2V links`;
    } else {
      rafRef.current = requestAnimationFrame(renderFrame);
    }

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <div className="dlw-hero-stage" ref={stageRef} aria-hidden="true">
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
      <div className="corner-label tl">
        <span className="dot" /> <span className="num">CONCEPT SIMULATION</span> · planned Bangalore corridor
      </div>
      <div className="corner-label tr">
        <span className="num" ref={latRef}>34ms</span> · simulated latency · target &lt;50ms
      </div>
      <div className="corner-label bl"><span ref={countRef}>9 vehicles</span></div>
      <div className="corner-label br">Protocol v0.1 · drv-mesh</div>

      <div className="dlw-car-hud" ref={hud0} style={{ left: 0, top: 0 }}>
        <div className="id">DRV-A1</div>
        <div className="row"><span className="spd">46 km/h</span> · <span className="int">Cruising</span></div>
      </div>
      <div className="dlw-car-hud" ref={hud1} style={{ left: 0, top: 0 }}>
        <div className="id">DRV-D4</div>
        <div className="row"><span className="spd">58 km/h</span> · <span className="int">Cruising</span></div>
      </div>
    </div>
  );
}

export const CarSimulation = V2VSimulation;
export const TrafficSimulator = V2VSimulation;