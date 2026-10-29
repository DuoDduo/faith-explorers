import type { FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { usePosts } from '../api/hooks'
import { Faq } from '../components/Faq'
import { Hero } from '../components/Hero'
import { Pagination } from '../components/Pagination'
import { PostCard } from '../components/PostCard'
import { QueryState } from '../components/QueryState'
import { LatestComments, PopularPosts } from '../components/Sidebar'
import { mediaUrl } from '../lib/format'

function RecentPosts() {
  const { data, isPending, error } = usePosts({ sort: 'recent', page_size: 4 })
  return (
    <div className="recentposts" data-aos="fade-up">
      <div className="bigtitle">
        <h2 className="textcolor">Recent posts</h2>
        <p>Don't miss the latest trends</p>
      </div>
      <div className="posts">
        <QueryState isPending={isPending} error={error}>
          {data?.items.map((post) => (
            <div className="post flex" key={post.id}>
              <Link to={`/articles/${post.slug}`} tabIndex={-1} aria-hidden="true">
                <img src={mediaUrl(post.cover_url)} alt="" loading="lazy" />
              </Link>
              <div className="postdetails">
                <div className="postlabel">
                  <Link to={`/categories/${post.category.slug}`}>{post.category.name}</Link>
                </div>
                <Link to={`/articles/${post.slug}`}>
                  <h2>{post.title}</h2>
                </Link>
                <p>{post.excerpt}</p>
                <div className="posttimeteg flex">
                  <div className="flex">
                    {post.tags.map((tag) => (
                      <Link key={tag.slug} to={`/articles?tag=${tag.slug}`}>
                        <h5>
                          <span>#{tag.name}</span>
                        </h5>
                      </Link>
                    ))}
                  </div>
                  <div className="tegtime">
                    <h5 className="flex">
                      <i className="fa-regular fa-clock"></i>
                      <span>{post.read_time}</span>mins read
                    </h5>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </QueryState>
      </div>
    </div>
  )
}

export function ArticlesPage() {
  const [params, setParams] = useSearchParams()
  const page = Math.max(1, Number(params.get('page')) || 1)
  const q = params.get('q') ?? ''
  const tag = params.get('tag') ?? undefined

  const posts = usePosts({ page, q, tag, page_size: 6 })

  const update = (next: Record<string, string | undefined>) => {
    const merged = new URLSearchParams(params)
    for (const [key, value] of Object.entries(next)) {
      if (value) merged.set(key, value)
      else merged.delete(key)
    }
    setParams(merged)
  }

  const onSearch = (e: FormEvent) => {
    e.preventDefault()
    const value = new FormData(e.currentTarget as HTMLFormElement).get('q')
    update({ q: String(value ?? '').trim() || undefined, page: undefined })
  }

  const goToPage = (n: number) => {
    update({ page: n > 1 ? String(n) : undefined })
    document.getElementById('all-articles')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <Hero image="/images/hoe-may-41.jpg" />

      <div className="container bigtitle articles-heading" id="all-articles">
        <div>
          <h2 className="textcolor">All Articles</h2>
          <p>
            {tag ? (
              <>
                Tagged <strong>#{tag}</strong> ·{' '}
                <button type="button" className="link-button" onClick={() => update({ tag: undefined, page: undefined })}>
                  clear
                </button>
              </>
            ) : (
              'Curated just for you'
            )}
          </p>
        </div>
        {/* key resets the uncontrolled input when q changes via back/forward navigation */}
        <form className="search-form" role="search" onSubmit={onSearch} key={q}>
          <input
            type="search"
            placeholder="Search articles"
            aria-label="Search articles"
            name="q"
            defaultValue={q}
          />
          <button type="submit" aria-label="Search">
            <i className="fa-solid fa-magnifying-glass"></i>
          </button>
        </form>
      </div>

      <section className="editorcards container flex">
        <QueryState
          isPending={posts.isPending}
          error={posts.error}
          isEmpty={posts.data?.items.length === 0}
          empty={q ? `No articles match "${q}".` : 'No articles yet.'}
        >
          {posts.data?.items.map((post) => <PostCard key={post.id} post={post} />)}
        </QueryState>
      </section>
      {posts.data && <Pagination page={page} pages={posts.data.pages} onChange={goToPage} />}

      <section className="recentpostsec container flex">
        <RecentPosts />
        <div className="postslider">
          <PopularPosts />
          <LatestComments />
        </div>
      </section>

      <Faq />
    </>
  )
}
