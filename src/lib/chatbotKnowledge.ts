export const HIRING_LINK = '[apply here](/hiring)';
export const ECOSYSTEM_LINK = '[explore our ecosystem](/ecosystem)';
export const PRODUCT_LINK = '[learn how it works](/product)';
export const TEAM_LINK = '[meet the team](/team)';
export const ROADMAP_LINK = '[view the roadmap](/investors)';

export type KnowledgeCategory =
  | 'greeting'
  | 'hiring'
  | 'product'
  | 'latency'
  | 'ecosystem'
  | 'team'
  | 'traction'
  | 'roadmap'
  | 'contact'
  | 'technical'
  | 'privacy'
  | 'off_topic'
  | 'fallback';

export interface KnowledgeResponse {
  category: KnowledgeCategory;
  reply: string;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Checks if a standalone word appears in the input text with word boundaries.
 */
function hasWord(text: string, word: string): boolean {
  const regex = new RegExp(`\\b${escapeRegex(word)}\\b`, 'i');
  return regex.test(text);
}

/**
 * Checks if any of the given keywords or phrases appear in the input text.
 * Short words (<= 3 chars) use word boundaries to avoid false positives.
 */
function matchesAny(text: string, patterns: string[]): boolean {
  const lower = text.toLowerCase();
  for (const pattern of patterns) {
    const p = pattern.toLowerCase();
    if (p.length <= 3) {
      if (hasWord(lower, p)) return true;
    } else {
      if (lower.includes(p)) return true;
    }
  }
  return false;
}

export function getChatbotResponse(rawMessage: string): KnowledgeResponse {
  const raw = (rawMessage || '').trim();
  const lower = raw.toLowerCase();

  // Normalize punctuation for token/phrase inspection
  const clean = lower
    .replace(/[^\w\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // 1. Guardrails & Jailbreak / Exploit attempts
  const jailbreakPhrases = [
    'ignore previous',
    'ignore all previous',
    'ignore your instructions',
    'system prompt',
    'prompt injection',
    'jailbreak',
    'dan mode',
    'bypass security',
    'bypass filter',
    'exploit',
    'unfiltered mode',
    'hack into',
    'hack wifi',
    'ddos',
    'sql injection',
  ];
  if (jailbreakPhrases.some((phrase) => lower.includes(phrase))) {
    return {
      category: 'off_topic',
      reply:
        "I am the DriveLink assistant, dedicated exclusively to providing verified information about DriveLink's V2V communication technology, ecosystem, team, and hiring. I cannot fulfill system override or exploit requests.",
    };
  }

  // 2. Off-Topic & Unrelated queries (food, recipes, weather, movies, jokes, crypto, politics, sports, general trivia)
  const offTopicKeywords = [
    'weather',
    'temperature',
    'forecast',
    'rain',
    'raining',
    'recipe',
    'cook',
    'cooking',
    'cake',
    'pizza',
    'burger',
    'pasta',
    'biryani',
    'bake',
    'joke',
    'funny',
    'laugh',
    'movie',
    'cinema',
    'song',
    'music',
    'cricket',
    'football',
    'soccer',
    'basketball',
    'sports',
    'olympics',
    'world cup',
    'ipl',
    'bitcoin',
    'crypto',
    'ethereum',
    'dogecoin',
    'solana',
    'stock market',
    'trading tip',
    'shares to buy',
    'president',
    'prime minister',
    'election',
    'politics',
    'parliament',
    'democrat',
    'republican',
    'elon musk',
    'zuckerberg',
    'bill gates',
    'steve jobs',
    'taylor swift',
    'ronaldo',
    'messi',
    'virat kohli',
    'photosynthesis',
    'dinosaur',
    'mount everest',
    'capital of',
  ];
  if (matchesAny(clean, offTopicKeywords)) {
    return {
      category: 'off_topic',
      reply:
        "I'm specialized in answering questions about DriveLink and our connected vehicle technology. " +
        "I cannot assist with general trivia, entertainment, or unrelated topics. " +
        `Feel free to ask about our **V2V Protocol**, ${ECOSYSTEM_LINK}, our **team**, or open **careers**!`,
    };
  }

  // 3. Greetings
  const greetings = [
    'hi',
    'hello',
    'hey',
    'greetings',
    'good morning',
    'good afternoon',
    'good evening',
    'what s up',
    'whats up',
    'sup',
    'who are you',
    'what can you do',
    'help me',
    'help',
  ];
  const isGreeting =
    greetings.includes(clean) ||
    greetings.some((g) => clean.startsWith(g + ' ') || clean.endsWith(' ' + g));
  if (isGreeting && clean.split(' ').length <= 4) {
    return {
      category: 'greeting',
      reply:
        "Hello! I am your DriveLink assistant. I can answer questions about our low-latency Vehicle-to-Vehicle (V2V) protocol, our connected ecosystem, the founding team, milestones, and open roles. What would you like to know?",
    };
  }

  // 4. Contact & Inquiries (Checked early so "contact the team", "get in touch with founders", "pitch deck" route here)
  const contactPhrases = [
    'contact',
    'email',
    'support',
    'reach out',
    'get in touch',
    'talk to team',
    'talk to founder',
    'speak to',
    'phone number',
    'office location',
    'office address',
    'where are you located',
    'where is your office',
    'headquarters',
    'bangalore office',
    'investor',
    'investors',
    'investment',
    'pitch deck',
    'deck inquiry',
    'partnership',
    'partner with',
    'pilot inquiry',
  ];
  const isBangaloreOffice = clean.includes('bangalore') && !clean.includes('corridor');
  if (matchesAny(clean, contactPhrases) || isBangaloreOffice) {
    return {
      category: 'contact',
      reply:
        `You can reach the DriveLink founding team directly at **tech.drivelink@gmail.com**. ` +
        `We are based in **Bangalore, India**. For investment inquiries, OEM pilot partnerships, or technical discussions, our team responds promptly within 24–48 hours.`,
    };
  }

  // 5. Hiring & Careers (Checked before Team so "join the team", "open roles" route to hiring)
  const hiringPhrases = [
    'hiring',
    'hire',
    'career',
    'careers',
    'vacancy',
    'vacancies',
    'opening',
    'openings',
    'apply',
    'recruitment',
    'recruit',
    'work with you',
    'work at drivelink',
    'work with drivelink',
    'join drivelink',
    'join the team',
    'join your team',
    'open position',
    'open positions',
    'open role',
    'open roles',
    'job',
    'jobs',
    'intern',
    'interns',
    'internship',
    'internships',
  ];
  if (matchesAny(clean, hiringPhrases)) {
    return {
      category: 'hiring',
      reply:
        `**Yes — DriveLink is actively accepting applications!** We have openings across:\n` +
        `• **App Development** (Mobile HUD & Dashboards)\n` +
        `• **Web Development** (Interactive interfaces & portals)\n` +
        `• **Machine Learning** (Trajectory prediction models)\n` +
        `• **Robotics · ROS** (Vehicle integration & CAN bus)\n` +
        `• **IoT & Embedded** (On-board communication units)\n` +
        `• **R&D** (Protocol standards & algorithm design)\n\n` +
        `You can ${HIRING_LINK} directly — the application form only takes a couple of minutes!`,
    };
  }

  // 6. Privacy & Data Governance (Checked before product/telemetry so "do you track location" routes here)
  const privacyPhrases = [
    'privacy',
    'privacy policy',
    'terms of service',
    'terms',
    'track my',
    'tracking',
    'telemetry data handled',
    'data policy',
    'user data',
    'gdpr',
  ];
  if (matchesAny(clean, privacyPhrases)) {
    return {
      category: 'privacy',
      reply:
        `DriveLink protocols prioritize ephemeral, localized safety broadcasts with zero persistent tracking of personal vehicle telemetry or route history. Review our [Privacy Policy](/privacy) and [Terms of Service](/terms) for complete details.`,
    };
  }

  // 7. Patent Specific Claim (Strictly clarifies Hackathon Award Option vs granted patent)
  const patentKeywords = ['patent', 'patents', 'patent grant option', 'intellectual property'];
  if (matchesAny(clean, patentKeywords)) {
    return {
      category: 'traction',
      reply:
        "DriveLink received a **Patent Grant Option** at a national hackathon — this is an award backing a future patent filing, not an already granted patent. We are committed to transparency regarding our intellectual property roadmap.",
    };
  }

  // 8. Specific Team Members & Leadership
  if (hasWord(clean, 'hruday')) {
    return {
      category: 'team',
      reply:
        "**Hruday** is the CEO & Chief Systems Architect at DriveLink. He spearheads system architecture, core protocol engineering, and technology strategy. You can [view the team](/team) to learn more.",
    };
  }
  if (hasWord(clean, 'nikhil')) {
    return {
      category: 'team',
      reply:
        "**Nikhil** is the Chief Technology Officer (CTO) at DriveLink, leading hardware integration, firmware infrastructure, and cross-platform architecture.",
    };
  }
  if (hasWord(clean, 'krishna')) {
    return {
      category: 'team',
      reply:
        "**Krishna** is the Chief Product Officer (CPO) at DriveLink, overseeing product vision, UX strategy, and OEM partnership integration.",
    };
  }
  if (hasWord(clean, 'shreyas')) {
    return {
      category: 'team',
      reply:
        "**Shreyas** is the Chief Development Officer (CDO) at DriveLink, managing platform development, software pipelines, and developer tooling.",
    };
  }
  if (hasWord(clean, 'harish')) {
    return {
      category: 'team',
      reply:
        "**Harish** serves as a core mentor to DriveLink, offering seasoned engineering leadership and guidance.",
    };
  }
  if (hasWord(clean, 'suhas') || clean.includes('simple energy')) {
    return {
      category: 'team',
      reply:
        "**Suhas Rajkumar** (Founder & CEO of Simple Energy) provides strategic industry guidance and advisory mentorship to DriveLink.",
    };
  }

  // General Team / Leadership queries
  const teamQueries = [
    'team',
    'founder',
    'founders',
    'who founded',
    'who started',
    'leadership',
    'mentors',
    'advisors',
    'ceo',
    'cto',
    'cpo',
    'cdo',
    'executives',
    'who leads',
  ];
  if (matchesAny(clean, teamQueries)) {
    return {
      category: 'team',
      reply:
        `DriveLink is led by **Hruday** (CEO & Chief Systems Architect), **Nikhil** (CTO), and **Krishna** (CPO), with **Shreyas** as Chief Development Officer. ` +
        `We are mentored by Harish, with industry guidance from Suhas Rajkumar (Founder & CEO of Simple Energy). You can ${TEAM_LINK}.`,
    };
  }

  // 9. Traction, Pitch Arena & Milestones
  const tractionKeywords = [
    'traction',
    'award',
    'awards',
    'achievement',
    'achievements',
    'pitch arena',
    'pitch competition',
    'iit delhi',
    'air 5',
    'rank 5',
    'pedalstart',
    'nmit',
    'finals',
  ];
  if (matchesAny(clean, tractionKeywords)) {
    return {
      category: 'traction',
      reply:
        `Key DriveLink achievements & validation:\n` +
        `• **All India Rank 5** at the prestigious IIT Delhi Pitch Arena National Finals.\n` +
        `• **Patent Grant Option** awarded at a national hackathon backing our core V2V protocol architecture.\n` +
        `• Hardware testing collaboration with NMIT and incubation backing from PedalStart.`,
    };
  }

  // 10. Roadmap & Timeline
  const roadmapKeywords = [
    'roadmap',
    'milestone',
    'milestones',
    'timeline',
    'launch',
    'when launch',
    'release date',
    'future plans',
    'next step',
    'q3 2026',
    'q4 2026',
    'q1 2027',
    '2027',
  ];
  if (matchesAny(clean, roadmapKeywords)) {
    return {
      category: 'roadmap',
      reply:
        `Our execution milestones:\n` +
        `• **Q3 2026:** Alpha Pilot Program\n` +
        `• **Q4 2026:** Decentralized Data Node v1\n` +
        `• **Q1 2027:** DRV Token Protocol Security Audit\n` +
        `• **November 2027:** Cross-OEM Standardization & Fleet Integration\n\n` +
        `You can ${ROADMAP_LINK} for our strategic objectives.`,
    };
  }

  // 11. Ecosystem & Infrastructure Layers
  const ecosystemKeywords = [
    'ecosystem',
    'drv-mesh',
    'drv-infra',
    'drv mesh',
    'drv infra',
    'infrastructure',
    'traffic light',
    'traffic signal',
    'municipal',
    'smart city',
    'mobile app',
    'mobile hud',
    'hud visualizer',
    'fleet command',
    'cloud fleet',
    'fleet visualizer',
    'architecture',
    'v2i',
  ];
  if (matchesAny(clean, ecosystemKeywords)) {
    return {
      category: 'ecosystem',
      reply:
        `The DriveLink technology ecosystem brings together four integrated layers:\n` +
        `1. **drv-mesh**: Sub-50ms peer-to-peer V2V protocol broadcasting motion intent and predicted vectors.\n` +
        `2. **drv-infra**: V2I protocol connecting smart city traffic signals and roadside nodes with vehicles.\n` +
        `3. **In-Cabin Mobile HUD**: Cross-platform driver visualizer for blind-spot warnings and corridor safety.\n` +
        `4. **Cloud Fleet Command**: Real-time fleet analytics, safety telemetry, and corridor health monitoring.\n\n` +
        `You can ${ECOSYSTEM_LINK} for detailed architectural diagrams and protocol specs.`,
    };
  }

  // 12. Latency & Performance Speed
  const latencyKeywords = [
    'latency',
    'sub-50ms',
    'sub 50ms',
    '50ms',
    'under 50ms',
    'how fast',
    'performance',
    'delay',
    'ping',
    'response time',
  ];
  if (matchesAny(clean, latencyKeywords)) {
    return {
      category: 'latency',
      reply:
        `DriveLink targets **sub-50ms end-to-end latency** for real-time safety coordination. Our concept simulations model message exchange benchmarks across the planned Bangalore corridor, ensuring vehicles exchange telemetry well within critical reaction windows.`,
    };
  }

  // 13. Technical Architecture & Hardware (Protected IP)
  const technicalKeywords = [
    'can bus',
    'canbus',
    'firmware',
    'github',
    'source code',
    'open source',
    'rf frequency',
    'radio frequency',
    'random forest',
    'ros node',
    'robotics operating system',
    'hardware spec',
    'telemetry packet',
  ];
  if (matchesAny(clean, technicalKeywords)) {
    return {
      category: 'technical',
      reply:
        `DriveLink interfaces with standard vehicle CAN bus networks and on-board compute units. ` +
        `To protect in-flight patent evaluations and proprietary IP, deep firmware source and specific RF frequency topologies are shared under NDA. ` +
        `For technical integration whitepapers, please contact our systems team directly at **tech.drivelink@gmail.com**, or ${ECOSYSTEM_LINK}.`,
    };
  }

  // 14. Core Product & V2V Communication
  const productKeywords = [
    'what is drivelink',
    'about drivelink',
    'what does it do',
    'explain drivelink',
    'product',
    'v2v',
    'v2x',
    'vehicle to vehicle',
    'vehicle-to-vehicle',
    'trajectory',
    'prediction',
    'collision',
    'accident',
    'prevent crash',
    'safety',
    'speaking layer',
    'how it works',
    'capabilities',
    'communicate',
    'cars communicate',
    'vehicles communicate',
    'cars talk',
    'vehicles talk',
    'simulation',
  ];
  if (matchesAny(clean, productKeywords)) {
    return {
      category: 'product',
      reply:
        `DriveLink is a decentralized **Vehicle-to-Vehicle (V2V) communication standard** for Automotive AI. ` +
        `It acts as an ultra-low latency speaking layer allowing vehicles to share intent, braking events, and predicted trajectories in **under 50ms**, ` +
        `enabling neighboring vehicles to react collaboratively before hazard occurs. You can ${PRODUCT_LINK}.`,
    };
  }

  // 15. Intelligent Fallback
  return {
    category: 'fallback',
    reply:
      "DriveLink is the low-latency V2V communication backbone for Automotive AI. " +
      `You can ${PRODUCT_LINK}, ${ECOSYSTEM_LINK}, or if you're exploring careers, ${HIRING_LINK}. ` +
      "For specific technical queries or partner inquiries, feel free to reach our team at **tech.drivelink@gmail.com**.",
  };
}
