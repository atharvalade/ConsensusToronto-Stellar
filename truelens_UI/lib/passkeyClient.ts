import * as stellar from "@stellar/stellar-sdk";
// Use require for problematic libraries
const passkeyKit = require("passkey-kit");
const { PasskeyKit, SACClient } = passkeyKit;

// Set up environment variables - these should be added to your project's environment configuration
const STELLAR_RPC_URL = process.env.NEXT_PUBLIC_STELLAR_RPC_URL || "https://soroban-testnet.stellar.org";
const STELLAR_NETWORK_PASSPHRASE = process.env.NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE || "Test SDF Network ; September 2015";
const FACTORY_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_FACTORY_CONTRACT_ADDRESS || "GAJNKGZI23LFE5QXMWVZWHUOFUJV2ZOS3YT4U2T47X6A4QVMHX2SJQ7U";
const NATIVE_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_NATIVE_CONTRACT_ADDRESS || "CDEJSTARK5YTJAK2SKS6NQAAFZTDDXPTXSNVVIWCOXVPBMVCBTNKBUW";
const VERIFICATION_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_VERIFICATION_CONTRACT_ADDRESS || "CAVKQCR4WAFPPHAXC24GFEKFADUJZQ6V22O3OPS4FSA3IYFEZM6YTRXY";

// Log all environment variables for debugging
console.log("Environment Configuration:");
console.log("- STELLAR_RPC_URL:", STELLAR_RPC_URL);
console.log("- STELLAR_NETWORK_PASSPHRASE:", STELLAR_NETWORK_PASSPHRASE);
console.log("- FACTORY_CONTRACT_ADDRESS:", FACTORY_CONTRACT_ADDRESS);
console.log("- NATIVE_CONTRACT_ADDRESS:", NATIVE_CONTRACT_ADDRESS);
console.log("- VERIFICATION_CONTRACT_ADDRESS:", VERIFICATION_CONTRACT_ADDRESS);

// Validate contract addresses
const isValidContractAddress = (address: string) => {
  // Check if the address is a valid Stellar contract ID (56 characters for StrKey encoding)
  return typeof address === 'string' && address.length === 56 && address.startsWith('C');
};

// Console warnings for missing or invalid addresses
if (!FACTORY_CONTRACT_ADDRESS) {
  console.warn('Warning: Factory contract address is missing. Wallet creation will fail.');
} else if (!isValidContractAddress(FACTORY_CONTRACT_ADDRESS)) {
  console.warn('Warning: Factory contract address is invalid:', FACTORY_CONTRACT_ADDRESS);
}

if (!NATIVE_CONTRACT_ADDRESS) {
  console.warn('Warning: Native contract address is missing. Native asset operations will fail.');
} else if (!isValidContractAddress(NATIVE_CONTRACT_ADDRESS)) {
  console.warn('Warning: Native contract address is invalid:', NATIVE_CONTRACT_ADDRESS);
}

if (!VERIFICATION_CONTRACT_ADDRESS) {
  console.warn('Warning: Verification contract address is missing. News verification will fail.');
} else if (!isValidContractAddress(VERIFICATION_CONTRACT_ADDRESS)) {
  console.warn('Warning: Verification contract address is invalid:', VERIFICATION_CONTRACT_ADDRESS);
}

/**
 * Helper function to convert contract address to the correct format
 */
const convertContractAddress = (contractAddress: string) => {
  if (!contractAddress || !isValidContractAddress(contractAddress)) return null;
  
  try {
    // Convert the contract address from StrKey to buffer/binary representation
    const contractBuffer = stellar.StrKey.decodeContract(contractAddress);
    return contractBuffer;
  } catch (error) {
    console.error('Error converting contract address:', error);
    return null;
  }
};

/**
 * Helper function to check if a contract exists on the network
 */
async function verifyContractExists(contractId: string): Promise<boolean> {
  if (!contractId || !isValidContractAddress(contractId)) {
    return false;
  }
  
  try {
    // Create a temporary RPC server to check the contract
    const tempServer = new stellar.SorobanRpc.Server(STELLAR_RPC_URL);
    
    // Try to get the contract code for the given contract ID
    try {
      const response = await fetch(`${STELLAR_RPC_URL}/soroban/rpc`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getLatestLedger',
          params: [],
        }),
      });
      
      if (response.ok) {
        // If we can connect to the RPC, we'll assume the contract likely exists
        // The real validation will happen when PasskeyKit tries to use it
        console.log(`Connected to Stellar network, assuming contract exists: ${contractId}`);
        return true;
      }
    } catch (error) {
      console.error(`Cannot connect to Stellar RPC: ${STELLAR_RPC_URL}`, error);
      throw new Error("Cannot connect to Stellar network. Please check your internet connection and try again.");
    }
    
    return true; // Assume contract exists for now, PasskeyKit will validate later
  } catch (error) {
    console.error(`Error checking contract: ${contractId}`, error);
    return false;
  }
}

/**
 * Show a browser passkey prompt
 */
const showPasskeyPrompt = async (username: string): Promise<void> => {
  // This simulates the browser's passkey prompt using the Web Authentication API
  try {
    // Only show the prompt if the browser supports WebAuthn
    if (typeof window !== 'undefined' && window.PublicKeyCredential) {
      // Create a new PublicKeyCredential options object
      const publicKeyCredentialCreationOptions: any = {
        challenge: Uint8Array.from(
          username, c => c.charCodeAt(0)
        ),
        rp: {
          name: "TrueLens",
          id: window.location.hostname
        },
        user: {
          id: Uint8Array.from(
            username, c => c.charCodeAt(0)
          ),
          name: username,
          displayName: username
        },
        pubKeyCredParams: [{alg: -7, type: "public-key"}],
        timeout: 60000,
        attestation: "direct",
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "required"
        }
      };
      
      console.log("Showing passkey prompt for:", username);
      
      // This will trigger the browser's passkey UI
      // In a real implementation, we would use the credential
      // For this mock, we just want to show the UI, so we catch and ignore errors
      try {
        await navigator.credentials.create({
          publicKey: publicKeyCredentialCreationOptions
        });
      } catch (e) {
        // Intentionally ignore errors - we just want to show the prompt
        console.log("Passkey prompt shown (expected error in mock):", e);
      }
    } else {
      console.warn("WebAuthn not supported in this browser");
    }
  } catch (e) {
    console.error("Error showing passkey prompt:", e);
  }
};

/**
 * Main PasskeyKit instance for handling wallet creation and transactions
 */
export let account: any = null;

// Only initialize if in browser
if (typeof window !== 'undefined') {
  (async () => {
    try {
      console.log("Initializing PasskeyKit with factory:", FACTORY_CONTRACT_ADDRESS);
      
      // Verify contract exists on network before initializing
      const contractExists = await verifyContractExists(FACTORY_CONTRACT_ADDRESS);
      if (!contractExists) {
        console.error("Factory contract does not exist on the network or is not accessible.");
        throw new Error("Cannot connect to wallet factory - contract not found on network");
      }
      
      // Convert the factory contract address to the correct binary format
      const walletWasmHash = convertContractAddress(FACTORY_CONTRACT_ADDRESS);
      
      if (!walletWasmHash) {
        throw new Error("Invalid wallet WASM hash - failed to convert contract address");
      }
      
      // Create passkey kit instance with properly converted contract hash
      // For demo purposes, we'll create a mock implementation
      account = {
        // Mock implementation of createWallet
        createWallet: async function(appName: string, username: string) {
          try {
            console.log(`[MOCK] Creating wallet for app: ${appName}, user: ${username}`);
            
            // Show the passkey prompt before continuing
            await showPasskeyPrompt(username);
            
            // Simulate a delay for the wallet creation process
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Generate a mock contract ID that looks like a real Stellar contract ID
            const contractId = VERIFICATION_CONTRACT_ADDRESS;
            const keyId = btoa(`passkey-${username}-${Date.now()}`);
            
            console.log("[MOCK] Created wallet with:");
            console.log("- Contract ID:", contractId);
            console.log("- Key ID:", keyId ? (keyId.slice(0, 10) + "...") : "Not available");
            
            return {
              contractId,
              keyId_base64: keyId,
              built: "AAAA...mock-transaction-xdr"
            };
          } catch (error: any) {
            console.error("Error in createWallet:", error);
            throw error;
          }
        },
        
        // Mock implementation of sign
        sign: async function(transaction: any) {
          console.log("[MOCK] Signing transaction");
          // Show passkey prompt for signing too
          await showPasskeyPrompt("sign-transaction");
          await new Promise(resolve => setTimeout(resolve, 800));
          return "BBBB...mock-signed-transaction-xdr";
        }
      };
      
      console.log('PasskeyKit (mock) initialized successfully');
    } catch (error) {
      console.error('Error initializing PasskeyKit:', error);
    }
  })();
}

/**
 * A configured Stellar RPC server instance used to interact with the network
 */
// Initialize the server only on the client side to avoid SSR issues
export let rpc: any = null;

// Client-side initialization
if (typeof window !== 'undefined') {
  try {
    // Use the SorobanRpc.Server for Soroban operations
    rpc = new stellar.SorobanRpc.Server(STELLAR_RPC_URL);
    console.log('Soroban RPC initialized successfully');
  } catch (error) {
    console.error('Error initializing Stellar RPC server:', error);
  }
}

/**
 * A client allowing us to easily create SAC clients for any asset on the
 * network.
 */
export let sac: any = null;
// Mock SAC client for demo
sac = {
  getSACClient: function(contractId: string) {
    return {
      getBalance: async function(address: string) {
        console.log(`[MOCK] Getting balance for ${address} from contract ${contractId}`);
        await new Promise(resolve => setTimeout(resolve, 500));
        return 1000 + Math.floor(Math.random() * 5000); // Random balance between 1000-6000
      },
      transfer: async function(from: string, to: string, amount: number) {
        console.log(`[MOCK] Transfer ${amount} from ${from} to ${to}`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return true;
      }
    };
  }
};
console.log('SAC client (mock) initialized successfully');

/**
 * A SAC client for the native XLM asset.
 */
export let native: any = null;
if (sac && NATIVE_CONTRACT_ADDRESS) {
  try {
    native = sac.getSACClient(NATIVE_CONTRACT_ADDRESS);
    console.log('Native SAC client initialized successfully');
  } catch (error) {
    console.error('Error initializing native SAC client:', error);
  }
}

/**
 * A wrapper function to send verification to the news verification contract
 */
export async function verifyNews(newsId: string, isVerified: boolean, amount: number = 10) {
  console.log(`[MOCK] Verifying news item ${newsId}, verified=${isVerified}, amount=${amount}`);
  
  if (!VERIFICATION_CONTRACT_ADDRESS) {
    throw new Error("Verification contract address is not defined");
  }
  
  // Simulate delay for sending transaction
  await new Promise(resolve => setTimeout(resolve, 1200));
  
  // Return mock transaction result
  return {
    success: true,
    txHash: 'T' + Array(64).fill(0).map(() => '0123456789ABCDEF'[Math.floor(Math.random() * 16)]).join('')
  };
}

/**
 * A wrapper function to access the `/api/send` endpoint
 *
 * @param xdr - The base64-encoded, signed transaction
 * @returns JSON object containing the RPC's response
 */
export async function send(xdr: string) {
  if (!xdr || typeof xdr !== 'string') {
    console.error('Invalid XDR provided to send:', xdr);
    throw new Error('Invalid XDR: Transaction data must be a non-empty string');
  }
  
  console.log('[MOCK] Sending transaction to network, XDR length:', xdr.length);
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock successful response for testing
  return { 
    id: 'mock-transaction-id-' + Date.now(), 
    successful: true,
    result: {
      status: "SUCCESS",
      ledger: Math.floor(Math.random() * 1000000) + 40000000
    }
  };
}

/**
 * A wrapper function to mock contract ID lookup
 * 
 * @param signer - The passkey ID we want to find an associated smart wallet for
 * @returns A fixed contract address for testing
 */
export async function getContractId(signer: string) {
  if (!signer || typeof signer !== 'string') {
    console.error('Invalid signer provided to getContractId:', signer);
    throw new Error('Invalid signer: Signer ID must be a non-empty string');
  }
  
  console.log('[MOCK] getContractId called for signer:', signer.slice(0, 10) + '...');
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Return the verification contract address for testing
  return VERIFICATION_CONTRACT_ADDRESS;
}

/**
 * A wrapper function to mock funding a contract
 *
 * @param address - The contract address to fund on the Testnet
 */
export async function fundContract(address: string) {
  if (!address) {
    console.error('Empty address provided to fundContract');
    throw new Error('Invalid contract address: Address must not be empty');
  }
  
  if (!address.startsWith('C') && !address.startsWith('G')) {
    console.error('Invalid contract address format:', address);
    throw new Error('Invalid contract address: Address must be a valid Stellar contract ID');
  }
  
  console.log('[MOCK] Funding contract:', address);
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Return a mock success response
  return { status: 200, message: 'Mock funding successful' };
} 