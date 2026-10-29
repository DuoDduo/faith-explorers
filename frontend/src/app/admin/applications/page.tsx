import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminButton } from "@/components/admin/AdminButton";
import { FilterTabs } from "@/components/admin/FilterTabs";
import { NoteAction } from "@/components/admin/NoteAction";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { ListSkeleton } from "@/components/ui/Skeletons";
import { reviewApplication } from "@/lib/actions/admin";
import { getApplications } from "@/lib/api/admin";
import { requireAdmin } from "@/lib/auth/guards";
import { formatDate } from "@/lib/format";
import { firstParam, pageParam, withQuery } from "@/lib/url";

export const metadata: Metadata = { title: "Applications" };

const STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

async function Applications({
  searchParams,
}: Pick<PageProps<"/admin/applications">, "searchParams">) {
  await requireAdmin("/admin/applications");
  const params = await searchParams;
  const status = STATUSES.some((s) => s.value === firstParam(params.status))
    ? firstParam(params.status)!
    : "pending";
  const data = await getApplications(status, pageParam(params.page));

  return (
    <>
      <FilterTabs
        basePath="/admin/applications"
        param="status"
        current={status}
        options={STATUSES}
      />
      {data.items.length === 0 ? (
        <EmptyState>No {status} applications.</EmptyState>
      ) : (
        <ul className="admin-list">
          {data.items.map((application) => (
            <li key={application.id} className="admin-card">
              <div className="admin-card__header">
                <strong>{application.user.name}</strong>
                <span>{application.user.email}</span>
                <span>Applied {formatDate(application.created_at)}</span>
              </div>
              <blockquote className="admin-card__quote">{application.motivation}</blockquote>
              {application.review_note && (
                <p className="admin-card__note">Note: {application.review_note}</p>
              )}
              {application.status === "pending" && (
                <div className="admin-card__actions">
                  <AdminButton
                    variant="primary"
                    action={reviewApplication.bind(null, application.id, true, undefined)}
                    confirm={`Make ${application.user.name} an author?`}
                  >
                    Approve
                  </AdminButton>
                  <NoteAction
                    action={reviewApplication.bind(null, application.id, false)}
                    label="Reject"
                    submitLabel="Reject application"
                    placeholder="e.g. Please include a short writing sample."
                  />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      <Pagination
        page={data.page}
        pages={data.pages}
        hrefFor={(page) => withQuery("/admin/applications", { status, page })}
      />
    </>
  );
}

export default function ApplicationsPage({ searchParams }: PageProps<"/admin/applications">) {
  return (
    <Suspense fallback={<ListSkeleton rows={3} />}>
      <Applications searchParams={searchParams} />
    </Suspense>
  );
}
