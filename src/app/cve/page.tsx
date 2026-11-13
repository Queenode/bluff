'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { Download, Loader2, Skull, Trophy, Activity } from 'lucide-react';
import { api, shortAccount, yoctoToNear, CONTRACT_ID } from '@/lib/near';
import { useChain } from '@/lib/useChain';

export default function HallOfBreachesPage() {
  const stats = useChain(() => api.stats(), [], 15_000);
  const recent = useChain(() => api.recent(0, 200), [], 15_000);
  const rooms = useChain(() => api.rooms(0, 100), [], 30_000);
  const board = useChain(() => api.leaderboard(25), [], 30_000);

  const vectors = useMemo(() => {
    const m = new Map<string, { total: number; breaches: number }>();
    for (const a of recent.data ?? []) {
      if (a.status === 'Pending' || a.status === 'Refunded') continue;
      const k = a.attack_vector || 'Unclassified';
      const v = m.get(k) ?? { total: 0, breaches: 0 };
      v.total++;
      if (a.status === 'Breached') v.breaches++;
      m.set(k, v);
    }
    return [...m.entries()].sort((a, b) => b[1].total - a[1].total);
  }, [recent.data]);
  const maxVector = Math.max(1, ...vectors.map(([, v]) => v.total));

  const breaches = useMemo(() => (rooms.data ?? []).filter(r => r.status === 'Breached'), [rooms.data]);
  const winningPrompts = useMemo(() => {
    const m = new Map<string, string>();
    for (const a of recent.data ?? []) if (a.status === 'Breached') m.set(a.room_id, a.prompt);
    return m;
  }, [recent.data]);

  const exportJson = () => {
    const blob = new Blob(
      [
        JSON.stringify(
          {
            contract: CONTRACT_ID,
            exported_at: new Date().toISOString(),
            stats: stats.data,
            attempts: (recent.data ?? []).filter(a => a.status !== 'Pending'),
          },
          null,
          2,
        ),
      ],
      { type: 'application/json' },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bluff-redteam-dataset-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const s = stats.data;
  const tiles = [
    { label: 'Vaults hosted', value: s ? String(s.rooms) : '…' },
    { label: 'Prompts fired', value: s ? String(s.attempts) : '…' },
    { label: 'Guardians breached', value: s ? String(s.breaches) : '…' },
    { label: 'NEAR paid to attackers', value: s ? yoctoToNear(s.total_paid_out, 2) : '…' },
    { label: 'NEAR locked in vaults', value: s ? yoctoToNear(s.total_locked, 2) : '…' },
    { label: 'Players', value: s ? String(s.players) : '…' },
  ];

  return (
    <div className="min-h-screen bg-[#03060a] px-4 py-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-emerald-400 mb-2">
              {'// '}OPEN RED-TEAM DATASET • READ DIRECTLY FROM {CONTRACT_ID}
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-black uppercase tracking-wider text-white text-glow-white">
              Hall of Breaches
            </h1>
            <p className="text-zinc-400 text-sm mt-2 max-w-2xl">
              Every prompt and every guardian reply lives onchain. Builders can export real adversarial transcripts and see which
              attack styles actually beat LLM guardrails.
            </p>
          </div>
          <button
            onClick={exportJson}
            disabled={!recent.data}
            className="px-5 py-3 clip-game-btn bg-zinc-900 border border-emerald-500/40 hover:border-emerald-400 text-zinc-100 font-display font-bold text-xs uppercase tracking-wider inline-flex items-center gap-2 disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-emerald-400" /> Export dataset (JSON)
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-12">
          {tiles.map(t => (
            <div key={t.label} className="clip-game-card border border-zinc-800 bg-[#060a11] p-4">
              <div className="font-display text-2xl font-black text-white">{t.value}</div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mt-1">{t.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <section className="clip-game-card border border-zinc-800 bg-[#060a11] p-6">
            <h2 className="flex items-center gap-2 font-display text-sm font-black uppercase tracking-wider text-white mb-1">
              <Activity className="w-4 h-4 text-emerald-400" /> Attack vectors
            </h2>
            <p className="text-[11px] font-mono text-zinc-500 mb-5">Last {recent.data?.length ?? 0} judged attempts, heuristic tags.</p>
            {recent.loading && !recent.data ? (
              <Loader2 className="w-4 h-4 animate-spin text-zinc-500" />
            ) : vectors.length === 0 ? (
              <p className="text-sm text-zinc-500 font-mono">No judged attempts yet.</p>
            ) : (
              <div className="space-y-3">
                {vectors.map(([name, v]) => (
                  <div key={name}>
                    <div className="flex justify-between text-xs font-mono mb-1">
                      <span className="text-zinc-200">{name}</span>
                      <span className="text-zinc-500">
                        {v.total} tries • <span className={v.breaches ? 'text-red-400' : ''}>{v.breaches} breaches</span>
                      </span>
                    </div>
                    <div className="h-2 bg-zinc-900 rounded">
                      <div className="h-2 rounded bg-emerald-500/80" style={{ width: `${(v.total / maxVector) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="clip-game-card border border-zinc-800 bg-[#060a11] p-6">
            <h2 className="flex items-center gap-2 font-display text-sm font-black uppercase tracking-wider text-white mb-5">
              <Trophy className="w-4 h-4 text-amber-400" /> Leaderboard
            </h2>
            {board.loading && !board.data ? (
              <Loader2 className="w-4 h-4 animate-spin text-zinc-500" />
            ) : !board.data?.length ? (
              <p className="text-sm text-zinc-500 font-mono">No players yet.</p>
            ) : (
              <table className="w-full text-xs font-mono">
                <thead className="text-zinc-500 text-[10px] uppercase">
                  <tr>
                    <th className="text-left pb-2">#</th>
                    <th className="text-left pb-2">Player</th>
                    <th className="text-right pb-2">Tries</th>
                    <th className="text-right pb-2">Breaches</th>
                    <th className="text-right pb-2">Won</th>
                  </tr>
                </thead>
                <tbody>
                  {board.data.map((p, i) => (
                    <tr key={p.account_id} className="border-t border-zinc-900">
                      <td className="py-2 text-zinc-500">{i + 1}</td>
                      <td className="py-2">
                        <Link href={`/player/${p.account_id}`} className="text-emerald-300 hover:underline">
                          {shortAccount(p.account_id, 28)}
                        </Link>
                      </td>
                      <td className="py-2 text-right text-zinc-300">{p.stats.attempts}</td>
                      <td className="py-2 text-right text-zinc-300">{p.stats.breaches}</td>
                      <td className="py-2 text-right text-white">{yoctoToNear(p.stats.earned, 2)} Ⓝ</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </div>

        <section>
          <h2 className="flex items-center gap-2 font-display text-lg font-black uppercase tracking-wider text-white mb-5">
            <Skull className="w-5 h-5 text-red-400" /> Proof-of-breach archive
          </h2>
          {rooms.loading && !rooms.data ? (
            <Loader2 className="w-4 h-4 animate-spin text-zinc-500" />
          ) : breaches.length === 0 ? (
            <p className="text-sm text-zinc-500 font-mono">No guardian has fallen yet. Every vault is still standing.</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {breaches.map(r => (
                <Link
                  key={r.id}
                  href={`/arena/${r.id}`}
                  className="block clip-game-card border border-red-500/30 hover:border-red-400/60 bg-red-950/10 p-5"
                >
                  <div className="flex justify-between text-[11px] font-mono text-zinc-500">
                    <span>Vault #{r.id}</span>
                    <span>{yoctoToNear(r.payout, 2)} Ⓝ paid</span>
                  </div>
                  <div className="font-display font-black uppercase tracking-wider text-white mt-1">{r.name}</div>
                  <div className="text-xs font-mono text-zinc-400 mt-1">
                    won by <span className="text-emerald-300">{r.winner}</span> on attempt #{r.winning_attempt} • leaked{' '}
                    <code className="text-red-300">{r.revealed_canary}</code>
                  </div>
                  {winningPrompts.get(r.id) && (
                    <pre className="mt-3 text-xs font-mono text-zinc-300 whitespace-pre-wrap break-words line-clamp-4">
                      {winningPrompts.get(r.id)}
                    </pre>
                  )}
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
