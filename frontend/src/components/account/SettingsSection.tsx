import type { ReactNode } from "react";

export function SettingsSection({
  title,
  description,
  children,
  danger = false,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  danger?: boolean;
}) {
  return (
    <section className={`settings-section${danger ? " settings-section--danger" : ""}`}>
      <h2>{title}</h2>
      {description && <p className="field-hint">{description}</p>}
      {children}
    </section>
  );
}
