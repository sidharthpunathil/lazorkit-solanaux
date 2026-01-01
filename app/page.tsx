/**
 * Home Page - Landing Page
 * 
 * Landing page inspired by Lazorkit's official website.
 * Features hero section, navigation, and use case showcase.
 */

"use client";

import { Header, Hero, WalletStatus, UseCaseCard } from "@/components";
import Link from "next/link";

export default function Home() {
  const useCases = [
    {
      title: "Passkey Login",
      description:
        "Authenticate with biometric passkeys. No seed phrases, no extensions - just Face ID or Touch ID.",
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
      <Header />
      <Hero />
      
      <div className="container mx-auto px-6 lg:px-8 py-16">
        <WalletStatus />

        {/* Use Case Cards Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Explore Examples
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Learn how to integrate Lazorkit with practical, working examples
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {useCases.map((useCase) => (
              <UseCaseCard key={useCase.href} {...useCase} />
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-sm text-gray-500 mt-16 pt-8 border-t border-gray-200">
          <p>
            Built for the{" "}
            <a
              href="https://earn.superteam.fun/listing/integrate-passkey-technology-with-lazorkit-to-10x-solana-ux"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-600 hover:text-purple-700 transition-colors font-medium"
            >
              Lazorkit Bounty
            </a>
            {" • "}
            <a
              href="https://docs.lazorkit.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-600 hover:text-purple-700 transition-colors font-medium"
            >
              Documentation
            </a>
            {" • "}
            <a
              href="https://t.me/lazorkit"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-600 hover:text-purple-700 transition-colors font-medium"
            >
              Telegram
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
