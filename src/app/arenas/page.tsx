'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useNear } from '@/lib/nearContext';
import { ArenaCard } from '@/components/ArenaCard';
import {
  Shield,
  Users,
  Building,
  Globe,
  Search,
  Swords,
  Crosshair
} from 'lucide-react';

export default function ArenasDirectoryPage() {
  const { rooms, activeFilter, setActiveFilter } = useNear();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'breached'>('all');

  const filteredRooms = rooms.filter(room => {
    const matchesCategory = activeFilter === 'all' || room.category === activeFilter;
    const matchesStatus = statusFilter === 'all' || room.status === statusFilter;
    const matchesSearch =
      !searchQuery.trim() ||
      room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.guardian.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.host.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.targetObjective.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesStatus && matchesSearch;
  });

  const activeRoomsCount = rooms.filter(r => r.status === 'active').length;
  const totalEscrow = rooms
    .filter(r => r.status === 'active')
    .reduce((sum, r) => sum + r.bounty, 0);
  const totalAttempts = rooms.reduce((sum, r) => sum + r.attemptsCount, 0);

  return (
    <div className="min-h-screen bg-[#03060a] text-zinc-100 font-sans pb-24">
      {/* Top Gaming Raid Lobby Header Banner */}
      <div className="relative overflow-hidden border-b border-white/10 bg-[#050911] py-12 px-4">
        <div className="absolute top-0 left-1/3 w-[500px] h-[220px] bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 clip-game-btn bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold uppercase tracking-[0.18em] mb-3">
              <Crosshair className="w-3.5 h-3.5" />
              <span>[ RAID LOBBY // SELECT YOUR TARGET ]</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-black uppercase tracking-wider text-white text-glow-white">
              Active Boss Arenas
            </h1>
            <p className="text-sm sm:text-base text-zinc-300 mt-2 max-w-2xl font-medium">
              Pick an AI Boss below, spend NEAR per turn to fire prompt attacks, and trick the sentinel into leaking its secret keyphrase to loot 100% of the pot.
            </p>
          </div>

          {/* Live Telemetry Summary HUD Pills */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="px-4 py-2.5 clip-game-card bg-zinc-950/90 border border-white/10">
              <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">LIVE BOSSES</div>
              <div className="font-display text-base font-black text-white mt-0.5">{activeRoomsCount} ARENAS</div>
            </div>
            <div className="px-4 py-2.5 clip-game-card bg-zinc-950/90 border border-white/10">
              <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">TOTAL LOOT POOL</div>
              <div className="font-display text-base font-black text-emerald-400 mt-0.5">{totalEscrow.toFixed(1)} NEAR</div>
            </div>
            <div className="px-4 py-2.5 clip-game-card bg-zinc-950/90 border border-white/10">
              <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">ATTACKS FIRED</div>
              <div className="font-display text-base font-black text-zinc-200 mt-0.5">{totalAttempts}</div>
            </div>
            <Link
              href="/create"
              className="px-5 py-3.5 clip-game-btn bg-emerald-500 hover:bg-emerald-400 text-[#03060a] font-display font-black text-xs uppercase tracking-[0.12em] inline-flex items-center gap-1.5 transition-all shadow-[0_0_25px_rgba(16,185,129,0.35)]"
            >
              <Swords className="w-4 h-4" />
              <span>[ HOST MATCH ]</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="max-w-7xl mx-auto px-4 pt-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-3 rounded-xl bg-zinc-950/90 border border-zinc-800/80 mb-8">
          {/* Category Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 font-display text-xs">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3.5 py-2 clip-game-btn uppercase tracking-wider transition-all ${
                activeFilter === 'all'
                  ? 'bg-emerald-500 text-[#03060a] font-black'
                  : 'bg-zinc-900/70 text-zinc-400 hover:text-white hover:bg-zinc-900 font-bold'
              }`}
            >
              All Arenas ({rooms.length})
            </button>

            <button
              onClick={() => setActiveFilter('squad')}
              className={`px-3.5 py-2 clip-game-btn uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                activeFilter === 'squad'
                  ? 'bg-emerald-500 text-[#03060a] font-black'
                  : 'bg-zinc-900/70 text-zinc-400 hover:text-white hover:bg-zinc-900 font-bold'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Squad Deathmatch</span>
            </button>

            <button
              onClick={() => setActiveFilter('enterprise')}
              className={`px-3.5 py-2 clip-game-btn uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                activeFilter === 'enterprise'
                  ? 'bg-emerald-500 text-[#03060a] font-black'
                  : 'bg-zinc-900/70 text-zinc-400 hover:text-white hover:bg-zinc-900 font-bold'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              <span>Protocol Bounties</span>
            </button>

            <button
              onClick={() => setActiveFilter('global')}
              className={`px-3.5 py-2 clip-game-btn uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                activeFilter === 'global'
                  ? 'bg-emerald-500 text-[#03060a] font-black'
                  : 'bg-zinc-900/70 text-zinc-400 hover:text-white hover:bg-zinc-900 font-bold'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Global Raid Bosses</span>
            </button>
          </div>

          {/* Search & Status Filter */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search boss, host, objective..."
                className="w-full rounded-lg bg-zinc-900 border border-zinc-800 pl-9 pr-3 py-2 text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/60"
              />
            </div>

            <div className="flex items-center gap-1 p-1 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] font-display uppercase">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  statusFilter === 'all' ? 'bg-zinc-800 text-white font-bold' : 'text-zinc-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('active')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  statusFilter === 'active' ? 'bg-zinc-800 text-emerald-400 font-bold' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Alive
              </button>
              <button
                onClick={() => setStatusFilter('breached')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  statusFilter === 'breached' ? 'bg-zinc-800 text-red-400 font-bold' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Slain
              </button>
            </div>
          </div>
        </div>

        {/* Arenas Grid */}
        {filteredRooms.length === 0 ? (
          <div className="text-center py-20 clip-game-card bg-zinc-950/60 border border-zinc-800/80">
            <Shield className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
            <h3 className="text-base font-bold font-display uppercase tracking-wider text-white">
              No Matching Boss Arenas
            </h3>
            <p className="text-xs text-zinc-500 mt-1 mb-5">
              Try resetting your filters or host a new Squad Deathmatch.
            </p>
            <button
              onClick={() => {
                setActiveFilter('all');
                setStatusFilter('all');
                setSearchQuery('');
              }}
              className="px-4 py-2 clip-game-btn bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-display font-bold uppercase text-zinc-200"
            >
              [ RESET FILTERS ]
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map(room => (
              <ArenaCard key={room.id} room={room} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
