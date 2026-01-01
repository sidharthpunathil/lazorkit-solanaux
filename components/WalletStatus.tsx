/**
 * WalletStatus Component
 * 
 * Displays connected wallet information including full address and balance.
 * Reusable component for showing wallet state across the application.
 */

"use client";

import { useState } from "react";
import { useLazorkitWallet } from "@/lib/hooks/useLazorkitWallet";
import { useWalletStore } from "@/lib/store/walletStore";
import { FaucetButton } from "./FaucetButton";
import toast from "react-hot-toast";

export function WalletStatus() {
  const { isConnected, smartWalletAddress, balance } = useLazorkitWallet();
  const network = useWalletStore((state) => state.network);
  const [showFullAddress, setShowFullAddress] = useState(false);

  if (!isConnected || !smartWalletAddress) return null;

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(smartWalletAddress);
      toast.success("Address copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy address");
    }
  };

  return (
    <div className="mb-8 p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between gap-6">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-500 mb-2.5 uppercase tracking-wide">Smart Wallet Address</p>
          <div className="flex items-center gap-2 flex-wrap">
            <code className="text-sm font-mono text-gray-900 break-all bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                {showFullAddress ? smartWalletAddress : `${smartWalletAddress.slice(0, 8)}...${smartWalletAddress.slice(-8)}`}
              </code>
              <button
                onClick={() => setShowFullAddress(!showFullAddress)}
              className="text-xs font-medium text-purple-600 hover:text-purple-700 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-purple-50"
                title={showFullAddress ? "Show shortened" : "Show full address"}
              >
                {showFullAddress ? "Hide" : "Show Full"}
              </button>
              <button
                onClick={copyAddress}
              className="text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-gray-100"
                title="Copy address"
              >
                Copy
              </button>
            </div>
          </div>
          {balance !== null && (
          <div className="flex-shrink-0">
            <p className="text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide text-right">Balance</p>
            <div className="flex items-center justify-end gap-3">
              <p className="text-2xl font-bold text-gray-900">
                {balance.toFixed(4)} <span className="text-lg font-semibold text-gray-600">SOL</span>
              </p>
              {network === "devnet" && <FaucetButton />}
            </div>
            </div>
          )}
      </div>
    </div>
  );
}
