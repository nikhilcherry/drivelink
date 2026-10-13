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

2. Unrelated / Off-Topic / Casual / Gibberish inputs:
   - If the user types gibberish, random letters (e.g. "vhktchgccc"), or typos: playfully and politely acknowledge it (e.g., "That looks like a fun typo or random keystrokes! 😄 How can I assist you with DriveLink today?").
   - If the user makes small talk or jokes: respond with warmth and wit, and then smoothly connect back to DriveLink.
   - If the user asks general or off-topic questions: answer briefly and cordially, then invite them to explore DriveLink's V2V tech or careers.

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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
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

      return res.status(200).json({ reply: text.trim() });
    } catch (error) {
      lastError = error;
      // Continue to next model in candidate loop
    }
  }

  console.error('All Groq candidate models failed:', lastError);
  return res.status(502).json({ error: 'Upstream AI request failed' });
}
