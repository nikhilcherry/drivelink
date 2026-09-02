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

---

# Second pass — credibility & positioning audit, 2026-09-02

A second external audit (credibility, positioning, discoverability) was worked
through on 2026-09-02. Its findings are recorded here with the same convention:
✅ shipped, 🔒 needs a decision or an account only the founders have.

**A caveat on the audit itself:** several of its findings were already fixed
before it was written. `/team` already carried real names and photos;
`sitemap.xml`, `robots.txt` and per-route metadata already existed; `/docs` is a
real page served from `core.drivelink.tech` by a host rewrite, not a dead link;
`prefers-reduced-motion` was already handled. Those needed nothing.

## Shipped

**Honesty about what is built.** The hero read `LIVE SIMULATION · 34ms avg V2V
latency` over a browser animation of a deployment that has not happened. It now
reads `CONCEPT SIMULATION · planned Bangalore corridor`, the readout says
`simulated latency · target <50ms`, and the caption says every figure is
modelled rather than measured. `/product`'s "live simulation" and "a real V2V
traffic model" went the same way, the stats band now names the drv-mesh v0.1
spec as the source of its numbers, and the footer's green "Mesh node live"
became "Simulation stack live", which the docs roadmap actually supports.

**The patent claim.** "Patent grant option · awarded" reads as a granted patent
to anyone skimming, which is what diligence catches first. Every surface — hero
marquee, footer, investors, origin story, hiring, the chatbot, and the chatbot's
own system prompt — now says what it is: an award backing a future filing.

**Legal.** `/privacy` and `/terms` exist, are linked from the footer, and are in
the sitemap. The privacy policy describes the three places this site actually
takes personal data and the three processors that see it; there is no cookie
banner because the site sets no cookies.

**Accessibility.** A skip link, a global focus ring, `aria-current` on the nav,
and a mobile drawer that closes on Escape and returns focus. Heading structure
fixed sitewide — every page had at least one skipped level. Every text element
on every route now meets WCAG AA, measured against rendered pixels: `--fg3` and
`--fg4` were both below AA on the surfaces they are used on. The chat panel is a
labelled dialog with a live message log; the hiring form marks its required
fields and announces failures.

**Performance.** framer-motion was in the first load of every page, including
`/privacy` and the 404, for one fade and a translate. `ScrollProgress` and
`Reveal` are hand-rolled now and the chat widget loads on browser idle, so it is
in no page's initial script set. Team photos were up to 957px for a 96px
display; images cost 393 KB less. Total referenced JS is down roughly a quarter
per page.

**Security.** `vercel.json` sends HSTS, `nosniff`, `Referrer-Policy`,
`X-Frame-Options`, `Permissions-Policy`, COOP and a CSP. The chat formatter
accepted `//evil.example` as a "same-origin path" — a link to another origin
styled as an internal one — now rejected. The desk edge function interpolated
`body.id` straight into PostgREST filters, so `0&or=(id.not.is.null)` turned
"delete one application" into "delete all of them"; ids are validated as uuids.
Signed resume links now force a download rather than rendering stranger-uploaded
content inline.

**Tests and tooling.** 109 unit tests over the validation rules, the traffic
model, the chat proxy, the chat formatter and the metadata helpers, plus
`npm run audit:ui` — a browser pass over every route at three widths for
contrast, heading order, overflow, ARIA wiring and internal links. CI runs
lint, typecheck, tests and build.

## 🔒 Still open — these need you

1. **The name.** "Drivelink" is Toyota Connected's production telematics
   platform (5.5M+ vehicles), plus several other active DriveLink companies.
   The site will not rank for its own name. Either commit to branding as
   "DriveLink V2V" everywhere, or rename before there is traction to lose.
   `/v2v-communication` already carries an FAQ entry disclaiming the
   affiliation, which helps but does not solve it.
2. **LinkedIn URLs** for Hruday, Krishna and Shreyas. `PageTeam.tsx` has a
   `socials` object per member ready for them; unset ones render no icon.
3. **A domain email** (`hello@drivelink.tech`) to replace the Gmail. DNS work.
4. **Lead capture.** Every CTA is still a `mailto:`. A demo/investor-deck form
   needs a Supabase table, a migration and an RLS policy, which only you can
   apply — shipping the form without them would just fail on submit.
5. **The `Dec 2025` NMIT entry** in the origin story. The earlier audit called
   it a typo for Dec 2024, but it currently sorts correctly between Nov 2024 and
   Feb 2026, so changing it would be inventing a fact. It carries a
   `TODO(founder)` marker.
6. **Positioning**: narrowing the homepage to one primary audience, and a
   company LinkedIn page. Both are calls only you can make.
