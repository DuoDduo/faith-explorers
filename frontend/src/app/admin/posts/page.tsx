import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { FilterTabs } from "@/components/admin/FilterTabs";
import { StatusBadge } from "@/components/authoring/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { ListSkeleton } from "@/components/ui/Skeletons";
import { getAdminPosts } from "@/lib/api/admin";
import { requireAdmin } from "@/lib/auth/guards";
import { formatDate } from "@/lib/format";
import { firstParam, pageParam, withQuery } from "@/lib/url";

export const metadata: Metadata = { title: "Articles" };

const STATUSES = [
  { value: "pending", label: "In review" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Drafts" },
];

async function Posts({ searchParams }: Pick<PageProps<"/admin/posts">, "searchParams">) {
  await requireAdmin("/admin/posts");
  const params = await searchParams;
  const status = STATUSES.some((s) => s.value === firstParam(params.status))
    ? firstParam(params.status)!
    : "pending";
  const data = await getAdminPosts(status, pageParam(params.page));

  return (
    <>
      <FilterTabs basePath="/admin/posts" param="status" current={status} options={STATUSES} />
      {data.items.length === 0 ? (
        <EmptyState>
          {status === "pending" ? "Nothing waiting for review." : "No articles here."}
        </EmptyState>
      ) : (
        <ul className="my-posts">
          {data.items.map((post) => (
            <li key={post.id} className="my-posts__item">
              <div>
                <Link href={`/admin/posts/${post.id}`} className="my-posts__title">
                  {post.title}
                </Link>
                <p className="my-posts__meta">
                  {post.author.name} · {post.category.name} · updated {formatDate(post.updated_at)}
                  {post.featured && " · ★ Editor's pick"}
                </p>
              </div>
              <StatusBadge status={post.status} />
            </li>
          ))}
        </ul>
      )}
      <Pagination
        page={data.page}
        pages={data.pages}
        hrefFor={(page) => withQuery("/admin/posts", { status, page })}
      />
    </>
  );
}

export default function AdminPostsPage({ searchParams }: PageProps<"/admin/posts">) {
  return (
    <Suspense fallback={<ListSkeleton rows={4} />}>
      <Posts searchParams={searchParams} />
    </Suspense>
  );
}
