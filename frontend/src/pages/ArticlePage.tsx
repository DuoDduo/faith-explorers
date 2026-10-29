import { useEffect } from 'react'
import Markdown from 'react-markdown'
import { Link, useParams } from 'react-router-dom'
import { ApiError } from '../api/client'
import { usePost, usePostComments, usePosts, useRecordView } from '../api/hooks'
import { Hero } from '../components/Hero'
import { PostCard } from '../components/PostCard'
import { QueryState } from '../components/QueryState'
import { formatDate, mediaUrl } from '../lib/format'
import { NotFoundPage } from './NotFoundPage'

function Comments({ slug }: { slug: string }) {
  const { data, isPending, error } = usePostComments(slug)
  return (
    <section className="article-comments" aria-labelledby="comments-title">
      <h2 id="comments-title">Comments{data ? ` (${data.length})` : ''}</h2>
      <QueryState
        isPending={isPending}
        error={error}
        isEmpty={data?.length === 0}
        empty="No comments yet."
      >
        {data?.map((comment) => (
          <div className="comment" key={comment.id}>
            <p>{comment.body}</p>
            <div className="authorcomment flex">
              <img src={mediaUrl(comment.user.avatar_url)} alt="" loading="lazy" />
              <div className="authortimename">
                <h5>{comment.user.name}</h5>
                <span>{formatDate(comment.created_at)}</span>
              </div>
            </div>
          </div>
        ))}
      </QueryState>
    </section>
  )
}

function Related({ category, exclude }: { category: string; exclude: string }) {
  const { data } = usePosts({ category, page_size: 4 })
  const related = data?.items.filter((p) => p.slug !== exclude).slice(0, 3) ?? []
  if (related.length === 0) return null
  return (
    <>
      <div className="container bigtitle">
        <h2 className="textcolor">More in this category</h2>
      </div>
      <section className="editorcards container flex">
        {related.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </section>
    </>
  )
}

export function ArticlePage() {
  const { slug = '' } = useParams()
  const { data: post, isPending, error } = usePost(slug)
  useRecordView(slug)

  useEffect(() => {
    if (post) document.title = `${post.title} | Faith Explorers`
    return () => {
      document.title = 'Faith Explorers'
    }
  }, [post])

  if (error instanceof ApiError && error.status === 404) return <NotFoundPage />

  return (
    <QueryState isPending={isPending} error={error}>
      {post && (
        <>
          <Hero
            image={mediaUrl(post.cover_url) ?? '/images/hoe-may.jpg'}
            title={<span className="article-hero-title">{post.title}</span>}
            subtitle={
              <>
                <Link to={`/categories/${post.category.slug}`}>#{post.category.name}</Link> ·{' '}
                {post.read_time} mins read
              </>
            }
          />
          <article className="article-page container">
            <div className="postby flex article-byline">
              <div className="flex authorbx">
                <img src={mediaUrl(post.author.avatar_url)} alt="" />
                <div className="authorname">
                  <h4>{post.author.name}</h4>
                  <span>{formatDate(post.published_at)}</span>
                </div>
              </div>
            </div>
            <div className="article-body">
              <Markdown>{post.body}</Markdown>
            </div>
            {post.tags.length > 0 && (
              <ul className="article-tags flex" aria-label="Tags">
                {post.tags.map((tag) => (
                  <li key={tag.slug}>
                    <Link to={`/articles?tag=${tag.slug}`}>#{tag.name}</Link>
                  </li>
                ))}
              </ul>
            )}
            <Comments slug={post.slug} />
          </article>
          <Related category={post.category.slug} exclude={post.slug} />
        </>
      )}
    </QueryState>
  )
}
