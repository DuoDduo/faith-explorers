import { PagedPostGrid, type PagedPostGridProps } from "@/components/posts/PagedPostGrid";
import { getPosts } from "@/lib/api/posts";
import type { PostQuery } from "@/types/api";

type PaginatedPostsProps = Omit<PagedPostGridProps, "data"> & { query: PostQuery };

/** Published posts matching a query, paginated. */
export async function PaginatedPosts({ query, ...rest }: PaginatedPostsProps) {
  return <PagedPostGrid data={await getPosts(query)} {...rest} />;
}
