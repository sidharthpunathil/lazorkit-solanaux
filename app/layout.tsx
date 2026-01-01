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

import { LazorkitProvider } from "@lazorkit/wallet";
import { Toaster } from "react-hot-toast";
import { LAZORKIT_CONFIG } from "@/lib/config/lazorkit";
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-foreground antialiased">
        {/* Lazorkit Provider - Wraps entire app for wallet access */}
        <LazorkitProvider
          rpcUrl={LAZORKIT_CONFIG.RPC_URL}
          portalUrl={LAZORKIT_CONFIG.PORTAL_URL}
          paymasterConfig={LAZORKIT_CONFIG.PAYMASTER}
        >
          {children}
          {/* Toast notifications for user feedback */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#1a1a1a",
                color: "#ededed",
                border: "1px solid #2a2a2a",
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: "#4ade80",
                  secondary: "#1a1a1a",
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: "#ef4444",
                  secondary: "#1a1a1a",
                },
              },
            }}
          />
        </LazorkitProvider>
      </body>
    </html>
  );
}
