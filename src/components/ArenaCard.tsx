'use client';

import React from 'react';
import Link from 'next/link';
import { ArenaRoom } from '@/types';
import { Shield, Users, Building, Globe, ArrowRight, Award, Lock } from 'lucide-react';

interface ArenaCardProps {
  room: ArenaRoom;
}

export const ArenaCard: React.FC<ArenaCardProps> = ({ room }) => {
  const isBreached = room.status === 'breached';

  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case 'GodMode':
        return 'bg-purple-950/60 text-purple-300 border-purple-500/40';
      case 'Fortress':
        return 'bg-amber-950/60 text-amber-300 border-amber-500/40';
      case 'Hardened':
        return 'bg-cyan-950/60 text-cyan-300 border-cyan-500/40';
      default:
        return 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40';
    }
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'squad':
        return {
          label: 'SQUAD',
          icon: <Users className="w-3 h-3 text-blue-400" />,
          color: 'text-blue-400 border-blue-500/30 bg-blue-950/30'
        };
      case 'enterprise':
        return {
          label: 'ENTERPRISE',
          icon: <Building className="w-3 h-3 text-amber-400" />,
          color: 'text-amber-400 border-amber-500/30 bg-amber-950/30'
        };
      default:
        return {
          label: 'JACKPOT',
          icon: <Globe className="w-3 h-3 text-emerald-400" />,
          color: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/30'
        };
    }
  };

  const category = getCategoryBadge(room.category);

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden bg-zinc-950 ${
        isBreached
          ? 'border-zinc-800 opacity-70'
          : 'border-zinc-800/90 hover:border-zinc-700 hover:shadow-xl'
      }`}
    >
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Header Tags */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md border text-[10px] font-mono font-medium ${category.color}`}
            >
              {category.icon}
              <span>{category.label}</span>
            </div>

            <div
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider border ${getDifficultyBadge(
                room.difficulty
              )}`}
            >
              {room.difficulty}
            </div>
          </div>

          {/* Title & Host */}
          <div className="mb-3">
            <h3 className="text-base font-bold font-mono text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{room.name}</span>
            </h3>
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 mt-1">
              <span>Host:</span>
              <span className="text-zinc-300 font-medium">{room.host}</span>
              {room.expiresAt && (
                <>
                  <span className="text-zinc-600">•</span>
                  <span className="text-amber-400">Timed Round</span>
                </>
              )}
            </div>
          </div>

          {/* Description */}
          <p className="text-xs text-zinc-400 line-clamp-2 mb-4 leading-relaxed font-sans">
            {room.description}
          </p>

          {/* Target Objective */}
          <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 mb-4 text-xs font-mono">
            <div className="flex items-center gap-1.5 text-zinc-400 text-[10px] mb-0.5">
              <Lock className="w-3 h-3 text-emerald-400" />
              <span className="uppercase tracking-wider">Mission Target:</span>
            </div>
            <div className="text-zinc-200 text-[11px] font-medium truncate">
              {room.targetObjective}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-3 border-t border-zinc-800/80">
          <div className="flex items-center justify-between mb-3 font-mono">
            <div>
              <div className="text-[10px] uppercase text-zinc-500">Escrow Pot</div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-white">{room.bounty.toFixed(1)}</span>
                <span className="text-xs font-bold text-emerald-400">NEAR</span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] uppercase text-zinc-500">Entry Fee</div>
              <div className="text-xs font-bold text-zinc-300">
                {room.entryFee} NEAR <span className="text-[10px] text-zinc-500">/ try</span>
              </div>
              <div className="text-[10px] text-zinc-500">{room.attemptsCount} attempts</div>
            </div>
          </div>

          {isBreached ? (
            <Link
              href={`/arena/${room.id}`}
              className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 font-mono text-xs font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>Breached by {room.winner}</span>
            </Link>
          ) : (
            <Link
              href={`/arena/${room.id}`}
              className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 border border-zinc-700 hover:border-emerald-500 hover:bg-emerald-500 hover:text-black text-white font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all"
            >
              <span>Infiltrate Vault</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
