'use client';

import React, { useState } from 'react';
import { Shield, Lock, Cpu, Sparkles, Key, CheckCircle2 } from 'lucide-react';

interface Vault3DCoreProps {
  totalBounty: number;
}

export const Vault3DCore: React.FC<Vault3DCoreProps> = ({ totalBounty }) => {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    // Subtle 3D tilt
    setRotate({
      x: -y * 0.05,
      y: x * 0.05,
    });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
  };

  return (
    <div
      className="relative w-full max-w-lg mx-auto h-[380px] sm:h-[440px] flex items-center justify-center perspective-1000 select-none cursor-pointer"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* 3D Tilting Container */}
      <div
        className="relative w-full h-full flex items-center justify-center preserve-3d transition-transform duration-300 ease-out"
        style={{
          transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
        }}
      >
        {/* Background Ambient Aura */}
        <div className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-emerald-500/15 blur-[90px] pointer-events-none" />
        <div className="absolute w-56 h-56 sm:w-72 sm:h-72 rounded-full bg-cyan-500/10 blur-[80px] pointer-events-none" />

        {/* Outer Ring 1: Clockwise Dashed Cyber Gyro */}
        <div className="absolute w-[300px] h-[300px] sm:w-[380px] sm:h-[380px] rounded-full border border-dashed border-emerald-500/30 animate-spin-slow pointer-events-none" />

        {/* Outer Ring 2: Counter-Clockwise Concentric Tech Ring */}
        <div className="absolute w-[250px] h-[250px] sm:w-[320px] sm:h-[320px] rounded-full border border-cyan-500/25 animate-spin-reverse pointer-events-none" />

        {/* Center Pulsing Energy Wave */}
        <div className="absolute w-[200px] h-[200px] sm:w-[260px] sm:h-[260px] rounded-full border-2 border-emerald-400/40 animate-pulse-ring pointer-events-none" />

        {/* Inner 3D Holographic Vault Safe Core */}
        <div className="relative w-44 h-44 sm:w-56 sm:h-56 rounded-3xl bg-zinc-950/90 border-2 border-emerald-400/70 holo-glow flex flex-col items-center justify-center p-4 backdrop-blur-2xl transition-all duration-300 hover:scale-105 hover:border-emerald-300">
          {/* Corner Tech Accents */}
          <div className="absolute -top-1.5 -left-1.5 w-4 h-4 border-t-2 border-l-2 border-emerald-400" />
          <div className="absolute -top-1.5 -right-1.5 w-4 h-4 border-t-2 border-r-2 border-emerald-400" />
          <div className="absolute -bottom-1.5 -left-1.5 w-4 h-4 border-b-2 border-l-2 border-emerald-400" />
          <div className="absolute -bottom-1.5 -right-1.5 w-4 h-4 border-b-2 border-r-2 border-emerald-400" />

          {/* Central Animated Hologram Icon */}
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-emerald-950/70 border border-emerald-500/50 flex items-center justify-center mb-3 shadow-[0_0_25px_rgba(16,185,129,0.4)]">
            <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-400 animate-pulse" />
            <Lock className="w-4 h-4 text-white absolute" />
          </div>

          <div className="font-mono text-center">
            <div className="text-[10px] sm:text-[11px] text-zinc-400 uppercase tracking-widest font-semibold flex items-center justify-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              ESCROW LOCKED
            </div>
            <div className="text-xl sm:text-2xl font-black text-white tracking-wider mt-0.5">
              {totalBounty.toFixed(1)} <span className="text-emerald-400 text-sm">NEAR</span>
            </div>
          </div>
        </div>

        {/* Floating 3D Satellite Badge 1 (Top Left) */}
        <div
          className="absolute -top-2 left-2 sm:-left-6 p-2.5 sm:p-3 rounded-2xl bg-zinc-950/90 border border-emerald-500/40 shadow-2xl backdrop-blur-xl animate-float flex items-center gap-2.5 font-mono text-[11px] sm:text-xs"
          style={{ transform: 'translateZ(40px)' }}
        >
          <div className="w-7 h-7 rounded-xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400 text-sm">
            ⚡
          </div>
          <div>
            <div className="font-bold text-white">NEAR Smart Escrow</div>
            <div className="text-[10px] text-emerald-400">Zero-Trust Payouts</div>
          </div>
        </div>

        {/* Floating 3D Satellite Badge 2 (Top Right) */}
        <div
          className="absolute top-8 right-2 sm:-right-8 p-2.5 sm:p-3 rounded-2xl bg-zinc-950/90 border border-cyan-500/40 shadow-2xl backdrop-blur-xl animate-float-reverse flex items-center gap-2.5 font-mono text-[11px] sm:text-xs"
          style={{ transform: 'translateZ(50px)' }}
        >
          <div className="w-7 h-7 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 text-sm">
            🤖
          </div>
          <div>
            <div className="font-bold text-white">Autonomous Guardian</div>
            <div className="text-[10px] text-cyan-400">Strict System Directive</div>
          </div>
        </div>

        {/* Floating 3D Satellite Badge 3 (Bottom Center) */}
        <div
          className="absolute -bottom-4 sm:-bottom-6 px-4 py-2 rounded-full bg-zinc-950/95 border border-emerald-500/50 shadow-2xl backdrop-blur-xl animate-float flex items-center gap-2 font-mono text-[11px] sm:text-xs text-zinc-200"
          style={{ transform: 'translateZ(60px)' }}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Crack the prompt = <strong className="text-emerald-400 font-bold">100% onchain bounty</strong></span>
        </div>
      </div>
    </div>
  );
};
