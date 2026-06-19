import { Lightbulb, Users, Presentation, Trophy, MapPin, Award, Cpu } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface Achievement {
  rank: string;
  lbl: string;
  title: string;
  sub: string;
  meta: string;
}

interface StoryItem {
  date: string;
  title: string;
  Icon: LucideIcon;
  body: string;
  featured?: boolean;
  achievement?: Achievement;
}

// Entries are ordered chronologically. Each carries a review marker for the founder.
const items: StoryItem[] = [
  {
    // TODO(founder): review/revise this entry
    date: '10 Nov 2024', title: 'Ideation', Icon: Lightbulb,
    body: 'The founding team identifies the gap: modern vehicles operate as isolated agents. No shared intent means late reactions and preventable accidents. DriveLink is born.',
  },
  {
    // TODO(founder): review/revise this entry — verify date (general "Nov 2024" vs 10 Nov ideation)
    date: 'Nov 2024', title: 'First validation', Icon: Users,
    body: 'Concept validated by PedalStart mentors Harsirjan Kour (Core Team) and Sayanee Bhowmik (Ex-VC, mentor). Vision refined; direction set.',
  },
  {
    // TODO(founder): review/revise this entry
    date: '26 Nov 2024', title: 'First investor deck', Icon: Presentation,
    body: 'High-impact pitch deck built; first investor meeting with Debasis Chakraborty (CEO, Dariaan Consulting). Insights from the CEO of Simple Energy on real-world EV fleet movement patterns.',
  },
  {
    // TODO(founder): review/revise this entry — verify date (moved here to keep timeline chronological)
    date: 'Dec 2025', title: 'NMIT hardware collaboration', Icon: Cpu,
    body: 'Partnered with a technical team from NMIT for hardware support. Their expertise moved the first autonomous system from theoretical models to a functional, working implementation.',
  },
  {
    // TODO(founder): review/revise this entry
    date: '3 Feb 2026', title: 'Pitch Arena · National Finals', Icon: Trophy,
    featured: true,
    body: 'Competed against teams from across India in the Pitch Arena national finals at IIT Delhi.',
    achievement: { rank: '5', lbl: 'AIR · National rank', title: 'All India Rank 5', sub: 'Pitch Arena Finals · IIT Delhi', meta: 'PAN-INDIA · 2026' },
  },
  {
    // TODO(founder): review/revise this entry
    date: 'Mar 2026', title: 'Manipal & SMVIT circuits', Icon: MapPin,
    body: 'Pitched at Manipal Bangalore. Participated in SMVIT — no trophy but technical advice helped refine the architecture and identify critical improvements.',
  },
  {
    // TODO(founder): review/revise this entry
    date: '20 Apr 2026', title: 'Hackathon · Patent Grant Option', Icon: Award,
    featured: true,
    body: 'Secured 4th position at a national hackathon — and were awarded a Patent Grant Option recognizing the innovation and originality of the solution.',
    achievement: { rank: '4', lbl: 'Position · National', title: 'Patent Grant Option Awarded', sub: 'Hackathon · April 2026', meta: 'ORIGINALITY · PATENT' },
  },
];

export function StorySection() {
  return (
    <section className="dlw-section dlw-section-paper" id="story">
      <div className="dlw-container">
        <div className="dlw-section-head center">
          <div className="dlw-eyebrow"><span className="num">04</span> Origin story</div>
          <h2 className="dlw-section-title">
            From an idea to <span className="dlw-text-gradient">AIR&nbsp;5 at IIT Delhi</span>.
          </h2>
          <p className="dlw-section-sub">Every milestone, every validation, every credential — chronological.</p>
        </div>

        <div className="dlw-story-rail">
          {items.map((it, i) => (
            <div key={i} className="dlw-story-item">
              <div className={'dlw-story-marker ' + (it.featured ? 'featured' : '')}>
                <it.Icon size={20} color={it.featured ? '#fff' : '#0F4C81'} />
              </div>
              <div className="dlw-story-date">{it.date}</div>
              <h3 className="dlw-story-title">{it.title}</h3>
              <p className="dlw-story-body">{it.body}</p>
              {it.achievement && (
                <div className="dlw-achievement-card">
                  <div className="dlw-achievement-rank">
                    <div className="num">#{it.achievement.rank}</div>
                    <div className="lbl">{it.achievement.lbl}</div>
                  </div>
                  <div className="dlw-achievement-body">
                    <h4>{it.achievement.title}</h4>
                    <p>{it.achievement.sub}</p>
                  </div>
                  <div className="dlw-achievement-meta">{it.achievement.meta}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
