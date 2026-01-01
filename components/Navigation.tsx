/**
 * Navigation Component
 * 
 * Reusable navigation component with home and docs links.
 * Used on feature pages to navigate between sections.
 */

import Link from "next/link";

export function Navigation() {
  return (
    <nav className="flex items-center justify-between mb-8">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors group"
      >
        <span className="group-hover:-translate-x-1 transition-transform">←</span>
        <span>Back to Home</span>
      </Link>
      <Link
        href="/docs"
        className="text-muted-foreground hover:text-accent transition-colors"
      >
        Documentation
      </Link>
    </nav>
  );
}
