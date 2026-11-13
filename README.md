# BLUFF: trick the AI, take the NEAR

BLUFF is an onchain prompt-injection game. A **host** locks NEAR in a vault guarded by an AI. **Attackers** pay a small fee per prompt to try to make the guardian say its secret code. If the guardian leaks it, the NEAR contract checks the leak against a hash committed before any attack and pays the attacker the whole pot in the same transaction. If the guardian survives until the deadline, the host takes the pot back, plus 80% of every failed attacker's fee.

Every prompt and every reply is stored onchain. Together they form an open, incentivised red-teaming dataset for anyone building AI agents that hold keys or money.

Built for **NEAR HACKATHON 2026**. Tracks: **AI Security & Defense**, **Games With Real Economies**, **Agent Economy**.

| | |
|---|---|
| Live app | **https://bluff-sandy-two.vercel.app** (NEAR testnet) |
| Contract (testnet) | [`bluff-vault-76371.testnet`](https://testnet.nearblocks.io/address/bluff-vault-76371.testnet) |
| Judge / oracle account | [`bluff-oracle-76371.testnet`](https://testnet.nearblocks.io/address/bluff-oracle-76371.testnet) |
| Guardian model | `Qwen/Qwen3.6-35B-A3B-FP8` on **NEAR AI Cloud** (TEE, signed responses) |

---

## Why this matters

AI agents are starting to custody funds. Their most common failure is a well-crafted message that talks them out of their own rules. BLUFF puts a price on that failure:

* **Players** get paid for finding jailbreaks that work.
* **Agent builders** paste their real system prompt, fund a bounty, and get crowdsourced red-teaming. If the agent holds, their pot comes back bigger.
* **Everyone** gets a public, verifiable dataset of which attacks beat which defenses. It is exportable as JSON from the *Hall of Breaches* page.

## How a round works

```
 host ──create_room(+NEAR)──▶ ┌──────────────────────────┐
                              │  BLUFF contract (Rust)   │
 judge ──arm_room(sha256)───▶ │  • escrowed pot          │
                              │  • canary commitment     │
 attacker ─submit_attempt───▶ │  • prompt stored FIRST   │
          (+fee, prompt)      │  • replies + verdicts    │
                              │  • payouts / refunds     │
 judge ──judge_attempt──────▶ └──────────────────────────┘
   (reply, tag, TEE proof id,        │ if sha256(code)==commitment
    optional leaked code)            │ AND reply contains code
                                     ▼
                           pot ──transfer──▶ attacker
```

1. **`create_room`**: the host escrows NEAR with a public persona (system prompt), a defense level, a per-prompt fee and a deadline. Storage cost is deducted from the deposit; the rest is the pot.
2. **`arm_room`** (judge only): the judge derives the secret code as `HMAC(CANARY_SECRET, contract:room)` and commits only `sha256(code)`. The code is never stored or shown to anyone, **including the host**, so a host cannot breach their own vault.
3. **`submit_attempt`**: the attacker pays the fee and the exact prompt is written onchain *before* the model ever sees it. 80% of the fee (after storage) goes into the pot. Hosts cannot attack their own room.
4. **Judge**: `POST /api/judge` reads the next queued attempt from the chain, runs the guardian on NEAR AI Cloud, and calls **`judge_attempt`** with the reply, a heuristic attack tag, and the completion id (`nearai:<chat id>`). Its TEE signature covers the exact request and response bytes.
5. **Contract verifies**: a breach is only accepted if `sha256(code)` matches the commitment **and** the stored reply literally contains the code. The pot then goes to the attacker in the same transaction. Any attempts queued behind the winner are refunded in full.
6. **Liveness**: attempts are judged strictly in order. If the judge stalls for 30 minutes, the attacker calls **`reclaim_attempt`** for a full refund. After the deadline the host calls **`refund_room`**.

### Open arenas and squad vaults

* **Open arena**: listed in the lobby; any wallet can attack.
* **Squad (invite-only)**: the host lists up to 50 friends' accounts at creation (or later with `add_invites`). The contract rejects attempts from anyone else, and squad vaults are hidden from the lobby. Anyone with the link can still spectate the live transcript. The host can never attack their own vault, and nobody, including the host, knows the secret code.

### Defense levels (enforced by the judge)

| Level | What the attacker is up against |
|---|---|
| Standard | Host persona + secret. Raw model behaviour. |
| Hardened | Non-negotiable security preamble + spotlighting (player text fenced as untrusted data). |
| Fortress | Hardened + an LLM input firewall; blocked prompts never reach the guardian (and are recorded as such). |

### Trust model, honestly

* Funds are only ever held by the contract. The judge key can arm rooms and post verdicts; it cannot withdraw pots.
* The judge could in principle misreport a reply. Every reply is stored onchain with its NEAR AI Cloud completion id, and `/api/proof?id=…` fetches the enclave's signature over `model:sha256(request):sha256(response)`. A forged verdict is therefore detectable.
* The judge cannot choose a winner after the fact without leaving a public, checkable trace: the code's hash is committed before any attempt, and the winning reply containing the plaintext code is onchain.
* Next step (not built yet): run the judge itself as a NEAR Shade Agent in a TEE, so the canary secret and oracle key never leave attested hardware.

---

## Try it (judges: start here)

### A. Use the deployed contract with the local app (about 2 minutes)

Requires Node ≥ 22 and a NEAR **testnet** wallet (e.g. [MyNearWallet testnet](https://testnet.mynearwallet.com) or Meteor; get free testnet NEAR from the [faucet](https://near-faucet.io)).

```bash
git clone https://github.com/Queenode/bluff.git && cd bluff
npm install
cp .env.example .env.local     # public values already point at bluff-vault-76371.testnet
npm run dev                    # http://localhost:3000
```

Without `ORACLE_*`/`LLM_*` server env vars you can still browse every vault, transcript, the leaderboard and the dataset, all read live from the chain. Submitting attempts works too; they are judged by whichever judge server holds the oracle key (the hosted app's judge, or your own after step B).

| Do | See |
|---|---|
| Open `/arenas` | Live vaults read from `get_rooms`: pot, fee, countdown, attempt count |
| Open a vault, connect wallet, write a prompt, click **Attack** | Wallet asks you to pay the fee → prompt appears in the transcript as *Judging…* → within ~10 s the guardian's reply is written onchain and shown, tagged *Defended* or *Breached* |
| Click **TEE signature** under a judged reply | NEAR AI Cloud's enclave signature for that exact completion |
| Get the guardian to output its `BLUFF-XXXX-XXXX-XXXX` code | Banner shows the leaked code + payout; your wallet balance jumps by the pot; the tx is visible on nearblocks |
| Open `/create`, choose **Squad**, list a friend's testnet account, lock ≥ 0.55 NEAR | Vault is hidden from the lobby; your friend can attack it, any other wallet sees *spectator* mode and the contract rejects its attempts |
| Open `/create`, fill in a persona, lock ≥ 0.55 NEAR | New vault appears in the lobby as *Arming* and becomes live once the judge commits the hash |
| Open `/cve` (Hall of Breaches) | Totals, attack-vector breakdown, leaderboard, breach archive, **Export dataset (JSON)** |
| After a vault's deadline, as its host | **Reclaim pot** button calls `refund_room` |

### B. Run your own full stack (contract + judge)

```bash
npm i -g near-cli-rs && cargo install cargo-near   # Rust ≥ 1.86
./scripts/deploy_testnet.sh my-bluff.testnet my-bluff-judge.testnet
# paste the printed values into .env.local, add CANARY_SECRET (openssl rand -hex 32) and LLM_API_KEY
npm run dev
```

### C. Contract tests

```bash
cd contracts/bluff_escrow && cargo test
```

The 13 unit tests cover invite-only vaults (invited player allowed, outsider rejected, host adds invites), a full breach payout, refunds for attempts queued behind a winner, wrong-canary and canary-not-in-reply rejection, oracle-only judging, hosts not being able to attack their own vault, expiry, attacker reclaim after a judge stall, host refund, and cancelling an unarmed vault.

---

## Code map

| Path | What |
|---|---|
| `contracts/bluff_escrow/src/lib.rs` | NEAR contract (near-sdk 5): escrow, commit/verify, ordered judging, refunds, leaderboard, stats |
| `src/lib/server/guardian.ts` | Canary derivation, defense levels, firewall, LLM call, attack-vector tagging, onchain-size fitting |
| `src/lib/server/oracle.ts` | Judge loop: arms rooms, judges queued attempts in order, signs with the oracle key (near-api-js v7) |
| `src/app/api/judge` | Idempotent endpoint anyone can poke to process a room's queue |
| `src/app/api/proof` | Fetches NEAR AI Cloud TEE signatures for stored completion ids |
| `src/lib/wallet.tsx` | Wallet connection via `@hot-labs/near-connect` (HOT, Meteor, MyNearWallet, Intear, …) |
| `src/lib/near.ts` | Typed JSON-RPC view client shared by browser and server |
| `src/app/*` | Lobby, vault/attack console, create, Hall of Breaches, player pages, how-it-works |

## Stack

Next.js 16 (App Router), React 19, Tailwind 4, `@hot-labs/near-connect`, `near-api-js` v7, Rust + `near-sdk` 5.29, NEAR AI Cloud (OpenAI-compatible API).

## Built during the hackathon / disclosures

* All of the NEAR integration was written during the hackathon window: the contract, oracle, wallet flow, judge API and every chain-reading page. Earlier commits in this repo were a UI prototype with mocked data; that prototype was **replaced**, not extended. No mock data remains.
* AI coding assistants were used heavily while building (Gemini for the early UI prototype, Claude Code for the contract, oracle and chain integration). All code was reviewed and tested by the team.
* Third-party libraries are listed in `package.json` / `Cargo.toml`. Hero image: `public/images/hero-sentinels.jpg`.

## License

MIT
