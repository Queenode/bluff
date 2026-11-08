'use client';

import React from 'react';
import Link from 'next/link';
import { useNear } from '@/lib/nearContext';
import { ArenaCard } from '@/components/ArenaCard';
import { CinematicBackgroundCanvas } from '@/components/CinematicBackgroundCanvas';
import { WireframeMeshCanvas } from '@/components/WireframeMeshCanvas';
import {
  Shield,
  Users,
  Building,
  Globe,
  ArrowRight,
  Lock,
  Terminal,
  Zap
} from 'lucide-react';

export default function HomePage() {
  const { rooms, activeFilter, setActiveFilter } = useNear();

  const filteredRooms = rooms.filter(room => {
    if (activeFilter === 'all') return true;
    return room.category === activeFilter;
  });

  // Duplicate ticker list once for seamless infinite marquee
  const marqueeRooms = [...rooms, ...rooms];

  return (
    <div className="min-h-screen bg-[#03060a] text-zinc-100 font-sans selection:bg-emerald-500 selection:text-black">
      {/* FULL-BLEED CINEMATIC HERO SECTION */}
      <section className="relative min-h-[78vh] flex items-center justify-center overflow-hidden bg-[#03060a]">
        {/* Symmetrical AI Sentinels Cinema Backdrop */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src="/images/hero-sentinels.jpg"
            alt="Autonomous AI Sentinels guarding onchain crypto vault"
            className="w-full h-full object-cover object-center animate-hero-breath opacity-90"
          />
          {/* Subtle atmospheric center vignette to guarantee razor-sharp text contrast */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(3,6,10,0.45)_0%,rgba(3,6,10,0.25)_45%,rgba(3,6,10,0.75)_100%)]" />
          <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#03060a]/80 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#03060a] to-transparent" />
        </div>

        {/* Subtle Interactive Neural Dust Particles in Center Void */}
        <div className="absolute inset-0 z-10 pointer-events-none opacity-45">
          <CinematicBackgroundCanvas />
        </div>

        {/* Centered Cinematic Headline & CTA */}
        <div className="relative z-20 max-w-3xl mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl sm:text-6xl lg:text-[3.85rem] font-extrabold tracking-tight leading-[1.08] text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.85)]">
            Can You Trick an AI
            <span className="block text-emerald-400 mt-1">
              Into Giving You Its Crypto?
            </span>
          </h1>

          <p className="mt-5 text-sm sm:text-base text-zinc-300/95 max-w-xl mx-auto leading-relaxed font-normal drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
            Outsmart autonomous AI sentinels with clever prompts. Crack the secret authorization key and claim the NEAR bounty instantly onchain.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3">
            <a
              href="#vaults"
              className="px-6 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-[#03060a] font-semibold text-sm inline-flex items-center gap-2 transition-all shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:shadow-[0_0_40px_rgba(16,185,129,0.65)] hover:scale-[1.02]"
            >
              <span>Enter the Arena</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <Link
              href="/create"
              className="text-xs text-zinc-400 hover:text-emerald-400 transition-colors font-medium"
            >
              or deploy your own squad room / protocol bounty →
            </Link>
          </div>
        </div>
      </section>

      {/* SLEEK BOTTOM HERO VAULT STATUS RIBBON (Matches Reference Ticker Strip) */}
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
                  <span>{room.attemptsCount} tries</span>
                  <span
                    className={
                      room.status === 'breached'
                        ? 'text-red-400 font-semibold'
                        : 'text-emerald-400 font-semibold'
                    }
                  >
                    {room.status === 'breached' ? '● BREACHED' : '● DEFENDING'}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* HOW IT WORKS SECTION WITH ANIMATED GREEN WIREFRAME MESH */}
      <section className="relative py-24 px-4 overflow-hidden bg-[#030b08] border-b border-white/5">
        {/* Animated Low-Poly Emerald Wireframe Canvas */}
        <WireframeMeshCanvas />
        <div className="absolute inset-0 bg-gradient-to-b from-[#03060a]/70 via-transparent to-[#03060a]/90 pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              How It Works
            </h2>
            <p className="text-zinc-400 text-sm max-w-xl mx-auto mt-3">
              From clever prompt to instant onchain payout in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="p-7 rounded-2xl bg-[#070d12]/80 backdrop-blur-xl border border-emerald-500/15 hover:border-emerald-500/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-5">
                <Lock className="w-5 h-5" />
              </div>
              <div className="text-[11px] font-mono text-emerald-400 font-semibold uppercase tracking-wider mb-1">
                Step 01
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Seed or Join an Arena
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Protocols lock a NEAR security bounty—or friends pool a shared squad pot—behind an AI Sentinel guarding a secret canary phrase.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-7 rounded-2xl bg-[#070d12]/80 backdrop-blur-xl border border-emerald-500/15 hover:border-emerald-500/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-5">
                <Terminal className="w-5 h-5" />
              </div>
              <div className="text-[11px] font-mono text-emerald-400 font-semibold uppercase tracking-wider mb-1">
                Step 02
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Craft Adversarial Prompts
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Challenge the AI using roleplay, logical paradoxes, or system overrides. Every failed attempt automatically increases the vault pot.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-7 rounded-2xl bg-[#070d12]/80 backdrop-blur-xl border border-emerald-500/15 hover:border-emerald-500/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-5">
                <Zap className="w-5 h-5" />
              </div>
              <div className="text-[11px] font-mono text-emerald-400 font-semibold uppercase tracking-wider mb-1">
                Step 03
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Breach &amp; Settle Onchain
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                The instant your prompt tricks the AI into outputting the secret canary, the smart contract releases 100% of the escrow to your wallet.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* THREE WAYS TO COMPETE */}
      <section className="py-20 px-4 border-b border-white/5 bg-[#04070c]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Three Ways to Compete
            </h2>
            <p className="text-zinc-400 text-xs sm:text-sm max-w-xl mx-auto mt-2">
              Built for competitive friend squads, enterprise DeFi protocols, and solo red-team researchers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            {/* Mode 1 */}
            <div className="p-6 rounded-2xl bg-zinc-950/90 border border-zinc-800/80 hover:border-zinc-700 transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 text-blue-400 flex items-center justify-center mb-4">
                  <Users className="w-5 h-5" />
                </div>
                <div className="text-blue-400 font-mono font-semibold text-[11px] uppercase tracking-wider mb-1">
                  1. Squad Stand-off
                </div>
                <h3 className="text-base font-bold text-white mb-2">Battle Friends for the Pot</h3>
                <p className="text-zinc-400 leading-relaxed text-xs mb-5">
                  Create a private room. Friends deposit an equal NEAR buy-in into escrow, a countdown starts, and the first player to crack the sentinel takes it all.
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
            <div className="p-6 rounded-2xl bg-zinc-950/90 border border-zinc-800/80 hover:border-zinc-700 transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 text-amber-400 flex items-center justify-center mb-4">
                  <Building className="w-5 h-5" />
                </div>
                <div className="text-amber-400 font-mono font-semibold text-[11px] uppercase tracking-wider mb-1">
                  2. Enterprise Bug Bounty
                </div>
                <h3 className="text-base font-bold text-white mb-2">Stress-Test Production Agents</h3>
                <p className="text-zinc-400 leading-relaxed text-xs mb-5">
                  Protocols fund a bounty and configure their AI agent's system prompt or test webhook so global researchers can uncover prompt-injection leaks pre-launch.
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
            <div className="p-6 rounded-2xl bg-zinc-950/90 border border-zinc-800/80 hover:border-zinc-700 transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 text-emerald-400 flex items-center justify-center mb-4">
                  <Globe className="w-5 h-5" />
                </div>
                <div className="text-emerald-400 font-mono font-semibold text-[11px] uppercase tracking-wider mb-1">
                  3. Global Progressive Vault
                </div>
                <h3 className="text-base font-bold text-white mb-2">Community Mega Enclaves</h3>
                <p className="text-zinc-400 leading-relaxed text-xs mb-5">
                  Flagship vaults hardened with multi-layer semantic firewalls. Every defended attack pumps 80% of the attempt fee straight into the escrow pool.
                </p>
              </div>
              <a
                href="#vaults"
                className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 font-semibold text-center transition-colors"
              >
                Explore Live Vaults
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ACTIVE VAULTS DIRECTORY */}
      <section id="vaults" className="max-w-7xl mx-auto px-4 py-20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-400" />
              <span>Active Infiltration Arenas</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Select a target enclave, pay the NEAR attempt fee, and test your prompt against its defenses.
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
              All ({rooms.length})
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
              <span>Global</span>
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

      {/* Minimalist Footer */}
      <footer className="border-t border-white/5 bg-[#03060a] py-8 px-4 text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-emerald-400">AgentHeist</span>
            <span>• Built on NEAR Protocol for Build Beyond Boundaries 2026</span>
          </div>
          <div className="flex items-center gap-4 text-zinc-400">
            <Link href="/cve" className="hover:text-white transition-colors">
              CVE Dataset
            </Link>
            <span>•</span>
            <Link href="/create" className="hover:text-white transition-colors">
              Deploy Vault
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
