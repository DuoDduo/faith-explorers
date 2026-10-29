import Link from "next/link";
import { withQuery } from "@/lib/url";

interface FilterTabsProps {
  basePath: string;
  param: string;
  current: string;
  options: { value: string; label: string }[];
}

/** Link-based filter (keeps state in the URL so it's shareable and survives reloads). */
export function FilterTabs({ basePath, param, current, options }: FilterTabsProps) {
  return (
    <div className="filter-tabs" role="tablist">
      {options.map((option) => (
        <Link
          key={option.value}
          href={withQuery(basePath, { [param]: option.value })}
          role="tab"
          aria-selected={option.value === current}
        >
          {option.label}
        </Link>
      ))}
    </div>
  );
}
