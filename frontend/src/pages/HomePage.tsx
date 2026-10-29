import { Link } from 'react-router-dom'
import { usePosts } from '../api/hooks'
import { AboutBlock } from '../components/AboutBlock'
import { Faq } from '../components/Faq'
import { Hero } from '../components/Hero'
import { HotTopics } from '../components/HotTopics'
import { PostCard } from '../components/PostCard'
import { QueryState } from '../components/QueryState'
import { Testimonials } from '../components/Testimonials'

export function HomePage() {
  const picks = usePosts({ featured: true, page_size: 3 })

  return (
    <>
      <Hero image="/images/hoe-may.jpg" />

      <AboutBlock image="/images/hoe-may-7.jpg" title="Who we are">
        <p>
          Welcome to Faith Explorers! Faith Explorers is a vibrant online community dedicated to
          supporting and inspiring individuals on their faith journey. Our mission is to provide a
          trusted space where believers can deepen their understanding of the Christian faith,
          cultivate meaningful relationships, and find practical guidance for navigating the
          complexities of life.
        </p>
        <Link to="/about" className="btn">
          Read more
        </Link>
      </AboutBlock>

      <HotTopics />

      <div className="container bigtitle">
        <h2 className="textcolor">Editor's picked</h2>
        <p>Featured and highly rated articles</p>
      </div>
      <section className="editorcards container flex">
        <QueryState isPending={picks.isPending} error={picks.error}>
          {picks.data?.items.map((post) => <PostCard key={post.id} post={post} />)}
        </QueryState>
      </section>
      <div className="showmorepost flex">
        <Link to="/articles">
          All articles <i className="fa-solid fa-arrow-right"></i>
        </Link>
      </div>

      <Testimonials />
      <Faq />
    </>
  )
}
