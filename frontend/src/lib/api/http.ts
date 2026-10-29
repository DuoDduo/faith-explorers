import "server-only";

// Server-side only: the browser never talks to FastAPI directly. Pages read through
// the cached functions in this folder and forms post through Server Actions.
const API_URL = process.env.API_URL ?? "http://localhost:8000";

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

async function request<T>(path: string, init: RequestInit & { params?: Params } = {}): Promise<T> {
  const { params, ...rest } = init;
  const res = await fetch(buildUrl(path, params), rest);
  if (!res.ok) {
    throw new ApiError(res.status, (await res.json().catch(() => null))?.detail);
  }
  return res.json() as Promise<T>;
}

export function apiGet<T>(path: string, params?: Params): Promise<T> {
  return request<T>(path, { params });
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

export function apiPost<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, {
    method: "POST",
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}
