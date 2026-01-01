# Subscription Service with Smart Wallet Delegation

In this tutorial, you'll learn how to build a recurring payment system using Lazorkit's smart wallet delegation. Users approve charges once, and subsequent charges happen automatically.

## You will learn

- How smart wallet delegation works
- How to create subscription policies
- How to set up automated billing
- How to handle cancellations
- Best practices for subscription services

## What is smart wallet delegation?

Smart wallet delegation lets you create policies that allow certain actions without requiring the user's signature each time. This is perfect for subscriptions.

**Traditional approach:**
- User subscribes → Approve charge #1
- Month 1 → User must approve charge #2
- Month 2 → User must approve charge #3
- ... (manual approval every time)

**With delegation:**
- User subscribes → Approve delegation policy (one-time)
- Month 1 → Backend charges automatically (no signature)
- Month 2 → Backend charges automatically (no signature)
- ... (automatic until cancelled)

**Benefits:**
- Better UX: No repeated approvals
- Reliable: Charges happen automatically
- Flexible: Set spending limits and time windows
- Secure: Delegation can be revoked anytime

## Prerequisites

Before you start, make sure you've completed:
- [Passkey Authentication Tutorial](./passkey-wallet.md) - You need a connected wallet
- [Gasless Transactions Tutorial](./gasless-tx.md) - Understanding transfers helps

## How delegation works

A delegation policy defines what actions are allowed without user signatures:

```typescript
interface DelegationPolicy {
  // What can be done
  allowedActions: string[]; // e.g., ["transfer", "swap"]
  
  // Spending limits
  maxAmount: number; // Maximum per transaction
  maxTotalAmount?: number; // Maximum total over time
  
  // Time limits
  validUntil?: number; // Timestamp when policy expires
  
  // Recipient restrictions
  allowedRecipients?: string[]; // Specific addresses only
}
```

**Example policy for a $10/month subscription:**

```typescript
const subscriptionPolicy = {
  allowedActions: ["transfer"],
  maxAmount: 10 * 1_000_000, // 10 USDC (6 decimals)
  maxTotalAmount: 120 * 1_000_000, // 120 USDC total (12 months)
  validUntil: Date.now() + 365 * 24 * 60 * 60 * 1000, // 1 year
  allowedRecipients: ["MERCHANT_WALLET_ADDRESS"],
};
```

## Step 1: Create a subscription hook

Let's create a hook that manages subscriptions. Note: This is a simplified frontend-only version. In production, you'd need backend integration.

Create `lib/hooks/useSubscription.ts`:

```typescript
import { useState } from "react";
import { useLazorkitWallet } from "./useLazorkitWallet";

interface Subscription {
  id: string;
  name: string;
  amount: number;
  interval: "weekly" | "monthly";
  recipient: string;
  status: "active" | "cancelled";
  createdAt: string;
  nextCharge?: string;
}

export function useSubscription() {
  const { isConnected, smartWalletAddress } = useLazorkitWallet();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  const createSubscription = async (
    name: string,
    amount: number,
    interval: "weekly" | "monthly",
    recipient: string
  ) => {
    if (!isConnected) {
      throw new Error("Wallet not connected");
    }

    // In production, this would:
    // 1. Create delegation policy on-chain
    // 2. Store subscription in backend database
    // 3. Set up cron job for automated billing

    const subscription: Subscription = {
      id: Date.now().toString(),
      name,
      amount,
      interval,
      recipient,
      status: "active",
      createdAt: new Date().toISOString(),
      nextCharge: new Date(
        Date.now() + (interval === "monthly" ? 30 : 7) * 24 * 60 * 60 * 1000
      ).toISOString(),
    };

    setSubscriptions([...subscriptions, subscription]);
    return subscription;
  };

  const cancelSubscription = (subscriptionId: string) => {
    // In production, this would revoke the delegation policy on-chain
    setSubscriptions(
      subscriptions.map((sub) =>
        sub.id === subscriptionId ? { ...sub, status: "cancelled" } : sub
      )
    );
  };

  return {
    subscriptions,
    createSubscription,
    cancelSubscription,
  };
}
```

**Important note:** This is a frontend-only demo. In production, you need:
- Backend service to create delegation policies on-chain
- Database to store subscriptions
- Cron job to process charges automatically

## Step 2: Create a subscription interface

Let's create a simple UI for managing subscriptions.

Create `components/SubscriptionService.tsx`:

```typescript
"use client";

import { useState } from "react";
import { useSubscription } from "@/lib/hooks/useSubscription";
import toast from "react-hot-toast";

export function SubscriptionService() {
  const { subscriptions, createSubscription, cancelSubscription } =
    useSubscription();
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("5");
  const [interval, setInterval] = useState<"weekly" | "monthly">("monthly");
  const [recipient, setRecipient] = useState("");

  const handleCreate = async () => {
    if (!name || !amount || !recipient) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      await createSubscription(
        name,
        parseFloat(amount),
        interval,
        recipient
      );
      toast.success("Subscription created! In production, this would set up on-chain delegation.");
      // Reset form
      setName("");
      setAmount("5");
      setRecipient("");
    } catch (error: any) {
      toast.error(error?.message || "Failed to create subscription");
    }
  };

  return (
    <div className="p-6 bg-gray-100 rounded-lg space-y-6">
      <h2 className="text-xl font-bold">Create Subscription</h2>

      {/* Create Form */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Service Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Premium Plan"
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Amount (USDC)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="5"
            step="0.01"
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Billing Interval</label>
          <select
            value={interval}
            onChange={(e) => setInterval(e.target.value as "weekly" | "monthly")}
            className="w-full px-4 py-2 border rounded-lg"
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Recipient Address</label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="Enter merchant wallet address"
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>

        <button
          onClick={handleCreate}
          className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          Create Subscription
        </button>
      </div>

      {/* Active Subscriptions */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Your Subscriptions</h3>
        {subscriptions.length === 0 ? (
          <p className="text-gray-600">No active subscriptions</p>
        ) : (
          <div className="space-y-3">
            {subscriptions.map((sub) => (
              <div
                key={sub.id}
                className="p-4 bg-white rounded-lg border flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold">{sub.name}</p>
                  <p className="text-sm text-gray-600">
                    {sub.amount} USDC per {sub.interval}
                  </p>
                  {sub.nextCharge && (
                    <p className="text-xs text-gray-500">
                      Next charge: {new Date(sub.nextCharge).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => cancelSubscription(sub.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                >
                  {sub.status === "cancelled" ? "Cancelled" : "Cancel"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

## Backend integration (production)

For a production app, you'll need backend services. Here's how it would work:

### Step 1: Backend service structure

```typescript
// backend/services/subscription.ts

interface SubscriptionRecord {
  id: string;
  userWallet: string;
  recipient: string;
  amount: number;
  interval: "weekly" | "monthly";
  nextCharge: Date;
  delegationPolicyId: string;
  status: "active" | "cancelled";
}

export class SubscriptionService {
  // Get all active subscriptions due for charging
  async getDueSubscriptions(): Promise<SubscriptionRecord[]> {
    const now = new Date();
    return await db.subscriptions.findMany({
      where: {
        status: "active",
        nextCharge: { lte: now },
      },
    });
  }

  // Execute charge using delegation policy
  async executeCharge(subscription: SubscriptionRecord): Promise<string> {
    // Use delegation policy to transfer without user signature
    const signature = await lazorkitSDK.executeDelegatedTransfer({
      fromWallet: subscription.userWallet,
      toWallet: subscription.recipient,
      amount: subscription.amount,
      delegationPolicyId: subscription.delegationPolicyId,
    });

    // Update next charge date
    const nextCharge = this.calculateNextCharge(
      subscription.interval,
      new Date()
    );
    await db.subscriptions.update({
      where: { id: subscription.id },
      data: { nextCharge },
    });

    return signature;
  }

  private calculateNextCharge(
    interval: "weekly" | "monthly",
    from: Date
  ): Date {
    const days = interval === "monthly" ? 30 : 7;
    return new Date(from.getTime() + days * 24 * 60 * 60 * 1000);
  }
}
```

### Step 2: Cron job for automated billing

```typescript
// backend/cron/billing.ts

import { SubscriptionService } from "../services/subscription";

const subscriptionService = new SubscriptionService();

// Run every hour
export async function processSubscriptions() {
  const dueSubscriptions = await subscriptionService.getDueSubscriptions();

  for (const subscription of dueSubscriptions) {
    try {
      const signature = await subscriptionService.executeCharge(subscription);
      console.log(`Charged subscription ${subscription.id}: ${signature}`);
    } catch (error) {
      console.error(`Failed to charge subscription ${subscription.id}:`, error);
      // Handle error (retry, notify user, etc.)
    }
  }
}

// Schedule with node-cron or similar
import cron from "node-cron";
cron.schedule("0 * * * *", processSubscriptions); // Every hour
```

## Best practices

### 1. Set reasonable spending limits

Always set limits on delegation policies:

```typescript
const policy = {
  maxAmount: subscription.amount * 1.1, // 10% buffer for fees
  maxTotalAmount: subscription.amount * 12, // 12 months max
  validUntil: Date.now() + 365 * 24 * 60 * 60 * 1000, // 1 year
};
```

### 2. Notify users before charges

Send email notifications:

```typescript
// Before charge
await sendEmail(user.email, {
  subject: "Upcoming subscription charge",
  body: `Your ${subscription.name} subscription will be charged ${amount} USDC on ${nextChargeDate}`,
});

// After charge
await sendEmail(user.email, {
  subject: "Subscription charged",
  body: `Your ${subscription.name} subscription has been charged ${amount} USDC. Transaction: ${signature}`,
});
```

### 3. Handle failed charges gracefully

```typescript
try {
  await executeCharge(subscription);
} catch (error) {
  if (error.message.includes("insufficient funds")) {
    // Notify user, pause subscription
    await pauseSubscription(subscription.id);
    await notifyUser(subscription.userId, "Insufficient funds");
  } else {
    // Retry later
    await scheduleRetry(subscription.id);
  }
}
```

### 4. Make cancellation easy

```typescript
const cancelSubscription = async (subscriptionId: string) => {
  // Revoke delegation policy on-chain
  await lazorkitSDK.revokeDelegationPolicy(policyId);
  
  // Update database
  await db.subscriptions.update({
    where: { id: subscriptionId },
    data: { status: "cancelled" },
  });
  
  // Confirm with user
  await notifyUser(userId, "Subscription cancelled successfully");
};
```

## Common mistakes

### Mistake 1: Not setting spending limits

**Problem:** Users could be charged unlimited amounts if policy is compromised.

**Solution:** Always set `maxAmount` and `maxTotalAmount` limits.

### Mistake 2: Not handling failed charges

**Problem:** Subscriptions fail silently, users don't know why.

**Solution:** Implement retry logic and user notifications.

### Mistake 3: Not validating recipient addresses

**Problem:** Users could subscribe to invalid addresses.

**Solution:** Validate addresses before creating subscriptions.

### Mistake 4: Not setting expiration dates

**Problem:** Policies never expire, security risk.

**Solution:** Always set `validUntil` timestamps.

## How it's integrated in this project

This project includes a subscription service demo. Here's where to find the code:

### Implementation Files

1. **Main Page Component**: [`app/subscription/page.tsx`](../../app/subscription/page.tsx)
   - Complete subscription management interface
   - Create subscription form
   - List active subscriptions
   - Charge and cancel functionality
   - Demo implementation (frontend-only)

2. **Transfer Hook Integration**: Uses [`lib/hooks/useGaslessTransfer.ts`](../../lib/hooks/useGaslessTransfer.ts)
   - Uses `transferToken()` for subscription charges
   - Gasless execution via Lazorkit paymaster
   - Network-aware token mints

3. **Wallet Hook**: Uses [`lib/hooks/useLazorkitWallet.ts`](../../lib/hooks/useLazorkitWallet.ts)
   - Wallet connection state
   - Smart wallet address
   - Balance fetching

### Try it out

1. **Run the app**: `npm run dev`
2. **Navigate to**: `http://localhost:3000/subscription`
3. **Connect your wallet** (if not already connected)
4. **Create a subscription**:
   - Enter service name (e.g., "Premium Plan")
   - Set amount in USDC (e.g., 5)
   - Choose interval (weekly/monthly)
   - Enter recipient address
   - Click "Create Subscription"
5. **Charge a subscription**: Click "Charge Now (Demo)" to simulate a charge
6. **Cancel subscription**: Click "Cancel" to cancel a subscription

### Key Features in the Implementation

- **Frontend Demo**: This is a simplified frontend-only demo
- **Subscription Management**: Create, list, charge, and cancel subscriptions
- **Gasless Charges**: Subscription charges execute gaslessly
- **State Management**: Local state management for subscriptions
- **UI/UX**: Clean interface with status indicators

### Production Implementation Requirements

For a production subscription service, you would need:

1. **Backend Service**:
   - Cron job to trigger recurring charges
   - API endpoints for subscription management
   - Database to store subscription data
   - Webhook handlers for payment events

2. **On-Chain Delegation**:
   - Create delegation policies on-chain
   - Set spending limits and time windows
   - Revoke policies on cancellation

3. **Smart Contract** (Optional):
   - Subscription management program
   - Automated billing logic
   - Payment escrow

4. **Security**:
   - Validate delegation policies
   - Check spending limits
   - Verify recipient addresses
   - Handle failed payments

### Code Example: Subscription Charge

```typescript
import { useGaslessTransfer } from "@/lib/hooks/useGaslessTransfer";

function SubscriptionService() {
  const { transferToken, isTransferring } = useGaslessTransfer();

  const chargeSubscription = async (subscription: Subscription) => {
    try {
      // Charge the subscription gaslessly
      const signature = await transferToken({
        recipient: subscription.recipient,
        amount: subscription.amount,
        feeToken: "USDC", // Pay fees in USDC
      });
      
      console.log("Subscription charged:", signature);
      // Update subscription lastCharge and nextCharge dates
    } catch (error) {
      console.error("Charge failed:", error);
    }
  };
}
```

### Current Limitations

This demo implementation:
- ✅ Shows the UI/UX for subscriptions
- ✅ Demonstrates gasless charges
- ✅ Manages subscription state locally
- ❌ Does not set up on-chain delegation
- ❌ Does not have automated billing (requires backend)
- ❌ Does not persist subscriptions (uses local state)

For production, you would need to implement the backend and on-chain delegation as described above.

## Recap

You've learned how to:
- Create subscription policies with delegation
- Set up automated billing (conceptually)
- Handle cancellations
- Implement best practices for subscriptions

**Key takeaways:**
- Delegation allows automatic charges without user signatures
- Always set spending limits and expiration dates
- Notify users before and after charges
- Handle failures gracefully with retries and notifications

**Important:** This tutorial shows the frontend concept. Production requires:
- Backend service for on-chain delegation
- Database for subscription storage
- Cron jobs for automated billing

## Next steps

Now that you understand subscriptions, explore:
- [Passkey Authentication](./passkey-wallet.md) - Review authentication
- [Gasless Transactions](./gasless-tx.md) - Review transfers

## Resources

- [Lazorkit Documentation](https://docs.lazorkit.com)
- [Solana Program Derived Addresses](https://docs.solana.com/developing/programming-model/calling-between-programs#program-derived-addresses)
- [Smart Wallet Patterns](https://docs.lazorkit.com/advanced/smart-wallets)
