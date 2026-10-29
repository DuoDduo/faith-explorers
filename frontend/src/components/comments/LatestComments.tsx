import { CommentItem } from "@/components/comments/CommentItem";
import { EmptyState } from "@/components/ui/EmptyState";
import { getLatestComments } from "@/lib/api/comments";

export async function LatestComments() {
  const comments = await getLatestComments();
  return (
    <div className="postcomments">
      {comments.length === 0 ? (
        <EmptyState>No comments yet.</EmptyState>
      ) : (
        comments.map((comment) => <CommentItem key={comment.id} comment={comment} linkToPost />)
      )}
    </div>
  );
}
