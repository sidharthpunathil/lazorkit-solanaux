---
title: Passkey Authentication
description: Step-by-step guide to implementing passkey authentication with Lazorkit
---

# Tutorial: Implementing Passkey Authentication with Lazorkit

This tutorial walks you through implementing passkey-based wallet authentication using Lazorkit SDK in a Next.js application.

## Overview

Passkeys provide a secure, passwordless authentication method using your device's biometric authentication (Face ID, Touch ID, fingerprint). With Lazorkit, you can create Solana wallets that are controlled by passkeys instead of seed phrases.

### What You'll Build

- A connect button that triggers passkey authentication
- Automatic smart wallet creation
- Display wallet information and balance
- Message signing with passkey
- Session persistence across page refreshes

## Why Passkeys?

### Traditional Wallet Problems

- **Seed phrases**: Easy to lose, hard to remember, security risk if exposed
- **Browser extensions**: Additional installation, compatibility issues
- **Manual signing**: Every transaction requires user interaction

### Passkey Benefits

- **No seed phrases**: Your device's biometric authentication is your key
- **No extensions**: Works natively in modern browsers
- **Better UX**: One-click authentication, automatic session restoration
- **More secure**: Private keys never leave your device

## Setup

### 1. Install Dependencies

```bash
bun install @lazorkit/wallet @solana/web3.js buffer
```

### 2. Configure Lazorkit Provider

Create `lib/config/lazorkit.ts`:

```typescript
export const LAZORKIT_CONFIG = {
  RPC_URL: process.env.NEXT_PUBLIC_RPC_URL || "https://api.devnet.solana.com",
  PORTAL_URL: process.env.NEXT_PUBLIC_PORTAL_URL || "https://portal.lazor.sh",
  PAYMASTER: {
    paymasterUrl: process.env.NEXT_PUBLIC_PAYMASTER_URL || "https://kora.devnet.lazorkit.com",
  },
};
```

### 3. Set Up Provider in Layout

In `app/layout.tsx`:

```typescript
import { LazorkitProvider } from "@lazorkit/wallet";
import { LAZORKIT_CONFIG } from "@/lib/config/lazorkit";

export default function RootLayout({ children }) {
  return (
    <html>
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

## Implementation

### Step 1: Create Custom Hook

Create `lib/hooks/useLazorkitWallet.ts`:

```typescript
import { useWallet } from "@lazorkit/wallet";
import { useWalletStore } from "@/lib/store/walletStore";

export function useLazorkitWallet() {
  const lazorkitWallet = useWallet();
  const { isConnected, wallet, connect, disconnect } = useWalletStore();

  return {
    isConnected,
    wallet,
    connect: () => connect({ feeMode: "paymaster" }),
    disconnect,
  };
}
```

### Step 2: Create Connect Button Component

```typescript
"use client";

import { useLazorkitWallet } from "@/lib/hooks/useLazorkitWallet";

export function ConnectButton() {
  const { isConnected, isConnecting, wallet, connect, disconnect } = useLazorkitWallet();

  if (isConnected && wallet) {
    return (
      <button onClick={disconnect}>
        Disconnect ({wallet.smartWallet.slice(0, 6)}...)
      </button>
    );
  }

  return (
    <button onClick={connect} disabled={isConnecting}>
      {isConnecting ? "Connecting..." : "Connect Wallet"}
    </button>
  );
}
```

## Session Persistence

Lazorkit automatically persists sessions in the browser's local storage. This means:

1. **Page Refresh**: User stays connected after refreshing
2. **New Tab**: Session is shared across tabs
3. **Browser Restart**: User can reconnect automatically

## Best Practices

1. **Error Handling**: Always wrap connect/disconnect in try-catch
2. **Loading States**: Show loading indicators during connection
3. **User Feedback**: Use toast notifications for success/error states
4. **Balance Updates**: Fetch balance after successful connection

## Next Steps

- Learn about [Gasless Transactions](/tutorials/gasless-tx)
- Explore [Token Swaps](/tutorials/token-swap)
- Check out the [Smart Wallet Guide](/smart-wallet-guide)

