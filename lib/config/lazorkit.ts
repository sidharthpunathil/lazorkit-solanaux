/**
 * Lazorkit Configuration
 * 
 * Centralized configuration for Lazorkit SDK.
 * Uses environment variables with sensible defaults for Devnet.
 * 
 * Why separate config file?
 * - Single source of truth for all Lazorkit settings
 * - Easy to switch between devnet/mainnet
 * - Type-safe configuration
 */

import type { Network } from "@/lib/store/walletStore";

export const NETWORK_CONFIG = {
  devnet: {
    rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || "https://api.devnet.solana.com",
    portalUrl: process.env.NEXT_PUBLIC_PORTAL_URL || "https://portal.lazor.sh",
    paymasterUrl: process.env.NEXT_PUBLIC_PAYMASTER_URL || "https://kora.devnet.lazorkit.com",
    explorerUrl: "https://explorer.solana.com/?cluster=devnet",
  },
  mainnet: {
    rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || "https://api.mainnet-beta.solana.com",
    portalUrl: process.env.NEXT_PUBLIC_PORTAL_URL || "https://portal.lazor.sh",
    paymasterUrl: process.env.NEXT_PUBLIC_PAYMASTER_URL || "https://kora.mainnet.lazorkit.com",
    explorerUrl: "https://explorer.solana.com",
  },
} as const;

export const getLazorkitConfig = (network: Network = "devnet") => {
  const config = NETWORK_CONFIG[network];
  return {
    RPC_URL: config.rpcUrl,
    PORTAL_URL: config.portalUrl,
    PAYMASTER: {
      paymasterUrl: config.paymasterUrl,
      apiKey: process.env.NEXT_PUBLIC_PAYMASTER_API_KEY,
    },
    EXPLORER_URL: config.explorerUrl,
  };
};

// Default config (for backward compatibility)
export const LAZORKIT_CONFIG = getLazorkitConfig("devnet");

// Devnet USDC mint address (for testing gasless transfers)
export const DEVNET_USDC_MINT = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";

// Solana Explorer URLs
export const EXPLORER_URLS = {
  devnet: "https://explorer.solana.com",
  mainnet: "https://explorer.solana.com",
} as const;

