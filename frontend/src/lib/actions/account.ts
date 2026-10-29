"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { ApiError, apiPost, apiRequest } from "@/lib/api/http";
import { loginHref } from "@/lib/auth/redirect";
import { clearSessionCookie, getSessionToken } from "@/lib/auth/session";
import { validateNewPassword } from "@/lib/validation";
import { formStateFromError } from "./errors";
import type { FormState } from "./form-state";

const BACK = "/account/settings";

async function requireToken(): Promise<string> {
  const token = await getSessionToken();
  if (!token) redirect(loginHref(BACK));
  return token;
}

function handleSignedOut(error: unknown) {
  if (error instanceof ApiError && error.status === 401) redirect(loginHref(BACK));
}

/** Names and photos appear on cached articles and comments. */
function refreshPublicIdentity() {
  updateTag("posts");
  updateTag("comments");
}

export async function updateProfile(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = {
    name: String(formData.get("name") ?? "").trim(),
    bio: String(formData.get("bio") ?? "").trim(),
  };
  if (!values.name) return { status: "error", fieldErrors: { name: "Name is required" }, values };

  const token = await requireToken();
  try {
    await apiRequest(`/me/profile`, { method: "PATCH", body: values, token });
  } catch (error) {
    handleSignedOut(error);
    return { ...formStateFromError(error, "Couldn't save your profile."), values };
  }
  refreshPublicIdentity();
  return { status: "success", message: "Profile saved.", values };
}

export async function uploadAvatar(_prev: FormState, formData: FormData): Promise<FormState> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { status: "error", fieldErrors: { file: "Choose a photo first." } };
  }
  if (file.size > 5 * 1024 * 1024) {
    return { status: "error", fieldErrors: { file: "Photos can be up to 5 MB." } };
  }
  const token = await requireToken();
  const form = new FormData();
  form.append("file", file);
  try {
    await apiRequest("/me/avatar", { method: "PUT", form, token });
  } catch (error) {
    handleSignedOut(error);
    return formStateFromError(error, "Couldn't upload your photo.");
  }
  refreshPublicIdentity();
  return { status: "success", message: "Photo updated." };
}

export async function removeAvatar(): Promise<void> {
  const token = await requireToken();
  await apiRequest("/me/avatar", { method: "DELETE", token });
  refreshPublicIdentity();
}

export async function changePassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const current = String(formData.get("current_password") ?? "");
  const password = String(formData.get("new_password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  const errors = validateNewPassword({ password, confirm });
  const fieldErrors: Record<string, string> = {};
  if (!current) fieldErrors.current_password = "Enter your current password";
  if (errors.password) fieldErrors.new_password = errors.password;
  if (errors.confirm) fieldErrors.confirm = errors.confirm;
  if (Object.keys(fieldErrors).length > 0) return { status: "error", fieldErrors };

  const token = await requireToken();
  try {
    await apiPost("/me/password", { current_password: current, new_password: password }, token);
  } catch (error) {
    handleSignedOut(error);
    return formStateFromError(error, "Couldn't change your password.");
  }
  return {
    status: "success",
    message: "Password changed. You've been signed out on your other devices.",
  };
}

export async function deleteAccount(_prev: FormState, formData: FormData): Promise<FormState> {
  const password = String(formData.get("password") ?? "");
  if (formData.get("confirm") !== "on") {
    return { status: "error", fieldErrors: { confirm: "Tick the box to confirm" } };
  }
  if (!password) return { status: "error", fieldErrors: { password: "Enter your password" } };

  const token = await requireToken();
  try {
    await apiRequest("/me", { method: "DELETE", body: { password }, token });
  } catch (error) {
    handleSignedOut(error);
    if (error instanceof ApiError && error.status === 409) {
      return { status: "error", message: String(error.detail) };
    }
    return formStateFromError(error, "Couldn't delete your account.");
  }
  await clearSessionCookie();
  refreshPublicIdentity();
  redirect("/");
}
