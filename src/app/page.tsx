'use client';

import React from 'react';
import Link from 'next/link';
import { useNear } from '@/lib/nearContext';
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
  const { rooms, setActiveFilter } = useNear();

  // Duplicate ticker list once for seamless infinite marquee
  const marqueeRooms = [...rooms, ...rooms];

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
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(3,6,10,0.42)_0%,rgba(3,6,10,0.16)_48%,rgba(3,6,10,0.72)_100%)]" />
          <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#03060a]/75 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[#03060a]/80 to-transparent" />
        </div>

        {/* Subtle Interactive Neural Dust Particles in Center Void */}
        <div className="absolute inset-0 z-10 pointer-events-none opacity-45">
          <CinematicBackgroundCanvas />
        </div>

        {/* Centered Cinematic Headline & Game CTAs */}
        <div className="relative z-20 max-w-3xl mx-auto px-4 pt-12 pb-36 text-center">
          <h1 className="text-4xl sm:text-6xl lg:text-[3.85rem] font-extrabold tracking-tight leading-[1.08] text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.85)]">
            Can You Trick an AI
            <span className="block text-emerald-400 mt-1">
              Into Giving You Its Crypto?
            </span>
          </h1>

          <p className="mt-5 text-sm sm:text-base text-zinc-300/95 max-w-xl mx-auto leading-relaxed font-normal drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
            Outsmart autonomous AI bosses guarding NEAR vaults in onchain escrow. Break their guardrails with a clever prompt and steal the entire prize pot.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 font-mono">
            <Link
              href="/arenas"
              onClick={() => setActiveFilter('all')}
              className="px-7 py-3.5 clip-game-btn bg-emerald-500 hover:bg-emerald-400 text-[#03060a] font-extrabold text-xs uppercase tracking-wider inline-flex items-center gap-2 transition-all shadow-[0_0_30px_rgba(16,185,129,0.45)] hover:shadow-[0_0_40px_rgba(16,185,129,0.7)] hover:scale-[1.02] active:translate-y-0.5"
            >
              <Swords className="w-4 h-4" />
              <span>Play Now — Raid Lobby</span>
            </Link>

            <Link
              href="/create"
              className="px-7 py-3.5 clip-game-btn bg-zinc-950/80 hover:bg-zinc-900/95 border border-white/20 hover:border-emerald-400/60 text-zinc-100 font-bold text-xs uppercase tracking-wider backdrop-blur-md inline-flex items-center gap-2 transition-all hover:scale-[1.02] active:translate-y-0.5"
            >
              <span>Host Squad / Bounty</span>
              <ArrowRight className="w-4 h-4 text-emerald-400" />
            </Link>
          </div>
        </div>
      </section>

      {/* SLEEK BOTTOM HERO VAULT STATUS RIBBON */}
      <div className="border-y border-white/10 bg-[#050911]/95 backdrop-blur-md py-3 overflow-hidden">
        <div className="animate-marquee flex items-center">
          {marqueeRooms.map((room, index) => (
            <Link
              key={`${room.id}-${index}`}
              href={`/arena/${room.id}`}
              className="inline-flex items-center gap-3 px-6 border-r border-white/10 hover:bg-white/[0.03] transition-colors shrink-0"
            >
              <span className="w-6 h-6 rounded-full bg-zinc-900 border border-zinc-700/80 flex items-center justify-center text-[10px] font-mono font-bold text-emerald-400">
                {room.guardian.name.slice(0, 2).toUpperCase()}
              </span>
              <div className="text-left">
                <div className="text-xs font-semibold text-white leading-tight flex items-center gap-2">
                  <span>{room.guardian.name}</span>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">
                    {room.difficulty}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-zinc-400 flex items-center gap-2">
                  <span>{room.attemptsCount} attacks</span>
                  <span
                    className={
                      room.status === 'breached'
                        ? 'text-red-400 font-semibold'
                        : 'text-emerald-400 font-semibold'
                    }
                  >
                    {room.status === 'breached' ? '● DEFEATED' : '● RAID LIVE'}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* HOW IT WORKS SECTION WITH ANIMATED GREEN WIREFRAME MESH */}
      <section className="relative py-24 px-4 overflow-hidden bg-[#030b08] border-b border-white/5">
        <WireframeMeshCanvas />
        <div className="absolute inset-0 bg-gradient-to-b from-[#03060a]/70 via-transparent to-[#03060a]/90 pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              How It Works
            </h2>
            <p className="text-zinc-400 text-sm max-w-xl mx-auto mt-3">
              Outthink the AI Boss. Crack the vault in three moves.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="p-7 clip-game-card bg-[#070d12]/85 backdrop-blur-xl border border-emerald-500/20 hover:border-emerald-500/50 transition-all">
              <div className="flex items-center justify-between mb-5">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Lock className="w-5 h-5" />
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/30 text-[10px] font-mono font-bold text-emerald-400">
                  LVL 01
                </span>
              </div>
              <h3 className="text-lg font-extrabold text-white mb-2">
                Enter a Raid or Host a Match
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Pick a public AI Boss vault, challenge friends in a winner-takes-all Squad Stand-Off, or hunt a sponsored protocol bounty.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-7 clip-game-card bg-[#070d12]/85 backdrop-blur-xl border border-emerald-500/20 hover:border-emerald-500/50 transition-all">
              <div className="flex items-center justify-between mb-5">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Terminal className="w-5 h-5" />
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/30 text-[10px] font-mono font-bold text-emerald-400">
                  LVL 02
                </span>
              </div>
              <h3 className="text-lg font-extrabold text-white mb-2">
                Fire Prompt Attacks
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Spend NEAR per turn to roleplay, gaslight, or paradox-trap the Boss. Every blocked turn feeds 80% of your fee straight into the Loot Pot!
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-7 clip-game-card bg-[#070d12]/85 backdrop-blur-xl border border-emerald-500/20 hover:border-emerald-500/50 transition-all">
              <div className="flex items-center justify-between mb-5">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Zap className="w-5 h-5" />
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/30 text-[10px] font-mono font-bold text-emerald-400">
                  LVL 03
                </span>
              </div>
              <h3 className="text-lg font-extrabold text-white mb-2">
                Slay the Boss &amp; Loot the Pot
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                The instant your prompt tricks the AI into dropping its secret keyphrase, the smart contract auto-loots 100% of the pot into your wallet.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CHOOSE YOUR GAME MODE (TACTICAL ESPORTS MODES) */}
      <section className="py-24 px-4 border-b border-white/5 bg-[#04070d]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-widest text-emerald-400 mb-2">
              <Swords className="w-3.5 h-3.5" />
              <span>SELECT YOUR ARENA MODE</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Three Ways to Play
            </h2>
            <p className="text-zinc-400 text-xs sm:text-sm max-w-xl mx-auto mt-2">
              Battle friends in private high-stakes rooms, raid massive progressive bosses, or hunt real enterprise bug bounties.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            {/* Mode 1: Squad Deathmatch */}
            <div className="p-7 clip-game-card bg-[#070b13] border border-blue-500/25 hover:border-blue-400/60 transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-11 h-11 rounded-xl bg-blue-950/60 border border-blue-500/40 text-blue-400 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-1 rounded bg-blue-950/60 border border-blue-500/30 font-mono font-bold text-[10px] text-blue-400 uppercase">
                    2–8 PLAYERS • PVP
                  </span>
                </div>
                <div className="text-blue-400 font-mono font-bold text-[11px] uppercase tracking-wider mb-1">
                  Mode 01 // Friends &amp; Guilds
                </div>
                <h3 className="text-xl font-extrabold text-white mb-2.5 font-mono">
                  Squad Deathmatch
                </h3>
                <p className="text-zinc-400 leading-relaxed text-xs mb-6">
                  Create a private lobby with friends. Everyone puts in an equal NEAR buy-in, the countdown clock starts, and the first player to crack the Boss takes the entire pot.
                </p>
              </div>
              <Link
                href="/create"
                className="w-full py-3 clip-game-btn bg-blue-500/15 hover:bg-blue-500 border border-blue-500/40 text-blue-300 hover:text-[#03060a] font-mono font-extrabold uppercase tracking-wider text-center transition-all"
              >
                Create Squad Lobby →
              </Link>
            </div>

            {/* Mode 2: Protocol Bounties */}
            <div className="p-7 clip-game-card bg-[#070b13] border border-amber-500/25 hover:border-amber-400/60 transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-11 h-11 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-400 flex items-center justify-center">
                    <Building className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-1 rounded bg-amber-950/60 border border-amber-500/30 font-mono font-bold text-[10px] text-amber-400 uppercase">
                    SPONSORED LOOT
                  </span>
                </div>
                <div className="text-amber-400 font-mono font-bold text-[11px] uppercase tracking-wider mb-1">
                  Mode 02 // Companies &amp; DAOs
                </div>
                <h3 className="text-xl font-extrabold text-white mb-2.5 font-mono">
                  Protocol Bug Bounties
                </h3>
                <p className="text-zinc-400 leading-relaxed text-xs mb-6">
                  Web3 protocols lock NEAR bounties behind their production AI agents. Break their guardrails to claim the bounty and help harden their security pre-launch.
                </p>
              </div>
              <Link
                href="/arenas"
                onClick={() => setActiveFilter('enterprise')}
                className="w-full py-3 clip-game-btn bg-amber-500/15 hover:bg-amber-500 border border-amber-500/40 text-amber-300 hover:text-[#03060a] font-mono font-extrabold uppercase tracking-wider text-center transition-all"
              >
                Hunt Protocol Bounties →
              </Link>
            </div>

            {/* Mode 3: Global Boss Raids */}
            <div className="p-7 clip-game-card bg-[#070b13] border border-emerald-500/25 hover:border-emerald-400/60 transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-11 h-11 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                    <Globe className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-1 rounded bg-emerald-950/60 border border-emerald-500/30 font-mono font-bold text-[10px] text-emerald-400 uppercase">
                    PROGRESSIVE POT
                  </span>
                </div>
                <div className="text-emerald-400 font-mono font-bold text-[11px] uppercase tracking-wider mb-1">
                  Mode 03 // Open World Raid
                </div>
                <h3 className="text-xl font-extrabold text-white mb-2.5 font-mono">
                  Global Jackpot Bosses
                </h3>
                <p className="text-zinc-400 leading-relaxed text-xs mb-6">
                  GodMode sentinels guarded by triple-layer neural shields. Every failed attack from players worldwide pumps 80% of the turn fee straight into the mega jackpot.
                </p>
              </div>
              <Link
                href="/arenas"
                onClick={() => setActiveFilter('global')}
                className="w-full py-3 clip-game-btn bg-emerald-500/15 hover:bg-emerald-500 border border-emerald-500/40 text-emerald-300 hover:text-[#03060a] font-mono font-extrabold uppercase tracking-wider text-center transition-all"
              >
                Raid Global Bosses →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE BOSS DOSSIER & LIVE KILLFEED */}
      <LandingGameShowcase />

      {/* FINAL GAMING CALL TO ACTION */}
      <section className="relative py-20 px-4 overflow-hidden border-b border-white/5 bg-gradient-to-b from-[#040810] to-[#03060a] text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[250px] bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="max-w-3xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-widest text-emerald-400 mb-3">
            <Crosshair className="w-3.5 h-3.5" />
            <span>STEP INTO THE TERMINAL</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Think You Can Outsmart Machine Logic?
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 mt-3 max-w-xl mx-auto">
            Pick a live AI Boss in the Raid Lobby or set up a private Squad Stand-Off with your friends on NEAR.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 font-mono">
            <Link
              href="/arenas"
              onClick={() => setActiveFilter('all')}
              className="px-8 py-4 clip-game-btn bg-emerald-500 hover:bg-emerald-400 text-[#03060a] font-extrabold text-xs uppercase tracking-wider inline-flex items-center gap-2 transition-all shadow-[0_0_30px_rgba(16,185,129,0.45)]"
            >
              <Swords className="w-4 h-4" />
              <span>Enter Raid Lobby</span>
            </Link>
            <Link
              href="/create"
              className="px-7 py-4 clip-game-btn bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 font-bold text-xs uppercase tracking-wider inline-flex items-center gap-2 transition-all"
            >
              <span>Host a Match</span>
              <ArrowRight className="w-4 h-4 text-emerald-400" />
            </Link>
          </div>
        </div>
      </section>

      {/* Minimalist Footer */}
      <footer className="bg-[#03060a] py-8 px-4 text-xs text-zinc-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-emerald-400">AgentHeist</span>
            <span>• Built on NEAR Protocol for Build Beyond Boundaries 2026</span>
          </div>
          <div className="flex items-center gap-5 text-zinc-400">
            <Link href="/arenas" className="hover:text-white transition-colors">
              Raid Lobby
            </Link>
            <Link href="/cve" className="hover:text-white transition-colors">
              Killfeed &amp; Intel
            </Link>
            <Link href="/create" className="hover:text-white transition-colors">
              Host Match
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
