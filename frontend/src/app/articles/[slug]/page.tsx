import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PostComments } from "@/components/comments/PostComments";
import { AboutAuthor } from "@/components/posts/AboutAuthor";
import { ArticleBody } from "@/components/posts/ArticleBody";
import { AuthorByline } from "@/components/posts/AuthorByline";
import { PostActions } from "@/components/posts/PostActions";
import { RelatedPosts } from "@/components/posts/RelatedPosts";
import { TagList } from "@/components/posts/TagList";
import { ViewTracker } from "@/components/posts/ViewTracker";
import { Hero } from "@/components/ui/Hero";
import { CardGridSkeleton, ListSkeleton } from "@/components/ui/Skeletons";
import { DEFAULT_COVER } from "@/content/site";
import { getPost } from "@/lib/api/posts";

type Props = PageProps<"/articles/[slug]">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Article not found" };
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      publishedTime: post.published_at ?? undefined,
      authors: [post.author.name],
      images: post.cover_url ? [post.cover_url] : undefined,
    },
  };
}

async function Article({ params }: Pick<Props, "params">) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  return (
    <>
      <ViewTracker slug={post.slug} />
      <Hero
        image={post.cover_url ?? DEFAULT_COVER}
        title={<span className="article-hero-title">{post.title}</span>}
        subtitle={
          <>
            <Link href={`/categories/${post.category.slug}`}>#{post.category.name}</Link> ·{" "}
            {post.read_time} mins read
          </>
        }
      />
      <article className="article-page container">
        <div className="postby flex article-byline">
          <AuthorByline author={post.author} date={post.published_at} />
          <Suspense fallback={<div className="engagement skeleton engagement-placeholder" />}>
            <PostActions slug={post.slug} />
          </Suspense>
        </div>
        <ArticleBody markdown={post.body} />
        <TagList tags={post.tags} />
        <AboutAuthor author={post.author} />
        <Suspense fallback={<ListSkeleton rows={2} />}>
          <PostComments slug={post.slug} />
        </Suspense>
      </article>
      <Suspense fallback={<CardGridSkeleton />}>
        <RelatedPosts category={post.category.slug} exclude={post.slug} />
      </Suspense>
    </>
  );
}

export default function ArticlePage({ params }: Props) {
  return (
    <Suspense
      fallback={
        <>
          <Hero image={DEFAULT_COVER} title=" " subtitle=" " />
          <div className="article-page container">
            <ListSkeleton rows={8} />
          </div>
        </>
      }
    >
      <Article params={params} />
    </Suspense>
  );
}
