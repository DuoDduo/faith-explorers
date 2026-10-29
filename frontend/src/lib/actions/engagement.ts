"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { ApiError, apiDelete, apiPut } from "@/lib/api/http";
import { loginHref } from "@/lib/auth/redirect";
import { getSessionToken } from "@/lib/auth/session";
import type { Engagement } from "@/types/api";

async function setState(slug: string, kind: "like" | "bookmark", on: boolean): Promise<Engagement> {
  const back = `/articles/${slug}`;
  const token = await getSessionToken();
  if (!token) redirect(loginHref(back));

  const path = `/posts/${encodeURIComponent(slug)}/${kind}`;
  try {
    return on ? await apiPut<Engagement>(path, token) : await apiDelete<Engagement>(path, token);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect(loginHref(back));
    throw error;
  }
}

export async function setLiked(slug: string, liked: boolean): Promise<Engagement> {
  const state = await setState(slug, "like", liked);
  updateTag(`post:${slug}`); // cached post data carries like_count
  return state;
}

export async function setBookmarked(slug: string, bookmarked: boolean): Promise<Engagement> {
  return setState(slug, "bookmark", bookmarked);
}
