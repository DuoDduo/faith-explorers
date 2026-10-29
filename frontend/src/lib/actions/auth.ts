"use server";

import { redirect } from "next/navigation";
import { ApiError, apiPost } from "@/lib/api/http";
import { safeNextPath } from "@/lib/auth/redirect";
import { clearSessionCookie, getSessionToken, setSessionCookie } from "@/lib/auth/session";
import { validateLogin, validateRegistration } from "@/lib/validation";
import type { AuthResponse } from "@/types/api";
import { formStateFromError } from "./errors";
import type { FormState } from "./form-state";

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = {
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
  };
  const echo = { email: values.email };

  const fieldErrors = validateLogin(values);
  if (Object.keys(fieldErrors).length > 0) {
    return { status: "error", fieldErrors, values: echo };
  }

  try {
    const auth = await apiPost<AuthResponse>("/auth/login", values);
    await setSessionCookie(auth.token, auth.expires_at);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return { status: "error", message: "Incorrect email or password.", values: echo };
    }
    return {
      ...formStateFromError(error, "Couldn't sign you in. Please try again."),
      values: echo,
    };
  }
  redirect(safeNextPath(formData.get("next")));
}

export async function register(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = {
    name: String(formData.get("name") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
  };
  const echo = { name: values.name, email: values.email };

  const fieldErrors = validateRegistration(values);
  if (Object.keys(fieldErrors).length > 0) {
    return { status: "error", fieldErrors, values: echo };
  }

  try {
    const auth = await apiPost<AuthResponse>("/auth/register", values);
    await setSessionCookie(auth.token, auth.expires_at);
  } catch (error) {
    if (error instanceof ApiError && error.status === 409) {
      return {
        status: "error",
        fieldErrors: { email: "An account with this email already exists." },
        values: echo,
      };
    }
    return {
      ...formStateFromError(error, "Couldn't create your account. Please try again."),
      values: echo,
    };
  }
  redirect(safeNextPath(formData.get("next")));
}

export async function logout(): Promise<void> {
  const token = await getSessionToken();
  if (token) {
    // Revoke on the server too; clear the cookie even if the API call fails.
    await apiPost("/auth/logout", undefined, token).catch(() => undefined);
  }
  await clearSessionCookie();
  redirect("/");
}
