"use client";

import { useActionState } from "react";
import { FormStatus } from "@/components/forms/FormStatus";
import { type FormState, initialFormState } from "@/lib/actions/form-state";

interface TokenActionFormProps {
  token: string;
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  label: string;
  pendingLabel: string;
}

/**
 * One-button form for links in emails (confirm, unsubscribe). Acting on a click rather than
 * on page load stops email security scanners, which open links, from triggering it.
 */
export function TokenActionForm({ token, action, label, pendingLabel }: TokenActionFormProps) {
  const [state, formAction, pending] = useActionState(action, initialFormState);

  if (state.status === "success") return <FormStatus state={state} />;

  return (
    <form className="contact-form" action={formAction}>
      <input type="hidden" name="token" value={token} />
      <button type="submit" disabled={pending}>
        {pending ? pendingLabel : label}
      </button>
      <FormStatus state={state} />
    </form>
  );
}
