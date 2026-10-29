import { PostGrid } from "@/components/posts/PostGrid";
import { Pagination } from "@/components/ui/Pagination";
import { withQuery } from "@/lib/url";
import type { Page, PostSummary } from "@/types/api";

export interface PagedPostGridProps {
  data: Page<PostSummary>;
  /** Path the pagination links point at, e.g. "/articles". */
  basePath: string;
  /** Query parameters to keep on pagination links. */
  keep?: Record<string, string | undefined>;
  empty?: string;
}

/** A page of post cards plus links to the other pages. */
export function PagedPostGrid({ data, basePath, keep = {}, empty }: PagedPostGridProps) {
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
