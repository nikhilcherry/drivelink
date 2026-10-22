'use client';
import Link from 'next/link';
import { LogoMark } from '../ui/Logo';
import { useSiteBase } from '../../lib/nav';

function LinkedInIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.81a1.45 1.45 0 0 0-1.46 1.45 1.46 1.46 0 0 0 1.46 1.46 1.46 1.46 0 0 0 1.46-1.46 1.45 1.45 0 0 0-1.46-1.45Z" fillRule="evenodd" />
    </svg>
  );
}

function InstagramIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

export function Footer() {
  const siteBase = useSiteBase();
  return (
    <footer className="dlw-footer">
      <div className="dlw-container">
        <div className="dlw-footer-grid">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <LogoMark size={28} style={{ borderRadius: 8 }} />
              <span style={{ fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>DriveLink</span>
            </div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.62)', lineHeight: 1.6, margin: 0, maxWidth: 280 }}>
              The decentralized communication backbone for automotive AI. Intent-first, low-latency, cross-OEM.
            </p>

            <address className="dlw-footer-address">
              <span className="dlw-footer-addr-label">DriveLink V2V Intelligence LLP</span>
              <span>Bengaluru, Karnataka, India</span>
              <a href="mailto:tech.drivelink@gmail.com?subject=DriveLink%20enquiry">tech.drivelink@gmail.com</a>
            </address>
          </div>

          <div>
            <h2>Product</h2>
            <div className="dlw-footer-links">
              <Link href={siteBase + '/product'}>Overview</Link>
              <Link href={siteBase + '/#how-it-works'}>How it works</Link>
              <Link href={siteBase + '/v2v-communication'}>What is V2V?</Link>
              <Link href={siteBase + '/#roadmap'}>Roadmap</Link>
            </div>
          </div>

          <div>
            <h2>Company</h2>
            <div className="dlw-footer-links">
              <Link href={siteBase + '/team'}>Team</Link>
              <Link href={siteBase + '/#story'}>Origin story</Link>
              <Link href={siteBase + '/investors'}>Investors</Link>
              <Link href={siteBase + '/hiring'}>Join us</Link>
              <a href="mailto:tech.drivelink@gmail.com?subject=DriveLink%20enquiry">Contact</a>
            </div>
          </div>

          <div>
            <h2>Status</h2>
            <div className="dlw-footer-links">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>
                <span style={{ width: 8, height: 8, borderRadius: 999, background: '#22c55e', boxShadow: '0 0 8px #22c55e', flexShrink: 0 }} />
                Simulation stack live
              </span>
              <span className="dlw-mono" style={{ color: 'rgba(255,255,255,0.68)', fontSize: 12 }}>Protocol v0.1</span>
              <span className="dlw-mono" style={{ color: 'rgba(255,255,255,0.68)', fontSize: 12 }}>Patent grant option · award, not a granted patent</span>
            </div>
          </div>
        </div>

        <div className="dlw-footer-bottom">
          <span>© {new Date().getFullYear()} DriveLink V2V Intelligence LLP. All rights reserved.</span>
          <span className="dlw-footer-legal">
            <Link href={siteBase + '/privacy'}>Privacy</Link>
            <Link href={siteBase + '/terms'}>Terms</Link>
          </span>
          <div className="dlw-footer-socials" aria-label="Social links">
            <a
              href="https://www.linkedin.com/company/drivelink-tech/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="DriveLink on LinkedIn"
            >
              <LinkedInIcon size={18} />
            </a>
            <a
              href="https://www.instagram.com/drivelink.tech/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="DriveLink on Instagram"
            >
              <InstagramIcon size={18} />
            </a>
          </div>
          <span className="dlw-mono">drivelink.tech</span>
        </div>
      </div>

      {/* Oversized bottom cut-off brand watermark */}
      <div className="dlw-footer-cut-wrap" aria-hidden="true">
        <div className="dlw-footer-cut-text">
          DriveLink
        </div>
      </div>
    </footer>
  );
}
