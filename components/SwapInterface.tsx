/**
 * SwapInterface Component
 * 
 * Reusable token swap interface component.
 * Handles input/output token selection and swap execution.
 */

"use client";

import { useState, useEffect } from "react";
import { useTokenSwap, getTokenMints } from "@/lib/hooks/useTokenSwap";
import { useWalletStore } from "@/lib/store/walletStore";

export function SwapInterface() {
  const network = useWalletStore((state) => state.network);
  const tokenMints = getTokenMints(network);
  
  const TOKEN_OPTIONS = [
    { value: tokenMints.SOL, label: "SOL" },
    { value: tokenMints.USDC, label: "USDC" },
    { value: tokenMints.USDT, label: "USDT" },
  ];

  const { fetchQuote, executeSwap, isFetchingQuote, isSwapping, quote } =
    useTokenSwap();

  const [inputToken, setInputToken] = useState<string>(tokenMints.SOL);
  const [outputToken, setOutputToken] = useState<string>(tokenMints.USDC);
  const [amount, setAmount] = useState("0.1");

  // Reset tokens when network changes
  useEffect(() => {
    setInputToken(tokenMints.SOL);
    setOutputToken(tokenMints.USDC);
  }, [network, tokenMints.SOL, tokenMints.USDC]);

  const handleGetQuote = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    try {
      await fetchQuote(inputToken, outputToken, parseFloat(amount));
    } catch (error) {
      console.error("Failed to get quote:", error);
    }
  };

  const handleSwap = async () => {
    if (!quote) {
      alert("Please get a quote first");
      return;
    }

    try {
      await executeSwap(inputToken, outputToken, parseFloat(amount));
    } catch (error) {
      console.error("Swap failed:", error);
    }
  };

  const inputTokenLabel = TOKEN_OPTIONS.find((t) => t.value === inputToken)?.label;
  const outputTokenLabel = TOKEN_OPTIONS.find((t) => t.value === outputToken)?.label;

  const outputAmount =
    quote && outputTokenLabel
      ? parseFloat(quote.outAmount) /
        (outputTokenLabel === "SOL" ? 1_000_000_000 : 1_000_000)
      : 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 mb-6">
      <h2 className="text-2xl font-semibold mb-8 text-gray-900">Swap Tokens</h2>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2.5">
            From
          </label>
          <div className="flex gap-3">
            <select
              value={inputToken}
              onChange={(e) => setInputToken(e.target.value)}
              className="px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 font-medium transition-all duration-200 hover:border-gray-400"
            >
              {TOKEN_OPTIONS.map((token) => (
                <option key={token.value} value={token.value}>
                  {token.label}
                </option>
              ))}
            </select>
            <input
              type="number"
              step="0.001"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.1"
              className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder:text-gray-400 font-medium transition-all duration-200 hover:border-gray-400"
            />
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={() => {
              setInputToken(outputToken);
              setOutputToken(inputToken);
            }}
            className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-all duration-200 text-gray-600 hover:text-gray-900"
            aria-label="Swap tokens"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2.5">To</label>
          <div className="flex gap-3">
            <select
              value={outputToken}
              onChange={(e) => setOutputToken(e.target.value)}
              className="px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 font-medium transition-all duration-200 hover:border-gray-400"
            >
              {TOKEN_OPTIONS.map((token) => (
                <option key={token.value} value={token.value}>
                  {token.label}
                </option>
              ))}
            </select>
            <div className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 font-medium">
              {quote ? (
                <span className="text-gray-900">
                  {outputAmount.toFixed(6)} {outputTokenLabel}
                </span>
              ) : (
                <span className="text-gray-400">-</span>
              )}
            </div>
          </div>
        </div>

        {quote && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-blue-700">Price Impact</span>
              <span
                className={`text-sm font-semibold ${
                  quote.priceImpactPct > 1
                    ? "text-red-600"
                    : quote.priceImpactPct > 0.5
                    ? "text-amber-600"
                    : "text-green-600"
                }`}
              >
                {quote.priceImpactPct.toFixed(2)}%
              </span>
            </div>
            <p className="text-xs text-blue-600/80">
              You'll receive approximately {outputAmount.toFixed(6)} {outputTokenLabel}{" "}
              for {amount} {inputTokenLabel}
            </p>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            onClick={handleGetQuote}
            disabled={isFetchingQuote || !amount || parseFloat(amount) <= 0}
            className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-900 rounded-lg font-medium hover:bg-gray-200 active:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isFetchingQuote ? "Fetching Quote..." : "Get Quote"}
          </button>
          <button
            onClick={handleSwap}
            disabled={isSwapping || !quote}
            className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 active:bg-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSwapping ? "Swapping..." : "Execute Swap"}
          </button>
        </div>
      </div>
    </div>
  );
}
