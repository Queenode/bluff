'use client';

import React, { Suspense, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { Loader2, Trophy, Swords, Users, Coins, Shield } from 'lucide-react';
import { ArenaCard } from '@/components/ArenaCard';
import { ShareButtons } from '@/components/ShareButtons';
import { useChain } from '@/lib/useChain';
import { useWallet } from '@/lib/wallet';
import { loadEvent } from '@/lib/events';
import { shortAccount, yoctoToNear } from '@/lib/near';

function EventBoard() {
  const params = useParams();
  const search = useSearchParams();
  const host = decodeURIComponent(String(params?.host ?? ''));
  const name = search.get('name')?.slice(0, 80) || `${host.replace(/\.(testnet|near)$/, '')} arena`;
  const only = search.get('vaults')?.split(',').map(s => s.trim()).filter(Boolean) ?? null;
  const onlyKey = only?.join(',') ?? '';
  const { accountId } = useWallet();
  const ev = useChain(() => loadEvent(host, only), [host, onlyKey], 10_000);
  const d = ev.data;

  const totals = useMemo(() => {
    if (!d) return null;
    const won = d.board.reduce((s, r) => s + r.won, BigInt(0));
    const pot = d.vaults.reduce((s, v) => s + BigInt(v.status === 'Breached' ? '0' : v.bounty), BigInt(0));
    return { players: d.board.length, attempts: d.attempts.length, won, pot };
  }, [d]);

  const medal = ['🥇', '🥈', '🥉'];

  return (
    <div className="min-h-screen bg-[#03060a] px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-amber-400 mb-2">{'// '}EVENT BOARD</div>
        <h1 className="font-display text-3xl sm:text-5xl font-black uppercase tracking-wider text-white text-glow-white break-words">{name}</h1>
        <p className="text-zinc-400 text-sm mt-2 font-mono">
          Organised by{' '}
          <Link href={`/player/${host}`} className="text-emerald-300 hover:underline">
            {host}
          </Link>{' '}
          • scores computed live from the BLUFF contract. Only vaults created by this account count.
        </p>

        {ev.loading && !d ? (
          <div className="mt-10 text-zinc-500 flex items-center gap-2 font-mono text-sm">
            <Loader2 className="w-4 h-4 animate-spin" /> Reading the chain…
          </div>
        ) : !d || d.vaults.length === 0 ? (
          <div className="mt-10 clip-game-card border border-zinc-800 bg-[#060a11] p-6 text-zinc-300 text-sm">
            This account hasn&apos;t hosted any vaults yet.{' '}
            <Link href="/create" className="text-emerald-300 underline">
              Host the first level
            </Link>
            .
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">
              {[
                [<Shield key="i" className="w-4 h-4" />, 'Levels', String(d.vaults.length)],
                [<Users key="i" className="w-4 h-4" />, 'Players', String(totals!.players)],
                [<Swords key="i" className="w-4 h-4" />, 'Attempts', String(totals!.attempts)],
                [<Coins key="i" className="w-4 h-4" />, 'Prize pool left', `${yoctoToNear(totals!.pot, 2)} Ⓝ`],
              ].map(([icon, label, value], i) => (
                <div key={i} className="clip-game-card border border-zinc-800 bg-[#060a11] p-4">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
                    {icon} {label}
                  </div>
                  <div className="font-display text-2xl font-black text-white mt-1">{value}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-8 mt-10">
              <div>
                <h2 className="font-display text-xl font-black uppercase tracking-wider text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-400" /> Scoreboard
                </h2>
                <p className="text-[11px] font-mono text-zinc-500 mt-1">
                  Crack a secret: 100 / 200 / 300 pts (Standard / Hardened / Fortress). Each heist: 50 / 100 / 150 pts. Ties go to whoever scored first.
                </p>
                <div className="mt-4 clip-game-card border border-amber-500/30 bg-[#0c0a06] overflow-hidden">
                  {d.board.length === 0 ? (
                    <p className="p-5 text-sm text-zinc-400 font-mono">No attempts yet. First blood is up for grabs.</p>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 border-b border-zinc-800">
                          <th className="text-left p-3">#</th>
                          <th className="text-left p-3">Player</th>
                          <th className="text-right p-3">Points</th>
                          <th className="text-right p-3 hidden sm:table-cell">Wins</th>
                          <th className="text-right p-3 hidden sm:table-cell">Tries</th>
                          <th className="text-right p-3">Won</th>
                        </tr>
                      </thead>
                      <tbody>
                        {d.board.map((r, i) => (
                          <tr
                            key={r.account}
                            className={`border-b border-zinc-900 ${r.account === accountId ? 'bg-emerald-950/40' : ''}`}
                          >
                            <td className="p-3 font-display font-black text-amber-300">{medal[i] && r.points > 0 ? medal[i] : i + 1}</td>
                            <td className="p-3 font-mono">
                              <Link href={`/player/${r.account}`} className="text-zinc-100 hover:text-emerald-300">
                                {shortAccount(r.account, 26)}
                              </Link>
                              {r.account === accountId && <span className="ml-2 text-[10px] text-emerald-400">YOU</span>}
                            </td>
                            <td className="p-3 text-right font-display font-black text-white">{r.points}</td>
                            <td className="p-3 text-right font-mono text-zinc-300 hidden sm:table-cell">{r.wins}</td>
                            <td className="p-3 text-right font-mono text-zinc-400 hidden sm:table-cell">{r.attempts}</td>
                            <td className="p-3 text-right font-mono text-emerald-300">{yoctoToNear(r.won, 2)} Ⓝ</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              <aside className="space-y-5">
                <div className="clip-game-card border border-amber-500/30 bg-[#0c0a06] p-5">
                  <div className="text-xs font-display font-bold uppercase tracking-wider text-amber-300">Invite players</div>
                  <p className="text-[11px] font-mono text-zinc-400 mt-1">
                    Squad levels only accept invited wallets. Everyone can watch the board live.
                  </p>
                  <ShareButtons
                    text={`🏁 ${name} is live on BLUFF: ${d.vaults.length} AI guardian level${d.vaults.length === 1 ? '' : 's'}, ${yoctoToNear(totals!.pot, 2)} NEAR in prizes. Out-talk the AI, climb the board. @NEARProtocol #NEARHackathon`}
                  />
                </div>
                {accountId === host && (
                  <div className="clip-game-card border border-emerald-500/30 bg-[#060c10] p-5 text-[12px] text-zinc-300">
                    <div className="text-xs font-display font-bold uppercase tracking-wider text-emerald-400 mb-1">You run this event</div>
                    Add levels by <Link href="/create" className="text-emerald-300 underline">hosting more vaults</Link> from this
                    account, or build a custom board on the <Link href="/events" className="text-emerald-300 underline">Events page</Link>.
                  </div>
                )}
              </aside>
            </div>

            <h2 className="font-display text-xl font-black uppercase tracking-wider text-white mt-12">Levels</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mt-4">
              {d.vaults.map((v, i) => (
                <div key={v.id}>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-amber-400 mb-1.5">Level {i + 1}</div>
                  <ArenaCard room={v} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function EventPage() {
  return (
    <Suspense fallback={null}>
      <EventBoard />
    </Suspense>
  );
}
