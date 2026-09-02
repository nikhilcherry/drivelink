/**
 * Browser audit of the built site: WCAG AA text contrast, heading order,
 * layout overflow, and the ARIA wiring that only exists at runtime — across
 * every route at three widths.
 *
 * These are the three classes of defect `next build`, eslint and the unit
 * tests cannot see, because each one only exists once CSS has been applied to
 * real text at a real width. Every finding this reports was a real defect the
 * first time it ran.
 *
 *   npm run build && npm run audit:ui
 *
 * Needs a Chromium: honours CHROMIUM_PATH, otherwise falls back to whatever
 * `npx playwright install chromium` put in place.
 */
import { chromium } from 'playwright-core';
import sharp from 'sharp';
import { serveDist } from './serve-dist.mjs';

const PORT = 4399;
const WIDTHS = [390, 768, 1280];
const ROUTES = [
  '/', '/product', '/team', '/investors', '/hiring',
  '/v2v-communication', '/privacy', '/terms', '/docs', '/nope-404',
];

/* ------------------------------------------------------------------ */
/* contrast                                                            */
/* ------------------------------------------------------------------ */

const relativeLuminance = (r, g, b) => {
  const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};

const contrast = (a, b) => {
  const [hi, lo] = [relativeLuminance(a.r, a.g, a.b), relativeLuminance(b.r, b.g, b.b)].sort((m, n) => n - m);
  return (hi + 0.05) / (lo + 0.05);
};

const over = (fg, bg) => ({
  r: fg.r * fg.a + bg.r * (1 - fg.a),
  g: fg.g * fg.a + bg.g * (1 - fg.a),
  b: fg.b * fg.a + bg.b * (1 - fg.a),
});

/**
 * The background a run of text actually sits on, taken as the most common
 * colour inside its box. Walking computed backgroundColor up the tree instead
 * gets gradients, background images and backdrop filters wrong, and reports
 * white-on-white for every element in a dark band.
 */
async function modalColour(png, box) {
  const { data, info } = await sharp(png)
    .extract({
      left: Math.round(box.x), top: Math.round(box.y),
      width: Math.max(1, Math.round(box.w)), height: Math.max(1, Math.round(box.h)),
    })
    .raw().toBuffer({ resolveWithObject: true });

  const counts = new Map();
  for (let i = 0; i < data.length; i += info.channels) {
    // 6 bits per channel: anti-aliased edges shouldn't each count as their own colour.
    const key = (data[i] >> 2 << 12) | (data[i + 1] >> 2 << 6) | (data[i + 2] >> 2);
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  let best = 0;
  let bestCount = -1;
  for (const [key, n] of counts) if (n > bestCount) { bestCount = n; best = key; }
  return { r: ((best >> 12) & 63) * 4, g: ((best >> 6) & 63) * 4, b: (best & 63) * 4 };
}

const COLLECT_TEXT = `(() => {
  const parse = (s) => {
    const m = s.match(/rgba?\\(([^)]+)\\)/);
    if (!m) return null;
    const p = m[1].split(/[\\s,/]+/).filter(Boolean).map(Number);
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  };
  const out = [];
  for (const el of document.querySelectorAll('body *')) {
    const text = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join(' ').trim();
    if (!text) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity === 0) continue;
    // Gradient-filled text (color: transparent + background-clip) has no single
    // foreground colour to measure.
    if (cs.webkitTextFillColor === 'rgba(0, 0, 0, 0)' || cs.color === 'rgba(0, 0, 0, 0)') continue;
    const r = el.getBoundingClientRect();
    if (r.width < 4 || r.height < 4) continue;
    // The page is rendered one viewport tall, so anything outside it has been
    // parked off-screen on purpose — the skip link waiting for focus, a drawer
    // translated away. There is no rendered background to measure it against.
    if (r.top < 0 || r.left < 0 || r.bottom > innerHeight + 1 || r.right > innerWidth + 1) continue;
    const fg = parse(cs.color);
    if (!fg) continue;
    const size = parseFloat(cs.fontSize);
    const weight = +cs.fontWeight || 400;
    out.push({
      fg, size, weight,
      large: size >= 24 || (size >= 18.66 && weight >= 700),
      box: { x: Math.max(0, r.x), y: Math.max(0, r.y), w: r.width, h: r.height },
      sel: el.tagName.toLowerCase() + (typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\\s+/).slice(0, 2).join('.') : ''),
      text: text.slice(0, 44),
    });
  }
  return out;
})()`;

/* ------------------------------------------------------------------ */
/* headings + layout                                                   */
/* ------------------------------------------------------------------ */

const STRUCTURE = `((viewportWidth) => {
  const name = (el) => el.tagName.toLowerCase() + '.' + (el.className || '').toString().trim().split(/\\s+/)[0];

  const headings = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map((e) => ({
    level: +e.tagName[1],
    text: (e.textContent || '').replace(/\\s+/g, ' ').trim().slice(0, 40),
  }));

  const doc = document.documentElement;
  const clipped = [];
  const cut = [];
  for (const el of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(el);

    // Text cut off by its own box, with no scrollbar and no ellipsis.
    const own = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join('').trim();
    if (own && cs.textOverflow !== 'ellipsis' && !(cs.overflow === 'visible' && cs.overflowX === 'visible')
        && !el.closest('.dlw-sr-only') && el.scrollWidth > el.clientWidth + 1) {
      clipped.push(name(el) + ' ' + JSON.stringify(own.slice(0, 30)));
    }

    // Content past the right edge that nothing lets you scroll to. Decorative
    // overhang (pointer-events:none, no text) is deliberate.
    const r = el.getBoundingClientRect();
    if (!(r.width && r.right > viewportWidth + 2)) continue;
    // A fixed overlay and everything inside it is positioned against the
    // viewport, not the document; it is not page content running off the edge.
    if (cs.position === 'fixed' || el.closest('.dlw-nav, [style*="position: fixed"], .fixed')) continue;
    if (cs.pointerEvents === 'none' && !el.textContent.trim()) continue;
    if (el.closest('.dlw-hero-marquee')) continue;
    let n = el.parentElement;
    let reachable = false;
    while (n && n !== doc) {
      const p = getComputedStyle(n);
      if ((p.overflowX === 'auto' || p.overflowX === 'scroll') && n.scrollWidth > n.clientWidth + 1) { reachable = true; break; }
      n = n.parentElement;
    }
    if (!reachable) cut.push(name(el) + ' right=' + Math.round(r.right));
  }

  return {
    headings,
    pageOverflow: doc.scrollWidth - doc.clientWidth,
    clipped: [...new Set(clipped)].slice(0, 8),
    cut: [...new Set(cut)].slice(0, 8),
  };
})(${'${WIDTH}'})`;

/**
 * ARIA wiring that only exists once the page is rendered: a describedby
 * pointing at an id that no longer exists announces nothing, and a control
 * with no accessible name is announced as just "button".
 */
const SEMANTICS = `(() => {
  const label = (el) => el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.getAttribute('name') ? '[name=' + el.getAttribute('name') + ']' : '');
  const problems = [];

  // Every id referenced by aria-describedby / aria-labelledby / for must exist.
  for (const el of document.querySelectorAll('[aria-describedby],[aria-labelledby],label[for]')) {
    const refs = [
      ...(el.getAttribute('aria-describedby') || '').split(/\\s+/),
      ...(el.getAttribute('aria-labelledby') || '').split(/\\s+/),
      ...(el.tagName === 'LABEL' && el.getAttribute('for') ? [el.getAttribute('for')] : []),
    ].filter(Boolean);
    for (const id of refs) {
      if (!document.getElementById(id)) problems.push(\`\${label(el)} references missing id "\${id}"\`);
    }
  }

  // Duplicate ids silently break every one of those references.
  const seen = new Map();
  for (const el of document.querySelectorAll('[id]')) seen.set(el.id, (seen.get(el.id) || 0) + 1);
  for (const [id, n] of seen) if (n > 1) problems.push(\`id "\${id}" used \${n} times\`);

  const named = (el) => {
    if (el.getAttribute('aria-label')?.trim()) return true;
    const by = el.getAttribute('aria-labelledby');
    if (by && by.split(/\\s+/).some((id) => document.getElementById(id)?.textContent?.trim())) return true;
    if (el.id && [...document.querySelectorAll('label[for]')].some((l) => l.getAttribute('for') === el.id && l.textContent.trim())) return true;
    if (el.closest('label')?.textContent?.trim()) return true;
    if (el.getAttribute('title')?.trim()) return true;
    return false;
  };

  const visible = (el) => {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 || r.height > 0;
  };

  // Controls with no accessible name.
  for (const el of document.querySelectorAll('button, a[href], input:not([type=hidden]), select, textarea')) {
    if (!visible(el) || el.closest('[aria-hidden="true"]')) continue;
    if (el.tagName === 'BUTTON' || el.tagName === 'A') {
      if (el.textContent.trim() || named(el)) continue;
      if (el.querySelector('img[alt]:not([alt=""])')) continue;
      problems.push(label(el) + ' has no accessible name');
    } else if (!named(el)) {
      problems.push(label(el) + ' form control has no label');
    }
  }

  // Images must declare alt, even if empty for decorative ones.
  for (const el of document.querySelectorAll('img')) {
    if (!el.hasAttribute('alt')) problems.push((el.getAttribute('src') || 'img') + ' has no alt attribute');
  }

  const lang = document.documentElement.getAttribute('lang');
  if (!lang) problems.push('<html> has no lang attribute');

  return [...new Set(problems)];
})()`;

/* ------------------------------------------------------------------ */

const failures = [];
const fail = (where, message) => failures.push(`${where}  ${message}`);

const server = await serveDist(PORT);
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
});

try {
  for (const width of WIDTHS) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
    const page = await context.newPage();

    for (const route of ROUTES) {
      const where = `${String(width).padStart(4)}px ${route}`;
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`http://localhost:${PORT}${route}`, { waitUntil: 'networkidle' });

      // One viewport tall, so element rects and screenshot pixels share an
      // origin. Scrolling between the two puts them out of step.
      const full = await page.evaluate(() => document.documentElement.scrollHeight);
      await page.setViewportSize({ width, height: Math.min(full + 200, 16000) });
      await page.waitForTimeout(700);

      const { headings, pageOverflow, clipped, cut } =
        await page.evaluate(STRUCTURE.replace('${WIDTH}', String(width)));

      const h1s = headings.filter((h) => h.level === 1);
      if (h1s.length !== 1) fail(where, `${h1s.length} <h1> elements (expected exactly 1)`);
      for (let i = 1; i < headings.length; i++) {
        if (headings[i].level - headings[i - 1].level > 1) {
          fail(where, `heading order skips h${headings[i - 1].level} -> h${headings[i].level} at ${JSON.stringify(headings[i].text)}`);
        }
      }
      if (pageOverflow > 0) fail(where, `page scrolls horizontally by ${pageOverflow}px`);
      for (const p of await page.evaluate(SEMANTICS)) fail(where, p);
      for (const c of clipped) fail(where, `text clipped: ${c}`);
      for (const c of cut) fail(where, `cut off past the right edge: ${c}`);

      const shot = await page.screenshot();
      const meta = await sharp(shot).metadata();
      for (const el of await page.evaluate(COLLECT_TEXT)) {
        if (el.box.y + el.box.h > meta.height || el.box.x + el.box.w > meta.width) continue;
        const bg = await modalColour(shot, el.box);
        const fg = over(el.fg, bg);
        const ratio = contrast(fg, bg);
        const need = el.large ? 3 : 4.5;
        if (ratio < need) {
          fail(where, `contrast ${ratio.toFixed(2)}:1 (needs ${need}) ${el.size}px/${el.weight} ${el.sel} ${JSON.stringify(el.text)}`);
        }
      }
    }
    await context.close();
  }
} finally {
  await browser.close();
  server.close();
}

if (failures.length) {
  console.error(`\n${failures.length} finding(s):\n`);
  for (const f of failures) console.error('  ' + f);
  process.exit(1);
}
console.log(
  `clean — ${ROUTES.length} routes x ${WIDTHS.length} widths: one h1 each, no skipped heading levels, ` +
  'no clipped or unreachable content, every control named and every aria reference resolved, all text at WCAG AA.',
);
