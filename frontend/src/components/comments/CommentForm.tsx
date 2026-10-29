"use client";

import { useActionState } from "react";
import { FormField } from "@/components/forms/FormField";
import { FormStatus } from "@/components/forms/FormStatus";
import { addComment } from "@/lib/actions/comments";
import { initialFormState } from "@/lib/actions/form-state";

export function CommentForm({ slug, userName }: { slug: string; userName: string }) {
  const [state, formAction, pending] = useActionState(
    addComment.bind(null, slug),
    initialFormState,
  );

  return (
    <form className="contact-form comment-form" action={formAction} noValidate>
      <FormField
        name="body"
        label={`Comment as ${userName}:`}
        multiline
        rows={3}
        maxLength={2000}
        required
        defaultValue={state.values?.body}
        error={state.fieldErrors?.body}
      />
      <button type="submit" disabled={pending}>
        {pending ? "Posting…" : "Post comment"}
      </button>
      <FormStatus state={state.fieldErrors ? initialFormState : state} />
    </form>
  );
}
