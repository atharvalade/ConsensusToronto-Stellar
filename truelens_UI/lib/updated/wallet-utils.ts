// Stellar wallet interactions with Passkeys integration
import { PasskeyKit } from "passkey-kit";

// Constants
export const STELLAR_TESTNET = "testnet";
export const STELLAR_PUBLIC_NETWORK = "public";
export const CURRENT_NETWORK = STELLAR_TESTNET;

// Configure network settings
const getNetworkPassphrase = () => {
  return CURRENT_NETWORK === STELLAR_TESTNET 
    ? "Test SDF Network ; September 2015" 
    : "Public Global Stellar Network ; September 2015";
};

// Configure RPC URL based on network
const RPC_URL = CURRENT_NETWORK === STELLAR_TESTNET
  ? 'https://soroban-testnet.stellar.org'
  : 'https://soroban.stellar.org';

// Configure Launchtube URL
const LAUNCHTUBE_URL = 'https://launchtube-testnet.stellar.org';

// Configure Stellar Horizon API URL
const HORIZON_URL = CURRENT_NETWORK === STELLAR_TESTNET
  ? 'https://horizon-testnet.stellar.org'
  : 'https://horizon.stellar.org';

// Interface for Stellar account
export interface StellarAccount {
  publicKey: string;
  network: string;
  isActive: boolean;
}

// Factory Contract ID - This would be the ID of your deployed smart wallet factory contract
// In a production environment, this would be in env variables
const FACTORY_CONTRACT_ID = process.env.NEXT_PUBLIC_FACTORY_CONTRACT_ID || 
  // Default testnet factory ID for testing (replace with a real one)
  "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU5QWWTRK5";

// Initialize PasskeyKit (only in browser environment)
let passkeyKit: PasskeyKit | null = null;

const getPasskeyKit = async () => {
  if (typeof window === 'undefined') {
    return null;
  }
  
  if (!passkeyKit) {
    try {
      // Dynamic import of PasskeyKit to avoid Next.js issues
      passkeyKit = new PasskeyKit({
        rpcUrl: RPC_URL,
        networkPassphrase: getNetworkPassphrase(),
        // Remove factoryContractId as it's not in the type definition
      });
    } catch (error) {
      console.error("Error initializing PasskeyKit", error);
      return null;
    }
  }
  
  return passkeyKit;
};

// Submit transaction via Launchtube
const submitViaLaunchtube = async (signedTxXDR: string) => {
  try {
    // This is where you would submit to Launchtube
    // In a real implementation, you'd use the Launchtube API
    const response = await fetch(LAUNCHTUBE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tx: signedTxXDR,
      }),
    });

    if (!response.ok) {
      throw new Error(`Launchtube submission failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error submitting via Launchtube", error);
    throw error;
  }
};

// Connect wallet with Stellar Passkeys
export const connectWallet = async (checkOnly: boolean = false): Promise<string | null> => {
  if (checkOnly) {
    // Just check if there's a connected account and return its address
    if (typeof window === 'undefined') return null;
    
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
    // Get the PasskeyKit instance
    const passkeyKit = await getPasskeyKit();
    if (!passkeyKit) {
      console.error("PasskeyKit not available");
      return null;
    }
    
    let publicKey: string;
    
    try {
      // Try to connect to existing wallet
      console.log("Attempting to connect to existing wallet...");
      const result = await passkeyKit.connectWallet();
      
      // Handle result format
      if (typeof result === 'object' && result !== null) {
        publicKey = result.contractId || '';
      } else {
        publicKey = result || '';
      }
      
      console.log("Connected to wallet:", publicKey);
    } catch (error) {
      console.log("Failed to connect to existing wallet, creating new wallet...", error);
      
      try {
        // Create a new wallet with required app parameter
        const appName = "TrueLens News Verification";
        const appDomain = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
        
        const result = await passkeyKit.createWallet(
          appName,
          { domain: appDomain }
        );
        
        // Handle result format
        if (typeof result === 'object' && result !== null) {
          publicKey = result.contractId || '';
        } else {
          publicKey = result || '';
        }
        
        console.log("Created new wallet:", publicKey);
      } catch (createError) {
        console.error("Failed to create wallet", createError);
        return null;
      }
    }
    
    if (!publicKey) {
      throw new Error("Failed to get wallet public key");
    }
    
    const account: StellarAccount = {
      publicKey,
      network: CURRENT_NETWORK,
      isActive: true
    };
    
    // Store the account
    localStorage?.setItem('stellar_account', JSON.stringify(account));
    
    return account.publicKey;
  } catch (error) {
    console.error("Error connecting with Stellar Passkey", error);
    return null;
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
    
    const savedAccount = localStorage?.getItem('stellar_account');
    if (!savedAccount) {
      return { success: false };
    }
    
    const account = JSON.parse(savedAccount) as StellarAccount;
    const publicKey = account.publicKey;
    
    console.log(`Using account: ${publicKey}`);
    
    // Get the PasskeyKit instance
    const passkeyKit = await getPasskeyKit();
    if (!passkeyKit) {
      console.error("PasskeyKit not available");
      return { success: false };
    }

    try {
      // In a real implementation, you would:
      // 1. Create a transaction to call the news verification smart contract
      // 2. Sign it with the passkey
      // 3. Submit it to Launchtube

      // For this example, we're just simulating the verification
      // In a real implementation, you'd create the transaction based on your contract
      
      // This is where you'd start the real implementation
      // const newsContract = "YOUR_NEWS_CONTRACT_ID";
      // const signedTx = await passkeyKit.sign({
      //   to: newsContract,
      //   method: choice === 'verify' ? 'verifyNews' : 'flagNews',
      //   params: {
      //     newsId: newsId.toString(),
      //     details: JSON.stringify(newsDetails)
      //   }
      // });
      
      // const result = await submitViaLaunchtube(signedTx);
      
      // Simulation for demo purposes
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return {
        success: true,
        hash: `SIMULATION_TX_HASH_${Date.now()}`,
        fee: '0.00001 XLM'
      };
    } catch (error) {
      console.error("Error signing or submitting verification transaction", error);
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
    
    const savedAccount = localStorage?.getItem('stellar_account');
    if (!savedAccount) {
      return { success: false };
    }
    
    const account = JSON.parse(savedAccount) as StellarAccount;
    const publicKey = account.publicKey;
    
    console.log(`Staking ${amount} XLM from account: ${publicKey}`);
    
    // Get the PasskeyKit instance
    const passkeyKit = await getPasskeyKit();
    if (!passkeyKit) {
      console.error("PasskeyKit not available");
      return { success: false };
    }

    try {
      // In a real implementation, you would:
      // 1. Create a transaction to call the staking smart contract
      // 2. Sign it with the passkey
      // 3. Submit it to Launchtube

      // For this example, we're just simulating the staking
      // In a real implementation, you'd create the transaction based on your contract
      
      // This is where you'd start the real implementation
      // const stakingContract = "YOUR_STAKING_CONTRACT_ID";
      // const signedTx = await passkeyKit.sign({
      //   to: stakingContract,
      //   method: 'stake',
      //   params: {
      //     amount: (amount * 10000000).toString() // XLM has 7 decimal places
      //   }
      // });
      
      // const result = await submitViaLaunchtube(signedTx);
      
      // Simulation for demo purposes
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      return {
        success: true,
        hash: `SIMULATION_STAKE_TX_${Date.now()}`
      };
    } catch (error) {
      console.error("Error signing or submitting staking transaction", error);
      return { success: false };
    }
  } catch (error) {
    console.error("Error staking XLM:", error);
    return { success: false };
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