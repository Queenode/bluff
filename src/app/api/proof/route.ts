/**
 * Fetches the NEAR AI Cloud TEE signature for a judged attempt's chat completion.
 * The signed text is "<model>:<sha256(request)>:<sha256(response)>" (or
 * "<request_hash>:<response_hash>" for gateway signatures), signed by a key that
 * lives inside the attested enclave. See https://docs.near.ai/cloud/verification
 */
export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get('id') || '';
  if (!id.startsWith('nearai:')) return Response.json({ error: 'Not a NEAR AI proof id' }, { status: 400 });
  const chatId = id.slice('nearai:'.length);
  if (!/^[\w.-]{1,120}$/.test(chatId)) return Response.json({ error: 'Bad id' }, { status: 400 });
  const key = process.env.LLM_API_KEY;
  if (!key) return Response.json({ error: 'Verifier not configured' }, { status: 503 });
  const base = (process.env.LLM_BASE_URL || 'https://cloud-api.near.ai/v1').replace(/\/$/, '');
  // The judge falls back to a second model if the primary is briefly unavailable.
  const models = [process.env.LLM_MODEL || 'Qwen/Qwen3.6-35B-A3B-FP8', process.env.LLM_FALLBACK_MODEL || 'Qwen/Qwen3.8-27B'];
  let res: Response | null = null;
  let model = models[0];
  for (const m of models) {
    model = m;
    res = await fetch(
      `${base}/signature/${encodeURIComponent(chatId)}?model=${encodeURIComponent(m)}&signing_algo=ecdsa`,
      { headers: { Authorization: `Bearer ${key}`, Accept: 'application/json' }, cache: 'no-store' },
    );
    if (res.ok) break;
  }
  if (!res) return Response.json({ error: 'unavailable' }, { status: 502 });
  const body = await res.json().catch(() => ({ error: `status ${res!.status}` }));
  return Response.json(
    { chat_id: chatId, model, verify_at: 'https://cloud.near.ai/verify', ...body },
    { status: res.ok ? 200 : res.status },
  );
}
