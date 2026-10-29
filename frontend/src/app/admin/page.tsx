import { Suspense } from "react";
import { StatCard } from "@/components/admin/StatCard";
import { ListSkeleton } from "@/components/ui/Skeletons";
import { getOverview } from "@/lib/api/admin";
import { requireAdmin } from "@/lib/auth/guards";

async function Overview() {
  await requireAdmin("/admin");
  const stats = await getOverview();
  return (
    <>
      <h2 className="admin__section-title">Waiting for you</h2>
      <div className="stat-grid">
        <StatCard
          label="Author applications"
          value={stats.pending_applications}
          href="/admin/applications"
          attention
        />
        <StatCard
          label="Articles to review"
          value={stats.pending_posts}
          href="/admin/posts"
          attention
        />
        <StatCard
          label="Unread messages"
          value={stats.unhandled_messages}
          href="/admin/messages"
          attention
        />
      </div>
      <h2 className="admin__section-title">Site</h2>
      <div className="stat-grid">
        <StatCard
          label="Published articles"
          value={stats.published_posts}
          href="/admin/posts?status=published"
        />
        <StatCard label="Comments" value={stats.comments} href="/admin/comments" />
        <StatCard label="Registered users" value={stats.users} href="/admin/users" />
      </div>
    </>
  );
}

export default function AdminOverviewPage() {
  return (
    <Suspense fallback={<ListSkeleton rows={2} />}>
      <Overview />
    </Suspense>
  );
}
