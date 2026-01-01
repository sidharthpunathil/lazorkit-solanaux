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
import { FaucetButton } from "./FaucetButton";
import toast from "react-hot-toast";

export function WalletInfo() {
  const { wallet, smartWalletAddress, balance } = useLazorkitWallet();
  const [addressCopied, setAddressCopied] = useState(false);

  if (!wallet) return null;

  const explorerUrl = smartWalletAddress
    ? `${EXPLORER_URLS.devnet}/address/${smartWalletAddress}?cluster=devnet`
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
    <div className="bg-card rounded-lg border border-border shadow-sm p-6 mb-6">
      <h2 className="text-2xl font-semibold mb-6 text-foreground">Wallet Information</h2>

      <div className="space-y-5">
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            Smart Wallet Address (Full)
          </label>
          <div className="p-3 bg-background rounded-lg border border-border">
            <div className="flex items-center justify-between gap-4">
              <code className="text-sm font-mono break-all text-foreground">
                {wallet.smartWallet}
              </code>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={copyAddress}
                  className="text-accent hover:text-purple-400 text-sm font-medium transition-colors px-2 py-1 rounded"
                  title="Copy address"
                >
                  {addressCopied ? "Copied" : "Copy"}
                </button>
                {explorerUrl && (
                  <a
                    href={explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:text-purple-400 text-sm font-medium transition-colors"
                  >
                    Explorer →
                  </a>
                )}
              </div>
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            This is your Solana wallet address on Devnet. Use this to receive test funds.
          </p>
        </div>

        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            Balance
          </label>
          <div className="p-3 bg-background rounded-lg border border-border flex items-center justify-between">
            <p className="text-2xl font-semibold text-foreground">
              {balance !== null ? `${balance.toFixed(4)} SOL` : "Loading..."}
            </p>
            <FaucetButton />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Need test SOL? Click the button above to get free Devnet SOL from the faucet.
          </p>
        </div>


        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            Platform
          </label>
          <div className="p-3 bg-background rounded-lg border border-border">
            <p className="text-sm text-foreground">{wallet.platform}</p>
          </div>
        </div>

        {wallet.accountName && (
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Account Name
            </label>
            <div className="p-3 bg-background rounded-lg border border-border">
              <p className="text-sm text-foreground">{wallet.accountName}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
