import Image from "next/image";
import type { ReactNode } from "react";
import { TAGLINE } from "@/content/site";

interface HeroProps {
  image: string;
  title?: ReactNode;
  subtitle?: ReactNode;
}

/**
 * Full-width banner at the top of every page. The photo is usually the largest thing on
 * screen, so it's preloaded and served resized in a modern format by next/image.
 */
export function Hero({ image, title = "Faith Explorers", subtitle = TAGLINE }: HeroProps) {
  return (
    <section className="biosec contain flex home hero">
      <Image src={image} alt="" fill preload quality={60} sizes="100vw" className="hero__image" />
      <div className="hero__overlay" aria-hidden="true" />
      <div className="home-text hero__text">
        <h1 className="home-title">{title}</h1>
        <span className="home-subtitle">{subtitle}</span>
      </div>
    </section>
  );
}
