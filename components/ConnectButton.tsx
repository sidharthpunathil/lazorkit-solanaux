/**
 * ConnectButton Component
 * 
 * Reusable button component for wallet connection.
 * Handles passkey authentication flow with loading states.
 */

"use client";

import { useLazorkitWallet } from "@/lib/hooks/useLazorkitWallet";

export function ConnectButton() {
  const { isConnected, isConnecting, wallet, connect, disconnect } =
    useLazorkitWallet();

  if (isConnected && wallet) {
    return (
      <button
        onClick={disconnect}
        className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors font-medium"
      >
        Disconnect ({wallet.smartWallet.slice(0, 6)}...)
      </button>
    );
  }

  return (
    <button
      onClick={connect}
      disabled={isConnecting}
      className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-lg font-semibold hover:from-purple-500 hover:to-purple-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-500/20"
    >
      {isConnecting ? "Connecting..." : "Sign In with Passkey"}
    </button>
  );
}
