import React from 'react';
import { Sparkles } from 'lucide-react';

/** Onboarding hint for invited friends who have never used NEAR. */
export function NewToNear({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`border border-sky-500/30 bg-sky-950/20 rounded ${compact ? 'p-3' : 'p-4'} text-[12px] text-zinc-300`}>
      <div className="flex items-center gap-1.5 font-display font-bold uppercase tracking-wider text-sky-300 text-[11px]">
        <Sparkles className="w-3.5 h-3.5" /> New to NEAR? No sign-up form
      </div>
      <ol className="mt-2 space-y-1 list-decimal list-inside font-mono text-[11px] text-zinc-300">
        <li>
          Create a free testnet wallet with{' '}
          <a href="https://wallet.meteorwallet.app" target="_blank" rel="noreferrer" className="text-sky-300 underline">
            Meteor Wallet
          </a>{' '}
          (about a minute).
        </li>
        <li>
          Grab free test NEAR from the{' '}
          <a href="https://near-faucet.io" target="_blank" rel="noreferrer" className="text-sky-300 underline">
            faucet
          </a>
          .
        </li>
        <li>Click Connect wallet. Your wallet is your BLUFF account.</li>
      </ol>
    </div>
  );
}
