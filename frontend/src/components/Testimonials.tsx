import { TESTIMONIALS } from '../content/site'

export function Testimonials() {
  return (
    <section className="review">
      <div className="content" data-aos="zoom-in">
        <span>Testimonials</span>
        <h3>Reviews from our Readers</h3>
        <p>
          At Faith Explorers We believe that the Christian faith is not just a set of beliefs, but
          a way of life that permeates every aspect of our existence.
        </p>
      </div>
      <div className="box-container" data-aos="zoom-in">
        {TESTIMONIALS.map((t) => (
          <figure className="box" key={t.name}>
            <blockquote>
              <p>"{t.quote}"</p>
            </blockquote>
            <figcaption className="user">
              <img src={t.avatar} alt="" loading="lazy" />
              <div className="info">
                <h3>{t.name}</h3>
                <span>{t.role}</span>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
