/**
 * Token Swap Page
 * 
 * Demonstrates token swapping using Jupiter Aggregator with gasless execution.
 * 
 * Key Features:
 * - Find best swap routes across all Solana DEXs
 * - Real-time price quotes
 * - Gasless swap execution
 * - Support for SOL, USDC, USDT, and more
 * 
 * Why Jupiter?
 * - Aggregates liquidity from all major DEXs (Raydium, Orca, etc.)
 * - Finds optimal routes (single or multi-hop)
 * - Best prices guaranteed
 * - Simple API integration
 */

"use client";

import { Navigation, SwapInterface, TransactionStatus, InfoCard } from "@/components";
import { useLazorkitWallet } from "@/lib/hooks/useLazorkitWallet";
import { useTokenSwap } from "@/lib/hooks/useTokenSwap";

export default function TokenSwapPage() {
  const { isConnected } = useLazorkitWallet();
  const { lastSwapSignature } = useTokenSwap();

  return (
    <div className="min-h-screen px-6 py-12 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Navigation />

        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-4 text-foreground">Token Swap</h1>
          <p className="text-muted-foreground text-lg">
            Swap tokens on Solana using Jupiter aggregator. Get the best prices across
            all DEXs, executed gaslessly.
          </p>
        </div>

        {!isConnected ? (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-6">
            <p className="text-yellow-400">
              Please connect your wallet first.{" "}
              <a href="/passkey-login" className="text-yellow-300 hover:text-yellow-200 underline transition-colors">
                Go to Passkey Login →
              </a>
            </p>
          </div>
        ) : (
          <>
            <SwapInterface />

            {lastSwapSignature && (
              <TransactionStatus
                signature={lastSwapSignature}
                message="Swap Successful"
              />
            )}

            <InfoCard
              title="About Jupiter Aggregator"
              items={[
                "Aggregates liquidity from all major Solana DEXs (Raydium, Orca, Meteora, etc.)",
                "Finds the best swap route automatically (single or multi-hop)",
                "Real-time price quotes with slippage protection",
                "Gasless execution via Lazorkit paymaster",
              ]}
            />
          </>
        )}
      </div>
    </div>
  );
}
