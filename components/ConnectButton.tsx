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
        className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 active:bg-red-100 transition-colors font-medium text-sm"
      >
        Disconnect ({wallet.smartWallet.slice(0, 6)}...)
      </button>
    );
  }

  return (
    <button
      onClick={connect}
      disabled={isConnecting}
      className="px-5 py-2.5 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 active:bg-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {isConnecting ? "Connecting..." : "Sign In with Passkey"}
    </button>
  );
}
