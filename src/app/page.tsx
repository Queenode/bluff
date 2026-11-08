'use client';

import React from 'react';
import Link from 'next/link';
import { useNear } from '@/lib/nearContext';
import { ArenaCard } from '@/components/ArenaCard';
import { LiveTicker } from '@/components/LiveTicker';
import {
  Shield,
  Zap,
  Users,
  Building,
  Globe,
  Terminal,
  PlusCircle,
  Flame,
  Award,
  ArrowRight,
  Lock,
  Cpu,
  Layers,
  CheckCircle2
} from 'lucide-react';

export default function HomePage() {
  const { rooms, activeFilter, setActiveFilter } = useNear();

  const filteredRooms = rooms.filter(room => {
    if (activeFilter === 'all') return true;
    return room.category === activeFilter;
  });

  const totalBounty = rooms
    .filter(r => r.status === 'active')
    .reduce((acc, curr) => acc + curr.bounty, 0);

  const totalAttempts = rooms.reduce((acc, curr) => acc + curr.attemptsCount, 0);

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans selection:bg-emerald-500 selection:text-black">
      {/* Live Ticker */}
      <LiveTicker />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-zinc-900 bg-gradient-to-b from-emerald-950/20 via-black to-black py-20 px-4">
        {/* Ambient glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/70 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold mb-6 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            NEAR BUILD BEYOND BOUNDARIES 2026 • AI SECURITY & ARENA TRACK
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black font-mono tracking-tight text-white mb-6">
            BREACH THE SENTINEL.
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              CLAIM THE ESCROW.
            </span>
          </h1>

          <p className="max-w-3xl mx-auto text-sm sm:text-base text-zinc-400 mb-10 leading-relaxed font-sans">
            The world's first decentralized AI red-teaming arena on NEAR Protocol. Challenge impenetrable autonomous guardians, battle friends in high-stakes squad stand-offs, or stress-test enterprise DeFi agents with real NEAR tokens locked in onchain escrow.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 font-mono text-xs">
            <a
              href="#vaults"
              className="px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black tracking-wider uppercase transition-all shadow-[0_0_25px_rgba(16,185,129,0.4)] hover:shadow-[0_0_35px_rgba(16,185,129,0.6)] flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              <span>INFILTRATE VAULTS</span>
            </a>

            <Link
              href="/create"
              className="px-6 py-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 hover:border-emerald-500/50 font-bold tracking-wider uppercase transition-all flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              <span>LAUNCH CUSTOM ARENA</span>
            </Link>

            <Link
              href="/cve"
              className="px-6 py-3.5 rounded-xl bg-zinc-950 hover:bg-emerald-950/40 text-emerald-300 border border-emerald-900/60 font-bold tracking-wider uppercase transition-all flex items-center gap-2"
            >
              <Terminal className="w-4 h-4" />
              <span>CVE REPOSITORY</span>
            </Link>
          </div>

          {/* Quick Metrics Banner */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-14 font-mono text-left">
            <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/80">
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Active Escrow Locked</div>
              <div className="text-2xl font-black text-emerald-400 mt-1">{totalBounty.toFixed(1)} Ⓝ</div>
              <div className="text-[10px] text-zinc-500 mt-0.5">Trustless onchain settlement</div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/80">
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Active Sentinels</div>
              <div className="text-2xl font-black text-white mt-1">
                {rooms.filter(r => r.status === 'active').length} Enclaves
              </div>
              <div className="text-[10px] text-emerald-500 mt-0.5">TEE Private Compute</div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/80">
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Red-Team Attempts</div>
              <div className="text-2xl font-black text-amber-400 mt-1">{totalAttempts}</div>
              <div className="text-[10px] text-zinc-500 mt-0.5">Prompt vectors tested</div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/80">
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Breach Settlement</div>
              <div className="text-2xl font-black text-purple-400 mt-1">100% Instant</div>
              <div className="text-[10px] text-zinc-500 mt-0.5">Zero-trust escrow release</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Vaults Directory */}
      <section id="vaults" className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-black font-mono text-white flex items-center gap-2">
              <Shield className="w-6 h-6 text-emerald-400" />
              <span>ACTIVE INFILTRATION ARENAS</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-1 font-mono">
              Choose your target enclave. Pay the entry fee in NEAR, test your adversarial prompt, and win the vault.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-xs">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeFilter === 'all'
                  ? 'bg-emerald-500 text-black font-bold shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              All Arenas ({rooms.length})
            </button>

            <button
              onClick={() => setActiveFilter('squad')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                activeFilter === 'squad'
                  ? 'bg-blue-500 text-black font-bold shadow-[0_0_10px_rgba(59,130,246,0.3)]'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Squad Battles</span>
            </button>

            <button
              onClick={() => setActiveFilter('enterprise')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                activeFilter === 'enterprise'
                  ? 'bg-amber-500 text-black font-bold shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              <span>Enterprise Bounties</span>
            </button>

            <button
              onClick={() => setActiveFilter('global')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                activeFilter === 'global'
                  ? 'bg-purple-500 text-black font-bold shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Global Jackpot</span>
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

      {/* Protocol Architecture: Why This Wins */}
      <section className="border-t border-zinc-900 bg-zinc-950/60 py-16 px-4 font-mono text-xs">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-bold mb-3">
              <Layers className="w-3.5 h-3.5" />
              <span>MECHANISM DESIGN</span>
            </div>
            <h2 className="text-3xl font-black text-white">HOW AGENT[HEIST] OPERATES ON NEAR</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto mt-2 font-sans">
              Combining onchain smart contract escrow with multi-layered AI defense and decentralized red-teaming intelligence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800">
              <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 flex items-center justify-center text-lg font-bold mb-4">
                1
              </div>
              <h3 className="text-sm font-bold text-white mb-2">Trustless Escrow Deposit</h3>
              <p className="text-zinc-400 font-sans leading-relaxed text-[11px]">
                Hosts deposit NEAR directly into the platform smart contract. The bounty is held immutably until an AI defense breach condition is cryptographically proven.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800">
              <div className="w-10 h-10 rounded-xl bg-blue-950/80 border border-blue-500/40 text-blue-400 flex items-center justify-center text-lg font-bold mb-4">
                2
              </div>
              <h3 className="text-sm font-bold text-white mb-2">Signed Infiltration Prompts</h3>
              <p className="text-zinc-400 font-sans leading-relaxed text-[11px]">
                Attackers pay an attempt fee in NEAR. 80% dynamically inflates the vault jackpot, and the prompt is executed inside isolated TEE private inference enclaves.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800">
              <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-500/40 text-amber-400 flex items-center justify-center text-lg font-bold mb-4">
                3
              </div>
              <h3 className="text-sm font-bold text-white mb-2">Deterministic Canary Verifier</h3>
              <p className="text-zinc-400 font-sans leading-relaxed text-[11px]">
                If the attacker achieves a novel jailbreak and extracts the secret canary, the smart contract automatically releases 100% of the locked escrow to the hacker's NEAR account.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800">
              <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-500/40 text-purple-400 flex items-center justify-center text-lg font-bold mb-4">
                4
              </div>
              <h3 className="text-sm font-bold text-white mb-2">Onchain CVE Dataset</h3>
              <p className="text-zinc-400 font-sans leading-relaxed text-[11px]">
                Every jailbreak attempt becomes an open-source security benchmark. Companies and researchers download full red-team audit logs to patch their agents before mainnet.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-black py-8 px-4 text-xs font-mono text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-zinc-300">AGENT[HEIST]</span>
            <span>• Built for NEAR Hackathon (Build Beyond Boundaries)</span>
          </div>
          <div className="flex items-center gap-4 text-zinc-400">
            <span>Track 6: AI Security & Defense</span>
            <span>•</span>
            <span>Track 9: Games with Real Economies</span>
            <span>•</span>
            <span>Track 7: Agent Economy</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
