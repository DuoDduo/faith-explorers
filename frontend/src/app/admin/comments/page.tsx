import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AdminButton } from "@/components/admin/AdminButton";
import { FilterTabs } from "@/components/admin/FilterTabs";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { ListSkeleton } from "@/components/ui/Skeletons";
import { setCommentHidden } from "@/lib/actions/admin";
import { getAdminComments } from "@/lib/api/admin";
import { requireAdmin } from "@/lib/auth/guards";
import { formatDate } from "@/lib/format";
import { firstParam, pageParam, withQuery } from "@/lib/url";

export const metadata: Metadata = { title: "Comments" };

const FILTERS = [
  { value: "all", label: "All" },
  { value: "visible", label: "Visible" },
  { value: "hidden", label: "Hidden" },
];

async function Comments({ searchParams }: Pick<PageProps<"/admin/comments">, "searchParams">) {
  await requireAdmin("/admin/comments");
  const params = await searchParams;
  const filter = FILTERS.some((f) => f.value === firstParam(params.status))
    ? firstParam(params.status)!
    : "all";
  const data = await getAdminComments(
    filter === "all" ? undefined : filter,
    pageParam(params.page),
  );

  return (
    <>
      <FilterTabs basePath="/admin/comments" param="status" current={filter} options={FILTERS} />
      {data.items.length === 0 ? (
        <EmptyState>No comments here.</EmptyState>
      ) : (
        <ul className="admin-list">
          {data.items.map((comment) => (
            <li
              key={comment.id}
              className={`admin-card${comment.status === "hidden" ? " admin-card--muted" : ""}`}
            >
              <div className="admin-card__header">
                <strong>{comment.user.name}</strong>
                <span>
                  on <Link href={`/articles/${comment.post.slug}`}>{comment.post.title}</Link>
                </span>
                <span>{formatDate(comment.created_at)}</span>
                {comment.status === "hidden" && (
                  <span className="status-badge status-badge--draft">Hidden</span>
                )}
              </div>
              <p>{comment.body}</p>
              <div className="admin-card__actions">
                {comment.status === "visible" ? (
                  <AdminButton
                    variant="danger"
                    action={setCommentHidden.bind(null, comment.id, true)}
                  >
                    Hide
                  </AdminButton>
                ) : (
                  <AdminButton action={setCommentHidden.bind(null, comment.id, false)}>
                    Restore
                  </AdminButton>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
      <Pagination
        page={data.page}
        pages={data.pages}
        hrefFor={(page) => withQuery("/admin/comments", { status: filter, page })}
      />
    </>
  );
}

export default function AdminCommentsPage({ searchParams }: PageProps<"/admin/comments">) {
  return (
    <Suspense fallback={<ListSkeleton rows={4} />}>
      <Comments searchParams={searchParams} />
    </Suspense>
  );
}
