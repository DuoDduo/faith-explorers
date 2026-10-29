"use client";

import { useActionState } from "react";
import { FormField } from "@/components/forms/FormField";
import { FormStatus } from "@/components/forms/FormStatus";
import { submitContact } from "@/lib/actions/contact";
import { initialFormState } from "@/lib/actions/form-state";

export function ContactForm() {
  const [state, formAction, pending] = useActionState(submitContact, initialFormState);
  const errors = state.fieldErrors ?? {};
  const values = state.values ?? {};

  return (
    <form className="contact-form" action={formAction} noValidate>
      <FormField
        name="name"
        label="Name:"
        autoComplete="name"
        required
        defaultValue={values.name}
        error={errors.name}
      />
      <FormField
        name="email"
        label="Email:"
        type="email"
        autoComplete="email"
        required
        defaultValue={values.email}
        error={errors.email}
      />
      <FormField
        name="message"
        label="Message:"
        multiline
        rows={4}
        required
        defaultValue={values.message}
        error={errors.message}
      />
      <button type="submit" disabled={pending}>
        {pending ? "Sending…" : "Send Message"}
      </button>
      {/* Field errors are shown next to each field; this shows success or general failures. */}
      <FormStatus state={state.fieldErrors ? initialFormState : state} />
    </form>
  );
}
