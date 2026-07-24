'use client';
import type { CSSProperties } from 'react';
import Link from 'next/link';
import { Reveal } from '../../components/anim/Reveal';
import { InvestorCTA } from '../../sections/InvestorCTA';
import { useSiteBase } from '../../lib/nav';
import { useRouter } from 'next/navigation';
import { hrefFor, type Page } from '../../lib/nav';

const proseP: CSSProperties = { color: 'var(--fg2)', fontSize: '1.05rem', lineHeight: 1.75, margin: '0 0 22px' };
const h2Style: CSSProperties = { fontSize: 'clamp(1.5rem, 2.6vw, 2.1rem)', fontWeight: 700, letterSpacing: '-0.02em', margin: '56px 0 18px' };
const h3Style: CSSProperties = { fontSize: '1.2rem', fontWeight: 600, margin: '28px 0 10px' };
const li: CSSProperties = { color: 'var(--fg2)', fontSize: '1.05rem', lineHeight: 1.75, margin: '0 0 10px' };

export function V2VClient() {
  const siteBase = useSiteBase();
  const router = useRouter();
  const goTo = (p: Page) => router.push(hrefFor(p));

  return (
    <main>
      <section className="dlw-section" style={{ paddingTop: 160, paddingBottom: 40 }}>
        <div className="dlw-container" style={{ maxWidth: 820 }}>
          <Reveal className="dlw-section-head" direction="up" as="div">
            <div className="dlw-eyebrow"><span className="num">V2V</span> Glossary</div>
            <h1 className="dlw-section-title" style={{ fontSize: 'clamp(2.2rem, 4.6vw, 3.4rem)' }}>
              What is <span className="dlw-text-gradient">V2V (Vehicle-to-Vehicle) Communication?</span>
            </h1>
            <p className="dlw-section-sub">
              A plain-English explainer of vehicle-to-vehicle communication — how it works, how it differs from
              DSRC and C-V2X, why latency is the whole game, and how <Link href={siteBase + '/'}>DriveLink</Link>{' '}
              implements it as an intent-first protocol.
            </p>
          </Reveal>

          <article>
            <p style={proseP}>
              <strong>Vehicle-to-Vehicle (V2V) communication</strong> is a technology that lets cars exchange
              information directly with one another — speed, position, heading, and increasingly their{' '}
              <em>intent</em> (what they&apos;re about to do) — without waiting for a signal to bounce through a
              cell tower or a cloud server. Instead of each car reasoning about the road purely from its own
              cameras, radar, and lidar, V2V lets vehicles broadcast what they know and what they plan to do,
              so nearby cars can react cooperatively rather than reactively.
            </p>
            <p style={proseP}>
              It is a foundational piece of connected and autonomous-vehicle infrastructure, sitting alongside
              V2I (vehicle-to-infrastructure), V2P (vehicle-to-pedestrian), and V2N (vehicle-to-network) under
              the broader umbrella term <strong>V2X (vehicle-to-everything)</strong> communication.
            </p>

            <h2 style={h2Style}>Why sensors alone aren&apos;t enough</h2>
            <p style={proseP}>
              Modern ADAS stacks are excellent at <em>perceiving</em> the world — cameras and radar can detect a
              car braking hard two lanes over. But perception is fundamentally reactive: a vehicle only responds
              once a hazard is already visible, and line-of-sight sensors are blind to what&apos;s hidden behind
              a truck, around a blind corner, or several cars ahead in a braking cascade. V2V communication closes
              that gap by letting vehicles <em>announce</em> intent before it becomes visible — a lane change, a
              hard brake, an intent to merge — so the reaction window starts milliseconds after the decision is
              made, not after the maneuver is already underway.
            </p>

            <h2 style={h2Style}>How V2V communication actually works</h2>
            <p style={proseP}>
              At a technical level, a V2V system generally has three jobs:
            </p>
            <ul style={{ paddingLeft: 22, margin: '0 0 22px' }}>
              <li style={li}><strong>Read vehicle state.</strong> Speed, steering angle, braking, acceleration, and heading, sampled from the vehicle bus or onboard sensors.</li>
              <li style={li}><strong>Predict short-horizon behavior.</strong> Given the current state, estimate where the vehicle will be and what it&apos;s likely to do in the next 1–3 seconds.</li>
              <li style={li}><strong>Broadcast and receive.</strong> Share that predicted intent with nearby vehicles over a low-latency wireless channel, and fuse incoming broadcasts from others into the vehicle&apos;s own decision-making.</li>
            </ul>
            <p style={proseP}>
              The last step is where most of the engineering difficulty — and most of the differentiation between
              V2V approaches — actually lives.
            </p>

            <h2 style={h2Style}>DSRC vs C-V2X vs intent-first protocols</h2>
            <p style={proseP}>
              Two radio standards have historically dominated the V2V conversation:
            </p>
            <h3 style={h3Style}>DSRC (Dedicated Short-Range Communications)</h3>
            <p style={proseP}>
              An IEEE 802.11p-based standard reserved specifically for vehicle communication. It&apos;s mature and
              well-studied, but adoption stalled for years due to spectrum allocation fights and a lack of
              cross-manufacturer buy-in.
            </p>
            <h3 style={h3Style}>C-V2X (Cellular V2X)</h3>
            <p style={proseP}>
              Built on cellular infrastructure (3GPP standards), championed heavily by chipset vendors like
              Qualcomm. It benefits from the existing cellular rollout curve but still largely transmits raw
              telemetry (position, speed, heading) rather than reasoning about <em>intent</em>.
            </p>
            <h3 style={h3Style}>Intent-first protocols</h3>
            <p style={proseP}>
              Both DSRC and C-V2X are primarily concerned with the radio layer — <em>how</em> data moves. What
              they largely leave unaddressed is <em>what</em> should move: raw kinematic state is useful, but a
              predicted <em>intent</em> — &quot;I am about to merge left in 1.2 seconds&quot; — lets a receiving
              vehicle plan a cooperative response instead of just reacting to a position update after the fact.
              This is the layer <Link href={siteBase + '/product'}>DriveLink&apos;s protocol</Link> is built
              around: a lightweight, intent-first message format designed to run over existing low-latency V2V
              radio links, agnostic to whether the underlying transport is DSRC, C-V2X, or a private mesh.
            </p>

            <h2 style={h2Style}>Why sub-50ms latency matters</h2>
            <p style={proseP}>
              At highway speed (~30 m/s), a vehicle travels roughly 1.5 meters every 50 milliseconds. Any V2V
              system slower than that starts eating into the physical stopping-distance margin a cooperative
              warning is supposed to create. That&apos;s why DriveLink targets end-to-end intent delivery in{' '}
              <strong>under 50ms</strong> — fast enough that a broadcast intent arrives while there&apos;s still
              meaningful time to act on it, not after the maneuver is already complete.
            </p>

            <h2 style={h2Style}>Real-world use cases for V2V communication</h2>
            <ul style={{ paddingLeft: 22, margin: '0 0 22px' }}>
              <li style={li}><strong>Blind-spot and lane-change collision prevention</strong> — a car signals intent to merge before it moves, not after.</li>
              <li style={li}><strong>Eliminating braking cascades and phantom traffic waves</strong> — a hard-brake event propagates as a message, not just as a chain of visual reactions.</li>
              <li style={li}><strong>Cooperative merging</strong> — vehicles negotiate who yields at an on-ramp or lane closure instead of both hesitating or both committing.</li>
              <li style={li}><strong>Smart-intersection conflict detection</strong> — roadside (V2I) nodes aggregate nearby vehicle intents into a real-time conflict-zone map.</li>
              <li style={li}><strong>Fleet and smart-city coordination</strong> — EV fleets and municipal traffic systems get network-wide visibility into cooperative maneuvers, not just individual vehicle telemetry.</li>
            </ul>

            <h2 style={h2Style}>Frequently asked questions</h2>
            <h3 style={h3Style}>What is DriveLink?</h3>
            <p style={proseP}>
              <Link href={siteBase + '/'}>DriveLink</Link> is a Vehicle-to-Vehicle communication protocol and
              company building the missing intent-sharing layer for modern vehicles — a low-latency, intent-first
              standard designed to work across OEMs, fleets, and smart-city programs. See the{' '}
              <Link href={siteBase + '/product'}>product overview</Link> or the{' '}
              <a href="https://core.drivelink.tech/docs">technical docs</a> for the full architecture.
            </p>
            <h3 style={h3Style}>Is V2V communication the same as autonomous driving?</h3>
            <p style={proseP}>
              No. Autonomous driving is about a single vehicle making its own decisions; V2V communication is
              about vehicles — autonomous or human-driven — sharing information so that <em>every</em> vehicle on
              the road can make better decisions. V2V is complementary infrastructure, not a replacement for
              onboard perception or autonomy stacks.
            </p>
            <h3 style={h3Style}>Does V2V communication require every car to have the same hardware?</h3>
            <p style={proseP}>
              Not with a cross-OEM protocol. The goal of an open, intent-first standard like DriveLink&apos;s is
              to let any manufacturer, aftermarket module, or fleet-management system implement the same message
              format, the same way Wi-Fi or Bluetooth work across unrelated hardware vendors.
            </p>
          </article>
        </div>
      </section>

      <InvestorCTA onPartner={() => goTo('investors')} />
    </main>
  );
}
