import { Link, useParams, useSearchParams } from 'react-router-dom'
import { ApiError } from '../api/client'
import { useCategory, usePosts } from '../api/hooks'
import { Hero } from '../components/Hero'
import { Pagination } from '../components/Pagination'
import { PostCard } from '../components/PostCard'
import { QueryState } from '../components/QueryState'
import { mediaUrl } from '../lib/format'
import { NotFoundPage } from './NotFoundPage'

export function CategoryPage() {
  const { slug = '' } = useParams()
  const [params, setParams] = useSearchParams()
  const page = Math.max(1, Number(params.get('page')) || 1)

  const category = useCategory(slug)
  const posts = usePosts({ category: slug, page, page_size: 6 })

  if (category.error instanceof ApiError && category.error.status === 404) {
    return <NotFoundPage />
  }

  return (
    <>
      <Hero
        image={mediaUrl(category.data?.cover_url) ?? '/images/hoe-may-3.jpg'}
        title={category.data?.name ?? ' '}
        subtitle={category.data?.description ?? `${category.data?.post_count ?? ''} articles`}
      />
      <div className="container bigtitle">
        <p>
          <Link to="/categories" className="back-link">
            <i className="fa-solid fa-arrow-left"></i> All categories
          </Link>
        </p>
      </div>
      <section className="editorcards container flex">
        <QueryState
          isPending={posts.isPending}
          error={posts.error}
          isEmpty={posts.data?.items.length === 0}
          empty="No articles in this category yet."
        >
          {posts.data?.items.map((post) => <PostCard key={post.id} post={post} />)}
        </QueryState>
      </section>
      {posts.data && (
        <Pagination
          page={page}
          pages={posts.data.pages}
          onChange={(n) => setParams(n > 1 ? { page: String(n) } : {})}
        />
      )}
    </>
  )
}
