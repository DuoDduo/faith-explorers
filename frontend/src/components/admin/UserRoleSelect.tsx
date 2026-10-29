"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateUser } from "@/lib/actions/admin";
import type { Role } from "@/types/api";

const ROLES: { value: Role; label: string }[] = [
  { value: "reader", label: "Reader" },
  { value: "author", label: "Author" },
  { value: "admin", label: "Admin" },
];

export function UserRoleSelect({
  userId,
  role,
  name,
}: {
  userId: number;
  role: Role;
  name: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const onChange = (next: Role) => {
    if (next === "admin" && !window.confirm(`Give ${name} full admin access?`)) return;
    setError(null);
    startTransition(async () => {
      const result = await updateUser(userId, { role: next });
      if (result.error) setError(result.error);
      router.refresh();
    });
  };

  return (
    <span className="admin-action">
      <select
        aria-label={`Role for ${name}`}
        value={role}
        disabled={pending}
        onChange={(e) => onChange(e.target.value as Role)}
      >
        {ROLES.map((r) => (
          <option key={r.value} value={r.value}>
            {r.label}
          </option>
        ))}
      </select>
      {error && (
        <span className="form-error" role="alert">
          {error}
        </span>
      )}
    </span>
  );
}
