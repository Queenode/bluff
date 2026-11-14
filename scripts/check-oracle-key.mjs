#!/usr/bin/env node
// Proves the judge's key is a function-call access key that can ONLY call
// arm_room / judge_attempt on the BLUFF contract. Everything else is rejected by NEAR itself.
//
// Usage: ORACLE_ACCOUNT_ID=... ORACLE_PRIVATE_KEY=ed25519:... node scripts/check-oracle-key.mjs
import { Account, JsonRpcProvider, nearToYocto, teraToGas } from 'near-api-js';

const { ORACLE_ACCOUNT_ID, ORACLE_PRIVATE_KEY } = process.env;
const CONTRACT = process.env.NEXT_PUBLIC_BLUFF_CONTRACT || 'bluff-live-76371.testnet';
const provider = new JsonRpcProvider({ url: process.env.NEAR_RPC_URL || 'https://test.rpc.fastnear.com' });
const acct = new Account(ORACLE_ACCOUNT_ID, provider, ORACLE_PRIVATE_KEY);
const pub = (await acct.getSigner().getPublicKey()).toString();

const keys = await provider.query({ request_type: 'view_access_key_list', account_id: ORACLE_ACCOUNT_ID, finality: 'final' });
const mine = keys.keys.find(k => k.public_key === pub);
console.log('judge account :', ORACLE_ACCOUNT_ID);
console.log('signing key   :', pub);
console.log('permission    :', JSON.stringify(mine?.access_key.permission));

const attempts = [
  ['transfer 0.01 NEAR to an attacker', () => acct.transfer({ receiverId: 'whitehat-76371.testnet', amount: nearToYocto('0.01') })],
  ['call withdraw_treasury on BLUFF', () => acct.callFunction({ contractId: CONTRACT, methodName: 'withdraw_treasury', args: { amount: '1' }, gas: teraToGas('30') })],
  ['call a method on another contract', () => acct.callFunction({ contractId: 'wrap.testnet', methodName: 'near_deposit', args: {}, gas: teraToGas('30') })],
];
for (const [label, run] of attempts) {
  try {
    await run();
    console.log(`✗ ${label}: SUCCEEDED (unexpected)`);
  } catch (e) {
    console.log(`✓ ${label}: rejected (${String(e.message || e).split('\n')[0].slice(0, 120)})`);
  }
}
