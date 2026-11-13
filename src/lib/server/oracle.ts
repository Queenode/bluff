import 'server-only';
import { Account, JsonRpcProvider, teraToGas, type KeyPairString } from 'near-api-js';
import { api, CONTRACT_ID, RPC_URL, roomPhase, type Attempt } from '@/lib/near';
import { canaryFor, runGuardian, sha256Hex } from './guardian';

let account: Account | null = null;
function oracle(): Account {
  if (account) return account;
  const id = process.env.ORACLE_ACCOUNT_ID;
  const key = process.env.ORACLE_PRIVATE_KEY as KeyPairString | undefined;
  if (!id || !key) throw new Error('Oracle is not configured (ORACLE_ACCOUNT_ID / ORACLE_PRIVATE_KEY)');
  account = new Account(id, new JsonRpcProvider({ url: RPC_URL }), key);
  return account;
}

// Serialise oracle transactions within this process so nonces don't collide.
let txChain: Promise<unknown> = Promise.resolve();
function call(methodName: string, args: Record<string, unknown>, tgas: number = 100) {
  const run = () =>
    oracle().callFunction({ contractId: CONTRACT_ID, methodName, args, gas: teraToGas(tgas), deposit: BigInt(0) });
  const p = txChain.then(run, run);
  txChain = p.catch(() => undefined);
  return p;
}

export interface JudgedAttempt {
  index: number;
  status: Attempt['status'] | 'Error';
  error?: string;
}

const inFlight = new Map<string, Promise<JudgedAttempt[]>>();

/** Arm the room if needed and judge every queued attempt (bounded per call). */
export function processRoom(roomId: string, maxAttempts = 4): Promise<JudgedAttempt[]> {
  const existing = inFlight.get(roomId);
  if (existing) return existing;
  const p = doProcess(roomId, maxAttempts).finally(() => inFlight.delete(roomId));
  inFlight.set(roomId, p);
  return p;
}

async function doProcess(roomId: string, maxAttempts: number): Promise<JudgedAttempt[]> {
  let room = await api.room(roomId);
  if (!room) throw new Error('Room not found');
  const out: JudgedAttempt[] = [];

  if (room.status === 'Pending') {
    if (roomPhase(room) === 'Expired' && room.attempts_count === 0) return out;
    await call('arm_room', { room_id: roomId, canary_hash: sha256Hex(canaryFor(roomId)) }, 30);
    room = (await api.room(roomId))!;
  }

  for (let n = 0; n < maxAttempts; n++) {
    if (room.status !== 'Active' || room.next_to_judge >= room.attempts_count) break;
    const index = room.next_to_judge;
    const attempt = await api.attempt(roomId, index);
    if (!attempt || attempt.status !== 'Pending') {
      room = (await api.room(roomId))!;
      continue;
    }
    try {
      const v = await runGuardian(room, attempt.prompt, attempt.attacker);
      await call('judge_attempt', {
        room_id: roomId,
        index,
        response: v.response,
        attack_vector: v.attackVector,
        canary: v.canary,
        proof: v.proof,
        transfer: v.transfer,
      });
      const judged = await api.attempt(roomId, index);
      out.push({ index, status: judged?.status ?? (v.canary ? 'Breached' : 'Defended') });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      out.push({ index, status: 'Error', error: msg.slice(0, 300) });
      break;
    }
    room = (await api.room(roomId))!;
  }
  return out;
}
