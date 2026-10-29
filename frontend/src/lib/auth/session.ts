import "server-only";

import { cookies } from "next/headers";
import { cache } from "react";
import { ApiError, apiGet } from "@/lib/api/http";
import type { User } from "@/types/api";

// The API issues an opaque session token; we keep it in an httpOnly cookie so
// browser JavaScript can never read it, and forward it to the API from the server.
const SESSION_COOKIE = "fe_session";

export async function getSessionToken(): Promise<string | undefined> {
  return (await cookies()).get(SESSION_COOKIE)?.value;
}

export async function setSessionCookie(token: string, expiresAt: string): Promise<void> {
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(expiresAt),
  });
}

export async function clearSessionCookie(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}

/**
 * The signed-in user, or null. Reads the session cookie, so call it inside
 * <Suspense>. Deduplicated per request.
 */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const token = await getSessionToken();
  if (!token) return null;
  try {
    return await apiGet<User>("/auth/me", undefined, token);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
});
