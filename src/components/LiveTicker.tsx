'use client';

import React from 'react';
import { useNear } from '@/lib/nearContext';
import { Radio, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';

export const LiveTicker: React.FC = () => {
  const { attempts, rooms } = useNear();

  const recentAttempts = attempts.slice(0, 8);

  const getRoomName = (roomId: string) => {
    return rooms.find(r => r.id === roomId)?.name || roomId;
  };

  return (
    <div className="bg-zinc-950 border-y border-zinc-800/80 py-2 overflow-hidden text-xs font-mono">
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-3">
        {/* Label */}
        <div className="flex items-center gap-1.5 text-emerald-400 font-bold shrink-0 tracking-wider">
          <Radio className="w-3.5 h-3.5 text-red-500 animate-ping" />
          <span>LIVE RED-TEAM STREAM:</span>
        </div>

        {/* Marquee ticker */}
        <div className="flex items-center gap-6 overflow-x-auto no-scrollbar scroll-smooth whitespace-nowrap">
          {recentAttempts.map(att => (
            <div
              key={att.id}
              className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-zinc-900/80 border border-zinc-800 text-[11px]"
            >
              <span className="text-zinc-400 font-semibold">{att.attacker}</span>
              <span className="text-zinc-600">→</span>
              <span className="text-zinc-300 max-w-[150px] truncate">{getRoomName(att.roomId)}</span>
              <span className="text-zinc-500 font-mono">[{att.attackVector || 'Infiltration'}]</span>
              {att.success ? (
                <span className="inline-flex items-center gap-1 text-emerald-400 font-bold bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-500/40">
                  <CheckCircle className="w-3 h-3" />
                  BREACHED (+{att.feePaid}Ⓝ)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-red-400 bg-red-950/50 px-1.5 py-0.5 rounded border border-red-900/40">
                  <ShieldAlert className="w-3 h-3" />
                  DEFENDED
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

