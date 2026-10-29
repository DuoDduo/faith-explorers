import { PostGrid } from "@/components/posts/PostGrid";
import { Pagination } from "@/components/ui/Pagination";
import { getPosts } from "@/lib/api/posts";
import { withQuery } from "@/lib/url";
import type { PostQuery } from "@/types/api";

interface PaginatedPostsProps {
  query: PostQuery;
  /** Path the pagination links point at, e.g. "/articles". */
  basePath: string;
  /** Query parameters to keep on pagination links. */
  keep?: Record<string, string | undefined>;
  empty?: string;
}

export async function PaginatedPosts({ query, basePath, keep = {}, empty }: PaginatedPostsProps) {
  const data = await getPosts(query);
  return (
    <>
      <PostGrid posts={data.items} empty={empty} />
      <Pagination
        page={data.page}
        pages={data.pages}
        hrefFor={(page) => withQuery(basePath, { ...keep, page })}
      />
    </>
  );
}
