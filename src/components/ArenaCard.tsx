'use client';

import React from 'react';
import Link from 'next/link';
import { ArenaRoom } from '@/types';
import { Shield, Users, Building, Globe, Zap, ArrowRight, Award, Lock, CheckCircle2 } from 'lucide-react';

interface ArenaCardProps {
  room: ArenaRoom;
}

export const ArenaCard: React.FC<ArenaCardProps> = ({ room }) => {
  const isBreached = room.status === 'breached';

  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case 'GodMode':
        return 'bg-purple-950/80 text-purple-300 border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.2)]';
      case 'Fortress':
        return 'bg-amber-950/80 text-amber-300 border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.2)]';
      case 'Hardened':
        return 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.2)]';
      default:
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50';
    }
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'squad':
        return {
          label: 'SQUAD STAND-OFF',
          icon: <Users className="w-3.5 h-3.5 text-blue-400" />,
          color: 'text-blue-400 border-blue-500/30 bg-blue-950/40'
        };
      case 'enterprise':
        return {
          label: 'ENTERPRISE BOUNTY',
          icon: <Building className="w-3.5 h-3.5 text-amber-400" />,
          color: 'text-amber-400 border-amber-500/30 bg-amber-950/40'
        };
      default:
        return {
          label: 'GLOBAL JACKPOT',
          icon: <Globe className="w-3.5 h-3.5 text-emerald-400" />,
          color: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/40'
        };
    }
  };

  const category = getCategoryBadge(room.category);

  return (
    <div
      className={`group relative rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden bg-zinc-950/90 ${
        isBreached
          ? 'border-zinc-800 opacity-80'
          : 'border-zinc-800 hover:border-emerald-500/60 hover:shadow-[0_0_25px_rgba(16,185,129,0.15)]'
      }`}
    >
      {/* Top Banner Accent */}
      <div
        className={`h-1 w-full ${
          isBreached
            ? 'bg-zinc-700'
            : room.category === 'squad'
            ? 'bg-blue-500'
            : room.category === 'enterprise'
            ? 'bg-amber-500'
            : 'bg-emerald-500'
        }`}
      />

      <div className="p-5 flex-1 flex flex-col justify-between">
        {/* Header Tags */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-mono font-medium ${category.color}`}
            >
              {category.icon}
              <span>{category.label}</span>
            </div>

            <div
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider border ${getDifficultyBadge(
                room.difficulty
              )}`}
            >
              {room.difficulty}
            </div>
          </div>

          {/* Title & Host */}
          <div className="mb-3">
            <h3 className="text-lg font-bold font-mono text-white group-hover:text-emerald-300 transition-colors flex items-center gap-2">
              <span>{room.guardian.avatar}</span>
              <span>{room.name}</span>
            </h3>
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 mt-1">
              <span>Host:</span>
              <span className="text-zinc-300 font-semibold">{room.host}</span>
              {room.expiresAt && (
                <>
                  <span className="text-zinc-600">•</span>
                  <span className="text-amber-400 font-medium">⏳ Active Round</span>
                </>
              )}
            </div>
          </div>

          {/* Description */}
          <p className="text-xs text-zinc-400 line-clamp-2 mb-4 leading-relaxed font-sans">
            {room.description}
          </p>

          {/* Target Objective Pill */}
          <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800/80 mb-4 text-xs font-mono">
            <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] mb-1">
              <Lock className="w-3 h-3 text-emerald-400" />
              <span className="uppercase tracking-wider">Mission Objective:</span>
            </div>
            <div className="text-zinc-200 text-[11px] font-medium truncate">
              {room.targetObjective}
            </div>
          </div>
        </div>

        {/* Bottom Section: Bounty & Action */}
        <div className="pt-3 border-t border-zinc-800/80">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-[10px] font-mono uppercase text-zinc-500">Vault Escrow</div>
              <div className="flex items-baseline gap-1 font-mono">
                <span className="text-2xl font-black text-emerald-400">{room.bounty.toFixed(1)}</span>
                <span className="text-xs font-bold text-emerald-600">NEAR</span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] font-mono uppercase text-zinc-500">Entry Fee</div>
              <div className="text-xs font-mono font-bold text-zinc-300">
                {room.entryFee} NEAR <span className="text-[10px] text-zinc-500">/ try</span>
              </div>
              <div className="text-[10px] font-mono text-zinc-500">{room.attemptsCount} attempts</div>
            </div>
          </div>

          {/* Breached vs Infiltrate button */}
          {isBreached ? (
            <Link
              href={`/arena/${room.id}`}
              className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 text-zinc-300 font-mono text-xs font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span>BREACHED BY {room.winner}</span>
            </Link>
          ) : (
            <Link
              href={`/arena/${room.id}`}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-500/10 border border-emerald-500/40 hover:bg-emerald-500 hover:text-black text-emerald-300 font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(16,185,129,0.1)] hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]"
            >
              <Zap className="w-4 h-4" />
              <span>INFILTRATE VAULT</span>
              <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

