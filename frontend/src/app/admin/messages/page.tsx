import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminButton } from "@/components/admin/AdminButton";
import { FilterTabs } from "@/components/admin/FilterTabs";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { ListSkeleton } from "@/components/ui/Skeletons";
import { setMessageHandled } from "@/lib/actions/admin";
import { getMessages } from "@/lib/api/admin";
import { requireAdmin } from "@/lib/auth/guards";
import { formatDate } from "@/lib/format";
import { firstParam, pageParam, withQuery } from "@/lib/url";

export const metadata: Metadata = { title: "Messages" };

const FILTERS = [
  { value: "open", label: "Open" },
  { value: "handled", label: "Handled" },
  { value: "all", label: "All" },
];

async function Messages({ searchParams }: Pick<PageProps<"/admin/messages">, "searchParams">) {
  await requireAdmin("/admin/messages");
  const params = await searchParams;
  const show = FILTERS.some((f) => f.value === firstParam(params.show))
    ? firstParam(params.show)!
    : "open";
  const data = await getMessages(show, pageParam(params.page));

  return (
    <>
      <FilterTabs basePath="/admin/messages" param="show" current={show} options={FILTERS} />
      {data.items.length === 0 ? (
        <EmptyState>
          {show === "open" ? "Inbox zero. Nothing to answer." : "No messages."}
        </EmptyState>
      ) : (
        <ul className="admin-list">
          {data.items.map((message) => (
            <li
              key={message.id}
              className={`admin-card${message.handled ? " admin-card--muted" : ""}`}
            >
              <div className="admin-card__header">
                <strong>{message.name}</strong>
                <a href={`mailto:${message.email}?subject=Re: your message to Faith Explorers`}>
                  {message.email}
                </a>
                <span>{formatDate(message.created_at)}</span>
              </div>
              <p className="admin-card__message">{message.message}</p>
              <div className="admin-card__actions">
                <a
                  className="admin-button admin-button--secondary"
                  href={`mailto:${message.email}?subject=Re: your message to Faith Explorers`}
                >
                  Reply by email
                </a>
                <AdminButton
                  variant={message.handled ? "secondary" : "primary"}
                  action={setMessageHandled.bind(null, message.id, !message.handled)}
                >
                  {message.handled ? "Reopen" : "Mark handled"}
                </AdminButton>
              </div>
            </li>
          ))}
        </ul>
      )}
      <Pagination
        page={data.page}
        pages={data.pages}
        hrefFor={(page) => withQuery("/admin/messages", { show, page })}
      />
    </>
  );
}

export default function AdminMessagesPage({ searchParams }: PageProps<"/admin/messages">) {
  return (
    <Suspense fallback={<ListSkeleton rows={4} />}>
      <Messages searchParams={searchParams} />
    </Suspense>
  );
}
