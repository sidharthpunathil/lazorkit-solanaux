/**
 * Documentation Page
 * 
 * Redirects to VitePress docs. Both servers need to be running:
 * - Next.js: bun run dev (port 3000)
 * - VitePress: bun run docs:dev (port 5173)
 * 
 * Or use: bun run dev:with-docs (runs both)
 */

"use client";

import { useEffect } from "react";

export default function DocsPage() {
  useEffect(() => {
    // Redirect to VitePress - it runs on its own port but is accessible from Next.js
    window.location.href = "http://localhost:5173";
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-4 text-foreground">
          Redirecting to Documentation...
        </h1>
        <p className="text-muted-foreground mb-4">
          Make sure VitePress is running:
        </p>
        <code className="bg-card px-4 py-2 rounded border border-border block">
          bun run docs:dev
        </code>
        <p className="text-muted-foreground mt-4 text-sm">
          Or run both together: <code className="bg-card px-2 py-1 rounded">bun run dev:with-docs</code>
        </p>
      </div>
    </div>
  );
}

