import { Link } from 'react-router-dom'
import { useLatestComments, usePosts } from '../api/hooks'
import { formatDate, mediaUrl } from '../lib/format'
import { QueryState } from './QueryState'

export function PopularPosts() {
  const { data, isPending, error } = usePosts({ sort: 'popular', page_size: 5 })
  return (
    <div className="popularposts" data-aos="fade-down">
      <div className="poptitle">
        <h3>Popular Posts</h3>
      </div>
      <div className="populposts">
        <QueryState isPending={isPending} error={error}>
          {data?.items.map((post) => (
            <div className="popupost flex" key={post.id}>
              <img src={mediaUrl(post.cover_url)} alt="" loading="lazy" />
              <div className="popupostde">
                <Link to={`/articles/${post.slug}`}>
                  <h4>{post.title}</h4>
                </Link>
                <div className="poputime flex">
                  <h5>
                    <span>{post.read_time}</span>mins read
                  </h5>
                  <p>▪</p>
                  <h5>{formatDate(post.published_at)}</h5>
                </div>
              </div>
            </div>
          ))}
        </QueryState>
      </div>
    </div>
  )
}

export function LatestComments() {
  const { data, isPending, error } = useLatestComments()
  return (
    <div className="popularposts" data-aos="fade-up">
      <div className="poptitle">
        <h3>Latest Comments</h3>
      </div>
      <div className="postcomments">
        <QueryState isPending={isPending} error={error} isEmpty={data?.length === 0}>
          {data?.map((comment) => (
            <div className="comment" key={comment.id}>
              <p>
                <Link to={`/articles/${comment.post.slug}`}>"{comment.body}"</Link>
              </p>
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
      </div>
    </div>
  )
}
