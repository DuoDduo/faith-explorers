"use client";

import Link from "next/link";
import { useActionState } from "react";
import { FormField } from "@/components/forms/FormField";
import { FormStatus } from "@/components/forms/FormStatus";
import { initialFormState } from "@/lib/actions/form-state";
import { resetPassword } from "@/lib/actions/password";
import { MIN_PASSWORD_LENGTH } from "@/lib/validation";

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(resetPassword, initialFormState);
  const errors = state.fieldErrors ?? {};

  return (
    <form className="contact-form" action={formAction} noValidate>
      <input type="hidden" name="token" value={token} />
      <FormField
        name="password"
        label="New password:"
        type="password"
        autoComplete="new-password"
        minLength={MIN_PASSWORD_LENGTH}
        required
        error={errors.password}
      />
      <FormField
        name="confirm"
        label="Repeat new password:"
        type="password"
        autoComplete="new-password"
        required
        error={errors.confirm}
      />
      <button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Set new password"}
      </button>
      <FormStatus state={state} />
      {state.status === "error" && state.message && (
        <p className="auth-switch">
          <Link href="/forgot-password">Request a new link</Link>
        </p>
      )}
    </form>
  );
}
