import { processRoom } from '@/lib/server/oracle';

export const maxDuration = 60;

/**
 * Arms a room (commits its canary hash) and judges queued attempts.
 * Safe to call by anyone, any number of times: the contract only accepts the
 * oracle's verdicts in order, and every verdict is derived from the prompt that
 * the attacker already committed onchain.
 */
export async function POST(request: Request) {
  let roomId: string | undefined;
  try {
    const body = await request.json();
    roomId = typeof body?.roomId === 'string' || typeof body?.roomId === 'number' ? String(body.roomId) : undefined;
  } catch {
    // fallthrough
  }
  if (!roomId || !/^\d{1,18}$/.test(roomId)) {
    return Response.json({ error: 'roomId required' }, { status: 400 });
  }
  try {
    const judged = await processRoom(roomId);
    return Response.json({ judged });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return Response.json({ error: msg.slice(0, 300) }, { status: 500 });
  }
}
