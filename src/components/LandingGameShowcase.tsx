'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useNear } from '@/lib/nearContext';
import { Swords, ShieldAlert, Trophy, ArrowRight, Crosshair, Sparkles } from 'lucide-react';

export const LandingGameShowcase: React.FC = () => {
  const { rooms, attempts, setActiveFilter } = useNear();
  const activeBosses = rooms.filter(r => r.status === 'active').slice(0, 3);
  const [selectedIdx, setSelectedIdx] = useState(0);

  const selectedBoss = activeBosses[selectedIdx] || rooms[0];

  const getThreatPercent = (diff: string) => {
    switch (diff) {
      case 'GodMode':
        return 98;
      case 'Fortress':
        return 85;
      case 'Hardened':
        return 68;
      default:
        return 45;
    }
  };

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
    <section className="py-24 px-4 border-b border-white/5 bg-[#03060a]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-[0.2em] text-emerald-400 mb-2">
              <Crosshair className="w-3.5 h-3.5" />
              <span>// BOSS DOSSIER &amp; LIVE KILLFEED</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-black uppercase tracking-wider text-white text-glow-white">
              Meet The AI Bosses
            </h2>
            <p className="text-sm sm:text-base text-zinc-300 mt-2 max-w-xl font-medium">
              Scan boss shield stats, study real-time player attacks, and pick your target before stepping into the arena.
            </p>
          </div>

          <Link
            href="/arenas"
            onClick={() => setActiveFilter('all')}
            className="inline-flex items-center gap-2 px-5 py-3 clip-game-btn bg-zinc-900 hover:bg-emerald-500 hover:text-[#03060a] border border-emerald-500/40 hover:border-emerald-400 text-xs font-display font-extrabold uppercase tracking-wider text-emerald-300 transition-all self-start md:self-auto"
          >
            <span>[ OPEN FULL RAID LOBBY ]</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT: Interactive Boss Roster Selector (7 cols) */}
          <div className="lg:col-span-7 clip-game-card bg-[#060a11] border border-zinc-800/90 p-6 flex flex-col justify-between">
            <div>
              {/* Boss Tabs */}
              <div className="flex flex-wrap gap-2 mb-6">
                {activeBosses.map((boss, idx) => (
                  <button
                    key={boss.id}
                    onClick={() => setSelectedIdx(idx)}
                    className={`px-4 py-2.5 clip-game-btn text-xs font-display font-extrabold uppercase tracking-wider transition-all border ${
                      selectedIdx === idx
                        ? 'bg-emerald-500 text-[#03060a] border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.35)]'
                        : 'bg-zinc-900/80 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'
                    }`}
                  >
                    {boss.guardian.name.split(' ')[0]} • {getBossLevel(boss.difficulty)}
                  </button>
                ))}
              </div>

              {/* Selected Boss Tactical Dossier */}
              {selectedBoss && (
                <div className="space-y-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="text-[11px] font-mono text-emerald-400 font-bold uppercase tracking-widest mb-1">
                        {selectedBoss.category === 'squad'
                          ? '// SQUAD DEATHMATCH BOSS'
                          : selectedBoss.category === 'enterprise'
                          ? '// PROTOCOL BOUNTY BOSS'
                          : '// GLOBAL RAID BOSS'}
                      </div>
                      <h3 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-wider text-white">
                        {selectedBoss.guardian.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-zinc-300 mt-1">{selectedBoss.guardian.tagline}</p>
                    </div>

                    <div className="px-4 py-2.5 clip-game-card bg-black/80 border border-emerald-500/40 text-right">
                      <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
                        BOSS LOOT POT
                      </div>
                      <div className="font-display text-xl sm:text-2xl font-black text-emerald-400 text-glow-emerald">
                        {selectedBoss.bounty.toFixed(1)} NEAR
                      </div>
                    </div>
                  </div>

                  {/* Shield Integrity Meter */}
                  <div className="p-4 rounded-xl bg-black/60 border border-zinc-800/80 space-y-2 font-mono">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-zinc-300 font-bold uppercase tracking-wider">
                        BOSS SHIELD HP / DEFENSE INTEGRITY
                      </span>
                      <span className="font-display text-emerald-400 font-black">
                        {getThreatPercent(selectedBoss.difficulty)}% HP
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-zinc-900 overflow-hidden p-0.5 border border-zinc-800">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 rounded-full transition-all duration-500"
                        style={{ width: `${getThreatPercent(selectedBoss.difficulty)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1">
                      <span>AI CORE: {selectedBoss.guardian.model}</span>
                      <span>{selectedBoss.attemptsCount} PLAYER ATTACKS TANKED</span>
                    </div>
                  </div>

                  {/* Rules / Intel Hints */}
                  <div className="space-y-2">
                    <div className="text-[11px] font-display font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Boss Traits &amp; Weakness Intel</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                      {selectedBoss.guardian.rules.slice(0, 2).map((rule, i) => (
                        <div
                          key={i}
                          className="p-3 rounded-lg bg-zinc-900/70 border border-zinc-800 text-zinc-200 leading-relaxed"
                        >
                          {rule}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Bar */}
            {selectedBoss && (
              <div className="pt-6 mt-6 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-4">
                <div className="font-mono text-xs text-zinc-300 uppercase">
                  TURN COST: <strong className="font-display text-emerald-400">{selectedBoss.entryFee} NEAR</strong>
                </div>
                <Link
                  href={`/arena/${selectedBoss.id}`}
                  className="px-6 py-3.5 clip-game-btn bg-emerald-500 hover:bg-emerald-400 text-[#03060a] font-display font-black text-xs uppercase tracking-[0.14em] inline-flex items-center gap-2 transition-all shadow-[0_0_25px_rgba(16,185,129,0.4)] active:translate-y-0.5"
                >
                  <Swords className="w-4 h-4" />
                  <span>[ FIGHT {selectedBoss.guardian.name.split(' ')[0].toUpperCase()} ]</span>
                </Link>
              </div>
            )}
          </div>

          {/* RIGHT: Live Killfeed & Top Raiders Leaderboard (5 cols) */}
          <div className="lg:col-span-5 clip-game-card bg-[#060a11] border border-zinc-800/90 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2 font-display text-xs font-extrabold uppercase tracking-wider text-white">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  <span>Live Arena Killfeed</span>
                </div>
                <Link
                  href="/cve"
                  className="text-[11px] font-display font-bold uppercase tracking-wider text-emerald-400 hover:underline"
                >
                  Full Logs →
                </Link>
              </div>

              {/* Recent Combat Events */}
              <div className="space-y-3 mb-6">
                {attempts.slice(0, 3).map(att => (
                  <div
                    key={att.id}
                    className="p-3.5 rounded-xl bg-black/60 border border-zinc-800/90 text-xs font-mono space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-display text-white font-bold">{att.attacker}</span>
                      {att.success ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-display font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40">
                          <Trophy className="w-3 h-3" /> BOSS SLAIN
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-display font-bold text-red-400 bg-red-950/60 px-2 py-0.5 rounded border border-red-900/50">
                          <ShieldAlert className="w-3 h-3" /> BLOCKED
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-zinc-300 truncate font-sans">
                      &ldquo;{att.prompt}&rdquo;
                    </div>
                    <div className="text-[10px] text-zinc-500 flex items-center justify-between uppercase">
                      <span>CLASS: {att.attackVector}</span>
                      <span className="text-emerald-400 font-bold">+{att.feePaid} Ⓝ POT</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Top Raider Hall of Fame */}
              <div className="pt-4 border-t border-zinc-800/80">
                <div className="text-[11px] font-display font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 mb-3">
                  <Trophy className="w-3.5 h-3.5" />
                  <span>Season 01 Top Boss Slayers</span>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-900/60 border border-amber-500/30">
                    <div className="flex items-center gap-2.5">
                      <span className="font-display text-amber-400 font-black">#1</span>
                      <span className="font-display text-white font-bold">zeroday.near</span>
                    </div>
                    <span className="font-display text-emerald-400 font-bold">75.0 Ⓝ LOOTED</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-900/40 border border-zinc-800/60">
                    <div className="flex items-center gap-2.5">
                      <span className="font-display text-zinc-400 font-bold">#2</span>
                      <span className="font-display text-zinc-200">cyberpunk.near</span>
                    </div>
                    <span className="text-zinc-400 font-semibold">420 ATTACKS</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-900/40 border border-zinc-800/60">
                    <div className="flex items-center gap-2.5">
                      <span className="font-display text-zinc-400 font-bold">#3</span>
                      <span className="font-display text-zinc-200">alice_squad.testnet</span>
                    </div>
                    <span className="text-zinc-400 font-semibold">SQUAD HOST</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
