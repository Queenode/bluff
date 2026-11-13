'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Fingerprint, Loader2, ExternalLink, ShieldCheck } from 'lucide-react';

interface Sig {
  chat_id?: string;
  model?: string;
  text?: string;
  signature?: string;
  signing_address?: string;
  signing_algo?: string;
  signature_kind?: string;
  verify_at?: string;
  error?: unknown;
}

function Row({ k, v, mono = true }: { k: string; v: React.ReactNode; mono?: boolean }) {
  return (
    <div className="grid sm:grid-cols-[180px_1fr] gap-1 sm:gap-4 py-3 border-t border-zinc-800">
      <div className="text-[11px] font-display font-bold uppercase tracking-wider text-zinc-400">{k}</div>
      <div className={`${mono ? 'font-mono' : ''} text-xs text-zinc-100 break-all`}>{v}</div>
    </div>
  );
}

function ProofView() {
  const id = useSearchParams().get('id') || '';
  const [sig, setSig] = useState<Sig | null>(null);
  useEffect(() => {
    if (!id) return;
    fetch(`/api/proof?id=${encodeURIComponent(id)}`)
      .then(r => r.json())
      .then(setSig)
      .catch(e => setSig({ error: String(e) }));
  }, [id]);

  const parts = sig?.text?.split(':') ?? [];
  const [model, reqHash, resHash] = parts.length === 3 ? parts : [undefined, parts[0], parts[1]];

  return (
    <div className="min-h-screen bg-[#03060a] px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-emerald-400 mb-2">{'// VERIFIABLE INFERENCE'}</div>
        <h1 className="flex items-center gap-3 font-display text-3xl font-black uppercase tracking-wider text-white text-glow-white">
          <Fingerprint className="w-7 h-7 text-emerald-400" /> TEE proof
        </h1>
        <p className="text-sm text-zinc-400 mt-2 max-w-2xl">
          This guardian reply was produced on NEAR AI Cloud. The enclave signed the SHA-256 of the exact request and response, so a
          judge cannot swap in a different reply without breaking the signature.
        </p>

        <div className="mt-8 clip-game-card border border-emerald-500/30 bg-[#060c10] p-6">
          {!sig ? (
            <div className="flex items-center gap-2 text-zinc-400 text-sm font-mono">
              <Loader2 className="w-4 h-4 animate-spin" /> Fetching signature from NEAR AI Cloud…
            </div>
          ) : sig.error && !sig.signature ? (
            <p className="text-red-300 font-mono text-sm">Signature unavailable: {JSON.stringify(sig.error).slice(0, 200)}</p>
          ) : (
            <>
              <div className="flex items-center gap-2 text-emerald-300 font-display font-bold uppercase tracking-wider text-sm mb-2">
                <ShieldCheck className="w-4 h-4" /> Signed by {sig.signature_kind === 'provider_tee' ? 'the model enclave (TEE)' : sig.signature_kind || 'NEAR AI Cloud'}
              </div>
              <Row k="Completion id" v={sig.chat_id} />
              <Row k="Model" v={model || sig.model} />
              <Row k="sha256(request)" v={reqHash} />
              <Row k="sha256(response)" v={resHash} />
              <Row k="Signing algo" v={sig.signing_algo || 'ecdsa'} />
              <Row k="Enclave signer" v={sig.signing_address} />
              <Row k="Signature" v={sig.signature} />
              <Row k="Signed text" v={sig.text} />
            </>
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-3 text-xs font-mono">
          <a href="https://cloud.near.ai/verify" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-emerald-400 hover:underline">
            Verify attestation on NEAR AI Cloud <ExternalLink className="w-3 h-3" />
          </a>
          <a href={`/api/proof?id=${encodeURIComponent(id)}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-zinc-400 hover:underline">
            Raw JSON <ExternalLink className="w-3 h-3" />
          </a>
          <Link href="/how-it-works" className="text-zinc-400 hover:underline">
            Trust model
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ProofPage() {
  return (
    <Suspense fallback={null}>
      <ProofView />
    </Suspense>
  );
}
