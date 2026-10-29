"use client";

import { type ReactNode, useRef } from "react";

const CARD_GAP = 20;

/** Section shell with left/right buttons that scroll the card track. */
export function HotTopicsCarousel({ children }: { children?: ReactNode }) {
  const track = useRef<HTMLDivElement>(null);

  const scroll = (direction: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>(".hcard");
    el.scrollBy({ left: direction * ((card?.offsetWidth ?? 200) + CARD_GAP) });
  };

  return (
    <section className="container hottopicssec flex" data-aos="fade-up">
      <div className="hottopics">
        <h2>Hot topics</h2>
        <p className="hottopics-intro">
          Don&apos;t miss out on the latest news about Christian Lifestyle and Relationships
        </p>
        <div className="lrbtn">
          <button
            className="leftbtn"
            type="button"
            onClick={() => scroll(-1)}
            aria-label="Scroll left"
          >
            <i className="fa-solid fa-arrow-left" aria-hidden="true"></i>
          </button>
          <button
            className="rightbtn"
            type="button"
            onClick={() => scroll(1)}
            aria-label="Scroll right"
          >
            <i className="fa-solid fa-arrow-right" aria-hidden="true"></i>
          </button>
        </div>
      </div>
      <div className="hotcards flex" ref={track}>
        {children}
      </div>
    </section>
  );
}
