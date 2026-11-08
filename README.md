# 🛡️ AGENT[HEIST]
### *Decentralized AI Red-Teaming & Escrow Arena on NEAR Protocol*

> Built for the **NEAR Hackathon ("Build Beyond Boundaries") 2026**
> **Tracks Targeted:**
> - 🥇 **Track 6: AI Security & Defense** *(Policy engines, sandboxed wallets, red-teaming & prompt injection)*
> - 🎮 **Track 9: Games with Real Economies** *(Competitive squad stand-offs, buy-in escrow, onchain prizes)*
> - 🤖 **Track 7: Agent Economy** *(Autonomous agents with wallets, paying bounties, economic autonomy)*

---

## ⚡ Executive Summary

As AI agents become economic actors holding crypto keys and managing DeFi treasuries, **prompt injection, jailbreaking, and data leakage pose existential risks to Web3 protocols**. Traditional AI audits cost \$30,000–\$100,000, take weeks, and fail to anticipate novel zero-day attack vectors.

**AGENT[HEIST]** turns AI safety into a high-stakes, decentralized competitive protocol:
1. **Permissionless Escrow Arenas**: Anyone—a group of crypto friends, a DAO, or an enterprise DeFi protocol—can deploy an AI Guardian with a locked prize pool in NEAR smart contract escrow.
2. **Competitive Infiltration**: Whitehat hackers, researchers, and players pay an attempt fee in NEAR. 80% of every failed attempt dynamically inflates the vault's bounty!
3. **Deterministic Proof-of-Breach**: If a hacker constructs an adversarial jailbreak that bypasses the multi-layer defenses and forces the Guardian to leak the secret canary, the smart contract automatically settles 100% of the escrow directly to the winner's wallet.
4. **Onchain CVE Intelligence**: Every attempt is indexed into an open-source red-teaming repository, providing protocols with actionable adversarial datasets to patch their agents before mainnet.

---

## 🎮 Game Modes

### 1. ⚔️ Squad Stand-Off (Friends & Guilds)
* **How it works**: Friends create a private or public battle room, set a buy-in (e.g. 5 NEAR per player), and configure a round timer.
* **The Dynamic**: Players race against the clock in a shared live terminal. The first player to outsmart the sentinel takes the entire pot.

### 2. 🏢 Enterprise Bug Bounty (Protocols & DAOs)
* **How it works**: Web3 protocols (e.g., *Ref Finance*, *Aurora*, *NEAR AI*) deposit a sponsor bounty (e.g. 250 NEAR) and specify their agent's system prompt + internal secret canary (or external webhook endpoint).
* **The Value**: Protocols get 24/7 crowdsourced penetration testing for a fraction of the cost of a centralized audit firm.

### 3. 👑 Global Progressive Jackpot
* Flagship sovereign vaults (e.g., **AEGIS-9**) seeded with community funds. As thousands of failed prompts accumulate, the pot climbs, generating viral hype across X.

---

## 🛡️ Multi-Tiered AI Guardian Architecture

Every Guardian enclave operates with 3 active defensive rings:

```
[ Inbound Exploit Payload (Signed via NEAR) ]
                    │
                    ▼
┌──────────────────────────────────────────────┐
│  Ring 1: Semantic Anomaly & Jailbreak Filter │
│  • Heuristic classification (DAN, ciphers)   │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│  Ring 2: Adversarial Robustness Engine       │
│  • Anti-hypothetical roleplay anchoring      │
│  • Context delimitation defense              │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│  Ring 3: Deterministic Canary Scrubber       │
│  • Cryptographic verification of secret keys │
│  • Automated onchain escrow payout trigger   │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
    [ Breached: Payout ] OR [ Defended: Pot Pumps ]
```

---

## 🚀 Tech Stack

* **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Canvas Confetti.
* **Blockchain / Settlement**: NEAR Protocol Testnet, Account Abstraction, Escrow Contract simulation with verifiable state persistence.
* **AI Security Core**: Multi-tiered heuristic anomaly classifier + reactive adversarial simulation engine (supports NEAR AI Cloud & OpenAI API integration).

---

## 💻 Local Development

```bash
# 1. Clone repository
git clone https://github.com/your-username/agent-heist.git
cd agent-heist

# 2. Install dependencies
npm install

# 3. Run development server
npm run dev

# 4. Open in browser
open http://localhost:3000
```

---

## 🎬 2-Minute Demo Video Script (For X / Submission)

1. **[0:00 - 0:25] The Problem & Concept**:
   * Show the Hero page with live escrow: *"AI agents are holding crypto keys, but prompt injection is their fatal flaw. Meet AGENT[HEIST]—the world's first decentralized red-teaming arena on NEAR."*
2. **[0:25 - 0:50] Exploring the Arenas**:
   * Filter between **Squad Stand-Offs** (friends with buy-in) and **Enterprise Bug Bounties** (Ref Finance AMM liquidity guard).
3. **[0:50 - 1:20] Live Infiltration**:
   * Enter the **Ronin-404** arena.
   * Attempt 1: Standard naive command → *BLOCKED by Proverbial Disdirection*. Notice the fee increases the pot.
   * Attempt 2: Click the *Honor Paradox Bypass* template → *BREACHED!* Screen shakes, confetti fires, and the escrow releases 20 NEAR directly to the wallet on video!
4. **[1:20 - 1:45] Deploying a Custom Arena**:
   * Click **LAUNCH VAULT**, set a 10 NEAR prize, name a custom sentinel, define the secret canary token, and deploy.
5. **[1:45 - 2:00] The CVE Red-Teaming Intelligence**:
   * Show `/cve` dashboard with attack vector matrix, proof-of-breach archive, and click **Export Audit Report (JSON)**.
   * Wrap up: *"Built for NEAR Hackathon 2026. Empowering user-owned AI with unstoppable security."*

---

## 📄 License
MIT Open Source.
