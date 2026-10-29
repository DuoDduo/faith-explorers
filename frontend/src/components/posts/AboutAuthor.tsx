import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import type { Author } from "@/types/api";

/** Short author bio under an article; renders nothing if the author hasn't written one. */
export function AboutAuthor({ author }: { author: Author }) {
  if (!author.bio) return null;
  return (
    <aside className="about-author" aria-label="About the author">
      <Avatar src={author.avatar_url} name={author.name} size={64} />
      <div>
        <h2>About {author.name}</h2>
        <p>{author.bio}</p>
        <Link href={`/authors/${author.id}`}>More from {author.name}</Link>
      </div>
    </aside>
  );
}
