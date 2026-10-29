"use client";

import AOS from "aos";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

/** Initialises AOS (the data-aos scroll animations from the original site) once per page. */
export function AnimateOnScroll() {
  const pathname = usePathname();

  useEffect(() => {
    AOS.init({ duration: 800, offset: 150, once: true });
  }, []);

  // Pick up elements rendered by the new route and by content streamed in later.
  useEffect(() => {
    AOS.refreshHard();
  }, [pathname]);

  return null;
}
