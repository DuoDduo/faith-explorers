import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AuthCard } from "@/components/auth/AuthCard";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { Avatar } from "@/components/ui/Avatar";
import { ListSkeleton } from "@/components/ui/Skeletons";
import { loginHref } from "@/lib/auth/redirect";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Your account",
  robots: { index: false },
};

const ROLE_LABELS = { reader: "Reader", author: "Author", admin: "Administrator" } as const;

async function AccountDetails() {
  const user = await getCurrentUser();
  if (!user) redirect(loginHref("/account"));

  return (
    <>
      <div className="account-summary flex">
        <Avatar src={user.avatar_url} name={user.name} size={64} />
        <div>
          <h2>{user.name}</h2>
          <p>{user.email}</p>
          <p className="account-role">{ROLE_LABELS[user.role]}</p>
        </div>
      </div>
      <LogoutButton />
    </>
  );
}

export default function AccountPage() {
  return (
    <AuthCard title="Your account">
      <Suspense fallback={<ListSkeleton rows={2} />}>
        <AccountDetails />
      </Suspense>
    </AuthCard>
  );
}
