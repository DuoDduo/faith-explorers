import type { Metadata } from "next";
import { Suspense } from "react";
import { NewsletterComposer } from "@/components/admin/NewsletterComposer";
import { StatCard } from "@/components/admin/StatCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { ListSkeleton } from "@/components/ui/Skeletons";
import { getNewsletter } from "@/lib/api/admin";
import { requireAdmin } from "@/lib/auth/guards";
import { formatDate, pluralize } from "@/lib/format";

export const metadata: Metadata = { title: "Newsletter" };

async function Newsletter() {
  await requireAdmin("/admin/newsletter");
  const data = await getNewsletter();
  return (
    <>
      <div className="stat-grid">
        <StatCard label="Confirmed subscribers" value={data.confirmed} href="/admin/newsletter" />
        <StatCard label="Waiting to confirm" value={data.pending} href="/admin/newsletter" />
      </div>

      <h2 className="admin__section-title">Write a newsletter</h2>
      <p className="field-hint">
        Goes to confirmed subscribers only. Each email includes the reader&apos;s own unsubscribe
        link. Send a test to yourself first.
      </p>
      <NewsletterComposer subscribers={data.confirmed} />

      <h2 className="admin__section-title">Sent</h2>
      {data.issues.length === 0 ? (
        <EmptyState>No newsletters sent yet.</EmptyState>
      ) : (
        <ul className="my-posts">
          {data.issues.map((issue) => (
            <li key={issue.id} className="my-posts__item">
              <span className="my-posts__title">{issue.subject}</span>
              <span className="my-posts__meta">
                {formatDate(issue.sent_at)} · {pluralize(issue.recipient_count, "recipient")}
              </span>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export default function AdminNewsletterPage() {
  return (
    <Suspense fallback={<ListSkeleton rows={3} />}>
      <Newsletter />
    </Suspense>
  );
}
