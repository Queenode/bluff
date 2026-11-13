'use client';

import React, { Suspense, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ExternalLink, Loader2 } from 'lucide-react';
import { accountUrl, api, yoctoToNear } from '@/lib/near';
import { useChain } from '@/lib/useChain';

function PlayerView() {
  const params = useParams();
  const account = decodeURIComponent(String(params?.account ?? ''));
  const player = useChain(() => api.player(account), [account], 20_000);
  const recent = useChain(() => api.recent(0, 200), [], 20_000);
  const rooms = useChain(() => api.rooms(0, 100), [], 30_000);

  const mine = useMemo(() => (recent.data ?? []).filter(a => a.attacker === account), [recent.data, account]);
  const hosted = useMemo(() => (rooms.data ?? []).filter(r => r.host === account), [rooms.data, account]);
  const s = player.data;

  return (
    <div className="min-h-screen bg-[#03060a] px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-emerald-400 mb-2">{'// '}PLAYER</div>
        <h1 className="font-display text-2xl sm:text-3xl font-black tracking-wider text-white break-all">{account}</h1>
        <a href={accountUrl(account)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-mono text-zinc-400 hover:text-emerald-400 mt-1">
          explorer <ExternalLink className="w-3 h-3" />
        </a>

        {player.loading && !s ? (
          <div className="mt-8 text-zinc-500"><Loader2 className="w-4 h-4 animate-spin" /></div>
        ) : !s ? (
          <p className="mt-8 text-zinc-400 font-mono text-sm">This account has not played BLUFF yet.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-8">
            {[
              ['Attempts', String(s.attempts)],
              ['Breaches', String(s.breaches)],
              ['Won', `${yoctoToNear(s.earned, 2)} Ⓝ`],
              ['Spent', `${yoctoToNear(s.spent, 2)} Ⓝ`],
              ['Vaults hosted', String(s.rooms_hosted)],
            ].map(([k, v]) => (
              <div key={k} className="clip-game-card border border-zinc-800 bg-[#060a11] p-4">
                <div className="font-display text-xl font-black text-white">{v}</div>
                <div className="text-[10px] font-mono uppercase text-zinc-500 mt-1">{k}</div>
              </div>
            ))}
          </div>
        )}

        {hosted.length > 0 && (
          <section className="mt-10">
            <h2 className="font-display text-sm font-black uppercase tracking-wider text-white mb-3">Vaults hosted</h2>
            <div className="space-y-2">
              {hosted.map(r => (
                <Link key={r.id} href={`/arena/${r.id}`} className="flex justify-between clip-game-card border border-zinc-800 bg-[#060a11] px-4 py-3 text-xs font-mono hover:border-emerald-500/40">
                  <span className="text-zinc-200">#{r.id} {r.name}</span>
                  <span className="text-zinc-400">{r.status} • {r.attempts_count} attempts</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="mt-10">
          <h2 className="font-display text-sm font-black uppercase tracking-wider text-white mb-3">Recent attempts</h2>
          {mine.length === 0 ? (
            <p className="text-sm text-zinc-500 font-mono">None in the latest 200 attempts.</p>
          ) : (
            <div className="space-y-2">
              {mine.map(a => (
                <Link key={`${a.room_id}-${a.index}`} href={`/arena/${a.room_id}`} className="block clip-game-card border border-zinc-800 bg-[#060a11] px-4 py-3 text-xs font-mono hover:border-emerald-500/40">
                  <div className="flex justify-between text-zinc-500 mb-1">
                    <span>Vault #{a.room_id} • attempt #{a.index}</span>
                    <span className={a.status === 'Breached' ? 'text-red-400 font-bold' : ''}>{a.status}</span>
                  </div>
                  <div className="text-zinc-200 line-clamp-2">{a.prompt}</div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default function PlayerPage() {
  return (
    <Suspense fallback={null}>
      <PlayerView />
    </Suspense>
  );
}
