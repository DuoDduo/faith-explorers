import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthCard } from "@/components/auth/AuthCard";
import { TokenActionForm } from "@/components/forms/TokenActionForm";
import { ListSkeleton } from "@/components/ui/Skeletons";
import { confirmSubscription } from "@/lib/actions/newsletter";
import { firstParam } from "@/lib/url";

export const metadata: Metadata = {
  title: "Confirm your subscription",
  robots: { index: false },
};

async function Confirm({ searchParams }: Pick<PageProps<"/newsletter/confirm">, "searchParams">) {
  const token = firstParam((await searchParams).token);
  if (!token) return <p>This page needs the link from your confirmation email.</p>;
  return (
    <>
      <p>One click and you&apos;ll start receiving new articles from Faith Explorers.</p>
      <TokenActionForm
        token={token}
        action={confirmSubscription}
        label="Confirm my subscription"
        pendingLabel="Confirming…"
      />
    </>
  );
}

export default function ConfirmSubscriptionPage({
  searchParams,
}: PageProps<"/newsletter/confirm">) {
  return (
    <AuthCard title="Confirm your subscription">
      <Suspense fallback={<ListSkeleton rows={1} />}>
        <Confirm searchParams={searchParams} />
      </Suspense>
    </AuthCard>
  );
}
