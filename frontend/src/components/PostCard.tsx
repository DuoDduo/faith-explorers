import { Link } from 'react-router-dom'
import type { PostSummary } from '../api/types'
import { formatDate, mediaUrl } from '../lib/format'

export function PostCard({ post }: { post: PostSummary }) {
  const href = `/articles/${post.slug}`
  return (
    <article className="edcard" data-aos="fade-up">
      <Link to={href} tabIndex={-1} aria-hidden="true">
        <img src={mediaUrl(post.cover_url)} alt="" loading="lazy" />
      </Link>
      <div className="edcarddetl">
        <div className="tegtime flex">
          <Link to={`/categories/${post.category.slug}`}>
            <h5>#{post.category.name}</h5>
          </Link>
          <h5 className="flex">
            <i className="fa-regular fa-clock"></i>
            <span>{post.read_time}</span>mins read
          </h5>
        </div>
        <Link to={href}>
          <h2>{post.title}</h2>
        </Link>
        <p className="content">{post.excerpt}</p>
        <div className="postby flex">
          <div className="flex authorbx">
            <img src={mediaUrl(post.author.avatar_url)} alt="" loading="lazy" />
            <div className="authorname">
              <h4>{post.author.name}</h4>
              <span>{formatDate(post.published_at)}</span>
            </div>
          </div>
          <Link to={href} className="readmore" aria-label={`Read more: ${post.title}`}>
            <span>Read more</span>
          </Link>
        </div>
      </div>
    </article>
  )
}
