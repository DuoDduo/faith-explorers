import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { connection } from "next/server";
import type { Category } from "@/types/api";
import { apiGet, apiGetOrNull } from "./http";

async function fetchCategories() {
  "use cache";
  cacheLife("hours");
  cacheTag("categories");
  return apiGet<Category[]>("/categories");
}

async function fetchCategory(slug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag("categories", `category:${slug}`);
  return apiGetOrNull<Category>(`/categories/${encodeURIComponent(slug)}`);
}

export async function getCategories(): Promise<Category[]> {
  await connection();
  return fetchCategories();
}

export async function getCategory(slug: string): Promise<Category | null> {
  await connection();
  return fetchCategory(slug);
}
