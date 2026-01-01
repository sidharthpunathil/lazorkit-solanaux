/**
 * UseCaseCard Component
 * 
 * Reusable card component for displaying use case features.
 * Used on the home page to showcase different Lazorkit integrations.
 */

import Link from "next/link";

interface UseCaseCardProps {
  title: string;
  description: string;
  href: string;
  badge: {
    label: string;
    variant: "core" | "recommended" | "advanced";
  };
  features: string[];
}

const badgeStyles = {
  core: "bg-green-500/20 text-green-400 border-green-500/30",
  recommended: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  advanced: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

export function UseCaseCard({
  title,
  description,
  href,
  badge,
  features,
}: UseCaseCardProps) {
  return (
    <Link
      href={href}
      className="group block p-6 bg-card rounded-lg border border-border hover:border-accent/50 transition-all duration-200 hover:shadow-lg"
    >
      <div className="flex items-start justify-between mb-4">
        <h2 className="text-2xl font-semibold text-foreground group-hover:text-accent transition-colors">
          {title}
        </h2>
        <span
          className={`text-xs font-medium px-2.5 py-1 rounded border ${badgeStyles[badge.variant]}`}
        >
          {badge.label}
        </span>
      </div>
      <p className="text-muted-foreground mb-4 leading-relaxed">{description}</p>
      <ul className="text-sm text-muted-foreground space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-2">
            <span className="text-accent">•</span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </Link>
  );
}
