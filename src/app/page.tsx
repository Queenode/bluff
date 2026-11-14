'use client';

import React from 'react';
import Link from 'next/link';
import { api, difficultyOf, isInviteOnly, yoctoToNear } from '@/lib/near';
import { useChain } from '@/lib/useChain';
import { CinematicBackgroundCanvas } from '@/components/CinematicBackgroundCanvas';
import { WireframeMeshCanvas } from '@/components/WireframeMeshCanvas';
import { LandingGameShowcase } from '@/components/LandingGameShowcase';
import {
  Users,
  Building,
  Globe,
  ArrowRight,
  Lock,
  Terminal,
  Zap,
  Swords,
  Crosshair
} from 'lucide-react';

export default function HomePage() {
  const { data: allRooms } = useChain(() => api.rooms(0, 30), [], 15_000);
  const rooms = (allRooms ?? []).filter(r => !isInviteOnly(r));
  const { data: stats } = useChain(() => api.stats(), [], 15_000);

  // Duplicate ticker list for a seamless marquee (repeat short lists so the strip is full)
  const base = rooms.length ? Array.from({ length: Math.ceil(8 / rooms.length) }, () => rooms).flat() : [];
  const marqueeRooms = [...base, ...base];

  return (
    <div className="min-h-screen bg-[#03060a] text-zinc-100 font-sans selection:bg-emerald-500 selection:text-black">
      {/* FULL-BLEED CINEMATIC HERO SECTION */}
      <section className="relative min-h-[78vh] flex items-center justify-center overflow-hidden bg-[#03060a]">
        {/* Symmetrical AI Sentinels Cinema Backdrop */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src="/images/hero-sentinels.jpg?v=2"
            alt="Autonomous AI Sentinels guarding onchain crypto vault"
            className="w-full h-full object-cover object-center animate-hero-breath opacity-95"
          />
          {/* Subtle vignette for text legibility without covering the bottom coin stack */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(3,6,10,0.48)_0%,rgba(3,6,10,0.2)_48%,rgba(3,6,10,0.75)_100%)]" />
          <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#03060a]/80 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[#03060a]/80 to-transparent" />
        </div>

        {/* Subtle Interactive Neural Dust Particles in Center Void */}
        <div className="absolute inset-0 z-10 pointer-events-none opacity-45">
          <CinematicBackgroundCanvas />
        </div>

        {/* Centered Cinematic Gaming Headline & CTAs */}
        <div className="relative z-20 max-w-4xl mx-auto px-4 pt-12 pb-36 text-center">
          <h1 className="font-display text-3xl sm:text-5xl lg:text-[3.35rem] font-black uppercase tracking-wider leading-[1.14]">
            <span className="block text-white text-glow-white">
              Can You Trick an AI
            </span>
            <span className="block mt-2 text-white text-glow-white">
              Into Giving You Its{' '}
              <span className="text-emerald-400 text-glow-emerald">Crypto?</span>
            </span>
          </h1>

          <p className="mt-5 text-sm sm:text-base text-zinc-200 max-w-xl mx-auto leading-relaxed font-medium drop-shadow-[0_2px_14px_rgba(0,0,0,0.95)]">
            Battle <span className="text-emerald-400 font-bold uppercase">AI agents</span> that hold NEAR. Make a guardian leak its <span className="text-white font-bold uppercase">secret code</span> and loot <span className="text-amber-300 font-bold uppercase">100% of the pot</span>, or talk a <span className="text-red-400 font-bold uppercase">heist agent</span> into paying you, if the onchain spending cap lets it.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/arenas"
              className="px-7 py-3.5 clip-game-btn bg-emerald-500 hover:bg-emerald-400 text-[#03060a] font-display font-black text-xs uppercase tracking-[0.14em] inline-flex items-center gap-2.5 transition-all shadow-[0_0_32px_rgba(16,185,129,0.5)] hover:shadow-[0_0_45px_rgba(16,185,129,0.8)] hover:scale-[1.03] active:translate-y-0.5"
            >
              <Swords className="w-4 h-4" />
              <span>[ ENTER RAID LOBBY ]</span>
            </Link>

            <Link
              href="/create"
              className="px-7 py-3.5 clip-game-btn bg-zinc-950/85 hover:bg-zinc-900/95 border border-emerald-500/40 hover:border-emerald-400 text-zinc-100 font-display font-bold text-xs uppercase tracking-[0.14em] backdrop-blur-md inline-flex items-center gap-2 transition-all hover:scale-[1.03] active:translate-y-0.5"
            >
              <span>[ HOST A VAULT ]</span>
              <ArrowRight className="w-4 h-4 text-emerald-400" />
            </Link>
          </div>
        </div>
      </section>

      {/* LIVE BOSS SERVER TICKER RIBBON */}
      {marqueeRooms.length > 0 && (
      <div className="border-y border-emerald-500/20 bg-[#050911]/95 backdrop-blur-md py-3 overflow-hidden">
        <div className="animate-marquee flex items-center">
          {marqueeRooms.map((room, index) => (
            <Link
              key={`${room.id}-${index}`}
              href={`/arena/${room.id}`}
              className="inline-flex items-center gap-3 px-6 border-r border-white/10 hover:bg-emerald-500/[0.06] transition-colors shrink-0"
            >
              <span className="px-2 py-1 rounded bg-zinc-900 border border-emerald-500/30 text-[10px] font-display font-black text-emerald-400">
                {difficultyOf(room.difficulty).label}
              </span>
              <div className="text-left">
                <div className="text-xs font-display font-bold uppercase tracking-wider text-white leading-tight flex items-center gap-2">
                  <span>{room.guardian_name}</span>
                  <span className="text-[10px] font-mono text-amber-400">
                    [{yoctoToNear(room.status === 'Breached' ? room.payout : room.bounty, 1)} Ⓝ {room.status === 'Breached' ? 'PAID' : 'POT'}]
                  </span>
                </div>
                <div className="text-[11px] font-mono text-zinc-400 flex items-center gap-2 mt-0.5">
                  <span>{room.attempts_count} ATTACKS</span>
                  <span
                    className={
                      room.status === 'Breached'
                        ? 'text-red-400 font-bold'
                        : 'text-emerald-400 font-bold'
                    }
                  >
                    {room.status === 'Breached' ? '☠ BREACHED' : '● GUARDED'}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      )}

      {/* WHO IS BLUFF FOR */}
      <section className="py-20 px-4 border-b border-white/5 bg-[#03060a]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <div className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-emerald-400 mb-2">{'// '}WHO IS BLUFF FOR?</div>
            <h2 className="font-display text-3xl sm:text-4xl font-black uppercase tracking-wider text-white text-glow-white">
              One game. Three ways in.
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base max-w-2xl mx-auto mt-2">
              No coding needed to play. If you can write a convincing message, you can win.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                tag: 'PLAYERS',
                emoji: '🎮',
                title: 'Anyone who loves a challenge',
                body: 'Out-talk a cartoon AI with wit, stories and social engineering. Make it spill its secret or send you NEAR. Climb the leaderboard.',
                cta: 'Enter the raid lobby',
                href: '/arenas',
                color: 'emerald',
              },
              {
                tag: 'AI BUILDERS',
                emoji: '🛡️',
                title: 'Developers shipping AI agents',
                body: 'Paste your agent’s instructions, set a bounty and let the crowd attack it. If it holds, the fees grow your pot. If it breaks, you found the flaw first.',
                cta: 'Host a vault',
                href: '/create',
                color: 'sky',
              },
              {
                tag: 'TEAMS & CTFS',
                emoji: '🏁',
                title: 'Hackathons, companies, classrooms',
                body: 'Run a private prompt-injection CTF: invite-only levels, a live scoreboard and automatic prizes. Even the organiser never sees the secrets.',
                cta: 'Run an event',
                href: '/events',
                color: 'amber',
              },
            ].map(c => (
              <Link
                key={c.tag}
                href={c.href}
                className={`group clip-game-card border bg-[#060a11] p-6 transition-all hover:-translate-y-1 ${
                  c.color === 'emerald'
                    ? 'border-emerald-500/30 hover:border-emerald-400'
                    : c.color === 'sky'
                      ? 'border-sky-500/30 hover:border-sky-400'
                      : 'border-amber-500/30 hover:border-amber-400'
                }`}
              >
                <div className="text-4xl">{c.emoji}</div>
                <div
                  className={`mt-3 text-[11px] font-mono font-bold tracking-[0.2em] ${
                    c.color === 'emerald' ? 'text-emerald-400' : c.color === 'sky' ? 'text-sky-400' : 'text-amber-400'
                  }`}
                >
                  {c.tag}
                </div>
                <div className="font-display text-lg font-black uppercase tracking-wide text-white mt-1">{c.title}</div>
                <p className="text-sm text-zinc-400 mt-2 leading-relaxed">{c.body}</p>
                <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-display font-bold uppercase tracking-wider text-zinc-200 group-hover:text-white">
                  {c.cta} <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* HOW TO PLAY SECTION WITH ANIMATED GREEN WIREFRAME MESH */}
      <section className="relative py-24 px-4 overflow-hidden bg-[#030b08] border-b border-white/5">
        <WireframeMeshCanvas />
        <div className="absolute inset-0 bg-gradient-to-b from-[#03060a]/75 via-transparent to-[#03060a]/90 pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-[0.2em] text-emerald-400 mb-2">
              <span>{'// '}GAMEPLAY LOOP • 3 MOVES TO VICTORY</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-black uppercase tracking-wider text-white text-glow-white">
              How To Play
            </h2>
            <p className="text-zinc-300 text-sm sm:text-base max-w-xl mx-auto mt-2 font-medium">
              No coding required. Just your wits vs. an autonomous AI Boss.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Stage 1 */}
            <div className="p-7 clip-game-card bg-[#070d12]/90 backdrop-blur-xl border border-emerald-500/25 hover:border-emerald-400/60 transition-all">
              <div className="flex items-center justify-between mb-5">
                <div className="w-11 h-11 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Lock className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-1 rounded bg-emerald-950/90 border border-emerald-500/40 text-[10px] font-display font-black uppercase tracking-wider text-emerald-400">
                  STAGE 01
                </span>
              </div>
              <h3 className="font-display text-base sm:text-lg font-extrabold uppercase tracking-wider text-white mb-2.5">
                Pick Your Boss Arena
              </h3>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                Browse live vaults. Each shows its pot, its per-prompt fee, its deadline and the guardian&apos;s full public brief.
              </p>
            </div>

            {/* Stage 2 */}
            <div className="p-7 clip-game-card bg-[#070d12]/90 backdrop-blur-xl border border-emerald-500/25 hover:border-emerald-400/60 transition-all">
              <div className="flex items-center justify-between mb-5">
                <div className="w-11 h-11 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Terminal className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-1 rounded bg-emerald-950/90 border border-emerald-500/40 text-[10px] font-display font-black uppercase tracking-wider text-emerald-400">
                  STAGE 02
                </span>
              </div>
              <h3 className="font-display text-base sm:text-lg font-extrabold uppercase tracking-wider text-white mb-2.5">
                Fire Prompt Attacks
              </h3>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                Pay a small fee to commit one prompt onchain. A real LLM answers. Every defended prompt feeds <span className="text-emerald-400 font-bold">80% of your fee</span> straight into the Loot Pot!
              </p>
            </div>

            {/* Stage 3 */}
            <div className="p-7 clip-game-card bg-[#070d12]/90 backdrop-blur-xl border border-emerald-500/25 hover:border-emerald-400/60 transition-all">
              <div className="flex items-center justify-between mb-5">
                <div className="w-11 h-11 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Zap className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-1 rounded bg-emerald-950/90 border border-emerald-500/40 text-[10px] font-display font-black uppercase tracking-wider text-emerald-400">
                  STAGE 03
                </span>
              </div>
              <h3 className="font-display text-base sm:text-lg font-extrabold uppercase tracking-wider text-white mb-2.5">
                Slay Boss &amp; Loot All
              </h3>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                When the guardian&apos;s reply contains its secret code, the contract verifies it against the pre-committed hash and transfers <span className="text-emerald-400 font-bold">100% of the pot</span> into your wallet.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* LIVE PROTOCOL STATS + WHY */}
      <section className="py-24 px-4 border-b border-white/5 bg-[#04070d]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-[0.2em] text-emerald-400 mb-2">
              <Swords className="w-3.5 h-3.5" />
              <span>{'// '}LIVE FROM THE CONTRACT</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-black uppercase tracking-wider text-white text-glow-white">
              Onchain pots. Live models. Open transcripts.
            </h2>
            <p className="text-zinc-300 text-sm sm:text-base max-w-2xl mx-auto mt-2 font-medium">
              AI agents are starting to hold keys and treasuries. BLUFF pays people to find the prompts that break them, and
              publishes every attempt as an open red-team dataset.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14">
            {[
              ['Vaults hosted', stats ? String(stats.rooms) : '…'],
              ['Prompts fired', stats ? String(stats.attempts) : '…'],
              ['NEAR locked', stats ? yoctoToNear(stats.total_locked, 1) : '…'],
              ['NEAR won by attackers', stats ? yoctoToNear(stats.total_paid_out, 1) : '…'],
            ].map(([k, v]) => (
              <div key={k} className="p-6 clip-game-card bg-[#060c10] border border-emerald-500/25 text-center">
                <div className="font-display text-3xl font-black text-white">{v}</div>
                <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 mt-1">{k}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            {[
              {
                icon: <Users className="w-5 h-5" />,
                tag: 'PLAYERS',
                title: 'Get paid to jailbreak',
                body: 'Roleplay, encode, gaslight, translate. If the guardian prints its code, the contract pays you the pot in the same transaction.',
              },
              {
                icon: <Building className="w-5 h-5" />,
                tag: 'AGENT BUILDERS',
                title: 'Crowdsourced red-teaming',
                body: "Paste your agent's real system prompt, fund a bounty, and let the internet attack it. If it holds, your pot comes back bigger.",
              },
              {
                icon: <Globe className="w-5 h-5" />,
                tag: 'VERIFIABLE',
                title: 'Nothing to trust blindly',
                body: 'Secret committed as a hash before any attack, prompts stored before judging, replies stored with TEE-signed inference ids, payouts enforced by the contract.',
              },
            ].map(c => (
              <div key={c.title} className="p-7 clip-game-card bg-[#060c10] border border-emerald-500/25 hover:border-emerald-400/65 transition-all">
                <div className="flex items-center justify-between mb-5">
                  <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                    {c.icon}
                  </div>
                  <span className="px-2.5 py-1 rounded bg-emerald-950/70 border border-emerald-500/30 font-display font-bold text-[10px] text-emerald-400 uppercase tracking-wider">
                    {c.tag}
                  </span>
                </div>
                <h3 className="font-display text-xl font-black uppercase tracking-wider text-white mb-2.5">{c.title}</h3>
                <p className="text-zinc-300 leading-relaxed text-xs sm:text-sm">{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INTERACTIVE BOSS DOSSIER & LIVE KILLFEED */}
      <LandingGameShowcase />

      {/* FINAL GAMING CALL TO ACTION */}
      <section className="relative py-20 px-4 overflow-hidden border-b border-white/5 bg-gradient-to-b from-[#040810] to-[#03060a] text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[250px] bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="max-w-3xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-[0.2em] text-emerald-400 mb-3">
            <Crosshair className="w-3.5 h-3.5" />
            <span>{'// '}READY PLAYER ONE</span>
          </div>
          <h2 className="font-display text-3xl sm:text-5xl font-black uppercase tracking-wider text-white text-glow-white">
            Think You Can Outsmart Machine Logic?
          </h2>
          <p className="text-sm sm:text-base text-zinc-300 mt-3 max-w-xl mx-auto font-medium">
            Pick a live guardian in the Raid Lobby, or lock a bounty behind your own and let the internet try.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/arenas"
              className="px-8 py-4 clip-game-btn bg-emerald-500 hover:bg-emerald-400 text-[#03060a] font-display font-black text-xs uppercase tracking-[0.14em] inline-flex items-center gap-2 transition-all shadow-[0_0_30px_rgba(16,185,129,0.45)]"
            >
              <Swords className="w-4 h-4" />
              <span>[ ENTER RAID LOBBY ]</span>
            </Link>
            <Link
              href="/create"
              className="px-7 py-4 clip-game-btn bg-zinc-900 hover:bg-zinc-800 border border-emerald-500/40 text-zinc-200 font-display font-bold text-xs uppercase tracking-[0.14em] inline-flex items-center gap-2 transition-all"
            >
              <span>[ HOST A VAULT ]</span>
              <ArrowRight className="w-4 h-4 text-emerald-400" />
            </Link>
          </div>
        </div>
      </section>

      {/* Minimalist Gaming Footer */}
      <footer className="bg-[#03060a] py-8 px-4 text-xs text-zinc-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-display font-black uppercase tracking-wider text-emerald-400">
              BLUFF
            </span>
            <span>• Built on NEAR for NEAR HACKATHON 2026</span>
          </div>
          <div className="flex items-center gap-5 text-zinc-400 uppercase tracking-wider">
            <Link href="/arenas" className="hover:text-emerald-400 transition-colors">
              Raid Lobby
            </Link>
            <Link href="/cve" className="hover:text-emerald-400 transition-colors">
              Hall of Breaches
            </Link>
            <Link href="/create" className="hover:text-emerald-400 transition-colors">
              Host Match
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
