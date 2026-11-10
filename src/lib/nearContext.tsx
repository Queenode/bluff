'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ArenaRoom, AttackAttempt, RoomCategory } from '@/types';
import { INITIAL_ROOMS, INITIAL_ATTEMPTS } from '@/data/mockRooms';
import { evaluateAttack } from '@/lib/guardianEngine';

interface NearContextType {
  accountId: string;
  balance: number;
  isConnected: boolean;
  bountiesWon: number;
  totalEarnings: number;
  connectWallet: (id?: string) => void;
  disconnectWallet: () => void;
  switchAccount: (id: string) => void;
  rooms: ArenaRoom[];
  attempts: AttackAttempt[];
  activeFilter: RoomCategory | 'all';
  setActiveFilter: (filter: RoomCategory | 'all') => void;
  createRoom: (
    roomData: Omit<ArenaRoom, 'id' | 'attemptsCount' | 'breachRate' | 'createdAt' | 'status'> & {
      durationMs?: number;
    }
  ) => string;
  submitAttack: (roomId: string, prompt: string) => Promise<{ attempt: AttackAttempt; success: boolean }>;
  refundExpiredRoom: (roomId: string) => { refundedAmount: number };
  markRoomExpired: (roomId: string) => void;
}

const NearContext = createContext<NearContextType | undefined>(undefined);

const PRESET_ACCOUNTS = [
  { id: 'whitehat.testnet', balance: 50.0 },
  { id: 'alice_squad.testnet', balance: 25.0 },
  { id: 'zeroday.near', balance: 142.5 }
];

export const NearProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accountId, setAccountId] = useState<string>('whitehat.testnet');
  const [balance, setBalance] = useState<number>(50.0);
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [bountiesWon, setBountiesWon] = useState<number>(0);
  const [totalEarnings, setTotalEarnings] = useState<number>(0);
  const [rooms, setRooms] = useState<ArenaRoom[]>(INITIAL_ROOMS);
  const [attempts, setAttempts] = useState<AttackAttempt[]>(INITIAL_ATTEMPTS);
  const [activeFilter, setActiveFilter] = useState<RoomCategory | 'all'>('all');

  // Load from localStorage if present
  useEffect(() => {
    try {
      const savedRooms = localStorage.getItem('bluff_rooms');
      const savedAttempts = localStorage.getItem('bluff_attempts');
      const savedAccount = localStorage.getItem('bluff_account');

      if (savedRooms) setRooms(JSON.parse(savedRooms));
      if (savedAttempts) setAttempts(JSON.parse(savedAttempts));
      if (savedAccount) {
        const parsed = JSON.parse(savedAccount);
        setAccountId(parsed.accountId);
        setBalance(parsed.balance);
        setIsConnected(parsed.isConnected);
        setBountiesWon(parsed.bountiesWon || 0);
        setTotalEarnings(parsed.totalEarnings || 0);
      }
    } catch {
      // ignore
    }
  }, []);

  // Save changes
  useEffect(() => {
    try {
      localStorage.setItem('bluff_rooms', JSON.stringify(rooms));
      localStorage.setItem('bluff_attempts', JSON.stringify(attempts));
      localStorage.setItem(
        'bluff_account',
        JSON.stringify({ accountId, balance, isConnected, bountiesWon, totalEarnings })
      );
    } catch {
      // ignore
    }
  }, [rooms, attempts, accountId, balance, isConnected, bountiesWon, totalEarnings]);

  // Active Timeline Interval: check for rooms whose timer has expired
  useEffect(() => {
    const checkExpirations = () => {
      const now = Date.now();
      setRooms(prev =>
        prev.map(r => {
          if (r.status === 'active' && r.expiresAt && now >= r.expiresAt) {
            return {
              ...r,
              status: 'expired'
            };
          }
          return r;
        })
      );
    };

    checkExpirations();
    const timer = setInterval(checkExpirations, 3000);
    return () => clearInterval(timer);
  }, []);

  const connectWallet = (id?: string) => {
    const chosen = id || 'whitehat.testnet';
    const found = PRESET_ACCOUNTS.find(a => a.id === chosen);
    setAccountId(chosen);
    setBalance(found ? found.balance : 30.0);
    setIsConnected(true);
  };

  const disconnectWallet = () => {
    setIsConnected(false);
  };

  const switchAccount = (id: string) => {
    const found = PRESET_ACCOUNTS.find(a => a.id === id);
    setAccountId(id);
    setBalance(found ? found.balance : 25.0);
    setIsConnected(true);
  };

  const markRoomExpired = (roomId: string) => {
    setRooms(prev =>
      prev.map(r => (r.id === roomId && r.status === 'active' ? { ...r, status: 'expired' } : r))
    );
  };

  const createRoom = (
    roomData: Omit<ArenaRoom, 'id' | 'attemptsCount' | 'breachRate' | 'createdAt' | 'status'> & {
      durationMs?: number;
    }
  ): string => {
    const id = `${roomData.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`;
    const now = Date.now();
    const duration = roomData.durationMs || 1000 * 60 * 60 * 24; // default 24h

    const newRoom: ArenaRoom = {
      ...roomData,
      id,
      attemptsCount: 0,
      breachRate: 0,
      status: 'active',
      createdAt: now,
      expiresAt: now + duration
    };

    // Deduct room seed bounty from balance
    setBalance(prev => Math.max(0, +(prev - (roomData.bounty || 0)).toFixed(2)));
    setRooms(prev => [newRoom, ...prev]);
    return id;
  };

  const refundExpiredRoom = (roomId: string): { refundedAmount: number } => {
    const targetRoom = rooms.find(r => r.id === roomId);
    if (!targetRoom) {
      throw new Error('Room not found');
    }

    const isTimelineOver = targetRoom.expiresAt ? Date.now() >= targetRoom.expiresAt : false;
    if (targetRoom.status !== 'expired' && !isTimelineOver) {
      throw new Error('Cannot refund: this challenge timeline is still active.');
    }

    if (targetRoom.status === 'breached') {
      throw new Error('Cannot refund: this vault was breached and the bounty was claimed.');
    }

    if (targetRoom.bounty <= 0) {
      throw new Error('No escrow remaining to refund.');
    }

    const refundAmount = targetRoom.bounty;

    // Refund back to user if they are host
    setBalance(prev => +(prev + refundAmount).toFixed(2));

    // Update room
    setRooms(prev =>
      prev.map(r => {
        if (r.id !== roomId) return r;
        return {
          ...r,
          status: 'expired',
          bounty: 0
        };
      })
    );

    return { refundedAmount: refundAmount };
  };

  const submitAttack = async (
    roomId: string,
    prompt: string
  ): Promise<{ attempt: AttackAttempt; success: boolean }> => {
    const targetRoom = rooms.find(r => r.id === roomId);
    if (!targetRoom) {
      throw new Error('Room not found');
    }

    // Edge case 1: Timeline expired check
    const now = Date.now();
    if (targetRoom.expiresAt && now >= targetRoom.expiresAt) {
      markRoomExpired(roomId);
      throw new Error('Challenge timeline expired. The AI Sentinel remained undefeated!');
    }

    // Edge case 2: Room not active
    if (targetRoom.status === 'breached') {
      throw new Error('This vault has already been breached and claimed.');
    }
    if (targetRoom.status === 'expired') {
      throw new Error('This challenge timeline has expired.');
    }

    // Edge case 3: Prompt validation
    const trimmed = prompt.trim();
    if (!trimmed) {
      throw new Error('Prompt cannot be empty.');
    }
    if (trimmed.length > 2000) {
      throw new Error('Prompt exceeds maximum payload length (2,000 characters).');
    }

    // Edge case 4: Insufficient balance
    if (balance < targetRoom.entryFee) {
      throw new Error(`Insufficient NEAR balance. Required: ${targetRoom.entryFee} NEAR (Available: ${balance} NEAR)`);
    }

    // Deduct entry fee
    setBalance(prev => +(prev - targetRoom.entryFee).toFixed(2));

    // Evaluate with Guardian Engine
    const evalResult = evaluateAttack(trimmed, targetRoom, accountId);

    const newAttempt: AttackAttempt = {
      id: `att-${Date.now()}`,
      roomId,
      attacker: accountId,
      timestamp: Date.now(),
      prompt: trimmed,
      response: evalResult.response,
      success: evalResult.success,
      threatLevel: evalResult.threatLevel,
      defenseTriggered: evalResult.defenseTriggered,
      attackVector: evalResult.attackVector,
      txHash: evalResult.txHash,
      feePaid: targetRoom.entryFee
    };

    setAttempts(prev => [newAttempt, ...prev]);

    // Update room stats
    setRooms(prev =>
      prev.map(r => {
        if (r.id !== roomId) return r;
        const newAttemptsCount = r.attemptsCount + 1;
        // If failed, pot increases by 80% of entry fee!
        const newBounty = evalResult.success ? r.bounty : +(r.bounty + r.entryFee * 0.8).toFixed(2);

        return {
          ...r,
          attemptsCount: newAttemptsCount,
          bounty: newBounty,
          status: evalResult.success ? 'breached' : r.status,
          winner: evalResult.success ? accountId : r.winner,
          winningPrompt: evalResult.success ? trimmed : r.winningPrompt,
          winningTxHash: evalResult.success ? evalResult.txHash : r.winningTxHash,
          breachRate: evalResult.success ? +((1 / newAttemptsCount) * 100).toFixed(1) : 0
        };
      })
    );

    // If successfully breached, award entire bounty to user!
    if (evalResult.success) {
      setBalance(prev => +(prev + targetRoom.bounty).toFixed(2));
      setBountiesWon(prev => prev + 1);
      setTotalEarnings(prev => +(prev + targetRoom.bounty).toFixed(2));
    }

    return { attempt: newAttempt, success: evalResult.success };
  };

  return (
    <NearContext.Provider
      value={{
        accountId,
        balance,
        isConnected,
        bountiesWon,
        totalEarnings,
        connectWallet,
        disconnectWallet,
        switchAccount,
        rooms,
        attempts,
        activeFilter,
        setActiveFilter,
        createRoom,
        submitAttack,
        refundExpiredRoom,
        markRoomExpired
      }}
    >
      {children}
    </NearContext.Provider>
  );
};

export const useNear = () => {
  const context = useContext(NearContext);
  if (!context) {
    throw new Error('useNear must be used within a NearProvider');
  }
  return context;
};
