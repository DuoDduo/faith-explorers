import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AvatarForm } from "@/components/account/AvatarForm";
import { DeleteAccountForm } from "@/components/account/DeleteAccountForm";
import { PasswordForm } from "@/components/account/PasswordForm";
import { ProfileForm } from "@/components/account/ProfileForm";
import { SettingsSection } from "@/components/account/SettingsSection";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ListSkeleton } from "@/components/ui/Skeletons";
import { requireUser } from "@/lib/auth/guards";

export const metadata: Metadata = {
  title: "Account settings",
  robots: { index: false },
};

async function Settings() {
  const user = await requireUser("/account/settings");
  return (
    <>
      <SettingsSection title="Photo">
        <AvatarForm name={user.name} avatarUrl={user.avatar_url} />
      </SettingsSection>
      <SettingsSection title="Profile">
        <ProfileForm name={user.name} bio={user.bio} />
      </SettingsSection>
      <SettingsSection
        title="Password"
        description="Changing your password signs you out on your other devices."
      >
        <PasswordForm />
      </SettingsSection>
      {user.role === "admin" ? (
        <SettingsSection title="Delete account" danger>
          <p>
            Admins can&apos;t delete their own account. Ask another admin to change your role first.
          </p>
        </SettingsSection>
      ) : (
        <SettingsSection
          title="Delete account"
          description="Articles you've published stay on the site under “Former member”. Everything else about you is removed."
          danger
        >
          <DeleteAccountForm />
        </SettingsSection>
      )}
    </>
  );
}

export default function SettingsPage() {
  return (
    <div className="dashboard container settings">
      <p>
        <Link href="/account" className="back-link">
          <i className="fa-solid fa-arrow-left" aria-hidden="true"></i> Your account
        </Link>
      </p>
      <SectionHeading title="Account settings" contained={false} />
      <Suspense fallback={<ListSkeleton rows={4} />}>
        <Settings />
      </Suspense>
    </div>
  );
}
