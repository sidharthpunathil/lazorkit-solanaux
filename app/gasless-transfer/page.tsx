/**
 * Gasless Transfer Page
 * 
 * Demonstrates gasless token transfers using Lazorkit's paymaster.
 * 
 * Key Features:
 * - Send SOL without holding SOL for fees
 * - Send USDC (or any SPL token) gaslessly
 * - Pay fees in USDC instead of SOL
 * - Real-time transaction status
 * 
 * Why Gasless?
 * - Better UX: Users don't need to manage SOL for fees
 * - Onboarding: New users can transact immediately
 * - Flexibility: Pay fees in any token (e.g., USDC)
 */

"use client";

import { Navigation, TransferForm, TransactionStatus, InfoCard } from "@/components";
import { useLazorkitWallet } from "@/lib/hooks/useLazorkitWallet";
import { useGaslessTransfer } from "@/lib/hooks/useGaslessTransfer";

export default function GaslessTransferPage() {
  const { isConnected, smartWalletAddress, balance } = useLazorkitWallet();
  const {
    transferSOL,
    transferToken,
    isTransferring,
    lastSignature,
  } = useGaslessTransfer();

  return (
    <div className="min-h-screen px-6 py-12 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Navigation />

        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-4 text-foreground">Gasless Transfer</h1>
          <p className="text-muted-foreground text-lg">
            Send SOL or USDC without holding SOL for fees. Powered by Lazorkit's
            paymaster service.
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
            <div className="bg-card rounded-lg border border-border shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold mb-2 text-foreground">Your Wallet</h2>
              <p className="text-sm text-muted-foreground font-mono mb-2">
                {smartWalletAddress?.slice(0, 16)}...{smartWalletAddress?.slice(-8)}
              </p>
              {balance !== null && (
                <p className="text-lg font-semibold text-foreground">{balance.toFixed(4)} SOL</p>
              )}
            </div>

            <TransferForm
              type="SOL"
              transferSOL={transferSOL}
              isTransferring={isTransferring}
            />
            <TransferForm
              type="USDC"
              transferToken={transferToken}
              isTransferring={isTransferring}
            />

            {lastSignature && <TransactionStatus signature={lastSignature} />}

            <InfoCard
              title="How Gasless Transactions Work"
              items={[
                "Lazorkit's paymaster service sponsors the transaction fees",
                "You can pay fees in SOL or USDC (or other tokens if configured)",
                "No need to maintain a SOL balance just for transaction fees",
                "Perfect for onboarding new users who only hold stablecoins",
              ]}
            />
          </>
        )}
      </div>
    </div>
  );
}
