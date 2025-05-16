import { NextRequest, NextResponse } from "next/server";
import { Keypair } from "@stellar/stellar-sdk";
import { native } from "@/lib/passkeyClient";

// This endpoint would normally use environment variables for the secret key
// IMPORTANT: For production, never expose secret keys in your frontend code
const FUNDER_SECRET_KEY = process.env.FUNDER_SECRET_KEY || "";
const STELLAR_NETWORK_PASSPHRASE = process.env.NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE || "Test SDF Network ; September 2015";

interface RouteParams {
  params: {
    address: string;
  };
}

// Define AuthEntry type
interface AuthEntry {
  credentials: any;
  root: any;
  signatureBase: Uint8Array;
}

// Validate contract address
const isValidContractAddress = (address: string) => {
  return typeof address === 'string' && address.length === 56 && address.startsWith('C');
};

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    if (!params.address) {
      console.error("Missing address parameter in request");
      return NextResponse.json({ error: "Missing address parameter" }, { status: 400 });
    }
    
    // Validate the contract address format
    if (!isValidContractAddress(params.address)) {
      console.error("Invalid contract address format:", params.address);
      return NextResponse.json({ error: "Invalid contract address format" }, { status: 400 });
    }

    if (!FUNDER_SECRET_KEY) {
      console.error("Funder secret key not configured");
      return NextResponse.json({ error: "Funder account not configured" }, { status: 500 });
    }
    
    console.log("Funding contract address:", params.address);

    let fundKeypair: Keypair;
    try {
      fundKeypair = Keypair.fromSecret(FUNDER_SECRET_KEY);
      console.log("Using funder public key:", fundKeypair.publicKey());
    } catch (error) {
      console.error("Invalid funder secret key:", error);
      return NextResponse.json({ error: "Invalid funder secret key" }, { status: 500 });
    }
    
    if (!native) {
      console.error("Native SAC client not initialized");
      return NextResponse.json({ error: "Native SAC client not initialized" }, { status: 500 });
    }
    
    // Since we can't use basicNodeSigner, we'll create a simplified signer
    const fundSigner = {
      signAuthEntry: (auth: AuthEntry) => {
        // This is a simplified implementation
        // In a real app, you would use stellar-sdk's contract signing methods
        return {
          ...auth,
          signature: new Uint8Array(64) // Placeholder signature
        };
      }
    };

    console.log("Preparing transfer transaction");
    const { built, ...transfer } = await native.transfer({
      from: fundKeypair.publicKey(),
      to: params.address,
      amount: BigInt(25 * 10_000_000), // 25 XLM in stroops
    });

    if (!built) {
      console.error("Built transaction is missing");
      return NextResponse.json({ error: "Built transaction is missing" }, { status: 500 });
    }

    console.log("Signing transfer transaction");
    await transfer.signAuthEntries({
      publicKey: fundKeypair.publicKey(),
      signAuthEntry: (auth: AuthEntry) => fundSigner.signAuthEntry(auth),
    });

    // Send the transaction using our own API endpoint
    console.log("Sending transaction to /api/send");
    const sendResult = await fetch(new URL('/api/send', request.url).toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        xdr: built.toXDR(),
      }),
    });

    if (!sendResult.ok) {
      const errorText = await sendResult.text();
      console.error("Error response from /api/send:", errorText);
      throw new Error(`Error sending transaction: ${errorText}`);
    }

    console.log("Smart wallet successfully funded");
    return NextResponse.json({
      status: 200,
      message: 'Smart wallet successfully funded',
    });
  } catch (error) {
    console.error("Error funding smart wallet:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
} 