# Gasless Token Transfers

In this tutorial, you'll learn how to send SOL and SPL tokens (like USDC) without requiring users to hold SOL for transaction fees. This feature helps improve user experience.

## You will learn

- How gasless transactions work
- How to send SOL without SOL for fees
- How to send USDC (or any SPL token) gaslessly
- How to pay fees in different tokens
- Best practices for handling transfers

## What are gasless transactions?

Normally, on Solana, you need SOL to pay for transaction fees. This creates friction:
- New users must acquire SOL before they can do anything
- Users holding only stablecoins can't transact
- Complex fee management

**Gasless transactions solve this** by letting users pay fees in any token (like USDC) instead of SOL. The paymaster service sponsors the transaction, and fees are deducted from the user's token balance.

## How it works

Here's what happens when a user sends a gasless transaction:

1. **User initiates transfer**: "Send 10 USDC to Alice"
2. **Lazorkit SDK**: Creates transaction with paymaster instructions
3. **Paymaster service**: Sponsors the transaction fees
4. **Fee payment**: Fees deducted from user's USDC balance (not SOL)
5. **Transaction confirmed**: Alice receives 10 USDC, user paid fees in USDC

**The result:** Users can transact even if they have zero SOL!

## Prerequisites

Before you start, make sure you've completed:
- [Passkey Authentication Tutorial](./passkey-wallet.md) - You need a connected wallet

## Step 1: Create a gasless transfer hook

Let's create a reusable hook that handles gasless transfers for both SOL and SPL tokens.

Create `lib/hooks/useGaslessTransfer.ts`:

```typescript
import { useState } from "react";
import { useLazorkitWallet } from "./useLazorkitWallet";
import {
  SystemProgram,
  PublicKey,
  LAMPORTS_PER_SOL,
  TransactionInstruction,
} from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  getAccount,
} from "@solana/spl-token";
import { Connection } from "@solana/web3.js";
import { LAZORKIT_CONFIG, DEVNET_USDC_MINT } from "@/lib/config/lazorkit";
import toast from "react-hot-toast";

interface TransferOptions {
  recipient: string;
  amount: number; // Amount in SOL or token units
  tokenMint?: string; // Optional: SPL token mint address (defaults to SOL)
  feeToken?: "SOL" | "USDC"; // Token to pay fees with
}

export function useGaslessTransfer() {
  const { signAndSendTransaction, smartWalletAddress, isConnected } =
    useLazorkitWallet();
  const [isTransferring, setIsTransferring] = useState(false);
  const [lastSignature, setLastSignature] = useState<string | null>(null);

  /**
   * Transfer SOL gaslessly
   */
  const transferSOL = async (options: TransferOptions) => {
    if (!isConnected || !smartWalletAddress) {
      throw new Error("Wallet not connected");
    }

    setIsTransferring(true);
    setLastSignature(null);

    try {
      const recipientPubkey = new PublicKey(options.recipient);
      const senderPubkey = new PublicKey(smartWalletAddress);
      const amountLamports = options.amount * LAMPORTS_PER_SOL;

      // Create transfer instruction
      const instruction = SystemProgram.transfer({
        fromPubkey: senderPubkey,
        toPubkey: recipientPubkey,
        lamports: amountLamports,
      });

      // Sign and send with gasless option
      const signature = await (signAndSendTransaction as any)({
        instructions: [instruction],
        transactionOptions: {
          feeToken: options.feeToken === "USDC" ? "USDC" : undefined,
        },
      });

      setLastSignature(signature);
      toast.success(`Transfer successful! ${signature.slice(0, 8)}...`);
      return signature;
    } catch (error: any) {
      console.error("Transfer failed:", error);
      toast.error(error?.message || "Transfer failed");
      throw error;
    } finally {
      setIsTransferring(false);
    }
  };

  /**
   * Transfer SPL tokens (like USDC) gaslessly
   */
  const transferToken = async (options: TransferOptions) => {
    if (!isConnected || !smartWalletAddress) {
      throw new Error("Wallet not connected");
    }

    setIsTransferring(true);
    setLastSignature(null);

    try {
      const connection = new Connection(LAZORKIT_CONFIG.RPC_URL, {
        commitment: "confirmed",
      });
      const tokenMint = new PublicKey(options.tokenMint || DEVNET_USDC_MINT);
      const senderPubkey = new PublicKey(smartWalletAddress);
      const recipientPubkey = new PublicKey(options.recipient);

      // Get associated token addresses
      const senderATA = await getAssociatedTokenAddress(
        tokenMint,
        senderPubkey
      );
      const recipientATA = await getAssociatedTokenAddress(
        tokenMint,
        recipientPubkey
      );

      let instructions: TransactionInstruction[] = [];

      // Check if recipient has token account, create if needed
      try {
        await getAccount(connection, recipientATA);
      } catch {
        // Create token account if it doesn't exist
        const {
          createAssociatedTokenAccountInstruction,
        } = await import("@solana/spl-token");
        instructions.push(
          createAssociatedTokenAccountInstruction(
            senderPubkey,
            recipientATA,
            recipientPubkey,
            tokenMint
          )
        );
      }

      // Create transfer instruction
      const transferInstruction = createTransferInstruction(
        senderATA,
        recipientATA,
        senderPubkey,
        options.amount * 1_000_000, // USDC has 6 decimals
        []
      );
      instructions.push(transferInstruction);

      // Execute gasless transaction
      const signature = await (signAndSendTransaction as any)({
        instructions,
        transactionOptions: {
          feeToken: "USDC", // Pay fees in USDC
        },
      });

      setLastSignature(signature);
      toast.success(`Transfer successful! ${signature.slice(0, 8)}...`);
      return signature;
    } catch (error: any) {
      console.error("Token transfer failed:", error);
      toast.error(error?.message || "Transfer failed");
      throw error;
    } finally {
      setIsTransferring(false);
    }
  };

  return {
    transferSOL,
    transferToken,
    isTransferring,
    lastSignature,
  };
}
```

**What's happening here?**
- `transferSOL`: Sends native SOL using `SystemProgram.transfer`
- `transferToken`: Sends SPL tokens (like USDC) using token program instructions
- Both support gasless execution via the `feeToken` option
- We automatically create token accounts if the recipient doesn't have one

## Step 2: Create a transfer form

Now let's create a simple form component that users can use to send tokens.

Create `components/TransferForm.tsx`:

```typescript
"use client";

import { useState } from "react";
import { useGaslessTransfer } from "@/lib/hooks/useGaslessTransfer";

export function TransferForm() {
  const { transferSOL, transferToken, isTransferring } = useGaslessTransfer();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("0.1");
  const [tokenType, setTokenType] = useState<"SOL" | "USDC">("SOL");

  const handleTransfer = async () => {
    if (!recipient || !amount) {
      alert("Please fill in all fields");
      return;
    }

    try {
      if (tokenType === "SOL") {
        await transferSOL({
          recipient,
          amount: parseFloat(amount),
          feeToken: "USDC", // Pay fees in USDC instead of SOL
        });
      } else {
        await transferToken({
          recipient,
          amount: parseFloat(amount),
          feeToken: "USDC",
        });
      }
      // Reset form on success
      setRecipient("");
      setAmount("0.1");
    } catch (error) {
      // Error already handled in hook
    }
  };

  return (
    <div className="p-6 bg-gray-100 rounded-lg space-y-4">
      <h2 className="text-xl font-bold">Send Tokens (Gasless)</h2>

      <div>
        <label className="block text-sm font-medium mb-2">Token Type</label>
        <select
          value={tokenType}
          onChange={(e) => setTokenType(e.target.value as "SOL" | "USDC")}
          className="w-full px-4 py-2 border rounded-lg"
        >
          <option value="SOL">SOL</option>
          <option value="USDC">USDC</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Recipient Address</label>
        <input
          type="text"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          placeholder="Enter Solana address"
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Amount</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.1"
          step="0.01"
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>

      <button
        onClick={handleTransfer}
        disabled={isTransferring || !recipient || !amount}
        className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
      >
        {isTransferring ? "Sending..." : `Send ${tokenType} (Gasless)`}
      </button>

      <p className="text-sm text-gray-600">
        Fees will be paid in USDC, so you don't need SOL!
      </p>
    </div>
  );
}
```

**Try it out:**
1. Enter a recipient address
2. Enter an amount
3. Click "Send SOL (Gasless)" or "Send USDC (Gasless)"
4. Authenticate with your passkey
5. The transaction executes without requiring SOL!

## Understanding fee tokens

You can choose which token to pay fees with:

```typescript
// Pay fees in SOL (sponsored by paymaster)
await transferSOL({
  recipient,
  amount: 0.1,
  feeToken: "SOL", // or undefined
});

// Pay fees in USDC
await transferSOL({
  recipient,
  amount: 0.1,
  feeToken: "USDC",
});
```

**When to use each:**
- **SOL**: If the user has SOL and wants to use it for fees
- **USDC**: If the user only has USDC (or other tokens) and no SOL

## Best practices

### 1. Validate addresses

Always validate recipient addresses before sending:

```typescript
const isValidAddress = (address: string): boolean => {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
};

const handleTransfer = async () => {
  if (!isValidAddress(recipient)) {
    toast.error("Invalid recipient address");
    return;
  }
  // ... proceed with transfer
};
```

### 2. Check balance before transferring

Prevent errors by checking balance first:

```typescript
const connection = new Connection(RPC_URL);
const balance = await connection.getBalance(senderPubkey);

if (balance < amountLamports) {
  toast.error("Insufficient balance");
  return;
}
```

### 3. Show transaction status

Give users feedback about what's happening:

```typescript
const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

const handleTransfer = async () => {
  setStatus("sending");
  try {
    const signature = await transferSOL({ recipient, amount });
    setStatus("success");
    // Show explorer link
  } catch (error) {
    setStatus("error");
  }
};
```

### 4. Handle errors gracefully

Show user-friendly error messages:

```typescript
try {
  await transferSOL({ recipient, amount });
} catch (error: any) {
  if (error.message.includes("insufficient funds")) {
    toast.error("Insufficient balance");
  } else if (error.message.includes("Invalid public key")) {
    toast.error("Invalid recipient address");
  } else {
    toast.error("Transfer failed: " + error.message);
  }
}
```

## Common mistakes

### Mistake 1: Not handling token account creation

**Problem:** Transfer fails because recipient doesn't have a token account.

**Solution:** Always check and create token accounts if needed (as shown in the code above).

### Mistake 2: Wrong decimal places

**Problem:** Sending wrong amounts because of decimal confusion.

**Solution:** Remember:
- SOL has 9 decimals (1 SOL = 1,000,000,000 lamports)
- USDC has 6 decimals (1 USDC = 1,000,000 smallest units)

### Mistake 3: Not validating addresses

**Problem:** Users can enter invalid addresses, causing errors.

**Solution:** Always validate addresses before sending (see best practices above).

### Mistake 4: Forgetting to handle loading states

**Problem:** Users click the button multiple times, creating duplicate transactions.

**Solution:** Disable the button while transferring:

```typescript
<button disabled={isTransferring}>
  {isTransferring ? "Sending..." : "Send"}
</button>
```

## Recap

You've learned how to:
- Send SOL without requiring SOL for fees
- Send USDC (or any SPL token) gaslessly
- Choose which token to pay fees with
- Handle errors and validate inputs

**Key takeaways:**
- Gasless transactions eliminate the need for users to hold SOL
- Fees can be paid in any token (USDC, USDT, etc.)
- Always validate addresses and check balances
- Handle loading and error states properly

## Next steps

Now that you can send tokens gaslessly, try:
- [Token Swaps](./token-swap.md) - Swap tokens using Jupiter aggregator
- [Subscription Service](./subscription.md) - Set up recurring payments

## Resources

- [Lazorkit Documentation](https://docs.lazorkit.com)
- [Solana SPL Token Program](https://spl.solana.com/token)
- [Solana Web3.js Transfer Guide](https://solana-labs.github.io/solana-web3.js/classes/SystemProgram.html#transfer)
