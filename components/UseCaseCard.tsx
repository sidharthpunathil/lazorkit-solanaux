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
  core: "bg-green-50 text-green-700 border-green-200",
  recommended: "bg-blue-50 text-blue-700 border-blue-200",
  advanced: "bg-purple-50 text-purple-700 border-purple-200",
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
      className="group block p-6 bg-white rounded-2xl border border-gray-200 hover:border-purple-300 transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/5"
    >
      <div className="flex items-start justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
          {title}
        </h2>
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${badgeStyles[badge.variant]}`}
        >
          {badge.label}
        </span>
      </div>
      <p className="text-gray-600 mb-5 leading-relaxed text-sm">{description}</p>
      <ul className="text-sm text-gray-600 space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 flex-shrink-0"></span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </Link>
  );
}
