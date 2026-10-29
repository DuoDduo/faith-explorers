"use client";

import Link from "next/link";
import { useActionState } from "react";
import { FormField } from "@/components/forms/FormField";
import { FormStatus } from "@/components/forms/FormStatus";
import { login } from "@/lib/actions/auth";
import { initialFormState } from "@/lib/actions/form-state";

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction, pending] = useActionState(login, initialFormState);
  const errors = state.fieldErrors ?? {};

  return (
    <form className="contact-form" action={formAction} noValidate>
      <input type="hidden" name="next" value={next ?? "/"} />
      <FormField
        name="email"
        label="Email:"
        type="email"
        autoComplete="email"
        required
        defaultValue={state.values?.email}
        error={errors.email}
      />
      <FormField
        name="password"
        label="Password:"
        type="password"
        autoComplete="current-password"
        required
        error={errors.password}
      />
      <button type="submit" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
      <FormStatus state={state} />
      <p className="auth-switch">
        New here?{" "}
        <Link href={next ? `/register?next=${encodeURIComponent(next)}` : "/register"}>
          Create an account
        </Link>
      </p>
    </form>
  );
}
