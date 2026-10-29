import Link from "next/link";
import { CommentForm } from "@/components/comments/CommentForm";
import { CommentItem } from "@/components/comments/CommentItem";
import { DeleteCommentButton } from "@/components/comments/DeleteCommentButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { getPostComments } from "@/lib/api/posts";
import { loginHref } from "@/lib/auth/redirect";
import { getCurrentUser } from "@/lib/auth/session";

/** Comment thread for an article, with a form for signed-in readers. Render inside <Suspense>. */
export async function PostComments({ slug }: { slug: string }) {
  const [comments, user] = await Promise.all([getPostComments(slug), getCurrentUser()]);
  const canDelete = (authorId: number) => user?.id === authorId || user?.role === "admin";

  return (
    <section className="article-comments" aria-labelledby="comments-title">
      <h2 id="comments-title">Comments ({comments.length})</h2>
      {comments.length === 0 ? (
        <EmptyState>No comments yet. Be the first to share your thoughts.</EmptyState>
      ) : (
        comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            actions={
              canDelete(comment.user.id) && (
                <DeleteCommentButton slug={slug} commentId={comment.id} />
              )
            }
          />
        ))
      )}
      {user ? (
        <CommentForm slug={slug} userName={user.name} />
      ) : (
        <p className="comment-signin">
          <Link href={loginHref(`/articles/${slug}`)}>Sign in</Link> to join the conversation.
        </p>
      )}
    </section>
  );
}
