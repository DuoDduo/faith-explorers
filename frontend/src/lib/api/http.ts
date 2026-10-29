import "server-only";

import { headers } from "next/headers";

// Server-side only: the browser never talks to FastAPI directly. Pages read through
// the cached functions in this folder and forms post through Server Actions.
const API_URL = process.env.API_URL ?? "http://localhost:8000";
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY ?? "";

type Params = Record<string, string | number | boolean | undefined>;

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly detail: unknown,
  ) {
    super(`API request failed with status ${status}`);
  }
}

function buildUrl(path: string, params?: Params): string {
  const url = new URL(`/api${path}`, API_URL);
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value !== undefined && value !== "") url.searchParams.set(key, String(value));
  }
  return url.toString();
}

interface RequestOptions {
  method?: string;
  params?: Params;
  body?: unknown;
  /** Multipart body (file uploads); sent instead of a JSON body. */
  form?: FormData;
  /** Session token of the signed-in user, sent as a Bearer token. */
  token?: string;
}

/**
 * Every request reaches the API from this server, so pass along the visitor's IP (with the
 * shared key that tells the API to trust it). Rate limits then apply per visitor.
 */
async function visitorHeaders(): Promise<Record<string, string>> {
  if (!INTERNAL_API_KEY) return {};
  const incoming = await headers();
  const ip =
    incoming.get("x-real-ip") ?? incoming.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
  return ip ? { "X-Client-IP": ip, "X-Internal-Key": INTERNAL_API_KEY } : {};
}

export async function apiRequest<T>(
  path: string,
  { method, params, body, form, token }: RequestOptions = {},
) {
  // Writes come from server actions, which run in a request; cached GETs must not read headers.
  const requestHeaders: Record<string, string> =
    method && method !== "GET" ? await visitorHeaders() : {};
  if (body !== undefined) requestHeaders["Content-Type"] = "application/json";
  if (token) requestHeaders.Authorization = `Bearer ${token}`;

  const res = await fetch(buildUrl(path, params), {
    method,
    headers: requestHeaders,
    // fetch sets the multipart boundary header itself for FormData.
    body: form ?? (body === undefined ? undefined : JSON.stringify(body)),
  });
  if (!res.ok) {
    throw new ApiError(res.status, (await res.json().catch(() => null))?.detail);
  }
  return (res.status === 204 ? undefined : await res.json()) as T;
}

export function apiGet<T>(path: string, params?: Params, token?: string): Promise<T> {
  return apiRequest<T>(path, { params, token });
}

/** GET that resolves to null on 404 instead of throwing. */
export async function apiGetOrNull<T>(path: string): Promise<T | null> {
  try {
    return await apiGet<T>(path);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export function apiPost<T>(path: string, body?: unknown, token?: string): Promise<T> {
  return apiRequest<T>(path, { method: "POST", body, token });
}

export function apiPut<T>(path: string, token?: string, body?: unknown): Promise<T> {
  return apiRequest<T>(path, { method: "PUT", body, token });
}

/** DELETE; resolves to the response body, or undefined for 204 No Content. */
export function apiDelete<T = void>(path: string, token?: string): Promise<T> {
  return apiRequest<T>(path, { method: "DELETE", token });
}

export function apiUpload<T>(path: string, form: FormData, token?: string): Promise<T> {
  return apiRequest<T>(path, { method: "POST", form, token });
}
