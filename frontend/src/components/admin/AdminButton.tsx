"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useState, useTransition } from "react";
import type { AdminResult } from "@/lib/actions/admin";

interface AdminButtonProps {
  action: () => Promise<AdminResult>;
  children: ReactNode;
  confirm?: string;
  variant?: "primary" | "secondary" | "danger";
}

/** Runs an admin server action, then refreshes the page or shows the API's error. */
export function AdminButton({
  action,
  children,
  confirm,
  variant = "secondary",
}: AdminButtonProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const onClick = () => {
    if (confirm && !window.confirm(confirm)) return;
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (result.error) setError(result.error);
      else router.refresh();
    });
  };

  return (
    <span className="admin-action">
      <button
        type="button"
        className={`admin-button admin-button--${variant}`}
        onClick={onClick}
        disabled={pending}
      >
        {pending ? "Working…" : children}
      </button>
      {error && (
        <span className="form-error" role="alert">
          {error}
        </span>
      )}
    </span>
  );
}
