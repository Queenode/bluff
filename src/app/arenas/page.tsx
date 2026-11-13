'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArenaCard } from '@/components/ArenaCard';
import { api, roomPhase, yoctoToNear, CONTRACT_ID, accountUrl, canSeeInLobby } from '@/lib/near';
import { useWallet } from '@/lib/wallet';
import { useChain, useNow } from '@/lib/useChain';
import { Swords, Loader2, Plus, ExternalLink } from 'lucide-react';

const FILTERS = ['Live', 'Breached', 'Expired', 'All'] as const;
type Filter = (typeof FILTERS)[number];

export default function ArenasPage() {
  const { data: rooms, error, loading } = useChain(() => api.rooms(0, 100), [], 10_000);
  const now = useNow(10_000);
  const [filter, setFilter] = useState<Filter>('Live');
  const { accountId } = useWallet();

  const filtered = useMemo(() => {
    if (!rooms) return [];
    const t = now ?? 0;
    return rooms.filter(r => {
      if (!canSeeInLobby(r, accountId)) return false;
      const p = roomPhase(r, t || Number(r.created_at));
      if (filter === 'All') return true;
      if (filter === 'Live') return p === 'Live' || p === 'Arming';
      if (filter === 'Breached') return p === 'Breached';
      return p === 'Expired' || p === 'Refunded';
    });
  }, [rooms, filter, now, accountId]);

  const livePot = useMemo(() => {
    if (!rooms || now === null) return null;
    return rooms
      .filter(r => ['Live', 'Arming'].includes(roomPhase(r, now)))
      .reduce((acc, r) => acc + BigInt(r.bounty), BigInt(0));
  }, [rooms, now]);

  return (
    <div className="min-h-screen bg-[#03060a] px-4 py-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-emerald-400 mb-2">
              {'// '}RAID LOBBY • LIVE FROM{' '}
              <a href={accountUrl(CONTRACT_ID)} target="_blank" rel="noreferrer" className="underline inline-flex items-center gap-1">
                {CONTRACT_ID} <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-black uppercase tracking-wider text-white text-glow-white">
              Choose Your Target
            </h1>
            <p className="text-zinc-400 text-sm mt-2 max-w-xl">
              Every vault below is a real onchain escrow. Pay the per-prompt fee, make the guardian say its secret code, and
              the contract pays you the whole pot.
            </p>
          </div>
          <div className="flex items-center gap-4">
            {livePot !== null && (
              <div className="text-right">
                <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">Up for grabs</div>
                <div className="font-display text-2xl font-black text-white">
                  {yoctoToNear(livePot, 2)} <span className="text-emerald-400 text-sm">NEAR</span>
                </div>
              </div>
            )}
            <Link
              href="/create"
              className="px-5 py-3 clip-game-btn bg-emerald-500 hover:bg-emerald-400 text-[#03060a] font-display font-black text-xs uppercase tracking-wider inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Host a vault
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 clip-game-btn text-[11px] font-display font-bold uppercase tracking-wider border transition-colors ${
                filter === f
                  ? 'bg-emerald-500 text-[#03060a] border-emerald-400'
                  : 'bg-zinc-900/80 text-zinc-300 border-zinc-800 hover:border-emerald-500/40'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {loading && !rooms ? (
          <div className="flex items-center justify-center py-24 text-zinc-400 font-mono text-sm gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Reading vaults from NEAR…
          </div>
        ) : error && !rooms ? (
          <div className="py-16 text-center text-red-400 font-mono text-sm">Could not reach NEAR RPC: {error}</div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center clip-game-card border border-zinc-800 bg-[#060a11]">
            <Swords className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
            <p className="text-zinc-300 font-display uppercase tracking-wider">No {filter === 'All' ? '' : filter.toLowerCase()} vaults right now</p>
            <Link href="/create" className="inline-block mt-4 text-emerald-400 underline font-mono text-sm">
              Be the first to host one →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(r => (
              <ArenaCard key={r.id} room={r} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
