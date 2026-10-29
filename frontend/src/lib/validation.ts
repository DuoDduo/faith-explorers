const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isEmail(value: string): boolean {
  return EMAIL_RE.test(value);
}

export interface ContactFields {
  name: string;
  email: string;
  message: string;
}

export function validateContact(values: ContactFields): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!values.name.trim()) errors.name = "Name is required";
  if (!isEmail(values.email)) errors.email = "Invalid email address";
  if (!values.message.trim()) errors.message = "Message is required";
  return errors;
}
