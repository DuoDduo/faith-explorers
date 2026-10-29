"use server";

import { apiPost } from "@/lib/api/http";
import { validateContact } from "@/lib/validation";
import type { Message } from "@/types/api";
import { formStateFromError } from "./errors";
import type { FormState } from "./form-state";

export async function submitContact(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    message: String(formData.get("message") ?? ""),
  };

  const fieldErrors = validateContact(values);
  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      fieldErrors,
      values,
    };
  }

  try {
    const { detail } = await apiPost<Message>("/contact", values);
    return { status: "success", message: detail };
  } catch (error) {
    return {
      ...formStateFromError(error, "Sorry, your message couldn't be sent. Please try again."),
      values,
    };
  }
}
