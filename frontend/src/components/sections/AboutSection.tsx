import Image from "next/image";
import type { ReactNode } from "react";

interface AboutSectionProps {
  image: string;
  title?: string;
  children: ReactNode;
  /** Put the image on the right instead of the left. */
  reverse?: boolean;
}

/** Image + text row used on Home, About and Contact. */
export function AboutSection({ image, title, children, reverse = false }: AboutSectionProps) {
  const media = (
    <div className="video-container" data-aos={reverse ? "fade-left" : "fade-right"}>
      <Image src={image} className="image" alt="" width={800} height={530} />
    </div>
  );

  return (
    <section className="about container">
      {!reverse && media}
      <div className="content" data-aos={reverse ? "fade-right" : "fade-left"}>
        {title && <h2>{title}</h2>}
        {children}
      </div>
      {reverse && media}
    </section>
  );
}
