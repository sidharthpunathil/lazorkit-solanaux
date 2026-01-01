import { Connection } from "@solana/web3.js";
import { NextRequest, NextResponse } from "next/server";
import { getLazorkitConfig } from "@/lib/config/lazorkit";

export const dynamic = "force-dynamic";

/**
 * API Route: Get Fresh Blockhash
 * 
 * Returns a fresh blockhash and lastValidBlockHeight for creating transactions.
 * This helps avoid TransactionTooOld errors by ensuring we always use the latest blockhash.
 * 
 * Query params:
 * - network: "devnet" | "mainnet" (default: "devnet")
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const network = (searchParams.get("network") || "devnet") as "devnet" | "mainnet";
    
    // Get network-specific RPC URL
    const config = getLazorkitConfig(network);
    const connection = new Connection(config.RPC_URL, "confirmed");
    
    // Get fresh blockhash
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");
    
    return NextResponse.json({
      success: true,
      blockhash,
      lastValidBlockHeight,
      network,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("Error getting fresh blockhash:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}

