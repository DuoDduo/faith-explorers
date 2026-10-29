"use client";

import Link from "next/link";
import { useActionState } from "react";
import { FormField } from "@/components/forms/FormField";
import { FormStatus } from "@/components/forms/FormStatus";
import { initialFormState } from "@/lib/actions/form-state";
import { requestPasswordReset } from "@/lib/actions/password";

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(requestPasswordReset, initialFormState);

  if (state.status === "success") {
    return (
      <>
        <FormStatus state={state} />
        <p className="auth-switch">
          <Link href="/login">Back to sign in</Link>
        </p>
      </>
    );
  }

  return (
    <form className="contact-form" action={formAction} noValidate>
      <p className="field-hint">
        Enter your email and we&apos;ll send you a link to reset your password.
      </p>
      <FormField
        name="email"
        label="Email:"
        type="email"
        autoComplete="email"
        required
        defaultValue={state.values?.email}
        error={state.fieldErrors?.email}
      />
      <button type="submit" disabled={pending}>
        {pending ? "Sending…" : "Send reset link"}
      </button>
      <FormStatus state={state} />
      <p className="auth-switch">
        Remembered it? <Link href="/login">Sign in</Link>
      </p>
    </form>
  );
}
