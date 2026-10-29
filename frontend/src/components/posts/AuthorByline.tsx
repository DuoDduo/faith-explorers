import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { formatDate } from "@/lib/format";
import type { Author } from "@/types/api";

export function AuthorByline({ author, date }: { author: Author; date: string | null }) {
  return (
    <div className="flex authorbx">
      <Avatar src={author.avatar_url} name={author.name} />
      <div className="authorname">
        <Link href={`/authors/${author.id}`} className="author-name">
          {author.name}
        </Link>
        <span>{formatDate(date)}</span>
      </div>
    </div>
  );
}
