import type { Metadata } from 'next';
import { api, isHeist, isInviteOnly, yoctoToNear } from '@/lib/near';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const room = await api.room(id).catch(() => null);
  if (!room) return { title: `Vault #${id} • BLUFF` };
  const pot = yoctoToNear(room.bounty, 2);
  const title = isHeist(room)
    ? `Rob ${room.guardian_name}: ${pot} NEAR in its wallet • BLUFF`
    : `Crack ${room.guardian_name}: ${pot} NEAR pot • BLUFF`;
  const description = isInviteOnly(room)
    ? `Squad vault: ${room.invited.length} invited raiders get to try. Spectate the transcripts live, verified onchain on NEAR.`
    : isHeist(room)
      ? `${room.guardian_name} is an AI agent holding real NEAR. Talk it into paying you. ${yoctoToNear(room.entry_fee, 2)} NEAR per prompt.`
      : `Make the AI guardian "${room.guardian_name}" leak its secret code and the contract pays you the whole pot. ${yoctoToNear(room.entry_fee, 2)} NEAR per prompt.`;
  return { title, description, openGraph: { title, description }, twitter: { card: 'summary_large_image', title, description } };
}

export default function ArenaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
