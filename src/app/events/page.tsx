'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Flag, Lock, Trophy, EyeOff, Plus, ArrowRight } from 'lucide-react';
import { useChain } from '@/lib/useChain';
import { useWallet } from '@/lib/wallet';
import { api, isHeist, isInviteOnly, yoctoToNear } from '@/lib/near';
import { eventUrl } from '@/lib/events';
import { ShareButtons } from '@/components/ShareButtons';

export default function EventsPage() {
  const { accountId, connect } = useWallet();
  const rooms = useChain(() => api.rooms(0, 100), [], 20_000);
  const [name, setName] = useState('');
  const [picked, setPicked] = useState<string[]>([]);

  const hosts = useMemo(() => {
    const m = new Map<string, { vaults: number; pot: bigint; attempts: number }>();
    for (const r of rooms.data ?? []) {
      const h = m.get(r.host) ?? { vaults: 0, pot: BigInt(0), attempts: 0 };
      h.vaults++;
      h.attempts += r.attempts_count;
      if (r.status !== 'Breached') h.pot += BigInt(r.bounty);
      m.set(r.host, h);
    }
    return [...m.entries()].sort((a, b) => b[1].attempts - a[1].attempts);
  }, [rooms.data]);

  const mine = useMemo(() => (rooms.data ?? []).filter(r => r.host === accountId), [rooms.data, accountId]);
  const link = accountId ? eventUrl(accountId, name.trim() || undefined, picked.length ? picked : undefined) : '';
  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <div className="min-h-screen bg-[#03060a] px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-amber-400 mb-2">{'// '}EVENTS &amp; CTFS</div>
        <h1 className="font-display text-3xl sm:text-5xl font-black uppercase tracking-wider text-white text-glow-white">
          Run your own AI CTF
        </h1>
        <p className="text-zinc-300 mt-3 max-w-3xl">
          Hackathons, security teams, classrooms and communities can run a private prompt-injection competition on BLUFF. Each level is a vault you
          host. The board ranks your players straight from the contract, and payouts are automatic.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
          {[
            [<Flag key="i" className="w-5 h-5" />, '1. Build levels', 'Host a few vaults from one account: an easy Standard guardian, a Hardened one, a Fortress boss, or a Heist wallet.'],
            [<Lock key="i" className="w-5 h-5" />, '2. Invite players', 'Make them Squad vaults and list your participants’ wallets (up to 50 per level, add more any time).'],
            [<Trophy key="i" className="w-5 h-5" />, '3. Share the board', 'One link shows every level and a live scoreboard. Harder levels are worth more points.'],
            [<EyeOff key="i" className="w-5 h-5" />, 'Fair by design', 'Not even you, the organiser, can see the secret codes, and every prompt is stored onchain. Nobody can rig it.'],
          ].map(([icon, t, d], i) => (
            <div key={i} className="clip-game-card border border-amber-500/30 bg-[#0c0a06] p-5">
              <div className="text-amber-300">{icon}</div>
              <div className="font-display font-black uppercase tracking-wider text-white mt-2 text-sm">{t}</div>
              <p className="text-[12px] text-zinc-400 mt-1.5 leading-relaxed">{d}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 clip-game-card border border-emerald-500/30 bg-[#060c10] p-6">
          <div className="font-display font-black uppercase tracking-wider text-emerald-300">Event builder</div>
          {!accountId ? (
            <div className="mt-3 text-sm text-zinc-300">
              Connect the wallet that hosts your levels.{' '}
              <button onClick={connect} className="text-emerald-300 underline">
                Connect wallet
              </button>
            </div>
          ) : mine.length === 0 ? (
            <div className="mt-3 text-sm text-zinc-300">
              {accountId} hasn&apos;t hosted any vaults yet.{' '}
              <Link href="/create" className="text-emerald-300 underline inline-flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" /> Host your first level
              </Link>
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-[11px] font-display font-bold uppercase tracking-wider text-zinc-300 mb-1.5">Event name</label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  maxLength={80}
                  placeholder="Acme Security CTF 2026"
                  className="w-full bg-black/60 border border-zinc-800 focus:border-emerald-500/60 outline-none rounded px-3 py-2.5 font-mono text-sm text-zinc-100"
                />
                <div className="text-[11px] font-display font-bold uppercase tracking-wider text-zinc-300 mt-4 mb-1.5">
                  Levels {picked.length === 0 && <span className="text-zinc-500 normal-case font-mono">(none ticked = all your vaults)</span>}
                </div>
                <div className="space-y-1.5 max-h-64 overflow-auto pr-1">
                  {mine.map(r => (
                    <label key={r.id} className="flex items-center gap-2 text-[12px] font-mono text-zinc-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={picked.includes(r.id)}
                        onChange={e => setPicked(p => (e.target.checked ? [...p, r.id] : p.filter(x => x !== r.id)))}
                      />
                      #{r.id} {r.name} {isHeist(r) ? '💸' : ''} {isInviteOnly(r) ? '🔒' : ''}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-[11px] font-display font-bold uppercase tracking-wider text-zinc-300 mb-1.5">Your board link</div>
                <div className="bg-black/60 border border-zinc-800 rounded px-3 py-2.5 font-mono text-xs text-emerald-200 break-all">{origin + link}</div>
                <Link href={link} className="mt-3 inline-flex items-center gap-1.5 text-sm text-emerald-300 hover:underline">
                  Open the board <ArrowRight className="w-4 h-4" />
                </Link>
                <ShareButtons
                  url={origin + link}
                  label="Send it to your players"
                  text={`🏁 ${name.trim() || 'My AI CTF'} is live on BLUFF. Out-talk the AI guardians, climb the board.`}
                />
              </div>
            </div>
          )}
        </div>

        <h2 className="font-display text-xl font-black uppercase tracking-wider text-white mt-12">Event boards</h2>
        <p className="text-[12px] font-mono text-zinc-500 mt-1">Every host account has a board for the vaults it runs.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
          {hosts.map(([h, s]) => (
            <Link
              key={h}
              href={`/event/${h}`}
              className="clip-game-card border border-zinc-800 hover:border-amber-500/50 bg-[#060a11] p-5 transition-colors"
            >
              <div className="font-mono text-sm text-white break-all">{h}</div>
              <div className="text-[11px] font-mono text-zinc-400 mt-2">
                {s.vaults} level{s.vaults === 1 ? '' : 's'} • {s.attempts} attempts • {yoctoToNear(s.pot, 2)} Ⓝ in play
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
