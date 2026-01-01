---
layout: home

hero:
  name: "Lazorkit Solana UX"
  text: "Examples"
  tagline: Passkey-powered, gasless Solana transactions
  actions:
    - theme: brand
      text: Get Started
      link: /getting-started
    - theme: alt
      text: View Live Demo
      link: http://localhost:3000

features:
  - title: Passkey Authentication
    details: No seed phrases, no browser extensions. Just biometric authentication with Face ID, Touch ID, or fingerprint.
  - title: Gasless Transactions
    details: Send tokens without holding SOL for fees. Powered by Lazorkit's paymaster service.
  - title: Token Swaps
    details: Swap tokens using Jupiter aggregator. Execute swaps gaslessly with passkey authentication.
  - title: Smart Wallets
    details: Program-controlled wallets (PDAs) that are secure, recoverable, and user-friendly.

---

## Quick Start

```bash
# Install dependencies
bun install

# Run development server
bun run dev

# Open http://localhost:3000
```

## Features

### Core Features

- **Passkey Login Flow** - Biometric authentication with smart wallet creation
- **Gasless Transfers** - Send SOL or USDC without holding SOL for fees
- **Token Swap Interface** - Jupiter aggregator integration
- **Subscription Service** - Recurring payments with smart wallet delegation

### Network Support

All features work on **Solana Devnet** by default. Perfect for testing and development!

## Documentation

- [Getting Started](/getting-started) - Quick setup guide
- [Smart Wallet Guide](/smart-wallet-guide) - Understanding smart wallets
- [Tutorials](/tutorials/passkey-wallet) - Step-by-step guides

## Resources

- [Lazorkit Documentation](https://docs.lazorkit.com/)
- [Lazorkit GitHub](https://github.com/lazor-kit/lazor-kit)
- [Lazorkit Telegram](https://t.me/lazorkit)

