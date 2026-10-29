import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { connection } from "next/server";
import type { Comment } from "@/types/api";
import { apiGet } from "./http";

async function fetchLatestComments(limit: number) {
  "use cache";
  cacheLife("minutes");
  cacheTag("comments");
  return apiGet<Comment[]>("/comments/latest", { limit });
}

export async function getLatestComments(limit = 4): Promise<Comment[]> {
  await connection();
  return fetchLatestComments(limit);
}
