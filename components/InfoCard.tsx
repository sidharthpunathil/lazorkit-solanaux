/**
 * InfoCard Component
 * 
 * Reusable information card component for displaying tips and explanations.
 * Used throughout the app to provide context and guidance.
 */

interface InfoCardProps {
  title: string;
  items: string[];
  variant?: "blue" | "green" | "yellow";
}

const variantStyles = {
  blue: "bg-blue-50 border-blue-200 text-blue-900",
  green: "bg-green-50 border-green-200 text-green-900",
  yellow: "bg-amber-50 border-amber-200 text-amber-900",
};

export function InfoCard({
  title,
  items,
  variant = "blue",
}: InfoCardProps) {
  return (
    <div className={`${variantStyles[variant]} border rounded-2xl p-6`}>
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <ul className="text-sm space-y-2.5">
        {items.map((item, index) => (
          <li key={index} className="flex items-start gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-current mt-1.5 flex-shrink-0"></span>
            <span className="leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
