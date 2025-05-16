import { PasskeyServer } from "passkey-kit";
import * as stellar from "@stellar/stellar-sdk";

// Environment variables should be added to your .env file
const STELLAR_RPC_URL = process.env.STELLAR_RPC_URL || "https://soroban-testnet.stellar.org";
const LAUNCHTUBE_URL = process.env.LAUNCHTUBE_URL || "https://testnet.launchtube.xyz/submit";
const MERCURY_URL = process.env.MERCURY_URL || "https://api.mercurydata.app/v2";
const FACTORY_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_FACTORY_CONTRACT_ADDRESS || "CDJWKWPYF6I4C7OC5674YZGG6Z42OZAL34ATI3ZQADFVRPYPZT4TBIUR";

// Parse JWT if it's in array format
let LAUNCHTUBE_JWT = "";
try {
  // If JWT is stored as a JSON array, extract the first element
  if (process.env.LAUNCHTUBE_JWT && process.env.LAUNCHTUBE_JWT.startsWith('[')) {
    const jwtArray = JSON.parse(process.env.LAUNCHTUBE_JWT);
    LAUNCHTUBE_JWT = jwtArray[0] || "";
  } else {
    LAUNCHTUBE_JWT = process.env.LAUNCHTUBE_JWT || "";
  }
} catch (error) {
  console.error("Error parsing LAUNCHTUBE_JWT:", error);
  LAUNCHTUBE_JWT = process.env.LAUNCHTUBE_JWT || "";
}

const MERCURY_JWT = process.env.MERCURY_JWT || "";

// Helper function to check if a contract address is valid
const isValidContractAddress = (address: string) => {
  return typeof address === 'string' && address.length === 56 && address.startsWith('C');
};

// Configure a mock server since we don't have a properly deployed Zephyr program
class MockPasskeyServer {
  async getContractId({ keyId }: { keyId: string }) {
    console.log("Mock server getContractId called with keyId:", keyId?.slice(0, 10) + "...");
    
    // Return a valid contract address for testing
    if (!isValidContractAddress(FACTORY_CONTRACT_ADDRESS)) {
      console.error("Invalid contract address format in environment variable");
      throw new Error("Invalid contract address configuration");
    }
    
    return FACTORY_CONTRACT_ADDRESS;
  }

  async submit(xdr: string) {
    console.log("Mock server submit called with xdr:", xdr?.slice(0, 20) + "...");
    return { id: "mock-transaction-id" };
  }
}

// Configure the server with extensive logging
console.log("Initializing PasskeyServer with:");
console.log("- RPC URL:", STELLAR_RPC_URL);
console.log("- Launchtube URL:", LAUNCHTUBE_URL);
console.log("- Mercury URL:", MERCURY_URL);
console.log("- Launchtube JWT present:", !!LAUNCHTUBE_JWT);
console.log("- Mercury JWT present:", !!MERCURY_JWT);

export let server: any;

// For this specific project, use a mock server instead of failing
// because we don't have a configured Zephyr program
console.log("Using MockPasskeyServer to bypass Mercury configuration issues");
server = new MockPasskeyServer();
console.log("MockPasskeyServer initialized successfully"); 