import type { ReactNode } from "react";
import { PostCard } from "@/components/posts/PostCard";
import { EmptyState } from "@/components/ui/EmptyState";
import type { PostSummary } from "@/types/api";

interface PostGridProps {
  posts: PostSummary[];
  empty?: ReactNode;
}

export function PostGrid({ posts, empty = "No articles yet." }: PostGridProps) {
  return (
    <section className="editorcards container flex">
      {posts.length === 0 ? (
        <EmptyState>{empty}</EmptyState>
      ) : (
        posts.map((post) => <PostCard key={post.id} post={post} />)
      )}
    </section>
  );
}
