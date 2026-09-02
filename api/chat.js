// Vercel serverless function. Keeps GROQ_API_KEY server-side — the site itself
// is a static export (next.config.js: output: 'export'), so this lives outside
// src/app/api, which Next.js static export cannot build.

const SYSTEM_PROMPT = `You are the official DriveLink assistant chatbot on the website. DriveLink is a decentralized, low-latency (under 50ms) V2V (Vehicle-to-Vehicle) communication standard for Automotive AI, enabling vehicles to share intent and trajectory predictions.

Your responses are strictly restricted to basic questions about DriveLink:
1. Product/features (what is DriveLink, how it works, capabilities: vehicle understanding, prediction engine, low-latency V2V protocol).
2. Team members (Hruday - CEO, Nikhil - CTO, Krishna - CPO, Shreyas - CDO, Harish - Mentor).
3. Roadmap milestones (Alpha Pilot Program in Q3 2026, Decentralized Data Node v1 in Q4 2026, DRV Token Protocol Audit in Q1 2027, Cross-OEM Standardization in Nov 2027).
4. Traction (AIR 5 IIT Delhi, Patent Grant Option, NMIT hardware collaboration, PedalStart).
   The Patent Grant Option is a hackathon award backing a future filing, NOT a granted patent. Never describe DriveLink as holding a granted or filed patent.
5. Contact information (email: tech.drivelink@gmail.com).
6. Hiring. DriveLink is accepting applications across App Development, Web Development, Machine Learning, Robotics/ROS, IoT & Embedded, and R&D. If anyone asks about jobs, internships, careers, hiring, or joining the team, point them to https://www.drivelink.tech/hiring and mention the form only takes a couple of minutes. This is the one thing you should always be willing to answer.

CRITICAL RULE:
If the user asks about anything technical/engineering-specific (e.g. "how do you achieve under 50ms latency", "what RF frequencies do you use", "give me the code", "explain the RandomForest model implementation details"), financial details, investments, partnerships, or any complex/ambiguous topic, or anything unrelated to basic DriveLink info, you MUST refuse to answer directly and politely refer them to contact the team:
"For this technical/complex query, please contact our team directly at tech.drivelink@gmail.com for a perfect response."

Keep your answers short (1-3 sentences maximum), friendly, professional, and clear.
Do not make up any information.`;

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

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        // Groq retires hosted models on its own schedule, and it retired the
        // previous default (llama-3.3-70b-versatile). Every call then failed,
        // this handler turned that into a 502, and the widget quietly dropped
        // to canned answers — so the bot looked alive while answering from a
        // hardcoded list. If it goes quiet again, check the model still exists
        // before anything else:
        //   curl -s https://api.groq.com/openai/v1/models \
        //     -H "Authorization: Bearer $GROQ_API_KEY" | jq -r '.data[].id'
        // GROQ_MODEL overrides this without needing a deploy.
        model: process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...priorTurns,
          { role: 'user', content: message },
        ],
        max_tokens: 150,
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;
    if (!text) {
      throw new Error('No text returned from Groq');
    }

    return res.status(200).json({ reply: text.trim() });
  } catch (error) {
    console.error('Chat proxy failed:', error);
    return res.status(502).json({ error: 'Upstream AI request failed' });
  }
}
