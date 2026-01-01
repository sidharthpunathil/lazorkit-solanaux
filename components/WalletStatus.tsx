/**
 * WalletStatus Component
 * 
 * Displays connected wallet information including full address and balance.
 * Reusable component for showing wallet state across the application.
 */

"use client";

import { useState } from "react";
import { useLazorkitWallet } from "@/lib/hooks/useLazorkitWallet";
import toast from "react-hot-toast";

export function WalletStatus() {
  const { isConnected, smartWalletAddress, balance } = useLazorkitWallet();
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
    <div className="mb-8 p-5 bg-card rounded-lg border border-border shadow-sm">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-2">Smart Wallet Address</p>
            <div className="flex items-center gap-2">
              <code className="text-sm font-mono text-foreground break-all">
                {showFullAddress ? smartWalletAddress : `${smartWalletAddress.slice(0, 8)}...${smartWalletAddress.slice(-8)}`}
              </code>
              <button
                onClick={() => setShowFullAddress(!showFullAddress)}
                className="text-xs text-accent hover:text-purple-400 transition-colors px-2 py-1 rounded"
                title={showFullAddress ? "Show shortened" : "Show full address"}
              >
                {showFullAddress ? "Hide" : "Show Full"}
              </button>
              <button
                onClick={copyAddress}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded"
                title="Copy address"
              >
                Copy
              </button>
            </div>
          </div>
          {balance !== null && (
            <div className="text-right ml-4">
              <p className="text-sm text-muted-foreground mb-1">Balance</p>
              <p className="text-lg font-semibold text-foreground">
                {balance.toFixed(4)} SOL
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
