import { Avatar } from "@/components/ui/Avatar";
import { formatDate } from "@/lib/format";
import type { Author } from "@/types/api";

export function AuthorByline({ author, date }: { author: Author; date: string | null }) {
  return (
    <div className="flex authorbx">
      <Avatar src={author.avatar_url} name={author.name} />
      <div className="authorname">
        <span className="author-name">{author.name}</span>
        <span>{formatDate(date)}</span>
      </div>
    </div>
  );
}
