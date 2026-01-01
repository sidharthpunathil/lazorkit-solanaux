---
layout: doc
title: Smart Wallet Guide
description: Learn about smart wallets, how they're created, and how to fund them
---

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

## How to Fund Your Wallet

Since you're on **Solana Devnet**, you need to get **free test SOL** from a faucet:

1. **Copy your smart wallet address** from the UI (click "Show Full" to see the complete address)
2. Click the **"Get Devnet SOL"** button in your wallet info
3. This opens the Solana faucet with your address pre-filled
4. Request test SOL (usually 2 SOL per request)

### Alternative Faucets:

- **Solana Faucet**: https://faucet.solana.com/
- **QuickNode Faucet**: https://faucet.quicknode.com/solana/devnet
- **SolFaucet**: https://solfaucet.com/

## Understanding Your Balance

The balance you see (e.g., `0.0009 SOL`) is the **actual SOL balance** of your smart wallet address on Solana Devnet.

### Initial Balance:

When a smart wallet is first created, it starts with **0 SOL**. You need to fund it manually using a Devnet faucet.

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

