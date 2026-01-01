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

export const LAZORKIT_CONFIG = {
  // Solana RPC URL - Use Devnet by default
  // ⚠️ Public RPC endpoints are rate-limited (429 errors are common)
  // For production, use your own RPC endpoint:
  // - Helius: https://www.helius.dev/
  // - QuickNode: https://www.quicknode.com/
  // - Triton: https://triton.one/
  // - Or self-hosted RPC node
  RPC_URL: process.env.NEXT_PUBLIC_RPC_URL || "https://api.devnet.solana.com",
  
  // Lazorkit Portal URL - Authentication portal
  // Usually don't need to change this unless self-hosting
  PORTAL_URL: process.env.NEXT_PUBLIC_PORTAL_URL || "https://portal.lazor.sh",
  
  // Paymaster Configuration - Handles gas sponsorship
  // This enables gasless transactions!
  PAYMASTER: {
    paymasterUrl: process.env.NEXT_PUBLIC_PAYMASTER_URL || "https://kora.devnet.lazorkit.com",
    // Optional: API key if your paymaster requires authentication
    apiKey: process.env.NEXT_PUBLIC_PAYMASTER_API_KEY,
  },
} as const;

// Devnet USDC mint address (for testing gasless transfers)
export const DEVNET_USDC_MINT = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";

// Solana Explorer URLs
export const EXPLORER_URLS = {
  devnet: "https://explorer.solana.com",
  mainnet: "https://explorer.solana.com",
} as const;

