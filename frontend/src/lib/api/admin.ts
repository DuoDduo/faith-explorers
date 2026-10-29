import "server-only";

import { getSessionToken } from "@/lib/auth/session";
import type {
  AdminApplication,
  AdminComment,
  AdminOverview,
  AdminUser,
  ContactMessage,
  MyPost,
  MyPostSummary,
  NewsletterOverview,
  Page,
} from "@/types/api";
import { ApiError, apiGet } from "./http";

// Admin-only, per-request data (never cached). Call inside <Suspense> after requireAdmin().

type Params = Record<string, string | number | undefined>;

async function adminGet<T>(path: string, params?: Params): Promise<T> {
  return apiGet<T>(`/admin${path}`, params, await getSessionToken());
}

export const getOverview = () => adminGet<AdminOverview>("/overview");

export const getApplications = (status: string, page: number) =>
  adminGet<Page<AdminApplication>>("/applications", { status, page });

export const getAdminPosts = (status: string | undefined, page: number) =>
  adminGet<Page<MyPostSummary>>("/posts", { status, page });

export async function getAdminPost(id: number): Promise<MyPost | null> {
  try {
    return await adminGet<MyPost>(`/posts/${id}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export const getAdminComments = (status: string | undefined, page: number) =>
  adminGet<Page<AdminComment>>("/comments", { status, page });

export const getMessages = (show: string, page: number) =>
  adminGet<Page<ContactMessage>>("/messages", { show, page });

export const getUsers = (q: string | undefined, page: number) =>
  adminGet<Page<AdminUser>>("/users", { q, page });

export const getNewsletter = () => adminGet<NewsletterOverview>("/newsletter");
