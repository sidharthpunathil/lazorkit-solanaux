/**
 * Header Component
 *
 * Top navigation header inspired by Lazorkit landing page.
 * Includes logo, navigation links, and CTA button.
 */

"use client";

import Link from "next/link";
import { useState } from "react";

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
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded bg-gradient-to-br from-purple-500 to-purple-600">
              <span className="text-white font-bold text-lg">L</span>
            </div>
            <span className="text-xl font-bold text-foreground">Lazorkit</span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            <a
              href="https://docs.lazorkit.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Documentation
            </a>
            <a
              href="https://github.com/lazor-kit/lazor-kit"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              GitHub
            </a>
            <Link
              href="/passkey-login"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Example dApp
            </Link>
            <a
              href="https://x.com/lazorkit"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              X
            </a>
            <a
              href="https://t.me/lazorkit"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Telegram
            </a>
          </nav>

          {/* Get Started Button */}
          <Link
            href="/passkey-login"
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-lg font-medium hover:from-purple-500 hover:to-purple-400 transition-all shadow-lg shadow-purple-500/20"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}

