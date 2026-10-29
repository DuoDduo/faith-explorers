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

export interface PostDraftFields {
  title: string;
  excerpt: string;
  body: string;
  category: string;
  tags: string;
}

export const MAX_TAGS = 8;

export function validatePostDraft(values: PostDraftFields): Record<string, string> {
  const errors: Record<string, string> = {};
  if (values.title.trim().length < 3) errors.title = "Give your article a title";
  if (values.excerpt.trim().length < 10) {
    errors.excerpt = "Write a short summary (at least 10 characters)";
  } else if (values.excerpt.length > 500) {
    errors.excerpt = "Keep the summary under 500 characters";
  }
  if (!values.body.trim()) errors.body = "The article is empty";
  if (!values.category) errors.category = "Choose a category";
  const tags = values.tags.split(",").filter((t) => t.trim());
  if (tags.length > MAX_TAGS) errors.tags = `Use up to ${MAX_TAGS} tags`;
  return errors;
}

export function validateNewPassword(values: { password: string; confirm: string }) {
  const errors: Record<string, string> = {};
  if (values.password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `Use at least ${MIN_PASSWORD_LENGTH} characters`;
  } else if (values.password !== values.confirm) {
    errors.confirm = "The passwords don't match";
  }
  return errors;
}
