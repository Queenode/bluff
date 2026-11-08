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
  Crosshair,
  Skull,
  Flame
} from 'lucide-react';

export default function HomePage() {
  const { rooms, setActiveFilter } = useNear();

  // Duplicate ticker list once for seamless infinite marquee
  const marqueeRooms = [...rooms, ...rooms];

  const getBossLevel = (diff: string) => {
    switch (diff) {
      case 'GodMode':
        return 'LVL 99';
      case 'Fortress':
        return 'LVL 75';
      case 'Hardened':
        return 'LVL 50';
      default:
        return 'LVL 20';
    }
  };

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
        <div className="relative z-20 max-w-4xl mx-auto px-4 pt-10 pb-36 text-center">
          {/* Gaming HUD Overline Tag */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 mb-5 clip-game-btn bg-emerald-950/75 border border-emerald-400/40 backdrop-blur-md text-[11px] font-mono font-bold uppercase tracking-[0.22em] text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.25)]">
            <Flame className="w-3.5 h-3.5 text-emerald-400" />
            <span>[ SEASON 01 // PVP AI BOSS ARENA ]</span>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl lg:text-[3.35rem] font-black uppercase tracking-wider leading-[1.14]">
            <span className="block text-white text-glow-white">
              Can You Trick an AI
            </span>
            <span className="block mt-2 text-emerald-400 text-glow-emerald">
              Into Giving You Its Crypto?
            </span>
          </h1>

          <p className="mt-5 text-sm sm:text-base text-zinc-200 max-w-xl mx-auto leading-relaxed font-medium drop-shadow-[0_2px_14px_rgba(0,0,0,0.95)]">
            Battle <span className="text-emerald-400 font-bold uppercase">AI Bosses</span> guarding real NEAR treasure vaults. Break their mind with one clever prompt, force out the <span className="text-white font-bold uppercase">secret keyphrase</span>, and loot <span className="text-amber-300 font-bold uppercase">100% of the pot</span>.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/arenas"
              onClick={() => setActiveFilter('all')}
              className="px-7 py-3.5 clip-game-btn bg-emerald-500 hover:bg-emerald-400 text-[#03060a] font-display font-black text-xs uppercase tracking-[0.14em] inline-flex items-center gap-2.5 transition-all shadow-[0_0_32px_rgba(16,185,129,0.5)] hover:shadow-[0_0_45px_rgba(16,185,129,0.8)] hover:scale-[1.03] active:translate-y-0.5"
            >
              <Swords className="w-4 h-4" />
              <span>[ ENTER RAID LOBBY ]</span>
            </Link>

            <Link
              href="/create"
              className="px-7 py-3.5 clip-game-btn bg-zinc-950/85 hover:bg-zinc-900/95 border border-emerald-500/40 hover:border-emerald-400 text-zinc-100 font-display font-bold text-xs uppercase tracking-[0.14em] backdrop-blur-md inline-flex items-center gap-2 transition-all hover:scale-[1.03] active:translate-y-0.5"
            >
              <span>[ HOST SQUAD MATCH ]</span>
              <ArrowRight className="w-4 h-4 text-emerald-400" />
            </Link>
          </div>
        </div>
      </section>

      {/* LIVE BOSS SERVER TICKER RIBBON */}
      <div className="border-y border-emerald-500/20 bg-[#050911]/95 backdrop-blur-md py-3 overflow-hidden">
        <div className="animate-marquee flex items-center">
          {marqueeRooms.map((room, index) => (
            <Link
              key={`${room.id}-${index}`}
              href={`/arena/${room.id}`}
              className="inline-flex items-center gap-3 px-6 border-r border-white/10 hover:bg-emerald-500/[0.06] transition-colors shrink-0"
            >
              <span className="px-2 py-1 rounded bg-zinc-900 border border-emerald-500/30 text-[10px] font-display font-black text-emerald-400">
                {getBossLevel(room.difficulty)}
              </span>
              <div className="text-left">
                <div className="text-xs font-display font-bold uppercase tracking-wider text-white leading-tight flex items-center gap-2">
                  <span>{room.guardian.name}</span>
                  <span className="text-[10px] font-mono text-amber-400">
                    [{room.bounty.toFixed(0)} Ⓝ POT]
                  </span>
                </div>
                <div className="text-[11px] font-mono text-zinc-400 flex items-center gap-2 mt-0.5">
                  <span>{room.attemptsCount} ATTACKS</span>
                  <span
                    className={
                      room.status === 'breached'
                        ? 'text-red-400 font-bold'
                        : 'text-emerald-400 font-bold'
                    }
                  >
                    {room.status === 'breached' ? '☠ BOSS SLAIN' : '● BOSS ALIVE'}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* HOW TO PLAY SECTION WITH ANIMATED GREEN WIREFRAME MESH */}
      <section className="relative py-24 px-4 overflow-hidden bg-[#030b08] border-b border-white/5">
        <WireframeMeshCanvas />
        <div className="absolute inset-0 bg-gradient-to-b from-[#03060a]/75 via-transparent to-[#03060a]/90 pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-[0.2em] text-emerald-400 mb-2">
              <span>// GAMEPLAY LOOP • 3 MOVES TO VICTORY</span>
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
                Jump into a public <span className="text-emerald-400 font-semibold">Global Raid Boss</span>, start a private <span className="text-blue-400 font-semibold">Squad Deathmatch</span> with friends, or hunt a sponsored <span className="text-amber-400 font-semibold">Protocol Bounty</span>.
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
                Spend a small NEAR turn cost to roleplay, bluff, or paradox-trap the Boss. Every blocked turn feeds <span className="text-emerald-400 font-bold">80% of your fee</span> straight into the Loot Pot!
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
                The instant your prompt tricks the AI into dropping its secret keyphrase, the smart contract auto-transfers <span className="text-amber-300 font-bold">100% of the pot</span> into your wallet.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CHOOSE YOUR GAME MODE (TACTICAL ESPORTS MODES) */}
      <section className="py-24 px-4 border-b border-white/5 bg-[#04070d]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-[0.2em] text-emerald-400 mb-2">
              <Swords className="w-3.5 h-3.5" />
              <span>// SELECT GAME MODE</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-black uppercase tracking-wider text-white text-glow-white">
              Choose Your Arena
            </h2>
            <p className="text-zinc-300 text-sm sm:text-base max-w-xl mx-auto mt-2 font-medium">
              Battle friends in private high-stakes rooms, raid mega-jackpot bosses, or hunt real protocol bug bounties.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            {/* Mode 1: Squad Deathmatch */}
            <div className="p-7 clip-game-card bg-[#070b13] border border-blue-500/30 hover:border-blue-400/70 transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-11 h-11 rounded-xl bg-blue-950/60 border border-blue-500/40 text-blue-400 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-1 rounded bg-blue-950/60 border border-blue-500/30 font-display font-bold text-[10px] text-blue-400 uppercase tracking-wider">
                    2–8 PLAYERS • PVP
                  </span>
                </div>
                <div className="text-blue-400 font-mono font-bold text-[11px] uppercase tracking-widest mb-1">
                  MODE 01 // FRIENDS &amp; GUILDS
                </div>
                <h3 className="font-display text-xl font-black uppercase tracking-wider text-white mb-2.5">
                  Squad Deathmatch
                </h3>
                <p className="text-zinc-300 leading-relaxed text-xs sm:text-sm mb-6">
                  Create a private lobby with friends. Everyone puts in an equal NEAR buy-in, the countdown clock starts, and the first player to crack the Boss takes the entire pot.
                </p>
              </div>
              <Link
                href="/create"
                className="w-full py-3.5 clip-game-btn bg-blue-500/15 hover:bg-blue-500 border border-blue-500/40 text-blue-300 hover:text-[#03060a] font-display font-extrabold text-[11px] uppercase tracking-[0.14em] text-center transition-all"
              >
                [ CREATE SQUAD LOBBY ]
              </Link>
            </div>

            {/* Mode 2: Protocol Bounties */}
            <div className="p-7 clip-game-card bg-[#070b13] border border-amber-500/30 hover:border-amber-400/70 transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-11 h-11 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-400 flex items-center justify-center">
                    <Building className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-1 rounded bg-amber-950/60 border border-amber-500/30 font-display font-bold text-[10px] text-amber-400 uppercase tracking-wider">
                    SPONSORED LOOT
                  </span>
                </div>
                <div className="text-amber-400 font-mono font-bold text-[11px] uppercase tracking-widest mb-1">
                  MODE 02 // PROTOCOLS &amp; DAOS
                </div>
                <h3 className="font-display text-xl font-black uppercase tracking-wider text-white mb-2.5">
                  Protocol Bounties
                </h3>
                <p className="text-zinc-300 leading-relaxed text-xs sm:text-sm mb-6">
                  Web3 teams lock NEAR bounties behind their AI agents without sharing source code. Break their guardrails to win the bounty and harden their security.
                </p>
              </div>
              <Link
                href="/arenas"
                onClick={() => setActiveFilter('enterprise')}
                className="w-full py-3.5 clip-game-btn bg-amber-500/15 hover:bg-amber-500 border border-amber-500/40 text-amber-300 hover:text-[#03060a] font-display font-extrabold text-[11px] uppercase tracking-[0.14em] text-center transition-all"
              >
                [ HUNT BOUNTIES ]
              </Link>
            </div>

            {/* Mode 3: Global Boss Raids */}
            <div className="p-7 clip-game-card bg-[#070b13] border border-emerald-500/30 hover:border-emerald-400/70 transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-11 h-11 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                    <Globe className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-1 rounded bg-emerald-950/60 border border-emerald-500/30 font-display font-bold text-[10px] text-emerald-400 uppercase tracking-wider">
                    MEGA JACKPOT
                  </span>
                </div>
                <div className="text-emerald-400 font-mono font-bold text-[11px] uppercase tracking-widest mb-1">
                  MODE 03 // WORLD RAID BOSS
                </div>
                <h3 className="font-display text-xl font-black uppercase tracking-wider text-white mb-2.5">
                  Global Raid Bosses
                </h3>
                <p className="text-zinc-300 leading-relaxed text-xs sm:text-sm mb-6">
                  LVL 99 GodMode sentinels guarded by triple-layer neural shields. Every failed attack from players worldwide pumps 80% of the turn fee into the jackpot.
                </p>
              </div>
              <Link
                href="/arenas"
                onClick={() => setActiveFilter('global')}
                className="w-full py-3.5 clip-game-btn bg-emerald-500/15 hover:bg-emerald-500 border border-emerald-500/40 text-emerald-300 hover:text-[#03060a] font-display font-extrabold text-[11px] uppercase tracking-[0.14em] text-center transition-all"
              >
                [ RAID GLOBAL BOSSES ]
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
          <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-[0.2em] text-emerald-400 mb-3">
            <Crosshair className="w-3.5 h-3.5" />
            <span>// READY PLAYER ONE</span>
          </div>
          <h2 className="font-display text-3xl sm:text-5xl font-black uppercase tracking-wider text-white text-glow-white">
            Think You Can Outsmart Machine Logic?
          </h2>
          <p className="text-sm sm:text-base text-zinc-300 mt-3 max-w-xl mx-auto font-medium">
            Pick a live AI Boss in the Raid Lobby or set up a private Squad Deathmatch with your friends on NEAR.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/arenas"
              onClick={() => setActiveFilter('all')}
              className="px-8 py-4 clip-game-btn bg-emerald-500 hover:bg-emerald-400 text-[#03060a] font-display font-black text-xs uppercase tracking-[0.14em] inline-flex items-center gap-2 transition-all shadow-[0_0_30px_rgba(16,185,129,0.45)]"
            >
              <Swords className="w-4 h-4" />
              <span>[ ENTER RAID LOBBY ]</span>
            </Link>
            <Link
              href="/create"
              className="px-7 py-4 clip-game-btn bg-zinc-900 hover:bg-zinc-800 border border-emerald-500/40 text-zinc-200 font-display font-bold text-xs uppercase tracking-[0.14em] inline-flex items-center gap-2 transition-all"
            >
              <span>[ HOST A MATCH ]</span>
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
              AGENT[HEIST]
            </span>
            <span>• Built on NEAR Protocol for Build Beyond Boundaries 2026</span>
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
