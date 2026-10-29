import { Link } from 'react-router-dom'
import { useCategories } from '../api/hooks'
import { Faq } from '../components/Faq'
import { Hero } from '../components/Hero'
import { QueryState } from '../components/QueryState'
import { mediaUrl } from '../lib/format'

export function CategoriesPage() {
  const { data, isPending, error } = useCategories()

  return (
    <>
      <Hero image="/images/hoe-may-3.jpg" />
      <div className="container bigtitle">
        <h2 className="textcolor">Popular Categories</h2>
        <p>All categories are insightful and tailored to meet your needs</p>
      </div>
      <section className="category-grid container">
        <QueryState isPending={isPending} error={error}>
          {data?.map((c) => (
            <Link key={c.slug} to={`/categories/${c.slug}`} className="category-card" data-aos="fade-up">
              <img src={mediaUrl(c.cover_url)} alt="" loading="lazy" />
              <div>
                <h3>{c.name}</h3>
                <p>
                  {c.post_count} {c.post_count === 1 ? 'article' : 'articles'}
                </p>
              </div>
            </Link>
          ))}
        </QueryState>
      </section>
      <Faq />
    </>
  )
}
