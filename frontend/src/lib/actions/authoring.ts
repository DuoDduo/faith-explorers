"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { ApiError, apiDelete, apiPost, apiPut, apiUpload } from "@/lib/api/http";
import { loginHref } from "@/lib/auth/redirect";
import { getSessionToken } from "@/lib/auth/session";
import { validatePostDraft } from "@/lib/validation";
import type { AuthorApplication, MyPost } from "@/types/api";
import { formStateFromError } from "./errors";
import type { FormState } from "./form-state";

async function requireToken(back: string): Promise<string> {
  const token = await getSessionToken();
  if (!token) redirect(loginHref(back));
  return token;
}

/** Send signed-out users to sign in and non-authors to the application page. */
function handleAuthErrors(error: unknown, back: string): void {
  if (error instanceof ApiError && error.status === 401) redirect(loginHref(back));
  if (error instanceof ApiError && error.status === 403) redirect("/become-an-author");
}

/** Public pages cache published posts; refresh them when a published post changes. */
function refreshPublic(post: MyPost) {
  if (post.status !== "published") return;
  updateTag("posts");
  updateTag("categories");
  updateTag(`post:${post.slug}`);
}

export async function applyToWrite(_prev: FormState, formData: FormData): Promise<FormState> {
  const motivation = String(formData.get("motivation") ?? "").trim();
  if (motivation.length < 30) {
    return {
      status: "error",
      fieldErrors: { motivation: "Tell us a little more (at least 30 characters)." },
      values: { motivation },
    };
  }
  const token = await requireToken("/become-an-author");
  try {
    await apiPost<AuthorApplication>("/author-applications", { motivation }, token);
  } catch (error) {
    handleAuthErrors(error, "/become-an-author");
    if (error instanceof ApiError && error.status === 409) {
      return { status: "error", message: String(error.detail), values: { motivation } };
    }
    return {
      ...formStateFromError(error, "Couldn't send your application."),
      values: { motivation },
    };
  }
  return { status: "success", message: "Thanks! We'll review your application soon." };
}

function readPostForm(formData: FormData) {
  return {
    title: String(formData.get("title") ?? "").trim(),
    excerpt: String(formData.get("excerpt") ?? "").trim(),
    body: String(formData.get("body") ?? ""),
    category: String(formData.get("category") ?? ""),
    tags: String(formData.get("tags") ?? ""),
    cover_url: String(formData.get("cover_url") ?? ""),
  };
}

/** Create a draft (postId null) or save changes to an existing post. */
export async function savePost(
  postId: number | null,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const values = readPostForm(formData);
  const fieldErrors = validatePostDraft(values);
  if (Object.keys(fieldErrors).length > 0) {
    return { status: "error", message: "Please fix the highlighted fields.", fieldErrors, values };
  }

  const back = postId ? `/dashboard/${postId}/edit` : "/dashboard/new";
  const token = await requireToken(back);
  const payload = {
    ...values,
    tags: values.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    cover_url: values.cover_url || null,
  };

  let post: MyPost;
  try {
    post = postId
      ? await apiPut<MyPost>(`/me/posts/${postId}`, token, payload)
      : await apiPost<MyPost>("/me/posts", payload, token);
  } catch (error) {
    handleAuthErrors(error, back);
    return { ...formStateFromError(error, "Couldn't save your article."), values };
  }

  refreshPublic(post);
  if (!postId) redirect(`/dashboard/${post.id}/edit`);
  return { status: "success", message: "Saved.", values };
}

async function changeStatus(postId: number, action: "submit" | "withdraw") {
  const back = `/dashboard/${postId}/edit`;
  const token = await requireToken(back);
  try {
    refreshPublic(await apiPost<MyPost>(`/me/posts/${postId}/${action}`, undefined, token));
  } catch (error) {
    handleAuthErrors(error, back);
    throw error;
  }
}

export async function submitPost(postId: number): Promise<void> {
  await changeStatus(postId, "submit");
}

export async function withdrawPost(postId: number): Promise<void> {
  await changeStatus(postId, "withdraw");
}

export async function deletePost(postId: number): Promise<void> {
  const token = await requireToken("/dashboard");
  try {
    await apiDelete(`/me/posts/${postId}`, token);
  } catch (error) {
    handleAuthErrors(error, "/dashboard");
    throw error;
  }
}

export type UploadResult = { url: string } | { error: string };

export async function uploadCover(formData: FormData): Promise<UploadResult> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Choose an image first." };
  if (file.size > 5 * 1024 * 1024) return { error: "Images can be up to 5 MB." };

  const token = await requireToken("/dashboard");
  const form = new FormData();
  form.append("file", file);
  try {
    return await apiUpload<{ url: string }>("/uploads/images", form, token);
  } catch (error) {
    handleAuthErrors(error, "/dashboard");
    const state = formStateFromError(error, "Upload failed. Please try again.");
    return { error: state.fieldErrors?.file ?? state.message ?? "Upload failed." };
  }
}
