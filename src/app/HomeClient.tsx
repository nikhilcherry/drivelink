'use client';
import { useRouter } from 'next/navigation';
import { HeroConnect } from '../sections/HeroConnect';
import { HowConnectWorks } from '../sections/HowConnectWorks';
import { ConnectStats } from '../sections/ConnectStats';
import { StorySection } from '../sections/StorySection';
import { InvestorCTA } from '../sections/InvestorCTA';
import { hrefFor, type Page } from '../lib/nav';

export function HomeClient() {
  const router = useRouter();
  const go = (p: Page) => router.push(hrefFor(p));

  return (
    <main>
      {/* ── 01 Hero — DriveLink Connect product landing ── */}
      <HeroConnect onCTA={go} />

      {/* ── 02 Value manifesto — Connect positioning ── */}
      <ConnectManifesto />

      {/* ── 03 How it works — 3-step Connect flow ── */}
      <HowConnectWorks />

      {/* ── 04 Product stats — DriveLink Connect metrics ── */}
      <ConnectStats />

      {/* ── 05 Company origin story & credentials ── */}
      <StorySection />

      {/* ── 06 Investor / partner CTA ── */}
      <InvestorCTA onPartner={() => go('investors')} />
    </main>
  );
}

/**
 * Inline manifesto-style value statement for DriveLink Connect.
 * Replaces the V2V-specific <Manifesto /> which is retained in
 * src/sections/Manifesto.tsx for potential reuse on the product page.
 */
function ConnectManifesto() {
  return (
    <section className="dlw-manifesto" aria-label="Why DriveLink Connect exists">
      <div className="dlw-manifesto-inner">
        <div className="dlw-eyebrow dlw-manifesto-eyebrow">
          <span className="num">01</span> Why DriveLink Connect exists
        </div>
        <p className="dlw-manifesto-text">
          <span className="quiet">Every parked car is a problem waiting to happen.</span>{' '}
          Strangers need to reach owners{' '}
          <span className="highlight">without a phone number</span>.{' '}
          <span className="quiet">
            DriveLink Connect is a private windshield QR tag — scan, chat, resolve. No numbers shared. Ever.
          </span>
        </p>
      </div>
    </section>
  );
}
