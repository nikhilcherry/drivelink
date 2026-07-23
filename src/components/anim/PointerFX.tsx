'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Pointer-reactive effects, applied site-wide without per-component wiring:
 *  - a soft cursor-following glow,
 *  - a mouse-tracked radial gradient "spotlight" inside feature cards,
 *  - a subtle 3D tilt on those cards,
 *  - magnetic primary buttons that drift toward the cursor.
 * Desktop / fine-pointer only, and fully disabled for prefers-reduced-motion.
 */
const SPOT_SELECTOR = [
  '.dlw-rost-card', '.dlw-roadmap-card', '.dlw-market-card', '.dlw-doc-card',
  '.dlw-repo-card', '.dlw-traction-card', '.dlw-advisor', '.dlw-team-detail',
  '.dlw-doc-kpi', '.dlw-arch-row',
].join(',');

const TILT_SELECTOR = [
  '.dlw-rost-card', '.dlw-roadmap-card', '.dlw-market-card', '.dlw-repo-card', '.dlw-doc-card',
].join(',');

const MAGNETIC_SELECTOR = ['.dlw-btn-primary', '.dlw-btn-dark', '.dlw-nav-pill'].join(',');

export function PointerFX() {
  const pathname = usePathname();

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fine = window.matchMedia('(pointer: fine)').matches;
    if (reduce || !fine) return;

    const cleanups: (() => void)[] = [];

    // --- cursor-following glow ---
    const glow = document.createElement('div');
    glow.className = 'dlw-cursor-glow';
    document.body.appendChild(glow);
    let tx = window.innerWidth / 2, ty = window.innerHeight / 2, gx = tx, gy = ty;
    const onMove = (e: MouseEvent) => { tx = e.clientX; ty = e.clientY; };
    let raf = requestAnimationFrame(function tick() {
      gx += (tx - gx) * 0.16; gy += (ty - gy) * 0.16;
      glow.style.transform = `translate(${gx}px, ${gy}px)`;
      raf = requestAnimationFrame(tick);
    });
    window.addEventListener('mousemove', onMove);
    cleanups.push(() => { window.removeEventListener('mousemove', onMove); cancelAnimationFrame(raf); glow.remove(); });

    const setup = requestAnimationFrame(() => {
      // --- spotlight + tilt on feature cards ---
      document.querySelectorAll<HTMLElement>(SPOT_SELECTOR).forEach((card) => {
        if (card.dataset.fx) return;
        card.dataset.fx = '1';
        card.classList.add('dlw-fx-host');
        const layer = document.createElement('span');
        layer.className = 'dlw-spot-layer';
        card.appendChild(layer);
        const canTilt = card.matches(TILT_SELECTOR);

        const onEnter = () => card.classList.add('dlw-fx-on');
        const onCardMove = (e: MouseEvent) => {
          const r = card.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width;
          const py = (e.clientY - r.top) / r.height;
          layer.style.setProperty('--mx', `${px * 100}%`);
          layer.style.setProperty('--my', `${py * 100}%`);
          if (canTilt) {
            const rx = (py - 0.5) * -5;
            const ry = (px - 0.5) * 5;
            card.style.transform = `perspective(820px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
          }
        };
        const onLeave = () => { card.classList.remove('dlw-fx-on'); if (canTilt) card.style.transform = ''; };

        card.addEventListener('mouseenter', onEnter);
        card.addEventListener('mousemove', onCardMove);
        card.addEventListener('mouseleave', onLeave);
        cleanups.push(() => {
          card.removeEventListener('mouseenter', onEnter);
          card.removeEventListener('mousemove', onCardMove);
          card.removeEventListener('mouseleave', onLeave);
          layer.remove();
          card.classList.remove('dlw-fx-host', 'dlw-fx-on');
          card.style.transform = '';
          delete card.dataset.fx;
        });
      });

      // --- magnetic buttons ---
      document.querySelectorAll<HTMLElement>(MAGNETIC_SELECTOR).forEach((btn) => {
        if (btn.dataset.mag) return;
        btn.dataset.mag = '1';
        const onMag = (e: MouseEvent) => {
          const r = btn.getBoundingClientRect();
          const mx = e.clientX - (r.left + r.width / 2);
          const my = e.clientY - (r.top + r.height / 2);
          btn.style.transform = `translate(${mx * 0.22}px, ${my * 0.34}px)`;
        };
        const onMagLeave = () => { btn.style.transform = ''; };
        btn.addEventListener('mousemove', onMag);
        btn.addEventListener('mouseleave', onMagLeave);
        cleanups.push(() => {
          btn.removeEventListener('mousemove', onMag);
          btn.removeEventListener('mouseleave', onMagLeave);
          btn.style.transform = '';
          delete btn.dataset.mag;
        });
      });
    });

    return () => { cancelAnimationFrame(setup); cleanups.forEach((fn) => fn()); };
  }, [pathname]);

  return null;
}
