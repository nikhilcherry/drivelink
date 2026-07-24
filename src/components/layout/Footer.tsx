'use client';
import Link from 'next/link';
import { LogoMark } from '../ui/Logo';
import { useSiteBase } from '../../lib/nav';

export function Footer() {
  const siteBase = useSiteBase();
  return (
    <footer className="dlw-footer">
      <div className="dlw-container">
        <div className="dlw-footer-grid">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <span style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, #0F4C81, #2563EB 55%, #06B6D4)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <LogoMark size={16} />
              </span>
              <span style={{ fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>DriveLink</span>
            </div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, margin: 0, maxWidth: 280 }}>
              The decentralized communication backbone for automotive AI. Intent-first, low-latency, cross-OEM.
            </p>

            <address className="dlw-footer-address">
              <span className="dlw-footer-addr-label">DriveLink Technologies</span>
              <span>Bengaluru, Karnataka, India</span>
              <a href="mailto:tech.drivelink@gmail.com?subject=DriveLink%20enquiry">tech.drivelink@gmail.com</a>
            </address>
          </div>

          <div>
            <h4>Product</h4>
            <div className="dlw-footer-links">
              <Link href={siteBase + '/product'}>Overview</Link>
              <Link href={siteBase + '/#how-it-works'}>How it works</Link>
              <Link href="https://core.drivelink.tech/docs">Documentation</Link>
              <Link href={siteBase + '/v2v-communication'}>What is V2V?</Link>
              <Link href={siteBase + '/#roadmap'}>Roadmap</Link>
            </div>
          </div>

          <div>
            <h4>Company</h4>
            <div className="dlw-footer-links">
              <Link href={siteBase + '/team'}>Team</Link>
              <Link href={siteBase + '/#story'}>Origin story</Link>
              <Link href={siteBase + '/investors'}>Investors</Link>
              <a href="mailto:tech.drivelink@gmail.com?subject=DriveLink%20enquiry">Contact</a>
            </div>
          </div>

          <div>
            <h4>Status</h4>
            <div className="dlw-footer-links">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>
                <span style={{ width: 8, height: 8, borderRadius: 999, background: '#22c55e', boxShadow: '0 0 8px #22c55e', flexShrink: 0 }} />
                Mesh node live
              </span>
              <span className="dlw-mono" style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>Protocol v0.1</span>
              <span className="dlw-mono" style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>Patent grant option · awarded</span>
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
