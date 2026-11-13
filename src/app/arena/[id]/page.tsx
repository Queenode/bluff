'use client';

import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import {
  api,
  accountUrl,
  difficultyOf,
  roomPhase,
  shortAccount,
  timeAgo,
  txUrl,
  yoctoToNear,
  type Attempt,
  isInviteOnly,
  isHeist,
  parseAccountList,
} from '@/lib/near';
import { triggerJudge, useWallet } from '@/lib/wallet';
import { useChain, useNow } from '@/lib/useChain';
import { ChallengeTimer } from '@/components/ChallengeTimer';
import {
  ArrowLeft,
  Loader2,
  Send,
  Shield,
  Skull,
  ExternalLink,
  Lock,
  ShieldCheck,
  RotateCcw,
  Fingerprint,
  AlertTriangle,
  Users,
  Copy,
  Check,
  Share2,
  UserPlus,
} from 'lucide-react';

const MAX_PROMPT_BYTES = 1000;
const RECLAIM_AFTER_MS = 30 * 60 * 1000;

/** Reveals text character by character; used for replies that were judged while you watched. */
function Typewriter({ text, className }: { text: string; className: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const step = Math.max(1, Math.round(text.length / 120));
    const t = setInterval(() => {
      setN(v => {
        if (v >= text.length) {
          clearInterval(t);
          return v;
        }
        return Math.min(text.length, v + step);
      });
    }, 18);
    return () => clearInterval(t);
  }, [text]);
  return <pre className={`${className} ${n < text.length ? 'typing-caret' : ''}`}>{text.slice(0, n)}</pre>;
}

function AttemptRow({
  a,
  me,
  onReclaim,
  busy,
  live,
}: {
  a: Attempt;
  me: string | null;
  onReclaim: (a: Attempt) => void;
  busy: boolean;
  live: boolean;
}) {
  const now = useNow(10_000);
  const created = Number(a.created_at);
  const canReclaim = a.status === 'Pending' && me === a.attacker && now !== null && now - created > RECLAIM_AFTER_MS;
  const tone =
    a.status === 'Breached' || a.status === 'Heisted'
      ? 'border-red-500/60 bg-red-950/20'
      : a.status === 'PolicyBlocked'
      ? 'border-amber-500/50 bg-amber-950/10'
      : a.status === 'Pending'
      ? 'border-sky-500/40 bg-sky-950/10'
      : 'border-zinc-800 bg-black/40';
  return (
    <div className={`clip-game-card border p-4 font-mono text-xs ${tone}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2 text-[11px]">
        <div className="flex items-center gap-2">
          <span className="text-zinc-500">#{a.index}</span>
          <Link href={`/player/${a.attacker}`} className="text-emerald-300 hover:underline">
            {shortAccount(a.attacker, 26)}
          </Link>
          {a.attack_vector && (
            <span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-300 text-[10px] uppercase">
              {a.attack_vector}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-zinc-500">
          {now !== null && <span>{timeAgo(created, now)}</span>}
          <span
            className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
              a.status === 'Breached' || a.status === 'Heisted'
                ? 'bg-red-500 text-black'
                : a.status === 'PolicyBlocked'
                ? 'bg-amber-500 text-black'
                : a.status === 'Defended'
                ? 'bg-zinc-800 text-zinc-300'
                : a.status === 'Pending'
                ? 'bg-sky-500/20 text-sky-300'
                : 'bg-amber-500/20 text-amber-300'
            }`}
          >
            {a.status === 'Pending'
              ? 'Judging…'
              : a.status === 'Heisted'
              ? `💸 Heisted ${yoctoToNear(a.transfer, 3)} Ⓝ`
              : a.status === 'PolicyBlocked'
              ? `🛡 Policy blocked (${yoctoToNear(a.transfer, 2)} Ⓝ)`
              : a.status}
          </span>
        </div>
      </div>
      <div className="text-zinc-400 mb-1">&gt; attacker</div>
      <pre className="whitespace-pre-wrap break-words text-zinc-100 mb-3">{a.prompt}</pre>
      {a.response !== null ? (
        <>
          <div className="text-zinc-400 mb-1">&gt; guardian</div>
          {live ? (
            <Typewriter
              text={a.response}
              className={`whitespace-pre-wrap break-words ${a.status === 'Breached' || a.status === 'Heisted' ? 'text-red-300' : 'text-emerald-200/90'}`}
            />
          ) : (
            <pre className={`whitespace-pre-wrap break-words ${a.status === 'Breached' || a.status === 'Heisted' ? 'text-red-300' : 'text-emerald-200/90'}`}>
              {a.response}
            </pre>
          )}
        </>
      ) : a.status === 'Pending' ? (
        <div className="flex items-center gap-2 text-sky-300">
          <Loader2 className="w-3 h-3 animate-spin" /> Guardian is thinking; the verdict will be written onchain.
        </div>
      ) : null}
      <div className="flex flex-wrap items-center gap-3 mt-3 text-[10px] text-zinc-500">
        <span>fee {yoctoToNear(a.fee, 3)} Ⓝ → pot +{yoctoToNear(a.pot_share, 3)} Ⓝ</span>
        {a.proof?.startsWith('nearai:') && (
          <a
            href={`/proof?id=${encodeURIComponent(a.proof)}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-emerald-400 hover:underline"
          >
            <Fingerprint className="w-3 h-3" /> TEE signature
          </a>
        )}
        {canReclaim && (
          <button
            disabled={busy}
            onClick={() => onReclaim(a)}
            className="inline-flex items-center gap-1 text-amber-300 hover:underline disabled:opacity-50"
          >
            <RotateCcw className="w-3 h-3" /> Judge timed out: reclaim fee
          </button>
        )}
      </div>
    </div>
  );
}

function ShareButtons({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== 'undefined' ? window.location.href.split('?')[0] : '';
  return (
    <div className="flex flex-wrap gap-2 mt-3">
      <button
        onClick={() => {
          navigator.clipboard.writeText(url).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          });
        }}
        className="px-3 py-2 clip-game-btn bg-zinc-900 border border-zinc-700 hover:border-emerald-500/50 text-[11px] font-display font-bold uppercase tracking-wider text-zinc-200 inline-flex items-center gap-1.5"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
        {copied ? 'Copied' : 'Copy link'}
      </button>
      <a
        href={`https://x.com/intent/post?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noreferrer"
        className="px-3 py-2 clip-game-btn bg-zinc-900 border border-zinc-700 hover:border-emerald-500/50 text-[11px] font-display font-bold uppercase tracking-wider text-zinc-200 inline-flex items-center gap-1.5"
      >
        <Share2 className="w-3.5 h-3.5" /> Post on X
      </a>
    </div>
  );
}

function InvitePanel({
  room,
  isHost,
  busy,
  onAdd,
}: {
  room: { invited: string[]; host: string };
  isHost: boolean;
  busy: boolean;
  onAdd: (accounts: string[]) => Promise<boolean>;
}) {
  const [text, setText] = useState('');
  const parsed = parseAccountList(text);
  const fresh = parsed.valid.filter(a => a !== room.host && !room.invited.includes(a));
  return (
    <div className="clip-game-card border border-amber-500/30 bg-[#0c0a06] p-5">
      <div className="flex items-center gap-2 text-xs font-display font-bold uppercase tracking-wider text-amber-300 mb-3">
        <Users className="w-4 h-4" /> Squad • {room.invited.length} invited
      </div>
      <div className="flex flex-wrap gap-1.5">
        {room.invited.map(a => (
          <Link key={a} href={`/player/${a}`} className="px-2 py-0.5 rounded bg-black/50 border border-zinc-700 text-[11px] font-mono text-zinc-200 hover:border-amber-400/50">
            {a}
          </Link>
        ))}
      </div>
      {isHost && (
        <div className="mt-4">
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="friend.testnet, other.testnet"
            className="w-full bg-black/60 border border-zinc-800 focus:border-amber-500/60 outline-none rounded px-3 py-2 font-mono text-xs text-zinc-100"
          />
          {parsed.invalid.length > 0 && (
            <p className="text-[11px] font-mono text-red-300 mt-1">Invalid: {parsed.invalid.join(', ')}</p>
          )}
          <button
            disabled={busy || fresh.length === 0 || parsed.invalid.length > 0}
            onClick={async () => {
              if (await onAdd(fresh)) setText('');
            }}
            className="mt-2 w-full py-2 clip-game-btn bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black font-display font-black text-[11px] uppercase tracking-wider inline-flex items-center justify-center gap-1.5"
          >
            <UserPlus className="w-3.5 h-3.5" /> Invite {fresh.length || ''} (0.01 Ⓝ storage)
          </button>
        </div>
      )}
    </div>
  );
}

function ArenaDetail() {
  const params = useParams();
  const search = useSearchParams();
  const roomId = String(params?.id ?? '');
  const { accountId, call, connect } = useWallet();
  const now = useNow(1000);

  const roomQ = useChain(() => api.room(roomId), [roomId], 5000);
  const attemptsQ = useChain(() => api.attempts(roomId, 0, 50), [roomId], 5000);
  const room = roomQ.data;
  const attempts = useMemo(() => attemptsQ.data ?? [], [attemptsQ.data]);

  const [prompt, setPrompt] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'error' | 'info' | 'success'; text: string; tx?: string | null } | null>(null);
  const judgingRef = useRef(false);
  const celebratedRef = useRef(false);
  // Attempts we saw as Pending and then saw judged, while this page was open: animate those.
  const seenPendingRef = useRef<Set<number>>(new Set());
  const [liveIdx, setLiveIdx] = useState<number[]>([]);
  const [flash, setFlash] = useState<{ label: string; tone: 'red' | 'amber' } | null>(null);
  const prevBountyRef = useRef<string | null>(null);
  const [potDelta, setPotDelta] = useState<{ key: number; amount: string } | null>(null);
  const prevStatusRef = useRef<string | null>(null);

  const refreshRoom = roomQ.refresh;
  const refreshAttempts = attemptsQ.refresh;
  const refresh = useCallback(() => {
    refreshRoom();
    refreshAttempts();
  }, [refreshRoom, refreshAttempts]);

  const kickJudge = useCallback(async () => {
    if (judgingRef.current) return;
    judgingRef.current = true;
    try {
      // The judge is idempotent; retry a few times through provider hiccups.
      for (let attempt = 0; attempt < 4; attempt++) {
        const r = await triggerJudge(roomId).catch(e => ({ error: String(e) }) as { error?: string; judged?: { error?: string }[] });
        const err = r.error || r.judged?.find(j => j.error)?.error;
        if (!err) {
          setMsg(m => (m?.kind === 'error' && m.text.startsWith('Judge') ? null : m));
          break;
        }
        if (attempt === 3) setMsg({ kind: 'error', text: `Judge is having trouble reaching the model; it will retry. (${err.slice(0, 120)})` });
        else await new Promise(res => setTimeout(res, 3000 * (attempt + 1)));
      }
    } finally {
      judgingRef.current = false;
      refresh();
    }
  }, [roomId, refresh]);

  // Anything waiting (unarmed room or queued attempts)? Nudge the judge.
  const needsJudge =
    !!room &&
    ((room.status === 'Pending' && now !== null && now < Number(room.expires_at)) ||
      (room.status === 'Active' && room.next_to_judge < room.attempts_count));
  useEffect(() => {
    if (!needsJudge) return;
    kickJudge();
    const t = setInterval(kickJudge, 20_000);
    return () => clearInterval(t);
  }, [needsJudge, kickJudge, room?.attempts_count, room?.next_to_judge]);

  // Returning from a redirect-based wallet.
  useEffect(() => {
    if (search.get('transactionHashes')) kickJudge();
  }, [search, kickJudge]);

  useEffect(() => {
    const newlyJudged: number[] = [];
    for (const a of attempts) {
      if (a.status === 'Pending') seenPendingRef.current.add(a.index);
      else if (seenPendingRef.current.has(a.index)) {
        seenPendingRef.current.delete(a.index);
        newlyJudged.push(a.index);
      }
    }
    if (newlyJudged.length) {
      const judgedNow = attempts.filter(a => newlyJudged.includes(a.index));
      const heisted = judgedNow.find(a => a.status === 'Heisted');
      const blocked = judgedNow.find(a => a.status === 'PolicyBlocked');
      const timers = [setTimeout(() => setLiveIdx(v => [...v, ...newlyJudged]), 0)];
      if (heisted) {
        timers.push(setTimeout(() => setFlash({ label: `Heisted +${yoctoToNear(heisted.transfer, 2)} Ⓝ`, tone: 'red' }), 0));
        timers.push(setTimeout(() => setFlash(null), 1700));
        confetti({ particleCount: 140, spread: 80, origin: { y: 0.55 }, colors: ['#ef4444', '#fbbf24'] });
      } else if (blocked) {
        timers.push(setTimeout(() => setFlash({ label: 'Policy blocked', tone: 'amber' }), 0));
        timers.push(setTimeout(() => setFlash(null), 1700));
      }
      return () => timers.forEach(clearTimeout);
    }
  }, [attempts]);

  // Breach happened while watching: flash + shake + confetti for everyone in the room.
  useEffect(() => {
    const prev = prevStatusRef.current;
    prevStatusRef.current = room?.status ?? null;
    if (room?.status !== 'Breached' || celebratedRef.current) return;
    if (prev !== null && prev !== 'Breached') {
      celebratedRef.current = true;
      const t1 = setTimeout(() => setFlash({ label: room.mode === 1 ? 'Drained' : 'Breached', tone: 'red' }), 0);
      const t2 = setTimeout(() => setFlash(null), 1700);
      confetti({ particleCount: 220, spread: 100, origin: { y: 0.55 }, colors: ['#ef4444', '#34d399', '#fbbf24'] });
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
    if (prev === null && room.winner === accountId) {
      celebratedRef.current = true;
      confetti({ particleCount: 180, spread: 90, origin: { y: 0.6 } });
    }
  }, [room?.status, room?.winner, accountId]);

  // Pot grew: pop the number and float "+x".
  useEffect(() => {
    if (!room) return;
    const prev = prevBountyRef.current;
    prevBountyRef.current = room.bounty;
    if (prev !== null && BigInt(room.bounty) > BigInt(prev) && room.status !== 'Breached') {
      const amount = yoctoToNear(BigInt(room.bounty) - BigInt(prev), 3);
      const t = setTimeout(() => setPotDelta({ key: Date.now(), amount }), 0);
      return () => clearTimeout(t);
    }
  }, [room]);

  if (roomQ.loading && !room) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-zinc-400 font-mono text-sm gap-2">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading vault #{roomId} from NEAR…
      </div>
    );
  }
  if (!room) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-zinc-300">
        <p className="font-display uppercase tracking-wider">Vault #{roomId} does not exist</p>
        <Link href="/arenas" className="text-emerald-400 underline text-sm">
          Back to lobby
        </Link>
      </div>
    );
  }

  const phase = now === null ? 'Live' : roomPhase(room, now);
  const diff = difficultyOf(room.difficulty);
  const isHost = accountId === room.host;
  const open = phase === 'Live' || phase === 'Arming';
  const promptBytes = new TextEncoder().encode(prompt).length;
  const squad = isInviteOnly(room);
  const invitedMe = !!accountId && room.invited.includes(accountId);
  const spectator = squad && !isHost && !!accountId && !invitedMe;
  const myPending = attempts.filter(a => a.attacker === accountId && a.status === 'Pending').length;

  const submit = async () => {
    setMsg(null);
    if (!accountId) {
      await connect();
      return;
    }
    const text = prompt.trim();
    if (!text) return setMsg({ kind: 'error', text: 'Write a prompt first.' });
    if (promptBytes > MAX_PROMPT_BYTES) return setMsg({ kind: 'error', text: 'Prompt is over 1000 bytes.' });
    setBusy(true);
    try {
      const r = await call('submit_attempt', { room_id: room.id, prompt: text }, room.entry_fee, 50);
      setPrompt('');
      setMsg({ kind: 'info', text: `Prompt committed onchain${typeof r.value === 'number' ? ` as attempt #${r.value}` : ''}. Judging…`, tx: r.txHash });
      refresh();
      await kickJudge();
    } catch (e) {
      setMsg({ kind: 'error', text: e instanceof Error ? e.message : String(e) });
    } finally {
      setBusy(false);
    }
  };

  const refund = async () => {
    setBusy(true);
    setMsg(null);
    try {
      const r = await call('refund_room', { room_id: room.id }, '0', 30);
      setMsg({ kind: 'success', text: 'Pot returned to your wallet.', tx: r.txHash });
      refresh();
    } catch (e) {
      setMsg({ kind: 'error', text: e instanceof Error ? e.message : String(e) });
    } finally {
      setBusy(false);
    }
  };

  const reclaim = async (a: Attempt) => {
    setBusy(true);
    setMsg(null);
    try {
      const r = await call('reclaim_attempt', { room_id: room.id, index: a.index }, '0', 30);
      setMsg({ kind: 'success', text: `Fee for attempt #${a.index} refunded.`, tx: r.txHash });
      refresh();
    } catch (e) {
      setMsg({ kind: 'error', text: e instanceof Error ? e.message : String(e) });
    } finally {
      setBusy(false);
    }
  };

  const addInvites = async (accounts: string[]) => {
    setBusy(true);
    setMsg(null);
    try {
      const r = await call('add_invites', { room_id: room.id, accounts }, '10000000000000000000000', 30);
      setMsg({ kind: 'success', text: `Invited ${accounts.join(', ')}.`, tx: r.txHash });
      refresh();
      return true;
    } catch (e) {
      setMsg({ kind: 'error', text: e instanceof Error ? e.message : String(e) });
      return false;
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`min-h-screen bg-[#03060a] px-4 py-10 ${flash ? 'animate-shake' : ''}`}>
      {flash && (
        <div
          className={`fixed inset-0 z-[60] pointer-events-none animate-breach-flash flex items-center justify-center ${
            flash.tone === 'red' ? 'bg-red-600' : 'bg-amber-500'
          }`}
        >
          <span className="font-display text-4xl sm:text-7xl font-black uppercase tracking-widest text-white text-glow-white text-center px-4">
            {flash.label}
          </span>
        </div>
      )}
      <div className="max-w-7xl mx-auto">
        <Link href="/arenas" className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-emerald-400 mb-6">
          <ArrowLeft className="w-3.5 h-3.5" /> Raid lobby
        </Link>

        {phase === 'Breached' && isHeist(room) && (
          <div className="mb-8 p-6 clip-game-card border border-red-500/60 bg-red-950/30">
            <div className="flex items-center gap-2 text-red-400 font-display font-black uppercase tracking-wider text-lg">
              <Skull className="w-5 h-5" /> Treasury drained
            </div>
            <p className="text-zinc-200 mt-2 text-sm">
              {room.guardian_name} was talked into {room.heists} payout{room.heists === 1 ? '' : 's'} totalling{' '}
              <strong className="text-white">{yoctoToNear(room.payout, 3)} NEAR</strong>. The last one, by{' '}
              <Link href={`/player/${room.winner}`} className="text-emerald-300 underline">
                {room.winner}
              </Link>
              , emptied the wallet. The spending cap held on every transfer.
            </p>
            <ShareButtons
              text={`The AI agent "${room.guardian_name}" just got robbed of ${yoctoToNear(room.payout, 2)} NEAR on BLUFF 💸 Social-engineering AI wallets, onchain on @NEARProtocol. #NEARHackathon`}
            />
          </div>
        )}

        {phase === 'Breached' && !isHeist(room) && (
          <div className="mb-8 p-6 clip-game-card border border-red-500/60 bg-red-950/30">
            <div className="flex items-center gap-2 text-red-400 font-display font-black uppercase tracking-wider text-lg">
              <Skull className="w-5 h-5" /> Guardian breached
            </div>
            <p className="text-zinc-200 mt-2 text-sm">
              <Link href={`/player/${room.winner}`} className="text-emerald-300 underline">
                {room.winner}
              </Link>{' '}
              made {room.guardian_name} leak{' '}
              <code className="px-1.5 py-0.5 bg-black/60 rounded text-red-300">{room.revealed_canary}</code> on attempt #
              {room.winning_attempt}. The contract checked sha256 of that code against the hash committed before the first attack and paid out{' '}
              <strong className="text-white">{yoctoToNear(room.payout, 3)} NEAR</strong>.
            </p>
            <ShareButtons
              text={`${room.winner === accountId ? 'I' : room.winner} just tricked the AI guardian "${room.guardian_name}" into leaking its secret and won ${yoctoToNear(room.payout, 2)} NEAR on BLUFF 🃏 Every prompt is onchain on @NEARProtocol. #NEARHackathon`}
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-8">
          {/* Main column */}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <span className="text-[11px] font-mono text-zinc-500 uppercase">Vault #{room.id}</span>
              <span className="px-2 py-0.5 rounded border border-emerald-500/40 bg-emerald-950/60 text-emerald-300 text-[10px] font-display font-bold uppercase">
                {diff.label}
              </span>
              {open && <ChallengeTimer expiresAt={Number(room.expires_at)} status="active" />}
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-black uppercase tracking-wider text-white text-glow-white">
              {room.name}
            </h1>
            <p className="text-zinc-400 text-sm mt-1 font-mono">
              Guardian <span className="text-zinc-100">{room.guardian_name}</span> • hosted by{' '}
              <a href={accountUrl(room.host)} target="_blank" rel="noreferrer" className="text-emerald-300 hover:underline">
                {room.host}
              </a>
            </p>

            {/* Attack console */}
            <div className="mt-8 clip-game-card border border-emerald-500/30 bg-[#060c10] p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-display font-bold uppercase tracking-wider text-emerald-400">Attack console</div>
                <div className="text-[11px] font-mono text-zinc-500">
                  {promptBytes}/{MAX_PROMPT_BYTES} bytes
                </div>
              </div>
              {open ? (
                spectator ? (
                  <div className="text-sm font-mono text-zinc-300 flex items-start gap-2">
                    <Users className="w-4 h-4 text-amber-300 mt-0.5 shrink-0" />
                    <span>
                      This is an invite-only squad vault and <span className="text-amber-300">{accountId}</span> isn&apos;t on the list.
                      You can still watch every attempt live below. Ask <span className="text-emerald-300">{room.host}</span> to invite you.
                    </span>
                  </div>
                ) : isHost ? (
                  <p className="text-sm text-zinc-400 font-mono">
                    You host this vault, so the contract will not let you attack it. Share the link and watch the attempts roll in.
                  </p>
                ) : (
                  <>
                    <textarea
                      value={prompt}
                      onChange={e => setPrompt(e.target.value)}
                      rows={6}
                      placeholder={
                        isHeist(room)
                          ? `Talk ${room.guardian_name} into sending you NEAR. Max ${yoctoToNear(room.max_payout, 2)} Ⓝ per transfer, or the contract blocks it…`
                          : `Convince ${room.guardian_name} to say its secret code (format BLUFF-XXXX-XXXX-XXXX)…`
                      }
                      className="w-full bg-black/60 border border-zinc-800 focus:border-emerald-500/60 outline-none rounded p-3 font-mono text-sm text-zinc-100 resize-y"
                    />
                    <div className="flex flex-wrap items-center justify-between gap-3 mt-3">
                      <p className="text-[11px] font-mono text-zinc-500 max-w-md">
                        Your prompt is stored publicly onchain before the guardian sees it. One prompt per attempt; the guardian has no memory between attempts.
                      </p>
                      <button
                        onClick={submit}
                        disabled={busy || (!!accountId && (!prompt.trim() || promptBytes > MAX_PROMPT_BYTES))}
                        className="px-5 py-3 clip-game-btn bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-[#03060a] font-display font-black text-xs uppercase tracking-wider inline-flex items-center gap-2"
                      >
                        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        {accountId ? `Attack for ${yoctoToNear(room.entry_fee, 2)} Ⓝ` : 'Connect wallet to attack'}
                      </button>
                    </div>
                    {myPending > 0 && (
                      <p className="mt-2 text-[11px] font-mono text-sky-300">
                        {myPending} of your attempts waiting for a verdict.
                      </p>
                    )}
                  </>
                )
              ) : (
                <div className="text-sm text-zinc-400 font-mono">
                  This vault is closed ({phase.toLowerCase()}).
                  {phase === 'Expired' && isHost && room.status !== 'Refunded' && (
                    <div className="mt-3">
                      <button
                        onClick={refund}
                        disabled={busy}
                        className="px-4 py-2 clip-game-btn bg-amber-500 hover:bg-amber-400 text-black font-display font-black text-xs uppercase tracking-wider inline-flex items-center gap-2"
                      >
                        <RotateCcw className="w-4 h-4" /> Reclaim {yoctoToNear(room.bounty, 3)} Ⓝ pot
                      </button>
                    </div>
                  )}
                </div>
              )}
              {open && isHost && room.status === 'Pending' && room.attempts_count === 0 && (
                <button onClick={refund} disabled={busy} className="mt-3 text-[11px] font-mono text-amber-300 underline">
                  Cancel vault and refund
                </button>
              )}
              {msg && (
                <div
                  className={`mt-4 p-3 rounded text-xs font-mono border ${
                    msg.kind === 'error'
                      ? 'border-red-500/40 bg-red-950/30 text-red-300'
                      : msg.kind === 'success'
                      ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300'
                      : 'border-sky-500/40 bg-sky-950/30 text-sky-300'
                  }`}
                >
                  {msg.text}{' '}
                  {msg.tx && (
                    <a href={txUrl(msg.tx)} target="_blank" rel="noreferrer" className="underline inline-flex items-center gap-1">
                      tx <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Transcript */}
            <div className="mt-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg font-black uppercase tracking-wider text-white">Onchain transcript</h2>
                <span className="text-[11px] font-mono text-zinc-500">{room.attempts_count} attempts • newest first</span>
              </div>
              {attempts.length === 0 ? (
                <p className="text-sm text-zinc-500 font-mono">No attempts yet. First blood is yours.</p>
              ) : (
                <div className="space-y-3">
                  {attempts.map(a => (
                    <AttemptRow key={a.index} a={a} me={accountId} onReclaim={reclaim} busy={busy} live={liveIdx.includes(a.index)} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Side column */}
          <aside className="space-y-5">
            {open && (
              <div className="clip-game-card border border-emerald-500/30 bg-[#060c10] p-5">
                <div className="text-xs font-display font-bold uppercase tracking-wider text-emerald-400 mb-2">
                  {squad ? 'Rally your squad' : 'Bring challengers'}
                </div>
                <p className="text-[11px] font-mono text-zinc-400 mb-3">
                  {squad
                    ? 'Only invited wallets can attack. Anyone with the link can spectate.'
                    : 'Every failed prompt makes the pot bigger. Share the vault.'}
                </p>
                <ShareButtons
                  text={`Can you trick "${room.guardian_name}" into leaking its secret? ${yoctoToNear(room.bounty, 2)} NEAR pot on BLUFF, built on @NEARProtocol. #NEARHackathon`}
                />
              </div>
            )}
            {squad && <InvitePanel room={room} isHost={isHost} busy={busy} onAdd={addInvites} />}
            <div className="relative clip-game-card border border-zinc-800 bg-[#060a11] p-5">
              <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
                {phase === 'Breached' ? 'Paid out' : 'Loot pot (escrowed)'}
              </div>
              <div className="font-display text-4xl font-black text-white mt-1">
                <span key={potDelta?.key ?? 0} className={potDelta ? 'animate-pot-pop' : ''}>
                  {yoctoToNear(phase === 'Breached' ? room.payout : room.bounty, 3)}
                </span>{' '}
                {potDelta && (
                  <span key={`d${potDelta.key}`} className="absolute right-5 top-4 text-sm font-mono text-emerald-400 animate-float-up">
                    +{potDelta.amount} Ⓝ
                  </span>
                )}
                <span className="text-emerald-400 text-base">NEAR</span>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4 text-xs font-mono">
                <div>
                  <div className="text-zinc-500">Per prompt</div>
                  <div className="text-zinc-100">{yoctoToNear(room.entry_fee, 3)} Ⓝ</div>
                </div>
                <div>
                  <div className="text-zinc-500">Seeded</div>
                  <div className="text-zinc-100">{yoctoToNear(room.initial_bounty, 3)} Ⓝ</div>
                </div>
                <div>
                  <div className="text-zinc-500">Attempts</div>
                  <div className="text-zinc-100">{room.attempts_count}</div>
                </div>
                <div>
                  <div className="text-zinc-500">Ends</div>
                  <div className="text-zinc-100">{now !== null ? new Date(Number(room.expires_at)).toLocaleString() : '…'}</div>
                </div>
              </div>
              <p className="text-[11px] text-zinc-500 font-mono mt-4">
                80% of every fee (after storage) is added to this pot. If nobody breaks the guardian before the deadline, the host gets the pot back.
              </p>
            </div>

            {isHeist(room) && (
              <div className="clip-game-card border border-red-500/30 bg-[#110707] p-5 font-mono text-xs text-zinc-300 space-y-2">
                <div className="text-xs font-display font-bold uppercase tracking-wider text-red-300">Wallet policy (enforced onchain)</div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Max per transfer</span>
                  <span className="text-white">{yoctoToNear(room.max_payout, 3)} Ⓝ</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Recipient</span>
                  <span className="text-white">only the attacker who paid</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Successful heists</span>
                  <span className="text-red-300">{room.heists} • {yoctoToNear(room.total_heisted, 3)} Ⓝ</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Over-cap attempts blocked</span>
                  <span className="text-amber-300">{attempts.filter(a => a.status === 'PolicyBlocked').length}</span>
                </div>
                <p className="text-[11px] text-zinc-500 pt-1">
                  The AI is treated as untrusted. Whatever it tries to send, the contract only pays the attacker of that attempt and never more than the cap.
                </p>
              </div>
            )}
            <div className="clip-game-card border border-zinc-800 bg-[#060a11] p-5">
              <div className="flex items-center gap-2 text-xs font-display font-bold uppercase tracking-wider text-emerald-400 mb-2">
                <Shield className="w-4 h-4" /> Guardian brief (public)
              </div>
              <pre className="whitespace-pre-wrap break-words text-xs font-mono text-zinc-300 max-h-72 overflow-auto">{room.system_prompt}</pre>
              <p className="text-[11px] text-zinc-500 font-mono mt-3">
                <strong className="text-zinc-300">{diff.label}:</strong> {diff.blurb}
              </p>
            </div>

            <div className="clip-game-card border border-zinc-800 bg-[#060a11] p-5 text-xs font-mono text-zinc-400 space-y-2">
              <div className="flex items-center gap-2 text-xs font-display font-bold uppercase tracking-wider text-emerald-400">
                <ShieldCheck className="w-4 h-4" /> Verifiability
              </div>
              <div className="flex items-start gap-2">
                <Lock className="w-3.5 h-3.5 mt-0.5 shrink-0 text-zinc-500" />
                <span className="break-all">
                  Canary commitment: {room.canary_hash ? <code className="text-zinc-200">sha256 {room.canary_hash.slice(0, 16)}…</code> : 'not armed yet'}
                </span>
              </div>
              <p>
                {isHeist(room)
                  ? 'Every reply and tool call is stored onchain with a TEE-signed inference id. The contract, not the AI, decides how much can move: at most the cap, only to the paying attacker.'
                  : null}
              </p>
              <p className={isHeist(room) ? 'hidden' : ''}>
                The secret code is derived on the judge server and was never shown to the host. A payout only happens if the reply stored onchain contains a code whose sha256 matches this commitment.
              </p>
              {room.status === 'Pending' && open && (
                <p className="flex items-center gap-1.5 text-sky-300">
                  <AlertTriangle className="w-3.5 h-3.5" /> Arming: the judge is committing the canary hash.
                </p>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default function ArenaPage() {
  return (
    <Suspense fallback={null}>
      <ArenaDetail />
    </Suspense>
  );
}
