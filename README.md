# Lazorkit Solana UX Examples

> **A comprehensive Next.js starter template demonstrating passkey-powered, gasless Solana transactions**

Built for the [Lazorkit Bounty](https://earn.superteam.fun/listing/integrate-passkey-technology-with-lazorkit-to-10x-solana-ux) by Superteam Vietnam.

## Overview

This repository provides a production-ready example of integrating Lazorkit SDK with Next.js to create a seamless Solana Web3 experience. It demonstrates:

- **Passkey Authentication** - No seed phrases, no browser extensions
- **Gasless Transactions** - Send tokens without holding SOL for fees
- **Token Swaps** - Jupiter aggregator integration
- **Subscription Billing** - Recurring payments with smart wallet delegation

> **Network**: All features work on **Solana Devnet** by default. This is perfect for testing and development. The configuration uses Devnet RPC endpoints, Devnet paymaster, and Devnet token mints. See the [Smart Wallet Guide in Docs](/docs/smart-wallet-guide) for details on funding your wallet with test SOL.

## Features

### Core Features (Must-Have)

1. **Passkey Login Flow**
   - Biometric authentication (Face ID, Touch ID, Fingerprint)
   - Automatic smart wallet creation
   - Session persistence across devices
   - Cross-tab synchronization

2. **Gasless Transfers**
   - Send SOL without SOL for fees
   - Send USDC (or any SPL token) gaslessly
   - Pay fees in USDC instead of SOL
   - Perfect for onboarding new users

### Advanced Features

3. **Token Swap Interface**
   - Jupiter aggregator integration
   - Best price routing across all DEXs
   - Gasless swap execution
   - Real-time quotes with slippage protection

4. **Subscription Service**
   - One-time approval for recurring charges
   - Automated billing without user signatures
   - Smart wallet policy delegation
   - Cancel anytime

## Quick Start

> **Documentation**: Access documentation at `/docs` after starting both servers. See [Running the Application](#running-the-application) below.

> **New to Smart Wallets?** Check out [SMART_WALLET_GUIDE.md](./SMART_WALLET_GUIDE.md) or the [Smart Wallet Guide in Docs](/docs/smart-wallet-guide) to learn:
> - What a smart wallet is and how it's created
> - How to fund your wallet with Devnet SOL
> - Understanding balances and network details

### Prerequisites

- Bun 1.0+ (recommended) or Node.js 18+
- A modern browser with WebAuthn support (Chrome, Safari, Firefox, Edge)

### Installation

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

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

The default configuration works with Solana Devnet out of the box. No additional setup required!

The `.env.example` file contains all available environment variables with their default values. You can customize them if needed:

- `NEXT_PUBLIC_RPC_URL` - Solana RPC endpoint (default: Devnet)
- `NEXT_PUBLIC_PORTAL_URL` - Lazorkit portal URL (usually don't need to change)
- `NEXT_PUBLIC_PAYMASTER_URL` - Paymaster service URL (default: Devnet)
- `NEXT_PUBLIC_PAYMASTER_API_KEY` - Optional API key for paymaster

4. **Run the development server**

**Option 1: Run both servers together (Recommended)**
```bash
bun run dev:with-docs
```
This starts both Next.js (port 3000) and VitePress docs (port 5173) simultaneously.

**Option 2: Run separately**
```bash
# Terminal 1: Next.js app
bun run dev

# Terminal 2: VitePress docs  
bun run docs:dev
```

5. **Open your browser**

- Main app: [http://localhost:3000](http://localhost:3000)
- Documentation: [http://localhost:3000/docs](http://localhost:3000/docs) (redirects to VitePress)
- Docs directly: [http://localhost:5173](http://localhost:5173)

## Project Structure

```
lazorkit-solanaux/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Home page (navigation hub)
│   ├── passkey-login/     # Passkey authentication demo
│   ├── gasless-transfer/  # Gasless token transfers
│   ├── token-swap/        # Jupiter token swap interface
│   └── subscription/       # Subscription billing demo
├── components/             # Reusable React components
│   ├── ConnectButton.tsx
│   ├── WalletStatus.tsx
│   ├── WalletInfo.tsx
│   ├── TransferForm.tsx
│   ├── SwapInterface.tsx
│   └── ...                 # More reusable components
├── lib/
│   ├── config/            # Configuration files
│   │   └── lazorkit.ts    # Lazorkit SDK configuration
│   ├── hooks/             # Custom React hooks
│   │   ├── useLazorkitWallet.ts    # Main wallet hook
│   │   ├── useGaslessTransfer.ts   # Gasless transfer hook
│   │   └── useTokenSwap.ts         # Token swap hook
│   └── store/             # Zustand state management
│       └── walletStore.ts # Wallet state store
├── tutorials/             # Step-by-step tutorials
│   ├── passkey-wallet.md
│   ├── gasless-tx.md
│   ├── token-swap.md
│   └── subscription.md
└── README.md
```

## Tutorials

Detailed step-by-step guides are available in the `tutorials/` directory:

- **[Passkey Wallet Setup](./tutorials/passkey-wallet.md)** - Complete guide to implementing passkey authentication
- **[Gasless Transactions](./tutorials/gasless-tx.md)** - How to send tokens without SOL for fees
- **[Token Swaps](./tutorials/token-swap.md)** - Integrating Jupiter aggregator for token swaps
- **[Subscription Service](./tutorials/subscription.md)** - Building recurring payment systems

## Tech Stack

- **Framework**: Next.js 16.1.1 (App Router)
- **Language**: TypeScript
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **Blockchain**: Solana (via @solana/web3.js)
- **Wallet SDK**: @lazorkit/wallet
- **Token Swaps**: Jupiter Aggregator API
- **Notifications**: react-hot-toast
- **Package Manager**: Bun (recommended)

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_RPC_URL` | Solana RPC endpoint | `https://api.devnet.solana.com` |
| `NEXT_PUBLIC_PORTAL_URL` | Lazorkit portal URL | `https://portal.lazor.sh` |
| `NEXT_PUBLIC_PAYMASTER_URL` | Paymaster service URL | `https://kora.devnet.lazorkit.com` |
| `NEXT_PUBLIC_PAYMASTER_API_KEY` | Paymaster API key (optional) | - |

### Using Your Own RPC

For better performance and reliability, use a dedicated RPC provider:

```env
NEXT_PUBLIC_RPC_URL=https://your-rpc-endpoint.com
```

Recommended providers:
- [Helius](https://helius.dev)
- [QuickNode](https://quicknode.com)
- [Alchemy](https://www.alchemy.com)

## Customization

### Adding New Features

1. **Create a new page** in `app/your-feature/page.tsx`
2. **Add reusable components** in `components/` if needed
3. **Add a custom hook** in `lib/hooks/` if needed
4. **Update the home page** to include your feature card

### Styling

The project uses Tailwind CSS. Customize colors and styles in `tailwind.config.ts`.

## Testing

```bash
# Type checking
bun run type-check
# or
npm run type-check

# Linting
bun run lint
# or
npm run lint

# Format code
bun run format
# or
npm run format
```

## Deployment

### Deploy to Vercel

The app is configured for Vercel deployment out of the box. See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

**Quick Deploy:**

1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add environment variables (optional - defaults work for Devnet)
4. Deploy!

**Live Demo:** Once deployed, your app will be available at `https://your-project.vercel.app`

For detailed deployment instructions, troubleshooting, and best practices, see [DEPLOYMENT.md](./DEPLOYMENT.md).

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- AWS Amplify
- Self-hosted

## Key Concepts

### Passkeys vs Traditional Wallets

| Traditional Wallets | Passkeys (Lazorkit) |
|---------------------|---------------------|
| Seed phrases to manage | Biometric authentication |
| Browser extensions required | No extensions needed |
| Manual transaction signing | One-click approval |
| SOL needed for fees | Gasless transactions |

### Smart Wallets

Lazorkit creates a Program Derived Address (PDA) smart wallet for each user. This wallet:
- Is controlled by your passkey
- Supports gasless transactions
- Can delegate permissions for recurring payments
- Works across devices with the same passkey

### Gasless Transactions

The paymaster service sponsors transaction fees, allowing users to:
- Send tokens without holding SOL
- Pay fees in any token (e.g., USDC)
- Onboard new users instantly

## Contributing

This is a bounty submission, but suggestions and improvements are welcome!

## License

MIT License - feel free to use this as a starter template for your own projects.

## Resources

- [Lazorkit Documentation](https://docs.lazorkit.com)
- [Lazorkit GitHub](https://github.com/lazor-kit/lazor-kit)
- [Lazorkit Telegram](https://t.me/lazorkit)
- [Solana Documentation](https://docs.solana.com)
- [Jupiter Aggregator](https://jup.ag)

## Bounty Submission

This project was built for the **Lazorkit Bounty** by Superteam Vietnam.

**Judging Criteria:**
- **Clarity & Usefulness (40%)** - Comprehensive README, detailed tutorials, well-commented code
- **SDK Integration Quality (30%)** - Passkey auth, gasless transactions, smart wallet features
- **Code Structure & Reusability (30%)** - Clean architecture, reusable hooks, starter template quality

## Acknowledgments

- Lazorkit team for the amazing SDK
- Superteam Vietnam for organizing the bounty
- Jupiter team for the aggregator API
- Solana Foundation for passkey support

---

**Built for the Solana ecosystem**
