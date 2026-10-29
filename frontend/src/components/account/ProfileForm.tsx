"use client";

import { useActionState } from "react";
import { FormField } from "@/components/forms/FormField";
import { FormStatus } from "@/components/forms/FormStatus";
import { updateProfile } from "@/lib/actions/account";
import { initialFormState } from "@/lib/actions/form-state";

export function ProfileForm({ name, bio }: { name: string; bio: string | null }) {
  const [state, formAction, pending] = useActionState(updateProfile, initialFormState);
  return (
    <form className="contact-form" action={formAction} noValidate>
      <FormField
        name="name"
        label="Name:"
        autoComplete="name"
        maxLength={120}
        required
        defaultValue={state.values?.name ?? name}
        error={state.fieldErrors?.name}
      />
      <FormField
        name="bio"
        label="About you (shown on your articles):"
        multiline
        rows={3}
        maxLength={500}
        defaultValue={state.values?.bio ?? bio ?? ""}
        error={state.fieldErrors?.bio}
      />
      <button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save profile"}
      </button>
      <FormStatus state={state.fieldErrors ? initialFormState : state} />
    </form>
  );
}
