import type { ReactNode } from 'react'
import { TAGLINE } from '../content/site'

interface HeroProps {
  image: string
  title?: ReactNode
  subtitle?: ReactNode
}

export function Hero({ image, title = 'Faith Explorers', subtitle = TAGLINE }: HeroProps) {
  return (
    <section
      className="biosec contain flex home"
      style={{
        backgroundImage: `linear-gradient(to top, #52179abd, rgba(0, 0, 0, 0.5)), url("${image}")`,
      }}
    >
      <div className="home-text" data-aos="zoom-in-up">
        <h1 className="home-title">{title}</h1>
        <span className="home-subtitle">{subtitle}</span>
      </div>
    </section>
  )
}
