// API utilities for communicating with the Stellar backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Types
interface RegisterOptions {
  username: string;
}

interface AuthOptions {
  username: string;
}

interface AccountInfo {
  publicKey: string;
  sequence: string;
  balances: Array<{
    asset: string;
    balance: string;
  }>;
}

interface TransactionOperation {
  type: 'payment' | 'createAccount' | 'changeTrust';
  destination?: string;
  asset?: string;
  amount?: string;
  [key: string]: any;
}

interface NewsDetails {
  title?: string;
  source?: string;
  date?: string;
  summary?: string;
  ipfsHash?: string;
}

// Passkey functions

// Generate registration options
export async function generateRegistrationOptions(options: RegisterOptions): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/passkey/register/options`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to generate registration options: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error generating registration options:', error);
    throw error;
  }
}

// Verify registration
export async function verifyRegistration(username: string, registrationResponse: any): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/passkey/register/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        registrationResponse
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to verify registration: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error verifying registration:', error);
    throw error;
  }
}

// Generate authentication options
export async function generateAuthenticationOptions(options: AuthOptions): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/passkey/login/options`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to generate authentication options: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error generating authentication options:', error);
    throw error;
  }
}

// Verify authentication
export async function verifyAuthentication(username: string, authenticationResponse: any): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/passkey/login/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        authenticationResponse
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to verify authentication: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error verifying authentication:', error);
    throw error;
  }
}

// Stellar functions

// Get account information
export async function getAccountInfo(publicKey: string): Promise<AccountInfo> {
  try {
    const response = await fetch(`${API_BASE_URL}/stellar/account/${publicKey}`);
    
    if (!response.ok) {
      throw new Error(`Failed to get account info: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting account info:', error);
    throw error;
  }
}

// Create a transaction
export async function createTransaction(
  sourcePublicKey: string, 
  operations: TransactionOperation[]
): Promise<{ transactionXdr: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/stellar/transaction/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sourcePublicKey,
        operations
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create transaction: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }
}

// Submit a signed transaction
export async function submitTransaction(
  signedTransactionXdr: string
): Promise<{ hash: string; ledger: number; fee: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/stellar/transaction/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        signedTransactionXdr
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to submit transaction: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error submitting transaction:', error);
    throw error;
  }
}

// Verify news
export async function verifyNews(
  publicKey: string,
  newsId: number,
  choice: 'verify' | 'flag',
  newsDetails?: NewsDetails
): Promise<{ transactionXdr: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/stellar/verify-news`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        publicKey,
        newsId,
        choice,
        newsDetails
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create news verification transaction: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating news verification transaction:', error);
    throw error;
  }
}

// Stake XLM
export async function stakeXLM(
  publicKey: string,
  amount: number
): Promise<{ transactionXdr: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/stellar/stake`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        publicKey,
        amount
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create staking transaction: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating staking transaction:', error);
    throw error;
  }
} 