/**
 * SwapInterface Component
 * 
 * Reusable token swap interface component.
 * Handles input/output token selection and swap execution.
 */

"use client";

import { useState } from "react";
import { useTokenSwap, TOKEN_MINTS } from "@/lib/hooks/useTokenSwap";

const TOKEN_OPTIONS = [
  { value: TOKEN_MINTS.SOL, label: "SOL" },
  { value: TOKEN_MINTS.USDC, label: "USDC" },
  { value: TOKEN_MINTS.USDT, label: "USDT" },
];

export function SwapInterface() {
  const { fetchQuote, executeSwap, isFetchingQuote, isSwapping, quote } =
    useTokenSwap();

  const [inputToken, setInputToken] = useState<string>(TOKEN_MINTS.SOL);
  const [outputToken, setOutputToken] = useState<string>(TOKEN_MINTS.USDC);
  const [amount, setAmount] = useState("0.1");

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
    <div className="bg-card rounded-lg border border-border shadow-sm p-6 mb-6">
      <h2 className="text-2xl font-semibold mb-6 text-foreground">Swap Tokens</h2>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            From
          </label>
          <div className="flex gap-4">
            <select
              value={inputToken}
              onChange={(e) => setInputToken(e.target.value)}
              className="px-4 py-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-foreground"
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
              className="flex-1 px-4 py-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={() => {
              setInputToken(outputToken);
              setOutputToken(inputToken);
            }}
            className="p-2 bg-muted hover:bg-muted/80 rounded-full transition-colors text-foreground"
            aria-label="Swap tokens"
          >
            ⇅
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">To</label>
          <div className="flex gap-4">
            <select
              value={outputToken}
              onChange={(e) => setOutputToken(e.target.value)}
              className="px-4 py-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-foreground"
            >
              {TOKEN_OPTIONS.map((token) => (
                <option key={token.value} value={token.value}>
                  {token.label}
                </option>
              ))}
            </select>
            <div className="flex-1 px-4 py-2.5 bg-background border border-border rounded-lg text-foreground">
              {quote ? (
                <span className="text-foreground">
                  {outputAmount.toFixed(6)} {outputTokenLabel}
                </span>
              ) : (
                <span className="text-muted-foreground">-</span>
              )}
            </div>
          </div>
        </div>

        {quote && (
          <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-blue-400">Price Impact</span>
              <span
                className={`text-sm font-semibold ${
                  quote.priceImpactPct > 1
                    ? "text-red-400"
                    : quote.priceImpactPct > 0.5
                    ? "text-yellow-400"
                    : "text-green-400"
                }`}
              >
                {quote.priceImpactPct.toFixed(2)}%
              </span>
            </div>
            <p className="text-xs text-blue-400/80">
              You'll receive approximately {outputAmount.toFixed(6)} {outputTokenLabel}{" "}
              for {amount} {inputTokenLabel}
            </p>
          </div>
        )}

        <div className="flex gap-4">
          <button
            onClick={handleGetQuote}
            disabled={isFetchingQuote || !amount || parseFloat(amount) <= 0}
            className="flex-1 px-6 py-3 bg-muted text-foreground rounded-lg font-semibold hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isFetchingQuote ? "Fetching Quote..." : "Get Quote"}
          </button>
          <button
            onClick={handleSwap}
            disabled={isSwapping || !quote}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-lg font-semibold hover:from-purple-500 hover:to-purple-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-500/20"
          >
            {isSwapping ? "Swapping..." : "Execute Swap (Gasless)"}
          </button>
        </div>
      </div>
    </div>
  );
}
