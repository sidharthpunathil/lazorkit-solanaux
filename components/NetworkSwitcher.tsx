/**
 * NetworkSwitcher Component
 * 
 * Allows users to switch between Solana Devnet and Mainnet.
 * Updates the global network state and persists to localStorage.
 */

"use client";

import { useEffect } from "react";
import { useWalletStore, type Network } from "@/lib/store/walletStore";

export function NetworkSwitcher() {
  const network = useWalletStore((state) => state.network);
  const setNetwork = useWalletStore((state) => state.setNetwork);

  // Sync with localStorage after mount to avoid hydration mismatch
  useEffect(() => {
    const saved = localStorage.getItem("solana-network");
    if (saved === "mainnet" || saved === "devnet") {
      setNetwork(saved);
    }
  }, [setNetwork]);

  const handleNetworkChange = (newNetwork: Network) => {
    if (newNetwork !== network) {
      const confirmed = window.confirm(
        `Switch to ${newNetwork === "mainnet" ? "Mainnet" : "Devnet"}? ` +
        `This will change the network for all operations. ` +
        `${newNetwork === "mainnet" ? "You'll be using real SOL and tokens." : "You'll be using test tokens."}`
      );
      
      if (confirmed) {
        setNetwork(newNetwork);
        // Reload the page to reinitialize with new network
        window.location.reload();
      }
    }
  };

  return (
    <div className="relative inline-flex items-center gap-2.5">
      <button
        onClick={() => handleNetworkChange(network === "devnet" ? "mainnet" : "devnet")}
        className={`group relative inline-flex h-7 w-14 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:ring-offset-2 ${
          network === "mainnet"
            ? "bg-green-600"
            : "bg-blue-600"
        }`}
        role="switch"
        aria-checked={network === "mainnet"}
        aria-label={`Switch to ${network === "devnet" ? "mainnet" : "devnet"}`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition-all duration-300 ease-in-out ${
            network === "mainnet" ? "translate-x-8" : "translate-x-1"
          } group-hover:shadow-lg`}
        />
      </button>
      <div className="flex flex-col">
        <span className="text-xs font-semibold text-foreground leading-none">
          {network === "mainnet" ? "Mainnet" : "Devnet"}
        </span>
        <span className="text-[10px] text-muted-foreground leading-none mt-0.5">
          {network === "mainnet" ? "Production" : "Testnet"}
        </span>
      </div>
    </div>
  );
}

