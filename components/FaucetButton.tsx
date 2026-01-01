/**
 * FaucetButton Component
 * 
 * Provides quick access to Solana Devnet faucets for funding test wallets.
 * Opens the official Solana faucet with the wallet address pre-filled.
 */

"use client";

import { useLazorkitWallet } from "@/lib/hooks/useLazorkitWallet";
import toast from "react-hot-toast";

export function FaucetButton() {
  const { smartWalletAddress, isConnected } = useLazorkitWallet();

  const handleFaucet = () => {
    if (!isConnected || !smartWalletAddress) {
      toast.error("Please connect your wallet first");
      return;
    }

    // Open Solana faucet with address pre-filled
    const faucetUrl = `https://faucet.solana.com/?address=${smartWalletAddress}`;
    window.open(faucetUrl, "_blank", "noopener,noreferrer");
    toast.success("Opening Solana faucet...");
  };

  if (!isConnected) return null;

  return (
    <button
      onClick={handleFaucet}
      className="px-3 py-1.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 active:bg-green-800 transition-colors text-sm"
    >
      Get Devnet SOL
    </button>
  );
}

