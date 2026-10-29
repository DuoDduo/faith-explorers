import Link from "next/link";
import type { Tag } from "@/types/api";

export function TagList({ tags }: { tags: Tag[] }) {
  if (tags.length === 0) return null;
  return (
    <ul className="article-tags flex" aria-label="Tags">
      {tags.map((tag) => (
        <li key={tag.slug}>
          <Link href={`/articles?tag=${tag.slug}`}>#{tag.name}</Link>
        </li>
      ))}
    </ul>
  );
}
