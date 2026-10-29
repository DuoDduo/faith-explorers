"use client";

import { useActionState } from "react";
import { FormField } from "@/components/forms/FormField";
import { FormStatus } from "@/components/forms/FormStatus";
import { changePassword } from "@/lib/actions/account";
import { initialFormState } from "@/lib/actions/form-state";
import { MIN_PASSWORD_LENGTH } from "@/lib/validation";

export function PasswordForm() {
  const [state, formAction, pending] = useActionState(changePassword, initialFormState);
  const errors = state.fieldErrors ?? {};
  return (
    <form className="contact-form" action={formAction} noValidate>
      <FormField
        name="current_password"
        label="Current password:"
        type="password"
        autoComplete="current-password"
        required
        error={errors.current_password}
      />
      <FormField
        name="new_password"
        label="New password:"
        type="password"
        autoComplete="new-password"
        minLength={MIN_PASSWORD_LENGTH}
        required
        error={errors.new_password}
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
        {pending ? "Saving…" : "Change password"}
      </button>
      <FormStatus state={state.fieldErrors ? initialFormState : state} />
    </form>
  );
}
