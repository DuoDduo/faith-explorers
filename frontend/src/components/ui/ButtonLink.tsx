import Link from "next/link";
import type { ReactNode } from "react";

/** Centered pill link ("All articles →"). */
export function ButtonLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <div className="showmorepost flex">
      <Link href={href}>
        {children} <i className="fa-solid fa-arrow-right" aria-hidden="true"></i>
      </Link>
    </div>
  );
}
