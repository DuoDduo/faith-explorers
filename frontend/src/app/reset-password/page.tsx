import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AuthCard } from "@/components/auth/AuthCard";
import { ResetPasswordForm } from "@/components/forms/ResetPasswordForm";
import { ListSkeleton } from "@/components/ui/Skeletons";
import { firstParam } from "@/lib/url";

export const metadata: Metadata = {
  title: "Choose a new password",
  robots: { index: false },
};

async function Reset({ searchParams }: Pick<PageProps<"/reset-password">, "searchParams">) {
  const token = firstParam((await searchParams).token);
  if (!token) {
    return (
      <p>
        This page needs the link from your reset email.{" "}
        <Link href="/forgot-password" className="back-link">
          Request a new one
        </Link>
      </p>
    );
  }
  return <ResetPasswordForm token={token} />;
}

export default function ResetPasswordPage({ searchParams }: PageProps<"/reset-password">) {
  return (
    <AuthCard title="Choose a new password">
      <Suspense fallback={<ListSkeleton rows={2} />}>
        <Reset searchParams={searchParams} />
      </Suspense>
    </AuthCard>
  );
}
