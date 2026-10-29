import Image from "next/image";
import { TESTIMONIALS } from "@/content/site";

export function Testimonials() {
  return (
    <section className="review">
      <div className="content" data-aos="zoom-in">
        <span>Testimonials</span>
        <h2>Reviews from our Readers</h2>
        <p>
          At Faith Explorers We believe that the Christian faith is not just a set of beliefs, but a
          way of life that permeates every aspect of our existence.
        </p>
      </div>
      <div className="box-container" data-aos="zoom-in">
        {TESTIMONIALS.map((t) => (
          <figure className="box" key={t.name}>
            <blockquote>
              <p>&ldquo;{t.quote}&rdquo;</p>
            </blockquote>
            <figcaption className="user">
              <Image src={t.avatar} alt="" width={64} height={64} />
              <div className="info">
                <span className="testimonial-name">{t.name}</span>
                <span>{t.role}</span>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
