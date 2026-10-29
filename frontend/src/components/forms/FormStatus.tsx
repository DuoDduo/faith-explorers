import type { FormState } from "@/lib/actions/form-state";

/** Success or failure message under a form. */
export function FormStatus({ state }: { state: FormState }) {
  if (state.status === "success") {
    return (
      <p className="form-success" role="status">
        {state.message}
      </p>
    );
  }
  if (state.status === "error" && state.message) {
    return (
      <p className="form-error" role="alert">
        {state.message}
      </p>
    );
  }
  return null;
}
