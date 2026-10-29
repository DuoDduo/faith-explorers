import type { NextRequest } from "next/server";

// Article covers, avatars and uploads are stored by the API. Proxying them here (rather than
// with a build-time rewrite) reads API_URL at runtime, so one build works in any environment,
// and lets next/image optimize them as same-origin images.
const API_URL = process.env.API_URL ?? "http://localhost:8000";

export async function GET(_request: NextRequest, ctx: RouteContext<"/media/[...path]">) {
  const { path } = await ctx.params;
  if (path.some((segment) => segment === ".." || segment.includes("\\"))) {
    return new Response(null, { status: 400 });
  }

  const upstream = await fetch(`${API_URL}/media/${path.map(encodeURIComponent).join("/")}`);
  if (!upstream.ok) {
    return new Response(null, { status: upstream.status === 404 ? 404 : 502 });
  }
  return new Response(upstream.body, {
    headers: {
      "Content-Type": upstream.headers.get("content-type") ?? "application/octet-stream",
      // File names never change content (uploads get unique names), so cache generously.
      "Cache-Control": "public, max-age=86400",
    },
  });
}
