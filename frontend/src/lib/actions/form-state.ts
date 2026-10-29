// Shared by Server Actions and the client forms that render their results.
export interface FormState {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
  /** Submitted values, echoed back on error so the form can be refilled after React resets it. */
  values?: Record<string, string>;
}

export const initialFormState: FormState = { status: "idle" };
