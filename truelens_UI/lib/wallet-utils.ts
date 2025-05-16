// Stellar wallet interactions with Passkeys integration
import { account, getContractId, fundContract, send, verifyNews as verifyNewsOnContract, native } from '@/lib/passkeyClient';

// Constants
export const STELLAR_TESTNET = "testnet";
export const STELLAR_PUBLIC_NETWORK = "public";
export const CURRENT_NETWORK = STELLAR_TESTNET;

// Interface for Stellar account
export interface StellarAccount {
  publicKey: string;
  network: string;
  isActive: boolean;
  keyId?: string; // Store the keyId to avoid reconnection issues
  balance?: number; // Store the balance
}

// Connect wallet with Stellar Passkeys
export const connectWallet = async (checkOnly: boolean = false): Promise<string | null> => {
  if (checkOnly) {
    // Just check if there's a connected account and return its address
    const savedAccount = localStorage?.getItem('stellar_account');
    if (savedAccount) {
      try {
        const account = JSON.parse(savedAccount) as StellarAccount;
        return account.publicKey;
      } catch (e) {
        console.error("Error parsing stored account", e);
        return null;
      }
    }
    return null;
  }
  
  try {
    if (typeof window === 'undefined') return null;
    
    console.log("Starting wallet connection process");
    
    // First check if we already have an account stored
    const savedAccount = localStorage?.getItem('stellar_account');
    if (savedAccount) {
      try {
        const parsedAccount = JSON.parse(savedAccount) as StellarAccount;
        // If we have a valid contract address, we can just return it
        if (parsedAccount.publicKey && (parsedAccount.publicKey.startsWith('C') || parsedAccount.publicKey.startsWith('G'))) {
          console.log("Found existing account in localStorage:", parsedAccount.publicKey);
          return parsedAccount.publicKey;
        }
      } catch (e) {
        console.error("Error parsing stored account", e);
        // Continue with the wallet creation
      }
    }
    
    // If we get here, we need to create a new wallet
    // Generate a unique username
    const username = `user_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    console.log("Creating wallet with username:", username);
    
    try {
      // Create a new wallet
      console.log("Creating new wallet...");
      const result = await account.createWallet(
        "TrueLens", // App name
        username
      );
      
      const contractId = result.contractId;
      const keyId = result.keyId_base64 || result.keyId;
      const built = result.built;
      
      console.log("Created wallet with:");
      console.log("- Contract ID:", contractId);
      console.log("- Key ID:", keyId ? (keyId.slice(0, 10) + "...") : "Not available");
      
      if (!contractId || !(contractId.startsWith('C') || contractId.startsWith('G'))) {
        throw new Error("Invalid contract address received");
      }
      
      // Submit the built transaction if available
      if (built) {
        try {
          console.log("Submitting wallet creation transaction");
          await send(built);
          console.log("Transaction submitted successfully");
        } catch (sendError) {
          console.error("Error submitting transaction:", sendError);
          // Continue anyway - the wallet may still be usable
        }
      }
      
      // Fund the new wallet with testnet XLM
      if (CURRENT_NETWORK === STELLAR_TESTNET) {
        try {
          console.log("Funding new wallet:", contractId);
          await fundContract(contractId);
          console.log("Successfully funded new wallet");
        } catch (fundError) {
          console.error("Error funding new wallet:", fundError);
          // Continue with the wallet creation even if funding fails
        }
      }
      
      // Fetch initial balance (mock)
      const balance = Math.floor(Math.random() * 5000) + 1000;
      
      // Store the wallet details
      const stellarAccount: StellarAccount = {
        publicKey: contractId,
        network: CURRENT_NETWORK,
        isActive: true,
        keyId: keyId,
        balance: balance
      };
      
      localStorage?.setItem('stellar_account', JSON.stringify(stellarAccount));
      return contractId;
      
    } catch (error: any) {
      console.error("Error creating wallet:", error);
      
      // Special handling for XDR errors
      if (error?.message?.includes("XDR Write Error") || 
          error?.message?.includes("XDR encoding error") || 
          error?.message?.includes("contract address") ||
          error?.message?.includes("obtain contract wasm") ||
          error?.message?.includes("contract not found")) {
        console.log("Clearing localStorage due to contract/XDR error");
        localStorage.removeItem('stellar_account');
      }
      
      throw error;
    }
  } catch (error) {
    console.error("Error connecting with Stellar Passkey:", error);
    throw error;
  }
};

// Function to check if user has a connected wallet
export const isWalletConnected = async (): Promise<boolean> => {
  if (typeof window === 'undefined') return false;
  
  const savedAccount = localStorage?.getItem('stellar_account');
  if (!savedAccount) return false;
  
  try {
    const account = JSON.parse(savedAccount) as StellarAccount;
    return account.isActive;
  } catch (e) {
    console.error("Error parsing stored account", e);
    return false;
  }
};

// Function to disconnect wallet / logout
export const disconnectWallet = async (): Promise<boolean> => {
  try {
    if (typeof window === 'undefined') return false;
    
    // Remove the stored account
    localStorage?.removeItem('stellar_account');
    
    return true;
  } catch (error) {
    console.error("Error disconnecting Stellar account:", error);
    return false;
  }
};

// Function to get account balance
export const getAccountBalance = async (): Promise<number> => {
  if (typeof window === 'undefined') return 0;
  
  try {
    const savedAccount = localStorage?.getItem('stellar_account');
    if (!savedAccount) return 0;
    
    const account = JSON.parse(savedAccount) as StellarAccount;
    
    // If we have a cached balance, use it
    if (account.balance) {
      return account.balance;
    }
    
    // If we have native client, use it to get balance
    if (native && account.publicKey) {
      try {
        const balance = await native.getBalance(account.publicKey);
        // Update the stored account with the new balance
        account.balance = balance;
        localStorage?.setItem('stellar_account', JSON.stringify(account));
        return balance;
      } catch (e) {
        console.error("Error fetching balance from native client:", e);
      }
    }
    
    // Return a mock balance
    const mockBalance = Math.floor(Math.random() * 5000) + 1000;
    account.balance = mockBalance;
    localStorage?.setItem('stellar_account', JSON.stringify(account));
    return mockBalance;
  } catch (error) {
    console.error("Error getting account balance:", error);
    return 0;
  }
};

// Function to verify news using Stellar smart contracts
export const verifyNewsOnStellar = async (
  newsId: number,
  choice: 'verify' | 'flag',
  newsDetails?: {
    title?: string;
    source?: string;
    date?: string;
    summary?: string;
    ipfsHash?: string;
  }
): Promise<{success: boolean, hash?: string, fee?: string}> => {
  console.log("Starting verifyNewsOnStellar with:", { newsId, choice, newsDetails });
  
  try {
    // Check if wallet is connected
    const isConnected = await isWalletConnected();
    if (!isConnected) {
      console.error("No Stellar account connected");
      return { success: false };
    }
    
    // Get the account
    const savedAccount = localStorage?.getItem('stellar_account');
    if (!savedAccount) {
      console.error("No stored account found");
      return { success: false };
    }
    
    const account = JSON.parse(savedAccount) as StellarAccount;
    
    // Mock verification process
    const isVerified = choice === 'verify';
    const result = await verifyNewsOnContract(
      newsId.toString(),
      isVerified,
      10 // 10 XLM stake
    );
    
    if (result.success) {
      // Update account balance (deduct 10 XLM for staking)
      if (account.balance) {
        account.balance -= 10;
        localStorage?.setItem('stellar_account', JSON.stringify(account));
      }
      
      return {
        success: true,
        hash: result.txHash,
        fee: "0.00001 XLM"
      };
    } else {
      return { success: false };
    }
  } catch (error) {
    console.error("Error in verifyNewsOnStellar:", error);
    return { success: false };
  }
};

// Function to stake XLM tokens
export const stakeXLM = async (amount: number): Promise<{success: boolean, hash?: string}> => {
  try {
    // Check if wallet is connected
    const isConnected = await isWalletConnected();
    if (!isConnected) {
      console.error("No Stellar account connected");
      return { success: false };
    }
    
    // Get the account
    const savedAccount = localStorage?.getItem('stellar_account');
    if (!savedAccount) {
      console.error("No stored account found");
      return { success: false };
    }
    
    const account = JSON.parse(savedAccount) as StellarAccount;
    
    // Simulate delay for blockchain transaction
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // Update account balance (deduct staked amount)
    if (account.balance) {
      account.balance -= amount;
      localStorage?.setItem('stellar_account', JSON.stringify(account));
    }
    
    // Generate mock transaction hash
    const mockTxHash = 'T' + Array(64).fill(0).map(() => 
      '0123456789ABCDEF'[Math.floor(Math.random() * 16)]).join('');
    
    return {
      success: true,
      hash: mockTxHash
    };
  } catch (error) {
    console.error("Error staking XLM:", error);
    return { success: false };
  }
}; 