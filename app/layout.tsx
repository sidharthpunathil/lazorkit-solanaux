/**
 * Root Layout Component
 * 
 * Sets up the app with:
 * - LazorkitProvider for wallet context
 * - Buffer polyfills (required for Solana SDK)
 * - Toast notifications
 * - Global styles
 */

"use client";

import type { ReactNode } from "react";
import { LazorkitProvider } from "@lazorkit/wallet";
import { Toaster } from "react-hot-toast";
import { getLazorkitConfig } from "@/lib/config/lazorkit";
import { useWalletStore } from "@/lib/store/walletStore";
import "./globals.css";

// Polyfill Buffer for client-side (required for Solana SDK)
if (typeof window !== "undefined") {
  window.Buffer = window.Buffer || require("buffer").Buffer;
  
  // Suppress 429 (rate limit) console errors from Solana RPC retries
  // These are expected with public RPC endpoints and don't indicate real errors
  const originalError = console.error;
  console.error = (...args: any[]) => {
    const message = args.join(" ");
    // Filter out 429 rate limit retry messages
    if (
      message.includes("429") &&
      (message.includes("Retrying") || message.includes("Server responded"))
    ) {
      // Silently ignore - these are expected with public RPC endpoints
      return;
    }
    // Log all other errors normally
    originalError.apply(console, args);
  };
}

// Separate component to use hooks (can't use hooks directly in layout)
function LazorkitProviderWrapper({ children }: { children: ReactNode }) {
  const network = useWalletStore((state) => state.network);
  const config = getLazorkitConfig(network);
  
  // Type assertion needed due to React type version mismatch between project and SDK
  return (
    <LazorkitProvider
      key={network} // Force remount when network changes
      rpcUrl={config.RPC_URL}
      portalUrl={config.PORTAL_URL}
      paymasterConfig={config.PAYMASTER}
    >
      {children as any}
    </LazorkitProvider>
  );
}

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased">
        {/* Lazorkit Provider - Wraps entire app for wallet access */}
        <LazorkitProviderWrapper>
          {children}
          {/* Toast notifications for user feedback */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#ffffff",
                color: "#1a1a1a",
                border: "1px solid #e5e5e5",
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: "#4ade80",
                  secondary: "#ffffff",
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: "#ef4444",
                  secondary: "#ffffff",
                },
              },
            }}
          />
        </LazorkitProviderWrapper>
      </body>
    </html>
  );
}
