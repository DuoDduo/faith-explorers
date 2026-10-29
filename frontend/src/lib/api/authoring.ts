import "server-only";

import { getSessionToken } from "@/lib/auth/session";
import type { AuthorApplication, MyPost, MyPostSummary, Page } from "@/types/api";
import { ApiError, apiGet } from "./http";

// An author's own drafts and applications: per-user, never cached. Call inside <Suspense>.

export async function getMyApplication(): Promise<AuthorApplication | null> {
  return apiGet<AuthorApplication | null>(
    "/me/author-application",
    undefined,
    await getSessionToken(),
  );
}

export async function getMyPosts(page = 1): Promise<Page<MyPostSummary>> {
  return apiGet<Page<MyPostSummary>>("/me/posts", { page }, await getSessionToken());
}

export async function getMyPost(id: number): Promise<MyPost | null> {
  try {
    return await apiGet<MyPost>(`/me/posts/${id}`, undefined, await getSessionToken());
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}
