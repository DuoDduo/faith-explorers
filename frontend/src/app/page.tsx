import Link from "next/link";
import { Suspense } from "react";
import { FeaturedPosts } from "@/components/posts/FeaturedPosts";
import { AboutSection } from "@/components/sections/AboutSection";
import { Faq } from "@/components/sections/Faq";
import { HotTopics } from "@/components/sections/HotTopics";
import { HotTopicsCarousel } from "@/components/sections/HotTopicsCarousel";
import { Testimonials } from "@/components/sections/Testimonials";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Hero } from "@/components/ui/Hero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CardGridSkeleton } from "@/components/ui/Skeletons";

export default function HomePage() {
  return (
    <>
      <Hero image="/images/hoe-may.jpg" />

      <AboutSection image="/images/hoe-may-7.jpg" title="Who we are">
        <p>
          Welcome to Faith Explorers! Faith Explorers is a vibrant online community dedicated to
          supporting and inspiring individuals on their faith journey. Our mission is to provide a
          trusted space where believers can deepen their understanding of the Christian faith,
          cultivate meaningful relationships, and find practical guidance for navigating the
          complexities of life.
        </p>
        <Link href="/about" className="btn">
          Read more
        </Link>
      </AboutSection>

      <Suspense fallback={<HotTopicsCarousel />}>
        <HotTopics />
      </Suspense>

      <SectionHeading title="Editor's picked" subtitle="Featured and highly rated articles" />
      <Suspense fallback={<CardGridSkeleton />}>
        <FeaturedPosts />
      </Suspense>
      <ButtonLink href="/articles">All articles</ButtonLink>

      <Testimonials />
      <Faq />
    </>
  );
}
