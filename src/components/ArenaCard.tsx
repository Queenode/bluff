'use client';

import React from 'react';
import Link from 'next/link';
import { difficultyOf, isInviteOnly, roomPhase, shortAccount, yoctoToNear, type Room } from '@/lib/near';
import { useNow } from '@/lib/useChain';
import { ChallengeTimer } from '@/components/ChallengeTimer';
import { Shield, Swords, Skull, AlertTriangle, Loader2, Lock } from 'lucide-react';

export const ArenaCard: React.FC<{ room: Room }> = ({ room }) => {
  const now = useNow(5000);
  const phase = now === null ? (room.status === 'Breached' ? 'Breached' : 'Live') : roomPhase(room, now);
  const diff = difficultyOf(room.difficulty);
  const closed = phase === 'Breached' || phase === 'Expired' || phase === 'Refunded';

  return (
    <div
      className={`group relative clip-game-card border transition-all duration-300 flex flex-col justify-between overflow-hidden bg-[#060a11] ${
        closed
          ? 'border-zinc-800/80 opacity-80'
          : 'border-zinc-800 hover:border-emerald-500/60 hover:-translate-y-1 hover:shadow-[0_12px_35px_rgba(16,185,129,0.16)]'
      }`}
    >
      <div
        className={`h-1.5 w-full bg-gradient-to-r ${
          phase === 'Breached'
            ? 'from-red-600 to-zinc-800'
            : closed
            ? 'from-amber-600/70 to-zinc-800'
            : 'from-emerald-500 to-teal-400'
        }`}
      />

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-4">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
              {isInviteOnly(room) && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/40 text-amber-300">
                  <Lock className="w-2.5 h-2.5" /> SQUAD
                </span>
              )}
              VAULT #{room.id} • by {shortAccount(room.host, 20)}
            </span>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-[10px] font-display font-extrabold uppercase border-emerald-500/40 bg-emerald-950/60 text-emerald-300">
              <span>{diff.label}</span>
              <span className="flex items-center gap-0.5 ml-0.5">
                {[1, 2, 3].map(n => (
                  <span key={n} className={`w-1 h-2.5 rounded-xs ${n <= diff.bars ? 'bg-emerald-400' : 'bg-zinc-800'}`} />
                ))}
              </span>
            </div>
          </div>

          <div className="mb-3">
            <h3 className="font-display text-base font-black uppercase tracking-wider text-white group-hover:text-emerald-300 transition-colors flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="truncate">{room.name}</span>
            </h3>
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-zinc-400 mt-2 uppercase">
              {phase === 'Breached' ? (
                <span className="inline-flex items-center gap-1 text-red-400 font-bold">
                  <Skull className="w-3 h-3" /> BREACHED
                </span>
              ) : closed ? (
                <span className="inline-flex items-center gap-1 text-amber-400 font-bold">
                  <AlertTriangle className="w-3 h-3" /> {phase === 'Refunded' ? 'CLOSED' : 'EXPIRED'} • UNDEFEATED
                </span>
              ) : phase === 'Arming' ? (
                <span className="inline-flex items-center gap-1 text-sky-400 font-bold">
                  <Loader2 className="w-3 h-3 animate-spin" /> ARMING
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-emerald-400 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  GUARDIAN ONLINE
                </span>
              )}
              {!closed && (
                <>
                  <span className="text-zinc-700">•</span>
                  <ChallengeTimer expiresAt={Number(room.expires_at)} status="active" compact />
                </>
              )}
            </div>
          </div>

          <p className="text-xs text-zinc-400 mb-4 font-mono">
            Guardian: <span className="text-zinc-200">{room.guardian_name}</span>
          </p>
          <p className="text-xs sm:text-sm text-zinc-300 line-clamp-2 mb-4 leading-relaxed">{room.system_prompt}</p>
        </div>

        <div className="pt-3 border-t border-zinc-800/80">
          <div className="flex items-center justify-between mb-3.5">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
                {phase === 'Breached' ? 'PAID OUT' : 'LOOT POT'}
              </div>
              <div className="flex items-baseline gap-1 font-display">
                <span className="text-2xl font-black text-white">
                  {yoctoToNear(phase === 'Breached' ? room.payout : room.bounty, 2)}
                </span>
                <span className="text-xs font-extrabold text-emerald-400">NEAR</span>
              </div>
            </div>
            <div className="text-right font-mono">
              <div className="text-[10px] uppercase tracking-widest text-zinc-400">PER PROMPT</div>
              <div className="text-xs font-display font-bold text-zinc-200">{yoctoToNear(room.entry_fee, 2)} Ⓝ</div>
              <div className="text-[10px] text-zinc-500 uppercase">{room.attempts_count} ATTEMPTS</div>
            </div>
          </div>

          <Link
            href={`/arena/${room.id}`}
            className={`w-full py-3 px-4 clip-game-btn font-display text-xs font-black uppercase tracking-[0.14em] flex items-center justify-center gap-2 transition-all ${
              closed
                ? 'bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300'
                : 'bg-emerald-500/15 hover:bg-emerald-500 border border-emerald-500/50 hover:border-emerald-400 text-emerald-300 hover:text-[#03060a]'
            }`}
          >
            {phase === 'Breached' ? (
              <>
                <Skull className="w-3.5 h-3.5 text-red-400" />
                <span className="truncate">[ WON BY {shortAccount(room.winner || '', 18)} ]</span>
              </>
            ) : closed ? (
              <span>[ VIEW TRANSCRIPTS ]</span>
            ) : (
              <>
                <Swords className="w-3.5 h-3.5" />
                <span>[ CHALLENGE GUARDIAN ]</span>
              </>
            )}
          </Link>
        </div>
      </div>
    </div>
  );
};
