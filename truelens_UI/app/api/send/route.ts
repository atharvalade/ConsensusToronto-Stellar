import { server } from "@/lib/server/passkeyServer";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { xdr } = await request.json();
    if (!xdr) {
      return NextResponse.json({ error: "Missing XDR parameter" }, { status: 400 });
    }
    
    console.log("Received XDR to submit:", xdr.slice(0, 50) + "...");
    
    // Use submit method instead of send (which doesn't exist in PasskeyServer)
    const res = await server.submit(xdr);
    
    console.log("Transaction submitted successfully");
    return NextResponse.json(res);
  } catch (error) {
    console.error("Error sending transaction:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
} 