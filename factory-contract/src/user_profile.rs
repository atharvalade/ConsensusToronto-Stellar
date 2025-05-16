// User profile contract for TrueLens
// This contract manages user profiles, reputation, and verification history

#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, BytesN, Env, Map, Vec, Symbol};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DataKey {
    Admin,
    Profiles,             // Map of user address to profile
    VerificationHistory,  // Map of user address to verification history
    Level,                // Map of user address to level
    Reputation,           // Map of user address to reputation score
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct UserProfile {
    address: Address,
    username: Symbol,
    bio: Symbol,
    join_timestamp: u64,
    verification_count: u32,
    accuracy_percentage: u32,  // 0-100%
    rewards_earned: i128,
    level: u32,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct VerificationRecord {
    news_id: BytesN<32>,
    verdict: Symbol,        // "verify" or "flag"
    stake_amount: i128,
    timestamp: u64,
    consensus_match: bool,  // Whether the user's verdict matched consensus
    reward_amount: i128,
}

#[contract]
pub struct UserProfileContract;

#[contractimpl]
impl UserProfileContract {
    // Initialize the contract
    pub fn initialize(env: Env, admin: Address) {
        // Ensure the contract is not already initialized
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("Contract already initialized");
        }
        
        // Store the admin address
        env.storage().instance().set(&DataKey::Admin, &admin);
        
        // Initialize empty collections
        env.storage().instance().set(&DataKey::Profiles, &Map::<Address, UserProfile>::new(&env));
        env.storage().instance().set(&DataKey::VerificationHistory, &Map::<Address, Vec<VerificationRecord>>::new(&env));
        env.storage().instance().set(&DataKey::Level, &Map::<Address, u32>::new(&env));
        env.storage().instance().set(&DataKey::Reputation, &Map::<Address, u32>::new(&env));
    }
    
    // Create a new user profile
    pub fn create_profile(env: Env, user: Address, username: Symbol) {
        // Verify that the user is calling
        user.require_auth();
        
        // Get profiles map
        let mut profiles: Map<Address, UserProfile> = env.storage().instance().get(&DataKey::Profiles).unwrap();
        
        // Check if user already has a profile
        if profiles.contains_key(&user) {
            panic!("User already has a profile");
        }
        
        // Create the profile
        let profile = UserProfile {
            address: user.clone(),
            username,
            bio: Symbol::from_str(&env, ""),
            join_timestamp: env.ledger().timestamp(),
            verification_count: 0,
            accuracy_percentage: 0,
            rewards_earned: 0,
            level: 1,
        };
        
        // Store the profile
        profiles.set(user.clone(), profile);
        env.storage().instance().set(&DataKey::Profiles, &profiles);
        
        // Initialize verification history
        let mut history_map: Map<Address, Vec<VerificationRecord>> = env.storage().instance().get(&DataKey::VerificationHistory).unwrap();
        history_map.set(user.clone(), Vec::<VerificationRecord>::new(&env));
        env.storage().instance().set(&DataKey::VerificationHistory, &history_map);
        
        // Initialize level and reputation
        let mut level_map: Map<Address, u32> = env.storage().instance().get(&DataKey::Level).unwrap();
        level_map.set(user.clone(), 1);
        env.storage().instance().set(&DataKey::Level, &level_map);
        
        let mut reputation_map: Map<Address, u32> = env.storage().instance().get(&DataKey::Reputation).unwrap();
        reputation_map.set(user.clone(), 100); // Start with neutral reputation
        env.storage().instance().set(&DataKey::Reputation, &reputation_map);
    }
    
    // Update user profile
    pub fn update_profile(env: Env, user: Address, username: Option<Symbol>, bio: Option<Symbol>) {
        // Verify that the user is calling
        user.require_auth();
        
        // Get profiles map
        let mut profiles: Map<Address, UserProfile> = env.storage().instance().get(&DataKey::Profiles).unwrap();
        
        // Check if user has a profile
        if !profiles.contains_key(&user) {
            panic!("User does not have a profile");
        }
        
        // Get existing profile
        let mut profile = profiles.get(user.clone()).unwrap();
        
        // Update fields if provided
        if let Some(new_username) = username {
            profile.username = new_username;
        }
        
        if let Some(new_bio) = bio {
            profile.bio = new_bio;
        }
        
        // Store updated profile
        profiles.set(user.clone(), profile);
        env.storage().instance().set(&DataKey::Profiles, &profiles);
    }
    
    // Record a verification by a user
    pub fn record_verification(
        env: Env,
        admin: Address,
        user: Address,
        news_id: BytesN<32>,
        verdict: Symbol,
        stake_amount: i128,
        consensus_match: bool,
        reward_amount: i128,
    ) {
        // Only the admin can record verifications
        let stored_admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        if admin != stored_admin {
            panic!("Only admin can record verifications");
        }
        admin.require_auth();
        
        // Check if user has a profile
        let mut profiles: Map<Address, UserProfile> = env.storage().instance().get(&DataKey::Profiles).unwrap();
        if !profiles.contains_key(&user) {
            panic!("User does not have a profile");
        }
        
        // Create verification record
        let record = VerificationRecord {
            news_id,
            verdict,
            stake_amount,
            timestamp: env.ledger().timestamp(),
            consensus_match,
            reward_amount,
        };
        
        // Add to user's verification history
        let mut history_map: Map<Address, Vec<VerificationRecord>> = env.storage().instance().get(&DataKey::VerificationHistory).unwrap();
        let mut user_history = history_map.get(user.clone()).unwrap_or_else(|| Vec::new(&env));
        user_history.push_back(record);
        history_map.set(user.clone(), user_history.clone());
        env.storage().instance().set(&DataKey::VerificationHistory, &history_map);
        
        // Update user profile stats
        let mut user_profile = profiles.get(user.clone()).unwrap();
        
        // Update verification count
        user_profile.verification_count += 1;
        
        // Update rewards earned
        user_profile.rewards_earned += reward_amount;
        
        // Calculate new accuracy percentage
        let accurate_count = user_history.iter().filter(|r| r.consensus_match).count() as u32;
        let total_count = user_history.len() as u32;
        user_profile.accuracy_percentage = if total_count > 0 {
            (accurate_count * 100) / total_count
        } else {
            0
        };
        
        // Update profile
        profiles.set(user.clone(), user_profile);
        env.storage().instance().set(&DataKey::Profiles, &profiles);
        
        // Update reputation
        Self::update_reputation(env.clone(), admin, user, consensus_match);
        
        // Check if level should be updated
        Self::check_level_up(env.clone(), admin, user);
    }
    
    // Update user reputation based on verification accuracy
    fn update_reputation(env: Env, admin: Address, user: Address, consensus_match: bool) {
        let mut reputation_map: Map<Address, u32> = env.storage().instance().get(&DataKey::Reputation).unwrap();
        let current_reputation = reputation_map.get(user.clone()).unwrap_or(100);
        
        // Calculate new reputation
        let new_reputation = if consensus_match {
            // Reward for correct verification
            if current_reputation < 980 {
                current_reputation + 20
            } else {
                1000 // Max reputation
            }
        } else {
            // Penalty for incorrect verification
            if current_reputation > 30 {
                current_reputation - 30
            } else {
                1 // Min reputation
            }
        };
        
        // Store updated reputation
        reputation_map.set(user.clone(), new_reputation);
        env.storage().instance().set(&DataKey::Reputation, &reputation_map);
    }
    
    // Check if user should level up
    fn check_level_up(env: Env, admin: Address, user: Address) {
        let profiles: Map<Address, UserProfile> = env.storage().instance().get(&DataKey::Profiles).unwrap();
        let user_profile = profiles.get(user.clone()).unwrap();
        
        let mut level_map: Map<Address, u32> = env.storage().instance().get(&DataKey::Level).unwrap();
        let current_level = level_map.get(user.clone()).unwrap_or(1);
        
        // Level up criteria: verification count, accuracy, and reputation
        let verification_count = user_profile.verification_count;
        let accuracy = user_profile.accuracy_percentage;
        
        let reputation_map: Map<Address, u32> = env.storage().instance().get(&DataKey::Reputation).unwrap();
        let reputation = reputation_map.get(user.clone()).unwrap_or(100);
        
        // Determine new level based on criteria
        let new_level = match (verification_count, accuracy, reputation) {
            (vc, acc, rep) if vc >= 100 && acc >= 90 && rep >= 900 => 5,
            (vc, acc, rep) if vc >= 50 && acc >= 80 && rep >= 800 => 4,
            (vc, acc, rep) if vc >= 25 && acc >= 70 && rep >= 700 => 3,
            (vc, acc, rep) if vc >= 10 && acc >= 60 && rep >= 600 => 2,
            _ => 1,
        };
        
        // Update level if it has changed
        if new_level > current_level {
            // Update level map
            level_map.set(user.clone(), new_level);
            env.storage().instance().set(&DataKey::Level, &level_map);
            
            // Update profile
            let mut profiles: Map<Address, UserProfile> = env.storage().instance().get(&DataKey::Profiles).unwrap();
            let mut updated_profile = profiles.get(user.clone()).unwrap();
            updated_profile.level = new_level;
            profiles.set(user.clone(), updated_profile);
            env.storage().instance().set(&DataKey::Profiles, &profiles);
        }
    }
    
    // Get a user's profile
    pub fn get_profile(env: Env, user: Address) -> UserProfile {
        let profiles: Map<Address, UserProfile> = env.storage().instance().get(&DataKey::Profiles).unwrap();
        
        if !profiles.contains_key(&user) {
            panic!("User does not have a profile");
        }
        
        profiles.get(user).unwrap()
    }
    
    // Get a user's verification history
    pub fn get_verification_history(env: Env, user: Address) -> Vec<VerificationRecord> {
        let history_map: Map<Address, Vec<VerificationRecord>> = env.storage().instance().get(&DataKey::VerificationHistory).unwrap();
        
        if !history_map.contains_key(&user) {
            return Vec::new(&env);
        }
        
        history_map.get(user).unwrap()
    }
    
    // Get a user's reputation
    pub fn get_reputation(env: Env, user: Address) -> u32 {
        let reputation_map: Map<Address, u32> = env.storage().instance().get(&DataKey::Reputation).unwrap();
        
        reputation_map.get(user).unwrap_or(0)
    }
    
    // Get a user's level
    pub fn get_level(env: Env, user: Address) -> u32 {
        let level_map: Map<Address, u32> = env.storage().instance().get(&DataKey::Level).unwrap();
        
        level_map.get(user).unwrap_or(1)
    }
    
    // Get top users by reputation
    pub fn get_top_users(env: Env, limit: u32) -> Vec<UserProfile> {
        let profiles: Map<Address, UserProfile> = env.storage().instance().get(&DataKey::Profiles).unwrap();
        let reputation_map: Map<Address, u32> = env.storage().instance().get(&DataKey::Reputation).unwrap();
        
        // Create a vector to hold users and their reputations
        let mut user_rep_pairs: Vec<(Address, u32)> = Vec::new(&env);
        
        // Collect all users and their reputations
        for (address, _) in profiles.iter() {
            let rep = reputation_map.get(address.clone()).unwrap_or(0);
            user_rep_pairs.push_back((address, rep));
        }
        
        // Sort by reputation (descending)
        // Note: In a real implementation, this would need a proper sorting algorithm
        // This is simplified for demonstration purposes
        let mut sorted_users: Vec<UserProfile> = Vec::new(&env);
        let mut remaining_pairs = user_rep_pairs.clone();
        
        for _ in 0..std::cmp::min(limit as u32, user_rep_pairs.len() as u32) {
            if remaining_pairs.len() == 0 {
                break;
            }
            
            // Find the highest reputation user
            let mut highest_rep = 0;
            let mut highest_index = 0;
            
            for i in 0..remaining_pairs.len() {
                let (_, rep) = remaining_pairs.get_unchecked(i).unwrap();
                if rep > highest_rep {
                    highest_rep = rep;
                    highest_index = i;
                }
            }
            
            // Add this user to the sorted list
            let (addr, _) = remaining_pairs.get_unchecked(highest_index).unwrap();
            let profile = profiles.get(addr).unwrap();
            sorted_users.push_back(profile);
            
            // Remove this user from the remaining pairs
            remaining_pairs.remove(highest_index);
        }
        
        sorted_users
    }
} 