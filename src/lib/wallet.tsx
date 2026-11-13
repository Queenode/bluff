'use client';

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { NearConnector } from '@hot-labs/near-connect';
import { CONTRACT_ID, NETWORK_ID, getBalance } from '@/lib/near';

interface CallResult {
  txHash: string | null;
  value: unknown;
}

interface WalletContextType {
  accountId: string | null;
  balance: string | null; // yoctoNEAR
  ready: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  refreshBalance: () => void;
  call: (method: string, args: Record<string, unknown>, depositYocto?: string, tgas?: number) => Promise<CallResult>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

function decodeFailure(status: unknown): string | null {
  if (!status || typeof status !== 'object' || !('Failure' in status)) return null;
  const failure = (status as { Failure: unknown }).Failure;
  const text = JSON.stringify(failure);
  const m = text.match(/Smart contract panicked: ([^"\\]+)/);
  return m ? m[1] : 'Transaction failed onchain';
}

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const connectorRef = useRef<NearConnector | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { NearConnector } = await import('@hot-labs/near-connect');
      const connector = new NearConnector({
        network: NETWORK_ID,
        features: { signAndSendTransaction: true, [NETWORK_ID]: true },
        footerBranding: null,
      });
      connectorRef.current = connector;
      connector.on('wallet:signIn', t => setAccountId(t.accounts[0]?.accountId ?? null));
      connector.on('wallet:signOut', () => {
        setAccountId(null);
        setBalance(null);
      });
      try {
        const { accounts } = await connector.getConnectedWallet();
        if (!cancelled) setAccountId(accounts[0]?.accountId ?? null);
      } catch {
        // not connected
      }
      if (!cancelled) setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const refreshBalance = useCallback(() => {
    if (!accountId) return;
    getBalance(accountId)
      .then(setBalance)
      .catch(() => setBalance(null));
  }, [accountId]);

  useEffect(() => {
    refreshBalance();
    if (!accountId) return;
    const t = setInterval(refreshBalance, 15_000);
    return () => clearInterval(t);
  }, [accountId, refreshBalance]);

  const connect = useCallback(async () => {
    const c = connectorRef.current;
    if (!c) return;
    await c.connect();
  }, []);

  const disconnect = useCallback(async () => {
    const c = connectorRef.current;
    if (!c) return;
    await c.disconnect();
    setAccountId(null);
    setBalance(null);
  }, []);

  const call = useCallback(
    async (method: string, args: Record<string, unknown>, depositYocto = '0', tgas = 100): Promise<CallResult> => {
      const c = connectorRef.current;
      if (!c) throw new Error('Wallet not ready');
      if (!accountId) {
        await c.connect();
      }
      const wallet = await c.wallet();
      const outcome = await wallet.signAndSendTransaction({
        receiverId: CONTRACT_ID,
        actions: [
          {
            type: 'FunctionCall',
            params: {
              methodName: method,
              args,
              gas: (BigInt(tgas) * BigInt(1e12)).toString(),
              deposit: depositYocto,
            },
          },
        ],
      });
      setTimeout(refreshBalance, 1500);
      if (!outcome) return { txHash: null, value: undefined };
      const failure = decodeFailure(outcome.status);
      if (failure) throw new Error(failure);
      let value: unknown;
      const status = outcome.status as { SuccessValue?: string };
      if (status && typeof status === 'object' && status.SuccessValue) {
        try {
          value = JSON.parse(atob(status.SuccessValue));
        } catch {
          value = undefined;
        }
      }
      return { txHash: outcome.transaction?.hash ?? null, value };
    },
    [accountId, refreshBalance],
  );

  return (
    <WalletContext.Provider value={{ accountId, balance, ready, connect, disconnect, refreshBalance, call }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within WalletProvider');
  return ctx;
};

/** Ask the judge server to arm the room / judge queued attempts. */
export async function triggerJudge(roomId: string): Promise<{ judged?: { index: number; status: string; error?: string }[]; error?: string }> {
  const res = await fetch('/api/judge', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roomId }),
  });
  return res.json().catch(() => ({ error: `judge ${res.status}` }));
}
