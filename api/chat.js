// Vercel serverless function. Keeps GROQ_API_KEY server-side — the site itself
// is a static export (next.config.js: output: 'export'), so this lives outside
// src/app/api, which Next.js static export cannot build.

const SYSTEM_PROMPT = `You are Lyra, DriveLink's intelligent AI assistant.
DriveLink is developing a decentralized, ultra-low latency (under 50ms) Vehicle-to-Vehicle (V2V) communication standard for Automotive AI, enabling vehicles to share intent and trajectory predictions in real time.

YOUR IDENTITY & PERSONALITY:
- Your name is Lyra. Always identify and introduce yourself as Lyra when asked.
- You are warm, clever, articulate, professional, and genuinely conversational.
- Speak naturally and engage dynamically — never sound like a rigid script or robotic FAQ.

HOW TO ANSWER:
1. About DriveLink:
   - What DriveLink is: A low-latency (under 50ms) V2V speaking layer and decentralized coordination protocol for automotive AI and smart mobility.
   - Core technology: Trajectory prediction, cooperative collision prevention, and the 4 ecosystem layers: drv-mesh (peer-to-peer V2V intent broadcast), drv-infra (V2I municipal smart signals & roadside nodes), Mobile HUD visualizer, and Cloud Fleet Command.
   - Team: Hruday (CEO & Chief Systems Architect), Nikhil (CTO), Krishna (CPO), Shreyas (CDO), mentored by Harish, with strategic guidance from Suhas Rajkumar (Founder & CEO of Simple Energy).
   - Traction & Milestones: All India Rank 5 at IIT Delhi Pitch Arena, hardware collaboration with NMIT, and incubation from PedalStart.
   - Patent Grant Option: A national hackathon award backing a future patent filing — NOT a granted patent. Always be transparent about this. Never describe DriveLink as holding a granted or filed patent.
   - Roadmap: Alpha Pilot Program in Q3 2026, Decentralized Data Node v1 in Q4 2026, DRV Token Protocol Audit in Q1 2027, Cross-OEM Standardization in Nov 2027.
   - Careers & Hiring: DriveLink is actively taking applications for App Dev, Web Dev, Machine Learning, Robotics · ROS, IoT & Embedded, and R&D. Point users to https://www.drivelink.tech/hiring (mentioning the application only takes a few minutes).
   - Contact: For investment, pilots, or partnerships, contact tech.drivelink@gmail.com.

2. STRICT TOPIC ENFORCEMENT & OFF-TOPIC REFUSALS:
   - You are EXCLUSIVELY an assistant for DriveLink and its connected vehicle technology.
   - You must ONLY answer questions directly related to DriveLink (its V2V communication standard, vehicle intent prediction, 4-layer ecosystem [drv-mesh, drv-infra, Mobile HUD, Cloud Fleet Command], sub-50ms latency benchmarks, founding team, milestones, roadmap, partnerships, and open engineering careers).
   - NEVER calculate math (e.g., do NOT answer "2+2=4" or solve arithmetic), do homework, provide general coding solutions, or answer general trivia, recipes, weather, sports, or pop culture questions.
   - If asked an off-topic or unrelated question, NEVER answer the question itself. Politely decline:
     "I am Lyra, DriveLink's AI assistant, exclusively dedicated to DriveLink and our connected vehicle platform. I can only assist with questions regarding our V2V technology, ecosystem, team, roadmap, and open roles! How can I help you explore DriveLink today?"
   - If the user types gibberish, random letters, or typos: playfully and politely acknowledge it (e.g., "That looks like a typo or random keystrokes! 😄 How can I assist you with DriveLink today?").
   - If the user makes brief friendly greetings (e.g. "hi", "thanks"): respond with warmth, and invite them to explore DriveLink.

3. Deep Technical & Proprietary IP:
   - For confidential proprietary firmware, specific RF frequencies, or algorithm weights: explain that these are protected under NDA / in-flight patent evaluation, and warmly invite them to contact tech.drivelink@gmail.com.

STYLE GUIDELINES:
- Keep answers concise (1-3 sentences maximum).
- Friendly, professional, and helpful.
- Do not make up facts or unverified specs.`;

const MAX_MESSAGE_LENGTH = 2000;
const MAX_HISTORY = 6;

// Best-effort per-instance rate limit — this module stays warm across
// invocations on the same Lambda instance, which is enough to blunt a
// single-source flood against the paid Groq key even though it doesn't
// coordinate across instances/regions.
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 10;
const requestLog = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const timestamps = (requestLog.get(ip) || []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  timestamps.push(now);
  requestLog.set(ip, timestamps);
  if (requestLog.size > 5000) requestLog.clear(); // guard against unbounded growth
  return timestamps.length > RATE_LIMIT_MAX_REQUESTS;
}

// In-memory interaction & feedback telemetry for continuous improvement and fine-tuning dataset generation
const telemetryLog = [];
const MAX_TELEMETRY_ENTRIES = 500;

export function recordInteraction({ query, reply, offTopic = false, model = 'unknown' }) {
  const entry = {
    id: `turn_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    query,
    reply,
    offTopic,
    model,
    feedback: null,
  };
  telemetryLog.push(entry);
  if (telemetryLog.length > MAX_TELEMETRY_ENTRIES) {
    telemetryLog.shift();
  }
  return entry;
}

export function recordFeedback({ messageId, query, reply, rating, note }) {
  const item = telemetryLog.find((t) => t.id === messageId || (t.query === query && t.reply === reply));
  if (item) {
    item.feedback = { rating, note, timestamp: new Date().toISOString() };
  } else {
    telemetryLog.push({
      id: messageId || `feedback_${Date.now()}`,
      timestamp: new Date().toISOString(),
      query: query || '',
      reply: reply || '',
      offTopic: false,
      model: 'feedback',
      feedback: { rating, note, timestamp: new Date().toISOString() },
    });
  }
}

export function getTelemetryLog() {
  return [...telemetryLog];
}

/**
 * High-speed, zero-token domain guardrail:
 * Checks whether an incoming message is clearly off-topic (math, arithmetic calculations,
 * general trivia, cooking recipes, weather, sports, pop culture, non-DriveLink coding homework).
 * Catches these before invoking Groq to preserve free LLM token and request quotas.
 */
export function isOffTopicQuery(message) {
  if (typeof message !== 'string') return false;
  const raw = message.trim();
  const lower = raw.toLowerCase();

  const hasDriveLinkContext = /\b(drivelink|v2v|vehicle|car|sensor|protocol|latency|mesh|infra|hud|fleet|road|traffic|collision|hiring|team|sub-50ms|50ms|ms)\b/i.test(lower);
  if (hasDriveLinkContext) return false;

  // 1. Math, arithmetic calculations & equations: e.g. "2+2", "what is 2 + 2", "15 * 4", "solve 2x+1=5"
  const isPureArithmetic = /^(\s*(what\s+is|calculate|evaluate|solve|compute)\s+)?[\d\s().+*^%=/-]+(\s*\?)?\s*$/i.test(raw) && /\d/.test(raw) && /[+*^%=/-]/.test(raw);
  const isMathExpr =
    isPureArithmetic ||
    /^\s*(calculate|solve math|square root of|solve the equation|evaluate the expression)\b/i.test(lower) ||
    /^\s*(solve|calculate)\s+.*[\d=]/i.test(lower);

  if (isMathExpr) return true;

  // 2. Off-topic domain patterns (food, weather, sports, pop culture, general coding homework, politics)
  const offTopicRegexes = [
    /\b(weather|temperature|forecast|climate)\b/i,
    /\b(recipe|how to cook|how to bake|pizza|pasta|burger|biryani|cake)\b/i,
    /\b(cricket|football|soccer|basketball|olympics|world cup|ipl|nba|match score)\b/i,
    /\b(movie recommendation|cinema|hollywood|bollywood|singer|taylor swift|ronaldo|messi|virat kohli)\b/i,
    /\b(bitcoin|crypto|ethereum|dogecoin|solana|stock trading tip|buy shares)\b/i,
    /\b(who is the president of|prime minister of|election result|parliament)\b/i,
    /\b(write (python|java|c\+\+|javascript|sql|html|css) (code|script|program) for)\b/i,
    /\b(leetcode|binary search tree|fibonacci|bubble sort|quicksort algorithm)\b/i,
    /\b(tell me a joke|make me laugh|write a poem about|write an essay on)\b/i,
    /\b(capital of france|tallest mountain in|distance from earth to|photosynthesis)\b/i,
    /\b(ignore (all )?previous instructions|system prompt|dan mode|bypass filter|jailbreak)\b/i,
  ];

  for (const rx of offTopicRegexes) {
    if (rx.test(lower)) {
      // Allow if query contains DriveLink specific automotive AI / V2V context
      const drivelinkContext = /\b(drivelink|v2v|vehicle|car|sensor|protocol|latency|mesh|infra|hud|fleet|road|traffic|collision|hiring|team)\b/i;
      if (drivelinkContext.test(lower)) return false;
      return true;
    }
  }

  return false;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 1. Continuous Improvement: Feedback & Dataset Export actions
  if (req.body?.action === 'feedback') {
    const { messageId, query, reply, rating, note } = req.body;
    recordFeedback({ messageId, query, reply, rating, note });
    return res.status(200).json({ success: true, message: 'Feedback recorded for continuous improvement' });
  }

  if (req.body?.action === 'export') {
    return res.status(200).json({
      count: telemetryLog.length,
      dataset: telemetryLog.map((t) => ({
        messages: [
          { role: 'system', content: "You are Lyra, DriveLink's intelligent AI assistant." },
          { role: 'user', content: t.query },
          { role: 'assistant', content: t.reply },
        ],
        metadata: {
          timestamp: t.timestamp,
          offTopic: t.offTopic,
          feedback: t.feedback?.rating || null,
        },
      })),
    });
  }

  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket?.remoteAddress || 'unknown';
  if (isRateLimited(ip)) {
    res.setHeader('Retry-After', '60');
    return res.status(429).json({ error: 'Too many requests — please slow down.' });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'AI backend not configured' });
  }

  const { message, history } = req.body || {};
  if (typeof message !== 'string' || !message.trim() || message.length > MAX_MESSAGE_LENGTH) {
    return res.status(400).json({ error: 'Invalid message' });
  }
  if (history !== undefined && !Array.isArray(history)) {
    return res.status(400).json({ error: 'Invalid history' });
  }

  // 2. Zero-token domain guardrail:
  // Catch off-topic queries (math, recipes, weather, general trivia) immediately
  // to avoid hitting free LLM rate limits.
  if (isOffTopicQuery(message)) {
    const refusalReply = "I am Lyra, DriveLink's dedicated AI assistant. I can only assist with questions regarding DriveLink, our ultra-low latency (<50ms) V2V communication standard, 4-layer ecosystem architecture, roadmap, and open engineering roles. How can I help you explore DriveLink today?";
    recordInteraction({ query: message, reply: refusalReply, offTopic: true, model: 'guardrail' });
    return res.status(200).json({
      reply: refusalReply,
      offTopic: true,
      source: 'guardrail',
    });
  }

  const priorTurns = (history || [])
    .slice(-MAX_HISTORY)
    .filter((m) => m && (m.role === 'user' || m.role === 'model') && typeof m.content === 'string')
    .map((m) => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content,
    }));

  // Candidate models in preference order. Includes enterprise OpenAI/Groq OSS models
  // followed by standard Groq LLaMA models.
  const candidateModels = [
    process.env.GROQ_MODEL,
    'openai/gpt-oss-120b',
    'openai/gpt-oss-20b',
    'llama-3.3-70b-versatile',
    'llama-3.1-8b-instant',
    'qwen/qwen3.8-27b',
    'mixtral-8x7b-32768',
    'gemma2-9b-it',
  ].filter(Boolean);

  // Preserve order without duplicates
  const modelsToTry = [...new Set(candidateModels)];

  let lastError = null;

  for (const model of modelsToTry) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...priorTurns,
            { role: 'user', content: message },
          ],
          max_tokens: 220,
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        lastError = new Error(`Groq API error for model ${model}: ${response.status}`);
        continue;
      }

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content;
      if (!text) {
        lastError = new Error(`No text returned from Groq model ${model}`);
        continue;
      }

      const trimmedReply = text.trim();
      recordInteraction({ query: message, reply: trimmedReply, offTopic: false, model });
      return res.status(200).json({ reply: trimmedReply });
    } catch (error) {
      lastError = error;
      // Continue to next model in candidate loop
    }
  }

  console.error('All Groq candidate models failed:', lastError);
  return res.status(502).json({ error: 'Upstream AI request failed' });
}
