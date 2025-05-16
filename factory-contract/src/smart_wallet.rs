// Smart wallet contract for TrueLens platform
// This implements a smart wallet that can be controlled by a user's passkey

#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, BytesN, Env, String, Vec, Symbol, Map};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DataKey {
    Owner,
    Guardian,
    Nonce,
    Authorizations,
    AuthPolicy
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum AuthPolicy {
    // Only the owner can authorize transactions
    OwnerOnly,
    // Either the owner or the guardian can authorize transactions
    OwnerOrGuardian,
    // Both the owner and the guardian must authorize transactions
    OwnerAndGuardian,
    // Complex policy for multi-signature requirements
    MultiSig(Vec<Address>, u32), // Addresses and threshold
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Authorization {
    nonce: u64,
    operation: Symbol,
    target: Address,
    amount: i128,
    data: Option<BytesN<32>>,
    signatures: Vec<Address>
}

#[contract]
pub struct SmartWallet;

#[contractimpl]
impl SmartWallet {
    // Initialize a new smart wallet
    pub fn initialize(env: Env, owner: Address) -> Address {
        // Ensure the contract isn't already initialized
        if env.storage().instance().has(&DataKey::Owner) {
            panic!("Smart wallet already initialized");
        }
        
        // Store the owner
        env.storage().instance().set(&DataKey::Owner, &owner);
        
        // Initialize nonce
        env.storage().instance().set(&DataKey::Nonce, &0u64);
        
        // Initialize empty authorizations
        env.storage().instance().set(&DataKey::Authorizations, &Vec::<Authorization>::new(&env));
        
        // Set default auth policy to OwnerOnly
        env.storage().instance().set(&DataKey::AuthPolicy, &AuthPolicy::OwnerOnly);
        
        // Return the contract address
        env.current_contract_address()
    }
    
    // Update the owner address (requires current owner's authorization)
    pub fn update_owner(env: Env, current_owner: Address, new_owner: Address) {
        // Verify that current owner is calling
        let owner: Address = env.storage().instance().get(&DataKey::Owner).unwrap();
        if current_owner != owner {
            panic!("Only the current owner can update the owner");
        }
        current_owner.require_auth();
        
        // Update the owner
        env.storage().instance().set(&DataKey::Owner, &new_owner);
    }
    
    // Add a guardian address
    pub fn add_guardian(env: Env, owner: Address, guardian: Address) {
        // Verify that owner is calling
        let stored_owner: Address = env.storage().instance().get(&DataKey::Owner).unwrap();
        if owner != stored_owner {
            panic!("Only the owner can add a guardian");
        }
        owner.require_auth();
        
        // Store the guardian
        env.storage().instance().set(&DataKey::Guardian, &guardian);
    }
    
    // Update the auth policy
    pub fn update_auth_policy(env: Env, owner: Address, policy: AuthPolicy) {
        // Verify that owner is calling
        let stored_owner: Address = env.storage().instance().get(&DataKey::Owner).unwrap();
        if owner != stored_owner {
            panic!("Only the owner can update the auth policy");
        }
        owner.require_auth();
        
        // Store the policy
        env.storage().instance().set(&DataKey::AuthPolicy, &policy);
    }
    
    // Submit a transaction authorization
    pub fn submit_authorization(
        env: Env,
        signer: Address,
        operation: Symbol,
        target: Address,
        amount: i128,
        data: Option<BytesN<32>>
    ) -> u64 {
        // Verify that the signer is either the owner or the guardian
        let owner: Address = env.storage().instance().get(&DataKey::Owner).unwrap();
        let authorized: bool;
        
        if signer == owner {
            authorized = true;
        } else if env.storage().instance().has(&DataKey::Guardian) {
            let guardian: Address = env.storage().instance().get(&DataKey::Guardian).unwrap();
            authorized = (signer == guardian);
        } else {
            authorized = false;
        }
        
        if !authorized {
            panic!("Signer is not authorized to submit transactions");
        }
        
        // Require auth from the signer
        signer.require_auth();
        
        // Get the current nonce
        let nonce: u64 = env.storage().instance().get(&DataKey::Nonce).unwrap();
        
        // Create a list with the current signer
        let mut signatures = Vec::new(&env);
        signatures.push_back(signer);
        
        // Create the authorization
        let auth = Authorization {
            nonce,
            operation,
            target,
            amount,
            data,
            signatures
        };
        
        // Store the authorization
        let mut authorizations: Vec<Authorization> = env.storage().instance().get(&DataKey::Authorizations).unwrap();
        authorizations.push_back(auth);
        env.storage().instance().set(&DataKey::Authorizations, &authorizations);
        
        // Increment and store the nonce
        let new_nonce = nonce + 1;
        env.storage().instance().set(&DataKey::Nonce, &new_nonce);
        
        // Return the nonce used for this authorization
        nonce
    }
    
    // Approve an existing authorization
    pub fn approve_authorization(env: Env, signer: Address, nonce: u64) {
        // Verify that the signer is either the owner or the guardian
        let owner: Address = env.storage().instance().get(&DataKey::Owner).unwrap();
        let authorized: bool;
        
        if signer == owner {
            authorized = true;
        } else if env.storage().instance().has(&DataKey::Guardian) {
            let guardian: Address = env.storage().instance().get(&DataKey::Guardian).unwrap();
            authorized = (signer == guardian);
        } else {
            authorized = false;
        }
        
        if !authorized {
            panic!("Signer is not authorized to approve transactions");
        }
        
        // Require auth from the signer
        signer.require_auth();
        
        // Find and update the authorization
        let mut authorizations: Vec<Authorization> = env.storage().instance().get(&DataKey::Authorizations).unwrap();
        let mut found = false;
        
        for i in 0..authorizations.len() {
            let mut auth = authorizations.get_unchecked(i).unwrap();
            if auth.nonce == nonce {
                // Check if the signer already approved this authorization
                for j in 0..auth.signatures.len() {
                    let existing_signer = auth.signatures.get_unchecked(j).unwrap();
                    if existing_signer == signer {
                        panic!("Signer has already approved this authorization");
                    }
                }
                
                // Add the signer's approval
                auth.signatures.push_back(signer);
                authorizations.set(i, auth);
                found = true;
                break;
            }
        }
        
        if !found {
            panic!("Authorization with specified nonce not found");
        }
        
        env.storage().instance().set(&DataKey::Authorizations, &authorizations);
    }
    
    // Execute an authorization if it meets the policy requirements
    pub fn execute_authorization(env: Env, nonce: u64) {
        // Find the authorization
        let mut authorizations: Vec<Authorization> = env.storage().instance().get(&DataKey::Authorizations).unwrap();
        let mut auth_index = None;
        let mut authorization = None;
        
        for i in 0..authorizations.len() {
            let auth = authorizations.get_unchecked(i).unwrap();
            if auth.nonce == nonce {
                auth_index = Some(i);
                authorization = Some(auth);
                break;
            }
        }
        
        if auth_index.is_none() || authorization.is_none() {
            panic!("Authorization with specified nonce not found");
        }
        
        let auth = authorization.unwrap();
        
        // Check if the authorization meets the policy requirements
        let policy: AuthPolicy = env.storage().instance().get(&DataKey::AuthPolicy).unwrap();
        let owner: Address = env.storage().instance().get(&DataKey::Owner).unwrap();
        let meets_policy: bool;
        
        match policy {
            AuthPolicy::OwnerOnly => {
                // Check if the owner is one of the signers
                let mut owner_signed = false;
                for i in 0..auth.signatures.len() {
                    let signer = auth.signatures.get_unchecked(i).unwrap();
                    if signer == owner {
                        owner_signed = true;
                        break;
                    }
                }
                meets_policy = owner_signed;
            },
            AuthPolicy::OwnerOrGuardian => {
                // Check if either the owner or the guardian is one of the signers
                let guardian: Address = env.storage().instance().get(&DataKey::Guardian).unwrap();
                let mut authorized_signed = false;
                
                for i in 0..auth.signatures.len() {
                    let signer = auth.signatures.get_unchecked(i).unwrap();
                    if signer == owner || signer == guardian {
                        authorized_signed = true;
                        break;
                    }
                }
                meets_policy = authorized_signed;
            },
            AuthPolicy::OwnerAndGuardian => {
                // Check if both the owner and the guardian have signed
                let guardian: Address = env.storage().instance().get(&DataKey::Guardian).unwrap();
                let mut owner_signed = false;
                let mut guardian_signed = false;
                
                for i in 0..auth.signatures.len() {
                    let signer = auth.signatures.get_unchecked(i).unwrap();
                    if signer == owner {
                        owner_signed = true;
                    } else if signer == guardian {
                        guardian_signed = true;
                    }
                }
                
                meets_policy = owner_signed && guardian_signed;
            },
            AuthPolicy::MultiSig(addresses, threshold) => {
                // Check if enough authorized signers have signed
                let mut valid_sigs = 0;
                
                for i in 0..auth.signatures.len() {
                    let signer = auth.signatures.get_unchecked(i).unwrap();
                    
                    // Check if the signer is in the authorized list
                    for j in 0..addresses.len() {
                        let authorized = addresses.get_unchecked(j).unwrap();
                        if signer == authorized {
                            valid_sigs += 1;
                            break;
                        }
                    }
                }
                
                meets_policy = valid_sigs >= threshold;
            }
        }
        
        if !meets_policy {
            panic!("Authorization does not meet the policy requirements");
        }
        
        // Execute the operation
        match auth.operation.as_ref() {
            "transfer" => {
                // Transfer funds to the target
                Self::execute_transfer(env.clone(), auth.target, auth.amount);
            },
            "verify_news" => {
                // Verify news using the TrueLens verification contract
                Self::execute_verify_news(env.clone(), auth.target, auth.data.unwrap_or_else(|| panic!("Data is required for verify_news")));
            },
            "stake" => {
                // Stake XLM
                Self::execute_stake(env.clone(), auth.target, auth.amount);
            },
            _ => {
                panic!("Unsupported operation");
            }
        }
        
        // Remove the executed authorization
        let idx = auth_index.unwrap();
        authorizations.remove(idx);
        env.storage().instance().set(&DataKey::Authorizations, &authorizations);
    }
    
    // Execute a transfer operation
    fn execute_transfer(env: Env, target: Address, amount: i128) {
        // In a real implementation, this would transfer XLM or other tokens
        // to the target address.
        let _ = env;
        let _ = target;
        let _ = amount;
    }
    
    // Execute a news verification operation
    fn execute_verify_news(env: Env, verification_contract: Address, news_hash: BytesN<32>) {
        // In a real implementation, this would call the TrueLens verification
        // contract to submit a verification.
        let _ = env;
        let _ = verification_contract;
        let _ = news_hash;
    }
    
    // Execute a staking operation
    fn execute_stake(env: Env, staking_contract: Address, amount: i128) {
        // In a real implementation, this would call the staking contract to
        // stake the specified amount of XLM.
        let _ = env;
        let _ = staking_contract;
        let _ = amount;
    }
    
    // Get the current owner
    pub fn get_owner(env: Env) -> Address {
        env.storage().instance().get(&DataKey::Owner).unwrap()
    }
    
    // Get the current guardian (if any)
    pub fn get_guardian(env: Env) -> Option<Address> {
        if env.storage().instance().has(&DataKey::Guardian) {
            Some(env.storage().instance().get(&DataKey::Guardian).unwrap())
        } else {
            None
        }
    }
    
    // Get the current auth policy
    pub fn get_auth_policy(env: Env) -> AuthPolicy {
        env.storage().instance().get(&DataKey::AuthPolicy).unwrap()
    }
    
    // Get the current nonce
    pub fn get_nonce(env: Env) -> u64 {
        env.storage().instance().get(&DataKey::Nonce).unwrap()
    }
    
    // Get a list of pending authorizations
    pub fn get_pending_authorizations(env: Env) -> Vec<Authorization> {
        env.storage().instance().get(&DataKey::Authorizations).unwrap()
    }
} 