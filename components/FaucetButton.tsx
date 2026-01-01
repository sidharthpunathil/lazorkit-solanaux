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
      className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg font-semibold hover:from-green-500 hover:to-green-400 transition-all shadow-lg shadow-green-500/20"
    >
      Get Devnet SOL
    </button>
  );
}

