import { EngagementButtons } from "@/components/posts/EngagementButtons";
import { getEngagement } from "@/lib/api/me";
import { loginHref } from "@/lib/auth/redirect";
import { getCurrentUser } from "@/lib/auth/session";

/** Per-reader like/save state for an article. Render inside <Suspense>. */
export async function PostActions({ slug }: { slug: string }) {
  const [engagement, user] = await Promise.all([getEngagement(slug), getCurrentUser()]);
  return (
    <EngagementButtons
      slug={slug}
      initial={engagement}
      signedIn={user !== null}
      loginUrl={loginHref(`/articles/${slug}`)}
    />
  );
}
