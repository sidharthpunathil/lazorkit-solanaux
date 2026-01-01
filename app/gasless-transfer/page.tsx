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
    lastTransaction,
  } = useGaslessTransfer();

  return (
    <div className="min-h-screen px-6 py-12 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Navigation />

        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-4 text-gray-900">Gasless Transfer</h1>
          <p className="text-gray-600 text-lg">
            Send SOL or USDC without holding SOL for fees. Powered by Lazorkit's
            paymaster service.
          </p>
          <div className="mt-4">
            <a
              href="/docs/tutorials/gasless-tx.html"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors"
            >
              <span>View detailed documentation</span>
              <span>→</span>
            </a>
          </div>
        </div>

        {!isConnected ? (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
            <p className="text-amber-700">
              Please connect your wallet first.{" "}
              <a href="/passkey-login" className="text-amber-600 hover:text-amber-800 underline transition-colors font-medium">
                Go to Passkey Login →
              </a>
            </p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold mb-3 text-gray-900">Your Wallet</h2>
              <p className="text-sm text-gray-600 font-mono mb-2">
                {smartWalletAddress?.slice(0, 16)}...{smartWalletAddress?.slice(-8)}
              </p>
              {balance !== null && (
                <p className="text-2xl font-bold text-gray-900">{balance.toFixed(4)} <span className="text-lg font-semibold text-gray-600">SOL</span></p>
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

            {lastSignature && (
              <TransactionStatus 
                signature={lastSignature} 
                transaction={lastTransaction || undefined}
              />
            )}

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
