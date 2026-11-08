'use client';

import React from 'react';
import Link from 'next/link';
import { ArenaRoom } from '@/types';
import { Shield, Users, Building, Globe, Swords, Skull, Target } from 'lucide-react';

interface ArenaCardProps {
  room: ArenaRoom;
}

export const ArenaCard: React.FC<ArenaCardProps> = ({ room }) => {
  const isBreached = room.status === 'breached';

  const getDifficultyLevel = (diff: string) => {
    switch (diff) {
      case 'GodMode':
        return {
          lvl: 'LVL 99',
          bars: 4,
          color: 'bg-emerald-400',
          text: 'text-emerald-300',
          border: 'border-emerald-500/40 bg-emerald-950/60'
        };
      case 'Fortress':
        return {
          lvl: 'LVL 75',
          bars: 3,
          color: 'bg-emerald-400',
          text: 'text-emerald-300',
          border: 'border-emerald-500/40 bg-emerald-950/60'
        };
      case 'Hardened':
        return {
          lvl: 'LVL 50',
          bars: 2,
          color: 'bg-emerald-400',
          text: 'text-emerald-300',
          border: 'border-emerald-500/40 bg-emerald-950/60'
        };
      default:
        return {
          lvl: 'LVL 20',
          bars: 1,
          color: 'bg-emerald-400',
          text: 'text-emerald-300',
          border: 'border-emerald-500/40 bg-emerald-950/60'
        };
    }
  };

  const getModeBadge = (cat: string) => {
    switch (cat) {
      case 'squad':
        return {
          label: 'SQUAD DEATHMATCH',
          icon: <Users className="w-3 h-3 text-emerald-400" />,
          color: 'text-emerald-300 border-emerald-500/30 bg-emerald-950/40',
          accent: 'from-emerald-500 to-teal-400'
        };
      case 'enterprise':
        return {
          label: 'PROTOCOL BOUNTY',
          icon: <Building className="w-3 h-3 text-emerald-400" />,
          color: 'text-emerald-300 border-emerald-500/30 bg-emerald-950/40',
          accent: 'from-emerald-500 to-teal-400'
        };
      default:
        return {
          label: 'GLOBAL RAID BOSS',
          icon: <Globe className="w-3 h-3 text-emerald-400" />,
          color: 'text-emerald-300 border-emerald-500/30 bg-emerald-950/40',
          accent: 'from-emerald-500 to-teal-400'
        };
    }
  };

  const mode = getModeBadge(room.category);
  const diff = getDifficultyLevel(room.difficulty);

  return (
    <div
      className={`group relative clip-game-card border transition-all duration-300 flex flex-col justify-between overflow-hidden bg-[#060a11] ${
        isBreached
          ? 'border-zinc-800/70 opacity-75'
          : 'border-zinc-800 hover:border-emerald-500/60 hover:-translate-y-1 hover:shadow-[0_12px_35px_rgba(16,185,129,0.16)]'
      }`}
    >
      {/* Top Energy Strip */}
      <div
        className={`h-1.5 w-full bg-gradient-to-r ${
          isBreached ? 'from-red-600 to-zinc-800' : mode.accent
        }`}
      />

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Top Bar: Mode Pill + Shield Power Bars */}
          <div className="flex items-center justify-between gap-2 mb-4">
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded border text-[10px] font-display font-bold tracking-wider ${mode.color}`}
            >
              {mode.icon}
              <span>{mode.label}</span>
            </div>

            {/* Difficulty Segmented Power Bars */}
            <div
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-[10px] font-display font-extrabold uppercase ${diff.border} ${diff.text}`}
            >
              <span>{diff.lvl}</span>
              <span className="flex items-center gap-0.5 ml-0.5">
                {[1, 2, 3, 4].map(n => (
                  <span
                    key={n}
                    className={`w-1 h-2.5 rounded-xs ${
                      n <= diff.bars ? diff.color : 'bg-zinc-800'
                    }`}
                  />
                ))}
              </span>
            </div>
          </div>

          {/* Boss Name & Status */}
          <div className="mb-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-display text-base font-black uppercase tracking-wider text-white group-hover:text-emerald-300 transition-colors flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{room.name}</span>
              </h3>
            </div>

            <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400 mt-1.5 uppercase">
              {isBreached ? (
                <span className="inline-flex items-center gap-1 text-red-400 font-bold">
                  <Skull className="w-3 h-3" /> BOSS SLAIN
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-emerald-400 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  BOSS ALIVE
                </span>
              )}
              <span className="text-zinc-700">•</span>
              <span className="truncate">
                HOST: <strong className="text-zinc-200">{room.host}</strong>
              </span>
            </div>
          </div>

          {/* Lore / Description */}
          <p className="text-xs sm:text-sm text-zinc-300 line-clamp-2 mb-4 leading-relaxed">
            {room.description}
          </p>

          {/* Win Condition Box */}
          <div className="p-3 rounded-lg bg-black/60 border border-zinc-800/90 mb-4 text-xs font-mono">
            <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-display font-bold uppercase tracking-wider mb-1">
              <Target className="w-3 h-3" />
              <span>WIN CONDITION:</span>
            </div>
            <div className="text-zinc-200 text-[11px] font-medium truncate">
              {room.targetObjective}
            </div>
          </div>
        </div>

        {/* Bottom HUD: Loot Pot & Challenge CTA */}
        <div className="pt-3 border-t border-zinc-800/80">
          <div className="flex items-center justify-between mb-3.5">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
                LOOT POT
              </div>
              <div className="flex items-baseline gap-1 font-display">
                <span className="text-2xl font-black text-white">{room.bounty.toFixed(1)}</span>
                <span className="text-xs font-extrabold text-emerald-400">NEAR</span>
              </div>
            </div>

            <div className="text-right font-mono">
              <div className="text-[10px] uppercase tracking-widest text-zinc-400">TURN COST</div>
              <div className="text-xs font-display font-bold text-zinc-200">
                {room.entryFee} Ⓝ <span className="text-[10px] font-mono text-zinc-500">/ ATK</span>
              </div>
              <div className="text-[10px] text-zinc-500 uppercase">{room.attemptsCount} ATTACKS</div>
            </div>
          </div>

          {isBreached ? (
            <Link
              href={`/arena/${room.id}`}
              className="w-full py-3 px-4 clip-game-btn bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 font-display text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
            >
              <Skull className="w-3.5 h-3.5 text-red-400" />
              <span>[ SLAIN BY {room.winner} ]</span>
            </Link>
          ) : (
            <Link
              href={`/arena/${room.id}`}
              className="w-full py-3 px-4 clip-game-btn bg-emerald-500/15 hover:bg-emerald-500 border border-emerald-500/50 hover:border-emerald-400 text-emerald-300 hover:text-[#03060a] font-display text-xs font-black uppercase tracking-[0.14em] flex items-center justify-center gap-2 transition-all active:translate-y-0.5"
            >
              <Swords className="w-3.5 h-3.5" />
              <span>[ CHALLENGE BOSS ]</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
