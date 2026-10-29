import type { ReactNode } from "react";

/** Centered card used by the sign-in and registration pages. */
export function AuthCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="about container auth-page">
      <div className="contact-container content auth-card">
        <h1 className="h2">{title}</h1>
        {children}
      </div>
    </section>
  );
}
