---
title: Subscription Service
description: Set up recurring payments with smart wallet delegation
---

# Tutorial: Subscription Service

This tutorial demonstrates how to set up recurring payments using smart wallet delegation, allowing automated billing without requiring user signatures for each payment.

## Overview

Smart wallet delegation enables one-time approval for recurring charges. Once approved, the service can execute payments automatically without user interaction.

### What You'll Build

- One-time approval flow
- Automated recurring payments
- Smart wallet policy delegation
- Cancel subscription functionality

## How It Works

1. **Initial Approval**: User approves a subscription with a one-time signature
2. **Policy Delegation**: Smart wallet delegates authority to the service
3. **Automated Billing**: Service executes payments without user signatures
4. **Cancellation**: User can revoke delegation at any time

## Implementation

### Step 1: Create Subscription Hook

```typescript
import { useLazorkitWallet } from "./useLazorkitWallet";

export function useSubscription() {
  const { signAndSendTransaction, smartWalletAddress } = useLazorkitWallet();

  const approveSubscription = async (amount: number, interval: string) => {
    // Create delegation instruction
    // User signs once to approve
  };

  const cancelSubscription = async () => {
    // Revoke delegation
  };

  return { approveSubscription, cancelSubscription };
}
```

## Best Practices

1. **Clear Communication**: Explain what users are approving
2. **Easy Cancellation**: Make it simple to cancel subscriptions
3. **Transaction History**: Show all subscription transactions
4. **Error Handling**: Handle failed payments gracefully

## Next Steps

- Review [Smart Wallet Guide](/smart-wallet-guide)
- Check out [Examples](http://localhost:3000)
- Read [Lazorkit Documentation](https://docs.lazorkit.com/)

