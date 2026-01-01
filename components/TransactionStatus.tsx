/**
 * TransactionStatus Component
 * 
 * Displays transaction status and explorer link with detailed information.
 * Reusable component for showing transaction results.
 */

"use client";

import { EXPLORER_URLS } from "@/lib/config/lazorkit";

interface TransactionStatusProps {
  signature: string | null;
  message?: string;
  transaction?: {
    type: "SOL" | "USDC";
    amount: number;
    recipient: string;
    network: "devnet" | "mainnet";
  } | null;
}

export function TransactionStatus({
  signature,
  message = "Transaction Successful",
  transaction,
}: TransactionStatusProps) {
  if (!signature) return null;

  const network = transaction?.network || "devnet";
  const explorerUrl = network === "mainnet"
    ? `${EXPLORER_URLS.mainnet}/tx/${signature}`
    : `${EXPLORER_URLS.devnet}/tx/${signature}?cluster=devnet`;

  return (
    <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-6">
      <h3 className="text-lg font-semibold text-green-700 mb-4">{message}</h3>
      
      {/* Transaction Details */}
      {transaction && (
        <div className="mb-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-green-600 font-medium">Type:</span>
            <span className="text-green-700 font-semibold">{transaction.type}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-green-600 font-medium">Amount:</span>
            <span className="text-green-700 font-semibold">
              {transaction.amount} {transaction.type}
            </span>
          </div>
          <div className="flex items-start justify-between text-sm">
            <span className="text-green-600 font-medium">Recipient:</span>
            <span className="text-green-700 font-mono text-xs break-all text-right max-w-[60%]">
              {transaction.recipient}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-green-600 font-medium">Network:</span>
            <span className="text-green-700 font-semibold capitalize">{network}</span>
          </div>
        </div>
      )}
      
      {/* Transaction Signature */}
      <div className="mb-4 p-3 bg-green-100 rounded-lg">
        <p className="text-xs text-green-600 font-medium mb-1.5">Transaction Signature:</p>
        <code className="text-xs text-green-700 font-mono break-all block">
          {signature}
        </code>
      </div>
      
      {/* Explorer Link */}
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
