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
    <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-6">
      <h3 className="text-lg font-semibold text-green-700 mb-3">{message}</h3>
      <p className="text-sm text-green-600 mb-4">
        Signature: <code className="font-mono text-green-700 bg-green-100 px-2 py-1 rounded-lg">{signature}</code>
      </p>
      <a
        href={explorerUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-green-700 hover:text-green-800 transition-colors"
      >
        View on Solana Explorer
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </a>
    </div>
  );
}
