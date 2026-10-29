import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PostEditor } from "@/components/authoring/PostEditor";
import { PostStatusActions } from "@/components/authoring/PostStatusActions";
import { StatusBadge } from "@/components/authoring/StatusBadge";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ListSkeleton } from "@/components/ui/Skeletons";
import { getMyPost } from "@/lib/api/authoring";
import { getCategories } from "@/lib/api/categories";
import { requireWriter } from "@/lib/auth/guards";

export const metadata: Metadata = {
  title: "Edit article",
  robots: { index: false },
};

const STATUS_NOTES = {
  draft: "Only you can see this draft.",
  pending: "Waiting for an editor to review it. You can still make changes.",
  published: "Live on the site. Changes appear as soon as you save.",
} as const;

async function EditPost({ params }: Pick<PageProps<"/dashboard/[id]/edit">, "params">) {
  const { id } = await params;
  const user = await requireWriter(`/dashboard/${id}/edit`);
  const postId = Number(id);
  const post = Number.isInteger(postId) ? await getMyPost(postId) : null;
  if (!post) notFound();

  return (
    <>
      <SectionHeading
        title={post.title}
        subtitle={
          <>
            <StatusBadge status={post.status} /> {STATUS_NOTES[post.status]}
          </>
        }
        contained={false}
      />
      {post.review_note && post.status === "draft" && (
        <div className="review-note" role="note">
          <strong>Feedback from the editor:</strong> {post.review_note}
        </div>
      )}
      <PostStatusActions postId={post.id} slug={post.slug} status={post.status} role={user.role} />
      <PostEditor post={post} categories={await getCategories()} />
    </>
  );
}

export default function EditPostPage({ params }: PageProps<"/dashboard/[id]/edit">) {
  return (
    <div className="dashboard container">
      <p>
        <Link href="/dashboard" className="back-link">
          <i className="fa-solid fa-arrow-left" aria-hidden="true"></i> Your articles
        </Link>
      </p>
      <Suspense fallback={<ListSkeleton rows={6} />}>
        <EditPost params={params} />
      </Suspense>
    </div>
  );
}
