/**
 * Navigation Component
 * 
 * Reusable navigation component with home and docs links.
 * Used on feature pages to navigate between sections.
 */

import Link from "next/link";
import { NetworkSwitcher } from "./NetworkSwitcher";

export function Navigation() {
  return (
    <nav className="flex items-center justify-between mb-8">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group font-medium"
      >
        <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span>Back to Home</span>
      </Link>
      <div className="flex items-center gap-4">
        <Link
          href="/docs"
          className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
        >
          Documentation
        </Link>
        <NetworkSwitcher />
      </div>
    </nav>
  );
}
