import { ImageResponse } from 'next/og';
import { api, difficultyOf, isHeist, isInviteOnly, yoctoToNear } from '@/lib/near';

export const alt = 'BLUFF vault card';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

async function loadFont(family: string, weight: number): Promise<ArrayBuffer | null> {
  try {
    const css = await (await fetch(`https://fonts.googleapis.com/css2?family=${family}:wght@${weight}`)).text();
    const src = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)?.[1];
    return src ? await (await fetch(src)).arrayBuffer() : null;
  } catch {
    return null;
  }
}

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [room, orbitron, mono] = await Promise.all([
    api.room(id).catch(() => null),
    loadFont('Orbitron', 900),
    loadFont('Share+Tech+Mono', 400),
  ]);
  const heist = room ? isHeist(room) : false;
  const squad = room ? isInviteOnly(room) : false;
  const breached = room?.status === 'Breached';
  const accent = breached ? '#ef4444' : heist ? '#f87171' : '#34d399';
  const pot = room ? yoctoToNear(breached ? room.payout : room.bounty, 2) : '?';
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 60,
          background: 'radial-gradient(circle at 80% 10%, #0f2a22 0%, #03060a 60%)',
          color: 'white',
          fontFamily: mono ? 'ShareTech' : 'monospace',
          border: `6px solid ${accent}`,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', fontSize: 44, fontFamily: 'Orbitron', letterSpacing: 8, color: accent }}>BLUFF</div>
          <div style={{ display: 'flex', gap: 14, fontSize: 24 }}>
            {heist && <div style={{ display: 'flex', padding: '6px 16px', border: '2px solid #f87171', color: '#fca5a5' }}>HEIST</div>}
            {squad && <div style={{ display: 'flex', padding: '6px 16px', border: '2px solid #f59e0b', color: '#fcd34d' }}>SQUAD</div>}
            {room && (
              <div style={{ display: 'flex', padding: '6px 16px', border: '2px solid #34d399', color: '#6ee7b7' }}>
                {difficultyOf(room.difficulty).label.toUpperCase()}
              </div>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', fontSize: 28, color: '#a1a1aa', letterSpacing: 4 }}>VAULT #{id}</div>
          <div style={{ display: 'flex', fontSize: 64, fontFamily: 'Orbitron', marginTop: 8 }}>{room?.name ?? 'Unknown vault'}</div>
          <div style={{ display: 'flex', fontSize: 34, color: '#d4d4d8', marginTop: 12 }}>
            {breached
              ? `${room?.guardian_name} got ${heist ? 'robbed' : 'cracked'}.`
              : heist
                ? `Talk ${room?.guardian_name} into paying you.`
                : `Make ${room?.guardian_name ?? 'the guardian'} leak its secret.`}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', fontSize: 24, color: '#a1a1aa', letterSpacing: 4 }}>
              {breached ? 'PAID OUT' : heist ? 'IN THE WALLET' : 'LOOT POT'}
            </div>
            <div style={{ display: 'flex', fontSize: 90, fontFamily: 'Orbitron', color: accent }}>{pot} NEAR</div>
          </div>
          <div style={{ display: 'flex', fontSize: 30, padding: '18px 30px', background: accent, color: '#03060a', fontWeight: 900 }}>
            {breached ? 'SEE HOW' : squad ? 'SQUAD ONLY' : 'TAKE THE SHOT'}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        ...(orbitron ? [{ name: 'Orbitron', data: orbitron, weight: 900 as const }] : []),
        ...(mono ? [{ name: 'ShareTech', data: mono, weight: 400 as const }] : []),
      ],
    },
  );
}
