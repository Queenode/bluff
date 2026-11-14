import React from 'react';

/** Rubber-stamp overlay for cracked vaults ("BREACHED" / "HEISTED"). */
export function Stamp({ kind, sub, size = 'md', align = 'center' }: { kind: 'breached' | 'heisted'; sub?: string; size?: 'md' | 'lg'; align?: 'center' | 'right' }) {
  const color = kind === 'breached' ? '#ef4444' : '#f59e0b';
  return (
    <div className={`pointer-events-none absolute inset-0 z-20 flex items-center ${align === 'right' ? 'justify-end pr-8 sm:pr-14' : 'justify-center'}`}>
      <div
        className={`stamp-slam select-none text-center font-display font-black uppercase ${size === 'lg' ? 'px-6 py-2.5' : 'px-5 py-2'}`}
        style={{
          color,
          border: `4px double ${color}`,
          boxShadow: `0 0 0 2px ${color}55, 0 0 30px ${color}55, inset 0 0 18px ${color}40`,
          background: 'rgba(3,6,10,.82)',
          textShadow: `0 0 12px ${color}`,
          WebkitMaskImage:
            'radial-gradient(circle at 20% 30%, rgba(0,0,0,.35) 0 1.5px, transparent 2.5px), radial-gradient(circle at 70% 60%, rgba(0,0,0,.35) 0 1px, transparent 2px), linear-gradient(#000, #000)',
          WebkitMaskSize: '23px 19px, 31px 27px, 100% 100%',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        }}
      >
        <div className={`${size === 'lg' ? 'text-3xl tracking-[0.16em]' : 'text-[28px] tracking-[0.16em]'} leading-none`}>
          {kind === 'breached' ? 'BREACHED' : 'HEISTED'}
        </div>
        {sub && <div className={`${size === 'lg' ? 'text-xs' : 'text-[11px]'} mt-1 font-mono tracking-[0.2em]`}>{sub}</div>}
      </div>
    </div>
  );
}
