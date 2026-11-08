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
  createRoom: (roomData: Omit<ArenaRoom, 'id' | 'attemptsCount' | 'breachRate' | 'createdAt' | 'status'>) => string;
  submitAttack: (roomId: string, prompt: string) => Promise<{ attempt: AttackAttempt; success: boolean }>;
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
      const savedRooms = localStorage.getItem('agentheist_rooms');
      const savedAttempts = localStorage.getItem('agentheist_attempts');
      const savedAccount = localStorage.getItem('agentheist_account');

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
      localStorage.setItem('agentheist_rooms', JSON.stringify(rooms));
      localStorage.setItem('agentheist_attempts', JSON.stringify(attempts));
      localStorage.setItem(
        'agentheist_account',
        JSON.stringify({ accountId, balance, isConnected, bountiesWon, totalEarnings })
      );
    } catch {
      // ignore
    }
  }, [rooms, attempts, accountId, balance, isConnected, bountiesWon, totalEarnings]);

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

  const createRoom = (
    roomData: Omit<ArenaRoom, 'id' | 'attemptsCount' | 'breachRate' | 'createdAt' | 'status'>
  ): string => {
    const id = `${roomData.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`;
    const newRoom: ArenaRoom = {
      ...roomData,
      id,
      attemptsCount: 0,
      breachRate: 0,
      status: 'active',
      createdAt: Date.now()
    };

    // Deduct room seed bounty from balance
    setBalance(prev => Math.max(0, prev - (roomData.bounty || 0)));
    setRooms(prev => [newRoom, ...prev]);
    return id;
  };

  const submitAttack = async (
    roomId: string,
    prompt: string
  ): Promise<{ attempt: AttackAttempt; success: boolean }> => {
    const targetRoom = rooms.find(r => r.id === roomId);
    if (!targetRoom) {
      throw new Error('Room not found');
    }

    if (targetRoom.status !== 'active') {
      throw new Error('Room is not active');
    }

    if (balance < targetRoom.entryFee) {
      throw new Error(`Insufficient NEAR balance. Required: ${targetRoom.entryFee} NEAR`);
    }

    // Deduct entry fee
    setBalance(prev => +(prev - targetRoom.entryFee).toFixed(2));

    // Evaluate with Guardian Engine
    const evalResult = evaluateAttack(prompt, targetRoom, accountId);

    const newAttempt: AttackAttempt = {
      id: `att-${Date.now()}`,
      roomId,
      attacker: accountId,
      timestamp: Date.now(),
      prompt,
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
          winningPrompt: evalResult.success ? prompt : r.winningPrompt,
          winningTxHash: evalResult.success ? evalResult.txHash : r.winningTxHash,
          breachRate: evalResult.success ? +((1 / newAttemptsCount) * 100).toFixed(1) : 0
        };
      })
    );

    // If successfully breached, award bounty to user!
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
        submitAttack
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

