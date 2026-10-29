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

export const MIN_PASSWORD_LENGTH = 8;

export function validateLogin(values: { email: string; password: string }) {
  const errors: Record<string, string> = {};
  if (!isEmail(values.email)) errors.email = "Enter the email you signed up with";
  if (!values.password) errors.password = "Enter your password";
  return errors;
}

export function validateRegistration(values: { name: string; email: string; password: string }) {
  const errors: Record<string, string> = {};
  if (!values.name.trim()) errors.name = "Name is required";
  if (!isEmail(values.email)) errors.email = "Invalid email address";
  if (values.password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `Use at least ${MIN_PASSWORD_LENGTH} characters`;
  }
  return errors;
}
