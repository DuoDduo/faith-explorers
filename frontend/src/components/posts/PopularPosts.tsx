import Image from "next/image";
import Link from "next/link";
import { DEFAULT_COVER } from "@/content/site";
import { getPosts } from "@/lib/api/posts";
import { formatDate } from "@/lib/format";

/** Sidebar list of the most-viewed articles. */
export async function PopularPosts() {
  const { items } = await getPosts({ sort: "popular", page_size: 5 });
  return (
    <div className="populposts">
      {items.map((post) => (
        <div className="popupost flex" key={post.id}>
          <Image src={post.cover_url ?? DEFAULT_COVER} alt="" width={120} height={90} />
          <div className="popupostde">
            <Link href={`/articles/${post.slug}`}>
              <h3>{post.title}</h3>
            </Link>
            <div className="poputime flex">
              <span className="meta">
                <span>{post.read_time}</span>mins read
              </span>
              <p>▪</p>
              <span className="meta">{formatDate(post.published_at)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
