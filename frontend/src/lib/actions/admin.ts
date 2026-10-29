"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { ApiError, apiPost, apiPut, apiRequest } from "@/lib/api/http";
import { loginHref } from "@/lib/auth/redirect";
import { getSessionToken } from "@/lib/auth/session";
import type { AdminComment, Message, MyPost, Role } from "@/types/api";
import type { FormState } from "./form-state";

/** Admin actions resolve to an error message the UI can show, or nothing on success. */
export type AdminResult = { error?: string };

async function adminCall<T>(call: (token: string) => Promise<T>): Promise<T | AdminResult> {
  const token = await getSessionToken();
  if (!token) redirect(loginHref("/admin"));
  try {
    return await call(token);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect(loginHref("/admin"));
    if (error instanceof ApiError && error.status === 403) redirect("/");
    if (error instanceof ApiError && (error.status === 409 || error.status === 404)) {
      return { error: String(error.detail) };
    }
    return { error: "Something went wrong. Please try again." };
  }
}

const failed = (value: unknown): value is AdminResult =>
  typeof value === "object" && value !== null && "error" in value;

/** Public pages cache posts; refresh them after an admin changes one. */
async function postAction(call: (token: string) => Promise<MyPost>): Promise<AdminResult> {
  const result = await adminCall(call);
  if (failed(result)) return result;
  updateTag("posts");
  updateTag("categories");
  updateTag(`post:${result.slug}`);
  return {};
}

async function plainAction(call: (token: string) => Promise<unknown>): Promise<AdminResult> {
  const result = await adminCall(call);
  return failed(result) ? result : {};
}

const noteOrNull = (note?: string) => (note?.trim() ? note.trim() : null);

export async function reviewApplication(
  id: number,
  approve: boolean,
  note?: string,
): Promise<AdminResult> {
  const action = approve ? "approve" : "reject";
  return plainAction((t) =>
    apiPost(`/admin/applications/${id}/${action}`, { note: noteOrNull(note) }, t),
  );
}

export async function publishPost(id: number): Promise<AdminResult> {
  return postAction((t) => apiPost<MyPost>(`/admin/posts/${id}/publish`, undefined, t));
}

export async function returnPost(id: number, note?: string): Promise<AdminResult> {
  return plainAction((t) => apiPost(`/admin/posts/${id}/return`, { note: noteOrNull(note) }, t));
}

export async function unpublishPost(id: number): Promise<AdminResult> {
  return postAction((t) => apiPost<MyPost>(`/admin/posts/${id}/unpublish`, undefined, t));
}

export async function setFeatured(id: number, featured: boolean): Promise<AdminResult> {
  return postAction((t) => apiPut<MyPost>(`/admin/posts/${id}/featured`, t, { featured }));
}

export async function setCommentHidden(id: number, hidden: boolean): Promise<AdminResult> {
  const result = await adminCall((t) =>
    apiPut<AdminComment>(`/admin/comments/${id}/status`, t, {
      status: hidden ? "hidden" : "visible",
    }),
  );
  if (failed(result)) return result;
  updateTag("comments");
  updateTag(`post:${result.post.slug}`);
  return {};
}

export async function setMessageHandled(id: number, handled: boolean): Promise<AdminResult> {
  return plainAction((t) => apiPut(`/admin/messages/${id}/handled`, t, { handled }));
}

export async function updateUser(
  id: number,
  changes: { role?: Role; is_active?: boolean },
): Promise<AdminResult> {
  return plainAction((t) =>
    apiRequest(`/admin/users/${id}`, { method: "PATCH", body: changes, token: t }),
  );
}

/** Send a test copy to the admin, or the real issue to every confirmed subscriber. */
export async function sendNewsletter(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = {
    subject: String(formData.get("subject") ?? "").trim(),
    message: String(formData.get("message") ?? "").trim(),
    include_recent: formData.get("include_recent") === "on" ? "on" : "",
  };
  const fieldErrors: Record<string, string> = {};
  if (values.subject.length < 3) fieldErrors.subject = "Add a subject";
  if (!values.message) fieldErrors.message = "Write a message";
  if (Object.keys(fieldErrors).length > 0) return { status: "error", fieldErrors, values };

  const isTest = formData.get("intent") === "test";
  const body = { ...values, include_recent: values.include_recent === "on" };
  const result = await adminCall((t) =>
    apiPost<Message>(`/admin/newsletter/${isTest ? "test" : "send"}`, body, t),
  );
  if (failed(result)) return { status: "error", message: result.error, values };
  // Keep the draft after a test so it can be tweaked; clear it once really sent.
  return { status: "success", message: result.detail, values: isTest ? values : undefined };
}
