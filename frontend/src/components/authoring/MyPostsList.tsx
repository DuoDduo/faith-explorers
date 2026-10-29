import Link from "next/link";
import { StatusBadge } from "@/components/authoring/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/format";
import type { MyPostSummary } from "@/types/api";

export function MyPostsList({ posts }: { posts: MyPostSummary[] }) {
  if (posts.length === 0) {
    return (
      <EmptyState>You haven&apos;t written anything yet. Start your first article!</EmptyState>
    );
  }
  return (
    <ul className="my-posts">
      {posts.map((post) => (
        <li key={post.id} className="my-posts__item">
          <div>
            <Link href={`/dashboard/${post.id}/edit`} className="my-posts__title">
              {post.title}
            </Link>
            <p className="my-posts__meta">
              {post.category.name} · updated {formatDate(post.updated_at)}
              {post.status === "published" && ` · ${post.views} views · ${post.like_count} likes`}
            </p>
          </div>
          <StatusBadge status={post.status} />
        </li>
      ))}
    </ul>
  );
}
