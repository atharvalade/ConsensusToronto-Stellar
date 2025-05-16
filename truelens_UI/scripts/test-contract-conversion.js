/**
 * Script to test the contract address conversion
 * 
 * Run with: node scripts/test-contract-conversion.js
 */

const { StrKey } = require('@stellar/stellar-sdk');

// Example factory contract address from environment
const FACTORY_CONTRACT_ADDRESS = "CDJWKWPYF6I4C7OC5674YZGG6Z42OZAL34ATI3ZQADFVRPYPZT4TBIUR";

// Validate contract address format
function isValidContractAddress(address) {
  return typeof address === 'string' && address.length === 56 && address.startsWith('C');
}

// Convert contract address to binary format
function convertContractAddress(contractAddress) {
  if (!contractAddress || !isValidContractAddress(contractAddress)) {
    console.error("Invalid contract address:", contractAddress);
    return null;
  }
  
  try {
    console.log("Converting contract address:", contractAddress);
    const contractBuffer = StrKey.decodeContract(contractAddress);
    console.log("Converted to buffer:", contractBuffer);
    console.log("Buffer length:", contractBuffer.length, "bytes"); // Should be 32 bytes
    return contractBuffer;
  } catch (error) {
    console.error("Error converting contract address:", error);
    return null;
  }
}

// Test the conversion
console.log("Running contract address conversion test");

const validAddress = FACTORY_CONTRACT_ADDRESS;
const invalidAddress = "INVALID_ADDRESS";
const malformedAddress = "C123456789";

console.log("\nTesting valid address:", validAddress);
const validResult = convertContractAddress(validAddress);
console.log("Valid result:", validResult ? "Success" : "Failure");

console.log("\nTesting invalid address:", invalidAddress);
const invalidResult = convertContractAddress(invalidAddress);
console.log("Invalid result:", invalidResult ? "Success (unexpected)" : "Failed as expected");

console.log("\nTesting malformed address:", malformedAddress);
const malformedResult = convertContractAddress(malformedAddress);
console.log("Malformed result:", malformedResult ? "Success (unexpected)" : "Failed as expected");

console.log("\nTest completed"); 