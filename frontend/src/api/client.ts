// Empty in development: Vite proxies /api and /media to the FastAPI server.
// In production set VITE_API_URL to the API origin, e.g. https://api.faithexplorers.org
export const API_URL: string = import.meta.env.VITE_API_URL ?? ''

export class ApiError extends Error {
  readonly status: number
  readonly fieldErrors: Record<string, string>

  constructor(status: number, message: string, fieldErrors: Record<string, string> = {}) {
    super(message)
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

interface ValidationIssue {
  loc: (string | number)[]
  msg: string
}

async function toApiError(res: Response): Promise<ApiError> {
  const body = await res.json().catch(() => null)
  const detail = body?.detail
  if (Array.isArray(detail)) {
    // FastAPI 422: map ["body", "email"] -> { email: "..." }
    const fieldErrors: Record<string, string> = {}
    for (const issue of detail as ValidationIssue[]) {
      fieldErrors[String(issue.loc[issue.loc.length - 1])] = issue.msg.replace(/^Value error, /, '')
    }
    return new ApiError(res.status, 'Please check the highlighted fields.', fieldErrors)
  }
  return new ApiError(res.status, typeof detail === 'string' ? detail : 'Something went wrong.')
}

type Params = Record<string, string | number | boolean | undefined>

export async function api<T>(
  path: string,
  { params, json, method }: { params?: Params; json?: unknown; method?: string } = {},
): Promise<T> {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value !== undefined && value !== '') search.set(key, String(value))
  }
  const query = search.size ? `?${search}` : ''
  const res = await fetch(`${API_URL}/api${path}${query}`, {
    method: method ?? (json === undefined ? 'GET' : 'POST'),
    headers: json === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: json === undefined ? undefined : JSON.stringify(json),
    credentials: 'include',
  })
  if (!res.ok) throw await toApiError(res)
  return res.json() as Promise<T>
}
