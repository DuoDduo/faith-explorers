import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { formatDate } from "@/lib/format";
import type { Comment } from "@/types/api";

interface CommentItemProps {
  comment: Comment;
  /** Link the comment text to its article (used in site-wide lists). */
  linkToPost?: boolean;
}

export function CommentItem({ comment, linkToPost = false }: CommentItemProps) {
  const text = linkToPost ? `"${comment.body}"` : comment.body;
  return (
    <div className="comment">
      <p>{linkToPost ? <Link href={`/articles/${comment.post.slug}`}>{text}</Link> : text}</p>
      <div className="authorcomment flex">
        <Avatar src={comment.user.avatar_url} size={40} />
        <div className="authortimename">
          <h5>{comment.user.name}</h5>
          <span>{formatDate(comment.created_at)}</span>
        </div>
      </div>
    </div>
  );
}
