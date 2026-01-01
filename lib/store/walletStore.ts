/**
 * Zustand Store for Wallet State Management
 * 
 * This store manages the global wallet state across the application.
 * It provides a centralized way to access wallet information and connection status
 * without prop drilling.
 * 
 * Why Zustand? 
 * - Lightweight alternative to Redux
 * - Simple API, perfect for wallet state
 * - No boilerplate, works great with TypeScript
 * - Better performance than Context API for frequently updated state
 */

import { create } from "zustand";
import { WalletInfo } from "@lazorkit/wallet";

export type Network = "devnet" | "mainnet";

interface WalletState {
  // Data
  wallet: WalletInfo | null;
  smartWalletAddress: string | null;
  balance: number | null;
  network: Network;

  // Status
  isConnected: boolean;
  isConnecting: boolean;

  // Actions
  setConnecting: (isConnecting: boolean) => void;
  setConnected: (isConnected: boolean) => void;
  setWallet: (wallet: WalletInfo | null) => void;
  setSmartWalletAddress: (address: string | null) => void;
  setBalance: (balance: number | null) => void;
  setNetwork: (network: Network) => void;
  reset: () => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  // Initial state - always start with devnet to avoid hydration mismatch
  // Will sync with localStorage after mount on client side
  isConnected: false,
  isConnecting: false,
  wallet: null,
  smartWalletAddress: null,
  balance: null,
  network: "devnet",
  
  // Actions
  setConnecting: (isConnecting) => set({ isConnecting }),
  setConnected: (isConnected) => set({ isConnected }),
  setWallet: (wallet) => set({ 
    wallet,
    smartWalletAddress: wallet?.smartWallet || null 
  }),
  setSmartWalletAddress: (address) => set({ smartWalletAddress: address }),
  setBalance: (balance) => set({ balance }),
  setNetwork: (network) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("solana-network", network);
    }
    set({ network });
  },
  
  // Reset all state (useful for disconnect)
  reset: () => set({
    isConnected: false,
    isConnecting: false,
    wallet: null,
    smartWalletAddress: null,
    balance: null,
    // Keep network setting on reset
  }),
}));

