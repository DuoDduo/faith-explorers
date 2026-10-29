"use server";

import { redirect } from "next/navigation";
import { apiPost } from "@/lib/api/http";
import { isEmail, validateNewPassword } from "@/lib/validation";
import type { Message } from "@/types/api";
import { formStateFromError } from "./errors";
import type { FormState } from "./form-state";

export async function requestPasswordReset(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!isEmail(email)) {
    return {
      status: "error",
      fieldErrors: { email: "Enter the email you signed up with" },
      values: { email },
    };
  }
  try {
    const { detail } = await apiPost<Message>("/auth/password-reset", { email });
    return { status: "success", message: detail };
  } catch (error) {
    return { ...formStateFromError(error, "Couldn't send the reset email."), values: { email } };
  }
}

export async function resetPassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const token = String(formData.get("token") ?? "");
  const values = {
    password: String(formData.get("password") ?? ""),
    confirm: String(formData.get("confirm") ?? ""),
  };
  const fieldErrors = validateNewPassword(values);
  if (Object.keys(fieldErrors).length > 0) return { status: "error", fieldErrors };

  try {
    await apiPost<Message>("/auth/password-reset/confirm", { token, password: values.password });
  } catch (error) {
    const state = formStateFromError(error, "Couldn't change your password.");
    // An invalid or expired link is reported against the hidden token field.
    const linkProblem = state.fieldErrors?.token;
    return linkProblem ? { status: "error", message: linkProblem } : state;
  }
  redirect("/login?reset=1");
}
