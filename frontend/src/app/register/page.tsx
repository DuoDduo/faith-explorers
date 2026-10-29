import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AuthCard } from "@/components/auth/AuthCard";
import { RegisterForm } from "@/components/forms/RegisterForm";
import { ListSkeleton } from "@/components/ui/Skeletons";
import { safeNextPath } from "@/lib/auth/redirect";
import { getCurrentUser } from "@/lib/auth/session";
import { firstParam } from "@/lib/url";

export const metadata: Metadata = {
  title: "Create an account",
  robots: { index: false },
};

async function Register({ searchParams }: Pick<PageProps<"/register">, "searchParams">) {
  const next = safeNextPath(firstParam((await searchParams).next));
  if (await getCurrentUser()) redirect(next);
  return <RegisterForm next={next} />;
}

export default function RegisterPage({ searchParams }: PageProps<"/register">) {
  return (
    <AuthCard title="Create an account">
      <Suspense fallback={<ListSkeleton rows={4} />}>
        <Register searchParams={searchParams} />
      </Suspense>
    </AuthCard>
  );
}
