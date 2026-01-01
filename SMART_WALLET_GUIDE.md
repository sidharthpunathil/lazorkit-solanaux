# Smart Wallet Guide

## What is a Smart Wallet?

A **Smart Wallet** (also called a **Program Derived Address** or **PDA**) is a special type of Solana wallet address that is controlled by a program rather than a private key. In Lazorkit's case, your smart wallet is controlled by your **passkey** (biometric authentication).

### Key Characteristics:

- **No Seed Phrase**: Unlike traditional wallets, you don't need to store a 12/24-word seed phrase
- **Passkey-Controlled**: Your Face ID, Touch ID, or fingerprint controls the wallet
- **Program-Controlled**: The wallet is a PDA (Program Derived Address) managed by Lazorkit's smart contract
- **Real Solana Address**: It's a valid Solana address that can receive and send SOL and SPL tokens

## How is the Smart Wallet Created?

The smart wallet is **automatically created** when you first connect using passkey authentication:

1. **First Connection**: When you click "Connect Wallet" and authenticate with your passkey (Face ID/Touch ID), Lazorkit:
   - Creates a WebAuthn credential (your passkey) on your device
   - Generates a unique passkey public key
   - Derives a smart wallet address (PDA) from your passkey
   - Deploys the smart wallet on-chain (if it doesn't exist)

2. **Subsequent Connections**: When you reconnect:
   - Lazorkit recognizes your existing passkey
   - Restores your smart wallet address (same address every time)
   - No new wallet is created

### The Process:

```typescript
// When you call connect():
const walletInfo = await lazorkitWallet.connect({ feeMode: "paymaster" });

// Lazorkit returns:
{
  credentialId: "...",        // Your unique passkey ID
  passkeyPubkey: [...],       // Your passkey public key
  smartWallet: "FrXJTwqf...", // YOUR SMART WALLET ADDRESS (this is what you see!)
  walletDevice: "...",        // Internal device management PDA
  platform: "web",            // Platform info
  accountName: "..."          // Optional account name
}
```

## Network: Solana Devnet

**Your smart wallet is on Solana Devnet** (test network), not mainnet.

### How to Verify:

- **RPC URL**: `https://api.devnet.solana.com` (see `lib/config/lazorkit.ts`)
- **Paymaster**: `https://kora.devnet.lazorkit.com` (Devnet paymaster)
- **Explorer**: View your wallet at `https://explorer.solana.com/?cluster=devnet`

### Devnet vs Mainnet:

- **Devnet**: Free test SOL, no real value, for development/testing
- **Mainnet**: Real SOL, real value, for production

**Note**: Solana doesn't have a separate "testnet" - it uses "devnet" for testing.

## How is the Balance Created?

The balance you see (e.g., `0.0009 SOL`) is the **actual SOL balance** of your smart wallet address on Solana Devnet.

### How Balance is Fetched:

1. Your smart wallet address is queried on Solana Devnet
2. The RPC endpoint returns the balance in lamports (1 SOL = 1,000,000,000 lamports)
3. The balance is converted to SOL and displayed

```typescript
// From useLazorkitWallet.ts
const connection = new Connection("https://api.devnet.solana.com");
const balance = await connection.getBalance(publicKey);
setBalance(balance / LAMPORTS_PER_SOL); // Convert lamports to SOL
```

### Initial Balance:

When a smart wallet is first created, it starts with **0 SOL**. You need to fund it manually using a Devnet faucet.

## How to Increase the Balance (Get Devnet SOL)

Since you're on **Solana Devnet**, you need to get **free test SOL** from a faucet. Here are several options:

### Option 1: Solana Faucet (Recommended)

1. **Copy your smart wallet address** from the UI (e.g., `FrXJTwqf...hegpwE7Re`)
2. Visit: **https://faucet.solana.com/**
3. Paste your address and request SOL
4. You'll receive **2 SOL** per request (can request multiple times)

### Option 2: QuickNode Faucet

1. Visit: **https://faucet.quicknode.com/solana/devnet**
2. Enter your wallet address
3. Complete the captcha
4. Receive test SOL

### Option 3: SolFaucet

1. Visit: **https://solfaucet.com/**
2. Select "Devnet"
3. Enter your wallet address
4. Request SOL

### Option 4: Solana CLI (If you have it installed)

```bash
solana airdrop 2 <YOUR_SMART_WALLET_ADDRESS> --url devnet
```

### Option 5: Helius Faucet

1. Visit: **https://www.helius.dev/devnet-faucet**
2. Enter your wallet address
3. Request SOL

### How Much SOL Do You Need?

- **For Testing**: 1-2 SOL is usually enough
- **For Gasless Transactions**: You don't need SOL! The paymaster covers fees
- **For Regular Transactions**: You need SOL for transaction fees (~0.000005 SOL per transaction)

## Understanding Your Balance

### Current Balance Display:

The balance shown in the UI (e.g., `0.0009 SOL`) represents:
- **Real SOL on Devnet**: This is actual test SOL on Solana Devnet
- **Not Real Money**: Devnet SOL has no monetary value
- **For Testing Only**: Use it to test transactions, swaps, etc.

### Balance Updates:

- Balance is fetched when you connect
- Auto-refreshes every 30 seconds (to avoid rate limiting)
- You can manually refresh by reconnecting or calling `fetchBalance()`

## Common Questions

### Q: Is my wallet address permanent?
**A**: Yes! Your smart wallet address is derived from your passkey, so it's the same every time you connect.

### Q: Can I use this on Mainnet?
**A**: Yes, but you need to:
1. Change `RPC_URL` to a mainnet RPC
2. Change `PAYMASTER.paymasterUrl` to mainnet paymaster
3. Use real SOL (not test SOL)

### Q: What if I lose my device?
**A**: Your passkey is stored on your device. If you lose it, you'll need to:
- Use passkey recovery (if enabled)
- Or create a new wallet (new address)

### Q: Can I export my private key?
**A**: No. Smart wallets don't have traditional private keys. They're controlled by your passkey and the Lazorkit program.

### Q: Why do I see 429 errors?
**A**: The public Solana RPC endpoint (`api.devnet.solana.com`) has rate limits. This is normal and doesn't affect functionality. For production, use a dedicated RPC provider.

## Next Steps

1. **Fund Your Wallet**: Use one of the faucets above to get Devnet SOL
2. **Test Transactions**: Try the gasless transfer feature (doesn't require SOL!)
3. **Explore**: Check out token swaps and other features
4. **View on Explorer**: Copy your address and view it on Solana Explorer

## View Your Wallet on Explorer

1. Copy your smart wallet address from the UI
2. Visit: `https://explorer.solana.com/address/<YOUR_ADDRESS>?cluster=devnet`
3. See all transactions, token balances, and wallet details

---

**Remember**: This is Devnet - all SOL and tokens are for testing only!

