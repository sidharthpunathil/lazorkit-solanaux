# Passkey Authentication with Lazorkit

In this tutorial, you'll learn how to add passkey-based wallet authentication to your Next.js app using Lazorkit. By the end, you'll have a working wallet connection that uses biometric authentication instead of seed phrases.

## You will learn

- How to set up Lazorkit in a Next.js app
- How to create a connect button that uses passkeys
- How to display wallet information and balance
- How to handle session persistence
- Common mistakes and how to avoid them

## What are passkeys?

Passkeys are a modern authentication method that uses your device's built-in security features—like Face ID on iPhone or Windows Hello on Windows—instead of passwords or seed phrases.

**Why passkeys?**
- No seed phrases to write down or lose
- No browser extensions needed
- Works on any device with biometric authentication
- More secure than traditional passwords

## Prerequisites

Before you start, make sure you have:
- A Next.js project set up (we'll use the App Router)
- Node.js 18+ or Bun installed
- A modern browser with WebAuthn support (Chrome, Safari, Firefox, Edge)

## Step 1: Install dependencies

First, install the required packages:

```bash
bun add @lazorkit/wallet @solana/web3.js buffer
# or
npm install @lazorkit/wallet @solana/web3.js buffer
```

## Step 2: Configure Lazorkit

Create a configuration file to store your Lazorkit settings. This keeps everything organized and makes it easy to switch between networks.

Create `lib/config/lazorkit.ts`:

```typescript
export const LAZORKIT_CONFIG = {
  RPC_URL: process.env.NEXT_PUBLIC_RPC_URL || "https://api.devnet.solana.com",
  PORTAL_URL: process.env.NEXT_PUBLIC_PORTAL_URL || "https://portal.lazor.sh",
  PAYMASTER: {
    paymasterUrl: process.env.NEXT_PUBLIC_PAYMASTER_URL || "https://kora.devnet.lazorkit.com",
  },
} as const;
```

**What's happening here?**
- We're using environment variables with sensible defaults for Devnet
- The `as const` makes the config type-safe
- This works out of the box—no API keys needed for Devnet

## Step 3: Set up the provider

Lazorkit needs a provider component that wraps your app. This gives all your components access to the wallet.

Update `app/layout.tsx`:

```typescript
"use client";

import { LazorkitProvider } from "@lazorkit/wallet";
import { LAZORKIT_CONFIG } from "@/lib/config/lazorkit";

// Polyfill Buffer for client-side (required for Solana SDK)
if (typeof window !== "undefined") {
  window.Buffer = window.Buffer || require("buffer").Buffer;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <LazorkitProvider
          rpcUrl={LAZORKIT_CONFIG.RPC_URL}
          portalUrl={LAZORKIT_CONFIG.PORTAL_URL}
          paymasterConfig={LAZORKIT_CONFIG.PAYMASTER}
        >
          {children}
        </LazorkitProvider>
      </body>
    </html>
  );
}
```

**Important notes:**
- The `"use client"` directive is required because Lazorkit uses browser APIs
- The Buffer polyfill is needed for Solana's web3.js library
- The provider must wrap your entire app

## Step 4: Create a custom hook

Instead of using Lazorkit's hook directly everywhere, let's create a custom hook that adds useful features like balance fetching.

Create `lib/hooks/useLazorkitWallet.ts`:

```typescript
import { useEffect, useCallback, useRef } from "react";
import { useWallet } from "@lazorkit/wallet";
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useWalletStore } from "@/lib/store/walletStore";
import { LAZORKIT_CONFIG } from "@/lib/config/lazorkit";
import toast from "react-hot-toast";

export function useLazorkitWallet() {
  const lazorkitWalletHook = useWallet();
  const {
    connect: lazorkitConnect,
    disconnect: lazorkitDisconnect,
    signAndSendTransaction: lazorkitSignAndSendTransaction,
    isConnected: lazorkitIsConnected,
    isConnecting: lazorkitIsConnecting,
    wallet: lazorkitWallet,
    smartWalletPubkey: lazorkitSmartWalletPubkey,
  } = lazorkitWalletHook;

  const {
    isConnected,
    isConnecting,
    wallet,
    smartWalletAddress,
    balance,
    setConnecting,
    setConnected,
    setWallet,
    setSmartWalletAddress,
    setBalance,
    reset,
  } = useWalletStore();

  // Sync Lazorkit state with our store
  useEffect(() => {
    setConnected(lazorkitIsConnected);
    setConnecting(lazorkitIsConnecting);
    setWallet(lazorkitWallet || null);
    if (lazorkitSmartWalletPubkey) {
      setSmartWalletAddress(lazorkitSmartWalletPubkey.toString());
    }
  }, [
    lazorkitIsConnected,
    lazorkitIsConnecting,
    lazorkitWallet,
    lazorkitSmartWalletPubkey,
    setConnected,
    setConnecting,
    setWallet,
    setSmartWalletAddress,
  ]);

  /**
   * Fetch SOL balance for the connected wallet
   */
  const fetchBalance = useCallback(async () => {
    const address = lazorkitSmartWalletPubkey?.toString();
    if (!address) return;

    try {
      const connection = new Connection(LAZORKIT_CONFIG.RPC_URL, {
        commitment: "confirmed",
      });
      const publicKey = new PublicKey(address);
      const balance = await connection.getBalance(publicKey);
      setBalance(balance / LAMPORTS_PER_SOL);
    } catch (error: any) {
      // Silently handle rate limiting (429) errors
      if (error?.message?.includes("429") || error?.status === 429) {
        console.warn("RPC rate limited - balance update skipped");
        return;
      }
      console.error("Failed to fetch balance:", error);
    }
  }, [lazorkitSmartWalletPubkey, setBalance]);

  // Fetch balance when wallet connects
  useEffect(() => {
    if (lazorkitIsConnected && lazorkitSmartWalletPubkey) {
      fetchBalance();
    } else {
      setBalance(null);
    }
  }, [lazorkitIsConnected, lazorkitSmartWalletPubkey, fetchBalance, setBalance]);

  /**
   * Connect wallet with passkey authentication
   */
  const connect = async () => {
    try {
      setConnecting(true);
      const walletInfo = await lazorkitConnect({ feeMode: "paymaster" });
      setWallet(walletInfo);
      toast.success("Wallet connected successfully!");
      return walletInfo;
    } catch (error: any) {
      console.error("Connection failed:", error);
      toast.error(error?.message || "Failed to connect wallet");
      throw error;
    } finally {
      setConnecting(false);
    }
  };

  /**
   * Disconnect wallet and clear session
   */
  const disconnect = async () => {
    try {
      await lazorkitDisconnect();
      reset();
      toast.success("Wallet disconnected");
    } catch (error: any) {
      console.error("Disconnect failed:", error);
      toast.error(error?.message || "Failed to disconnect");
    }
  };

  return {
    // State
    isConnected,
    isConnecting,
    wallet,
    smartWalletAddress,
    balance,

    // Actions
    connect,
    disconnect,
    signAndSendTransaction: lazorkitSignAndSendTransaction as any,
    fetchBalance,
  };
}
```

**What's happening here?**
- We're wrapping Lazorkit's `useWallet` hook with our own logic
- We sync the state to a Zustand store (for global state management)
- We automatically fetch the balance when the wallet connects
- We handle errors gracefully with toast notifications

## Step 5: Create a connect button

Now let's create a simple button component that users can click to connect their wallet.

Create `components/ConnectButton.tsx`:

```typescript
"use client";

import { useLazorkitWallet } from "@/lib/hooks/useLazorkitWallet";

export function ConnectButton() {
  const { isConnected, isConnecting, wallet, connect, disconnect } =
    useLazorkitWallet();

  if (isConnected && wallet) {
    return (
      <button
        onClick={disconnect}
        className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
      >
        Disconnect ({wallet.smartWallet.slice(0, 6)}...)
      </button>
    );
  }

  return (
    <button
      onClick={connect}
      disabled={isConnecting}
      className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
    >
      {isConnecting ? "Connecting..." : "Connect Wallet"}
    </button>
  );
}
```

**Try it out:**
1. Click the "Connect Wallet" button
2. Your browser will prompt you to use biometric authentication (Face ID, Touch ID, etc.)
3. After authenticating, your wallet will be connected!

## Step 6: Display wallet information

Let's show the user their wallet address and balance.

Create `components/WalletInfo.tsx`:

```typescript
"use client";

import { useLazorkitWallet } from "@/lib/hooks/useLazorkitWallet";

export function WalletInfo() {
  const { wallet, smartWalletAddress, balance } = useLazorkitWallet();

  if (!wallet) return null;

  return (
    <div className="p-6 bg-gray-100 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Wallet Information</h2>
      <div className="space-y-2">
        <p>
          <strong>Address:</strong> {wallet.smartWallet}
        </p>
        <p>
          <strong>Balance:</strong> {balance !== null ? `${balance.toFixed(4)} SOL` : "Loading..."}
        </p>
        <p>
          <strong>Platform:</strong> {wallet.platform}
        </p>
      </div>
    </div>
  );
}
```

## How session persistence works

One of the best things about Lazorkit is that it automatically saves your session. This means:

- **Page refresh**: You stay connected after refreshing the page
- **New tab**: Your session is shared across tabs
- **Browser restart**: You can reconnect automatically (may require re-authentication)

**How it works:**
When you call `connect()`, Lazorkit:
1. Checks for an existing session in local storage
2. If found, restores the session silently (no popup)
3. If not found, triggers passkey authentication

You don't need to do anything special—it just works!

## Common mistakes

### Mistake 1: Forgetting the Buffer polyfill

**Problem:** You see "Buffer is not defined" errors in the browser.

**Solution:** Make sure you have the Buffer polyfill in your layout:

```typescript
if (typeof window !== "undefined") {
  window.Buffer = window.Buffer || require("buffer").Buffer;
}
```

### Mistake 2: Using the provider on the server

**Problem:** You get errors about browser APIs not being available.

**Solution:** Make sure your layout has `"use client"` at the top:

```typescript
"use client"; // This is required!
```

### Mistake 3: Not handling loading states

**Problem:** Users don't know if the connection is in progress.

**Solution:** Always check `isConnecting` and show a loading state:

```typescript
<button disabled={isConnecting}>
  {isConnecting ? "Connecting..." : "Connect Wallet"}
</button>
```

### Mistake 4: Not handling errors

**Problem:** Users see cryptic errors or nothing happens.

**Solution:** Wrap connection calls in try-catch and show user-friendly messages:

```typescript
try {
  await connect();
  toast.success("Connected!");
} catch (error: any) {
  if (error.message.includes("User cancelled")) {
    toast.error("Authentication cancelled");
  } else {
    toast.error("Connection failed: " + error.message);
  }
}
```

## Recap

You've learned how to:
- Set up Lazorkit in a Next.js app
- Create a connect button with passkey authentication
- Display wallet information and balance
- Handle session persistence automatically

**Key takeaways:**
- Passkeys eliminate the need for seed phrases
- Lazorkit handles session persistence automatically
- Always handle loading and error states
- The Buffer polyfill is required for Solana SDK

## Next steps

Now that you can connect a wallet, try these tutorials:
- [Gasless Transactions](./gasless-tx.md) - Send tokens without SOL for fees
- [Token Swaps](./token-swap.md) - Swap tokens using Jupiter
- [Subscription Service](./subscription.md) - Recurring payments

## Resources

- [Lazorkit Documentation](https://docs.lazorkit.com)
- [WebAuthn Specification](https://www.w3.org/TR/webauthn-2/)
- [Solana Web3.js Docs](https://solana-labs.github.io/solana-web3.js/)
