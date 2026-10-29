import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PostEditor } from "@/components/authoring/PostEditor";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ListSkeleton } from "@/components/ui/Skeletons";
import { getCategories } from "@/lib/api/categories";
import { requireWriter } from "@/lib/auth/guards";

export const metadata: Metadata = {
  title: "New article",
  robots: { index: false },
};

async function NewPost() {
  await requireWriter("/dashboard/new");
  return <PostEditor categories={await getCategories()} />;
}

export default function NewPostPage() {
  return (
    <div className="dashboard container">
      <p>
        <Link href="/dashboard" className="back-link">
          <i className="fa-solid fa-arrow-left" aria-hidden="true"></i> Your articles
        </Link>
      </p>
      <SectionHeading
        title="New article"
        subtitle="Saved as a draft until you submit it"
        contained={false}
      />
      <Suspense fallback={<ListSkeleton rows={6} />}>
        <NewPost />
      </Suspense>
    </div>
  );
}
