// TrueToken contract for TrueLens platform
// This implements a fungible token for rewarding news verification

#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, token, Address, Env, String};

// Token metadata
const DECIMAL_PLACES: u32 = 7;
const NAME: &str = "TrueToken";
const SYMBOL: &str = "TRUE";

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DataKey {
    TokenAdmin,
    TokenMetadata,
}

#[contract]
pub struct TrueToken;

#[contractimpl]
impl TrueToken {
    // Initialize a new token contract
    pub fn initialize(env: Env, admin: Address) -> Address {
        // Check if we've already initialized the token
        if env.storage().instance().has(&DataKey::TokenAdmin) {
            panic!("Token already initialized");
        }

        // Store the admin address
        env.storage().instance().set(&DataKey::TokenAdmin, &admin);
        
        // Initialize the token with the Soroban token interface
        let token_client = token::Client::new(&env, &env.current_contract_address());
        token_client.initialize(
            &admin,
            &DECIMAL_PLACES,
            &String::from_str(&env, NAME),
            &String::from_str(&env, SYMBOL),
        );
        
        // Return the token contract's address
        env.current_contract_address()
    }
    
    // Mint new tokens (only admin can call this)
    pub fn mint(env: Env, to: Address, amount: i128) {
        // Verify the admin is calling this function
        let admin: Address = env.storage().instance().get(&DataKey::TokenAdmin).unwrap();
        admin.require_auth();
        
        // Check if amount is positive
        if amount <= 0 {
            panic!("Amount must be positive");
        }
        
        // Mint tokens to the specified address
        let token_client = token::Client::new(&env, &env.current_contract_address());
        token_client.mint(&to, &amount);
    }
    
    // Mint tokens to reward verifiers
    pub fn mint_reward(env: Env, verifier: Address, amount: i128) {
        // Verify the admin is calling this function
        let admin: Address = env.storage().instance().get(&DataKey::TokenAdmin).unwrap();
        admin.require_auth();
        
        // Check if amount is positive
        if amount <= 0 {
            panic!("Reward amount must be positive");
        }
        
        // Mint reward tokens to the verifier
        let token_client = token::Client::new(&env, &env.current_contract_address());
        token_client.mint(&verifier, &amount);
    }
    
    // Transfer tokens from one account to another (caller must be the 'from' account)
    pub fn transfer(env: Env, from: Address, to: Address, amount: i128) {
        // Require authorization from the sender
        from.require_auth();
        
        // Check if amount is positive
        if amount <= 0 {
            panic!("Amount must be positive");
        }
        
        // Transfer tokens
        let token_client = token::Client::new(&env, &env.current_contract_address());
        token_client.transfer(&from, &to, &amount);
    }
    
    // Transfer tokens on behalf of another account (caller must have approval)
    pub fn transfer_from(env: Env, spender: Address, from: Address, to: Address, amount: i128) {
        // Require authorization from the spender
        spender.require_auth();
        
        // Check if amount is positive
        if amount <= 0 {
            panic!("Amount must be positive");
        }
        
        // Transfer tokens
        let token_client = token::Client::new(&env, &env.current_contract_address());
        token_client.transfer_from(&spender, &from, &to, &amount);
    }
    
    // Approve a spender to transfer tokens on behalf of the owner
    pub fn approve(env: Env, from: Address, spender: Address, amount: i128) {
        // Require authorization from the owner
        from.require_auth();
        
        // Check if amount is non-negative
        if amount < 0 {
            panic!("Amount must be non-negative");
        }
        
        // Approve the spender
        let token_client = token::Client::new(&env, &env.current_contract_address());
        token_client.approve(&from, &spender, &amount);
    }
    
    // Get the balance of an account
    pub fn balance(env: Env, account: Address) -> i128 {
        let token_client = token::Client::new(&env, &env.current_contract_address());
        token_client.balance(&account)
    }
    
    // Check if the specified account is the admin
    pub fn is_admin(env: Env, account: Address) -> bool {
        let admin: Address = env.storage().instance().get(&DataKey::TokenAdmin).unwrap();
        admin == account
    }
    
    // Burn tokens (destroy them)
    pub fn burn(env: Env, from: Address, amount: i128) {
        // Require authorization from the sender
        from.require_auth();
        
        // Check if amount is positive
        if amount <= 0 {
            panic!("Amount must be positive");
        }
        
        // Burn tokens
        let token_client = token::Client::new(&env, &env.current_contract_address());
        token_client.burn(&from, &amount);
    }
    
    // Get token metadata (name, symbol, decimals)
    pub fn get_metadata(env: Env) -> (String, String, u32) {
        let token_client = token::Client::new(&env, &env.current_contract_address());
        
        let name = token_client.name();
        let symbol = token_client.symbol();
        let decimals = token_client.decimals();
        
        (name, symbol, decimals)
    }
} 