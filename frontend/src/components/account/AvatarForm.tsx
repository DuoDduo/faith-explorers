"use client";

import { useActionState, useTransition } from "react";
import { FormStatus } from "@/components/forms/FormStatus";
import { Avatar } from "@/components/ui/Avatar";
import { removeAvatar, uploadAvatar } from "@/lib/actions/account";
import { initialFormState } from "@/lib/actions/form-state";

export function AvatarForm({ name, avatarUrl }: { name: string; avatarUrl: string | null }) {
  const [state, formAction, pending] = useActionState(uploadAvatar, initialFormState);
  const [removing, startRemoving] = useTransition();

  return (
    <div className="avatar-form">
      <Avatar src={avatarUrl} name={name} size={96} />
      <form action={formAction} className="avatar-form__controls">
        <label className="engagement-button">
          <i className="fa-solid fa-camera" aria-hidden="true"></i>{" "}
          {pending ? "Uploading…" : avatarUrl ? "Change photo" : "Add a photo"}
          <input
            type="file"
            name="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            disabled={pending}
            onChange={(e) => e.currentTarget.form?.requestSubmit()}
          />
        </label>
        {avatarUrl && (
          <button
            type="button"
            className="link-button"
            disabled={removing}
            onClick={() => startRemoving(() => removeAvatar())}
          >
            {removing ? "Removing…" : "Remove"}
          </button>
        )}
        {state.fieldErrors?.file ? (
          <p className="form-error" role="alert">
            {state.fieldErrors.file}
          </p>
        ) : (
          <FormStatus state={state} />
        )}
      </form>
    </div>
  );
}
