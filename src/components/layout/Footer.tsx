'use client';
import Link from 'next/link';
import { LogoMark } from '../ui/Logo';
import { useSiteBase } from '../../lib/nav';
import { Instagram, Linkedin } from 'lucide-react';

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
              <span className="dlw-footer-addr-label">DriveLink Technologies</span>
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
          <span>© {new Date().getFullYear()} DriveLink Technologies. All rights reserved.</span>
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
              <Linkedin size={16} />
            </a>
            <a
              href="https://www.instagram.com/drivelink.tech/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="DriveLink on Instagram"
            >
              <Instagram size={16} />
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
