import type { PostStatus } from "@/types/api";

const LABELS: Record<PostStatus, string> = {
  draft: "Draft",
  pending: "In review",
  published: "Published",
};

export function StatusBadge({ status }: { status: PostStatus }) {
  return <span className={`status-badge status-badge--${status}`}>{LABELS[status]}</span>;
}
