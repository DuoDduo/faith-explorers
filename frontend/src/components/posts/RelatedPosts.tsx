import { PostCard } from "@/components/posts/PostCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getPosts } from "@/lib/api/posts";

/** Up to three other articles from the same category. */
export async function RelatedPosts({ category, exclude }: { category: string; exclude: string }) {
  const { items } = await getPosts({ category, page_size: 4 });
  const related = items.filter((p) => p.slug !== exclude).slice(0, 3);
  if (related.length === 0) return null;

  return (
    <>
      <SectionHeading title="More in this category" />
      <section className="editorcards container flex">
        {related.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </section>
    </>
  );
}
