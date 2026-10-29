"use client";

import { useActionState } from "react";
import { FormField } from "@/components/forms/FormField";
import { FormStatus } from "@/components/forms/FormStatus";
import { deleteAccount } from "@/lib/actions/account";
import { initialFormState } from "@/lib/actions/form-state";

export function DeleteAccountForm() {
  const [state, formAction, pending] = useActionState(deleteAccount, initialFormState);
  const errors = state.fieldErrors ?? {};
  return (
    <form className="contact-form" action={formAction} noValidate>
      <label className="checkbox-field">
        <input type="checkbox" name="confirm" aria-invalid={errors.confirm ? true : undefined} />I
        understand my comments, likes and saved articles will be deleted, and this can&apos;t be
        undone.
      </label>
      {errors.confirm && <div className="error">{errors.confirm}</div>}
      <FormField
        name="password"
        label="Your password:"
        type="password"
        autoComplete="current-password"
        required
        error={errors.password}
      />
      <button type="submit" className="danger-button" disabled={pending}>
        {pending ? "Deleting…" : "Delete my account"}
      </button>
      <FormStatus state={state.fieldErrors ? initialFormState : state} />
    </form>
  );
}
