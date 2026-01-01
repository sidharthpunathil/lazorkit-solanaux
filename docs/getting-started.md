---
layout: doc
title: Getting Started
description: Quick start guide for Lazorkit Solana UX Examples
---

# Getting Started

Welcome to Lazorkit Solana UX Examples! This guide will help you get started with passkey-powered, gasless Solana transactions.

## Prerequisites

- **Bun 1.0+** (recommended) or Node.js 18+
- A modern browser with WebAuthn support (Chrome, Safari, Firefox, Edge)
- A Solana Devnet wallet (created automatically on first connection)

## Installation

1. **Clone the repository**

```bash
git clone <your-repo-url>
cd lazorkit-solanaux
```

2. **Install dependencies**

```bash
bun install
# or
npm install
```

3. **Set up environment variables**

Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

The default configuration works with Solana Devnet out of the box. No additional setup required!

4. **Run the development server**

```bash
bun run dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## First Steps

1. **Connect Your Wallet**
   - Click "Connect Wallet" on the home page
   - Authenticate with your device's biometric (Face ID, Touch ID, or fingerprint)
   - Your smart wallet will be created automatically

2. **Get Test SOL**
   - Click the "Get Devnet SOL" button in your wallet info
   - This opens the Solana faucet with your address pre-filled
   - Request test SOL (usually 2 SOL per request)

3. **Try the Features**
   - **Passkey Login**: Experience seamless authentication
   - **Gasless Transfer**: Send SOL or USDC without holding SOL for fees
   - **Token Swap**: Swap tokens using Jupiter aggregator
   - **Subscription**: Set up recurring payments

## Network: Solana Devnet

All features work on **Solana Devnet** by default. This means:

- All transactions are on test network (no real money)
- Free test SOL from faucets
- Perfect for development and testing
- Same functionality as mainnet

To switch to mainnet, update your `.env.local` file with mainnet RPC and paymaster URLs.

## Next Steps

- Read the [Smart Wallet Guide](/smart-wallet-guide) to understand how smart wallets work
- Check out the [Tutorials](/tutorials) for step-by-step guides
- Explore the [Examples](/examples) to see code in action

## Need Help?

- Check the [FAQ](/faq)
- Join the [Lazorkit Telegram](https://t.me/lazorkit)
- Read the [Lazorkit Documentation](https://docs.lazorkit.com/)

