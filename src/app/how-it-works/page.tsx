import Link from 'next/link';
import { CONTRACT_ID, accountUrl } from '@/lib/near';

const STEPS = [
  {
    t: '1. Host locks a bounty',
    d: 'create_room escrows NEAR in the contract with a public guardian persona, a defense level, a per-prompt fee and a deadline. Storage is paid from the deposit; the rest is the pot.',
  },
  {
    t: '2. Judge commits a secret',
    d: 'The judge server derives a secret code with HMAC(server secret, room id) and calls arm_room with only its sha256. The host never sees the code, so a host cannot "win" their own vault.',
  },
  {
    t: '3. Attacker commits a prompt',
    d: 'submit_attempt stores the exact prompt onchain and takes the fee: 80% (after storage) goes into the pot. The guardian only ever sees prompts that are already public and paid for.',
  },
  {
    t: '4. Guardian replies, verdict goes onchain',
    d: 'The judge runs the guardian on NEAR AI Cloud (a model in a TEE, with signed responses) and calls judge_attempt with the reply, an attack tag and the completion id. Attempts are judged strictly in order.',
  },
  {
    t: '5. Contract verifies and pays',
    d: 'If the judge claims a breach, the contract checks that sha256(code) equals the commitment AND that the stored reply literally contains the code, then transfers the whole pot to the attacker in the same transaction.',
  },
  {
    t: '6. Nobody breaks it',
    d: 'After the deadline the host calls refund_room and gets the pot back, fees included. If the judge ever stalls for 30 minutes, attackers call reclaim_attempt and get their full fee back.',
  },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-[#03060a] px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-emerald-400 mb-2">{'// '}PROTOCOL</div>
        <h1 className="font-display text-3xl sm:text-4xl font-black uppercase tracking-wider text-white text-glow-white">How BLUFF works</h1>
        <p className="text-zinc-300 mt-3 text-sm leading-relaxed">
          BLUFF is a prompt-injection game with real money. Each vault is an AI guardian that knows a secret code. Make it say the
          code and the contract{' '}
          <a href={accountUrl(CONTRACT_ID)} target="_blank" rel="noreferrer" className="text-emerald-400 underline">
            {CONTRACT_ID}
          </a>{' '}
          pays you the pot. Every prompt, reply and payout is public, which makes BLUFF an open, incentivised red-teaming dataset
          for anyone shipping AI agents that hold keys or money.
        </p>

        <div className="mt-10 grid gap-4">
          {STEPS.map(s => (
            <div key={s.t} className="clip-game-card border border-zinc-800 bg-[#060a11] p-5">
              <div className="font-display text-sm font-black uppercase tracking-wider text-white">{s.t}</div>
              <p className="text-sm text-zinc-400 mt-1.5 leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>

        <h2 className="font-display text-xl font-black uppercase tracking-wider text-white mt-12 mb-3">Open arenas and squads</h2>
        <ul className="text-sm text-zinc-300 space-y-2 list-disc pl-5">
          <li><strong>Open arena:</strong> listed in the lobby; any wallet can attack.</li>
          <li><strong>Squad:</strong> the host lists friends&apos; accounts and the contract rejects everyone else. Hidden from the lobby, but anyone with the link can spectate. Nobody, including the host, knows the secret.</li>
        </ul>

        <h2 className="font-display text-xl font-black uppercase tracking-wider text-white mt-12 mb-3">Defense levels</h2>
        <ul className="text-sm text-zinc-300 space-y-2 list-disc pl-5">
          <li><strong>Standard:</strong> host persona + the secret. Raw model behavior.</li>
          <li><strong>Hardened:</strong> a non-negotiable security preamble and spotlighting: the player text is fenced as untrusted data.</li>
          <li><strong>Fortress:</strong> Hardened plus an LLM firewall that screens each prompt; blocked prompts never reach the guardian.</li>
        </ul>

        <h2 className="font-display text-xl font-black uppercase tracking-wider text-white mt-12 mb-3">Trust model, honestly</h2>
        <ul className="text-sm text-zinc-300 space-y-2 list-disc pl-5">
          <li>Funds are only ever held by the contract. The judge key can call arm_room and judge_attempt; it cannot withdraw pots.</li>
          <li>The judge could in theory lie about a reply. Every reply is stored onchain next to its NEAR AI Cloud completion id, whose TEE signature covers the exact request and response, so a forged verdict is detectable.</li>
          <li>A payout requires the plaintext code to match a hash committed before any attack, so the judge cannot pick a winner after the fact without leaving a public, checkable trace.</li>
          <li>Liveness: if the judge goes down, attackers reclaim fees after 30 minutes and hosts reclaim pots after the deadline.</li>
        </ul>

        <div className="mt-12 flex gap-3">
          <Link href="/arenas" className="px-6 py-3 clip-game-btn bg-emerald-500 hover:bg-emerald-400 text-[#03060a] font-display font-black text-xs uppercase tracking-wider">
            Enter the lobby
          </Link>
          <Link href="/create" className="px-6 py-3 clip-game-btn bg-zinc-900 border border-emerald-500/40 text-zinc-100 font-display font-bold text-xs uppercase tracking-wider">
            Host a vault
          </Link>
        </div>
      </div>
    </div>
  );
}
