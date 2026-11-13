'use client';

import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, CheckCircle, Skull } from 'lucide-react';

interface ChallengeTimerProps {
  expiresAt?: number;
  status: 'active' | 'breached' | 'expired';
  onExpire?: () => void;
  compact?: boolean;
}

export const ChallengeTimer: React.FC<ChallengeTimerProps> = ({
  expiresAt,
  status,
  onExpire,
  compact = false
}) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    totalMs: number;
    isExpired: boolean;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalMs: 0,
    isExpired: false
  });

  useEffect(() => {
    if (!expiresAt) return;

    const calculateTime = () => {
      const now = Date.now();
      const diff = expiresAt - now;

      if (diff <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          totalMs: 0,
          isExpired: true
        });
        if (status === 'active' && onExpire) {
          onExpire();
        }
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({
        days,
        hours,
        minutes,
        seconds,
        totalMs: diff,
        isExpired: false
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, status, onExpire]);

  if (!expiresAt) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-zinc-400">
        <Clock className="w-3 h-3 text-zinc-500" />
        <span>NO TIMELINE (PERPETUAL)</span>
      </span>
    );
  }

  if (status === 'breached') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded clip-game-btn bg-red-950/70 border border-red-500/40 text-red-400 text-[10px] font-display font-bold uppercase tracking-wider">
        <Skull className="w-3 h-3 text-red-400" />
        <span>CHALLENGE ENDED // BOSS SLAIN</span>
      </span>
    );
  }

  if (timeLeft.isExpired || status === 'expired') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded clip-game-btn bg-zinc-900 border border-zinc-700 text-zinc-400 text-[10px] font-display font-bold uppercase tracking-wider">
        <AlertTriangle className="w-3 h-3 text-amber-500" />
        <span>TIMELINE EXPIRED // UNDEFEATED</span>
      </span>
    );
  }

  // Active Countdown format
  const isUrgent = timeLeft.totalMs < 1000 * 60 * 60; // less than 1 hour
  const isCritical = timeLeft.totalMs < 1000 * 60 * 15; // less than 15 mins

  const pad = (n: number) => n.toString().padStart(2, '0');

  let formattedTime = '';
  if (timeLeft.days > 0) {
    formattedTime = `${timeLeft.days}d ${pad(timeLeft.hours)}h ${pad(timeLeft.minutes)}m`;
  } else {
    formattedTime = `${pad(timeLeft.hours)}:${pad(timeLeft.minutes)}:${pad(timeLeft.seconds)}`;
  }

  if (compact) {
    return (
      <span
        className={`inline-flex items-center gap-1 font-mono text-xs font-bold ${
          isCritical
            ? 'text-red-400 animate-pulse'
            : isUrgent
            ? 'text-amber-400'
            : 'text-emerald-400'
        }`}
      >
        <Clock className="w-3 h-3" />
        <span>{formattedTime}</span>
      </span>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 rounded clip-game-btn border text-xs font-mono font-bold tracking-wider ${
        isCritical
          ? 'bg-red-950/60 border-red-500/50 text-red-300 animate-pulse'
          : isUrgent
          ? 'bg-amber-950/50 border-amber-500/40 text-amber-300'
          : 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
      }`}
    >
      <Clock className={`w-3.5 h-3.5 ${isCritical ? 'text-red-400' : 'text-emerald-400'}`} />
      <span className="text-[10px] uppercase text-zinc-400">TIMELINE:</span>
      <span className="font-display font-black tracking-widest">{formattedTime}</span>
    </div>
  );
};

