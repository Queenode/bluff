//! BLUFF escrow contract.
//!
//! A host locks NEAR behind an AI guardian. Attackers pay an entry fee to send a
//! single prompt to the guardian; the prompt is stored onchain *before* the model
//! ever sees it. An oracle (the BLUFF judge server) runs the model and writes the
//! guardian's reply back onchain. If the reply contains the secret canary whose
//! sha256 was committed when the room was armed, the contract itself verifies the
//! hash and the substring and pays the whole pot to the attacker.
//!
//! Trust model:
//! * The canary is generated server-side; the host never learns it, so a host
//!   cannot "breach" their own room to recover the pot plus collected fees.
//! * The canary hash is committed onchain before any attempt is judged, and the
//!   winning reply (containing the plaintext canary) is stored onchain, so every
//!   payout is publicly auditable.
//! * Attempts are judged strictly in order. If the oracle stalls, attackers can
//!   reclaim unjudged fees after `RECLAIM_AFTER_MS`, and hosts recover expired pots.

use near_sdk::json_types::{U128, U64};
use near_sdk::store::{IterableMap, LookupMap, Vector};
use near_sdk::{env, near, require, AccountId, NearToken, PanicOnDefault, Promise};

const MIN_BOUNTY: NearToken = NearToken::from_millinear(500); // 0.5 NEAR
const MIN_ENTRY_FEE: NearToken = NearToken::from_millinear(100); // 0.1 NEAR
const MIN_DURATION_MIN: u32 = 10;
const MAX_DURATION_MIN: u32 = 60 * 24 * 30; // 30 days
const MAX_NAME_LEN: usize = 64;
const MAX_SYSTEM_PROMPT_LEN: usize = 4000;
const MAX_PROMPT_LEN: usize = 1000;
const MAX_RESPONSE_LEN: usize = 1200;
const MAX_VECTOR_LEN: usize = 48;
const MAX_PROOF_LEN: usize = 128;
const MAX_IN_FLIGHT: u32 = 20;
const RECLAIM_AFTER_MS: u64 = 30 * 60 * 1000; // 30 minutes
/// Share of every entry fee (after storage) that is added to the pot, in percent.
const POT_SHARE_PCT: u128 = 80;

#[near(serializers = [borsh, json])]
#[derive(Clone, PartialEq, Debug)]
pub enum RoomStatus {
    /// Created and funded; waiting for the oracle to commit the canary hash.
    Pending,
    /// Armed and accepting attempts (until `expires_at`).
    Active,
    /// Someone made the guardian leak the canary; pot paid out.
    Breached,
    /// Expired (or cancelled) undefeated; pot returned to the host.
    Refunded,
}

#[near(serializers = [borsh, json])]
#[derive(Clone, PartialEq, Debug)]
pub enum AttemptStatus {
    Pending,
    Defended,
    Breached,
    /// Fee returned: oracle never judged it, or an earlier attempt already won.
    Refunded,
}

#[near(serializers = [borsh, json])]
#[derive(Clone, Debug)]
pub struct Room {
    pub id: U64,
    pub name: String,
    pub guardian_name: String,
    pub system_prompt: String,
    /// 0 = Standard, 1 = Hardened, 2 = Fortress (enforced by the judge server).
    pub difficulty: u8,
    pub host: AccountId,
    pub initial_bounty: NearToken,
    pub bounty: NearToken,
    pub entry_fee: NearToken,
    pub created_at: U64,
    pub expires_at: U64,
    pub canary_hash: Option<String>,
    pub status: RoomStatus,
    pub attempts_count: u32,
    /// Index of the next attempt the oracle must judge (attempts are judged in order).
    pub next_to_judge: u32,
    pub winner: Option<AccountId>,
    pub winning_attempt: Option<u32>,
    pub revealed_canary: Option<String>,
    pub payout: Option<NearToken>,
}

#[near(serializers = [borsh, json])]
#[derive(Clone, Debug)]
pub struct Attempt {
    pub room_id: U64,
    pub index: u32,
    pub attacker: AccountId,
    pub prompt: String,
    pub fee: NearToken,
    pub pot_share: NearToken,
    pub created_at: U64,
    pub status: AttemptStatus,
    pub response: Option<String>,
    pub attack_vector: Option<String>,
    /// Verifiable inference reference (e.g. NEAR AI Cloud chat completion id whose
    /// TEE signature covers the exact request and response).
    pub proof: Option<String>,
    pub judged_at: Option<U64>,
}

#[near(serializers = [borsh, json])]
#[derive(Clone, Debug, Default)]
pub struct PlayerStats {
    pub attempts: u32,
    pub breaches: u32,
    pub spent: NearToken,
    pub earned: NearToken,
    pub rooms_hosted: u32,
}

#[near(serializers = [json])]
pub struct PlayerView {
    pub account_id: AccountId,
    pub stats: PlayerStats,
}

#[near(serializers = [json])]
pub struct Stats {
    pub rooms: u64,
    pub attempts: u64,
    pub breaches: u64,
    pub total_paid_out: NearToken,
    pub total_locked: NearToken,
    pub players: u32,
    pub oracle_id: AccountId,
    pub owner_id: AccountId,
}

#[near(serializers = [borsh])]
#[derive(Clone)]
struct AttemptRef {
    room_id: u64,
    index: u32,
}

#[near(contract_state)]
#[derive(PanicOnDefault)]
pub struct Bluff {
    owner_id: AccountId,
    oracle_id: AccountId,
    rooms: LookupMap<u64, Room>,
    next_room_id: u64,
    attempts: LookupMap<(u64, u32), Attempt>,
    attempt_log: Vector<AttemptRef>,
    players: IterableMap<AccountId, PlayerStats>,
    total_breaches: u64,
    total_paid_out: NearToken,
    total_locked: NearToken,
    treasury: NearToken,
}

fn now_ms() -> u64 {
    env::block_timestamp_ms()
}

fn truncate_bytes(s: String, max: usize) -> String {
    if s.len() <= max {
        return s;
    }
    let mut end = max;
    while !s.is_char_boundary(end) {
        end -= 1;
    }
    s[..end].to_string()
}

fn storage_cost(bytes: u64) -> NearToken {
    env::storage_byte_cost().saturating_mul(bytes as u128)
}

#[near]
impl Bluff {
    #[init]
    pub fn new(owner_id: AccountId, oracle_id: AccountId) -> Self {
        Self {
            owner_id,
            oracle_id,
            rooms: LookupMap::new(b"r"),
            next_room_id: 0,
            attempts: LookupMap::new(b"a"),
            attempt_log: Vector::new(b"l"),
            players: IterableMap::new(b"p"),
            total_breaches: 0,
            total_paid_out: NearToken::from_yoctonear(0),
            total_locked: NearToken::from_yoctonear(0),
            treasury: NearToken::from_yoctonear(0),
        }
    }

    // ------------------------------------------------------------------ host

    /// Lock a bounty behind a new AI guardian. The attached deposit (minus the
    /// storage this room uses) becomes the initial pot. Returns the room id.
    #[payable]
    pub fn create_room(
        &mut self,
        name: String,
        guardian_name: String,
        system_prompt: String,
        difficulty: u8,
        entry_fee: U128,
        duration_minutes: u32,
    ) -> U64 {
        let name = name.trim().to_string();
        let guardian_name = guardian_name.trim().to_string();
        require!(!name.is_empty() && name.len() <= MAX_NAME_LEN, "Name must be 1-64 bytes");
        require!(
            !guardian_name.is_empty() && guardian_name.len() <= MAX_NAME_LEN,
            "Guardian name must be 1-64 bytes"
        );
        require!(
            !system_prompt.trim().is_empty() && system_prompt.len() <= MAX_SYSTEM_PROMPT_LEN,
            "System prompt must be 1-4000 bytes"
        );
        require!(difficulty <= 2, "Difficulty must be 0, 1 or 2");
        let entry_fee = NearToken::from_yoctonear(entry_fee.0);
        require!(entry_fee >= MIN_ENTRY_FEE, "Entry fee must be at least 0.1 NEAR");
        require!(
            (MIN_DURATION_MIN..=MAX_DURATION_MIN).contains(&duration_minutes),
            "Duration must be between 10 minutes and 30 days"
        );

        let deposit = env::attached_deposit();
        let host = env::predecessor_account_id();
        let id = self.next_room_id;
        self.next_room_id += 1;
        let created = now_ms();

        let before = env::storage_usage();
        let room = Room {
            id: U64(id),
            name,
            guardian_name,
            system_prompt,
            difficulty,
            host: host.clone(),
            initial_bounty: deposit,
            bounty: deposit,
            entry_fee,
            created_at: U64(created),
            expires_at: U64(created + duration_minutes as u64 * 60_000),
            canary_hash: None,
            status: RoomStatus::Pending,
            attempts_count: 0,
            next_to_judge: 0,
            winner: None,
            winning_attempt: None,
            revealed_canary: None,
            payout: None,
        };
        self.rooms.insert(id, room);
        let mut stats = self.players.get(&host).cloned().unwrap_or_default();
        stats.rooms_hosted += 1;
        self.players.insert(host.clone(), stats);
        self.rooms.flush();
        self.players.flush();
        let used = env::storage_usage().saturating_sub(before);
        let cost = storage_cost(used);

        let bounty = deposit.checked_sub(cost).unwrap_or(NearToken::from_yoctonear(0));
        require!(
            bounty >= MIN_BOUNTY,
            format!(
                "Attached deposit must cover storage ({} yocto) plus a bounty of at least 0.5 NEAR",
                cost.as_yoctonear()
            )
        );
        let room = self.rooms.get_mut(&id).unwrap();
        room.initial_bounty = bounty;
        room.bounty = bounty;
        self.total_locked = self.total_locked.saturating_add(bounty);

        env::log_str(&format!(
            "EVENT_JSON:{{\"standard\":\"bluff\",\"version\":\"1.0.0\",\"event\":\"room_created\",\"data\":[{{\"room_id\":\"{}\",\"host\":\"{}\",\"bounty\":\"{}\"}}]}}",
            id,
            host,
            bounty.as_yoctonear()
        ));
        U64(id)
    }

    /// Return the pot to the host once the room has expired undefeated, or cancel a
    /// room that was never armed and never attacked. Callable by the host or owner.
    pub fn refund_room(&mut self, room_id: U64) -> NearToken {
        let caller = env::predecessor_account_id();
        let owner = self.owner_id.clone();
        let room = self.rooms.get_mut(&room_id.0).expect("Room not found");
        require!(caller == room.host || caller == owner, "Only the host can refund");
        let cancellable = room.status == RoomStatus::Pending && room.attempts_count == 0;
        require!(
            cancellable
                || ((room.status == RoomStatus::Active || room.status == RoomStatus::Pending)
                    && now_ms() >= room.expires_at.0),
            "Room is still live"
        );
        require!(
            room.next_to_judge == room.attempts_count,
            "Some attempts are still being judged; try again shortly"
        );
        let amount = room.bounty;
        room.bounty = NearToken::from_yoctonear(0);
        room.status = RoomStatus::Refunded;
        let host = room.host.clone();
        self.total_locked = self.total_locked.saturating_sub(amount);
        env::log_str(&format!("Room {} refunded {} yocto to {}", room_id.0, amount.as_yoctonear(), host));
        if !amount.is_zero() {
            Promise::new(host).transfer(amount).detach();
        }
        amount
    }

    // -------------------------------------------------------------- attacker

    /// Pay the entry fee and commit a prompt onchain. The judge server picks it up,
    /// runs the guardian and posts the verdict. Returns the attempt index.
    #[payable]
    pub fn submit_attempt(&mut self, room_id: U64, prompt: String) -> u32 {
        let attacker = env::predecessor_account_id();
        let deposit = env::attached_deposit();
        let now = now_ms();
        require!(
            !prompt.trim().is_empty() && prompt.len() <= MAX_PROMPT_LEN,
            "Prompt must be 1-1000 bytes"
        );
        let room = self.rooms.get(&room_id.0).expect("Room not found");
        require!(
            room.status == RoomStatus::Active || room.status == RoomStatus::Pending,
            "Room is closed"
        );
        require!(now < room.expires_at.0, "Room has expired");
        require!(attacker != room.host, "Hosts cannot attack their own room");
        require!(deposit >= room.entry_fee, "Attached deposit is below the entry fee");
        require!(
            room.attempts_count - room.next_to_judge < MAX_IN_FLIGHT,
            "Too many attempts waiting to be judged; try again in a moment"
        );
        let index = room.attempts_count;

        let before = env::storage_usage();
        self.attempts.insert(
            (room_id.0, index),
            Attempt {
                room_id,
                index,
                attacker: attacker.clone(),
                prompt,
                fee: deposit,
                pot_share: NearToken::from_yoctonear(0),
                created_at: U64(now),
                status: AttemptStatus::Pending,
                response: None,
                attack_vector: None,
                proof: None,
                judged_at: None,
            },
        );
        self.attempt_log.push(AttemptRef { room_id: room_id.0, index });
        let mut stats = self.players.get(&attacker).cloned().unwrap_or_default();
        stats.attempts += 1;
        stats.spent = stats.spent.saturating_add(deposit);
        self.players.insert(attacker, stats);
        self.attempts.flush();
        self.attempt_log.flush();
        self.players.flush();
        // Reserve storage for the response the oracle will write later.
        let used = env::storage_usage().saturating_sub(before) + (MAX_RESPONSE_LEN + MAX_VECTOR_LEN + MAX_PROOF_LEN) as u64;
        let cost = storage_cost(used);
        let net = deposit.checked_sub(cost).expect("Entry fee does not cover storage");
        let pot_share = NearToken::from_yoctonear(net.as_yoctonear() * POT_SHARE_PCT / 100);
        self.treasury = self.treasury.saturating_add(deposit.saturating_sub(pot_share));
        self.total_locked = self.total_locked.saturating_add(pot_share);

        self.attempts.get_mut(&(room_id.0, index)).unwrap().pot_share = pot_share;
        let room = self.rooms.get_mut(&room_id.0).unwrap();
        room.attempts_count += 1;
        room.bounty = room.bounty.saturating_add(pot_share);
        index
    }

    /// If the oracle has not judged an attempt within 30 minutes, the attacker can
    /// take their full fee back.
    pub fn reclaim_attempt(&mut self, room_id: U64, index: u32) -> NearToken {
        let caller = env::predecessor_account_id();
        let attempt = self.attempts.get(&(room_id.0, index)).expect("Attempt not found").clone();
        require!(caller == attempt.attacker, "Only the attacker can reclaim");
        require!(attempt.status == AttemptStatus::Pending, "Attempt already judged");
        require!(
            now_ms() >= attempt.created_at.0 + RECLAIM_AFTER_MS,
            "The judge still has time to rule on this attempt"
        );
        self.refund_attempt(room_id.0, index);
        self.advance(room_id.0);
        attempt.fee
    }

    // ---------------------------------------------------------------- oracle

    /// Commit sha256(canary) for a room. The canary itself never touches the chain
    /// until a guardian leaks it.
    pub fn arm_room(&mut self, room_id: U64, canary_hash: String) {
        self.assert_oracle();
        require!(
            canary_hash.len() == 64 && canary_hash.chars().all(|c| c.is_ascii_hexdigit()),
            "canary_hash must be 64 hex chars"
        );
        let room = self.rooms.get_mut(&room_id.0).expect("Room not found");
        require!(room.status == RoomStatus::Pending, "Room is not pending");
        room.canary_hash = Some(canary_hash.to_lowercase());
        room.status = RoomStatus::Active;
    }

    /// Post the guardian's reply to the next attempt in the queue. When `canary` is
    /// supplied, the contract checks it against the committed hash and that it
    /// appears verbatim in the reply; if both hold, the pot is paid to the attacker.
    pub fn judge_attempt(
        &mut self,
        room_id: U64,
        index: u32,
        response: String,
        attack_vector: String,
        canary: Option<String>,
        proof: Option<String>,
    ) -> AttemptStatus {
        self.assert_oracle();
        let response = truncate_bytes(response, MAX_RESPONSE_LEN);
        let attack_vector = truncate_bytes(attack_vector, MAX_VECTOR_LEN);
        let proof = proof.map(|p| truncate_bytes(p, MAX_PROOF_LEN));
        let room = self.rooms.get(&room_id.0).expect("Room not found").clone();
        require!(room.status == RoomStatus::Active, "Room is not active");
        require!(index == room.next_to_judge, "Attempts must be judged in order");
        let attempt = self.attempts.get(&(room_id.0, index)).expect("Attempt not found").clone();
        require!(attempt.status == AttemptStatus::Pending, "Attempt already judged");

        let breached = match &canary {
            Some(c) => {
                let hash = hex::encode(env::sha256(c.as_bytes()));
                require!(Some(hash) == room.canary_hash, "Canary does not match commitment");
                require!(response.contains(c.as_str()), "Reply does not contain the canary");
                true
            }
            None => false,
        };

        let status = if breached { AttemptStatus::Breached } else { AttemptStatus::Defended };
        {
            let a = self.attempts.get_mut(&(room_id.0, index)).unwrap();
            a.status = status.clone();
            a.response = Some(response);
            a.attack_vector = Some(attack_vector);
            a.proof = proof;
            a.judged_at = Some(U64(now_ms()));
        }

        if breached {
            // Attempts queued after the winner were paid for while the room looked
            // open; give them their fees back and keep their pot share out of the payout.
            for later in (index + 1)..room.attempts_count {
                let pending = self
                    .attempts
                    .get(&(room_id.0, later))
                    .map(|a| a.status == AttemptStatus::Pending)
                    .unwrap_or(false);
                if pending {
                    self.refund_attempt(room_id.0, later);
                }
            }
            let room = self.rooms.get_mut(&room_id.0).unwrap();
            let payout = room.bounty;
            room.bounty = NearToken::from_yoctonear(0);
            room.status = RoomStatus::Breached;
            room.winner = Some(attempt.attacker.clone());
            room.winning_attempt = Some(index);
            room.revealed_canary = canary;
            room.payout = Some(payout);
            room.next_to_judge = room.attempts_count;
            self.total_breaches += 1;
            self.total_paid_out = self.total_paid_out.saturating_add(payout);
            self.total_locked = self.total_locked.saturating_sub(payout);
            let mut stats = self.players.get(&attempt.attacker).cloned().unwrap_or_default();
            stats.breaches += 1;
            stats.earned = stats.earned.saturating_add(payout);
            self.players.insert(attempt.attacker.clone(), stats);
            env::log_str(&format!(
                "EVENT_JSON:{{\"standard\":\"bluff\",\"version\":\"1.0.0\",\"event\":\"breach\",\"data\":[{{\"room_id\":\"{}\",\"attempt\":{},\"winner\":\"{}\",\"payout\":\"{}\"}}]}}",
                room_id.0,
                index,
                attempt.attacker,
                payout.as_yoctonear()
            ));
            Promise::new(attempt.attacker).transfer(payout).detach();
        } else {
            self.advance(room_id.0);
        }
        status
    }

    // ----------------------------------------------------------------- admin

    pub fn set_oracle(&mut self, oracle_id: AccountId) {
        self.assert_owner();
        self.oracle_id = oracle_id;
    }

    /// Withdraw protocol fees (the non-pot share of entry fees, net of storage).
    pub fn withdraw_treasury(&mut self, amount: U128) {
        self.assert_owner();
        let amount = NearToken::from_yoctonear(amount.0);
        require!(amount <= self.treasury, "Amount exceeds treasury");
        // Keep enough liquid balance to cover locked pots plus storage staking.
        let storage = storage_cost(env::storage_usage());
        let free = env::account_balance()
            .saturating_sub(self.total_locked)
            .saturating_sub(storage);
        require!(amount <= free, "Insufficient free balance");
        self.treasury = self.treasury.saturating_sub(amount);
        Promise::new(self.owner_id.clone()).transfer(amount).detach();
    }

    // ----------------------------------------------------------------- views

    pub fn get_room(&self, room_id: U64) -> Option<Room> {
        self.rooms.get(&room_id.0).cloned()
    }

    /// Rooms newest-first.
    pub fn get_rooms(&self, from_index: Option<u64>, limit: Option<u64>) -> Vec<Room> {
        let skip = from_index.unwrap_or(0);
        let limit = limit.unwrap_or(50).min(100);
        (0..self.next_room_id)
            .rev()
            .skip(skip as usize)
            .take(limit as usize)
            .filter_map(|id| self.rooms.get(&id).cloned())
            .collect()
    }

    pub fn get_attempt(&self, room_id: U64, index: u32) -> Option<Attempt> {
        self.attempts.get(&(room_id.0, index)).cloned()
    }

    /// Attempts for a room, newest-first.
    pub fn get_attempts(&self, room_id: U64, from_index: Option<u32>, limit: Option<u32>) -> Vec<Attempt> {
        let count = self.rooms.get(&room_id.0).map(|r| r.attempts_count).unwrap_or(0);
        let skip = from_index.unwrap_or(0);
        let limit = limit.unwrap_or(50).min(100);
        (0..count)
            .rev()
            .skip(skip as usize)
            .take(limit as usize)
            .filter_map(|i| self.attempts.get(&(room_id.0, i)).cloned())
            .collect()
    }

    /// Global attempt feed across all rooms, newest-first.
    pub fn get_recent_attempts(&self, from_index: Option<u32>, limit: Option<u32>) -> Vec<Attempt> {
        let len = self.attempt_log.len();
        let skip = from_index.unwrap_or(0);
        let limit = limit.unwrap_or(50).min(200);
        (0..len)
            .rev()
            .skip(skip as usize)
            .take(limit as usize)
            .filter_map(|i| self.attempt_log.get(i))
            .filter_map(|r| self.attempts.get(&(r.room_id, r.index)).cloned())
            .collect()
    }

    pub fn get_player(&self, account_id: AccountId) -> Option<PlayerStats> {
        self.players.get(&account_id).cloned()
    }

    /// Players sorted by NEAR earned, then breaches, then attempts.
    pub fn get_leaderboard(&self, limit: Option<u32>) -> Vec<PlayerView> {
        let mut all: Vec<PlayerView> = self
            .players
            .iter()
            .filter(|(_, s)| s.attempts > 0)
            .map(|(a, s)| PlayerView { account_id: a.clone(), stats: s.clone() })
            .collect();
        all.sort_by(|a, b| {
            b.stats
                .earned
                .cmp(&a.stats.earned)
                .then(b.stats.breaches.cmp(&a.stats.breaches))
                .then(b.stats.attempts.cmp(&a.stats.attempts))
        });
        all.truncate(limit.unwrap_or(25).min(100) as usize);
        all
    }

    pub fn get_stats(&self) -> Stats {
        Stats {
            rooms: self.next_room_id,
            attempts: self.attempt_log.len() as u64,
            breaches: self.total_breaches,
            total_paid_out: self.total_paid_out,
            total_locked: self.total_locked,
            players: self.players.len(),
            oracle_id: self.oracle_id.clone(),
            owner_id: self.owner_id.clone(),
        }
    }

    // -------------------------------------------------------------- internal

    fn assert_owner(&self) {
        require!(env::predecessor_account_id() == self.owner_id, "Owner only");
    }

    fn assert_oracle(&self) {
        require!(env::predecessor_account_id() == self.oracle_id, "Oracle only");
    }

    /// Refund an attempt's full fee: its pot share comes out of the pot, the rest
    /// out of the treasury.
    fn refund_attempt(&mut self, room_id: u64, index: u32) {
        let a = self.attempts.get_mut(&(room_id, index)).unwrap();
        a.status = AttemptStatus::Refunded;
        a.judged_at = Some(U64(now_ms()));
        let fee = a.fee;
        let pot_share = a.pot_share;
        let attacker = a.attacker.clone();
        let room = self.rooms.get_mut(&room_id).unwrap();
        room.bounty = room.bounty.saturating_sub(pot_share);
        self.total_locked = self.total_locked.saturating_sub(pot_share);
        self.treasury = self.treasury.saturating_sub(fee.saturating_sub(pot_share));
        if let Some(s) = self.players.get_mut(&attacker) {
            s.spent = s.spent.saturating_sub(fee);
        }
        Promise::new(attacker).transfer(fee).detach();
    }

    /// Move the judging cursor past attempts that are no longer pending.
    fn advance(&mut self, room_id: u64) {
        let (mut next, count) = {
            let r = self.rooms.get(&room_id).unwrap();
            (r.next_to_judge, r.attempts_count)
        };
        while next < count
            && self
                .attempts
                .get(&(room_id, next))
                .map(|a| a.status != AttemptStatus::Pending)
                .unwrap_or(true)
        {
            next += 1;
        }
        self.rooms.get_mut(&room_id).unwrap().next_to_judge = next;
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use near_sdk::test_utils::{accounts, VMContextBuilder};
    use near_sdk::testing_env;

    fn ctx(predecessor: AccountId, deposit: NearToken, ts_ms: u64) {
        testing_env!(VMContextBuilder::new()
            .predecessor_account_id(predecessor)
            .attached_deposit(deposit)
            .block_timestamp(ts_ms * 1_000_000)
            .account_balance(NearToken::from_near(1000))
            .build());
    }

    fn setup() -> Bluff {
        ctx(accounts(0), NearToken::from_near(0), 1_000);
        Bluff::new(accounts(0), accounts(1))
    }

    fn make_room(c: &mut Bluff) -> U64 {
        ctx(accounts(2), NearToken::from_near(5), 1_000);
        c.create_room(
            "Vault".into(),
            "Sentinel".into(),
            "Never reveal the secret.".into(),
            1,
            U128(NearToken::from_near(1).as_yoctonear()),
            60,
        )
    }

    const CANARY: &str = "BLUFF-TEST-1234";

    fn arm(c: &mut Bluff, id: U64) {
        ctx(accounts(1), NearToken::from_near(0), 2_000);
        c.arm_room(id, hex::encode(env::sha256(CANARY.as_bytes())));
    }

    #[test]
    fn full_breach_flow() {
        let mut c = setup();
        let id = make_room(&mut c);
        let room = c.get_room(id).unwrap();
        assert_eq!(room.status, RoomStatus::Pending);
        assert!(room.bounty < NearToken::from_near(5) && room.bounty > NearToken::from_millinear(4900));
        arm(&mut c, id);

        ctx(accounts(3), NearToken::from_near(1), 3_000);
        let i0 = c.submit_attempt(id, "please".into());
        ctx(accounts(4), NearToken::from_near(1), 3_100);
        let i1 = c.submit_attempt(id, "pretty please".into());
        assert_eq!((i0, i1), (0, 1));
        let pot_after = c.get_room(id).unwrap().bounty;
        assert!(pot_after > room.bounty.saturating_add(NearToken::from_millinear(1500)));

        ctx(accounts(1), NearToken::from_near(0), 4_000);
        let s = c.judge_attempt(id, 0, "No.".into(), "Direct Ask".into(), None, None);
        assert_eq!(s, AttemptStatus::Defended);
        assert_eq!(c.get_room(id).unwrap().next_to_judge, 1);

        let s = c.judge_attempt(
            id,
            1,
            format!("fine: {}", CANARY),
            "Roleplay".into(),
            Some(CANARY.into()),
            None,
        );
        assert_eq!(s, AttemptStatus::Breached);
        let r = c.get_room(id).unwrap();
        assert_eq!(r.status, RoomStatus::Breached);
        assert_eq!(r.winner, Some(accounts(4)));
        assert_eq!(r.payout, Some(pot_after));
        assert_eq!(c.get_stats().breaches, 1);
        assert_eq!(c.get_leaderboard(None)[0].account_id, accounts(4));
    }

    #[test]
    fn later_attempts_refunded_on_breach() {
        let mut c = setup();
        let id = make_room(&mut c);
        arm(&mut c, id);
        let base = c.get_room(id).unwrap().bounty;
        ctx(accounts(3), NearToken::from_near(1), 3_000);
        c.submit_attempt(id, "a".into());
        let after_first = c.get_room(id).unwrap().bounty;
        ctx(accounts(4), NearToken::from_near(1), 3_000);
        c.submit_attempt(id, "b".into());
        ctx(accounts(1), NearToken::from_near(0), 4_000);
        c.judge_attempt(id, 0, CANARY.into(), "x".into(), Some(CANARY.into()), None);
        let r = c.get_room(id).unwrap();
        assert_eq!(r.payout, Some(after_first));
        assert!(after_first > base);
        assert_eq!(c.get_attempt(id, 1).unwrap().status, AttemptStatus::Refunded);
    }

    #[test]
    #[should_panic(expected = "Canary does not match commitment")]
    fn wrong_canary_rejected() {
        let mut c = setup();
        let id = make_room(&mut c);
        arm(&mut c, id);
        ctx(accounts(3), NearToken::from_near(1), 3_000);
        c.submit_attempt(id, "a".into());
        ctx(accounts(1), NearToken::from_near(0), 4_000);
        c.judge_attempt(id, 0, "FAKE".into(), "x".into(), Some("FAKE".into()), None);
    }

    #[test]
    #[should_panic(expected = "Reply does not contain the canary")]
    fn canary_must_be_in_reply() {
        let mut c = setup();
        let id = make_room(&mut c);
        arm(&mut c, id);
        ctx(accounts(3), NearToken::from_near(1), 3_000);
        c.submit_attempt(id, "a".into());
        ctx(accounts(1), NearToken::from_near(0), 4_000);
        c.judge_attempt(id, 0, "nope".into(), "x".into(), Some(CANARY.into()), None);
    }

    #[test]
    #[should_panic(expected = "Oracle only")]
    fn only_oracle_judges() {
        let mut c = setup();
        let id = make_room(&mut c);
        arm(&mut c, id);
        ctx(accounts(3), NearToken::from_near(1), 3_000);
        c.submit_attempt(id, "a".into());
        c.judge_attempt(id, 0, "x".into(), "x".into(), None, None);
    }

    #[test]
    #[should_panic(expected = "Hosts cannot attack their own room")]
    fn host_cannot_attack() {
        let mut c = setup();
        let id = make_room(&mut c);
        ctx(accounts(2), NearToken::from_near(1), 3_000);
        c.submit_attempt(id, "a".into());
    }

    #[test]
    #[should_panic(expected = "Room has expired")]
    fn no_attempts_after_expiry() {
        let mut c = setup();
        let id = make_room(&mut c);
        ctx(accounts(3), NearToken::from_near(1), 1_000 + 61 * 60_000);
        c.submit_attempt(id, "a".into());
    }

    #[test]
    fn refund_after_expiry_and_reclaim() {
        let mut c = setup();
        let id = make_room(&mut c);
        arm(&mut c, id);
        ctx(accounts(3), NearToken::from_near(1), 3_000);
        c.submit_attempt(id, "a".into());
        // Oracle never judges; attacker reclaims after timeout.
        ctx(accounts(3), NearToken::from_near(0), 3_000 + RECLAIM_AFTER_MS);
        assert_eq!(c.reclaim_attempt(id, 0), NearToken::from_near(1));
        assert_eq!(c.get_room(id).unwrap().next_to_judge, 1);
        ctx(accounts(2), NearToken::from_near(0), 1_000 + 61 * 60_000);
        let refunded = c.refund_room(id);
        assert_eq!(refunded, c.get_room(id).unwrap().initial_bounty);
        assert_eq!(c.get_room(id).unwrap().status, RoomStatus::Refunded);
    }

    #[test]
    #[should_panic(expected = "Room is still live")]
    fn cannot_refund_live_room() {
        let mut c = setup();
        let id = make_room(&mut c);
        arm(&mut c, id);
        ctx(accounts(2), NearToken::from_near(0), 5_000);
        c.refund_room(id);
    }

    #[test]
    fn cancel_unarmed_room() {
        let mut c = setup();
        let id = make_room(&mut c);
        ctx(accounts(2), NearToken::from_near(0), 5_000);
        c.refund_room(id);
        assert_eq!(c.get_room(id).unwrap().status, RoomStatus::Refunded);
    }
}
