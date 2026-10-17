'use client';
import Link from 'next/link';
import { LogoMark } from '../ui/Logo';
import { useSiteBase } from '../../lib/nav';
import { MapPin, Mail, ArrowUpRight, Award } from 'lucide-react';

export function Footer() {
  const siteBase = useSiteBase();

  return (
    <footer className="dlw-footer">
      <div className="dlw-container">
        <div className="dlw-footer-modular">
          {/* Card 1: Brand & Contact */}
          <div className="dlw-footer-card dlw-footer-brand-card">
            <div className="dlw-footer-brand-head">
              <LogoMark size={32} style={{ borderRadius: 9 }} />
              <span className="dlw-footer-brand-name">DriveLink</span>
            </div>
            <p className="dlw-footer-desc">
              The decentralized communication backbone for automotive AI. Intent-first, low-latency, cross-OEM.
            </p>

            <address className="dlw-footer-contact-box">
              <div className="dlw-footer-contact-item">
                <span className="dlw-footer-org-name">DriveLink Technologies</span>
              </div>
              <div className="dlw-footer-contact-item">
                <MapPin size={13} className="dlw-footer-contact-icon" aria-hidden="true" />
                <span>Bengaluru, Karnataka, India</span>
              </div>
              <a
                href="mailto:tech.drivelink@gmail.com?subject=DriveLink%20enquiry"
                className="dlw-footer-mail-btn"
              >
                <Mail size={13} aria-hidden="true" />
                <span>tech.drivelink@gmail.com</span>
                <ArrowUpRight size={13} className="dlw-footer-arrow" aria-hidden="true" />
              </a>
            </address>
          </div>

          {/* Card 2: Categorized Navigation */}
          <div className="dlw-footer-card dlw-footer-nav-card">
            <div className="dlw-footer-nav-col">
              <h2>Product</h2>
              <div className="dlw-footer-links">
                <Link href={siteBase + '/product'}>Overview</Link>
                <Link href={siteBase + '/#how-it-works'}>How it works</Link>
                <Link href={siteBase + '/v2v-communication'}>What is V2V?</Link>
                <Link href={siteBase + '/#roadmap'}>Roadmap</Link>
              </div>
            </div>

            <div className="dlw-footer-nav-col">
              <h2>Company</h2>
              <div className="dlw-footer-links">
                <Link href={siteBase + '/team'}>Team</Link>
                <Link href={siteBase + '/#story'}>Origin story</Link>
                <Link href={siteBase + '/investors'}>Investors</Link>
                <Link href={siteBase + '/hiring'}>Join us</Link>
                <a href="mailto:tech.drivelink@gmail.com?subject=DriveLink%20enquiry">Contact</a>
              </div>
            </div>
          </div>

          {/* Card 3: Live Status & Protocol Telemetry */}
          <div className="dlw-footer-card dlw-footer-status-card">
            <h2>Status</h2>
            <div className="dlw-footer-status-box">
              <div className="dlw-footer-status-header">
                <div className="dlw-footer-status-beacon" aria-hidden="true">
                  <span className="dlw-footer-beacon-dot" />
                  <span className="dlw-footer-beacon-ring" />
                </div>
                <span className="dlw-footer-status-label">Simulation stack live</span>
              </div>

              <div className="dlw-footer-status-divider" />

              <div className="dlw-footer-status-row">
                <span className="dlw-footer-metric-lbl">Protocol</span>
                <span className="dlw-footer-metric-val dlw-mono">v0.1</span>
              </div>

              <div className="dlw-footer-patent-badge">
                <Award size={14} className="dlw-footer-patent-icon" aria-hidden="true" />
                <span className="dlw-mono">Patent grant option · award, not a granted patent</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="dlw-footer-bottom">
          <div className="dlw-footer-copy">
            © {new Date().getFullYear()} DriveLink Technologies. All rights reserved.
          </div>
          <div className="dlw-footer-legal">
            <Link href={siteBase + '/privacy'}>Privacy</Link>
            <span className="dlw-footer-sep" aria-hidden="true">·</span>
            <Link href={siteBase + '/terms'}>Terms</Link>
          </div>
          <div className="dlw-footer-domain dlw-mono">
            <span className="dlw-footer-domain-pulse" aria-hidden="true" />
            drivelink.tech
          </div>
        </div>
      </div>
    </footer>
  );
}
