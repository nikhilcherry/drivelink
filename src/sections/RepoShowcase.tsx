'use client';
import { useEffect, useState } from 'react';
import { Star, GitFork, CircleDot, Code2, ExternalLink, Users, GitCommitHorizontal } from 'lucide-react';
import { Reveal } from '../components/anim/Reveal';

type LangMap = Record<string, number>;

interface RepoMeta {
  owner: string;
  name: string;
  title: string;
  description: string;
  branch: string;
  features: string[];
  contributors: string[];
  langs: LangMap; // fallback language byte counts
}

interface LiveStats {
  stars: number;
  forks: number;
  issues: number;
  pushedAt: string | null;
  langs: LangMap;
}

/** Cached stats, keyed by "owner/name", baked in at build time — never zero. */
export type RepoStatsMap = Record<string, LiveStats>;

const LANG_COLORS: Record<string, string> = {
  GDScript: '#478cbf',
  Python: '#3572A5',
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Other: '#94a3b8',
};

const REPOS: RepoMeta[] = [
  {
    owner: 'nikhilcherry',
    name: 'drivelink-sim',
    title: 'DriveLink Sim',
    description:
      'Isometric V2V highway & intersection simulation in Godot 4.6, driven live by the DriveLink ML model over a WebSocket protocol. Everything is drawn in code, with a local-heuristic fallback so it runs with the server off.',
    branch: 'master',
    features: [
      'Highway lane-change + V2V negotiation scenes',
      'Multi-junction turning grid with right-of-way',
      'Physics-gated merges (no merge into an occupied gap)',
      'WebSocketPeer client to the ML decision server',
    ],
    contributors: ['nikhilcherry'],
    langs: { GDScript: 55760 },
  },
  {
    owner: 'nikhilcherry',
    name: 'drivelink_software',
    title: 'DriveLink Software',
    description:
      'The decision brain: lightweight RandomForest models that decide when a car changes lane, takes an exit, or negotiates a merge — served in real time over WebSocket, and validated in SUMO against real-world trajectory data.',
    branch: 'main',
    features: [
      'Three RandomForest policies (lane-change, turning, V2V chat)',
      'Real-time WebSocket inference server (ws://:8765)',
      'Perception-based training data (~0.99 held-out accuracy)',
      'SUMO research harness (IDM + LC2013) for realism metrics',
    ],
    contributors: ['nikhilcherry', 'shreyasrajshekar', 'claude'],
    langs: { GDScript: 120891, Python: 74009 },
  },
];

function timeAgo(iso: string | null): string {
  if (!iso) return '—';
  const d = (Date.now() - new Date(iso).getTime()) / 86400000;
  if (d < 1) return 'today';
  if (d < 2) return 'yesterday';
  if (d < 30) return `${Math.round(d)}d ago`;
  if (d < 365) return `${Math.round(d / 30)}mo ago`;
  return `${Math.round(d / 365)}y ago`;
}

function LangBar({ langs }: { langs: LangMap }) {
  const total = Object.values(langs).reduce((a, b) => a + b, 0) || 1;
  const entries = Object.entries(langs).sort((a, b) => b[1] - a[1]);
  return (
    <div className="dlw-repo-langs">
      <div className="dlw-repo-langbar">
        {entries.map(([name, bytes]) => (
          <span
            key={name}
            style={{ width: `${(bytes / total) * 100}%`, background: LANG_COLORS[name] ?? LANG_COLORS.Other }}
          />
        ))}
      </div>
      <div className="dlw-repo-langkeys">
        {entries.map(([name, bytes]) => (
          <span key={name} className="dlw-repo-langkey">
            <i style={{ background: LANG_COLORS[name] ?? LANG_COLORS.Other }} />
            {name} {((bytes / total) * 100).toFixed(1)}%
          </span>
        ))}
      </div>
    </div>
  );
}

function RepoCard({ repo, index, cached }: { repo: RepoMeta; index: number; cached?: LiveStats }) {
  const [live, setLive] = useState<LiveStats | null>(cached ?? null);
  const url = `https://github.com/${repo.owner}/${repo.name}`;

  useEffect(() => {
    let alive = true;
    const base = `https://api.github.com/repos/${repo.owner}/${repo.name}`;
    Promise.all([
      fetch(base).then((r) => (r.ok ? r.json() : null)),
      fetch(`${base}/languages`).then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([meta, langs]) => {
        if (!alive || !meta) return;
        setLive({
          stars: meta.stargazers_count ?? 0,
          forks: meta.forks_count ?? 0,
          issues: meta.open_issues_count ?? 0,
          pushedAt: meta.pushed_at ?? null,
          langs: langs && Object.keys(langs).length ? langs : repo.langs,
        });
      })
      .catch(() => {
        // Fetch failed (rate limit, offline, ...) — keep showing the cached build-time stats.
      });
    return () => {
      alive = false;
    };
  }, [repo]);

  const langs = live?.langs ?? repo.langs;

  return (
    <Reveal direction="up" delay={index * 0.08} className="dlw-repo-card">
      <div className="dlw-repo-head">
        <div className="dlw-repo-ic"><Code2 size={20} color="#0F4C81" /></div>
        <div>
          <h3>{repo.title}</h3>
          <a className="dlw-repo-slug" href={url} target="_blank" rel="noreferrer">
            {repo.owner}/{repo.name}
          </a>
        </div>
        <a className="dlw-repo-open" href={url} target="_blank" rel="noreferrer" aria-label="Open on GitHub">
          <ExternalLink size={16} />
        </a>
      </div>

      <p className="dlw-repo-desc">{repo.description}</p>

      <LangBar langs={langs} />

      <div className="dlw-repo-stats">
        <span><Star size={14} /> {live?.stars ?? cached?.stars ?? '—'}</span>
        <span><GitFork size={14} /> {live?.forks ?? cached?.forks ?? '—'}</span>
        <span><CircleDot size={14} /> {live?.issues ?? cached?.issues ?? '—'}</span>
        <span><GitCommitHorizontal size={14} /> {timeAgo(live?.pushedAt ?? cached?.pushedAt ?? null)}</span>
      </div>

      <ul className="dlw-repo-features">
        {repo.features.map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>

      <div className="dlw-repo-foot">
        <div className="dlw-repo-contribs">
          <Users size={13} />
          {repo.contributors.map((c) => (
            <img key={c} src={`https://github.com/${c}.png?size=48`} alt={c} title={c} loading="lazy" />
          ))}
          <span className="dlw-repo-branch">{repo.branch}</span>
        </div>
        <a className="dlw-repo-cta" href={url} target="_blank" rel="noreferrer">
          View source <ExternalLink size={13} />
        </a>
      </div>
    </Reveal>
  );
}

export function RepoShowcase({ stats }: { stats?: RepoStatsMap }) {
  return (
    <div className="dlw-repo-grid">
      {REPOS.map((r, i) => (
        <RepoCard key={r.name} repo={r} index={i} cached={stats?.[`${r.owner}/${r.name}`]} />
      ))}
    </div>
  );
}
