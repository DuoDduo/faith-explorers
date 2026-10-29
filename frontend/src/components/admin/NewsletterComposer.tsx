"use client";

import { useActionState } from "react";
import { FormField } from "@/components/forms/FormField";
import { FormStatus } from "@/components/forms/FormStatus";
import { sendNewsletter } from "@/lib/actions/admin";
import { initialFormState } from "@/lib/actions/form-state";

export function NewsletterComposer({ subscribers }: { subscribers: number }) {
  const [state, formAction, pending] = useActionState(sendNewsletter, initialFormState);
  const errors = state.fieldErrors ?? {};
  const values = state.values ?? {};

  return (
    <form className="contact-form newsletter-composer" action={formAction} noValidate>
      <FormField
        name="subject"
        label="Subject:"
        maxLength={200}
        required
        defaultValue={values.subject}
        error={errors.subject}
      />
      <FormField
        name="message"
        label="Message:"
        multiline
        rows={8}
        maxLength={10000}
        required
        placeholder="A short note to your readers…"
        defaultValue={values.message}
        error={errors.message}
      />
      <label className="checkbox-field">
        <input
          type="checkbox"
          name="include_recent"
          defaultChecked={state.values ? values.include_recent === "on" : true}
        />
        Add links to articles published since the last newsletter
      </label>
      <div className="newsletter-composer__buttons">
        <button
          type="submit"
          name="intent"
          value="test"
          disabled={pending}
          className="secondary-button"
        >
          Send test to me
        </button>
        <button
          type="submit"
          name="intent"
          value="send"
          disabled={pending || subscribers === 0}
          onClick={(e) => {
            const word = subscribers === 1 ? "subscriber" : "subscribers";
            if (
              !window.confirm(
                `Send this newsletter to ${subscribers} ${word}? This can't be undone.`,
              )
            ) {
              e.preventDefault();
            }
          }}
        >
          {pending
            ? "Sending…"
            : `Send to ${subscribers} subscriber${subscribers === 1 ? "" : "s"}`}
        </button>
      </div>
      <FormStatus state={state.fieldErrors ? initialFormState : state} />
    </form>
  );
}
