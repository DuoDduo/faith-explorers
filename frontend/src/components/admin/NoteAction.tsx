"use client";

import { useRouter } from "next/navigation";
import { useId, useState, useTransition } from "react";
import type { AdminResult } from "@/lib/actions/admin";

interface NoteActionProps {
  action: (note?: string) => Promise<AdminResult>;
  label: string;
  submitLabel: string;
  placeholder: string;
}

/** A button that opens a short note box (e.g. feedback when rejecting) before acting. */
export function NoteAction({ action, label, submitLabel, placeholder }: NoteActionProps) {
  const router = useRouter();
  const id = useId();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!open) {
    return (
      <button
        type="button"
        className="admin-button admin-button--danger"
        onClick={() => setOpen(true)}
      >
        {label}
      </button>
    );
  }

  const submit = () => {
    setError(null);
    startTransition(async () => {
      const result = await action(note);
      if (result.error) setError(result.error);
      else router.refresh();
    });
  };

  return (
    <div className="note-action">
      <label htmlFor={id}>Note for the writer (optional)</label>
      <textarea
        id={id}
        rows={3}
        maxLength={1000}
        placeholder={placeholder}
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <div className="note-action__buttons">
        <button
          type="button"
          className="admin-button admin-button--danger"
          onClick={submit}
          disabled={pending}
        >
          {pending ? "Working…" : submitLabel}
        </button>
        <button type="button" className="link-button" onClick={() => setOpen(false)}>
          Cancel
        </button>
      </div>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
