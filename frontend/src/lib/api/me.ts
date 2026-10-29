import "server-only";

import { getSessionToken } from "@/lib/auth/session";
import type { Engagement, Page, PostSummary } from "@/types/api";
import { apiGet } from "./http";

// Per-user data: never cached on the server. Call inside <Suspense>.

export async function getEngagement(slug: string): Promise<Engagement> {
  const token = await getSessionToken();
  return apiGet<Engagement>(`/posts/${encodeURIComponent(slug)}/engagement`, undefined, token);
}

export async function getMyBookmarks(page = 1, pageSize = 9): Promise<Page<PostSummary>> {
  const token = await getSessionToken();
  return apiGet<Page<PostSummary>>("/me/bookmarks", { page, page_size: pageSize }, token);
}
