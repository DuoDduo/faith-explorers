"use client";

import { useTransition } from "react";
import { deleteComment } from "@/lib/actions/comments";

export function DeleteCommentButton({ slug, commentId }: { slug: string; commentId: number }) {
  const [pending, startTransition] = useTransition();

  const onClick = () => {
    if (!window.confirm("Delete this comment?")) return;
    startTransition(() => deleteComment(slug, commentId));
  };

  return (
    <button type="button" className="link-button" onClick={onClick} disabled={pending}>
      {pending ? "Deleting…" : "Delete"}
    </button>
  );
}
