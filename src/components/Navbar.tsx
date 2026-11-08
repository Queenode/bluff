'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useNear } from '@/lib/nearContext';
import { Wallet, ChevronDown, Check, Swords, Crosshair, Menu, X } from 'lucide-react';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const {
    accountId,
    balance,
    isConnected,
    connectWallet,
    disconnectWallet,
    switchAccount,
    setActiveFilter
  } = useNear();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const accounts = [
    { id: 'whitehat.testnet', label: 'Player 1 (You)', bal: balance },
    { id: 'alice_squad.testnet', label: 'Alice (Squad Captain)', bal: 25.0 },
    { id: 'zeroday.near', label: 'ZeroDay (Top Raider)', bal: 142.5 }
  ];

  const navLinkClass = (path: string) =>
    `text-xs font-mono uppercase tracking-wider transition-colors ${
      pathname === path
        ? 'text-emerald-400 font-bold'
        : 'text-zinc-400 hover:text-white'
    }`;

  return (
    <nav className="border-b border-white/5 bg-[#05080f]/85 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Brand Wordmark + Game Nav Links */}
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-white group"
            >
              <span className="text-emerald-400 group-hover:text-emerald-300 transition-colors">
                AgentHeist
              </span>
              <span className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-[9px] font-mono text-emerald-400 uppercase tracking-widest">
                PVP ARENA
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/arenas"
                onClick={() => setActiveFilter('all')}
                className={navLinkClass('/arenas')}
              >
                Raid Lobby
              </Link>
              <Link href="/cve" className={navLinkClass('/cve')}>
                Hall of Breaches
              </Link>
            </div>
          </div>

          {/* Right: Game Actions + Player Wallet HUD */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <Link
              href="/create"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-1.5 clip-game-btn bg-zinc-900/90 hover:bg-zinc-800 border border-emerald-500/30 hover:border-emerald-400 text-zinc-100 text-xs font-mono font-bold uppercase tracking-wider transition-all"
            >
              <Swords className="w-3.5 h-3.5 text-emerald-400" />
              <span>Host Match</span>
            </Link>

            {isConnected ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900/90 border border-zinc-700/80 hover:border-emerald-500/50 text-xs font-mono text-zinc-200 transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-bold text-emerald-400">{balance.toFixed(1)} Ⓝ</span>
                  <span className="hidden sm:inline text-zinc-600">|</span>
                  <span className="hidden sm:inline text-zinc-300 max-w-[90px] truncate">{accountId}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[#070b12] border border-zinc-800 shadow-2xl p-2 z-50 text-xs font-mono">
                    <div className="px-3 py-1.5 text-[10px] text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Crosshair className="w-3 h-3 text-emerald-400" />
                      <span>Switch Player Profile</span>
                    </div>
                    <div className="space-y-1 py-1">
                      {accounts.map(acc => (
                        <button
                          key={acc.id}
                          onClick={() => {
                            switchAccount(acc.id);
                            setDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                            acc.id === accountId
                              ? 'bg-emerald-950/50 text-white border border-emerald-500/40'
                              : 'hover:bg-zinc-900/60 text-zinc-400'
                          }`}
                        >
                          <div>
                            <div className="text-white text-xs font-bold">{acc.label}</div>
                            <div className="text-[10px] text-zinc-500">{acc.id}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-emerald-400 font-bold">{acc.bal.toFixed(1)} Ⓝ</div>
                            {acc.id === accountId && <Check className="w-3 h-3 text-emerald-400 ml-auto" />}
                          </div>
                        </button>
                      ))}
                    </div>
                    <div className="pt-2 border-t border-zinc-800">
                      <button
                        onClick={() => {
                          disconnectWallet();
                          setDropdownOpen(false);
                        }}
                        className="w-full text-center py-1.5 text-zinc-500 hover:text-red-400 rounded text-[11px] transition-colors"
                      >
                        Disconnect Player
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => connectWallet()}
                className="flex items-center gap-1.5 px-4 py-1.5 clip-game-btn bg-emerald-500 hover:bg-emerald-400 text-[#03060a] text-xs font-mono font-bold uppercase tracking-wider transition-all"
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>Connect Wallet</span>
              </button>
            )}

            {/* Mobile menu toggle inside the same single navbar */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              className="md:hidden p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Compact Mobile Dropdown Panel (only renders when toggled) */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 pt-2 border-t border-white/5 flex flex-col gap-2 font-mono text-xs">
            <Link
              href="/arenas"
              onClick={() => {
                setActiveFilter('all');
                setMobileMenuOpen(false);
              }}
              className="px-3 py-2 rounded-lg bg-zinc-900/70 text-zinc-200 hover:text-emerald-400 uppercase tracking-wider font-bold"
            >
              Raid Lobby
            </Link>
            <Link
              href="/cve"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg bg-zinc-900/70 text-zinc-200 hover:text-emerald-400 uppercase tracking-wider font-bold"
            >
              Hall of Breaches
            </Link>
            <Link
              href="/create"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 clip-game-btn bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 uppercase tracking-wider font-bold flex items-center gap-2"
            >
              <Swords className="w-3.5 h-3.5" />
              <span>Host Match</span>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};
