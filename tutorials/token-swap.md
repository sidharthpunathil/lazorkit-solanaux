# Token Swaps with Jupiter

In this tutorial, you'll learn how to integrate Jupiter Aggregator for token swaps on Solana. Jupiter finds the best prices across all DEXs and executes swaps gaslessly with Lazorkit.

## You will learn

- How Jupiter Aggregator works
- How to get real-time swap quotes
- How to execute swaps gaslessly
- How to handle slippage and price impact
- Best practices for swap interfaces

## What is Jupiter?

Jupiter is a token aggregator that finds the best swap routes across all Solana DEXs (Raydium, Orca, Meteora, and more). Instead of integrating with each DEX separately, you use one API that handles everything.

**Why Jupiter?**
- Single API for all DEXs
- Automatic best route finding
- Multi-hop swaps handled automatically
- Real-time quotes
- Slippage protection built-in

## How it works

Here's what happens when a user swaps tokens:

1. **User wants to swap**: "Swap 1 SOL for USDC"
2. **Your app calls Jupiter**: Gets a quote with the best route
3. **User approves**: Authenticates with passkey
4. **Jupiter creates transaction**: With all necessary instructions
5. **Lazorkit executes**: Gaslessly, paying fees in USDC
6. **Swap completes**: User receives USDC

## Prerequisites

Before you start, make sure you've completed:
- [Passkey Authentication Tutorial](./passkey-wallet.md) - You need a connected wallet
- [Gasless Transactions Tutorial](./gasless-tx.md) - Understanding gasless execution helps

## Step 1: Create a token swap hook

Let's create a hook that handles fetching quotes and executing swaps.

Create `lib/hooks/useTokenSwap.ts`:

```typescript
import { useState } from "react";
import { useLazorkitWallet } from "./useLazorkitWallet";
import { PublicKey, TransactionInstruction, Transaction } from "@solana/web3.js";
import toast from "react-hot-toast";

// Common token mints on Devnet
export const TOKEN_MINTS = {
  SOL: "So11111111111111111111111111111111111111112", // Wrapped SOL
  USDC: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU", // Devnet USDC
  USDT: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", // Devnet USDT
} as const;

interface SwapQuote {
  inputMint: string;
  outputMint: string;
  inAmount: string;
  outAmount: string;
  priceImpactPct: number;
  routePlan: any;
}

export function useTokenSwap() {
  const { signAndSendTransaction, smartWalletAddress, isConnected } =
    useLazorkitWallet();
  const [isFetchingQuote, setIsFetchingQuote] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [quote, setQuote] = useState<SwapQuote | null>(null);
  const [lastSwapSignature, setLastSwapSignature] = useState<string | null>(null);

  /**
   * Fetch swap quote from Jupiter API
   */
  const fetchQuote = async (
    inputMint: string,
    outputMint: string,
    amount: number,
    slippageBps: number = 50 // 0.5% slippage
  ) => {
    if (!isConnected) {
      throw new Error("Wallet not connected");
    }

    setIsFetchingQuote(true);
    setQuote(null);

    try {
      // Convert amount to smallest unit
      const isSOL = inputMint === TOKEN_MINTS.SOL;
      const amountInSmallestUnit = isSOL
        ? amount * 1_000_000_000 // SOL: 9 decimals
        : amount * 1_000_000; // USDC/USDT: 6 decimals

      // Fetch quote from Jupiter API
      const quoteUrl = new URL("https://quote-api.jup.ag/v6/quote");
      quoteUrl.searchParams.set("inputMint", inputMint);
      quoteUrl.searchParams.set("outputMint", outputMint);
      quoteUrl.searchParams.set("amount", amountInSmallestUnit.toString());
      quoteUrl.searchParams.set("slippageBps", slippageBps.toString());
      quoteUrl.searchParams.set("onlyDirectRoutes", "false");

      const response = await fetch(quoteUrl.toString(), {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch quote");
      }

      const data = await response.json();

      setQuote({
        inputMint,
        outputMint,
        inAmount: data.inAmount,
        outAmount: data.outAmount,
        priceImpactPct: parseFloat(data.priceImpactPct || "0"),
        routePlan: data.routePlan,
      });

      return data;
    } catch (error: any) {
      console.error("Failed to fetch quote:", error);
      toast.error(error?.message || "Failed to fetch swap quote");
      throw error;
    } finally {
      setIsFetchingQuote(false);
    }
  };

  /**
   * Execute swap using Jupiter API
   */
  const executeSwap = async (
    inputMint: string,
    outputMint: string,
    amount: number
  ) => {
    if (!isConnected || !smartWalletAddress || !quote) {
      throw new Error("Wallet not connected or quote not available");
    }

    setIsSwapping(true);
    setLastSwapSignature(null);

    try {
      // Get swap transaction from Jupiter
      const response = await fetch("https://quote-api.jup.ag/v6/swap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quoteResponse: quote,
          userPublicKey: smartWalletAddress,
          wrapAndUnwrapSol: true,
          dynamicComputeUnitLimit: true,
          prioritizationFeeLamports: "auto",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get swap transaction");
      }

      const { swapTransaction } = await response.json();

      // Decode transaction
      const transaction = Transaction.from(
        Buffer.from(swapTransaction, "base64")
      );

      // Convert transaction instructions
      const instructions: TransactionInstruction[] = transaction.instructions;

      // Sign and send transaction gaslessly
      const signature = await (signAndSendTransaction as any)({
        instructions,
        transactionOptions: {
          feeToken: "USDC", // Pay fees in USDC
          computeUnitLimit: 1_400_000, // Jupiter swaps can be compute-intensive
        },
      });

      setLastSwapSignature(signature);
      toast.success(`Swap executed! Transaction: ${signature.slice(0, 8)}...`);

      return signature;
    } catch (error: any) {
      console.error("Swap failed:", error);
      toast.error(error?.message || "Swap failed");
      throw error;
    } finally {
      setIsSwapping(false);
    }
  };

  return {
    fetchQuote,
    executeSwap,
    isFetchingQuote,
    isSwapping,
    quote,
    lastSwapSignature,
  };
}
```

**What's happening here?**
- `fetchQuote`: Gets the best swap route and price from Jupiter
- `executeSwap`: Gets the swap transaction from Jupiter and executes it gaslessly
- We handle decimal conversion (SOL has 9 decimals, USDC has 6)
- We set higher compute unit limits for complex swaps

## Step 2: Create a swap interface

Now let's create a user-friendly swap interface.

Create `components/SwapInterface.tsx`:

```typescript
"use client";

import { useState, useEffect } from "react";
import { useTokenSwap, TOKEN_MINTS } from "@/lib/hooks/useTokenSwap";

const TOKEN_OPTIONS = [
  { value: TOKEN_MINTS.SOL, label: "SOL" },
  { value: TOKEN_MINTS.USDC, label: "USDC" },
  { value: TOKEN_MINTS.USDT, label: "USDT" },
];

export function SwapInterface() {
  const { fetchQuote, executeSwap, isFetchingQuote, isSwapping, quote } =
    useTokenSwap();

  const [inputToken, setInputToken] = useState(TOKEN_MINTS.SOL);
  const [outputToken, setOutputToken] = useState(TOKEN_MINTS.USDC);
  const [amount, setAmount] = useState("0.1");

  // Auto-fetch quote when inputs change
  useEffect(() => {
    if (amount && parseFloat(amount) > 0) {
      const timeoutId = setTimeout(() => {
        fetchQuote(inputToken, outputToken, parseFloat(amount)).catch(() => {
          // Silently handle errors (user might be typing)
        });
      }, 500); // Debounce for 500ms

      return () => clearTimeout(timeoutId);
    }
  }, [inputToken, outputToken, amount, fetchQuote]);

  const handleSwap = async () => {
    if (!quote) {
      alert("Please wait for a quote");
      return;
    }

    try {
      await executeSwap(inputToken, outputToken, parseFloat(amount));
      // Reset form on success
      setAmount("0.1");
    } catch (error) {
      // Error already handled in hook
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
    <div className="p-6 bg-gray-100 rounded-lg space-y-4">
      <h2 className="text-xl font-bold">Swap Tokens</h2>

      {/* Input Token */}
      <div>
        <label className="block text-sm font-medium mb-2">From</label>
        <div className="flex gap-2">
          <select
            value={inputToken}
            onChange={(e) => setInputToken(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            {TOKEN_OPTIONS.map((token) => (
              <option key={token.value} value={token.value}>
                {token.label}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.1"
            step="0.01"
            className="flex-1 px-4 py-2 border rounded-lg"
          />
        </div>
      </div>

      {/* Swap Direction Button */}
      <div className="flex justify-center">
        <button
          onClick={() => {
            setInputToken(outputToken);
            setOutputToken(inputToken);
          }}
          className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
        >
          ⇅ Swap Direction
        </button>
      </div>

      {/* Output Token */}
      <div>
        <label className="block text-sm font-medium mb-2">To</label>
        <div className="flex gap-2">
          <select
            value={outputToken}
            onChange={(e) => setOutputToken(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            {TOKEN_OPTIONS.map((token) => (
              <option key={token.value} value={token.value}>
                {token.label}
              </option>
            ))}
          </select>
          <div className="flex-1 px-4 py-2 border rounded-lg bg-gray-50">
            {isFetchingQuote ? (
              "Loading..."
            ) : quote ? (
              `${outputAmount.toFixed(6)} ${outputTokenLabel}`
            ) : (
              "-"
            )}
          </div>
        </div>
      </div>

      {/* Quote Info */}
      {quote && (
        <div className="p-4 bg-blue-50 rounded-lg">
          <p className="text-sm">
            <strong>Price Impact:</strong> {quote.priceImpactPct.toFixed(2)}%
          </p>
          {quote.priceImpactPct > 1 && (
            <p className="text-sm text-orange-600 mt-1">
              Warning: High price impact!
            </p>
          )}
        </div>
      )}

      {/* Swap Button */}
      <button
        onClick={handleSwap}
        disabled={isSwapping || !quote || isFetchingQuote}
        className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
      >
        {isSwapping ? "Swapping..." : "Execute Swap (Gasless)"}
      </button>

      <p className="text-sm text-gray-600">
        Fees will be paid in USDC. No SOL required!
      </p>
    </div>
  );
}
```

**Try it out:**
1. Select input and output tokens
2. Enter an amount
3. Wait for the quote (auto-fetches)
4. Review the price impact
5. Click "Execute Swap"
6. Authenticate with your passkey
7. Swap executes gaslessly!

## Understanding slippage

Slippage is the difference between the expected price and the actual execution price. Jupiter lets you set a slippage tolerance.

**What is slippage tolerance?**
- If you set 0.5% slippage, the swap will only execute if the price moves less than 0.5%
- If price moves more, the transaction fails (protecting you from bad trades)

**How to set it:**
```typescript
await fetchQuote(inputMint, outputMint, amount, 50); // 0.5% slippage (50 basis points)
```

**Common values:**
- 10 bps (0.1%) - Very tight, may fail in volatile markets
- 50 bps (0.5%) - Default, good for most swaps
- 100 bps (1%) - Loose, allows more price movement

## Understanding price impact

Price impact shows how much the swap will affect the token's price. High price impact means you're moving a lot of liquidity.

**Price impact levels:**
- < 0.1% - Excellent (very liquid)
- 0.1% - 1% - Good (normal)
- 1% - 3% - Warning (low liquidity)
- > 3% - High risk (very low liquidity)

**Best practice:** Warn users when price impact is > 1%.

## Best practices

### 1. Auto-refresh quotes

Quotes expire quickly (usually ~10 seconds). Refresh them periodically:

```typescript
useEffect(() => {
  if (amount && inputToken && outputToken) {
    const interval = setInterval(() => {
      fetchQuote(inputToken, outputToken, parseFloat(amount));
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }
}, [amount, inputToken, outputToken]);
```

### 2. Handle quote errors gracefully

Jupiter might not have a route for some token pairs:

```typescript
try {
  await fetchQuote(inputToken, outputToken, amount);
} catch (error: any) {
  if (error.message.includes("No routes found")) {
    toast.error("No swap route available for these tokens");
  } else if (error.message.includes("Insufficient liquidity")) {
    toast.error("Insufficient liquidity for this swap");
  } else {
    toast.error("Failed to get quote: " + error.message);
  }
}
```

### 3. Show loading states

Users need to know when quotes are being fetched:

```typescript
{isFetchingQuote ? (
  "Loading quote..."
) : quote ? (
  `${outputAmount} ${outputTokenLabel}`
) : (
  "Enter amount to see quote"
)}
```

### 4. Validate amounts

Check that users have enough balance:

```typescript
const handleSwap = async () => {
  if (parseFloat(amount) <= 0) {
    toast.error("Amount must be greater than 0");
    return;
  }
  // ... proceed with swap
};
```

## Common mistakes

### Mistake 1: Not handling quote expiration

**Problem:** User waits too long, quote expires, swap fails.

**Solution:** Auto-refresh quotes or fetch a new one before executing.

### Mistake 2: Wrong decimal conversion

**Problem:** Sending wrong amounts because of decimal confusion.

**Solution:** Remember:
- SOL: 9 decimals (multiply by 1,000,000,000)
- USDC/USDT: 6 decimals (multiply by 1,000,000)

### Mistake 3: Not warning about high price impact

**Problem:** Users get bad prices on low-liquidity swaps.

**Solution:** Always show price impact and warn if > 1%.

### Mistake 4: Not setting compute unit limits

**Problem:** Complex swaps fail because they exceed compute limits.

**Solution:** Set higher limits for Jupiter swaps:

```typescript
transactionOptions: {
  computeUnitLimit: 1_400_000, // Higher limit for complex swaps
}
```

## Recap

You've learned how to:
- Get real-time swap quotes from Jupiter
- Execute swaps gaslessly with Lazorkit
- Handle slippage and price impact
- Create a user-friendly swap interface

**Key takeaways:**
- Jupiter aggregates all DEXs into one API
- Quotes expire quickly, so refresh them
- Always show price impact to users
- Set appropriate compute unit limits for complex swaps

## Next steps

Now that you can swap tokens, try:
- [Subscription Service](./subscription.md) - Set up recurring payments
- [Gasless Transactions](./gasless-tx.md) - Review gasless transfers

## Resources

- [Jupiter API Documentation](https://docs.jup.ag)
- [Jupiter Aggregator](https://jup.ag)
- [Lazorkit Documentation](https://docs.lazorkit.com)
