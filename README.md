<div align="center">

# DriveLink

### The Decentralized Backbone for Automotive AI

Vehicles can already *see*. **DriveLink lets them speak** — broadcasting intent and predicted motion to nearby cars in **under 50 ms**, so traffic reacts *before* danger appears instead of after.

[![Website](https://img.shields.io/badge/live-drivelink.tech-0F4C81)](https://drivelink.tech)
[![Next.js](https://img.shields.io/badge/Next.js-15-000000?logo=nextdotjs)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Deploy](https://img.shields.io/badge/deploy-Vercel-000000?logo=vercel)](https://vercel.com)

[Website](https://drivelink.tech) · [Product](https://drivelink.tech/product) · [Docs](https://drivelink.tech/docs) · [Team](https://drivelink.tech/team) · [Investors](https://drivelink.tech/investors)

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

This repo is the **official DriveLink marketing website** — a statically-exported Next.js app deployed at [drivelink.tech](https://drivelink.tech). It presents the product, the origin story, the team, and the roadmap, and features a **live in-browser V2V traffic simulation** in the hero (car-following, negotiated lane changes, and real-time V2V link rendering).

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
- **Web:** [drivelink.tech](https://drivelink.tech)

## License

To be finalised based on deployment and commercialization strategy. © DriveLink. All rights reserved.
