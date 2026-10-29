import "server-only";

import { ApiError } from "@/lib/api/http";
import type { FormState } from "./form-state";

interface ValidationIssue {
  loc: (string | number)[];
  msg: string;
}

/** Turn an API failure into a form state, mapping FastAPI 422 details onto fields. */
export function formStateFromError(error: unknown, fallback: string): FormState {
  if (error instanceof ApiError && error.status === 422 && Array.isArray(error.detail)) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of error.detail as ValidationIssue[]) {
      const field = String(issue.loc.at(-1));
      fieldErrors[field] = issue.msg.replace(/^Value error, /, "");
    }
    return { status: "error", message: "Please check the highlighted fields.", fieldErrors };
  }
  if (error instanceof ApiError && error.status === 429) {
    return { status: "error", message: String(error.detail) };
  }
  return { status: "error", message: fallback };
}
