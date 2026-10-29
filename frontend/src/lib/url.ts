type QueryValue = string | number | undefined;

/** Build "path?query", dropping empty values and page=1 so URLs stay canonical. */
export function withQuery(path: string, params: Record<string, QueryValue>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "" || (key === "page" && Number(value) <= 1)) continue;
    search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `${path}?${query}` : path;
}

/** Read a single string from Next's searchParams (which may hold arrays). */
export function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** Parse ?page=, falling back to 1 for missing or invalid values. */
export function pageParam(value: string | string[] | undefined): number {
  const page = Number(firstParam(value));
  return Number.isInteger(page) && page > 0 ? page : 1;
}
