"use client";

import Link from "next/link";
import { useActionState } from "react";
import { FormField } from "@/components/forms/FormField";
import { FormStatus } from "@/components/forms/FormStatus";
import { register } from "@/lib/actions/auth";
import { initialFormState } from "@/lib/actions/form-state";
import { MIN_PASSWORD_LENGTH } from "@/lib/validation";

export function RegisterForm({ next }: { next?: string }) {
  const [state, formAction, pending] = useActionState(register, initialFormState);
  const errors = state.fieldErrors ?? {};

  return (
    <form className="contact-form" action={formAction} noValidate>
      <input type="hidden" name="next" value={next ?? "/"} />
      <FormField
        name="name"
        label="Name:"
        autoComplete="name"
        required
        defaultValue={state.values?.name}
        error={errors.name}
      />
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
        autoComplete="new-password"
        minLength={MIN_PASSWORD_LENGTH}
        required
        error={errors.password}
      />
      <button type="submit" disabled={pending}>
        {pending ? "Creating account…" : "Create account"}
      </button>
      <FormStatus state={state.fieldErrors ? { status: "idle" } : state} />
      <p className="auth-switch">
        Already have an account?{" "}
        <Link href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"}>Sign in</Link>
      </p>
    </form>
  );
}
