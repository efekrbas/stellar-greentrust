#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, token, Address, Env};

#[contracttype]
pub enum DataKey {
    Admin,
    TotalDonated,
}

#[contract]
pub struct GreenTrustContract;

#[contractimpl]
impl GreenTrustContract {
    /// 1. Initialize the contract and set the admin address.
    pub fn initialize(env: Env, admin: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("Contract is already initialized");
        }
        
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::TotalDonated, &0i128);
    }

    /// 2. Donate function: Users send tokens to the contract.
    pub fn donate(env: Env, donor: Address, token_address: Address, amount: i128) {
        donor.require_auth();
        
        let token = token::Client::new(&env, &token_address);
        token.transfer(&donor, &env.current_contract_address(), &amount);

        let mut total: i128 = env.storage().instance().get(&DataKey::TotalDonated).unwrap_or(0);
        total += amount;
        env.storage().instance().set(&DataKey::TotalDonated, &total);
        
        env.storage().instance().extend_ttl(100_000, 100_000);
    }

    /// 3. Release function: Only the admin can call this to transfer funds to a beneficiary.
    pub fn release(env: Env, beneficiary: Address, token_address: Address, amount: i128) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).expect("Contract not initialized");
        admin.require_auth();

        let token = token::Client::new(&env, &token_address);
        token.transfer(&env.current_contract_address(), &beneficiary, &amount);
        
        env.storage().instance().extend_ttl(100_000, 100_000);
    }

    /// 4. View function to check the total donated amount.
    pub fn get_total_donated(env: Env) -> i128 {
        env.storage().instance().get(&DataKey::TotalDonated).unwrap_or(0)
    }
}
