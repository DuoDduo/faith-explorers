import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { connection } from "next/server";
import type { AuthorProfile } from "@/types/api";
import { apiGetOrNull } from "./http";

async function fetchAuthor(id: number) {
  "use cache";
  cacheLife("hours");
  // Post counts change when articles are published or unpublished.
  cacheTag("posts", `author:${id}`);
  return apiGetOrNull<AuthorProfile>(`/authors/${id}`);
}

/** Public profile of an author with published articles, or null. */
export async function getAuthor(id: number): Promise<AuthorProfile | null> {
  await connection();
  return fetchAuthor(id);
}
