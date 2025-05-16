import { server } from "@/lib/server/passkeyServer";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: {
    signer: string;
  };
}

const isValidContractAddress = (address: string) => {
  return typeof address === 'string' && address.length === 56 && address.startsWith('C');
};

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    if (!params.signer) {
      console.error("Missing signer parameter in request");
      return NextResponse.json({ error: "Missing signer parameter" }, { status: 400 });
    }
    
    console.log("Getting contract ID for signer:", params.signer.slice(0, 10) + "...");
    
    const contractId = await server.getContractId({
      keyId: params.signer
    });
    
    // Validate the returned contract ID
    if (!isValidContractAddress(contractId)) {
      console.warn("Warning: Invalid contract ID format returned from server:", contractId);
    }
    
    console.log("Found contract ID:", contractId);
    
    // Return as plain text for easier handling
    return new NextResponse(contractId);
  } catch (error) {
    console.error("Error getting contract ID:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
} 