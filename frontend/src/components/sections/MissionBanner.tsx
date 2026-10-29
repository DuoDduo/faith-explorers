import type { ReactNode } from "react";

/** Dark full-width band with a centered statement. */
export function MissionBanner({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="banner">
      <div className="content" data-aos="zoom-in-up">
        <h3>{title}</h3>
        {children}
      </div>
    </div>
  );
}
