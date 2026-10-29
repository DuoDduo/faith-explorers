import "server-only";

import { redirect } from "next/navigation";
import type { User } from "@/types/api";
import { loginHref } from "./redirect";
import { getCurrentUser } from "./session";

export function isWriter(user: User | null): boolean {
  return user?.role === "author" || user?.role === "admin";
}

/** The signed-in user, or a redirect to sign in (returning to `back`). */
export async function requireUser(back: string): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect(loginHref(back));
  return user;
}

/** An author or admin; readers are sent to the application page. */
export async function requireWriter(back: string): Promise<User> {
  const user = await requireUser(back);
  if (!isWriter(user)) redirect("/become-an-author");
  return user;
}

/** An admin; everyone else is sent home. */
export async function requireAdmin(back: string): Promise<User> {
  const user = await requireUser(back);
  if (user.role !== "admin") redirect("/");
  return user;
}
