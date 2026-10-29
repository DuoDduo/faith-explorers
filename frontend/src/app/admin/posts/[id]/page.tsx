import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AdminButton } from "@/components/admin/AdminButton";
import { NoteAction } from "@/components/admin/NoteAction";
import { StatusBadge } from "@/components/authoring/StatusBadge";
import { ArticleBody } from "@/components/posts/ArticleBody";
import { TagList } from "@/components/posts/TagList";
import { ListSkeleton } from "@/components/ui/Skeletons";
import { publishPost, returnPost, setFeatured, unpublishPost } from "@/lib/actions/admin";
import { getAdminPost } from "@/lib/api/admin";
import { requireAdmin } from "@/lib/auth/guards";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Review article" };

async function Review({ params }: Pick<PageProps<"/admin/posts/[id]">, "params">) {
  const { id } = await params;
  await requireAdmin(`/admin/posts/${id}`);
  const postId = Number(id);
  const post = Number.isInteger(postId) ? await getAdminPost(postId) : null;
  if (!post) notFound();

  return (
    <article className="admin-review">
      <p>
        <Link href={`/admin/posts?status=${post.status}`} className="back-link">
          <i className="fa-solid fa-arrow-left" aria-hidden="true"></i> Back to list
        </Link>
      </p>
      <header className="admin-review__header">
        <StatusBadge status={post.status} />
        <h2>{post.title}</h2>
        <p className="my-posts__meta">
          By {post.author.name} · {post.category.name} · {post.read_time} min read · updated{" "}
          {formatDate(post.updated_at)}
        </p>
        <p className="admin-review__excerpt">{post.excerpt}</p>
      </header>

      <div className="admin-card__actions admin-review__actions">
        {post.status === "pending" && (
          <>
            <AdminButton
              variant="primary"
              action={publishPost.bind(null, post.id)}
              confirm="Publish this article?"
            >
              Publish
            </AdminButton>
            <NoteAction
              action={returnPost.bind(null, post.id)}
              label="Send back"
              submitLabel="Send back to author"
              placeholder="What should the author change?"
            />
          </>
        )}
        {post.status === "published" && (
          <>
            <Link href={`/articles/${post.slug}`} className="admin-button admin-button--secondary">
              View live
            </Link>
            <AdminButton action={setFeatured.bind(null, post.id, !post.featured)}>
              {post.featured ? "Remove from Editor's picks" : "Add to Editor's picks"}
            </AdminButton>
            <AdminButton
              variant="danger"
              action={unpublishPost.bind(null, post.id)}
              confirm="Take this article off the site? It goes back to the author's drafts."
            >
              Unpublish
            </AdminButton>
          </>
        )}
        <Link href={`/dashboard/${post.id}/edit`} className="admin-button admin-button--secondary">
          Edit
        </Link>
      </div>

      {post.cover_url && (
        <Image
          src={post.cover_url}
          alt=""
          width={800}
          height={450}
          className="admin-review__cover"
        />
      )}
      <ArticleBody markdown={post.body} />
      <TagList tags={post.tags} />
    </article>
  );
}

export default function ReviewPostPage({ params }: PageProps<"/admin/posts/[id]">) {
  return (
    <Suspense fallback={<ListSkeleton rows={6} />}>
      <Review params={params} />
    </Suspense>
  );
}
