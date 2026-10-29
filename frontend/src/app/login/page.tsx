import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AuthCard } from "@/components/auth/AuthCard";
import { LoginForm } from "@/components/forms/LoginForm";
import { ListSkeleton } from "@/components/ui/Skeletons";
import { safeNextPath } from "@/lib/auth/redirect";
import { getCurrentUser } from "@/lib/auth/session";
import { firstParam } from "@/lib/url";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false },
};

async function Login({ searchParams }: Pick<PageProps<"/login">, "searchParams">) {
  const next = safeNextPath(firstParam((await searchParams).next));
  if (await getCurrentUser()) redirect(next);
  return <LoginForm next={next} />;
}

export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <AuthCard title="Sign in">
      <Suspense fallback={<ListSkeleton rows={3} />}>
        <Login searchParams={searchParams} />
      </Suspense>
    </AuthCard>
  );
}
