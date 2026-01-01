/**
 * TransactionStatus Component
 * 
 * Displays transaction status and explorer link.
 * Reusable component for showing transaction results.
 */

"use client";

import { EXPLORER_URLS } from "@/lib/config/lazorkit";

interface TransactionStatusProps {
  signature: string | null;
  message?: string;
}

export function TransactionStatus({
  signature,
  message = "Transaction Successful",
}: TransactionStatusProps) {
  if (!signature) return null;

  const explorerUrl = `${EXPLORER_URLS.devnet}/tx/${signature}?cluster=devnet`;

  return (
    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-green-400 mb-2">{message}</h3>
      <p className="text-sm text-green-400/80 mb-3">
        Signature: <code className="font-mono text-green-300">{signature}</code>
      </p>
      <a
        href={explorerUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-green-400 hover:text-green-300 underline text-sm font-medium transition-colors"
      >
        View on Solana Explorer →
      </a>
    </div>
  );
}
