'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Crosshair, Loader2 } from 'lucide-react';
import { api, shortAccount, timeAgo } from '@/lib/near';
import { useChain, useNow } from '@/lib/useChain';

/** Live killfeed: the latest judged prompts and replies, straight from the contract. */
export const LandingGameShowcase: React.FC = () => {
  const { data, loading } = useChain(() => api.recent(0, 12), [], 10_000);
  const now = useNow(15_000);
  const judged = (data ?? []).filter(a => a.response !== null).slice(0, 6);

  return (
    <section className="py-24 px-4 border-b border-white/5 bg-[#03060a]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-[0.2em] text-emerald-400 mb-2">
              <Crosshair className="w-3.5 h-3.5" />
              <span>{'// '}LIVE KILLFEED • ONCHAIN</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-black uppercase tracking-wider text-white text-glow-white">
              Latest attacks
            </h2>
            <p className="text-sm sm:text-base text-zinc-300 mt-2 max-w-xl font-medium">
              Attack prompts and guardian replies, read from the contract. Study them, then do better.
            </p>
          </div>
          <Link
            href="/arenas"
            className="inline-flex items-center gap-2 px-5 py-3 clip-game-btn bg-zinc-900 border border-emerald-500/40 hover:border-emerald-400 text-zinc-100 font-display font-bold text-xs uppercase tracking-wider"
          >
            Pick a target <ArrowRight className="w-4 h-4 text-emerald-400" />
          </Link>
        </div>

        {loading && !data ? (
          <div className="flex items-center gap-2 text-zinc-500 font-mono text-sm">
            <Loader2 className="w-4 h-4 animate-spin" /> Reading the chain…
          </div>
        ) : judged.length === 0 ? (
          <p className="text-zinc-500 font-mono text-sm">No attacks yet. The first transcript could be yours.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {judged.map(a => (
              <Link
                key={`${a.room_id}-${a.index}`}
                href={`/arena/${a.room_id}`}
                className={`block clip-game-card border p-5 font-mono text-xs bg-[#060a11] hover:border-emerald-500/50 ${
                  a.status === 'Breached' || a.status === 'Heisted' ? 'border-red-500/50' : a.status === 'PolicyBlocked' ? 'border-amber-500/50' : 'border-zinc-800'
                }`}
              >
                <div className="flex justify-between text-[11px] text-zinc-500 mb-2">
                  <span>
                    <span className="text-emerald-300">{shortAccount(a.attacker, 22)}</span> → vault #{a.room_id}
                  </span>
                  <span
                    className={
                      a.status === 'Breached' || a.status === 'Heisted'
                        ? 'text-red-400 font-bold'
                        : a.status === 'PolicyBlocked'
                        ? 'text-amber-400 font-bold'
                        : ''
                    }
                  >
                    {a.status === 'Breached'
                      ? 'BREACHED'
                      : a.status === 'Heisted'
                      ? 'HEISTED'
                      : a.status === 'PolicyBlocked'
                      ? 'POLICY BLOCKED'
                      : 'DEFENDED'}
                    {now !== null && ` • ${timeAgo(Number(a.created_at), now)}`}
                  </span>
                </div>
                <p className="text-zinc-100 line-clamp-3">&gt; {a.prompt}</p>
                <p className={`mt-2 line-clamp-3 ${a.status === 'Breached' || a.status === 'Heisted' ? 'text-red-300' : 'text-emerald-200/80'}`}>{a.response}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
