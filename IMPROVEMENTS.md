# DriveLink Website — Issues & Improvements

Audit of `drivelink.tech` (live site) and the `nikhilcherry/drivelink` GitHub repo, performed 2026-07-23. Findings are ranked by severity/impact. Each one was verified directly (live HTTP requests, browser rendering, or repo source/history) rather than assumed.

**Status: all items below were fixed and verified live the same day** (commits `5cfafe6`, `0806c0b`, and the Vercel env var change; see the ✅ note under each item for what actually shipped). Left in place as a record of what was found and how it was resolved.

---

## Critical

### 1. ✅ Production was running a stale build — several commits behind `main`
At audit time, `https://www.drivelink.tech` was serving commit `726bb78`, while `origin/main` on GitHub was already 5 commits ahead. That gap included a fix for the exact `/docs` bug described below that was merged but never deployed.

**Fixed:** redeployed production from the up-to-date `main` HEAD via `vercel --prod`. GitHub → Vercel auto-deploy is confirmed connected (`vercel git connect`); the lag looks like it was a one-off (a manual deploy that was never promoted to production), not a broken integration — worth keeping an eye on after the next few pushes.

### 2. ✅ `/docs` and the footer "Documentation" link were broken in production
`https://www.drivelink.tech/docs` 308-redirected to `https://core.drivelink.tech` with the path dropped, landing on the homepage instead of docs. The already-merged rewrite fix (widening `core.drivelink.tech`'s host-based rewrite from matching literal `/` to a wildcard) turned out to be *necessary but not sufficient*: once deployed, non-root paths on `core.drivelink.tech` correctly rewrote to `/docs`, but the literal root `/` still resolved to the homepage — Vercel's static-file/filesystem routing wins over a rewrite for the exact `/` path on a static export, regardless of Host header.

**Fixed:** stopped depending on the ambiguous root rewrite for the two real entry points — the `www.drivelink.tech/docs` redirect and the footer's "Documentation" link now both target `https://core.drivelink.tech/docs` explicitly, which resolves via normal static file serving with no routing ambiguity. Verified: redirect chain, footer link, and the page's own canonical tag all now consistently point at `https://core.drivelink.tech/docs`.

### 3. ✅ Chatbot's real AI backend wasn't configured — it was silently running on canned answers
`POST /api/chat` returned `503`. `GROQ_API_KEY` wasn't set in Vercel's production environment.

**Fixed:** added `GROQ_API_KEY` to the Vercel project's production env vars (reused the same key already configured in local `.env.local` for dev) and redeployed. Verified live: `/api/chat` now returns real Groq-generated replies (200).

---

## High

### 4. ✅ Missing name on a team/advisor card
The "Industry advisor" card's `name` field literally contained `'CEO · Simple Energy'` (the title, not a name) — a data-entry bug, which also explains the broken "C·" avatar initials.

**Fixed:** identified the actual person via public sources (Suhas Rajkumar, founder/CEO of Simple Energy) and corrected the record in `src/app/pages/PageTeam.tsx`. Verified live on `/team`.

### 5. ✅ `/api/chat` had no rate limiting or abuse protection
A public POST endpoint proxying to a paid Groq key with no request-frequency limit.

**Fixed:** added a per-instance sliding-window rate limit (10 requests/60s per IP, `429` beyond that) in `api/chat.js`. Verified live: 12 rapid requests returned `200` for the first ~9, then `429` for the rest.

---

## Medium

### 6. ✅ Docs-subdomain canonical inconsistency
`core.drivelink.tech/docs`'s canonical tag pointed at `https://core.drivelink.tech` (bare domain, wrong domain from `www` entirely) instead of a URL that actually serves the content.

**Fixed:** `pageMetadata()` in `src/lib/seo.ts` gained an `absoluteUrl` override; `docs/page.tsx` now sets it explicitly to `https://core.drivelink.tech/docs`. Every other page on that subdomain (`/`, `/product`, `/team`, `/investors` — still fully mirrored there, which is expected/harmless) correctly self-canonicalizes back to `www.drivelink.tech`, so there's no remaining duplicate-content ambiguity.

### 7. ✅ No LICENSE file
The repo had no `LICENSE` (confirmed `licenseInfo: null` via GitHub API) despite the docs page implying the spec is public. The README, however, already states an explicit stance: *"To be finalised based on deployment and commercialization strategy. © DriveLink. All rights reserved."* — i.e. proprietary-for-now was already the deliberate call, just not formalized.

**Fixed:** added a `LICENSE` file matching that exact stance (all rights reserved, license TBD, contact for inquiries) — deliberately **not** a permissive license like MIT, since that would contradict the team's own stated position while they're mid-raise and pursuing a patent grant.

### 8. ✅ No CI, and lint errors were ignored at build time
No `.github/workflows/`; `next.config.js` had `eslint: { ignoreDuringBuilds: true }`.

**Fixed:** added `.github/workflows/ci.yml` (lint + build on every push/PR to `main`) — confirmed passing on GitHub Actions. Removed `ignoreDuringBuilds` and fixed all 21 resulting lint errors for real (unused imports, `type` → `interface`, an `Array<T>` style nit, a broken no-op button handler, and — the one substantive bug — `SimPlayground.tsx` was mutating refs directly during render instead of in an effect, an anti-pattern that's unsafe under StrictMode/concurrent rendering; moved it into a properly-dependency-tracked `useEffect`). Also ran `npm audit fix --force` to clear a critical Next.js CVE bundle (bumped 15.1.11 → 15.5.21); the 3 remaining moderate/high advisories are in Next's optional `sharp`/`postcss` image-optimization deps, which this static-export site doesn't use.

---

## Low

### 9. ✅ Dead/orphaned component files
Beyond the three originally spotted (`Team.tsx`, `Story.tsx`, `Roadmap.tsx`), a full reference sweep turned up two more: `Market.tsx`, `Hero.tsx`, `CoreAbilities.tsx`, `Progress.tsx`, and `components/layout/Navbar.tsx` (an entirely unused, unreferenced navbar). All removed.

### 10. ✅ Fonts loaded from Google's CDN instead of self-hosted
**Fixed:** switched `Inter`/`Space Grotesk` to `next/font/google` in `layout.tsx`, which self-hosts the font files at build time. Verified: zero `fonts.googleapis.com`/`fonts.gstatic.com` references on the live page, `.woff2` files served from `/_next/static/media/`.

### 11. ✅ GitHub repo metadata pointed at a stale preview URL
**Fixed:** `gh repo edit --homepage https://www.drivelink.tech`.

### 12. ✅ Apex domain added an unnecessary redirect hop
README links were already on `www.drivelink.tech` by audit time (fixed in an earlier commit); the one remaining stale link (`Docs` in the README badge row, pointing at the still-broken `/docs` path) was updated to the working `https://core.drivelink.tech/docs` URL.

---

## What's working well

- Core Web Vitals basics are solid: all first-load assets (JS chunks, CSS, fonts) return 200 with no console errors or broken requests on the homepage.
- Per-page metadata, canonical tags, Open Graph/Twitter cards, JSON-LD, `sitemap.xml`, and `robots.txt` are all implemented correctly on the main site.
- Content is honest and specific (no placeholder "Lorem ipsum," no fabricated zero-stats) — a recent commit explicitly did a pass to remove exactly that kind of thing.
- The in-browser V2V simulation (`/product`) runs smoothly client-side with no dependency on a backend.
- Accessibility basics are in place: all images/icons have `alt` text, and a prior commit specifically addressed contrast and dead `href="#"` anchors.
