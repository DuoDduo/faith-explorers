import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useCategories } from '../api/hooks'
import { mediaUrl } from '../lib/format'

export function HotTopics() {
  const { data: categories = [] } = useCategories()
  const track = useRef<HTMLDivElement>(null)

  const scroll = (direction: 1 | -1) => {
    const el = track.current
    if (!el) return
    const card = el.querySelector<HTMLElement>('.hcard')
    el.scrollBy({ left: direction * ((card?.offsetWidth ?? 200) + 20) })
  }

  return (
    <section className="container hottopicssec flex" data-aos="fade-up">
      <div className="hottopics">
        <h3>Hot topics</h3>
        <p style={{ color: '#000' }}>
          Don't miss out on the latest news about Christian Lifestyle and Relationships
        </p>
        <div className="lrbtn">
          <button className="leftbtn" type="button" onClick={() => scroll(-1)} aria-label="Scroll left">
            <i className="fa-solid fa-arrow-left"></i>
          </button>
          <button className="rightbtn" type="button" onClick={() => scroll(1)} aria-label="Scroll right">
            <i className="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      </div>
      <div className="hotcards flex" ref={track}>
        {categories
          .filter((c) => c.post_count > 0)
          .map((c) => (
            <div className="hcard" key={c.slug}>
              <Link to={`/categories/${c.slug}`}>
                <img src={mediaUrl(c.cover_url)} alt="" loading="lazy" />
                <div className="hdetails">
                  <div className="hdetail">
                    <h4>{c.name}</h4>
                    <p>
                      {c.post_count} {c.post_count === 1 ? 'Article' : 'Articles'}
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          ))}
      </div>
    </section>
  )
}
