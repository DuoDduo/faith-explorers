"use client";

import { useActionState } from "react";
import { FormStatus } from "@/components/forms/FormStatus";
import { initialFormState } from "@/lib/actions/form-state";
import { subscribeToNewsletter } from "@/lib/actions/newsletter";

export function NewsletterForm() {
  const [state, formAction, pending] = useActionState(subscribeToNewsletter, initialFormState);
  const emailError = state.fieldErrors?.email;

  return (
    <form action={formAction} noValidate>
      <input
        type="email"
        name="email"
        placeholder="Enter your email"
        className="email"
        aria-label="Email address"
        aria-invalid={emailError ? true : undefined}
        required
        defaultValue={state.values?.email}
      />
      <input
        type="submit"
        value={pending ? "Subscribing…" : "Subscribe"}
        className="btn"
        disabled={pending}
      />
      {emailError ? (
        <p className="form-error" role="alert">
          {emailError}
        </p>
      ) : (
        <FormStatus state={state} />
      )}
    </form>
  );
}
