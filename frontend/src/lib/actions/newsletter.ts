"use server";

import { apiPost } from "@/lib/api/http";
import { isEmail } from "@/lib/validation";
import type { Message } from "@/types/api";
import { formStateFromError } from "./errors";
import type { FormState } from "./form-state";

export async function subscribeToNewsletter(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!isEmail(email)) {
    return {
      status: "error",
      fieldErrors: { email: "Please enter a valid email address." },
      values: { email },
    };
  }

  try {
    const { detail } = await apiPost<Message>("/newsletter/subscribe", { email });
    return { status: "success", message: detail };
  } catch (error) {
    return {
      ...formStateFromError(error, "Could not subscribe right now. Please try again."),
      values: { email },
    };
  }
}
