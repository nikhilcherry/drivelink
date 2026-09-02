<div align="center">

# DriveLink

### The Decentralized Backbone for Automotive AI

Vehicles can already *see*. **DriveLink lets them speak** — broadcasting intent and predicted motion to nearby cars in **under 50 ms**, so traffic reacts *before* danger appears instead of after.

[![Website](https://img.shields.io/badge/live-drivelink.tech-0F4C81)](https://www.drivelink.tech)
[![Next.js](https://img.shields.io/badge/Next.js-15-000000?logo=nextdotjs)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Deploy](https://img.shields.io/badge/deploy-Vercel-000000?logo=vercel)](https://vercel.com)

[Website](https://www.drivelink.tech) · [Product](https://www.drivelink.tech/product) · [Docs](https://core.drivelink.tech/docs) · [Team](https://www.drivelink.tech/team) · [Investors](https://www.drivelink.tech/investors)

</div>

---

## What is DriveLink?

Modern vehicles rely on cameras, radar, and lidar. These let a car *perceive* its surroundings — but they don't let cars *communicate* with one another. As a result, vehicles behave as isolated agents and frequently react only **after** a hazard becomes visible.

**DriveLink is a Vehicle-to-Vehicle (V2V) communication layer that closes this gap.** It sits on top of existing sensor stacks and lets each vehicle broadcast its **immediate intent and predicted trajectory** to nearby cars — enabling proactive, cooperative driving rather than last-moment reaction.

> Modern vehicles can see. They **cannot speak**. DriveLink is the missing communication layer — a low-latency, intent-first standard for vehicles to broadcast intent before they act.

It is designed to be **decentralized** and **cross-OEM**: a shared protocol any manufacturer, fleet, or smart-city program can adopt.

---

## Core capabilities

| Capability | What it does |
|---|---|
| **Vehicle understanding** | Reads live parameters — speed, steering, braking, acceleration — to model real-time behavior. |
| **Prediction engine** | Generates short-horizon trajectory predictions to anticipate where a vehicle will be in the next second(s). |
| **Low-latency V2V** | Shares predicted motion and intent with nearby vehicles in **under 50 ms** for instantaneous cooperative reactions. |

## Architecture

DriveLink is structured in three layers:

1. **On-Vehicle Module** — a lightweight hardware module + embedded software that reads vehicle data and runs local prediction.
2. **DriveLink Protocol** — a low-latency, intent-first V2V message standard.
3. **Intelligence Layer** — scalable software for analytics, conflict-zone detection, and network-wide safety insights.

## Why it matters

- Reduces blind-spot and lane-change collisions
- Eliminates braking cascades and phantom traffic waves
- Enables smooth merging and coordinated lane behavior
- Provides a foundational communication standard for fleets and smart cities
- Supports next-generation autonomous driving systems

**Target segments:** EV fleets · automotive OEMs · smart-city mobility programs · autonomous R&D labs

## Traction

- 🏆 **All India Rank 5** — Pitch Arena National Finals, **IIT Delhi**
- 📜 **Patent Grant Option** awarded at a national hackathon (4th place) for originality
- 🔧 **NMIT hardware collaboration** — moved the first autonomous system from theory to a working implementation
- 🤝 Validated through **PedalStart** mentorship and early industry conversations

---

## About this repository

This repo is the **official DriveLink marketing website** — a statically-exported Next.js app deployed at [drivelink.tech](https://www.drivelink.tech). It presents the product, the origin story, the team, and the roadmap, and features a **live in-browser V2V traffic simulation** in the hero (car-following, negotiated lane changes, and real-time V2V link rendering).

### Tech stack

| Area | Choice |
|---|---|
| Framework | **Next.js 15** (App Router), static export (`output: 'export'`) |
| UI | **React 19** + **TypeScript** |
| Styling | Tailwind v4 + a hand-built `dlw-*` design system (blueprint theme) in `globals.css` |
| Animation | **Framer Motion**, IntersectionObserver scroll reveals, pointer-reactive FX |
| Icons | **lucide-react** |
| Simulation | Custom canvas engine (`src/lib/v2vSim.ts`) |
| Hosting | **Vercel** |

### Project structure

```
drivelink/
├── public/                     # static assets
├── src/
│   ├── app/
│   │   ├── layout.tsx          # root layout — nav, footer, scroll/pointer FX
│   │   ├── page.tsx            # landing page (composes the sections)
│   │   ├── globals.css         # design system: blueprint theme, dlw-* classes
│   │   ├── product|docs|team|investors/   # per-page routes
│   │   └── pages/              # page bodies (PageProduct, PageDocs, …)
│   ├── sections/               # landing sections (HeroV2V, RoadmapSection, TeamSection, …)
│   ├── components/
│   │   ├── Nav.tsx · layout/Footer.tsx
│   │   ├── anim/               # ScrollProgress, RevealOnScroll, PointerFX
│   │   └── ui/                 # Button, GlassCard
│   ├── lib/                    # v2vSim.ts (live simulation), nav, utils
│   └── hooks/
├── next.config.js              # static export → dist/
├── tailwind.config.js
└── vercel.json
```

---

## Getting started

**Prerequisites:** Node.js 18+ and npm.

```bash
# 1. install dependencies
npm install

# 2. run the dev server  →  http://localhost:3000
npm run dev

# 3. production build (static export to ./dist)
npm run build

# 4. lint
npm run lint
```

> **Contributor note:** dev and the export build share the same output directory (`distDir: 'dist'`). **Stop the dev server before running `npm run build`** — running both at once corrupts `dist/` and the dev server starts throwing `require is not defined`. If that happens: stop dev → `rm -rf dist` → restart `npm run dev`.

## Deployment

The site is a static export hosted on **Vercel**. `vercel.json` enables `cleanUrls`, so routes like `/product` and `/docs` resolve without a trailing `.html`. Pushing to `main` triggers an automatic redeploy.

The floating chatbot (`src/components/Chatbot.tsx`) calls `/api/chat`, a standalone Vercel serverless function (`api/chat.js`, kept outside `src/app` since Next's own API routes aren't buildable under `output: 'export'`). It holds the Groq API key server-side — set `GROQ_API_KEY` (no `NEXT_PUBLIC_` prefix) in the Vercel project's Environment Variables. See `.env.example`. Without it configured, the function returns 503 and the widget falls back to a local, rule-based responder. `next dev` does not serve `/api/*`; use `vercel dev` to exercise the live path locally.

---

## Team

| Role | Name |
|---|---|
| CEO · Chief Systems Architect | **Hruday** — vision, protocol architecture, partnerships, standardization roadmap |
| CTO · Computer Science | **Nikhil** — prediction engine, simulation environment, V2V messaging intelligence |
| CPO · Mechanical Engineering | **Krishna** — hardware feasibility, integration, real-vehicle interfacing |
| Chief Development Officer | **Shreyas** — RandomForest decision models and real-time inference |
| Mentor | **Harish** |

**Advisors & mentors:** Harsirjan Kour (PedalStart), Sayanee Bhowmik (ex-VC), Debasis Chakraborty (CEO, Dariaan Consulting), and industry input from Simple Energy.

## Roadmap

| Status | Milestone |
|---|---|
| ✅ Shipped | Ideation & concept validation |
| ✅ Shipped | Strategic mentorship (PedalStart, NMIT) |
| ✅ Shipped | Autonomous Stack v1.0 |
| ✅ Shipped | AIR 5 · IIT Delhi |
| 🔵 In progress | Alpha Pilot Program — OEM integration & hardware-in-the-loop (Q3 2026) |
| ⬜ Planned | Decentralized Data Node v1 (Q4 2026) |
| ⬜ Planned | DRV Token Protocol Audit (Q1 2027) |
| ⬜ Planned | Cross-OEM Standardization (Nov 2027) |

## Vision

DriveLink aims to become the **universal V2V communication standard** for vehicles worldwide — the cooperative intelligence layer for safer, smoother, more efficient mobility.

---

## Contact

- **Email:** [tech.drivelink@gmail.com](mailto:tech.drivelink@gmail.com)
- **Web:** [drivelink.tech](https://www.drivelink.tech)

## License

To be finalised based on deployment and commercialization strategy. © DriveLink. All rights reserved.

## Development

```bash
npm ci
npm run dev          # local dev server
npm run lint         # eslint over src/, api/, tests/
npm run typecheck    # tsc --noEmit
npm test             # vitest, once
npm run test:watch   # vitest, watching
npm run build        # static export into dist/
npm run audit:ui     # browser audit of dist/ (see below)
```

CI runs lint, typecheck, tests, and build on every push and pull request to
`main`.

### Tests

`tests/` covers the logic that has no other safety net:

| File | What it protects |
| --- | --- |
| `applicantValidation.test.ts` | The hiring form's input rules. Weighted toward *false rejection* — a real candidate told their own name isn't a name is far worse than a junk row we can delete. |
| `v2vSim.test.ts` | The hero/product traffic model. Runs thousands of seeded frames and asserts no car leaves the road, reverses, or drives through another — plus the on-ramp claim the simulation exists to make. |
| `chatApi.test.ts` | `api/chat.js` — method and input validation, history sanitising, the rate limiter, and that upstream failures become a 502 without leaking the key. |
| `seo.test.ts` | That every route ships a complete `openGraph`/`twitter` object. Next.js does not deep-merge these between layout and page, and the failure is silent. |
| `chatFormat.test.ts` | The assistant's message formatter. Its output goes through `dangerouslySetInnerHTML` and its input is a language model's reply, so the tests are mostly adversarial — script tags, attribute break-outs, `javascript:` and protocol-relative link targets. |

`Math.random` is stubbed with a small LCG wherever the simulation is under
test, so "run 2000 frames and assert nothing broke" is reproducible rather than
a flake generator.

### UI audit

```bash
npm run build && npm run audit:ui
```

Loads every route in headless Chromium at 390, 768 and 1280px and fails on
three classes of defect that nothing else in this repo can see, because each
one only exists once CSS has been applied to real text at a real width:

- **Text contrast below WCAG AA.** The background is taken as the most common
  pixel colour inside each element's box rather than by walking computed
  `backgroundColor` up the tree — that walk gets gradients, background images
  and the dark bands wrong, and reports white-on-white for everything in the
  footer.
- **Heading structure.** Exactly one `<h1>` per page, no skipped levels.
- **Layout overflow.** Page-level horizontal scroll, text clipped by its own
  box, and content past the right edge with nothing to scroll it into view.
  Deliberate cases — screen-reader-only text, the masked hero marquee, fixed
  overlays, decorative overhang — are excluded.
- **Internal links.** Every same-origin `href` on the site is fetched against
  the served build; a typo'd path renders fine and 404s only when clicked.
- **ARIA wiring**, which only exists once the page is rendered: every
  `aria-describedby` / `aria-labelledby` / `label[for]` resolves to a real
  element, no duplicate ids (a duplicate silently breaks every reference to
  it), every visible control has an accessible name, every `<img>` declares
  `alt`, and `<html>` has `lang`.

It sees each page in its **default state only** — an error message that renders
after a failed submit, or the chat panel's dialog wiring, is outside what it can
reach. Check those by hand when you touch them.

It needs a Chromium binary: set `CHROMIUM_PATH`, or run
`npx playwright install chromium` once. It is not wired into CI, which has no
browser; run it after any change to `globals.css` or to page structure.

Every finding it reports was a real defect the first time it ran — including
the mesh toggles overlapping the Lanes label on a phone, the docs feature tables
having their last column cut off with no way to reach it, and the simulation's
three sliders having no labels at all.
