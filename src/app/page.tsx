'use client';
import { useRouter } from 'next/navigation';
import { HeroV2V } from '../sections/HeroV2V';
import { Manifesto } from '../sections/Manifesto';
import { HowItWorks } from '../sections/HowItWorks';
import { Stats } from '../sections/Stats';
import { StorySection } from '../sections/StorySection';
import { TeamSection } from '../sections/TeamSection';
import { RoadmapSection } from '../sections/RoadmapSection';
import { InvestorCTA } from '../sections/InvestorCTA';
import { hrefFor, type Page } from '../lib/nav';

export default function Home() {
  const router = useRouter();
  const go = (p: Page) => router.push(hrefFor(p));

  return (
    <main>
      <HeroV2V onCTA={go} />
      <Manifesto />
      <HowItWorks />
      <Stats />
      <StorySection />
      <TeamSection />
      <RoadmapSection />
      <InvestorCTA onPartner={() => go('investors')} />
    </main>
  );
}
