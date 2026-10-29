import type { Metadata } from "next";
import { Suspense } from "react";
import { CategoryGrid } from "@/components/categories/CategoryGrid";
import { Faq } from "@/components/sections/Faq";
import { Hero } from "@/components/ui/Hero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ListSkeleton } from "@/components/ui/Skeletons";

export const metadata: Metadata = {
  title: "Categories",
  description: "Explore articles by topic.",
};

export default function CategoriesPage() {
  return (
    <>
      <Hero image="/images/hoe-may-3.jpg" />
      <SectionHeading
        title="Popular Categories"
        subtitle="All categories are insightful and tailored to meet your needs"
      />
      <Suspense
        fallback={
          <div className="container">
            <ListSkeleton rows={3} />
          </div>
        }
      >
        <CategoryGrid />
      </Suspense>
      <Faq />
    </>
  );
}
