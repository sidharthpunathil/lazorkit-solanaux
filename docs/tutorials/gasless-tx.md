---
title: Gasless Transactions
description: How to send tokens without holding SOL for fees
---

# Tutorial: Gasless Transactions

This tutorial demonstrates how to send SOL and SPL tokens (like USDC) without holding SOL for transaction fees, using Lazorkit's paymaster service.

## Overview

Gasless transactions allow users to send tokens even if they don't have SOL for fees. The paymaster service sponsors the transaction fees, and users can pay fees in USDC or other tokens.

### What You'll Build

- SOL transfer without SOL for fees
- USDC transfer with gasless execution
- Transaction status tracking
- Error handling and user feedback

## Why Gasless Transactions?

### Traditional Problem

Users need SOL to pay for transaction fees, even when sending other tokens like USDC. This creates a barrier:
- New users must first acquire SOL
- Users need to maintain a SOL balance just for fees
- Poor UX for stablecoin-focused users

### Gasless Solution

- Send any token without holding SOL
- Pay fees in the token you're sending (e.g., USDC)
- Perfect for onboarding new users
- Better UX for stablecoin users

## Implementation

### Step 1: Create Gasless Transfer Hook

Create `lib/hooks/useGaslessTransfer.ts`:

```typescript
import { useLazorkitWallet } from "./useLazorkitWallet";
import { SystemProgram, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { createTransferInstruction, getAssociatedTokenAddress } from "@solana/spl-token";

export function useGaslessTransfer() {
  const { signAndSendTransaction, smartWalletAddress, isConnected } = useLazorkitWallet();

  const transferSOL = async (recipient: string, amount: number) => {
    if (!isConnected || !smartWalletAddress) {
      throw new Error("Wallet not connected");
    }

    const instruction = SystemProgram.transfer({
      fromPubkey: new PublicKey(smartWalletAddress),
      toPubkey: new PublicKey(recipient),
      lamports: amount * LAMPORTS_PER_SOL,
    });

    const signature = await signAndSendTransaction({
      instructions: [instruction],
      transactionOptions: {
        feeToken: "USDC", // Pay fees in USDC instead of SOL
      },
    });

    return signature;
  };

  const transferToken = async (
    recipient: string,
    amount: number,
    tokenMint: string
  ) => {
    // Implementation for SPL token transfer
    // See full code in lib/hooks/useGaslessTransfer.ts
  };

  return { transferSOL, transferToken };
}
```

### Step 2: Create Transfer Form Component

```typescript
"use client";

import { useState } from "react";
import { useGaslessTransfer } from "@/lib/hooks/useGaslessTransfer";

export function TransferForm() {
  const { transferSOL, isTransferring } = useGaslessTransfer();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");

  const handleTransfer = async () => {
    try {
      await transferSOL(recipient, parseFloat(amount));
      // Show success message
    } catch (error) {
      // Show error message
    }
  };

  return (
    <form onSubmit={handleTransfer}>
      {/* Form fields */}
    </form>
  );
}
```

## How It Works

1. **User Initiates Transfer**: User enters recipient and amount
2. **Transaction Created**: System creates a Solana transfer instruction
3. **Paymaster Sponsors**: Lazorkit's paymaster service sponsors the SOL fee
4. **User Pays in Token**: User pays the fee in USDC (or configured token)
5. **Transaction Executes**: Transaction is signed and sent to the network

## Best Practices

1. **Error Handling**: Always handle network errors and user rejections
2. **Loading States**: Show loading indicators during transaction processing
3. **Transaction Tracking**: Display transaction signatures and links to explorer
4. **Balance Validation**: Check user has sufficient balance before transfer

## Next Steps

- Learn about [Token Swaps](/tutorials/token-swap)
- Explore [Subscription Service](/tutorials/subscription)
- Check the [Smart Wallet Guide](/smart-wallet-guide)

