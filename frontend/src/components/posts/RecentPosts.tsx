import Image from "next/image";
import Link from "next/link";
import { ReadTime } from "@/components/posts/ReadTime";
import { DEFAULT_COVER } from "@/content/site";
import { getPosts } from "@/lib/api/posts";

/** The four newest articles, in the list style used on the Articles page. */
export async function RecentPosts() {
  const { items } = await getPosts({ sort: "recent", page_size: 4 });
  return (
    <div className="posts">
      {items.map((post) => (
        <div className="post flex" key={post.id}>
          <Link href={`/articles/${post.slug}`} tabIndex={-1} aria-hidden="true">
            <Image src={post.cover_url ?? DEFAULT_COVER} alt="" width={320} height={220} />
          </Link>
          <div className="postdetails">
            <div className="postlabel">
              <Link href={`/categories/${post.category.slug}`}>{post.category.name}</Link>
            </div>
            <Link href={`/articles/${post.slug}`}>
              <h3>{post.title}</h3>
            </Link>
            <p>{post.excerpt}</p>
            <div className="posttimeteg flex">
              <div className="flex">
                {post.tags.map((tag) => (
                  <Link key={tag.slug} href={`/articles?tag=${tag.slug}`}>
                    <span className="meta">
                      <span>#{tag.name}</span>
                    </span>
                  </Link>
                ))}
              </div>
              <div className="tegtime">
                <ReadTime minutes={post.read_time} />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
