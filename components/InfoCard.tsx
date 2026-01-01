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
  blue: "bg-blue-500/10 border-blue-500/30 text-blue-400",
  green: "bg-green-500/10 border-green-500/30 text-green-400",
  yellow: "bg-yellow-500/10 border-yellow-500/30 text-yellow-400",
};

export function InfoCard({
  title,
  items,
  variant = "blue",
}: InfoCardProps) {
  return (
    <div className={`${variantStyles[variant]} border rounded-lg p-6`}>
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      <ul className="text-sm space-y-2 list-disc list-inside">
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
