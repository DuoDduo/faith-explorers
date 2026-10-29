"use client";

import { useActionState } from "react";
import { FormField } from "@/components/forms/FormField";
import { FormStatus } from "@/components/forms/FormStatus";
import { applyToWrite } from "@/lib/actions/authoring";
import { initialFormState } from "@/lib/actions/form-state";

export function ApplicationForm() {
  const [state, formAction, pending] = useActionState(applyToWrite, initialFormState);

  if (state.status === "success") return <FormStatus state={state} />;

  return (
    <form className="contact-form" action={formAction} noValidate>
      <FormField
        name="motivation"
        label="What would you like to write about, and why?"
        multiline
        rows={6}
        minLength={30}
        maxLength={2000}
        required
        defaultValue={state.values?.motivation}
        error={state.fieldErrors?.motivation}
      />
      <button type="submit" disabled={pending}>
        {pending ? "Sending…" : "Send application"}
      </button>
      <FormStatus state={state.fieldErrors ? initialFormState : state} />
    </form>
  );
}
