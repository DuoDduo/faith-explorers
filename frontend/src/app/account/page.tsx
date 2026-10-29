import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AuthCard } from "@/components/auth/AuthCard";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { Avatar } from "@/components/ui/Avatar";
import { ListSkeleton } from "@/components/ui/Skeletons";
import { isWriter } from "@/lib/auth/guards";
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
      <p className="account-links">
        <Link href="/account/saved">
          <i className="fa-solid fa-bookmark" aria-hidden="true"></i> Saved articles
        </Link>
        {isWriter(user) ? (
          <Link href="/dashboard">
            <i className="fa-solid fa-pen" aria-hidden="true"></i> Your articles
          </Link>
        ) : (
          <Link href="/become-an-author">
            <i className="fa-solid fa-pen" aria-hidden="true"></i> Write for us
          </Link>
        )}
      </p>
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
