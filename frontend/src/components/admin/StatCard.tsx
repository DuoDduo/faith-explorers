import Link from "next/link";

interface StatCardProps {
  label: string;
  value: number;
  href: string;
  /** Highlight when something is waiting for an admin. */
  attention?: boolean;
}

export function StatCard({ label, value, href, attention = false }: StatCardProps) {
  return (
    <Link
      href={href}
      className={`stat-card${attention && value > 0 ? " stat-card--attention" : ""}`}
    >
      <span className="stat-card__value">{value}</span>
      <span className="stat-card__label">{label}</span>
    </Link>
  );
}
