"use server";

import { apiPost } from "@/lib/api/http";

/** Count one article visit. Failures are ignored: a missed view isn't worth an error. */
export async function recordView(slug: string): Promise<void> {
  await apiPost(`/posts/${encodeURIComponent(slug)}/views`).catch(() => undefined);
}
