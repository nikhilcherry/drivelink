'use client';
import { ApplicationForm } from '../../components/hiring/ApplicationForm';
import { Award, Building2, ShieldCheck } from 'lucide-react';

/** Standing facts about the company, shown before anyone fills the form. */
const standing = [
  { Icon: ShieldCheck, title: 'A registered company', body: 'DriveLink is incorporated — not a student side project or an unregistered team.' },
  { Icon: Award, title: 'Funded', body: 'We have secured our first round of funding, alongside a patent grant option (an award backing a future filing) and AIR 5 at the IIT Delhi Pitch Arena National Finals.' },
  { Icon: Building2, title: 'Incubated at NMIT', body: 'We build out of the incubation centre at Nitte Meenakshi Institute of Technology, with hardware support from their technical team.' },
];

const perks = [
  {
    title: 'Work on the actual protocol',
    body: 'Not a wrapper around someone else’s stack. The spec, the prediction engine, and the radio layer are all in-house and all still being written.',
  },
  {
    title: 'Small team, real ownership',
    body: 'You own a surface end to end. What you ship goes into the alpha pilot, not into a backlog.',
  },
  {
    title: 'Hardware in the loop',
    body: 'Simulation is where it starts. Everything eventually gets tested on real vehicles with our hardware partners.',
  },
];

export function HiringClient() {
  return (
    <main>
      <section className="dlw-section" style={{ paddingTop: 160, paddingBottom: 60 }}>
        <div className="dlw-container">
          <div className="dlw-section-head" style={{ maxWidth: 880, marginBottom: 0 }}>
            <div className="dlw-eyebrow"><span className="num">→</span> Join us</div>
            <h1
              className="dlw-section-title"
              style={{ fontSize: 'clamp(2.6rem, 5.4vw, 4.8rem)', letterSpacing: '-0.04em' }}
            >
              Help build <span className="dlw-text-gradient">the layer cars are missing.</span>
            </h1>
            <p className="dlw-section-sub">
              DriveLink is a small team building a cross-OEM V2V intent protocol from the spec up. If that
              sounds like the problem you want to spend your time on, tell us about yourself.
            </p>
          </div>

          <div className="dlw-hiring-standing">
            <h2 className="dlw-hiring-standing-lead">
              Before you apply, the part people usually ask about first:
            </h2>
            <div className="dlw-hiring-standing-grid">
              {standing.map(({ Icon, title, body }) => (
                <div className="dlw-hiring-standing-item" key={title}>
                  <Icon size={18} color="#0f4c81" aria-hidden="true" />
                  <div>
                    <h3>{title}</h3>
                    <p>{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <h2 className="dlw-sr-only">What you get</h2>
          <div className="dlw-hiring-perks">
            {perks.map((p) => (
              <div className="dlw-hiring-perk" key={p.title}>
                <h3>{p.title}</h3>
                <p>{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="dlw-section dlw-section-paper" style={{ paddingTop: 60 }} id="apply">
        <div className="dlw-container">
          <ApplicationForm />
        </div>
      </section>
    </main>
  );
}
