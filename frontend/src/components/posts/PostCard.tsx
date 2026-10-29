import Image from "next/image";
import Link from "next/link";
import { AuthorByline } from "@/components/posts/AuthorByline";
import { ReadTime } from "@/components/posts/ReadTime";
import { DEFAULT_COVER } from "@/content/site";
import type { PostSummary } from "@/types/api";

export function PostCard({ post }: { post: PostSummary }) {
  const href = `/articles/${post.slug}`;
  return (
    <article className="edcard" data-aos="fade-up">
      <Link href={href} tabIndex={-1} aria-hidden="true">
        <Image
          src={post.cover_url ?? DEFAULT_COVER}
          alt=""
          width={480}
          height={300}
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </Link>
      <div className="edcarddetl">
        <div className="tegtime flex">
          <Link href={`/categories/${post.category.slug}`}>
            <h5>#{post.category.name}</h5>
          </Link>
          <ReadTime minutes={post.read_time} />
        </div>
        <Link href={href}>
          <h2>{post.title}</h2>
        </Link>
        <p className="content">{post.excerpt}</p>
        <div className="postby flex">
          <AuthorByline author={post.author} date={post.published_at} />
          <Link href={href} className="readmore" aria-label={`Read more: ${post.title}`}>
            <span>Read more</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
