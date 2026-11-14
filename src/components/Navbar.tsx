'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useWallet } from '@/lib/wallet';
import { accountUrl, NETWORK_ID, shortAccount, yoctoToNear } from '@/lib/near';
import { Wallet, ChevronDown, Swords, Menu, X, ExternalLink, LogOut } from 'lucide-react';

const LINKS = [
  { href: '/arenas', label: 'Raid Lobby' },
  { href: '/cve', label: 'Hall of Breaches' },
  { href: '/events', label: 'Events & CTFs' },
  { href: '/how-it-works', label: 'How It Works' },
];

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { accountId, balance, ready, connect, disconnect } = useWallet();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinkClass = (path: string) =>
    `whitespace-nowrap text-[11px] xl:text-xs font-display uppercase tracking-[0.12em] xl:tracking-[0.14em] transition-colors ${
      pathname === path
        ? 'text-emerald-400 font-extrabold text-glow-emerald'
        : 'text-zinc-300 hover:text-emerald-300 font-bold'
    }`;

  return (
    <nav className="border-b border-white/10 bg-[#05080f]/90 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-6 xl:gap-8">
            <Link
              href="/"
              className="flex items-center gap-2.5 text-xl font-display font-black uppercase tracking-[0.16em] text-white group"
            >
              <span className="text-emerald-400 group-hover:text-emerald-300 transition-colors text-glow-emerald">
                BLUFF
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-[9px] font-mono text-emerald-400 uppercase tracking-widest">
                {NETWORK_ID}
              </span>
            </Link>

            <div className="hidden lg:flex items-center gap-5 xl:gap-7">
              {LINKS.map(l => (
                <Link key={l.href} href={l.href} className={navLinkClass(l.href)}>
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <Link
              href="/create"
              className="hidden sm:inline-flex lg:hidden xl:inline-flex items-center gap-1.5 px-4 py-2 clip-game-btn bg-zinc-900/90 hover:bg-emerald-500 hover:text-[#03060a] border border-emerald-500/40 hover:border-emerald-400 text-zinc-100 text-[11px] font-display font-extrabold uppercase tracking-wider transition-all"
            >
              <Swords className="w-3.5 h-3.5" />
              <span className="whitespace-nowrap">[ HOST A VAULT ]</span>
            </Link>

            {accountId ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 whitespace-nowrap px-3.5 py-1.5 clip-game-btn bg-zinc-900/90 border border-zinc-700/80 hover:border-emerald-500/50 text-xs font-mono text-zinc-200 transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-display font-bold text-emerald-400">
                    {balance ? `${yoctoToNear(balance, 2)} Ⓝ` : '…'}
                  </span>
                  <span className="hidden sm:inline text-zinc-600">|</span>
                  <span className="hidden sm:inline text-zinc-300 max-w-[140px] truncate">{shortAccount(accountId, 18)}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 clip-game-card bg-[#070b12] border border-emerald-500/30 shadow-2xl p-2.5 z-50 text-xs font-mono">
                    <div className="px-3 py-2 text-zinc-300 break-all">{accountId}</div>
                    <Link
                      href={`/player/${accountId}`}
                      onClick={() => setDropdownOpen(false)}
                      className="block px-3 py-2 rounded hover:bg-zinc-900 text-zinc-200"
                    >
                      My stats
                    </Link>
                    <a
                      href={accountUrl(accountId)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 px-3 py-2 rounded hover:bg-zinc-900 text-zinc-200"
                    >
                      View on explorer <ExternalLink className="w-3 h-3" />
                    </a>
                    <div className="pt-2 mt-1 border-t border-zinc-800">
                      <button
                        onClick={() => {
                          disconnect();
                          setDropdownOpen(false);
                        }}
                        className="w-full flex items-center justify-center gap-1.5 py-1.5 text-zinc-500 hover:text-red-400 rounded text-[11px] uppercase tracking-wider transition-colors"
                      >
                        <LogOut className="w-3 h-3" /> Disconnect
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => connect()}
                disabled={!ready}
                className="flex items-center gap-1.5 whitespace-nowrap px-4 py-2 clip-game-btn bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-[#03060a] text-xs font-display font-black uppercase tracking-wider transition-all"
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>[ CONNECT WALLET ]</span>
              </button>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              className="lg:hidden p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden pb-4 pt-2 border-t border-white/5 flex flex-col gap-2 font-display text-xs">
            {[...LINKS, { href: '/create', label: 'Host a Vault' }].map(l => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg bg-zinc-900/70 text-zinc-200 hover:text-emerald-400 uppercase tracking-wider font-bold"
              >
                {l.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};
