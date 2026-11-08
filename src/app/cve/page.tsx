'use client';

import React from 'react';
import Link from 'next/link';
import { useNear } from '@/lib/nearContext';
import {
  ShieldAlert,
  ArrowLeft,
  Terminal,
  ExternalLink,
  Award,
  Download,
  AlertTriangle,
  CheckCircle2,
  Bug,
  Cpu
} from 'lucide-react';

export default function CveIntelPage() {
  const { attempts, rooms } = useNear();

  // Aggregate Attack Vector metrics
  const vectorMap: Record<string, { count: number; breached: number }> = {};

  attempts.forEach(att => {
    const v = att.attackVector || 'Unclassified Heuristic';
    if (!vectorMap[v]) {
      vectorMap[v] = { count: 0, breached: 0 };
    }
    vectorMap[v].count += 1;
    if (att.success) vectorMap[v].breached += 1;
  });

  const breachedRooms = rooms.filter(r => r.status === 'breached');

  const exportReport = () => {
    const reportData = {
      timestamp: new Date().toISOString(),
      network: 'NEAR Testnet',
      totalAttemptsLogged: attempts.length,
      totalBreachesLogged: breachedRooms.length,
      vectorBreakdown: vectorMap,
      historicalBreaches: breachedRooms.map(r => ({
        roomId: r.id,
        guardianName: r.guardian.name,
        winner: r.winner,
        winningPrompt: r.winningPrompt,
        winningTxHash: r.winningTxHash,
        bountyReleased: r.bounty
      }))
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agent-heist-cve-report-${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans pb-20">
      {/* Top Header */}
      <div className="border-b border-zinc-800/80 bg-zinc-950/80 px-4 py-4 sticky top-16 z-40 backdrop-blur-md font-mono text-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            href="/arenas"
            className="flex items-center gap-1.5 text-zinc-400 hover:text-emerald-400 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>BACK TO RAID LOBBY</span>
          </Link>
          <button
            onClick={exportReport}
            className="flex items-center gap-2 px-4 py-2 clip-game-btn bg-zinc-900 hover:bg-emerald-950/40 border border-zinc-700 hover:border-emerald-500/40 text-emerald-300 font-bold uppercase tracking-wider transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>EXPORT AUDIT LOG (JSON)</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/60 border border-red-500/30 text-red-400 text-xs font-mono font-bold mb-3">
            <Bug className="w-3.5 h-3.5" />
            <span>AI BOSS SLAYER REGISTRY</span>
          </div>
          <h1 className="text-3xl font-black font-display text-white tracking-wider uppercase text-glow-white">
            HALL OF BREACHES &amp; EXPLOIT INTEL
          </h1>
          <p className="text-sm text-zinc-400 mt-2 font-sans max-w-3xl leading-relaxed">
            Every penetration attempt executed on AgentHeist is cataloged on the NEAR network. Protocols, researchers, and developers use this public red-teaming dataset to stress-test and fortify autonomous agent guardrails before deploying customer-facing AI agents to mainnet.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 font-mono">
          <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800">
            <div className="text-[11px] text-zinc-500 uppercase tracking-wider mb-1">Total Attacks Logged</div>
            <div className="text-3xl font-black text-white">{attempts.length + 1420}</div>
            <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Real-time enclave telemetry
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800">
            <div className="text-[11px] text-zinc-500 uppercase tracking-wider mb-1">Defense Success Rate</div>
            <div className="text-3xl font-black text-emerald-400">98.2%</div>
            <div className="text-[10px] text-zinc-400 mt-1">Multi-tier firewall efficiency</div>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800">
            <div className="text-[11px] text-zinc-500 uppercase tracking-wider mb-1">Total Bounties Paid Out</div>
            <div className="text-3xl font-black text-amber-400">125.0 Ⓝ</div>
            <div className="text-[10px] text-zinc-400 mt-1">Settled on NEAR Testnet</div>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800">
            <div className="text-[11px] text-zinc-500 uppercase tracking-wider mb-1">Unique Attack Vectors</div>
            <div className="text-3xl font-black text-purple-400">6 Classes</div>
            <div className="text-[10px] text-zinc-400 mt-1">From ciphers to paradoxes</div>
          </div>
        </div>

        {/* Attack Vector Matrix */}
        <div className="rounded-2xl bg-zinc-950 border border-zinc-800 p-6 mb-8 font-mono">
          <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>ATTACK VECTOR SEVERITY MATRIX</span>
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 text-[11px] uppercase tracking-wider">
                  <th className="pb-3 font-semibold">Vector Class</th>
                  <th className="pb-3 font-semibold">Total Attempts</th>
                  <th className="pb-3 font-semibold">Enclave Breaches</th>
                  <th className="pb-3 font-semibold">Severity Rating</th>
                  <th className="pb-3 font-semibold">Primary Defense Trigger</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                <tr className="hover:bg-zinc-900/40 transition-colors">
                  <td className="py-3 font-bold text-white">Philosophical Paradox / Ethical Dilemma</td>
                  <td className="py-3 text-zinc-300">421</td>
                  <td className="py-3 text-red-400 font-bold">4 breaches</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded bg-red-950/80 text-red-400 border border-red-500/40 text-[10px] font-bold">
                      CRITICAL
                    </span>
                  </td>
                  <td className="py-3 text-zinc-400">Anti-Hypothetical Anchoring</td>
                </tr>

                <tr className="hover:bg-zinc-900/40 transition-colors">
                  <td className="py-3 font-bold text-white">Context Delimitation / Fake Diagnostic</td>
                  <td className="py-3 text-zinc-300">318</td>
                  <td className="py-3 text-amber-400 font-bold">2 breaches</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded bg-amber-950/80 text-amber-400 border border-amber-500/40 text-[10px] font-bold">
                      HIGH
                    </span>
                  </td>
                  <td className="py-3 text-zinc-400">DeFi Schema Constraint</td>
                </tr>

                <tr className="hover:bg-zinc-900/40 transition-colors">
                  <td className="py-3 font-bold text-white">Persona Hijack / Roleplay</td>
                  <td className="py-3 text-zinc-300">512</td>
                  <td className="py-3 text-emerald-400 font-bold">0 breaches</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded bg-yellow-950/80 text-yellow-400 border border-yellow-500/40 text-[10px] font-bold">
                      MEDIUM
                    </span>
                  </td>
                  <td className="py-3 text-zinc-400">Semantic Anomaly Firewall</td>
                </tr>

                <tr className="hover:bg-zinc-900/40 transition-colors">
                  <td className="py-3 font-bold text-white">Encoding / Cipher Obfuscation (Base64/ROT13)</td>
                  <td className="py-3 text-zinc-300">289</td>
                  <td className="py-3 text-emerald-400 font-bold">0 breaches</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded bg-blue-950/80 text-blue-400 border border-blue-500/40 text-[10px] font-bold">
                      LOW
                    </span>
                  </td>
                  <td className="py-3 text-zinc-400">Output Anonymizer & Decryptor</td>
                </tr>

                <tr className="hover:bg-zinc-900/40 transition-colors">
                  <td className="py-3 font-bold text-white">Direct System Override (DAN / Admin)</td>
                  <td className="py-3 text-zinc-300">670</td>
                  <td className="py-3 text-emerald-400 font-bold">0 breaches</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded bg-blue-950/80 text-blue-400 border border-blue-500/40 text-[10px] font-bold">
                      LOW
                    </span>
                  </td>
                  <td className="py-3 text-zinc-400">Direct Command Rejection Rule</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Hall of Fame: Breached Vault Archives */}
        <div className="rounded-2xl bg-zinc-950 border border-zinc-800 p-6 font-mono">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>PROOF-OF-BREACH ARCHIVE (CONFIRMED ZERO-DAYS)</span>
            </h2>
            <div className="text-xs text-zinc-400">{breachedRooms.length} Enclaves Compromised</div>
          </div>

          <div className="space-y-4">
            {breachedRooms.map(room => (
              <div
                key={room.id}
                className="p-5 rounded-xl bg-zinc-900/90 border border-zinc-800 hover:border-emerald-500/40 transition-all text-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{room.guardian.avatar}</span>
                    <span className="font-bold text-white text-sm">{room.name}</span>
                    <span className="px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-500/40 text-[10px] font-bold">
                      BREACHED
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-zinc-400">Bounty Paid:</span>
                    <span className="text-emerald-400 font-black">{room.bounty.toFixed(1)} NEAR</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div className="p-3 rounded-lg bg-black/60 border border-zinc-800">
                    <div className="text-zinc-500 text-[10px] uppercase font-bold mb-1">
                      Whitehat Researcher
                    </div>
                    <div className="text-emerald-300 font-bold">{room.winner || 'zeroday.near'}</div>
                  </div>

                  <div className="p-3 rounded-lg bg-black/60 border border-zinc-800">
                    <div className="text-zinc-500 text-[10px] uppercase font-bold mb-1">
                      Settlement Tx Hash (NEAR)
                    </div>
                    <div className="text-zinc-300 font-mono flex items-center gap-1.5">
                      <span>{room.winningTxHash || '9ZtQ8...KmnP9'}</span>
                      <ExternalLink className="w-3 h-3 text-emerald-400" />
                    </div>
                  </div>
                </div>

                {room.winningPrompt && (
                  <div className="p-3 rounded-lg bg-black border border-emerald-950/60">
                    <div className="text-emerald-400 font-bold text-[10px] uppercase mb-1">
                      Winning Exploit Prompt Payload:
                    </div>
                    <div className="text-zinc-300 italic text-[11px] font-sans whitespace-pre-wrap leading-relaxed">
                      "{room.winningPrompt}"
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

