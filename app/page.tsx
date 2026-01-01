/**
 * Home Page - Navigation Hub
 * 
 * Landing page that showcases all Lazorkit integration examples.
 * Clean, simple UI that guides users to different use cases.
 */

"use client";

import { WalletStatus, UseCaseCard } from "@/components";
import Link from "next/link";

export default function Home() {
  const useCases = [
    {
      title: "Passkey Login",
      description:
        "Experience seamless authentication with biometric passkeys. No seed phrases, no extensions - just Face ID or Touch ID.",
      href: "/passkey-login",
      badge: { label: "Core", variant: "core" as const },
      features: ["Smart wallet creation", "Session persistence", "Cross-device support"],
    },
    {
      title: "Gasless Transfer",
      description:
        "Send SOL or USDC without holding SOL for fees. Powered by Lazorkit's paymaster service.",
      href: "/gasless-transfer",
      badge: { label: "Core", variant: "core" as const },
      features: ["SOL transfers", "USDC transfers", "Zero gas fees"],
    },
    {
      title: "Token Swap",
      description:
        "Swap tokens on Solana using Jupiter aggregator. Execute swaps gaslessly with passkey authentication.",
      href: "/token-swap",
      badge: { label: "Recommended", variant: "recommended" as const },
      features: ["Jupiter integration", "Best route finding", "Gasless execution"],
    },
    {
      title: "Subscription Service",
      description:
        "Set up recurring USDC payments with smart wallet delegation. One-time approval, automated billing.",
      href: "/subscription",
      badge: { label: "Advanced", variant: "advanced" as const },
      features: ["Recurring payments", "Smart wallet policies", "Cancel anytime"],
    },
  ];

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-12 lg:px-8">
        {/* Header */}
        <header className="mb-16 text-center">
          <div className="mb-6">
            <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600 bg-clip-text text-transparent">
              Lazorkit Solana UX Examples
            </h1>
          </div>
          <p className="text-xl text-muted-foreground mb-3 max-w-2xl mx-auto">
            Passkey-powered, gasless Solana transactions
          </p>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            No seed phrases. No browser extensions. Just biometric authentication.
          </p>
        </header>

        <WalletStatus />

        {/* Use Case Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {useCases.map((useCase) => (
            <UseCaseCard key={useCase.href} {...useCase} />
          ))}
        </div>

        {/* Footer */}
        <footer className="text-center text-sm text-muted-foreground mt-16 pt-8 border-t border-border">
          <p>
            Built for the{" "}
            <a
              href="https://earn.superteam.fun/listing/integrate-passkey-technology-with-lazorkit-to-10x-solana-ux"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:text-purple-400 transition-colors"
            >
              Lazorkit Bounty
            </a>
            {" • "}
            <a
              href="https://docs.lazorkit.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:text-purple-400 transition-colors"
            >
              Documentation
            </a>
            {" • "}
            <a
              href="https://t.me/lazorkit"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:text-purple-400 transition-colors"
            >
              Telegram
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
