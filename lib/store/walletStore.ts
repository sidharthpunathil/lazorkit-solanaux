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

interface WalletState {
  // Data
  wallet: WalletInfo | null;
  smartWalletAddress: string | null;
  balance: number | null;

  // Status
  isConnected: boolean;
  isConnecting: boolean;

  // Actions
  setConnecting: (isConnecting: boolean) => void;
  setConnected: (isConnected: boolean) => void;
  setWallet: (wallet: WalletInfo | null) => void;
  setSmartWalletAddress: (address: string | null) => void;
  setBalance: (balance: number | null) => void;
  reset: () => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  // Initial state
  isConnected: false,
  isConnecting: false,
  wallet: null,
  smartWalletAddress: null,
  balance: null,
  
  // Actions
  setConnecting: (isConnecting) => set({ isConnecting }),
  setConnected: (isConnected) => set({ isConnected }),
  setWallet: (wallet) => set({ 
    wallet,
    smartWalletAddress: wallet?.smartWallet || null 
  }),
  setSmartWalletAddress: (address) => set({ smartWalletAddress: address }),
  setBalance: (balance) => set({ balance }),
  
  // Reset all state (useful for disconnect)
  reset: () => set({
    isConnected: false,
    isConnecting: false,
    wallet: null,
    smartWalletAddress: null,
    balance: null,
  }),
}));

