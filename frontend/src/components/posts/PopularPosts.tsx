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
              <h4>{post.title}</h4>
            </Link>
            <div className="poputime flex">
              <h5>
                <span>{post.read_time}</span>mins read
              </h5>
              <p>▪</p>
              <h5>{formatDate(post.published_at)}</h5>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
