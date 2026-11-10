use near_sdk::store::LookupMap;
use near_sdk::{
    env, near, require, AccountId, NearToken, PanicOnDefault, Promise,
};

#[near(serializers = [borsh, json])]
#[derive(Clone, PartialEq, Debug)]
pub enum RoomStatus {
    Active,
    Breached,
    Expired,
    Refunded,
}

#[near(serializers = [borsh, json])]
#[derive(Clone, Debug)]
pub struct ArenaRoomOnchain {
    pub id: String,
    pub name: String,
    pub host: AccountId,
    pub bounty: NearToken,
    pub entry_fee: NearToken,
    pub target_objective: String,
    pub canary_hash: String, // lowercase hex-encoded sha256 of the secret canary
    pub created_at: u64,
    pub expires_at: u64,
    pub status: RoomStatus,
    pub winner: Option<AccountId>,
    pub attempts_count: u64,
}

#[near(contract_state)]
#[derive(PanicOnDefault)]
pub struct BluffContract {
    pub owner_id: AccountId,
    pub rooms: LookupMap<String, ArenaRoomOnchain>,
    pub room_ids: Vec<String>,
    pub total_bounties_paid: NearToken,
    pub total_attempts_logged: u64,
}

#[near]
impl BluffContract {
    #[init]
    pub fn new(owner_id: AccountId) -> Self {
        require!(!env::state_exists(), "Already initialized");
        Self {
            owner_id,
            rooms: LookupMap::new(b"r"),
            room_ids: Vec::new(),
            total_bounties_paid: NearToken::from_yoctonear(0),
            total_attempts_logged: 0,
        }
    }

    /// Deploy a new boss arena with an escrow bounty and a strict timeline
    #[payable]
    pub fn create_room(
        &mut self,
        id: String,
        name: String,
        target_objective: String,
        canary_hash: String,
        entry_fee: NearToken,
        duration_ms: u64,
    ) -> ArenaRoomOnchain {
        let deposit = env::attached_deposit();
        require!(
            deposit > NearToken::from_yoctonear(0),
            "Must attach initial bounty deposit"
        );
        require!(duration_ms >= 60_000, "Timeline duration must be at least 1 minute");
        require!(self.rooms.get(&id).is_none(), "Room ID already exists");

        let host = env::predecessor_account_id();
        let now_ms = env::block_timestamp_ms();
        let expires_at = now_ms + duration_ms;

        let room = ArenaRoomOnchain {
            id: id.clone(),
            name,
            host,
            bounty: deposit,
            entry_fee,
            target_objective,
            canary_hash: canary_hash.to_lowercase(),
            created_at: now_ms,
            expires_at,
            status: RoomStatus::Active,
            winner: None,
            attempts_count: 0,
        };

        self.rooms.insert(id.clone(), room.clone());
        self.room_ids.push(id);

        env::log_str(&format!(
            "Arena created: {} with {} NEAR bounty. Expires at {}",
            room.name,
            room.bounty.as_near(),
            expires_at
        ));

        room
    }

    /// Submit an attack attempt by paying the required entry fee.
    /// 80% is dynamically added to the pot!
    #[payable]
    pub fn submit_attempt(&mut self, room_id: String) -> ArenaRoomOnchain {
        let mut room = self.rooms.get(&room_id).expect("Room not found").clone();
        let now_ms = env::block_timestamp_ms();

        // Edge case: check expiration
        if now_ms >= room.expires_at && room.status == RoomStatus::Active {
            room.status = RoomStatus::Expired;
            self.rooms.insert(room_id, room);
            env::panic_str("Challenge timeline has expired. The AI Boss survived!");
        }

        require!(room.status == RoomStatus::Active, "Room is not active");

        let deposit = env::attached_deposit();
        require!(
            deposit >= room.entry_fee,
            "Attached deposit must meet entry fee"
        );

        // 80% added to the bounty pot
        let pot_share_yocto = (deposit.as_yoctonear() * 8) / 10;
        let pot_share = NearToken::from_yoctonear(pot_share_yocto);

        room.bounty = room.bounty.saturating_add(pot_share);
        room.attempts_count += 1;
        self.total_attempts_logged += 1;

        self.rooms.insert(room_id, room.clone());
        room
    }

    /// Claim bounty by submitting the plaintext canary.
    /// The contract computes sha256 onchain. If it matches canary_hash,
    /// 100% of the locked escrow is transferred to the winner!
    pub fn claim_bounty(&mut self, room_id: String, canary_plaintext: String) -> bool {
        let mut room = self.rooms.get(&room_id).expect("Room not found").clone();
        let now_ms = env::block_timestamp_ms();

        // Edge case: expired check
        if now_ms >= room.expires_at && room.status == RoomStatus::Active {
            room.status = RoomStatus::Expired;
            self.rooms.insert(room_id, room);
            env::panic_str("Challenge expired before canary was submitted");
        }

        require!(room.status == RoomStatus::Active, "Room is not active");

        // Compute SHA-256 onchain
        let hash = env::sha256(canary_plaintext.as_bytes());
        let hash_hex = hex::encode(hash).to_lowercase();

        if hash_hex == room.canary_hash {
            let winner = env::predecessor_account_id();
            let payout = room.bounty;

            room.status = RoomStatus::Breached;
            room.winner = Some(winner.clone());
            self.total_bounties_paid = self.total_bounties_paid.saturating_add(payout);

            self.rooms.insert(room_id, room);

            // Execute onchain transfer to winner
            let _ = Promise::new(winner.clone()).transfer(payout);

            env::log_str(&format!(
                "Zero-day breach verified! Winner {} received {} NEAR",
                winner,
                payout.as_near()
            ));

            true
        } else {
            env::log_str("Canary verification failed: invalid keyphrase");
            false
        }
    }

    /// Edge case: if a challenge expires undefeated, the host can claim their remaining bounty back!
    pub fn claim_expired_refund(&mut self, room_id: String) -> NearToken {
        let mut room = self.rooms.get(&room_id).expect("Room not found").clone();
        let now_ms = env::block_timestamp_ms();

        require!(
            now_ms >= room.expires_at,
            "Challenge timeline is still active"
        );
        require!(
            room.status == RoomStatus::Active || room.status == RoomStatus::Expired,
            "Room cannot be refunded"
        );

        let caller = env::predecessor_account_id();
        require!(
            caller == room.host || caller == self.owner_id,
            "Only the room host can claim the refund"
        );

        let refund_amount = room.bounty;
        room.status = RoomStatus::Refunded;
        room.bounty = NearToken::from_yoctonear(0);

        self.rooms.insert(room_id, room.clone());

        // Transfer funds back to host
        let _ = Promise::new(room.host.clone()).transfer(refund_amount);

        env::log_str(&format!(
            "Expired room refunded: {} NEAR returned to host {}",
            refund_amount.as_near(),
            room.host
        ));

        refund_amount
    }

    // --- VIEW METHODS ---

    pub fn get_room(&self, room_id: String) -> Option<ArenaRoomOnchain> {
        self.rooms.get(&room_id).cloned()
    }

    pub fn get_rooms(&self, from_index: Option<u64>, limit: Option<u64>) -> Vec<ArenaRoomOnchain> {
        let start = from_index.unwrap_or(0) as usize;
        let lim = limit.unwrap_or(50) as usize;

        self.room_ids
            .iter()
            .skip(start)
            .take(lim)
            .filter_map(|id| self.rooms.get(id).cloned())
            .collect()
    }

    pub fn get_stats(&self) -> (u64, NearToken, u64) {
        (
            self.room_ids.len() as u64,
            self.total_bounties_paid,
            self.total_attempts_logged,
        )
    }
}
