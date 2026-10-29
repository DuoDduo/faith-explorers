import { CommentItem } from "@/components/comments/CommentItem";
import { EmptyState } from "@/components/ui/EmptyState";
import { getPostComments } from "@/lib/api/posts";

export async function PostComments({ slug }: { slug: string }) {
  const comments = await getPostComments(slug);
  return (
    <section className="article-comments" aria-labelledby="comments-title">
      <h2 id="comments-title">Comments ({comments.length})</h2>
      {comments.length === 0 ? (
        <EmptyState>No comments yet.</EmptyState>
      ) : (
        comments.map((comment) => <CommentItem key={comment.id} comment={comment} />)
      )}
    </section>
  );
}
