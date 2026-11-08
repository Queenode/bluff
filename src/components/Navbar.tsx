'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useNear } from '@/lib/nearContext';
import { Shield, Plus, Wallet, ChevronDown, Check } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { accountId, balance, isConnected, connectWallet, disconnectWallet, switchAccount, rooms } = useNear();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const totalBounty = rooms
    .filter(r => r.status === 'active')
    .reduce((acc, curr) => acc + curr.bounty, 0);

  const accounts = [
    { id: 'whitehat.testnet', label: 'Whitehat (You)', bal: balance },
    { id: 'alice_squad.testnet', label: 'Alice (Squad Host)', bal: 25.0 },
    { id: 'zeroday.near', label: 'ZeroDay (Researcher)', bal: 142.5 }
  ];

  return (
    <nav className="border-b border-zinc-800/80 bg-black/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center text-emerald-400 group-hover:border-emerald-500/50 transition-colors">
                <Shield className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="font-mono text-base font-bold tracking-tight text-white">
                AGENT<span className="text-emerald-400">HEIST</span>
              </span>
            </Link>

            {/* Nav links */}
            <div className="hidden md:flex items-center gap-6 text-xs font-mono text-zinc-400">
              <Link href="/" className="hover:text-white transition-colors">
                Active Vaults
              </Link>
              <Link href="/cve" className="hover:text-white transition-colors">
                CVE Vulnerabilities
              </Link>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            {/* Escrow Tally */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900/90 border border-zinc-800 text-xs font-mono">
              <span className="text-zinc-500">Escrow:</span>
              <span className="font-bold text-emerald-400">{totalBounty.toFixed(1)} NEAR</span>
            </div>

            {/* Launch Vault Button */}
            <Link
              href="/create"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white hover:bg-zinc-200 text-black text-xs font-mono font-semibold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Deploy Vault</span>
            </Link>

            {/* Wallet Dropdown */}
            {isConnected ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs font-mono text-zinc-200 transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="font-semibold text-white">{balance.toFixed(1)} Ⓝ</span>
                  <span className="text-zinc-500">|</span>
                  <span className="text-zinc-400 max-w-[90px] truncate">{accountId}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-60 rounded-xl bg-zinc-950 border border-zinc-800 shadow-2xl p-2 z-50 text-xs font-mono">
                    <div className="px-3 py-1.5 text-[10px] text-zinc-500 uppercase tracking-wider">
                      Switch NEAR Account
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
                              ? 'bg-zinc-900 text-white border border-zinc-700'
                              : 'hover:bg-zinc-900/60 text-zinc-400'
                          }`}
                        >
                          <div>
                            <div className="text-white text-xs">{acc.label}</div>
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
                        Disconnect
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => connectWallet()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-xs font-mono text-white transition-colors"
              >
                <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                Connect
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
