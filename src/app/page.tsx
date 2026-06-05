'use client';
import { useState } from 'react';
import { Nav } from '../components/Nav';
import { Footer } from '../components/layout/Footer';
import { HeroV2V } from '../sections/HeroV2V';
import { Manifesto } from '../sections/Manifesto';
import { HowItWorks } from '../sections/HowItWorks';
import { Stats } from '../sections/Stats';
import { StorySection } from '../sections/StorySection';
import { TeamSection } from '../sections/TeamSection';
import { RoadmapSection } from '../sections/RoadmapSection';
import { InvestorCTA } from '../sections/InvestorCTA';
import { PageProduct } from './pages/PageProduct';
import { PageTeam } from './pages/PageTeam';
import { PageInvestors } from './pages/PageInvestors';
import { PageDocs } from './pages/PageDocs';
import { ScrollProgress } from '../components/anim/ScrollProgress';

type Page = 'home' | 'product' | 'team' | 'investors' | 'docs';

export default function Home() {
  const [page, setPage] = useState<Page>('home');

  const navigate = (p: Page) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)' }}>
      <ScrollProgress />
      <Nav page={page} setPage={navigate} />

      {page === 'home' && (
        <main>
          <HeroV2V onCTA={navigate} />
          <Manifesto />
          <HowItWorks />
          <Stats />
          <StorySection />
          <TeamSection />
          <RoadmapSection />
          <InvestorCTA onPartner={() => navigate('investors')} />
        </main>
      )}

      {page === 'product' && <PageProduct setPage={navigate} />}
      {page === 'docs' && <PageDocs setPage={navigate} />}
      {page === 'team' && <PageTeam setPage={navigate} />}
      {page === 'investors' && <PageInvestors setPage={navigate} />}

      <Footer setPage={navigate} />
    </div>
  );
}
