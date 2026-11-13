import { connection } from 'next/server';
import { CONTRACT_ID, NETWORK_ID } from '@/lib/near';

export async function GET() {
  await connection();
  return Response.json({
    network: NETWORK_ID,
    contract: CONTRACT_ID,
    oracle: process.env.ORACLE_ACCOUNT_ID ?? null,
    oracleKey: Boolean(process.env.ORACLE_PRIVATE_KEY),
    canarySecret: Boolean(process.env.CANARY_SECRET),
    llm: { base: process.env.LLM_BASE_URL ?? null, model: process.env.LLM_MODEL ?? null, key: Boolean(process.env.LLM_API_KEY) },
  });
}
