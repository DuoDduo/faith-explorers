import { Link } from 'react-router-dom'
import { Hero } from '../components/Hero'

export function NotFoundPage() {
  return (
    <>
      <Hero image="/images/hoe-may.jpg" title="Page not found" subtitle="We couldn't find that page." />
      <div className="showmorepost flex">
        <Link to="/articles">
          Browse articles <i className="fa-solid fa-arrow-right"></i>
        </Link>
      </div>
    </>
  )
}
