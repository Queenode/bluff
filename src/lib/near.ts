// Shared (browser + server) helpers for reading the BLUFF contract over JSON-RPC.

export const NETWORK_ID = (process.env.NEXT_PUBLIC_NETWORK_ID || 'testnet') as 'testnet' | 'mainnet';
export const CONTRACT_ID = process.env.NEXT_PUBLIC_CONTRACT_ID || 'bluff-vault-76371.testnet';
export const RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL ||
  (NETWORK_ID === 'mainnet' ? 'https://free.rpc.fastnear.com' : 'https://test.rpc.fastnear.com');
export const EXPLORER_URL =
  NETWORK_ID === 'mainnet' ? 'https://nearblocks.io' : 'https://testnet.nearblocks.io';

export const txUrl = (hash: string) => `${EXPLORER_URL}/txns/${hash}`;
export const accountUrl = (id: string) => `${EXPLORER_URL}/address/${id}`;

export type RoomStatus = 'Pending' | 'Active' | 'Breached' | 'Refunded';
export type AttemptStatus = 'Pending' | 'Defended' | 'Breached' | 'Refunded';

/** Room as returned by the contract (u64 / NearToken values are strings). */
export interface Room {
  id: string;
  name: string;
  guardian_name: string;
  system_prompt: string;
  difficulty: number;
  host: string;
  initial_bounty: string;
  bounty: string;
  entry_fee: string;
  created_at: string;
  expires_at: string;
  canary_hash: string | null;
  status: RoomStatus;
  attempts_count: number;
  next_to_judge: number;
  winner: string | null;
  winning_attempt: number | null;
  revealed_canary: string | null;
  payout: string | null;
  invited: string[];
}

export interface Attempt {
  room_id: string;
  index: number;
  attacker: string;
  prompt: string;
  fee: string;
  pot_share: string;
  created_at: string;
  status: AttemptStatus;
  response: string | null;
  attack_vector: string | null;
  proof: string | null;
  judged_at: string | null;
}

export interface PlayerStats {
  attempts: number;
  breaches: number;
  spent: string;
  earned: string;
  rooms_hosted: number;
}

export interface Stats {
  rooms: number;
  attempts: number;
  breaches: number;
  total_paid_out: string;
  total_locked: string;
  players: number;
  oracle_id: string;
  owner_id: string;
}

export const DIFFICULTIES = [
  {
    label: 'Standard',
    level: 'LVL 1',
    bars: 1,
    blurb: "Only the host's system prompt stands between you and the pot.",
  },
  {
    label: 'Hardened',
    level: 'LVL 2',
    bars: 2,
    blurb: 'Host prompt wrapped in an anti-jailbreak security preamble with spotlighted input.',
  },
  {
    label: 'Fortress',
    level: 'LVL 3',
    bars: 3,
    blurb: 'Hardened, plus an LLM input firewall that screens your prompt before the guardian sees it.',
  },
] as const;

export const difficultyOf = (d: number) => DIFFICULTIES[Math.min(Math.max(d, 0), 2)];

const YOCTO = BigInt('1000000000000000000000000');

export function yoctoToNear(yocto: string | bigint | null | undefined, decimals = 2): string {
  if (yocto === null || yocto === undefined) return '0';
  const v = typeof yocto === 'bigint' ? yocto : BigInt(yocto);
  const whole = v / YOCTO;
  const frac = v % YOCTO;
  if (decimals === 0) return whole.toString();
  const fracStr = frac.toString().padStart(24, '0').slice(0, decimals).replace(/0+$/, '');
  return fracStr ? `${whole}.${fracStr}` : whole.toString();
}

export function nearToYocto(near: string | number): string {
  const s = String(near).trim();
  if (!/^\d*(\.\d*)?$/.test(s) || s === '' || s === '.') throw new Error('Invalid NEAR amount');
  const [whole, frac = ''] = s.split('.');
  return (BigInt(whole || '0') * YOCTO + BigInt((frac + '0'.repeat(24)).slice(0, 24))).toString();
}

let rpcId = 0;
async function rpc<T>(method: string, params: unknown): Promise<T> {
  const res = await fetch(RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: ++rpcId, method, params }),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`RPC ${res.status}`);
  const json = await res.json();
  if (json.error) throw new Error(json.error?.data || json.error?.message || 'RPC error');
  if (json.result?.error) throw new Error(json.result.error);
  return json.result as T;
}

const toBase64 = (s: string) =>
  typeof window === 'undefined' ? Buffer.from(s).toString('base64') : btoa(unescape(encodeURIComponent(s)));

export async function view<T>(method: string, args: Record<string, unknown> = {}): Promise<T> {
  const result = await rpc<{ result: number[] }>('query', {
    request_type: 'call_function',
    finality: 'optimistic',
    account_id: CONTRACT_ID,
    method_name: method,
    args_base64: toBase64(JSON.stringify(args)),
  });
  const text = new TextDecoder().decode(new Uint8Array(result.result));
  return JSON.parse(text) as T;
}

export async function getBalance(accountId: string): Promise<string> {
  const r = await rpc<{ amount: string }>('query', {
    request_type: 'view_account',
    finality: 'optimistic',
    account_id: accountId,
  });
  return r.amount;
}

export const api = {
  stats: () => view<Stats>('get_stats'),
  rooms: (from = 0, limit = 100) => view<Room[]>('get_rooms', { from_index: from, limit }),
  room: (id: string) => view<Room | null>('get_room', { room_id: id }),
  attempts: (roomId: string, from = 0, limit = 50) =>
    view<Attempt[]>('get_attempts', { room_id: roomId, from_index: from, limit }),
  attempt: (roomId: string, index: number) => view<Attempt | null>('get_attempt', { room_id: roomId, index }),
  recent: (from = 0, limit = 50) => view<Attempt[]>('get_recent_attempts', { from_index: from, limit }),
  leaderboard: (limit = 25) =>
    view<{ account_id: string; stats: PlayerStats }[]>('get_leaderboard', { limit }),
  player: (accountId: string) => view<PlayerStats | null>('get_player', { account_id: accountId }),
};

/** Effective state for display: Active/Pending rooms past their deadline are "Expired". */
export function roomPhase(room: Room, now = Date.now()): 'Arming' | 'Live' | 'Breached' | 'Expired' | 'Refunded' {
  if (room.status === 'Breached') return 'Breached';
  if (room.status === 'Refunded') return 'Refunded';
  if (now >= Number(room.expires_at)) return 'Expired';
  return room.status === 'Pending' ? 'Arming' : 'Live';
}

export function shortAccount(id: string, max = 22) {
  if (id.length <= max) return id;
  return `${id.slice(0, max - 8)}…${id.slice(-6)}`;
}

export function timeAgo(ms: number, now = Date.now()) {
  const s = Math.max(0, Math.floor((now - ms) / 1000));
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export const isInviteOnly = (room: Room) => room.invited.length > 0;

/** Who may see a vault in the lobby: open vaults for everyone, invite-only ones for the host and invitees. */
export function canSeeInLobby(room: Room, me: string | null) {
  return !isInviteOnly(room) || (!!me && (room.host === me || room.invited.includes(me)));
}

export function canAttack(room: Room, me: string | null) {
  return !!me && me !== room.host && (!isInviteOnly(room) || room.invited.includes(me));
}

const ACCOUNT_RE = /^(([a-z\d]+[-_])*[a-z\d]+\.)*([a-z\d]+[-_])*[a-z\d]+$/;
export function parseAccountList(text: string): { valid: string[]; invalid: string[] } {
  const parts = text
    .split(/[\s,;]+/)
    .map(s => s.trim().toLowerCase().replace(/^@/, ''))
    .filter(Boolean);
  const valid: string[] = [];
  const invalid: string[] = [];
  for (const p of parts) {
    if (p.length >= 2 && p.length <= 64 && ACCOUNT_RE.test(p)) {
      if (!valid.includes(p)) valid.push(p);
    } else invalid.push(p);
  }
  return { valid, invalid };
}
