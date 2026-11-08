'use client';

import React from 'react';
import Link from 'next/link';
import { useNear } from '@/lib/nearContext';
import { ArenaCard } from '@/components/ArenaCard';
import { CinematicBackgroundCanvas } from '@/components/CinematicBackgroundCanvas';
import { CinematicHeroConsole } from '@/components/CinematicHeroConsole';
import {
  Shield,
  Zap,
  Users,
  Building,
  Globe,
  Plus,
  ArrowRight,
  Layers,
  Lock,
  Cpu
} from 'lucide-react';

export default function HomePage() {
  const { rooms, activeFilter, setActiveFilter } = useNear();

  const filteredRooms = rooms.filter(room => {
    if (activeFilter === 'all') return true;
    return room.category === activeFilter;
  });

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans selection:bg-emerald-500 selection:text-black">
      {/* Cinematic Hero Section with Live Neural Particle Canvas */}
      <section className="relative pt-24 pb-28 px-4 text-center overflow-hidden border-b border-zinc-900">
        {/* Interactive Neural Constellation Background */}
        <CinematicBackgroundCanvas />

        {/* Soft Atmospheric Vignette */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-emerald-500/10 blur-[180px] rounded-full pointer-events-none" />

        <div className="max-w-4xl mx-auto relative z-10 space-y-8">
          {/* Subtle Editorial Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-950/80 border border-zinc-800 text-zinc-400 text-[11px] font-mono tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>NEAR PROTOCOL • DECENTRALIZED AI RED-TEAMING</span>
          </div>

          {/* Cinematic Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black font-mono tracking-tight text-white max-w-4xl mx-auto leading-[1.08]">
            CAN YOU TRICK AN AI INTO GIVING YOU ITS{' '}
            <span className="text-emerald-400">CRYPTO?</span>
          </h1>

          {/* Punchy, Confident One-Liner */}
          <p className="text-base sm:text-lg text-zinc-400 font-sans max-w-xl mx-auto leading-relaxed">
            Autonomous AI agents guard millions in onchain escrow. Breach the sentinel with clever prompts to claim the bounty instantly.
          </p>

          {/* High-End Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 font-mono text-xs">
            <a
              href="#vaults"
              className="px-6 py-3.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold tracking-wide transition-all shadow-[0_0_30px_rgba(255,255,255,0.15)] flex items-center gap-2"
            >
              <span>Explore Live Vaults</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <Link
              href="/create"
              className="px-6 py-3.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 hover:border-zinc-700 font-semibold tracking-wide transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4 text-zinc-400" />
              <span>Deploy Arena</span>
            </Link>
          </div>

          {/* Cinematic Interactive Console Showcase */}
          <div className="pt-8">
            <CinematicHeroConsole />
          </div>
        </div>
      </section>

      {/* 3 Game Modes */}
      <section className="py-20 px-4 border-b border-zinc-900 bg-zinc-950/60">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold font-mono text-white tracking-tight">
              Three Ways to Compete
            </h2>
            <p className="text-zinc-400 text-xs sm:text-sm max-w-xl mx-auto mt-2 font-sans">
              Designed for individual security researchers, competitive squads of friends, and enterprise crypto protocols.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
            {/* Mode 1 */}
            <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700 transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 text-blue-400 flex items-center justify-center text-sm font-bold mb-4">
                  <Users className="w-5 h-5 text-blue-400" />
                </div>
                <div className="text-blue-400 font-semibold text-[11px] uppercase tracking-wider mb-1">
                  1. Squad Stand-off
                </div>
                <h3 className="text-base font-bold text-white mb-2 font-mono">Battle Friends for the Pot</h3>
                <p className="text-zinc-400 font-sans leading-relaxed text-xs mb-4">
                  Create a private room. 4 friends deposit 5 NEAR each into escrow (25 NEAR pot). A 15-minute clock starts. The first to outsmart the sentinel takes the entire pot.
                </p>
              </div>
              <Link
                href="/create"
                className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 font-semibold text-center transition-colors"
              >
                Create Squad Room
              </Link>
            </div>

            {/* Mode 2 */}
            <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700 transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 text-amber-400 flex items-center justify-center text-sm font-bold mb-4">
                  <Building className="w-5 h-5 text-amber-400" />
                </div>
                <div className="text-amber-400 font-semibold text-[11px] uppercase tracking-wider mb-1">
                  2. Enterprise Bug Bounty
                </div>
                <h3 className="text-base font-bold text-white mb-2 font-mono">Stress-Test Production Agents</h3>
                <p className="text-zinc-400 font-sans leading-relaxed text-xs mb-4">
                  Protocols deposit a bounty (e.g. 250 NEAR) and specify their AI agent's instructions + secret canary. Global researchers penetration-test it 24/7 before public launch.
                </p>
              </div>
              <Link
                href="/create"
                className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 font-semibold text-center transition-colors"
              >
                Post Protocol Bounty
              </Link>
            </div>

            {/* Mode 3 */}
            <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700 transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 text-emerald-400 flex items-center justify-center text-sm font-bold mb-4">
                  <Globe className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="text-emerald-400 font-semibold text-[11px] uppercase tracking-wider mb-1">
                  3. Global Progressive Jackpot
                </div>
                <h3 className="text-base font-bold text-white mb-2 font-mono">The Community Mega Vault</h3>
                <p className="text-zinc-400 font-sans leading-relaxed text-xs mb-4">
                  Flagship vaults protected by zero-trust firewalls. Every failed attempt fee dynamically pumps the pot (80% added to bounty), driving competition across the network.
                </p>
              </div>
              <a
                href="#vaults"
                className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 font-semibold text-center transition-colors"
              >
                Infiltrate Vault
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Main Vaults Directory */}
      <section id="vaults" className="max-w-7xl mx-auto px-4 py-20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-mono text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-400" />
              <span>Active Infiltration Arenas</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-1 font-mono">
              Select an enclave target. Pay the entry fee in NEAR, submit your prompt, and claim the bounty.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-xs">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeFilter === 'all'
                  ? 'bg-zinc-800 text-white font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              All Arenas ({rooms.length})
            </button>

            <button
              onClick={() => setActiveFilter('squad')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                activeFilter === 'squad'
                  ? 'bg-zinc-800 text-white font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Squad</span>
            </button>

            <button
              onClick={() => setActiveFilter('enterprise')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                activeFilter === 'enterprise'
                  ? 'bg-zinc-800 text-white font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              <span>Enterprise</span>
            </button>

            <button
              onClick={() => setActiveFilter('global')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                activeFilter === 'global'
                  ? 'bg-zinc-800 text-white font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Jackpot</span>
            </button>
          </div>
        </div>

        {/* Vaults Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map(room => (
            <ArenaCard key={room.id} room={room} />
          ))}
        </div>
      </section>

      {/* Escrow Architecture */}
      <section className="border-t border-zinc-900 bg-zinc-950/80 py-16 px-4 font-mono text-xs">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">How the Smart Contract Escrow Operates</h2>
            <p className="text-zinc-400 max-w-xl mx-auto mt-2 font-sans text-xs">
              Mathematically enforced payouts on NEAR with zero human intervention.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800">
              <div className="text-emerald-400 font-bold mb-2">01 / Deposit</div>
              <h3 className="text-sm font-bold text-white mb-1.5">Vault is Seeded</h3>
              <p className="text-zinc-400 font-sans leading-relaxed text-[11px]">
                Host locks NEAR tokens into the smart contract and sets a secret authorization canary that the agent must never output.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800">
              <div className="text-blue-400 font-bold mb-2">02 / Attack</div>
              <h3 className="text-sm font-bold text-white mb-1.5">Signed Prompts</h3>
              <p className="text-zinc-400 font-sans leading-relaxed text-[11px]">
                Hackers pay an attempt fee in NEAR. The prompt is passed into an isolated private execution enclave.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800">
              <div className="text-amber-400 font-bold mb-2">03 / Accumulate</div>
              <h3 className="text-sm font-bold text-white mb-1.5">Bounty Inflation</h3>
              <p className="text-zinc-400 font-sans leading-relaxed text-[11px]">
                Every time the AI defends, 80% of the attempt fee is committed to the prize pool, expanding the pot.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800">
              <div className="text-purple-400 font-bold mb-2">04 / Release</div>
              <h3 className="text-sm font-bold text-white mb-1.5">Instant Settlement</h3>
              <p className="text-zinc-400 font-sans leading-relaxed text-[11px]">
                Once a prompt tricks the AI into releasing the secret canary, the contract releases 100% of the bounty to the attacker's wallet.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-black py-8 px-4 text-xs font-mono text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">AGENTHEIST</span>
            <span>• Built for NEAR Hackathon (Build Beyond Boundaries)</span>
          </div>
          <div className="flex items-center gap-4 text-zinc-400">
            <span>AI Security &amp; Defense</span>
            <span>•</span>
            <span>Games with Real Economies</span>
            <span>•</span>
            <span>Agent Economy</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
