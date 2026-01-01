/**
 * WalletInfo Component
 * 
 * Displays detailed wallet information including address, balance, and platform.
 * Used in passkey login page to show connected wallet details.
 */

"use client";

import { useState } from "react";
import { useLazorkitWallet } from "@/lib/hooks/useLazorkitWallet";
import { EXPLORER_URLS } from "@/lib/config/lazorkit";
import { useWalletStore } from "@/lib/store/walletStore";
import toast from "react-hot-toast";

export function WalletInfo() {
  const { wallet, smartWalletAddress, balance } = useLazorkitWallet();
  const network = useWalletStore((state) => state.network);
  const [addressCopied, setAddressCopied] = useState(false);

  if (!wallet) return null;

  const explorerUrl = smartWalletAddress
    ? `${EXPLORER_URLS[network]}/address/${smartWalletAddress}${network === "devnet" ? "?cluster=devnet" : ""}`
    : null;

  const copyAddress = async () => {
    if (!smartWalletAddress) return;
    try {
      await navigator.clipboard.writeText(smartWalletAddress);
      setAddressCopied(true);
      toast.success("Address copied to clipboard!");
      setTimeout(() => setAddressCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy address");
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 mb-6">
      <h2 className="text-2xl font-semibold mb-6 text-gray-900">Wallet Information</h2>

      <div className="space-y-6">
        <div>
          <label className="text-xs font-medium text-gray-500 mb-2.5 block uppercase tracking-wide">
            Smart Wallet Address
          </label>
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between gap-4">
              <code className="text-sm font-mono break-all text-gray-900">
                {wallet.smartWallet}
              </code>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={copyAddress}
                  className="text-xs font-medium text-purple-600 hover:text-purple-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-purple-50"
                  title="Copy address"
                >
                  {addressCopied ? "Copied" : "Copy"}
                </button>
                {explorerUrl && (
                  <a
                    href={explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium text-purple-600 hover:text-purple-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-purple-50"
                  >
                    Explorer →
                  </a>
                )}
              </div>
            </div>
          </div>
          <p className="mt-2.5 text-xs text-gray-500">
            This is your Solana wallet address on {network === "mainnet" ? "Mainnet" : "Devnet"}. {network === "devnet" ? "Use this to receive test funds." : "Use this to receive real SOL and tokens."}
          </p>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-500 mb-2.5 block uppercase tracking-wide">
            Balance
          </label>
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-2xl font-bold text-gray-900">
              {balance !== null ? `${balance.toFixed(4)} ` : "Loading..."}
              {balance !== null && <span className="text-lg font-semibold text-gray-600">SOL</span>}
            </p>
          </div>
          {network === "devnet" && (
            <p className="mt-2.5 text-xs text-gray-500">
              This is your Devnet balance. Use test SOL for transactions.
            </p>
          )}
          {network === "mainnet" && (
            <p className="mt-2.5 text-xs text-gray-500">
              This is your Mainnet balance. Use real SOL for transactions.
          </p>
          )}
        </div>

        <div>
          <label className="text-xs font-medium text-gray-500 mb-2.5 block uppercase tracking-wide">
            Platform
          </label>
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-sm font-medium text-gray-900">{wallet.platform}</p>
          </div>
        </div>

        {wallet.accountName && (
          <div>
            <label className="text-xs font-medium text-gray-500 mb-2.5 block uppercase tracking-wide">
              Account Name
            </label>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-sm font-medium text-gray-900">{wallet.accountName}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
