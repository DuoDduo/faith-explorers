import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { connection } from "next/server";
import type { Comment, Page, PostDetail, PostQuery, PostSummary } from "@/types/api";
import { apiGet, apiGetOrNull } from "./http";

// Each public getter first calls connection() so the read happens at request time
// (builds don't need the API running), then goes through a "use cache" function so
// repeated reads within a few minutes are served from cache.

async function fetchPosts(query: PostQuery) {
  "use cache";
  cacheLife("minutes");
  cacheTag("posts");
  return apiGet<Page<PostSummary>>("/posts", { ...query });
}

async function fetchPost(slug: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag("posts", `post:${slug}`);
  return apiGetOrNull<PostDetail>(`/posts/${encodeURIComponent(slug)}`);
}

async function fetchPostComments(slug: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag("comments", `post:${slug}`);
  return apiGet<Comment[]>(`/posts/${encodeURIComponent(slug)}/comments`);
}

export async function getPosts(query: PostQuery = {}): Promise<Page<PostSummary>> {
  await connection();
  return fetchPosts(query);
}

export async function getPost(slug: string): Promise<PostDetail | null> {
  await connection();
  return fetchPost(slug);
}

export async function getPostComments(slug: string): Promise<Comment[]> {
  await connection();
  return fetchPostComments(slug);
}
