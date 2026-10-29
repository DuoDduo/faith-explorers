import type { ReactNode } from 'react'

interface AboutBlockProps {
  image: string
  title?: string
  children: ReactNode
  /** Put the image on the right instead of the left. */
  reverse?: boolean
}

/** Image + text row used across Home, About and Contact. */
export function AboutBlock({ image, title, children, reverse }: AboutBlockProps) {
  const media = (
    <div className="video-container" data-aos={reverse ? 'fade-left' : 'fade-right'}>
      <img src={image} className="image" alt="" loading="lazy" />
    </div>
  )
  return (
    <section className="about container">
      {!reverse && media}
      <div className="content" data-aos={reverse ? 'fade-right' : 'fade-left'}>
        {title && <h3>{title}</h3>}
        {children}
      </div>
      {reverse && media}
    </section>
  )
}
