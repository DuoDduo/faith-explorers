"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deletePost, submitPost, withdrawPost } from "@/lib/actions/authoring";
import type { PostStatus, Role } from "@/types/api";

interface PostStatusActionsProps {
  postId: number;
  slug: string;
  status: PostStatus;
  role: Role;
}

/** Submit / withdraw / delete controls for a post the user is editing. */
export function PostStatusActions({ postId, slug, status, role }: PostStatusActionsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const run = (action: () => Promise<void>, confirmText?: string) => {
    if (confirmText && !window.confirm(confirmText)) return;
    setError(null);
    startTransition(async () => {
      try {
        await action();
        router.refresh(); // show the new status
      } catch {
        setError("That didn't work. Please try again.");
      }
    });
  };

  const isAdmin = role === "admin";

  return (
    <div className="post-status-actions">
      {status === "draft" && (
        <button
          type="button"
          className="retry-button"
          disabled={pending}
          onClick={() =>
            run(
              () => submitPost(postId),
              isAdmin ? "Publish this article now?" : "Send this article for review?",
            )
          }
        >
          {isAdmin ? "Publish" : "Submit for review"}
        </button>
      )}
      {status === "pending" && (
        <button
          type="button"
          className="engagement-button"
          disabled={pending}
          onClick={() => run(() => withdrawPost(postId))}
        >
          Withdraw from review
        </button>
      )}
      {status === "published" && (
        <Link href={`/articles/${slug}`} className="engagement-button">
          View article
        </Link>
      )}
      {(status !== "published" || isAdmin) && (
        <button
          type="button"
          className="link-button danger"
          disabled={pending}
          onClick={() =>
            run(async () => {
              await deletePost(postId);
              router.push("/dashboard");
            }, "Delete this article? This can't be undone.")
          }
        >
          Delete
        </button>
      )}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
