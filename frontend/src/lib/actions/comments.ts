"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { ApiError, apiDelete, apiPost } from "@/lib/api/http";
import { loginHref } from "@/lib/auth/redirect";
import { getSessionToken } from "@/lib/auth/session";
import { formStateFromError } from "./errors";
import type { FormState } from "./form-state";

const MAX_LENGTH = 2000;

async function requireToken(slug: string): Promise<string> {
  const token = await getSessionToken();
  if (!token) redirect(loginHref(`/articles/${slug}`));
  return token;
}

function refreshComments(slug: string) {
  // Expire the cached thread and the site-wide "latest comments" so the writer sees it now.
  updateTag(`post:${slug}`);
  updateTag("comments");
}

export async function addComment(
  slug: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return { status: "error", fieldErrors: { body: "Write something first." } };
  if (body.length > MAX_LENGTH) {
    return {
      status: "error",
      fieldErrors: { body: `Comments can be up to ${MAX_LENGTH} characters.` },
      values: { body },
    };
  }

  const token = await requireToken(slug);
  try {
    await apiPost(`/posts/${encodeURIComponent(slug)}/comments`, { body }, token);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect(loginHref(`/articles/${slug}`));
    return { ...formStateFromError(error, "Couldn't post your comment."), values: { body } };
  }
  refreshComments(slug);
  return { status: "success", message: "Comment posted." };
}

export async function deleteComment(slug: string, commentId: number): Promise<void> {
  const token = await requireToken(slug);
  await apiDelete(`/comments/${commentId}`, token);
  refreshComments(slug);
}
