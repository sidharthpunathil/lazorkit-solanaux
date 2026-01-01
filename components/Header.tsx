/**
 * Header Component
 *
 * Top navigation header inspired by Lazorkit landing page.
 * Includes logo, navigation links, and CTA button.
 */

"use client";

import Link from "next/link";
import { useState } from "react";
import { NetworkSwitcher } from "./NetworkSwitcher";

export function Header() {
  const [copied, setCopied] = useState(false);

  const copyInstallCommand = async () => {
    try {
      await navigator.clipboard.writeText("npm i @lazorkit/wallet");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-600">
              <span className="text-white font-bold text-lg">L</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Lazorkit</span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            <a
              href="https://docs.lazorkit.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium"
            >
              Documentation
            </a>
            <a
              href="https://github.com/lazor-kit/lazor-kit"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium"
            >
              GitHub
            </a>
            <Link
              href="/passkey-login"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium"
            >
              Example dApp
            </Link>
            <a
              href="https://x.com/lazorkit"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium"
            >
              X
            </a>
            <a
              href="https://t.me/lazorkit"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium"
            >
              Telegram
            </a>
          </nav>

          {/* Right side: Network Switcher and Get Started Button */}
          <div className="flex items-center gap-4">
            <NetworkSwitcher />
          <Link
            href="/passkey-login"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 active:bg-purple-800 transition-colors"
          >
            Get Started
          </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

