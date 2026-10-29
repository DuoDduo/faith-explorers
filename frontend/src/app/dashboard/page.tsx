import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { MyPostsList } from "@/components/authoring/MyPostsList";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ListSkeleton } from "@/components/ui/Skeletons";
import { getMyPosts } from "@/lib/api/authoring";
import { requireWriter } from "@/lib/auth/guards";

export const metadata: Metadata = {
  title: "Your articles",
  robots: { index: false },
};

async function Dashboard() {
  await requireWriter("/dashboard");
  const { items } = await getMyPosts();
  return <MyPostsList posts={items} />;
}

export default function DashboardPage() {
  return (
    <div className="dashboard container">
      <SectionHeading
        title="Your articles"
        subtitle="Drafts, articles in review and published work"
        contained={false}
        aside={
          <Link href="/dashboard/new" className="retry-button">
            <i className="fa-solid fa-plus" aria-hidden="true"></i> New article
          </Link>
        }
      />
      <Suspense fallback={<ListSkeleton rows={4} />}>
        <Dashboard />
      </Suspense>
    </div>
  );
}
