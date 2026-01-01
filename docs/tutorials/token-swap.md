---
title: Token Swaps
description: Integrate Jupiter aggregator for token swaps
---

# Tutorial: Token Swaps with Jupiter Aggregator

This tutorial demonstrates how to integrate Jupiter Aggregator API for token swaps on Solana, executed gaslessly with Lazorkit.

## Overview

Jupiter Aggregator finds the best swap routes across all Solana DEXs (Raydium, Orca, Meteora, etc.) and provides a simple API to execute swaps. Combined with Lazorkit, you can execute swaps gaslessly.

### What You'll Build

- Token swap interface (SOL ↔ USDC ↔ USDT)
- Real-time price quotes
- Best route finding
- Gasless swap execution

## Why Jupiter?

### Without Jupiter

- Manually integrate with each DEX
- Compare prices across multiple sources
- Handle complex routing logic
- Different APIs for each DEX

### With Jupiter

- Single API for all DEXs
- Automatic best route finding
- Multi-hop swaps handled automatically
- Real-time quotes
- Slippage protection

## Jupiter API Overview

Jupiter provides two main endpoints:

1. **Quote API** (`/quote`) - Get swap quotes
2. **Swap API** (`/swap`) - Get swap transaction

### Quote Request

```typescript
const response = await fetch(
  `https://quote-api.jup.ag/v6/quote?` +
    `inputMint=${inputMint}&` +
    `outputMint=${outputMint}&` +
    `amount=${amountInSmallestUnit}&` +
    `slippageBps=50`
);
```

## Implementation

### Step 1: Create Token Swap Hook

Create `lib/hooks/useTokenSwap.ts`:

```typescript
import { useLazorkitWallet } from "./useLazorkitWallet";

export function useTokenSwap() {
  const { signAndSendTransaction, smartWalletAddress, isConnected } = useLazorkitWallet();

  const fetchQuote = async (
    inputMint: string,
    outputMint: string,
    amount: number
  ) => {
    // Fetch quote from Jupiter API
    const response = await fetch(
      `https://quote-api.jup.ag/v6/quote?...`
    );
    const data = await response.json();
    return data;
  };

  const executeSwap = async (
    inputMint: string,
    outputMint: string,
    amount: number
  ) => {
    // Get swap transaction from Jupiter
    // Execute using signAndSendTransaction
  };

  return { fetchQuote, executeSwap };
}
```

### Step 2: Create Swap Interface

```typescript
"use client";

import { useTokenSwap } from "@/lib/hooks/useTokenSwap";

export function SwapInterface() {
  const { fetchQuote, executeSwap, quote } = useTokenSwap();
  // Component implementation
}
```

## Best Practices

1. **Quote Validation**: Always validate quote responses
2. **Slippage Protection**: Set appropriate slippage tolerance
3. **Error Handling**: Handle network errors and API failures
4. **User Feedback**: Show loading states and transaction status

## Next Steps

- Learn about [Subscription Service](/tutorials/subscription)
- Check the [Smart Wallet Guide](/smart-wallet-guide)
- Explore more [Examples](https://lazorkit-solanaux.vercel.app)

