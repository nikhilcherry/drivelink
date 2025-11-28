
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { Hero } from './sections/Hero';
import { CoreAbilities } from './sections/CoreAbilities';
import { Market } from './sections/Market';
import { Story } from './sections/Story';
import { Team } from './sections/Team';
import { Roadmap } from './sections/Roadmap';
import { Progress } from './sections/Progress';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans selection:bg-drive-blue/20 selection:text-drive-blue">
      <Navbar />
      <main>
        <Hero />
        <CoreAbilities />
        <Market />
        <Story />
        <Team />
        <Roadmap />
        <Progress />
      </main>
      <Footer />
    </div>
  );
}

export default App;
