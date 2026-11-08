'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useNear } from '@/lib/nearContext';
import { Wallet, ChevronDown, Check } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { accountId, balance, isConnected, connectWallet, disconnectWallet, switchAccount } = useNear();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const accounts = [
    { id: 'whitehat.testnet', label: 'Whitehat (You)', bal: balance },
    { id: 'alice_squad.testnet', label: 'Alice (Squad Host)', bal: 25.0 },
    { id: 'zeroday.near', label: 'ZeroDay (Researcher)', bal: 142.5 }
  ];

  return (
    <nav className="border-b border-white/5 bg-[#05080f]/85 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Brand Wordmark + Minimal Links */}
          <div className="flex items-center gap-8">
            <Link href="/" className="text-lg font-bold tracking-tight text-emerald-400 hover:text-emerald-300 transition-colors">
              AgentHeist
            </Link>

            <div className="hidden md:flex items-center gap-6 text-xs font-medium text-zinc-400">
              <Link href="/#vaults" className="hover:text-white transition-colors">
                Arenas
              </Link>
              <Link href="/cve" className="hover:text-white transition-colors">
                Exploit Intel
              </Link>
            </div>
          </div>

          {/* Right: Clean Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/create"
              className="px-3.5 py-1.5 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-200 text-xs font-medium transition-colors"
            >
              Deploy Vault
            </Link>

            {isConnected ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 text-xs text-zinc-200 transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="font-semibold text-white">{balance.toFixed(1)} Ⓝ</span>
                  <span className="text-zinc-600">|</span>
                  <span className="text-zinc-400 max-w-[90px] truncate">{accountId}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-60 rounded-xl bg-zinc-950 border border-zinc-800 shadow-2xl p-2 z-50 text-xs">
                    <div className="px-3 py-1.5 text-[10px] text-zinc-500 uppercase tracking-wider font-mono">
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
                            <div className="text-white text-xs font-medium">{acc.label}</div>
                            <div className="text-[10px] text-zinc-500 font-mono">{acc.id}</div>
                          </div>
                          <div className="text-right font-mono">
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
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-semibold transition-colors"
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>Connect Wallet</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
