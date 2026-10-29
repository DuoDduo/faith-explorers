import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthCard } from "@/components/auth/AuthCard";
import { TokenActionForm } from "@/components/forms/TokenActionForm";
import { ListSkeleton } from "@/components/ui/Skeletons";
import { unsubscribe } from "@/lib/actions/newsletter";
import { firstParam } from "@/lib/url";

export const metadata: Metadata = {
  title: "Unsubscribe",
  robots: { index: false },
};

async function Unsubscribe({
  searchParams,
}: Pick<PageProps<"/newsletter/unsubscribe">, "searchParams">) {
  const token = firstParam((await searchParams).token);
  if (!token) return <p>This page needs the link from one of our emails.</p>;
  return (
    <>
      <p>You&apos;ll stop receiving the Faith Explorers newsletter.</p>
      <TokenActionForm
        token={token}
        action={unsubscribe}
        label="Unsubscribe"
        pendingLabel="Unsubscribing…"
      />
    </>
  );
}

export default function UnsubscribePage({ searchParams }: PageProps<"/newsletter/unsubscribe">) {
  return (
    <AuthCard title="Unsubscribe">
      <Suspense fallback={<ListSkeleton rows={1} />}>
        <Unsubscribe searchParams={searchParams} />
      </Suspense>
    </AuthCard>
  );
}
