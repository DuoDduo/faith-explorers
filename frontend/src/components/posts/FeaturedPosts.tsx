import { PostGrid } from "@/components/posts/PostGrid";
import { getPosts } from "@/lib/api/posts";

/** The editor's picks shown on the home page. */
export async function FeaturedPosts() {
  const { items } = await getPosts({ featured: true, page_size: 3 });
  return <PostGrid posts={items} />;
}
