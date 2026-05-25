import { Zap } from 'lucide-react';

type Page = 'home' | 'product' | 'team' | 'investors';

interface FooterProps {
  setPage: (page: Page) => void;
}

export function Footer({ setPage }: FooterProps) {
  return (
    <footer className="dlw-footer">
      <div className="dlw-container">
        <div className="dlw-footer-grid">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <span style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, #0F4C81, #1E60A3)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={14} color="#fff" />
              </span>
              <span style={{ fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>DriveLink</span>
            </div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, margin: 0, maxWidth: 280 }}>
              The decentralized communication backbone for automotive AI. Intent-first, low-latency, cross-OEM.
            </p>
          </div>

          <div>
            <h4>Product</h4>
            <div className="dlw-footer-links">
              <button onClick={() => setPage('product')}>Overview</button>
              <a href="#how-it-works">How it works</a>
              <button onClick={() => setPage('product')}>Protocol spec</button>
              <a href="#roadmap">Roadmap</a>
            </div>
          </div>

          <div>
            <h4>Company</h4>
            <div className="dlw-footer-links">
              <button onClick={() => setPage('team')}>Team</button>
              <a href="#story">Origin story</a>
              <button onClick={() => setPage('investors')}>Investors</button>
              <a href="mailto:hello@drivelink.tech">Contact</a>
            </div>
          </div>

          <div>
            <h4>Status</h4>
            <div className="dlw-footer-links">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>
                <span style={{ width: 8, height: 8, borderRadius: 999, background: '#22c55e', boxShadow: '0 0 8px #22c55e', flexShrink: 0 }} />
                Mesh node live
              </span>
              <span className="dlw-mono" style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>Protocol v0.1</span>
              <span className="dlw-mono" style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>Patent · pending</span>
            </div>
          </div>
        </div>

        <div className="dlw-footer-bottom">
          <span>© {new Date().getFullYear()} DriveLink. All rights reserved.</span>
          <span className="dlw-mono">drivelink.tech</span>
        </div>
      </div>
    </footer>
  );
}
