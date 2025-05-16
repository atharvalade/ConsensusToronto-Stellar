// Verification contract for TrueLens
// This contract manages the verification process for individual news items

#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, BytesN, Env, Map, Symbol, Vec};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DataKey {
    Admin,
    NewsItem,
    Verifications,
    StakedAmount,
    RewardPool,
    ConsensusReached,
    IsClosed,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum VerificationStatus {
    Verified,
    Flagged,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct NewsItem {
    pub id: BytesN<32>,
    pub title: Symbol,
    pub content_hash: BytesN<32>,
    pub source: Symbol,
    pub timestamp: u64,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Verification {
    pub verifier: Address,
    pub status: VerificationStatus,
    pub stake: i128,
    pub timestamp: u64,
}

#[contract]
pub struct NewsVerification;

#[contractimpl]
impl NewsVerification {
    // Initialize the verification contract for a specific news item
    pub fn initialize(
        env: Env,
        admin: Address,
        news_id: BytesN<32>,
        title: Symbol,
        content_hash: BytesN<32>,
        source: Symbol,
    ) {
        // Ensure contract hasn't been initialized yet
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("Contract already initialized");
        }
        
        // Store the admin
        env.storage().instance().set(&DataKey::Admin, &admin);
        
        // Create and store the news item
        let news_item = NewsItem {
            id: news_id,
            title: title,
            content_hash: content_hash,
            source: source,
            timestamp: env.ledger().timestamp(),
        };
        
        // Store the news item
        env.storage().instance().set(&DataKey::NewsItem, &news_item);
        
        // Initialize other state
        env.storage().instance().set(&DataKey::Verifications, &Vec::<Verification>::new(&env));
        env.storage().instance().set(&DataKey::StakedAmount, &0i128);
        env.storage().instance().set(&DataKey::RewardPool, &0i128);
        env.storage().instance().set(&DataKey::ConsensusReached, &false);
        env.storage().instance().set(&DataKey::IsClosed, &false);
    }
    
    // Submit a verification (verified or flagged) with stake
    pub fn submit_verification(
        env: Env,
        verifier: Address,
        status: VerificationStatus,
        stake_amount: i128,
    ) {
        // Require authorization from the verifier
        verifier.require_auth();
        
        // Ensure the verification process is still open
        let is_closed: bool = env.storage().instance().get(&DataKey::IsClosed).unwrap();
        if is_closed {
            panic!("Verification process is closed");
        }
        
        // Ensure stake is positive
        if stake_amount <= 0 {
            panic!("Stake amount must be positive");
        }
        
        // Create the verification record
        let verification = Verification {
            verifier: verifier.clone(),
            status,
            stake: stake_amount,
            timestamp: env.ledger().timestamp(),
        };
        
        // Add to verifications list
        let mut verifications: Vec<Verification> = env.storage().instance().get(&DataKey::Verifications).unwrap();
        
        // Check if verifier has already submitted a verification
        for i in 0..verifications.len() {
            let existing = verifications.get_unchecked(i).unwrap();
            if existing.verifier == verifier {
                panic!("Verifier has already submitted a verification");
            }
        }
        
        // Add the new verification
        verifications.push_back(verification);
        env.storage().instance().set(&DataKey::Verifications, &verifications);
        
        // Update total staked amount
        let mut staked_amount: i128 = env.storage().instance().get(&DataKey::StakedAmount).unwrap();
        staked_amount += stake_amount;
        env.storage().instance().set(&DataKey::StakedAmount, &staked_amount);
    }
    
    // Get the news item this contract is verifying
    pub fn get_news_item(env: Env) -> NewsItem {
        env.storage().instance().get(&DataKey::NewsItem).unwrap()
    }
    
    // Get all verifications
    pub fn get_verifications(env: Env) -> Vec<Verification> {
        env.storage().instance().get(&DataKey::Verifications).unwrap()
    }
    
    // Calculate the current consensus (percentage of "verified" votes)
    pub fn calculate_consensus(env: Env) -> u32 {
        let verifications: Vec<Verification> = env.storage().instance().get(&DataKey::Verifications).unwrap();
        
        if verifications.len() == 0 {
            return 0;
        }
        
        let mut verified_count = 0;
        let mut total_count = 0;
        
        for i in 0..verifications.len() {
            let v = verifications.get_unchecked(i).unwrap();
            match v.status {
                VerificationStatus::Verified => verified_count += 1,
                VerificationStatus::Flagged => {}, // Don't increment verified count
            }
            total_count += 1;
        }
        
        // Calculate percentage (0-100)
        (verified_count * 100) / total_count
    }
    
    // Calculate consensus by staked amount (weighted voting)
    pub fn calculate_weighted_consensus(env: Env) -> u32 {
        let verifications: Vec<Verification> = env.storage().instance().get(&DataKey::Verifications).unwrap();
        
        if verifications.len() == 0 {
            return 0;
        }
        
        let mut verified_stake = 0i128;
        let mut total_stake = 0i128;
        
        for i in 0..verifications.len() {
            let v = verifications.get_unchecked(i).unwrap();
            match v.status {
                VerificationStatus::Verified => verified_stake += v.stake,
                VerificationStatus::Flagged => {}, // Don't add to verified stake
            }
            total_stake += v.stake;
        }
        
        if total_stake == 0 {
            return 0;
        }
        
        // Calculate percentage (0-100)
        ((verified_stake * 100) / total_stake) as u32
    }
    
    // Close the verification process and distribute rewards
    pub fn close_verification(env: Env, admin: Address) {
        // Verify the admin is calling
        let stored_admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        if admin != stored_admin {
            panic!("Only admin can close verification");
        }
        admin.require_auth();
        
        // Check if already closed
        let is_closed: bool = env.storage().instance().get(&DataKey::IsClosed).unwrap();
        if is_closed {
            panic!("Verification already closed");
        }
        
        // Calculate final consensus
        let consensus = Self::calculate_weighted_consensus(env.clone());
        
        // Set consensus reached if more than 50%
        let consensus_reached = consensus > 50;
        env.storage().instance().set(&DataKey::ConsensusReached, &consensus_reached);
        
        // Mark as closed
        env.storage().instance().set(&DataKey::IsClosed, &true);
        
        // Here we would distribute rewards, but that would be handled by
        // a token contract in a real implementation
    }
    
    // Get verification status
    pub fn get_verification_status(env: Env) -> (bool, bool, u32) {
        let is_closed: bool = env.storage().instance().get(&DataKey::IsClosed).unwrap();
        let consensus_reached: bool = env.storage().instance().get(&DataKey::ConsensusReached).unwrap();
        let consensus = Self::calculate_weighted_consensus(env.clone());
        
        (is_closed, consensus_reached, consensus)
    }
    
    // Add to reward pool (called by admin)
    pub fn add_to_reward_pool(env: Env, admin: Address, amount: i128) {
        // Verify the admin is calling
        let stored_admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        if admin != stored_admin {
            panic!("Only admin can add to reward pool");
        }
        admin.require_auth();
        
        // Ensure amount is positive
        if amount <= 0 {
            panic!("Amount must be positive");
        }
        
        // Add to reward pool
        let mut reward_pool: i128 = env.storage().instance().get(&DataKey::RewardPool).unwrap();
        reward_pool += amount;
        env.storage().instance().set(&DataKey::RewardPool, &reward_pool);
    }
    
    // Check if a user would receive a reward if verification closed now
    pub fn would_receive_reward(env: Env, user: Address) -> bool {
        let verifications: Vec<Verification> = env.storage().instance().get(&DataKey::Verifications).unwrap();
        let weighted_consensus = Self::calculate_weighted_consensus(env.clone());
        let consensus_status = if weighted_consensus > 50 { VerificationStatus::Verified } else { VerificationStatus::Flagged };
        
        // Check if user has submitted a verification
        for i in 0..verifications.len() {
            let v = verifications.get_unchecked(i).unwrap();
            if v.verifier == user {
                // User gets reward if they voted with the majority
                return v.status == consensus_status;
            }
        }
        
        // User hasn't submitted a verification
        false
    }
} 