'use client';

import React, { useEffect, useState } from 'react';
import { Check, Copy, MessageCircle, Send, Share2 } from 'lucide-react';

const shareBtn =
  'px-3 py-2 clip-game-btn bg-zinc-900 border border-zinc-700 hover:border-emerald-500/50 text-[11px] font-display font-bold uppercase tracking-wider text-zinc-200 inline-flex items-center gap-1.5';

export function ShareButtons({ text, label, url: urlProp }: { text: string; label?: string; url?: string }) {
  const [copied, setCopied] = useState(false);
  const [canNative, setCanNative] = useState(false);
  const url = urlProp ?? (typeof window !== 'undefined' ? window.location.href.split('?')[0] : '');
  useEffect(() => {
    const t = setTimeout(() => setCanNative(typeof navigator !== 'undefined' && !!navigator.share), 0);
    return () => clearTimeout(t);
  }, []);
  const full = `${text}\n${url}`;
  return (
    <div className="mt-3">
      {label && <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-1.5">{label}</div>}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => {
            navigator.clipboard.writeText(full).then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            });
          }}
          className={shareBtn}
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
        <a href={`https://x.com/intent/post?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`} target="_blank" rel="noreferrer" className={shareBtn}>
          <span className="font-black">𝕏</span> Post
        </a>
        <a href={`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`} target="_blank" rel="noreferrer" className={shareBtn}>
          <Send className="w-3.5 h-3.5" /> Telegram
        </a>
        <a href={`https://wa.me/?text=${encodeURIComponent(full)}`} target="_blank" rel="noreferrer" className={shareBtn}>
          <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
        </a>
        {canNative && (
          <button onClick={() => navigator.share({ title: 'BLUFF', text, url }).catch(() => {})} className={shareBtn}>
            <Share2 className="w-3.5 h-3.5" /> More
          </button>
        )}
      </div>
    </div>
  );
}

