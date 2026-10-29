import Link from "next/link";
import type { ReactNode } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { formatDate } from "@/lib/format";
import type { Comment } from "@/types/api";

interface CommentItemProps {
  comment: Comment;
  /** Link the comment text to its article (used in site-wide lists). */
  linkToPost?: boolean;
  /** Controls shown under the comment, e.g. a delete button. */
  actions?: ReactNode;
}

export function CommentItem({ comment, linkToPost = false, actions }: CommentItemProps) {
  const text = linkToPost ? `"${comment.body}"` : comment.body;
  return (
    <div className="comment">
      <p>{linkToPost ? <Link href={`/articles/${comment.post.slug}`}>{text}</Link> : text}</p>
      <div className="authorcomment flex">
        <Avatar src={comment.user.avatar_url} name={comment.user.name} size={40} />
        <div className="authortimename">
          <span className="meta">{comment.user.name}</span>
          <span>{formatDate(comment.created_at)}</span>
        </div>
      </div>
      {actions && <div className="comment-actions">{actions}</div>}
    </div>
  );
}
