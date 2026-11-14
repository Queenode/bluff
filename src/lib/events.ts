import { api, type Attempt, type Room } from '@/lib/near';

/** Points for a winning attempt: harder guardians are worth more. */
export const pointsFor = (room: Room, a: Attempt) =>
  a.status === 'Breached' ? 100 * (room.difficulty + 1) : a.status === 'Heisted' ? 50 * (room.difficulty + 1) : 0;

export interface ScoreRow {
  account: string;
  points: number;
  wins: number;
  attempts: number;
  won: bigint;
  lastScoreAt: number;
}

export interface EventData {
  host: string;
  vaults: Room[];
  attempts: Attempt[];
  board: ScoreRow[];
}

async function allAttempts(room: Room): Promise<Attempt[]> {
  const out: Attempt[] = [];
  for (let from = 0; from < room.attempts_count; from += 50) {
    out.push(...(await api.attempts(room.id, from, 50)));
  }
  return out;
}

/**
 * An event board is derived entirely from the chain: only vaults whose onchain
 * host is `host` count, so nobody can attach someone else's vaults to an event.
 */
export async function loadEvent(host: string, only: string[] | null): Promise<EventData> {
  const rooms: Room[] = [];
  for (let from = 0; ; from += 100) {
    const page = await api.rooms(from, 100);
    rooms.push(...page);
    if (page.length < 100) break;
  }
  const vaults = rooms
    .filter(r => r.host === host && (!only || only.includes(r.id)))
    .sort((a, b) => Number(a.id) - Number(b.id));
  const lists = await Promise.all(vaults.map(allAttempts));
  const attempts = lists.flat();
  const byId = new Map(vaults.map(v => [v.id, v]));
  const rows = new Map<string, ScoreRow>();
  for (const a of attempts) {
    const room = byId.get(a.room_id)!;
    const r = rows.get(a.attacker) ?? { account: a.attacker, points: 0, wins: 0, attempts: 0, won: BigInt(0), lastScoreAt: 0 };
    r.attempts++;
    const pts = pointsFor(room, a);
    if (pts > 0) {
      r.points += pts;
      r.wins++;
      r.lastScoreAt = Math.max(r.lastScoreAt, Number(a.judged_at ?? a.created_at));
      if (a.status === 'Heisted' && a.transfer) r.won += BigInt(a.transfer);
      if (a.status === 'Breached' && room.payout) r.won += BigInt(room.payout);
    }
    rows.set(a.attacker, r);
  }
  const board = [...rows.values()].sort(
    (x, y) => y.points - x.points || (x.lastScoreAt || Infinity) - (y.lastScoreAt || Infinity) || y.attempts - x.attempts,
  );
  return { host, vaults, attempts, board };
}

export function eventUrl(host: string, name?: string, vaults?: string[]) {
  const q = new URLSearchParams();
  if (name) q.set('name', name);
  if (vaults && vaults.length) q.set('vaults', vaults.join(','));
  const qs = q.toString();
  return `/event/${host}${qs ? `?${qs}` : ''}`;
}
