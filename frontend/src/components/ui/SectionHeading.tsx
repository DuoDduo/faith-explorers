import type { ReactNode } from "react";

interface SectionHeadingProps {
  title: ReactNode;
  subtitle?: ReactNode;
  id?: string;
  /** Extra content aligned to the right of the heading (e.g. a search box). */
  aside?: ReactNode;
  /** Constrain to the page container (off when nested inside another column). */
  contained?: boolean;
}

export function SectionHeading({
  title,
  subtitle,
  id,
  aside,
  contained = true,
}: SectionHeadingProps) {
  const classes = ["bigtitle", contained && "container", aside && "section-heading--split"];
  return (
    <div className={classes.filter(Boolean).join(" ")} id={id}>
      <div>
        <h2 className="textcolor">{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {aside}
    </div>
  );
}
