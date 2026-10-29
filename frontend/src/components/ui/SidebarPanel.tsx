import type { ReactNode } from "react";

/** Titled box used in the Articles page sidebar. */
export function SidebarPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="popularposts" data-aos="fade-up">
      <div className="poptitle">
        <h3>{title}</h3>
      </div>
      {children}
    </div>
  );
}
