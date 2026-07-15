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
        <p className="dlw-hero-caption">Browser simulation of the planned Bangalore mesh deployment.</p>

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
  'Patent grant option · awarded',
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

function V2VSimulation() {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hud0 = useRef<HTMLDivElement>(null);
  const hud1 = useRef<HTMLDivElement>(null);
  const latRef = useRef<HTMLSpanElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    if (!canvas || !stage) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const sim = createSim(LOGICAL_W, LOGICAL_H, { lanes: 3, density: 3, v2v: true, ramp: false, heatmap: false, speed: 1 });

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

    let raf = 0;
    let last = performance.now();

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      stepSim(sim, dt);
      const { latency, links } = renderSim(ctx, sim, cssW, cssH, dpr);
      placeHud(hud0.current, sim.cars[0]);
      placeHud(hud1.current, sim.cars[Math.min(4, sim.cars.length - 1)]);
      if (latRef.current) latRef.current.textContent = `${latency}ms`;
      if (countRef.current) countRef.current.textContent = `${sim.cars.length} vehicles · ${links} V2V links`;
      raf = requestAnimationFrame(frame);
    };

    if (reduce) {
      stepSim(sim, 0);
      const { latency, links } = renderSim(ctx, sim, cssW, cssH, dpr);
      placeHud(hud0.current, sim.cars[0]);
      placeHud(hud1.current, sim.cars[Math.min(4, sim.cars.length - 1)]);
      if (latRef.current) latRef.current.textContent = `${latency}ms`;
      if (countRef.current) countRef.current.textContent = `${sim.cars.length} vehicles · ${links} V2V links`;
    } else {
      raf = requestAnimationFrame(frame);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <div className="dlw-hero-stage" ref={stageRef} aria-hidden="true">
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
      <div className="corner-label tl">
        <span className="dot" /> <span className="num">LIVE SIMULATION</span> · Bangalore pilot corridor
      </div>
      <div className="corner-label tr">
        <span className="num" ref={latRef}>34ms</span> · avg V2V latency
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
