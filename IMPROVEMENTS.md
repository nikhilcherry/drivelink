# DriveLink Website — Issues & Improvements

Audit of `drivelink.tech` (live site) and the `nikhilcherry/drivelink` GitHub repo, performed 2026-07-23. Findings are ranked by severity/impact. Each one was verified directly (live HTTP requests, browser rendering, or repo source/history) rather than assumed.

---

## Critical

### 1. Production is running a stale build — several commits behind `main`
At audit time, `https://www.drivelink.tech` was serving commit `726bb78`, while `origin/main` on GitHub was already 5 commits ahead (up to `b6ae9fe`). That gap includes `eb2c5c6`, "*Fix core.drivelink.tech serving the home page instead of docs*" — a fix for the exact bug described below, **already merged but not deployed**.

**Fix:** trigger a fresh Vercel deployment from the current `main` HEAD, and confirm the GitHub → Vercel auto-deploy-on-push integration is actually enabled (a several-commit lag suggests it silently stopped triggering).

### 2. `/docs` and the footer "Documentation" link are broken in production
- Visiting `https://www.drivelink.tech/docs` returns an HTTP 308 redirect to `https://core.drivelink.tech` — with the `/docs` path dropped, landing visitors on the **homepage**, not documentation.
- The footer's "Documentation" link (`Footer.tsx`) resolves to the same dead end: `<a href="https://core.drivelink.tech">Documentation</a>`.
- Root cause (already understood in-repo): the `core.drivelink.tech` → `/docs` Vercel rewrite only matched the literal `/` path, which Vercel's zero-config framework routing doesn't reliably honor. It's fixed on `main` by widening the rewrite to a wildcard — see Critical #1. Once deployed, re-verify `core.drivelink.tech/` actually renders docs content, not the marketing homepage.

### 3. Chatbot's real AI backend isn't configured — it's silently running on canned answers
`POST /api/chat` returns `503 {"error":"AI backend not configured"}` in production. The `GROQ_API_KEY` environment variable referenced in `api/chat.js` isn't set in the Vercel project. The widget still shows "ONLINE" and degrades gracefully to a local rules-based fallback (`LOCAL_RULES` badge), so it isn't visibly broken — but the Groq integration shipped in the most recent commit (`fix: move chatbot LLM call server-side, switch to Groq`) is currently dead code in production.

**Fix:** set `GROQ_API_KEY` (and optionally `GROQ_MODEL`) in the Vercel project's Environment Variables, per `.env.example`.

---

## High

### 4. Missing name on a team/advisor card
On `/team`, the "Industry advisor" card renders no name — just an avatar showing "C·" and the line "CEO · Simple Energy" where a person's name should be. Either the name is missing from the data or the field mapping is wrong. Worth double-checking every card on that page renders a name, since a fabricated- or blank-looking card undercuts credibility on a page specifically meant to build trust with investors.

### 5. `/api/chat` has no rate limiting or abuse protection
`api/chat.js` caps message length and history size, but nothing throttles request *frequency* per client. Since it proxies to a paid Groq API using a server-held key, a scripted flood of requests (trivial to send — it's a public POST endpoint) could run up API costs or exhaust quota with no defense. Worth adding basic IP-based rate limiting (e.g. Vercel's `@vercel/edge-rate-limit` or a simple in-memory/Upstash token bucket).

---

## Medium

### 6. Duplicate live deployment creates SEO ambiguity
`core.drivelink.tech` currently mirrors the *entire* site (not just docs) — every route (`/`, `/product`, `/team`, `/investors`) returns 200 with full content on both domains. Canonical tags mostly point back to `www.drivelink.tech`, but `core.drivelink.tech/docs`'s own canonical tag pointed at `https://core.drivelink.tech` (bare domain, no path) rather than `https://www.drivelink.tech/docs` — internally inconsistent. Once the rewrite fix (Critical #1/#2) is deployed and `core.drivelink.tech` is docs-only, re-check that every page served from that host either canonicalizes to `www.drivelink.tech/docs` or is excluded from indexing (`noindex`) so search engines don't treat it as duplicate content.

### 7. No LICENSE file
The docs page states "*The v0.1 spec and reference simulation are public on GitHub*," implying openness, but the repo has no `LICENSE` file (`licenseInfo: null` via the GitHub API). Without one, the code is technically all-rights-reserved by default — anyone wanting to build on or reference the spec has no actual legal grounds to do so. Add an explicit license (or a clear "spec is public for reference, code is proprietary" note) if that's the intent.

### 8. No CI, and lint errors are ignored at build time
There's no `.github/workflows/` — nothing runs lint, type-check, or a build on PRs before merge. Compounding that, `next.config.js` sets `eslint: { ignoreDuringBuilds: true }`, so lint problems don't even fail a local production build. Given the deploy-lag issue above, some minimal CI (build + typecheck on push/PR) would catch breakage before it reaches `main`, let alone production.

---

## Low

### 9. Dead/orphaned component files
`src/sections/Team.tsx`, `Story.tsx`, and `Roadmap.tsx` are not imported anywhere in the app — they were superseded by `TeamSection.tsx`, `StorySection.tsx`, and `RoadmapSection.tsx` but never deleted. Harmless, but worth clearing out as repo hygiene.

### 10. Fonts loaded from Google's CDN instead of self-hosted
`Inter` and `Space Grotesk` are pulled from `fonts.googleapis.com`/`fonts.gstatic.com` at request time rather than via `next/font` (which self-hosts and inlines font files at build time). Self-hosting removes an extra DNS/TLS round trip on every first visit and avoids sending EU visitors' IPs to a third-party font host.

### 11. GitHub repo metadata points at a stale preview URL
The repo's "website" field is set to `https://drivelink-theta.vercel.app` (an old Vercel preview deployment) instead of `https://drivelink.tech`. Cosmetic, but it's the first link a visitor sees on the GitHub repo page.

### 12. Apex domain adds an unnecessary redirect hop
Links in the README point to `https://drivelink.tech` (no `www`), which 307-redirects to `https://www.drivelink.tech`. Functionally fine, but pointing first-party links (README, social bios, pitch decks) directly at the canonical `www` host avoids the extra hop.

---

## What's working well

- Core Web Vitals basics are solid: all first-load assets (JS chunks, CSS, fonts) return 200 with no console errors or broken requests on the homepage.
- Per-page metadata, canonical tags, Open Graph/Twitter cards, JSON-LD, `sitemap.xml`, and `robots.txt` are all implemented correctly on the main site.
- Content is honest and specific (no placeholder "Lorem ipsum," no fabricated zero-stats) — a recent commit explicitly did a pass to remove exactly that kind of thing.
- The in-browser V2V simulation (`/product`) runs smoothly client-side with no dependency on a backend.
- Accessibility basics are in place: all images/icons have `alt` text, and a prior commit specifically addressed contrast and dead `href="#"` anchors.
