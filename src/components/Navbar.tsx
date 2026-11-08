'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useNear } from '@/lib/nearContext';
import { Shield, Flame, Terminal, PlusCircle, Wallet, ChevronDown, CheckCircle2 } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { accountId, balance, isConnected, connectWallet, disconnectWallet, switchAccount, rooms } = useNear();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const totalBounty = rooms
    .filter(r => r.status === 'active')
    .reduce((acc, curr) => acc + curr.bounty, 0);

  const accounts = [
    { id: 'whitehat.testnet', label: 'Whitehat (You)', bal: balance },
    { id: 'alice_squad.testnet', label: 'Alice (Squad Host)', bal: 25.0 },
    { id: 'zeroday.near', label: 'ZeroDay (Pro Researcher)', bal: 142.5 }
  ];

  return (
    <nav className="border-b border-emerald-950/80 bg-black/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:border-emerald-400 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                <Shield className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <span className="font-mono text-xl font-black tracking-wider text-white">
                  AGENT<span className="text-emerald-400">[HEIST]</span>
                </span>
                <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  NEAR TESTNET ENCLAVE
                </div>
              </div>
            </Link>

            {/* Nav links */}
            <div className="hidden md:flex items-center gap-1 text-sm font-mono">
              <Link
                href="/"
                className="px-3 py-1.5 rounded-md text-zinc-300 hover:text-white hover:bg-emerald-950/40 transition-colors"
              >
                Vaults
              </Link>
              <Link
                href="/cve"
                className="px-3 py-1.5 rounded-md text-zinc-300 hover:text-white hover:bg-emerald-950/40 transition-colors flex items-center gap-1.5"
              >
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                CVE Vulnerabilities
              </Link>
            </div>
          </div>

          {/* Right side controls */}
          <div className="flex items-center gap-3">
            {/* Live Escrow Pool Pill */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/50 border border-emerald-500/20 text-xs font-mono text-emerald-300">
              <Flame className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
              <span>ACTIVE ESCROW:</span>
              <span className="font-bold text-white">{totalBounty.toFixed(1)} NEAR</span>
            </div>

            {/* Create Room CTA */}
            <Link
              href="/create"
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-mono font-bold tracking-wide transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>LAUNCH VAULT</span>
            </Link>

            {/* Wallet Dropdown */}
            {isConnected ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 hover:border-emerald-500/50 text-xs font-mono text-zinc-200 transition-colors"
                >
                  <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-semibold text-emerald-300">{balance.toFixed(2)} Ⓝ</span>
                  <span className="text-zinc-500">|</span>
                  <span className="text-zinc-300 max-w-[100px] truncate">{accountId}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-xl bg-zinc-950 border border-emerald-900/60 shadow-2xl p-2 z-50 text-xs font-mono">
                    <div className="px-3 py-2 border-b border-zinc-800 text-[11px] text-zinc-400">
                      SWITCH TESTNET WALLET
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
                              ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                              : 'hover:bg-zinc-900 text-zinc-300'
                          }`}
                        >
                          <div>
                            <div className="font-medium text-white">{acc.label}</div>
                            <div className="text-[10px] text-zinc-500">{acc.id}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-emerald-400">{acc.bal.toFixed(1)} Ⓝ</div>
                            {acc.id === accountId && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 ml-auto mt-0.5" />}
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
                        className="w-full text-center py-1.5 text-red-400 hover:bg-red-950/30 rounded text-[11px] transition-colors"
                      >
                        Disconnect Wallet
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => connectWallet()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-emerald-500/40 hover:bg-zinc-800 text-xs font-mono text-emerald-300 transition-colors"
              >
                <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                Connect NEAR
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

